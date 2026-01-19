const cashManagementService = require('../services/cashManagementService');

class CashManagementController {
    async getCurrentBalance(req, res) {
        try {
            const { cashSessionId } = req.params;
            const balance = await cashManagementService.getCurrentCashBalance(cashSessionId);
            res.json(balance);
        } catch (error) {
            console.error('Error in getCurrentBalance:', error);
            res.status(500).json({ error: error.message });
        }
    }

    async getActiveSession(req, res) {
        try {
            const { counterCode, userId } = req.query;
            const session = await cashManagementService.getActiveCashSession(counterCode, userId);
            res.json(session);
        } catch (error) {
            console.error('Error in getActiveSession:', error);
            res.status(500).json({ error: error.message });
        }
    }

    async createMoneyExchange(req, res) {
        try {
            const id = await cashManagementService.createMoneyExchange(req.body);
            res.status(201).json({ id, message: 'Transaction created successfully' });
        } catch (error) {
            console.error('Error in createMoneyExchange:', error);
            res.status(500).json({ error: error.message });
        }
    }

    async getMoneyExchangeHistory(req, res) {
        try {
            const { cashSessionId } = req.params;
            const history = await cashManagementService.getMoneyExchangeHistory(cashSessionId);
            res.json(history);
        } catch (error) {
            console.error('Error in getMoneyExchangeHistory:', error);
            res.status(500).json({ error: error.message });
        }
    }

    async getExchangeTypes(req, res) {
        try {
            const types = await cashManagementService.getExchangeTypes();
            res.json(types);
        } catch (error) {
            console.error('Error in getExchangeTypes:', error);
            res.status(500).json({ error: error.message });
        }
    }
}

module.exports = new CashManagementController();
