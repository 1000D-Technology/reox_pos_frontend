import api from '../api/axiosInstance.ts';

interface LoginCredentials {
    username: string;
    password: string;
}

interface User {
    id: number;
    name: string;
    contact: string;
    email: string;
    role_id: number;
    status_id: number;
    role: string;
    status: string;
}

interface LoginResponse {
    success: boolean;
    message: string;
    token: string;
    user: User;
}

export const authService = {
    login: async (credentials: LoginCredentials): Promise<LoginResponse> => {
        const response = await api.post<LoginResponse>('/api/auth/login', credentials);

        if (response.data.success) {
            // Store token and user data in sessionStorage
            sessionStorage.setItem('token', response.data.token);
            sessionStorage.setItem('user', JSON.stringify(response.data.user));
        }

        return response.data;
    },

    logout: () => {
        sessionStorage.clear();
        window.location.href = '/';
    },

    getCurrentUser: (): User | null => {
        const userStr = sessionStorage.getItem('user');
        return userStr ? JSON.parse(userStr) : null;
    },

    isAuthenticated: (): boolean => {
        return !!sessionStorage.getItem('token');
    },
};
