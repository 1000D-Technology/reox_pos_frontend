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

    filteredProducts: Product[];
}

export const ProductPanel = ({
                                 searchTerm,
                                 onSearchChange,
                                 productsLoading,
                                 barcodeSearchLoading,
                                 onAddToCart,
                                 filteredProducts
                             }: ProductPanelProps) => {
    const searchInputRef = useRef<HTMLInputElement>(null);
    const productListRef = useRef<HTMLDivElement>(null);
    const [barcodeBuffer, setBarcodeBuffer] = useState('');
    const [lastKeyTime, setLastKeyTime] = useState(0);

    // Check if search term is alphanumeric
    const isAlphanumericSearch = /^[a-zA-Z0-9]+$/.test(searchTerm.trim());

    useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            const currentTime = Date.now();
            const timeDiff = currentTime - lastKeyTime;

            // Barcode scanner detection - alphanumeric keys pressed within 50ms
            if (timeDiff < 50 && /^[a-zA-Z0-9]$/.test(e.key)) {
                console.log('📟 Scanner Key Detected:', {
                    key: e.key,
                    timeDiff: `${timeDiff}ms`,
                    buffer: barcodeBuffer + e.key
                });

                setBarcodeBuffer(prev => prev + e.key);
                setLastKeyTime(currentTime);
                return;
            }

            // Reset buffer if too much time passed
            if (timeDiff > 100 && barcodeBuffer) {
                console.log('🔄 Buffer Reset - Time gap:', `${timeDiff}ms`);
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
            if (filteredProducts.length > 0 && !isAlphanumericSearch) {
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
                    }
                }

                // Arrow Up - Navigate to previous product
                if (e.key === 'ArrowUp') {
                    e.preventDefault();
                    const prevIndex = currentIndex - 1;
                    if (prevIndex >= 0) {
                        (productElements[prevIndex] as HTMLElement).focus();
                    }
                }

                // Enter or Space - Add focused product to cart
                if ((e.key === 'Enter' || e.key === ' ') && currentIndex >= 0) {
                    e.preventDefault();
                    const productId = Number(productElements[currentIndex].getAttribute('data-product-id'));
                    const product = filteredProducts.find(p => p.id === productId);
                    if (product) {
                        onAddToCart(product);
                    }
                }
            }

            setLastKeyTime(currentTime);
        };

        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, [filteredProducts, isAlphanumericSearch, onSearchChange, onAddToCart, lastKeyTime, barcodeBuffer]);

    // Auto-search when barcode buffer is complete (6+ characters for alphanumeric)
    useEffect(() => {
        if (barcodeBuffer.length >= 6) {
            console.log('✅ COMPLETE BARCODE FROM SCANNER:', barcodeBuffer);
            console.log('Auto-triggering search...');
            onSearchChange(barcodeBuffer);
            setBarcodeBuffer('');
        }
    }, [barcodeBuffer, onSearchChange]);

    return (
        <div className="col-span-4 bg-white rounded-2xl shadow-lg p-3 flex flex-col overflow-hidden">
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
                {isAlphanumericSearch && searchTerm.length > 0 ? (
                    <Scan className="absolute right-3 top-3 w-4 h-4 text-blue-500 animate-pulse" />
                ) : (
                    <Barcode className="absolute right-3 top-3 w-4 h-4 text-gray-400" />
                )}
            </div>

            {/* Keyboard Shortcuts Info */}
            <div className="mb-2 bg-blue-50 border border-blue-200 rounded-lg p-2 text-xs text-blue-700">
                <strong>Shortcuts:</strong> F4 = Focus | ↑↓ = Navigate | Enter/Space = Add | Esc = Clear | <Barcode className="inline w-3 h-3"/> Auto-scan
            </div>

            <div ref={productListRef} className="space-y-2 overflow-y-auto flex-1">
                {productsLoading ? (
                    <div className="flex flex-col items-center justify-center h-32">
                        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-emerald-500 mb-2"></div>
                        <span className="text-sm text-gray-500">Loading products...</span>
                    </div>
                ) : barcodeSearchLoading ? (
                    <div className="flex flex-col items-center justify-center h-32">
                        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500 mb-2"></div>
                        <span className="text-sm text-gray-500">Searching barcode...</span>
                    </div>
                ) : isAlphanumericSearch && searchTerm.length > 0 ? (
                    <div className="flex flex-col items-center justify-center h-32 text-gray-400">
                        <Scan className="w-12 h-12 mb-2 animate-pulse text-blue-500" />
                        <p className="text-sm font-semibold text-blue-600">Scanning: {searchTerm}</p>
                        <p className="text-xs text-gray-400 mt-1">
                            {searchTerm.length < 6
                                ? `Need ${6 - searchTerm.length} more characters...`
                                : 'Searching...'}
                        </p>
                        <div className="mt-3 flex items-center gap-2">
                            <div className="h-2 w-2 bg-blue-500 rounded-full animate-bounce"></div>
                            <div className="h-2 w-2 bg-blue-500 rounded-full animate-bounce" style={{animationDelay: '0.1s'}}></div>
                            <div className="h-2 w-2 bg-blue-500 rounded-full animate-bounce" style={{animationDelay: '0.2s'}}></div>
                        </div>
                    </div>
                ) : filteredProducts.length === 0 ? (
                    <div className="flex flex-col items-center justify-center h-32 text-gray-400">
                        <Package className="w-12 h-12 mb-2" />
                        <p className="text-sm">No products found</p>
                        <p className="text-xs mt-1">Try a different search term</p>
                    </div>
                ) : (
                    filteredProducts.map((product) => (
                        <motion.button
                            key={product.id}
                            data-product-id={product.id}
                            onClick={() => onAddToCart(product)}
                            tabIndex={0}
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            whileHover={{ scale: 1.02 }}
                            whileTap={{ scale: 0.98 }}
                            className="w-full text-left p-3 bg-gradient-to-r from-gray-50 to-gray-100 hover:from-emerald-50 hover:to-emerald-100 border-2 border-transparent hover:border-emerald-300 rounded-xl transition-all focus:outline-none focus:border-blue-400 focus:ring-2 focus:ring-blue-200"
                        >
                            <div className="flex justify-between items-start mb-1">
                                <h3 className="font-semibold text-sm text-gray-800">{product.name}</h3>
                                <span className="text-xs font-bold text-emerald-600">
                                    Rs {product.price.toFixed(2)}
                                </span>
                            </div>
                            <div className="flex items-center justify-between text-xs text-gray-500">
                                <div className="flex items-center gap-2">
                                    <span className="bg-blue-100 text-blue-700 px-2 py-0.5 rounded">
                                        {product.productCode}
                                    </span>
                                    <span>{product.category}</span>
                                    {product.barcode && (
                                        <span className="flex items-center gap-1">
                                            <Barcode className="w-3 h-3" />
                                            {product.barcode}
                                        </span>
                                    )}
                                </div>
                                <span className={`font-medium ${product.stock > 10 ? 'text-green-600' : 'text-orange-600'}`}>
                                    Stock: {product.stock}
                                </span>
                            </div>
                        </motion.button>
                    ))
                )}
            </div>
        </div>
    );
};