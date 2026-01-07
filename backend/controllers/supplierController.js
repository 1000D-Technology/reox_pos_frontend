const Supplier = require("../models/supplierModel");
const db = require("../config/db");
const catchAsync = require("../utils/catchAsync");
const { AppError } = require("../middleware/errorHandler");

/**
 * @desc    Add a new company
 * @route   POST /api/suppliers/company
 */
exports.addCompany = catchAsync(async (req, res, next) => {
    const { name, email, contact } = req.body;

    // Basic validation for required fields
    if (!name || name.trim() === "") return next(new AppError("Company name is required", 400));
    if (!contact || contact.trim() === "") return next(new AppError("Company contact is required", 400));

    // Validate email format if provided
    if (email && email.trim() !== "") {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(email)) return next(new AppError("Invalid email format", 400));
    }

    // Validate Sri Lankan mobile number format
    const sriLankanMobileRegex = /^(\+94|0)?7[0-9]{8}$/;
    if (!sriLankanMobileRegex.test(contact.replace(/\s/g, ''))) {
        return next(new AppError("Invalid Sri Lankan mobile number format.", 400));
    }

    // Create company in the database
    const companyId = await Supplier.createCompany({ name, email, contact });

    res.status(201).json({
        success: true,
        message: "Company added successfully!",
        data: { id: companyId, name, email, contact }
    });
});

/**
 * @desc    Search companies by name
 * @route   GET /api/suppliers/search-company
 */
exports.searchCompany = catchAsync(async (req, res, next) => {
    const query = req.query.q || '';
    const [rows] = await db.execute(
        "SELECT id, company_name FROM company WHERE company_name LIKE ? LIMIT 100",
        [`%${query}%`]
    );
    res.status(200).json({ success: true, data: rows });
});

/**
 * @desc    Search banks by name
 * @route   GET /api/suppliers/search-bank
 */
exports.searchBank = catchAsync(async (req, res, next) => {
    const query = req.query.q || '';
    const [rows] = await db.execute(
        "SELECT id, bank_name FROM bank WHERE bank_name LIKE ? LIMIT 100",
        [`%${query}%`]
    );
    res.status(200).json({ success: true, data: rows });
});

/**
 * @desc    Add a new supplier
 * @route   POST /api/suppliers/add
 */
exports.addSupplier = catchAsync(async (req, res, next) => {
    const { supplierName, email, contactNumber, companyId, bankId, accountNumber } = req.body;

    // Check for mandatory fields
    if (!supplierName || !contactNumber || !companyId) {
        return next(new AppError("Supplier name, contact, and company are required.", 400));
    }

    // Ensure contact number is exactly 10 digits
    if (contactNumber.length !== 10) {
        return next(new AppError("Invalid contact number. Must be 10 digits.", 400));
    }

    // Create supplier in the database
    const supplierId = await Supplier.createSupplier({
        supplierName, email, contactNumber, companyId, bankId, accountNumber
    });

    res.status(201).json({
        success: true,
        message: "Supplier added successfully!",
        supplierId: supplierId
    });
});

/**
 * @desc    Get list of all suppliers
 * @route   GET /api/suppliers
 */
exports.getSuppliers = catchAsync(async (req, res, next) => {
    const suppliers = await Supplier.getAllSuppliers();
    res.status(200).json({
        success: true,
        data: suppliers
    });
});

/**
 * @desc    Update supplier contact number
 * @route   PATCH /api/suppliers/:id/contact
 */
exports.updateSupplierContact = catchAsync(async (req, res, next) => {
    const { id } = req.params;
    const { contactNumber } = req.body;

    // Validate updated contact number
    if (!contactNumber || contactNumber.length !== 10) {
        return next(new AppError("A valid 10-digit contact number is required.", 400));
    }

    const result = await Supplier.updateContact(id, contactNumber);

    // Return 404 if no supplier was found with the given ID
    if (result.affectedRows === 0) {
        return next(new AppError("Supplier not found.", 404));
    }

    res.status(200).json({
        success: true,
        message: "Contact number updated successfully!"
    });
});