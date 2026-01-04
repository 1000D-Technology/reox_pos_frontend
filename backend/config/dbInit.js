const db = require('./db');

const seedDatabase = async () => {
    try {
        const [rows] = await db.execute("SELECT COUNT(*) as count FROM product_status");
        
        if (rows[0].count === 0) {
            console.log("Seeding product status data...");
            await db.execute("INSERT INTO product_status (idproduct_status, status_name) VALUES (1, 'Active'), (2, 'Deactive')");
            console.log("Database seeded successfully!");
        }
    } catch (error) {
        console.error("Database seeding failed:", error.message);
    }
};

module.exports = seedDatabase;