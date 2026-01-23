const prisma = require('../config/prismaClient');
const catchAsync = require("../utils/catchAsync");
const { AppError } = require("../middleware/errorHandler");

const customerController = {
    // Add a new customer
    addCustomer: catchAsync(async (req, res, next) => {
        const { name, contact, email } = req.body;

        // Check if phone number already exists
        const existing = await prisma.customer.findFirst({
            where: { contact }
        });

        if (existing) {
            return next(new AppError("This phone number already exists in the system.", 400));
        }

        const customer = await prisma.customer.create({
            data: {
                name,
                contact,
                email: email || null,
                status_id: 1
            },
            include: {
                status: {
                    select: {
                        ststus: true
                    }
                }
            }
        });

        res.status(201).json({
            success: true,
            message: "Customer added successfully",
            data: {
                ...customer,
                status_name: customer.status.ststus
            }
        });
    }),

    // Get all customers
    getAllCustomers: catchAsync(async (req, res, next) => {
        const customers = await prisma.customer.findMany({
            include: {
                status: {
                    select: {
                        ststus: true
                    }
                },
                invoice: {
                    include: {
                        creadit_book: true
                    }
                }
            },
            orderBy: {
                id: 'desc'
            }
        });

        // Calculate credit balance for each customer from creadit_book
        const formattedCustomers = customers.map(c => {
            // Sum all credit book balances for this customer's invoices
            const creditBalance = c.invoice.reduce((total, inv) => {
                const invoiceCredit = inv.creadit_book.reduce((sum, cb) => sum + cb.balance, 0);
                return total + invoiceCredit;
            }, 0);

            return {
                ...c,
                credit_balance: creditBalance,
                status_name: c.status.ststus,
                invoice: undefined // Remove invoice details from response
            };
        });
        
        res.status(200).json({
            success: true,
            data: formattedCustomers
        });
    }),

    // Toggle customer status
    toggleStatus: catchAsync(async (req, res, next) => {
        const { customerId } = req.params;
        const { isActive } = req.body;

        // Map boolean isActive to status_id (1 for Active, 2 for Inactive)
        const status_id = isActive ? 1 : 2;

        const result = await prisma.customer.update({
            where: { id: parseInt(customerId) },
            data: { status_id }
        });

        res.status(200).json({
            success: true,
            message: `Customer status updated to ${isActive ? 'Active' : 'Inactive'}.`,
            data: { customerId, status_id }
        });
    }),
    
    // Update customer phone number
    updatePhone: catchAsync(async (req, res, next) => {
        const { customerId } = req.params;
        const { phone } = req.body;

        // 1. Check if the phone number is already taken by another customer
        const existing = await prisma.customer.findFirst({
            where: {
                contact: phone,
                id: { not: parseInt(customerId) }
            }
        });

        if (existing) {
            return next(new AppError("This contact number is already assigned to another customer.", 400));
        }

        // 2. Update the contact number in the database
        const result = await prisma.customer.update({
            where: { id: parseInt(customerId) },
            data: { contact: phone }
        });

        res.status(200).json({
            success: true,
            message: "Customer contact number updated successfully.",
            data: { customerId, newPhone: phone }
        });
    }),

    // Search customers by name
    searchCustomers: catchAsync(async (req, res, next) => {
        const { query } = req.query; 

        if (!query) {
            return next(new AppError("Search query is required.", 400));
        }

        const customers = await prisma.customer.findMany({
            where: {
                name: {
                    contains: query
                }
            },
            include: {
                status: {
                    select: {
                        ststus: true
                    }
                },
                invoice: {
                    include: {
                        creadit_book: true
                    }
                }
            },
            take: 10
        });

        // Calculate credit balance for each customer from creadit_book
        const formattedCustomers = customers.map(c => {
            // Sum all credit book balances for this customer's invoices
            const creditBalance = c.invoice.reduce((total, inv) => {
                const invoiceCredit = inv.creadit_book.reduce((sum, cb) => sum + cb.balance, 0);
                return total + invoiceCredit;
            }, 0);

            return {
                ...c,
                credit_balance: creditBalance,
                status_name: c.status.ststus,
                invoice: undefined // Remove invoice details from response
            };
        });

        res.status(200).json({
            success: true,
            data: formattedCustomers
        });
    })
};

module.exports = customerController;