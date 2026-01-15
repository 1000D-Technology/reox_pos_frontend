import axiosInstance from '../api/axiosInstance';

export const customerService = {
    // Get all customers
    getCustomers: () => axiosInstance.get('/api/customers/all'),
    
    // Update customer phone
    updatePhone: (customerId: number, phone: string) => 
        axiosInstance.put(`/api/customers/${customerId}/phone`, { phone }),
    
    // Toggle customer status
    toggleStatus: (customerId: number, status: boolean) => 
        axiosInstance.put(`/api/customers/${customerId}/status`, { isActive: status }),
        
    // Get customer invoices
    getCustomerInvoices: (customerId: number) => 
        axiosInstance.get(`/api/customers/${customerId}/invoices`),
};