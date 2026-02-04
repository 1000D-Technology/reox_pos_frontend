import { useState, useEffect } from 'react';
import toast from 'react-hot-toast';
import { X, Plus, Minus, Percent, DollarSign, Package, Calculator, RefreshCw } from 'lucide-react';
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
    batch?: string;
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
    const [quantity, setQuantity] = useState<number | string>(1);
    const [discount, setDiscount] = useState(0);
    const [discountType, setDiscountType] = useState<'percentage' | 'price'>('percentage');
    const [subUnitValue, setSubUnitValue] = useState<number | string>('');

    const currentUnitStr = (product?.category || '').toLowerCase().trim();
    
    const getUnitConfig = (unit: string, isBulkItem: boolean) => {
        const u = unit.toLowerCase().trim();
        // Weights: KG, Grams, Kilo, etc.
        if (u.includes('kg') || u.includes('kilo') || u.includes('gram') || u.includes('weight') || (isBulkItem && u === '')) 
            return { label: 'Weight', subLabel: 'Grams (g)', factor: 1000 };
        // Volumes: L, ML, Liter, litre, etc.
        if (u === 'l' || u.includes('ltr') || u.includes('liter') || u.includes('litre') || u.includes('vol') || u.includes('ml')) 
            return { label: 'Volume', subLabel: 'Milliliters (ml)', factor: 1000 };
        // Lengths: M, CM, Meter, metre, etc.
        if (u === 'm' || (u.includes('meter') && !u.includes('centi')) || u.includes('metre') || u.includes('cm')) 
            return { label: 'Length', subLabel: 'Centimeters (cm)', factor: 100 };
        
        // If it's explicitly marked as bulk but unit is unknown, assume weight as most common
        if (isBulkItem) return { label: 'Bulk', subLabel: 'Units (/1000)', factor: 1000 };
        
        return null;
    };

    const unitConfig = getUnitConfig(currentUnitStr, product?.isBulk || false);
    const isDecimalAllowed = !!unitConfig || unitConversions.length > 0;


    useEffect(() => {
        if (isOpen && product) {
            setQuantity(1);
            setDiscount(0);
            setDiscountType('percentage');
            setSubUnitValue('');
        }
    }, [isOpen, product]);

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
                    handleAddToCart();
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
                    if (billingMode === 'retail') {
                        e.preventDefault();
                        handleDiscountTypeChange('percentage');
                    }
                    break;
                case 'f':
                case 'F':
                    if (billingMode === 'retail') {
                        e.preventDefault();
                        handleDiscountTypeChange('price');
                    }
                    break;
            }
        };

        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, [isOpen, quantity, discount, discountType, billingMode, product]);

    if (!product) return null;

    const price = billingMode === 'retail' ? product.price : product.wholesalePrice;
    const qty = Number(quantity) || 0;
    const subtotal = price * qty;
    const wholesalePrice = product.wholesalePrice;
    const maxDiscountAmount = Math.max(0, subtotal - (wholesalePrice * qty));

    const discountAmount = billingMode === 'retail'
        ? (discountType === 'percentage' ? (subtotal * discount) / 100 : discount)
        : 0;
    const discountedPrice = Math.max(wholesalePrice * qty, subtotal - discountAmount);

    const handleAddToCart = () => {
        if (!product) return;

        const qty = Number(quantity);
        if (qty <= 0) {
            toast.error("Quantity must be greater than 0");
            return;
        }

        const finalDiscount = billingMode === 'wholesale' ? 0 : discount;
        const finalDiscountAmount = billingMode === 'wholesale' ? 0 : discountAmount;
        const finalDiscountedPrice = billingMode === 'wholesale' ? subtotal : discountedPrice;

        onAddToCart(product, qty, finalDiscount, discountType, finalDiscountAmount, finalDiscountedPrice);
        onClose();
    };

    const handleClose = () => {
        onClose();
    };

    const incrementQty = () => {
        const currentQty = Number(quantity) || 0;
        if (currentQty < product.stock) {
            setQuantity(Math.min(product.stock, currentQty + 1));
            setSubUnitValue('');
        }
    };

    const decrementQty = () => {
        const currentQty = Number(quantity) || 0;
        if (currentQty > 0) {
            const nextQty = Math.max(0, currentQty - 1);
            setQuantity(nextQty);
            setSubUnitValue('');
        }
    };


    const handleDiscountTypeChange = (newType: 'percentage' | 'price') => {
        if (newType === discountType) return;

        if (newType === 'percentage' && discountType === 'price') {
            const percentValue = subtotal > 0 ? (discount / subtotal) * 100 : 0;
            setDiscount(Math.min(100, Math.max(0, percentValue)));
        } else if (newType === 'price' && discountType === 'percentage') {
            const priceValue = (subtotal * discount) / 100;
            setDiscount(Math.min(maxDiscountAmount, Math.max(0, priceValue)));
        }

        setDiscountType(newType);
    };

    const handleDiscountChange = (value: number) => {
        if (discountType === 'percentage') {
            const maxPercent = maxDiscountAmount > 0 ? (maxDiscountAmount / subtotal) * 100 : 0;
            setDiscount(Math.min(maxPercent, Math.max(0, value)));
        } else {
            setDiscount(Math.min(maxDiscountAmount, Math.max(0, value)));
        }
    };

    const handleSubUnitChange = (val: string) => {
        setSubUnitValue(val);
        
        // Reset quantity to 1 when input is cleared
        if (val === '' || !unitConfig) {
            setQuantity(1);
            return;
        }

        const numVal = Number(val);
        if (!isNaN(numVal)) {
            const convertedQty = numVal / unitConfig.factor;
            // Update quantity state
            if (convertedQty > product!.stock) {
                setQuantity(product!.stock);
            } else {
                setQuantity(Number(convertedQty.toFixed(3)));
            }
        }
    };

    const maxDiscountPercent = maxDiscountAmount > 0 ? ((maxDiscountAmount / subtotal) * 100).toFixed(2) : '0';

    return (
        <AnimatePresence>
            {isOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
                    <motion.div
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0, scale: 0.95 }}
                        className="bg-white rounded-xl shadow-2xl w-full max-w-xl"
                    >
                        {/* Header */}
                        <div className="flex justify-between items-center px-5 py-4 border-b border-gray-200 bg-gradient-to-r from-emerald-50 to-blue-50 rounded-t-xl">
                            <h2 className="text-xl font-bold text-gray-800">Add to Cart</h2>
                            <button
                                onClick={handleClose}
                                className="p-2 hover:bg-white/80 rounded-lg transition-colors"
                            >
                                <X className="w-5 h-5" />
                            </button>

                        </div>
                        {/* Keyboard Shortcuts */}
                        <div className="bg-blue-50 border border-blue-200 rounded-lg p-2.5 text-xs text-blue-700">
                            <strong>Shortcuts:</strong> Enter = Add | Esc = Close | +/- = Qty | P = Percentage | F = Fixed
                        </div>
                        {/* Content */}
                        <div className="p-5 space-y-5 max-h-[calc(100vh-220px)] overflow-y-auto">
                            {/* Product Info */}
                            <div className="bg-gradient-to-br from-blue-50 to-emerald-50 rounded-lg p-4">
                                <div className="flex items-center gap-3 mb-3">
                                    <div className="p-2 bg-white rounded-lg">
                                        <Package className="w-6 h-6 text-emerald-600" />
                                    </div>
                                    <h3 className="font-bold text-base text-gray-800">{product.name}</h3>
                                </div>
                                <div className="grid grid-cols-2 gap-3 text-sm">
                                    <div className="flex justify-between">
                                        <span className="text-gray-600">Code:</span>
                                        <span className="font-semibold text-gray-800">{product.productCode}</span>
                                    </div>
                                    <div className="flex justify-between">
                                        <span className="text-gray-600">Category:</span>
                                        <span className="font-semibold text-gray-800">{product.category}</span>
                                    </div>
                                    <div className="flex justify-between">
                                        <span className="text-gray-600">Stock:</span>
                                        <span className="font-semibold text-emerald-600">{product.stock} units</span>
                                    </div>
                                    <div className="flex justify-between">
                                        <span className="text-gray-600">Wholesale:</span>
                                        <span className="font-semibold text-blue-600">Rs {wholesalePrice.toFixed(2)}</span>
                                    </div>
                                    {product.batch && (
                                        <div className="flex justify-between col-span-2">
                                            <span className="text-gray-600">Batch:</span>
                                            <span className="font-semibold text-amber-600">{product.batch}</span>
                                        </div>
                                    )}
                                </div>
                            </div>

                            {/* Quantity Control */}
                            <div>
                                <label className="block text-sm font-semibold text-gray-700 mb-2">
                                    Quantity (Max: {product.stock})
                                </label>
                                    <div className="flex items-center gap-3">
                                        <button
                                            onClick={decrementQty}
                                            disabled={Number(quantity) <= 0}
                                            className="w-12 h-12 bg-red-50 text-red-600 border-2 border-red-100 rounded-xl flex items-center justify-center transition-all hover:bg-red-500 hover:text-white active:scale-90 disabled:bg-gray-50 disabled:text-gray-300 disabled:border-gray-100"
                                        >
                                            <Minus className="w-5 h-5" strokeWidth={3} />
                                        </button>
                                        <div className="relative flex-1 group">
                                            <input
                                                type="number"
                                                value={quantity}
                                                onKeyDown={(e) => {
                                                    if (!isDecimalAllowed && (e.key === '.' || e.key === ',')) {
                                                        e.preventDefault();
                                                    }
                                                }}
                                                onChange={(e) => {
                                                    const val = e.target.value;
                                                    setSubUnitValue(''); // Clear sub-unit when manual qty change
                                                    if (val === '') {
                                                        setQuantity('');
                                                        return;
                                                    }

                                                    if (!isDecimalAllowed && (val.includes('.') || val.includes(','))) {
                                                        return;
                                                    }

                                                    const numVal = Number(val);
                                                    if (numVal > product.stock) {
                                                        setQuantity(product.stock);
                                                    } else {
                                                        setQuantity(numVal);
                                                    }
                                                }}
                                                step={isDecimalAllowed ? "any" : "1"}
                                                autoFocus
                                                onFocus={(e) => e.target.select()}
                                                className="w-full text-center text-2xl font-black py-2.5 bg-gray-50 border-2 border-gray-200 rounded-xl focus:outline-none focus:border-emerald-500 focus:bg-white transition-all shadow-inner tabular-nums"
                                                min={0}
                                                max={product.stock}
                                            />
                                            <div className="absolute -top-2 left-4 px-1.5 bg-white text-[9px] font-black text-gray-400 uppercase tracking-tighter opacity-0 group-focus-within:opacity-100 transition-opacity">Quantity ({product.category})</div>
                                        </div>
                                        <button
                                            onClick={incrementQty}
                                            disabled={Number(quantity) >= product.stock}
                                            className="w-12 h-12 bg-emerald-50 text-emerald-600 border-2 border-emerald-100 rounded-xl flex items-center justify-center transition-all hover:bg-emerald-500 hover:text-white active:scale-90 disabled:bg-gray-50 disabled:text-gray-300 disabled:border-gray-100"
                                        >
                                            <Plus className="w-5 h-5" strokeWidth={3} />
                                        </button>
                                    </div>

                                    {/* Sub-Unit Quick Convert */}
                                    {unitConfig && (
                                        <div className="mt-3 p-3 bg-emerald-50 border border-emerald-100 rounded-xl animate-in fade-in slide-in-from-top-1">
                                            <div className="flex items-center gap-2 mb-2">
                                                <Calculator className="w-3.5 h-3.5 text-emerald-600" />
                                                <span className="text-[11px] font-bold text-emerald-700 uppercase tracking-wider">Quick Convert: {unitConfig.subLabel}</span>
                                            </div>
                                            <div className="relative">
                                                <input
                                                    type="number"
                                                    value={subUnitValue}
                                                    onChange={(e) => handleSubUnitChange(e.target.value)}
                                                    placeholder={`Enter amount in ${unitConfig.subLabel.split(' ')[0]}...`}
                                                    step="any"
                                                    className="w-full px-3 py-2 bg-white border-2 border-emerald-200 rounded-lg text-sm focus:outline-none focus:border-emerald-500 transition-all font-semibold"
                                                />
                                                <div className="absolute right-3 top-1/2 -translate-y-1/2 text-[10px] font-bold text-emerald-500 flex items-center gap-1">
                                                     <RefreshCw className="w-3 h-3 animate-spin-slow" />
                                                     to {product.category}
                                                </div>
                                            </div>
                                            <p className="mt-1.5 text-[10px] text-emerald-600 font-medium">
                                                Tip: Entering <span className="font-bold">{unitConfig.factor}</span> will set quantity to <span className="font-bold">1 {product.category}</span>
                                            </p>
                                        </div>
                                    )}
                                </div>

                            {/* Discount Section - Only in Retail Mode */}
                            {billingMode === 'retail' && (
                                <div>
                                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                                        Discount (Max: Rs {maxDiscountAmount.toFixed(2)} / {maxDiscountPercent}%)
                                    </label>

                                    {/* Discount Type Toggle */}
                                    <div className="flex gap-2 mb-3">
                                        <button
                                            onClick={() => handleDiscountTypeChange('percentage')}
                                            className={`flex-1 py-3 rounded-lg transition-all flex items-center justify-center gap-2 ${discountType === 'percentage'
                                                ? 'bg-emerald-500 text-white shadow-md'
                                                : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                                                }`}
                                        >
                                            <Percent className="w-4 h-4" />
                                            <span className="font-semibold">Percentage</span>
                                        </button>
                                        <button
                                            onClick={() => handleDiscountTypeChange('price')}
                                            className={`flex-1 py-3 rounded-lg transition-all flex items-center justify-center gap-2 ${discountType === 'price'
                                                ? 'bg-blue-500 text-white shadow-md'
                                                : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                                                }`}
                                        >
                                            <DollarSign className="w-4 h-4" />
                                            <span className="font-semibold">Fixed Amount</span>
                                        </button>
                                    </div>

                                    {/* Discount Input */}
                                    <input
                                        type="number"
                                        value={discount}
                                        onChange={(e) => handleDiscountChange(Number(e.target.value))}
                                        className="w-full px-4 py-3 text-base border-2 border-gray-200 rounded-lg focus:outline-none focus:border-emerald-500"
                                        placeholder={discountType === 'percentage' ? `0-${maxDiscountPercent}%` : `0-${maxDiscountAmount.toFixed(2)}`}
                                        step="0.01"
                                        min="0"
                                        max={discountType === 'percentage' ? parseFloat(maxDiscountPercent) : maxDiscountAmount}
                                    />
                                </div>
                            )}

                            {/* Price Breakdown */}
                            <div className="bg-gray-50 rounded-lg p-4 space-y-2">
                                <div className="flex justify-between text-sm">
                                    <span className="text-gray-600">Unit Price:</span>
                                    <span className="font-semibold text-gray-800">Rs {price.toFixed(2)}</span>
                                </div>
                                <div className="flex justify-between text-sm">
                                    <span className="text-gray-600">Subtotal ({qty} × {price.toFixed(2)}):</span>
                                    <span className="font-semibold text-gray-800">Rs {subtotal.toFixed(2)}</span>
                                </div>
                                {billingMode === 'retail' && discount > 0 && (
                                    <div className="flex justify-between text-sm text-red-600">
                                        <span>Discount ({discountType === 'percentage' ? `${discount.toFixed(2)}%` : `Rs ${discount.toFixed(2)}`}):</span>
                                        <span className="font-semibold">-Rs {discountAmount.toFixed(2)}</span>
                                    </div>
                                )}<div className="flex justify-between text-sm text-blue-600">
                                    <span>Minimum (WSP × Qty):</span>
                                    <span className="font-semibold">Rs {(wholesalePrice * qty).toFixed(2)}</span>
                                </div>
                                <div className="flex justify-between text-lg font-bold border-t pt-2 mt-2">
                                    <span className="text-gray-800">Total:</span>
                                    <span className="text-emerald-600">Rs {discountedPrice.toFixed(2)}</span>
                                </div>
                            </div>


                        </div>

                        {/* Footer Actions */}
                        <div className="flex gap-3 px-5 py-4 border-t border-gray-200 bg-gray-50 rounded-b-xl">
                            <button
                                onClick={handleClose}
                                className="flex-1 py-3 px-4 bg-white hover:bg-gray-100 text-gray-700 font-semibold rounded-lg transition-colors border border-gray-300"
                            >
                                Cancel
                            </button>
                            <button
                                onClick={handleAddToCart}
                                className="flex-1 py-3 px-4 bg-gradient-to-r from-emerald-500 to-green-500 hover:from-emerald-600 hover:to-green-600 text-white font-semibold rounded-lg transition-all shadow-md"
                            >
                                Add to Cart
                            </button>
                        </div>
                    </motion.div>
                </div>
            )}
        </AnimatePresence>
    );
};