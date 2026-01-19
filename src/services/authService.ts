import api from '../api/axiosConfig';

interface LoginCredentials {
    username: string;
    password: string;
}

interface User {
    id: number;
    name: string;
    email: string;
    contact: string;
    role_id: number;
    role: string;
    status_id: number;
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

        if (response.data.success && response.data.token) {
            sessionStorage.setItem('token', response.data.token);
            sessionStorage.setItem('user', JSON.stringify(response.data.user));
        }

        return response.data;
    },

    logout: () => {
        sessionStorage.removeItem('token');
        sessionStorage.removeItem('user');
        localStorage.removeItem('rememberMe');
    },

    isAuthenticated: (): boolean => {
        return !!sessionStorage.getItem('token');
    },

    getCurrentUser: (): User | null => {
        const userStr = sessionStorage.getItem('user');
        if (!userStr) return null;

        try {
            return JSON.parse(userStr) as User;
        } catch {
            return null;
        }
    },

    getToken: (): string | null => {
        return sessionStorage.getItem('token');
    },

    getUserId(): number | null {
        const user = this.getCurrentUser();
        return user?.id || null;
    }
};
