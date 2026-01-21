const db = require('../config/db'); 

class Reason {
    static async getAllReasons() {
        const query = 'SELECT id, reason FROM reason ORDER BY id';
        const [rows] = await db.execute(query);
        return rows;
    }
    
    static async createReason(reasonText) {
        const query = 'INSERT INTO reason (reason) VALUES (?)';
        const [result] = await db.execute(query, [reasonText]);
        return result;
    }
}

module.exports = Reason;