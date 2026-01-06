const db = require('../config/db');
const Product = require('../models/productModel');

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

exports.searchUnits = async (req, res) => {
    try {
        const query = req.query.q || '';
        const [rows] = await db.execute(
            "SELECT idunit_id AS id, name, created_at FROM unit_id WHERE name LIKE ? LIMIT 100",
            [`%${query}%`]
        );
        res.json({ success: true, data: rows });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

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

//Unit Controllers
exports.addUnit = async (req, res) => {
    try {
        const { name } = req.body;

        if (!name) {
            return res.status(400).json({
                success: false,
                message: "Unit name is required"
            });
        }

        // Check if unit name already exists
        const [existingUnit] = await db.execute(
            "SELECT idunit_id FROM unit_id WHERE name = ?",
            [name.trim()]
        );

        if (existingUnit.length > 0) {
            return res.status(400).json({
                success: false,
                message: "This unit already exists!"
            });
        }

        const unitId = await Product.createUnit(name);

        res.status(201).json({
            success: true,
            message: "Unit added successfully!",
            data: { id: unitId, name: name }
        });
    } catch (error) {
        console.error('Error adding unit:', error);
        res.status(500).json({
            success: false,
            message: "Internal Server Error",
            error: error.message
        });
    }
};


exports.getUnits = async (req, res) => {
    try {
        const units = await Product.getAllUnits();
        res.status(200).json({
            success: true,
            data: units
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: "Error fetching units",
            error: error.message
        });
    }
};

exports.updateUnit = async (req, res) => {
    try {
        const { id } = req.params;
        const { name } = req.body;

        if (!name) {
            return res.status(400).json({
                success: false,
                message: "Unit name is required"
            });
        }

        // Check if unit name already exists (excluding current unit)
        const [existingUnit] = await db.execute(
            "SELECT idunit_id FROM unit_id WHERE name = ? AND idunit_id != ?",
            [name.trim(), id]
        );

        if (existingUnit.length > 0) {
            return res.status(400).json({
                success: false,
                message: "This unit already exists!"
            });
        }

        const result = await Product.updateUnit(id, name);

        if (result.affectedRows === 0) {
            return res.status(404).json({
                success: false,
                message: "Unit not found"
            });
        }

        res.status(200).json({
            success: true,
            message: "Unit updated successfully",
            data: { id, name }
        });
    } catch (error) {
        console.error('Error updating unit:', error);
        res.status(500).json({
            success: false,
            message: "Internal Server Error",
            error: error.message
        });
    }
}

exports.deleteUnit = async (req, res) => {
    try {
        const { id } = req.params;

        await Product.deleteUnit(id);

        res.status(200).json({
            success: true,
            message: "Unit deleted successfully!"
        });
    } catch (error) {
        if (error.message === "CANNOT_DELETE_USED_UNIT") {
            return res.status(400).json({
                success: false,
                message: "This unit is already assigned to products and cannot be deleted."
            });
        }
        
        res.status(500).json({
            success: false,
            message: "Error deleting unit",
            error: error.message
        });
    }
};


//Category Controllers
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

        const categoryId = await Product.createCategory(name);
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
        const categories = await Product.getAllCategory();
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

        const result = await Product.updateCategory(id, name);
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
}

exports.deleteCategory = async (req, res) => {
    try {
        const { id } = req.params;

        await Product.deleteCategory(id);
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

//Brand Controllers
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

        const brandId = await Product.createBrand(name);
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
        const brands = await Product.getAllBrand();
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

        const result = await Product.updateBrand(id, name);
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

        await Product.deleteBrand(id);
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