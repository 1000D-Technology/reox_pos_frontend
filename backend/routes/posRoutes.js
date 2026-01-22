const express = require('express');
const router = express.Router();
const posConteroller = require('../controllers/posController');


// Route to get available products for POS
router.get('/products/available', posConteroller.getPOSProductsList);
// Route to search product by barcode
router.get('/products/barcode/:barcode', posConteroller.searchProductByBarcode);
// Route to search product by name/code/barcode
router.get('/products/search', posConteroller.searchProducts);

// Invoice routes
router.post('/invoice', posConteroller.createInvoice);
router.get('/invoices', posConteroller.getAllInvoices);
router.get('/invoices/stats', posConteroller.getInvoiceStats);
router.get('/invoice/:invoiceNo', posConteroller.getInvoice);

// Route to convert bulk stock to loose stock
router.post('/convert', posConteroller.convertBulkToLoose);
// Route to process return
router.post('/return', posConteroller.processReturn);

module.exports = router;