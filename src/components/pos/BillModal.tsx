import { motion, AnimatePresence } from 'framer-motion';
import { X, FileText, Check, Banknote, CreditCard, Landmark, Loader2 } from 'lucide-react';
import { useEffect } from 'react';


interface CartItem {
    id: number;
    name: string;
    price: number;
    quantity: number;
    discount: number;
}

interface Customer {
    id: number;
    name: string;
    contact: string;
}

interface PaymentAmount {
    methodId: string;
    amount: number;
}

interface BillModalProps {
    isOpen: boolean;
    onClose: () => void;
    cartItems: CartItem[];
    customer: Customer | null;
    subtotal: number;
    discount: number;
    total: number;
    paymentAmounts: PaymentAmount[];
    onComplete: () => void;
    isProcessing?: boolean;
}

const paymentMethods = [
    { id: 'cash', label: 'Cash', icon: Banknote },
    { id: 'card', label: 'Card', icon: CreditCard },
    { id: 'bank', label: 'Bank Deposit', icon: Landmark },
];

export const BillModal = ({
    isOpen,
    onClose,
    cartItems,
    customer,
    subtotal,
    discount,
    total,
    paymentAmounts,
    onComplete,
    isProcessing = false
}: BillModalProps) => {
    const calculateItemTotal = (item: CartItem) => {
        const itemTotal = item.price * item.quantity;
        const itemDiscount = (itemTotal * item.discount) / 100;
        return itemTotal - itemDiscount;
    };

    const discountAmount = (subtotal * discount) / 100;
    const totalPaid = paymentAmounts.reduce((sum, p) => sum + p.amount, 0);
    const balanceAmount = totalPaid - total;

    // Handle Enter key to complete invoice
    useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            if (isOpen && e.key === 'Enter' && !isProcessing) {
                e.preventDefault();
                onComplete();
            }
        };

        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, [isOpen, onComplete]);



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
                        className="bg-white rounded-2xl shadow-2xl p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto"
                    >
                        {/* Bill Header */}
                        <div className="flex items-center justify-between mb-6 pb-4 border-b-2 border-gray-200">
                            <div className="flex items-center gap-3">
                                <div className="p-2 bg-emerald-100 rounded-lg">
                                    <FileText className="w-6 h-6 text-emerald-600" />
                                </div>
                                <div>
                                    <h2 className="text-2xl font-bold text-gray-800">Invoice</h2>
                                    <p className="text-sm text-gray-500">#{Date.now()}</p>
                                </div>
                            </div>
                            <button
                                onClick={onClose}
                                className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                            >
                                <X className="w-6 h-6 text-gray-600" />
                            </button>
                        </div>

                        {/* Customer Info */}
                        {customer && (
                            <div className="mb-6 p-4 bg-emerald-50 rounded-xl">
                                <h3 className="text-sm font-semibold text-gray-600 mb-2">Customer Details</h3>
                                <p className="text-base font-bold text-gray-800">{customer.name}</p>
                                <p className="text-sm text-gray-600">{customer.contact}</p>
                            </div>
                        )}

                        {/* Items List */}
                        <div className="mb-6">
                            <h3 className="text-sm font-semibold text-gray-600 mb-3">Items</h3>
                            <div className="space-y-2">
                                {cartItems.map((item) => (
                                    <div key={item.id} className="flex justify-between items-start p-3 bg-gray-50 rounded-lg">
                                        <div className="flex-1">
                                            <p className="font-semibold text-gray-800">{item.name}</p>
                                            <p className="text-xs text-gray-500">
                                                {item.quantity} x Rs {item.price.toFixed(2)}
                                                {item.discount > 0 && ` (-${item.discount}%)`}
                                            </p>
                                        </div>
                                        <p className="font-bold text-emerald-600">Rs {calculateItemTotal(item).toFixed(2)}</p>
                                    </div>
                                ))}
                            </div>
                        </div>

                        {/* Payment Methods */}
                        {paymentAmounts.length > 0 && (
                            <div className="mb-6">
                                <h3 className="text-sm font-semibold text-gray-600 mb-3">Payment Methods</h3>
                                <div className="space-y-2">
                                    {paymentAmounts.map((payment) => {
                                        const method = paymentMethods.find(m => m.id === payment.methodId);
                                        if (!method || payment.amount === 0) return null;

                                        return (
                                            <div key={payment.methodId} className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                                                <div className="flex items-center gap-2">
                                                    <method.icon className="w-4 h-4 text-emerald-600" />
                                                    <span className="font-medium text-gray-700">{method.label}</span>
                                                </div>
                                                <span className="font-semibold text-gray-800">Rs {payment.amount.toFixed(2)}</span>
                                            </div>
                                        );
                                    })}
                                </div>
                            </div>
                        )}

                        {/* Bill Summary */}
                        <div className="mb-6 p-4 bg-linear-to-br from-emerald-600 to-emerald-700 rounded-xl text-white">
                            <div className="space-y-2">
                                <div className="flex justify-between">
                                    <span>Subtotal:</span>
                                    <span className="font-semibold">Rs {subtotal.toFixed(2)}</span>
                                </div>
                                {discount > 0 && (
                                    <div className="flex justify-between">
                                        <span>Discount ({discount}%):</span>
                                        <span className="font-semibold">- Rs {discountAmount.toFixed(2)}</span>
                                    </div>
                                )}
                                <div className="h-px bg-emerald-400"></div>
                                <div className="flex justify-between text-xl font-bold">
                                    <span>Total:</span>
                                    <span>Rs {total.toFixed(2)}</span>
                                </div>
                                <div className="flex justify-between">
                                    <span>Amount Given:</span>
                                    <span className="font-semibold">Rs {totalPaid.toFixed(2)}</span>
                                </div>
                                <div className="h-px bg-emerald-400"></div>
                                <div className={`flex justify-between text-xl font-bold ${balanceAmount >= 0 ? 'text-emerald-200' : 'text-yellow-300'}`}>
                                    <span>{balanceAmount >= 0 ? 'Change:' : 'Balance Due:'}</span>
                                    <span>Rs {Math.abs(balanceAmount).toFixed(2)}</span>
                                </div>
                            </div>
                        </div>

                        {/* Action Buttons */}
                        <div className="flex gap-3">
                            <button
                                onClick={onComplete}
                                disabled={isProcessing}
                                className={`flex-1 flex items-center justify-center gap-2 py-3 ${isProcessing ? 'bg-gray-400 cursor-not-allowed' : 'bg-linear-to-r from-emerald-500 to-emerald-600 hover:shadow-lg hover:scale-[1.02]'} text-white rounded-xl font-semibold transition-all`}
                            >
                                {isProcessing ? (
                                    <>
                                        <Loader2 className="w-4 h-4 animate-spin" />
                                        Processing...
                                    </>
                                ) : (
                                    <>
                                        <Check className="w-4 h-4" />
                                        Complete (Enter)
                                    </>
                                )}
                            </button>
                        </div>
                    </motion.div>
                </motion.div>
            )}
        </AnimatePresence>
    );
};