import axiosInstance from '../api/axiosInstance';

export const userService = {
 
    addUser: async (userData: any) => {
        const response = await axiosInstance.post('/api/users/add', userData);
        return response.data;
    },

    getAllUsers: async () => {
        const response = await axiosInstance.get('/api/users/all');
        return response.data;
    },

    toggleUserStatus: async (userId: number, isActive: boolean) => {
        const response = await axiosInstance.patch(`/api/users/${userId}/status`, { isActive });
        return response.data;
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

