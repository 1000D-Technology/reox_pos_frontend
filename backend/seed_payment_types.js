const prisma = require('./config/prismaClient');

async function seed() {
    try {
        // Check if Bank exists
        const exists = await prisma.payment_types.findFirst({
            where: { payment_types: 'Bank' }
        });

        if (!exists) {
            await prisma.payment_types.create({
                data: { payment_types: 'Bank' }
            });
            console.log('✅ Added "Bank" payment type');
        } else {
            console.log('ℹ️ "Bank" payment type already exists');
        }

    } catch (e) {
        console.error('Error seeding payment types:', e);
    } finally {
        await prisma.$disconnect();
    }
}
seed();
