const db = require('../config/db');

class MoneyExchangeController {
    async getCurrentBalance(req, res) {
        try {
            const userId = req.user.id;
            const today = new Date().toISOString().split('T')[0];

            // Get current session
            const [sessions] = await db.query(
                `SELECT id, opening_balance, cash_amount
                 FROM cash_sessions
                 WHERE user_id = ? AND DATE(created_at) = ? AND status = 'open'
                 ORDER BY created_at DESC LIMIT 1`,
                [userId, today]
            );

            if (sessions.length === 0) {
                return res.status(404).json({
                    success: false,
                    message: 'No active session found'
                });
            }

            const session = sessions[0];
            let currentBalance = session.opening_balance + session.cash_amount;

            // Get money exchange transactions for current session
            const [exchanges] = await db.query(
                `SELECT SUM(CASE WHEN transaction_type = 'cash-in' THEN amount ELSE -amount END) as exchange_total
                 FROM money_exchange
                 WHERE session_id = ?`,
                [session.id]
            );

            const exchangeTotal = exchanges[0]?.exchange_total || 0;
            currentBalance += exchangeTotal;

            return res.json({
                success: true,
                data: {
                    sessionId: session.id,
                    openingBalance: session.opening_balance,
                    cashAmount: session.cash_amount,
                    exchangeTotal: exchangeTotal,
                    currentBalance: currentBalance
                }
            });
        } catch (error) {
            console.error('Get balance error:', error);
            return res.status(500).json({
                success: false,
                message: 'Failed to get current balance',
                error: error.message
            });
        }
    }

    async createTransaction(req, res) {
        try {
            const { sessionId, transactionType, amount, description } = req.body;
            const userId = req.user.id;

            if (!sessionId || !transactionType || !amount) {
                return res.status(400).json({
                    success: false,
                    message: 'Missing required fields'
                });
            }

            if (amount <= 0) {
                return res.status(400).json({
                    success: false,
                    message: 'Amount must be greater than 0'
                });
            }

            // Verify session belongs to user and is open
            const [sessions] = await db.query(
                'SELECT * FROM cash_sessions WHERE id = ? AND user_id = ? AND status = "open"',
                [sessionId, userId]
            );

            if (sessions.length === 0) {
                return res.status(403).json({
                    success: false,
                    message: 'Invalid or closed session'
                });
            }

            // Insert transaction
            const [result] = await db.query(
                `INSERT INTO money_exchange (session_id, transaction_type, amount, description, created_by)
                 VALUES (?, ?, ?, ?, ?)`,
                [sessionId, transactionType, amount, description || null, userId]
            );

            // Get updated balance
            const balanceData = await this._getBalanceData(userId);

            return res.json({
                success: true,
                message: `${transactionType === 'cash-in' ? 'Cash in' : 'Cash out'} recorded successfully`,
                data: {
                    transactionId: result.insertId,
                    ...balanceData
                }
            });
        } catch (error) {
            console.error('Create transaction error:', error);
            return res.status(500).json({
                success: false,
                message: 'Failed to record transaction',
                error: error.message
            });
        }
    }

    async getTransactionHistory(req, res) {
        try {
            const userId = req.user.id;
            const { sessionId } = req.query;

            let query = `
                SELECT me.*, u.username as created_by_name
                FROM money_exchange me
                         LEFT JOIN users u ON me.created_by = u.id
                         INNER JOIN cash_sessions cs ON me.session_id = cs.id
                WHERE cs.user_id = ?
            `;
            const params = [userId];

            if (sessionId) {
                query += ' AND me.session_id = ?';
                params.push(sessionId);
            }

            query += ' ORDER BY me.created_at DESC';

            const [transactions] = await db.query(query, params);

            return res.json({
                success: true,
                data: transactions
            });
        } catch (error) {
            console.error('Get history error:', error);
            return res.status(500).json({
                success: false,
                message: 'Failed to get transaction history',
                error: error.message
            });
        }
    }

    // Helper method to get balance data
    async _getBalanceData(userId) {
        const today = new Date().toISOString().split('T')[0];

        const [sessions] = await db.query(
            `SELECT id, opening_balance, cash_amount
             FROM cash_sessions
             WHERE user_id = ? AND DATE(created_at) = ? AND status = 'open'
             ORDER BY created_at DESC LIMIT 1`,
            [userId, today]
        );

        if (sessions.length === 0) {
            throw new Error('No active session found');
        }

        const session = sessions[0];
        let currentBalance = session.opening_balance + session.cash_amount;

        const [exchanges] = await db.query(
            `SELECT SUM(CASE WHEN transaction_type = 'cash-in' THEN amount ELSE -amount END) as exchange_total
             FROM money_exchange
             WHERE session_id = ?`,
            [session.id]
        );

        const exchangeTotal = exchanges[0]?.exchange_total || 0;
        currentBalance += exchangeTotal;

        return {
            sessionId: session.id,
            openingBalance: session.opening_balance,
            cashAmount: session.cash_amount,
            exchangeTotal: exchangeTotal,
            currentBalance: currentBalance
        };
    }
}

module.exports = new MoneyExchangeController();
