// src/services/backupService.js
import axios, { AxiosError } from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000';

export interface BackupStats {
    lastBackup: string;
    totalSize: string;
    count: number;
    status: string;
}

export interface BackupResponse {
    success: boolean;
    filename: string;
    size: string;
    date: string;
    timestamp: number;
}

class BackupApiService {
    private axiosInstance;

    constructor() {
        this.axiosInstance = axios.create({
            baseURL: API_BASE_URL,
            timeout: 60000, // 60 seconds for backup operations
            headers: {
                'Content-Type': 'application/json',
            },
        });

        // Request interceptor
        this.axiosInstance.interceptors.request.use(
            (config) => {
                // Add auth token if available
                const token = localStorage.getItem('authToken');
                if (token) {
                    config.headers.Authorization = `Bearer ${token}`;
                }
                return config;
            },
            (error) => Promise.reject(error)
        );

        // Response interceptor
        this.axiosInstance.interceptors.response.use(
            (response) => response,
            (error: AxiosError) => {
                if (error.response?.status === 401) {
                    // Handle unauthorized
                    console.error('Unauthorized access');
                }
                return Promise.reject(error);
            }
        );
    }

    /**
     * Get backup statistics
     */
    async getBackupStats(): Promise<BackupStats> {
        try {
            const response = await this.axiosInstance.get<BackupStats>('/api/backup/stats');
            return response.data;
        } catch (error) {
            throw this.handleError(error, 'Failed to fetch backup statistics');
        }
    }

    /**
     * Create a new backup
     */
    async createBackup(): Promise<BackupResponse> {
        try {
            const response = await this.axiosInstance.post<BackupResponse>('/api/backup/create');
            return response.data;
        } catch (error) {
            throw this.handleError(error, 'Failed to create backup');
        }
    }

    /**
     * Download a backup file
     */
    async downloadBackup(filename: string): Promise<Blob> {
        try {
            const response = await this.axiosInstance.get(`/api/backup/download/${filename}`, {
                responseType: 'blob',
            });
            return response.data;
        } catch (error) {
            throw this.handleError(error, 'Failed to download backup');
        }
    }

    /**
     * Get list of all backups
     */
    async getAllBackups(): Promise<BackupResponse[]> {
        try {
            const response = await this.axiosInstance.get<BackupResponse[]>('/api/backup/list');
            return response.data;
        } catch (error) {
            throw this.handleError(error, 'Failed to fetch backup list');
        }
    }

    /**
     * Delete a specific backup
     */
    async deleteBackup(filename: string): Promise<{ success: boolean; message: string }> {
        try {
            const response = await this.axiosInstance.delete(`/api/backup/${filename}`);
            return response.data;
        } catch (error) {
            throw this.handleError(error, 'Failed to delete backup');
        }
    }

    /**
     * Handle errors consistently
     */
    private handleError(error: unknown, defaultMessage: string): Error {
        if (axios.isAxiosError(error)) {
            const message = error.response?.data?.message || error.message || defaultMessage;
            return new Error(message);
        }
        return new Error(defaultMessage);
    }
}

// Export singleton instance
export const backupService = new BackupApiService();
