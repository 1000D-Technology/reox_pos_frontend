const db = require('../config/db');
const ProductType = require('../models/productTypeModel');

exports.searchProductTypes = async (req, res) => {
    try {
        const query = req.query.q || '';
        const [rows] = await db.execute(
            "SELECT idproduct_type AS id, name FROM product_type WHERE name LIKE ? LIMIT 100",
            [`%${query}%`]
        );
        res.json({ success: true, data: rows });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

exports.addProductType = async (req, res) => {
    try {
        const { name } = req.body;

        if (!name) {
            return res.status(400).json({
                success: false,
                message: "Product type name is required"
            });
        }

        // Check if product type name already exists
        const [existingProductType] = await db.execute(
            "SELECT idproduct_type FROM product_type WHERE name = ?",
            [name.trim()]
        );

        if (existingProductType.length > 0) {
            return res.status(400).json({
                success: false,
                message: "This product type already exists!"
            });
        }

        const productTypeId = await ProductType.createProductType(name);
        res.status(201).json({
            success: true,
            message: "Product type added successfully!",
            data: { id: productTypeId, name: name }
        });
    } catch (error) {
        console.error('Error adding product type:', error);
        res.status(500).json({
            success: false,
            message: "Internal Server Error",
            error: error.message
        });
    }
};

exports.getProductTypes = async (req, res) => {
    try {
        const productTypes = await ProductType.getAllProductTypes();
        res.status(200).json({
            success: true,
            data: productTypes
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: "Error fetching product types",
            error: error.message
        });
    }
};

exports.updateProductType = async (req, res) => {
    try {
        const { id } = req.params;
        const { name } = req.body;

        if (!name) {
            return res.status(400).json({
                success: false,
                message: "Product type name is required"
            });
        }

        // Check if product type name already exists (excluding current product type)
        const [existingProductType] = await db.execute(
            "SELECT idproduct_type FROM product_type WHERE name = ? AND idproduct_type != ?",
            [name.trim(), id]
        );

        if (existingProductType.length > 0) {
            return res.status(400).json({
                success: false,
                message: "This product type already exists!"
            });
        }

        const result = await ProductType.updateProductType(id, name);
        if (result.affectedRows === 0) {
            return res.status(404).json({
                success: false,
                message: "Product type not found"
            });
        }

        res.status(200).json({
            success: true,
            message: "Product type updated successfully",
            data: { id, name }
        });
    } catch (error) {
        console.error('Error updating product type:', error);
        res.status(500).json({
            success: false,
            message: "Internal Server Error",
            error: error.message
        });
    }
};

exports.deleteProductType = async (req, res) => {
    try {
        const { id } = req.params;

        await ProductType.deleteProductType(id);
        res.status(200).json({
            success: true,
            message: "Product type deleted successfully!"
        });
    } catch (error) {
        if (error.message === "CANNOT_DELETE_USED_PRODUCT_TYPE") {
            return res.status(400).json({
                success: false,
                message: "This product type is already assigned to products and cannot be deleted."
            });
        }
        
        res.status(500).json({
            success: false,
            message: "Error deleting product type",
            error: error.message
        });
    }
};