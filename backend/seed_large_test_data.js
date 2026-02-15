const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcrypt');
const prisma = new PrismaClient();

// Helper functions
function randomInt(min, max) {
    return Math.floor(Math.random() * (max - min + 1)) + min;
}

function randomFloat(min, max, decimals = 2) {
    return parseFloat((Math.random() * (max - min) + min).toFixed(decimals));
}

function randomDate(start, end) {
    return new Date(start.getTime() + Math.random() * (end.getTime() - start.getTime()));
}

function randomElement(array) {
    return array[Math.floor(Math.random() * array.length)];
}

const productNames = [
    'Rice', 'Sugar', 'Flour', 'Salt', 'Cooking Oil', 'Tea', 'Coffee', 'Milk Powder',
    'Bread', 'Biscuits', 'Noodles', 'Pasta', 'Spices', 'Soap', 'Shampoo', 'Toothpaste',
    'Detergent', 'Soft Drink', 'Juice', 'Water Bottle', 'Chips', 'Chocolate', 'Candy',
    'Eggs', 'Chicken', 'Fish', 'Vegetables', 'Fruits', 'Dairy Products', 'Frozen Foods',
    'Canned Goods', 'Snacks', 'Condiments', 'Sauces', 'Cereals', 'Nuts', 'Dried Fruits',
    'Baby Products', 'Pet Food', 'Stationery', 'Batteries', 'Light Bulbs', 'Tissues',
    'Paper Towels', 'Cleaning Supplies', 'Plastic Items', 'Kitchen Utensils', 'Glassware'
];

const brands = ['Fresh Mart', 'Golden Valley', 'Pure Essence', 'Home Choice', 'Daily Best', 'Premium Quality', 'Nature\'s Pride', 'Top Brand', 'Elite', 'Supreme'];
const categories = ['Groceries', 'Dairy', 'Beverages', 'Snacks', 'Household', 'Personal Care', 'Frozen', 'Bakery'];
const units = ['Pcs', 'Kg', 'L', 'Box', 'Bag', 'Pack', 'Bottle'];

const firstNames = ['Rajesh', 'Priya', 'Amit', 'Sunita', 'Vikram', 'Anjali', 'Suresh', 'Deepa', 'Ramesh', 'Kavita',
    'Anil', 'Meera', 'Ravi', 'Pooja', 'Sanjay', 'Neha', 'Manoj', 'Swati', 'Dinesh', 'Rekha'];
const lastNames = ['Kumar', 'Sharma', 'Patel', 'Singh', 'Reddy', 'Rao', 'Gupta', 'Verma', 'Mehta', 'Nair'];

const companyNames = ['Global Traders', 'Prime Wholesale', 'Best Imports', 'Quality Suppliers', 'Metro Distributors',
    'City Wholesalers', 'National Supplies', 'Elite Trading', 'Fast Logistics', 'Smart Distribution'];

const bankNames = ['Commercial Bank', 'People\'s Bank', 'Bank of Ceylon', 'Sampath Bank', 'HNB', 'NDB', 'DFCC', 'Seylan Bank'];

const reasonTexts = ['Damaged', 'Expired', 'Quality Issue', 'Wrong Item', 'Customer Complaint'];

