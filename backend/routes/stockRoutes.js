const express = require('express');
const router = express.Router();
const stockController = require('../controllers/stockController');

// Route to get stock data for the UI table
router.get('/', stockController.getStockList);
router.get('/search', stockController.getSearchStock);
router.get('/summary-cards', stockController.getSummaryCards);
router.get('/out-of-stock', stockController.getOutOfStockList);
router.get('/out-of-stock/search', stockController.getSearchOutOfStock);
router.get('/get-stock-by-variant/:variationId', stockController.getStockForProduct);
router.get('/low-stock', stockController.getLowStockList);
router.get('/low-stock/search', stockController.getFilteredLowStock);
router.get('/out-of-stock/summary', stockController.getOutOfStockDashboardSummary);

module.exports = router;

