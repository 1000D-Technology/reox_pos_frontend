const prisma = require('./config/prismaClient');

async function check() {
    try {
        const types = await prisma.exchange_type.findMany();
        console.log('Exchange Types:', types);
    } catch (e) {
        console.error(e);
    } finally {
        await prisma.$disconnect();
    }
}

check();
