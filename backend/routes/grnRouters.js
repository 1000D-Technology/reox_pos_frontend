const express = require('express');
const router = express.Router();
const grnController = require('../controllers/grnController');
const grnMiddleware = require('../middleware/grnMiddleware');

//create GRN
router.post('/add', grnMiddleware.validateGRN, grnController.saveGRN);
//get GRN summary stats
router.get('/summary', grnController.getStats);
//get all GRN list
router.get('/list', grnController.getGRNList);
// Search 
router.get('/search', grnController.searchGRNList);

module.exports = router;