import axiosInstance from '../api/axiosInstance';

export const grnService = {
    // Create new GRN
    createGRN: (grnData: any) =>
        axiosInstance.post('/api/grn/add', grnData),

    // Get GRN summary stats
    getStats: () =>
        axiosInstance.get('/api/grn/summary'),

    // Get all GRN list with pagination
    getGRNList: (page: number = 1, limit: number = 10) =>
        axiosInstance.get(`/api/grn/list?page=${page}&limit=${limit}`),

    // Search GRN list with filters and pagination
    searchGRNList: (queryParams: string = '', page: number = 1, limit: number = 10) =>
        axiosInstance.get(`/api/grn/search?${queryParams}&page=${page}&limit=${limit}`),

    // Get bills by supplier ID
    getBillsBySupplier: (supplierId: string | number) =>
        axiosInstance.get(`/api/grn/bills/${supplierId}`),

    // Process payment
    processPayment: (paymentData: { grn_id: number, payment_amount: number, payment_type_id: number }) =>
        axiosInstance.put('/api/grn/payment/update', paymentData),

    // Get GRN details by ID
    getGRNDetails: (id: number) =>
        axiosInstance.get(`/api/grn/get-by-id/${id}`)

}