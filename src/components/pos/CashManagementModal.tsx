import { motion, AnimatePresence } from 'framer-motion';
import {X, AlertCircle, Wallet, DollarSign, TrendingDown, TrendingUp} from 'lucide-react';
import { useState } from 'react';

interface CashManagementModalProps {
    isOpen: boolean;
    onClose: () => void;
}

type TransactionType = 'cash-in' | 'cash-out';

export const CashManagementModal = ({ isOpen, onClose }: CashManagementModalProps) => {
    const [transactionType, setTransactionType] = useState<TransactionType>('cash-in');
    const [amount, setAmount] = useState('');
    const [description, setDescription] = useState('');
    const [currentBalance] = useState(25000); // Mock balance

    const handleSubmit = () => {
        if (amount && Number(amount) > 0) {
            console.log('Cash transaction:', { transactionType, amount, description });
            setAmount('');
            setDescription('');
            onClose();
        }
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
                        className="bg-white rounded-2xl shadow-2xl w-full max-w-md p-6"
                    >
                        <div className="flex items-center justify-between mb-6">
                            <div className="flex items-center gap-3">
                                <div className="p-3 bg-cyan-100 rounded-xl">
                                    <Wallet className="w-6 h-6 text-cyan-600" />
                                </div>
                                <div>
                                    <h2 className="text-2xl font-bold text-gray-800">Cash Management</h2>
                                    <p className="text-sm text-gray-500">Record cash transactions</p>
                                </div>
                            </div>
                            <button
                                onClick={onClose}
                                className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                            >
                                <X className="w-5 h-5" />
                            </button>
                        </div>

                        {/* Current Balance */}
                        <div className="mb-6 p-4 bg-gradient-to-br from-cyan-500 to-cyan-600 rounded-xl text-white">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-sm text-cyan-100">Current Balance</p>
                                    <p className="text-2xl font-bold">Rs {currentBalance.toFixed(2)}</p>
                                </div>
                                <DollarSign className="w-8 h-8 text-cyan-200" />
                            </div>
                        </div>

                        {/* Transaction Type Toggle */}
                        <div className="flex gap-2 mb-4 bg-gray-100 p-2 rounded-xl">
                            <button
                                onClick={() => setTransactionType('cash-out')}
                                className={`flex-1 py-3 rounded-lg font-semibold transition-all flex items-center justify-center gap-2 ${
                                    transactionType === 'cash-out'
                                        ? 'bg-red-500 text-white shadow-md'
                                        : 'text-gray-600 hover:bg-gray-200'
                                }`}
                            >
                                <TrendingDown className="w-4 h-4" />
                                Cash Out
                            </button>
                            <button
                                onClick={() => setTransactionType('cash-in')}
                                className={`flex-1 py-3 rounded-lg font-semibold transition-all flex items-center justify-center gap-2 ${
                                    transactionType === 'cash-in'
                                        ? 'bg-green-500 text-white shadow-md'
                                        : 'text-gray-600 hover:bg-gray-200'
                                }`}
                            >
                                <TrendingUp className="w-4 h-4" />
                                Cash In
                            </button>
                        </div>

                        {/* Amount Input */}
                        <div className="mb-4">
                            <label className="block text-sm font-semibold text-gray-700 mb-2">
                                Amount (Rs)
                            </label>
                            <input
                                type="number"
                                min="0"
                                step="0.01"
                                value={amount}
                                onChange={(e) => setAmount(e.target.value)}
                                placeholder="Enter amount"
                                className="w-full p-3 border-2 border-cyan-200 rounded-xl focus:border-cyan-500 focus:outline-none text-lg"
                            />
                        </div>

                        {/* Description Input */}
                        <div className="mb-6">
                            <label className="block text-sm font-semibold text-gray-700 mb-2">
                                Description
                            </label>
                            <textarea
                                value={description}
                                onChange={(e) => setDescription(e.target.value)}
                                placeholder="Enter transaction description..."
                                rows={3}
                                className="w-full p-3 border-2 border-cyan-200 rounded-xl focus:border-cyan-500 focus:outline-none resize-none"
                            />
                        </div>

                        {/* Warning for Cash Out */}
                        {transactionType === 'cash-out' && Number(amount) > 0 && (
                            <div className="mb-4 p-3 bg-red-50 border-2 border-red-200 rounded-xl flex items-start gap-2">
                                <AlertCircle className="w-5 h-5 text-red-500 mt-0.5 flex-shrink-0" />
                                <p className="text-sm text-red-700">
                                    <strong>Warning:</strong> This will reduce your cash balance by Rs {Number(amount).toFixed(2)}
                                </p>
                            </div>
                        )}

                        {/* Preview */}
                        {Number(amount) > 0 && (
                            <div className="mb-4 p-3 bg-gray-50 rounded-xl">
                                <p className="text-sm text-gray-600 mb-1">New Balance:</p>
                                <p className="text-xl font-bold text-gray-800">
                                    Rs {(transactionType === 'cash-in'
                                        ? currentBalance + Number(amount)
                                        : currentBalance - Number(amount)
                                ).toFixed(2)}
                                </p>
                            </div>
                        )}

                        {/* Confirm Button */}
                        <button
                            onClick={handleSubmit}
                            disabled={!amount || Number(amount) <= 0 || !description.trim()}
                            className={`w-full py-4 rounded-xl font-bold text-white transition-all disabled:opacity-50 disabled:cursor-not-allowed ${
                                transactionType === 'cash-out'
                                    ? 'bg-gradient-to-r from-red-500 to-red-600 hover:from-red-600 hover:to-red-700'
                                    : 'bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700'
                            }`}
                        >
                            Confirm {transactionType === 'cash-out' ? 'Cash Out' : 'Cash In'}
                        </button>
                    </motion.div>
                </motion.div>
            )}
        </AnimatePresence>
    );
};