import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000';
const API_URL = `${API_BASE_URL}/api`;

export interface CashierCounter {
    id: number;
    cashier_counter: string;
}

export interface CashSession {
    id: number;
    opening_balance: number;
    cashier_counter: string;
}

export const cashSessionService = {
    async checkActiveCashSession(userId: number, counterCode: string): Promise<{
        hasActiveSession: boolean;
        session?: CashSession;
    }> {
        const response = await axios.get(`${API_URL}/cash-sessions/check`, {
            params: { userId, counterCode }
        });
        return response.data;
    },

    async getCashierCounters(): Promise<CashierCounter[]> {
        const response = await axios.get(`${API_URL}/cashier-counters`);
        return response.data;
    },

    async createCashSession(sessionData: any): Promise<{ sessionId: number }> {
        const response = await axios.post(`${API_URL}/cash-sessions`, sessionData);
        return response.data;
    }
};
