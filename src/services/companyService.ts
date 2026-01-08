import axiosInstance from '../api/axiosInstance';

export const companyService = {
    // Create new company
    createCompany: (companyData: {
        name: string;
        email?: string;
        contact: string;
    }) => axiosInstance.post('/api/suppliers/companies', companyData),
    
    // Get all companies
    getCompanies: () => axiosInstance.get('/api/suppliers/companies'),
    
    // Get company by id
    getCompanyById: (id: number) => axiosInstance.get(`/api/suppliers/companies/${id}`),
    
    // Update company
    updateCompany: (id: number, companyData: any) => 
        axiosInstance.put(`/api/suppliers/companies/${id}`, companyData),
    
    // Delete company
    deleteCompany: (id: number) => axiosInstance.delete(`/api/suppliers/companies/${id}`),
};