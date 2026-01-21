const prisma = require("../config/prismaClient");

class POS {
    // Get POS products with stock greater than 0
    static async getPOSProducts() {
        const stocks = await prisma.stock.findMany({
            where: {
                qty: { gt: 0 },
                product_variations: {
                    product_status_id: 1
                }
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
                batch: true
            },
            orderBy: [
                { product_variations: { product: { product_name: 'asc' } } },
                { mfd: 'asc' }
            ]
        });

        return stocks.map(s => {
            const pv = s.product_variations;
            const p = pv.product;
            
            return {
                stockID: s.id,
                productName: p.product_name,
                barcode: s.barcode,
                pvBarcode: pv.barcode,
                unit: p.unit_id_product_unit_idTounit_id?.name,
                price: s.rsp,
                wholesalePrice: s.wsp || '',
                currentStock: s.qty,
                batchName: s.batch.batch_name,
                productCode: p.product_code,
                color: pv.color,
                size: pv.size,
                storage_capacity: pv.storage_capacity,
                expiry: s.exp ? s.exp.toISOString().split('T')[0] : null
            };
        });
    }

    // Search product by barcode (checks both stock and product_variations barcodes)
    static async searchByBarcode(barcode) {
        const stocks = await prisma.stock.findMany({
            where: {
                OR: [
                    { barcode: barcode },
                    { product_variations: { barcode: barcode } }
                ],
                qty: { gt: 0 },
                product_variations: {
                    product_status_id: 1
                }
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
                batch: true
            },
            orderBy: {
                mfd: 'asc'
            },
            take: 1
        });

        return stocks.map(s => {
            const pv = s.product_variations;
            const p = pv.product;
            
            return {
                stockID: s.id,
                productName: p.product_name,
                barcode: s.barcode,
                unit: p.unit_id_product_unit_idTounit_id?.name,
                price: s.rsp,
                wholesalePrice: s.wsp || '',
                productCode: p.product_code,
                currentStock: s.qty,
                batchName: s.batch.batch_name,
                expiry: s.exp ? s.exp.toISOString().split('T')[0] : null,
                color: pv.color,
                size: pv.size,
                storage_capacity: pv.storage_capacity
            };
        });
    }
}

module.exports = POS;