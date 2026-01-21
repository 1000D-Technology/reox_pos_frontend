const Supplier = require("../models/supplierModel");
const catchAsync = require("../utils/catchAsync");
const { AppError } = require("../middleware/errorHandler");

exports.addCompany = catchAsync(async (req, res, next) => {
    const { name, email, contact } = req.body;
    
    // Check if company already exists
    const companyExists = await Supplier.checkCompanyExists(name);
    if (companyExists) {
        return next(new AppError("Company with this name already exists.", 400));
    }
    
    const companyId = await Supplier.createCompany({ name, email, contact });

    res.status(201).json({
        success: true,
        message: "Company added successfully!",
        data: { id: companyId, name, email, contact }
    });
});

exports.searchCompany = catchAsync(async (req, res, next) => {
    const query = req.query.q || '';
    const companies = await Supplier.searchCompanies(query);
    res.status(200).json({ success: true, data: companies });
});

exports.searchBank = catchAsync(async (req, res, next) => {
    const query = req.query.q || '';
    const banks = await Supplier.searchBanks(query);
    res.status(200).json({ success: true, data: banks });
});

exports.addSupplier = catchAsync(async (req, res, next) => {
    const { companyId, bankId } = req.body;
    
    // Check if company exists
    const companyExists = await Supplier.checkCompanyExistsById(companyId);
    if (!companyExists) {
        return next(new AppError("Company with this ID does not exist.", 400));
    }
    
    // Check if bank exists (if bankId is provided)
    if (bankId) {
        const bankExists = await Supplier.checkBankExistsById(bankId);
        if (!bankExists) {
            return next(new AppError("Bank with this ID does not exist.", 400));
        }
    }
    
    const supplierId = await Supplier.createSupplier(req.body);

    res.status(201).json({
        success: true,
        message: "Supplier added successfully!",
        supplierId
    });
});

exports.getSuppliers = catchAsync(async (req, res, next) => {
    const suppliers = await Supplier.getAllSuppliers();
    res.status(200).json({ success: true, data: suppliers });
});

exports.getSupplierDropdownList = catchAsync(async (req, res, next) => {
    const suppliers = await Supplier.getSupplierDropdownList();
    res.status(200).json({ success: true, data: suppliers });
});

exports.updateSupplierContact = catchAsync(async (req, res, next) => {
    const { id } = req.params;
    let { contactNumber } = req.body;

    if (!contactNumber) {
        return next(new AppError("Contact number is required.", 400));
    }

    // Clean the contact number (remove non-digits) to fit in 10 chars if possible
    contactNumber = contactNumber.replace(/\D/g, '');

    if (contactNumber.length > 10) {
        return next(new AppError("Contact number exceeds the maximum length of 10 digits.", 400));
    }

    const result = await Supplier.updateContact(id, contactNumber);

    if (result.affectedRows === 0) {
        return next(new AppError("Supplier not found.", 404));
    }

    res.status(200).json({
        success: true,
        message: "Contact number updated successfully!"
    });
});

exports.updateSupplierStatus = catchAsync(async (req, res, next) => {
    const { id } = req.params;
    const { currentStatusId } = req.body;

    if (!currentStatusId || (currentStatusId !== 1 && currentStatusId !== 2)) {
        return next(new AppError("Current status ID must be either 1 (Active) or 2 (Inactive).", 400));
    }

    const result = await Supplier.updateStatus(id, currentStatusId);

    if (result.affectedRows === 0) {
        return next(new AppError("Supplier not found.", 404));
    }

    const newStatus = currentStatusId === 1 ? 'Inactive' : 'Active';
    res.status(200).json({
        success: true,
        message: `Supplier status updated to ${newStatus} successfully!`
    });
});