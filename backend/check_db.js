const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function check() {
    try {
        console.log("Checking DB...");
        const roles = await prisma.role.findMany();
        console.log("Roles:", roles);
        const statuses = await prisma.status.findMany();
        console.log("Statuses:", statuses);
        const users = await prisma.user.findMany(); // Just count or show IDs
        console.log("Users count:", users.length);
    } catch (e) {
        console.error("Error:", e);
    } finally {
        await prisma.$disconnect();
    }
}

check();
