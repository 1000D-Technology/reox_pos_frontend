const prisma = require('../config/prismaClient');

const cashSessionModel = {
    async checkActiveCashSession(userId, counterCode) {
        try {
            console.log('Checking session for:', { userId, counterCode });

            const today = new Date();
            today.setHours(0, 0, 0, 0);
            const tomorrow = new Date(today);
            tomorrow.setDate(tomorrow.getDate() + 1);

            const session = await prisma.cash_sessions.findFirst({
                where: {
                    user_id: userId,
                    cashier_counters: {
                        cashier_counter: counterCode
                    },
                    opening_date_time: {
                        gte: today,
                        lt: tomorrow
                    },
                    cash_status_id: 1
                },
                include: {
                    cashier_counters: {
                        select: {
                            cashier_counter: true
                        }
                    }
                }
            });

            console.log('Found session:', session ? session : 'No session');
            
            if (session) {
                return {
                    id: session.id,
                    opening_balance: session.opening_balance,
                    cashier_counter: session.cashier_counters.cashier_counter
                };
            }
            
            return null;
        } catch (error) {
            console.error('Error checking cash session:', error);
            throw error;
        }
    },

    async getCashierCounters() {
        try {
            const counters = await prisma.cashier_counters.findMany({
                select: {
                    id: true,
                    cashier_counter: true
                },
                orderBy: {
                    cashier_counter: 'asc'
                }
            });
            return counters;
        } catch (error) {
            console.error('Error fetching cashier counters:', error);
            throw error;
        }
    },

    async createCashSession(session) {
        try {
            const result = await prisma.cash_sessions.create({
                data: {
                    opening_date_time: new Date(),
                    user_id: session.user_id,
                    opening_balance: session.opening_balance,
                    cash_total: session.cash_total,
                    card_total: session.card_total,
                    bank_total: session.bank_total,
                    cashier_counters_id: session.cashier_counter_id,
                    cash_status_id: session.cash_status_id
                }
            });
            return result.id;
        } catch (error) {
            console.error('Error creating cash session:', error);
            throw error;
        }
    }
};

module.exports = cashSessionModel;
