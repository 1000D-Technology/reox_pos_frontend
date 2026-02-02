const { PrismaClient } = require('@prisma/client');
const path = require('path');
require('dotenv').config({ path: path.resolve(__dirname, '../.env') });

let prisma;
try {
  if (!process.env.DATABASE_URL || process.env.DATABASE_URL.includes('${')) {
    const { DB_USER, DB_PASSWORD, DB_HOST, DB_PORT, DB_NAME } = process.env;
    const dbPort = DB_PORT || '3306';
    const encodedPassword = encodeURIComponent(DB_PASSWORD);
    process.env.DATABASE_URL = `mysql://${DB_USER}:${encodedPassword}@${DB_HOST}:${dbPort}/${DB_NAME}`;
  }
  prisma = new PrismaClient();
} catch (err) {
  console.error("Failed to init PrismaClient:", err);
  process.exit(1);
}

async function main() {
  console.log('Start seeding 200 products...');

  // 1. Get existing metadata or create if not exists
  let category = await prisma.category.findFirst({ where: { name: 'General' } });
  if (!category) category = await prisma.category.create({ data: { name: 'General' } });

  let brand = await prisma.brand.findFirst({ where: { name: 'No Brand' } });
  if (!brand) brand = await prisma.brand.create({ data: { name: 'No Brand' } });

  let unit = await prisma.unit_id.findFirst({ where: { name: 'PCS' } });
  if (!unit) unit = await prisma.unit_id.create({ data: { name: 'PCS' } });

  let pType = await prisma.product_type.findFirst({ where: { name: 'Standard' } });
  if (!pType) pType = await prisma.product_type.create({ data: { name: 'Standard' } });

  let pStatus = await prisma.product_status.findFirst({ where: { status_name: 'Available' } });
  if (!pStatus) pStatus = await prisma.product_status.create({ data: { status_name: 'Available' } });

  let batch = await prisma.batch.findFirst({ where: { batch_name: 'Batch-Initial' } });
  if (!batch) batch = await prisma.batch.create({ data: { batch_name: 'Batch-Initial' } });

  // 2. Prepare Sample Data Arrays
  const adjectives = ['Premium', 'Organic', 'Global', 'Smart', 'Eco', 'Classic', 'Ultimate', 'Lite', 'Pro', 'Select'];
  const types = ['Milk', 'Bread', 'Soap', 'Juice', 'Chips', 'Detergent', 'Biscuits', 'Yogurt', 'Notebook', 'Pen', 'Cable', 'Socks', 'Gloves', 'Tape', 'Glue', 'Oil', 'Salt', 'Sugar', 'Rice', 'Flour'];
  const brands = ['A-One', 'Z-Tech', 'NatureBest', 'EverPure', 'SilverLine', 'GoldenChoice', 'SmartHome', 'DailyNeeds'];
  const variations = ['500g', '1kg', 'Small', 'Large', 'Pack of 3', 'Red', 'Blue', 'Standard'];

  const productsToCreate = [];
  const currentCount = await prisma.product.count();
  
  for (let i = 1; i <= 200; i++) {
    const adj = adjectives[Math.floor(Math.random() * adjectives.length)];
    const type = types[Math.floor(Math.random() * types.length)];
    const bnd = brands[Math.floor(Math.random() * brands.length)];
    const productName = `${adj} ${bnd} ${type}`;
    const productCode = `P${(currentCount + i).toString().padStart(4, '0')}`;
    const barcode = `890${(1000000000 + currentCount + i).toString()}`;

    const costPrice = parseFloat((Math.random() * 500 + 50).toFixed(2));
    const rsp = parseFloat((costPrice * 1.25).toFixed(2));
    const mrp = parseFloat((rsp * 1.1).toFixed(2));
    const wsp = parseFloat((costPrice * 1.15).toFixed(2));
    const qty = Math.floor(Math.random() * 100) + 10;

    productsToCreate.push({
      product_name: productName,
      product_code: productCode,
      category_id: category.idcategory,
      brand_id: brand.idbrand,
      unit_id: unit.idunit_id,
      product_type_id: pType.idproduct_type,
      product_variations: {
        create: [
          {
            barcode: barcode,
            product_status_id: pStatus.idproduct_status,
            size: variations[Math.floor(Math.random() * variations.length)],
            stock: {
              create: [
                {
                  barcode: barcode,
                  batch_id: batch.id,
                  cost_price: costPrice,
                  mrp: mrp,
                  rsp: rsp,
                  wsp: wsp,
                  qty: qty,
                  mfd: new Date(),
                }
              ]
            }
          }
        ]
      }
    });

    if (i % 50 === 0) {
      console.log(`Prepared ${i} products...`);
    }
  }

  console.log('Inserting into database...');
  // We can't use createMany with nested creates in Prisma, so we loop or use transactions.
  // For 200 items, individual creates are fine for a seed script.
  for (let i = 0; i < productsToCreate.length; i++) {
    try {
      await prisma.product.create({
        data: productsToCreate[i]
      });
      if ((i + 1) % 50 === 0) {
        console.log(`Inserted ${i + 1} products...`);
      }
    } catch (e) {
      console.error(`Error creating product ${i}:`, e.message);
    }
  }

  console.log('Seeding 200 products finished.');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
