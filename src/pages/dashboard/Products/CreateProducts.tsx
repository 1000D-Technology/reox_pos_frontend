import { ChevronLeft, ChevronRight, Plus, Trash2 } from "lucide-react";
import { useEffect, useState } from "react";
import toast, { Toaster } from 'react-hot-toast';
import TypeableSelect from "../../../components/TypeableSelect.tsx";
import axiosInstance from "../../../api/axiosInstance";
import { commonService } from "../../../services/commonService";
import { motion } from "framer-motion";

const generateBarcode = (): string => {
    let barcode = '';
    for (let i = 0; i < 12; i++) {
        barcode += Math.floor(Math.random() * 10);
    }

    let sum = 0;
    for (let i = 0; i < 12; i++) {
        const digit = parseInt(barcode[i]);
        sum += (i % 2 === 0) ? digit : digit * 3;
    }
    const checkDigit = (10 - (sum % 10)) % 10;

    return barcode + checkDigit;
};

function CreateProducts() {
    const [productData, setProductData] = useState({
        name: "",
        code: "",
        barcode: "",
        categoryId: "",
        brandId: "",
        unitId: "",
        typeId: ""
    });

    const [isSubmitting, setIsSubmitting] = useState(false);
    const [salesData, setSalesData] = useState<any[]>([]);
    const [currentPage, setCurrentPage] = useState(1);
    const [itemsPerPage] = useState(10);
    const [totalItems, setTotalItems] = useState(0);
    const [isLoadingProducts, setIsLoadingProducts] = useState(false);

    type SelectOption = {
        value: string;
        label: string;
    };
    const [selectedCategory, setSelectedCategory] = useState<SelectOption | null>(null);
    const [selectedBrand, setSelectedBrand] = useState<SelectOption | null>(null);
    const [selectedUnit, setSelectedUnit] = useState<SelectOption | null>(null);
    const [selectedProductType, setSelectedProductType] = useState<SelectOption | null>(null);

    const [brands, setBrands] = useState<SelectOption[]>([]);
    const [units, setUnits] = useState<SelectOption[]>([]);
    const [categories, setCategories] = useState<SelectOption[]>([]);
    const [productType, setProductType] = useState<SelectOption[]>([]);

    const [selectedIndex, setSelectedIndex] = useState(0);

    type Variation = {
        color: string;
        size: string;
        storage: string;
        barcode: string;
    };

    const [variations, setVariations] = useState<Variation[]>([]);
    const [currentVariation, setCurrentVariation] = useState<Variation>({
        color: "",
        size: "",
        storage: "",
        barcode: "",
    });

    const handleAddVariation = () => {
        if (currentVariation.color || currentVariation.size || currentVariation.storage || currentVariation.barcode) {
            setVariations([...variations, currentVariation]);
            setCurrentVariation({ color: "", size: "", storage: "", barcode: "" });
        }
    };

    const handleSubmitProduct = async () => {
        if (!productData.name.trim()) {
            toast.error('Product name is required');
            return;
        }

        if (!productData.code.trim()) {
            toast.error('Product code is required');
            return;
        }

        if (!productData.categoryId) {
            toast.error('Category is required');
            return;
        }

        if (!productData.brandId) {
            toast.error('Brand is required');
            return;
        }

        if (!productData.unitId) {
            toast.error('Unit is required');
            return;
        }

        if (!productData.typeId) {
            toast.error('Product type is required');
            return;
        }

        setIsSubmitting(true);

        try {
            const mainBarcode = productData.barcode.trim() || generateBarcode();

            const processedVariations = variations.map(v => ({
                barcode: v.barcode.trim() || generateBarcode(),
                color: v.color,
                size: v.size,
                capacity: v.storage,
                statusId: 1
            }));

            const createProductPromise = axiosInstance.post('/api/products/create', {
                productData: {
                    name: productData.name.trim(),
                    code: productData.code.trim(),
                    barcode: mainBarcode,
                    categoryId: parseInt(productData.categoryId) || 0,
                    brandId: parseInt(productData.brandId) || 0,
                    unitId: parseInt(productData.unitId) || 0,
                    typeId: parseInt(productData.typeId) || 0
                },
                variations: processedVariations
            });

            await toast.promise(
                createProductPromise,
                {
                    loading: 'Creating product...',
                    success: 'Product created successfully!',
                    error: 'Failed to create product'
                }
            );

            setProductData({
                name: "",
                code: "",
                barcode: "",
                categoryId: "",
                brandId: "",
                unitId: "",
                typeId: ""
            });
            setVariations([]);
            setSelectedCategory(null);
            setSelectedBrand(null);
            setSelectedUnit(null);
            setSelectedProductType(null);

        } catch (error) {
            console.error('Error creating product:', error);
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleRemoveVariation = (index: number) => {
        setVariations(variations.filter((_, i) => i !== index));
    };

    useEffect(() => {
        const fetchDropdownData = async () => {
            try {
                const [categoriesRes, brandsRes, unitsRes, productTypesRes] = await Promise.all([
                    commonService.getCategories(),
                    commonService.getBrands(),
                    commonService.getUnits(),
                    commonService.getProductTypes(),
                ]);

                if (categoriesRes.data.success) {
                    setCategories(categoriesRes.data.data.map((item: any) => ({
                        value: item.id.toString(),
                        label: item.name
                    })));
                }

                if (brandsRes.data.success) {
                    setBrands(brandsRes.data.data.map((item: any) => ({
                        value: item.id.toString(),
                        label: item.name
                    })));
                }

                if (unitsRes.data.success) {
                    setUnits(unitsRes.data.data.map((item: any) => ({
                        value: item.id.toString(),
                        label: item.name
                    })));
                }

                if (productTypesRes.data.success) {
                    setProductType(productTypesRes.data.data.map((item: any) => ({
                        value: item.id.toString(),
                        label: item.name
                    })));
                }
            } catch (error) {
                console.error('Error fetching dropdown data:', error);
                toast.error('Failed to load dropdown data. Please refresh the page.');
            }
        };

        fetchDropdownData();
    }, []);

    useEffect(() => {
        const fetchProducts = async () => {
            setIsLoadingProducts(true);
            try {
                const response = await axiosInstance.get('/api/products');
                const result = response.data;

                if (result.success) {
                    setSalesData(result.data || []);
                    setTotalItems(result.data?.length || 0);
                } else {
                    toast.error('Failed to load products');
                }
            } catch (error) {
                console.error('Error fetching products:', error);
                toast.error('Failed to load products. Please refresh the page.');
            } finally {
                setIsLoadingProducts(false);
            }
        };

        fetchProducts();
    }, []);

    const totalPages = Math.ceil(totalItems / itemsPerPage);
    const startIndex = (currentPage - 1) * itemsPerPage;
    const endIndex = startIndex + itemsPerPage;
    const currentPageData = salesData.slice(startIndex, endIndex);

    const goToPage = (page: number) => {
        if (page >= 1 && page <= totalPages) {
            setCurrentPage(page);
            setSelectedIndex(0);
        }
    };

    const goToPreviousPage = () => {
        if (currentPage > 1) {
            setCurrentPage(currentPage - 1);
            setSelectedIndex(0);
        }
    };

    const goToNextPage = () => {
        if (currentPage < totalPages) {
            setCurrentPage(currentPage + 1);
            setSelectedIndex(0);
        }
    };

    const getPageNumbers = () => {
        const pages = [];
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
            if (e.key === "ArrowDown") {
                setSelectedIndex((prev) =>
                    prev < currentPageData.length - 1 ? prev + 1 : prev
                );
            } else if (e.key === "ArrowUp") {
                setSelectedIndex((prev) => (prev > 0 ? prev - 1 : prev));
            } else if (e.key === "Enter" && e.shiftKey) {
                e.preventDefault();
                if (!isSubmitting) {
                    handleSubmitProduct();
                }
            }
        };

        window.addEventListener("keydown", handleKeyDown);
        return () => window.removeEventListener("keydown", handleKeyDown);
    }, [currentPageData.length, isSubmitting]);

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
                            background: '#10b981',
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
            <div className={"flex flex-col gap-4 h-full"}>
                <div>
                    <div className="text-sm text-gray-400 flex items-center">
                        <span>Products</span>
                        <span className="mx-2">›</span>
                        <span className="text-gray-700 font-medium">Create Product</span>
                    </div>
                    <h1 className="text-3xl font-semibold bg-gradient-to-r from-gray-800 to-gray-600 bg-clip-text text-transparent">
                        Create Product
                    </h1>
                </div>

                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className={"bg-white rounded-xl p-6 flex flex-col shadow-lg"}
                >
                    <h2 className="text-xl font-semibold text-gray-700 mb-4">Basic Product Information</h2>

                    <div className={"grid md:grid-cols-5 gap-4"}>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Product Name</label>
                            <input
                                type="text"
                                value={productData.name}
                                onChange={(e) => setProductData({...productData, name: e.target.value})}
                                placeholder="Enter product name..."
                                className="w-full text-sm rounded-lg py-2 px-3 border-2 border-gray-200 focus:border-emerald-400 focus:outline-none transition-all"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Product Code</label>
                            <input
                                type="text"
                                value={productData.code}
                                onChange={(e) => setProductData({...productData, code: e.target.value})}
                                placeholder="Enter product code..."
                                className="w-full text-sm rounded-lg py-2 px-3 border-2 border-gray-200 focus:border-emerald-400 focus:outline-none transition-all"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Barcode</label>
                            <input
                                type="text"
                                value={productData.barcode}
                                onChange={(e) => setProductData({...productData, barcode: e.target.value})}
                                placeholder="Auto-generated if empty"
                                className="w-full text-sm rounded-lg py-2 px-3 border-2 border-gray-200 focus:border-emerald-400 focus:outline-none transition-all"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Category</label>
                            <TypeableSelect
                                options={categories}
                                value={selectedCategory}
                                onChange={(option) => {
                                    setSelectedCategory(option);
                                    setProductData({...productData, categoryId: option?.value || ""});
                                }}
                                placeholder="Select category..."
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Brand</label>
                            <TypeableSelect
                                options={brands}
                                value={selectedBrand}
                                onChange={(option) => {
                                    setSelectedBrand(option);
                                    setProductData({...productData, brandId: option?.value || ""});
                                }}
                                placeholder="Select brand..."
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Unit</label>
                            <TypeableSelect
                                options={units}
                                value={selectedUnit}
                                onChange={(option) => {
                                    setSelectedUnit(option);
                                    setProductData({...productData, unitId: option?.value || ""});
                                }}
                                placeholder="Select unit..."
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Product Type</label>
                            <TypeableSelect
                                options={productType}
                                value={selectedProductType}
                                onChange={(option) => {
                                    setSelectedProductType(option);
                                    setProductData({...productData, typeId: option?.value || ""});
                                }}
                                placeholder="Select type..."
                            />
                        </div>
                    </div>

                    <h2 className="text-xl font-semibold text-gray-700 mt-6 mb-4">Product Variations (Optional)</h2>

                    <div className="grid md:grid-cols-5 gap-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Color</label>
                            <input
                                type="text"
                                value={currentVariation.color}
                                onChange={(e) => setCurrentVariation({...currentVariation, color: e.target.value})}
                                placeholder="Enter color..."
                                className="w-full text-sm rounded-lg py-2 px-3 border-2 border-gray-200 focus:border-emerald-400 focus:outline-none transition-all"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Size</label>
                            <input
                                type="text"
                                value={currentVariation.size}
                                onChange={(e) => setCurrentVariation({...currentVariation, size: e.target.value})}
                                placeholder="Enter size..."
                                className="w-full text-sm rounded-lg py-2 px-3 border-2 border-gray-200 focus:border-emerald-400 focus:outline-none transition-all"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Storage/Capacity</label>
                            <input
                                type="text"
                                value={currentVariation.storage}
                                onChange={(e) => setCurrentVariation({...currentVariation, storage: e.target.value})}
                                placeholder="Enter storage..."
                                className="w-full text-sm rounded-lg py-2 px-3 border-2 border-gray-200 focus:border-emerald-400 focus:outline-none transition-all"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Barcode</label>
                            <input
                                type="text"
                                value={currentVariation.barcode}
                                onChange={(e) => setCurrentVariation({...currentVariation, barcode: e.target.value})}
                                placeholder="Auto-generated if empty"
                                className="w-full text-sm rounded-lg py-2 px-3 border-2 border-gray-200 focus:border-emerald-400 focus:outline-none transition-all"
                            />
                        </div>
                        <div className="flex items-end justify-end">
                            <button
                                onClick={handleAddVariation}
                                className="w-full bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white py-2 rounded-lg flex items-center justify-center shadow-lg shadow-blue-200 hover:shadow-xl transition-all font-medium"
                            >
                                <Plus size={18} className="mr-2"/>Add Variation
                            </button>
                        </div>
                    </div>

                    {variations.length > 0 && (
                        <div className="mt-6">
                            <div className="flex items-center justify-between mb-4">
                                <h3 className="text-lg font-semibold text-gray-700">
                                    Added Variations <span className="ml-2 px-3 py-1 bg-emerald-100 text-emerald-600 rounded-full text-sm font-bold">{variations.length}</span>
                                </h3>
                            </div>

                            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                                {variations.map((variation, index) => (
                                    <motion.div
                                        key={index}
                                        initial={{ opacity: 0, scale: 0.9 }}
                                        animate={{ opacity: 1, scale: 1 }}
                                        exit={{ opacity: 0, scale: 0.9 }}
                                        className="bg-gradient-to-br from-gray-50 to-gray-100 p-4 rounded-xl border-2 border-gray-200 hover:border-emerald-400 transition-all shadow-sm hover:shadow-md"
                                    >
                                        <div className="flex justify-between items-start mb-3">
                                            <span className="text-xs font-bold text-emerald-600 bg-emerald-50 px-2 py-1 rounded">
                                                Variation {index + 1}
                                            </span>
                                            <button
                                                onClick={() => handleRemoveVariation(index)}
                                                className="p-1.5 bg-red-100 text-red-600 rounded-lg hover:bg-red-200 transition-all"
                                            >
                                                <Trash2 size={14}/>
                                            </button>
                                        </div>
                                        <div className="space-y-2 text-sm">
                                            {variation.color && (
                                                <div className="flex items-center">
                                                    <span className="text-gray-500 font-medium w-20">Color:</span>
                                                    <span className="text-gray-800 font-semibold">{variation.color}</span>
                                                </div>
                                            )}
                                            {variation.size && (
                                                <div className="flex items-center">
                                                    <span className="text-gray-500 font-medium w-20">Size:</span>
                                                    <span className="text-gray-800 font-semibold">{variation.size}</span>
                                                </div>
                                            )}
                                            {variation.storage && (
                                                <div className="flex items-center">
                                                    <span className="text-gray-500 font-medium w-20">Storage:</span>
                                                    <span className="text-gray-800 font-semibold">{variation.storage}</span>
                                                </div>
                                            )}
                                            {variation.barcode && (
                                                <div className="flex items-center">
                                                    <span className="text-gray-500 font-medium w-20">Barcode:</span>
                                                    <span className="text-gray-800 font-mono text-xs">{variation.barcode}</span>
                                                </div>
                                            )}
                                        </div>
                                    </motion.div>
                                ))}
                            </div>
                        </div>
                    )}

                    <div className="flex justify-end mt-6">
                        <button
                            onClick={handleSubmitProduct}
                            disabled={isSubmitting}
                            className={`px-8 py-3 bg-gradient-to-r from-emerald-500 to-emerald-600 hover:from-emerald-600 hover:to-emerald-700 text-white rounded-lg font-semibold shadow-lg shadow-emerald-200 hover:shadow-xl transition-all ${
                                isSubmitting ? 'opacity-50 cursor-not-allowed' : ''
                            }`}
                        >
                            {isSubmitting ? 'Creating Product...' : 'Create Product (Shift+Enter)'}
                        </button>
                    </div>
                </motion.div>

                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.2 }}
                    className={"flex flex-col bg-white rounded-xl h-full p-6 justify-between shadow-lg"}
                >
                    <div className="overflow-y-auto max-h-md md:h-[320px] lg:h-[320px] rounded-lg scrollbar-thin scrollbar-thumb-emerald-300 scrollbar-track-gray-100">
                        <table className="min-w-full divide-y divide-gray-200">
                            <thead className="bg-gradient-to-r from-emerald-500 to-emerald-600 sticky top-0 z-10">
                            <tr>
                                {['Product Name', 'Code', 'Barcode', 'Category', 'Brand', 'Unit', 'Type'].map((header, i, arr) => (
                                    <th
                                        key={i}
                                        className={`px-6 py-3 text-left text-xs font-bold text-white uppercase tracking-wider ${
                                            i === 0 ? 'rounded-tl-lg' : i === arr.length - 1 ? 'rounded-tr-lg' : ''
                                        }`}
                                    >
                                        {header}
                                    </th>
                                ))}
                            </tr>
                            </thead>
                            <tbody className="bg-white divide-y divide-gray-200">
                            {currentPageData.map((product, index) => (
                                <tr
                                    key={index}
                                    onClick={() => setSelectedIndex(index)}
                                    className={`cursor-pointer transition-all ${
                                        selectedIndex === index
                                            ? 'bg-emerald-50 border-l-4 border-emerald-500'
                                            : 'hover:bg-gray-50'
                                    }`}
                                >
                                    <td className="px-6 py-2 whitespace-nowrap text-sm font-semibold text-gray-800">
                                        {product.name}
                                    </td>
                                    <td className="px-6 py-2 whitespace-nowrap text-sm font-medium text-gray-600">
                                        {product.code}
                                    </td>
                                    <td className="px-6 py-2 whitespace-nowrap text-sm font-mono text-gray-600">
                                        {product.barcode}
                                    </td>
                                    <td className="px-6 py-2 whitespace-nowrap text-sm text-gray-600">
                                        {product.category}
                                    </td>
                                    <td className="px-6 py-2 whitespace-nowrap text-sm text-gray-600">
                                        {product.brand}
                                    </td>
                                    <td className="px-6 py-2 whitespace-nowrap text-sm text-gray-600">
                                        {product.unit}
                                    </td>
                                    <td className="px-6 py-2 whitespace-nowrap text-sm text-gray-600">
                                        {product.type}
                                    </td>
                                </tr>
                            ))}
                            </tbody>
                        </table>
                    </div>

                    <nav className="bg-white flex items-center justify-between sm:px-6 pt-4 border-t-2 border-gray-100">
                        <div className="text-sm text-gray-600">
                            Showing <span className="font-bold text-gray-800">{startIndex + 1}-{Math.min(endIndex, totalItems)}</span> of{' '}
                            <span className="font-bold text-gray-800">{totalItems}</span> products
                        </div>
                        <div className="flex items-center space-x-2">
                            <button
                                onClick={goToPreviousPage}
                                disabled={currentPage === 1}
                                className={`flex items-center px-3 py-2 text-sm font-medium rounded-lg transition-all ${
                                    currentPage === 1
                                        ? 'text-gray-400 cursor-not-allowed'
                                        : 'text-gray-600 hover:text-emerald-600 hover:bg-emerald-50'
                                }`}
                            >
                                <ChevronLeft className="mr-2 h-5 w-5"/> Previous
                            </button>
                            {getPageNumbers().map((page, index) =>
                                page === '...' ? (
                                    <span key={`ellipsis-${index}`} className="text-gray-400 px-2">...</span>
                                ) : (
                                    <button
                                        key={index}
                                        onClick={() => goToPage(page as number)}
                                        className={`px-4 py-2 text-sm font-medium rounded-lg transition-all ${
                                            currentPage === page
                                                ? 'bg-gradient-to-r from-emerald-500 to-emerald-600 text-white shadow-md'
                                                : 'text-gray-600 hover:bg-emerald-50 hover:text-emerald-600'
                                        }`}
                                    >
                                        {page}
                                    </button>
                                )
                            )}
                            <button
                                onClick={goToNextPage}
                                disabled={currentPage === totalPages}
                                className={`flex items-center px-3 py-2 text-sm font-medium rounded-lg transition-all ${
                                    currentPage === totalPages
                                        ? 'text-gray-400 cursor-not-allowed'
                                        : 'text-gray-600 hover:text-emerald-600 hover:bg-emerald-50'
                                }`}
                            >
                                Next <ChevronRight className="ml-2 h-5 w-5"/>
                            </button>
                        </div>
                    </nav>
                </motion.div>
            </div>
        </>
    );
}

export default CreateProducts;