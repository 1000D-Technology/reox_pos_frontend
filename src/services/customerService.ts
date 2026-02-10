import axiosInstance from '../api/axiosInstance';

export const customerService = {
    // Get all customers with pagination
    getCustomers: (page: number = 1, limit: number = 10) => 
        axiosInstance.get('/api/customers/all', { params: { page, limit } }),
    
    // Add new customer
    addCustomer: (customerData: { name: string; contact: string; email?: string }) => 
        axiosInstance.post('/api/customers/add', customerData),
    
    // Update customer phone
    updatePhone: (customerId: number, phone: string) => 
        axiosInstance.put(`/api/customers/${customerId}/phone`, { phone }),
    
    // Update customer all details
    updateCustomer: (customerId: number, customerData: { name: string; contact: string; email?: string }) =>
        axiosInstance.put(`/api/customers/${customerId}/update`, customerData),
    
    // Toggle customer status
    toggleStatus: (customerId: number, status: boolean) => 
        axiosInstance.put(`/api/customers/${customerId}/status`, { isActive: status }),
        
    // Get customer invoices
    getCustomerInvoices: (customerId: number) => 
        axiosInstance.get(`/api/customers/${customerId}/invoices`),

    // Customer search by name 
    searchCustomers: (query: string) => 
        axiosInstance.get(`/api/customers/search`, { params: { query } }),
};