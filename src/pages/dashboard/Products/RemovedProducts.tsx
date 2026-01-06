import { ChevronLeft, ChevronRight, RefreshCw, SearchCheck, Loader2 } from "lucide-react";
import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import toast, { Toaster } from 'react-hot-toast';
import TypeableSelect from "../../../components/TypeableSelect.tsx";
import { productService } from "../../../services/productService";
import { commonService } from "../../../services/commonService";

interface Product {
    productID: number;
    productName: string;
    productCode: string;
    barcode: string;
    category: string;
    brand: string;
    unit: string;
    productType: string;
    color?: string;
    size?: string;
    storage?: string;
    createdOn: string;
}

function RemovedProducts() {
    const [products, setProducts] = useState<Product[]>([]);
    const [loading, setLoading] = useState(true);

    const [currentPage, setCurrentPage] = useState(1);
    const [itemsPerPage] = useState(10);

    const [searchTerm, setSearchTerm] = useState('');
    const [selectedProductType, setSelectedProductType] = useState<{ value: string; label: string } | null>(null);

    const [productTypes, setProductTypes] = useState<{ value: string; label: string }[]>([]);

    const [selectedIndex, setSelectedIndex] = useState(0);

    const fetchDeactiveProducts = async () => {
        try {
            setLoading(true);
            const response = await productService.getDeactiveProducts();
            if (response.data.success) {
                setProducts(response.data.data || []);
            } else {
                toast.error('Failed to fetch removed products');
            }
        } catch (error) {
            console.error('Error fetching deactive products:', error);
            toast.error('Error loading removed products');
        } finally {
            setLoading(false);
        }
    };

    const fetchProductTypes = async () => {
        try {
            const response = await commonService.getProductTypes();
            if (response.data.success) {
                const types = response.data.data.map((type: any) => ({
                    value: type.id.toString(),
                    label: type.name
                }));
                setProductTypes(types);
            }
        } catch (error) {
            console.error('Error fetching product types:', error);
        }
    };

    const handleRecoverProduct = async (product: Product) => {
        if (!product.productID) {
            toast.error('Invalid product ID. Cannot recover product.');
            return;
        }

        const recoverPromise = productService.changeProductStatus(product.productID, 1);

        toast.promise(
            recoverPromise,
            {
                loading: `Recovering ${product.productName}...`,
                success: (response) => {
                    if (response.data.success) {
                        setProducts(prev => prev.filter(p => p.productID !== product.productID));
                        return response.data.message || 'Product recovered successfully!';
                    } else {
                        throw new Error(response.data.message || 'Failed to recover product');
                    }
                },
                error: (error) => error.response?.data?.message || 'Failed to recover product'
            }
        );
    };

    const handleSearch = async () => {
        try {
            setLoading(true);

            const searchParams: { productTypeId?: number; searchTerm?: string } = {};

            if (selectedProductType) {
                searchParams.productTypeId = parseInt(selectedProductType.value);
            }

            if (searchTerm.trim()) {
                searchParams.searchTerm = searchTerm.trim();
            }

            const response = Object.keys(searchParams).length > 0
                ? await productService.searchDeactiveProducts(searchParams)
                : await productService.getDeactiveProducts();

            if (response.data.success) {
                setProducts(response.data.data || []);
                setCurrentPage(1);
            } else {
                toast.error('Search failed');
            }
        } catch (error) {
            console.error('Error searching products:', error);
            toast.error('Error searching products');
        } finally {
            setLoading(false);
        }
    };

    const handleClearFilters = async () => {
        setSearchTerm('');
        setSelectedProductType(null);
        setCurrentPage(1);
        await fetchDeactiveProducts();
    };

    const totalPages = Math.ceil(products.length / itemsPerPage);
    const startIndex = (currentPage - 1) * itemsPerPage;
    const paginatedProducts = products.slice(startIndex, startIndex + itemsPerPage);

    const goToPage = (page: number) => {
        if (page >= 1 && page <= totalPages) {
            setCurrentPage(page);
            setSelectedIndex(0);
        }
    };

    const getPageNumbers = () => {
        const pages: (number | string)[] = [];
        const maxPagesToShow = 5;

        if (totalPages <= maxPagesToShow) {
            for (let i = 1; i <= totalPages; i++) {
                pages.push(i);
            }
        } else {
            if (currentPage <= 3) {
                for (let i = 1; i <= 4; i++) pages.push(i);
                pages.push('...');
                pages.push(totalPages);
            } else if (currentPage >= totalPages - 2) {
                pages.push(1);
                pages.push('...');
                for (let i = totalPages - 3; i <= totalPages; i++) pages.push(i);
            } else {
                pages.push(1);
                pages.push('...');
                pages.push(currentPage - 1);
                pages.push(currentPage);
                pages.push(currentPage + 1);
                pages.push('...');
                pages.push(totalPages);
            }
        }

        return pages;
    };

    useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            if (e.key === 'Delete') {
                handleClearFilters();
            } else if (e.key === "ArrowDown") {
                setSelectedIndex((prev) => (prev < paginatedProducts.length - 1 ? prev + 1 : prev));
            } else if (e.key === "ArrowUp") {
                setSelectedIndex((prev) => (prev > 0 ? prev - 1 : prev));
            }
        };

        window.addEventListener("keydown", handleKeyDown);
        return () => window.removeEventListener("keydown", handleKeyDown);
    }, [paginatedProducts.length]);

    useEffect(() => {
        fetchDeactiveProducts();
        fetchProductTypes();
    }, []);

    useEffect(() => {
        setSelectedIndex(0);
    }, [currentPage]);

    return (
        <>
            <Toaster
                position="top-right"
                toastOptions={{
                    duration: 4000,
                    style: {
                        background: '#363636',
                        color: '#fff',
                    },
                    success: {
                        duration: 3000,
                        style: {
                            background: '#10B981',
                            color: '#fff',
                        },
                    },
                    error: {
                        duration: 4000,
                        style: {
                            background: '#ef4444',
                        },
                    },
                }}
            />
            <div className="flex flex-col gap-4 h-full">
                <div>
                    <div className="text-sm text-gray-400 flex items-center">
                        <span>Products</span>
                        <span className="mx-2">›</span>
                        <span className="text-gray-700 font-medium">Removed Products</span>
                    </div>
                    <h1 className="text-3xl font-semibold bg-gradient-to-r from-gray-800 to-gray-600 bg-clip-text text-transparent">
                        Removed Products
                    </h1>
                </div>

                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="bg-white rounded-xl p-6 shadow-lg"
                >
                    <div className="grid md:grid-cols-4 gap-4">
                        <div>
                            <label htmlFor="productType" className="block text-sm font-medium text-gray-700 mb-1">
                                Product Type
                            </label>
                            <TypeableSelect
                                options={productTypes}
                                value={selectedProductType?.value || null}
                                onChange={(opt) => opt ? setSelectedProductType({ value: String(opt.value), label: opt.label }) : setSelectedProductType(null)}
                                placeholder="Search Product Types.."
                                allowCreate={false}
                            />
                        </div>
                        <div>
                            <label htmlFor="product" className="block text-sm font-medium text-gray-700 mb-1">
                                Product ID / Name / Code
                            </label>
                            <input
                                type="text"
                                id="product"
                                placeholder="Enter Product ID, Name or Code..."
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
                                className="w-full text-sm rounded-lg py-2 px-3 border-2 border-gray-200 focus:border-red-500 focus:ring-2 focus:ring-red-200 outline-none transition-all"
                            />
                        </div>
                        <div className="grid md:items-end gap-2">
                            <div className="relative group">
                                <button
                                    onClick={handleSearch}
                                    disabled={loading}
                                    className="w-full flex items-center justify-center gap-2 px-4 py-2 bg-gradient-to-r from-red-500 to-red-600 hover:from-red-600 hover:to-red-700 text-white font-medium rounded-lg shadow-lg shadow-red-200 hover:shadow-xl transition-all disabled:opacity-50"
                                >
                                    {loading ? <Loader2 className="animate-spin" size={16} /> : <SearchCheck size={16} />}
                                    {loading ? 'Searching...' : 'Search'}
                                </button>
                                <span className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 w-max px-2 py-1 text-xs text-white bg-gray-900 rounded-md invisible group-hover:visible opacity-0 group-hover:opacity-100 transition-opacity">
                                    (Enter)
                                </span>
                            </div>
                        </div>
                        <div className="grid md:items-end gap-2">
                            <div className="relative group">
                                <button
                                    onClick={handleClearFilters}
                                    disabled={loading}
                                    className="w-full flex items-center justify-center gap-2 px-4 py-2 bg-gradient-to-r from-gray-500 to-gray-600 hover:from-gray-600 hover:to-gray-700 text-white font-medium rounded-lg shadow-lg shadow-gray-200 hover:shadow-xl transition-all disabled:opacity-50"
                                >
                                    <RefreshCw size={16} />
                                    Clear
                                </button>
                                <span className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 w-max px-2 py-1 text-xs text-white bg-gray-900 rounded-md invisible group-hover:visible opacity-0 group-hover:opacity-100 transition-opacity">
                                    (Del)
                                </span>
                            </div>
                        </div>
                    </div>
                </motion.div>

                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="flex flex-col bg-white rounded-xl p-6 justify-between gap-6 shadow-lg"
                >
                    <div className="overflow-y-auto max-h-md md:h-[320px] lg:h-[600px] rounded-lg scrollbar-thin scrollbar-thumb-red-300 scrollbar-track-gray-100">
                        <table className="min-w-full divide-y divide-gray-200">
                            <thead className="bg-gradient-to-r from-red-600 to-red-700 sticky top-0 z-10">
                            <tr>
                                {[
                                    "Product ID",
                                    "Product Name",
                                    "Product Code",
                                    "Barcode",
                                    "Category",
                                    "Brand",
                                    "Unit",
                                    "Product Type",
                                    "Color",
                                    "Size",
                                    "Storage/Capacity",
                                    "Created On",
                                    "Actions",
                                ].map((header, i, arr) => (
                                    <th
                                        key={header}
                                        scope="col"
                                        className={`px-6 py-3 text-left text-xs font-medium text-white uppercase tracking-wider ${i === 0 ? "rounded-tl-lg" : ""} ${i === arr.length - 1 ? "rounded-tr-lg" : ""}`}
                                    >
                                        {header}
                                    </th>
                                ))}
                            </tr>
                            </thead>
                            <tbody className="bg-white divide-y divide-gray-200">
                            {loading ? (
                                <tr>
                                    <td colSpan={13} className="px-6 py-8 text-center">
                                        <div className="flex items-center justify-center">
                                            <Loader2 className="animate-spin mr-2" size={20} />
                                            <span>Loading removed products...</span>
                                        </div>
                                    </td>
                                </tr>
                            ) : paginatedProducts.length === 0 ? (
                                <tr>
                                    <td colSpan={13} className="px-6 py-8 text-center text-gray-500">
                                        No removed products found
                                    </td>
                                </tr>
                            ) : (
                                paginatedProducts.map((product, index) => (
                                    <tr
                                        key={product.productID}
                                        onClick={() => setSelectedIndex(index)}
                                        className={`cursor-pointer transition-colors ${index === selectedIndex
                                            ? "bg-red-50 border-l-4 border-red-600"
                                            : "hover:bg-red-50"
                                        }`}
                                    >
                                        <td className="px-6 py-3 whitespace-nowrap text-sm font-medium text-gray-900">
                                            {product.productID}
                                        </td>
                                        <td className="px-6 py-3 whitespace-nowrap text-sm font-medium text-gray-900">
                                            {product.productName}
                                        </td>
                                        <td className="px-6 py-3 whitespace-nowrap text-sm text-gray-700">
                                            {product.productCode}
                                        </td>
                                        <td className="px-6 py-3 whitespace-nowrap text-sm text-gray-700">
                                            {product.barcode}
                                        </td>
                                        <td className="px-6 py-3 whitespace-nowrap text-sm text-gray-700">
                                            {product.category}
                                        </td>
                                        <td className="px-6 py-3 whitespace-nowrap text-sm text-gray-700">
                                            {product.brand}
                                        </td>
                                        <td className="px-6 py-3 whitespace-nowrap text-sm text-gray-700">
                                            {product.unit}
                                        </td>
                                        <td className="px-6 py-3 whitespace-nowrap text-sm text-gray-700">
                                            {product.productType}
                                        </td>
                                        <td className="px-6 py-3 whitespace-nowrap text-sm text-gray-700">
                                            {product.color || '-'}
                                        </td>
                                        <td className="px-6 py-3 whitespace-nowrap text-sm text-gray-700">
                                            {product.size || '-'}
                                        </td>
                                        <td className="px-6 py-3 whitespace-nowrap text-sm text-gray-700">
                                            {product.storage || '-'}
                                        </td>
                                        <td className="px-6 py-3 whitespace-nowrap text-sm text-gray-700">
                                            {new Date(product.createdOn).toLocaleDateString()}
                                        </td>
                                        <td className="px-6 py-3 whitespace-nowrap text-sm">
                                            <div className="relative group inline-block">
                                                <button
                                                    onClick={(e) => {
                                                        e.stopPropagation();
                                                        handleRecoverProduct(product);
                                                    }}
                                                    className="p-2 bg-gradient-to-r from-blue-500 to-blue-600 rounded-lg text-white hover:from-blue-600 hover:to-blue-700 transition-all shadow-md hover:shadow-lg"
                                                >
                                                    <RefreshCw size={16} />
                                                </button>
                                                <span className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 w-max px-2 py-1 text-xs text-white bg-gray-900 rounded-md invisible group-hover:visible opacity-0 group-hover:opacity-100 transition-opacity">
                                                        Recover Product
                                                    </span>
                                            </div>
                                        </td>
                                    </tr>
                                ))
                            )}
                            </tbody>
                        </table>
                    </div>

                    <nav className="bg-white flex items-center justify-between sm:px-6 pt-4 border-t-2 border-gray-100">
                        <div className="text-sm text-gray-600">
                            Showing <span className="font-medium text-red-600">{paginatedProducts.length === 0 ? 0 : startIndex + 1}</span> to <span className="font-medium text-red-600">{Math.min(startIndex + itemsPerPage, products.length)}</span> of <span className="font-medium text-red-600">{products.length}</span> products
                        </div>
                        <div className="flex items-center space-x-2">
                            <button
                                onClick={() => goToPage(currentPage - 1)}
                                disabled={currentPage === 1}
                                className={`flex items-center px-3 py-2 text-sm font-medium rounded-lg transition-all ${
                                    currentPage === 1
                                        ? 'text-gray-400 cursor-not-allowed'
                                        : 'text-gray-700 hover:bg-red-50'
                                }`}
                            >
                                <ChevronLeft className="mr-1 h-4 w-4" /> Previous
                            </button>

                            {getPageNumbers().map((page, idx) => (
                                typeof page === 'number' ? (
                                    <button
                                        key={idx}
                                        onClick={() => goToPage(page)}
                                        className={`px-3 py-2 text-sm font-medium rounded-lg transition-all ${
                                            currentPage === page
                                                ? 'bg-gradient-to-r from-red-500 to-red-600 text-white shadow-lg shadow-red-200'
                                                : 'text-gray-700 hover:bg-red-50'
                                        }`}
                                    >
                                        {page}
                                    </button>
                                ) : (
                                    <span key={idx} className="px-2 text-gray-500">...</span>
                                )
                            ))}

                            <button
                                onClick={() => goToPage(currentPage + 1)}
                                disabled={currentPage === totalPages || totalPages === 0}
                                className={`flex items-center px-3 py-2 text-sm font-medium rounded-lg transition-all ${
                                    currentPage === totalPages || totalPages === 0
                                        ? 'text-gray-400 cursor-not-allowed'
                                        : 'text-gray-700 hover:bg-red-50'
                                }`}
                            >
                                Next <ChevronRight className="ml-1 h-4 w-4" />
                            </button>
                        </div>
                    </nav>
                </motion.div>
            </div>
        </>
    );
}

export default RemovedProducts;