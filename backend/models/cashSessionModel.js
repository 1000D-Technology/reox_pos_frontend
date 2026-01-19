const pool = require('../config/db');

const cashSessionModel = {
    async checkActiveCashSession(userId, counterCode) {
        try {
            console.log('Checking session for:', { userId, counterCode });

            const [rows] = await pool.query(
                `SELECT cs.id, cs.opening_balance, cc.cashier_counter
                 FROM cash_sessions cs
                          JOIN cashier_counters cc ON cs.cashier_counters_id = cc.id
                 WHERE cs.user_id = ?
                   AND cc.cashier_counter = ?
                   AND DATE(cs.opening_date_time) = CURDATE()
                   AND cs.cash_status_id = 1
                     LIMIT 1`,
                [userId, counterCode]
            );

            console.log('Found session:', rows.length > 0 ? rows[0] : 'No session');
            return rows.length > 0 ? rows[0] : null;
        } catch (error) {
            console.error('Error checking cash session:', error);
            throw error;
        }
    },

    async getCashierCounters() {
        try {
            const [rows] = await pool.query(
                'SELECT id, cashier_counter FROM cashier_counters ORDER BY cashier_counter'
            );
            return rows;
        } catch (error) {
            console.error('Error fetching cashier counters:', error);
            throw error;
        }
    },

    async createCashSession(session) {
        try {
            const now = new Date();
            const mysqlDatetime = now.getFullYear() + '-' +
                String(now.getMonth() + 1).padStart(2, '0') + '-' +
                String(now.getDate()).padStart(2, '0') + ' ' +
                String(now.getHours()).padStart(2, '0') + ':' +
                String(now.getMinutes()).padStart(2, '0') + ':' +
                String(now.getSeconds()).padStart(2, '0');

            const [result] = await pool.query(
                `INSERT INTO cash_sessions
                 (opening_date_time, user_id, opening_balance, cash_total, card_total,
                  bank_total, cashier_counters_id, cash_status_id)
                 VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
                [
                    mysqlDatetime,
                    session.user_id,
                    session.opening_balance,
                    session.cash_total,
                    session.card_total,
                    session.bank_total,
                    session.cashier_counter_id,
                    session.cash_status_id
                ]
            );
            return result.insertId;
        } catch (error) {
            console.error('Error creating cash session:', error);
            throw error;
        }
    }
};

module.exports = cashSessionModel;
