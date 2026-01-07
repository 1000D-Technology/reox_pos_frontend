const db = require('../config/db');
const Unit = require('../models/unitModel');

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

        const unitId = await Unit.createUnit(name);

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
        const units = await Unit.getAllUnits();
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

        const result = await Unit.updateUnit(id, name);

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
};

exports.deleteUnit = async (req, res) => {
    try {
        const { id } = req.params;

        await Unit.deleteUnit(id);

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