import axiosInstance from '../api/axiosInstance';
import { companyService } from './companyService';
import { bankService } from './bankService';

export const supplierService = {
    // Add new supplier
    addSupplier: (supplierData: {
        supplierName: string;
        email?: string;
        contactNumber: string;
        companyId: number;
        bankId?: number;
        accountNumber?: string;
    }) => axiosInstance.post('/api/suppliers/add', supplierData),

    // Import suppliers
    importSuppliers: (formData: FormData) =>
        axiosInstance.post('/api/suppliers/import', formData, {
            headers: {
                'Content-Type': 'multipart/form-data',
            },
        }),

    // Get both companies and banks in parallel
    getCompaniesAndBanks: () => Promise.all([
        companyService.getCompanies(),
        bankService.getBanks()
    ]),

    // Get all suppliers
    getSuppliers: () => axiosInstance.get('/api/suppliers/list'),

    // Get suppliers dropdown list (only id and name)
    getSupplierDropdownList: () => axiosInstance.get('/api/suppliers/dropdown-list'),

    // Update supplier contact number
    updateSupplierContact: (id: number, contactNumber: string) =>
        axiosInstance.patch(`/api/suppliers/update-contact/${id}`, { contactNumber }),

    // Update supplier status
    updateSupplierStatus: (id: number, currentStatusId: number) =>
        axiosInstance.patch(`/api/suppliers/update-status/${id}`, { currentStatusId }),
};