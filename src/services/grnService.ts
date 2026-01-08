import axiosInstance from '../api/axiosInstance';

export const grnService = {
    // Create new GRN
    createGRN: (grnData: any) => 
        axiosInstance.post('/api/grn/add', grnData),
    
    // Get GRN summary stats
    getStats: () => 
        axiosInstance.get('/api/grn/summary'),
    
    // Get all GRN list
    getGRNList: () => 
        axiosInstance.get('/api/grn/list'),
    
    // Search GRN list with filters
    searchGRNList: (queryParams: string = '') => 
        axiosInstance.get(`/api/grn/search?${queryParams}`)
}