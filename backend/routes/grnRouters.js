const express = require('express');
const router = express.Router();
const grnController = require('../controllers/grnController');

router.post('/add', grnController.saveGRN);
router.get('/payment-types', grnController.getPaymentTypes);

module.exports = router;