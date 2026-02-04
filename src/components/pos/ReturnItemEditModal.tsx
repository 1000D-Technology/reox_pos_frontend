import { useState, useEffect } from 'react';
import toast from 'react-hot-toast';
import { X, Plus, Minus, Calculator, RefreshCw } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

interface ReturnItem {
    id: number;
    name: string;
    price: number;
    quantity: number;
    returnedQuantity?: number;
    returnQuantity: number;
    category?: string;
    isBulk?: boolean;
}

interface ReturnItemEditModalProps {
    isOpen: boolean;
    onClose: () => void;
    item: ReturnItem | null;
    onUpdate: (id: number, returnQuantity: number) => void;
}

export const ReturnItemEditModal = ({
    isOpen,
    onClose,
    item,
    onUpdate
}: ReturnItemEditModalProps) => {
    const [returnQuantity, setReturnQuantity] = useState<number | string>(0);
    const [subUnitValue, setSubUnitValue] = useState<number | string>('');

    const currentUnitStr = (item?.category || '').toLowerCase().trim();
    
    const getUnitConfig = (unit: string, isBulkItem: boolean) => {
        const u = unit.toLowerCase().trim();
        if (u.includes('kg') || u.includes('kilo') || u.includes('gram') || u.includes('weight') || (isBulkItem && (u === '' || u === 'pcs'))) 
            return { label: 'Weight', subLabel: 'Grams (g)', factor: 1000 };
        if (u === 'l' || u.includes('ltr') || u.includes('liter') || u.includes('litre') || u.includes('vol') || u.includes('ml')) 
            return { label: 'Volume', subLabel: 'Milliliters (ml)', factor: 1000 };
        if (u === 'm' || (u.includes('meter') && !u.includes('centi')) || u.includes('metre') || u.includes('cm')) 
            return { label: 'Length', subLabel: 'Centimeters (cm)', factor: 100 };
        if (isBulkItem) return { label: 'Bulk', subLabel: 'Units (/1000)', factor: 1000 };
        return null;
    };

    const unitConfig = getUnitConfig(currentUnitStr, item?.isBulk || false);

    const alreadyReturned = item?.returnedQuantity || 0;
    const maxAvailableToReturn = item ? Math.max(0, item.quantity - alreadyReturned) : 0;

    useEffect(() => {
        if (item) {
            setReturnQuantity(item.returnQuantity);
            setSubUnitValue('');
        }
    }, [item, isOpen]);

    useEffect(() => {
        if (!isOpen) return;

        const handleKeyDown = (e: KeyboardEvent) => {
            switch (e.key) {
                case 'Escape':
                    e.preventDefault();
                    onClose();
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
            }
        };

        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, [isOpen, returnQuantity, item]);

    if (!item) return null;

    const handleUpdate = () => {
        const qty = Number(returnQuantity);
        if (qty < 0) {
            toast.error("Return quantity cannot be negative");
            return;
        }
        if (qty > maxAvailableToReturn) {
            toast.error(`Cannot return more than available (${maxAvailableToReturn})`);
            return;
        }

        onUpdate(item.id, qty);
        onClose();
    };

    const incrementQty = () => {
        const currentQty = Number(returnQuantity) || 0;
        if (currentQty < maxAvailableToReturn) {
            setReturnQuantity(Math.min(maxAvailableToReturn, currentQty + 1));
            setSubUnitValue('');
        }
    };

    const decrementQty = () => {
        const currentQty = Number(returnQuantity) || 0;
        if (currentQty > 0) {
            setReturnQuantity(Math.max(0, currentQty - 1));
            setSubUnitValue('');
        }
    };

    const handleSubUnitChange = (val: string) => {
        setSubUnitValue(val);
        if (val === '' || !unitConfig) {
            return;
        }

        const numVal = Number(val);
        if (!isNaN(numVal)) {
            const convertedQty = numVal / unitConfig.factor;
            if (convertedQty > maxAvailableToReturn) {
                setReturnQuantity(maxAvailableToReturn);
            } else {
                setReturnQuantity(Number(convertedQty.toFixed(3)));
            }
        }
    };

    return (
        <AnimatePresence>
            {isOpen && (
                <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/50 p-4">
                    <motion.div
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0, scale: 0.95 }}
                        className="bg-white rounded-xl shadow-2xl w-full max-w-lg"
                    >
                        {/* Header */}
                        <div className="flex justify-between items-center px-5 py-4 border-b border-gray-200 bg-linear-to-r from-amber-50 to-orange-50 rounded-t-xl">
                            <h2 className="text-xl font-bold text-gray-800">Set Return Quantity</h2>
                            <button
                                onClick={onClose}
                                className="p-2 hover:bg-white/80 rounded-lg transition-colors"
                            >
                                <X className="w-5 h-5" />
                            </button>
                        </div>

                        {/* Content */}
                        <div className="p-5 space-y-5">
                            {/* Product Info */}
                            <div className="bg-linear-to-br from-amber-50 to-orange-50 rounded-lg p-4">
                                <h3 className="font-bold text-base text-gray-800 mb-2">{item.name}</h3>
                                <div className="grid grid-cols-2 gap-2 text-sm">
                                    <div className="flex justify-between">
                                        <span className="text-gray-600">Original Qty:</span>
                                        <span className="font-semibold">{item.quantity}</span>
                                    </div>
                                    <div className="flex justify-between">
                                        <span className="text-gray-600">Price:</span>
                                        <span className="font-semibold text-emerald-600">Rs {item.price.toFixed(2)}</span>
                                    </div>
                                    <div className="flex justify-between">
                                        <span className="text-gray-600">Already Returned:</span>
                                        <span className="font-semibold text-red-500">{alreadyReturned}</span>
                                    </div>
                                    <div className="flex justify-between">
                                        <span className="text-gray-600">Max Returnable:</span>
                                        <span className="font-semibold text-blue-600">{maxAvailableToReturn}</span>
                                    </div>
                                </div>
                            </div>

                            {/* Return Quantity Control */}
                            <div>
                                <label className="block text-sm font-semibold text-gray-700 mb-2">
                                    Quantity to Return
                                </label>
                                <div className="flex items-center gap-3">
                                    <button
                                        onClick={decrementQty}
                                        disabled={Number(returnQuantity) <= 0}
                                        className="w-12 h-12 bg-red-50 text-red-600 border-2 border-red-100 rounded-xl flex items-center justify-center transition-all hover:bg-red-500 hover:text-white active:scale-90 disabled:bg-gray-50 disabled:text-gray-300"
                                    >
                                        <Minus className="w-5 h-5" strokeWidth={3} />
                                    </button>
                                    <div className="relative flex-1">
                                        <input
                                            type="number"
                                            value={returnQuantity}
                                            onChange={(e) => {
                                                const val = e.target.value;
                                                setSubUnitValue('');
                                                if (val === '') {
                                                    setReturnQuantity('');
                                                    return;
                                                }
                                                const numVal = Number(val);
                                                if (numVal > maxAvailableToReturn) {
                                                    setReturnQuantity(maxAvailableToReturn);
                                                } else {
                                                    setReturnQuantity(numVal);
                                                }
                                            }}
                                            step="any"
                                            autoFocus
                                            onFocus={(e) => e.target.select()}
                                            className="w-full text-center text-2xl font-black py-2.5 bg-gray-50 border-2 border-gray-200 rounded-xl focus:outline-none focus:border-amber-500 focus:bg-white transition-all tabular-nums"
                                            min={0}
                                            max={maxAvailableToReturn}
                                        />
                                    </div>
                                    <button
                                        onClick={incrementQty}
                                        disabled={Number(returnQuantity) >= maxAvailableToReturn}
                                        className="w-12 h-12 bg-emerald-50 text-emerald-600 border-2 border-emerald-100 rounded-xl flex items-center justify-center transition-all hover:bg-emerald-500 hover:text-white active:scale-90 disabled:bg-gray-50 disabled:text-gray-300"
                                    >
                                        <Plus className="w-5 h-5" strokeWidth={3} />
                                    </button>
                                </div>
                            </div>

                            {/* Sub-Unit Quick Convert */}
                            {unitConfig && (
                                <div className="p-4 bg-amber-50 border-2 border-amber-200 rounded-xl">
                                    <div className="flex items-center gap-2 mb-3">
                                        <Calculator className="w-4 h-4 text-amber-600" />
                                        <span className="text-sm font-bold text-amber-700 uppercase tracking-wide">Quick Convert: {unitConfig.subLabel}</span>
                                    </div>
                                    <div className="relative">
                                        <input
                                            type="number"
                                            value={subUnitValue}
                                            onChange={(e) => handleSubUnitChange(e.target.value)}
                                            placeholder={`Enter amount in ${unitConfig.subLabel.split(' ')[0]}...`}
                                            step="any"
                                            className="w-full px-4 py-3 bg-white border-2 border-amber-200 rounded-lg text-base focus:outline-none focus:border-amber-500 transition-all font-semibold"
                                        />
                                        <div className="absolute right-4 top-1/2 -translate-y-1/2 text-xs font-bold text-amber-500 flex items-center gap-1.5">
                                             <RefreshCw className="w-3.5 h-3.5 animate-spin-slow" />
                                             to {item.category || 'units'}
                                        </div>
                                    </div>
                                </div>
                            )}

                            {/* Summary */}
                            <div className="bg-gray-50 rounded-lg p-4 flex justify-between items-center font-bold text-lg">
                                <span className="text-gray-700">Refund Value:</span>
                                <span className="text-amber-600">Rs {(Number(returnQuantity) * item.price).toFixed(2)}</span>
                            </div>
                        </div>

                        {/* Footer Actions */}
                        <div className="flex gap-3 px-5 py-4 border-t border-gray-200 bg-gray-50 rounded-b-xl">
                            <button
                                onClick={onClose}
                                className="flex-1 py-3 px-4 bg-white hover:bg-gray-100 text-gray-700 font-semibold rounded-lg transition-colors border border-gray-300"
                            >
                                Cancel
                            </button>
                            <button
                                onClick={handleUpdate}
                                className="flex-1 py-3 px-4 bg-linear-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 text-white font-semibold rounded-lg transition-all shadow-md"
                            >
                                Update Return
                            </button>
                        </div>
                    </motion.div>
                </div>
            )}
        </AnimatePresence>
    );
};