async function main() {
    console.log('🌱 Starting comprehensive large test data seeding...\n');

    // Get references to lookup data
    const activeStatus = await prisma.status.findFirst({ where: { ststus: 'Active' } });
    const cashierRole = await prisma.role.findFirst({ where: { user_role: 'Cashier' } });
    const managerRole = await prisma.role.findFirst({ where: { user_role: 'Manager' } });
    const openCashStatus = await prisma.cash_status.findFirst({ where: { cash_status: 'Open' } });
    const closedCashStatus = await prisma.cash_status.findFirst({ where: { cash_status: 'Closed' } });
    const counter1 = await prisma.cashier_counters.findFirst();
    const salesInvoiceType = await prisma.invoice_type.findFirst({ where: { Invoice_type: 'Sales' } });
    const cashPayment = await prisma.payment_types.findFirst({ where: { payment_types: 'Cash' } });
    const cardPayment = await prisma.payment_types.findFirst({ where: { payment_types: 'Card' } });
    const bankPayment = await prisma.payment_types.findFirst({ where: { payment_types: 'Bank' } });
    const cashInExchange = await prisma.exchange_type.findFirst({ where: { exchange_type: 'Cash In' } });
    const cashOutExchange = await prisma.exchange_type.findFirst({ where: { exchange_type: 'Cash Out' } });
    const returnStatusPending = await prisma.return_status.findFirst({ where: { return_status: 'Pending' } });
    const returnStatusCompleted = await prisma.return_status.findFirst({ where: { return_status: 'Completed' } });
    const availableProductStatus = await prisma.product_status.findFirst({ where: { status_name: 'Available' } });

    if (!activeStatus || !openCashStatus || !counter1 || !salesInvoiceType || !cashPayment || !availableProductStatus) {
        console.error('❌ Required lookup data not found. Please run base seed first.');
        return;
    }

    // 1. Create Banks
    console.log('Creating banks...');
    const bankIds = [];
    for (const bankName of bankNames) {
        const existingBank = await prisma.bank.findFirst({ where: { bank_name: bankName } });
        if (existingBank) {
            bankIds.push(existingBank.id);
        } else {
            const bank = await prisma.bank.create({ data: { bank_name: bankName } });
            bankIds.push(bank.id);
        }
    }
    console.log(`✅ Created/Found ${bankIds.length} banks`);

    // 2. Create Companies (30)
    console.log('Creating 30 companies...');
    const companyIds = [];
    for (let i = 0; i < 30; i++) {
        const timestamp = Date.now();
        const company = await prisma.company.create({
            data: {
                company_name: `${randomElement(companyNames)} ${timestamp}-${i + 1}`,
                company_email: `contact${i + 1}-${timestamp}@company${i + 1}.com`,
                company_contact: `011${randomInt(1000000, 9999999)}`
            }
        });
        companyIds.push(company.id);
    }
    console.log(`✅ Created 30 companies`);

    // 3. Create Suppliers (100)
    console.log('Creating 100 suppliers...');
    const supplierIds = [];
    for (let i = 0; i < 100; i++) {
        const firstName = randomElement(firstNames);
        const lastName = randomElement(lastNames);
        const supplier = await prisma.supplier.create({
            data: {
                supplier_name: `${firstName} ${lastName}`,
                contact_number: `07${randomInt(10000000, 99999999)}`.substring(0, 10),
                email: `supplier${i + 1}@supply.com`,
                company_id: randomElement(companyIds),
                bank_id: randomElement(bankIds),
                account_number: `${randomInt(100000000, 999999999)}`,
                status_id: activeStatus.id
            }
        });
        supplierIds.push(supplier.id);
    }
    console.log(`✅ Created 100 suppliers`);

    // 4. Create Brands
    console.log('Creating brands...');
    const brandIds = [];
    for (const brandName of brands) {
        const brand = await prisma.brand.create({ data: { name: brandName } });
        brandIds.push(brand.idbrand);
    }
    console.log(`✅ Created ${brands.length} brands`);

    // 5. Create Categories
    console.log('Creating categories...');
    const categoryIds = [];
    for (const categoryName of categories) {
        const category = await prisma.category.create({ data: { name: categoryName } });
        categoryIds.push(category.idcategory);
    }
    console.log(`✅ Created ${categories.length} categories`);

    // 6. Create Units
    console.log('Creating units...');
    const unitIds = [];
    for (const unitName of units) {
        const existingUnit = await prisma.unit_id.findFirst({ where: { name: unitName } });
        if (existingUnit) {
            unitIds.push(existingUnit.idunit_id);
        } else {
            const unit = await prisma.unit_id.create({ data: { name: unitName } });
            unitIds.push(unit.idunit_id);
        }
    }
    console.log(`✅ Created/Found ${units.length} units`);

    // 7. Create Batches (50)
    console.log('Creating 50 batches...');
    const batchIds = [];
    for (let i = 1; i <= 50; i++) {
        const batch = await prisma.batch.create({
            data: {
                batch_name: `BATCH-${String(i).padStart(4, '0')}`,
                date_time: randomDate(new Date(2023, 0, 1), new Date())
            }
        });
        batchIds.push(batch.id);
    }
    console.log(`✅ Created 50 batches`);

    // 8. Create Products (150) with variations
    console.log('Creating 150 products with variations...');
    const productIds = [];
    const productVariationIds = [];
    const timestamp = Date.now();
    for (let i = 0; i < 150; i++) {
        const productName = `${randomElement(productNames)} ${randomElement(brands)} ${i + 1}`;
        const product = await prisma.product.create({
            data: {
                product_name: productName,
                product_code: `PROD-${timestamp}-${String(i + 1).padStart(6, '0')}`,
                brand_id: randomElement(brandIds),
                category_id: randomElement(categoryIds),
                unit_id: randomElement(unitIds),
                product_type_id: randomInt(1, 2)
            }
        });
        productIds.push(product.id);

        // Create a variation for each product
        const variation = await prisma.product_variations.create({
            data: {
                product_id: product.id,
                barcode: `BAR-${Date.now()}${randomInt(10000, 99999)}`,
                product_status_id: availableProductStatus.idproduct_status
            }
        });
        productVariationIds.push(variation.id);
    }
    console.log(`✅ Created 150 products with 150 variations`);

    // 9. Create Reasons
    console.log('Creating reasons...');
    const reasonIds = [];
    for (const reasonText of reasonTexts) {
        const existingReason = await prisma.reason.findFirst({ where: { reason: reasonText } });
        if (existingReason) {
            reasonIds.push(existingReason.id);
        } else {
            const reason = await prisma.reason.create({ data: { reason: reasonText } });
            reasonIds.push(reason.id);
        }
    }
    console.log(`✅ Created/Found ${reasonIds.length} reasons`);

    // 10. Create GRNs (1000) with items and stock
    console.log('Creating 1000 GRNs with items and stock...');
    const grnIds = [];
    let totalGrnItems = 0;
    let totalStockCreated = 0;

    for (let i = 0; i < 1000; i++) {
        if (i > 0 && i % 100 === 0) {
            console.log(`  Progress: ${i}/1000 GRNs created...`);
        }

        const numItems = randomInt(2, 10);
        let grnTotal = 0;
        const grnItemsData = [];

        // Prepare GRN items
        for (let item = 0; item < numItems; item++) {
            const variationId = randomElement(productVariationIds);
            const qty = randomFloat(10, 500);
            const costPrice = randomFloat(50, 1000);
            const mrp = costPrice * randomFloat(1.5, 2.5);
            const rsp = mrp * randomFloat(0.8, 0.95);
            const wsp = rsp * 0.9;
            const total = qty * costPrice;
            grnTotal += total;

            grnItemsData.push({
                variation_id: variationId,
                batch_id: randomElement(batchIds),
                barcode: `${Date.now()}${randomInt(10000, 99999)}`,
                qty,
                cost_price: costPrice,
                mrp,
                rsp,
                wsp,
                exp: randomDate(new Date(2025, 0, 1), new Date(2028, 11, 31)),
                mfd: randomDate(new Date(2023, 0, 1), new Date()),
                total
            });
        }

        const paidAmount = randomFloat(grnTotal * 0.3, grnTotal);
        const balance = grnTotal - paidAmount;

        // Create GRN
        const grn = await prisma.grn.create({
            data: {
                bill_number: `GRN-${String(i + 1).padStart(6, '0')}`,
                supplier_id: randomElement(supplierIds),
                total: grnTotal,
                paid_amount: paidAmount,
                balance: balance,
                grn_status_id: activeStatus.id,
                create_at: randomDate(new Date(2023, 6, 1), new Date())
            }
        });
        grnIds.push(grn.id);

        // Create GRN items and stock
        for (const itemData of grnItemsData) {
            // Create Stock from GRN
            const stock = await prisma.stock.create({
                data: {
                    product_variations_id: itemData.variation_id,
                    batch_id: itemData.batch_id,
                    barcode: itemData.barcode,
                    qty: itemData.qty,
                    cost_price: itemData.cost_price,
                    mrp: itemData.mrp,
                    rsp: itemData.rsp,
                    wsp: itemData.wsp,
                    exp: itemData.exp,
                    mfd: itemData.mfd
                }
            });
            totalStockCreated++;

            // Create GRN Item linked to stock
            await prisma.grn_items.create({
                data: {
                    grn_id: grn.id,
                    stock_id: stock.id,
                    qty: itemData.qty
                }
            });
            totalGrnItems++;
        }

        // Create GRN Payment if there's a paid amount
        if (paidAmount > 0) {
            await prisma.grn_payments.create({
                data: {
                    grn_id: grn.id,
                    payment_types_id: randomElement([cashPayment.id, bankPayment?.id].filter(Boolean)),
                    paid_amount: paidAmount
                }
            });
        }
    }
    console.log(`✅ Created 1000 GRNs with ${totalGrnItems} items and ${totalStockCreated} stock entries`);

    // 11. Create Customers (300)
    console.log('Creating 300 customers...');
    const customerIds = [];
    for (let i = 0; i < 300; i++) {
        const firstName = randomElement(firstNames);
        const lastName = randomElement(lastNames);
        const customer = await prisma.customer.create({
            data: {
                name: `${firstName} ${lastName}`,
                contact: `07${randomInt(10000000, 99999999)}`,
                email: `${firstName.toLowerCase()}.${lastName.toLowerCase()}${i}@example.com`,
                status_id: activeStatus.id
            }
        });
        customerIds.push(customer.id);
    }
    console.log(`✅ Created 300 customers`);

    // 12. Create Cashiers and Managers
    console.log('Creating users (cashiers and managers)...');
    const cashierIds = [];
    const managerIds = [];
    const passwordHash = await bcrypt.hash('123456', 10);

    // Get the max user ID to avoid conflicts
    const maxUser = await prisma.user.findFirst({ orderBy: { id: 'desc' } });
    let nextUserId = (maxUser?.id || 0) + 1;

    for (let i = 1; i <= 10; i++) {
        const cashier = await prisma.user.create({
            data: {
                id: nextUserId++,
                name: `Cashier ${i}`,
                contact: `077${String(1000000 + i).padStart(7, '0')}`,
                email: `cashier${i}@reox.com`,
                password: passwordHash,
                role_id: cashierRole.id,
                status_id: activeStatus.id,
                created_at: new Date()
            }
        });
        cashierIds.push(cashier.id);
    }

    for (let i = 1; i <= 3; i++) {
        const manager = await prisma.user.create({
            data: {
                id: nextUserId++,
                name: `Manager ${i}`,
                contact: `078${String(1000000 + i).padStart(7, '0')}`,
                email: `manager${i}@reox.com`,
                password: passwordHash,
                role_id: managerRole.id,
                status_id: activeStatus.id,
                created_at: new Date()
            }
        });
        managerIds.push(manager.id);
    }
    console.log(`✅ Created 10 cashiers and 3 managers`);

    // 13. Create Cash Sessions (20)
    console.log('Creating 20 cash sessions...');
    const sessionIds = [];
    for (let i = 0; i < 20; i++) {
        const session = await prisma.cash_sessions.create({
            data: {
                opening_date_time: randomDate(new Date(2024, 0, 1), new Date()),
                user_id: randomElement(cashierIds),
                opening_balance: randomFloat(5000, 20000),
                cash_total: 0,
                card_total: 0,
                bank_total: 0,
                cashier_counters_id: counter1.id,
                cash_status_id: i < 15 ? closedCashStatus?.id || openCashStatus.id : openCashStatus.id
            }
        });
        sessionIds.push(session.id);
    }
    console.log(`✅ Created 20 cash sessions`);

    // 14. Get all available stock
    console.log('Fetching stock for invoices...');
    const availableStock = await prisma.stock.findMany({ where: { qty: { gt: 0 } } });
    console.log(`✅ Found ${availableStock.length} stock items available`);

    // 15. Create Invoices (1500)
    console.log('Creating 1500 invoices with items...');
    const invoiceIds = [];
    let totalInvoiceItems = 0;

    for (let i = 0; i < 1500; i++) {
        if (i > 0 && i % 200 === 0) {
            console.log(`  Progress: ${i}/1500 invoices created...`);
        }

        const numItems = randomInt(1, 8);
        const invoiceStocks = [];
        let subtotal = 0;

        // Select random stock items
        for (let item = 0; item < numItems; item++) {
            const stock = randomElement(availableStock);

            if (stock && stock.qty > 0) {
                const qty = randomInt(1, Math.min(5, Math.floor(stock.qty)));
                const price = stock.rsp; // Use rsp (retail selling price)
                const discount = randomFloat(0, 10);
                const total = qty * price * (1 - discount / 100);

                invoiceStocks.push({ stock_id: stock.id, qty, price, discount, total });
                subtotal += total;
                stock.qty -= qty; // Update local stock
            }
        }

        if (invoiceStocks.length === 0) continue;

        const discountPercentage = randomFloat(0, 5);
        const extraDiscount = randomFloat(0, 50);
        const total = (subtotal * (1 - discountPercentage / 100)) - extraDiscount;
        const paidAmount = total;

        // Create invoice
        const invoice = await prisma.invoice.create({
            data: {
                invoice_number: `INV-${String(i + 1).padStart(8, '0')}`,
                sub_total: subtotal,
                discount: discountPercentage,
                extra_discount: extraDiscount,
                total: total,
                refunded_amount: 0,
                cash_sessions_id: randomElement(sessionIds),
                customer_id: Math.random() > 0.3 ? randomElement(customerIds) : null,
                invoice_type_id: salesInvoiceType.id,
                created_at: randomDate(new Date(2024, 0, 1), new Date())
            }
        });
        invoiceIds.push(invoice.id);

        // Create invoice items and update stock
        for (const item of invoiceStocks) {
            const discountAmount = (item.price * item.qty * item.discount) / 100;
            await prisma.invoice_items.create({
                data: {
                    invoice_id: invoice.id,
                    stock_id: item.stock_id,
                    qty: item.qty,
                    current_price: item.price,
                    discount_percentage: item.discount,
                    discount_amount: discountAmount,
                    returned_qty: 0
                }
            });

            await prisma.stock.update({
                where: { id: item.stock_id },
                data: { qty: { decrement: item.qty } }
            });
        }

        // Create payment record
        const paymentType = randomElement([cashPayment.id, cardPayment?.id, bankPayment?.id].filter(Boolean));
        await prisma.invoice_payments.create({
            data: { invoice_id: invoice.id, payment_types_id: paymentType, amount: paidAmount }
        });

        totalInvoiceItems += invoiceStocks.length;

        // Update cash session totals
        if (paymentType === cashPayment.id) {
            await prisma.cash_sessions.update({
                where: { id: invoice.cash_sessions_id },
                data: { cash_total: { increment: paidAmount } }
            });
        } else if (cardPayment && paymentType === cardPayment.id) {
            await prisma.cash_sessions.update({
                where: { id: invoice.cash_sessions_id },
                data: { card_total: { increment: paidAmount } }
            });
        } else if (bankPayment && paymentType === bankPayment.id) {
            await prisma.cash_sessions.update({
                where: { id: invoice.cash_sessions_id },
                data: { bank_total: { increment: paidAmount } }
            });
        }
    }
    console.log(`✅ Created 1500 invoices with ${totalInvoiceItems} invoice items`);

    // 16. Create Money Exchange (100)
    console.log('Creating 100 money exchange transactions...');
    for (let i = 0; i < 100; i++) {
        await prisma.money_exchange.create({
            data: {
                cash_sessions_id: randomElement(sessionIds),
                exchange_type_id1: randomElement([cashInExchange?.id, cashOutExchange?.id].filter(Boolean)),
                amount: randomFloat(1000, 50000),
                reason: randomElement(['Petty cash', 'Bank deposit', 'Expense payment', 'Cash withdrawal', 'Supplier payment', 'Utility bills']),
                datetime: randomDate(new Date(2024, 0, 1), new Date())
            }
        });
    }
    console.log(`✅ Created 100 money exchange transactions`);

    // 17. Create Quotations (150)
    console.log('Creating 150 quotations...');
    for (let i = 0; i < 150; i++) {
        const numItems = randomInt(2, 6);
        let quotSubTotal = 0;
        const quotItems = [];

        for (let j = 0; j < numItems; j++) {
            const stock = randomElement(availableStock);
            if (stock) {
                const qty = randomInt(1, 10);
                const price = stock.rsp; // Use rsp (retail selling price)
                const discountAmount = randomFloat(0, price * qty * 0.1);
                const total = (qty * price) - discountAmount;
                quotSubTotal += total;
                quotItems.push({ stock_id: stock.id, qty, price, discountAmount, total });
            }
        }

        if (quotItems.length > 0) {
            const overallDiscount = randomFloat(0, 5);
            const finalTotal = quotSubTotal * (1 - overallDiscount / 100);
            const createdDate = randomDate(new Date(2024, 0, 1), new Date());
            const validUntil = new Date(createdDate);
            validUntil.setDate(validUntil.getDate() + randomInt(7, 30));

            const quotation = await prisma.quotation.create({
                data: {
                    quotation_number: `QUOT-${String(i + 1).padStart(6, '0')}`,
                    sub_total: quotSubTotal,
                    discount: overallDiscount,
                    total: finalTotal,
                    customer_id: Math.random() > 0.2 ? randomElement(customerIds) : null,
                    created_at: createdDate,
                    valid_until: validUntil,
                    user_id: randomElement([...cashierIds, ...managerIds]),
                    remarks: Math.random() > 0.5 ? 'Bulk order discount available' : null
                }
            });

            for (const item of quotItems) {
                await prisma.quotation_items.create({
                    data: {
                        quotation_id: quotation.id,
                        stock_id: item.stock_id,
                        qty: item.qty,
                        price: item.price,
                        discount_amount: item.discountAmount,
                        total: item.total
                    }
                });
            }
        }
    }
    console.log(`✅ Created 150 quotations`);

    // 18. Create Damaged Goods (80)
    console.log('Creating 80 damaged goods records...');
    for (let i = 0; i < 80; i++) {
        const stock = randomElement(availableStock);
        if (stock && stock.qty > 0) {
            const damageQty = randomFloat(0.1, Math.min(5, stock.qty));
            await prisma.damaged.create({
                data: {
                    stock_id: stock.id,
                    qty: damageQty,
                    reason_id: randomElement(reasonIds),
                    description: `Damaged during ${randomElement(['storage', 'transport', 'handling', 'display'])}`,
                    date: randomDate(new Date(2024, 0, 1), new Date()),
                    return_status_id: randomElement([returnStatusPending?.id, returnStatusCompleted?.id].filter(Boolean))
                }
            });

            await prisma.stock.update({
                where: { id: stock.id },
                data: { qty: { decrement: damageQty } }
            });
            stock.qty -= damageQty;
        }
    }
    console.log(`✅ Created 80 damaged goods records`);

    // 19. Create Return Goods (50)
    console.log('Creating 50 return goods records...');
    for (let i = 0; i < 50; i++) {
        const invoiceId = randomElement(invoiceIds);
        await prisma.return_goods.create({
            data: {
                invoice_id: invoiceId,
                cash_sessions_id: randomElement(sessionIds),
                balance: randomFloat(100, 5000)
            }
        });
    }
    console.log(`✅ Created 50 return goods records`);

    // 20. Summary
    console.log('\n📊 === Comprehensive Seeding Summary ===');
    console.log(`✅ Banks: ${bankIds.length}`);
    console.log(`✅ Companies: 30`);
    console.log(`✅ Suppliers: 100`);
    console.log(`✅ Brands: ${brands.length}`);
    console.log(`✅ Categories: ${categories.length}`);
    console.log(`✅ Units: ${unitIds.length}`);
    console.log(`✅ Batches: 50`);
    console.log(`✅ Products: 150`);
    console.log(`✅ Product Variations: 150`);
    console.log(`✅ Reasons: ${reasonIds.length}`);
    console.log(`✅ GRNs: 1000`);
    console.log(`✅ GRN Items: ${totalGrnItems}`);
    console.log(`✅ Stock from GRNs: ${totalStockCreated}`);
    console.log(`✅ Customers: 300`);
    console.log(`✅ Cashiers: 10`);
    console.log(`✅ Managers: 3`);
    console.log(`✅ Cash Sessions: 20`);
    console.log(`✅ Invoices: 1500`);
    console.log(`✅ Invoice Items: ${totalInvoiceItems}`);
    console.log(`✅ Invoice Payments: 1500`);
    console.log(`✅ Money Exchange: 100`);
    console.log(`✅ Quotations: 150`);
    console.log(`✅ Damaged Goods: 80`);
    console.log(`✅ Return Goods: 50`);

    console.log('\n🎉 Comprehensive large test data seeding completed successfully!\n');
}

main()
    .catch((e) => {
        console.error('❌ Error during seeding:', e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
