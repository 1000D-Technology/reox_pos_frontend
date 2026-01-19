import { motion, AnimatePresence } from 'framer-motion';
import { X, UserPlus, Phone, Mail, CreditCard } from 'lucide-react';
import { useState } from 'react';

interface CustomerRegistrationModalProps {
    isOpen: boolean;
    onClose: () => void;
    onRegister: (name: string, contact: string, email?: string, creditBalance?: number) => void;
}

export const CustomerRegistrationModal = ({
                                              isOpen,
                                              onClose,
                                              onRegister
                                          }: CustomerRegistrationModalProps) => {
    const [name, setName] = useState('');
    const [contact, setContact] = useState('');
    const [email, setEmail] = useState('');
    const [creditBalance, setCreditBalance] = useState('');

    const handleSubmit = () => {
        if (name.trim() && contact.trim()) {
            onRegister(
                name, 
                contact, 
                email.trim() || undefined,
                creditBalance ? parseFloat(creditBalance) : undefined
            );
            // Don't close modal here - let parent component handle closing on success
        }
    };

    const handleCancel = () => {
        setName('');
        setContact('');
        setEmail('');
        setCreditBalance('');
        onClose();
    };

    return (
        <AnimatePresence>
            {isOpen && (
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4"
                    onClick={onClose}
                >
                    <motion.div
                        initial={{ scale: 0.9, opacity: 0 }}
                        animate={{ scale: 1, opacity: 1 }}
                        exit={{ scale: 0.9, opacity: 0 }}
                        onClick={(e) => e.stopPropagation()}
                        className="bg-white rounded-2xl shadow-2xl p-6 w-full max-w-md"
                    >
                        <div className="flex items-center justify-between mb-4">
                            <h2 className="text-xl font-bold text-gray-800">Register Customer</h2>
                            <button
                                onClick={onClose}
                                className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                            >
                                <X className="w-5 h-5 text-gray-600" />
                            </button>
                        </div>

                        <div className="space-y-4">
                            <div>
                                <label className="text-sm font-semibold text-gray-700 mb-1.5 block">
                                    Customer Name <span className="text-red-500">*</span>
                                </label>
                                <input
                                    type="text"
                                    placeholder="Enter customer name"
                                    value={name}
                                    onChange={(e) => setName(e.target.value)}
                                    className="w-full px-3 py-2.5 bg-gray-50 border-2 border-gray-200 rounded-lg focus:outline-none focus:border-emerald-500 transition-colors"
                                />
                            </div>

                            <div>
                                <label className="text-sm font-semibold text-gray-700 mb-1.5 block">
                                    Contact Number <span className="text-red-500">*</span>
                                </label>
                                <div className="relative">
                                    <Phone className="absolute left-3 top-3 w-4 h-4 text-gray-400" />
                                    <input
                                        type="tel"
                                        placeholder="Enter contact number"
                                        value={contact}
                                        onChange={(e) => setContact(e.target.value)}
                                        className="w-full pl-10 pr-3 py-2.5 bg-gray-50 border-2 border-gray-200 rounded-lg focus:outline-none focus:border-emerald-500 transition-colors"
                                    />
                                </div>
                            </div>

                            <div>
                                <label className="text-sm font-semibold text-gray-700 mb-1.5 block">
                                    Email Address
                                </label>
                                <div className="relative">
                                    <Mail className="absolute left-3 top-3 w-4 h-4 text-gray-400" />
                                    <input
                                        type="email"
                                        placeholder="Enter email (optional)"
                                        value={email}
                                        onChange={(e) => setEmail(e.target.value)}
                                        className="w-full pl-10 pr-3 py-2.5 bg-gray-50 border-2 border-gray-200 rounded-lg focus:outline-none focus:border-emerald-500 transition-colors"
                                    />
                                </div>
                            </div>

                            <div>
                                <label className="text-sm font-semibold text-gray-700 mb-1.5 block">
                                    Credit Balance
                                </label>
                                <div className="relative">
                                    <CreditCard className="absolute left-3 top-3 w-4 h-4 text-gray-400" />
                                    <input
                                        type="number"
                                        placeholder="Enter credit balance (optional)"
                                        value={creditBalance}
                                        onChange={(e) => setCreditBalance(e.target.value)}
                                        className="w-full pl-10 pr-3 py-2.5 bg-gray-50 border-2 border-gray-200 rounded-lg focus:outline-none focus:border-emerald-500 transition-colors"
                                        step="0.01"
                                        min="0"
                                    />
                                </div>
                            </div>

                            <div className="flex gap-3 pt-2">
                                <button
                                    onClick={handleCancel}
                                    className="flex-1 py-2.5 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-xl font-semibold transition-colors"
                                >
                                    Cancel
                                </button>
                                <button
                                    onClick={handleSubmit}
                                    disabled={!name.trim() || !contact.trim()}
                                    className="flex-1 py-2.5 bg-gradient-to-r from-emerald-500 to-emerald-600 text-white rounded-xl font-semibold hover:shadow-lg disabled:opacity-50 disabled:cursor-not-allowed transition-all"
                                >
                                    <div className="flex items-center justify-center gap-2">
                                        <UserPlus className="w-4 h-4" />
                                        Register
                                    </div>
                                </button>
                            </div>
                        </div>
                    </motion.div>
                </motion.div>
            )}
        </AnimatePresence>
    );
};