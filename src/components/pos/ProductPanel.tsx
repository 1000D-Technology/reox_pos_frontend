import { Search, Barcode, Package } from 'lucide-react';
import { motion } from 'framer-motion';

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
    return (
        <div className="col-span-4 bg-white rounded-2xl  p-3 flex flex-col overflow-hidden">
            <div className="relative mb-3">
                <Search className="absolute left-3 top-3 w-4 h-4 text-gray-400" />
                <input
                    type="text"
                    placeholder="Search product or scan barcode..."
                    value={searchTerm}
                    onChange={(e) => onSearchChange(e.target.value)}
                    className="w-full pl-10 pr-10 py-2.5 text-sm bg-gray-50 border-2 border-gray-200 rounded-xl focus:outline-none focus:border-emerald-500 transition-colors"
                />
                <Barcode className="absolute right-3 top-3 w-4 h-4 text-gray-400" />
            </div>

            <div className="space-y-2 overflow-y-auto flex-1">
                {productsLoading ? (
                    <div className="flex items-center justify-center h-32">
                        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-emerald-500"></div>
                        <span className="ml-2 text-sm text-gray-500">Loading products...</span>
                    </div>
                ) : barcodeSearchLoading ? (
                    <div className="flex items-center justify-center h-32">
                        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
                        <span className="ml-2 text-sm text-gray-500">Searching barcode...</span>
                    </div>
                ) : isNumericSearch && searchTerm.length > 0 ? (
                    <div className="flex flex-col items-center justify-center h-32 text-gray-400">
                        <Barcode className="w-12 h-12 mb-2" />
                        <p className="text-sm">Scanning barcode: {searchTerm}</p>
                        <p className="text-xs text-gray-400">Continue typing or scan...</p>
                    </div>
                ) : filteredProducts.length === 0 ? (
                    <div className="flex flex-col items-center justify-center h-32 text-gray-400">
                        <Package className="w-12 h-12 mb-2" />
                        <p className="text-sm">No products found</p>
                    </div>
                ) : (
                    filteredProducts.map((product) => (
                        <motion.div
                            key={product.id}
                            whileHover={{ scale: 1.02 }}
                            whileTap={{ scale: 0.98 }}
                            onClick={() => onAddToCart(product)}
                            className="p-2.5 bg-gray-50 hover:bg-emerald-50 rounded-xl cursor-pointer transition-all border-2 border-transparent hover:border-emerald-200"
                        >
                            <div className="flex justify-between items-start mb-1">
                                <div className="flex-1">
                                    <h3 className="font-semibold text-sm text-gray-800">{product.name}</h3>
                                    <p className="text-xs text-gray-500">{product.category} • {product.productCode}</p>
                                </div>
                                <div className="text-right">
                                    <p className="font-bold text-sm text-emerald-600">Rs {product.price}</p>
                                    <p className="text-xs text-gray-500 line-through">Rs {product.wholesalePrice}</p>
                                </div>
                            </div>
                            <div className="flex justify-between items-center text-xs">
                                <span className="text-gray-500">{product.barcode}</span>
                                <span className={`px-2 py-0.5 rounded-full ${product.stock > 100 ? 'bg-emerald-100 text-emerald-700' : 'bg-orange-100 text-orange-700'
                                }`}>
                                            Stock: {product.stock}
                                        </span>
                            </div>
                        </motion.div>
                    ))
                )}
            </div>
        </div>
    );
};