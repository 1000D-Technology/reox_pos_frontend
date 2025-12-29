const Product = require('../models/productModel');

exports.addProduct = async(req , res) => {
    try {
        const { productData, variations } = req.body;

        const checks = [
            { table: 'category', col: 'idcategory', val: productData.categoryId, name: 'Category' },
            { table: 'brand', col: 'idbrand', val: productData.brandId, name: 'Brand' },
            { table: 'unit_id', col: 'idunit_id', val: productData.unitId, name: 'Unit' },
            { table: 'product_type', col: 'idproduct_type', val: productData.typeId, name: 'Product Type' }
        ];

        let validationErrors = [];
        for (const item of checks) {
            const exists = await Product.checkIdExists(item.table, item.col, item.val);
            if (!exists) {
                validationErrors.push({ field: item.name.toLowerCase() + 'Id', message: `Invalid ${item.name} ID. Record not found.` });
            }
        }

        if (validationErrors.length > 0) {
            return res.status(400).json({
                success: false,
                message: validationErrors[0].message,
                errors: validationErrors
            });
        }

        let finalVariations = [];
        if (!variations || variations.length === 0) {
            finalVariations.push({
                barcode: productData.barcode,
                color: 'Default', size: 'Default', capacity: 'N/A', statusId: 1
            });
        } else {
            finalVariations = variations;
        }

        const id = await Product.create(productData, finalVariations);
        res.status(201).json({ success: true, message: "Product saved successfully!" });

    } catch (error) {
        if (error.code === 'ER_DUP_ENTRY') {
            return res.status(400).json({ success: false, message: "Duplicate entry detected", errors: [{ field: "code/barcode", message: "Already exists!" }] });
        }
        res.status(500).json({ success: false, message: "Database Error", error: error.message });
    }
}