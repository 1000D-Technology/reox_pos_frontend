
const User = require('../models/userModel');
const bcrypt = require('bcrypt');
const catchAsync = require("../utils/catchAsync");
const { AppError } = require("../middleware/errorHandler");
const db = require('../config/db'); 

const userController = {
    addUser: catchAsync(async (req, res, next) => {
        const { name, email, contact, password, role } = req.body;

        // 1. Check if Email or Contact already exists in the DB
        const [existing] = await db.execute(
            'SELECT id FROM user WHERE email = ? OR contact = ?', 
            [email, contact]
        );

        if (existing.length > 0) {
            return next(new AppError("Email or Contact number already exists in the system.", 400));
        }

        // 2. Hash Password
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);

        // 3. Save to Database using Model
        const userId = await User.create({
            name,
            contact,
            email,
            password: hashedPassword,
            role
        });

        res.status(201).json({
            success: true,
            message: "User registered successfully.",
            data: { userId, name, email, role }
        });
    })
};

module.exports = userController;