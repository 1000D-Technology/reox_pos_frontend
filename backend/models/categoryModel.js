const db = require("../config/db");

class Category {
    /**
     * @desc Create a new category
     */
    static async createCategory(categoryName) {
        const query = `INSERT INTO category (name) VALUES (?)`;
        const [result] = await db.execute(query, [categoryName]);
        return result.insertId;
    }

    /**
     * @desc Get all categories ordered by name
     */
    static async getAllCategory() {
        const query = `SELECT idcategory AS id, name, DATE_FORMAT(created_at, '%Y-%m-%d') AS created_at FROM category ORDER BY created_at DESC`;
        const [rows] = await db.execute(query);
        return rows;
    }

    /**
     * @desc Search categories by name
     */
    static async searchCategories(searchTerm) {
        const query = "SELECT idcategory AS id, name, created_at FROM category WHERE name LIKE ? LIMIT 100";
        const [rows] = await db.execute(query, [`%${searchTerm}%`]);
        return rows;
    }

    /**
     * @desc Check if a category name already exists
     */
    static async checkNameExists(name, excludeId = null) {
        let query = "SELECT idcategory FROM category WHERE name = ?";
        let params = [name.trim()];

        if (excludeId) {
            query += " AND idcategory != ?";
            params.push(excludeId);
        }

        const [rows] = await db.execute(query, params);
        return rows.length > 0;
    }

    static async getIdByName(name) {
        const query = "SELECT idcategory FROM category WHERE name = ?";
        const [rows] = await db.execute(query, [name.trim()]);
        return rows.length > 0 ? rows[0].idcategory : null;
    }

    /**
     * @desc Update category name
     */
    static async updateCategory(id, name) {
        const query = `UPDATE category SET name = ? WHERE idcategory = ?`;
        const [result] = await db.execute(query, [name, id]);
        return result;
    }

    /**
     * @desc Check if category is being used by any product
     */
    static async isCategoryUsed(id) {
        const query = `SELECT 1 FROM product WHERE category_id = ? LIMIT 1`;
        const [rows] = await db.execute(query, [id]);
        return rows.length > 0;
    }

    /**
     * @desc Delete category by ID
     */
    static async deleteCategory(id) {
        const query = `DELETE FROM category WHERE idcategory = ?`;
        return await db.execute(query, [id]);
    }
}

module.exports = Category;