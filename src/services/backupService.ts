import api from '../api/axiosConfig';

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

export const backupService = {
    /**
     * Get backup statistics
     */
    getBackupStats: async (): Promise<BackupStats> => {
        try {
            const response = await api.get<BackupStats>('/backup/stats');
            return response.data;
        } catch (error) {
            throw error;
        }
    },

    /**
     * Create a new backup
     */
    createBackup: async (): Promise<BackupResponse> => {
        try {
            const response = await api.post<BackupResponse>('/backup/create');
            return response.data;
        } catch (error) {
            throw error;
        }
    },

    /**
     * Download a backup file
     */
    downloadBackup: async (filename: string): Promise<Blob> => {
        try {
            const response = await api.get(`/backup/download/${filename}`, {
                responseType: 'blob',
            });
            return response.data;
        } catch (error) {
            throw error;
        }
    },

    /**
     * Get list of all backups
     */
    getAllBackups: async (): Promise<BackupResponse[]> => {
        try {
            const response = await api.get<BackupResponse[]>('/backup/list');
            return response.data;
        } catch (error) {
            throw error;
        }
    },

    /**
     * Get backup schedule status
     */
    getScheduleStatus: async (): Promise<any> => {
        try {
            const response = await api.get('/backup/schedule/status');
            return response.data;
        } catch (error) {
            throw error;
        }
    },

    /**
     * Delete a specific backup
     */
    deleteBackup: async (filename: string): Promise<{ success: boolean; message: string }> => {
        try {
            const response = await api.delete(`/backup/${filename}`);
            return response.data;
        } catch (error) {
            throw error;
        }
    }
};
