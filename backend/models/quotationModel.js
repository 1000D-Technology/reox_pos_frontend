const prisma = require("../config/prismaClient");

class Quotation {
    static async create(data) {
        // data: { customer_id, user_id, sub_total, discount, total, items: [{ stock_id, price, discount_amount, qty, total }] }
        
        // Generate Quotation Number (QT-YYYYMMDD-XXXX)
        const date = new Date();
        const year = date.getFullYear();
        const month = String(date.getMonth() + 1).padStart(2, '0');
        const day = String(date.getDate()).padStart(2, '0');
        
        // Count for generating ID
        const count = await prisma.quotation.count();
        const quotationNumber = `QT-${year}${month}${day}-${String(count + 1).padStart(4, '0')}`;
        
        const validUntil = new Date(date);
        validUntil.setDate(validUntil.getDate() + 7); // Default +7 days

        return prisma.quotation.create({
            data: {
                quotation_number: quotationNumber,
                customer_id: data.customer_id,
                user_id: data.user_id,
                sub_total: data.sub_total,
                discount: data.discount,
                total: data.total,
                created_at: date,
                valid_until: data.valid_until ? new Date(data.valid_until) : validUntil,
                quotation_items: {
                    create: data.items.map(item => ({
                        stock_id: item.id, // item.id is stockID from frontend
                        price: item.mrp,   // item.mrp is original price
                        discount_amount: item.discount, // item.discount is total discount for line
                        qty: item.qty,
                        total: item.amount // net amount for line
                    }))
                }
            },
            include: {
                quotation_items: {
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
                                }
                            }
                        }
                    }
                },
                customer: true,
                user: true
            }
        });
    }

    static async getById(id) {
        return prisma.quotation.findUnique({
            where: { id: parseInt(id) },
            include: {
                quotation_items: {
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
                                }
                            }
                        }
                    }
                },
                customer: true,
                user: true
            }
        });
    }
    static async getAll({ quotationNumber, fromDate, toDate, customerId, page = 1, limit = 10 }) {
        const offset = (page - 1) * limit;
        const where = {};

        if (quotationNumber) {
            where.quotation_number = { contains: quotationNumber };
        }

        if (fromDate || toDate) {
            where.created_at = {};
            if (fromDate) where.created_at.gte = new Date(fromDate);
            if (toDate) {
                const endDate = new Date(toDate);
                endDate.setHours(23, 59, 59, 999);
                where.created_at.lte = endDate;
            }
        }

        if (customerId) {
            where.customer_id = parseInt(customerId);
        }

        console.log('Fetching quotations with where:', JSON.stringify(where, null, 2));

        const [total, quotations] = await Promise.all([
            prisma.quotation.count({ where }),
            prisma.quotation.findMany({
                where,
                skip: offset,
                take: parseInt(limit),
                orderBy: { created_at: 'desc' },
                include: {
                    customer: true,
                    user: true,
                    quotation_items: {
                        include: {
                            stock: {
                                include: {
                                    product_variations: {
                                        include: {
                                            product: true
                                        }
                                    }
                                }
                            }
                        }
                    }
                }
            })
        ]);

        return {
            total,
            quotations
        };
    }
}

module.exports = Quotation;
