const cashSessionModel = require('../models/cashSessionModel');

const cashSessionController = {
    async checkActiveCashSession(req, res) {
        try {
            const { user_id, date } = req.query;

            if (!user_id || !date) {
                return res.status(400).json({
                    success: false,
                    message: 'User ID and date are required'
                });
            }

            const hasActiveSession = await cashSessionModel.checkActiveCashSession(
                parseInt(user_id),
                date
            );

            res.json({
                success: true,
                hasActiveSession
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
            res.status(500).json({
                success: false,
                message: 'Failed to fetch cashier counters'
            });
        }
    },

    async createCashSession(req, res) {
        try {
            const sessionData = req.body;

            if (!sessionData.user_id || !sessionData.cashier_counter_id) {
                return res.status(400).json({
                    success: false,
                    message: 'User ID and cashier counter ID are required'
                });
            }

            const sessionId = await cashSessionModel.createCashSession({
                opening_date_time: sessionData.opening_date_time || new Date().toISOString(),
                user_id: sessionData.user_id,
                opening_balance: sessionData.opening_balance || 0,
                cash_total: 0,
                card_total: 0,
                bank_total: 0,
                cashier_counter_id: sessionData.cashier_counter_id,
                cash_status_id: 1
            });

            res.status(201).json({
                success: true,
                message: 'Cash session created successfully',
                sessionId
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