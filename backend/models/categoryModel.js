const db = require("../config/db");

class Category {
  static async createCategory(categoryName) {
    const query = `INSERT INTO category (name) VALUES (?)`;
    const [result] = await db.execute(query, [categoryName]);
    return result.insertId;
  }

  static async getAllCategory() {
    const query = `SELECT idcategory AS id, name, DATE_FORMAT(created_at, '%Y-%m-%d') AS created_at FROM category ORDER BY name ASC`;
    const [rows] = await db.execute(query);
    return rows;
  }

  static async updateCategory(id, name) {
    const query = `UPDATE category SET name = ? WHERE idcategory = ?`;
    const [result] = await db.execute(query, [name, id]);
    return result;
  }

  static async deleteCategory(id) {
    const checkQuery = `SELECT 1 FROM product WHERE category_id = ? LIMIT 1`;
    const [rows] = await db.execute(checkQuery, [id]);

    if (rows.length > 0) {
      throw new Error("CANNOT_DELETE_USED_CATEGORY");
    }

    const deleteQuery = `DELETE FROM category WHERE idcategory = ?`;
    return await db.execute(deleteQuery, [id]);
  }
}

module.exports = Category;