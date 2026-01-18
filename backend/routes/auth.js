const express = require('express');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const db = require('../config/db');

const router = express.Router();

router.post('/login', async (req, res) => {
    try {
        const { username, password } = req.body;

        // Validate input
        if (!username || !password) {
            return res.status(400).json({
                success: false,
                message: 'Username and password are required'
            });
        }

        console.log('Login attempt for:', username); // Debug log

        // Query user with joins
        const query = `
            SELECT
                u.id,
                u.name,
                u.contact,
                u.email,
                u.password,
                u.role_id,
                u.status_id,
                r.user_role as role,
                s.ststus
            FROM user u
            LEFT JOIN role r ON u.role_id = r.id
            LEFT JOIN status s ON u.status_id = s.id
            WHERE (u.contact = ? OR u.email = ?)
            LIMIT 1
        `;

        const [users] = await db.query(query, [username, username]);

        if (!users || users.length === 0) {
            return res.status(401).json({
                success: false,
                message: 'Invalid username or password'
            });
        }

        const user = users[0];

        // Check password
        const isPasswordValid = await bcrypt.compare(password, user.password);

        if (!isPasswordValid) {
            return res.status(401).json({
                success: false,
                message: 'Invalid username or password'
            });
        }

        // Check if user is active
        if (user.status_id !== 1) {
            return res.status(403).json({
                success: false,
                message: `Account is ${user.status || 'inactive'}. Please contact support.`
            });
        }

        // Generate JWT token
        const token = jwt.sign(
            {
                id: user.id,
                role_id: user.role_id,
                email: user.email
            },
            process.env.JWT_SECRET || 'your-secret-key',
            { expiresIn: '24h' }
        );

        // Remove password from response
        delete user.password;

        res.status(200).json({
            success: true,
            message: 'Login successful',
            token,
            user
        });

    } catch (error) {
        console.error('Login error:', error);
        res.status(500).json({
            success: false,
            message: error.message || 'Server error occurred'
        });
    }
});

module.exports = router;
