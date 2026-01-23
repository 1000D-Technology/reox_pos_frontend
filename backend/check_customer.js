const prisma = require('./config/prismaClient');

async function checkCustomer() {
    try {
        const customer = await prisma.customer.findFirst({
            where: { contact: '0701705553' }
        });
        
        if (customer) {
            console.log('✅ Customer found in database:');
            console.log(JSON.stringify(customer, null, 2));
        } else {
            console.log('❌ No customer found with contact: 0701705553');
        }
        
        // Also get all customers
        const allCustomers = await prisma.customer.findMany({
            select: {
                id: true,
                name: true,
                contact: true,
                email: true,
                credit_balance: true
            }
        });
        
        console.log('\n📋 All customers in database:');
        console.log(JSON.stringify(allCustomers, null, 2));
        
    } catch (error) {
        console.error('Error:', error);
    } finally {
        await prisma.$disconnect();
    }
}

checkCustomer();
