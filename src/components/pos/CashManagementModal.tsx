import { motion, AnimatePresence } from 'framer-motion';
import { X, AlertCircle, Wallet, DollarSign, TrendingDown, TrendingUp, Clock } from 'lucide-react';
import { useState, useEffect } from 'react';
import { moneyExchangeService } from '../../services/moneyExchangeService';
import toast from 'react-hot-toast';

interface CashManagementModalProps {
    isOpen: boolean;
    onClose: () => void;
}

type TransactionType = 'cash-in' | 'cash-out';

interface BalanceData {
    sessionId: number;
    openingBalance: number;
    cashAmount: number;
    exchangeTotal: number;
    currentBalance: number;
}

interface Transaction {
    id: number;
    transaction_type: string;
    amount: number;
    description: string;
    created_at: string;
    created_by_name: string;
}

export const CashManagementModal = ({ isOpen, onClose }: CashManagementModalProps) => {
    const [transactionType, setTransactionType] = useState<TransactionType>('cash-in');
    const [amount, setAmount] = useState('');
    const [description, setDescription] = useState('');
    const [balanceData, setBalanceData] = useState<BalanceData | null>(null);
    const [loading, setLoading] = useState(false);
    const [submitting, setSubmitting] = useState(false);
    const [transactions, setTransactions] = useState<Transaction[]>([]);

    useEffect(() => {
        if (isOpen) {
            loadBalance();
            loadTransactions();
        }
    }, [isOpen]);

    const loadBalance = async () => {
        try {
            setLoading(true);
            const response = await moneyExchangeService.getCurrentBalance();
            if (response.success) {
                setBalanceData(response.data);
            } else {
                toast.error(response.message || 'Failed to load balance');
            }
        } catch (error: any) {
            toast.error(error.response?.data?.message || 'Failed to load balance');
        } finally {
            setLoading(false);
        }
    };

    const loadTransactions = async () => {
        try {
            const response = await moneyExchangeService.getTransactionHistory();
            if (response.success) {
                setTransactions(response.data.slice(0, 5)); // Last 5 transactions
            }
        } catch (error) {
            console.error('Failed to load transactions:', error);
        }
    };

    const handleSubmit = async () => {
        if (!amount || Number(amount) <= 0 || !description.trim() || !balanceData) {
            toast.error('Please fill all required fields');
            return;
        }

        try {
            setSubmitting(true);
            const response = await moneyExchangeService.createTransaction({
                sessionId: balanceData.sessionId,
                transactionType,
                amount: Number(amount),
                description: description.trim()
            });

            if (response.success) {
                toast.success(response.message);
                setBalanceData(response.data);
                setAmount('');
                setDescription('');
                loadTransactions();
            } else {
                toast.error(response.message || 'Transaction failed');
            }
        } catch (error: any) {
            toast.error(error.response?.data?.message || 'Transaction failed');
        } finally {
            setSubmitting(false);
        }
    };

    const newBalance = balanceData && Number(amount) > 0
        ? (transactionType === 'cash-in'
            ? balanceData.currentBalance + Number(amount)
            : balanceData.currentBalance - Number(amount))
        : null;

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
                        className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl p-6 max-h-[90vh] overflow-y-auto"
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

                        {loading ? (
                            <div className="flex items-center justify-center py-12">
                                <div className="animate-spin rounded-full h-12 w-12 border-4 border-cyan-500 border-t-transparent"></div>
                            </div>
                        ) : balanceData ? (
                            <>
                                {/* Current Balance Breakdown */}
                                <div className="grid grid-cols-2 gap-4 mb-6">
                                    <div className="p-4 bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl text-white">
                                        <p className="text-sm text-blue-100">Opening Balance</p>
                                        <p className="text-xl font-bold">Rs {balanceData.openingBalance.toFixed(2)}</p>
                                    </div>
                                    <div className="p-4 bg-gradient-to-br from-green-500 to-green-600 rounded-xl text-white">
                                        <p className="text-sm text-green-100">Cash Sales</p>
                                        <p className="text-xl font-bold">Rs {balanceData.cashAmount.toFixed(2)}</p>
                                    </div>
                                    <div className="p-4 bg-gradient-to-br from-purple-500 to-purple-600 rounded-xl text-white">
                                        <p className="text-sm text-purple-100">Exchange Total</p>
                                        <p className="text-xl font-bold">Rs {balanceData.exchangeTotal.toFixed(2)}</p>
                                    </div>
                                    <div className="p-4 bg-gradient-to-br from-cyan-500 to-cyan-600 rounded-xl text-white">
                                        <div className="flex items-center justify-between">
                                            <div>
                                                <p className="text-sm text-cyan-100">Current Balance</p>
                                                <p className="text-2xl font-bold">Rs {balanceData.currentBalance.toFixed(2)}</p>
                                            </div>
                                            <DollarSign className="w-8 h-8 text-cyan-200" />
                                        </div>
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
                                        Amount (Rs) *
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
                                        Description *
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
                                {newBalance !== null && (
                                    <div className="mb-4 p-3 bg-gray-50 rounded-xl">
                                        <p className="text-sm text-gray-600 mb-1">New Balance:</p>
                                        <p className={`text-xl font-bold ${newBalance < 0 ? 'text-red-600' : 'text-gray-800'}`}>
                                            Rs {newBalance.toFixed(2)}
                                        </p>
                                    </div>
                                )}

                                {/* Recent Transactions */}
                                {transactions.length > 0 && (
                                    <div className="mb-4 p-4 bg-gray-50 rounded-xl">
                                        <h3 className="text-sm font-semibold text-gray-700 mb-3 flex items-center gap-2">
                                            <Clock className="w-4 h-4" />
                                            Recent Transactions
                                        </h3>
                                        <div className="space-y-2">
                                            {transactions.map((txn) => (
                                                <div key={txn.id} className="flex items-center justify-between text-sm p-2 bg-white rounded-lg">
                                                    <div className="flex items-center gap-2">
                                                        {txn.transaction_type === 'cash-in' ? (
                                                            <TrendingUp className="w-4 h-4 text-green-500" />
                                                        ) : (
                                                            <TrendingDown className="w-4 h-4 text-red-500" />
                                                        )}
                                                        <div>
                                                            <p className="font-medium text-gray-800">{txn.description}</p>
                                                            <p className="text-xs text-gray-500">
                                                                {new Date(txn.created_at).toLocaleString()}
                                                            </p>
                                                        </div>
                                                    </div>
                                                    <span className={`font-semibold ${
                                                        txn.transaction_type === 'cash-in' ? 'text-green-600' : 'text-red-600'
                                                    }`}>
                                                        {txn.transaction_type === 'cash-in' ? '+' : '-'}Rs {Number(txn.amount).toFixed(2)}
                                                    </span>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                )}

                                {/* Confirm Button */}
                                <button
                                    onClick={handleSubmit}
                                    disabled={!amount || Number(amount) <= 0 || !description.trim() || submitting}
                                    className={`w-full py-4 rounded-xl font-bold text-white transition-all disabled:opacity-50 disabled:cursor-not-allowed ${
                                        transactionType === 'cash-out'
                                            ? 'bg-gradient-to-r from-red-500 to-red-600 hover:from-red-600 hover:to-red-700'
                                            : 'bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700'
                                    }`}
                                >
                                    {submitting ? 'Processing...' : `Confirm ${transactionType === 'cash-out' ? 'Cash Out' : 'Cash In'}`}
                                </button>
                            </>
                        ) : (
                            <div className="text-center py-12">
                                <AlertCircle className="w-12 h-12 text-gray-400 mx-auto mb-3" />
                                <p className="text-gray-600">No active session found</p>
                            </div>
                        )}
                    </motion.div>
                </motion.div>
            )}
        </AnimatePresence>
    );
};
