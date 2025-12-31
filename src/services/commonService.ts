import axiosInstance from '../api/axiosInstance';

export const commonService = {
    getCategories: () => axiosInstance.get('/api/common/categories'),
    getBrands: () => axiosInstance.get('/api/common/brands'),
    getUnits: () => axiosInstance.get('/api/common/units'),
    getProductTypes: () => axiosInstance.get('/api/common/product-types'),
};
