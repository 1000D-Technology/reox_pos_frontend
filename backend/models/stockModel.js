const prisma = require("../config/prismaClient");

class Stock {
    /**
     * @desc Get ALL stock data with individual variation rows (not grouped)
     */
    static async getAllStockWithVariations(filters = {}) {
        const whereClause = {};
        
        if (filters.hasStock) {
            whereClause.qty = { gt: 0 };
        }

        const stocks = await prisma.stock.findMany({
            where: whereClause,
            include: {
                product_variations: {
                    include: {
                        product: {
                            include: {
                                unit_id_product_unit_idTounit_id: true,
                                category: true,
                                brand: true
                            }
                        },
                        product_status: true
                    }
                },
                batch: true,
                grn_items: {
                    include: {
                        grn: {
                            include: {
                                supplier: true
                            }
                        }
                    },
                    take: 1
                }
            },
            orderBy: [
                { product_variations: { product: { product_name: 'asc' } } },
                { product_variations: { id: 'asc' } },
                { id: 'asc' }
            ]
        });

        return stocks.map(s => {
            const pv = s.product_variations;
            const p = pv.product;
            const supplier = s.grn_items[0]?.grn?.supplier;

            // Build full product name
            let fullProductName = p.product_name;
            if (pv.color) fullProductName += ` - ${pv.color}`;
            if (pv.size) fullProductName += ` - ${pv.size}`;
            if (pv.storage_capacity) fullProductName += ` - ${pv.storage_capacity}`;

            return {
                stock_id: s.id,
                product_variations_id: s.product_variations_id,
                batch_id: s.batch_id,
                qty: s.qty,
                cost_price: s.cost_price,
                mrp: s.mrp,
                selling_price: s.rsp,
                mfd: s.mfd,
                exp: s.exp,
                product_id: p.id,
                product_name: p.product_name,
                product_code: p.product_code,
                barcode: pv.barcode,
                color: pv.color,
                size: pv.size,
                storage_capacity: pv.storage_capacity,
                full_product_name: fullProductName,
                unit: p.unit_id_product_unit_idTounit_id?.name,
                category: p.category?.name,
                brand: p.brand?.name,
                batch_name: s.batch?.batch_name,
                supplier: supplier?.supplier_name,
                product_status: pv.product_status?.status_name
            };
        });
    }

    /**
     * @desc Get all current stock with product and supplier details (grouped by product)
     */
    static async getAllStock() {
        return this.searchStock({});
    }

    static async searchStock(filters) {
        // Fetch all stocks with relations using Prisma
        const stocks = await prisma.stock.findMany({
            where: {
                qty: { gt: 0 }
            },
            include: {
                product_variations: {
                    include: {
                        product: {
                            include: {
                                unit_id_product_unit_idTounit_id: true,
                                category: true
                            }
                        }
                    }
                },
                grn_items: {
                    include: {
                        grn: {
                            include: {
                                supplier: true
                            }
                        }
                    }
                }
            }
        });

        let filteredStocks = stocks;

        if (filters.category) {
            filteredStocks = filteredStocks.filter(s =>
                s.product_variations.product.category_id === parseInt(filters.category)
            );
        }

        if (filters.unit) {
            filteredStocks = filteredStocks.filter(s =>
                s.product_variations.product.unit_id === parseInt(filters.unit)
            );
        }

        if (filters.supplier) {
            filteredStocks = filteredStocks.filter(s =>
                s.grn_items.some(gi => gi.grn?.supplier_id === parseInt(filters.supplier))
            );
        }

        if (filters.searchQuery) {
            const query = filters.searchQuery.toLowerCase();
            filteredStocks = filteredStocks.filter(s => {
                const product = s.product_variations.product;
                const barcode = s.barcode || '';
                return product.product_name.toLowerCase().includes(query) ||
                    product.id.toString() === filters.searchQuery ||
                    barcode.toLowerCase().includes(query);
            });
        }

        // Map to individual items (no grouping)
        const result = filteredStocks.map(s => {
            const pv = s.product_variations;
            const p = pv.product;
            const supplier = s.grn_items[0]?.grn?.supplier;

            // Build full product name
            let fullProductName = p.product_name;
            if (pv.color) fullProductName += ` - ${pv.color}`;
            if (pv.size) fullProductName += ` - ${pv.size}`;
            if (pv.storage_capacity) fullProductName += ` - ${pv.storage_capacity}`;

            return {
                stock_id: s.id,
                product_variations_id: s.product_variations_id,
                batch_id: s.batch_id,
                qty: s.qty,
                cost_price: s.cost_price,
                mrp: s.mrp,
                selling_price: s.rsp,
                mfd: s.mfd,
                exp: s.exp,
                product_id: p.id,
                product_name: p.product_name,
                full_product_name: fullProductName,
                product_code: p.product_code,
                barcode: pv.barcode,
                color: pv.color,
                size: pv.size,
                storage_capacity: pv.storage_capacity,
                unit: p.unit_id_product_unit_idTounit_id?.name,
                category: p.category?.name,
                brand: p.brand?.name,
                batch_name: s.batch?.batch_name,
                supplier: supplier?.supplier_name,
                product_status: pv.product_status?.status_name
            };
        });

        return result;
    }

