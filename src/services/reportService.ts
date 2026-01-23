import axios from 'axios';

const API_URL = 'http://localhost:5000/api/analytics';

export const reportService = {
    getDashboardData: async () => {
        const response = await axios.get(`${API_URL}/dashboard`);
        return response.data;
    },

    getDetailedDashboardData: async () => {
        const response = await axios.get(`${API_URL}/dashboard-detailed`);
        return response.data;
    },
    
    getFilteredReport: async (params: { dateFrom?: string; dateTo?: string; reportType?: string }) => {
        const response = await axios.get(`${API_URL}/filter`, { params });
        return response.data;
    }
};
