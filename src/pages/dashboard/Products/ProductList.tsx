import {
    Barcode,

    ChevronLeft, ChevronRight,
    FileText, Pencil,

    RefreshCw,
    SearchCheck, Trash, X,
} from "lucide-react";
import {useEffect, useState} from "react";
import TypeableSelect from "../../../components/TypeableSelect.tsx";
import axiosInstance from "../../../api/axiosInstance";
import { commonService } from "../../../services/commonService";

function ProductList() {
    const [isEditModalOpen, setIsEditModalOpen] = useState(false);
    const [selectedProduct, setSelectedProduct] = useState<any | null>(null);

    // Pagination and product data state
    const [salesData, setSalesData] = useState<any[]>([]);
    const [currentPage, setCurrentPage] = useState(1);
    const [itemsPerPage] = useState(10);
    const [totalItems, setTotalItems] = useState(0);
    const [isLoadingProducts, setIsLoadingProducts] = useState(false);

    // State for fetched dropdown data from backend
    const [brands, setBrands] = useState<SelectOption[]>([]);
    const [units, setUnits] = useState<SelectOption[]>([]);
    const [categories, setCategories] = useState<SelectOption[]>([]);
    const [productType, setProductType] = useState<SelectOption[]>([]);

    // Edit form state
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
    const [updateErrorMessage, setUpdateErrorMessage] = useState("");
    const [updateSuccessMessage, setUpdateSuccessMessage] = useState("");


    type SelectOption = {
        value: string;
        label: string;
    };
    const [selected, setSelected] = useState<SelectOption | null>(null);
    const [searchTerm, setSearchTerm] = useState("");

    const color = [
        {value: "red", label: "Red"},
        {value: "yellow", label: "Yellow"},
        {value: "green", label: "Green"},
    ];

    // 🔹 Selected row state
    const [selectedIndex, setSelectedIndex] = useState(0);

    // Fetch dropdown data
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
            }
        };

        fetchDropdownData();
    }, []);

    // Fetch products data
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
        } finally {
            setIsLoadingProducts(false);
        }
    };

    // Search products
    const handleSearch = async () => {
        setIsLoadingProducts(true);
        try {
            const params: any = {};
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
        } finally {
            setIsLoadingProducts(false);
        }
    };

    // Clear filters and fetch all products
    const handleClear = () => {
        setSelected(null);
        setSearchTerm("");
        fetchProducts();
    };

    useEffect(() => {
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

    // Populate form when a product is selected for editing
    useEffect(() => {
        if (selectedProduct && isEditModalOpen) {
            // Find IDs from names
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

    // Handle product update
    const handleUpdateProduct = async () => {
        setUpdateErrorMessage("");
        setUpdateSuccessMessage("");
        setIsUpdating(true);

        try {
            const response = await axiosInstance.put(`/api/products/update/${selectedProduct.productID}`, {
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

            const result = response.data;

            if (result.success) {
                setUpdateSuccessMessage(result.message || "Product updated successfully!");
                
                // Refresh products list
                const productsResponse = await axiosInstance.get('/api/products');
                if (productsResponse.data.success) {
                    setSalesData(productsResponse.data.data);
                    setTotalItems(productsResponse.data.data.length);
                }

                // Close modal after 2 seconds
                setTimeout(() => {
                    setIsEditModalOpen(false);
                    setUpdateSuccessMessage("");
                }, 2000);
            } else {
                setUpdateErrorMessage(result.message || "Failed to update product");
            }
        } catch (error: any) {
            console.error('Error updating product:', error);
            const errorMsg = error.response?.data?.message || "An error occurred while updating the product. Please try again.";
            setUpdateErrorMessage(errorMsg);
        } finally {
            setIsUpdating(false);
        }
    };

    // Handle product deactivate/delete
    const handleDeactivateProduct = async (product: any, e: React.MouseEvent) => {
        e.stopPropagation();
        
        const confirmDeactivate = window.confirm(
            `Are you sure you want to deactivate "${product.productName}"?`
        );
        
        if (!confirmDeactivate) return;

        try {
            const response = await axiosInstance.patch(
                `/api/products/status/${product.productID}`,
                { statusId: 2 } // 2 = Inactive
            );

            const result = response.data;

            if (result.success) {
                alert(result.message || "Product deactivated successfully!");
                
                // Refresh products list
                const productsResponse = await axiosInstance.get('/api/products');
                if (productsResponse.data.success) {
                    setSalesData(productsResponse.data.data);
                    setTotalItems(productsResponse.data.data.length);
                }
            } else {
                alert(result.message || "Failed to deactivate product");
            }
        } catch (error: any) {
            console.error('Error deactivating product:', error);
            const errorMsg = error.response?.data?.message || "An error occurred while deactivating the product. Please try again.";
            alert(errorMsg);
        }
    };

    const EditProductModal = () => {
        if (!isEditModalOpen || !selectedProduct) return null;

        return (
            <div className="fixed inset-0  bg-opacity-50 flex items-center justify-center z-50 bg-white/10 backdrop-blur-sm">
                <div className="bg-white rounded-lg p-6 w-full max-w-7xl max-h-[90vh] overflow-y-auto">
                    <div className="flex justify-between items-center mb-4">
                        <h2 className="text-2xl font-semibold">Edit Product</h2>
                        <button onClick={() => setIsEditModalOpen(false)} className="p-1 hover:bg-gray-100 rounded">
                            <X size={24} />
                        </button>
                    </div>

                    <div className={"bg-white rounded-md p-4 flex flex-col"}>

                        <span className="text-lg font-semibold my-4">Basic Product Information</span>

                        {/* Success Message */}
                        {updateSuccessMessage && (
                            <div className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded relative mb-4" role="alert">
                                <strong className="font-bold">Success! </strong>
                                <span className="block sm:inline">{updateSuccessMessage}</span>
                            </div>
                        )}

                        {/* Error Message */}
                        {updateErrorMessage && (
                            <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative mb-4" role="alert">
                                <strong className="font-bold">Error! </strong>
                                <span className="block sm:inline">{updateErrorMessage}</span>
                            </div>
                        )}

                        <div className={"grid md:grid-cols-3 gap-4 "}>
                            <div>
                                <label
                                    htmlFor="product name"
                                    className="block text-sm font-medium text-gray-700 mb-1"
                                >
                                    Product Name
                                </label>
                                <input
                                    type="text"
                                    id="product name"
                                    value={editFormData.productName}
                                    onChange={(e) => setEditFormData({...editFormData, productName: e.target.value})}
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
                                    value={editFormData.productCode}
                                    onChange={(e) => setEditFormData({...editFormData, productCode: e.target.value})}
                                    placeholder="Enter Product Code"
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
                                    value={editFormData.barcode}
                                    onChange={(e) => setEditFormData({...editFormData, barcode: e.target.value})}
                                    placeholder="Enter Barcode"
                                    className="w-full text-sm rounded-md py-2 px-2  border-2 border-gray-100 "
                                />
                            </div>

                            <div>
                                <label
                                    htmlFor="category"
                                    className="block text-sm font-medium text-gray-700 mb-1"
                                >
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
                                    placeholder="Type to search types"
                                    allowCreate={true}
                                />
                            </div>

                            <div>
                                <label
                                    htmlFor="brand"
                                    className="block text-sm font-medium text-gray-700 mb-1"
                                >
                                    Brand </label>
                                <TypeableSelect
                                    options={brands}
                                    value={editFormData.brandId || null}
                                    onChange={(opt) =>
                                        setEditFormData({
                                            ...editFormData,
                                            brandId: opt ? String(opt.value) : ""
                                        })
                                    }
                                    placeholder="Type to search types"
                                    allowCreate={true}
                                />
                            </div>

                            <div>
                                <label
                                    htmlFor="unit"
                                    className="block text-sm font-medium text-gray-700 mb-1"
                                >
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
                                    placeholder="Type to search Product"
                                    allowCreate={true}
                                />
                            </div>

                            <div>
                                <label
                                    htmlFor="product type"
                                    className="block text-sm font-medium text-gray-700 mb-1"
                                >
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
                                    allowCreate={true}
                                />
                            </div>

                        </div>
                        <span className="text-lg font-semibold my-4">Product Variations (Optional)</span>

                        <div className={"grid md:grid-cols-3 gap-4 "}>
                            <div>
                                <label
                                    htmlFor="color"
                                    className="block text-sm font-medium text-gray-700 mb-1"
                                >
                                    Color
                                </label>
                                <TypeableSelect
                                    options={color}
                                    value={editFormData.color || null}
                                    onChange={(opt) =>
                                        setEditFormData({ ...editFormData, color: opt?.label || "" })
                                    }
                                    placeholder="Type to search Color"
                                    allowCreate={true}
                                />
                            </div>
                            <div>
                                <label
                                    htmlFor="size"
                                    className="block text-sm font-medium text-gray-700 mb-1"
                                >
                                    Size
                                </label>
                                <input
                                    type="number"
                                    id="size"
                                    value={editFormData.size}
                                    onChange={(e) => setEditFormData({ ...editFormData, size: e.target.value })}
                                    placeholder="Enter Size"
                                    className="w-full text-sm rounded-md py-2 px-2  border-2 border-gray-100 "
                                />
                            </div>
                            <div>
                                <label
                                    htmlFor="Storage/Capacity"
                                    className="block text-sm font-medium text-gray-700 mb-1"
                                >
                                    Storage/Capacity
                                </label>
                                <input
                                    type="number"
                                    id="Storage/Capacity"
                                    value={editFormData.storage}
                                    onChange={(e) => setEditFormData({ ...editFormData, storage: e.target.value })}
                                    placeholder="Enter Storage/Capacity"
                                    className="w-full text-sm rounded-md py-2 px-2  border-2 border-gray-100 "
                                />
                            </div>
                        </div>
                        <div
                            className={
                                "flex justify-end md:items-end items-start p-2 gap-2 text-white font-medium  pt-4"
                            }
                        >
                            <button
                                onClick={handleUpdateProduct}
                                disabled={isUpdating}
                                className={
                                    `bg-emerald-600 p-2 rounded-md w-2/6 flex justify-center items-center cursor-pointer ${isUpdating ? 'opacity-50 cursor-not-allowed' : 'hover:bg-emerald-700'}`
                                }
                            >
                                {isUpdating ? 'Updating...' : 'Update Product'} &nbsp;<p className={'text-yellow-400'}>(Shift + Enter)</p>
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        );
    };


    // 🔹 Handle Up / Down arrow keys
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
            <div className={'flex flex-col gap-4 h-full'}>
                <EditProductModal />

                <div>
                    <div className="text-sm text-gray-500 flex items-center">
                        <span>Pages</span>
                        <span className="mx-2">›</span>
                        <span className="text-black">Product List</span>
                    </div>
                    <h1 className="text-3xl font-semibold text-gray-500">Product List</h1>
                </div>

                <div className={'bg-white rounded-md p-4 flex flex-col'}>

                    <div className={'grid md:grid-cols-5 gap-4 '}>
                        <div>
                            <label htmlFor="supplier"
                                   className="block text-sm font-medium text-gray-700 mb-1">Product Type</label>
                            <TypeableSelect
                                options={productType}
                                value={selected?.value || null}
                                onChange={(opt) => opt ? setSelected({ value: String(opt.value), label: opt.label }) : setSelected(null)}
                                placeholder="Search Product Types.."
                                allowCreate={true}
                            />

                        </div>
                        <div>
                            <label htmlFor="product"
                                   className="block text-sm font-medium text-gray-700 mb-1">Product ID / Name</label>
                            <input 
                                type="text" 
                                id="product" 
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
                                placeholder="Enter Product ID, Name, Code or Barcode..."
                                className="w-full text-sm rounded-md py-2 px-2  border-2 border-gray-100 "/>

                        </div>
                        <div className={'grid grid-cols-2 md:items-end items-start gap-2 text-white font-medium'}>
                            <button 
                                onClick={handleSearch}
                                className={'bg-emerald-600 py-2 rounded-md flex items-center justify-center hover:bg-emerald-700 cursor-pointer'}>
                                <SearchCheck className="mr-2" size={14}/>Search
                            </button>
                            <button 
                                onClick={handleClear}
                                className={'bg-gray-500 py-2 rounded-md flex items-center justify-center hover:bg-gray-600 cursor-pointer'}>
                                <RefreshCw className="mr-2" size={14}/>Clear
                            </button>
                        </div>
                    </div>
                </div>
                <div className={'flex flex-col bg-white rounded-md h-full p-4 justify-between'}>
                    <div
                        className="overflow-y-auto max-h-md md:h-[320px] lg:h-[500px] rounded-md scrollbar-thin scrollbar-thumb-gray-300 scrollbar-track-gray-100">
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
                                    <td className="px-6 py-2 whitespace-nowrap text-sm font-medium flex gap-2">
                                        <div className="relative group">
                                            <button
                                                onClick={(e) => {
                                                    e.stopPropagation();
                                                    setSelectedProduct(sale);
                                                    setIsEditModalOpen(true);
                                                }}
                                                className="p-2 bg-green-100 rounded-full text-green-700 hover:bg-green-200 transition-colors cursor-pointer">
                                                <Pencil size={15} />
                                            </button>

                                            <span
                                                className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 w-max px-2 py-1 text-xs text-white bg-gray-900 rounded-md invisible group-hover:visible opacity-0 group-hover:opacity-100 transition-opacity">
                                                    Edit Product
                                                </span>
                                        </div>

                                        <div className="relative group">
                                            <button
                                                className="p-2 bg-yellow-100 rounded-full text-yellow-700 hover:bg-yellow-200 transition-colors cursor-pointer">
                                                <Barcode size={15}/>
                                            </button>
                                            <span
                                                className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 w-max px-2 py-1 text-xs text-white bg-gray-900 rounded-md invisible group-hover:visible opacity-0 group-hover:opacity-100 transition-opacity">
                                                    Print Barcode
                                                </span>
                                        </div>
                                        <div className="relative group">
                                            <button
                                                onClick={(e) => handleDeactivateProduct(sale, e)}
                                                className="p-2 bg-red-100 rounded-full text-red-700 hover:bg-red-200 transition-colors cursor-pointer">
                                                <Trash size={15}/>
                                            </button>
                                            <span
                                                className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 w-max px-2 py-1 text-xs text-white bg-gray-900 rounded-md invisible group-hover:visible opacity-0 group-hover:opacity-100 transition-opacity">
                                                    Delete Product
                                                </span>
                                        </div>
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

                <div className={'bg-white flex justify-center p-4 gap-4'}>
                    <button
                        className={'bg-emerald-600 px-6 py-2 font-medium text-white rounded-md flex gap-2 items-center shadow-sm'}>
                        <FileText size={15}/>Exel
                    </button>
                    <button
                        className={'bg-yellow-600 px-6 py-2 font-medium text-white rounded-md flex gap-2 items-center shadow-sm'}>
                        <FileText size={15}/>CSV
                    </button>
                    <button
                        className={'bg-red-500 px-6 py-2 font-medium text-white rounded-md flex gap-2 items-center shadow-sm'}>
                        <FileText size={15}/>PDF
                    </button>
                </div>
            </div>
        </>
    );
}

export default ProductList;