    static async getDashboardSummary() {
        const currentDate = new Date();
        const currentMonth = currentDate.getMonth() + 1;
        const currentYear = currentDate.getFullYear();

        // Total Active Products
        const totalProducts = await prisma.product_variations.groupBy({
            by: ['product_id'],
            where: { product_status_id: 1 },
            _count: true
        });

        // Total Stock Value for current month
        const stockValue = await prisma.stock.aggregate({
            where: {
                mfd: {
                    gte: new Date(currentYear, currentMonth - 1, 1),
                    lt: new Date(currentYear, currentMonth, 1)
                }
            },
            _sum: {
                cost_price: true,
                qty: true
            }
        });

        // Low Stock Items
        const lowStock = await prisma.stock.count({
            where: {
                qty: { lt: 5 },
                product_variations: {
                    product_status_id: 1
                }
            }
        });

        // Total Active Suppliers
        const totalSuppliers = await prisma.supplier.count({
            where: { status_id: 1 }
        });

        // Total Categories
        const totalCategories = await prisma.category.count();

        return {
            totalProducts: totalProducts.length || 0,
            totalValue: (stockValue._sum.cost_price || 0) * (stockValue._sum.qty || 0),
            lowStock: lowStock || 0,
            totalSuppliers: totalSuppliers || 0,
            totalCategories: totalCategories || 0
        };
    }

    static async getOutOfStock() {
        // Get all out of stock items using pure Prisma
        const stocks = await prisma.stock.findMany({
            where: {
                qty: 0
            },
            include: {
                product_variations: {
                    include: {
                        product: {
                            include: {
                                unit_id_product_unit_idTounit_id: true
                            }
                        }
                    }
                },
                grn_items: {
                    include: {
                        grn: {
                            include: {
                                supplier: true
                            }
                        }
                    }
                }
            }
        });

        // Group by product and aggregate
        const productMap = new Map();

        stocks.forEach(stock => {
            const product = stock.product_variations.product;
            const productId = product.id;

            if (!productMap.has(productId)) {
                productMap.set(productId, {
                    product_id: productId,
                    product_name: product.product_name,
                    unit: product.unit_id_product_unit_idTounit_id?.name,
                    cost_prices: [],
                    mrps: [],
                    rsps: [],
                    suppliers: new Set(),
                    total_qty: 0
                });
            }

            const data = productMap.get(productId);
            data.cost_prices.push(stock.cost_price);
            data.mrps.push(stock.mrp);
            data.rsps.push(stock.rsp);
            data.total_qty += stock.qty;

            stock.grn_items.forEach(grnItem => {
                if (grnItem.grn?.supplier?.supplier_name) {
                    data.suppliers.add(grnItem.grn.supplier.supplier_name);
                }
            });
        });

        // Calculate averages and format result
        const result = Array.from(productMap.values()).map(data => ({
            product_id: data.product_id,
            product_name: data.product_name,
            unit: data.unit,
            cost_price: data.cost_prices.length > 0 ? data.cost_prices.reduce((a, b) => a + b, 0) / data.cost_prices.length : 0,
            mrp: data.mrps.length > 0 ? data.mrps.reduce((a, b) => a + b, 0) / data.mrps.length : 0,
            selling_price: data.rsps.length > 0 ? data.rsps.reduce((a, b) => a + b, 0) / data.rsps.length : 0,
            supplier: Array.from(data.suppliers).join(', '),
            stock_qty: data.total_qty
        }));

        return result.sort((a, b) => a.product_name.localeCompare(b.product_name));
    }

