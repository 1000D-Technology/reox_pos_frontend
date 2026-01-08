const db = require("../config/db");

class Stock {
    /**
     * @desc Get all current stock with product and supplier details
     */
    static async getAllStock() {
        const query = `
            SELECT 
                p.id AS product_id,
                p.product_name AS product_name,
                u.name AS unit,
                s.cost_price,
                s.mrp,
                s.rsp AS selling_price,
                sup.supplier_name AS supplier,
                SUM(s.qty) AS stock_qty
            FROM stock s
            INNER JOIN product_variations pv ON s.product_variations_id = pv.id
            INNER JOIN product p ON pv.product_id = p.id
            INNER JOIN unit_id u ON p.unit_id = u.idunit_id
            LEFT JOIN grn_items gi ON s.id = gi.stock_id
            LEFT JOIN grn g ON gi.grn_id = g.id
            LEFT JOIN supplier sup ON g.supplier_id = sup.id
            WHERE s.qty > 0
            GROUP BY p.id, p.product_name, u.name, s.cost_price, s.mrp, s.rsp, sup.supplier_name
            ORDER BY p.product_name ASC
        `;
        const [rows] = await db.execute(query);
        return rows;
    }
}

module.exports = Stock;