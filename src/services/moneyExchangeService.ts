import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

export const moneyExchangeService = {
    getCurrentBalance: async () => {
        const response = await axios.get(`${API_URL}/api/money-exchange/balance`, {
            headers: {
                Authorization: `Bearer ${localStorage.getItem('token')}`
            }
        });
        return response.data;
    },

    createTransaction: async (data: {
        sessionId: number;
        transactionType: 'cash-in' | 'cash-out';
        amount: number;
        description: string;
    }) => {
        const response = await axios.post(`${API_URL}/api/money-exchange/transaction`, data, {
            headers: {
                Authorization: `Bearer ${localStorage.getItem('token')}`
            }
        });
        return response.data;
    },

    getTransactionHistory: async (sessionId?: number) => {
        const response = await axios.get(`${API_URL}/api/money-exchange/history`, {
            params: { sessionId },
            headers: {
                Authorization: `Bearer ${localStorage.getItem('token')}`
            }
        });
        return response.data;
    }
};
