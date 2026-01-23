const express = require('express');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const prisma = require('../config/prismaClient');

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

        // Query user with Prisma
        const user = await prisma.user.findFirst({
            where: {
                OR: [
                    { contact: username },
                    { email: username },
                    { name: username }
                ]
            },
            include: {
                role: {
                    select: {
                        user_role: true
                    }
                }
            }
        });

        if (!user) {
            return res.status(401).json({
                success: false,
                message: 'Invalid username or password'
            });
        }

        // Check password
        const isPasswordValid = await bcrypt.compare(password, user.password);

        if (!isPasswordValid) {
            return res.status(401).json({
                success: false,
                message: 'Invalid username or password'
            });
        }

        // Fetch user status
        const userStatus = await prisma.status.findUnique({
            where: { id: user.status_id }
        });

        // Check if user is active
        if (user.status_id !== 1) {
            return res.status(403).json({
                success: false,
                message: `Account is ${userStatus?.ststus || 'inactive'}. Please contact support.`
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

        // Format user response
        const userResponse = {
            id: user.id,
            name: user.name,
            contact: user.contact,
            email: user.email,
            role_id: user.role_id,
            status_id: user.status_id,
            role: user.role?.user_role,
            ststus: userStatus?.ststus
        };

        res.status(200).json({
            success: true,
            message: 'Login successful',
            token,
            user: userResponse
        });

    } catch (error) {
        console.error('Login error:', error);
        res.status(500).json({
            success: false,
            message: error.message || 'Server error occurred'
        });
    }
});

router.get('/users', async (req, res) => {
    try {
        const users = await prisma.user.findMany({
            where: {
                status_id: 1 // Active users only
            },
            select: {
                id: true,
                name: true,
                email: true,
                contact: true,
                role: {
                    select: {
                        user_role: true
                    }
                }
            },
            orderBy: {
                name: 'asc'
            }
        });

        res.json({
            success: true,
            data: users
        });
    } catch (error) {
        console.error('Error fetching users:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to fetch users'
        });
    }
});

module.exports = router;
