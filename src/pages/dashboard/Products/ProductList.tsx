import {

    ChevronLeft,
    ChevronRight,
    FileText,
    Pencil,
    RefreshCw,
    SearchCheck,
    Trash,
    X,
    Eye,
    Boxes,
    Loader2,
} from "lucide-react";
import * as XLSX from 'xlsx';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import { useEffect, useState } from "react";
import toast, { Toaster } from "react-hot-toast";
import TypeableSelect from "../../../components/TypeableSelect.tsx";
import axiosInstance from "../../../api/axiosInstance";
import ConfirmationModal from "../../../components/modals/ConfirmationModal";
import { categoryService } from "../../../services/categoryService";
import { brandService } from "../../../services/brandService";
import { unitService } from "../../../services/unitService";
import { productTypeService } from "../../../services/productTypeService";
import { productService } from "../../../services/productService";


interface Product {
    productID: number;
    pvId: number;
    productName: string;
    productCode: string;
    barcode: string;
    category: string;
    categoryId?: number;
    brand: string;
    brandId?: number;
    unit: string;
    unitId?: number;
    productType: string;
    productTypeId?: number;
    color: string;
    size: string;
    storage: string;
    createdOn: string;
    price: number;
}

type SelectOption = {
    value: string;
    label: string;
};

