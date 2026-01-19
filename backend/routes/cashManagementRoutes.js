const express = require('express');
const router = express.Router();
const cashManagementController = require('../controllers/cashManagementController');

router.get('/balance/:cashSessionId', cashManagementController.getCurrentBalance);
router.get('/active-session', cashManagementController.getActiveSession);
router.post('/money-exchange', cashManagementController.createMoneyExchange);
router.get('/money-exchange/:cashSessionId', cashManagementController.getMoneyExchangeHistory);
router.get('/exchange-types', cashManagementController.getExchangeTypes);

module.exports = router;
