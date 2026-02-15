const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function clearAndResetDatabase() {
    try {
        console.log('🗑️  Starting database cleanup...\n');

        // Disable foreign key checks temporarily
        await prisma.$executeRawUnsafe('SET FOREIGN_KEY_CHECKS = 0;');

        // Clear all data in correct order
        console.log('Clearing all transaction data...');
        await prisma.credit_payment_history.deleteMany({});
        await prisma.invoice_payments.deleteMany({});
        await prisma.invoice_items.deleteMany({});
        await prisma.quotation_items.deleteMany({});
        await prisma.grn_items.deleteMany({});
        await prisma.grn_payments.deleteMany({});
        await prisma.return_goods.deleteMany({});
        await prisma.damaged.deleteMany({});
        await prisma.Return.deleteMany({});
        await prisma.money_exchange.deleteMany({});
        await prisma.creadit_book.deleteMany({});
        await prisma.invoice.deleteMany({});
        await prisma.quotation.deleteMany({});
        await prisma.grn.deleteMany({});
        await prisma.cash_sessions.deleteMany({});
        console.log('✅ Transaction data cleared');

        console.log('\nClearing product and stock data...');
        await prisma.stock.deleteMany({});
        await prisma.product_variations.deleteMany({});
        await prisma.product.deleteMany({});
        await prisma.batch.deleteMany({});
        console.log('✅ Product data cleared');

        console.log('\nClearing master data...');
        await prisma.customer.deleteMany({});
        await prisma.supplier.deleteMany({});
        await prisma.company.deleteMany({});
        await prisma.bank.deleteMany({});
        await prisma.category.deleteMany({});
        await prisma.brand.deleteMany({});
        await prisma.user.deleteMany({});
        console.log('✅ Master data cleared');

        console.log('\nClearing lookup tables...');
        await prisma.subscription.deleteMany({});
        await prisma.unit_id.deleteMany({});
        await prisma.reason.deleteMany({});
        await prisma.return_status.deleteMany({});
        await prisma.product_type.deleteMany({});
        await prisma.product_status.deleteMany({});
        await prisma.cashier_counters.deleteMany({});
        await prisma.cash_status.deleteMany({});
        await prisma.invoice_type.deleteMany({});
        await prisma.exchange_type.deleteMany({});
        await prisma.payment_types.deleteMany({});
        await prisma.role.deleteMany({});
        await prisma.status.deleteMany({});
        console.log('✅ Lookup tables cleared');

        // Reset all auto_increment counters to 1
        console.log('\nResetting auto_increment counters...');
        const tables = [
            'credit_payment_history', 'invoice_payments', 'invoice_items', 'quotation_items',
            'grn_items', 'grn_payments', 'return_goods', 'damaged', 'Return', 'money_exchange',
            'creadit_book', 'invoice', 'quotation', 'grn', 'cash_sessions',
            'stock', 'product_variations', 'product', 'batch',
            'customer', 'supplier', 'company', 'bank', 'category', 'brand', 'user',
            'subscription', 'unit_id', 'reason', 'return_status', 'product_type', 'product_status',
            'cashier_counters', 'cash_status', 'invoice_type', 'exchange_type', 'payment_types',
            'role', 'status'
        ];

        for (const table of tables) {
            try {
                await prisma.$executeRawUnsafe(`ALTER TABLE ${table} AUTO_INCREMENT = 1;`);
            } catch (error) {
                // Some tables might not have auto_increment, skip them
                console.log(`  ⚠️  Skipped ${table} (no auto_increment or error)`);
            }
        }
        console.log('✅ Auto_increment counters reset');

        // Re-enable foreign key checks
        await prisma.$executeRawUnsafe('SET FOREIGN_KEY_CHECKS = 1;');

        console.log('\n✅ Database completely cleared and reset!');
        console.log('📊 All data has been removed and IDs reset to 1.\n');

    } catch (error) {
        console.error('❌ Error clearing database:', error);
        throw error;
    } finally {
        await prisma.$disconnect();
    }
}

// Run the cleanup
clearAndResetDatabase()
    .then(() => {
        console.log('✅ Database reset completed!');
        console.log('💡 Run "npx prisma migrate reset" or "npx prisma db push" to recreate schema');
        console.log('💡 Then run seed scripts to populate with fresh data\n');
        process.exit(0);
    })
    .catch((error) => {
        console.error('❌ Failed:', error);
        process.exit(1);
    });
