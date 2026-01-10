// backend/schedulers/backupScheduler.ts
import cron from 'node-cron';
import { BackupService } from '../services/backupService';

const backupService = new BackupService();

// Run backup daily at 2:00 AM
export const scheduleBackup = () => {
    cron.schedule('0 2 * * *', async () => {
        console.log('Running scheduled backup...');
        try {
            await backupService.createBackup();
            await backupService.cleanOldBackups();
            console.log('Scheduled backup completed');
        } catch (error) {
            console.error('Scheduled backup failed:', error);
        }
    });
};
