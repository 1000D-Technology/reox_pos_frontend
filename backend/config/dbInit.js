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

        // Seed reason table
        const [reasonRows] = await db.execute("SELECT COUNT(*) as count FROM reason");
        
        if (reasonRows[0].count === 0) {
            console.log("Seeding reason data...");
            await db.execute(`INSERT INTO reason (id, reason) VALUES 
                (1, 'Transit damage'),
                (2, 'Handling damage'),
                (3, 'Packaging defect'),
                (4, 'Manufacturing defect'),
                (5, 'Expired product'),
                (6, 'Customer return'),
                (7, 'Improper storage'),
                (8, 'Supplier damage'),
                (9, 'Water damage'),
                (10, 'Theft damage')`);
            console.log("Reason data seeded successfully!");
        }
        // Seed return status table
        const [returnStatusRows] = await db.execute("SELECT COUNT(*) as count FROM return_status");
        
        if (returnStatusRows[0].count === 0) {
            console.log("Seeding return status data...");
            await db.execute(`INSERT INTO return_status (id, return_status) VALUES 
                (1, 'Pending Review'),
                (2, 'Confirmed'),
                (3, 'Disposed'),
                (4, 'Returned to Supplier')`);
            console.log("Return status data seeded successfully!");
        }

        // Seed bank table
        const [bankRows] = await db.execute("SELECT COUNT(*) as count FROM bank");
        
        if (bankRows[0].count === 0) {
            console.log("Seeding bank data...");
            await db.execute(`INSERT INTO bank (id, bank_name) VALUES 
                (1, 'Bank of Ceylon (BOC)'),
                (2, 'People\\'s Bank'),
                (3, 'National Savings Bank (NSB)'),
                (4, 'Commercial Bank of Ceylon'),
                (5, 'Hatton National Bank (HNB)'),
                (6, 'Sampath Bank'),
                (7, 'Seylan Bank'),
                (8, 'Nations Trust Bank (NTB)'),
                (9, 'DFCC Bank'),
                (10, 'NDB Bank'),
                (11, 'Pan Asia Bank'),
                (12, 'Amana Bank'),
                (13, 'Union Bank'),
                (14, 'Cargills Bank'),
                (15, 'SDB Bank (Sanasa Development Bank)'),
                (16, 'Regional Development Bank (RDB)'),
                (17, 'HDFC Bank'),
                (18, 'State Mortgage & Investment Bank (SMIB)'),
                (19, 'HSBC'),
                (20, 'Standard Chartered Bank')`);
            console.log("Bank data seeded successfully!");
        }

        // Seed product status
        const [productStatusRows] = await db.execute("SELECT COUNT(*) as count FROM product_status");
        
        if (productStatusRows[0].count === 0) {
            console.log("Seeding product status data...");
            await db.execute("INSERT INTO product_status (idproduct_status, status_name) VALUES (1, 'Active'), (2, 'Deactive')");
            console.log("Product status seeded successfully!");
        }

        console.log("Database seeding completed!");
    } catch (error) {
        console.error("Database seeding failed:", error.message);
    }
};

module.exports = seedDatabase;