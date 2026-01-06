const express = require('express');
const router = express.Router();
const commonController = require('../controllers/commonController');

/**
 * @swagger
 * components:
 *   schemas:
 *     CommonItem:
 *       type: object
 *       properties:
 *         id:
 *           type: integer
 *           description: Item ID
 *         name:
 *           type: string
 *           description: Item name
 *         created_at:
 *           type: string
 *           format: date-time
 *           description: Creation timestamp
 *     
 *     CreateItemRequest:
 *       type: object
 *       required:
 *         - name
 *       properties:
 *         name:
 *           type: string
 *           description: Item name
 *           example: "Electronics"
 *     
 *     UpdateItemRequest:
 *       type: object
 *       required:
 *         - name
 *       properties:
 *         name:
 *           type: string
 *           description: Updated item name
 *           example: "Updated Electronics"
 *     
 *     SuccessResponse:
 *       type: object
 *       properties:
 *         success:
 *           type: boolean
 *           example: true
 *         message:
 *           type: string
 *         data:
 *           type: array
 *           items:
 *             $ref: '#/components/schemas/CommonItem'
 *     
 *     CreateSuccessResponse:
 *       type: object
 *       properties:
 *         success:
 *           type: boolean
 *           example: true
 *         message:
 *           type: string
 *         data:
 *           type: object
 *           properties:
 *             id:
 *               type: integer
 *             name:
 *               type: string
 *     
 *     ErrorResponse:
 *       type: object
 *       properties:
 *         success:
 *           type: boolean
 *           example: false
 *         message:
 *           type: string
 *         error:
 *           type: string
 *   
 *   parameters:
 *     SearchQuery:
 *       in: query
 *       name: q
 *       schema:
 *         type: string
 *       description: Search query string
 *       example: "electronics"
 *     
 *     ItemId:
 *       in: path
 *       name: id
 *       required: true
 *       schema:
 *         type: integer
 *       description: Item ID
 *       example: 1
 */

/**
 * @swagger
 * /api/common/categories/search:
 *   get:
 *     summary: Search categories by name
 *     tags: [Categories]
 *     parameters:
 *       - $ref: '#/components/parameters/SearchQuery'
 *     responses:
 *       200:
 *         description: Successfully retrieved categories
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/SuccessResponse'
 *             example:
 *               success: true
 *               data:
 *                 - id: 1
 *                   name: "Electronics"
 *                   created_at: "2024-01-01T12:00:00Z"
 *                 - id: 2
 *                   name: "Electronic Accessories"
 *                   created_at: "2024-01-02T12:00:00Z"
 *       500:
 *         description: Server error
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 */

/**
 * @swagger
 * /api/common/brands/search:
 *   get:
 *     summary: Search brands by name
 *     tags: [Brands]
 *     parameters:
 *       - $ref: '#/components/parameters/SearchQuery'
 *     responses:
 *       200:
 *         description: Successfully retrieved brands
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/SuccessResponse'
 *             example:
 *               success: true
 *               data:
 *                 - id: 1
 *                   name: "Apple"
 *                   created_at: "2024-01-01T12:00:00Z"
 *                 - id: 2
 *                   name: "Samsung"
 *                   created_at: "2024-01-02T12:00:00Z"
 *       500:
 *         description: Server error
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 */

/**
 * @swagger
 * /api/common/units/search:
 *   get:
 *     summary: Search units by name
 *     tags: [Units]
 *     parameters:
 *       - $ref: '#/components/parameters/SearchQuery'
 *     responses:
 *       200:
 *         description: Successfully retrieved units
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/SuccessResponse'
 *             example:
 *               success: true
 *               data:
 *                 - id: 1
 *                   name: "Piece"
 *                   created_at: "2024-01-01T12:00:00Z"
 *                 - id: 2
 *                   name: "Box"
 *                   created_at: "2024-01-02T12:00:00Z"
 *       500:
 *         description: Server error
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 */

/**
 * @swagger
 * /api/common/product-types/search:
 *   get:
 *     summary: Search product types by name
 *     tags: [Product Types]
 *     parameters:
 *       - $ref: '#/components/parameters/SearchQuery'
 *     responses:
 *       200:
 *         description: Successfully retrieved product types
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/SuccessResponse'
 *             example:
 *               success: true
 *               data:
 *                 - id: 1
 *                   name: "Mobile Phone"
 *                 - id: 2
 *                   name: "Laptop"
 *       500:
 *         description: Server error
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 */

