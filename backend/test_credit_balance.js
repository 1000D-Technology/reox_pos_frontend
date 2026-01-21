const prisma = require('./config/prismaClient');

async function testCreditBalanceCalculation() {
    try {
        console.log('🧪 Testing Credit Balance Calculation\n');
        
        // Get all customers with their credit balances
        const customers = await prisma.customer.findMany({
            include: {
                status: {
                    select: {
                        ststus: true
                    }
                },
                invoice: {
                    include: {
                        creadit_book: true
                    }
                }
            },
            take: 5
        });

        console.log(`Found ${customers.length} customers:\n`);

        customers.forEach(customer => {
            // Calculate credit balance from creadit_book
            const creditBalance = customer.invoice.reduce((total, inv) => {
                const invoiceCredit = inv.creadit_book.reduce((sum, cb) => sum + cb.balance, 0);
                return total + invoiceCredit;
            }, 0);

            console.log(`📋 Customer: ${customer.name}`);
            console.log(`   Contact: ${customer.contact}`);
            console.log(`   Total Invoices: ${customer.invoice.length}`);
            console.log(`   Credit Balance: Rs ${creditBalance.toFixed(2)}`);
            
            if (customer.invoice.length > 0) {
                console.log(`   Invoice Details:`);
                customer.invoice.forEach(inv => {
                    const invCredit = inv.creadit_book.reduce((sum, cb) => sum + cb.balance, 0);
                    if (invCredit !== 0) {
                        console.log(`     - Invoice #${inv.id}: Rs ${invCredit.toFixed(2)}`);
                    }
                });
            }
            console.log('');
        });

        console.log('✅ Test completed successfully!');
        
    } catch (error) {
        console.error('❌ Error:', error);
    } finally {
        await prisma.$disconnect();
    }
}

testCreditBalanceCalculation();
