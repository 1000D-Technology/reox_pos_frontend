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

exports.getSearchStock = catchAsync(async (req, res, next) => {
    const filters = {
        category: req.query.category,
        unit: req.query.unit,
        supplier: req.query.supplier,
        searchQuery: req.query.q // Product Name or ID
    };

    const stockData = await Stock.searchStock(filters);

    // Transform data for UI
    const transformedData = stockData.map(item => ({
        productID: item.product_id.toString(),
        productName: item.product_name,
        unit: item.unit,
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

exports.getSummaryCards = catchAsync(async (req, res, next) => {
    const summary = await Stock.getDashboardSummary();

    res.status(200).json({
        success: true,
        data: {
            totalProducts: {
                value: summary.totalProducts.toLocaleString(),
                trend: "+5%"
            },
            totalValue: {
                value: `LKR ${parseFloat(summary.totalValue).toLocaleString(undefined, {minimumFractionDigits: 2})}`,
                trend: "+8%"
            },
            lowStock: {
                value: summary.lowStock.toString(),
                trend: "-5%"
            },
            totalSuppliers: {
                value: summary.totalSuppliers.toString(),
                trend: "+3%"
            },
            totalCategories: {
                value: summary.totalCategories.toString(),
                trend: "+2%"
            }
        }
    });
});