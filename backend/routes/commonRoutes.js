const express = require('express');
const router = express.Router();
const commonController = require('../controllers/commonController');

router.get('/categories', commonController.searchCategories);
router.get('/brands', commonController.searchBrands);
router.get('/units', commonController.getUnits);
router.get('/product-types', commonController.searchProductTypes);

module.exports = router;