const Product = require('../models/productModel');
const catchAsync = require('../utils/catchAsync');
const { AppError } = require('../middleware/errorHandler');

/**
 * @desc    Add a new product with its variations
 * @route   POST /api/products/add
 */
exports.addProduct = catchAsync(async (req, res, next) => {
    const { productData, variations } = req.body;

    // Basic validation for product data
    if (!productData || !productData.productName) {
        return next(new AppError("Product data is missing or incomplete", 400));
    }

    let finalVariations = [];
    // If no variations are provided, create a default variation
    if (!variations || variations.length === 0) {
        finalVariations.push({
            barcode: productData.barcode,
            color: 'Default', 
            size: 'Default', 
            capacity: 'N/A', 
            statusId: 1
        });
    } else {
        finalVariations = variations;
    }

    await Product.create(productData, finalVariations);
    
    res.status(201).json({ 
        success: true, 
        message: "Product saved successfully!" 
    });
});

/**
 * @desc    Get all active products (Status 1)
 * @route   GET /api/products
 */
exports.getProducts = catchAsync(async (req, res, next) => {
    const products = await Product.getProductsByStatus(1);
    
    res.status(200).json({
        success: true,
        data: products
    });
});

/**
 * @desc    Get active products list for selection dropdowns
 * @route   GET /api/products/dropdown
 */
exports.getProductsForDropdown = catchAsync(async (req, res, next) => {
    const products = await Product.getProductsForDropdown(1);
    
    res.status(200).json({
        success: true,
        data: products
    });
});

/**
 * @desc    Get all variations for a specific product ID
 * @route   GET /api/products/variants/:productId
 */
exports.getProductVariants = catchAsync(async (req, res, next) => {
    const { productId } = req.params;
    const variants = await Product.getProductVariantsByProductId(productId);
    
    res.status(200).json({
        success: true,
        data: variants
    });
});

/**
 * @desc    Update a specific product variation and its parent product
 * @route   PUT /api/products/update/:pvId
 */
exports.updateProduct = catchAsync(async (req, res, next) => {
    const { pvId } = req.params;
    const { productData, variationData } = req.body;

    await Product.updateProductVariation(pvId, productData, variationData);
    
    res.status(200).json({ 
        success: true, 
        message: "Product updated successfully!" 
    });
});

/**
 * @desc    Search active products by type or search term
 * @route   GET /api/products/search
 */
exports.searchProducts = catchAsync(async (req, res, next) => {
    const { productTypeId, searchTerm } = req.query;
    const products = await Product.searchProducts({ productTypeId, searchTerm }, 1);

    res.status(200).json({ 
        success: true, 
        data: products 
    });
});

/**
 * @desc    Search inactive products by type or search term
 * @route   GET /api/products/search-deactive
 */
exports.searchDeactiveProducts = catchAsync(async (req, res, next) => {
    const { productTypeId, searchTerm } = req.query;
    const products = await Product.searchProducts({ productTypeId, searchTerm }, 2);

    res.status(200).json({ 
        success: true, 
        data: products 
    });
});

/**
 * @desc    Activate or Deactivate a product variation
 * @route   PATCH /api/products/status/:pvId
 */
exports.chnageProductStatus = catchAsync(async (req, res, next) => {
    const { pvId } = req.params;
    const { statusId } = req.body; // 1 = Active, 2 = Inactive

    const result = await Product.updateProductStatus(pvId, statusId);
    
    if (result.affectedRows === 0) {
        return next(new AppError("Product variation not found", 404));
    }
    
    res.status(200).json({
        success: true,
        message: statusId == 1 ? "Product activated!" : "Product deactivated!"
    });
});

/**
 * @desc    Get all inactive products (Status 2)
 * @route   GET /api/products/deactive
 */
exports.getDeactiveProducts = catchAsync(async (req, res, next) => {
    const products = await Product.getProductsByStatus(2);
    
    res.status(200).json({
        success: true,
        data: products
    });
});