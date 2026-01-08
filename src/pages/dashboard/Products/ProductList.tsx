import {
    Barcode,
    ChevronLeft,
    ChevronRight,
    FileText,
    Pencil,
    RefreshCw,
    SearchCheck,
    Trash,
    X,
} from "lucide-react";
import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import toast, { Toaster } from "react-hot-toast";
import TypeableSelect from "../../../components/TypeableSelect.tsx";
import axiosInstance from "../../../api/axiosInstance";
import ConfirmationModal from "../../../components/modals/ConfirmationModal";
import { categoryService } from "../../../services/categoryService";
import { brandService } from "../../../services/brandService";
import { unitService } from "../../../services/unitService";
import { productTypeService } from "../../../services/productTypeService";

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
    value: string;
    label: string;
};

function ProductList() {
    const [isEditModalOpen, setIsEditModalOpen] = useState(false);
    const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);

    const [salesData, setSalesData] = useState<Product[]>([]);
    const [currentPage, setCurrentPage] = useState(1);
    const [itemsPerPage] = useState(10);
    const [totalItems, setTotalItems] = useState(0);
    const [isLoadingProducts, setIsLoadingProducts] = useState(false);

    const [brands, setBrands] = useState<SelectOption[]>([]);
    const [units, setUnits] = useState<SelectOption[]>([]);
    const [categories, setCategories] = useState<SelectOption[]>([]);
    const [productType, setProductType] = useState<SelectOption[]>([]);

    const [editFormData, setEditFormData] = useState({
        productName: "",
        productCode: "",
        barcode: "",
        categoryId: "",
        brandId: "",
        unitId: "",
        typeId: "",
        color: "",
        size: "",
        storage: ""
    });

    const [isUpdating, setIsUpdating] = useState(false);

    const [isConfirmModalOpen, setIsConfirmModalOpen] = useState(false);
    const [productToDeactivate, setProductToDeactivate] = useState<Product | null>(null);
    const [isDeactivating, setIsDeactivating] = useState(false);

    const [selected, setSelected] = useState<SelectOption | null>(null);
    const [searchTerm, setSearchTerm] = useState("");

    const color = [
        { value: "red", label: "Red" },
        { value: "yellow", label: "Yellow" },
        { value: "green", label: "Green" },
    ];

    const [selectedIndex, setSelectedIndex] = useState(0);

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
    }, []);

    const fetchProducts = async () => {
        setIsLoadingProducts(true);
        try {
            const response = await axiosInstance.get('/api/products');
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

    const handleSearch = async () => {
        setIsLoadingProducts(true);
        try {
            const params: Record<string, string> = {};
            if (selected?.value) {
                params.productTypeId = selected.value;
            }
            if (searchTerm.trim()) {
                params.searchTerm = searchTerm.trim();
            }

            const response = await axiosInstance.get('/api/products/search', { params });
            const result = response.data;

            if (result.success) {
                setSalesData(result.data);
                setTotalItems(result.data.length);
                setCurrentPage(1);
                setSelectedIndex(0);
            }
        } catch (error) {
            console.error('Error searching products:', error);
            toast.error('Search failed');
        } finally {
            setIsLoadingProducts(false);
        }
    };

    const handleClear = () => {
        setSelected(null);
        setSearchTerm("");
        fetchProducts();
    };

    useEffect(() => {
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
        if (selectedProduct && isEditModalOpen) {
            const categoryMatch = categories.find(c => c.label === selectedProduct.category);
            const brandMatch = brands.find(b => b.label === selectedProduct.brand);
            const unitMatch = units.find(u => u.label === selectedProduct.unit);
            const typeMatch = productType.find(t => t.label === selectedProduct.productType);

            setEditFormData({
                productName: selectedProduct.productName || "",
                productCode: selectedProduct.productCode || "",
                barcode: selectedProduct.barcode || "",
                categoryId: categoryMatch?.value || "",
                brandId: brandMatch?.value || "",
                unitId: unitMatch?.value || "",
                typeId: typeMatch?.value || "",
                color: selectedProduct.color || "",
                size: selectedProduct.size || "",
                storage: selectedProduct.storage || ""
            });
        }
    }, [selectedProduct, isEditModalOpen, categories, brands, units, productType]);

    const handleUpdateProduct = async () => {
        setIsUpdating(true);

        const updatePromise = axiosInstance.put(`/api/products/update/${selectedProduct?.productID}`, {
            productData: {
                name: editFormData.productName,
                code: editFormData.productCode,
                categoryId: parseInt(editFormData.categoryId) || 0,
                brandId: parseInt(editFormData.brandId) || 0,
                unitId: parseInt(editFormData.unitId) || 0,
                typeId: parseInt(editFormData.typeId) || 0
            },
            variationData: {
                barcode: editFormData.barcode,
                color: editFormData.color,
                size: editFormData.size,
                storage: editFormData.storage
            }
        });

        try {
            await toast.promise(updatePromise, {
                loading: 'Updating product...',
                success: (res) => {
                    setIsEditModalOpen(false);
                    fetchProducts();
                    return res.data.message || 'Product updated successfully!';
                },
                error: (err) => err.response?.data?.message || 'Failed to update product'
            });
        } catch (error) {
            console.error('Error updating product:', error);
        } finally {
            setIsUpdating(false);
        }
    };

    const handleDeactivateProduct = (product: Product, e: React.MouseEvent) => {
        e.stopPropagation();
        setProductToDeactivate(product);
        setIsConfirmModalOpen(true);
    };

    const confirmDeactivateProduct = async () => {
        if (!productToDeactivate) return;

        setIsDeactivating(true);

        const deactivatePromise = axiosInstance.patch(
            `/api/products/status/${productToDeactivate.productID}`,
            { statusId: 2 }
        );

        try {
            await toast.promise(deactivatePromise, {
                loading: 'Deactivating product...',
                success: (res) => {
                    fetchProducts();
                    return res.data.message || 'Product deactivated successfully!';
                },
                error: (err) => err.response?.data?.message || 'Failed to deactivate product'
            });
        } catch (error) {
            console.error('Error deactivating product:', error);
        } finally {
            setIsDeactivating(false);
            setIsConfirmModalOpen(false);
            setProductToDeactivate(null);
        }
    };

    const cancelDeactivateProduct = () => {
        setIsConfirmModalOpen(false);
        setProductToDeactivate(null);
    };

    const EditProductModal = () => {
        if (!isEditModalOpen || !selectedProduct) return null;

        return (
            <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 backdrop-blur-sm">
                <motion.div
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="bg-white rounded-2xl p-8 w-full max-w-7xl max-h-[90vh] overflow-y-auto shadow-2xl"
                >
                    <div className="flex justify-between items-center mb-6">
                        <h2 className="text-2xl font-bold bg-gradient-to-r from-gray-800 to-gray-600 bg-clip-text text-transparent">
                            Edit Product
                        </h2>
                        <button
                            onClick={() => setIsEditModalOpen(false)}
                            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                        >
                            <X size={24} />
                        </button>
                    </div>

                    <div className="bg-gradient-to-br from-gray-50 to-white rounded-xl p-6 border border-gray-100">
                        <h3 className="text-lg font-semibold text-gray-700 mb-4">Basic Product Information</h3>

                        <div className="grid md:grid-cols-3 gap-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    Product Name
                                </label>
                                <input
                                    type="text"
                                    value={editFormData.productName}
                                    onChange={(e) => setEditFormData({ ...editFormData, productName: e.target.value })}
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
                                    value={editFormData.productCode}
                                    onChange={(e) => setEditFormData({ ...editFormData, productCode: e.target.value })}
                                    placeholder="Enter Product Code"
                                    className="w-full text-sm rounded-lg py-2 px-3 border-2 border-gray-200 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-200 transition-all outline-none"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    Barcode
                                </label>
                                <input
                                    type="text"
                                    value={editFormData.barcode}
                                    onChange={(e) => setEditFormData({ ...editFormData, barcode: e.target.value })}
                                    placeholder="Enter Barcode"
                                    className="w-full text-sm rounded-lg py-2 px-3 border-2 border-gray-200 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-200 transition-all outline-none"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    Category
                                </label>
                                <TypeableSelect
                                    options={categories}
                                    value={editFormData.categoryId || null}
                                    onChange={(opt) =>
                                        setEditFormData({
                                            ...editFormData,
                                            categoryId: opt ? String(opt.value) : ""
                                        })
                                    }
                                    placeholder="Type to search categories"
                                    
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    Brand
                                </label>
                                <TypeableSelect
                                    options={brands}
                                    value={editFormData.brandId || null}
                                    onChange={(opt) =>
                                        setEditFormData({
                                            ...editFormData,
                                            brandId: opt ? String(opt.value) : ""
                                        })
                                    }
                                    placeholder="Type to search brands"
                                   
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    Unit
                                </label>
                                <TypeableSelect
                                    options={units}
                                    value={editFormData.unitId || null}
                                    onChange={(opt) =>
                                        setEditFormData({
                                            ...editFormData,
                                            unitId: opt ? String(opt.value) : ""
                                        })
                                    }
                                    placeholder="Type to search units"
                                   
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    Product Type
                                </label>
                                <TypeableSelect
                                    options={productType}
                                    value={editFormData.typeId || null}
                                    onChange={(opt) =>
                                        setEditFormData({
                                            ...editFormData,
                                            typeId: opt ? String(opt.value) : ""
                                        })
                                    }
                                    placeholder="Type to search types"
                                    
                                />
                            </div>
                        </div>

                        <h3 className="text-lg font-semibold text-gray-700 my-4">Product Variations (Optional)</h3>

                        <div className="grid md:grid-cols-3 gap-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    Color
                                </label>
                                <TypeableSelect
                                    options={color}
                                    value={editFormData.color || null}
                                    onChange={(opt) =>
                                        setEditFormData({ ...editFormData, color: opt?.label || "" })
                                    }
                                    placeholder="Type to search Color"
                                    
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    Size
                                </label>
                                <input
                                    type="number"
                                    value={editFormData.size}
                                    onChange={(e) => setEditFormData({ ...editFormData, size: e.target.value })}
                                    placeholder="Enter Size"
                                    className="w-full text-sm rounded-lg py-2 px-3 border-2 border-gray-200 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-200 transition-all outline-none"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    Storage/Capacity
                                </label>
                                <input
                                    type="number"
                                    value={editFormData.storage}
                                    onChange={(e) => setEditFormData({ ...editFormData, storage: e.target.value })}
                                    placeholder="Enter Storage/Capacity"
                                    className="w-full text-sm rounded-lg py-2 px-3 border-2 border-gray-200 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-200 transition-all outline-none"
                                />
                            </div>
                        </div>

                        <div className="flex justify-end gap-3 mt-6">
                            <button
                                onClick={() => setIsEditModalOpen(false)}
                                className="px-6 py-2.5 bg-gray-100 hover:bg-gray-200 text-gray-700 font-medium rounded-lg transition-all"
                            >
                                Cancel
                            </button>
                            <button
                                onClick={handleUpdateProduct}
                                disabled={isUpdating}
                                className={`flex items-center gap-2 px-6 py-2.5 bg-gradient-to-r from-emerald-500 to-emerald-600 hover:from-emerald-600 hover:to-emerald-700 text-white font-medium rounded-lg shadow-lg shadow-emerald-200 transition-all ${isUpdating ? 'opacity-50 cursor-not-allowed' : ''
                                    }`}
                            >
                                {isUpdating ? 'Updating...' : 'Update Product'}
                                <span className="text-xs text-emerald-100">(Shift + Enter)</span>
                            </button>
                        </div>
                    </div>
                </motion.div>
            </div>
        );
    };

    useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            if (e.key === "ArrowDown") {
                setSelectedIndex((prev) => (prev < currentPageData.length - 1 ? prev + 1 : prev));
            } else if (e.key === "ArrowUp") {
                setSelectedIndex((prev) => (prev > 0 ? prev - 1 : prev));
            } else if (e.key === "Enter" && e.shiftKey && isEditModalOpen) {
                e.preventDefault();
                if (!isUpdating) {
                    handleUpdateProduct();
                }
            }
        };

        window.addEventListener("keydown", handleKeyDown);
        return () => window.removeEventListener("keydown", handleKeyDown);
    }, [currentPageData.length, isEditModalOpen, isUpdating]);

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
            <div className="flex flex-col gap-4 h-full">
                <EditProductModal />

                <ConfirmationModal
                    isOpen={isConfirmModalOpen}
                    title="Deactivate Product"
                    message="Are you sure you want to deactivate this {itemType}"
                    itemName={productToDeactivate?.productName || ""}
                    itemType="product"
                    onConfirm={confirmDeactivateProduct}
                    onCancel={cancelDeactivateProduct}
                    isLoading={isDeactivating}
                    confirmButtonText="Deactivate"
                    loadingText="Deactivating..."
                    isDanger={true}
                />

                <div>
                    <div className="text-sm text-gray-400 flex items-center">
                        <span>Products</span>
                        <span className="mx-2">›</span>
                        <span className="text-gray-700 font-medium">Product List</span>
                    </div>
                    <h1 className="text-3xl font-semibold bg-gradient-to-r from-gray-800 to-gray-600 bg-clip-text text-transparent">
                        Product List
                    </h1>
                </div>

                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="bg-white rounded-xl p-6 shadow-lg"
                >
                    <div className="grid md:grid-cols-5 gap-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                Product Type
                            </label>
                            <TypeableSelect
                                options={productType}
                                value={selected?.value || null}
                                onChange={(opt) => opt ? setSelected({ value: String(opt.value), label: opt.label }) : setSelected(null)}
                                placeholder="Search Product Types..."
                                
                            />
                        </div>
                        <div className="md:col-span-2">
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                Product ID / Name
                            </label>
                            <input
                                type="text"
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
                                placeholder="Enter Product ID, Name, Code or Barcode..."
                                className="w-full text-sm rounded-lg py-2 px-3 border-2 border-gray-200 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-200 transition-all outline-none"
                            />
                        </div>
                        <div className="grid md:items-end gap-2">
                            <button
                                onClick={handleSearch}
                                className="flex items-center justify-center gap-2 py-2 px-4 bg-gradient-to-r from-emerald-500 to-emerald-600 hover:from-emerald-600 hover:to-emerald-700 text-white font-medium rounded-lg shadow-lg shadow-emerald-200 transition-all"
                            >
                                <SearchCheck size={16} />
                                Search
                            </button>
                        </div>
                        <div className="grid md:items-end gap-2">
                            <button
                                onClick={handleClear}
                                className="flex items-center justify-center gap-2 py-2 px-4 bg-gradient-to-r from-gray-500 to-gray-600 hover:from-gray-600 hover:to-gray-700 text-white font-medium rounded-lg shadow-lg shadow-gray-200 transition-all"
                            >
                                <RefreshCw size={16} />
                                Clear
                            </button>
                        </div>
                    </div>
                </motion.div>

                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="flex flex-col bg-white rounded-xl p-6 justify-between gap-6 shadow-lg"
                >
                    <div className="overflow-y-auto max-h-md md:h-[320px] lg:h-[520px] rounded-lg scrollbar-thin scrollbar-thumb-emerald-300 scrollbar-track-gray-100">
                        <table className="min-w-full divide-y divide-gray-200">
                            <thead className="bg-gradient-to-r from-emerald-600 to-emerald-700 sticky top-0 z-10">
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
                                            className={`px-6 py-3 text-left text-sm font-medium text-white tracking-wider ${i === 0 ? "rounded-tl-lg" : ""
                                                } ${i === arr.length - 1 ? "rounded-tr-lg" : ""}`}
                                        >
                                            {header}
                                        </th>
                                    ))}
                                </tr>
                            </thead>

                            <tbody className="bg-white divide-y divide-gray-200">
                                {isLoadingProducts ? (
                                    <tr>
                                        <td colSpan={13} className="px-6 py-8 text-center text-gray-500">
                                            Loading products...
                                        </td>
                                    </tr>
                                ) : currentPageData.length === 0 ? (
                                    <tr>
                                        <td colSpan={13} className="px-6 py-8 text-center text-gray-500">
                                            No products found
                                        </td>
                                    </tr>
                                ) : currentPageData.map((sale, index) => (
                                    <tr
                                        key={index}
                                        onClick={() => setSelectedIndex(index)}
                                        className={`cursor-pointer transition-colors ${index === selectedIndex
                                                ? "bg-emerald-50 border-l-4 border-emerald-600"
                                                : "hover:bg-emerald-50/50"
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
                                        <td className="px-6 py-2 whitespace-nowrap text-sm font-medium flex gap-2">
                                            <div className="relative group">
                                                <button
                                                    onClick={(e) => {
                                                        e.stopPropagation();
                                                        setSelectedProduct(sale);
                                                        setIsEditModalOpen(true);
                                                    }}
                                                    className="p-2 bg-gradient-to-r from-blue-100 to-blue-200 rounded-lg text-blue-700 hover:from-blue-200 hover:to-blue-300 transition-all shadow-sm"
                                                >
                                                    <Pencil size={15} />
                                                </button>
                                                <span className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 w-max px-2 py-1 text-xs text-white bg-gray-900 rounded-md invisible group-hover:visible opacity-0 group-hover:opacity-100 transition-opacity">
                                                    Edit Product
                                                </span>
                                            </div>

                                            <div className="relative group">
                                                <button className="p-2 bg-gradient-to-r from-yellow-100 to-yellow-200 rounded-lg text-yellow-700 hover:from-yellow-200 hover:to-yellow-300 transition-all shadow-sm">
                                                    <Barcode size={15} />
                                                </button>
                                                <span className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 w-max px-2 py-1 text-xs text-white bg-gray-900 rounded-md invisible group-hover:visible opacity-0 group-hover:opacity-100 transition-opacity">
                                                    Print Barcode
                                                </span>
                                            </div>

                                            <div className="relative group">
                                                <button
                                                    onClick={(e) => handleDeactivateProduct(sale, e)}
                                                    className="p-2 bg-gradient-to-r from-red-100 to-red-200 rounded-lg text-red-700 hover:from-red-200 hover:to-red-300 transition-all shadow-sm"
                                                >
                                                    <Trash size={15} />
                                                </button>
                                                <span className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 w-max px-2 py-1 text-xs text-white bg-gray-900 rounded-md invisible group-hover:visible opacity-0 group-hover:opacity-100 transition-opacity">
                                                    Delete Product
                                                </span>
                                            </div>
                                        </td>
                                    </tr>
                                ))}
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
                </motion.div>

                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="bg-white flex justify-center p-4 gap-4 rounded-xl shadow-lg"
                >
                    <button className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-emerald-500 to-emerald-600 hover:from-emerald-600 hover:to-emerald-700 text-white font-medium rounded-lg shadow-lg shadow-emerald-200 hover:shadow-xl transition-all">
                        <FileText size={20} />
                        Export to Excel
                    </button>
                    <button className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white font-medium rounded-lg shadow-lg shadow-blue-200 hover:shadow-xl transition-all">
                        <FileText size={20} />
                        Export to CSV
                    </button>
                    <button className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-red-500 to-red-600 hover:from-red-600 hover:to-red-700 text-white font-medium rounded-lg shadow-lg shadow-red-200 hover:shadow-xl transition-all">
                        <FileText size={20} />
                        Export to PDF
                    </button>

                </motion.div>
            </div>
        </>
    );
}

export default ProductList;