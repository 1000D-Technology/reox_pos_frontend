import { ChevronLeft, ChevronRight, Plus, Trash2, Package, X, Loader2 } from "lucide-react";
import { useEffect, useState } from "react";
import toast, { Toaster } from 'react-hot-toast';
import TypeableSelect from "../../../components/TypeableSelect.tsx";
import { categoryService } from "../../../services/categoryService";
import { brandService } from "../../../services/brandService";
import { unitService } from "../../../services/unitService";
import { productTypeService } from "../../../services/productTypeService";
import { productService } from "../../../services/productService";


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

interface Product {
    productID: number;
    productName: string;
    productCode: string;
    barcode: string;
    category: string;
    brand: string;
    unit: string;
    productType: string;
    color: string;
    size: string;
    storage: string;
    createdOn: string;
}

type SelectOption = {
    value: string | number;
    label: string;
};

type Variation = {
    color: string;
    size: string;
    storage: string;
    barcode: string;
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
    const [salesData, setSalesData] = useState<Product[]>([]);
    const [currentPage, setCurrentPage] = useState(1);
    const [itemsPerPage] = useState(10);
    const [totalItems, setTotalItems] = useState(0);
    const [isLoadingProducts, setIsLoadingProducts] = useState(false);

    const [selectedCategory, setSelectedCategory] = useState<SelectOption | null>(null);
    const [selectedBrand, setSelectedBrand] = useState<SelectOption | null>(null);
    const [selectedUnit, setSelectedUnit] = useState<SelectOption | null>(null);
    const [selectedProductType, setSelectedProductType] = useState<SelectOption | null>(null);

    const [brands, setBrands] = useState<SelectOption[]>([]);
    const [units, setUnits] = useState<SelectOption[]>([]);
    const [categories, setCategories] = useState<SelectOption[]>([]);
    const [productType, setProductType] = useState<SelectOption[]>([]);

    const [selectedIndex, setSelectedIndex] = useState(0);

    const [variations, setVariations] = useState<Variation[]>([]);
    const [currentVariation, setCurrentVariation] = useState<Variation>({
        color: "",
        size: "",
        storage: "",
        barcode: "",
    });

    // Quick Add Modal States
    const [isCategoryModalOpen, setIsCategoryModalOpen] = useState(false);
    const [isBrandModalOpen, setIsBrandModalOpen] = useState(false);
    const [isUnitModalOpen, setIsUnitModalOpen] = useState(false);
    const [isTypeModalOpen, setIsTypeModalOpen] = useState(false);

    const [newItemName, setNewItemName] = useState("");
    const [isAddingItem, setIsAddingItem] = useState(false);

    const handleQuickAdd = async (type: 'category' | 'brand' | 'unit' | 'type') => {
        const trimmedName = newItemName.trim();
        if (!trimmedName) {
            toast.error(`${type} name is required`);
            return;
        }

        // Check for duplicates locally
        let isDuplicate = false;
        switch (type) {
            case 'category':
                isDuplicate = categories.some(item => item.label.toLowerCase() === trimmedName.toLowerCase());
                break;
            case 'brand':
                isDuplicate = brands.some(item => item.label.toLowerCase() === trimmedName.toLowerCase());
                break;
            case 'unit':
                isDuplicate = units.some(item => item.label.toLowerCase() === trimmedName.toLowerCase());
                break;
            case 'type':
                isDuplicate = productType.some(item => item.label.toLowerCase() === trimmedName.toLowerCase());
                break;
        }

        if (isDuplicate) {
            toast.error(`This ${type} already exists!`);
            return;
        }

        setIsAddingItem(true);
        try {
            let response;
            switch (type) {
                case 'category':
                    response = await categoryService.createCategory({ name: trimmedName });
                    if (response.data.success) {
                        toast.success("Category added successfully");
                        const res = await categoryService.getCategories();
                        if (res.data.success) {
                            setCategories(res.data.data.map((item: any) => ({
                                value: String(item.id),
                                label: item.name
                            })));
                            // Auto-select the new item
                            const newItem = res.data.data.find((item: any) => item.name === trimmedName);
                            if (newItem) {
                                setSelectedCategory({ value: String(newItem.id), label: newItem.name });
                                setProductData(prev => ({ ...prev, categoryId: String(newItem.id) }));
                            }
                        }
                        setIsCategoryModalOpen(false);
                    }
                    break;
                case 'brand':
                    response = await brandService.createBrand({ name: trimmedName });
                    if (response.data.success) {
                        toast.success("Brand added successfully");
                        const res = await brandService.getBrands();
                        if (res.data.success) {
                            setBrands(res.data.data.map((item: any) => ({
                                value: String(item.id),
                                label: item.name
                            })));
                            const newItem = res.data.data.find((item: any) => item.name === trimmedName);
                            if (newItem) {
                                setSelectedBrand({ value: String(newItem.id), label: newItem.name });
                                setProductData(prev => ({ ...prev, brandId: String(newItem.id) }));
                            }
                        }
                        setIsBrandModalOpen(false);
                    }
                    break;
                case 'unit':
                    response = await unitService.createUnit({ name: trimmedName });
                    if (response.data.success) {
                        toast.success("Unit added successfully");
                        const res = await unitService.getUnits();
                        if (res.data.success) {
                            setUnits(res.data.data.map((item: any) => ({
                                value: String(item.id),
                                label: item.name
                            })));
                            const newItem = res.data.data.find((item: any) => item.name === trimmedName);
                            if (newItem) {
                                setSelectedUnit({ value: String(newItem.id), label: newItem.name });
                                setProductData(prev => ({ ...prev, unitId: String(newItem.id) }));
                            }
                        }
                        setIsUnitModalOpen(false);
                    }
                    break;
                case 'type':
                    response = await productTypeService.createProductType({ name: trimmedName });
                    if (response.data.success) {
                        toast.success("Product Type added successfully");
                        const res = await productTypeService.getProductTypes();
                        if (res.data.success) {
                            setProductType(res.data.data.map((item: any) => ({
                                value: String(item.id),
                                label: item.name
                            })));
                            const newItem = res.data.data.find((item: any) => item.name === trimmedName);
                            if (newItem) {
                                setSelectedProductType({ value: String(newItem.id), label: newItem.name });
                                setProductData(prev => ({ ...prev, typeId: String(newItem.id) }));
                            }
                        }
                        setIsTypeModalOpen(false);
                    }
                    break;
            }
            setNewItemName("");
        } catch (error: any) {
            console.error(`Error creating ${type}:`, error);
            toast.error(error.response?.data?.message || `Failed to create ${type}`);
        } finally {
            setIsAddingItem(false);
        }
    };

    const openModal = (type: 'category' | 'brand' | 'unit' | 'type') => {
        setNewItemName("");
        switch (type) {
            case 'category': setIsCategoryModalOpen(true); break;
            case 'brand': setIsBrandModalOpen(true); break;
            case 'unit': setIsUnitModalOpen(true); break;
            case 'type': setIsTypeModalOpen(true); break;
        }
    };

    const handleAddVariation = () => {
        if (currentVariation.color || currentVariation.size || currentVariation.storage || currentVariation.barcode) {
            setVariations([...variations, currentVariation]);
            setCurrentVariation({ color: "", size: "", storage: "", barcode: "" });
            toast.success('Variation added successfully');
        } else {
            toast.error('Please fill at least one variation field');
        }
    };

    const fetchProducts = async () => {
        setIsLoadingProducts(true);
        try {
            const response = await productService.getProducts();
            const result = response.data;

            if (result.success) {
                setSalesData(result.data);
                setTotalItems(result.data.length);
                setCurrentPage(1);
                setSelectedIndex(0);
            }
        } catch (error) {
            console.error('Error fetching products:', error);
            toast.error('Failed to load products');
        } finally {
            setIsLoadingProducts(false);
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

            const createProductPromise = productService.createProduct({
                productData: {
                    name: productData.name,
                    code: productData.code,
                    barcode: mainBarcode,
                    categoryId: parseInt(productData.categoryId) || 0,
                    brandId: parseInt(productData.brandId) || 0,
                    unitId: parseInt(productData.unitId) || 0,
                    typeId: parseInt(productData.typeId) || 0,
                    statusId: 1
                },
                variations: processedVariations
            });

            await toast.promise(
                createProductPromise,
                {
                    loading: 'Creating product...',
                    success: (res) => {
                        fetchProducts();
                        return res.data.message || 'Product created successfully!';
                    },
                    error: (err) => err.response?.data?.message || 'Failed to create product'
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
        toast.success('Variation removed');
    };

    useEffect(() => {
        const fetchDropdownData = async () => {
            try {
                const [categoriesRes, brandsRes, unitsRes, productTypesRes] = await Promise.all([
                    categoryService.getCategories(),
                    brandService.getBrands(),
                    unitService.getUnits(),
                    productTypeService.getProductTypes(),
                ]);

                if (categoriesRes.data.success) {
                    setCategories(categoriesRes.data.data.map((item: { id: number; name: string }) => ({
                        value: String(item.id),
                        label: item.name
                    })));
                }

                if (brandsRes.data.success) {
                    setBrands(brandsRes.data.data.map((item: { id: number; name: string }) => ({
                        value: String(item.id),
                        label: item.name
                    })));
                }

                if (unitsRes.data.success) {
                    setUnits(unitsRes.data.data.map((item: { id: number; name: string }) => ({
                        value: String(item.id),
                        label: item.name
                    })));
                }

                if (productTypesRes.data.success) {
                    setProductType(productTypesRes.data.data.map((item: { id: number; name: string }) => ({
                        value: String(item.id),
                        label: item.name
                    })));
                }
            } catch (error) {
                console.error('Error fetching dropdown data:', error);
                toast.error('Failed to load dropdown data');
            }
        };

        fetchDropdownData();
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
    }, [currentPageData.length, isSubmitting, productData, variations]);

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
                        Create New Product
                    </h1>
                </div>

                <div
                    className={"bg-white rounded-xl p-6 flex flex-col shadow-lg"}
                >
                    <div className="flex items-center gap-2 mb-4">
                        <Package className="text-emerald-600" size={24} />
                        <h2 className="text-xl font-semibold text-gray-700">Product Information</h2>
                    </div>

                    <div className={"grid md:grid-cols-5 gap-4"}>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                Product Name
                            </label>
                            <input
                                type="text"
                                value={productData.name}
                                onChange={(e) => setProductData({ ...productData, name: e.target.value })}
                                placeholder="Enter Product Name"
                                className="w-full text-sm rounded-lg py-2 px-3 border-2 border-gray-200 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-200 transition-all outline-none"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                Product Code
                            </label>
                            <input
                                type="text"
                                value={productData.code}
                                onChange={(e) => setProductData({ ...productData, code: e.target.value })}
                                placeholder="Enter Product Code"
                                className="w-full text-sm rounded-lg py-2 px-3 border-2 border-gray-200 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-200 transition-all outline-none"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                Barcode (Optional)
                            </label>
                            <input
                                type="text"
                                value={productData.barcode}
                                onChange={(e) => setProductData({ ...productData, barcode: e.target.value })}
                                placeholder="Auto-generated if empty"
                                className="w-full text-sm rounded-lg py-2 px-3 border-2 border-gray-200 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-200 transition-all outline-none"
                            />
                        </div>
                        <div>
                            <div className="flex justify-between items-center mb-1">
                                <label className="block text-sm font-medium text-gray-700">
                                    Category
                                </label>
                                <button
                                    onClick={() => openModal('category')}
                                    className="p-1 text-emerald-600 hover:bg-emerald-50 rounded-full transition-colors"
                                    title="Add Category"
                                >
                                    <Plus size={16} />
                                </button>
                            </div>
                            <TypeableSelect
                                options={categories}
                                value={selectedCategory?.value || null}
                                onChange={(option) => {
                                    setSelectedCategory(option);
                                    setProductData({ ...productData, categoryId: option?.value ? String(option.value) : "" });
                                }}
                                placeholder="Select category..."
                            />
                        </div>
                        <div>
                            <div className="flex justify-between items-center mb-1">
                                <label className="block text-sm font-medium text-gray-700">
                                    Brand
                                </label>
                                <button
                                    onClick={() => openModal('brand')}
                                    className="p-1 text-emerald-600 hover:bg-emerald-50 rounded-full transition-colors"
                                    title="Add Brand"
                                >
                                    <Plus size={16} />
                                </button>
                            </div>
                            <TypeableSelect
                                options={brands}
                                value={selectedBrand?.value || null}
                                onChange={(option) => {
                                    setSelectedBrand(option);
                                    setProductData({ ...productData, brandId: option?.value ? String(option.value) : "" });
                                }}
                                placeholder="Select brand..."
                            />
                        </div>
                        <div>
                            <div className="flex justify-between items-center mb-1">
                                <label className="block text-sm font-medium text-gray-700">
                                    Unit
                                </label>
                                <button
                                    onClick={() => openModal('unit')}
                                    className="p-1 text-emerald-600 hover:bg-emerald-50 rounded-full transition-colors"
                                    title="Add Unit"
                                >
                                    <Plus size={16} />
                                </button>
                            </div>
                            <TypeableSelect
                                options={units}
                                value={selectedUnit?.value || null}
                                onChange={(option) => {
                                    setSelectedUnit(option);
                                    setProductData({ ...productData, unitId: option?.value ? String(option.value) : "" });
                                }}
                                placeholder="Select unit..."
                            />
                        </div>
                        <div>
                            <div className="flex justify-between items-center mb-1">
                                <label className="block text-sm font-medium text-gray-700">
                                    Product Type
                                </label>
                                <button
                                    onClick={() => openModal('type')}
                                    className="p-1 text-emerald-600 hover:bg-emerald-50 rounded-full transition-colors"
                                    title="Add Product Type"
                                >
                                    <Plus size={16} />
                                </button>
                            </div>
                            <TypeableSelect
                                options={productType}
                                value={selectedProductType?.value || null}
                                onChange={(option) => {
                                    setSelectedProductType(option);
                                    setProductData({ ...productData, typeId: option?.value ? String(option.value) : "" });
                                }}
                                placeholder="Select type..."
                            />
                        </div>
                    </div>

                    <h2 className="text-xl font-semibold text-gray-700 mt-6 mb-4">Product Variations (Optional)</h2>

                    <div className="grid md:grid-cols-5 gap-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                Color
                            </label>
                            <input
                                type="text"
                                value={currentVariation.color}
                                onChange={(e) => setCurrentVariation({ ...currentVariation, color: e.target.value })}
                                placeholder="Enter Color"
                                className="w-full text-sm rounded-lg py-2 px-3 border-2 border-gray-200 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-200 transition-all outline-none"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                Size
                            </label>
                            <input
                                type="text"
                                value={currentVariation.size}
                                onChange={(e) => setCurrentVariation({ ...currentVariation, size: e.target.value })}
                                placeholder="Enter Size"
                                className="w-full text-sm rounded-lg py-2 px-3 border-2 border-gray-200 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-200 transition-all outline-none"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                Storage/Capacity
                            </label>
                            <input
                                type="text"
                                value={currentVariation.storage}
                                onChange={(e) => setCurrentVariation({ ...currentVariation, storage: e.target.value })}
                                placeholder="Enter Storage"
                                className="w-full text-sm rounded-lg py-2 px-3 border-2 border-gray-200 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-200 transition-all outline-none"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                Barcode (Optional)
                            </label>
                            <input
                                type="text"
                                value={currentVariation.barcode}
                                onChange={(e) => setCurrentVariation({ ...currentVariation, barcode: e.target.value })}
                                placeholder="Auto-generated if empty"
                                className="w-full text-sm rounded-lg py-2 px-3 border-2 border-gray-200 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-200 transition-all outline-none"
                            />
                        </div>
                        <div className="flex items-end">
                            <button
                                onClick={handleAddVariation}
                                className="flex items-center justify-center gap-2 w-full py-2 px-4 bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white font-medium rounded-lg shadow-lg shadow-blue-200 transition-all"
                            >
                                <Plus size={16} />
                                Add Variation
                            </button>
                        </div>
                    </div>

                    {variations.length > 0 && (
                        <div className="mt-4">
                            <h3 className="text-sm font-semibold text-gray-700 mb-2">Added Variations:</h3>
                            <div className="space-y-2">
                                {variations.map((variation, index) => (
                                    <div key={index} className="flex items-center justify-between bg-gray-50 p-3 rounded-lg border border-gray-200">
                                        <div className="flex gap-4 text-sm">
                                            {variation.color && <span><strong>Color:</strong> {variation.color}</span>}
                                            {variation.size && <span><strong>Size:</strong> {variation.size}</span>}
                                            {variation.storage && <span><strong>Storage:</strong> {variation.storage}</span>}
                                            {variation.barcode && <span><strong>Barcode:</strong> {variation.barcode}</span>}
                                        </div>
                                        <button
                                            onClick={() => handleRemoveVariation(index)}
                                            className="p-2 hover:bg-red-100 text-red-600 rounded-lg transition-colors"
                                        >
                                            <Trash2 size={16} />
                                        </button>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}

                    <div className="flex justify-end mt-6">
                        <button
                            onClick={handleSubmitProduct}
                            disabled={isSubmitting}
                            className={`flex items-center gap-2 px-6 py-2.5 bg-gradient-to-r from-emerald-500 to-emerald-600 hover:from-emerald-600 hover:to-emerald-700 text-white font-medium rounded-lg shadow-lg shadow-emerald-200 transition-all ${isSubmitting ? 'opacity-50 cursor-not-allowed' : ''
                                }`}
                        >
                            {isSubmitting ? 'Creating...' : 'Create Product'}
                            <span className="text-xs text-emerald-100">(Shift + Enter)</span>
                        </button>
                    </div>
                </div>

                <div

                    className={"flex flex-col bg-white rounded-xl h-full p-6 justify-between shadow-lg"}
                >
                    <span className="text-lg font-semibold text-gray-800 block mb-4">Product List</span>
                    <div className="overflow-y-auto max-h-md md:h-[320px] lg:h-[320px] rounded-lg scrollbar-thin scrollbar-thumb-emerald-300 scrollbar-track-gray-100">
                        <table className="min-w-full divide-y divide-gray-200">
                            <thead className="bg-gradient-to-r from-emerald-600 to-emerald-700 sticky top-0 z-10">
                                <tr>
                                    {['Product ID', 'Product Name', 'Code', 'Barcode', 'Category', 'Brand', 'Unit', 'Type', 'Color', 'Size', 'Storage', 'Created On'].map((header, i, arr) => (
                                        <th
                                            key={i}
                                            className={`px-6 py-3 text-left text-sm font-medium text-white tracking-wider ${i === 0 ? 'rounded-tl-lg' : i === arr.length - 1 ? 'rounded-tr-lg' : ''
                                                }`}
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
                                ) : (
                                    currentPageData.map((product, index) => (
                                        <tr
                                            key={product.productID}
                                            onClick={() => setSelectedIndex(index)}
                                            className={`cursor-pointer transition-colors ${selectedIndex === index
                                                ? "bg-emerald-50 border-l-4 border-emerald-600"
                                                : "hover:bg-emerald-50/50"
                                                }`}
                                        >
                                            <td className="px-6 py-2 whitespace-nowrap text-sm font-medium">{product.productID}</td>
                                            <td className="px-6 py-2 whitespace-nowrap text-sm font-medium">{product.productName}</td>
                                            <td className="px-6 py-2 whitespace-nowrap text-sm font-medium">{product.productCode}</td>
                                            <td className="px-6 py-2 whitespace-nowrap text-sm font-medium">{product.barcode}</td>
                                            <td className="px-6 py-2 whitespace-nowrap text-sm font-medium">{product.category}</td>
                                            <td className="px-6 py-2 whitespace-nowrap text-sm font-medium">{product.brand}</td>
                                            <td className="px-6 py-2 whitespace-nowrap text-sm font-medium">{product.unit}</td>
                                            <td className="px-6 py-2 whitespace-nowrap text-sm font-medium">{product.productType}</td>
                                            <td className="px-6 py-2 whitespace-nowrap text-sm font-medium">{product.color}</td>
                                            <td className="px-6 py-2 whitespace-nowrap text-sm font-medium">{product.size}</td>
                                            <td className="px-6 py-2 whitespace-nowrap text-sm font-medium">{product.storage}</td>
                                            <td className="px-6 py-2 whitespace-nowrap text-sm font-medium">{product.createdOn}</td>
                                        </tr>
                                    ))
                                )}
                            </tbody>
                        </table>
                    </div>

                    <nav className="bg-white flex items-center justify-between sm:px-6 pt-4 border-t-2 border-gray-100">
                        <div className="text-sm text-gray-600">
                            Showing <span className="font-medium text-emerald-600">{currentPageData.length === 0 ? 0 : startIndex + 1}</span> to <span className="font-medium text-emerald-600">{Math.min(endIndex, totalItems)}</span> of <span className="font-medium text-emerald-600">{totalItems}</span> products
                        </div>
                        <div className="flex items-center space-x-2">
                            <button
                                onClick={goToPreviousPage}
                                disabled={currentPage === 1}
                                className={`flex items-center px-3 py-2 text-sm font-medium rounded-lg transition-all ${currentPage === 1
                                    ? 'text-gray-300 cursor-not-allowed'
                                    : 'text-gray-600 hover:bg-emerald-50 hover:text-emerald-600'
                                    }`}
                            >
                                <ChevronLeft className="mr-1 h-4 w-4" /> Previous
                            </button>

                            {getPageNumbers().map((page, idx) => (
                                typeof page === 'number' ? (
                                    <button
                                        key={idx}
                                        onClick={() => goToPage(page)}
                                        className={`px-4 py-2 text-sm font-medium rounded-lg transition-all ${currentPage === page
                                            ? 'bg-gradient-to-r from-emerald-500 to-emerald-600 text-white shadow-lg shadow-emerald-200'
                                            : 'text-gray-600 hover:bg-emerald-50'
                                            }`}
                                    >
                                        {page}
                                    </button>
                                ) : (
                                    <span key={idx} className="text-gray-400 px-2">...</span>
                                )
                            ))}

                            <button
                                onClick={goToNextPage}
                                disabled={currentPage === totalPages}
                                className={`flex items-center px-3 py-2 text-sm font-medium rounded-lg transition-all ${currentPage === totalPages
                                    ? 'text-gray-300 cursor-not-allowed'
                                    : 'text-gray-600 hover:bg-emerald-50 hover:text-emerald-600'
                                    }`}
                            >
                                Next <ChevronRight className="ml-1 h-4 w-4" />
                            </button>
                        </div>
                    </nav>
                </div>
                {/* Simple Add Modal Component */}
                {[{
                    isOpen: isCategoryModalOpen,
                    title: "Add New Category",
                    type: 'category' as const,
                    onClose: () => setIsCategoryModalOpen(false)
                }, {
                    isOpen: isBrandModalOpen,
                    title: "Add New Brand",
                    type: 'brand' as const,
                    onClose: () => setIsBrandModalOpen(false)
                }, {
                    isOpen: isUnitModalOpen,
                    title: "Add New Unit",
                    type: 'unit' as const,
                    onClose: () => setIsUnitModalOpen(false)
                }, {
                    isOpen: isTypeModalOpen,
                    title: "Add New Product Type",
                    type: 'type' as const,
                    onClose: () => setIsTypeModalOpen(false)
                }].map((modal) => (
                    modal.isOpen && (
                        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm" key={modal.type}>
                            <div className="bg-white rounded-2xl shadow-2xl p-6 w-full max-w-sm relative animate-in fade-in zoom-in duration-200">
                                <button
                                    onClick={modal.onClose}
                                    className="absolute top-4 right-4 p-1 hover:bg-gray-100 rounded-full transition-colors"
                                >
                                    <X size={20} className="text-gray-500" />
                                </button>

                                <h3 className="text-xl font-semibold text-gray-800 mb-4">{modal.title}</h3>

                                <div className="space-y-4">
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">
                                            Name
                                        </label>
                                        <input
                                            type="text"
                                            value={newItemName}
                                            onChange={(e) => setNewItemName(e.target.value)}
                                            onKeyDown={(e) => {
                                                if (e.key === 'Enter') {
                                                    handleQuickAdd(modal.type);
                                                }
                                            }}
                                            autoFocus
                                            placeholder={`Enter ${modal.type} name`}
                                            className="w-full text-sm rounded-lg py-2 px-3 border-2 border-gray-200 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-200 transition-all outline-none"
                                        />
                                    </div>

                                    <div className="flex justify-end gap-3 pt-2">
                                        <button
                                            onClick={modal.onClose}
                                            className="px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
                                        >
                                            Cancel
                                        </button>
                                        <button
                                            onClick={() => handleQuickAdd(modal.type)}
                                            disabled={isAddingItem}
                                            className="px-4 py-2 text-sm font-medium bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg shadow-md hover:shadow-lg transition-all flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                                        >
                                            {isAddingItem && <Loader2 size={14} className="animate-spin" />}
                                            Add
                                        </button>
                                    </div>
                                </div>
                            </div>
                        </div>
                    )
                ))}
            </div>
        </>
    );
}

export default CreateProducts;