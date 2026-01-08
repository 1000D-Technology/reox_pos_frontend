const db = require('../config/db');
const Category = require('../models/categoryModel');

exports.searchCategories = async (req, res) => {
    try {
        const query = req.query.q || '';
        const [rows] = await db.execute(
            "SELECT idcategory AS id, name, created_at FROM category WHERE name LIKE ? LIMIT 100",
            [`%${query}%`]
        );
        res.json({ success: true, data: rows });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

exports.addCategory = async (req, res) => {
    try {
        const { name } = req.body;

        if (!name) {
            return res.status(400).json({
                success: false,
                message: "Category name is required"
            });
        }

        // Check if category name already exists
        const [existingCategory] = await db.execute(
            "SELECT idcategory FROM category WHERE name = ?",
            [name.trim()]
        );

        if (existingCategory.length > 0) {
            return res.status(400).json({
                success: false,
                message: "This category already exists!"
            });
        }

        const categoryId = await Category.createCategory(name);
        res.status(201).json({
            success: true,
            message: "Category added successfully!",
            data: { id: categoryId, name: name }
        });
    } catch (error) {
        console.error('Error adding category:', error);
        res.status(500).json({
            success: false,
            message: "Internal Server Error",
            error: error.message
        });
    }
};

exports.getCategories = async (req, res) => {
    try {
        const categories = await Category.getAllCategory();
        res.status(200).json({
            success: true,
            data: categories
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: "Error fetching categories",
            error: error.message
        });
    }
};

exports.updateCategory = async (req, res) => {
    try {
        const { id } = req.params;
        const { name } = req.body;

        if (!name) {
            return res.status(400).json({
                success: false,
                message: "Category name is required"
            });
        }

        // Check if category name already exists (excluding current category)
        const [existingCategory] = await db.execute(
            "SELECT idcategory FROM category WHERE name = ? AND idcategory != ?",
            [name.trim(), id]
        );

        if (existingCategory.length > 0) {
            return res.status(400).json({
                success: false,
                message: "This category already exists!"
            });
        }

        const result = await Category.updateCategory(id, name);
        if (result.affectedRows === 0) {
            return res.status(404).json({
                success: false,
                message: "Category not found"
            });
        }

        res.status(200).json({
            success: true,
            message: "Category updated successfully",
            data: { id, name }
        });
    } catch (error) {
        console.error('Error updating category:', error);
        res.status(500).json({
            success: false,
            message: "Internal Server Error",
            error: error.message
        });
    }
};

exports.deleteCategory = async (req, res) => {
    try {
        const { id } = req.params;

        await Category.deleteCategory(id);
        res.status(200).json({
            success: true,
            message: "Category deleted successfully!"
        });
    } catch (error) {
        if (error.message === "CANNOT_DELETE_USED_CATEGORY") {
            return res.status(400).json({
                success: false,
                message: "This category is already assigned to products and cannot be deleted."
            });
        }
        
        res.status(500).json({
            success: false,
            message: "Error deleting category",
            error: error.message
        });
    }
};