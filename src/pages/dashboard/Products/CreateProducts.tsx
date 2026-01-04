import {ChevronLeft, ChevronRight} from "lucide-react";
import {useEffect, useState} from "react";
import toast, { Toaster } from 'react-hot-toast';
import TypeableSelect from "../../../components/TypeableSelect.tsx";
import axiosInstance from "../../../api/axiosInstance";
import { commonService } from "../../../services/commonService";

// Add this function before the CreateProducts component
const generateBarcode = (): string => {
    // Generate 12 random digits
    let barcode = '';
    for (let i = 0; i < 12; i++) {
        barcode += Math.floor(Math.random() * 10);
    }
    
    // Calculate check digit (EAN-13 standard)
    let sum = 0;
    for (let i = 0; i < 12; i++) {
        const digit = parseInt(barcode[i]);
        sum += (i % 2 === 0) ? digit : digit * 3;
    }
    const checkDigit = (10 - (sum % 10)) % 10;
    
    return barcode + checkDigit;
};

function CreateProducts() {
    const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000';

    // Form state
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
    
    // Pagination and product data state
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

    // State for fetched data from backend
    const [brands, setBrands] = useState<SelectOption[]>([]);
    const [units, setUnits] = useState<SelectOption[]>([]);
    const [categories, setCategories] = useState<SelectOption[]>([]);
    const [productType, setProductType] = useState<SelectOption[]>([]);

    const color = [
        {value: "red", label: "Red"},
        {value: "yellow", label: "Yellow"},
        {value: "green", label: "Green"},
    ];

    // 🔹 Selected row state
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
        // Remove the barcode requirement check since we'll auto-generate
        if (currentVariation.color || currentVariation.size || currentVariation.storage || currentVariation.barcode) {
            setVariations([...variations, currentVariation]);
            setCurrentVariation({ color: "", size: "", storage: "", barcode: "" });
        }
    };

    // Submit product to backend
    const handleSubmitProduct = async () => {
        // Basic validation
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
            // Generate barcode for main product if not provided
            const mainBarcode = productData.barcode.trim() || generateBarcode();
            
            // Generate barcodes for variations if not provided
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

            const response = await toast.promise(
                createProductPromise,
                {
                    loading: 'Creating product...',
                    success: (res) => {
                        // Refresh products list
                        const fetchProducts = async () => {
                            try {
                                const response = await axiosInstance.get('/api/products');
                                if (response.data.success) {
                                    setSalesData(response.data.data);
                                    setTotalItems(response.data.data.length);
                                }
                            } catch (error) {
                                console.error('Error refreshing products:', error);
                            }
                        };
                        fetchProducts();
                        
                        // Reload the page after successful creation
                        setTimeout(() => {
                            window.location.reload();
                        }, 1000);
                        
                        return res.data.message || 'Product created successfully!';
                    },
                    error: (err) => {
                        if (err.response?.data?.message) {
                            return err.response.data.message;
                        }
                        return 'Failed to create product. Please try again.';
                    }
                }
            );

        } catch (error) {
            // Error already handled by toast.promise
            console.error('Error creating product:', error);
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleRemoveVariation = (index: number) => {
        setVariations(variations.filter((_, i) => i !== index));
    };

    // Fetch brands, units, and categories from backend
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
                        value: String(item.id),
                        label: item.name
                    })));
                }

                if (brandsRes.data.success) {
                    setBrands(brandsRes.data.data.map((item: any) => ({
                        value: String(item.id),
                        label: item.name
                    })));
                }

                if (unitsRes.data.success) {
                    setUnits(unitsRes.data.data.map((item: any) => ({
                        value: String(item.id),
                        label: item.name
                    })));
                }

                if (productTypesRes.data.success) {
                    setProductType(productTypesRes.data.data.map((item: any) => ({
                        value: String(item.id),
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

    // Fetch products data
    useEffect(() => {
        const fetchProducts = async () => {
            setIsLoadingProducts(true);
            try {
                const response = await axiosInstance.get('/api/products');
                const result = response.data;
                
                if (result.success) {
                    setSalesData(result.data);
                    setTotalItems(result.data.length);
                } else {
                    toast.error('Failed to load products data');
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

    // Calculate pagination values
    const totalPages = Math.ceil(totalItems / itemsPerPage);
    const startIndex = (currentPage - 1) * itemsPerPage;
    const endIndex = startIndex + itemsPerPage;
    const currentPageData = salesData.slice(startIndex, endIndex);

    // Pagination handlers
    const goToPage = (page: number) => {
        if (page >= 1 && page <= totalPages) {
            setCurrentPage(page);
            setSelectedIndex(0); // Reset selection to first item
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

    // Generate page numbers to display
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

    // 🔹 Handle Up / Down arrow keys and Shift+Enter
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
    }, [currentPageData.length, isSubmitting, handleSubmitProduct]);
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
                        },
                    },
                    error: {
                        duration: 4000,
                        style: {
                            background: '#EF4444',
                        },
                    },
                    loading: {
                        style: {
                            background: '#3B82F6',
                        },
                    },
                }}
            />
            <div className={"flex flex-col gap-4 h-full"}>
                <div>
                    <div className="text-sm text-gray-500 flex items-center">
                        <span>Pages</span>
                        <span className="mx-2">›</span>
                        <span className="text-black">Create Product</span>
                    </div>
                    <h1 className="text-3xl font-semibold text-gray-500">Create Product</h1>
                </div>

                <div className={"bg-white rounded-md p-4 flex flex-col"}>

                    <span className="text-lg font-semibold my-4">Basic Product Information</span>

                    <div className={"grid md:grid-cols-5 gap-4 "}>
                        <div>
                            <label
                                htmlFor="product name"
                                className="block text-sm font-medium text-gray-700 mb-1"
                            >
                                Product Name <span className="text-red-500">*</span>
                            </label>
                            <input
                                type="text"
                                id="product name"
                                value={productData.name}
                                onChange={(e) => setProductData({...productData, name: e.target.value})}
                                placeholder="Enter Product Name"
                                className="w-full text-sm rounded-md py-2 px-2 border-2 border-gray-100"
                            />
                        </div>
                        <div>
                            <label
                                htmlFor="product code"
                                className="block text-sm font-medium text-gray-700 mb-1"
                            >
                                Product Code
                            </label>
                            <input
                                type="text"
                                id="product code"
                                value={productData.code}
                                onChange={(e) => setProductData({...productData, code: e.target.value})}
                                placeholder="Type to search Product Code"
                                className="w-full text-sm rounded-md py-2 px-2  border-2 border-gray-100 "
                            />
                        </div>
                        <div>
                            <label
                                htmlFor="barcode"
                                className="block text-sm font-medium text-gray-700 mb-1"
                            >
                                Barcode
                            </label>
                            <input
                                type="text"
                                id="barcode"
                                value={productData.barcode}
                                onChange={(e) => setProductData({...productData, barcode: e.target.value})}
                                placeholder="Enter Barcode"
                                className="w-full text-sm rounded-md py-2 px-2  border-2 border-gray-100 "
                            />
                        </div>

                        <div>
                            <label
                                htmlFor="category"
                                className="block text-sm font-medium text-gray-700 mb-1"
                            >
                                Category <span className="text-red-500">*</span>
                            </label>
                            <TypeableSelect
                                options={categories}
                                value={selectedCategory?.value || null}
                                onChange={(opt) => {
                                    if (opt) {
                                        setSelectedCategory({
                                            value: String(opt.value),
                                            label: opt.label,
                                        });
                                        setProductData({...productData, categoryId: String(opt.value)});
                                    } else {
                                        setSelectedCategory(null);
                                        setProductData({...productData, categoryId: ""});
                                    }
                                }}
                                placeholder="Type to search types"
                                allowCreate={true}
                            />
                        </div>

                        <div>
                            <label
                                htmlFor="brand"
                                className="block text-sm font-medium text-gray-700 mb-1"
                            >
                                Brand <span className="text-red-500">*</span>
                            </label>
                            <TypeableSelect
                                options={brands}
                                value={selectedBrand?.value || null}
                                onChange={(opt) => {
                                    if (opt) {
                                        setSelectedBrand({
                                            value: String(opt.value),
                                            label: opt.label,
                                        });
                                        setProductData({...productData, brandId: String(opt.value)});
                                    } else {
                                        setSelectedBrand(null);
                                        setProductData({...productData, brandId: ""});
                                    }
                                }}
                                placeholder="Type to search types"
                                allowCreate={true}
                            />
                        </div>

                        <div>
                            <label
                                htmlFor="unit"
                                className="block text-sm font-medium text-gray-700 mb-1"
                            >
                                Unit <span className="text-red-500">*</span>
                            </label>
                            <TypeableSelect
                                options={units}
                                value={selectedUnit?.value || null}
                                onChange={(opt) => {
                                    if (opt) {
                                        setSelectedUnit({
                                            value: String(opt.value),
                                            label: opt.label,
                                        });
                                        setProductData({...productData, unitId: String(opt.value)});
                                    } else {
                                        setSelectedUnit(null);
                                        setProductData({...productData, unitId: ""});
                                    }
                                }}
                                placeholder="Type to search Product"
                                allowCreate={true}
                            />
                        </div>

                        <div>
                            <label
                                htmlFor="product type"
                                className="block text-sm font-medium text-gray-700 mb-1"
                            >
                                Product Type <span className="text-red-500">*</span>
                            </label>
                            <TypeableSelect
                                options={productType}
                                value={selectedProductType?.value || null}
                                onChange={(opt) => {
                                    if (opt) {
                                        setSelectedProductType({
                                            value: String(opt.value),
                                            label: opt.label,
                                        });
                                        setProductData({...productData, typeId: String(opt.value)});
                                    } else {
                                        setSelectedProductType(null);
                                        setProductData({...productData, typeId: ""});
                                    }
                                }}
                                placeholder="Type to search types"
                                allowCreate={true}
                            />
                        </div>
                    </div>
                    <span className="text-lg font-semibold my-4">Product Variations (Optional)</span>

                    <div className="grid md:grid-cols-5 gap-4">
                        <div>
                            <label htmlFor="color" className="block text-sm font-medium text-gray-700 mb-1">
                                Color
                            </label>
                            <TypeableSelect
                                options={color}
                                value={currentVariation.color || null}
                                onChange={(opt) =>
                                    setCurrentVariation({
                                        ...currentVariation,
                                        color: opt?.label || "",
                                    })
                                }
                                placeholder="Type to search Color"
                                allowCreate={true}
                            />
                        </div>
                        <div>
                            <label htmlFor="size" className="block text-sm font-medium text-gray-700 mb-1">
                                Size
                            </label>
                            <input
                                type="number"
                                id="size"
                                value={currentVariation.size}
                                onChange={(e) =>
                                    setCurrentVariation({ ...currentVariation, size: e.target.value })
                                }
                                placeholder="Enter Size"
                                className="w-full text-sm rounded-md py-2 px-2 border-2 border-gray-100"
                            />
                        </div>
                        <div>
                            <label htmlFor="storage" className="block text-sm font-medium text-gray-700 mb-1">
                                Storage/Capacity
                            </label>
                            <input
                                type="number"
                                id="storage"
                                value={currentVariation.storage}
                                onChange={(e) =>
                                    setCurrentVariation({ ...currentVariation, storage: e.target.value })
                                }
                                placeholder="Enter Storage/Capacity"
                                className="w-full text-sm rounded-md py-2 px-2 border-2 border-gray-100"
                            />
                        </div>
                        <div>
                            <label htmlFor="varBarcode" className="block text-sm font-medium text-gray-700 mb-1">
                                Barcode
                            </label>
                            <input
                                type="text"
                                id="varBarcode"
                                value={currentVariation.barcode}
                                onChange={(e) =>
                                    setCurrentVariation({ ...currentVariation, barcode: e.target.value })
                                }
                                placeholder="Enter Barcode"
                                className="w-full text-sm rounded-md py-2 px-2 border-2 border-gray-100"
                            />
                        </div>
                        <div className="flex items-end justify-end pe-2">
                            <button
                                type="button"
                                onClick={handleAddVariation}
                                className="bg-gray-600 text-white px-4 py-2 rounded-md hover:bg-gray-700 w-[88%] cursor-pointer"
                            >
                                Add Variation ( Enter )
                            </button>
                        </div>
                    </div>

                    {variations.length > 0 && (
                        <div className="mt-6">
                            <div className="flex items-center justify-between mb-4">
                                <h3 className="text-base font-semibold text-gray-800">
                                    Product Variations
                                    <span className="ml-2 px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-green-800">
                    {variations.length}
                </span>
                                </h3>
                            </div>

                            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                                {variations.map((variation, index) => (
                                    <div
                                        key={index}
                                        className="relative bg-gradient-to-br from-white via-gray-50 to-white rounded-xl border border-gray-200 shadow-sm hover:shadow-lg hover:border-blue-300 transition-all duration-300 overflow-hidden group"
                                    >
                                        {/* Top Header Bar */}
                                        <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-green-500 via-blue-500 to-green-500"></div>

                                        {/* Variation Number Badge */}
                                        <div className="absolute top-3 left-3 bg-gradient-to-r from-green-600 to-green-700 text-white text-xs font-bold px-3 py-1 rounded-full shadow-md">
                                            #{index + 1}
                                        </div>

                                        {/* Remove Button - Top Right */}
                                        <button
                                            type="button"
                                            onClick={() => handleRemoveVariation(index)}
                                            className="absolute top-3 right-3 flex items-center justify-center w-8 h-8 bg-red-500 hover:bg-red-600 text-white rounded-full shadow-md hover:shadow-lg transition-all duration-200 transform hover:scale-110 group-hover:rotate-90 z-10"
                                            title="Remove Variation"
                                        >
                                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                            </svg>
                                        </button>

                                        {/* Content */}
                                        <div className="p-5 pt-12 pb-4">
                                            <div className="space-y-3 grid grid-cols-2">
                                                {variation.color && (
                                                    <div className="flex items-start gap-3 group/item">
                                                        <div className="flex-shrink-0 flex items-center justify-center w-10 h-10 rounded-lg bg-gradient-to-br from-purple-100 to-purple-200 group-hover/item:scale-110 transition-transform duration-200">
                                                            <svg className="w-5 h-5 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 21a4 4 0 01-4-4V5a2 2 0 012-2h4a2 2 0 012 2v12a4 4 0 01-4 4zm0 0h12a2 2 0 002-2v-4a2 2 0 00-2-2h-2.343M11 7.343l1.657-1.657a2 2 0 012.828 0l2.829 2.829a2 2 0 010 2.828l-8.486 8.485M7 17h.01" />
                                                            </svg>
                                                        </div>
                                                        <div className="flex-1 min-w-0">
                                                            <span className="block text-xs text-gray-500 font-medium uppercase tracking-wide">Color</span>
                                                            <p className="text-sm font-bold text-gray-800 truncate mt-0.5">{variation.color}</p>
                                                        </div>
                                                    </div>
                                                )}

                                                {variation.size && (
                                                    <div className="flex items-start gap-3 group/item">
                                                        <div className="flex-shrink-0 flex items-center justify-center w-10 h-10 rounded-lg bg-gradient-to-br from-green-100 to-green-200 group-hover/item:scale-110 transition-transform duration-200">
                                                            <svg className="w-5 h-5 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 8V4m0 0h4M4 4l5 5m11-1V4m0 0h-4m4 0l-5 5M4 16v4m0 0h4m-4 0l5-5m11 5l-5-5m5 5v-4m0 4h-4" />
                                                            </svg>
                                                        </div>
                                                        <div className="flex-1 min-w-0">
                                                            <span className="block text-xs text-gray-500 font-medium uppercase tracking-wide">Size</span>
                                                            <p className="text-sm font-bold text-gray-800 truncate mt-0.5">{variation.size}</p>
                                                        </div>
                                                    </div>
                                                )}

                                                {variation.storage && (
                                                    <div className="flex items-start gap-3 group/item">
                                                        <div className="flex-shrink-0 flex items-center justify-center w-10 h-10 rounded-lg bg-gradient-to-br from-orange-100 to-orange-200 group-hover/item:scale-110 transition-transform duration-200">
                                                            <svg className="w-5 h-5 text-orange-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 8h14M5 8a2 2 0 110-4h14a2 2 0 110 4M5 8v10a2 2 0 002 2h10a2 2 0 002-2V8m-9 4h4" />
                                                            </svg>
                                                        </div>
                                                        <div className="flex-1 min-w-0">
                                                            <span className="block text-xs text-gray-500 font-medium uppercase tracking-wide">Storage</span>
                                                            <p className="text-sm font-bold text-gray-800 truncate mt-0.5">{variation.storage}</p>
                                                        </div>
                                                    </div>
                                                )}

                                                {variation.barcode && (
                                                    <div className="flex items-start gap-3 group/item">
                                                        <div className="flex-shrink-0 flex items-center justify-center w-10 h-10 rounded-lg bg-gradient-to-br from-blue-100 to-blue-200 group-hover/item:scale-110 transition-transform duration-200">
                                                            <svg className="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v1m6 11h2m-6 0h-2v4m0-11v3m0 0h.01M12 12h4.01M16 20h4M4 12h4m12 0h.01M5 8h2a1 1 0 001-1V5a1 1 0 00-1-1H5a1 1 0 00-1 1v2a1 1 0 001 1zm12 0h2a1 1 0 001-1V5a1 1 0 00-1-1h-2a1 1 0 00-1 1v2a1 1 0 001 1zM5 20h2a1 1 0 001-1v-2a1 1 0 00-1-1H5a1 1 0 00-1 1v2a1 1 0 001 1z" />
                                                            </svg>
                                                        </div>
                                                        <div className="flex-1 min-w-0">
                                                            <span className="block text-xs text-gray-500 font-medium uppercase tracking-wide">Barcode</span>
                                                            <p className="text-sm font-bold text-gray-800 truncate mt-0.5">{variation.barcode}</p>
                                                        </div>
                                                    </div>
                                                )}
                                            </div>
                                        </div>

                                        {/* Bottom Gradient Line */}
                                        <div className="absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r from-green-500 via-blue-500 to-green-500 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}


                    <div
                        className={
                            "flex justify-end md:items-end items-start p-2 gap-2 text-white font-medium  pt-4"
                        }
                    >
                        <button
                            onClick={handleSubmitProduct}
                            disabled={isSubmitting}
                            className={
                                `bg-emerald-600 p-2 rounded-md w-1/6 flex justify-center items-center cursor-pointer ${isSubmitting ? 'opacity-50 cursor-not-allowed' : 'hover:bg-emerald-700'}`
                            }
                        >
                            {isSubmitting ? 'Saving...' : 'Save Product'} &nbsp;<p className={'text-yellow-400'}>(Shift + Enter)</p>
                        </button>
                    </div>
                </div>

                <div
                    className={
                        "flex flex-col bg-white rounded-md h-full p-4 justify-between"
                    }
                >
                    <div
                        className="overflow-y-auto max-h-md md:h-[320px] lg:h-[320px] rounded-md scrollbar-thin scrollbar-thumb-gray-300 scrollbar-track-gray-100">
                        <table className="min-w-full divide-y divide-gray-200">
                            <thead className="bg-emerald-600 sticky top-0 z-10">
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
                                    "Created On  ",
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
                            {isLoadingProducts ? (
                                <tr>
                                    <td colSpan={12} className="px-6 py-8 text-center text-gray-500">
                                        Loading products...
                                    </td>
                                </tr>
                            ) : currentPageData.length === 0 ? (
                                <tr>
                                    <td colSpan={12} className="px-6 py-8 text-center text-gray-500">
                                        No products found
                                    </td>
                                </tr>
                            ) : currentPageData.map((sale, index) => (
                                <tr
                                    key={index}
                                    onClick={() => setSelectedIndex(index)}
                                    className={`cursor-pointer ${
                                        index === selectedIndex
                                            ? "bg-green-100 border-l-4 border-green-600"
                                            : "hover:bg-green-50"
                                    }`}
                                >
                                    <td className="px-6 py-2 whitespace-nowrap text-sm font-medium">
                                        {sale.productID}
                                    </td>
                                    <td className="px-6 py-2 whitespace-nowrap text-sm font-medium">
                                        {sale.productName}
                                    </td>
                                    <td className="px-6 py-2 whitespace-nowrap text-sm font-medium">
                                        {sale.productCode}
                                    </td>
                                    <td className="px-6 py-2 whitespace-nowrap text-sm font-medium">
                                        {sale.barcode}
                                    </td>
                                    <td className="px-6 py-2 whitespace-nowrap text-sm font-medium">
                                        {sale.category}
                                    </td>
                                    <td className="px-6 py-2 whitespace-nowrap text-sm font-medium">
                                        {sale.brand}
                                    </td>
                                    <td className="px-6 py-2 whitespace-nowrap text-sm font-medium">
                                        {sale.unit}
                                    </td>
                                    <td className="px-6 py-2 whitespace-nowrap text-sm font-medium">
                                        {sale.productType}
                                    </td>
                                    <td className="px-6 py-2 whitespace-nowrap text-sm font-medium">
                                        {sale.color}
                                    </td>
                                    <td className="px-6 py-2 whitespace-nowrap text-sm font-medium">
                                        {sale.size}
                                    </td>
                                    <td className="px-6 py-2 whitespace-nowrap text-sm font-medium">
                                        {sale.storage}
                                    </td>
                                    <td className="px-6 py-2 whitespace-nowrap text-sm font-medium">
                                        {sale.createdOn}
                                    </td>
                                </tr>
                            ))}
                            </tbody>
                        </table>
                    </div>

                    <nav className="bg-white flex items-center justify-between sm:px-6 py-3">
                        <div className="text-sm text-gray-700">
                            Showing <span className="font-medium">{currentPageData.length === 0 ? 0 : startIndex + 1}</span> to <span className="font-medium">{Math.min(endIndex, totalItems)}</span> of <span className="font-medium">{totalItems}</span> products
                        </div>
                        <div className="flex items-center space-x-2">
                            <button
                                onClick={goToPreviousPage}
                                disabled={currentPage === 1}
                                className={`flex items-center px-2 py-2 text-sm font-medium rounded-md ${
                                    currentPage === 1 
                                        ? 'text-gray-300 cursor-not-allowed' 
                                        : 'text-gray-500 hover:text-gray-700 hover:bg-gray-100'
                                }`}>
                                <ChevronLeft className="mr-2 h-5 w-5"/> Previous
                            </button>
                            
                            {getPageNumbers().map((page, idx) => (
                                typeof page === 'number' ? (
                                    <button
                                        key={idx}
                                        onClick={() => goToPage(page)}
                                        className={`px-4 py-2 text-sm font-medium rounded-md ${
                                            currentPage === page
                                                ? 'border border-emerald-600 bg-emerald-50 text-emerald-600'
                                                : 'border border-transparent text-gray-500 hover:bg-gray-100'
                                        }`}>
                                        {page}
                                    </button>
                                ) : (
                                    <span key={idx} className="text-gray-500 px-2">...</span>
                                )
                            ))}
                            
                            <button
                                onClick={goToNextPage}
                                disabled={currentPage === totalPages}
                                className={`flex items-center px-2 py-2 text-sm font-medium rounded-md ${
                                    currentPage === totalPages 
                                        ? 'text-gray-300 cursor-not-allowed' 
                                        : 'text-gray-500 hover:text-gray-700 hover:bg-gray-100'
                                }`}>
                                Next <ChevronRight className="ml-2 h-5 w-5"/>
                            </button>
                        </div>
                    </nav>
                </div>


            </div>
        </>
    );
}

export default CreateProducts;
