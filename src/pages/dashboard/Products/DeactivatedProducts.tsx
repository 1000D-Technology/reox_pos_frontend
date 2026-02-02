import { ChevronLeft, ChevronRight, RefreshCw, SearchCheck, Loader2, Eye, X, Boxes } from "lucide-react";
import { useEffect, useState } from "react";
import toast, { Toaster } from 'react-hot-toast';
import TypeableSelect from "../../../components/TypeableSelect.tsx";
import { productService } from "../../../services/productService";
import { productTypeService } from "../../../services/productTypeService";

interface Product {
    productID: number;
    pvId: number;
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

function DeactivatedProducts() {
    const [products, setProducts] = useState<Product[]>([]);
    const [loading, setLoading] = useState(true);

    const [currentPage, setCurrentPage] = useState(1);
    const [itemsPerPage] = useState(10);

    const [searchTerm, setSearchTerm] = useState('');
    const [selectedProductType, setSelectedProductType] = useState<{ value: string; label: string } | null>(null);

    const [productTypes, setProductTypes] = useState<{ value: string; label: string }[]>([]);

    const [selectedIndex, setSelectedIndex] = useState(0);

    const [isViewModalOpen, setIsViewModalOpen] = useState(false);
    const [selectedProductForView, setSelectedProductForView] = useState<any>(null);
    const [productVariants, setProductVariants] = useState<any[]>([]);
    const [isLoadingVariants, setIsLoadingVariants] = useState(false);

    // Filtered/Grouped products for the table
    const [displayProducts, setDisplayProducts] = useState<any[]>([]);

    const fetchDeactiveProducts = async () => {
        try {
            setLoading(true);
            const response = await productService.getDeactiveProducts();
            if (response.data.success) {
                const data = response.data.data || [];
                setProducts(data);
                
                // Group by productID for display
                const grouped = data.reduce((acc: any, curr: Product) => {
                    if (!acc[curr.productID]) {
                        acc[curr.productID] = { 
                            ...curr, 
                            deactivatedCount: 0,
                            pvIds: [] // Keep track of all variants for this product
                        };
                    }
                    acc[curr.productID].deactivatedCount += 1;
                    acc[curr.productID].pvIds.push(curr.pvId);
                    return acc;
                }, {});
                
                setDisplayProducts(Object.values(grouped));
            } else {
                toast.error('Failed to fetch deactivated products');
            }
        } catch (error) {
            console.error('Error fetching deactive products:', error);
            toast.error('Error loading deactivated products');
        } finally {
            setLoading(false);
        }
    };

    const fetchProductTypes = async () => {
        try {
            const response = await productTypeService.getProductTypes();
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

    const handleRecoverProduct = async (pvId: number, productName: string, isFromModal = false) => {
        if (!pvId) {
            toast.error('Invalid ID. Cannot recover variation.');
            return;
        }

        const recoverPromise = productService.changeProductStatus(pvId, 1);

        toast.promise(
            recoverPromise,
            {
                loading: `Recovering variation of ${productName}...`,
                success: (response) => {
                    if (response.data.success) {
                        // Update local state
                        setProducts(prev => prev.filter(p => p.pvId !== pvId));
                        
                        if (isFromModal) {
                            setProductVariants(prev => prev.filter(v => (v.pvId || v.id) !== pvId));
                            // Also update display products count
                            setDisplayProducts(prev => prev.map(p => {
                                if (p.pvIds?.includes(pvId)) {
                                    return { 
                                        ...p, 
                                        deactivatedCount: p.deactivatedCount - 1,
                                        pvIds: p.pvIds.filter((id: number) => id !== pvId)
                                    };
                                }
                                return p;
                            }).filter(p => p.deactivatedCount > 0));
                        } else {
                            // If from table, just refresh
                            fetchDeactiveProducts();
                        }
                        
                        return response.data.message || `${productName} set to Available!`;
                    } else {
                        throw new Error(response.data.message || 'Failed to recover variation');
                    }
                },
                error: (error) => error.response?.data?.message || 'Failed to set status to Available'
            }
        );
    };

    const handleViewDetails = async (product: any) => {
        setSelectedProductForView(product);
        setIsViewModalOpen(true);
        setIsLoadingVariants(true);
        setProductVariants([]);
        try {
            const response = await productService.getProductVariants(product.productID, { statusId: 2 });
            if (response.data.success) {
                // Variations are already filtered to deactive (statusId 2) by the backend
                setProductVariants(response.data.data || []);
            }
        } catch (error) {
            console.error('Error fetching variants:', error);
            toast.error('Failed to load variation details');
        } finally {
            setIsLoadingVariants(false);
        }
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
                const data = response.data.data || [];
                setProducts(data);
                
                // Group by productID for display
                const grouped = data.reduce((acc: any, curr: Product) => {
                    if (!acc[curr.productID]) {
                        acc[curr.productID] = { 
                            ...curr, 
                            deactivatedCount: 0,
                            pvIds: []
                        };
                    }
                    acc[curr.productID].deactivatedCount += 1;
                    acc[curr.productID].pvIds.push(curr.pvId);
                    return acc;
                }, {});
                
                setDisplayProducts(Object.values(grouped));
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

    const totalPages = Math.ceil(displayProducts.length / itemsPerPage);
    const startIndex = (currentPage - 1) * itemsPerPage;
    const paginatedProducts = displayProducts.slice(startIndex, startIndex + itemsPerPage);

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
        <div className="h-full flex flex-col">
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
                        <span className="text-gray-700 font-medium">Deactivated Products</span>
                    </div>
                    <h1 className="text-3xl font-semibold bg-gradient-to-r from-gray-800 to-gray-600 bg-clip-text text-transparent">
                        Deactivated Products
                    </h1>
                </div>

                <div className="bg-white rounded-xl p-6 border border-gray-200">
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
                </div>

                <div className="flex flex-col bg-white rounded-xl p-6 justify-between gap-6 border border-gray-200 grow overflow-hidden">
                    <div className="overflow-auto rounded-lg scrollbar-thin scrollbar-thumb-red-300 scrollbar-track-gray-100">
                        <table className="min-w-full divide-y divide-gray-200">
                            <thead className="bg-gradient-to-r from-red-600 to-red-700 sticky top-0 z-10">
                                <tr>
                                    {[
                                        "Product ID",
                                        "Product Name",
                                        "Product Code",
                                        "Category",
                                        "Brand",
                                        "Unit",
                                        "Product Type",
                                        "Deactive Variants",
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
                                        <td colSpan={10} className="px-6 py-8 text-center">
                                            <div className="flex items-center justify-center">
                                                <Loader2 className="animate-spin mr-2" size={20} />
                                                <span>Loading deactivated products...</span>
                                            </div>
                                        </td>
                                    </tr>
                                ) : paginatedProducts.length === 0 ? (
                                    <tr>
                                        <td colSpan={10} className="px-6 py-8 text-center text-gray-500">
                                            No deactivated products found
                                        </td>
                                    </tr>
                                ) : (
                                    paginatedProducts.map((product, index) => (
                                        <tr
                                            key={product.productID}
                                            onClick={() => setSelectedIndex(index)}
                                            className={`cursor-pointer transition-colors ${index === selectedIndex
                                                ? "bg-red-50 border-l-4 border-red-600"
                                                : "hover:bg-red-50/50"
                                                }`}
                                        >
                                            <td className="px-6 py-3 whitespace-nowrap text-sm font-medium text-gray-900">
                                                {product.productID}
                                            </td>
                                            <td className="px-6 py-3 whitespace-nowrap text-sm font-semibold text-gray-900">
                                                {product.productName}
                                            </td>
                                            <td className="px-6 py-3 whitespace-nowrap text-sm text-gray-700">
                                                {product.productCode}
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
                                            <td className="px-6 py-3 whitespace-nowrap text-sm">
                                                <span className="px-3 py-1 bg-red-100 text-red-700 rounded-full font-bold text-xs">
                                                    {product.deactivatedCount} Fixed
                                                </span>
                                            </td>
                                            <td className="px-6 py-3 whitespace-nowrap text-sm text-gray-700">
                                                {new Date(product.createdOn).toLocaleDateString()}
                                            </td>
                                            <td className="px-6 py-3 whitespace-nowrap text-sm">
                                                <div className="flex items-center gap-2">
                                                    <div className="relative group inline-block">
                                                        <button
                                                            onClick={(e) => {
                                                                e.stopPropagation();
                                                                handleViewDetails(product);
                                                            }}
                                                            className="p-2 bg-gradient-to-r from-red-500 to-red-600 rounded-lg text-white hover:from-red-600 hover:to-red-700 transition-all shadow-md hover:shadow-lg"
                                                        >
                                                            <Eye size={16} />
                                                        </button>
                                                        <span className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 w-max px-2 py-1 text-xs text-white bg-gray-900 rounded-md invisible group-hover:visible opacity-0 group-hover:opacity-100 transition-opacity">
                                                            View Deactivated Variants
                                                        </span>
                                                    </div>
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
                            Showing <span className="font-medium text-red-600">{paginatedProducts.length === 0 ? 0 : startIndex + 1}</span> to <span className="font-medium text-red-600">{Math.min(startIndex + itemsPerPage, displayProducts.length)}</span> of <span className="font-medium text-red-600">{displayProducts.length}</span> products
                        </div>
                        <div className="flex items-center space-x-2">
                            <button
                                onClick={() => goToPage(currentPage - 1)}
                                disabled={currentPage === 1}
                                className={`flex items-center px-3 py-2 text-sm font-medium rounded-lg transition-all ${currentPage === 1 ? 'text-gray-400 cursor-not-allowed' : 'text-gray-700 hover:bg-red-50'}`}
                            >
                                <ChevronLeft className="mr-1 h-4 w-4" /> Previous
                            </button>

                            {getPageNumbers().map((page, idx) => (
                                typeof page === 'number' ? (
                                    <button
                                        key={idx}
                                        onClick={() => goToPage(page)}
                                        className={`px-3 py-2 text-sm font-medium rounded-lg transition-all ${currentPage === page ? 'bg-gradient-to-r from-red-500 to-red-600 text-white shadow-lg shadow-red-200' : 'text-gray-700 hover:bg-red-50'}`}
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
                                className={`flex items-center px-3 py-2 text-sm font-medium rounded-lg transition-all ${currentPage === totalPages || totalPages === 0 ? 'text-gray-400 cursor-not-allowed' : 'text-gray-700 hover:bg-red-50'}`}
                            >
                                Next <ChevronRight className="ml-1 h-4 w-4" />
                            </button>
                        </div>
                    </nav>
                </div>
            </div>



            {isViewModalOpen && selectedProductForView && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
                    <div className="bg-white rounded-2xl shadow-xl w-full max-w-2xl overflow-hidden animate-in fade-in zoom-in duration-200">
                        <div className="p-6 border-b border-gray-100 flex justify-between items-center bg-red-50/50">
                            <div>
                                <h2 className="text-xl font-bold text-gray-800">Deactivated Variation Details</h2>
                                <p className="text-sm text-gray-500 mt-1">Full information for {selectedProductForView.productName}</p>
                            </div>
                            <button
                                onClick={() => setIsViewModalOpen(false)}
                                className="p-2 hover:bg-gray-200 rounded-full transition-colors text-gray-500 hover:text-gray-700"
                            >
                                <X size={20} />
                            </button>
                        </div>

                        <div className="p-6 max-h-[70vh] overflow-y-auto">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 bg-red-50/30 p-4 rounded-xl border border-red-100 mb-8">
                                <div className="space-y-3">
                                    <div>
                                        <label className="text-[10px] font-bold text-red-400 uppercase tracking-widest">Main Product</label>
                                        <p className="text-gray-900 font-bold text-lg">{selectedProductForView.productName}</p>
                                    </div>
                                    <div>
                                        <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Product ID / Code</label>
                                        <p className="text-gray-700 font-medium">{selectedProductForView.productID} | {selectedProductForView.productCode}</p>
                                    </div>
                                </div>
                                <div className="space-y-3">
                                    <div>
                                        <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Classification</label>
                                        <p className="text-gray-700 font-medium">{selectedProductForView.category} › {selectedProductForView.brand}</p>
                                    </div>
                                    <div>
                                        <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Product Type</label>
                                        <p className="text-gray-700 font-medium">{selectedProductForView.productType} ({selectedProductForView.unit})</p>
                                    </div>
                                </div>
                            </div>

                            <div className="mt-4">
                                <h3 className="text-md font-bold text-gray-800 mb-4 flex items-center gap-2">
                                    <Boxes size={18} className="text-red-600" />
                                    Deactivated Variations
                                    <span className="ml-2 px-2 py-0.5 bg-red-100 text-red-600 rounded text-xs">
                                        {productVariants.length} Items Found
                                    </span>
                                </h3>
                                
                                <div className="border border-gray-100 rounded-xl overflow-hidden shadow-sm">
                                    <table className="min-w-full divide-y divide-gray-200">
                                        <thead className="bg-gray-50">
                                            <tr>
                                                <th className="px-4 py-3 text-left text-[10px] font-bold text-gray-400 uppercase">PV ID</th>
                                                <th className="px-4 py-3 text-left text-[10px] font-bold text-gray-400 uppercase">Barcode</th>
                                                <th className="px-4 py-3 text-left text-[10px] font-bold text-gray-400 uppercase">Attributes</th>
                                                <th className="px-4 py-3 text-right text-[10px] font-bold text-gray-400 uppercase">Action</th>
                                            </tr>
                                        </thead>
                                        <tbody className="bg-white divide-y divide-gray-200">
                                            {isLoadingVariants ? (
                                                <tr>
                                                    <td colSpan={4} className="px-4 py-8 text-center text-gray-400">
                                                        <Loader2 className="animate-spin inline-block mr-2" size={16} />
                                                        Loading variants...
                                                    </td>
                                                </tr>
                                            ) : productVariants.length === 0 ? (
                                                <tr>
                                                    <td colSpan={4} className="px-4 py-8 text-center text-gray-400 italic">
                                                        No deactive variations remain for this product.
                                                    </td>
                                                </tr>
                                            ) : (
                                                productVariants.map((variant) => (
                                                    <tr key={variant.pvId || variant.id} className="hover:bg-red-50/30 transition-colors">
                                                        <td className="px-4 py-3 text-sm text-gray-600 font-medium">{variant.pvId || variant.id}</td>
                                                        <td className="px-4 py-3 text-sm font-mono text-gray-900">{variant.barcode || 'N/A'}</td>
                                                        <td className="px-4 py-3 text-sm">
                                                            <div className="flex flex-wrap gap-1">
                                                                {variant.color && <span className="px-1.5 py-0.5 bg-gray-100 rounded text-[10px] font-medium text-gray-600">{variant.color}</span>}
                                                                {variant.size && <span className="px-1.5 py-0.5 bg-gray-100 rounded text-[10px] font-medium text-gray-600">{variant.size}</span>}
                                                                {variant.storage && <span className="px-1.5 py-0.5 bg-gray-100 rounded text-[10px] font-medium text-gray-600">{variant.storage}</span>}
                                                            </div>
                                                        </td>
                                                        <td className="px-4 py-3 text-right">
                                                            <button
                                                                onClick={() => handleRecoverProduct(variant.pvId || variant.id, selectedProductForView.productName, true)}
                                                                className="p-1.5 bg-emerald-50 text-emerald-600 hover:bg-emerald-100 rounded-lg transition-colors flex items-center gap-1 ml-auto text-xs font-bold"
                                                                title="Recover Variant"
                                                            >
                                                                <RefreshCw size={12} />
                                                                Recover
                                                            </button>
                                                        </td>
                                                    </tr>
                                                ))
                                            )}
                                        </tbody>
                                    </table>
                                </div>
                            </div>
                        </div>

                        <div className="p-6 border-t border-gray-100 bg-gray-50 flex justify-between items-center">
                            <p className="text-[10px] text-gray-400 font-medium italic">
                                * Recovering a variation will move it back to the active product list.
                            </p>
                            <button
                                onClick={() => {
                                    setIsViewModalOpen(false);
                                    if (productVariants.length === 0) fetchDeactiveProducts(); // Final refresh if all gone
                                }}
                                className="px-6 py-2 bg-gray-800 text-white rounded-lg text-sm font-bold hover:bg-gray-900 transition-colors shadow-md"
                            >
                                Finished
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}

export default DeactivatedProducts;