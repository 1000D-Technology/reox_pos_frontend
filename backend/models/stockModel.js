const db = require("../config/db");

class Stock {
    /**
     * @desc Get all current stock with product and supplier details
     */
    static async getAllStock() {
        const query = `
        SELECT 
            pv.id AS variation_id,
            CONCAT(p.product_name, 
                   IF(pv.color IS NOT NULL AND pv.color != '', CONCAT(' - ', pv.color), ''), 
                   IF(pv.size IS NOT NULL AND pv.size != '', CONCAT(' - ', pv.size), '')
            ) AS full_product_name,
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
        GROUP BY 
            pv.id, p.product_name, pv.color, pv.size, u.name, 
            s.cost_price, s.mrp, s.rsp, sup.supplier_name
        ORDER BY p.product_name ASC
    `;
        const [rows] = await db.execute(query);
        return rows;
    }

    static async searchStock(filters) {
        let query = `
        SELECT 
            pv.id AS variation_id,
            CONCAT(p.product_name, 
                   IF(pv.color IS NOT NULL AND pv.color != '', CONCAT(' - ', pv.color), ''), 
                   IF(pv.size IS NOT NULL AND pv.size != '', CONCAT(' - ', pv.size), '')
            ) AS full_product_name,
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
    `;

        const queryParams = [];

        if (filters.category) {
            query += ` AND p.category_id = ?`;
            queryParams.push(filters.category);
        }
        if (filters.unit) {
            query += ` AND p.unit_id = ?`;
            queryParams.push(filters.unit);
        }
        if (filters.supplier) {
            query += ` AND g.supplier_id = ?`;
            queryParams.push(filters.supplier);
        }
        if (filters.searchQuery) {
            query += ` AND (p.product_name LIKE ? OR pv.id = ?)`;
            queryParams.push(`%${filters.searchQuery}%`, filters.searchQuery);
        }

        query += ` GROUP BY 
                pv.id, p.product_name, pv.color, pv.size, u.name, 
                s.cost_price, s.mrp, s.rsp, sup.supplier_name
               ORDER BY p.product_name ASC`;

        const [rows] = await db.execute(query, queryParams);
        return rows;
    }

    static async getDashboardSummary() {
        const queries = {
            // 1. Total Active Products count (based on product_status in variations)
            totalProducts: `
                SELECT COUNT(DISTINCT product_id) as count 
                FROM product_variations 
                WHERE product_status_id = 1`,

            // 2. Total Stock Value for the current month (based on stock cost_price)
            totalValue: `
                SELECT SUM(cost_price * qty) as total 
                FROM stock 
                WHERE MONTH(mfd) = MONTH(CURRENT_DATE()) 
                AND YEAR(mfd) = YEAR(CURRENT_DATE())`,

            // 3. Low Stock Items count (qty < 5 and status active)
            lowStock: `
                SELECT COUNT(*) as count 
                FROM stock s
                JOIN product_variations pv ON s.product_variations_id = pv.id
                WHERE s.qty < 5 AND pv.product_status_id = 1`,

            // 4. Total Active Suppliers count
            totalSuppliers: `SELECT COUNT(*) as count FROM supplier WHERE status_id = 1`,

            // 5. Total Categories count
            totalCategories: `SELECT COUNT(*) as count FROM category`
        };

        const [products] = await db.execute(queries.totalProducts);
        const [value] = await db.execute(queries.totalValue);
        const [lowStock] = await db.execute(queries.lowStock);
        const [suppliers] = await db.execute(queries.totalSuppliers);
        const [categories] = await db.execute(queries.totalCategories);

        return {
            totalProducts: products[0].count || 0,
            totalValue: value[0].total || 0,
            lowStock: lowStock[0].count || 0,
            totalSuppliers: suppliers[0].count || 0,
            totalCategories: categories[0].count || 0
        };
    }

    static async getOutOfStock() {
    const query = `
        SELECT 
            pv.id AS variation_id,
            CONCAT(p.product_name, 
                   IF(pv.color IS NOT NULL AND pv.color != '', CONCAT(' - ', pv.color), ''), 
                   IF(pv.size IS NOT NULL AND pv.size != '', CONCAT(' - ', pv.size), '')
            ) AS full_product_name,
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
        WHERE s.qty = 0
        GROUP BY 
            pv.id, p.product_name, pv.color, pv.size, u.name, 
            s.cost_price, s.mrp, s.rsp, sup.supplier_name
        ORDER BY p.product_name ASC
    `;
    const [rows] = await db.execute(query);
    return rows;
}

    static async searchOutOfStock(filters) {
    let query = `
        SELECT 
            pv.id AS variation_id,
            CONCAT(p.product_name, 
                   IF(pv.color IS NOT NULL AND pv.color != '', CONCAT(' - ', pv.color), ''), 
                   IF(pv.size IS NOT NULL AND pv.size != '', CONCAT(' - ', pv.size), '')
            ) AS full_product_name,
            u.name AS unit,
            s.cost_price,
            s.mrp,
            s.rsp AS selling_price,
            sup.supplier_name AS supplier,
            SUM(s.qty) AS stock_qty,
            s.mfd AS manufacture_date
        FROM stock s
        INNER JOIN product_variations pv ON s.product_variations_id = pv.id
        INNER JOIN product p ON pv.product_id = p.id
        INNER JOIN unit_id u ON p.unit_id = u.idunit_id
        LEFT JOIN grn_items gi ON s.id = gi.stock_id
        LEFT JOIN grn g ON gi.grn_id = g.id
        LEFT JOIN supplier sup ON g.supplier_id = sup.id
        WHERE s.qty = 0
    `;

    const queryParams = [];

    // Filter by Product Name or Variation ID
    if (filters.searchQuery) {
        query += ` AND (p.product_name LIKE ? OR pv.id = ?)`;
        queryParams.push(`%${filters.searchQuery}%`, filters.searchQuery);
    }

    if (filters.category) {
        query += ` AND p.category_id = ?`;
        queryParams.push(filters.category);
    }

    if (filters.supplier) {
        query += ` AND g.supplier_id = ?`;
        queryParams.push(filters.supplier);
    }

    if (filters.fromDate && filters.toDate) {
        query += ` AND s.mfd BETWEEN ? AND ?`;
        queryParams.push(filters.fromDate, filters.toDate);
    }

    query += `
        GROUP BY pv.id, p.product_name, pv.color, pv.size, u.name, s.cost_price, s.mrp, s.rsp, sup.supplier_name, s.mfd
        ORDER BY p.product_name ASC
    `;

    const [rows] = await db.execute(query, queryParams);
    return rows;
}

static async getStockByProductVariation(productId) {
    const query = `SELECT 
            s.id AS stock_id,
            CONCAT(p.product_name, 
                   IF(pv.color IS NOT NULL AND pv.color != '', CONCAT(' - ', pv.color), ''), 
                   IF(pv.size IS NOT NULL AND pv.size != '', CONCAT(' - ', pv.size), ''),
                   ' (', b.batch_name, ')'
            ) AS full_stock_display,
            s.qty AS available_qty,
            s.rsp AS selling_price
        FROM stock s
        INNER JOIN product_variations pv ON s.product_variations_id = pv.id
        INNER JOIN product p ON pv.product_id = p.id
        INNER JOIN batch b ON s.batch_id = b.id
        WHERE p.id = ? AND s.qty > 0 
        ORDER BY pv.id ASC, b.date_time DESC
    `;
    const [rows] = await db.execute(query, [productId]);
    return rows;
}
}

module.exports = Stock;