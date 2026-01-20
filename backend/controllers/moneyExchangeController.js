const db = require('../config/db');

class MoneyExchangeController {
    constructor() {
        this.getCurrentBalance = this.getCurrentBalance.bind(this);
        this.createTransaction = this.createTransaction.bind(this);
        this.getTransactionHistory = this.getTransactionHistory.bind(this);
        this._getBalanceData = this._getBalanceData.bind(this);
    }

    async getCurrentBalance(req, res) {
        try {
            const userId = req.user.id;
            const today = new Date().toISOString().split('T')[0];

            // Get current session
            const [sessions] = await db.query(
                `SELECT id, opening_balance, cash_total
                 FROM cash_sessions
                 WHERE user_id = ? AND DATE(opening_date_time) = ? AND cash_status_id = 1
                 ORDER BY opening_date_time DESC LIMIT 1`,
                [userId, today]
            );

            if (sessions.length === 0) {
                return res.status(404).json({
                    success: false,
                    message: 'No active session found'
                });
            }

            const session = sessions[0];
            let currentBalance = parseFloat(session.opening_balance) + parseFloat(session.cash_total);

            // Get money exchange transactions for current session
            // exchange_type_id1: 1 = Cash In, 2 = Cash Out
            const [exchanges] = await db.query(
                `SELECT SUM(CASE WHEN exchange_type_id1 = 1 THEN amount ELSE -amount END) as exchange_total
                 FROM money_exchange
                 WHERE cash_sessions_id = ?`,
                [session.id]
            );

            const exchangeTotal = parseFloat(exchanges[0]?.exchange_total || 0);
            currentBalance += exchangeTotal;

            return res.json({
                success: true,
                data: {
                    sessionId: session.id,
                    openingBalance: session.opening_balance,
                    cashAmount: session.cash_total,
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
                'SELECT * FROM cash_sessions WHERE id = ? AND user_id = ? AND cash_status_id = 1',
                [sessionId, userId]
            );

            if (sessions.length === 0) {
                return res.status(403).json({
                    success: false,
                    message: 'Invalid or closed session'
                });
            }

            // Map transaction type to ID (1: Cash In, 2: Cash Out)
            const exchangeTypeId = transactionType === 'cash-in' ? 1 : 2;
            const now = new Date();
             const mysqlDatetime = now.getFullYear() + '-' +
                String(now.getMonth() + 1).padStart(2, '0') + '-' +
                String(now.getDate()).padStart(2, '0') + ' ' +
                String(now.getHours()).padStart(2, '0') + ':' +
                String(now.getMinutes()).padStart(2, '0') + ':' +
                String(now.getSeconds()).padStart(2, '0');

            // Insert transaction
            const [result] = await db.query(
                `INSERT INTO money_exchange (cash_sessions_id, exchange_type_id1, amount, reason, datetime)
                 VALUES (?, ?, ?, ?, ?)`,
                [sessionId, exchangeTypeId, amount, description || null, mysqlDatetime]
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

            // Note: money_exchange doesn't have created_by, it links to session which links to user.
            let query = `
                SELECT me.*, u.name as created_by_name, et.exchange_type as transaction_type
                FROM money_exchange me
                         INNER JOIN cash_sessions cs ON me.cash_sessions_id = cs.id
                         INNER JOIN user u ON cs.user_id = u.id
                         LEFT JOIN exchange_type et ON me.exchange_type_id1 = et.id
                WHERE cs.user_id = ?
            `;
            const params = [userId];

            if (sessionId) {
                query += ' AND me.cash_sessions_id = ?';
                params.push(sessionId);
            }

            query += ' ORDER BY me.datetime DESC';

            const [transactions] = await db.query(query, params);
            
            // Map keys to frontend expectation if needed (or frontend adapts)
            // Frontend likely expects: transaction_type (string), amount, description, created_at
            const mappedTransactions = transactions.map(t => ({
                id: t.id,
                session_id: t.cash_sessions_id,
                transaction_type: t.exchange_type_id1 === 1 ? 'cash-in' : 'cash-out', // Standardize for frontend
                amount: t.amount,
                description: t.reason,
                created_at: t.datetime,
                created_by_name: t.created_by_name
            }));

            return res.json({
                success: true,
                data: mappedTransactions
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
            `SELECT id, opening_balance, cash_total
             FROM cash_sessions
             WHERE user_id = ? AND DATE(opening_date_time) = ? AND cash_status_id = 1
             ORDER BY opening_date_time DESC LIMIT 1`,
            [userId, today]
        );

        if (sessions.length === 0) {
            throw new Error('No active session found');
        }

        const session = sessions[0];
        let currentBalance = parseFloat(session.opening_balance) + parseFloat(session.cash_total);

        const [exchanges] = await db.query(
            `SELECT SUM(CASE WHEN exchange_type_id1 = 1 THEN amount ELSE -amount END) as exchange_total
             FROM money_exchange
             WHERE cash_sessions_id = ?`,
            [session.id]
        );

        const exchangeTotal = parseFloat(exchanges[0]?.exchange_total || 0);
        currentBalance += exchangeTotal;

        return {
            sessionId: session.id,
            openingBalance: session.opening_balance,
            cashAmount: session.cash_total,
            exchangeTotal: exchangeTotal,
            currentBalance: currentBalance
        };
    }
}

module.exports = new MoneyExchangeController();
