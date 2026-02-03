import { Trash2, Edit3, ShoppingCart, Percent, DollarSign, Package } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useEffect, useRef, useState } from 'react';
import type { CartItem } from '../../types';
import ConfirmationModal from '../modals/ConfirmationModal';
import { CartItemEditModal } from '../models/CartItemEditModal';

interface CartPanelProps {
    cartItems: CartItem[];
    itemsCount: number;
    billingMode: 'retail' | 'wholesale';
    onClearCart: () => void;
    onRemoveItem: (id: number) => void;
    onUpdateItem: (
        id: number,
        quantity: number,
        price: number,
        discount: number,
        discountType: 'percentage' | 'price'
    ) => void;
    calculateItemTotal: (item: CartItem) => number;
}

export const CartPanel = ({
    cartItems,
    itemsCount,
    billingMode,
    onClearCart,
    onRemoveItem,
    onUpdateItem,
    calculateItemTotal
}: CartPanelProps) => {
    const cartContainerRef = useRef<HTMLDivElement>(null);
    const [showClearConfirmation, setShowClearConfirmation] = useState(false);
    const [editingItem, setEditingItem] = useState<CartItem | null>(null);
    const [showEditModal, setShowEditModal] = useState(false);

    useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            if (cartItems.length === 0) return;

            if (e.key === 'F5') {
                e.preventDefault();
                setShowClearConfirmation(true);
            }

            const cartElements = cartContainerRef.current?.querySelectorAll('[data-cart-item-id]');
            if (!cartElements) return;

            const focusedElement = document.activeElement as HTMLElement;
            const currentIndex = Array.from(cartElements).findIndex(
                el => el === focusedElement
            );

            if (e.key === 'ArrowLeft' && currentIndex > 0) {
                e.preventDefault();
                (cartElements[currentIndex - 1] as HTMLElement).focus();
            }

            if (e.key === 'ArrowRight' && currentIndex < cartElements.length - 1) {
                e.preventDefault();
                (cartElements[currentIndex + 1] as HTMLElement).focus();
            }

            if (e.key === 'e' || e.key === 'E' || e.key === 'Enter' || e.key === ' ') {
                if (currentIndex >= 0) {
                    e.preventDefault();
                    const itemId = Number(cartElements[currentIndex].getAttribute('data-cart-item-id'));
                    const item = cartItems.find(i => i.id === itemId);
                    if (item) {
                        setEditingItem(item);
                        setShowEditModal(true);
                    }
                }
            }

            if (e.key === 'Delete' || e.key === 'Backspace') {
                if (currentIndex >= 0) {
                    e.preventDefault();
                    const itemId = Number(cartElements[currentIndex].getAttribute('data-cart-item-id'));
                    onRemoveItem(itemId);
                }
            }
        };

        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, [cartItems, onRemoveItem]);

    const handleConfirmClearCart = () => {
        onClearCart();
        setShowClearConfirmation(false);
    };

    const handleEditClick = (item: CartItem) => {
        setEditingItem(item);
        setShowEditModal(true);
    };

    return (
        <>
            <div className="col-span-5 bg-gradient-to-br from-gray-50 to-white rounded-2xl p-4 flex flex-col overflow-hidden border border-gray-200">
                {/* Header */}
                <div className="flex justify-between items-center mb-3 pb-3 border-b border-gray-200">
                    <div className="flex items-center gap-2">
                        <div className="p-2 bg-gradient-to-br from-emerald-500 to-blue-500 rounded-lg">
                            <ShoppingCart className="w-5 h-5 text-white" />
                        </div>
                        <div>
                            <h2 className="text-xl font-bold text-gray-800">Cart Items</h2>
                            <p className="text-xs text-gray-500">{itemsCount} {itemsCount === 1 ? 'item' : 'items'} in cart</p>
                        </div>
                    </div>
                    <button
                        onClick={() => setShowClearConfirmation(true)}
                        disabled={cartItems.length === 0}
                        className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-red-500 to-red-600 hover:from-red-600 hover:to-red-700 text-white rounded-lg transition-all shadow-md hover:shadow-lg disabled:opacity-50 disabled:cursor-not-allowed disabled:from-gray-300 disabled:to-gray-400"
                    >
                        <Trash2 className="w-4 h-4" />
                        <span className="font-semibold text-sm">Clear</span>
                        <span className="text-xs opacity-75">(F5)</span>
                    </button>
                </div>

                {/* Shortcuts Info */}
                <div className="mb-3 bg-gradient-to-r from-blue-50 to-emerald-50 border border-blue-200 rounded-lg p-2.5 text-xs text-blue-700">
                    <strong className="font-bold">⌨️ Shortcuts:</strong>
                    <span className="ml-2">←→ Navigate</span> •
                    <span className="ml-1">E Edit</span> •
                    <span className="ml-1">Del Remove</span> •
                    <span className="ml-1">F5 Clear</span>
                </div>

                {/* Cart Items Container */}
                <div ref={cartContainerRef} className="overflow-y-auto flex-1 pr-1">
                    {cartItems.length === 0 ? (
                        <div className="flex flex-col items-center justify-center h-full text-gray-400">
                            <div className="p-6 bg-gray-100 rounded-full mb-4">
                                <ShoppingCart className="w-16 h-16" />
                            </div>
                            <p className="text-lg font-semibold text-gray-500">Your cart is empty</p>
                            <p className="text-sm text-gray-400 mt-1">Add products to get started</p>
                        </div>
                    ) : (<div className="space-y-2">
                        <AnimatePresence>
                            {cartItems.map((item, index) => {
                                const subtotal = item.price * item.quantity;
                                const itemDiscountAmount = billingMode === 'retail'
                                    ? (item.discountType === 'percentage'
                                        ? (subtotal * item.discount) / 100
                                        : item.discount)
                                    : 0;
                                const itemTotal = calculateItemTotal(item);

                                return (
                                    <motion.div
                                        key={item.id}
                                        data-cart-item-id={item.id}
                                        tabIndex={0}
                                        initial={{ opacity: 0, y: -10 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        exit={{ opacity: 0, x: -100 }}
                                        className="group relative bg-white hover:bg-gradient-to-r hover:from-emerald-50 hover:to-blue-50 rounded-xl border-2 border-gray-200 hover:border-emerald-300 transition-all cursor-pointer focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 overflow-hidden"
                                    >
                                        {/* Item Number Badge */}
                                        <div className="absolute top-2 left-2 w-7 h-7 bg-gradient-to-br from-gray-700 to-gray-900 text-white rounded-full flex items-center justify-center text-xs font-bold shadow-md">
                                            {index + 1}
                                        </div>

                                        <div className="p-3 pl-11">
                                            {/* Product Header */}
                                            <div className="flex justify-between items-start mb-2">
                                                <div className="flex-1 min-w-0 pr-2">
                                                    <h3 className="font-bold text-base text-gray-800 truncate flex items-center gap-2">
                                                        <Package className="w-4 h-4 text-emerald-600 flex-shrink-0" />
                                                        {item.name}
                                                    </h3>
                                                    <div className="flex items-center gap-2 mt-1 flex-wrap">
                                                        <span className="px-2 py-0.5 bg-gradient-to-r from-blue-500 to-blue-600 text-white text-xs rounded-md font-semibold shadow-sm">
                                                            {item.productCode}
                                                        </span>
                                                        <span className="px-2 py-0.5 bg-gray-100 text-gray-700 text-xs rounded-md font-medium">
                                                            {item.category}
                                                        </span>
                                                        {item.batch && (
                                                            <span className="px-2 py-0.5 bg-gradient-to-r from-amber-400 to-amber-500 text-white text-xs rounded-md font-semibold shadow-sm">
                                                                Batch: {item.batch}
                                                            </span>
                                                        )}
                                                    </div>
                                                </div>

                                                {/* Action Buttons */}
                                                <div className="flex items-center gap-1 flex-shrink-0">
                                                    <button
                                                        onClick={(e) => {
                                                            e.stopPropagation();
                                                            handleEditClick(item);
                                                        }}
                                                        className="p-2 hover:bg-blue-100 text-blue-600 rounded-lg transition-all hover:scale-110"
                                                        title="Edit (E)"
                                                    >
                                                        <Edit3 className="w-4 h-4" />
                                                    </button>
                                                    <button
                                                        onClick={(e) => {
                                                            e.stopPropagation();
                                                            onRemoveItem(item.id);
                                                        }}
                                                        className="p-2 hover:bg-red-100 text-red-600 rounded-lg transition-all hover:scale-110"
                                                        title="Delete (Del)"
                                                    >
                                                        <Trash2 className="w-4 h-4" />
                                                    </button>
                                                </div>
                                            </div>

                                            {/* Price Details Grid */}
                                            <div className="grid grid-cols-4 gap-2 mt-3 pt-3 border-t border-gray-200">
                                                {/* Unit Price */}
                                                <div className="text-center">
                                                    <p className="text-xs text-gray-500 font-medium mb-1">Unit Price</p>
                                                    <p className="text-sm font-bold text-gray-800">
                                                        Rs {item.price.toFixed(2)}
                                                    </p>
                                                </div>

                                                {/* Quantity */}
                                                <div className="text-center">
                                                    <p className="text-xs text-gray-500 font-medium mb-1">Quantity</p>
                                                    <div className="inline-flex items-center justify-center px-3 py-1 bg-gradient-to-r from-blue-500 to-blue-600 text-white rounded-full text-sm font-bold shadow-md">
                                                        × {item.quantity}
                                                    </div>
                                                </div>

                                                {/* Discount */}
                                                <div className="text-center">
                                                    <p className="text-xs text-gray-500 font-medium mb-1">Discount</p>
                                                    {billingMode === 'retail' && item.discount > 0 ? (
                                                        <div className="flex flex-col items-center">
                                                            <div className="flex items-center gap-1 text-sm text-red-600 font-bold">
                                                                {item.discountType === 'percentage' ? (
                                                                    <>
                                                                        <Percent className="w-3 h-3" />
                                                                        {item.discount.toFixed(1)}%
                                                                    </>
                                                                ) : (
                                                                    <>
                                                                        <DollarSign className="w-3 h-3" />
                                                                        {item.discount.toFixed(2)}
                                                                    </>
                                                                )}
                                                            </div>
                                                            <span className="text-xs text-red-500 font-semibold">
                                                                -Rs {itemDiscountAmount.toFixed(2)}
                                                            </span>
                                                        </div>
                                                    ) : (
                                                        <span className="text-xs text-gray-400 font-medium">—</span>
                                                    )}
                                                </div>

                                                {/* Total */}
                                                <div className="text-center">
                                                    <p className="text-xs text-gray-500 font-medium mb-1">Total</p>
                                                    <p className="text-base font-bold bg-gradient-to-r from-emerald-600 to-green-600 bg-clip-text text-transparent">
                                                        Rs {itemTotal.toFixed(2)}
                                                    </p>
                                                </div>
                                            </div>

                                            {/* Subtotal Info (if discount exists) */}
                                            {billingMode === 'retail' && item.discount > 0 && (
                                                <div className="mt-2 pt-2 border-t border-gray-100 flex justify-between text-xs">
                                                    <span className="text-gray-500">Subtotal:</span>
                                                    <span className="text-gray-600 font-semibold line-through">
                                                        Rs {subtotal.toFixed(2)}
                                                    </span>
                                                </div>
                                            )}
                                        </div>

                                        {/* Hover Effect Border */}
                                        <div className="absolute inset-0 border-2 border-transparent group-hover:border-emerald-400 rounded-xl pointer-events-none transition-all"></div>
                                    </motion.div>
                                );
                            })}
                        </AnimatePresence>
                    </div>
                    )}
                </div>
            </div><CartItemEditModal
                isOpen={showEditModal}
                onClose={() => {
                    setShowEditModal(false);
                    setEditingItem(null);
                }}
                item={editingItem}
                billingMode={billingMode}
                onUpdate={onUpdateItem}
            />

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