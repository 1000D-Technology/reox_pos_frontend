import axiosInstance from '../api/axiosInstance';

export const unitService = {
    // Search units
    searchUnits: (query: string = '') => 
        axiosInstance.get(`/api/units/search?q=${encodeURIComponent(query)}`),
    
    // Get all units
    getUnits: () => 
        axiosInstance.get('/api/units'),
    
    // Create new unit
    createUnit: (data: { name: string }) => 
        axiosInstance.post('/api/units', data),
    
    // Update unit
    updateUnit: (id: number, data: { name: string }) => 
        axiosInstance.put(`/api/units/${id}`, data),
    
    // Delete unit
    deleteUnit: (id: number) => 
        axiosInstance.delete(`/api/units/${id}`)
};