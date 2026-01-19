const cashSessionModel = require('../models/cashSessionModel');

const cashSessionController = {
    async checkActiveCashSession(req, res) {
        try {
            const { userId, counterCode } = req.query;

            if (!userId || !counterCode) {
                return res.status(400).json({
                    success: false,
                    message: 'User ID and Counter Code are required'
                });
            }

            const session = await cashSessionModel.checkActiveCashSession(
                parseInt(userId),
                counterCode
            );

            res.json({
                success: true,
                hasActiveSession: !!session,
                session: session
            });
        } catch (error) {
            console.error('Error checking cash session:', error);
            res.status(500).json({
                success: false,
                message: 'Failed to check cash session'
            });
        }
    },

    async getCashierCounters(req, res) {
        try {
            const counters = await cashSessionModel.getCashierCounters();
            res.json(counters);
        } catch (error) {
            console.error('Error fetching cashier counters:', error);
            res.status(500).json({ error: 'Failed to fetch cashier counters' });
        }
    },

    async createCashSession(req, res) {
        try {
            const sessionId = await cashSessionModel.createCashSession(req.body);
            res.status(201).json({
                success: true,
                sessionId,
                message: 'Cash session created successfully'
            });
        } catch (error) {
            console.error('Error creating cash session:', error);
            res.status(500).json({
                success: false,
                message: 'Failed to create cash session'
            });
        }
    }
};

module.exports = cashSessionController;
