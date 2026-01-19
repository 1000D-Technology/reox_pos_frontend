import {Trash2, Minus, Plus, Edit3, Tag, X, ShoppingCart} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import type { CartItem } from '../../types';

interface CartItem {
    id: number;
    name: string;
    barcode: string;
    price: number;
    wholesalePrice: number;
    quantity: number;
    discount: number;
    discountType: 'percentage' | 'price';
    stock: number;
    category: string;
    productCode: string;
}

interface CartPanelProps {
    cartItems: CartItem[];
    itemsCount: number;
    editingItem: number | null;
    billingMode: 'retail' | 'wholesale';
    onClearCart: () => void;
    onRemoveItem: (id: number) => void;
    onUpdateQuantity: (id: number, delta: number) => void;
    onUpdatePrice: (id: number, price: number) => void;
    onUpdateDiscount: (id: number, discount: number) => void;
    onUpdateDiscountType: (id: number, type: 'percentage' | 'price') => void;
    onEditItem: (id: number | null) => void;
    calculateItemTotal: (item: CartItem) => number;
}

export const CartPanel = ({
                              cartItems,
                              itemsCount,
                              editingItem,
                              billingMode,
                              onClearCart,
                              onRemoveItem,
                              onUpdateQuantity,
                              onUpdatePrice,
                              onUpdateDiscount,
                              onUpdateDiscountType,
                              onEditItem,
                              calculateItemTotal
                          }: CartPanelProps) => {
    return (
        <div className="col-span-5 bg-white rounded-2xl shadow-lg p-3 flex flex-col overflow-hidden">
            <div className="flex justify-between items-center mb-3">
                <h2 className="text-lg font-bold text-gray-800">Cart Items ({itemsCount})</h2>
                <button
                    onClick={onClearCart}
                    className="flex items-center gap-1.5 px-3 py-1.5 text-sm bg-red-50 text-red-600 hover:bg-red-100 rounded-xl transition-colors"
                >
                    <Trash2 className="w-3.5 h-3.5" />
                    Clear
                </button>
            </div>

            <div className="space-y-2 overflow-y-auto flex-1">
                <AnimatePresence>
                    {cartItems.map((item) => (
                        <motion.div
                            key={item.id}
                            initial={{ opacity: 0, x: -20 }}
                            animate={{ opacity: 1, x: 0 }}
                            exit={{ opacity: 0, x: 20 }}
                            className={`p-2.5 rounded-xl border-2 transition-all ${editingItem === item.id
                                ? 'bg-emerald-50 border-emerald-300'
                                : 'bg-gray-50 border-transparent'
                            }`}
                        >
                            <div className="flex justify-between items-start mb-2">
                                <div className="flex-1">
                                    <h3 className="font-semibold text-sm text-gray-800">{item.name}</h3>
                                    <div className="flex items-center gap-2 mt-1">
                                        <span className="text-xs text-gray-500">{item.category}</span>
                                        <Tag className="w-3 h-3 text-emerald-600" />
                                        <span className="text-xs font-medium text-emerald-600">
                                            {billingMode === 'wholesale' ? `Wholesale: Rs ${item.wholesalePrice}` : `Retail: Rs ${item.price}`}
                                            Wholesale: Rs {item.wholesalePrice}
                                        </span>
                                    </div>
                                </div>
                                <div className="flex gap-1">
                                    <button
                                        onClick={() => onEditItem(editingItem === item.id ? null : item.id)}
                                        className={`p-1.5 rounded-lg transition-colors ${editingItem === item.id
                                            ? 'bg-emerald-500 text-white'
                                            : 'bg-emerald-50 text-emerald-600 hover:bg-emerald-100'
                                        }`}
                                    >
                                        <Edit3 className="w-3.5 h-3.5" />
                                    </button>
                                    <button
                                        onClick={() => onRemoveItem(item.id)}
                                        className="p-1.5 bg-red-50 text-red-600 hover:bg-red-100 rounded-lg transition-colors"
                                    >
                                        <X className="w-3.5 h-3.5" />
                                    </button>
                                </div>
                            </div>

                            {editingItem === item.id ? (
                                <div className="space-y-2 mb-2">
                                    <div className="flex items-center gap-2 mb-2">
                                        <button
                                            onClick={() => onUpdateDiscountType(item.id, 'percentage')}
                                            className={`flex-1 px-3 py-1.5 text-xs rounded-lg transition-colors ${
                                                item.discountType === 'percentage'
                                                    ? 'bg-emerald-500 text-white'
                                                    : 'bg-gray-200 text-gray-600 hover:bg-gray-300'
                                            }`}
                                        >
                                            Percentage (%)
                                        </button>
                                        <button
                                            onClick={() => onUpdateDiscountType(item.id, 'price')}
                                            className={`flex-1 px-3 py-1.5 text-xs rounded-lg transition-colors ${
                                                item.discountType === 'price'
                                                    ? 'bg-emerald-500 text-white'
                                                    : 'bg-gray-200 text-gray-600 hover:bg-gray-300'
                                            }`}
                                        >
                                            Fixed Price (Rs)
                                        </button>
                                    </div>
                                    <div className="grid grid-cols-3 gap-2">
                                        <div>
                                            <label className="text-xs text-gray-600 mb-1 block">Price</label>
                                            <input
                                                type="number"
                                                value={item.price}
                                                onChange={(e) => onUpdatePrice(item.id, Number(e.target.value))}
                                                className="w-full px-2 py-1.5 text-sm bg-white border-2 border-emerald-300 rounded-lg focus:outline-none"
                                                step="0.01"
                                                min="0"
                                            />
                                        </div>
                                        <div>
                                            <label className="text-xs text-gray-600 mb-1 block">
                                                Discount {item.discountType === 'percentage' ? '(%)' : '(Rs)'}
                                            </label>
                                            <input
                                                type="number"
                                                value={item.discount}
                                                onChange={(e) => onUpdateDiscount(item.id, Number(e.target.value))}
                                                className="w-full px-2 py-1.5 text-sm bg-white border-2 border-emerald-300 rounded-lg focus:outline-none"
                                                step="0.01"
                                                min="0"
                                                max={item.discountType === 'percentage' ? 100 : undefined}
                                            />
                                        </div>
                                        <div>
                                            <label className="text-xs text-gray-600 mb-1 block">
                                                {item.discountType === 'percentage' ? 'Amount (Rs)' : 'Percent (%)'}
                                            </label>
                                            <input
                                                type="number"
                                                value={
                                                    item.discountType === 'percentage'
                                                        ? ((item.price * item.quantity * item.discount) / 100).toFixed(2)
                                                        : ((item.discount / (item.price * item.quantity)) * 100).toFixed(2)
                                                }
                                                onChange={(e) => {
                                                    const value = Number(e.target.value);
                                                    if (item.discountType === 'percentage') {
                                                        // Convert amount to percentage
                                                        const percentage = (value / (item.price * item.quantity)) * 100;
                                                        onUpdateDiscount(item.id, Math.min(percentage, 100));
                                                    } else {
                                                        // Convert percentage to amount
                                                        const amount = (item.price * item.quantity * value) / 100;
                                                        onUpdateDiscount(item.id, amount);
                                                    }
                                                }}
                                                className="w-full px-2 py-1.5 text-sm bg-white border-2 border-blue-300 rounded-lg focus:outline-none"
                                                step="0.01"
                                                min="0"
                                                max={item.discountType === 'price' ? 100 : undefined}
                                            />
                                        </div>
                                    </div>
                                </div>
                            ) : null}


                            <div className="flex justify-between items-center">
                                <div className="flex items-center gap-2 bg-white border-2 border-gray-200 rounded-lg p-1">
                                    <button
                                        onClick={() => onUpdateQuantity(item.id, -1)}
                                        className="p-1 bg-gray-100 hover:bg-emerald-500 hover:text-white rounded transition-colors"
                                    >
                                        <Minus className="w-3.5 h-3.5" />
                                    </button>
                                    <span className="px-3 font-semibold text-sm">{item.quantity}</span>
                                    <button
                                        onClick={() => onUpdateQuantity(item.id, 1)}
                                        className="p-1 bg-gray-100 hover:bg-emerald-500 hover:text-white rounded transition-colors"
                                    >
                                        <Plus className="w-3.5 h-3.5" />
                                    </button>
                                </div>

                                <div className="text-right">
                                    {item.discount > 0 && (
                                        <>
                                            <p className="text-xs text-red-500 line-through">
                                                Rs {(item.price * item.quantity).toFixed(2)}
                                            </p>
                                            <p className="text-xs text-emerald-600 font-medium">
                                                {item.discountType === 'percentage'
                                                    ? `-${item.discount}% off`
                                                    : `-Rs ${item.discount.toFixed(2)} off`
                                                }
                                            </p>
                                        </>
                                    )}
                                    <p className="font-bold text-sm text-emerald-600">
                                        Rs {calculateItemTotal(item).toFixed(2)}
                                    </p>
                                </div>
                            </div>
                        </motion.div>
                    ))}
                </AnimatePresence>

                {cartItems.length === 0 && (
                    <div className="flex flex-col items-center justify-center h-full text-gray-400">
                        <ShoppingCart className="w-16 h-16 mb-2" />
                        <p className="text-sm">Cart is empty</p>
                    </div>
                )}
            </div>
        </div>
    );
};