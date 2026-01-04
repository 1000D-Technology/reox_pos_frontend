const express = require('express');
const router = express.Router();
const supplierController = require('../controllers/supplierController');

router.post('/companies', supplierController.addCompany);
router.get('/companies', supplierController.searchCompany);
router.get('/banks', supplierController.searchBank);

router.post('/add', supplierController.addSupplier);

module.exports = router;