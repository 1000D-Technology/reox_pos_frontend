import api from '../api/axiosConfig';

const API_URL = '/analytics';

export const reportService = {
    getDashboardData: async () => {
        const response = await api.get(`${API_URL}/dashboard`);
        return response.data;
    },

    getDetailedDashboardData: async () => {
        const response = await api.get(`${API_URL}/dashboard-detailed`);
        return response.data;
    },
    
    getFilteredReport: async (params: { dateFrom?: string; dateTo?: string; reportType?: string }) => {
        const response = await api.get(`${API_URL}/filter`, { params });
        return response.data;
    }
};