/**
 * @swagger
 * /api/common/units:
 *   post:
 *     summary: Create a new unit
 *     tags: [Units]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/CreateItemRequest'
 *           example:
 *             name: "Kilogram"
 *     responses:
 *       201:
 *         description: Unit created successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/CreateSuccessResponse'
 *             example:
 *               success: true
 *               message: "Unit added successfully!"
 *               data:
 *                 id: 3
 *                 name: "Kilogram"
 *       400:
 *         description: Validation error or duplicate unit
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *             examples:
 *               missing_name:
 *                 summary: Missing unit name
 *                 value:
 *                   success: false
 *                   message: "Unit name is required"
 *               duplicate:
 *                 summary: Duplicate unit name
 *                 value:
 *                   success: false
 *                   message: "This unit already exists!"
 *       500:
 *         description: Server error
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *   
 *   get:
 *     summary: Get all units
 *     tags: [Units]
 *     responses:
 *       200:
 *         description: Successfully retrieved all units
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/SuccessResponse'
 *             example:
 *               success: true
 *               data:
 *                 - id: 1
 *                   name: "Piece"
 *                   created_at: "2024-01-01T12:00:00Z"
 *                 - id: 2
 *                   name: "Box"
 *                   created_at: "2024-01-02T12:00:00Z"
 *       500:
 *         description: Server error
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 */

/**
 * @swagger
 * /api/common/units/{id}:
 *   put:
 *     summary: Update a unit
 *     tags: [Units]
 *     parameters:
 *       - $ref: '#/components/parameters/ItemId'
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/UpdateItemRequest'
 *           example:
 *             name: "Updated Kilogram"
 *     responses:
 *       200:
 *         description: Unit updated successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 message:
 *                   type: string
 *                   example: "Unit updated successfully"
 *                 data:
 *                   type: object
 *                   properties:
 *                     id:
 *                       type: string
 *                     name:
 *                       type: string
 *       400:
 *         description: Validation error or duplicate unit
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *       404:
 *         description: Unit not found
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *             example:
 *               success: false
 *               message: "Unit not found"
 *       500:
 *         description: Server error
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *   
 *   delete:
 *     summary: Delete a unit
 *     tags: [Units]
 *     parameters:
 *       - $ref: '#/components/parameters/ItemId'
 *     responses:
 *       200:
 *         description: Unit deleted successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 message:
 *                   type: string
 *                   example: "Unit deleted successfully!"
 *       400:
 *         description: Unit is in use and cannot be deleted
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *             example:
 *               success: false
 *               message: "This unit is already assigned to products and cannot be deleted."
 *       500:
 *         description: Server error
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 */

/**
 * @swagger
 * /api/common/categories:
 *   post:
 *     summary: Create a new category
 *     tags: [Categories]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/CreateItemRequest'
 *           example:
 *             name: "Electronics"
 *     responses:
 *       201:
 *         description: Category created successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/CreateSuccessResponse'
 *             example:
 *               success: true
 *               message: "Category added successfully!"
 *               data:
 *                 id: 3
 *                 name: "Electronics"
 *       400:
 *         description: Validation error or duplicate category
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *             examples:
 *               missing_name:
 *                 summary: Missing category name
 *                 value:
 *                   success: false
 *                   message: "Category name is required"
 *               duplicate:
 *                 summary: Duplicate category name
 *                 value:
 *                   success: false
 *                   message: "This category already exists!"
 *       500:
 *         description: Server error
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *   
 *   get:
 *     summary: Get all categories
 *     tags: [Categories]
 *     responses:
 *       200:
 *         description: Successfully retrieved all categories
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/SuccessResponse'
 *             example:
 *               success: true
 *               data:
 *                 - id: 1
 *                   name: "Electronics"
 *                   created_at: "2024-01-01T12:00:00Z"
 *                 - id: 2
 *                   name: "Clothing"
 *                   created_at: "2024-01-02T12:00:00Z"
 *       500:
 *         description: Server error
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 */

