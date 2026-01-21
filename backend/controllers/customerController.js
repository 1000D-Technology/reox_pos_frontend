const db = require('../config/db');
const catchAsync = require("../utils/catchAsync");
const { AppError } = require("../middleware/errorHandler");

const customerController = {
    // Add a new customer
    addCustomer: catchAsync(async (req, res, next) => {
        const { name, contact, email, credit_balance } = req.body;

        // Check if phone number already exists
        const [existing] = await db.execute('SELECT id FROM customer WHERE contact = ?', [contact]);
        if (existing.length > 0) {
            return next(new AppError("This phone number already exists in the system.", 400));
        }

        const sql = `INSERT INTO customer (name, contact, email, credit_balance, status_id, created_at) 
                     VALUES (?, ?, ?, ?, ?, NOW())`;
        
        const values = [name, contact, email || null, credit_balance || 0.0, 1];

        const [result] = await db.execute(sql, values);

        // Fetch the complete customer data that was just created
        const [newCustomer] = await db.execute(
            `SELECT c.*, s.ststus as status_name 
             FROM customer c 
             INNER JOIN status s ON c.status_id = s.id 
             WHERE c.id = ?`, 
            [result.insertId]
        );

        res.status(201).json({
            success: true,
            message: "Customer added successfully",
            data: newCustomer[0]
        });
    }),

    // Get all customers
    getAllCustomers: catchAsync(async (req, res, next) => {
        const sql = `
            SELECT c.*, s.ststus as status_name 
            FROM customer c 
            INNER JOIN status s ON c.status_id = s.id 
            ORDER BY c.id DESC`;
            
        const [customers] = await db.execute(sql);
        
        res.status(200).json({
            success: true,
            data: customers
        });
    }),

    // Toggle customer status
    toggleStatus: catchAsync(async (req, res, next) => {
        const { customerId } = req.params;
        const { isActive } = req.body;

        // Map boolean isActive to status_id (1 for Active, 2 for Inactive)
        const status_id = isActive ? 1 : 2;

        const sql = `UPDATE customer SET status_id = ? WHERE id = ?`;
        const [result] = await db.execute(sql, [status_id, customerId]);

        if (result.affectedRows === 0) {
            return next(new AppError("Customer not found.", 404));
        }

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
        const [existing] = await db.execute(
            'SELECT id FROM customer WHERE contact = ? AND id != ?', 
            [phone, customerId]
        );

        if (existing.length > 0) {
            return next(new AppError("This contact number is already assigned to another customer.", 400));
        }

        // 2. Update the contact number in the database
        const sql = `UPDATE customer SET contact = ? WHERE id = ?`;
        const [result] = await db.execute(sql, [phone, customerId]);

        if (result.affectedRows === 0) {
            return next(new AppError("Customer not found.", 404));
        }

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

        const sql = `
            SELECT c.*, s.ststus as status_name 
            FROM customer c 
            INNER JOIN status s ON c.status_id = s.id 
            WHERE c.name LIKE ? 
            LIMIT 10`;

        const [customers] = await db.execute(sql, [`%${query}%`]);

        res.status(200).json({
            success: true,
            data: customers
        });
    })
};

module.exports = customerController;