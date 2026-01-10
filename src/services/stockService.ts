import axiosInstance from '../api/axiosInstance';
import { supplierService } from './supplierService';
import { unitService } from './unitService';
import { categoryService } from './categoryService';

export const stockService = {
    // Get all dropdown data in parallel for stock filters
    getStockFilterData: () => Promise.all([
        categoryService.getCategories(),
        unitService.getUnits(),
        supplierService.getSupplierDropdownList()
    ]),

    // Get stock list data
    getStockList: () => 
        axiosInstance.get('/api/stock'),

    // Individual methods for specific dropdown needs
    getCategories: () => categoryService.getCategories(),
    getUnits: () => unitService.getUnits(),
    getSuppliers: () => supplierService.getSupplierDropdownList(),
};
