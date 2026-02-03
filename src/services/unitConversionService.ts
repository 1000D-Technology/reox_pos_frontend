import axiosInstance from '../api/axiosInstance';

export interface UnitConversion {
    id: number;
    parent_unit_id: number;
    child_unit_id: number;
    conversion_factor: number;
    parent_unit_name?: string;
    child_unit_name?: string;
    created_at?: string;
}

export const unitConversionService = {
    // Get all unit conversions
    getUnitConversions: () => axiosInstance.get('/api/unit-conversions'),

    // Get conversions for a specific unit
    getConversionsForUnit: (unitId: number) => 
        axiosInstance.get(`/api/unit-conversions/unit/${unitId}`),

    // Create a new unit conversion
    createUnitConversion: (data: {
        parent_unit_id: number;
        child_unit_id: number;
        conversion_factor: number;
    }) => axiosInstance.post('/api/unit-conversions', data),

    // Update a unit conversion
    updateUnitConversion: (id: number, data: { conversion_factor: number }) => 
        axiosInstance.put(`/api/unit-conversions/${id}`, data),

    // Delete a unit conversion
    deleteUnitConversion: (id: number) => 
        axiosInstance.delete(`/api/unit-conversions/${id}`),
};
