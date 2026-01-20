import { useState, useEffect } from 'react';
import toast, { Toaster } from 'react-hot-toast';
import { backupService, type BackupResponse as BackupFile, type BackupStats } from '../../services/backupService';
import {
    CloudUpload,
    ShieldCheck,
    Clock,
    Server,
    RefreshCw,
    CheckCircle,
    AlertTriangle,
    Download,
    FileText,
    Database
} from 'lucide-react';

const BackUp = () => {
    const [isBackingUp, setIsBackingUp] = useState(false);
    const [backupFiles, setBackupFiles] = useState<BackupFile[]>([]);
    const [backupStats, setBackupStats] = useState<BackupStats>({
        lastBackup: 'Loading...',
        totalSize: '0 MB',
        count: 0,
        status: 'Loading...'
    });

    const [scheduleStatus, setScheduleStatus] = useState({
        enabled: true,
        schedule: 'Loading...',
        nextRun: '',
        timezone: ''
    });

    const fetchScheduleStatus = async () => {
        try {
            const data = await backupService.getScheduleStatus();
            setScheduleStatus(data);
        } catch (error) {
            console.error('Failed to fetch schedule status:', error);
        }
    };

    useEffect(() => {
        fetchBackupStats();
        fetchBackupList();
        fetchScheduleStatus();
    }, []);

    const formatNextRun = (dateString: string) => {
        if (!dateString) return 'Not scheduled';
        const date = new Date(dateString);
        return date.toLocaleString('en-US', {
            month: 'short',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });
    };

    const fetchBackupStats = async () => {
        try {
            const stats = await backupService.getBackupStats();
            setBackupStats(stats);
        } catch (error) {
            toast.error('Failed to load backup statistics');
            console.error('Failed to fetch backup stats:', error);
        }
    };

    const fetchBackupList = async () => {
        try {
            // @ts-ignore - The service returns BackupResponse[] which is compatible with BackupFile[] structure for display
            const files = await backupService.getAllBackups();
            setBackupFiles(files as unknown as BackupFile[]);
        } catch (error) {
            toast.error('Failed to load backup list');
            console.error('Failed to fetch backup list:', error);
        }
    };

    const handleBackup = async () => {
        setIsBackingUp(true);
        const loadingToast = toast.loading('Creating backup...');

        try {
            const response = await backupService.createBackup();

            if (response.success) {
                await fetchBackupStats();
                await fetchBackupList();
                toast.success('Backup created successfully!', {
                    id: loadingToast,
                    duration: 4000,
                    icon: '✅'
                });
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

    const handleDownload = async (filename: string) => {
        const downloadToast = toast.loading('Downloading backup...');

        try {
            const blob = await backupService.downloadBackup(filename);

            const url = window.URL.createObjectURL(blob);
            const link = document.createElement('a');
            link.href = url;
            link.setAttribute('download', filename);
            document.body.appendChild(link);
            link.click();

            link.parentNode?.removeChild(link);
            window.URL.revokeObjectURL(url);

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

    const formatDate = (dateString: string) => {
        const date = new Date(dateString);
        return date.toLocaleString('en-US', {
            year: 'numeric',
            month: 'short',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });
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
            label: 'Total Files',
            value: backupStats.count.toString(),
            icon: Database,
            color: 'bg-teal-50',
            iconColor: 'text-teal-600'
        },
        {
            label: 'Status',
            value: backupStats.status,
            icon: ShieldCheck,
            color: 'bg-blue-50',
            iconColor: 'text-blue-600'
        },
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

            <div className="min-h-screen bg-white/25 rounded-md p-6">
                <div className="w-full mx-auto space-y-6">
                    {/* Header */}
                    <div
                        className="text-center mb-8"
                    >
                        <h1 className="text-4xl font-bold text-gray-800 mb-2">Database Backup Manager</h1>
                        <p className="text-gray-600">Protect your data with automated backups at 5:00 PM daily</p>
                    </div>

                    {/* Stats Cards */}
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
                        {statsCards.map((stat, i) => (
                            <div
                                key={i}
                                className="flex items-center p-4 space-x-3 bg-white rounded-2xl shadow-lg hover:shadow-xl transition-all cursor-pointer group relative overflow-hidden"
                            >
                                <div className="absolute inset-0 bg-linear-to-br from-emerald-50/50 via-transparent to-green-50/50 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>

                                <div className={`p-3 rounded-full ${stat.color} shadow-md relative z-10`}>
                                    <stat.icon className={`w-6 h-6 ${stat.iconColor}`} />
                                </div>

                                <div className="w-px h-10 bg-gray-200"></div>

                                <div className="relative z-10 flex-1">
                                    <p className="text-sm text-gray-600 font-medium">{stat.label}</p>
                                    <p className="text-lg font-bold text-gray-800">{stat.value}</p>
                                </div>
                            </div>
                        ))}
                    </div>

                    {/* Main Content - Side by Side */}
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                        {/* Left: Create Backup + Schedule */}
                        <div className="space-y-6">
                            {/* Create Backup Card */}
                            <div
                                className="bg-white rounded-3xl shadow-2xl p-8 relative overflow-hidden"
                            >
                                <div className="absolute -top-24 -right-24 w-64 h-64 bg-linear-to-br from-emerald-400/20 to-green-400/20 rounded-full blur-3xl"></div>

                                <div className="relative z-10">
                                    <div className="flex items-center justify-center mb-6">
                                        <div className="p-4 bg-linear-to-br from-emerald-500 to-green-500 rounded-2xl shadow-xl">
                                            <CloudUpload className="w-12 h-12 text-white" />
                                        </div>
                                    </div>

                                    <h3 className="text-2xl font-bold text-gray-800 text-center mb-2">
                                        Create New Backup
                                    </h3>
                                    <p className="text-gray-600 text-center mb-6">
                                        Generate a complete database backup
                                    </p>

                                    {isBackingUp && (
                                        <div className="mb-4 p-3 bg-blue-50 rounded-xl flex items-center space-x-3">
                                            <RefreshCw className="w-5 h-5 text-blue-600 animate-spin" />
                                            <span className="text-blue-700 font-medium">Creating backup...</span>
                                        </div>
                                    )}

                                    <div className="space-y-3">
                                        <button
                                            onClick={handleBackup}
                                            disabled={isBackingUp}
                                            className="w-full bg-linear-to-r from-emerald-500 to-green-500 hover:from-emerald-600 hover:to-green-600 text-white font-semibold py-4 px-6 rounded-xl shadow-lg hover:shadow-xl transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center space-x-2"
                                        >
                                            {isBackingUp ? (
                                                <RefreshCw className="w-5 h-5 animate-spin" />
                                            ) : (
                                                <CloudUpload className="w-5 h-5" />
                                            )}
                                            <span>{isBackingUp ? 'Creating...' : 'Create Backup Now'}</span>
                                        </button>

                                        <button
                                            onClick={fetchBackupList}
                                            className="w-full bg-gray-100 hover:bg-gray-200 text-gray-700 font-semibold py-3 px-6 rounded-xl transition-all flex items-center justify-center space-x-2"
                                        >
                                            <RefreshCw className="w-4 h-4" />
                                            <span>Refresh List</span>
                                        </button>
                                    </div>
                                </div>
                            </div>

                            {/* Schedule Card */}
                            <div
                                className="bg-white rounded-3xl shadow-2xl p-8"
                            >
                                <h3 className="text-xl font-bold text-gray-800 mb-6 flex items-center gap-2">
                                    <Clock className="w-6 h-6 text-emerald-600" />
                                    Backup Schedule
                                </h3>

                                <div className="bg-emerald-50 rounded-xl p-5 border-2 border-emerald-200 mb-4">
                                    <div className="flex items-start space-x-3">
                                        <CheckCircle className="w-6 h-6 text-emerald-600 mt-0.5 shrink-0" />
                                        <div className="flex-1">
                                            <p className="font-bold text-emerald-900 text-lg mb-1">Auto-Backup Active</p>
                                            <p className="text-sm text-emerald-700 mb-2">
                                                Schedule: <span className="font-semibold">{scheduleStatus.schedule}</span>
                                            </p>
                                            <p className="text-sm text-emerald-700">
                                                Next backup: <span className="font-semibold">{formatNextRun(scheduleStatus.nextRun)}</span>
                                            </p>
                                        </div>
                                    </div>
                                </div>

                                <div className="p-4 bg-amber-50 rounded-xl border border-amber-200">
                                    <div className="flex items-start space-x-3">
                                        <AlertTriangle className="w-5 h-5 text-amber-600 mt-0.5 shrink-0" />
                                        <div>
                                            <p className="font-semibold text-amber-800">Retention Policy</p>
                                            <p className="text-sm text-amber-700">Backups are automatically stored for 7 days</p>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Right: Available Backups */}
                        <div
                            className="bg-white rounded-3xl shadow-2xl p-8 h-fit"
                        >
                            <div className="flex items-center justify-between mb-6">
                                <h3 className="text-xl font-bold text-gray-800 flex items-center gap-2">
                                    <FileText className="w-6 h-6 text-emerald-600" />
                                    Available Backups
                                </h3>
                                <span className="px-3 py-1 bg-emerald-100 text-emerald-700 rounded-full text-sm font-semibold">
                                    {backupFiles.length} files
                                </span>
                            </div>

                            <div className="space-y-3 max-h-[600px] overflow-y-auto pr-2 custom-scrollbar">
                                {backupFiles.length === 0 ? (
                                    <div className="text-center py-12 text-gray-500">
                                        <div className="inline-block p-6 bg-gray-50 rounded-full mb-4">
                                            <FileText className="w-16 h-16 text-gray-300" />
                                        </div>
                                        <p className="text-lg font-semibold text-gray-600">No backups available</p>
                                        <p className="text-sm text-gray-500 mt-2">Create your first backup to get started</p>
                                    </div>
                                ) : (
                                    backupFiles.map((file, i) => (
                                        <div
                                            key={i}
                                            className="flex items-center justify-between p-4 bg-linear-to-r from-emerald-50 to-green-50 rounded-xl border border-emerald-100 hover:shadow-lg transition-all group"
                                        >
                                            <div className="flex items-center space-x-3 flex-1 min-w-0">
                                                <div className="p-2.5 bg-linear-to-br from-emerald-500 to-green-500 rounded-lg shadow-md shrink-0">
                                                    <Database className="w-5 h-5 text-white" />
                                                </div>
                                                <div className="flex-1 min-w-0">
                                                    <p className="font-semibold text-gray-800 truncate">{file.filename}</p>
                                                    <div className="flex items-center gap-3 text-sm text-gray-600 mt-1">
                                                        <span className="font-medium">{file.size}</span>
                                                        <span className="text-gray-400">•</span>
                                                        <span>{formatDate(file.date)}</span>
                                                    </div>
                                                </div>
                                            </div>

                                            <button
                                                onClick={() => handleDownload(file.filename)}
                                                className="ml-3 p-2.5 bg-emerald-500 hover:bg-emerald-600 text-white rounded-lg transition-all hover:scale-110 shadow-md shrink-0"
                                                title="Download backup"
                                            >
                                                <Download className="w-5 h-5" />
                                            </button>
                                        </div>
                                    ))
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            <style>{`
                .custom-scrollbar::-webkit-scrollbar {
                    width: 8px;
                }
                .custom-scrollbar::-webkit-scrollbar-track {
                    background: #f1f5f9;
                    border-radius: 10px;
                }
                .custom-scrollbar::-webkit-scrollbar-thumb {
                    background: #10b981;
                    border-radius: 10px;
                }
                .custom-scrollbar::-webkit-scrollbar-thumb:hover {
                    background: #059669;
                }
            `}</style>
        </>
    );
};

export default BackUp;