const db = require("../config/db");

class Unit {
    /**
     * @desc Create a new unit
     */
    static async createUnit(unitName) {
        const query = `INSERT INTO unit_id (name) VALUES (?)`;
        const [result] = await db.execute(query, [unitName]);
        return result.insertId;
    }

    /**
     * @desc Get all units ordered by name
     */
    static async getAllUnits() {
        const query = `SELECT idunit_id AS id, name, created_at FROM unit_id ORDER BY created_at DESC`;
        const [rows] = await db.execute(query);
        return rows;
    }

    /**
     * @desc Search units by name
     */
    static async searchUnits(searchTerm) {
        const query = "SELECT idunit_id AS id, name, created_at FROM unit_id WHERE name LIKE ? LIMIT 100";
        const [rows] = await db.execute(query, [`%${searchTerm}%`]);
        return rows;
    }

    /**
     * @desc Check if a unit name exists (for duplicates)
     */
    static async checkNameExists(name, excludeId = null) {
        let query = "SELECT idunit_id FROM unit_id WHERE name = ?";
        let params = [name.trim()];

        if (excludeId) {
            query += " AND idunit_id != ?";
            params.push(excludeId);
        }

        const [rows] = await db.execute(query, params);
        return rows.length > 0;
    }

    static async getIdByName(name) {
        const query = "SELECT idunit_id FROM unit_id WHERE name = ?";
        const [rows] = await db.execute(query, [name.trim()]);
        return rows.length > 0 ? rows[0].idunit_id : null;
    }

    /**
     * @desc Update unit name by ID
     */
    static async updateUnit(id, name) {
        const query = `UPDATE unit_id SET name = ? WHERE idunit_id = ?`;
        const [result] = await db.execute(query, [name, id]);
        return result;
    }

    /**
     * @desc Check if unit is linked to products before deletion
     */
    static async isUnitUsed(id) {
        const query = `SELECT 1 FROM product WHERE unit_id = ? LIMIT 1`;
        const [rows] = await db.execute(query, [id]);
        return rows.length > 0;
    }

    /**
     * @desc Delete unit by ID
     */
    static async deleteUnit(id) {
        const query = `DELETE FROM unit_id WHERE idunit_id = ?`;
        return await db.execute(query, [id]);
    }
}

module.exports = Unit;