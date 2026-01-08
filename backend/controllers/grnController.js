const Grn = require("../models/grnModel");
const catchAsync = require("../utils/catchAsync");
const { AppError } = require("../middleware/errorHandler");

exports.saveGRN = catchAsync(async (req, res, next) => {
    const grnId = await Grn.createGRN(req.body);
    
    res.status(201).json({
        success: true,
        message: "GRN successfully processed and stock updated!",
        grnId: grnId
    });
});

exports.getStats = catchAsync(async (req, res, next) => {
    const stats = await Grn.getGRNSummary();
    
    res.status(200).json({
        success: true,
        data: {
            totalGrn: stats.totalGrnCount || 0,
            totalAmount: stats.totalAmount || 0,
            totalPaid: stats.totalPaid || 0,
            totalBalance: stats.totalBalance || 0
        }
    });
});

exports.getGRNList = catchAsync(async (req, res, next) => {
    const grns = await Grn.getAllGRNs();
    
    res.status(200).json({
        success: true,
        data: grns
    });
});


exports.searchGRNList = catchAsync(async (req, res, next) => {
    const { supplierName, fromDate, toDate, billNumber } = req.query;

    const grns = await Grn.searchGRNs({
        supplierName,
        fromDate,
        toDate,
        billNumber
    });

    res.status(200).json({
        success: true,
        data: grns,
        count: grns.length
    });
});