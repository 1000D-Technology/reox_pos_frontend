const prisma = require('../config/prismaClient');

const User = {
    // Find user by email (for validation/login)
    findByEmail: async (email) => {
        const user = await prisma.user.findFirst({
            where: { email }
        });
        return user;
    },

    // Check if contact is used by another user
    checkContactExcludingSelf: async (contact, userId) => {
        const user = await prisma.user.findFirst({
            where: {
                contact,
                id: { not: userId }
            }
        });
        return !!user;
    },

    // Create a new user based on latest DB structure
    create: async (userData) => {
        const { name, contact, email, password, role } = userData;

        const user = await prisma.user.create({
            data: {
                name,
                contact,
                email,
                password,
                role_id: role,
                status_id: 1,
                created_at: new Date()
            }
        });
        return user.id;
    },

    // Get all users with their role and status names (excluding password)
    getAllUsers: async () => {
        const users = await prisma.user.findMany({
            include: {
                role: {
                    select: {
                        user_role: true
                    }
                },
                status: {
                    select: {
                        ststus: true
                    }
                }
            },
            orderBy: {
                id: 'desc'
            }
        });

        return users.map(u => ({
            id: u.id,
            name: u.name,
            contact: u.contact,
            email: u.email,
            created_at: u.created_at,
            role_name: u.role.user_role,
            status_name: u.status.ststus
        }));
    },

    // Update user status
    updateStatus: async (userId, statusId) => {
        try {
            await prisma.user.update({
                where: { id: parseInt(userId) },
                data: {
                    status_id: statusId
                }
            });
            return { affectedRows: 1 };
        } catch (error) {
            if (error.code === 'P2025') {
                return { affectedRows: 0 };
            }
            throw error;
        }
    },

    // Update user details including optional password
    updateUser: async (userId, updateData) => {
        const { contact, role_id, password } = updateData;
        
        const data = {
            contact,
            role_id
        };

        if (password) {
            data.password = password;
        }

        try {
            await prisma.user.update({
                where: { id: parseInt(userId) },
                data
            });
            return { affectedRows: 1 };
        } catch (error) {
            if (error.code === 'P2025') {
                return { affectedRows: 0 };
            }
            throw error;
        }
    }

};

module.exports = User;
