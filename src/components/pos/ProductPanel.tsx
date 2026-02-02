import { Search, Barcode, Package, Scan } from 'lucide-react';
import { motion } from 'framer-motion';
import { useEffect, useRef, useState } from 'react';

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

interface ProductPanelProps {
    searchTerm: string;
    onSearchChange: (term: string) => void;
    products: Product[];
    productsLoading: boolean;
    barcodeSearchLoading: boolean;
    onAddToCart: (product: Product) => void;
    isNumericSearch: boolean;
    filteredProducts: Product[];
}

export const ProductPanel = ({
    searchTerm,
    onSearchChange,
    productsLoading,
    barcodeSearchLoading,
    onAddToCart,
    isNumericSearch,
    filteredProducts
}: ProductPanelProps) => {
    const searchInputRef = useRef<HTMLInputElement>(null);
    const productListRef = useRef<HTMLDivElement>(null);
    const [barcodeBuffer, setBarcodeBuffer] = useState('');
    const [lastKeyTime, setLastKeyTime] = useState(0);

    useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            const currentTime = Date.now();
            const timeDiff = currentTime - lastKeyTime;

            // Barcode scanner detection (keys pressed within 50ms)
            if (timeDiff < 50 && /^[0-9]$/.test(e.key)) {
                setBarcodeBuffer(prev => prev + e.key);
                setLastKeyTime(currentTime);
                return;
            }

            // Reset buffer if too much time passed
            if (timeDiff > 100) {
                setBarcodeBuffer('');
            }

            // F4 - Focus search input
            if (e.key === 'F4') {
                e.preventDefault();
                searchInputRef.current?.focus();
                searchInputRef.current?.select();
            }

            // Escape - Clear search (when search input is focused)
            if (e.key === 'Escape' && document.activeElement === searchInputRef.current) {
                e.preventDefault();
                onSearchChange('');
                setBarcodeBuffer('');
            }

            // Navigate products with arrow keys (only when products are visible)
            if (filteredProducts.length > 0) {
                const productElements = productListRef.current?.querySelectorAll('[data-product-id]');
                if (!productElements) return;

                const focusedElement = document.activeElement as HTMLElement;
                const currentIndex = Array.from(productElements).findIndex(
                    el => el === focusedElement
                );

                // Arrow Down - Navigate to next product
                if (e.key === 'ArrowDown') {
                    e.preventDefault();
                    const nextIndex = currentIndex + 1;
                    if (nextIndex < productElements.length) {
                        (productElements[nextIndex] as HTMLElement).focus();
                    } else if (currentIndex === -1) {
                        (productElements[0] as HTMLElement).focus();
                    }
                }

                // Arrow Up - Navigate to previous product
                if (e.key === 'ArrowUp') {
                    e.preventDefault();
                    const prevIndex = currentIndex - 1;
                    if (prevIndex >= 0) {
                        (productElements[prevIndex] as HTMLElement).focus();
                    } else if (currentIndex === 0) {
                        searchInputRef.current?.focus();
                    }
                }

                // Enter or Space - Add focused product to cart
                if ((e.key === 'Enter' || e.key === ' ')) {
                    if (currentIndex >= 0) {
                        e.preventDefault();
                        const productId = Number(productElements[currentIndex].getAttribute('data-product-id'));
                        const product = filteredProducts.find(p => p.id === productId);
                        if (product) {
                            onAddToCart(product);
                        }
                    } else if (e.key === 'Enter' && document.activeElement === searchInputRef.current && filteredProducts.length > 0) {
                        // If in search input and press Enter, pick first product
                        e.preventDefault();
                        onAddToCart(filteredProducts[0]);
                    }
                }
            }

            setLastKeyTime(currentTime);
        };

        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, [filteredProducts, isNumericSearch, onSearchChange, onAddToCart, lastKeyTime, barcodeBuffer]);

    // Auto-search when barcode buffer is complete
    useEffect(() => {
        if (barcodeBuffer.length >= 8) {
            onSearchChange(barcodeBuffer);
            setBarcodeBuffer('');
        }
    }, [barcodeBuffer, onSearchChange]);

    return (
        <div className="col-span-4 bg-white rounded-2xl border border-gray-200 p-3 flex flex-col overflow-hidden">
            <div className="relative mb-3">
                <Search className="absolute left-3 top-3 w-4 h-4 text-gray-400" />
                <input
                    ref={searchInputRef}
                    type="text"
                    placeholder="Search product, code or scan barcode... (F4)"
                    value={searchTerm}
                    onChange={(e) => onSearchChange(e.target.value)}
                    className="w-full pl-10 pr-10 py-2.5 text-sm bg-gray-50 border-2 border-gray-200 rounded-xl focus:outline-none focus:border-emerald-500 transition-colors"
                    autoFocus
                />
                {barcodeSearchLoading ? (
                    <div className="absolute right-3 top-3">
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-500"></div>
                    </div>
                ) : isNumericSearch && searchTerm.length > 0 ? (
                    <Scan className="absolute right-3 top-3 w-4 h-4 text-blue-500 animate-pulse" />
                ) : (
                    <Barcode className="absolute right-3 top-3 w-4 h-4 text-gray-400" />
                )}
            </div>

            {/* Keyboard Shortcuts Info */}
            <div className="mb-2 bg-blue-50 border border-blue-200 rounded-lg p-2 text-xs text-blue-700">
                <strong>Shortcuts:</strong> F4 = Focus | ↑↓ = Navigate | Enter/Space = Add | Esc = Clear | <Barcode className="inline w-3 h-3" /> Auto-scan
            </div>

            <div ref={productListRef} className="space-y-2 overflow-y-auto flex-1">
                {productsLoading ? (
                    <div className="flex flex-col items-center justify-center h-32">
                        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-emerald-500 mb-2"></div>
                        <span className="text-sm text-gray-500">Loading products...</span>
                    </div>
                ) : filteredProducts.length === 0 && barcodeSearchLoading ? (
                    <div className="flex flex-col items-center justify-center h-32">
                        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500 mb-2"></div>
                        <span className="text-sm text-gray-500">Searching barcode...</span>
                    </div>
                ) : filteredProducts.length === 0 ? (
                    <div className="flex flex-col items-center justify-center h-32 text-gray-400">
                        <Package className="w-12 h-12 mb-2" />
                        <p className="text-sm font-semibold">No products found</p>
                        {searchTerm && (
                            <p className="text-xs text-gray-400 mt-1">Try different search term or barcode</p>
                        )}
                    </div>
                ) : (
                    filteredProducts.map((product) => (
                        <motion.div
                            key={`${product.id}-${product.barcode || ''}`}
                            data-product-id={product.id}
                            tabIndex={0}

                            whileHover={{ scale: 1.00 }}
                            whileTap={{ scale: 0.98 }}
                            onClick={() => onAddToCart(product)}
                            onKeyDown={(e) => {
                                if (e.key === 'Enter' || e.key === ' ') {
                                    e.preventDefault();
                                    onAddToCart(product);
                                }
                            }}
                            className="p-2.5 bg-gray-50 hover:bg-emerald-50 rounded-xl cursor-pointer transition-all border-2 border-transparent hover:border-emerald-200 focus:outline-none focus:border-blue-400 focus:bg-blue-50"
                        >
                            <div className="flex justify-between items-start mb-1">
                                <div className="flex-1">
                                    <h3 className="font-semibold text-gray-800 text-sm leading-tight flex items-center gap-2">
                                        <span className="text-emerald-700 bg-emerald-50 px-1.5 py-0.5 rounded text-[10px] font-bold border border-emerald-100 uppercase tracking-tighter">
                                            {product.productCode}
                                        </span>
                                        {product.name}
                                    </h3>
                                    <div className="flex items-center gap-2 mt-1 flex-wrap">
                                        {product.barcode && (
                                            <span className="flex items-center gap-1 text-[10px] text-blue-600 bg-blue-50 px-2 py-0.5 rounded border border-blue-100">
                                                <Barcode className="w-2.5 h-2.5" />
                                                {product.barcode}
                                            </span>
                                        )}
                                    </div>
                                </div>
                                <div className="text-right">
                                    <p className="text-sm font-bold text-emerald-600">
                                        Rs {product.price.toFixed(2)}
                                    </p>
                                    {product.wholesalePrice > 0 && (
                                        <p className="text-xs text-gray-500">
                                            WS: Rs {product.wholesalePrice.toFixed(2)}
                                        </p>
                                    )}
                                </div>
                            </div>
                            <div className="flex justify-between items-center text-xs">
                                <span className={`px-2 py-0.5 rounded-full ${product.stock > 10
                                        ? 'bg-emerald-100 text-emerald-700'
                                        : product.stock > 0
                                            ? 'bg-yellow-100 text-yellow-700'
                                            : 'bg-red-100 text-red-700'
                                    }`}>
                                    Stock: {product.stock} {product.category}
                                </span>
                                <span className="text-gray-500">{product.category}</span>
                            </div>
                        </motion.div>
                    ))
                )}
            </div>
        </div>
    );
};
