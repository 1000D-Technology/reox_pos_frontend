const db = require('../config/db');

exports.searchCategories = async (req, res) => {
    try {
        const query = req.query.q || '';
        const [rows] = await db.execute(
            "SELECT idcategory AS id, name FROM category WHERE name LIKE ? LIMIT 10",
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
            "SELECT idbrand AS id, name FROM brand WHERE name LIKE ? LIMIT 10",
            [`%${query}%`]
        );
        res.json({ success: true, data: rows });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

exports.getUnits = async (req, res) => {
    try {
        const [rows] = await db.execute("SELECT idunit_id AS id, name FROM unit_id");
        res.json({ success: true, data: rows });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

exports.searchProductTypes = async (req, res) => {
    try {
        const query = req.query.q || '';
        const [rows] = await db.execute(
            "SELECT idproduct_type AS id, name FROM product_type WHERE name LIKE ? LIMIT 10",
            [`%${query}%`]
        );
        res.json({ success: true, data: rows });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};