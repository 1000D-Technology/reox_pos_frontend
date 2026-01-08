import axiosInstance from '../api/axiosInstance';

export const categoryService = {
    // Search categories
    searchCategories: (query: string = '') => 
        axiosInstance.get(`/api/categories/search?q=${encodeURIComponent(query)}`),
    
    // Get all categories
    getCategories: () => 
        axiosInstance.get('/api/categories'),
    
    // Create new category
    createCategory: (data: { name: string }) => 
        axiosInstance.post('/api/categories', data),
    
    // Update category
    updateCategory: (id: number, data: { name: string }) => 
        axiosInstance.put(`/api/categories/${id}`, data),
    
    // Delete category
    deleteCategory: (id: number) => 
        axiosInstance.delete(`/api/categories/${id}`)
};