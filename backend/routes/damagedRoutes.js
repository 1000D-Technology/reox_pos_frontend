const express = require('express');
const router = express.Router();
const damagedController = require('../controllers/damagedController');

router.post('/add', damagedController.createDamagedRecord);
router.get('/table-data', damagedController.getDamagedTableData);

router.get('/search', damagedController.searchDamaged);

module.exports = router;