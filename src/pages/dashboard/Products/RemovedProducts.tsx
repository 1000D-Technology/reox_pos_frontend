import { ChevronLeft, ChevronRight, RefreshCw, SearchCheck, Loader2 } from "lucide-react";
import { useEffect, useState } from "react";
import TypeableSelect from "../../../components/TypeableSelect.tsx";
import { productService } from "../../../services/productService";
import { commonService } from "../../../services/commonService";
import toast, { Toaster } from 'react-hot-toast';

interface Product {
    productID: number; // This is actually the product variation ID (pv.id)
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
    // State for products and loading
    const [products, setProducts] = useState<Product[]>([]);
    const [loading, setLoading] = useState(true);

    // Pagination state
    const [currentPage, setCurrentPage] = useState(1);
    const [itemsPerPage] = useState(10);

    // Search and filter state
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedProductType, setSelectedProductType] = useState<{ value: string; label: string } | null>(null);

    // Product types for dropdown
    const [productTypes, setProductTypes] = useState<{ value: string; label: string }[]>([]);

    // Selected row state
    const [selectedIndex, setSelectedIndex] = useState(0);

    // Fetch deactive products
    const fetchDeactiveProducts = async () => {
        try {
            setLoading(true);
            const response = await productService.getDeactiveProducts();
            if (response.data.success) {
                console.log('Deactive products received:', response.data.data);
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

    // Fetch product types
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

    // Recover product (change status to active)
    const handleRecoverProduct = async (product: Product) => {
        // Validate productID before making API call (productID is actually the variation ID)
        if (!product.productID) {
            toast.error('Invalid product ID. Cannot recover product.');
            console.error('Product productID is undefined:', product);
            return;
        }

        console.log('Recovering product:', { pvId: product.productID, productName: product.productName });

        const recoverPromise = productService.changeProductStatus(product.productID, 1); // statusId 1 = Active (to recover)

        toast.promise(
            recoverPromise,
            {
                loading: `Recovering ${product.productName}...`,
                success: (response) => {
                    if (response.data.success) {
                        // Remove the product from current list since it's now active
                        setProducts(prev => prev.filter(p => p.productID !== product.productID));
                        return response.data.message || 'Product recovered successfully!';
                    } else {
                        throw new Error(response.data.message || 'Failed to recover product');
                    }
                },
                error: (error) => {
                    console.error('Error recovering product:', error);
                    return error.response?.data?.message || 'Failed to recover product';
                }
            },
            {
                style: {
                    minWidth: '250px',
                },
                success: {
                    duration: 4000,
                },
            }
        );
    };

    // Search using backend API
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

            // If no search criteria, fetch all deactive products
            const response = Object.keys(searchParams).length > 0
                ? await productService.searchDeactiveProducts(searchParams)
                : await productService.getDeactiveProducts();

            if (response.data.success) {
                setProducts(response.data.data || []);
                setCurrentPage(1); // Reset to first page
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

    // Clear filters and reload all products
    const handleClearFilters = async () => {
        setSearchTerm('');
        setSelectedProductType(null);
        setCurrentPage(1);
        // Reload all deactive products
        await fetchDeactiveProducts();
    };

    useEffect(() => {
        const handelKeyDown = (e: KeyboardEvent) => {
            if (e.key === 'Delete') {
                handleClearFilters();
            }
        };
        window.addEventListener("keydown", handelKeyDown);
        return () => window.removeEventListener("keydown", handelKeyDown);
    }, []);



    // Get paginated products
    const totalPages = Math.ceil(products.length / itemsPerPage);
    const startIndex = (currentPage - 1) * itemsPerPage;
    const paginatedProducts = products.slice(startIndex, startIndex + itemsPerPage);

    // Handle Up / Down arrow keys
    useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            if (e.key === "ArrowDown") {
                setSelectedIndex((prev) =>
                    prev < paginatedProducts.length - 1 ? prev + 1 : prev
                );
            } else if (e.key === "ArrowUp") {
                setSelectedIndex((prev) => (prev > 0 ? prev - 1 : prev));
            }
        };

        window.addEventListener("keydown", handleKeyDown);
        return () => window.removeEventListener("keydown", handleKeyDown);
    }, [paginatedProducts.length]);

    // Initial data fetch
    useEffect(() => {
        fetchDeactiveProducts();
        fetchProductTypes();
    }, []);

    // Reset selected index when page changes
    useEffect(() => {
        setSelectedIndex(0);
    }, [currentPage]);

    return (
        <div className={'flex flex-col gap-4 h-full'}>
            <div >
                <div className="text-sm text-gray-500 flex items-center">
                    <span>Pages</span>
                    <span className="mx-2">›</span>
                    <span className="text-black">Removed Product</span>
                </div>

                <h1 className="text-3xl font-semibold text-gray-500">
                    Removed Product
                </h1>
            </div>
            <div className={'bg-white rounded-md p-4 flex flex-col'}>

                <div className={'grid md:grid-cols-4 gap-4 '}>


                    <div>
                        <label htmlFor="productType"
                            className="block text-sm font-medium text-gray-700 mb-1">Product Type</label>
                        <TypeableSelect
                            options={productTypes}
                            value={selectedProductType?.value || null}
                            onChange={(opt) => opt ? setSelectedProductType({ value: String(opt.value), label: opt.label }) : setSelectedProductType(null)}
                            placeholder="Search Product Types.."
                            allowCreate={false}
                        />
                    </div>
                    <div>
                        <label htmlFor="product"
                            className="block text-sm font-medium text-gray-700 mb-1">Product ID / Name / Code</label>
                        <input
                            type="text"
                            id="product"
                            placeholder="Enter Product ID, Name or Code..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
                            className="w-full text-sm rounded-md py-2 px-2 border-2 border-gray-100"
                        />
                    </div>
                    <div className={'grid grid-cols-2 md:items-end items-start gap-2 text-white font-medium'}>
                        <button
                            onClick={handleSearch}
                            disabled={loading}
                            className={'relative group bg-emerald-600 py-2 rounded-md flex items-center justify-center hover:bg-emerald-700 transition-colors disabled:opacity-50'}
                        >
                            {loading ? <Loader2 className="mr-2 animate-spin" size={14} /> : <SearchCheck className="mr-2" size={14} />}
                            {loading ? 'Searching...' : 'Search'}
                             <span
                                className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 w-max px-2 py-1 text-xs text-white bg-gray-900 rounded-md invisible group-hover:visible opacity-0 group-hover:opacity-100 transition-opacity">
                                (Enter)
                            </span>
                        </button>
                        <div className="relative group">
                            <button
                                onClick={handleClearFilters}
                                disabled={loading}
                                className={'w-full bg-gray-500 py-2 rounded-md flex items-center justify-center hover:bg-gray-600 transition-colors disabled:opacity-50'}
                            >
                                <RefreshCw className="mr-2" size={14} />Clear
                            </button>
                            <span
                                className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 w-max px-2 py-1 text-xs text-white bg-gray-900 rounded-md invisible group-hover:visible opacity-0 group-hover:opacity-100 transition-opacity">
                                (Del)
                            </span>
                        </div>
                    </div>
                </div>
            </div>
            <div className={'flex flex-col bg-white rounded-md h-full p-4 justify-between'}>
                <div
                    className="overflow-y-auto max-h-md md:h-[320px] lg:h-[500px] rounded-md scrollbar-thin scrollbar-thumb-gray-300 scrollbar-track-gray-100">
                    <table className="min-w-full divide-y divide-gray-200">
                        <thead className="bg-red-600 sticky top-0 z-10">
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
                                        className={`px-6 py-3 text-left text-sm font-medium text-white tracking-wider
                            ${i === 0 ? "rounded-tl-lg" : ""}
                            ${i === arr.length - 1 ? "rounded-tr-lg" : ""}`}
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
                                        className={`cursor-pointer ${index === selectedIndex
                                                ? "bg-red-100 border-l-4 border-red-600"
                                                : "hover:bg-red-50"
                                            }`}
                                    >
                                        <td className="px-6 py-2 whitespace-nowrap text-sm font-medium">
                                            {product.productID}
                                        </td>
                                        <td className="px-6 py-2 whitespace-nowrap text-sm font-medium">
                                            {product.productName}
                                        </td>
                                        <td className="px-6 py-2 whitespace-nowrap text-sm font-medium">
                                            {product.productCode}
                                        </td>
                                        <td className="px-6 py-2 whitespace-nowrap text-sm font-medium">
                                            {product.barcode}
                                        </td>
                                        <td className="px-6 py-2 whitespace-nowrap text-sm font-medium">
                                            {product.category}
                                        </td>
                                        <td className="px-6 py-2 whitespace-nowrap text-sm font-medium">
                                            {product.brand}
                                        </td>
                                        <td className="px-6 py-2 whitespace-nowrap text-sm font-medium">
                                            {product.unit}
                                        </td>
                                        <td className="px-6 py-2 whitespace-nowrap text-sm font-medium">
                                            {product.productType}
                                        </td>
                                        <td className="px-6 py-2 whitespace-nowrap text-sm font-medium">
                                            {product.color || '-'}
                                        </td>
                                        <td className="px-6 py-2 whitespace-nowrap text-sm font-medium">
                                            {product.size || '-'}
                                        </td>
                                        <td className="px-6 py-2 whitespace-nowrap text-sm font-medium">
                                            {product.storage || '-'}
                                        </td>
                                        <td className="px-6 py-2 whitespace-nowrap text-sm font-medium">
                                            {new Date(product.createdOn).toLocaleDateString()}
                                        </td>
                                        <td className="px-6 py-2 whitespace-nowrap text-sm font-medium flex gap-2">
                                            <div className="relative group">
                                                <button
                                                    onClick={(e) => {
                                                        e.stopPropagation();
                                                        handleRecoverProduct(product);
                                                    }}
                                                    className="p-2 bg-blue-100 rounded-full text-blue-700 hover:bg-blue-200 transition-colors cursor-pointer"
                                                >
                                                    <RefreshCw size={15} />
                                                </button>
                                                <span
                                                    className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 w-max px-2 py-1 text-xs text-white bg-gray-900 rounded-md invisible group-hover:visible opacity-0 group-hover:opacity-100 transition-opacity">
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

                <nav className="bg-white flex items-center justify-between sm:px-6">
                    <div className="flex items-center space-x-1">
                        <span className="text-sm text-gray-700">
                            Showing {startIndex + 1} to {Math.min(startIndex + itemsPerPage, products.length)} of {products.length} results
                        </span>
                    </div>
                    <div className="flex items-center space-x-2">
                        <button
                            onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                            disabled={currentPage === 1}
                            className="flex items-center px-3 py-2 text-sm font-medium text-gray-500 hover:text-gray-700 disabled:opacity-50 disabled:cursor-not-allowed">
                            <ChevronLeft className="mr-2 h-4 w-4" /> Previous
                        </button>

                        {/* Page numbers */}
                        {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                            const page = i + 1;
                            return (
                                <button
                                    key={page}
                                    onClick={() => setCurrentPage(page)}
                                    className={`px-3 py-1 text-sm font-medium rounded-md ${currentPage === page
                                            ? 'border border-red-300 text-red-700 bg-red-50'
                                            : 'text-gray-500 hover:bg-gray-100'
                                        }`}
                                >
                                    {page}
                                </button>
                            );
                        })}

                        {totalPages > 5 && <span className="text-gray-500 px-2">...</span>}

                        <button
                            onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                            disabled={currentPage === totalPages || totalPages === 0}
                            className="flex items-center px-3 py-2 text-sm font-medium text-gray-500 hover:text-gray-700 disabled:opacity-50 disabled:cursor-not-allowed">
                            Next <ChevronRight className="ml-2 h-4 w-4" />
                        </button>
                    </div>
                </nav>
            </div>
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
                }}
            />
        </div>
    );
}

export default RemovedProducts;
