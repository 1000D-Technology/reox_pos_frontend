const express = require('express');
const router = express.Router();
const commonController = require('../controllers/commonController');

router.get('/categories', commonController.searchCategories);
router.get('/brands', commonController.searchBrands);
router.get('/units', commonController.getUnits);
router.get('/product-types', commonController.searchProductTypes);


//add unit
router.post('/units', commonController.addUnit);
router.get('/units', commonController.getUnits);
router.put('/units/:id', commonController.updateUnit);
router.delete('/units/:id', commonController.deleteUnit);

//add category
router.post('/categories', commonController.addCategory);
router.get('/categories', commonController.getCategories);
router.put('/categories/:id', commonController.updateCategory);
router.delete('/categories/:id', commonController.deleteCategory);

module.exports = router;