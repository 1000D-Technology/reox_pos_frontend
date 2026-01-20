const db = require("../config/db");

class Stock {
    /**
     * @desc Get ALL stock data with individual variation rows (not grouped)
     */
    static async getAllStockWithVariations() {
        const query = `
            SELECT 
                s.id AS stock_id,
                s.product_variations_id,
                s.batch_id,
                s.qty,
                s.cost_price,
                s.mrp,
                s.rsp AS selling_price,
                s.mfd,
                s.exp,
                p.id AS product_id,
                p.product_name,
                p.product_code,
                pv.barcode,
                pv.color,
                pv.size,
                pv.storage_capacity,
                CONCAT(p.product_name, 
                       IF(pv.color IS NOT NULL AND pv.color != '', CONCAT(' - ', pv.color), ''), 
                       IF(pv.size IS NOT NULL AND pv.size != '', CONCAT(' - ', pv.size), ''),
                       IF(pv.storage_capacity IS NOT NULL AND pv.storage_capacity != '', CONCAT(' - ', pv.storage_capacity), '')
                ) AS full_product_name,
                u.name AS unit,
                c.name AS category,
                b.name AS brand,
                bat.batch_name,
                sup.supplier_name AS supplier,
                ps.status_name AS product_status
            FROM stock s
            INNER JOIN product_variations pv ON s.product_variations_id = pv.id
            INNER JOIN product p ON pv.product_id = p.id
            INNER JOIN unit_id u ON p.unit_id = u.idunit_id
            LEFT JOIN category c ON p.category_id = c.idcategory
            LEFT JOIN brand b ON p.brand_id = b.idbrand
            LEFT JOIN batch bat ON s.batch_id = bat.id
            LEFT JOIN product_status ps ON pv.product_status_id = ps.idproduct_status
            LEFT JOIN grn_items gi ON s.id = gi.stock_id
            LEFT JOIN grn g ON gi.grn_id = g.id
            LEFT JOIN supplier sup ON g.supplier_id = sup.id
            ORDER BY p.product_name ASC, pv.id ASC, s.id ASC
        `;
        const [rows] = await db.execute(query);
        return rows;
    }

    /**
     * @desc Get all current stock with product and supplier details (grouped by product)
     */
    static async getAllStock() {
        const query = `
            SELECT 
                p.id AS product_id,
                p.product_name AS product_name,
                u.name AS unit,
                AVG(s.cost_price) AS cost_price,
                AVG(s.mrp) AS mrp,
                AVG(s.rsp) AS selling_price,
                GROUP_CONCAT(DISTINCT sup.supplier_name SEPARATOR ', ') AS supplier,
                SUM(s.qty) AS stock_qty
            FROM stock s
            INNER JOIN product_variations pv ON s.product_variations_id = pv.id
            INNER JOIN product p ON pv.product_id = p.id
            INNER JOIN unit_id u ON p.unit_id = u.idunit_id
            LEFT JOIN grn_items gi ON s.id = gi.stock_id
            LEFT JOIN grn g ON gi.grn_id = g.id
            LEFT JOIN supplier sup ON g.supplier_id = sup.id
            WHERE s.qty > 0
            GROUP BY p.id, p.product_name, u.name
            ORDER BY p.product_name ASC
        `;
        const [rows] = await db.execute(query);
        return rows;
    }

