const db = require('../config/db');

class Damaged {
    static async addDamagedStock(data) {
        const connection = await db.getConnection();
        try {
            // Start transaction to ensure data integrity
            await connection.beginTransaction();

            // 1. Check current stock level and lock the row for update
            const [stockRows] = await connection.execute(
                'SELECT qty FROM stock WHERE id = ? FOR UPDATE', 
                [data.stock_id]
            );

            if (stockRows.length === 0) {
                throw new Error("Stock record not found.");
            }

            const currentQty = stockRows[0].qty;

            // 2. Validate if the damaged quantity is more than available stock
            if (currentQty < data.qty) {
                // Throw error if stock is insufficient
                throw new Error(`Insufficient stock. Available quantity is only ${currentQty}`);
            }

            // 3. Insert record into the damaged table
            const insertQuery = `
                INSERT INTO damaged (stock_id, qty, reason_id, description, date, return_status_id) 
                VALUES (?, ?, ?, ?, CURDATE(), ?)
            `;
            await connection.execute(insertQuery, [
                data.stock_id,
                data.qty,
                data.reason_id,
                data.description,
                data.status_id
            ]);

            // 4. Update (deduct) the quantity in the stock table
            const updateStockQuery = `UPDATE stock SET qty = qty - ? WHERE id = ?`;
            await connection.execute(updateStockQuery, [data.qty, data.stock_id]);

            // Commit all changes if successful
            await connection.commit();
            return { success: true };
        } catch (error) {
            // Rollback changes if any step fails
            await connection.rollback();
            throw error; 
        } finally {
            // Release connection back to the pool
            connection.release();
        }
    }

    // Get all damaged records for the table display
    static async getAllDamagedRecords() {
        const query = `
            SELECT 
                d.id AS damaged_id,
                p.product_code AS product_id_code,
                p.product_name,
                u.name AS unit,
                d.qty AS damaged_qty,
                s.cost_price,
                s.mrp,
                s.rsp AS price,
                sup.supplier_name AS supplier,
                b.batch_name AS stock_label,
                r.reason AS damage_reason,
                rs.return_status AS status
            FROM damaged d
            INNER JOIN stock s ON d.stock_id = s.id
            INNER JOIN product_variations pv ON s.product_variations_id = pv.id
            INNER JOIN product p ON pv.product_id = p.id
            INNER JOIN unit_id u ON p.unit_id = u.idunit_id
            INNER JOIN batch b ON s.batch_id = b.id
            INNER JOIN grn_items gi ON s.id = gi.stock_id
            INNER JOIN grn g ON gi.grn_id = g.id
            INNER JOIN supplier sup ON g.supplier_id = sup.id
            INNER JOIN reason r ON d.reason_id = r.id
            INNER JOIN return_status rs ON d.return_status_id = rs.id
            ORDER BY d.id DESC
        `;
        const [rows] = await db.execute(query);
        return rows;
    }

    //  Fetch filtered records from the damaged table
    static async searchDamagedRecords(filters) {
        let query = `
            SELECT 
                d.id AS damaged_id,
                p.product_code AS product_id_code,
                p.product_name,
                u.name AS unit,
                d.qty AS damaged_qty,
                s.cost_price,
                s.mrp,
                s.rsp AS price,
                sup.supplier_name AS supplier,
                b.batch_name AS stock_label,
                r.reason AS damage_reason,
                rs.return_status AS status,
                d.date
            FROM damaged d
            INNER JOIN stock s ON d.stock_id = s.id
            INNER JOIN product_variations pv ON s.product_variations_id = pv.id
            INNER JOIN product p ON pv.product_id = p.id
            INNER JOIN unit_id u ON p.unit_id = u.idunit_id
            INNER JOIN batch b ON s.batch_id = b.id
            INNER JOIN grn_items gi ON s.id = gi.stock_id
            INNER JOIN grn g ON gi.grn_id = g.id
            INNER JOIN supplier sup ON g.supplier_id = sup.id
            INNER JOIN reason r ON d.reason_id = r.id
            INNER JOIN return_status rs ON d.return_status_id = rs.id
            WHERE 1=1
        `;

        const queryParams = [];

        //  Filter by Category ID
        if (filters.category_id) {
            query += ` AND p.category_id = ?`;
            queryParams.push(filters.category_id);
        }

        //  Filter by Supplier ID
        if (filters.supplier_id) {
            query += ` AND g.supplier_id = ?`;
            queryParams.push(filters.supplier_id);
        }

        //  Filter by Product (Main Product ID)
        if (filters.product_id) {
            query += ` AND p.id = ?`;
            queryParams.push(filters.product_id);
        }

        //  Filter by Unit ID
        if (filters.unit_id) {
            query += ` AND p.unit_id = ?`;
            queryParams.push(filters.unit_id);
        }

        //  Filter by Date Range (From Date to To Date)
        if (filters.fromDate && filters.toDate) {
            query += ` AND d.date BETWEEN ? AND ?`;
            queryParams.push(filters.fromDate, filters.toDate);
        }

        query += ` ORDER BY d.id DESC`;

        const [rows] = await db.execute(query, queryParams);
        return rows;
    }
}

module.exports = Damaged;