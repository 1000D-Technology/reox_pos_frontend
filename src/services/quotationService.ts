import axiosInstance from "../api/axiosInstance";

export const quotationService = {
    createQuotation: (data: any) => axiosInstance.post('/api/quotations', data),
    getQuotation: (id: string | number) => axiosInstance.get(`/api/quotations/${id}`),
    getAllQuotations: (params?: any) => axiosInstance.get('/api/quotations', { params })
};
