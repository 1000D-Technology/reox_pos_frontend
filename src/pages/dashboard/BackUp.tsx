import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import toast, { Toaster } from 'react-hot-toast';
import axios from 'axios';
import {
    CloudUpload,
    ShieldCheck,
    Clock,
    Server,
    RefreshCw,
    CheckCircle,
    AlertTriangle,
    Download
} from 'lucide-react';

interface BackupStats {
    lastBackup: string;
    totalSize: string;
    count: number;
    status: string;
}

const BackUp = () => {
    const [isBackingUp, setIsBackingUp] = useState(false);
    const [latestBackupFile, setLatestBackupFile] = useState<string | null>(null);
    const [backupStats, setBackupStats] = useState<BackupStats>({
        lastBackup: 'Loading...',
        totalSize: '0 MB',
        count: 0,
        status: 'Loading...'
    });

    useEffect(() => {
        fetchBackupStats();
    }, []);

    const fetchBackupStats = async () => {
        try {
            const response = await axios.get('/api/backup/stats');
            setBackupStats(response.data);
        } catch (error) {
            toast.error('Failed to load backup statistics');
            console.error('Failed to fetch backup stats:', error);
        }
    };

    const handleBackup = async () => {
        setIsBackingUp(true);
        const loadingToast = toast.loading('Creating backup...');

        try {
            const response = await axios.post('/api/backup/create', {
                headers: { 'Content-Type': 'application/json' }
            });

            if (response.data.success) {
                setLatestBackupFile(response.data.filename);
                await fetchBackupStats();
                toast.success('Backup created successfully!', {
                    id: loadingToast,
                    duration: 4000,
                    icon: '✅'
                });
            } else {
                throw new Error('Backup creation failed');
            }
        } catch (error) {
            toast.error('Failed to create backup. Please try again.', {
                id: loadingToast,
                duration: 4000
            });
            console.error('Backup failed:', error);
        } finally {
            setIsBackingUp(false);
        }
    };

    const handleDownload = async () => {
        if (!latestBackupFile) {
            toast.error('No backup file available');
            return;
        }

        const downloadToast = toast.loading('Preparing download...');

        try {
            const response = await axios.get(`/api/backup/download/${latestBackupFile}`, {
                responseType: 'blob'
            });

            const url = window.URL.createObjectURL(new Blob([response.data]));
            const a = document.createElement('a');
            a.href = url;
            a.download = latestBackupFile;
            document.body.appendChild(a);
            a.click();
            window.URL.revokeObjectURL(url);
            document.body.removeChild(a);

            toast.success('Backup downloaded successfully!', {
                id: downloadToast,
                duration: 3000,
                icon: '📥'
            });
        } catch (error) {
            toast.error('Failed to download backup', {
                id: downloadToast,
                duration: 4000
            });
            console.error('Download failed:', error);
        }
    };

    const statsCards = [
        {
            label: 'Last Backup',
            value: backupStats.lastBackup,
            icon: Clock,
            color: 'bg-emerald-50',
            iconColor: 'text-emerald-600'
        },
        {
            label: 'Total Size',
            value: backupStats.totalSize,
            icon: Server,
            color: 'bg-green-50',
            iconColor: 'text-green-600'
        },
        {
            label: 'Status',
            value: backupStats.status,
            icon: ShieldCheck,
            color: 'bg-teal-50',
            iconColor: 'text-teal-600'
        },
    ];

    const scheduleOptions = [
        { label: 'Every 6 Hours', value: '6h', active: false },
        { label: 'Daily', value: '24h', active: true },
        { label: 'Weekly', value: '7d', active: false },
        { label: 'Monthly', value: '30d', active: false },
    ];

    return (
        <>
            <Toaster
                position="top-right"
                toastOptions={{
                    success: {
                        style: {
                            background: '#10b981',
                            color: '#fff',
                        },
                    },
                    error: {
                        style: {
                            background: '#ef4444',
                            color: '#fff',
                        },
                    },
                    loading: {
                        style: {
                            background: '#3b82f6',
                            color: '#fff',
                        },
                    },
                }}
            />

            <div className="min-h-screen bg-gradient-to-br bg-white/25 rounded-md p-6">
                <div className="max-w-6xl mx-auto space-y-6">
                    <motion.div
                        initial={{ opacity: 0, y: -20 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="text-center mb-8"
                    >
                        <h1 className="text-4xl font-bold text-gray-800 mb-2">Daily Backup</h1>
                        <p className="text-gray-600">Protect your data with automated backups</p>
                    </motion.div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                        {statsCards.map((stat, i) => (
                            <motion.div
                                key={i}
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: i * 0.1 }}
                                className="flex items-center p-4 space-x-3 bg-white rounded-2xl shadow-lg hover:shadow-xl transition-all cursor-pointer group relative overflow-hidden"
                            >
                                <div className="absolute inset-0 bg-gradient-to-br from-emerald-50/50 via-transparent to-green-50/50 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>

                                <div className={`p-3 rounded-full ${stat.color} shadow-md relative z-10`}>
                                    <stat.icon className={`w-6 h-6 ${stat.iconColor}`} />
                                </div>

                                <div className="w-px h-10 bg-gray-200"></div>

                                <div className="relative z-10 flex-1">
                                    <p className="text-xs text-gray-500">{stat.label}</p>
                                    <p className="text-sm font-bold text-gray-700">{stat.value}</p>
                                </div>
                            </motion.div>
                        ))}
                    </div>

                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                        <motion.div
                            initial={{ opacity: 0, x: -20 }}
                            animate={{ opacity: 1, x: 0 }}
                            className="bg-white rounded-3xl shadow-2xl p-8 relative overflow-hidden"
                        >
                            <div className="absolute -top-24 -right-24 w-64 h-64 bg-gradient-to-br from-emerald-400/20 to-green-400/20 rounded-full blur-3xl"></div>

                            <div className="relative z-10">
                                <div className="flex items-center justify-center mb-6">
                                    <motion.div
                                        animate={isBackingUp ? { rotate: 360 } : {}}
                                        transition={{ duration: 2, repeat: isBackingUp ? Infinity : 0, ease: "linear" }}
                                        className={`p-6 rounded-full ${isBackingUp ? 'bg-emerald-100' : 'bg-gradient-to-br from-emerald-100 to-green-100'} shadow-lg`}
                                    >
                                        {isBackingUp ? (
                                            <RefreshCw className="w-16 h-16 text-emerald-600" />
                                        ) : (
                                            <CloudUpload className="w-16 h-16 text-emerald-600" />
                                        )}
                                    </motion.div>
                                </div>

                                <h3 className="text-2xl font-bold text-gray-800 text-center mb-2">
                                    {isBackingUp ? 'Backing Up...' : 'Ready to Backup'}
                                </h3>
                                <p className="text-gray-600 text-center mb-6">
                                    {isBackingUp ? 'Please wait while we secure your data' : 'Click below to start manual backup'}
                                </p>

                                {isBackingUp && (
                                    <div className="mb-6">
                                        <div className="w-full bg-gray-200 rounded-full h-2 overflow-hidden">
                                            <motion.div
                                                initial={{ width: '0%' }}
                                                animate={{ width: '100%' }}
                                                transition={{ duration: 3, ease: "linear" }}
                                                className="h-full bg-gradient-to-r from-emerald-500 to-green-500"
                                            ></motion.div>
                                        </div>
                                    </div>
                                )}

                                <div className="space-y-3">
                                    <motion.button
                                        whileHover={{ scale: 1.02 }}
                                        whileTap={{ scale: 0.98 }}
                                        onClick={handleBackup}
                                        disabled={isBackingUp}
                                        className={`w-full py-4 rounded-2xl font-semibold text-white shadow-lg transition-all ${
                                            isBackingUp
                                                ? 'bg-gray-400 cursor-not-allowed'
                                                : 'bg-gradient-to-r from-emerald-500 to-green-500 hover:shadow-xl hover:from-emerald-600 hover:to-green-600'
                                        }`}
                                    >
                                        {isBackingUp ? 'Backing Up...' : 'Start Backup Now'}
                                    </motion.button>

                                    {latestBackupFile && !isBackingUp && (
                                        <motion.button
                                            initial={{ opacity: 0, y: 10 }}
                                            animate={{ opacity: 1, y: 0 }}
                                            whileHover={{ scale: 1.02 }}
                                            whileTap={{ scale: 0.98 }}
                                            onClick={handleDownload}
                                            className="w-full py-4 rounded-2xl font-semibold text-emerald-700 bg-emerald-50 border-2 border-emerald-200 hover:bg-emerald-100 transition-all flex items-center justify-center gap-2"
                                        >
                                            <Download className="w-5 h-5" />
                                            Download Backup
                                        </motion.button>
                                    )}
                                </div>
                            </div>
                        </motion.div>

                        <motion.div
                            initial={{ opacity: 0, x: 20 }}
                            animate={{ opacity: 1, x: 0 }}
                            className="bg-white rounded-3xl shadow-2xl p-8"
                        >
                            <h3 className="text-xl font-bold text-gray-800 mb-6">Backup Schedule</h3>

                            <div className="space-y-3 mb-6">
                                {scheduleOptions.map((option, i) => (
                                    <motion.div
                                        key={i}
                                        whileHover={{ scale: 1.02 }}
                                        className={`p-4 rounded-xl border-2 cursor-pointer transition-all ${
                                            option.active
                                                ? 'border-emerald-500 bg-emerald-50'
                                                : 'border-gray-200 hover:border-emerald-300'
                                        }`}
                                    >
                                        <div className="flex items-center justify-between">
                                            <span className={`font-semibold ${option.active ? 'text-emerald-700' : 'text-gray-700'}`}>
                                                {option.label}
                                            </span>
                                            {option.active && (
                                                <CheckCircle className="w-5 h-5 text-emerald-600" />
                                            )}
                                        </div>
                                    </motion.div>
                                ))}
                            </div>

                            <div className="bg-emerald-50 rounded-xl p-4 border border-emerald-200">
                                <div className="flex items-start space-x-3">
                                    <ShieldCheck className="w-5 h-5 text-emerald-600 mt-0.5" />
                                    <div>
                                        <h4 className="font-semibold text-emerald-800 text-sm mb-1">Auto-Backup Enabled</h4>
                                        <p className="text-xs text-emerald-700">Your data is automatically backed up daily at 2:00 AM</p>
                                    </div>
                                </div>
                            </div>

                            <div className="mt-6 p-4 bg-amber-50 rounded-xl border border-amber-200">
                                <div className="flex items-start space-x-3">
                                    <AlertTriangle className="w-5 h-5 text-amber-600 mt-0.5" />
                                    <div>
                                        <h4 className="font-semibold text-amber-800 text-sm mb-1">Storage Notice</h4>
                                        <p className="text-xs text-amber-700">Last 7 backups are retained. Older backups are automatically deleted.</p>
                                    </div>
                                </div>
                            </div>
                        </motion.div>
                    </div>
                </div>
            </div>
        </>
    );
};

export default BackUp;