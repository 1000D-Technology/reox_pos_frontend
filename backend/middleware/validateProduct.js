const { body, validationResult } = require('express-validator');

const validateProduct = [
    // Product Data Validation
    body('productData.name').notEmpty().withMessage('Product name is required'),
    body('productData.code').notEmpty().withMessage('Product code is required'),
    body('productData.categoryId').isInt().withMessage('Invalid Category ID'),
    
    body('productData.barcode').if(body('variations').isEmpty())
        .notEmpty().withMessage('Barcode is required for simple products'),

    body('variations.*.barcode').notEmpty().withMessage('Variant barcode is required'),
    
    (req, res, next) => {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            const errorArray = errors.array();
            return res.status(400).json({ 
                success: false, 
                message: errorArray[0].msg,
                errors: errorArray 
            });
        }
        next();
    }
];

module.exports = validateProduct;