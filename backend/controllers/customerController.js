const db = require('../config/db'); 

const customerController = {
    addCustomer: async (req, res) => {
        const { name, contact, email, credit_balance } = req.body;

        try {
            const [existing] = await db.execute('SELECT id FROM customer WHERE contact = ?', [contact]);
            if (existing.length > 0) {
                return res.status(400).json({ success: false, message: "This phone number already exists in the system." });
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
        } catch (error) {
            console.error(error);
            res.status(500).json({ success: false, message: "Database error: " + error.message });
        }
    },

    getAllCustomers: async (req, res) => {
        try {
            const sql = `
                SELECT c.*, s.ststus as status_name 
                FROM customer c 
                INNER JOIN status s ON c.status_id = s.id 
                ORDER BY c.id DESC`;
                
            const [customers] = await db.execute(sql);
            
            res.json({
                success: true,
                data: customers
            });
        } catch (error) {
            res.status(500).json({ success: false, message: "Database error: " + error.message });
        }
    },

    toggleStatus: async (req, res) => {
        const { customerId } = req.params; // From URL: /api/customers/:customerId/status
        const { isActive } = req.body;      // From Body: { isActive: true/false }

        try {
            // Map boolean isActive to status_id (1 for Active, 2 for Inactive)
            const status_id = isActive ? 1 : 2;

            const sql = `UPDATE customer SET status_id = ? WHERE id = ?`;
            const [result] = await db.execute(sql, [status_id, customerId]);

            if (result.affectedRows === 0) {
                return res.status(404).json({ 
                    success: false, 
                    message: "Customer not found." 
                });
            }

            res.status(200).json({
                success: true,
                message: `Customer status updated to ${isActive ? 'Active' : 'Inactive'}.`,
                data: { customerId, status_id }
            });

        } catch (error) {
            console.error(error);
            res.status(500).json({ success: false, message: "Database error: " + error.message });
        }
    },
    
    updatePhone: async (req, res) => {
        const { customerId } = req.params; // From URL: /api/customers/:customerId/phone
        const { phone } = req.body;        // From Body: { phone: "0771234567" }

        try {
            // 1. Check if the phone number is already taken by another customer
            const [existing] = await db.execute(
                'SELECT id FROM customer WHERE contact = ? AND id != ?', 
                [phone, customerId]
            );

            if (existing.length > 0) {
                return res.status(400).json({ 
                    success: false, 
                    message: "This contact number is already assigned to another customer." 
                });
            }

            // 2. Update the contact number in the database
            const sql = `UPDATE customer SET contact = ? WHERE id = ?`;
            const [result] = await db.execute(sql, [phone, customerId]);

            if (result.affectedRows === 0) {
                return res.status(404).json({ 
                    success: false, 
                    message: "Customer not found." 
                });
            }

            res.status(200).json({
                success: true,
                message: "Customer contact number updated successfully.",
                data: { customerId, newPhone: phone }
            });

        } catch (error) {
            console.error(error);
            res.status(500).json({ 
                success: false, 
                message: "Database error: " + error.message 
            });
        }
    }
};

module.exports = customerController;