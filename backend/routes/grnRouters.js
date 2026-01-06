const express = require('express');
const router = express.Router();
const grnController = require('../controllers/grnController');

//create GRN
router.post('/add', grnController.saveGRN);
//get payment types 
router.get('/payment-types', grnController.getPaymentTypes);
//get GRN summary stats
router.get('/summary', grnController.getStats);
//get all GRN list
router.get('/list', grnController.getGRNList);
// Search 
router.get('/search', grnController.searchGRNList);

module.exports = router;