const db = require("../config/db");

class GRN {

    static async createGRN(data) {
        const connection = (await db.getConnection());
        try {
            await connection.beginTransaction();

            // Determine GRN status based on balance
            const grnStatusId = data.balance > 0 ? 1 : 2;

            const [grnResult] = await connection.execute(
                `INSERT INTO grn (bill_number, supplier_id, total, paid_amount, balance, grn_status_id, create_at) 
             VALUES (?, ?, ?, ?, ?, ?, NOW())`,
                [data.billNumber, data.supplierId, data.grandTotal, data.paidAmount, data.balance, grnStatusId]
            );
            const grnId = grnResult.insertId;

            for (const item of data.items) {
                let finalBatchId;

                // First check if batch name already exists in the batch table
                const [existingBatch] = await connection.execute(
                    `SELECT id FROM batch WHERE batch_name = ?`, [item.batchIdentifier]
                );

                if (existingBatch.length > 0) {
                    // Batch name exists, use the existing batch ID
                    finalBatchId = existingBatch[0].id;
                } else {
                    // Batch name doesn't exist, create new batch
                    const [newBatch] = await connection.execute(
                        `INSERT INTO batch (batch_name, date_time) VALUES (?, NOW())`,
                        [item.batchIdentifier]
                    );
                    finalBatchId = newBatch.insertId;
                }

                const [stockResult] = await connection.execute(
                    `INSERT INTO stock (product_variations_id, barcode, batch_id, mfd, exp, cost_price, mrp, rsp, wsp, qty, free_qty) 
                 VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
                    [
                        item.variantId, item.barcode, finalBatchId, item.mfd, item.exp,
                        item.costPrice, item.mrp, item.rsp, item.wsp, item.qty, item.freeQty
                    ]
                );
                const stockId = stockResult.insertId;

                await connection.execute(
                    `INSERT INTO grn_items (grn_id, stock_id, qty, free_qty) VALUES (?, ?, ?, ?)`,
                    [grnId, stockId, item.qty, item.freeQty]
                );
            }

            if (data.paidAmount > 0) {
                await connection.execute(
                    `INSERT INTO grn_payments (paid_amount, payment_types_id, grn_id, created_at) 
                 VALUES (?, ?, ?, NOW())`,
                    [data.paidAmount, data.paymentMethodId, grnId]
                );
            }

            await connection.commit();
            return grnId;
        } catch (error) {
            await connection.rollback();
            throw error;
        } finally {
            connection.release();
        }
    }

    static async getGRNSummary() {
        const query = `
        SELECT 
            COUNT(id) AS totalGrnCount,
            SUM(total) AS totalAmount,
            SUM(paid_amount) AS totalPaid,
            SUM(balance) AS totalBalance
        FROM grn
    `;
        const [rows] = await db.execute(query);
        return rows[0];
    }

    static async getAllGRNs() {
        const query = `
        SELECT 
            g.id AS id,
            s.supplier_name AS supplierName,
            s.id AS supplierId,
            g.bill_number AS billNumber,
            g.total AS totalAmount,
            g.paid_amount AS paidAmount,
            g.balance AS balanceAmount,
            DATE_FORMAT(g.create_at, '%Y.%m.%d %h:%i %p') AS grnDate,
            st.ststus AS statusName
        FROM grn g
        JOIN supplier s ON g.supplier_id = s.id
        JOIN status st ON g.grn_status_id = st.id
        ORDER BY g.id DESC
    `;
        const [rows] = await db.execute(query);
        return rows;
    }

    static async searchGRNs(filters) {
        let query = `
        SELECT 
            g.id AS id,
            s.supplier_name AS supplierName,
            s.id AS supplierId,
            g.bill_number AS billNumber,
            g.total AS totalAmount,
            g.paid_amount AS paidAmount,
            g.balance AS balanceAmount,
            DATE_FORMAT(g.create_at, '%Y.%m.%d %h:%i %p') AS grnDate,
            st.ststus AS statusName
        FROM grn g
        JOIN supplier s ON g.supplier_id = s.id
        JOIN status st ON g.grn_status_id = st.id
        WHERE 1=1
    `;

        const queryParams = [];

        if (filters.supplierName) {
            query += ` AND s.supplier_name LIKE ?`;
            queryParams.push(`%${filters.supplierName}%`);
        }

        if (filters.billNumber) {
            query += ` AND g.bill_number LIKE ?`;
            queryParams.push(`%${filters.billNumber}%`);
        }

        if (filters.fromDate && filters.toDate) {
            query += ` AND DATE(g.create_at) BETWEEN ? AND ?`;
            queryParams.push(filters.fromDate, filters.toDate);
        }

        query += ` ORDER BY g.id DESC`;

        const [rows] = await db.execute(query, queryParams);
        return rows;
    }

    //  Fetch Bill Numbers for a specific supplier with active status
    static async getActiveBillNumbersBySupplier(supplierId) {
        const query = `
            SELECT 
                id, 
                bill_number,
                total,
                balance
            FROM grn 
            WHERE supplier_id = ? 
            AND grn_status_id = 1
            ORDER BY create_at DESC
        `;
        
        const [rows] = await db.execute(query, [supplierId]);
        return rows;
    }

    static async updatePayment(data) {
        const connection = await db.getConnection();
        try {
            await connection.beginTransaction();

            // 1. Fetch current balance and paid amount for validation
            const [grnRows] = await connection.execute(
                'SELECT balance, paid_amount FROM grn WHERE id = ? FOR UPDATE',
                [data.grn_id]
            );

            if (grnRows.length === 0) throw new Error("GRN record not found.");

            const { balance, paid_amount } = grnRows[0];

            // 2. Validation: Ensure new payment is not greater than current balance
            if (parseFloat(data.payment_amount) > parseFloat(balance)) {
                throw new Error(`Invalid Amount. Maximum payable balance is LKR ${balance}`);
            }

            // 3. Calculate new values
            const newBalance = parseFloat(balance) - parseFloat(data.payment_amount);
            const newPaidAmount = parseFloat(paid_amount) + parseFloat(data.payment_amount);
            
            // If balance becomes 0, status_id becomes 2 (Paid), else stays 1 (Pending)
            const newStatusId = newBalance === 0 ? 2 : 1;

            // 4. Update grn table
            await connection.execute(
                `UPDATE grn SET 
                    balance = ?, 
                    paid_amount = ?, 
                    grn_status_id = ? 
                 WHERE id = ?`,
                [newBalance, newPaidAmount, newStatusId, data.grn_id]
            );

            // 5. Insert record into grn_payment table
            await connection.execute(
                `INSERT INTO grn_payments (grn_id, paid_amount, payment_types_id, created_at) 
                 VALUES (?, ?, ?, NOW())`,
                [data.grn_id, data.payment_amount, data.payment_type_id]
            );

            await connection.commit();
            return { success: true, remainingBalance: newBalance };
        } catch (error) {
            await connection.rollback();
            throw error;
        } finally {
            connection.release();
        }
    }
}

module.exports = GRN;