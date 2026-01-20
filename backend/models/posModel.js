const db = require("../config/db");

class POS {
    // Get POS products with stock greater than 0
    static async getPOSProducts() {
        const query = `
            SELECT
                s.id AS stockID,
                p.product_name AS productName,
                s.barcode AS barcode,
                pv.barcode AS pvBarcode,
                u.name AS unit,
                s.rsp AS price,
                IFNULL(s.wsp, '') AS wholesalePrice,
                s.qty AS currentStock,
                b.batch_name AS batchName,
                p.product_code AS productCode,
                pv.color,
                pv.size,
                pv.storage_capacity,
                DATE_FORMAT(s.exp, '%Y-%m-%d') AS expiry
            FROM stock s
                     JOIN product_variations pv ON s.product_variations_id = pv.id
                     JOIN product p ON pv.product_id = p.id
                     JOIN batch b ON s.batch_id = b.id
                     LEFT JOIN unit_id u ON p.unit_id = u.idunit_id
            WHERE pv.product_status_id = 1
              AND s.qty > 0
            ORDER BY p.product_name ASC, s.mfd ASC
        `;
        const [rows] = await db.execute(query);
        return rows;
    }

    // Search product by barcode (checks both stock and product_variations barcodes)
    static async searchByBarcode(barcode) {
        const query = `
            SELECT
                s.id AS stockID,
                p.product_name AS productName,
                s.barcode AS barcode,
                u.name AS unit,
                s.rsp AS price,
                IFNULL(s.wsp, '') AS wholesalePrice,
                p.product_code AS productCode,
                s.qty AS currentStock,
                b.batch_name AS batchName,
                DATE_FORMAT(s.exp, '%Y-%m-%d') AS expiry,
                pv.color,
                pv.size,
                pv.storage_capacity
            FROM stock s
                     JOIN product_variations pv ON s.product_variations_id = pv.id
                     JOIN product p ON pv.product_id = p.id
                     JOIN batch b ON s.batch_id = b.id
                     LEFT JOIN unit_id u ON p.unit_id = u.idunit_id
            WHERE (s.barcode = ? OR pv.barcode = ?)
              AND pv.product_status_id = 1
              AND s.qty > 0
            ORDER BY s.mfd ASC
                LIMIT 1
        `;
        const [rows] = await db.execute(query, [barcode, barcode]);
        return rows;
    }
}

module.exports = POS;