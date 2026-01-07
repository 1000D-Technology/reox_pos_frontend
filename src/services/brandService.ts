import axiosInstance from '../api/axiosInstance';

export const brandService = {
    // Search brands
    searchBrands: (query: string = '') => 
        axiosInstance.get(`/api/brands/search?q=${encodeURIComponent(query)}`),
    
    // Get all brands
    getBrands: () => 
        axiosInstance.get('/api/brands'),
    
    // Create new brand
    createBrand: (data: { name: string }) => 
        axiosInstance.post('/api/brands', data),
    
    // Update brand
    updateBrand: (id: number, data: { name: string }) => 
        axiosInstance.put(`/api/brands/${id}`, data),
    
    // Delete brand
    deleteBrand: (id: number) => 
        axiosInstance.delete(`/api/brands/${id}`)
};