const express = require('express');
const Subscription = require('../models/subscriptionModel');
const router = express.Router();

router.get('/status', async (req, res) => {
    try {
        const sub = await Subscription.getStatus();
        res.json({
            success: true,
            data: sub
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
});

module.exports = router;
