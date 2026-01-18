const express = require('express');
const cashSessionController = require('../controllers/cashSessionController');

const router = express.Router();

router.get('/cash-sessions/check', cashSessionController.checkActiveCashSession);
router.get('/cashier-counters', cashSessionController.getCashierCounters);
router.post('/cash-sessions', cashSessionController.createCashSession);

module.exports = router;
