const Product = require('../models/productModel');
const catchAsync = require('../utils/catchAsync');
const { AppError } = require('../middleware/errorHandler');

/**
 * @desc    Add a new product with its variations
 * @route   POST /api/products/add
 */
exports.addProduct = catchAsync(async (req, res, next) => {
    const { productData, variations } = req.body;

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
    
    // Check if product exists
    const productExists = await Product.checkIdExists('product', 'id', productId);
    if (!productExists) {
        return next(new AppError("Product not found", 404));
    }

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

    // Check if product variation exists
    const productExists = await Product.checkIdExists('product_variations', 'id', pvId);
    if (!productExists) {
        return next(new AppError("Product variation not found", 404));
    }

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
    const { productTypeId, searchTerm, unitId } = req.query;
    console.log(`Searching Active Products - Type: ${productTypeId}, Unit: ${unitId}, Term: ${searchTerm}`);
    const products = await Product.searchProducts({ productTypeId, searchTerm, unitId }, 1);

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
    const { productTypeId, searchTerm, unitId } = req.query;
    const products = await Product.searchProducts({ productTypeId, searchTerm, unitId }, 2);

    res.status(200).json({ 
        success: true, 
        data: products 
    });
});

/**
 * @desc    Activate or Deactivate a product variation
 * @route   PATCH /api/products/status/:pvId
 */
exports.changeProductStatus = catchAsync(async (req, res, next) => {
    const { pvId } = req.params;
    const { statusId } = req.body; // 1 = Active, 2 = Inactive

    // Check if product variation exists
    const productExists = await Product.checkIdExists('product_variations', 'id', pvId);
    if (!productExists) {
        return next(new AppError("Product variation not found", 404));
    }

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