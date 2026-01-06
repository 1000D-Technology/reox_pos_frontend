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

  static async getProductsByStatus(statusId = 1) {
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
            WHERE pv.product_status_id = ?
            ORDER BY p.created_at DESC, pv.id DESC
        `;
    const [rows] = await db.execute(query, [statusId]);
    return rows;
  }
  
  static async getProductsForDropdown(statusId = 1) {
    const query = `
            SELECT DISTINCT
            p.id,
            p.product_name,
            p.product_code
            FROM product p
            JOIN product_variations pv ON p.id = pv.product_id
            WHERE pv.product_status_id = ?
            ORDER BY p.product_name ASC
        `;
    const [rows] = await db.execute(query, [statusId]);
    return rows;
  }
  
  static async getProductVariantsByProductId(productId) {
    const query = `
            SELECT 
            pv.id,
            pv.product_id,
            pv.barcode,
            pv.color,
            pv.size,
            pv.storage_capacity
            FROM product_variations pv
            WHERE pv.product_id = ? AND pv.product_status_id = 1
            ORDER BY pv.id ASC
        `;
    const [rows] = await db.execute(query, [productId]);
    
    // Add variant_name after fetching to avoid CONCAT issues
    const processedRows = rows.map(row => ({
        ...row,
        variant_name: `${row.color || 'Default'} - ${row.size || 'Default'} - ${row.storage_capacity || 'N/A'}`
    }));
    
    return processedRows;
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

  //search product type or name / ID with status filter
  static async searchProducts(filter, statusId = 1) {
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
        WHERE pv.product_status_id = ?
    `;

    const params = [statusId];

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

module.exports = Product;
