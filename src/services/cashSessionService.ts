import api from '../api/axiosConfig';

// Service for cash session operations
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
        const response = await api.get('/cash-sessions/check', {
            params: { userId, counterCode }
        });
        return response.data;
    },

    async getCashierCounters(): Promise<CashierCounter[]> {
        const response = await api.get('/cashier-counters');
        return response.data;
    },

    async createCashSession(sessionData: any): Promise<{ sessionId: number }> {
        const response = await api.post('/cash-sessions', sessionData);
        return response.data;
    },

    async getAllSessions(params?: {
        date?: string;
        userId?: number;
        status?: number;
        fromDate?: string;
        toDate?: string;
        counterId?: number;
    }): Promise<any> {
        const response = await api.get('/cash-sessions', { params });
        return response.data;
    },

    async getSessionDetails(sessionId: number): Promise<any> {
        const response = await api.get(`/cash-sessions/${sessionId}`);
        return response.data;
    },

    async getAllUsers(): Promise<any> {
        const response = await api.get('/auth/users');
        return response.data;
    },

    async closeSession(sessionId: number, actualBalance: number): Promise<any> {
        const response = await api.put(`/cash-sessions/${sessionId}/close`, {
            actualBalance
        });
        return response.data;
    }
};
