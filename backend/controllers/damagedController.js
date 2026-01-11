const Damaged = require('../models/damagedModel');
const catchAsync = require('../utils/catchAsync'); 

exports.createDamagedRecord = catchAsync(async (req, res, next) => {
    const { stock_id, qty, reason_id, description, status_id } = req.body;

    if (!stock_id || !qty || !reason_id || !status_id) {
        return res.status(400).json({
            success: false,
            message: "Please provide all required fields: stock_id, qty, reason_id, status_id"
        });
    }

    const result = await Damaged.addDamagedStock({
        stock_id,
        qty,
        reason_id,
        description: description || "N/A",
        status_id
    });

    res.status(201).json({
        success: true,
        message: "Damaged stock record created successfully.",
        damagedId: result.insertId
    });
});