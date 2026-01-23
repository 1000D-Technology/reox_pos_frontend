const prisma = require('./config/prismaClient');

async function checkAllInvoices() {
    try {
        const invoices = await prisma.invoice.findMany({
            orderBy: { id: 'desc' },
            take: 5,
            include: {
                invoice_items: true,
                invoice_payments: {
                    include: {
                        payment_types: true
                    }
                }
            }
        });
        
        console.log(`📋 Last ${invoices.length} Invoices:\n`);
        
        invoices.forEach((inv, index) => {
            console.log(`${index + 1}. Invoice #${inv.id} - ${inv.invoice_number}`);
            console.log(`   Sub Total: ${inv.sub_total}`);
            console.log(`   Discount: ${inv.discount}`);
            console.log(`   Total: ${inv.total}`);
            console.log(`   Items Count: ${inv.invoice_items.length}`);
            console.log(`   Payments Count: ${inv.invoice_payments.length}`);
            
            const totalPayments = inv.invoice_payments.reduce((sum, p) => sum + p.amount, 0);
            console.log(`   Total Paid: ${totalPayments}`);
            console.log(`   Balance: ${inv.total - totalPayments}`);
            console.log('');
        });
        
        // Check if there's a 4120 total anywhere
        const invoice4120 = await prisma.invoice.findFirst({
            where: { total: 4120 }
        });
        
        if (invoice4120) {
            console.log('⚠️  Found invoice with total 4120:');
            console.log(JSON.stringify(invoice4120, null, 2));
        } else {
            console.log('✅ No invoice found with total 4120');
        }
        
    } catch (error) {
        console.error('Error:', error);
    } finally {
        await prisma.$disconnect();
    }
}

checkAllInvoices();
