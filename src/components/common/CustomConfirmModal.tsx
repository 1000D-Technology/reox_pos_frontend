import { motion, AnimatePresence } from 'framer-motion';
import { AlertCircle, CheckCircle2, Info, HelpCircle, X, Loader2 } from 'lucide-react';

export type ModalVariant = 'danger' | 'warning' | 'success' | 'info' | 'primary';

interface CustomConfirmModalProps {
    isOpen: boolean;
    onClose: () => void;
    onConfirm: () => void;
    title: string;
    message: string;
    confirmText?: string;
    cancelText?: string;
    variant?: ModalVariant;
    isLoading?: boolean;
}

const CustomConfirmModal = ({
    isOpen,
    onClose,
    onConfirm,
    title,
    message,
    confirmText = 'Confirm',
    cancelText = 'Cancel',
    variant = 'primary',
    isLoading = false
}: CustomConfirmModalProps) => {
    
    const getVariantStyles = () => {
        switch (variant) {
            case 'danger':
                return {
                    icon: <AlertCircle className="w-8 h-8 text-red-600" />,
                    bg: 'bg-red-50',
                    border: 'border-red-100',
                    button: 'bg-red-600 hover:bg-red-700 shadow-red-200',
                    iconBg: 'bg-red-100'
                };
            case 'warning':
                return {
                    icon: <AlertCircle className="w-8 h-8 text-amber-600" />,
                    bg: 'bg-amber-50',
                    border: 'border-amber-100',
                    button: 'bg-amber-600 hover:bg-amber-700 shadow-amber-200',
                    iconBg: 'bg-amber-100'
                };
            case 'success':
                return {
                    icon: <CheckCircle2 className="w-8 h-8 text-emerald-600" />,
                    bg: 'bg-emerald-50',
                    border: 'border-emerald-100',
                    button: 'bg-emerald-600 hover:bg-emerald-700 shadow-emerald-200',
                    iconBg: 'bg-emerald-100'
                };
            case 'info':
                return {
                    icon: <Info className="w-8 h-8 text-blue-600" />,
                    bg: 'bg-blue-50',
                    border: 'border-blue-100',
                    button: 'bg-blue-600 hover:bg-blue-700 shadow-blue-200',
                    iconBg: 'bg-blue-100'
                };
            default:
                return {
                    icon: <HelpCircle className="w-8 h-8 text-indigo-600" />,
                    bg: 'bg-indigo-50',
                    border: 'border-indigo-100',
                    button: 'bg-indigo-600 hover:bg-indigo-700 shadow-indigo-200',
                    iconBg: 'bg-indigo-100'
                };
        }
    };

    const styles = getVariantStyles();

    return (
        <AnimatePresence>
            {isOpen && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        onClick={onClose}
                        className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm"
                    />
                    
                    <motion.div
                        initial={{ scale: 0.9, opacity: 0, y: 20 }}
                        animate={{ scale: 1, opacity: 1, y: 0 }}
                        exit={{ scale: 0.9, opacity: 0, y: 20 }}
                        className="bg-white rounded-3xl shadow-2xl w-full max-w-sm overflow-hidden relative z-10 border border-slate-100"
                    >
                        <div className="p-8 text-center">
                            <div className={`${styles.iconBg} rounded-2xl w-20 h-20 flex items-center justify-center mx-auto mb-6`}>
                                {styles.icon}
                            </div>
                            
                            <h3 className="text-2xl font-black text-slate-800 mb-2 leading-tight">
                                {title}
                            </h3>
                            <p className="text-slate-500 font-medium leading-relaxed mb-8">
                                {message}
                            </p>
                            
                            <div className="flex gap-3">
                                <button
                                    onClick={onClose}
                                    disabled={isLoading}
                                    className="flex-1 py-3.5 bg-slate-50 text-slate-500 font-bold rounded-2xl hover:bg-slate-100 transition-all border border-slate-200 disabled:opacity-50"
                                >
                                    {cancelText}
                                </button>
                                <button
                                    onClick={onConfirm}
                                    disabled={isLoading}
                                    className={`flex-1 py-3.5 text-white font-black rounded-2xl shadow-lg transition-all active:scale-95 flex items-center justify-center gap-2 disabled:opacity-50 ${styles.button}`}
                                >
                                    {isLoading ? (
                                        <>
                                            <Loader2 className="w-5 h-5 animate-spin" />
                                            <span>Processing...</span>
                                        </>
                                    ) : (
                                        confirmText
                                    )}
                                </button>
                            </div>
                        </div>
                        
                        <button 
                            onClick={onClose}
                            className="absolute top-4 right-4 p-2 text-slate-400 hover:bg-slate-100 rounded-full transition-colors"
                        >
                            <X className="w-5 h-5" />
                        </button>
                    </motion.div>
                </div>
            )}
        </AnimatePresence>
    );
};

export default CustomConfirmModal;
