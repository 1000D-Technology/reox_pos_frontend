import api from '../api/axiosConfig';

// Service for money exchange operations
export const moneyExchangeService = {
    getCurrentBalance: async () => {
        const response = await api.get('/money-exchange/balance');
        return response.data;
    },

    createTransaction: async (data: {
        sessionId: number;
        transactionType: 'cash-in' | 'cash-out';
        amount: number;
        description: string;
    }) => {
        const response = await api.post('/money-exchange/transaction', data);
        return response.data;
    },

    getTransactionHistory: async (sessionId?: number) => {
        const response = await api.get('/money-exchange/history', {
            params: { sessionId }
        });
        return response.data;
    }
};
