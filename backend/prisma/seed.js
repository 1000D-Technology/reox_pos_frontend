const { PrismaClient } = require('@prisma/client');
const path = require('path');
// Ensure environment variables are loaded for the seed script
require('dotenv').config({ path: path.resolve(__dirname, '../.env') });

let prisma;
try {
  // If undefined OR contains template syntax (dotenv didn't expand it), construct manual URL
  if (!process.env.DATABASE_URL || process.env.DATABASE_URL.includes('${')) {
    const { DB_USER, DB_PASSWORD, DB_HOST, DB_PORT, DB_NAME } = process.env;
    const dbPort = DB_PORT || '3306';
    const encodedPassword = encodeURIComponent(DB_PASSWORD);
    process.env.DATABASE_URL = `mysql://${DB_USER}:${encodedPassword}@${DB_HOST}:${dbPort}/${DB_NAME}`;
    console.log("Constructed DB URL:", process.env.DATABASE_URL.replace(encodedPassword, '********'));
  }
  prisma = new PrismaClient();
} catch (err) {
  console.error("Failed to init PrismaClient:", err);
  process.exit(1);
}
const bcrypt = require('bcrypt');

async function main() {
  console.log('Start seeding...');

  // 1. Create Roles
  const roles = ['Admin', 'Cashier', 'Manager'];
  for (const roleName of roles) {
    const exists = await prisma.role.findFirst({ where: { user_role: roleName } });
    if (!exists) {
      await prisma.role.create({ data: { user_role: roleName } });
      console.log(`Created role: ${roleName}`);
    }
  }

  // 2. Create Statuses (General usage)
  const statuses = ['Active', 'Inactive', 'Suspended'];
  for (const statusName of statuses) {
    const exists = await prisma.status.findFirst({ where: { ststus: statusName } }); // Note: 'ststus' typo in schema
    if (!exists) {
      await prisma.status.create({ data: { ststus: statusName } });
      console.log(`Created status: ${statusName}`);
    }
  }

  // 3. Create Users
  // Note: User ID is not auto-increment in schema, so we must provide it.
  // Fetch IDs for relations
  const adminRole = await prisma.role.findFirst({ where: { user_role: 'Admin' } });
  const activeStatus = await prisma.status.findFirst({ where: { ststus: 'Active' } });

  if (adminRole && activeStatus) {
    const passwordHash = await bcrypt.hash('123456', 10);
    const adminUser = await prisma.user.findUnique({ where: { id: 1 } });
    
    if (!adminUser) {
      await prisma.user.create({
        data: {
          id: 1,
          name: 'Super Admin',
          contact: '0771234567',
          email: 'admin@reox.com',
          password: passwordHash,
          role_id: adminRole.id,
          status_id: activeStatus.id,
          created_at: new Date()
        }
      });
      console.log('Created admin user');
    }
  }

  // 4. Create Product Metadata (Category, Brand, Unit, Product Type, Product Status)
  
  // Categories
  const categories = ['Electronics', 'Clothing', 'Groceries'];
  for (const name of categories) {
    const exists = await prisma.category.findFirst({ where: { name } });
    if (!exists) await prisma.category.create({ data: { name } });
  }

  // Brands
  const brands = ['Nike', 'Samsung', 'Keells'];
  for (const name of brands) {
    const exists = await prisma.brand.findFirst({ where: { name } });
    if (!exists) await prisma.brand.create({ data: { name } });
  }

  // Units
  const units = ['PCS', 'KG', 'L'];
  for (const name of units) {
    const exists = await prisma.unit_id.findFirst({ where: { name } });
    if (!exists) await prisma.unit_id.create({ data: { name } });
  }

  // Product Types
  const pTypes = ['Standard', 'Weighted', 'Service'];
  for (const name of pTypes) {
    const exists = await prisma.product_type.findFirst({ where: { name } });
    if (!exists) await prisma.product_type.create({ data: { name } });
  }

  // Product Statuses
  const pStatuses = ['Available', 'Out of Stock', 'Discontinued'];
  for (const status_name of pStatuses) {
    const exists = await prisma.product_status.findFirst({ where: { status_name } });
    if (!exists) await prisma.product_status.create({ data: { status_name } });
  }

  // 5. Create Sample Product
  const category = await prisma.category.findFirst();
  const brand = await prisma.brand.findFirst();
  const unit = await prisma.unit_id.findFirst();
  const pType = await prisma.product_type.findFirst();
  const pStatus = await prisma.product_status.findFirst();

  if (category && brand && unit && pType && pStatus) {
    const productCode = 'P001';
    const existingProduct = await prisma.product.findUnique({ where: { product_code: productCode } });

    if (!existingProduct) {
      const newProduct = await prisma.product.create({
        data: {
          product_name: 'Sample T-Shirt',
          product_code: productCode,
          category_id: category.idcategory,
          brand_id: brand.idbrand,
          unit_id: unit.idunit_id,
          product_type_id: pType.idproduct_type,
          product_variations: {
            create: [
              {
                barcode: '1234567890123',
                color: 'Red',
                size: 'L',
                storage_capacity: 'N/A',
                product_status_id: pStatus.idproduct_status
              },
              {
                barcode: '1234567890124',
                color: 'Blue',
                size: 'M',
                storage_capacity: 'N/A',
                product_status_id: pStatus.idproduct_status
              }
            ]
          }
        }
      });
      console.log(`Created product: ${newProduct.product_name}`);
    }
  }

  // 6. Cash Session Setup
  const cashStatuses = ['Open', 'Closed', 'Paused'];
  for (const cash_status of cashStatuses) {
    const exists = await prisma.cash_status.findFirst({ where: { cash_status } });
    if (!exists) await prisma.cash_status.create({ data: { cash_status } });
  }

  const counters = ['Counter 1', 'Counter 2'];
  for (const cashier_counter of counters) {
    const exists = await prisma.cashier_counters.findFirst({ where: { cashier_counter } });
    if (!exists) await prisma.cashier_counters.create({ data: { cashier_counter } });
  }

  // 7. Payment Types (Cash, Card, Cheque, Online)
  // 7. Payment Types (Cash, Card, Cheque, Online)
  const paymentTypes = ['Cash', 'Card', 'Cheque', 'Online'];
  for (const pType of paymentTypes) {
    const exists = await prisma.payment_types.findFirst({ where: { payment_types: pType } });
    if (!exists) {
      await prisma.payment_types.create({ data: { payment_types: pType } });
      console.log(`Created payment type: ${pType}`);
    }
  }

  // 8. Invoice Types (Sales, Return)
  const invoiceTypes = ['Sales', 'Return'];
  for (const iType of invoiceTypes) {
     const exists = await prisma.invoice_type.findFirst({ where: { Invoice_type: iType } });
     if (!exists) {
       await prisma.invoice_type.create({ data: { Invoice_type: iType } });
       console.log(`Created invoice type: ${iType}`);
     }
  }

  // 9. Exchange Types (Cash In, Cash Out)
  const exchangeTypes = [
    { id: 1, name: 'Cash In' },
    { id: 2, name: 'Cash Out' }
  ];
  for (const item of exchangeTypes) {
    const exists = await prisma.exchange_type.findUnique({ where: { id: item.id } });
    if (!exists) {
      await prisma.exchange_type.create({ data: { id: item.id, exchange_type: item.name } });
      console.log(`Created exchange type: ${item.name}`);
    }
  }

  // 10. Return Statuses (Pending, Completed, etc.)
  const returnStatuses = ['Pending', 'Completed', 'Rejected'];
  for (const rs of returnStatuses) {
     const exists = await prisma.return_status.findFirst({ where: { return_status: rs } });
     if (!exists) {
       await prisma.return_status.create({ data: { return_status: rs } });
       console.log(`Created return status: ${rs}`);
     }
  }

  console.log('Seeding finished.');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
