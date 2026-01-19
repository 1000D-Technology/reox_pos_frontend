const pool = require('../config/db');

class CashManagementService {
    // Get current cash balance for a counter
    async getCurrentCashBalance(cashSessionId) {
        try {
            // Get cash session data
            const [session] = await pool.query(
                `SELECT opening_balance, cash_total
                 FROM cash_sessions
                 WHERE id = ?`,
                [cashSessionId]
            );

            if (!session.length) {
                throw new Error('Cash session not found');
            }

            // Get money exchange total
            // Cash In = positive, Cash Out = already stored as negative
            const [moneyExchange] = await pool.query(
                `SELECT COALESCE(SUM(amount), 0) as exchange_total
                 FROM money_exchange
                 WHERE cash_session_id = ?`,
                [cashSessionId]
            );

            // Get return goods total
            const [returnGoods] = await pool.query(
                `SELECT COALESCE(SUM(balance), 0) as return_total
                 FROM return_goods
                 WHERE cash_session_id = ?`,
                [cashSessionId]
            );

            // Calculate current balance
            const opening = parseFloat(session[0].opening_balance) || 0;
            const cashTotal = parseFloat(session[0].cash_total) || 0;
            const exchange = parseFloat(moneyExchange[0].exchange_total) || 0;
            const returns = parseFloat(returnGoods[0].return_total) || 0;

            const currentBalance = opening + cashTotal + exchange + returns;

            console.log('Balance calculation:', {
                opening,
                cashTotal,
                exchange,
                returns,
                currentBalance
            });

            return {
                opening_balance: opening,
                cash_total: cashTotal,
                exchange_total: exchange,
                return_total: returns,
                current_balance: currentBalance
            };
        } catch (error) {
            console.error('Error getting current cash balance:', error);
            throw error;
        }
    }

    // Get active cash session by counter and date
    async getActiveCashSession(counterCode, userId) {
        try {
            console.log('Searching for active session:', { counterCode, userId });

            const [sessions] = await pool.query(
                `SELECT cs.*, cc.cashier_counter
                 FROM cash_sessions cs
                 JOIN cashier_counters cc ON cs.cashier_counter_id = cc.id
                 WHERE cc.cashier_counter = ?
                 AND cs.user_id = ?
                 AND DATE(cs.opening_date_time) = CURDATE()
                 AND cs.cash_status_id = 1
                 ORDER BY cs.opening_date_time DESC
                 LIMIT 1`,
                [counterCode, userId]
            );

            const session = sessions[0] || null;
            console.log('Found session:', session ? {
                id: session.id,
                counter: session.cashier_counter,
                opening_balance: session.opening_balance
            } : 'No active session');

            return session;
        } catch (error) {
            console.error('Error getting active cash session:', error);
            throw error;
        }
    }

    // Create money exchange transaction
    async createMoneyExchange(data) {
        try {
            const now = new Date();
            const mysqlDatetime = now.toISOString().slice(0, 19).replace('T', ' ');

            // Determine if amount should be positive or negative
            // Cash In (id=1) = positive, Cash Out (id=2) = negative
            const amount = data.exchange_type_id === 2
                ? -Math.abs(data.amount)
                : Math.abs(data.amount);

            console.log('Creating money exchange:', {
                type: data.exchange_type_id === 1 ? 'Cash In' : 'Cash Out',
                amount,
                session: data.cash_session_id
            });

            const [result] = await pool.query(
                `INSERT INTO money_exchange
                     (exchange_type_id, cash_session_id, amount, reason, datetime)
                 VALUES (?, ?, ?, ?, ?)`,
                [
                    data.exchange_type_id,
                    data.cash_session_id,
                    amount,
                    data.reason,
                    mysqlDatetime
                ]
            );

            return result.insertId;
        } catch (error) {
            console.error('Error creating money exchange:', error);
            throw error;
        }
    }

    // Get all money exchange transactions for a session
    async getMoneyExchangeHistory(cashSessionId) {
        try {
            const [transactions] = await pool.query(
                `SELECT me.*, et.exchange_type
                 FROM money_exchange me
                          JOIN exchange_type et ON me.exchange_type_id = et.id
                 WHERE me.cash_session_id = ?
                 ORDER BY me.datetime DESC`,
                [cashSessionId]
            );

            return transactions;
        } catch (error) {
            console.error('Error getting money exchange history:', error);
            throw error;
        }
    }

    // Get exchange types
    async getExchangeTypes() {
        try {
            const [types] = await pool.query('SELECT * FROM exchange_type ORDER BY id');
            console.log('Exchange types:', types);
            return types;
        } catch (error) {
            console.error('Error getting exchange types:', error);
            throw error;
        }
    }
}

module.exports = new CashManagementService();