    static async searchOutOfStock(filters) {
        // Get all out of stock items using pure Prisma
        const stocks = await prisma.stock.findMany({
            where: {
                qty: 0
            },
            include: {
                product_variations: {
                    include: {
                        product: {
                            include: {
                                unit_id_product_unit_idTounit_id: true
                            }
                        }
                    }
                },
                grn_items: {
                    include: {
                        grn: {
                            include: {
                                supplier: true
                            }
                        }
                    }
                }
            }
        });

        // Filter in JavaScript
        let filteredStocks = stocks;

        if (filters.searchQuery) {
            const query = filters.searchQuery.toLowerCase();
            filteredStocks = filteredStocks.filter(s => {
                const product = s.product_variations.product;
                return product.product_name.toLowerCase().includes(query) || 
                       product.id.toString() === filters.searchQuery;
            });
        }

        if (filters.category) {
            filteredStocks = filteredStocks.filter(s => 
                s.product_variations.product.category_id === parseInt(filters.category)
            );
        }

        if (filters.supplier) {
            filteredStocks = filteredStocks.filter(s => 
                s.grn_items.some(gi => gi.grn?.supplier_id === parseInt(filters.supplier))
            );
        }

        if (filters.fromDate && filters.toDate) {
            const fromDate = new Date(filters.fromDate);
            const toDate = new Date(filters.toDate);
            filteredStocks = filteredStocks.filter(s => {
                if (!s.mfd) return false;
                const mfd = new Date(s.mfd);
                return mfd >= fromDate && mfd <= toDate;
            });
        }

        // Map to individual items (no grouping)
        const result = filteredStocks.map(s => {
            const pv = s.product_variations;
            const p = pv.product;
            const supplier = s.grn_items[0]?.grn?.supplier;

            // Build full product name
            let fullProductName = p.product_name;
            if (pv.color) fullProductName += ` - ${pv.color}`;
            if (pv.size) fullProductName += ` - ${pv.size}`;
            if (pv.storage_capacity) fullProductName += ` - ${pv.storage_capacity}`;

            return {
                stock_id: s.id,
                product_variations_id: s.product_variations_id,
                batch_id: s.batch_id,
                qty: s.qty,
                cost_price: s.cost_price,
                mrp: s.mrp,
                selling_price: s.rsp,
                mfd: s.mfd,
                exp: s.exp,
                product_id: p.id,
                product_name: p.product_name,
                full_product_name: fullProductName,
                product_code: p.product_code,
                barcode: pv.barcode,
                color: pv.color,
                size: pv.size,
                storage_capacity: pv.storage_capacity,
                unit: p.unit_id_product_unit_idTounit_id?.name,
                category: p.category?.name,
                brand: p.brand?.name,
                batch_name: s.batch?.batch_name,
                supplier: supplier?.supplier_name,
                product_status: pv.product_status?.status_name
            };
        });

        return result;
    }

    static async getStockByProductVariation(productId) {
        const stocks = await prisma.stock.findMany({
            where: {
                product_variations: {
                    product_id: parseInt(productId)
                },
                qty: { gt: 0 }
            },
            include: {
                product_variations: {
                    include: {
                        product: true
                    }
                },
                batch: true
            },
            orderBy: [
                { product_variations: { id: 'asc' } },
                { batch: { date_time: 'desc' } }
            ]
        });

        return stocks.map(s => {
            const pv = s.product_variations;
            const p = pv.product;
            
            let fullStockDisplay = p.product_name;
            if (pv.color) fullStockDisplay += ` - ${pv.color}`;
            if (pv.size) fullStockDisplay += ` - ${pv.size}`;
            fullStockDisplay += ` (${s.batch.batch_name})`;

            return {
                stock_id: s.id,
                full_stock_display: fullStockDisplay,
                available_qty: s.qty,
                selling_price: s.rsp
            };
        });
    }

    // Get all stock items where quantity is less than 15
    static async getLowStockRecords() {
        const stocks = await prisma.stock.findMany({
            where: {
                qty: { lt: 15, gte: 0 }
            },
            include: {
                product_variations: {
                    include: {
                        product: {
                            include: {
                                unit_id_product_unit_idTounit_id: true
                            }
                        }
                    }
                },
                grn_items: {
                    include: {
                        grn: {
                            include: {
                                supplier: true
                            }
                        }
                    },
                    take: 1
                }
            },
            orderBy: {
                qty: 'asc'
            }
        });

        return stocks.map(s => {
            const product = s.product_variations.product;
            const supplier = s.grn_items[0]?.grn?.supplier;

            return {
                product_id_code: product.product_code,
                product_name: product.product_name,
                unit: product.unit_id_product_unit_idTounit_id?.name,
                available_qty: s.qty,
                cost_price: s.cost_price,
                mrp: s.mrp,
                selling_price: s.rsp,
                supplier: supplier?.supplier_name
            };
        });
    }

