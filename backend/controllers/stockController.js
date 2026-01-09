const Stock = require('../models/stockModel');
const catchAsync = require('../utils/catchAsync');

/**
 * @desc    Fetch all stock records for the table
 * @route   GET /api/stock
 */
exports.getStockList = catchAsync(async (req, res, next) => {
    const stockData = await Stock.getAllStock();

    // Transform data to match frontend expectations
    const transformedData = stockData.map(item => ({
        productID: item.product_id.toString(),
        productName: item.product_name,
        unit: item.unit,
        discountAmount: '0.00', // Default since we removed discount from query
        costPrice: parseFloat(item.cost_price).toFixed(2),
        MRP: parseFloat(item.mrp).toFixed(2),
        Price: parseFloat(item.selling_price).toFixed(2),
        supplier: item.supplier || 'N/A',
        stockQty: item.stock_qty.toString()
    }));

    res.status(200).json({
        success: true,
        count: transformedData.length,
        data: transformedData
    });
});