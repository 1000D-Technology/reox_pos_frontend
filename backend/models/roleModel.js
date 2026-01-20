const db = require('../config/db');

const Role = {
    // Get all roles from the database
    getAll: async () => {
        const sql = 'SELECT * FROM role ORDER BY user_role ASC';
        const [rows] = await db.execute(sql);
        return rows;
    }
};

module.exports = Role;