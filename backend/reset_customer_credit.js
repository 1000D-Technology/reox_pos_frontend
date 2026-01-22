const prisma = require('./config/prismaClient');

async function resetCustomerCredit() {
    try {
        const customerId = 1; // Ashan Himantha
        
        await prisma.customer.update({
            where: { id: customerId },
            data: { credit_balance: '0.00' }
        });
        
        console.log('✅ Customer credit balance reset to 0.00');
        
        // Also delete the credit book entries if needed
        await prisma.creadit_book.deleteMany({
            where: {
                invoice: {
                    customer_id: customerId
                }
            }
        });
        
        console.log('✅ Credit book entries cleared');
        
    } catch (error) {
        console.error('Error:', error);
    } finally {
        await prisma.$disconnect();
    }
}

resetCustomerCredit();
