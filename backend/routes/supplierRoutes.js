const express = require('express');
const router = express.Router();
const supplierController = require('../controllers/supplierController');

//add companies and get companies
router.post('/companies', supplierController.addCompany);
router.get('/companies', supplierController.searchCompany);
//get banks
router.get('/banks', supplierController.searchBank);

//add supplier and get suppliers
router.post('/add', supplierController.addSupplier);
router.get('/list', supplierController.getSuppliers);
router.patch('/update-contact/:id', supplierController.updateSupplierContact);

module.exports = router;