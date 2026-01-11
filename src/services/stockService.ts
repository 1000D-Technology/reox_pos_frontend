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

    getOutOfStockList: () =>
        axiosInstance.get('/api/stock/out-of-stock'),

    // Search out-of-stock items with filters
    searchOutOfStock: (filters: {
        product?: string;
        category?: string;
        supplier?: string;
        fromDate?: string;
        toDate?: string;
    }) => {
        const params = new URLSearchParams();
        if (filters.product) params.append('product', filters.product);
        if (filters.category) params.append('category', filters.category);
        if (filters.supplier) params.append('supplier', filters.supplier);
        if (filters.fromDate) params.append('fromDate', filters.fromDate);
        if (filters.toDate) params.append('toDate', filters.toDate);
        
        return axiosInstance.get(`/api/stock/out-of-stock/search?${params.toString()}`);
    },

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

    // Get stock items for a specific product variant
    getStockByVariant: (variationId: string) => 
        axiosInstance.get(`/api/stock/get-stock-by-variant/${variationId}`),

    // Get reasons for damaged stock
    getReasons: () => 
        axiosInstance.get('/api/reasons/all'),

    // Get return status options
    getReturnStatus: () => 
        axiosInstance.get('/api/return-status/all'),

    // Create damaged stock record
    createDamagedRecord: (data: {
        productId: string;
        stockId: string;
        damagedQty: number;
        reasonId: string;
        statusId: string;
        description?: string;
    }) => 
        axiosInstance.post('/api/damaged/add', data),

    // Individual methods for specific dropdown needs
    getCategories: () => categoryService.getCategories(),
    getUnits: () => unitService.getUnits(),
    getSuppliers: () => supplierService.getSupplierDropdownList(),
};
