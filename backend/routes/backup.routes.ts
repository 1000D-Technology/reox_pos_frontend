// backend/routes/backup.routes.ts
import express from 'express';
import { BackupService } from '../services/backupService';

const router = express.Router();
const backupService = new BackupService();

router.post('/create', async (req, res) => {
    try {
        const result = await backupService.createBackup();
        res.json(result);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

router.get('/stats', async (req, res) => {
    try {
        const stats = backupService.getBackupStats();
        res.json(stats);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

router.get('/latest', async (req, res) => {
    try {
        const latest = backupService.getLatestBackup();
        res.json(latest);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

router.get('/download/:filename', async (req, res) => {
    try {
        const filename = req.params.filename;
        const filepath = backupService.getBackupPath(filename);

        res.download(filepath, filename, (err) => {
            if (err) {
                res.status(404).json({ error: 'File not found' });
            }
        });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

router.delete('/clean', async (req, res) => {
    try {
        const result = await backupService.cleanOldBackups();
        res.json(result);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

export default router;
