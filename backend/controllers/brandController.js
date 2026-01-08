const db = require('../config/db');
const Brand = require('../models/BrandModel');

exports.searchBrands = async (req, res) => {
    try {
        const query = req.query.q || '';
        const [rows] = await db.execute(
            "SELECT idbrand AS id, name, created_at FROM brand WHERE name LIKE ? LIMIT 100",
            [`%${query}%`]
        );
        res.json({ success: true, data: rows });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

exports.addBrand = async (req, res) => {
    try {
        const { name } = req.body;

        if (!name) {
            return res.status(400).json({
                success: false,
                message: "Brand name is required"
            });
        }

        // Check if brand name already exists
        const [existingBrand] = await db.execute(
            "SELECT idbrand FROM brand WHERE name = ?",
            [name.trim()]
        );

        if (existingBrand.length > 0) {
            return res.status(400).json({
                success: false,
                message: "This brand already exists!"
            });
        }

        const brandId = await Brand.createBrand(name);
        res.status(201).json({
            success: true,
            message: "Brand added successfully!",
            data: { id: brandId, name: name }
        });
    } catch (error) {
        console.error('Error adding brand:', error);
        res.status(500).json({
            success: false,
            message: "Internal Server Error",
            error: error.message
        });
    }
};

exports.getBrands = async (req, res) => {
    try {
        const brands = await Brand.getAllBrand();
        res.status(200).json({
            success: true,
            data: brands
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: "Error fetching brands",
            error: error.message
        });
    }
};

exports.updateBrand = async (req, res) => {
    try {
        const { id } = req.params;
        const { name } = req.body;

        if (!name) {
            return res.status(400).json({
                success: false,
                message: "Brand name is required"
            });
        }

        // Check if brand name already exists (excluding current brand)
        const [existingBrand] = await db.execute(
            "SELECT idbrand FROM brand WHERE name = ? AND idbrand != ?",
            [name.trim(), id]
        );

        if (existingBrand.length > 0) {
            return res.status(400).json({
                success: false,
                message: "This brand already exists!"
            });
        }

        const result = await Brand.updateBrand(id, name);
        if (result.affectedRows === 0) {
            return res.status(404).json({
                success: false,
                message: "Brand not found"
            });
        }

        res.status(200).json({
            success: true,
            message: "Brand updated successfully",
            data: { id, name }
        });
    } catch (error) {
        console.error('Error updating brand:', error);
        res.status(500).json({
            success: false,
            message: "Internal Server Error",
            error: error.message
        });
    }
};

exports.deleteBrand = async (req, res) => {
    try {
        const { id } = req.params;

        await Brand.deleteBrand(id);
        res.status(200).json({
            success: true,
            message: "Brand deleted successfully!"
        });
    } catch (error) {
        if (error.message === "CANNOT_DELETE_USED_BRAND") {
            return res.status(400).json({
                success: false,
                message: "This brand is already assigned to products and cannot be deleted."
            });
        }
        
        res.status(500).json({
            success: false,
            message: "Error deleting brand",
            error: error.message
        });
    }
};