const User = require('./models/userModel');
const prisma = require('./config/prismaClient'); // adjusted path if needed
const bcrypt = require('bcrypt');

async function testParam() {
    try {
        console.log("Testing User.create...");
        
        const password = "password123";
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, 10);

        const userData = {
            name: "Test User",
            contact: "0779999999",
            email: "test999@example.com",
            password: hashedPassword,
            role: 1 // Assuming Admin role ID 1 exists
        };

        const result = await User.create(userData);
        console.log("User created with ID:", result);
    } catch (e) {
        console.error("Caught Error:");
        console.error(e);
    } finally {
        await prisma.$disconnect();
    }
}

testParam();
