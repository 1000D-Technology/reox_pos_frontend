const prisma = require('./config/prismaClient');

async function checkCustomerSchema() {
    try {
        // Try to get a customer to see what fields exist
        const customer = await prisma.customer.findFirst();
        
        if (customer) {
            console.log('✅ Customer table structure:');
            console.log(JSON.stringify(customer, null, 2));
            console.log('\n📋 Fields:', Object.keys(customer));
        } else {
            console.log('❌ No customers found in database');
        }
        
    } catch (error) {
        console.error('Error:', error.message);
    } finally {
        await prisma.$disconnect();
    }
}

checkCustomerSchema();
