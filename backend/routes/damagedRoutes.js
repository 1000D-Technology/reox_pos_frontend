const express = require('express');
const router = express.Router();
const damagedController = require('../controllers/damagedController');

router.post('/add', damagedController.createDamagedRecord);

module.exports = router;