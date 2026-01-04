const Supplier = require("../models/supplierModel");
const db = require("../config/db");

exports.addCompany = async (req, res) => {
    try {
        const {name, email, contact} = req.body;
        
        if(!name || name.trim() === "") {
           return res.status(400).json({
                success: false,
                message: "Company name is required"
            });
        }

        if(email && email.trim() !== "" ) {
            const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
            if(!emailRegex.test(email)) {
                return res.status(400).json({
                    success: false,
                    message: "Invalid email format"
                });
            }
        }
        
        if(!contact || contact.trim() === "") {
            return res.status(400).json({
                success: false,
                message: "Company contact is required"
            });
        }
        
        // Sri Lankan mobile number validation regex
        const sriLankanMobileRegex = /^(\+94|0)?7[0-9]{8}$/;
        
        if(!sriLankanMobileRegex.test(contact.replace(/\s/g, ''))) {
            return res.status(400).json({
                success: false,
                message: "Invalid Sri Lankan mobile number format. Use +94xxxxxxxx, 0xxxxxxxx, or xxxxxxxx format"
            });
        }
        
        const companyId = await Supplier.createCompany({ name, email, contact });
        
        res.status(201).json({
            success: true,
            message: "Company added successfully!",
            data: { id: companyId, name, email, contact }
        });
    } catch (error) {
        if (error.code === 'ER_DUP_ENTRY') {
            return res.status(400).json({
                success: false,
                message: "This company details already exist!"
            });
        }
        res.status(500).json({
            success: false,
            message: "Internal Server Error",
            error: error.message
        });
    }
};

exports.searchCompany = async (req, res) => {
    try {
        const query = req.query.q || '';
        const [rows] = await db.execute(
            "SELECT id, company_name FROM company WHERE company_name LIKE ? LIMIT 100",
            [`%${query}%`]
        );
        res.json({ success: true, data: rows });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

exports.searchBank = async (req, res) => {
    try{
        const query = req.query.q || '';
        const [rows] = await db.execute(
            "SELECT id, bank_name FROM bank WHERE bank_name LIKE ? LIMIT 100",
            [`%${query}%`]
        );
        res.json({ success: true, data: rows });
    }catch(error){
        res.status(500).json({ success: false, message: error.message });
    }
};