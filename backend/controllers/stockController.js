const Stock = require('../models/stockModel');
const catchAsync = require('../utils/catchAsync');

exports.getStockList = catchAsync(async (req, res, next) => {
    const stockData = await Stock.getAllStock();

    const transformedData = stockData.map(item => ({
        productID: item.variation_id.toString(),
        productName: item.full_product_name,
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
        searchQuery: req.query.q
    };

    const stockData = await Stock.searchStock(filters);

    const transformedData = stockData.map(item => ({
        productID: item.variation_id.toString(), 
        productName: item.full_product_name,
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

exports.getOutOfStockList = catchAsync(async (req, res, next) => {
    const stockData = await Stock.getOutOfStock();

    const transformedData = stockData.map(item => ({
        productID: item.variation_id.toString(),
        productName: item.full_product_name,
        unit: item.unit,
        costPrice: `LKR ${parseFloat(item.cost_price).toFixed(2)}`,
        MRP: `LKR ${parseFloat(item.mrp).toFixed(2)}`,
        Price: `LKR ${parseFloat(item.selling_price).toFixed(2)}`,
        supplier: item.supplier || 'N/A',
        stockQty: item.stock_qty.toString()
    }));

    res.status(200).json({
        success: true,
        count: transformedData.length,
        data: transformedData
    });
});

exports.getSearchOutOfStock = catchAsync(async (req, res, next) => {
    const filters = {
        searchQuery: req.query.product,
        category: req.query.category,
        supplier: req.query.supplier,
        fromDate: req.query.fromDate,
        toDate: req.query.toDate
    };

    const stockData = await Stock.searchOutOfStock(filters);

    const transformedData = stockData.map(item => ({
        productID: item.variation_id.toString(),
        productName: item.full_product_name,
        unit: item.unit,
        costPrice: `LKR ${parseFloat(item.cost_price).toFixed(2)}`,
        MRP: `LKR ${parseFloat(item.mrp).toFixed(2)}`,
        Price: `LKR ${parseFloat(item.selling_price).toFixed(2)}`,
        supplier: item.supplier || 'N/A',
        stockQty: item.stock_qty.toString()
    }));

    res.status(200).json({
        success: true,
        count: transformedData.length,
        data: transformedData,
        message: transformedData.length === 0 
            ? 'No out-of-stock items found' 
            : `Found ${transformedData.length} items`
    });
});

exports.getStockForProduct = catchAsync(async (req, res, next) => {
    const { variationId } = req.params;

    if (!variationId) {
        return res.status(400).json({ success: false, message: "Product Variation ID is required" });
    }

    const stockItems = await Stock.getStockByProductVariation(variationId);

    const transformedData = stockItems.map(item => ({
        stockID: item.stock_id,
        displayName: item.full_stock_display,
        quantity: item.available_qty,
        price: item.selling_price
    }));

    res.status(200).json({
        success: true,
        data: transformedData
    });
});