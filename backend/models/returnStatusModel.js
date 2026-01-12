const db = require('../config/db');

class ReturnStatus {
    static async getAllReturnStatuses() {
        try {
            const [rows] = await db.execute('SELECT id, return_status as name FROM return_status ORDER BY id');
            return rows;
        } catch (error) {
            console.error('Database query failed:', error);
            throw new Error('Failed to retrieve return statuses');
        }
    }
}

module.exports = ReturnStatus;