function ProductList() {
    const [isEditModalOpen, setIsEditModalOpen] = useState(false);
    const [isViewModalOpen, setIsViewModalOpen] = useState(false);
    const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
    const [productVariants, setProductVariants] = useState<Product[]>([]);
    const [isLoadingVariants, setIsLoadingVariants] = useState(false);

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

    const [editingVariantId, setEditingVariantId] = useState<number | null>(null);
    const [variantEditData, setVariantEditData] = useState<any>(null);
    const [isAddingVariant, setIsAddingVariant] = useState(false);
    const [newVariantData, setNewVariantData] = useState({
        barcode: '',
        color: '',
        size: '',
        storage: ''
    });

    const [selectedIndex, setSelectedIndex] = useState(0);

    const [variantToDeactivate, setVariantToDeactivate] = useState<any>(null);

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

    const handleViewProduct = async (product: Product) => {
        setSelectedProduct(product);
        setIsViewModalOpen(true);
        setIsLoadingVariants(true);
        setProductVariants([]);
        try {
            const response = await productService.getProductVariants(product.productID);
            if (response.data.success) {
                // Map id to pvId if needed to ensure display consistency
                const mapped = response.data.data.map((v: any) => ({
                    ...v,
                    pvId: v.pvId || v.id || 0
                }));
                setProductVariants(mapped);
            }
        } catch (error) {
            console.error('Error fetching product variants:', error);
            toast.error('Failed to load product variants');
        } finally {
            setIsLoadingVariants(false);
        }
    };

    const handleEditProduct = async (product: Product) => {
        setSelectedProduct(product);
        setIsEditModalOpen(true);
        setIsLoadingVariants(true);
        setProductVariants([]);
        try {
            const response = await productService.getProductVariants(product.productID);
            if (response.data.success) {
                const mapped = response.data.data.map((v: any) => ({
                    ...v,
                    pvId: v.pvId || v.id || 0
                }));
                setProductVariants(mapped);
            }
        } catch (error) {
            console.error('Error fetching variants for edit:', error);
            toast.error('Failed to load variations');
        } finally {
            setIsLoadingVariants(false);
        }
    };

    const handleDeactivateVariant = (variant: any) => {
        setVariantToDeactivate(variant);
        setIsConfirmModalOpen(true);
    };

    const handleDeactivateConfirm = async () => {
        if (!variantToDeactivate) return;

        setIsDeactivating(true);
        try {
            const response = await productService.changeProductStatus(variantToDeactivate.pvId, 2);
            if (response.data.success) {
                toast.success('Variation deactivated successfully');
                // Refresh variants
                if (selectedProduct) {
                    const res = await productService.getProductVariants(selectedProduct.productID);
                    if (res.data.success) setProductVariants(res.data.data || []);
                }
                // Also refresh main list if needed
                fetchProducts();
                setIsConfirmModalOpen(false);
            }
        } catch (error) {
            console.error('Error deactivating variant:', error);
            toast.error('Failed to deactivate variation');
        } finally {
            setIsDeactivating(false);
            setVariantToDeactivate(null);
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
            // Priority: Use ID if available, otherwise try to match by name (fallback)
            const getCategoryId = () => {
                if (selectedProduct.categoryId) return String(selectedProduct.categoryId);
                const match = categories.find(c => c.label.trim().toLowerCase() === selectedProduct.category?.trim().toLowerCase());
                return match?.value || "";
            };

            const getBrandId = () => {
                if (selectedProduct.brandId) return String(selectedProduct.brandId);
                const match = brands.find(b => b.label.trim().toLowerCase() === selectedProduct.brand?.trim().toLowerCase());
                return match?.value || "";
            };

            const getUnitId = () => {
                if (selectedProduct.unitId) return String(selectedProduct.unitId);
                const match = units.find(u => u.label.trim().toLowerCase() === selectedProduct.unit?.trim().toLowerCase());
                return match?.value || "";
            };

            const getTypeId = () => {
                if (selectedProduct.productTypeId) return String(selectedProduct.productTypeId);
                const match = productType.find(t => t.label.trim().toLowerCase() === selectedProduct.productType?.trim().toLowerCase());
                return match?.value || "";
            };

            setEditFormData({
                productName: selectedProduct.productName || "",
                productCode: selectedProduct.productCode || "",
                barcode: selectedProduct.barcode || "",
                categoryId: getCategoryId(),
                brandId: getBrandId(),
                unitId: getUnitId(),
                typeId: getTypeId(),
                color: selectedProduct.color || "",
                size: selectedProduct.size || "",
                storage: selectedProduct.storage || ""
            });
        }
    }, [selectedProduct, isEditModalOpen, categories, brands, units, productType]);

    const handleUpdateProduct = async () => {
        setIsUpdating(true);

        const updateData = {
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
        };

        const updatePromise = productService.updateProduct(selectedProduct?.pvId || 0, updateData);

        try {
            await toast.promise(updatePromise, {
                loading: 'Updating main product details...',
                success: (res) => {
                    // Update main list
                    fetchProducts();
                    return 'Product details updated successfully!';
                },
                error: (err) => err.response?.data?.message || 'Failed to update product details'
            });
        } catch (error) {
            console.error('Error updating product:', error);
        } finally {
            setIsUpdating(false);
        }
    };

    const handleUpdateVariant = async (variantId: number) => {
        if (!variantEditData) return;

        const updatePromise = productService.updateProduct(variantId, {
            productData: {
                name: editFormData.productName,
                code: editFormData.productCode,
                categoryId: parseInt(editFormData.categoryId) || 0,
                brandId: parseInt(editFormData.brandId) || 0,
                unitId: parseInt(editFormData.unitId) || 0,
                typeId: parseInt(editFormData.typeId) || 0
            },
            variationData: {
                barcode: variantEditData.barcode,
                color: variantEditData.color,
                size: variantEditData.size,
                storage: variantEditData.storage
            }
        });

        toast.promise(updatePromise, {
            loading: 'Updating variation...',
            success: (res) => {
                setEditingVariantId(null);
                setVariantEditData(null);
                // Refresh variants
                if (selectedProduct) handleEditProduct(selectedProduct);
                return 'Variation updated successfully!';
            },
            error: (err) => err.response?.data?.message || 'Failed to update variation'
        });
    };

    const handleAddNewVariant = async () => {
        if (!selectedProduct) {
            return;
        }

        const addPromise = productService.addProductVariation(selectedProduct.productID, newVariantData);

        toast.promise(addPromise, {
            loading: 'Adding new variation...',
            success: (res) => {
                setIsAddingVariant(false);
                setNewVariantData({ barcode: '', color: '', size: '', storage: '' });
                // Refresh variants
                handleEditProduct(selectedProduct);
                return 'New variation added successfully!';
            },
            error: (err) => err.response?.data?.message || 'Failed to add variation'
        });
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
            `/api/products/status/${productToDeactivate.pvId}`,
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



    useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            // Escape to close modals
            if (e.key === "Escape") {
                setIsEditModalOpen(false);
                setIsConfirmModalOpen(false);
            }

            // Arrow navigation for list
            if (e.key === "ArrowDown") {
                // Only navigate if not in an input/textarea
                const target = e.target as HTMLElement;
                if (target.tagName !== 'INPUT' && target.tagName !== 'TEXTAREA') {
                    e.preventDefault();
                    setSelectedIndex((prev) => (prev < currentPageData.length - 1 ? prev + 1 : prev));
                }
            } else if (e.key === "ArrowUp") {
                const target = e.target as HTMLElement;
                if (target.tagName !== 'INPUT' && target.tagName !== 'TEXTAREA') {
                    e.preventDefault();
                    setSelectedIndex((prev) => (prev > 0 ? prev - 1 : prev));
                }
            } else if (e.key === "PageDown") {
                const target = e.target as HTMLElement;
                if (target.tagName !== 'INPUT' && target.tagName !== 'TEXTAREA') {
                    e.preventDefault();
                    goToNextPage();
                }
            } else if (e.key === "PageUp") {
                const target = e.target as HTMLElement;
                if (target.tagName !== 'INPUT' && target.tagName !== 'TEXTAREA') {
                    e.preventDefault();
                    goToPreviousPage();
                }
            }

            // Enter key behaviors
            if (e.key === "Enter" && !e.shiftKey) {
                const target = e.target as HTMLElement;
                // If in search input, trigger search
                if (target.tagName === 'INPUT' && searchTerm) {
                    handleSearch();
                }
            }

            // Shift + Enter to save in Edit Modal
            if (e.key === "Enter" && e.shiftKey && isEditModalOpen) {
                e.preventDefault();
                if (!isUpdating) {
                    handleUpdateProduct();
                }
            }

            // Alt Key Combinations
            if (e.altKey) {
                switch (e.key.toLowerCase()) {
                    case 'e': // Edit
                        e.preventDefault();
                        if (currentPageData[selectedIndex]) {
                            setSelectedProduct(currentPageData[selectedIndex]);
                            setIsEditModalOpen(true);
                        }
                        break;
                    case 'd': // Deactivate
                        e.preventDefault();
                        if (currentPageData[selectedIndex]) {
                            handleDeactivateProduct(currentPageData[selectedIndex], { stopPropagation: () => {} } as any);
                        }
                        break;
                    case 's': // Search
                        e.preventDefault();
                        handleSearch();
                        break;
                    case 'c': // Clear
                        e.preventDefault();
                        handleClear();
                        break;
                }
            }
        };

        window.addEventListener("keydown", handleKeyDown);
        return () => window.removeEventListener("keydown", handleKeyDown);
    }, [currentPageData, isEditModalOpen, isUpdating, selectedIndex, searchTerm]);

    const formatDataForExport = (data: Product[]) => {
        return data.map(item => ({
            'Product ID': item.productID,
            'Name': item.productName,
            'Code': item.productCode,
            'Barcode': item.barcode,
            'Category': item.category,
            'Brand': item.brand,
            'Unit': item.unit,
            'Type': item.productType,
            'Color': item.color,
            'Size': item.size,
            'Storage': item.storage,
            'Created On': item.createdOn
        }));
    };

    const handleExportExcel = () => {
        if (salesData.length === 0) {
            toast.error('No data to export');
            return;
        }
        const formattedData = formatDataForExport(salesData);
        const ws = XLSX.utils.json_to_sheet(formattedData);
        const wb = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(wb, ws, "Products");
        XLSX.writeFile(wb, "products_list.xlsx");
        toast.success('Exported to Excel successfully');
    };

    const handleExportCSV = () => {
        if (salesData.length === 0) {
            toast.error('No data to export');
            return;
        }
        const formattedData = formatDataForExport(salesData);
        const ws = XLSX.utils.json_to_sheet(formattedData);
        const csv = XLSX.utils.sheet_to_csv(ws);
        const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
        const link = document.createElement("a");
        const url = URL.createObjectURL(blob);
        link.setAttribute("href", url);
        link.setAttribute("download", "products_list.csv");
        link.style.visibility = "hidden";
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        toast.success('Exported to CSV successfully');
    };

    const handleExportPDF = () => {
        if (salesData.length === 0) {
            toast.error('No data to export');
            return;
        }
        // Use landscape orientation ('l') for better column fit
        const doc = new jsPDF('l', 'mm', 'a4');

        doc.setFontSize(18);
        doc.text("Product List", 14, 22);

        doc.setFontSize(11);
        doc.setTextColor(100);
        doc.text(`Generated on: ${new Date().toLocaleDateString()}`, 14, 30);

        const tableColumn = [
            "ID", "Name", "Code", "Barcode", "Category", "Brand",
            "Unit", "Type", "Color", "Size", "Storage", "Created On"
        ];

        const tableRows = salesData.map(item => [
            item.productID,
            item.productName,
            item.productCode,
            item.barcode,
            item.category,
            item.brand,
            item.unit,
            item.productType,
            item.color || '-',
            item.size || '-',
            item.storage || '-',
            item.createdOn
        ]);

        autoTable(doc, {
            head: [tableColumn],
            body: tableRows,
            startY: 40,
            theme: 'grid',
            styles: { fontSize: 8, cellPadding: 2 },
            headStyles: { fillColor: [16, 185, 129] }, // Emerald-500
            // optimize column widths if needed, or let autotable handle it
        });

        doc.save("products_list.pdf");
        toast.success('Exported to PDF successfully');
    };

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
                {isEditModalOpen && selectedProduct && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 backdrop-blur-sm">
                <div

                    className="bg-white rounded-2xl p-8 w-full max-w-7xl max-h-[90vh] overflow-y-auto shadow-2xl"
                >
                    <div className="flex justify-between items-center mb-6">
                        <h2 className="text-2xl font-bold bg-linear-to-r from-gray-800 to-gray-600 bg-clip-text text-transparent">
                            Edit Product
                        </h2>
                        <button
                            onClick={() => setIsEditModalOpen(false)}
                            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                        >
                            <X size={24} />
                        </button>
                    </div>

                    <div className="bg-linear-to-br from-gray-50 to-white rounded-xl p-6 border border-gray-100">
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
                    </div>

                        {/* Variants Section */}
                        <div className="mt-8">
                            <div className="flex justify-between items-center mb-4">
                                <h3 className="text-lg font-semibold text-gray-700 flex items-center gap-2">
                                    <Boxes size={20} className="text-emerald-600" />
                                    Product Variations
                                </h3>
                                {!isAddingVariant && (
                                    <button
                                        onClick={() => setIsAddingVariant(true)}
                                        className="px-4 py-2 bg-emerald-50 text-emerald-600 hover:bg-emerald-100 rounded-lg transition-colors text-sm font-bold flex items-center gap-2"
                                    >
                                        + Add New Variation
                                    </button>
                                )}
                            </div>

                            <div className="border border-gray-100 rounded-xl overflow-hidden shadow-sm">
                                <table className="min-w-full divide-y divide-gray-200">
                                    <thead className="bg-gray-50">
                                        <tr>
                                            <th className="px-4 py-3 text-left text-xs font-bold text-gray-400 uppercase">PV ID</th>
                                            <th className="px-4 py-3 text-left text-xs font-bold text-gray-400 uppercase">Barcode</th>
                                            <th className="px-4 py-3 text-left text-xs font-bold text-gray-400 uppercase">Color</th>
                                            <th className="px-4 py-3 text-left text-xs font-bold text-gray-400 uppercase">Size</th>
                                            <th className="px-4 py-3 text-left text-xs font-bold text-gray-400 uppercase">Storage</th>
                                            <th className="px-4 py-3 text-right text-xs font-bold text-gray-400 uppercase">Actions</th>
                                        </tr>
                                    </thead>
                                    <tbody className="bg-white divide-y divide-gray-200">
                                        {isLoadingVariants ? (
                                            <tr>
                                                <td colSpan={6} className="px-4 py-8 text-center text-gray-400">
                                                    <Loader2 className="animate-spin inline-block mr-2" size={16} />
                                                    Loading variations...
                                                </td>
                                            </tr>
                                        ) : (
                                            <>
                                                {productVariants.map((variant) => (
                                                    <tr key={variant.pvId} className="hover:bg-gray-50/50 transition-colors">
                                                        <td className="px-4 py-3 text-sm text-gray-500 font-medium">#{variant.pvId}</td>
                                                        <td className="px-4 py-3 text-sm">
                                                            {editingVariantId === variant.pvId ? (
                                                                <input
                                                                    type="text"
                                                                    value={variantEditData.barcode}
                                                                    onChange={(e) => setVariantEditData({ ...variantEditData, barcode: e.target.value })}
                                                                    className="w-full text-xs border rounded px-2 py-1 outline-none focus:border-emerald-500"
                                                                />
                                                            ) : (
                                                                <span className="font-mono text-gray-900">{variant.barcode}</span>
                                                            )}
                                                        </td>
                                                        <td className="px-4 py-3 text-sm">
                                                            {editingVariantId === variant.pvId ? (
                                                                <input
                                                                    type="text"
                                                                    value={variantEditData.color}
                                                                    onChange={(e) => setVariantEditData({ ...variantEditData, color: e.target.value })}
                                                                    className="w-full text-xs border rounded px-2 py-1 outline-none focus:border-emerald-500"
                                                                />
                                                            ) : (
                                                                <span className="px-2 py-1 bg-gray-100 rounded text-[10px] font-medium text-gray-600">{variant.color || 'Default'}</span>
                                                            )}
                                                        </td>
                                                        <td className="px-4 py-3 text-sm">
                                                            {editingVariantId === variant.pvId ? (
                                                                <input
                                                                    type="text"
                                                                    value={variantEditData.size}
                                                                    onChange={(e) => setVariantEditData({ ...variantEditData, size: e.target.value })}
                                                                    className="w-full text-xs border rounded px-2 py-1 outline-none focus:border-emerald-500"
                                                                />
                                                            ) : (
                                                                <span className="text-gray-700">{variant.size || 'N/A'}</span>
                                                            )}
                                                        </td>
                                                        <td className="px-4 py-3 text-sm">
                                                            {editingVariantId === variant.pvId ? (
                                                                <input
                                                                    type="text"
                                                                    value={variantEditData.storage}
                                                                    onChange={(e) => setVariantEditData({ ...variantEditData, storage: e.target.value })}
                                                                    className="w-full text-xs border rounded px-2 py-1 outline-none focus:border-emerald-500"
                                                                />
                                                            ) : (
                                                                <span className="text-gray-700">{variant.storage || 'N/A'}</span>
                                                            )}
                                                        </td>
                                                        <td className="px-4 py-3 text-right">
                                                            <div className="flex justify-end gap-2">
                                                                {editingVariantId === variant.pvId ? (
                                                                    <>
                                                                        <button
                                                                            onClick={() => handleUpdateVariant(variant.pvId)}
                                                                            className="p-1 px-3 bg-emerald-500 text-white rounded text-[10px] font-bold hover:bg-emerald-600 transition-colors"
                                                                        >
                                                                            Save
                                                                        </button>
                                                                        <button
                                                                            onClick={() => { setEditingVariantId(null); setVariantEditData(null); }}
                                                                            className="p-1 px-3 bg-gray-200 text-gray-600 rounded text-[10px] font-bold hover:bg-gray-300 transition-colors"
                                                                        >
                                                                            Cancel
                                                                        </button>
                                                                    </>
                                                                ) : (
                                                                    <button
                                                                        onClick={() => {
                                                                            setEditingVariantId(variant.pvId);
                                                                            setVariantEditData({
                                                                                barcode: variant.barcode,
                                                                                color: variant.color,
                                                                                size: variant.size,
                                                                                storage: variant.storage
                                                                            });
                                                                        }}
                                                                        className="p-1.5 bg-blue-50 text-blue-600 hover:bg-blue-100 rounded-lg transition-colors flex items-center gap-1 text-[10px] font-bold"
                                                                    >
                                                                        <Pencil size={12} />
                                                                        Edit
                                                                    </button>
                                                                )}
                                                            </div>
                                                        </td>
                                                    </tr>
                                                ))}

                                                {isAddingVariant && (
                                                    <tr className="bg-emerald-50/50">
                                                        <td className="px-4 py-3 text-sm text-gray-400 font-medium">NEW</td>
                                                        <td className="px-4 py-3 text-sm">
                                                            <input
                                                                type="text"
                                                                placeholder="Enter Barcode"
                                                                value={newVariantData.barcode}
                                                                onChange={(e) => setNewVariantData({ ...newVariantData, barcode: e.target.value })}
                                                                className="w-full text-xs border border-emerald-300 rounded px-2 py-1 outline-none focus:ring-1 focus:ring-emerald-500"
                                                            />
                                                        </td>
                                                        <td className="px-4 py-3 text-sm">
                                                            <input
                                                                type="text"
                                                                placeholder="Color"
                                                                value={newVariantData.color}
                                                                onChange={(e) => setNewVariantData({ ...newVariantData, color: e.target.value })}
                                                                className="w-full text-xs border border-emerald-300 rounded px-2 py-1 outline-none"
                                                            />
                                                        </td>
                                                        <td className="px-4 py-3 text-sm">
                                                            <input
                                                                type="text"
                                                                placeholder="Size"
                                                                value={newVariantData.size}
                                                                onChange={(e) => setNewVariantData({ ...newVariantData, size: e.target.value })}
                                                                className="w-full text-xs border border-emerald-300 rounded px-2 py-1 outline-none"
                                                            />
                                                        </td>
                                                        <td className="px-4 py-3 text-sm">
                                                            <input
                                                                type="text"
                                                                placeholder="Storage"
                                                                value={newVariantData.storage}
                                                                onChange={(e) => setNewVariantData({ ...newVariantData, storage: e.target.value })}
                                                                className="w-full text-xs border border-emerald-300 rounded px-2 py-1 outline-none"
                                                            />
                                                        </td>
                                                        <td className="px-4 py-3 text-right">
                                                            <div className="flex justify-end gap-2">
                                                                <button
                                                                    onClick={handleAddNewVariant}
                                                                    className="p-1 px-3 bg-emerald-600 text-white rounded text-[10px] font-bold hover:bg-emerald-700 shadow-sm"
                                                                >
                                                                    Add
                                                                </button>
                                                                <button
                                                                    onClick={() => setIsAddingVariant(false)}
                                                                    className="p-1 px-3 bg-white text-gray-500 border border-gray-200 rounded text-[10px] font-bold hover:bg-gray-50"
                                                                >
                                                                    Cancel
                                                                </button>
                                                            </div>
                                                        </td>
                                                    </tr>
                                                )}
                                            </>
                                        )}
                                    </tbody>
                                </table>
                            </div>
                        </div>

                        <div className="flex justify-between items-center mt-8 pt-6 border-t border-gray-100">
                             <p className="text-[10px] text-gray-400 font-medium italic">
                                * Basic information updates apply to all variations. Variations are managed individually below.
                            </p>
                            <div className="flex gap-3">
                                <button
                                    onClick={() => setIsEditModalOpen(false)}
                                    className="px-6 py-2.5 bg-gray-100 hover:bg-gray-200 text-gray-700 font-medium rounded-lg transition-all"
                                >
                                    Close
                                </button>
                                <button
                                    onClick={handleUpdateProduct}
                                    disabled={isUpdating}
                                    className={`flex items-center gap-2 px-8 py-2.5 bg-linear-to-r from-emerald-500 to-emerald-600 hover:from-emerald-600 hover:to-emerald-700 text-white font-bold rounded-lg shadow-lg shadow-emerald-200 transition-all ${isUpdating ? 'opacity-50 cursor-not-allowed' : ''
                                        }`}
                                >
                                    {isUpdating ? 'Saving...' : 'Save Product Details'}
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}


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

                <div className="flex justify-between items-center mb-4">
                    <div>
                        <div className="text-sm text-gray-400 flex items-center">
                            <span>Products</span>
                            <span className="mx-2">›</span>
                            <span className="text-gray-700 font-medium">Product List</span>
                        </div>
                        <h1 className="text-3xl font-semibold bg-linear-to-r from-gray-800 to-gray-600 bg-clip-text text-transparent">
                            Product List
                        </h1>
                    </div>

                    {/* Shortcuts Hint Style from Quotation */}
                    <div className="hidden lg:flex items-center gap-2 bg-white px-4 py-2 rounded-xl border border-gray-100 shadow-sm border-b-2">
                        <div className="flex items-center gap-1.5 px-2 py-1 bg-gray-50 rounded-lg border border-gray-100">
                            <span className="text-[10px] font-black text-gray-500 bg-white px-1.5 py-0.5 rounded shadow-sm border border-gray-200">↑↓</span>
                            <span className="text-[10px] font-bold text-gray-400 uppercase tracking-tight">Navigate</span>
                        </div>
                        <div className="flex items-center gap-1.5 px-2 py-1 bg-gray-50 rounded-lg border border-gray-100">
                            <span className="text-[10px] font-black text-gray-500 bg-white px-1.5 py-0.5 rounded shadow-sm border border-gray-200">ALT+E</span>
                            <span className="text-[10px] font-bold text-gray-400 uppercase tracking-tight">Edit</span>
                        </div>
                        <div className="flex items-center gap-1.5 px-2 py-1 bg-gray-50 rounded-lg border border-gray-100">
                            <span className="text-[10px] font-black text-gray-500 bg-white px-1.5 py-0.5 rounded shadow-sm border border-gray-200">ALT+D</span>
                            <span className="text-[10px] font-bold text-gray-400 uppercase tracking-tight">Deactivate</span>
                        </div>
                        <div className="flex items-center gap-1.5 px-2 py-1 bg-gray-50 rounded-lg border border-gray-100">
                            <span className="text-[10px] font-black text-gray-500 bg-white px-1.5 py-0.5 rounded shadow-sm border border-gray-200">ALT+S</span>
                            <span className="text-[10px] font-bold text-gray-400 uppercase tracking-tight">Search</span>
                        </div>
                        <div className="flex items-center gap-1.5 px-2 py-1 bg-gray-50 rounded-lg border border-gray-100">
                            <span className="text-[10px] font-black text-gray-500 bg-white px-1.5 py-0.5 rounded shadow-sm border border-gray-200">ESC</span>
                            <span className="text-[10px] font-bold text-gray-400 uppercase tracking-tight">Close</span>
                        </div>
                    </div>
                </div>

                <div
                    className="bg-white rounded-xl p-6 border border-gray-200"
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
                                className="flex items-center justify-center gap-2 py-2 px-4 bg-linear-to-r from-emerald-500 to-emerald-600 hover:from-emerald-600 hover:to-emerald-700 text-white font-medium rounded-lg shadow-lg shadow-emerald-200 transition-all"
                            >
                                <SearchCheck size={16} />
                                Search
                            </button>
                        </div>
                        <div className="grid md:items-end gap-2">
                            <button
                                onClick={handleClear}
                                className="flex items-center justify-center gap-2 py-2 px-4 bg-linear-to-r from-gray-500 to-gray-600 hover:from-gray-600 hover:to-gray-700 text-white font-medium rounded-lg shadow-lg shadow-gray-200 transition-all"
                            >
                                <RefreshCw size={16} />
                                Clear
                            </button>
                        </div>
                    </div>
                </div>

                <div
                    className="flex flex-col bg-white rounded-xl p-4 md:p-6 justify-between gap-6 border border-gray-200 flex-1 overflow-hidden min-w-0 shadow-sm min-h-[400px]"
                >
                    <div className="overflow-auto flex-1 rounded-lg scrollbar-thin scrollbar-thumb-emerald-300 scrollbar-track-gray-100">
                        <table className="min-w-full divide-y divide-gray-200">
                            <thead className="bg-linear-to-r from-emerald-600 to-emerald-700 sticky top-0 z-10">
                                <tr>
                                    {[
                                        "PV ID",
                                        "Product Name",
                                        "Product Code",
                                        "Barcode",
                                        "Category",
                                        "Brand",
                                        "Unit",
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
                                        <td colSpan={8} className="px-6 py-8 text-center text-gray-500">
                                            Loading products...
                                        </td>
                                    </tr>
                                ) : currentPageData.length === 0 ? (
                                    <tr>
                                        <td colSpan={8} className="px-6 py-8 text-center text-gray-500">
                                            No products found
                                        </td>
                                    </tr>
                                ) : currentPageData.map((sale: Product, index: number) => (
                                    <tr
                                        key={index}
                                        onClick={() => setSelectedIndex(index)}
                                        onDoubleClick={() => {
                                            setSelectedProduct(sale);
                                            setIsEditModalOpen(true);
                                        }}
                                        className={`cursor-pointer transition-colors ${index === selectedIndex
                                            ? "bg-emerald-50 border-l-4 border-emerald-600"
                                            : "hover:bg-emerald-50/50"
                                            }`}
                                    >
                                        <td className="px-6 py-2 text-sm font-medium">
                                            {sale.pvId}
                                        </td>
                                        <td className="px-6 py-2 text-sm font-medium">
                                            {sale.productName}
                                        </td>
                                        <td className="px-6 py-2 text-sm font-medium">
                                            {sale.productCode}
                                        </td>
                                        <td className="px-6 py-2 text-sm font-medium">
                                            {sale.barcode}
                                        </td>
                                        <td className="px-6 py-2 text-sm font-medium">
                                            {sale.category}
                                        </td>
                                        <td className="px-6 py-2 text-sm font-medium">
                                            {sale.brand}
                                        </td>
                                        <td className="px-6 py-2 text-sm font-medium">
                                            {sale.unit}
                                        </td>
                                        <td className="px-6 py-2 text-sm font-medium flex gap-2">
                                            <div className="relative group">
                                                <button
                                                    onClick={(e) => {
                                                        e.stopPropagation();
                                                        handleViewProduct(sale);
                                                    }}
                                                    className="p-2 bg-linear-to-r from-emerald-100 to-emerald-200 rounded-lg text-emerald-700 hover:from-emerald-200 hover:to-emerald-300 transition-all shadow-sm"
                                                >
                                                    <Eye size={15} />
                                                </button>
                                                <span className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 w-max px-2 py-1 text-xs text-white bg-gray-900 rounded-md invisible group-hover:visible opacity-0 group-hover:opacity-100 transition-opacity">
                                                    View Details
                                                </span>
                                            </div>

                                            <div className="relative group">
                                                <button
                                                    onClick={(e) => {
                                                        e.stopPropagation();
                                                        handleEditProduct(sale);
                                                    }}
                                                    className="p-2 bg-linear-to-r from-blue-100 to-blue-200 rounded-lg text-blue-700 hover:from-blue-200 hover:to-blue-300 transition-all shadow-sm"
                                                >
                                                    <Pencil size={15} />
                                                </button>
                                                <span className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 w-max px-2 py-1 text-xs text-white bg-gray-900 rounded-md invisible group-hover:visible opacity-0 group-hover:opacity-100 transition-opacity">
                                                    Edit Product
                                                </span>
                                            </div>

                                            {/* Deactivate Button Removed From Main List Row */}
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>

                    <nav className="bg-white flex items-center justify-between sm:px-6 pt-4 border-t-2 border-gray-100">
                        <div className="text-sm text-gray-600">
                            Showing <span className="font-semibold text-gray-800">{startIndex + 1}</span> to{' '}
                            <span className="font-semibold text-gray-800">{Math.min(endIndex, totalItems)}</span> of{' '}
                            <span className="font-semibold text-gray-800">{totalItems}</span> results
                        </div>
                        <div className="flex items-center space-x-2">
                            <button
                                onClick={goToPreviousPage}
                                disabled={currentPage === 1}
                                className={`flex items-center px-3 py-2 text-sm font-medium rounded-lg transition-all ${currentPage === 1
                                    ? 'text-gray-400 cursor-not-allowed'
                                    : 'text-gray-600 hover:text-emerald-600 hover:bg-emerald-50'
                                    }`}
                            >
                                <ChevronLeft className="mr-2 h-5 w-5" /> Previous
                            </button>

                            {getPageNumbers().map((page, index) =>
                                typeof page === 'number' ? (
                                    <button
                                        key={index}
                                        onClick={() => goToPage(page)}
                                        className={`px-4 py-2 text-sm font-semibold rounded-lg transition-all ${currentPage === page
                                            ? 'bg-linear-to-r from-emerald-500 to-emerald-600 text-white shadow-md'
                                            : 'text-gray-600 hover:bg-emerald-50 hover:text-emerald-600'
                                            }`}
                                    >
                                        {page}
                                    </button>
                                ) : (
                                    <span key={index} className="text-gray-400 px-2">
                                        {page}
                                    </span>
                                )
                            )}

                            <button
                                onClick={goToNextPage}
                                disabled={currentPage === totalPages}
                                className={`flex items-center px-3 py-2 text-sm font-medium rounded-lg transition-all ${currentPage === totalPages
                                    ? 'text-gray-400 cursor-not-allowed'
                                    : 'text-gray-600 hover:text-emerald-600 hover:bg-emerald-50'
                                    }`}
                            >
                                Next <ChevronRight className="ml-1 h-4 w-4" />
                            </button>
                        </div>
                    </nav>
                </div>

                <div
                    className="bg-white flex justify-center p-4 gap-4 rounded-xl shadow-lg"
                >
                    <button
                        onClick={handleExportExcel}
                        className="flex items-center gap-2 px-6 py-3 bg-linear-to-r from-emerald-500 to-emerald-600 hover:from-emerald-600 hover:to-emerald-700 text-white font-medium rounded-lg shadow-lg shadow-emerald-200 hover:shadow-xl transition-all"
                    >
                        <FileText size={20} />
                        Excel
                    </button>
                    <button
                        onClick={handleExportCSV}
                        className="flex items-center gap-2 px-6 py-3 bg-linear-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white font-medium rounded-lg shadow-lg shadow-blue-200 hover:shadow-xl transition-all"
                    >
                        <FileText size={20} />
                        CSV
                    </button>
                    <button
                        onClick={handleExportPDF}
                        className="flex items-center gap-2 px-6 py-3 bg-linear-to-r from-red-500 to-red-600 hover:from-red-600 hover:to-red-700 text-white font-medium rounded-lg shadow-lg shadow-red-200 hover:shadow-xl transition-all"
                    >
                        <FileText size={20} />
                        PDF
                    </button>

                </div>
            </div>
            {isViewModalOpen && selectedProduct && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
                    <div className="bg-white rounded-2xl shadow-xl w-full max-w-2xl overflow-hidden animate-in fade-in zoom-in duration-200">
                        <div className="p-6 border-b border-gray-100 flex justify-between items-center bg-gray-50/50">
                            <div>
                                <h2 className="text-xl font-bold text-gray-800">Product Details</h2>
                                <p className="text-sm text-gray-500 mt-1">Full information for {selectedProduct.productName}</p>
                            </div>
                            <button
                                onClick={() => setIsViewModalOpen(false)}
                                className="p-2 hover:bg-gray-200 rounded-full transition-colors text-gray-500 hover:text-gray-700"
                            >
                                <X size={20} />
                            </button>
                        </div>

                        <div className="p-6 max-h-[70vh] overflow-y-auto">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div className="space-y-4">
                                    <div>
                                        <label className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Product Name</label>
                                        <p className="text-gray-900 font-medium mt-1">{selectedProduct.productName}</p>
                                    </div>
                                    <div>
                                        <label className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Product ID</label>
                                        <p className="text-gray-900 font-medium mt-1">{selectedProduct.productID}</p>
                                    </div>
                                    <div>
                                        <label className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Barcode</label>
                                        <p className="text-gray-900 font-medium mt-1 font-mono">{selectedProduct.barcode}</p>
                                    </div>
                                    <div>
                                        <label className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Category</label>
                                        <p className="text-gray-900 font-medium mt-1">{selectedProduct.category}</p>
                                    </div>
                                    <div>
                                        <label className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Brand</label>
                                        <p className="text-gray-900 font-medium mt-1">{selectedProduct.brand}</p>
                                    </div>
                                </div>

                                <div className="space-y-4">
                                    <div>
                                        <label className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Product Code</label>
                                        <p className="text-gray-900 font-medium mt-1 font-mono">{selectedProduct.productCode}</p>
                                    </div>
                                    <div>
                                        <label className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Unit</label>
                                        <p className="text-gray-900 font-medium mt-1">{selectedProduct.unit}</p>
                                    </div>
                                    <div>
                                        <label className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Product Type</label>
                                        <p className="text-gray-900 font-medium mt-1">{selectedProduct.productType}</p>
                                    </div>
                                    <div>
                                        <label className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Color & Size</label>
                                        <div className="flex gap-2 mt-1">
                                            <span className="px-2 py-1 bg-gray-100 rounded text-sm font-medium">{selectedProduct.color}</span>
                                            <span className="px-2 py-1 bg-gray-100 rounded text-sm font-medium">{selectedProduct.size}</span>
                                        </div>
                                    </div>
                                    <div>
                                        <label className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Storage</label>
                                        <p className="text-gray-900 font-medium mt-1">{selectedProduct.storage}</p>
                                    </div>
                                </div>
                            </div>
                             <div className="mt-8">
                                <h3 className="text-lg font-bold text-gray-800 mb-4 flex items-center gap-2">
                                    <Boxes size={20} className="text-emerald-600" />
                                    Product Variations
                                </h3>
                                
                                <div className="border border-gray-100 rounded-xl overflow-hidden">
                                    <table className="min-w-full divide-y divide-gray-200">
                                        <thead className="bg-gray-50">
                                            <tr>
                                                <th className="px-4 py-3 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">PV ID</th>
                                                <th className="px-4 py-3 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">Barcode</th>
                                                <th className="px-4 py-3 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">Color</th>
                                                <th className="px-4 py-3 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">Size</th>
                                                <th className="px-4 py-3 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">Storage</th>
                                                <th className="px-4 py-3 text-right text-xs font-bold text-gray-500 uppercase tracking-wider">Action</th>
                                            </tr>
                                        </thead>
                                        <tbody className="bg-white divide-y divide-gray-200">
                                            {isLoadingVariants ? (
                                                <tr>
                                                    <td colSpan={6} className="px-4 py-8 text-center text-gray-400">
                                                        <Loader2 className="animate-spin inline-block mr-2" size={16} />
                                                        Loading variants...
                                                    </td>
                                                </tr>
                                            ) : productVariants.length === 0 ? (
                                                <tr>
                                                    <td colSpan={6} className="px-4 py-8 text-center text-gray-400 italic">
                                                        No variations found for this product.
                                                    </td>
                                                </tr>
                                            ) : (
                                                productVariants.map((variant) => (
                                                    <tr key={variant.pvId} className="hover:bg-gray-50 transition-colors">
                                                        <td className="px-4 py-3 text-sm text-gray-600 font-medium">{variant.pvId}</td>
                                                        <td className="px-4 py-3 text-sm font-mono text-gray-900">{variant.barcode || '-'}</td>
                                                        <td className="px-4 py-3 text-sm">
                                                            <span className="px-2 py-1 bg-gray-100 rounded text-gray-600">{variant.color || '-'}</span>
                                                        </td>
                                                        <td className="px-4 py-3 text-sm">
                                                            <span className="px-2 py-1 bg-gray-100 rounded text-gray-600">{variant.size || '-'}</span>
                                                        </td>
                                                        <td className="px-4 py-3 text-sm font-medium text-gray-900">{variant.storage || '-'}</td>
                                                        <td className="px-4 py-3 text-right">
                                                            <button
                                                                onClick={() => handleDeactivateVariant(variant)}
                                                                className="p-1.5 bg-red-50 text-red-600 hover:bg-red-100 rounded-lg transition-colors"
                                                                title="Deactivate Variation"
                                                            >
                                                                <Trash size={14} />
                                                            </button>
                                                        </td>
                                                    </tr>
                                                ))
                                            )}
                                        </tbody>
                                    </table>
                                </div>
                            </div>

                            <div className="mt-6 pt-6 border-t border-gray-100">
                                <div className="flex justify-between items-center text-xs text-gray-500">
                                    <span>Main Product ID: <span className="font-semibold">{selectedProduct.productID}</span></span>
                                    <span>Created On: <span className="font-semibold">{new Date(selectedProduct.createdOn).toLocaleDateString()}</span></span>
                                </div>
                            </div>
                        </div>

                        <div className="p-6 border-t border-gray-100 bg-gray-50/50 flex justify-end gap-3">
                            <button
                                onClick={() => setIsViewModalOpen(false)}
                                className="px-4 py-2 bg-white border border-gray-300 rounded-lg text-gray-700 font-medium hover:bg-gray-50 transition-colors shadow-sm"
                            >
                                Close
                            </button>
                            <button
                                onClick={() => {
                                    setIsViewModalOpen(false);
                                    setIsEditModalOpen(true);
                                }}
                                className="px-4 py-2 bg-emerald-600 text-white rounded-lg font-medium hover:bg-emerald-700 transition-colors shadow-sm hover:shadow-md flex items-center gap-2"
                            >
                                <Pencil size={16} />
                                Edit Product
                            </button>
                        </div>
                    </div>
                </div>
            )}
            <ConfirmationModal
                isOpen={isConfirmModalOpen}
                title="Deactivate Variation"
                message="Are you sure you want to deactivate variation"
                itemName={variantToDeactivate?.variant_name || variantToDeactivate?.barcode || "unnamed"}
                itemType="variation"
                onConfirm={handleDeactivateConfirm}
                onCancel={() => setIsConfirmModalOpen(false)}
                isLoading={isDeactivating}
                confirmButtonText="Deactivate"
                loadingText="Deactivating..."
                isDanger={true}
            />
        </>
    );
}

export default ProductList;