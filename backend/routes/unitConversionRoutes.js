const express = require('express');
const router = express.Router();
const { PrismaClient } = require('@prisma/client');
const catchAsync = require('../utils/catchAsync');
const { AppError } = require('../middleware/errorHandler');

const prisma = new PrismaClient();

/**
 * @desc    Get all unit conversions
 * @route   GET /api/unit-conversions
 */
router.get('/', catchAsync(async (req, res, next) => {
    // Use raw query since Prisma client hasn't been regenerated yet
    const conversions = await prisma.$queryRaw`
        SELECT 
            uc.id,
            uc.parent_unit_id,
            uc.child_unit_id,
            uc.conversion_factor,
            pu.name as parent_unit_name,
            cu.name as child_unit_name,
            uc.created_at
        FROM unit_conversions uc
        INNER JOIN unit_id pu ON uc.parent_unit_id = pu.idunit_id
        INNER JOIN unit_id cu ON uc.child_unit_id = cu.idunit_id
        ORDER BY pu.name, cu.name
    `;

    res.status(200).json({
        success: true,
        data: conversions
    });
}));

/**
 * @desc    Get conversions for a specific unit
 * @route   GET /api/unit-conversions/unit/:unitId
 */
router.get('/unit/:unitId', catchAsync(async (req, res, next) => {
    const { unitId } = req.params;
    
    const conversions = await prisma.$queryRaw`
        SELECT 
            uc.id,
            uc.parent_unit_id,
            uc.child_unit_id,
            uc.conversion_factor,
            pu.name as parent_unit_name,
            cu.name as child_unit_name
        FROM unit_conversions uc
        INNER JOIN unit_id pu ON uc.parent_unit_id = pu.idunit_id
        INNER JOIN unit_id cu ON uc.child_unit_id = cu.idunit_id
        WHERE uc.parent_unit_id = ${parseInt(unitId)} OR uc.child_unit_id = ${parseInt(unitId)}
        ORDER BY pu.name, cu.name
    `;

    res.status(200).json({
        success: true,
        data: conversions
    });
}));

/**
 * @desc    Create a new unit conversion
 * @route   POST /api/unit-conversions
 */
router.post('/', catchAsync(async (req, res, next) => {
    const { parent_unit_id, child_unit_id, conversion_factor } = req.body;

    // Validation
    if (!parent_unit_id || !child_unit_id || !conversion_factor) {
        return next(new AppError('Parent unit, child unit, and conversion factor are required', 400));
    }

    if (parent_unit_id === child_unit_id) {
        return next(new AppError('Parent unit and child unit cannot be the same', 400));
    }

    if (conversion_factor <= 0) {
        return next(new AppError('Conversion factor must be greater than 0', 400));
    }

    // Check if units exist
    const parentUnit = await prisma.$queryRaw`SELECT idunit_id FROM unit_id WHERE idunit_id = ${parseInt(parent_unit_id)}`;
    const childUnit = await prisma.$queryRaw`SELECT idunit_id FROM unit_id WHERE idunit_id = ${parseInt(child_unit_id)}`;

    if (!parentUnit || parentUnit.length === 0) {
        return next(new AppError('Parent unit not found', 404));
    }

    if (!childUnit || childUnit.length === 0) {
        return next(new AppError('Child unit not found', 404));
    }

    // Check if conversion already exists
    const existing = await prisma.$queryRaw`
        SELECT id FROM unit_conversions 
        WHERE parent_unit_id = ${parseInt(parent_unit_id)} 
        AND child_unit_id = ${parseInt(child_unit_id)}
    `;

    if (existing && existing.length > 0) {
        return next(new AppError('This unit conversion already exists', 400));
    }

    // Create conversion
    await prisma.$executeRaw`
        INSERT INTO unit_conversions (parent_unit_id, child_unit_id, conversion_factor)
        VALUES (${parseInt(parent_unit_id)}, ${parseInt(child_unit_id)}, ${parseFloat(conversion_factor)})
    `;

    res.status(201).json({
        success: true,
        message: 'Unit conversion created successfully'
    });
}));

/**
 * @desc    Update a unit conversion
 * @route   PUT /api/unit-conversions/:id
 */
router.put('/:id', catchAsync(async (req, res, next) => {
    const { id } = req.params;
    const { conversion_factor } = req.body;

    if (!conversion_factor || conversion_factor <= 0) {
        return next(new AppError('Conversion factor must be greater than 0', 400));
    }

    // Check if conversion exists
    const existing = await prisma.$queryRaw`SELECT id FROM unit_conversions WHERE id = ${parseInt(id)}`;

    if (!existing || existing.length === 0) {
        return next(new AppError('Unit conversion not found', 404));
    }

    // Update conversion
    await prisma.$executeRaw`
        UPDATE unit_conversions 
        SET conversion_factor = ${parseFloat(conversion_factor)}
        WHERE id = ${parseInt(id)}
    `;

    res.status(200).json({
        success: true,
        message: 'Unit conversion updated successfully'
    });
}));

/**
 * @desc    Delete a unit conversion
 * @route   DELETE /api/unit-conversions/:id
 */
router.delete('/:id', catchAsync(async (req, res, next) => {
    const { id } = req.params;

    // Check if conversion exists
    const existing = await prisma.$queryRaw`SELECT id FROM unit_conversions WHERE id = ${parseInt(id)}`;

    if (!existing || existing.length === 0) {
        return next(new AppError('Unit conversion not found', 404));
    }

    // Delete conversion
    await prisma.$executeRaw`DELETE FROM unit_conversions WHERE id = ${parseInt(id)}`;

    res.status(200).json({
        success: true,
        message: 'Unit conversion deleted successfully'
    });
}));

module.exports = router;
