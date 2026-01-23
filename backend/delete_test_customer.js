const prisma = require('./config/prismaClient');

async function deleteCustomer() {
    try {
        const contact = '0701705553';
        
        // Delete the customer
        const deleted = await prisma.customer.deleteMany({
            where: { contact }
        });
        
        if (deleted.count > 0) {
            console.log(`✅ Successfully deleted ${deleted.count} customer(s) with contact: ${contact}`);
        } else {
            console.log(`❌ No customer found with contact: ${contact}`);
        }
        
    } catch (error) {
        console.error('❌ Error deleting customer:', error);
    } finally {
        await prisma.$disconnect();
    }
}

deleteCustomer();
