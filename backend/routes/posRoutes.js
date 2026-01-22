const express = require('express');
const router = express.Router();
const posConteroller = require('../controllers/posController');


// Route to get available products for POS
router.get('/products/available', posConteroller.getPOSProductsList);
// Route to search product by barcode
router.get('/products/barcode/:barcode', posConteroller.searchProductByBarcode);

// Route to create invoice
router.post('/invoice', posConteroller.createInvoice);
// Route to convert bulk stock to loose stock
router.post('/convert', posConteroller.convertBulkToLoose);
// Route to get invoice by invoice number
router.get('/invoice/:invoiceNo', posConteroller.getInvoice);
// Route to process return
router.post('/return', posConteroller.processReturn);

module.exports = router;