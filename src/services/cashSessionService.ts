import axios from 'axios';

const API_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000';

export interface CashierCounter {
    id: number;
    cashier_counter: string;
}

export interface CashSession {
    id?: number;
    opening_date_time: string;
    user_id: number;
    opening_balance: number;
    cash_total: number;
    card_total: number;
    bank_total: number;
    cashier_counter_id: number;
    cash_status_id: number;
    close_datetime?: string;
}

export const cashSessionService = {
    async checkActiveCashSession(userId: number, date: string): Promise<boolean> {
        try {
            const response = await axios.get(`${API_URL}/api/cash-sessions/check`, {
                params: { user_id: userId, date }
            });
            return response.data.hasActiveSession;
        } catch (error) {
            console.error('Error checking cash session:', error);
            throw error;
        }
    },

    async getCashierCounters(): Promise<CashierCounter[]> {
        try {
            const response = await axios.get(`${API_URL}/api/cashier-counters`);
            return response.data;
        } catch (error) {
            console.error('Error fetching cashier counters:', error);
            throw error;
        }
    },

    async createCashSession(sessionData: Omit<CashSession, 'id' | 'close_datetime'>): Promise<void> {
        try {
            await axios.post(`${API_URL}/api/cash-sessions`, sessionData);
        } catch (error) {
            console.error('Error creating cash session:', error);
            throw error;
        }
    }
};