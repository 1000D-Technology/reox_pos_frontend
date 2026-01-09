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

    // Search stock with filters
    searchStock: (filters: {
        category?: string;
        unit?: string;
        supplier?: string;
        q?: string;
    }) => {
        const params = new URLSearchParams();
        if (filters.category) params.append('category', filters.category);
        if (filters.unit) params.append('unit', filters.unit);
        if (filters.supplier) params.append('supplier', filters.supplier);
        if (filters.q) params.append('q', filters.q);
        
        return axiosInstance.get(`/api/stock/search?${params.toString()}`);
    },

    // Get summary cards data
    getSummaryCards: () => 
        axiosInstance.get('/api/stock/summary-cards'),

    // Individual methods for specific dropdown needs
    getCategories: () => categoryService.getCategories(),
    getUnits: () => unitService.getUnits(),
    getSuppliers: () => supplierService.getSupplierDropdownList(),
};
