const express = require('express');
const router = express.Router();
const posConteroller = require('../controllers/posController');


// Route to get available products for POS
router.get('/products/available', posConteroller.getPOSProductsList);
// Route to search product by barcode
router.get('/products/barcode/:barcode', posConteroller.searchProductByBarcode);

module.exports = router;