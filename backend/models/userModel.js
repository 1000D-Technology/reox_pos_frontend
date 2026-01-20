const db = require('../config/db');

const User = {
    // Find user by email (for validation/login)
    findByEmail: async (email) => {
        const [rows] = await db.execute('SELECT * FROM user WHERE email = ?', [email]);
        return rows[0];
    },

    // Check if contact is used by another user
    checkContactExcludingSelf: async (contact, userId) => {
        const sql = 'SELECT id FROM user WHERE contact = ? AND id != ?';
        const [rows] = await db.execute(sql, [contact, userId]);
        return rows.length > 0; 
    },

    // Create a new user based on latest DB structure
    create: async (userData) => {
        const { name, contact, email, password, role } = userData;

        const sql = `INSERT INTO user (name, contact, email, password, role_id, status_id) 
                     VALUES (?, ?, ?, ?, ?, ?)`;

        const [result] = await db.execute(sql, [name, contact, email, password, role, 1]);
        return result.insertId;
    },

    // Get all users with their role and status names (excluding password)
    getAllUsers: async () => {
        const sql = `
            SELECT 
                u.id, 
                u.name, 
                u.contact, 
                u.email, 
                u.created_at, 
                r.user_role AS role_name, 
                s.ststus AS status_name
            FROM user u
            INNER JOIN role r ON u.role_id = r.id
            INNER JOIN status s ON u.status_id = s.id
            ORDER BY u.id DESC`;

        const [rows] = await db.execute(sql);
        return rows;
    },

    // Update user status
    updateStatus: async (userId, statusId) => {
        const sql = 'UPDATE user SET status_id = ? WHERE id = ?';
        const [result] = await db.execute(sql, [statusId, userId]);
        return result;
    },

    // Update user details including optional password
    updateUser: async (userId, updateData) => {
        const { contact, role_id, password } = updateData;
        
        let sql;
        let params;

        if (password) {
            sql = 'UPDATE user SET contact = ?, role_id = ?, password = ? WHERE id = ?';
            params = [contact, role_id, password, userId];
        } else {
            sql = 'UPDATE user SET contact = ?, role_id = ? WHERE id = ?';
            params = [contact, role_id, userId];
        }

        const [result] = await db.execute(sql, params);
        return result;
    }

};

module.exports = User;