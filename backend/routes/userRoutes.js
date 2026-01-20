const express = require('express');
const router = express.Router();
const userController = require('../controllers/userController');
const { validateUser } = require('../middleware/userValidator');

// Route for adding a new user
router.post('/add', validateUser, userController.addUser);

module.exports = router;