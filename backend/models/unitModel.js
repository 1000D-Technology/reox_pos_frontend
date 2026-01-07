const db = require("../config/db");

class Unit {
  static async createUnit(unitName) {
    const query = `INSERT INTO unit_id (name) VALUES (?)`;
    const [result] = await db.execute(query, [unitName]);
    return result.insertId;
  }

  static async getAllUnits() {
    const query = `SELECT idunit_id AS id, name, created_at FROM unit_id ORDER BY name ASC`;
    const [rows] = await db.execute(query);
    return rows;
  }

  static async updateUnit(id, name) {
    const query = `UPDATE unit_id SET name = ? WHERE idunit_id = ?`;
    const [result] = await db.execute(query, [name, id]);
    return result;
  }

  static async deleteUnit(id) {
    const checkQuery = `SELECT 1 FROM product WHERE unit_id = ? LIMIT 1`;
    const [rows] = await db.execute(checkQuery, [id]);

    if (rows.length > 0) {
      throw new Error("CANNOT_DELETE_USED_UNIT");
    }

    const deleteQuery = `DELETE FROM unit_id WHERE idunit_id = ?`;
    return await db.execute(deleteQuery, [id]);
  }
}

module.exports = Unit;