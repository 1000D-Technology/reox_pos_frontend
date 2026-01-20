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
    
}

