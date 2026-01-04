import axiosInstance from '../api/axiosInstance';

export const supplierService = {
    // Create new company
    createCompany: (companyData: {
        name: string;
        email?: string;
        contact: string;
    }) => axiosInstance.post('/api/suppliers/companies', companyData),
    
    // Get all companies
    getCompanies: () => axiosInstance.get('/api/suppliers/companies'),
    
    // Get all banks
    getBanks: () => axiosInstance.get('/api/suppliers/banks'),
    
    // Get both companies and banks in parallel
    getCompaniesAndBanks: () => Promise.all([
        axiosInstance.get('/api/suppliers/companies'),
        axiosInstance.get('/api/suppliers/banks')
    ]),
    
    // Get company by id (placeholder for future use)
    getCompanyById: (id: number) => axiosInstance.get(`/api/suppliers/companies/${id}`),
    
    // Update company (placeholder for future use)
    updateCompany: (id: number, companyData: any) => 
        axiosInstance.put(`/api/suppliers/companies/${id}`, companyData),
    
    // Delete company (placeholder for future use)
    deleteCompany: (id: number) => axiosInstance.delete(`/api/suppliers/companies/${id}`),
};