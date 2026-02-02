import React, { useState, useEffect } from 'react';
import { WifiOff, RefreshCw } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

interface InternetStatusWrapperProps {
    children: React.ReactNode;
}

const InternetStatusWrapper: React.FC<InternetStatusWrapperProps> = ({ children }) => {
    const [isOnline, setIsOnline] = useState(navigator.onLine);

    useEffect(() => {
        const handleOnline = () => setIsOnline(true);
        const handleOffline = () => setIsOnline(false);

        window.addEventListener('online', handleOnline);
        window.addEventListener('offline', handleOffline);

        return () => {
            window.removeEventListener('online', handleOnline);
            window.removeEventListener('offline', handleOffline);
        };
    }, []);

    const handleRetry = () => {
        setIsOnline(navigator.onLine);
    };

    return (
        <>
            {children}
            <AnimatePresence>
                {!isOnline && (
                    <motion.div
                        initial={{ x: 300, opacity: 0 }}
                        animate={{ x: 0, opacity: 1 }}
                        exit={{ x: 300, opacity: 0 }}
                        className="fixed bottom-6 right-6 z-9999 flex flex-col gap-2"
                    >
                        <div className="bg-white rounded-2xl p-5 shadow-[0_20px_50px_rgba(0,0,0,0.1)] max-w-sm w-full border border-red-100 flex items-start gap-4 backdrop-blur-xl">
                            <div className="h-12 w-12 bg-red-50 rounded-full flex items-center justify-center shrink-0 animate-pulse">
                                <WifiOff className="text-red-500" size={24} />
                            </div>
                            
                            <div className="flex-1">
                                <h2 className="text-lg font-bold text-gray-900 mb-1 flex items-center justify-between">
                                    Connection Lost
                                    <div className="h-2 w-2 bg-red-500 rounded-full animate-ping" />
                                </h2>
                                <p className="text-sm text-gray-500 mb-4 leading-relaxed line-clamp-2">
                                    You are currently offline. Some features may be restricted.
                                </p>

                                <button
                                    onClick={handleRetry}
                                    className="w-full bg-red-500 hover:bg-red-600 text-white font-bold py-2 px-4 rounded-xl shadow-lg shadow-red-100 transition-all flex items-center justify-center gap-2 text-sm"
                                >
                                    <RefreshCw size={14} />
                                    Retry Connection
                                </button>
                            </div>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </>
    );
};

export default InternetStatusWrapper;
