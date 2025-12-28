const express = require('express');
const router = express.Router();
const productController = require('../controllers/productController');

/**
 * @swagger
 * /api/products/create:
 *   post:
 *     summary: Create a new product with variations
 *     tags: [Products]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               productData:
 *                 type: object
 *                 properties:
 *                   name:
 *                     type: string
 *                   code:
 *                     type: string
 *                   barcode:
 *                     type: string
 *                   categoryId:
 *                     type: integer
 *                   brandId:
 *                     type: integer
 *                   unitId:
 *                     type: integer
 *                   typeId:
 *                     type: integer
 *               variations:
 *                 type: array
 *                 items:
 *                   type: object
 *                   properties:
 *                     barcode:
 *                       type: string
 *                     color:
 *                       type: string
 *                     size:
 *                       type: string
 *                     capacity:
 *                       type: string
 *                     statusId:
 *                       type: integer
 *     responses:
 *       201:
 *         description: Product created successfully
 *       500:
 *         description: Server error
 */
router.post('/create', productController.addProduct);

module.exports = router;