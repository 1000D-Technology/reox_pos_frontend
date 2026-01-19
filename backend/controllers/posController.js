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
            expiry: item.expDate
        };
    });

    res.status(200).json({
        success: true,
        data: formattedData
    });
});

exports.searchProductByBarcode = catchAsync(async (req, res, next) => {
    const { barcode } = req.params;

    const results = await POS.getProductByAnyBarcode(barcode);

    if (!results || results.length === 0) {
        return res.status(404).json({
            success: false,
            message: "Product not found"
        });
    }

    const formattedResponse = results.map(item => {
        let variations = [];
        if (item.color) variations.push(item.color);
        if (item.size) variations.push(item.size);
        if (item.storage_capacity) variations.push(item.storage_capacity);

        let displayName = item.productName;
        if (variations.length > 0) {
            displayName += ` - ${variations.join(' - ')}`;
        }

        return {
            id: item.stockID,
            name: displayName,
            barcode: item.stockBarcode || item.pvBarcode,
            price: item.price,
            wholesalePrice: item.wholesalePrice,
            stock: item.currentStock,
            category: item.unit,
            isBulk: item.unit.toLowerCase().includes('kg') || item.unit.toLowerCase().includes('bag'),
            productCode: item.productCode
        };
    });

    res.status(200).json({
        success: true,
        data: formattedResponse
    });
});