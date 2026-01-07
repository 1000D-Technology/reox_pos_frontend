const db = require("../config/db");

class ProductType {
  static async createProductType(productTypeName) {
    const query = `INSERT INTO product_type (name) VALUES (?)`;
    const [result] = await db.execute(query, [productTypeName]);
    return result.insertId;
  }

  static async getAllProductTypes() {
    const query = `SELECT idproduct_type AS id, name, DATE_FORMAT(created_at, '%Y-%m-%d') AS created_at FROM product_type ORDER BY name ASC`;
    const [rows] = await db.execute(query);
    return rows;
  }

  static async updateProductType(id, name) {
    const query = `UPDATE product_type SET name = ? WHERE idproduct_type = ?`;
    const [result] = await db.execute(query, [name, id]);
    return result;
  }

  static async deleteProductType(id) {
    const checkQuery = `SELECT 1 FROM product WHERE product_type_id = ? LIMIT 1`;
    const [rows] = await db.execute(checkQuery, [id]);

    if (rows.length > 0) {
      throw new Error("CANNOT_DELETE_USED_PRODUCT_TYPE");
    }

    const deleteQuery = `DELETE FROM product_type WHERE idproduct_type = ?`;
    return await db.execute(deleteQuery, [id]);
  }
}

module.exports = ProductType;