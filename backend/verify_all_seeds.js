const prisma = require('./config/prismaClient');

async function check() {
    try {
        console.log('--- Checking Payment Types ---');
        const payments = await prisma.payment_types.findMany();
        console.table(payments);

        console.log('\n--- Checking Exchange Types ---');
        const exchanges = await prisma.exchange_type.findMany();
        console.table(exchanges);

    } catch (e) {
        console.error(e);
    } finally {
        await prisma.$disconnect();
    }
}
check();
