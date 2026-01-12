import axiosInstance from '../api/axiosInstance';

export const productTypeService = {
    // Search product types
    searchProductTypes: (query: string = '') => 
        axiosInstance.get(`/api/product-types/search?q=${encodeURIComponent(query)}`),
    
    // Get all product types
    getProductTypes: () => 
        axiosInstance.get('/api/product-types'),
    
    // Create new product type
    createProductType: (data: { name: string }) => 
        axiosInstance.post('/api/product-types', data),
    
    // Update product type
    updateProductType: (id: number, data: { name: string }) => 
        axiosInstance.put(`/api/product-types/${id}`, data),
    
    // Delete product type
    deleteProductType: (id: number) => 
        axiosInstance.delete(`/api/product-types/${id}`)
};