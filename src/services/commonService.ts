import axiosInstance from '../api/axiosInstance';

export const commonService = {
    getCategories: () => axiosInstance.get('/api/common/categories/search'),
    getBrands: () => axiosInstance.get('/api/common/brands/search'),
    getUnits: () => axiosInstance.get('/api/common/units/search'),
    getProductTypes: () => axiosInstance.get('/api/common/product-types/search'),
};
