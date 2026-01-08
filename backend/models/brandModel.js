const db = require("../config/db");

class Brand {
    /**
     * @desc Create a new brand
     */
    static async createBrand(brandName) {
        const query = `INSERT INTO brand (name) VALUES (?)`;
        const [result] = await db.execute(query, [brandName]);
        return result.insertId;
    }

    /**
     * @desc Get all brands ordered by name
     */
    static async getAllBrand() {
        const query = `SELECT idbrand AS id, name, DATE_FORMAT(created_at, '%Y-%m-%d') AS created_at FROM brand ORDER BY created_at DESC`;
        const [rows] = await db.execute(query);
        return rows;
    }

    /**
     * @desc Search brands by name
     */
    static async searchBrands(searchTerm) {
        const query = "SELECT idbrand AS id, name, created_at FROM brand WHERE name LIKE ? LIMIT 100";
        const [rows] = await db.execute(query, [`%${searchTerm}%`]);
        return rows;
    }

    /**
     * @desc Check if a brand name already exists (for duplicates)
     */
    static async checkNameExists(name, excludeId = null) {
        let query = "SELECT idbrand FROM brand WHERE name = ?";
        let params = [name.trim()];

        if (excludeId) {
            query += " AND idbrand != ?";
            params.push(excludeId);
        }

        const [rows] = await db.execute(query, params);
        return rows.length > 0;
    }

    /**
     * @desc Update brand name
     */
    static async updateBrand(id, name) {
        const query = `UPDATE brand SET name = ? WHERE idbrand = ?`;
        const [result] = await db.execute(query, [name, id]);
        return result;
    }

    /**
     * @desc Check if brand is being used by any product
     */
    static async isBrandUsed(id) {
        const query = `SELECT 1 FROM product WHERE brand_id = ? LIMIT 1`;
        const [rows] = await db.execute(query, [id]);
        return rows.length > 0;
    }

    /**
     * @desc Delete brand by ID
     */
    static async deleteBrand(id) {
        const query = `DELETE FROM brand WHERE idbrand = ?`;
        return await db.execute(query, [id]);
    }
}

module.exports = Brand;