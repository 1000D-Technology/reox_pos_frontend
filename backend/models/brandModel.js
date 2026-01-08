const db = require("../config/db");

class Brand{ 
  static async createBrand(brandName) {
    const query = `INSERT INTO brand (name) VALUES (?)`;
    const [result] = await db.execute(query, [brandName]);
    return result.insertId;
  }

  static async getAllBrand() {
    const query = `SELECT idbrand AS id, name, DATE_FORMAT(created_at, '%Y-%m-%d') AS created_at FROM brand ORDER BY name ASC`;
    const [rows] = await db.execute(query);
    return rows;
  }

  static async updateBrand(id, name) {
    const query = `UPDATE brand SET name = ? WHERE idbrand = ?`;
    const [result] = await db.execute(query, [name, id]);
    return result;
  }

  static async deleteBrand(id) {
    const checkQuery = `SELECT 1 FROM product WHERE brand_id = ? LIMIT 1`;
    const [rows] = await db.execute(checkQuery, [id]);

    if (rows.length > 0) {
      throw new Error("CANNOT_DELETE_USED_BRAND");
    }

    const deleteQuery = `DELETE FROM brand WHERE idbrand = ?`;
    return await db.execute(deleteQuery, [id]);
  }
}

module.exports = Brand;