/**
 * @swagger
 * /api/common/categories/{id}:
 *   put:
 *     summary: Update a category
 *     tags: [Categories]
 *     parameters:
 *       - $ref: '#/components/parameters/ItemId'
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/UpdateItemRequest'
 *           example:
 *             name: "Updated Electronics"
 *     responses:
 *       200:
 *         description: Category updated successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 message:
 *                   type: string
 *                   example: "Category updated successfully"
 *                 data:
 *                   type: object
 *                   properties:
 *                     id:
 *                       type: string
 *                     name:
 *                       type: string
 *       400:
 *         description: Validation error or duplicate category
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *       404:
 *         description: Category not found
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *             example:
 *               success: false
 *               message: "Category not found"
 *       500:
 *         description: Server error
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *   
 *   delete:
 *     summary: Delete a category
 *     tags: [Categories]
 *     parameters:
 *       - $ref: '#/components/parameters/ItemId'
 *     responses:
 *       200:
 *         description: Category deleted successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 message:
 *                   type: string
 *                   example: "Category deleted successfully!"
 *       400:
 *         description: Category is in use and cannot be deleted
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *             example:
 *               success: false
 *               message: "This category is already assigned to products and cannot be deleted."
 *       500:
 *         description: Server error
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 */

/**
 * @swagger
 * /api/common/brands:
 *   post:
 *     summary: Create a new brand
 *     tags: [Brands]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/CreateItemRequest'
 *           example:
 *             name: "Apple"
 *     responses:
 *       201:
 *         description: Brand created successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/CreateSuccessResponse'
 *             example:
 *               success: true
 *               message: "Brand added successfully!"
 *               data:
 *                 id: 3
 *                 name: "Apple"
 *       400:
 *         description: Validation error or duplicate brand
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *             examples:
 *               missing_name:
 *                 summary: Missing brand name
 *                 value:
 *                   success: false
 *                   message: "Brand name is required"
 *               duplicate:
 *                 summary: Duplicate brand name
 *                 value:
 *                   success: false
 *                   message: "This brand already exists!"
 *       500:
 *         description: Server error
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *   
 *   get:
 *     summary: Get all brands
 *     tags: [Brands]
 *     responses:
 *       200:
 *         description: Successfully retrieved all brands
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/SuccessResponse'
 *             example:
 *               success: true
 *               data:
 *                 - id: 1
 *                   name: "Apple"
 *                   created_at: "2024-01-01T12:00:00Z"
 *                 - id: 2
 *                   name: "Samsung"
 *                   created_at: "2024-01-02T12:00:00Z"
 *       500:
 *         description: Server error
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 */

/**
 * @swagger
 * /api/common/brands/{id}:
 *   put:
 *     summary: Update a brand
 *     tags: [Brands]
 *     parameters:
 *       - $ref: '#/components/parameters/ItemId'
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/UpdateItemRequest'
 *           example:
 *             name: "Updated Apple"
 *     responses:
 *       200:
 *         description: Brand updated successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 message:
 *                   type: string
 *                   example: "Brand updated successfully"
 *                 data:
 *                   type: object
 *                   properties:
 *                     id:
 *                       type: string
 *                     name:
 *                       type: string
 *       400:
 *         description: Validation error or duplicate brand
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *       404:
 *         description: Brand not found
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *             example:
 *               success: false
 *               message: "Brand not found"
 *       500:
 *         description: Server error
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *   
 *   delete:
 *     summary: Delete a brand
 *     tags: [Brands]
 *     parameters:
 *       - $ref: '#/components/parameters/ItemId'
 *     responses:
 *       200:
 *         description: Brand deleted successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 message:
 *                   type: string
 *                   example: "Brand deleted successfully!"
 *       400:
 *         description: Brand is in use and cannot be deleted
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *             example:
 *               success: false
 *               message: "This brand is already assigned to products and cannot be deleted."
 *       500:
 *         description: Server error
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 */

// Search endpoints (with query and limit)
router.get('/categories/search', commonController.searchCategories);
router.get('/brands/search', commonController.searchBrands);
router.get('/units/search', commonController.searchUnits);
router.get('/product-types/search', commonController.searchProductTypes);

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

//add brand
router.post('/brands', commonController.addBrand);
router.get('/brands', commonController.getBrands);
router.put('/brands/:id', commonController.updateBrand);
router.delete('/brands/:id', commonController.deleteBrand);

module.exports = router;