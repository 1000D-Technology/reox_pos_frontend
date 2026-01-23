// src/components/GrnViewPopup.tsx
import { X, Package, Calendar, User, FileText, DollarSign, Printer } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useEffect } from 'react';

interface GrnItem {
    id: number;
    itemName: string;
    quantity: number;
    unitPrice: number;
    totalPrice: number;
    expiryDate?: string;
}

interface GrnPayment {
    id: number;
    amount: number;
    date: string;
    type: string;
}

interface GrnDetails {
    id: number;
    supplierName: string;
    billNumber: string;
    totalAmount: number;
    paidAmount: number;
    balanceAmount: number;
    grnDate: string;
    statusName: string;
    items: GrnItem[];
    payments?: GrnPayment[];
}

interface GrnViewPopupProps {
    isOpen: boolean;
    onClose: () => void;
    grnData: GrnDetails | null;
    autoPrint?: boolean;
}

const GrnViewPopup = ({ isOpen, onClose, grnData, autoPrint = false }: GrnViewPopupProps) => {
    useEffect(() => {
        const handleEscape = (e: KeyboardEvent) => {
            if (e.key === 'Escape') {
                onClose();
            }
        };

        if (isOpen) {
            window.addEventListener('keydown', handleEscape);

            // Handle auto-print
            if (autoPrint) {
                // Short timeout to ensure content is fully rendered and animations settle
                const timer = setTimeout(() => {
                    window.print();
                }, 500);
                return () => clearTimeout(timer);
            }
        }

        return () => window.removeEventListener('keydown', handleEscape);
    }, [isOpen, onClose, autoPrint]);

    if (!grnData) return null;

    const handlePrint = () => {
        window.print();
    };

    return (
        <AnimatePresence>
            {isOpen && (
                <>
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        onClick={onClose}
                        className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50"
                    />

                    <motion.div
                        initial={{ opacity: 0, scale: 0.95, y: 20 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.95, y: 20 }}
                        className="fixed inset-0 z-50 flex items-center justify-center p-4"
                    >
                        <div className="bg-white rounded-2xl shadow-2xl w-full max-w-4xl max-h-[90vh] overflow-hidden">
                            {/* Header */}
                            <div className="bg-gradient-to-r from-emerald-600 to-emerald-700 px-6 py-4 flex items-center justify-between">
                                <div className="flex items-center gap-3">
                                    <div className="p-2 bg-white/20 rounded-lg">
                                        <FileText className="w-6 h-6 text-white" />
                                    </div>
                                    <div>
                                        <h2 className="text-xl font-bold text-white">GRN Details</h2>
                                        <p className="text-emerald-100 text-sm">Bill No: {grnData.billNumber}</p>
                                    </div>
                                </div>
                                <div className="flex items-center gap-2">
                                    <button
                                        onClick={handlePrint}
                                        className="p-2 hover:bg-white/20 rounded-lg transition-colors"
                                    >
                                        <Printer className="w-5 h-5 text-white" />
                                    </button>
                                    <button
                                        onClick={onClose}
                                        className="p-2 hover:bg-white/20 rounded-lg transition-colors"
                                    >
                                        <X className="w-5 h-5 text-white" />
                                    </button>
                                </div>
                            </div>

                            {/* Content */}
                            <div className="p-6 overflow-y-auto max-h-[calc(90vh-80px)]">
                                {/* Info Cards */}
                                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
                                    <div className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-xl p-4 border border-blue-200">
                                        <div className="flex items-center gap-2 mb-2">
                                            <User className="w-4 h-4 text-blue-600" />
                                            <span className="text-xs text-blue-600 font-medium">Supplier</span>
                                        </div>
                                        <p className="text-sm font-bold text-blue-900">{grnData.supplierName}</p>
                                    </div>

                                    <div className="bg-gradient-to-br from-purple-50 to-purple-100 rounded-xl p-4 border border-purple-200">
                                        <div className="flex items-center gap-2 mb-2">
                                            <Calendar className="w-4 h-4 text-purple-600" />
                                            <span className="text-xs text-purple-600 font-medium">GRN Date</span>
                                        </div>
                                        <p className="text-sm font-bold text-purple-900">
                                            {new Date(grnData.grnDate).toLocaleDateString('en-US', {
                                                year: 'numeric',
                                                month: 'short',
                                                day: 'numeric'
                                            })}
                                        </p>
                                    </div>

                                    <div className="bg-gradient-to-br from-amber-50 to-amber-100 rounded-xl p-4 border border-amber-200">
                                        <div className="flex items-center gap-2 mb-2">
                                            <Package className="w-4 h-4 text-amber-600" />
                                            <span className="text-xs text-amber-600 font-medium">Items</span>
                                        </div>
                                        <p className="text-sm font-bold text-amber-900">{grnData.items.length} Items</p>
                                    </div>

                                    <div className="bg-gradient-to-br from-green-50 to-green-100 rounded-xl p-4 border border-green-200">
                                        <div className="flex items-center gap-2 mb-2">
                                            <DollarSign className="w-4 h-4 text-green-600" />
                                            <span className="text-xs text-green-600 font-medium">Status</span>
                                        </div>
                                        <p className="text-sm font-bold text-green-900">{grnData.statusName}</p>
                                    </div>
                                </div>

                                {/* Items Table */}
                                <div className="mb-6">
                                    <h3 className="text-lg font-semibold text-gray-800 mb-3 flex items-center gap-2">
                                        <Package className="w-5 h-5 text-emerald-600" />
                                        Items List
                                    </h3>
                                    <div className="overflow-x-auto rounded-lg border border-gray-200">
                                        <table className="min-w-full divide-y divide-gray-200">
                                            <thead className="bg-gray-50">
                                                <tr>
                                                    {['No', 'Item Name', 'Quantity', 'Unit Price', 'Total Price', 'Expiry Date'].map((header, i) => (
                                                        <th
                                                            key={i}
                                                            className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider"
                                                        >
                                                            {header}
                                                        </th>
                                                    ))}
                                                </tr>
                                            </thead>
                                            <tbody className="bg-white divide-y divide-gray-200">
                                                {grnData.items.map((item, index) => (
                                                    <tr key={item.id} className="hover:bg-gray-50 transition-colors">
                                                        <td className="px-4 py-3 text-sm text-gray-900">{index + 1}</td>
                                                        <td className="px-4 py-3 text-sm text-gray-900 font-medium">{item.itemName}</td>
                                                        <td className="px-4 py-3 text-sm text-gray-900">{item.quantity}</td>
                                                        <td className="px-4 py-3 text-sm text-gray-900">LKR {item.unitPrice.toFixed(2)}</td>
                                                        <td className="px-4 py-3 text-sm font-semibold text-gray-900">LKR {item.totalPrice.toFixed(2)}</td>
                                                        <td className="px-4 py-3 text-sm text-gray-900">
                                                            {item.expiryDate
                                                                ? new Date(item.expiryDate).toLocaleDateString('en-US')
                                                                : 'N/A'}
                                                        </td>
                                                    </tr>
                                                ))}
                                            </tbody>
                                        </table>
                                    </div>
                                </div>
                                
                                {/* Payment History */}
                                {grnData.payments && grnData.payments.length > 0 && (
                                    <div className="mb-6">
                                        <h3 className="text-lg font-semibold text-gray-800 mb-3 flex items-center gap-2">
                                            <Calendar className="w-5 h-5 text-blue-600" />
                                            Payment History
                                        </h3>
                                        <div className="overflow-x-auto rounded-lg border border-gray-200">
                                            <table className="min-w-full divide-y divide-gray-200">
                                                <thead className="bg-gray-50">
                                                    <tr>
                                                        {['Date', 'Amount', 'Payment Mode'].map((header, i) => (
                                                            <th
                                                                key={i}
                                                                className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider"
                                                            >
                                                                {header}
                                                            </th>
                                                        ))}
                                                    </tr>
                                                </thead>
                                                <tbody className="bg-white divide-y divide-gray-200">
                                                    {grnData.payments.map((payment) => (
                                                        <tr key={payment.id} className="hover:bg-gray-50 transition-colors">
                                                            <td className="px-4 py-3 text-sm text-gray-900 font-medium">
                                                                {payment.date}
                                                            </td>
                                                            <td className="px-4 py-3 text-sm font-bold text-emerald-600">
                                                                LKR {payment.amount.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                                                            </td>
                                                            <td className="px-4 py-3 text-sm text-gray-900">
                                                                <span className="px-2 py-1 bg-blue-100 text-blue-700 rounded-full text-[10px] font-bold">
                                                                    {payment.type}
                                                                </span>
                                                            </td>
                                                        </tr>
                                                    ))}
                                                </tbody>
                                            </table>
                                        </div>
                                    </div>
                                )}

                                {/* Payment Summary */}
                                <div className="bg-gradient-to-br from-gray-50 to-gray-100 rounded-xl p-6 border border-gray-200">
                                    <h3 className="text-lg font-semibold text-gray-800 mb-4">Payment Summary</h3>
                                    <div className="space-y-3">
                                        <div className="flex justify-between items-center pb-2 border-b border-gray-300">
                                            <span className="text-gray-600">Total Amount</span>
                                            <span className="text-lg font-bold text-gray-900">LKR {grnData.totalAmount.toFixed(2)}</span>
                                        </div>
                                        <div className="flex justify-between items-center pb-2 border-b border-gray-300">
                                            <span className="text-gray-600">Paid Amount</span>
                                            <span className="text-lg font-bold text-green-600">LKR {grnData.paidAmount.toFixed(2)}</span>
                                        </div>
                                        <div className="flex justify-between items-center pt-2">
                                            <span className="text-gray-700 font-semibold">Balance Amount</span>
                                            <span className={`text-xl font-bold ${grnData.balanceAmount === 0
                                                ? 'text-green-600'
                                                : grnData.balanceAmount > 0
                                                    ? 'text-red-600'
                                                    : 'text-blue-600'
                                                }`}>
                                                LKR {grnData.balanceAmount.toFixed(2)}
                                            </span>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Footer */}
                            <div className="bg-gray-50 px-6 py-4 flex justify-end gap-3 border-t border-gray-200">
                                <button
                                    onClick={handlePrint}
                                    className="px-4 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 transition-colors flex items-center gap-2"
                                >
                                    <Printer className="w-4 h-4" />
                                    Print
                                </button>
                                <button
                                    onClick={onClose}
                                    className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors"
                                >
                                    Close
                                </button>
                            </div>
                        </div>
                    </motion.div>
                </>
            )}
        </AnimatePresence>
    );
};

export default GrnViewPopup;