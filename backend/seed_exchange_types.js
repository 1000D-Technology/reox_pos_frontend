const prisma = require('./config/prismaClient');

async function seed() {
    try {
        console.log('Seeding Exchange Types...');
        // Create Cash In (ID 1)
        const type1 = await prisma.exchange_type.upsert({
            where: { id: 1 },
            update: { exchange_type: 'Cash In' },
            create: { id: 1, exchange_type: 'Cash In' }
        });
        console.log('Upserted ID 1:', type1);
        
        // Create Cash Out (ID 2)
        const type2 = await prisma.exchange_type.upsert({
            where: { id: 2 },
            update: { exchange_type: 'Cash Out' },
            create: { id: 2, exchange_type: 'Cash Out' }
        });
        console.log('Upserted ID 2:', type2);

        console.log('Seeding completed');
    } catch (e) {
        console.error('Error seeding exchange types:', e);
    } finally {
        await prisma.$disconnect();
    }
}
seed();
