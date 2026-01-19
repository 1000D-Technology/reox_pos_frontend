const POS = require('../models/posModel');
const catchAsync = require('../utils/catchAsync');

exports.getPOSProductsList = catchAsync(async (req, res, next) => {
    const products = await POS.getPOSProducts();

    const formattedData = products.map(item => {
        let variations = [];
        if (item.color) variations.push(item.color);
        if (item.size) variations.push(item.size);
        if (item.storage_capacity) variations.push(item.storage_capacity);

        let fullDisplayName = item.productName;

        if (variations.length > 0) {
            fullDisplayName += ` - ${variations.join(' - ')}`;
        }

        return {
            stockID: item.stockID,
            displayName: fullDisplayName,
            barcode: item.barcode,
            unit: item.unit,
            price: item.price,
            wholesalePrice: item.wholesalePrice,
            productCode: item.productCode,
            stock: item.currentStock,
            batch: item.batchName,
            isBulk: item.unit.toLowerCase().includes('kg') || item.unit.toLowerCase().includes('bag'),
            expiry: item.expiry
        };
    });

    res.status(200).json({
        success: true,
        data: formattedData
    });
});
exports.searchProductByBarcode = catchAsync(async (req, res, next) => {
    const { barcode } = req.params;

    if (!barcode || barcode.trim() === '') {
        return res.status(400).json({
            success: false,
            message: 'Barcode is required'
        });
    }

    const products = await POS.searchByBarcode(barcode.trim());

    if (!products || products.length === 0) {
        return res.status(404).json({
            success: false,
            message: 'Product not found with this barcode'
        });
    }

    // Format all matching products
    const formattedProducts = products.map(item => {
        let variations = [];
        if (item.color) variations.push(item.color);
        if (item.size) variations.push(item.size);
        if (item.storage_capacity) variations.push(item.storage_capacity);

        let fullDisplayName = item.productName;
        if (variations.length > 0) {
            fullDisplayName += ` - ${variations.join(' - ')}`;
        }

        return {
            stockID: item.stockID,
            displayName: fullDisplayName,
            barcode: item.barcode,
            unit: item.unit,
            price: item.price,
            wholesalePrice: item.wholesalePrice,
            productCode: item.productCode,
            stock: item.currentStock,
            batch: item.batchName,
            isBulk: item.unit.toLowerCase().includes('kg') || item.unit.toLowerCase().includes('bag'),
            expiry: item.expiry
        };
    });

    // Return single object if only one product, otherwise return array
    res.status(200).json({
        success: true,
        data: formattedProducts.length === 1 ? formattedProducts[0] : formattedProducts
    });
});

