import { motion, AnimatePresence } from 'framer-motion';
import { X, RotateCcw, Search, Barcode, FileText, Printer, Minus, Plus } from 'lucide-react';
import { useState } from 'react';
import { posService } from '../../services/posService';
import { printBill } from '../../utils/billPrinter';
import { authService } from '../../services/authService';
import toast from 'react-hot-toast';

interface ReturnModalProps {
    isOpen: boolean;
    onClose: () => void;
}

interface ReturnItem {
    id: number;
    name: string;
    price: number;
    quantity: number;
    returnedQuantity?: number; // Quantity already returned
    returnQuantity: number; // Quantity to return NOW
}

interface Invoice {
    invoiceNo: string;
    date: string;
    customer: string;
    total: number;
    items: ReturnItem[];
    payments?: { method: string, amount: number }[];
    creditBalance?: number;
}

export const ReturnModal = ({ isOpen, onClose }: ReturnModalProps) => {
    const [returnInvoiceNo, setReturnInvoiceNo] = useState('');
    const [originalInvoice, setOriginalInvoice] = useState<Invoice | null>(null);
    const [returnItems, setReturnItems] = useState<ReturnItem[]>([]);
    const [returnSearchTerm, setReturnSearchTerm] = useState('');

    const [loading, setLoading] = useState(false);

    const loadInvoice = async () => {
        if (!returnInvoiceNo.trim()) return;

        setLoading(true);
        try {
            const response = await posService.getInvoiceByNo(returnInvoiceNo.trim());
            if (response.data?.success && response.data?.data) {
                const invoiceData = response.data.data;
                setOriginalInvoice(invoiceData);
                setReturnItems(invoiceData.items);
                toast.success('Invoice loaded successfully');
            }
        } catch (error: any) {
            console.error('Failed to load invoice:', error);
            const msg = error.response?.data?.message || 'Invoice not found';
            toast.error(msg);
            setOriginalInvoice(null);
            setReturnItems([]);
        } finally {
            setLoading(false);
        }
    };

    const updateReturnQuantity = (id: number, delta: number) => {
        setReturnItems(returnItems.map(item => {
            if (item.id === id) {
                const alreadyReturned = item.returnedQuantity || 0;
                const maxReturn = Math.max(0, item.quantity - alreadyReturned);
                const newQuantity = Math.max(0, Math.min(maxReturn, item.returnQuantity + delta));
                return { ...item, returnQuantity: newQuantity };
            }
            return item;
        }));
    };

    const filteredReturnItems = returnItems.filter(item =>
        item.name.toLowerCase().includes(returnSearchTerm.toLowerCase())
    );

    const returnSubtotal = returnItems.reduce((sum, item) =>
        sum + (item.price * item.returnQuantity), 0
    );

    const returnTotal = returnSubtotal;

    const completeReturn = async () => {
        const itemsToReturn = returnItems.filter(item => item.returnQuantity > 0);
        if (itemsToReturn.length === 0) return;

        if (!window.confirm("Are you sure you want to process this return?")) return;

        setLoading(true);
        try {
            const userId = authService.getUserId() || 1;
            const payload = {
                invoiceNo: returnInvoiceNo,
                user_id: userId,
                items: itemsToReturn.map(item => ({
                    id: item.id,
                    returnQuantity: item.returnQuantity
                }))
            };

            const response = await posService.processReturn(payload);
            if (response.data?.success) {
                const { refundedCash, newDebt, oldDebt, debtReduction, returnValue } = response.data;
                
                // Create detailed success message
                let message = 'Return processed successfully!\n';
                if (debtReduction > 0) {
                    message += `✅ Debt reduced: Rs ${oldDebt.toFixed(2)} → Rs ${newDebt.toFixed(2)}\n`;
                    if (refundedCash > 0) {
                        message += `💰 Cash refunded: Rs ${refundedCash.toFixed(2)}`;
                    } else {
                        message += `⚠️ No cash refund (used to reduce debt)`;
                    }
                } else {
                    message += `💰 Cash refunded: Rs ${refundedCash.toFixed(2)}`;
                }
                
                toast.success(message, { duration: 5000 });
                
                // Print Return Bill with debt information
                if (originalInvoice) {
                    // Get Sri Lankan time (UTC+5:30)
                    const sriLankanTime = new Date(new Date().getTime() + (5.5 * 60 * 60 * 1000));
                    
                    printBill({
                        invoiceId: 0,
                        invoiceNumber: originalInvoice.invoiceNo,
                        date: sriLankanTime,
                        customer: { 
                            id: 0, 
                            name: originalInvoice.customer || 'Guest', 
                            contact: '' 
                        },
                        items: itemsToReturn.map(item => ({
                            id: item.id,
                            name: item.name,
                            price: item.price,
                            quantity: item.returnQuantity,
                            discount: 0
                        })),
                        subtotal: returnSubtotal,
                        discount: 0,
                        total: returnValue, // Total value of returned items
                        paymentAmounts: [],
                        isReturn: true,
                        originalPayments: originalInvoice.payments,
                        refundedCash: refundedCash,
                        oldDebt: oldDebt,
                        debtReduction: debtReduction,
                        newDebt: newDebt
                    });
                }

                handleClose();
            }
        } catch (error: any) {
            console.error('Return failed:', error);
            const msg = error.response?.data?.message || 'Return processing failed';
            toast.error(msg);
        } finally {
            setLoading(false);
        }
    };

    const handleClose = () => {
        setReturnInvoiceNo('');
        setOriginalInvoice(null);
        setReturnItems([]);
        setReturnSearchTerm('');
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
                    onClick={handleClose}
                >
                    <motion.div
                        initial={{ scale: 0.9, y: 20 }}
                        animate={{ scale: 1, y: 0 }}
                        exit={{ scale: 0.9, y: 20 }}
                        onClick={(e) => e.stopPropagation()}
                        className="bg-white rounded-2xl shadow-2xl w-full max-w-4xl max-h-[90vh] overflow-hidden flex flex-col"
                    >
                        {/* Header */}
                        <div className="p-6 border-b border-gray-200 bg-linear-to-r from-amber-500 to-amber-600">
                            <div className="flex items-center justify-between">
                                <div className="flex items-center gap-3">
                                    <div className="p-2 bg-white/20 rounded-lg">
                                        <RotateCcw className="w-6 h-6 text-white" />
                                    </div>
                                    <div>
                                        <h2 className="text-2xl font-bold text-white">Return / Refund</h2>
                                        <p className="text-sm text-white/80">Enter invoice number to process return</p>
                                    </div>
                                </div>
                                <button
                                    onClick={handleClose}
                                    className="p-2 hover:bg-white/20 rounded-lg transition-colors"
                                >
                                    <X className="w-6 h-6 text-white" />
                                </button>
                            </div>
                        </div>

                        {/* Content */}
                        <div className="flex-1 overflow-y-auto p-6">
                            {/* Invoice Search */}
                            <div className="mb-6">
                                <label className="block text-sm font-semibold text-gray-700 mb-2">
                                    Invoice Number
                                </label>
                                <div className="flex gap-2">
                                    <input
                                        autoFocus
                                        type="text"
                                        value={returnInvoiceNo}
                                        onChange={(e) => setReturnInvoiceNo(e.target.value)}
                                        onKeyDown={(e) => {
                                            if (e.key === 'Enter') {
                                                e.preventDefault();
                                                loadInvoice();
                                            }
                                        }}
                                        placeholder="Scan or enter invoice number..."
                                        className="flex-1 px-4 py-2.5 border-2 border-gray-200 rounded-xl focus:outline-none focus:border-amber-500"
                                    />
                                    <button
                                        onClick={loadInvoice}
                                        disabled={loading}
                                        className={`px-6 py-2.5 rounded-xl font-semibold transition-all border-2 ${
                                            loading 
                                                ? 'bg-white text-amber-500 border-amber-500 cursor-not-allowed' 
                                                : 'bg-amber-500 text-white border-transparent hover:bg-amber-600'
                                        }`}
                                    >
                                        {loading ? 'Loading...' : 'Load'}
                                    </button>
                                </div>
                            </div>

                            {/* Original Invoice Details */}
                            {originalInvoice && (
                                <div className="space-y-4">
                                    {/* Invoice Info */}
                                    <div className="p-4 bg-gray-50 rounded-xl">
                                        <div className="grid grid-cols-3 gap-4">
                                            <div>
                                                <p className="text-xs text-gray-500">Invoice No</p>
                                                <p className="font-semibold text-gray-800">{originalInvoice.invoiceNo}</p>
                                            </div>
                                            <div>
                                                <p className="text-xs text-gray-500">Date</p>
                                                <p className="font-semibold text-gray-800">{originalInvoice.date}</p>
                                            </div>
                                            <div>
                                                <p className="text-xs text-gray-500">Customer</p>
                                                <p className="font-semibold text-gray-800">{originalInvoice.customer}</p>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Credit/Debt Warning */}
                                    {originalInvoice.creditBalance && originalInvoice.creditBalance > 0 ? (
                                        <div className="p-3 bg-red-50 border border-red-200 rounded-xl flex justify-between items-center">
                                            <div>
                                                <h4 className="text-sm font-bold text-red-700">OUTSTANDING DEBT</h4>
                                                <p className="text-xs text-red-600">This invoice has an unpaid balance.</p>
                                            </div>
                                            <div className="text-xl font-black text-red-700">
                                                Rs {originalInvoice.creditBalance.toFixed(2)}
                                            </div>
                                        </div>
                                    ) : null}

                                    {/* Payment History */}
                                    {originalInvoice.payments && originalInvoice.payments.length > 0 && (
                                        <div className="p-3 bg-blue-50 border border-blue-200 rounded-xl">
                                            <h4 className="text-xs font-semibold text-blue-800 mb-2 uppercase tracking-wide">Payment History</h4>
                                            <div className="flex flex-wrap gap-4">
                                                {originalInvoice.payments.map((p, idx) => (
                                                    <div key={idx} className="flex items-center gap-2 text-sm">
                                                        <span className="text-blue-600 font-medium">{p.method}:</span>
                                                        <span className="font-bold text-gray-800">Rs {p.amount.toFixed(2)}</span>
                                                    </div>
                                                ))}
                                            </div>
                                        </div>
                                    )}

                                    {/* Search Products to Return */}
                                    <div className="relative">
                                        <Search className="absolute left-3 top-3 w-4 h-4 text-gray-400" />
                                        <input
                                            type="text"
                                            placeholder="Search items to return..."
                                            value={returnSearchTerm}
                                            onChange={(e) => setReturnSearchTerm(e.target.value)}
                                            className="w-full pl-10 pr-10 py-2.5 text-sm bg-gray-50 border-2 border-gray-200 rounded-xl focus:outline-none focus:border-amber-500"
                                        />
                                        <Barcode className="absolute right-3 top-3 w-4 h-4 text-gray-400" />
                                    </div>

                                    {/* Return Items List */}
                                    <div className="space-y-2 max-h-64 overflow-y-auto">
                                        {filteredReturnItems.map((item) => (
                                            <div key={item.id} className="p-3 bg-gray-50 rounded-xl border-2 border-gray-200">
                                                <div className="flex items-center justify-between mb-2">
                                                    <div className="flex-1">
                                                        <h4 className="font-semibold text-gray-800">{item.name}</h4>
                                                        <div className="flex gap-3 text-xs text-gray-500 mt-1">
                                                            <span className="font-medium text-blue-600">Orig: {item.quantity}</span>
                                                            <span className="font-medium text-red-500">Returned: {item.returnedQuantity || 0}</span>
                                                            <span className="font-medium text-emerald-600">Avail: {item.quantity - (item.returnedQuantity || 0)}</span>
                                                        </div>
                                                        <p className="text-xs text-gray-500 mt-0.5">Price: Rs {item.price}</p>
                                                    </div>
                                                    <div className="text-right">
                                                        <p className="font-bold text-amber-600">
                                                            Rs {(item.price * item.returnQuantity).toFixed(2)}
                                                        </p>
                                                    </div>
                                                </div>
                                                <div className="flex items-center gap-2">
                                                    <span className="text-xs text-gray-600">Return Qty:</span>
                                                    <div className="flex items-center gap-2 bg-white border-2 border-gray-200 rounded-lg p-1">
                                                        <button
                                                            onClick={() => updateReturnQuantity(item.id, -1)}
                                                            className="p-1 bg-gray-100 hover:bg-amber-500 hover:text-white rounded transition-colors"
                                                            disabled={item.returnQuantity <= 0}
                                                        >
                                                            <Minus className="w-3.5 h-3.5" />
                                                        </button>
                                                        <span className="px-3 font-semibold text-sm">{item.returnQuantity}</span>
                                                        <button
                                                            onClick={() => updateReturnQuantity(item.id, 1)}
                                                            className="p-1 bg-gray-100 hover:bg-amber-500 hover:text-white rounded transition-colors"
                                                            disabled={item.returnQuantity >= (item.quantity - (item.returnedQuantity || 0))}
                                                        >
                                                            <Plus className="w-3.5 h-3.5" />
                                                        </button>
                                                    </div>
                                                </div>
                                            </div>
                                        ))}
                                    </div>

                                    {/* Return Summary */}
                                    <div className="p-4 bg-linear-to-br from-amber-50 to-amber-100 rounded-xl border-2 border-amber-200">
                                        <div className="space-y-2">
                                            <div className="flex justify-between text-sm">
                                                <span className="text-gray-600">Original Total:</span>
                                                <span className="font-semibold">Rs {originalInvoice.total.toFixed(2)}</span>
                                            </div>
                                            <div className="flex justify-between text-sm">
                                                <span className="text-gray-600">Return Amount:</span>
                                                <span className="font-semibold text-amber-600">
                                                    Rs {returnSubtotal.toFixed(2)}
                                                </span>
                                            </div>
                                            <div className="h-px bg-amber-300"></div>
                                            <div className="flex justify-between text-lg font-bold">
                                                <span>Refund Total:</span>
                                                <span className="text-amber-600">Rs {returnTotal.toFixed(2)}</span>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            )}

                            {!originalInvoice && (
                                <div className="text-center py-12">
                                    <div className="p-4 bg-gray-100 rounded-full inline-block mb-4">
                                        <FileText className="w-12 h-12 text-gray-400" />
                                    </div>
                                    <p className="text-gray-500">Enter invoice number to load details</p>
                                </div>
                            )}
                        </div>

                        {/* Footer */}
                        {originalInvoice && (
                            <div className="p-6 border-t border-gray-200 bg-gray-50">
                                <div className="flex gap-3">
                                    <button
                                        onClick={handleClose}
                                        className="flex-1 px-6 py-3 bg-gray-200 text-gray-700 rounded-xl font-semibold hover:bg-gray-300 transition-colors"
                                    >
                                        Cancel
                                    </button>
                                    <button
                                        onClick={completeReturn}
                                        disabled={returnItems.filter(i => i.returnQuantity > 0).length === 0 || loading}
                                        className="flex-1 px-6 py-3 bg-linear-to-r from-amber-500 to-amber-600 text-white rounded-xl font-semibold hover:shadow-lg disabled:opacity-50 disabled:cursor-not-allowed transition-all"
                                    >
                                        <div className="flex items-center justify-center gap-2">
                                            <Printer className="w-5 h-5" />
                                            Process Return
                                        </div>
                                    </button>
                                </div>
                            </div>
                        )}
                    </motion.div>
                </motion.div>
            )}
        </AnimatePresence>
    );
};