import { useState, useEffect } from 'react';
import { Clock, Info, AlertTriangle, RefreshCw } from 'lucide-react';
import api from '../api/axiosConfig';
import { motion, AnimatePresence } from 'framer-motion';

interface SubscriptionData {
    id: number;
    amount: number;
    due_date: string;
    status: string;
    is_paid: boolean;
}

const SubscriptionBanner = () => {
    const [subData, setSubData] = useState<SubscriptionData | null>(null);
    const [daysRemaining, setDaysRemaining] = useState<number | null>(null);

    useEffect(() => {
        const fetchStatus = async () => {
            try {
                const response = await api.get('/subscription/status');
                if (response.data.success && response.data.data) {
                    const data = response.data.data;
                    setSubData(data);
                    
                    const now = new Date();
                    const dueDate = new Date(data.due_date);
                    const diffTime = dueDate.getTime() - now.getTime();
                    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
                    setDaysRemaining(diffDays);
                }
            } catch (error) {
                console.error('Failed to fetch subscription status:', error);
            }
        };

        fetchStatus();
        const interval = setInterval(fetchStatus, 3600000); // Check every hour
        return () => clearInterval(interval);
    }, []);

    // Conditions: Not paid AND <= 7 days remaining
    if (!subData || subData.is_paid || daysRemaining === null || daysRemaining > 7) {
        return null;
    }

    const isExpired = daysRemaining !== null && (daysRemaining <= 0 || subData.status === 'Expired' || subData.status === 'Suspended');
    const isCritical = daysRemaining !== null && daysRemaining <= 2 && !isExpired;

    return (
        <AnimatePresence>
            {isExpired ? (
                // BLOCKING FULL-SCREEN MODAL: For Expired/Suspended licenses
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="fixed inset-0 z-9999 flex items-center justify-center bg-black/60 backdrop-blur-xl px-4"
                >
                    <motion.div
                        initial={{ scale: 0.9, y: 20, opacity: 0 }}
                        animate={{ scale: 1, y: 0, opacity: 1 }}
                        className="bg-white rounded-4xl p-10 shadow-2xl max-w-2xl w-full border-t-8 border-red-600 relative overflow-hidden"
                    >
                        {/* Status Badge */}
                        <div className="absolute top-0 right-0 bg-red-600 text-white px-8 py-2 rounded-bl-3xl font-black text-sm tracking-widest uppercase">
                            {subData.status === 'Suspended' ? 'Suspended' : 'Expired'}
                        </div>

                        <div className="flex flex-col md:flex-row gap-8 items-start mb-10">
                            <div className="h-20 w-20 bg-red-100 rounded-2xl flex items-center justify-center shrink-0 shadow-inner">
                                <AlertTriangle className="text-red-600" size={40} />
                            </div>
                            <div>
                                <h1 className="text-3xl font-black text-gray-900 mb-2 leading-tight uppercase">
                                    System Activation Required
                                </h1>
                                <p className="text-gray-500 font-medium">
                                    Your license expired on <span className="text-red-600 font-bold">{new Date(subData.due_date).toLocaleDateString()}</span>. 
                                    Please settle the outstanding amount to reactivate your ReoX POS system.
                                </p>
                            </div>
                        </div>

                        <div className="grid md:grid-cols-2 gap-6 mb-10">
                            {/* Bank Details */}
                            <div className="bg-gray-50 p-6 rounded-3xl border border-gray-100">
                                <h3 className="text-xs font-black text-gray-400 uppercase tracking-widest mb-4 flex items-center gap-2">
                                    <div className="h-1.5 w-1.5 bg-emerald-500 rounded-full" />
                                    Bank Transfer Details
                                </h3>
                                <div className="space-y-3">
                                    <div>
                                        <p className="text-[10px] text-gray-400 uppercase font-bold">Bank Name</p>
                                        <p className="text-sm font-bold text-gray-700">HNB Bank - Wariyapola</p>
                                    </div>
                                    <div>
                                        <p className="text-[10px] text-gray-400 uppercase font-bold">Account Holder</p>
                                        <p className="text-sm font-bold text-gray-700">1000D TECHNOLOGY (PVT) LTD</p>
                                    </div>
                                    <div>
                                        <p className="text-[10px] text-gray-400 uppercase font-bold">Account Number</p>
                                        <p className="text-lg font-black text-emerald-600 tracking-wider">153010012720</p>
                                    </div>
                                </div>
                            </div>

                            {/* Contact Details */}
                            <div className="bg-emerald-50 p-6 rounded-3xl border border-emerald-100/50">
                                <h3 className="text-xs font-black text-emerald-600 uppercase tracking-widest mb-4 flex items-center gap-2">
                                    <div className="h-1.5 w-1.5 bg-emerald-500 rounded-full" />
                                    Support & Activation
                                </h3>
                                <div className="space-y-4">
                                    <p className="text-xs text-emerald-800 font-medium leading-relaxed">
                                        After making the payment, please send the receipt to our activation team.
                                    </p>
                                    <div className="space-y-3">
                                        <div className="flex items-center gap-3 bg-white/60 p-2 rounded-xl border border-emerald-200/50">
                                            <div className="h-8 w-8 bg-emerald-500 rounded-lg flex items-center justify-center text-white shrink-0">
                                                <Info size={16} />
                                            </div>
                                            <div>
                                                <p className="text-[10px] text-gray-400 uppercase font-bold">Kurunegala Branch</p>
                                                <p className="text-sm font-bold text-emerald-700">0774227449</p>
                                            </div>
                                        </div>
                                        <div className="flex items-center gap-3 bg-white/60 p-2 rounded-xl border border-emerald-200/50">
                                            <div className="h-8 w-8 bg-emerald-500 rounded-lg flex items-center justify-center text-white shrink-0">
                                                <Info size={16} />
                                            </div>
                                            <div>
                                                <p className="text-[10px] text-gray-400 uppercase font-bold">Anuradhapura Branch</p>
                                                <p className="text-sm font-bold text-emerald-700">0769690251</p>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div className="flex flex-col sm:flex-row gap-4">
                            <button
                                onClick={() => window.location.reload()}
                                className="flex-1 bg-gray-900 hover:bg-black text-white font-bold py-4 rounded-2xl transition-all shadow-xl flex items-center justify-center gap-3 active:scale-95"
                            >
                                <RefreshCw size={20} />
                                Verify Payment
                            </button>
                            <button 
                                onClick={() => window.location.href = 'tel:0774227449'}
                                className="flex-1 bg-white border-2 border-emerald-200 text-emerald-600 hover:bg-emerald-50 font-bold py-4 rounded-2xl transition-all flex items-center justify-center gap-3 shadow-lg"
                            >
                                Contact Support
                            </button>
                        </div>

                        <p className="text-center mt-8 text-[10px] text-gray-300 font-bold uppercase tracking-[0.2em]">
                            ReoX POS System Security • Build 1000D
                        </p>
                    </motion.div>
                </motion.div>
            ) : (
                // REMINDER BANNER: Sticky top banner when not yet expired
                <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: 'auto', opacity: 1 }}
                    className={`${
                        isCritical 
                        ? 'bg-linear-to-r from-red-600 to-orange-600' 
                        : 'bg-linear-to-r from-amber-500 to-yellow-600'
                    } text-white px-6 py-2 shadow-lg relative overflow-hidden group`}
                >
                    <div className="absolute inset-0 bg-linear-to-r from-transparent via-white/10 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000 ease-in-out" />
                    
                    <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-3 text-sm font-medium">
                        <div className="flex items-center gap-3">
                            <div className={`p-1.5 rounded-full ${isCritical ? 'bg-white/20' : 'bg-black/10'}`}>
                                {isCritical ? <AlertTriangle size={18} className="animate-pulse" /> : <Clock size={18} />}
                            </div>
                            <p className="tracking-wide">
                                <span className="font-bold uppercase mr-2">Subscription Reminder:</span>
                                Your monthly fee of <span className="font-bold">LKR {subData.amount.toLocaleString()}</span> is due in 
                                <span className={`mx-2 px-2 py-0.5 rounded-md font-bold ${isCritical ? 'bg-white text-red-600' : 'bg-black/20 text-white'}`}>
                                    {daysRemaining === 1 ? '1 day' : `${daysRemaining} days`}
                                </span>
                            </p>
                        </div>
                        
                        <div className="flex items-center gap-4">
                            <span className="hidden lg:flex items-center gap-1.5 opacity-90 italic">
                                <Info size={14} />
                                Due Date: {new Date(subData.due_date).toLocaleDateString()}
                            </span>
                            <div className="h-4 w-px bg-white/30 hidden md:block" />
                            <p className="text-xs uppercase tracking-widest font-bold opacity-80">
                                Action Required soon
                            </p>
                        </div>
                    </div>
                </motion.div>
            )}
        </AnimatePresence>
    );
};

export default SubscriptionBanner;
