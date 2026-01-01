const db = require("../config/db");

class Product {
  static async checkIdExists(tableName, idColumn, idValue) {
    const [rows] = await db.execute(
      `SELECT 1 FROM ${tableName} WHERE ${idColumn} = ? LIMIT 1`,
      [idValue]
    );
    return rows.length > 0;
  }

  static async create(productData, variations) {
    const connection = await db.getConnection();
    try {
      await connection.beginTransaction();

      const [prodductResult] = await connection.execute(
        `INSERT INTO product (product_name, product_code, category_id, brand_id, unit_id, product_type_id) 
                 VALUES (?, ?, ?, ?, ?, ?)`,
        [
          productData.name,
          productData.code,
          productData.categoryId,
          productData.brandId,
          productData.unitId,
          productData.typeId,
        ]
      );

      const productId = prodductResult.insertId;

      for (let variant of variations) {
        await connection.execute(
          `INSERT INTO product_variations (product_id, barcode, color, size, storage_capacity, product_status_id) 
                     VALUES (?, ?, ?, ?, ?, ?)`,
          [
            productId,
            variant.barcode,
            variant.color,
            variant.size,
            variant.capacity,
            variant.statusId,
          ]
        );
      }
      await connection.commit();
      return productId;
    } catch (error) {
      await connection.rollback();
      throw error;
    } finally {
      connection.release();
    }
  }

  static async getAllProducts() {
    const query = `
            SELECT 
            pv.id AS productID,
            p.product_name AS productName,
            p.product_code AS productCode,
            pv.barcode AS barcode,
            c.name AS category,
            b.name AS brand,
            u.name AS unit,
            pt.name AS productType,
            pv.color AS color,
            pv.size AS size,
            pv.storage_capacity AS storage,
            DATE_FORMAT(p.created_at, '%Y-%m-%d') AS createdOn
            FROM product p
            JOIN product_variations pv ON p.id = pv.product_id
            LEFT JOIN category c ON p.category_id = c.idcategory
            LEFT JOIN brand b ON p.brand_id = b.idbrand
            LEFT JOIN unit_id u ON p.unit_id = u.idunit_id
            LEFT JOIN product_type pt ON p.product_type_id = pt.idproduct_type
            WHERE pv.product_status_id = 1
            ORDER BY p.created_at DESC, pv.id DESC
        `;
    const [rows] = await db.execute(query);
    return rows;
  }

  static async updateProductVariation(pvID, productData, variationData) {
    const connection = await db.getConnection();
    try {
      await connection.beginTransaction();
      const [varRow] = await connection.execute(
        "SELECT product_id FROM product_variations WHERE id = ?",
        [pvID]
      ); //id

      if (varRow.length === 0) {
        throw new Error("Product variation not found");
      }
      const productId = varRow[0].product_id;

      await connection.execute(
        `UPDATE product SET 
                    product_name = ?, product_code = ?, category_id = ?, 
                    brand_id = ?, unit_id = ?, product_type_id = ? 
                 WHERE id = ?`,
        [
          productData.name,
          productData.code,
          productData.categoryId,
          productData.brandId,
          productData.unitId,
          productData.typeId,
          productId,
        ]
      );
      await connection.execute(
        `UPDATE product_variations SET 
                    barcode = ?, color = ?, size = ?, storage_capacity = ?, product_status_id = ?
                 WHERE id = ?`,
        [
          variationData.barcode,
          variationData.color,
          variationData.size,
          variationData.storage,
          variationData.statusId || 1,
          pvID,
        ]
      );
      await connection.commit();
      return true;
    } catch (error) {
      await connection.rollback();
      throw error;
    } finally {
      connection.release();
    }
  }

  //search product type or name / ID
  static async searchProducts(filter) {
    let query = `
        SELECT 
            pv.id AS productID,
            p.product_name AS productName,
            p.product_code AS productCode,
            pv.barcode AS barcode,
            c.name AS category,
            b.name AS brand,
            u.name AS unit,
            pt.name AS productType,
            pv.color AS color,
            pv.size AS size,
            pv.storage_capacity AS storage,
            DATE_FORMAT(p.created_at, '%Y-%m-%d') AS createdOn
        FROM product p
        JOIN product_variations pv ON p.id = pv.product_id
        LEFT JOIN category c ON p.category_id = c.idcategory
        LEFT JOIN brand b ON p.brand_id = b.idbrand
        LEFT JOIN unit_id u ON p.unit_id = u.idunit_id
        LEFT JOIN product_type pt ON p.product_type_id = pt.idproduct_type
        WHERE pv.product_status_id = 1
    `;

    const params = [];

    //search by product type
    if (filter.productTypeId) {
      query += ` AND p.product_type_id = ? `;
      params.push(filter.productTypeId);
    }

    //search by product name or ID / pv.id
    if (filter.searchTerm) {
      query += ` AND (p.product_name LIKE ? OR pv.id = ? OR p.product_code LIKE ? OR pv.barcode LIKE ?)`;
      const searchVal = `%${filter.searchTerm}%`;
      params.push(searchVal, filter.searchTerm, searchVal, searchVal);
    }

    query += ` ORDER BY p.created_at DESC, pv.id DESC `;
    const [rows] = await db.execute(query, params);
    return rows;

  }

  static async updateProductStatus(pvId, statusId) {
    const query = `UPDATE product_variations SET product_status_id = ? WHERE id = ?`;
    const [result] = await db.execute(query, [statusId, pvId]);
    return result;
  }



}

module.exports = Product;
