const express = require('express');
const router = express.Router();
const stockController = require('../controllers/stockController');

// Route to get stock data for the UI table
router.get('/', stockController.getStockList);

module.exports = router;