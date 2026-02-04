import { useState, useEffect } from 'react';
import toast from 'react-hot-toast';
import { X, Plus, Minus, Percent, DollarSign, Calculator, RefreshCw } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { unitConversionService, type UnitConversion } from '../../services/unitConversionService';
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
    const [quantity, setQuantity] = useState<number | string>(1);
    const [price, setPrice] = useState(0);
    const [discount, setDiscount] = useState(0);
    const [discountType, setDiscountType] = useState<'percentage' | 'price'>('percentage');
    const [subUnitValue, setSubUnitValue] = useState<number | string>('');

    const [unitConversions, setUnitConversions] = useState<UnitConversion[]>([]);
    
    const currentUnitStr = (item?.category || '').toLowerCase().trim();
    
    // Logic from ProductAddModal
    const getUnitConfig = (unit: string, isBulkItem: boolean) => {
        const u = unit.toLowerCase().trim();
        // Weights: KG, Grams, Kilo, etc.
        if (u.includes('kg') || u.includes('kilo') || u.includes('gram') || u.includes('weight') || (isBulkItem && (u === '' || u === 'pcs'))) 
            return { label: 'Weight', subLabel: 'Grams (g)', factor: 1000 };
        // Volumes: L, ML, Liter, litre, etc.
        if (u === 'l' || u.includes('ltr') || u.includes('liter') || u.includes('litre') || u.includes('vol') || u.includes('ml')) 
            return { label: 'Volume', subLabel: 'Milliliters (ml)', factor: 1000 };
        // Lengths: M, CM, Meter, metre, etc.
        if (u === 'm' || (u.includes('meter') && !u.includes('centi')) || u.includes('metre') || u.includes('cm')) 
            return { label: 'Length', subLabel: 'Centimeters (cm)', factor: 100 };
        
        // Final fallback for bulk items
        if (isBulkItem) return { label: 'Bulk', subLabel: 'Units (/1000)', factor: 1000 };
        
        return null;
    };

    const unitConfig = getUnitConfig(currentUnitStr, item?.isBulk || false);
    const isDecimalAllowed = !!unitConfig || unitConversions.length > 0;

    // Fetch unit conversions when item changes
    useEffect(() => {
        const fetchUnitConversions = async () => {
             // Need unitId on CartItem type (added previously)
             if (!item?.unitId) {
                setUnitConversions([]);
                return;
            }

            try {
                const response = await unitConversionService.getConversionsForUnit(item.unitId);
                if (response.data?.success) {
                    setUnitConversions(response.data.data || []);
                }
            } catch (error) {
                console.error('Error fetching unit conversions for edit:', error);
                setUnitConversions([]);
            }
        };

        if (isOpen && item) {
            fetchUnitConversions();
        }
    }, [isOpen, item?.unitId]);

    useEffect(() => {
        if (item) {
            setQuantity(item.quantity);
            setPrice(item.price);
            setDiscount((item.discount || 0));
            const type = item.discountType === 'fixed' || item.discountType === 'price' ? 'price' : 'percentage';
            setDiscountType(type);
            setSubUnitValue('');
        }
    }, [item, isOpen]);

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
                    break; case 'p':
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
    }, [isOpen, quantity, item, discount, discountType, billingMode]);

    if (!item) return null;

    const qty = Number(quantity) || 0;
    const subtotal = price * qty;
    const wholesalePrice = item.wholesalePrice || 0;
    const maxDiscountAmount = Math.max(0, subtotal - (wholesalePrice * qty));

    const discountAmount = billingMode === 'retail'
        ? (discountType === 'percentage' ? (subtotal * discount) / 100 : discount)
        : 0;
    const total = Math.max(wholesalePrice * qty, subtotal - discountAmount);

    const handleUpdate = () => {
        if (!item) return;

        const qty = Number(quantity);
        if (qty <= 0) {
            toast.error("Quantity must be greater than 0");
            return;
        }

        const finalDiscount = billingMode === 'wholesale' ? 0 : discount;
        onUpdate(item.id, qty, price, finalDiscount, discountType);
        handleClose();
    };

    const handleClose = () => {
        onClose();
    };

    const incrementQty = () => {
        const currentQty = Number(quantity) || 0;
        if (currentQty < item.stock) {
            setQuantity(currentQty + 1);
            setSubUnitValue('');
        }
    };

    const decrementQty = () => {
        const currentQty = Number(quantity) || 0;
        if (currentQty > 0) {
            setQuantity(Math.max(0, currentQty - 1));
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
        if (val === '' || !unitConfig) return;

        const numVal = Number(val);
        if (!isNaN(numVal)) {
            const convertedQty = numVal / unitConfig.factor;
            // Update quantity state
            if (convertedQty > item!.stock) {
                setQuantity(item!.stock);
            } else {
                setQuantity(Number(convertedQty.toFixed(3)));
            }
        }
    };

    const maxDiscountPercent = maxDiscountAmount > 0 ? ((maxDiscountAmount / subtotal) * 100).toFixed(2) : '0';

    return (
        <AnimatePresence>
            {isOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 rounded-xl">
                    <motion.div
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0, scale: 0.95 }}
                        className="bg-white rounded-xl shadow-2xl w-full max-w-xl"
                    >
                        {/* Header */}
                        <div className="flex justify-between items-center px-5 py-4 border-b border-gray-200 bg-gradient-to-r from-emerald-50 to-blue-50 rounded-t-xl">
                            <h2 className="text-xl font-bold text-gray-800">Edit Cart Item</h2>
                            <button
                                onClick={handleClose}
                                className="p-2 hover:bg-white/80 rounded-lg transition-colors"
                            >
                                <X className="w-5 h-5" />
                            </button>
                        </div>

                        {/* Content */}
                        <div className="p-5 space-y-5 max-h-[calc(100vh-220px)] overflow-y-auto">
                            {/* Product Info */}
                            <div className="bg-gradient-to-br from-blue-50 to-emerald-50 rounded-lg p-4">
                                <h3 className="font-bold text-base text-gray-800 mb-3">{item.name}</h3>
                                <div className="grid grid-cols-2 gap-3 text-sm">
                                    <div className="flex justify-between">
                                        <span className="text-gray-600">Category:</span>
                                        <span className="font-semibold text-gray-800">{item.category}</span>
                                    </div>
                                    <div className="flex justify-between">
                                        <span className="text-gray-600">Stock:</span>
                                        <span className="font-semibold text-emerald-600">{item.stock} units</span>
                                    </div>
                                    <div className="flex justify-between">
                                        <span className="text-gray-600">Wholesale:</span>
                                        <span className="font-semibold text-blue-600">Rs {wholesalePrice.toFixed(2)}</span>
                                    </div>
                                    <div className="flex justify-between">
                                        <span className="text-gray-600">Current Price:</span>
                                        <span className="font-semibold text-emerald-600">Rs {price.toFixed(2)}</span>
                                    </div></div>
                            </div>

                            {/* Quantity & Price in Grid */}
                            <div className="grid grid-cols-2 gap-4">
                                {/* Quantity Control */}
                                <div>
                                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                                        Quantity (Max: {item.stock})
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
                                                    if (numVal > item.stock) {
                                                        setQuantity(item.stock);
                                                    } else {
                                                        setQuantity(numVal);
                                                    }
                                                }}
                                                step={isDecimalAllowed ? "any" : "1"}
                                                className="w-full text-center text-2xl font-black py-2.5 bg-gray-50 border-2 border-gray-200 rounded-xl focus:outline-none focus:border-emerald-500 focus:bg-white transition-all shadow-inner tabular-nums"
                                                min={0}
                                                max={item.stock}
                                            />
                                            <div className="absolute -top-2 left-4 px-1.5 bg-white text-[9px] font-black text-gray-400 uppercase tracking-tighter opacity-0 group-focus-within:opacity-100 transition-opacity">Quantity ({item.category})</div>
                                        </div>
                                        <button
                                            onClick={incrementQty}
                                            disabled={Number(quantity) >= item.stock}
                                            className="w-12 h-12 bg-emerald-50 text-emerald-600 border-2 border-emerald-100 rounded-xl flex items-center justify-center transition-all hover:bg-emerald-500 hover:text-white active:scale-90 disabled:bg-gray-50 disabled:text-gray-300 disabled:border-gray-100"
                                        >
                                            <Plus className="w-5 h-5" strokeWidth={3} />
                                        </button>
                                    </div>
                                </div>

                                {/* Price Edit */}
                                <div>
                                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                                        Unit Price (Min: Rs {wholesalePrice.toFixed(2)})
                                    </label>
                                    <input
                                        type="number"
                                        value={price}
                                        onChange={(e) => setPrice(Math.max(wholesalePrice, Number(e.target.value)))}
                                        className="w-full px-3 py-2 text-base border-2 border-gray-200 rounded-lg focus:outline-none focus:border-emerald-500"
                                        step="0.01"
                                        min={wholesalePrice}
                                    />
                                </div>
                            </div>

                            {/* Sub-Unit Quick Convert - Full Width */}
                            {unitConfig && (
                                <div className="p-4 bg-emerald-50 border-2 border-emerald-200 rounded-xl">
                                    <div className="flex items-center gap-2 mb-3">
                                        <Calculator className="w-4 h-4 text-emerald-600" />
                                        <span className="text-sm font-bold text-emerald-700 uppercase tracking-wide">Quick Convert: {unitConfig.subLabel}</span>
                                    </div>
                                    <div className="relative">
                                        <input
                                            type="number"
                                            value={subUnitValue}
                                            onChange={(e) => handleSubUnitChange(e.target.value)}
                                            placeholder={`Enter amount in ${unitConfig.subLabel.split(' ')[0]}...`}
                                            step="any"
                                            className="w-full px-4 py-3 bg-white border-2 border-emerald-200 rounded-lg text-base focus:outline-none focus:border-emerald-500 transition-all font-semibold"
                                        />
                                        <div className="absolute right-4 top-1/2 -translate-y-1/2 text-xs font-bold text-emerald-500 flex items-center gap-1.5">
                                             <RefreshCw className="w-3.5 h-3.5 animate-spin-slow" />
                                             to {item.category}
                                        </div>
                                    </div>
                                    <p className="mt-2 text-xs text-emerald-600 font-medium">
                                        💡 Tip: Entering <span className="font-bold">{unitConfig.factor}</span> will set quantity to <span className="font-bold">1 {item.category}</span>
                                    </p>
                                </div>
                            )}

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
                                            className={`flex-1 py-2.5 rounded-lg transition-all flex items-center justify-center gap-2 text-sm ${discountType === 'percentage'
                                                ? 'bg-emerald-500 text-white shadow-md'
                                                : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                                                }`}
                                        >
                                            <Percent className="w-4 h-4" />
                                            <span className="font-semibold">Percentage</span>
                                        </button>
                                        <button
                                            onClick={() => handleDiscountTypeChange('price')}
                                            className={`flex-1 py-2.5 rounded-lg transition-all flex items-center justify-center gap-2 text-sm ${discountType === 'price'
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
                                        className="w-full px-3 py-2 text-base border-2 border-gray-200 rounded-lg focus:outline-none focus:border-emerald-500"
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
                                    <span className="text-gray-600">Subtotal:</span>
                                    <span className="font-semibold text-gray-800">Rs {subtotal.toFixed(2)}</span>
                                </div>
                                {billingMode === 'retail' && discount > 0 && (
                                    <div className="flex justify-between text-sm text-red-600">
                                        <span>Discount ({discountType === 'percentage' ? `${discount.toFixed(2)}%` : `Rs ${discount.toFixed(2)}`}):</span>
                                        <span className="font-semibold">-Rs {discountAmount.toFixed(2)}</span>
                                    </div>
                                )}
                                <div className="flex justify-between text-sm text-blue-600">
                                    <span>Minimum (WSP × Qty):</span>
                                    <span className="font-semibold">Rs {(wholesalePrice * qty).toFixed(2)}</span>
                                </div>
                                <div className="flex justify-between text-lg font-bold border-t pt-2 mt-2">
                                    <span className="text-gray-800">Total:</span>
                                    <span className="text-emerald-600">Rs {total.toFixed(2)}</span>
                                </div>
                            </div>

                            {/* Keyboard Shortcuts */}
                            <div className="bg-blue-50 border border-blue-200 rounded-lg p-2.5 text-xs text-blue-700">
                                <strong>Shortcuts:</strong> Enter = Update | Esc = Close | +/- = Qty | P = Percentage | F = Fixed
                            </div>
                        </div>

                        {/* Footer Actions */}
                        <div className="flex gap-3 px-5 py-4 border-t border-gray-200 bg-gray-50 rounded-b-xl">
                            <button
                                onClick={handleClose}
                                className="flex-1 py-2.5 px-4 bg-white hover:bg-gray-100 text-gray-700 font-semibold rounded-lg transition-colors border border-gray-300"
                            >
                                Cancel
                            </button>
                            <button
                                onClick={handleUpdate}
                                className="flex-1 py-2.5 px-4 bg-gradient-to-r from-emerald-500 to-green-500 hover:from-emerald-600 hover:to-green-600 text-white font-semibold rounded-lg transition-all shadow-md"
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