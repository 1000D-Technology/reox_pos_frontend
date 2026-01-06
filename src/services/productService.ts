import axiosInstance from '../api/axiosInstance';

export const productService = {
    // Get all active products
    getProducts: () => axiosInstance.get('/api/products'),

    getProductsForDropdown: () => axiosInstance.get('/api/products/dropdown'),
    
    // Get deactive/removed products
    getDeactiveProducts: () => axiosInstance.get('/api/products/deactive'),
    
    // Create new product
    createProduct: (productData: any) => axiosInstance.post('/api/products/create', productData),
    
    // Update product
    updateProduct: (pvId: number, productData: any) => 
        axiosInstance.put(`/api/products/update/${pvId}`, productData),
    
    // Change product status (activate/deactivate)
    changeProductStatus: (pvId: number, statusId: number) => 
        axiosInstance.patch(`/api/products/status/${pvId}`, { statusId }),
    
    // Search active products
    searchProducts: (params: { productTypeId?: number; searchTerm?: string }) => 
        axiosInstance.get('/api/products/search', { params }),
    
    // Search deactive/removed products
    searchDeactiveProducts: (params: { productTypeId?: number; searchTerm?: string }) => 
        axiosInstance.get('/api/products/search/deactive', { params }),
    
    // Get product variants by product ID
    getProductVariants: (productId: number) => 
        axiosInstance.get(`/api/products/${productId}/variants`),
};