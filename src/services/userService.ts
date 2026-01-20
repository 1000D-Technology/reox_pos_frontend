import axiosInstance from '../api/axiosInstance';

export const userService = {
 
    addUser: async (userData: any) => {
        try {
            const response = await axiosInstance.post('/api/users/add', userData);
            return response.data;
        } catch (error) {
            throw error;
        }
    },

    getAllUsers: async () => {
        try {
            const response = await axiosInstance.get('/api/users/all');
            return response.data;
        } catch (error) {
            throw error;
        }
    },

    toggleUserStatus: async (userId: number, isActive: boolean) => {
        try {
            const response = await axiosInstance.patch(`/api/users/${userId}/status`, { isActive });
            return response.data;
        } catch (error) {
            throw error;
        }
    },

    updateUser: async (userId: number, userData: any) => {
        try {
            const response = await axiosInstance.put(`/api/users/${userId}`, userData);
            return response.data;
        } catch (error) {
            throw error;
        }
    }
    
}