    static async searchStock(filters) {
        let query = `
        SELECT 
            p.id AS product_id,
            p.product_name AS product_name,
            u.name AS unit,
            AVG(s.cost_price) AS cost_price,
            AVG(s.mrp) AS mrp,
            AVG(s.rsp) AS selling_price,
            GROUP_CONCAT(DISTINCT sup.supplier_name SEPARATOR ', ') AS supplier,
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
            query += ` AND (p.product_name LIKE ? OR p.id = ?)`;
            queryParams.push(`%${filters.searchQuery}%`, filters.searchQuery);
        }

        query += ` GROUP BY p.id, p.product_name, u.name
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
            p.id AS product_id,
            p.product_name AS product_name,
            u.name AS unit,
            AVG(s.cost_price) AS cost_price,
            AVG(s.mrp) AS mrp,
            AVG(s.rsp) AS selling_price,
            GROUP_CONCAT(DISTINCT sup.supplier_name SEPARATOR ', ') AS supplier,
            SUM(s.qty) AS stock_qty
        FROM stock s
        INNER JOIN product_variations pv ON s.product_variations_id = pv.id
        INNER JOIN product p ON pv.product_id = p.id
        INNER JOIN unit_id u ON p.unit_id = u.idunit_id
        LEFT JOIN grn_items gi ON s.id = gi.stock_id
        LEFT JOIN grn g ON gi.grn_id = g.id
        LEFT JOIN supplier sup ON g.supplier_id = sup.id
        WHERE s.qty = 0
        GROUP BY p.id, p.product_name, u.name
        ORDER BY p.product_name ASC
    `;
    const [rows] = await db.execute(query);
    return rows;
}

    static async searchOutOfStock(filters) {
    let query = `
        SELECT 
            p.id AS product_id,
            p.product_name AS product_name,
            u.name AS unit,
            AVG(s.cost_price) AS cost_price,
            AVG(s.mrp) AS mrp,
            AVG(s.rsp) AS selling_price,
            GROUP_CONCAT(DISTINCT sup.supplier_name SEPARATOR ', ') AS supplier,
            SUM(s.qty) AS stock_qty,
            MAX(s.mfd) AS manufacture_date
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

    // Filter by Product Name or Product ID
    if (filters.searchQuery) {
        query += ` AND (p.product_name LIKE ? OR p.id = ?)`;
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
        GROUP BY p.id, p.product_name, u.name
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

// Get all stock items where quantity is less than 15
    static async getLowStockRecords() {
        const query = `
            SELECT 
                p.product_code AS product_id_code,
                p.product_name,
                u.name AS unit,
                s.qty AS available_qty,
                s.cost_price,
                s.mrp,
                s.rsp AS selling_price,
                sup.supplier_name AS supplier
            FROM stock s
            INNER JOIN product_variations pv ON s.product_variations_id = pv.id
            INNER JOIN product p ON pv.product_id = p.id
            INNER JOIN unit_id u ON p.unit_id = u.idunit_id
            -- English Comment: Joining through grn to get the supplier name
            INNER JOIN grn_items gi ON s.id = gi.stock_id
            INNER JOIN grn g ON gi.grn_id = g.id
            INNER JOIN supplier sup ON g.supplier_id = sup.id
            WHERE s.qty < 15 AND s.qty >= 0
            ORDER BY s.qty ASC
        `;
        const [rows] = await db.execute(query);
        return rows;
    }

    //  Search low stock records based on provided filter IDs
    static async searchLowStock(filters) {
        let query = `
            SELECT 
                p.product_code AS product_id_code,
                p.product_name,
                u.name AS unit,
                s.qty AS available_qty,
                s.cost_price,
                s.mrp,
                s.rsp AS selling_price,
                sup.supplier_name AS supplier
            FROM stock s
            INNER JOIN product_variations pv ON s.product_variations_id = pv.id
            INNER JOIN product p ON pv.product_id = p.id
            INNER JOIN unit_id u ON p.unit_id = u.idunit_id
            INNER JOIN grn_items gi ON s.id = gi.stock_id
            INNER JOIN grn g ON gi.grn_id = g.id
            INNER JOIN supplier sup ON g.supplier_id = sup.id
            WHERE s.qty < 15 AND s.qty >= 0 -- Base condition for low stock
        `;

        const queryParams = [];

        // Filter by Supplier ID if provided
        if (filters.supplier_id) {
            query += ` AND g.supplier_id = ?`;
            queryParams.push(filters.supplier_id);
        }

        //  Filter by Category ID if provided
        if (filters.category_id) {
            query += ` AND p.category_id = ?`;
            queryParams.push(filters.category_id);
        }

        // : Filter by Unit ID if provided
        if (filters.unit_id) {
            query += ` AND p.unit_id = ?`;
            queryParams.push(filters.unit_id);
        }

        //  Filter by specific Product ID if provided
        if (filters.product_id) {
            query += ` AND p.id = ?`;
            queryParams.push(filters.product_id);
        }

        query += ` ORDER BY s.qty ASC`;

        const [rows] = await db.execute(query, queryParams);
        return rows;
    }

    // Get summary data for Out of Stock dashboard
    static async getOutOfStockSummary() {
        const query = `
            SELECT 
                -- 1. Total unique products that are currently out of stock
                COUNT(DISTINCT s.product_variations_id) AS total_out_of_stock_products,

                -- 2. Count of unique suppliers affected by zero stock items
                COUNT(DISTINCT g.supplier_id) AS affected_suppliers,

                -- 3. Average days since stock reached zero (assuming we track when qty became 0)
                -- Note: If you don't have a 'stock_out_date', we use a default or simplified logic.
                -- Here we calculate based on the last updated time of zero stock.
                ROUND(AVG(DATEDIFF(CURDATE(), s.mfd)), 1) AS avg_days_out 
            FROM stock s
            INNER JOIN grn_items gi ON s.id = gi.stock_id
            INNER JOIN grn g ON gi.grn_id = g.id
            WHERE s.qty <= 0
        `;
        
        const [rows] = await db.execute(query);
        return rows[0];
    }

    static async getLowStockSummary() {
        const query = `
            SELECT 
                -- 1. Total number of batches/records that are low in stock
                COUNT(s.id) AS low_stock_items_count,

                -- 2. Unique products affected by low stock
                COUNT(DISTINCT pv.product_id) AS total_products_count,

                -- 3. Potential Value/Loss (Sum of remaining qty * cost price)
                SUM(s.qty * s.cost_price) AS potential_loss_value,

                -- 4. Count of items specifically below a critical threshold (e.g., 5 units)
                COUNT(CASE WHEN s.qty <= 5 THEN s.id END) AS below_threshold_count,

                -- 5. Number of unique products that need reordering
                COUNT(DISTINCT CASE WHEN s.qty < 10 THEN pv.product_id END) AS reorder_required_count
            FROM stock s
            INNER JOIN product_variations pv ON s.product_variations_id = pv.id
            WHERE s.qty < 15 AND s.qty > 0
        `;
        
        const [rows] = await db.execute(query);
        return rows[0];
    }
}

module.exports = Stock;