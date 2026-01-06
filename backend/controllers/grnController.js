const Grn = require("../models/grnModel");
const db = require("../config/db");

exports.saveGRN = async (req, res) => {
    try {
        const grnId = await Grn.createGRN(req.body);
        
        res.status(201).json({
            success: true,
            message: "GRN successfully processed and stock updated!",
            grnId: grnId
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: "GRN processing failed",
            error: error.message
        });
    }
};

exports.getPaymentTypes = async (req, res) => {
    try {
        const [rows] = await db.execute(
            "SELECT id, payment_types FROM payment_types ORDER BY payment_types"
        );
        
        res.status(200).json({
            success: true,
            data: rows
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: "Failed to fetch payment types",
            error: error.message
        });
    }
};

exports.getStats = async (req, res) => {
    try {
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
    } catch (error) {
        res.status(500).json({
            success: false,
            message: "Error fetching GRN summary",
            error: error.message
        });
    }
};

exports.getGRNList = async (req, res) => {
    try {
        const grns = await Grn.getAllGRNs();
        
        res.status(200).json({
            success: true,
            data: grns
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: "Error fetching GRN list",
            error: error.message
        });
    }
};

exports.searchGRNList = async (req, res) => {
    try {
        const { supplierName, fromDate, toDate, billNumber } = req.query;

        const grns = await Grn.searchGRNs({
            supplierName,
            fromDate,
            toDate,
            billNumber
        });

        res.status(200).json({
            success: true,
            data: grns
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: "Search failed",
            error: error.message
        });
    }
};