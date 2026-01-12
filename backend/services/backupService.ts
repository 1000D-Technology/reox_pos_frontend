// backend/services/backupService.ts
import * as mysql from 'mysql2/promise';
import * as fs from 'fs';
import * as path from 'path';

export class BackupService {
    private backupDir = path.join(process.cwd(), 'backups');
    private connection: mysql.Connection | null = null;

    constructor() {
        if (!fs.existsSync(this.backupDir)) {
            fs.mkdirSync(this.backupDir, { recursive: true });
        }
    }

    private async getConnection() {
        if (!this.connection) {
            this.connection = await mysql.createConnection({
                host: process.env.DB_HOST,
                user: process.env.DB_USER,
                password: process.env.DB_PASSWORD,
                database: process.env.DB_NAME,
                port: parseInt(process.env.PORT || '3306'),
            });
        }
        return this.connection;
    }

    async createBackup() {
        const timestamp = Date.now();
        const filename = `backup_${timestamp}.sql`;
        const filepath = path.join(this.backupDir, filename);

        try {
            const connection = await this.getConnection();
            let sqlDump = '-- MySQL Database Backup\n';
            sqlDump += `-- Created: ${new Date().toISOString()}\n`;
            sqlDump += `-- Database: ${process.env.DB_NAME}\n\n`;

            sqlDump += 'SET FOREIGN_KEY_CHECKS=0;\n\n';

            // Get all tables
            const [tables] = await connection.query<mysql.RowDataPacket[]>(
                'SHOW TABLES'
            );

            for (const tableRow of tables) {
                const tableName = Object.values(tableRow)[0] as string;

                sqlDump += `\n-- Table: ${tableName}\n`;
                sqlDump += `DROP TABLE IF EXISTS \`${tableName}\`;\n`;

                // Get CREATE TABLE statement
                const [createResult] = await connection.query<mysql.RowDataPacket[]>(
                    `SHOW CREATE TABLE \`${tableName}\``
                );
                sqlDump += createResult[0]['Create Table'] + ';\n\n';

                // Get table data
                const [rows] = await connection.query<mysql.RowDataPacket[]>(
                    `SELECT * FROM \`${tableName}\``
                );

                if (rows.length > 0) {
                    sqlDump += `-- Data for table ${tableName}\n`;

                    for (const row of rows) {
                        const columns = Object.keys(row).map(col => `\`${col}\``).join(', ');
                        const values = Object.values(row)
                            .map(val => {
                                if (val === null) return 'NULL';
                                if (typeof val === 'string') return `'${val.replace(/'/g, "''").replace(/\\/g, '\\\\')}'`;
                                if (val instanceof Date) return `'${val.toISOString().slice(0, 19).replace('T', ' ')}'`;
                                if (typeof val === 'boolean') return val ? '1' : '0';
                                return val;
                            })
                            .join(', ');

                        sqlDump += `INSERT INTO \`${tableName}\` (${columns}) VALUES (${values});\n`;
                    }
                    sqlDump += '\n';
                }
            }

            sqlDump += 'SET FOREIGN_KEY_CHECKS=1;\n';

            // Write to file
            fs.writeFileSync(filepath, sqlDump, 'utf8');

            const stats = fs.statSync(filepath);
            const sizeInMB = (stats.size / (1024 * 1024)).toFixed(2);

            return {
                success: true,
                filename,
                size: `${sizeInMB} MB`,
                date: new Date().toISOString(),
                timestamp
            };
        } catch (err: any) {
            throw new Error(`Backup failed: ${err.message}`);
        }
    }

    getLatestBackup() {
        try {
            const files = fs.readdirSync(this.backupDir);
            if (files.length === 0) {
                return null;
            }

            const backups = files
                .filter(file => file.endsWith('.sql'))
                .map(file => {
                    const filepath = path.join(this.backupDir, file);
                    const stats = fs.statSync(filepath);
                    return {
                        filename: file,
                        size: `${(stats.size / (1024 * 1024)).toFixed(2)} MB`,
                        date: stats.mtime,
                        timestamp: stats.mtimeMs
                    };
                })
                .sort((a, b) => b.timestamp - a.timestamp);

            return backups[0];
        } catch {
            return null;
        }
    }

    getBackupStats() {
        try {
            const files = fs.readdirSync(this.backupDir);
            const backups = files.filter(file => file.endsWith('.sql'));

            if (backups.length === 0) {
                return {
                    lastBackup: 'Never',
                    totalSize: '0 MB',
                    count: 0,
                    status: 'No Backups'
                };
            }

            let totalSize = 0;
            let latestDate: Date | null = null;

            backups.forEach(file => {
                const filepath = path.join(this.backupDir, file);
                const stats = fs.statSync(filepath);
                totalSize += stats.size;
                if (!latestDate || stats.mtime > latestDate) {
                    latestDate = stats.mtime;
                }
            });

            const timeAgo = this.getTimeAgo(latestDate!);

            return {
                lastBackup: timeAgo,
                totalSize: `${(totalSize / (1024 * 1024)).toFixed(2)} MB`,
                count: backups.length,
                status: 'Protected'
            };
        } catch {
            return {
                lastBackup: 'Error',
                totalSize: '0 MB',
                count: 0,
                status: 'Error'
            };
        }
    }

    private getTimeAgo(date: Date): string {
        const seconds = Math.floor((new Date().getTime() - date.getTime()) / 1000);

        if (seconds < 60) return 'Just now';
        if (seconds < 3600) return `${Math.floor(seconds / 60)} minutes ago`;
        if (seconds < 86400) return `${Math.floor(seconds / 3600)} hours ago`;
        if (seconds < 604800) return `${Math.floor(seconds / 86400)} days ago`;
        return date.toLocaleDateString();
    }

    getBackupPath(filename: string): string {
        return path.join(this.backupDir, filename);
    }

    async cleanOldBackups(keepCount = 7) {
        try {
            const files = fs.readdirSync(this.backupDir);
            const backups = files
                .filter(file => file.endsWith('.sql'))
                .map(file => {
                    const filepath = path.join(this.backupDir, file);
                    return {
                        filename: file,
                        mtime: fs.statSync(filepath).mtime
                    };
                })
                .sort((a, b) => b.mtime.getTime() - a.mtime.getTime());

            const toDelete = backups.slice(keepCount);

            toDelete.forEach(backup => {
                fs.unlinkSync(path.join(this.backupDir, backup.filename));
            });

            return { deleted: toDelete.length };
        } catch (err: any) {
            throw new Error(`Cleanup failed: ${err.message}`);
        }
    }

    async close() {
        if (this.connection) {
            await this.connection.end();
            this.connection = null;
        }
    }
}
