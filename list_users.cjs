const { PrismaClient } = require('./backend/node_modules/@prisma/client');
const prisma = new PrismaClient();

async function main() {
    try {
        console.log('Checking database users...');
        const users = await prisma.user.findMany({
            select: {
                id: true,
                name: true,
                contact: true,
                email: true,
                status_id: true,
                password: true
            }
        });
        console.log('Users found:', JSON.stringify(users, null, 2));
    } catch (error) {
        console.error('Error:', error);
    } finally {
        await prisma.$disconnect();
    }
}

main();
