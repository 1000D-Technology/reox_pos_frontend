const prisma = require('../config/prismaClient');

class Damaged {
    static async addDamagedStock(data) {
        try {
            return await prisma.$transaction(async (tx) => {
                // 1. Check current stock level and lock the row for update
                const stock = await tx.stock.findUnique({
                    where: { id: data.stock_id },
                    select: { qty: true }
                });

                if (!stock) {
                    throw new Error("Stock record not found.");
                }

                const currentQty = stock.qty;

                // 2. Validate if the damaged quantity is more than available stock
                if (currentQty < data.qty) {
                    throw new Error(`Insufficient stock. Available quantity is only ${currentQty}`);
                }

                // 3. Insert record into the damaged table
                await tx.damaged.create({
                    data: {
                        stock_id: data.stock_id,
                        qty: data.qty,
                        reason_id: data.reason_id,
                        description: data.description,
                        date: new Date(),
                        return_status_id: data.status_id
                    }
                });

                // 4. Update (deduct) the quantity in the stock table
                await tx.stock.update({
                    where: { id: data.stock_id },
                    data: {
                        qty: {
                            decrement: data.qty
                        }
                    }
                });

                return { success: true };
            });
        } catch (error) {
            throw error;
        }
    }

    // Get all damaged records for the table display
    static async getAllDamagedRecords() {
        const damagedRecords = await prisma.damaged.findMany({
            include: {
                stock: {
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
                    }
                },
                reason: true,
                return_status: true
            },
            orderBy: {
                id: 'desc'
            }
        });

        return damagedRecords.map(d => {
            const stock = d.stock;
            const product = stock.product_variations.product;
            const supplier = stock.grn_items[0]?.grn?.supplier;

            return {
                damaged_id: d.id,
                product_id_code: product.product_code,
                product_name: product.product_name,
                unit: product.unit_id_product_unit_idTounit_id?.name,
                damaged_qty: d.qty,
                cost_price: stock.cost_price,
                mrp: stock.mrp,
                price: stock.rsp,
                supplier: supplier?.supplier_name,
                stock_label: stock.batch?.batch_name,
                damage_reason: d.reason.reason,
                status: d.return_status.return_status
            };
        });
    }

    // Fetch filtered records from the damaged table
    static async searchDamagedRecords(filters) {
        const damagedRecords = await prisma.damaged.findMany({
            include: {
                stock: {
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
                    }
                },
                reason: true,
                return_status: true
            },
            orderBy: {
                id: 'desc'
            }
        });

        // Filter in JavaScript
        let filteredRecords = damagedRecords;

        if (filters.category_id) {
            filteredRecords = filteredRecords.filter(d => 
                d.stock.product_variations.product.category_id === parseInt(filters.category_id)
            );
        }

        if (filters.supplier_id) {
            filteredRecords = filteredRecords.filter(d => 
                d.stock.grn_items.some(gi => gi.grn?.supplier_id === parseInt(filters.supplier_id))
            );
        }

        if (filters.product_id) {
            filteredRecords = filteredRecords.filter(d => 
                d.stock.product_variations.product.id === parseInt(filters.product_id)
            );
        }

        if (filters.unit_id) {
            filteredRecords = filteredRecords.filter(d => 
                d.stock.product_variations.product.unit_id === parseInt(filters.unit_id)
            );
        }

        if (filters.fromDate && filters.toDate) {
            const fromDate = new Date(filters.fromDate);
            const toDate = new Date(filters.toDate);
            filteredRecords = filteredRecords.filter(d => {
                const damageDate = new Date(d.date);
                return damageDate >= fromDate && damageDate <= toDate;
            });
        }

        return filteredRecords.map(d => {
            const stock = d.stock;
            const product = stock.product_variations.product;
            const supplier = stock.grn_items[0]?.grn?.supplier;

            return {
                damaged_id: d.id,
                product_id_code: product.product_code,
                product_name: product.product_name,
                unit: product.unit_id_product_unit_idTounit_id?.name,
                damaged_qty: d.qty,
                cost_price: stock.cost_price,
                mrp: stock.mrp,
                price: stock.rsp,
                supplier: supplier?.supplier_name,
                stock_label: stock.batch?.batch_name,
                damage_reason: d.reason.reason,
                status: d.return_status.return_status,
                date: d.date
            };
        });
    }

    // Get summary statistics for the Damaged Stock dashboard
    static async getDamagedSummary() {
        const damagedRecords = await prisma.damaged.findMany({
            include: {
                stock: {
                    include: {
                        product_variations: {
                            select: {
                                product_id: true
                            }
                        },
                        grn_items: {
                            include: {
                                grn: {
                                    select: {
                                        supplier_id: true
                                    }
                                }
                            }
                        }
                    }
                }
            }
        });

        // Calculate statistics in JavaScript
        const uniqueProducts = new Set();
        const uniqueSuppliers = new Set();
        let totalLossValue = 0;
        let thisMonthCount = 0;

        const currentDate = new Date();
        const currentMonth = currentDate.getMonth();
        const currentYear = currentDate.getFullYear();

        damagedRecords.forEach(d => {
            uniqueProducts.add(d.stock.product_variations.product_id);
            totalLossValue += d.qty * d.stock.cost_price;

            // Check if damage is from current month
            const damageDate = new Date(d.date);
            if (damageDate.getMonth() === currentMonth && damageDate.getFullYear() === currentYear) {
                thisMonthCount++;
            }

            // Collect unique suppliers
            d.stock.grn_items.forEach(gi => {
                if (gi.grn?.supplier_id) {
                    uniqueSuppliers.add(gi.grn.supplier_id);
                }
            });
        });

        return {
            damaged_items_count: damagedRecords.length,
            total_products_affected: uniqueProducts.size,
            total_loss_value: totalLossValue,
            this_month_count: thisMonthCount,
            affected_suppliers_count: uniqueSuppliers.size
        };
    }
}

module.exports = Damaged;