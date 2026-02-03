import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Download, RefreshCw, X, AlertCircle, CheckCircle } from 'lucide-react';
import toast from 'react-hot-toast';

interface UpdateInfo {
  version: string;
  releaseDate?: string;
  releaseName?: string;
  releaseNotes?: string;
}

interface DownloadProgress {
  percent: number;
  bytesPerSecond: number;
  total: number;
  transferred: number;
}

export const UpdateNotification = () => {
  const [updateAvailable, setUpdateAvailable] = useState(false);
  const [updateInfo, setUpdateInfo] = useState<UpdateInfo | null>(null);
  const [downloading, setDownloading] = useState(false);
  const [downloadProgress, setDownloadProgress] = useState<DownloadProgress | null>(null);
  const [updateDownloaded, setUpdateDownloaded] = useState(false);
  const [checking, setChecking] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [show, setShow] = useState(false);

  useEffect(() => {
    // Check if running in Electron
    if (!(window as any).electronAPI) {
      console.log('Not running in Electron, update notifications disabled');
      return;
    }

    const electronAPI = (window as any).electronAPI;

    // Set up event listeners
    const removeCheckingListener = electronAPI.onUpdateChecking(() => {
      setChecking(true);
      setError(null);
    });

    const removeAvailableListener = electronAPI.onUpdateAvailable((info: UpdateInfo) => {
      console.log('Update available:', info);
      setUpdateAvailable(true);
      setUpdateInfo(info);
      setChecking(false);
      setShow(true);
      
      toast.success(`Update v${info.version} is available!`, {
        duration: 5000,
        icon: '🎉',
      });
    });

    const removeNotAvailableListener = electronAPI.onUpdateNotAvailable(() => {
      console.log('No updates available');
      setChecking(false);
      setUpdateAvailable(false);
    });

    const removeErrorListener = electronAPI.onUpdateError((errorMessage: string) => {
      console.error('Update error:', errorMessage);
      setError(errorMessage);
      setChecking(false);
      setDownloading(false);
      
      // Don't show toast error in development mode
      if (import.meta.env.PROD) {
        toast.error('Update check failed', {
          duration: 4000,
        });
      }
    });

    const removeProgressListener = electronAPI.onDownloadProgress((progress: DownloadProgress) => {
      console.log('Download progress:', progress.percent);
      setDownloadProgress(progress);
      setDownloading(true);
    });

    const removeDownloadedListener = electronAPI.onUpdateDownloaded((info: UpdateInfo) => {
      console.log('Update downloaded:', info);
      setDownloading(false);
      setUpdateDownloaded(true);
      setShow(true);
      
      toast.success('Update downloaded! Ready to install.', {
        duration: 5000,
        icon: '✅',
      });
    });

    // Cleanup listeners on unmount
    return () => {
      removeCheckingListener();
      removeAvailableListener();
      removeNotAvailableListener();
      removeErrorListener();
      removeProgressListener();
      removeDownloadedListener();
    };
  }, []);

  const handleCheckForUpdates = async () => {
    const electronAPI = (window as any).electronAPI;
    if (!electronAPI) return;

    setChecking(true);
    setError(null);
    
    try {
      const result = await electronAPI.checkForUpdates();
      if (result.error) {
        setError(result.error);
        toast.error('Failed to check for updates');
      } else if (!result.available) {
        toast.success('You have the latest version!');
      }
    } catch (err) {
      setError('Failed to check for updates');
      toast.error('Failed to check for updates');
    } finally {
      setChecking(false);
    }
  };

  const handleDownloadUpdate = async () => {
    const electronAPI = (window as any).electronAPI;
    if (!electronAPI) return;

    try {
      setDownloading(true);
      await electronAPI.downloadUpdate();
    } catch (err) {
      setError('Failed to download update');
      setDownloading(false);
      toast.error('Failed to download update');
    }
  };

  const handleInstallUpdate = () => {
    const electronAPI = (window as any).electronAPI;
    if (!electronAPI) return;

    electronAPI.installUpdate();
  };

  const handleDismiss = () => {
    setShow(false);
  };

  // Don't render if not in Electron
  if (!(window as any).electronAPI) {
    return null;
  }

  return (
    <>
      {/* Update Available/Downloaded Notification */}
      <AnimatePresence>
        {show && (updateAvailable || updateDownloaded) && (
          <motion.div
            initial={{ opacity: 0, y: -100 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -100 }}
            className="fixed top-4 right-4 z-[9999] max-w-md"
          >
            <div className="bg-white rounded-xl shadow-2xl border-2 border-blue-500 overflow-hidden">
              {/* Header */}
              <div className="bg-gradient-to-r from-blue-500 to-blue-600 px-4 py-3 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  {updateDownloaded ? (
                    <CheckCircle className="w-5 h-5 text-white" />
                  ) : (
                    <Download className="w-5 h-5 text-white" />
                  )}
                  <h3 className="font-bold text-white">
                    {updateDownloaded ? 'Update Ready' : 'Update Available'}
                  </h3>
                </div>
                <button
                  onClick={handleDismiss}
                  className="text-white hover:bg-white/20 rounded-lg p-1 transition-colors"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              {/* Content */}
              <div className="p-4">
                {updateInfo && (
                  <div className="mb-4">
                    <p className="text-sm text-gray-600 mb-1">
                      Version <span className="font-bold text-blue-600">{updateInfo.version}</span> is available
                    </p>
                    {updateInfo.releaseNotes && (
                      <p className="text-xs text-gray-500 mt-2 line-clamp-3">
                        {updateInfo.releaseNotes}
                      </p>
                    )}
                  </div>
                )}

                {/* Download Progress */}
                {downloading && downloadProgress && (
                  <div className="mb-4">
                    <div className="flex justify-between text-xs text-gray-600 mb-1">
                      <span>Downloading...</span>
                      <span>{Math.round(downloadProgress.percent)}%</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2 overflow-hidden">
                      <motion.div
                        className="bg-blue-500 h-full"
                        initial={{ width: 0 }}
                        animate={{ width: `${downloadProgress.percent}%` }}
                        transition={{ duration: 0.3 }}
                      />
                    </div>
                    <p className="text-xs text-gray-500 mt-1">
                      {(downloadProgress.transferred / 1024 / 1024).toFixed(2)} MB of{' '}
                      {(downloadProgress.total / 1024 / 1024).toFixed(2)} MB
                    </p>
                  </div>
                )}

                {/* Error Message */}
                {error && (
                  <div className="mb-4 p-2 bg-red-50 border border-red-200 rounded-lg flex items-start gap-2">
                    <AlertCircle className="w-4 h-4 text-red-500 flex-shrink-0 mt-0.5" />
                    <p className="text-xs text-red-700">{error}</p>
                  </div>
                )}

                {/* Action Buttons */}
                <div className="flex gap-2">
                  {updateDownloaded ? (
                    <button
                      onClick={handleInstallUpdate}
                      className="flex-1 bg-gradient-to-r from-emerald-500 to-green-500 hover:from-emerald-600 hover:to-green-600 text-white font-semibold py-2.5 px-4 rounded-lg transition-all shadow-md flex items-center justify-center gap-2"
                    >
                      <RefreshCw className="w-4 h-4" />
                      Install & Restart
                    </button>
                  ) : downloading ? (
                    <button
                      disabled
                      className="flex-1 bg-gray-300 text-gray-500 font-semibold py-2.5 px-4 rounded-lg flex items-center justify-center gap-2 cursor-not-allowed"
                    >
                      <RefreshCw className="w-4 h-4 animate-spin" />
                      Downloading...
                    </button>
                  ) : (
                    <>
                      <button
                        onClick={handleDismiss}
                        className="flex-1 bg-gray-100 hover:bg-gray-200 text-gray-700 font-semibold py-2.5 px-4 rounded-lg transition-colors"
                      >
                        Later
                      </button>
                      <button
                        onClick={handleDownloadUpdate}
                        className="flex-1 bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white font-semibold py-2.5 px-4 rounded-lg transition-all shadow-md flex items-center justify-center gap-2"
                      >
                        <Download className="w-4 h-4" />
                        Download
                      </button>
                    </>
                  )}
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* System Tray-like Update Indicator (small icon in corner) */}
      {updateAvailable && !show && !updateDownloaded && (
        <button
          onClick={() => setShow(true)}
          className="fixed bottom-4 right-4 z-[9999] bg-blue-500 hover:bg-blue-600 text-white rounded-full p-3 shadow-lg transition-all hover:scale-110"
          title="Update available"
        >
          <Download className="w-5 h-5 animate-bounce" />
        </button>
      )}

      {updateDownloaded && !show && (
        <button
          onClick={() => setShow(true)}
          className="fixed bottom-4 right-4 z-[9999] bg-emerald-500 hover:bg-emerald-600 text-white rounded-full p-3 shadow-lg transition-all hover:scale-110"
          title="Update ready to install"
        >
          <CheckCircle className="w-5 h-5 animate-pulse" />
        </button>
      )}
    </>
  );
};
