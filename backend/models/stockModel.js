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
                                unit_id_product_unit_idTounit_id: {
                                    include: {
                                        unit_conversions_as_parent: {
                                            include: {
                                                child_unit: true
                                            }
                                        }
                                    }
                                },
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
            ],
            take: filters.limit ? parseInt(filters.limit) : undefined
        });

        return stocks.map(s => {
            const pv = s.product_variations;
            const p = pv.product;
            const supplier = s.grn_items[0]?.grn?.supplier;

            // Build full product name - Only include meaningful variants
            const variations = [pv.color, pv.size, pv.storage_capacity]
                .filter(v => v && !['n/a', 'na', 'n.a.', 'none', 'default', 'not applicable'].includes(v.toLowerCase().trim()) && v.trim() !== '');

            let fullProductName = p.product_name;
            if (variations.length > 0) {
                fullProductName += ` - ${variations.join(' - ')}`;
            }

            return {
                stock_id: s.id,
                product_variations_id: s.product_variations_id,
                batch_id: s.batch_id,
                qty: s.qty,
                cost_price: s.cost_price,
                mrp: s.mrp,
                selling_price: s.rsp,
                wsp: s.wsp,
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
                unit_conversion: p.unit_id_product_unit_idTounit_id?.unit_conversions_as_parent?.[0] ? {
                    factor: p.unit_id_product_unit_idTounit_id.unit_conversions_as_parent[0].conversion_factor,
                    subUnit: p.unit_id_product_unit_idTounit_id.unit_conversions_as_parent[0].child_unit.name
                } : null,
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
    static async getAllStock(page = 1, limit = 10) {
        return this.searchStock({}, page, limit);
    }

    static async searchStock(filters, page = 1, limit = 10) {
        const whereClause = {
            qty: { gt: 0 }
        };

        if (filters.category) {
            whereClause.product_variations = {
                product: {
                    category_id: parseInt(filters.category)
                }
            };
        }

        if (filters.unit) {
            if (!whereClause.product_variations) whereClause.product_variations = { product: {} };
            whereClause.product_variations.product.unit_id = parseInt(filters.unit);
        }

        if (filters.supplier) {
            whereClause.grn_items = {
                some: {
                    grn: {
                        supplier_id: parseInt(filters.supplier)
                    }
                }
            };
        }

        if (filters.searchQuery) {
            const query = filters.searchQuery.toLowerCase();
            whereClause.OR = [
                {
                    product_variations: {
                        product: {
                            OR: [
                                { product_name: { contains: query } },
                                { product_code: { contains: query } }
                            ]
                        }
                    }
                },
                { barcode: { contains: query } },
                { product_variations: { barcode: { contains: query } } }
            ];

            // If query is a number, also check ID
            const numericId = parseInt(query);
            if (!isNaN(numericId)) {
                whereClause.OR.push({
                    product_variations: {
                        product: {
                            id: numericId
                        }
                    }
                });
            }
        }

        // Get total count for pagination
        const totalCount = await prisma.stock.count({
            where: whereClause
        });

        const skip = (page - 1) * limit;

        // Fetch paginated stocks with relations using Prisma
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
            take: limit,
            skip: skip,
            orderBy: {
                product_variations: {
                    product: {
                        product_name: 'asc'
                    }
                }
            }
        });

        // Map to individual items (no grouping)
        const result = stocks.map(s => {
            const pv = s.product_variations;
            const p = pv.product;
            const supplier = s.grn_items[0]?.grn?.supplier;

            // Build full product name - Only include meaningful variants
            const variations = [pv.color, pv.size, pv.storage_capacity]
                .filter(v => v && !['n/a', 'na', 'n.a.', 'none', 'default', 'not applicable'].includes(v.toLowerCase().trim()) && v.trim() !== '');

            let fullProductName = p.product_name;
            if (variations.length > 0) {
                fullProductName += ` - ${variations.join(' - ')}`;
            }

            return {
                stock_id: s.id,
                product_variations_id: s.product_variations_id,
                batch_id: s.batch_id,
                qty: s.qty,
                cost_price: s.cost_price,
                mrp: s.mrp,
                selling_price: s.rsp,
                wsp: s.wsp,
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

        return {
            data: result,
            pagination: {
                currentPage: page,
                itemsPerPage: limit,
                totalItems: totalCount,
                totalPages: Math.ceil(totalCount / limit),
                hasNextPage: page < Math.ceil(totalCount / limit),
                hasPrevPage: page > 1
            }
        };
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

   static async getOutOfStock(page = 1, limit = 10) {
    const skip = (page - 1) * limit;

    const variationsWithZeroStock = await prisma.stock.groupBy({
        by: ['product_variations_id'],
        _sum: {
            qty: true
        },
        _avg: {
            cost_price: true,
            mrp: true,
            rsp: true
        },
        having: {
            qty: {
                _sum: {
                    lte: 0
                }
            }
        },
        orderBy: {
            product_variations_id: 'asc'
        }
    });

    const totalCount = variationsWithZeroStock.length;
    const paginatedGroups = variationsWithZeroStock.slice(skip, skip + limit);

    const results = await Promise.all(paginatedGroups.map(async (group) => {
        const pv = await prisma.product_variations.findUnique({
            where: { id: group.product_variations_id },
            include: {
                product: {
                    include: { unit_id_product_unit_idTounit_id: true }
                }
            }
        });

        const vParts = [pv.color, pv.size, pv.storage_capacity]
            .filter(v => v && !['n/a', 'none', 'default', 'na'].includes(v.toLowerCase().trim()));

        return {
            product_id: pv.product.product_code || pv.product.id.toString(),
            product_name: vParts.length > 0 ? `${pv.product.product_name} - ${vParts.join(' - ')}` : pv.product.product_name,
            unit: pv.product.unit_id_product_unit_idTounit_id?.name,
            cost_price: group._avg.cost_price || 0,
            mrp: group._avg.mrp || 0,
            selling_price: group._avg.rsp || 0,
            stock_qty: group._sum.qty || 0
        };
    }));

    return {
        data: results,
        pagination: {
            currentPage: page,
            itemsPerPage: limit,
            totalItems: totalCount,
            totalPages: Math.ceil(totalCount / limit),
            hasNextPage: page < Math.ceil(totalCount / limit),
            hasPrevPage: page > 1
        }
    };
}

    static async searchOutOfStock(filters, page = 1, limit = 10) {
        const skip = (page - 1) * limit;

        // 1. Build Database-level where clause
        const whereClause = {
            qty: 0 // Out of stock items පමණක්
        };

        // Search query (Name, Code, or ID)
        if (filters.searchQuery) {
            const query = filters.searchQuery.trim();
            whereClause.product_variations = {
                product: {
                    OR: [
                        { product_name: { contains: query } },
                        { product_code: { contains: query } },
                        { id: !isNaN(query) ? parseInt(query) : undefined }
                    ].filter(Boolean)
                }
            };
        }

        // Category filter
        if (filters.category) {
            if (!whereClause.product_variations) whereClause.product_variations = { product: {} };
            whereClause.product_variations.product.category_id = parseInt(filters.category);
        }

        // Supplier filter
        if (filters.supplier) {
            whereClause.grn_items = {
                some: {
                    grn: { supplier_id: parseInt(filters.supplier) }
                }
            };
        }

        // Date range filter (MFD base කරගෙන)
        if (filters.fromDate && filters.toDate) {
            whereClause.mfd = {
                gte: new Date(filters.fromDate),
                lte: new Date(new Date(filters.toDate).setHours(23, 59, 59, 999))
            };
        }

        // 2. Execute parallel queries for performance
        const [totalCount, stocks] = await Promise.all([
            prisma.stock.count({ where: whereClause }),
            prisma.stock.findMany({
                where: whereClause,
                skip: skip,
                take: limit,
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
                            grn: { include: { supplier: true } }
                        },
                        take: 1
                    }
                },
                orderBy: { id: 'desc' }
            })
        ]);

        // 3. Map result to your desired format
        const data = stocks.map(s => {
            const pv = s.product_variations;
            const p = pv.product;
            const supplier = s.grn_items[0]?.grn?.supplier;

            const variations = [pv.color, pv.size, pv.storage_capacity]
                .filter(v => v && !['n/a', 'none', 'default'].includes(v.toLowerCase().trim()));

            const fullProductName = variations.length > 0
                ? `${p.product_name} - ${variations.join(' - ')}`
                : p.product_name;

            return {
                stock_id: s.id,
                qty: s.qty,
                cost_price: s.cost_price,
                mrp: s.mrp,
                selling_price: s.rsp,
                product_name: fullProductName,
                product_code: p.product_code,
                barcode: pv.barcode,
                unit: p.unit_id_product_unit_idTounit_id?.name,
                supplier: supplier?.supplier_name,
                batch_name: s.batch?.batch_name
            };
        });

        return {
            data,
            pagination: {
                currentPage: page,
                itemsPerPage: limit,
                totalItems: totalCount,
                totalPages: Math.ceil(totalCount / limit)
            }
        };
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

            // Build full product name - Only include meaningful variants
            const variations = [pv.color, pv.size]
                .filter(v => v && !['n/a', 'na', 'n.a.', 'none', 'default', 'not applicable'].includes(v.toLowerCase().trim()) && v.trim() !== '');

            let fullStockDisplay = p.product_name;
            if (variations.length > 0) {
                fullStockDisplay += ` - ${variations.join(' - ')}`;
            }
            fullStockDisplay += ` (${s.batch.batch_name})`;

            return {
                stock_id: s.id,
                full_stock_display: fullStockDisplay,
                available_qty: s.qty,
                selling_price: s.rsp
            };
        });
    }

    // Get all stock items where quantity is less than 15 with pagination
    static async getLowStockRecords(page = 1, limit = 10) {
        const skip = (page - 1) * limit;

        // Build WHERE condition
        const whereCondition = {
            qty: { lt: 15, gte: 0 }
        };

        // Fetch data with pagination and count in parallel
        const [stocks, totalCount] = await Promise.all([
            prisma.stock.findMany({
                where: whereCondition,
                skip: skip,
                take: limit,
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
            }),
            prisma.stock.count({ where: whereCondition })
        ]);

        const data = stocks.map(s => {
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

        return {
            data,
            pagination: {
                currentPage: page,
                totalPages: Math.ceil(totalCount / limit),
                totalItems: totalCount,
                itemsPerPage: limit,
                hasNextPage: page < Math.ceil(totalCount / limit),
                hasPrevPage: page > 1
            }
        };
    }

    // Search low stock records based on provided filter IDs with pagination
    static async searchLowStock(filters, page = 1, limit = 10) {
        const skip = (page - 1) * limit;

        // Build WHERE condition with all filters at database level
        const whereCondition = {
            qty: { lt: 15, gte: 0 }
        };

        // Product filters
        const productFilters = {};
        if (filters.category_id) {
            productFilters.category_id = parseInt(filters.category_id);
        }
        if (filters.unit_id) {
            productFilters.unit_id = parseInt(filters.unit_id);
        }
        if (filters.product_id) {
            productFilters.id = parseInt(filters.product_id);
        }

        // Add product filters to WHERE condition if any exist
        if (Object.keys(productFilters).length > 0) {
            whereCondition.product_variations = {
                product: productFilters
            };
        }

        // Supplier filter at database level using nested relation
        if (filters.supplier_id) {
            whereCondition.grn_items = {
                some: {
                    grn: {
                        supplier_id: parseInt(filters.supplier_id)
                    }
                }
            };
        }

        // Fetch data with pagination and count in parallel
        const [stocks, totalCount] = await Promise.all([
            prisma.stock.findMany({
                where: whereCondition,
                skip: skip,
                take: limit,
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
            }),
            prisma.stock.count({ where: whereCondition })
        ]);

        // Map data
        const data = stocks.map(s => {
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

        return {
            data,
            pagination: {
                currentPage: page,
                totalPages: Math.ceil(totalCount / limit),
                totalItems: totalCount,
                itemsPerPage: limit,
                hasNextPage: page < Math.ceil(totalCount / limit),
                hasPrevPage: page > 1
            }
        };
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