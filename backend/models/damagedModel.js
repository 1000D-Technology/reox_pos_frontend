const prisma = require('../config/prismaClient');

class Damaged {
    static async addDamagedStock(data) {
        try {
            return await prisma.$transaction(async (tx) => {
                // 1. Check current stock level and lock the row for update
                const stockId = parseInt(data.stock_id);
                const damagedQty = parseFloat(data.qty);
                const reasonId = parseInt(data.reason_id);
                const statusId = parseInt(data.status_id);

                const stock = await tx.stock.findUnique({
                    where: { id: stockId },
                    select: { qty: true }
                });

                if (!stock) {
                    throw new Error("Stock record not found.");
                }

                const currentQty = stock.qty;

                // 2. Validate if the damaged quantity is more than available stock
                if (currentQty < damagedQty) {
                    throw new Error(`Insufficient stock. Available quantity is only ${currentQty}`);
                }

                // 3. Insert record into the damaged table
                await tx.damaged.create({
                    data: {
                        stock_id: stockId,
                        qty: damagedQty,
                        reason_id: reasonId,
                        description: data.description,
                        date: new Date(),
                        return_status_id: statusId
                    }
                });

                // 4. Update (deduct) the quantity in the stock table
                await tx.stock.update({
                    where: { id: stockId },
                    data: {
                        qty: {
                            decrement: damagedQty
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
                product_id_code: product.id,
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
                description: d.description,
                date: d.date
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
            toDate.setHours(23, 59, 59, 999);
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
                product_id_code: product.id,
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
                description: d.description,
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
        let totalDamagedQty = 0;
        let thisMonthQty = 0;

        const currentDate = new Date();
        const currentMonth = currentDate.getMonth();
        const currentYear = currentDate.getFullYear();

        damagedRecords.forEach(d => {
            uniqueProducts.add(d.stock.product_variations.product_id);
            totalLossValue += d.qty * d.stock.cost_price;
            totalDamagedQty += d.qty;

            // Check if damage is from current month
            const damageDate = new Date(d.date);
            if (damageDate.getMonth() === currentMonth && damageDate.getFullYear() === currentYear) {
                thisMonthQty += d.qty;
            }

            // Collect unique suppliers
            d.stock.grn_items.forEach(gi => {
                if (gi.grn?.supplier_id) {
                    uniqueSuppliers.add(gi.grn.supplier_id);
                }
            });
        });

        return {
            damaged_items_count: totalDamagedQty,
            total_products_affected: uniqueProducts.size,
            total_loss_value: totalLossValue,
            this_month_count: thisMonthQty,
            affected_suppliers_count: uniqueSuppliers.size
        };
    }

    static async updateStatus(id, statusId) {
        try {
            await prisma.damaged.update({
                where: { id: parseInt(id) },
                data: {
                    return_status_id: parseInt(statusId)
                }
            });
            return { success: true };
        } catch (error) {
            throw error;
        }
    }
}

module.exports = Damaged;