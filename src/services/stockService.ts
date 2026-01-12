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

    // Get low stock list
    getLowStockList: () => 
        axiosInstance.get('/api/stock/low-stock'),

    // Search low stock with filters
    searchLowStock: (filters: {
        category_id?: string;
        unit_id?: string;
        supplier_id?: string;
        product_id?: string;
    }) => {
        const params = new URLSearchParams();
        if (filters.category_id) params.append('category_id', filters.category_id);
        if (filters.unit_id) params.append('unit_id', filters.unit_id);
        if (filters.supplier_id) params.append('supplier_id', filters.supplier_id);
        if (filters.product_id) params.append('product_id', filters.product_id);
        
        return axiosInstance.get(`/api/stock/low-stock/search?${params.toString()}`);
    },

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
        axiosInstance.post('/api/damaged/add', {
            stock_id: data.stockId,
            qty: data.damagedQty,
            reason_id: data.reasonId,
            status_id: data.statusId,
            description: data.description || "N/A"
        }),

    // Get damaged stock table data
    getDamagedTableData: () => 
        axiosInstance.get('/api/damaged/table-data'),

    // Search damaged stock records with filters
    searchDamagedRecords: (filters: {
        product_id?: string;
        category_id?: string;
        supplier_id?: string;
        unit_id?: string;
        fromDate?: string;
        toDate?: string;
    }) => {
        const params = new URLSearchParams();
        if (filters.product_id) params.append('product_id', filters.product_id);
        if (filters.category_id) params.append('category_id', filters.category_id);
        if (filters.supplier_id) params.append('supplier_id', filters.supplier_id);
        if (filters.unit_id) params.append('unit_id', filters.unit_id);
        if (filters.fromDate) params.append('fromDate', filters.fromDate);
        if (filters.toDate) params.append('toDate', filters.toDate);
        
        return axiosInstance.get(`/api/damaged/search?${params.toString()}`);
    },

    // Individual methods for specific dropdown needs
    getCategories: () => categoryService.getCategories(),
    getUnits: () => unitService.getUnits(),
    getSuppliers: () => supplierService.getSupplierDropdownList(),
};
