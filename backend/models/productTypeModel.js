const db = require("../config/db");

class ProductType {
    /**
     * @desc Create a new product type
     */
    static async createProductType(productTypeName) {
        const query = `INSERT INTO product_type (name) VALUES (?)`;
        const [result] = await db.execute(query, [productTypeName]);
        return result.insertId;
    }

    /**
     * @desc Get all product types ordered by name
     */
    static async getAllProductTypes() {
        const query = `SELECT idproduct_type AS id, name, DATE_FORMAT(created_at, '%Y-%m-%d') AS created_at FROM product_type ORDER BY created_at DESC`;
        const [rows] = await db.execute(query);
        return rows;
    }

    /**
     * @desc Search product types by name
     */
    static async searchProductTypes(searchTerm) {
        const query = "SELECT idproduct_type AS id, name FROM product_type WHERE name LIKE ? LIMIT 100";
        const [rows] = await db.execute(query, [`%${searchTerm}%`]);
        return rows;
    }

    /**
     * @desc Check if a product type name already exists (for duplicates)
     */
    static async checkNameExists(name, excludeId = null) {
        let query = "SELECT idproduct_type FROM product_type WHERE name = ?";
        let params = [name.trim()];

        if (excludeId) {
            query += " AND idproduct_type != ?";
            params.push(excludeId);
        }

        const [rows] = await db.execute(query, params);
        return rows.length > 0;
    }

    /**
     * @desc Update product type name
     */
    static async updateProductType(id, name) {
        const query = `UPDATE product_type SET name = ? WHERE idproduct_type = ?`;
        const [result] = await db.execute(query, [name, id]);
        return result;
    }

    /**
     * @desc Check if product type is being used by any product before deletion
     */
    static async isProductTypeUsed(id) {
        const query = `SELECT 1 FROM product WHERE product_type_id = ? LIMIT 1`;
        const [rows] = await db.execute(query, [id]);
        return rows.length > 0;
    }

    /**
     * @desc Delete product type by ID
     */
    static async deleteProductType(id) {
        const query = `DELETE FROM product_type WHERE idproduct_type = ?`;
        return await db.execute(query, [id]);
    }
}

module.exports = ProductType;