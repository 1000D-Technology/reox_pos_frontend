import { motion, AnimatePresence } from 'framer-motion';
import { X, Package, Plus, Minus, ArrowRightLeft, Check, Search, Loader2 } from 'lucide-react';
import { useState, useEffect, useMemo } from 'react';
import { posService } from '../../services/posService';
import toast from 'react-hot-toast';
import CustomConfirmModal from '../common/CustomConfirmModal';

interface Product {
    id: number;
    variationID?: number;
    stockID?: number;
    name: string;
    barcode: string;
    price: number;
    wholesalePrice?: number;
    stock: number;
    category: string;
    productCode: string;
    isBulk: boolean;
}

interface BulkLooseModalProps {
    isOpen: boolean;
    onClose: () => void;
}

export const BulkLooseModal = ({ isOpen, onClose }: BulkLooseModalProps) => {
    const [availableStock, setAvailableStock] = useState<Product[]>([]);
    const [allProductVariants, setAllProductVariants] = useState<Product[]>([]);
    const [loading, setLoading] = useState(false);
    const [selectedBulkProduct, setSelectedBulkProduct] = useState<Product | null>(null);
    const [selectedLooseProduct, setSelectedLooseProduct] = useState<Product | null>(null);
    const [bulkQuantity, setBulkQuantity] = useState(1);
    const [looseQuantity, setLooseQuantity] = useState(1);
    const [isTransferring, setIsTransferring] = useState(false);
    const [transferComplete, setTransferComplete] = useState(false);
    
    // Search states
    const [bulkSearch, setBulkSearch] = useState('');
    const [looseSearch, setLooseSearch] = useState('');
    const [isSearchingBulk, setIsSearchingBulk] = useState(false);
    const [bulkSearchResults, setBulkSearchResults] = useState<Product[]>([]);

    useEffect(() => {
        if (isOpen) {
            loadInitialData();
        }
    }, [isOpen]);

    const loadInitialData = async () => {
        try {
            setLoading(true);
            
            // Initial load of some stock items for source
            const availableRes = await posService.getPOSProductsList();
            if (availableRes.data?.success && Array.isArray(availableRes.data.data)) {
                setAvailableStock(availableRes.data.data.map(mapAPIItemToProduct));
            }

            // 2. Load All Product Variations (Destination selection)
            const allRes = await posService.getAllProductsList();
            if (allRes.data?.success && Array.isArray(allRes.data.data)) {
                setAllProductVariants(allRes.data.data.map(mapAPIItemToProduct));
            }
        } catch (error) {
            console.error('Failed to load conversion data:', error);
            toast.error('Inventory load failed');
        } finally {
            setLoading(false);
        }
    };

    const mapAPIItemToProduct = (p: any): Product => {
        const isFromStock = !!(p.stockID || p.stock_id);
        
        return {
            id: p.stockID || p.stock_id || p.id,
            stockID: p.stockID || p.stock_id || p.id,
            // If from stock table, use variationID. If from product table, productID IS the variation ID.
            variationID: isFromStock ? (p.variationID || p.product_variations_id) : p.productID,
            name: p.productName || p.displayName || p.name,
            barcode: p.barcode,
            price: parseFloat(p.Price || p.price || p.selling_price || 0),
            stock: parseFloat(p.stockQty || p.stock || p.currentStock || p.qty || 0),
            category: p.category || '',
            // If from stock table, productID is the code. If from product table, use productCode.
            productCode: isFromStock ? p.productID : (p.productCode || p.product_code),
            isBulk: p.isBulk === true || 
                    String(p.unit || '').toLowerCase().includes('kg') || 
                    String(p.unit || '').toLowerCase().includes('bag')
        };
    };

    // Handle Source Search via API
    useEffect(() => {
        if (!bulkSearch.trim()) {
            setBulkSearchResults([]);
            return;
        }

        const delayDebounceFn = setTimeout(async () => {
            try {
                setIsSearchingBulk(true);
                const response = await posService.searchProducts(bulkSearch);
                if (response.data.success) {
                    setBulkSearchResults(response.data.data.map(mapAPIItemToProduct));
                }
            } catch (error) {
                console.error("Source Search Error:", error);
            } finally {
                setIsSearchingBulk(false);
            }
        }, 500);

        return () => clearTimeout(delayDebounceFn);
    }, [bulkSearch]);

    const filteredBulkDisplay = useMemo(() => {
        // If searching, show API results. If empty search, show initial available stock.
        const sourceList = bulkSearch.trim() ? bulkSearchResults : availableStock;
        
        return sourceList.filter(p => p.stock > 0).slice(0, 10);
    }, [availableStock, bulkSearchResults, bulkSearch]);

    const filteredLoose = useMemo(() => {
        return allProductVariants.filter(p => 
            (p.name.toLowerCase().includes(looseSearch.toLowerCase()) || 
             p.productCode.toLowerCase().includes(looseSearch.toLowerCase()))
        ).slice(0, 10);
    }, [allProductVariants, looseSearch]);

    const [showConfirmModal, setShowConfirmModal] = useState(false);

    const handleBulkLooseTransfer = async () => {
        setIsTransferring(true);
        try {
            const totalLooseToAdd = bulkQuantity * looseQuantity;
            const response = await posService.convertBulkToLoose({
                bulkStockId: selectedBulkProduct!.stockID!,
                looseVariationId: selectedLooseProduct!.variationID!,
                deductQty: bulkQuantity,
                addQty: totalLooseToAdd
            });

            if (response.data?.success) {
                setTransferComplete(true);
                toast.success('Conversion Successful!');
                setTimeout(() => {
                    handleClose();
                    window.location.reload();
                }, 1500);
            }
        } catch (error: any) {
            const msg = error.response?.data?.message || 'Transfer failed';
            toast.error(msg);
            setShowConfirmModal(false);
        } finally {
            setIsTransferring(false);
        }
    };

    const handleInitialTransferClick = () => {
        if (!selectedBulkProduct || !selectedLooseProduct) {
            toast.error('Please select both items');
            return;
        }

        if (bulkQuantity <= 0 || looseQuantity <= 0) {
            toast.error('Invalid quantity');
            return;
        }

        setShowConfirmModal(true);
    };

    const handleClose = () => {
        if (!isTransferring) {
            setSelectedBulkProduct(null);
            setSelectedLooseProduct(null);
            setBulkQuantity(1);
            setLooseQuantity(1);
            setTransferComplete(false);
            setBulkSearch('');
            setLooseSearch('');
            setShowConfirmModal(false);
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
                    className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4"
                    onClick={handleClose}
                >
                    <motion.div
                        initial={{ scale: 0.95, y: 20, opacity: 0 }}
                        animate={{ scale: 1, y: 0, opacity: 1 }}
                        exit={{ scale: 0.95, y: 20, opacity: 0 }}
                        className="bg-white rounded-3xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-hidden flex flex-col"
                        onClick={(e) => e.stopPropagation()}
                    >
                        {/* Header */}
                        <div className="bg-gradient-to-r from-indigo-600 to-indigo-800 text-white p-6 rounded-t-3xl flex items-center justify-between">
                            <div className="flex items-center gap-4">
                                <div className="p-3 bg-white/20 rounded-2xl backdrop-blur-md">
                                    <ArrowRightLeft className="w-6 h-6" />
                                </div>
                                <div>
                                    <h2 className="text-2xl font-black tracking-tight">Bulk Conversion</h2>
                                    <p className="text-indigo-100/80 text-sm font-medium">Split stock from current batches</p>
                                </div>
                            </div>
                            <button
                                onClick={handleClose}
                                className="p-2 hover:bg-white/10 rounded-xl transition-colors"
                                disabled={isTransferring}
                            >
                                <X className="w-6 h-6" />
                            </button>
                        </div>

                        <div className="p-6 overflow-y-auto space-y-8">
                            {loading ? (
                                <div className="py-20 flex flex-col items-center justify-center gap-4">
                                    <Loader2 className="w-12 h-12 text-indigo-600 animate-spin" />
                                    <p className="text-gray-500 font-bold animate-pulse">Scanning Inventory...</p>
                                </div>
                            ) : (
                                <>
                                    {/* SOURCE (AVAILABLE BULK STOCK) */}
                                    <div className="space-y-4">
                                        <div className="flex justify-between items-end">
                                            <label className="text-xs font-black uppercase text-gray-400 tracking-widest flex items-center gap-2">
                                                <div className="w-2 h-2 rounded-full bg-indigo-500" />
                                                Source Stock (Available)
                                            </label>
                                            {selectedBulkProduct && (
                                                <span className="text-[10px] font-bold px-2 py-0.5 bg-indigo-50 text-indigo-600 rounded-full border border-indigo-100">
                                                    In Stock: {selectedBulkProduct.stock}
                                                </span>
                                            )}
                                        </div>
                                        
                                        {!selectedBulkProduct ? (
                                            <div className="relative group">
                                                <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-300 group-focus-within:text-indigo-500 transition-colors" />
                                                <input
                                                    type="text"
                                                    value={bulkSearch}
                                                    onChange={(e) => setBulkSearch(e.target.value)}
                                                    placeholder="Search current stock (name, code, barcode)..."
                                                    className="w-full pl-12 pr-12 py-4 bg-gray-50 border-2 border-gray-100 rounded-2xl focus:bg-white focus:border-indigo-500 focus:outline-none transition-all font-semibold"
                                                />
                                                {isSearchingBulk && (
                                                    <Loader2 className="absolute right-4 top-1/2 -translate-y-1/2 w-5 h-5 text-indigo-500 animate-spin" />
                                                )}
                                                {bulkSearch && (
                                                    <div className="absolute top-full left-0 right-0 mt-2 bg-white border-2 border-gray-100 rounded-2xl shadow-xl z-20 overflow-hidden animate-in fade-in slide-in-from-top-2">
                                                        {filteredBulkDisplay.length > 0 ? filteredBulkDisplay.map(p => (
                                                            <button
                                                                key={`${p.stockID}-${p.barcode}`}
                                                                onClick={() => {
                                                                    setSelectedBulkProduct(p);
                                                                    setBulkSearch('');
                                                                }}
                                                                className="w-full text-left p-4 hover:bg-indigo-50 flex items-center justify-between border-b last:border-0 border-gray-50 transition-colors"
                                                            >
                                                                <div>
                                                                    <div className="flex items-center gap-2">
                                                                        <div className="font-bold text-gray-800">{p.name}</div>
                                                                        {p.isBulk && (
                                                                            <span className="text-[10px] px-1.5 py-0.5 bg-purple-100 text-purple-700 rounded-md font-black uppercase">Bulk</span>
                                                                        )}
                                                                    </div>
                                                                    <div className="text-xs text-gray-400 font-mono">{p.productCode} {p.barcode && `| ${p.barcode}`}</div>
                                                                </div>
                                                                <div className="text-right">
                                                                    <div className="text-xs font-black text-indigo-600">{p.stock} units</div>
                                                                </div>
                                                            </button>
                                                        )) : (
                                                            <div className="p-4 text-center text-gray-400 text-sm italic">
                                                                {isSearchingBulk ? 'Searching...' : 'No matching current stock found'}
                                                            </div>
                                                        )}
                                                    </div>
                                                )}
                                            </div>
                                        ) : (
                                            <div className="relative p-5 bg-indigo-50 border-2 border-indigo-200 rounded-2xl group transition-all hover:bg-indigo-100/50">
                                                <div className="flex items-center gap-4">
                                                    <div className="p-3 bg-white rounded-xl shadow-sm">
                                                        <Package className="w-6 h-6 text-indigo-600" />
                                                    </div>
                                                    <div className="flex-1">
                                                        <h3 className="font-black text-indigo-900 leading-tight">{selectedBulkProduct.name}</h3>
                                                        <p className="text-xs text-indigo-600 font-bold uppercase tracking-tighter">{selectedBulkProduct.productCode}</p>
                                                    </div>
                                                    <button 
                                                        onClick={() => setSelectedBulkProduct(null)}
                                                        className="p-1.5 hover:bg-indigo-200 rounded-lg text-indigo-400 hover:text-indigo-600 transition-colors"
                                                    >
                                                        <X className="w-4 h-4" />
                                                    </button>
                                                </div>
                                            </div>
                                        )}
                                    </div>

                                    {/* QUANTITY FLOW */}
                                    <div className="grid grid-cols-5 items-center gap-2">
                                        <div className="col-span-2 space-y-2">
                                            <label className="text-[10px] font-black text-gray-400 uppercase text-center block">Bulk Qty</label>
                                            <div className="flex items-center gap-2 bg-gray-50 p-2 rounded-2xl border-2 border-gray-100">
                                                <button 
                                                    onClick={() => setBulkQuantity(Math.max(1, bulkQuantity - 1))}
                                                    className="w-8 h-8 rounded-lg bg-white shadow-sm flex items-center justify-center hover:bg-red-50 hover:text-red-500 transition-colors"
                                                >
                                                    <Minus className="w-4 h-4" />
                                                </button>
                                                <input 
                                                    type="number" 
                                                    value={bulkQuantity}
                                                    onChange={(e) => setBulkQuantity(Math.max(0.001, parseFloat(e.target.value) || 0))}
                                                    className="flex-1 min-w-0 text-center font-black bg-transparent focus:outline-none"
                                                />
                                                <button 
                                                    onClick={() => setBulkQuantity(bulkQuantity + 1)}
                                                    className="w-8 h-8 rounded-lg bg-white shadow-sm flex items-center justify-center hover:bg-green-50 hover:text-green-500 transition-colors"
                                                >
                                                    <Plus className="w-4 h-4" />
                                                </button>
                                            </div>
                                        </div>
                                        
                                        <div className="flex flex-col items-center justify-center pt-4">
                                            <motion.div
                                                animate={isTransferring ? { x: [-5, 5, -5] } : {}}
                                                transition={{ repeat: Infinity, duration: 0.8 }}
                                                className="p-2 bg-indigo-500 text-white rounded-full"
                                            >
                                                <ArrowRightLeft className="w-4 h-4" />
                                            </motion.div>
                                        </div>

                                        <div className="col-span-2 space-y-2">
                                            <label className="text-[10px] font-black text-gray-400 uppercase text-center block text-emerald-600">Yield / Unit</label>
                                            <div className="flex items-center gap-2 bg-emerald-50 p-2 rounded-2xl border-2 border-emerald-100">
                                                <button 
                                                    onClick={() => setLooseQuantity(Math.max(1, looseQuantity - 1))}
                                                    className="w-8 h-8 rounded-lg bg-white shadow-sm flex items-center justify-center hover:bg-emerald-500 hover:text-white transition-colors"
                                                >
                                                    <Minus className="w-4 h-4" />
                                                </button>
                                                <input 
                                                    type="number" 
                                                    value={looseQuantity}
                                                    onChange={(e) => setLooseQuantity(Math.max(0.001, parseFloat(e.target.value) || 0))}
                                                    className="flex-1 min-w-0 text-center font-black bg-transparent focus:outline-none text-emerald-700"
                                                />
                                                <button 
                                                    onClick={() => setLooseQuantity(looseQuantity + 1)}
                                                    className="w-8 h-8 rounded-lg bg-white shadow-sm flex items-center justify-center hover:bg-emerald-500 hover:text-white transition-colors"
                                                >
                                                    <Plus className="w-4 h-4" />
                                                </button>
                                            </div>
                                        </div>
                                    </div>

                                    {/* DESTINATION (ALL PRODUCTS) */}
                                    <div className="space-y-4">
                                        <div className="flex justify-between items-end">
                                            <label className="text-xs font-black uppercase text-gray-400 tracking-widest flex items-center gap-2 text-emerald-500">
                                                <div className="w-2 h-2 rounded-full bg-emerald-500" />
                                                Destination Product
                                            </label>
                                        </div>
                                        
                                        {!selectedLooseProduct ? (
                                            <div className="relative group">
                                                <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-300 group-focus-within:text-emerald-500 transition-colors" />
                                                <input
                                                    type="text"
                                                    value={looseSearch}
                                                    onChange={(e) => setLooseSearch(e.target.value)}
                                                    placeholder="Search ALL products to convert into..."
                                                    className="w-full pl-12 pr-4 py-4 bg-gray-50 border-2 border-gray-100 rounded-2xl focus:bg-white focus:border-emerald-500 focus:outline-none transition-all font-semibold"
                                                />
                                                {looseSearch && (
                                                    <div className="absolute top-full left-0 right-0 mt-2 bg-white border-2 border-gray-100 rounded-2xl shadow-xl z-10 overflow-hidden">
                                                        {filteredLoose.length > 0 ? filteredLoose.map(p => (
                                                            <button
                                                                key={p.variationID}
                                                                onClick={() => {
                                                                    setSelectedLooseProduct(p);
                                                                    setLooseSearch('');
                                                                }}
                                                                className="w-full text-left p-4 hover:bg-emerald-50 flex items-center justify-between border-b last:border-0 border-gray-50 transition-colors"
                                                            >
                                                                <div>
                                                                    <div className="font-bold text-gray-800">{p.name}</div>
                                                                    <div className="text-xs text-gray-400 font-mono">{p.productCode}</div>
                                                                </div>
                                                                <div className="text-right">
                                                                    <div className="text-xs font-black text-emerald-600">{p.stock} units</div>
                                                                    {!p.stockID && <div className="text-[10px] text-amber-500 font-bold">New Batch Entry</div>}
                                                                </div>
                                                            </button>
                                                        )) : (
                                                            <div className="p-4 text-center text-gray-400 text-sm italic">No products found</div>
                                                        )}
                                                    </div>
                                                )}
                                            </div>
                                        ) : (
                                            <div className="relative p-5 bg-emerald-50 border-2 border-emerald-200 rounded-2xl group transition-all hover:bg-emerald-100/50">
                                                <div className="flex items-center gap-4">
                                                    <div className="p-3 bg-white rounded-xl shadow-sm">
                                                        <Package className="w-6 h-6 text-emerald-600" />
                                                    </div>
                                                    <div className="flex-1">
                                                        <h3 className="font-black text-emerald-900 leading-tight">{selectedLooseProduct.name}</h3>
                                                        <p className="text-xs text-emerald-600 font-bold uppercase tracking-tighter">{selectedLooseProduct.productCode}</p>
                                                    </div>
                                                    <button 
                                                        onClick={() => setSelectedLooseProduct(null)}
                                                        className="p-1.5 hover:bg-emerald-200 rounded-lg text-emerald-400 hover:text-emerald-600 transition-colors"
                                                    >
                                                        <X className="w-4 h-4" />
                                                    </button>
                                                </div>
                                            </div>
                                        )}
                                    </div>
                                </>
                            )}
                        </div>

                        {/* Footer / Summary */}
                        <div className="p-6 bg-gray-50 border-t border-gray-100 rounded-b-3xl">
                            <div className="bg-white p-4 rounded-2xl border-2 border-dashed border-gray-200 mb-4 flex items-center justify-between">
                                <span className="text-xs font-black text-gray-400 uppercase tracking-tighter">Yield Preview</span>
                                <div className="text-right">
                                    <span className="text-lg font-black text-emerald-600">{bulkQuantity * looseQuantity} Units</span>
                                </div>
                            </div>

                            <button
                                onClick={handleInitialTransferClick}
                                disabled={!selectedBulkProduct || !selectedLooseProduct || isTransferring || transferComplete}
                                className="w-full py-4 bg-gradient-to-r from-indigo-600 to-emerald-600 text-white font-black rounded-2xl shadow-xl hover:-translate-y-0.5 transition-all disabled:opacity-50 disabled:grayscale disabled:translate-y-0 flex items-center justify-center gap-3"
                            >
                                {isTransferring ? (
                                    <>
                                        <Loader2 className="w-5 h-5 animate-spin" />
                                        Processing Transfer...
                                    </>
                                ) : transferComplete ? (
                                    <>
                                        <Check className="w-5 h-5" />
                                        Conversion Complete
                                    </>
                                ) : (
                                    <>
                                        <ArrowRightLeft className="w-5 h-5" />
                                        Execute Conversion
                                    </>
                                )}
                            </button>
                        </div>
                    </motion.div>

                </motion.div>
            )}

            <CustomConfirmModal
                isOpen={showConfirmModal}
                onClose={() => setShowConfirmModal(false)}
                onConfirm={handleBulkLooseTransfer}
                title="Confirm Conversion"
                message={`Deduct ${bulkQuantity} Units of ${selectedBulkProduct?.name} to add ${bulkQuantity * looseQuantity} Units of ${selectedLooseProduct?.name}?`}
                confirmText="Confirm & Process"
                variant="warning"
                isLoading={isTransferring}
            />
        </AnimatePresence>
    );
};
