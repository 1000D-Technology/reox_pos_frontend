const prisma = require('./config/prismaClient');

async function checkPaymentTypes() {
    try {
        const types = await prisma.payment_types.findMany();
        
        console.log('💳 Payment Types in Database:');
        types.forEach(type => {
            console.log(`  ID: ${type.id}, Name: "${type.payment_types}"`);
        });
        
    } catch (error) {
        console.error('Error:', error);
    } finally {
        await prisma.$disconnect();
    }
}

checkPaymentTypes();
