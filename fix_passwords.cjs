const { PrismaClient } = require('./backend/node_modules/@prisma/client');
const bcrypt = require('./backend/node_modules/bcrypt');
const prisma = new PrismaClient();

async function main() {
    try {
        console.log('Updating user passwords...');
        
        const hash123456 = await bcrypt.hash('123456', 10);
        const hashKamal = await bcrypt.hash('Kamal12#', 10);

        // Update Admin (User 3)
        await prisma.user.update({
            where: { id: 3 },
            data: { password: hash123456 }
        });
        console.log('Updated Admin (123456)');

        // Update 1000D Technology (User 1)
        await prisma.user.update({
            where: { id: 1 },
            data: { password: hash123456 }
        });
        console.log('Updated 1000D Tech (123456)');

        // Update Kamal (User 2)
        await prisma.user.update({
            where: { id: 2 },
            data: { password: hashKamal }
        });
        console.log('Updated Kamal (Kamal12#)');

    } catch (error) {
        console.error('Error:', error);
    } finally {
        await prisma.$disconnect();
    }
}

main();
