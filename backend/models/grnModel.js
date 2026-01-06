const db = require("../config/db");

class GRN {

    static async createGRN(data) {
    const connection = await db.getConnection();
    try {
        await connection.beginTransaction();

        const [grnResult] = await connection.execute(
            `INSERT INTO grn (bill_number, supplier_id, total, paid_amount, balance, grn_status_id, create_at) 
             VALUES (?, ?, ?, ?, ?, ?, NOW())`,
            [data.billNumber, data.supplierId, data.grandTotal, data.paidAmount, data.balance, 1]
        );
        const grnId = grnResult.insertId;

        for (const item of data.items) {
            let finalBatchId;

            if (Number.isInteger(Number(item.batchIdentifier))) {
                const [batchExists] = await connection.execute(
                    `SELECT id FROM batch WHERE id = ?`, [item.batchIdentifier]
                );

                if (batchExists.length > 0) {
                    finalBatchId = item.batchIdentifier; 
                } else {
                    const [newBatch] = await connection.execute(
                        `INSERT INTO batch (batch_name, date_time) VALUES (?, NOW())`,
                        [item.batchIdentifier]
                    );
                    finalBatchId = newBatch.insertId;
                }
            } else {
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
}

module.exports = GRN;