    // Search low stock records based on provided filter IDs
    static async searchLowStock(filters) {
        const stocks = await prisma.stock.findMany({
            where: {
                qty: { lt: 15, gte: 0 }
            },
            include: {
                product_variations: {
                    include: {
                        product: {
                            include: {
                                unit_id_product_unit_idTounit_id: true
                            }
                        }
                    }
                },
                grn_items: {
                    include: {
                        grn: {
                            include: {
                                supplier: true
                            }
                        }
                    },
                    take: 1
                }
            },
            orderBy: {
                qty: 'asc'
            }
        });

        // Filter in JavaScript
        let filteredStocks = stocks;

        if (filters.supplier_id) {
            filteredStocks = filteredStocks.filter(s => 
                s.grn_items.some(gi => gi.grn?.supplier_id === parseInt(filters.supplier_id))
            );
        }

        if (filters.category_id) {
            filteredStocks = filteredStocks.filter(s => 
                s.product_variations.product.category_id === parseInt(filters.category_id)
            );
        }

        if (filters.unit_id) {
            filteredStocks = filteredStocks.filter(s => 
                s.product_variations.product.unit_id === parseInt(filters.unit_id)
            );
        }

        if (filters.product_id) {
            filteredStocks = filteredStocks.filter(s => 
                s.product_variations.product.id === parseInt(filters.product_id)
            );
        }

        return filteredStocks.map(s => {
            const product = s.product_variations.product;
            const supplier = s.grn_items[0]?.grn?.supplier;

            return {
                product_id_code: product.product_code,
                product_name: product.product_name,
                unit: product.unit_id_product_unit_idTounit_id?.name,
                available_qty: s.qty,
                cost_price: s.cost_price,
                mrp: s.mrp,
                selling_price: s.rsp,
                supplier: supplier?.supplier_name
            };
        });
    }

    // Get summary data for Out of Stock dashboard
    static async getOutOfStockSummary() {
        const stocks = await prisma.stock.findMany({
            where: {
                qty: { lte: 0 }
            },
            select: {
                product_variations_id: true,
                mfd: true,
                grn_items: {
                    select: {
                        grn: {
                            select: {
                                supplier_id: true
                            }
                        }
                    }
                }
            }
        });

        // Calculate statistics in JavaScript
        const uniqueProducts = new Set();
        const uniqueSuppliers = new Set();
        const daysOutArray = [];
        const currentDate = new Date();

        stocks.forEach(stock => {
            uniqueProducts.add(stock.product_variations_id);

            stock.grn_items.forEach(gi => {
                if (gi.grn?.supplier_id) {
                    uniqueSuppliers.add(gi.grn.supplier_id);
                }
            });

            if (stock.mfd) {
                const mfdDate = new Date(stock.mfd);
                const daysDiff = Math.floor((currentDate - mfdDate) / (1000 * 60 * 60 * 24));
                daysOutArray.push(daysDiff);
            }
        });

        const avgDaysOut = daysOutArray.length > 0 
            ? Math.round((daysOutArray.reduce((a, b) => a + b, 0) / daysOutArray.length) * 10) / 10
            : 0;

        return {
            total_out_of_stock_products: uniqueProducts.size,
            affected_suppliers: uniqueSuppliers.size,
            avg_days_out: avgDaysOut
        };
    }

    static async getLowStockSummary() {
        const stocks = await prisma.stock.findMany({
            where: {
                qty: { lt: 15, gt: 0 }
            },
            select: {
                qty: true,
                cost_price: true,
                product_variations: {
                    select: {
                        product_id: true
                    }
                }
            }
        });

        // Calculate statistics in JavaScript
        const uniqueProducts = new Set();
        const productsNeedingReorder = new Set();
        let totalValue = 0;
        let belowThresholdCount = 0;

        stocks.forEach(stock => {
            uniqueProducts.add(stock.product_variations.product_id);
            totalValue += stock.qty * stock.cost_price;

            if (stock.qty <= 5) {
                belowThresholdCount++;
            }

            if (stock.qty < 10) {
                productsNeedingReorder.add(stock.product_variations.product_id);
            }
        });

        return {
            low_stock_items_count: stocks.length,
            total_products_count: uniqueProducts.size,
            potential_loss_value: totalValue,
            below_threshold_count: belowThresholdCount,
            reorder_required_count: productsNeedingReorder.size
        };
    }
}

module.exports = Stock;