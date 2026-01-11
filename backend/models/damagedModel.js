const db = require('../config/db');

class Damaged {
    static async addDamagedStock(data) {
        const connection = await db.getConnection();
        try {
            await connection.beginTransaction();

            const insertQuery = `
                INSERT INTO damaged (stock_id, qty, reason_id, description, date, return_status_id) 
                VALUES (?, ?, ?, ?, CURDATE(), ?)
            `;
            const [result] = await connection.execute(insertQuery, [
                data.stock_id,
                data.qty,
                data.reason_id,
                data.description,
                data.status_id 
            ]);

            const updateStockQuery = `UPDATE stock SET qty = qty - ? WHERE id = ?`;
            await connection.execute(updateStockQuery, [data.qty, data.stock_id]);

            await connection.commit();
            return result;
        } catch (error) {
            await connection.rollback();
            throw error;
        } finally {
            connection.release();
        }
    }
}

module.exports = Damaged;