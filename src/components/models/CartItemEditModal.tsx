import { useState, useEffect } from 'react';
import { X, Plus, Minus, Percent, DollarSign } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import type { CartItem } from '../../types';

interface CartItemEditModalProps {
    isOpen: boolean;
    onClose: () => void;
    item: CartItem | null;
    billingMode: 'retail' | 'wholesale';
    onUpdate: (
        id: number,
        quantity: number,
        price: number,
        discount: number,
        discountType: 'percentage' | 'price'
    ) => void;
}

export const CartItemEditModal = ({
                                      isOpen,
                                      onClose,
                                      item,
                                      billingMode,
                                      onUpdate
                                  }: CartItemEditModalProps) => {
    const [quantity, setQuantity] = useState(1);
    const [price, setPrice] = useState(0);
    const [discount, setDiscount] = useState(0);
    const [discountType, setDiscountType] = useState<'percentage' | 'price'>('percentage');

    useEffect(() => {
        if (item) {
            setQuantity(item.quantity);
            setPrice(item.price);
            setDiscount(item.discount);
            setDiscountType(item.discountType);
        }
    }, [item]);

    useEffect(() => {
        if (!isOpen) return;

        const handleKeyDown = (e: KeyboardEvent) => {
            switch (e.key) {
                case 'Escape':
                    e.preventDefault();
                    handleClose();
                    break;
                case 'Enter':
                    e.preventDefault();
                    handleUpdate();
                    break;
                case '+':
                case 'ArrowUp':
                    e.preventDefault();
                    incrementQty();
                    break;
                case '-':
                case 'ArrowDown':
                    e.preventDefault();
                    decrementQty();
                    break;
                case 'p':
                case 'P':
                    e.preventDefault();
                    setDiscountType('percentage');
                    break;
                case 'f':
                case 'F':
                    e.preventDefault();
                    setDiscountType('price');
                    break;
            }
        };

        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, [isOpen, quantity, item]);

    if (!item) return null;

    const subtotal = price * quantity;
    const discountAmount = billingMode === 'retail'
        ? (discountType === 'percentage' ? (subtotal * discount) / 100 : discount)
        : 0;
    const total = subtotal - discountAmount;

    const handleUpdate = () => {
        if (!item) return;

        const finalDiscount = billingMode === 'wholesale' ? 0 : discount;
        onUpdate(item.id, quantity, price, finalDiscount, discountType);
        handleClose();
    };

    const handleClose = () => {
        onClose();
    };

    const incrementQty = () => {
        if (quantity < item.stock) {
            setQuantity(prev => prev + 1);
        }
    };

    const decrementQty = () => {
        if (quantity > 1) {
            setQuantity(prev => prev - 1);
        }
    };

    const handleDiscountChange = (value: number) => {
        if (discountType === 'percentage') {
            setDiscount(Math.min(100, Math.max(0, value)));
        } else {
            setDiscount(Math.min(subtotal, Math.max(0, value)));
        }
    };

    return (
        <AnimatePresence>
            {isOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
                    <motion.div
                        initial={{ opacity: 0, scale: 0.9 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0, scale: 0.9 }}
                        className="bg-white rounded-2xl shadow-2xl w-full max-w-md mx-4"
                    >
                        {/* Header */}
                        <div className="flex justify-between items-center p-6 border-b border-gray-200">
                            <h2 className="text-2xl font-bold text-gray-800">Edit Cart Item</h2>
                            <button
                                onClick={handleClose}
                                className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                            >
                                <X className="w-5 h-5" />
                            </button>
                        </div>

                        {/* Content */}
                        <div className="p-6 space-y-6">
                            {/* Product Info */}
                            <div className="bg-gradient-to-br from-blue-50 to-emerald-50 rounded-xl p-4">
                                <h3 className="font-bold text-lg text-gray-800 mb-2">{item.name}</h3>
                                <div className="grid grid-cols-2 gap-3 text-sm">
                                    <div>
                                        <p className="text-gray-600">Category</p>
                                        <p className="font-semibold text-gray-800">{item.category}</p>
                                    </div>
                                    <div>
                                        <p className="text-gray-600">Stock</p>
                                        <p className="font-semibold text-emerald-600">{item.stock} units</p>
                                    </div>
                                </div>
                            </div>

                            {/* Quantity Control */}
                            <div>
                                <label className="block text-sm font-semibold text-gray-700 mb-2">
                                    Quantity (Max: {item.stock})
                                </label>
                                <div className="flex items-center gap-3">
                                    <button
                                        onClick={decrementQty}
                                        disabled={quantity <= 1}
                                        className="w-12 h-12 bg-red-100 hover:bg-red-500 hover:text-white disabled:bg-gray-200 disabled:text-gray-400 text-red-600 rounded-xl flex items-center justify-center transition-colors"
                                    >
                                        <Minus className="w-5 h-5" />
                                    </button>
                                    <input
                                        type="number"
                                        value={quantity}
                                        onChange={(e) => {
                                            const val = Math.max(1, Math.min(item.stock, Number(e.target.value)));
                                            setQuantity(val);
                                        }}
                                        className="flex-1 text-center text-2xl font-bold py-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:border-emerald-500"
                                        min={1}
                                        max={item.stock}
                                    />
                                    <button
                                        onClick={incrementQty}
                                        disabled={quantity >= item.stock}
                                        className="w-12 h-12 bg-emerald-100 hover:bg-emerald-500 hover:text-white disabled:bg-gray-200 disabled:text-gray-400 text-emerald-600 rounded-xl flex items-center justify-center transition-colors"
                                    >
                                        <Plus className="w-5 h-5" />
                                    </button>
                                </div>
                            </div>

                            {/* Price Edit */}
                            <div>
                                <label className="block text-sm font-semibold text-gray-700 mb-2">
                                    Unit Price (Rs)
                                </label>
                                <input
                                    type="number"
                                    value={price}
                                    onChange={(e) => setPrice(Math.max(0, Number(e.target.value)))}
                                    className="w-full px-4 py-3 text-lg border-2 border-gray-200 rounded-xl focus:outline-none focus:border-emerald-500"
                                    step="0.01"
                                    min="0"
                                />
                            </div>

                            {/* Discount Section - Only in Retail Mode */}
                            {billingMode === 'retail' && (
                                <div>
                                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                                        Discount
                                    </label>

                                    {/* Discount Type Toggle */}
                                    <div className="flex gap-2 mb-3">
                                        <button
                                            onClick={() => setDiscountType('percentage')}
                                            className={`flex-1 py-2 rounded-lg transition-all flex items-center justify-center gap-2 ${
                                                discountType === 'percentage'
                                                    ? 'bg-emerald-500 text-white shadow-lg'
                                                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                                            }`}
                                        >
                                            <Percent className="w-4 h-4" />
                                            <span className="font-semibold">Percentage</span>
                                        </button>
                                        <button
                                            onClick={() => setDiscountType('price')}
                                            className={`flex-1 py-2 rounded-lg transition-all flex items-center justify-center gap-2 ${
                                                discountType === 'price'
                                                    ? 'bg-blue-500 text-white shadow-lg'
                                                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                                            }`}
                                        >
                                            <DollarSign className="w-4 h-4" />
                                            <span className="font-semibold">Fixed Price</span>
                                        </button>
                                    </div>

                                    {/* Discount Input */}
                                    <input
                                        type="number"
                                        value={discount}
                                        onChange={(e) => handleDiscountChange(Number(e.target.value))}
                                        className="w-full px-4 py-3 text-lg border-2 border-gray-200 rounded-xl focus:outline-none focus:border-emerald-500"
                                        placeholder={discountType === 'percentage' ? '0-100%' : '0-' + subtotal.toFixed(2)}
                                        step="0.01"
                                        min="0"
                                        max={discountType === 'percentage' ? 100 : subtotal}
                                    />
                                </div>
                            )}

                            {/* Price Breakdown */}
                            <div className="bg-gray-50 rounded-xl p-4 space-y-2">
                                <div className="flex justify-between text-sm">
                                    <span className="text-gray-600">Subtotal:</span>
                                    <span className="font-semibold text-gray-800">Rs {subtotal.toFixed(2)}</span>
                                </div>
                                {billingMode === 'retail' && discount > 0 && (
                                    <div className="flex justify-between text-sm text-red-600">
                                        <span>Discount ({discountType === 'percentage' ? `${discount}%` : `Rs ${discount}`}):</span>
                                        <span className="font-semibold">-Rs {discountAmount.toFixed(2)}</span>
                                    </div>
                                )}
                                <div className="flex justify-between text-lg font-bold border-t pt-2">
                                    <span className="text-gray-800">Total:</span>
                                    <span className="text-emerald-600">Rs {total.toFixed(2)}</span>
                                </div>
                            </div>

                            {/* Keyboard Shortcuts */}
                            <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 text-xs text-blue-700">
                                <strong>Shortcuts:</strong> Enter = Update | Esc = Close | +/- = Qty | P = % | F = Fixed
                            </div>
                        </div>

                        {/* Footer Actions */}
                        <div className="flex gap-3 p-6 border-t border-gray-200">
                            <button
                                onClick={handleClose}
                                className="flex-1 py-3 px-6 bg-gray-100 hover:bg-gray-200 text-gray-700 font-semibold rounded-xl transition-colors"
                            >
                                Cancel
                            </button>
                            <button
                                onClick={handleUpdate}
                                className="flex-1 py-3 px-6 bg-gradient-to-r from-emerald-500 to-blue-500 hover:from-emerald-600 hover:to-blue-600 text-white font-semibold rounded-xl transition-all shadow-lg"
                            >
                                Update Item
                            </button>
                        </div>
                    </motion.div>
                </div>
            )}
        </AnimatePresence>
    );
};
