const db = require('./db');

const seedDatabase = async () => {
    try {
        // Seed status table
        const [statusRows] = await db.execute("SELECT COUNT(*) as count FROM status");
        
        if (statusRows[0].count === 0) {
            console.log("Seeding status data...");
            await db.execute("INSERT INTO status (id, ststus) VALUES (1, 'Active'), (2, 'Inactive')");
            console.log("Status seeded successfully!");
        }

        // Seed product status
        const [rows] = await db.execute("SELECT COUNT(*) as count FROM product_status");
        
        if (rows[0].count === 0) {
            console.log("Seeding product status data...");
            await db.execute("INSERT INTO product_status (idproduct_status, status_name) VALUES (1, 'Active'), (2, 'Deactive')");
            console.log("Product status seeded successfully!");
        }

        // Seed payment types
        const [paymentRows] = await db.execute("SELECT COUNT(*) as count FROM payment_types");
        
        if (paymentRows[0].count === 0) {
            console.log("Seeding payment types data...");
            await db.execute("INSERT INTO payment_types (payment_types) VALUES ('Cash'), ('Cheque'), ('Online'), ('Card')");
            console.log("Payment types seeded successfully!");
        }

        console.log("Database seeding completed!");
    } catch (error) {
        console.error("Database seeding failed:", error.message);
    }
};

module.exports = seedDatabase;