import axiosInstance from '../api/axiosInstance';

export const bankService = {
    // Get all banks
    getBanks: () => axiosInstance.get('/api/suppliers/banks'),
    
    // Get bank by id
    getBankById: (id: number) => axiosInstance.get(`/api/suppliers/banks/${id}`),
    
    // Update bank
    updateBank: (id: number, bankData: any) => 
        axiosInstance.put(`/api/suppliers/banks/${id}`, bankData),
    
    // Delete bank
    deleteBank: (id: number) => axiosInstance.delete(`/api/suppliers/banks/${id}`),

    // Create new bank
    createBank: (bankData: { bankName: string }) => axiosInstance.post('/api/suppliers/banks', bankData),
};