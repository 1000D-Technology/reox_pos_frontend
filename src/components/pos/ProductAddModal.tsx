import { useState, useEffect } from 'react';
import { X, Plus, Minus, Percent, DollarSign, Package } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

interface Product {
    id: number;
    name: string;
    barcode: string;
    price: number;
    wholesalePrice: number;
    stock: number;
    category: string;
    productCode: string;
    isBulk: boolean;
}

interface ProductAddModalProps {
    isOpen: boolean;
    onClose: () => void;
    product: Product | null;
    billingMode: 'retail' | 'wholesale';
    onAddToCart: (
        product: Product,
        quantity: number,
        discount: number,
        discountType: 'percentage' | 'price',
        discountAmount: number,
        discountedPrice: number
    ) => void;
}

export const ProductAddModal = ({
                                    isOpen,
                                    onClose,
                                    product,
                                    billingMode,
                                    onAddToCart
                                }: ProductAddModalProps) => {
    const [quantity, setQuantity] = useState(1);
    const [discount, setDiscount] = useState(0);
    const [discountType, setDiscountType] = useState<'percentage' | 'price'>('percentage');

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
                    handleAdd();
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
                    break;case 'p':
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
    }, [isOpen, quantity, product]);

    if (!product) return null;

    const price = billingMode === 'wholesale' ? product.wholesalePrice : product.price;
    const subtotal = price * quantity;
    const discountAmount = discountType === 'percentage'
        ? (subtotal * discount) / 100
        : discount;
    const total = subtotal - discountAmount;

    const handleAdd = () => {
        onAddToCart(product, quantity, discount, discountType);
        console.log(product, quantity, discount, discountType);
        handleClose();
    };

    const handleClose = () => {
        setQuantity(1);
        setDiscount(0);
        setDiscountType('percentage');
        onClose();
    };

    const incrementQty = () => {
        if (quantity < product.stock) {
            setQuantity(prev => prev + 1);
        }
    };

    const decrementQty = () => {
        if (quantity > 1) {
            setQuantity(prev => prev - 1);
        }
    };

    return (
        <AnimatePresence>
            {isOpen && (
                <>
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        onClick={handleClose}
                        className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50"
                    />
                    <motion.div
                        initial={{ opacity: 0, scale: 0.95, y: 20 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.95, y: 20 }}
                        className="fixed left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-full max-w-md bg-white rounded-2xl shadow-2xl z-50 p-6"
                    >
                        {/* Header */}
                        <div className="flex justify-between items-start mb-4">
                            <div className="flex-1">
                                <h2 className="text-xl font-bold text-gray-800">{product.name}</h2>
                                <p className="text-sm text-gray-500">{product.category} • {product.productCode}</p>
                            </div>
                            <button
                                onClick={handleClose}
                                className="p-2 hover:bg-gray-100 rounded-full transition-colors"
                            >
                                <X className="w-5 h-5 text-gray-500" />
                            </button>
                        </div>

                        {/* Product Info */}
                        <div className="bg-gradient-to-r from-emerald-50 to-blue-50 rounded-xl p-4 mb-4">
                            <div className="grid grid-cols-2 gap-3">
                                <div>
                                    <p className="text-xs text-gray-600 mb-1">Price</p>
                                    <p className="text-lg font-bold text-emerald-600">Rs {price.toFixed(2)}</p>
                                </div>
                                <div>
                                    <p className="text-xs text-gray-600 mb-1">Available Stock</p>
                                    <p className="text-lg font-bold text-blue-600 flex items-center gap-1">
                                        <Package className="w-4 h-4" />
                                        {product.stock}
                                    </p>
                                </div>
                            </div>
                        </div>

                        {/* Quantity Controls */}
                        <div className="mb-4">
                            <label className="block text-sm font-semibold text-gray-700 mb-2">
                                Quantity <span className="text-gray-400">(+ / - / ↑ / ↓)</span>
                            </label>
                            <div className="flex items-center gap-3">
                                <button
                                    onClick={decrementQty}
                                    className="w-12 h-12 bg-gray-200 hover:bg-gray-300 rounded-xl flex items-center justify-center transition-colors"
                                >
                                    <Minus className="w-5 h-5 text-gray-700" />
                                </button>
                                <input
                                    type="number"
                                    value={quantity}
                                    onChange={(e) => {
                                        const val = Math.min(Math.max(1, Number(e.target.value)), product.stock);
                                        setQuantity(val);
                                    }}
                                    className="flex-1 text-center text-2xl font-bold border-2 border-gray-200 rounded-xl py-2 focus:outline-none focus:border-emerald-500"
                                    min={1}
                                    max={product.stock}
                                />
                                <button
                                    onClick={incrementQty}
                                    className="w-12 h-12 bg-emerald-500 hover:bg-emerald-600 text-white rounded-xl flex items-center justify-center transition-colors"
                                >
                                    <Plus className="w-5 h-5" />
                                </button>
                            </div>
                        </div>

                        {/* Discount Type Toggle */}
                        <div className="mb-4">
                            <label className="block text-sm font-semibold text-gray-700 mb-2">
                                Discount Type <span className="text-gray-400">(P / F)</span>
                            </label>
                            <div className="grid grid-cols-2 gap-2">
                                <button
                                    onClick={() => setDiscountType('percentage')}
                                    className={`flex items-center justify-center gap-2 px-4 py-3 rounded-xl transition-all ${
                                        discountType === 'percentage'
                                            ? 'bg-emerald-500 text-white shadow-lg'
                                            : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                                    }`}
                                >
                                    <Percent className="w-4 h-4" />
                                    Percentage
                                </button>
                                <button
                                    onClick={() => setDiscountType('price')}
                                    className={`flex items-center justify-center gap-2 px-4 py-3 rounded-xl transition-all ${
                                        discountType === 'price'
                                            ? 'bg-blue-500 text-white shadow-lg'
                                            : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                                    }`}
                                >
                                    <DollarSign className="w-4 h-4" />
                                    Fixed Price
                                </button>
                            </div>
                        </div>

                        {/* Discount Input */}
                        <div className="mb-4">
                            <label className="block text-sm font-semibold text-gray-700 mb-2">Discount</label>
                            <input
                                type="number"
                                value={discount}
                                onChange={(e) => {
                                    const val = Math.max(0, Number(e.target.value));
                                    const max = discountType === 'percentage' ? 100 : subtotal;
                                    setDiscount(Math.min(val, max));
                                }}
                                className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:border-emerald-500 text-lg"
                                placeholder={discountType === 'percentage' ? '0 - 100' : '0'}
                                min={0}
                                max={discountType === 'percentage' ? 100 : undefined}
                            />
                        </div>

                        {/* Summary */}
                        <div className="bg-gradient-to-r from-gray-50 to-gray-100 rounded-xl p-4 mb-4 space-y-2">
                            <div className="flex justify-between text-sm">
                                <span className="text-gray-600">Subtotal</span>
                                <span className="font-semibold">Rs {subtotal.toFixed(2)}</span>
                            </div>
                            {discount > 0 && (
                                <div className="flex justify-between text-sm text-red-600">
                                    <span>Discount</span>
                                    <span className="font-semibold">- Rs {discountAmount.toFixed(2)}</span>
                                </div>
                            )}
                            <div className="flex justify-between text-lg pt-2 border-t-2 border-gray-300">
                                <span className="font-bold text-gray-800">Total</span>
                                <span className="font-bold text-emerald-600">Rs {total.toFixed(2)}</span>
                            </div>
                        </div>

                        {/* Keyboard Shortcuts Info */}
                        <div className="bg-blue-50 border-2 border-blue-200 rounded-lg p-3 mb-4 text-xs text-blue-700">
                            <strong>Shortcuts:</strong> Enter = Add | Esc = Cancel | +/- = Quantity | P = Percentage | F = Fixed
                        </div>

                        {/* Action Buttons */}
                        <div className="grid grid-cols-2 gap-3">
                            <button
                                onClick={handleClose}
                                className="px-4 py-3 bg-gray-200 text-gray-700 rounded-xl hover:bg-gray-300 transition-colors font-semibold"
                            >
                                Cancel <span className="text-xs">(Esc)</span>
                            </button>
                            <button
                                onClick={handleAdd}
                                className="px-4 py-3 bg-emerald-500 text-white rounded-xl hover:bg-emerald-600 transition-colors font-semibold shadow-lg flex items-center justify-center gap-2"
                            >
                                <Plus className="w-5 h-5" />
                                Add <span className="text-xs">(Enter)</span>
                            </button>
                        </div>
                    </motion.div>
                </>
            )}
        </AnimatePresence>
    );
};