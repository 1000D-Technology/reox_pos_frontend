const db = require('../config/db');

const User = {
    // Find user by email (for validation/login)
    findByEmail: async (email) => {
        const [rows] = await db.execute('SELECT * FROM user WHERE email = ?', [email]);
        return rows[0];
    },

    // Create a new user based on latest DB structure
    create: async (userData) => {
        const { name, contact, email, password, role } = userData;
        
        const sql = `INSERT INTO user (name, contact, email, password, role_id) 
                     VALUES (?, ?, ?, ?, ?)`;
        
        const [result] = await db.execute(sql, [name, contact, email, password, role]);
        return result.insertId;
    }
};

module.exports = User;