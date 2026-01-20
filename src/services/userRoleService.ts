import axiosInstance from '../api/axiosInstance';

export const userRoleService = {
 
    getRoles: async () => {
        try {
            const response = await axiosInstance.get('/api/roles');
            return response.data;
        } catch (error) {
            throw error;
        }
    },
    
}

