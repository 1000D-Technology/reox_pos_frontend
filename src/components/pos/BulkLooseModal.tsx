import { motion, AnimatePresence } from 'framer-motion';
import { X, Package, Plus, Minus, ArrowRightLeft, Check } from 'lucide-react';
import { useState } from 'react';
import { posService } from '../../services/posService';
import toast from 'react-hot-toast';

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

interface BulkLooseModalProps {
    isOpen: boolean;
    onClose: () => void;
    products: Product[];
}

interface SelectOption {
    id: number;
    label: string;
    product: Product;
}

export const BulkLooseModal = ({ isOpen, onClose, products }: BulkLooseModalProps) => {
    const [selectedBulkProduct, setSelectedBulkProduct] = useState<Product | null>(null);
    const [selectedLooseProduct, setSelectedLooseProduct] = useState<Product | null>(null);
    const [bulkQuantity, setBulkQuantity] = useState(1);
    const [looseQuantity, setLooseQuantity] = useState(1);
    const [isTransferring, setIsTransferring] = useState(false);
    const [transferComplete, setTransferComplete] = useState(false);

    const bulkProducts = products.filter(p => p.isBulk);
    const looseProducts = products;

    const bulkProductOptions: SelectOption[] = bulkProducts.map(p => ({
        id: p.id,
        label: `${p.name} (${p.productCode})`,
        product: p
    }));

    const looseProductOptions: SelectOption[] = looseProducts.map(p => ({
        id: p.id,
        label: `${p.name} (${p.productCode})`,
        product: p
    }));

    const handleBulkLooseTransfer = async () => {
        if (!selectedBulkProduct || !selectedLooseProduct) return;

        if (bulkQuantity <= 0 || looseQuantity <= 0) {
            toast.error('Quantities must be greater than 0');
            return;
        }

        setIsTransferring(true);
        try {
            const totalLooseToAdd = bulkQuantity * looseQuantity;
            const response = await posService.convertBulkToLoose({
                bulkStockId: selectedBulkProduct.id,
                looseStockId: selectedLooseProduct.id,
                deductQty: bulkQuantity,
                addQty: totalLooseToAdd
            });

            if (response.data?.success) {
                setTransferComplete(true);
                toast.success('Stock transferred successfully!');

                setTimeout(() => {
                    setTransferComplete(false);
                    setSelectedBulkProduct(null);
                    setSelectedLooseProduct(null);
                    setBulkQuantity(1);
                    setLooseQuantity(1);
                    onClose();
                    window.location.reload(); // Simple way to refresh data for now
                }, 1500);
            }
        } catch (error: any) {
            console.error('Transfer failed:', error);
            const msg = error.response?.data?.message || 'Transfer failed';
            toast.error(msg);
        } finally {
            setIsTransferring(false);
        }
    };

    const handleClose = () => {
        if (!isTransferring) {
            setSelectedBulkProduct(null);
            setSelectedLooseProduct(null);
            setBulkQuantity(1);
            setLooseQuantity(1);
            setTransferComplete(false);
            onClose();
        }
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
                        className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto"
                        onClick={(e) => e.stopPropagation()}
                    >
                        {/* Header */}
                        <div className="sticky top-0 bg-linear-to-r from-purple-600 to-purple-700 text-white p-4 rounded-t-2xl flex items-center justify-between">
                            <div className="flex items-center gap-3">
                                <ArrowRightLeft className="w-6 h-6" />
                                <div>
                                    <h2 className="text-xl font-bold">Bulk to Loose Conversion</h2>
                                    <p className="text-sm text-purple-100">Transfer bulk products to loose items</p>
                                </div>
                            </div>
                            <button
                                onClick={handleClose}
                                className="p-2 hover:bg-purple-500 rounded-lg transition-colors"
                                disabled={isTransferring}
                            >
                                <X className="w-5 h-5" />
                            </button>
                        </div>

                        <div className="p-6 space-y-6">
                            {/* Bulk Product Selection */}
                            <div className="space-y-3">
                                <label className="flex items-center gap-2 text-sm font-semibold text-gray-700">
                                    <Package className="w-4 h-4 text-purple-600" />
                                    Select Bulk Product (Source)
                                </label>
                                <select
                                    value={selectedBulkProduct?.id || ''}
                                    onChange={(e) => {
                                        const product = bulkProducts.find(p => p.id === Number(e.target.value));
                                        setSelectedBulkProduct(product || null);
                                    }}
                                    disabled={isTransferring}
                                    className="w-full px-4 py-2 border-2 border-gray-200 rounded-lg focus:border-purple-400 focus:outline-none disabled:opacity-50"
                                >
                                    <option value="">Select bulk product...</option>
                                    {bulkProductOptions.map(option => (
                                        <option key={option.id} value={option.id}>{option.label}</option>
                                    ))}
                                </select>
                                {selectedBulkProduct && (
                                    <motion.div
                                        initial={{ opacity: 0, y: -10 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        className="p-3 bg-purple-50 border-2 border-purple-200 rounded-lg"
                                    >
                                        <div className="flex items-center justify-between">
                                            <div>
                                                <p className="font-semibold text-purple-800">{selectedBulkProduct.name}</p>
                                                <p className="text-sm text-purple-600">{selectedBulkProduct.category}</p>
                                            </div>
                                            <div className="text-right">
                                                <p className="text-sm text-gray-600">Stock: {selectedBulkProduct.stock}</p>
                                                <p className="font-bold text-purple-700">Rs {selectedBulkProduct.price}</p>
                                            </div>
                                        </div>
                                    </motion.div>
                                )}
                            </div>

                            {/* Bulk Quantity Input */}
                            <div className="space-y-2">
                                <label className="text-sm font-semibold text-gray-700">Bulk Quantity</label>
                                <div className="flex items-center gap-2">
                                    <button
                                        onClick={() => setBulkQuantity(Math.max(0, bulkQuantity - 1))}
                                        disabled={isTransferring || !selectedBulkProduct}
                                        className="p-2 bg-purple-100 text-purple-700 rounded-lg hover:bg-purple-200 disabled:opacity-50 disabled:cursor-not-allowed"
                                    >
                                        <Minus className="w-4 h-4" />
                                    </button>
                                    <input
                                        type="number"
                                        value={bulkQuantity}
                                        onChange={(e) => setBulkQuantity(Math.max(0, parseInt(e.target.value) || 0))}
                                        disabled={isTransferring || !selectedBulkProduct}
                                        className="flex-1 px-4 py-2 text-center text-lg font-semibold border-2 border-gray-200 rounded-lg focus:border-purple-400 focus:outline-none disabled:opacity-50"
                                    />
                                    <button
                                        onClick={() => setBulkQuantity(bulkQuantity + 1)}
                                        disabled={isTransferring || !selectedBulkProduct}
                                        className="p-2 bg-purple-100 text-purple-700 rounded-lg hover:bg-purple-200 disabled:opacity-50 disabled:cursor-not-allowed"
                                    >
                                        <Plus className="w-4 h-4" />
                                    </button>
                                </div>
                            </div>

                            {/* Transfer Animation */}
                            <div className="relative py-6">
                                <div className="flex items-center justify-center gap-4">
                                    <motion.div
                                        animate={isTransferring ? { x: [0, 60, 0] } : {}}
                                        transition={{ repeat: Infinity, duration: 1 }}
                                        className="text-purple-600"
                                    >
                                        <Package className="w-8 h-8" />
                                    </motion.div>
                                    <ArrowRightLeft className={`w-6 h-6 ${isTransferring ? 'text-purple-600 animate-pulse' : 'text-gray-400'}`} />
                                    <Package className={`w-6 h-6 ${isTransferring ? 'text-emerald-600' : 'text-gray-400'}`} />
                                </div>
                                {transferComplete && (
                                    <motion.div
                                        initial={{ scale: 0 }}
                                        animate={{ scale: 1 }}
                                        className="absolute inset-0 flex items-center justify-center"
                                    >
                                        <div className="bg-emerald-100 text-emerald-700 rounded-full p-3">
                                            <Check className="w-8 h-8" />
                                        </div>
                                    </motion.div>
                                )}
                            </div>

                            {/* Loose Product Selection */}
                            <div className="space-y-3">
                                <label className="flex items-center gap-2 text-sm font-semibold text-gray-700">
                                    <Package className="w-4 h-4 text-emerald-600" />
                                    Select Loose Product (Destination)
                                </label>
                                <select
                                    value={selectedLooseProduct?.id || ''}
                                    onChange={(e) => {
                                        const product = looseProducts.find(p => p.id === Number(e.target.value));
                                        setSelectedLooseProduct(product || null);
                                    }}
                                    disabled={isTransferring}
                                    className="w-full px-4 py-2 border-2 border-gray-200 rounded-lg focus:border-emerald-400 focus:outline-none disabled:opacity-50"
                                >
                                    <option value="">Select loose product...</option>
                                    {looseProductOptions.map(option => (
                                        <option key={option.id} value={option.id}>{option.label}</option>
                                    ))}
                                </select>
                                {selectedLooseProduct && (
                                    <motion.div
                                        initial={{ opacity: 0, y: -10 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        className="p-3 bg-emerald-50 border-2 border-emerald-200 rounded-lg"
                                    >
                                        <div className="flex items-center justify-between">
                                            <div>
                                                <p className="font-semibold text-emerald-800">{selectedLooseProduct.name}</p>
                                                <p className="text-sm text-emerald-600">{selectedLooseProduct.category}</p>
                                            </div>
                                            <div className="text-right">
                                                <p className="text-sm text-gray-600">Stock: {selectedLooseProduct.stock}</p>
                                                <p className="font-bold text-emerald-700">Rs {selectedLooseProduct.price}</p>
                                            </div>
                                        </div>
                                    </motion.div>
                                )}
                            </div>

                            {/* Loose Quantity Input */}
                            <div className="space-y-2">
                                <label className="text-sm font-semibold text-gray-700">Loose Quantity (per bulk unit)</label>
                                <div className="flex items-center gap-2">
                                    <button
                                        onClick={() => setLooseQuantity(Math.max(0, looseQuantity - 1))}
                                        disabled={isTransferring || !selectedLooseProduct}
                                        className="p-2 bg-emerald-100 text-emerald-700 rounded-lg hover:bg-emerald-200 disabled:opacity-50 disabled:cursor-not-allowed"
                                    >
                                        <Minus className="w-4 h-4" />
                                    </button>
                                    <input
                                        type="number"
                                        value={looseQuantity}
                                        onChange={(e) => setLooseQuantity(Math.max(0, parseInt(e.target.value) || 0))}
                                        disabled={isTransferring || !selectedLooseProduct}
                                        className="flex-1 px-4 py-2 text-center text-lg font-semibold border-2 border-gray-200 rounded-lg focus:border-emerald-400 focus:outline-none disabled:opacity-50"
                                    />
                                    <button
                                        onClick={() => setLooseQuantity(looseQuantity + 1)}
                                        disabled={isTransferring || !selectedLooseProduct}
                                        className="p-2 bg-emerald-100 text-emerald-700 rounded-lg hover:bg-emerald-200 disabled:opacity-50 disabled:cursor-not-allowed"
                                    >
                                        <Plus className="w-4 h-4" />
                                    </button>
                                </div>
                                <p className="text-sm text-gray-600 text-center">
                                    Total: {bulkQuantity} × {looseQuantity} = <span className="font-bold text-emerald-700">{bulkQuantity * looseQuantity}</span> loose units
                                </p>
                            </div>

                            {/* Transfer Button */}
                            <button
                                onClick={handleBulkLooseTransfer}
                                disabled={!selectedBulkProduct || !selectedLooseProduct || isTransferring || transferComplete}
                                className="w-full py-3 bg-linear-to-r from-purple-600 to-emerald-600 text-white font-semibold rounded-xl hover:from-purple-700 hover:to-emerald-700 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                            >
                                {isTransferring ? (
                                    <>
                                        <motion.div
                                            animate={{ rotate: 360 }}
                                            transition={{ repeat: Infinity, duration: 1, ease: "linear" }}
                                        >
                                            <ArrowRightLeft className="w-5 h-5" />
                                        </motion.div>
                                        Processing Transfer...
                                    </>
                                ) : transferComplete ? (
                                    <>
                                        <Check className="w-5 h-5" />
                                        Transfer Complete!
                                    </>
                                ) : (
                                    <>
                                        <ArrowRightLeft className="w-5 h-5" />
                                        Transfer Bulk to Loose
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