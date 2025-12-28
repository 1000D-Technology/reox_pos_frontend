const db = require('../config/db');

class Product{
    static async create(productData, variations){
        const connection = await db.getConnection();
        try{
            await connection.beginTransaction();
            
            const [prodductResult] = await connection.execute(`INSERT INTO product (product_name, product_code, category_id, brand_id, unit_id, product_type_id) 
                 VALUES (?, ?, ?, ?, ?, ?)`,
                [productData.name, productData.code, productData.categoryId, productData.brandId, productData.unitId, productData.typeId]);

            const productId = prodductResult.insertId;

            for (let variant of variations) {
                await connection.execute(
                    `INSERT INTO product_variations (product_id, barcode, color, size, storage_capacity, product_status_id) 
                     VALUES (?, ?, ?, ?, ?, ?)`,
                    [productId, variant.barcode, variant.color, variant.size, variant.capacity, variant.statusId]
                );
            }
            await connection.commit();
            return productId;
        }catch(error){
            await connection.rollback();
            throw error;
        } finally {
            connection.release();
        }
    }

}

module.exports = Product;