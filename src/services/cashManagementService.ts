import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000';
const API_URL = `${API_BASE_URL}/api/cash-management`;

export interface CashBalance {
    opening_balance: number;
    cash_total: number;
    exchange_total: number;
    return_total: number;
    current_balance: number;
}

export interface MoneyExchange {
    id?: number;
    exchange_type_id: number;
    cash_session_id: number;
    amount: number;
    reason: string;
    datetime?: string;
    exchange_type?: string;
}

export interface ExchangeType {
    id: number;
    exchange_type: string;
}

export const cashManagementService = {
    async getCurrentBalance(cashSessionId: number): Promise<CashBalance> {
        const response = await axios.get(`${API_URL}/balance/${cashSessionId}`);
        return response.data;
    },

    async getActiveSession(counterCode: string, userId: number) {
        const response = await axios.get(`${API_URL}/active-session`, {
            params: { counterCode, userId }
        });
        return response.data;
    },

    async createMoneyExchange(data: MoneyExchange): Promise<{ id: number }> {
        const response = await axios.post(`${API_URL}/money-exchange`, data);
        return response.data;
    },

    async getMoneyExchangeHistory(cashSessionId: number): Promise<MoneyExchange[]> {
        const response = await axios.get(`${API_URL}/money-exchange/${cashSessionId}`);
        return response.data;
    },

    async getExchangeTypes(): Promise<ExchangeType[]> {
        const response = await axios.get(`${API_URL}/exchange-types`);
        return response.data;
    }
};
