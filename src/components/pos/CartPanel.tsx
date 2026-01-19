import {Trash2, Minus, Plus, Edit3, Tag, X, ShoppingCart} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useEffect, useRef, useState } from 'react';
import type { CartItem } from '../../types';
import ConfirmationModal from '../modals/ConfirmationModal';

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
    const cartContainerRef = useRef<HTMLDivElement>(null);
    const [showClearConfirmation, setShowClearConfirmation] = useState(false);

    useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            if (cartItems.length === 0) return;

            // F5 - Clear cart
            if (e.key === 'F5') {
                e.preventDefault();
                setShowClearConfirmation(true);
            }

            // Navigate cart items
            const cartElements = cartContainerRef.current?.querySelectorAll('[data-cart-item-id]');
            if (!cartElements) return;

            const focusedElement = document.activeElement as HTMLElement;
            const currentIndex = Array.from(cartElements).findIndex(
                el => el === focusedElement
            );

            // ArrowLeft/ArrowRight - Navigate between cart items
            if (e.key === 'ArrowLeft' && currentIndex > 0) {
                e.preventDefault();
                (cartElements[currentIndex - 1] as HTMLElement).focus();
            }

            if (e.key === 'ArrowRight' && currentIndex < cartElements.length - 1) {
                e.preventDefault();
                (cartElements[currentIndex + 1] as HTMLElement).focus();
            }

            // Edit current item (E key)
            if (e.key === 'e' || e.key === 'E') {
                if (currentIndex >= 0) {
                    e.preventDefault();
                    const itemId = Number(cartElements[currentIndex].getAttribute('data-cart-item-id'));
                    onEditItem(editingItem === itemId ? null : itemId);
                }
            }

            // Delete current item (Delete or Backspace)
            if (e.key === 'Delete' || e.key === 'Backspace') {
                if (currentIndex >= 0) {
                    e.preventDefault();
                    const itemId = Number(cartElements[currentIndex].getAttribute('data-cart-item-id'));
                    onRemoveItem(itemId);
                }
            }

            // + or = - Increase quantity
            if ((e.key === '+' || e.key === '=') && currentIndex >= 0) {
                e.preventDefault();
                const itemId = Number(cartElements[currentIndex].getAttribute('data-cart-item-id'));
                onUpdateQuantity(itemId, 1);
            }

            // - or _ - Decrease quantity
            if ((e.key === '-' || e.key === '_') && currentIndex >= 0) {
                e.preventDefault();
                const itemId = Number(cartElements[currentIndex].getAttribute('data-cart-item-id'));
                onUpdateQuantity(itemId, -1);
            }
        };

        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, [cartItems, editingItem, onRemoveItem, onUpdateQuantity, onEditItem]);

    const handleConfirmClearCart = () => {
        onClearCart();
        setShowClearConfirmation(false);
    };

    return (
        <>
            <div className="col-span-5 bg-white rounded-2xl shadow-lg p-3 flex flex-col overflow-hidden">
                <div className="flex justify-between items-center mb-3">
                    <h2 className="text-lg font-bold text-gray-800">Cart Items ({itemsCount})</h2>
                    <button
                        onClick={() => setShowClearConfirmation(true)}
                        disabled={cartItems.length === 0}
                        className="flex items-center gap-1.5 px-3 py-1.5 text-sm bg-red-50 text-red-600 hover:bg-red-100 rounded-xl transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        <Trash2 className="w-3.5 h-3.5" />
                        Clear <span className="text-xs">(F5)</span>
                    </button>
                </div>

                {/* Keyboard Shortcuts Info */}
                <div className="mb-2 bg-blue-50 border border-blue-200 rounded-lg p-2 text-xs text-blue-700">
                    <strong>Shortcuts:</strong> ←→ = Navigate | E = Edit | Del = Remove | +/- = Quantity | F5 = Clear All
                </div>

                <div ref={cartContainerRef} className="overflow-y-auto flex-1">
                    {cartItems.length === 0 ? (
                        <div className="flex flex-col items-center justify-center h-full text-gray-400">
                            <ShoppingCart className="w-16 h-16 mb-2" />
                            <p className="text-sm">Cart is empty</p>
                        </div>
                    ) : (
                        <div className="min-w-full">
                            {/* Table Header */}
                            <div className="grid grid-cols-12 gap-2 px-3 py-2 bg-gradient-to-r from-emerald-50 to-emerald-100 rounded-lg mb-2 font-semibold text-xs text-gray-700 sticky top-0 z-10">
                                <div className="col-span-4">Product</div>
                                <div className="col-span-2 text-center">Price</div>
                                <div className="col-span-2 text-center">Quantity</div>
                                <div className="col-span-2 text-center">Discount</div>
                                <div className="col-span-1 text-right">Total</div>
                                <div className="col-span-1 text-center">Action</div>
                            </div>

                            {/* Table Body */}
                            <div className="space-y-1">
                                <AnimatePresence>
                                    {cartItems.map((item) => (
                                        <motion.div
                                            key={item.id}
                                            data-cart-item-id={item.id}
                                            tabIndex={0}
                                            initial={{ opacity: 0, y: -10 }}
                                            animate={{ opacity: 1, y: 0 }}
                                            exit={{ opacity: 0, x: -20 }}
                                            className={`rounded-lg border-2 transition-all focus:outline-none ${
                                                editingItem === item.id
                                                    ? 'bg-emerald-50 border-emerald-300 shadow-md'
                                                    : 'bg-gray-50 border-transparent hover:border-gray-200 focus:border-blue-400 focus:bg-blue-50'
                                            }`}
                                        >
                                            {/* Main Row */}
                                            <div className="grid grid-cols-12 gap-2 px-3 py-2 items-center text-sm">
                                                {/* Product Info */}
                                                <div className="col-span-4">
                                                    <h3 className="font-semibold text-gray-800 text-xs leading-tight mb-0.5">
                                                        {item.name}
                                                    </h3>
                                                    <div className="flex items-center gap-1.5 text-xs text-gray-500">
                                                        <Tag className="w-3 h-3 text-emerald-600" />
                                                        <span>{item.category}</span>
                                                        {item.batch && <span className="text-blue-600">• Batch: {item.batch}</span>}
                                                    </div>
                                                </div>

                                                {/* Price */}
                                                <div className="col-span-2 text-center">
                                                    {editingItem === item.id ? (
                                                        <input
                                                            type="number"
                                                            value={item.price}
                                                            onChange={(e) => onUpdatePrice(item.id, Number(e.target.value))}
                                                            className="w-full px-2 py-1 text-xs bg-white border-2 border-emerald-300 rounded-lg focus:outline-none text-center"
                                                            step="0.01"
                                                            min="0"
                                                        />
                                                    ) : (
                                                        <div>
                                                            <p className="font-semibold text-gray-800">Rs {item.price.toFixed(2)}</p>
                                                            {billingMode === 'wholesale' && (
                                                                <p className="text-xs text-emerald-600">Wholesale</p>
                                                            )}
                                                        </div>
                                                    )}
                                                </div>

                                                {/* Quantity */}
                                                <div className="col-span-2 flex justify-center">
                                                    <div className="flex items-center gap-1 bg-white border-2 border-gray-200 rounded-lg p-0.5">
                                                        <button
                                                            onClick={() => onUpdateQuantity(item.id, -1)}
                                                            className="p-1 bg-gray-100 hover:bg-emerald-500 hover:text-white rounded transition-colors"
                                                        >
                                                            <Minus className="w-3 h-3" />
                                                        </button>
                                                        <span className="px-2 font-semibold text-xs min-w-[30px] text-center">
                                                            {item.quantity}
                                                        </span>
                                                        <button
                                                            onClick={() => onUpdateQuantity(item.id, 1)}
                                                            className="p-1 bg-gray-100 hover:bg-emerald-500 hover:text-white rounded transition-colors"
                                                        >
                                                            <Plus className="w-3 h-3" />
                                                        </button>
                                                    </div>
                                                </div>

                                                {/* Discount */}
                                                <div className="col-span-2 text-center">
                                                    {editingItem === item.id ? (
                                                        <input
                                                            type="number"
                                                            value={item.discount}
                                                            onChange={(e) => onUpdateDiscount(item.id, Number(e.target.value))}
                                                            className="w-full px-2 py-1 text-xs bg-white border-2 border-emerald-300 rounded-lg focus:outline-none text-center"
                                                            step="0.01"
                                                            min="0"
                                                            max={item.discountType === 'percentage' ? 100 : undefined}
                                                        />
                                                    ) : item.discount > 0 ? (
                                                        <span className="text-xs text-red-600 font-medium">
                                                            {item.discountType === 'percentage'
                                                                ? `-${item.discount}%`
                                                                : `-Rs ${item.discount.toFixed(2)}`
                                                            }
                                                        </span>
                                                    ) : (
                                                        <span className="text-xs text-gray-400">-</span>
                                                    )}
                                                </div>

                                                {/* Total */}
                                                <div className="col-span-1 text-right">
                                                    <p className="font-bold text-emerald-600 text-xs">
                                                        Rs {calculateItemTotal(item).toFixed(2)}
                                                    </p>
                                                </div>

                                                {/* Actions */}
                                                <div className="col-span-1 flex justify-center gap-1">
                                                    <button
                                                        onClick={() => onEditItem(editingItem === item.id ? null : item.id)}
                                                        className={`p-1 rounded-lg transition-colors ${
                                                            editingItem === item.id
                                                                ? 'bg-emerald-500 text-white'
                                                                : 'bg-emerald-50 text-emerald-600 hover:bg-emerald-100'
                                                        }`}
                                                        title="Edit (E)"
                                                    >
                                                        <Edit3 className="w-3 h-3" />
                                                    </button>
                                                    <button
                                                        onClick={() => onRemoveItem(item.id)}
                                                        className="p-1 bg-red-50 text-red-600 hover:bg-red-100 rounded-lg transition-colors"
                                                        title="Remove (Del)"
                                                    >
                                                        <X className="w-3 h-3" />
                                                    </button>
                                                </div>
                                            </div>

                                            {/* Expanded Edit Section */}
                                            {editingItem === item.id && (
                                                <motion.div
                                                    initial={{ height: 0, opacity: 0 }}
                                                    animate={{ height: 'auto', opacity: 1 }}
                                                    exit={{ height: 0, opacity: 0 }}
                                                    className="border-t-2 border-emerald-200 px-3 py-2 bg-white"
                                                >
                                                    <div className="flex items-center gap-2 mb-2">
                                                        <button
                                                            onClick={() => onUpdateDiscountType(item.id, 'percentage')}
                                                            className={`flex-1 px-3 py-1.5 text-xs rounded-lg transition-colors ${
                                                                item.discountType === 'percentage'
                                                                    ? 'bg-emerald-500 text-white'
                                                                    : 'bg-gray-200 text-gray-600 hover:bg-gray-300'
                                                            }`}
                                                        >Percentage (%)
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
                                                    <div className="text-xs text-gray-600 bg-emerald-50 px-2 py-1 rounded">
                                                        <strong>Unit Price:</strong> Rs {item.price} × <strong>Qty:</strong> {item.quantity} =
                                                        <strong className="text-emerald-600"> Rs {(item.price * item.quantity).toFixed(2)}</strong>
                                                    </div>
                                                </motion.div>
                                            )}
                                        </motion.div>
                                    ))}
                                </AnimatePresence>
                            </div>
                        </div>
                    )}
                </div>
            </div>

            <ConfirmationModal
                isOpen={showClearConfirmation}
                title="Clear Entire Cart?"
                message={`Are you sure you want to clear all ${itemsCount} item${itemsCount !== 1 ? 's' : ''} from the cart? This action cannot be undone.`}
                itemName={`${itemsCount} item${itemsCount !== 1 ? 's' : ''}`}
                itemType="cart items"
                onConfirm={handleConfirmClearCart}
                onCancel={() => setShowClearConfirmation(false)}
                confirmButtonText="Clear Cart"
                cancelButtonText="Cancel"
                isDanger={true}
            />
        </>
    );
};