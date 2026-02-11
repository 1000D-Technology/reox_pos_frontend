import { ChevronLeft, ChevronRight, Plus, Trash2, Package, X, Loader2, Upload, Download } from "lucide-react";
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
    initialQty: number;
    costPrice: number;
    mrp: number;
    rsp: number;
    wsp: number;
    mfgDate: string;
    expDate: string;
};

const COMMON_COLORS = [
    { name: 'Black', code: '#000000' },
    { name: 'White', code: '#FFFFFF' },
    { name: 'Red', code: '#EF4444' },
    { name: 'Blue', code: '#3B82F6' },
    { name: 'Green', code: '#10B981' },
    { name: 'Yellow', code: '#F59E0B' },
    { name: 'Gray', code: '#6B7280' },
    { name: 'Silver', code: '#C0C0C0' },
    { name: 'Gold', code: '#FFD700' },
    { name: 'Purple', code: '#8B5CF6' },
    { name: 'Pink', code: '#EC4899' },
    { name: 'Orange', code: '#F97316' },
    { name: 'Brown', code: '#78350F' },
    { name: 'Navy', code: '#1E3A8A' },
    { name: 'Teal', code: '#14B8A6' },
];

function CreateProducts() {
    const [productData, setProductData] = useState({
        name: "",
        code: "",
        barcode: "",
        categoryId: "",
        brandId: "",
        unitId: "",
        typeId: "",
        initialQty: 0,
        costPrice: 0,
        mrp: 0,
        rsp: 0,
        wsp: 0,
        mfgDate: "",
        expDate: "",
        hasVariations: false,
    });

    const [isSubmitting, setIsSubmitting] = useState(false);
    const [salesData, setSalesData] = useState<Product[]>([]);
    const [currentPage, setCurrentPage] = useState(1);
    const [itemsPerPage] = useState(10);
    const [totalItems, setTotalItems] = useState(0);
    const [isLoadingProducts, setIsLoadingProducts] = useState(false);
    const [selectedIndex, setSelectedIndex] = useState(0);

    const [selectedCategory, setSelectedCategory] = useState<SelectOption | null>(null);
    const [selectedBrand, setSelectedBrand] = useState<SelectOption | null>(null);
    const [selectedUnit, setSelectedUnit] = useState<SelectOption | null>(null);
    const [selectedProductType, setSelectedProductType] = useState<SelectOption | null>(null);

    const [brands, setBrands] = useState<SelectOption[]>([]);
    const [units, setUnits] = useState<SelectOption[]>([]);
    const [categories, setCategories] = useState<SelectOption[]>([]);
    const [productType, setProductType] = useState<SelectOption[]>([]);


    const [variations, setVariations] = useState<Variation[]>([]);
    const [currentVariation, setCurrentVariation] = useState<Variation>({
        color: "",
        size: "",
        storage: "",
        barcode: "",
        initialQty: 0,
        costPrice: 0,
        mrp: 0,
        rsp: 0,
        wsp: 0,
        mfgDate: "",
        expDate: "",
    });

    const [showColorSelect, setShowColorSelect] = useState(false);
    const [isVariationModalOpen, setIsVariationModalOpen] = useState(false);
    const [currentStep, setCurrentStep] = useState(1);
    const steps = [
        { id: 1, title: 'Basic Details', description: 'Product info', icon: Package },
        { id: 2, title: 'Inventory', description: 'Stock & Pricing', icon: Plus },
        { id: 3, title: 'Variations', description: 'Add variants', icon: Trash2 },
        { id: 4, title: 'Review', description: 'Final check', icon: Package },
    ];

    const nextStep = async () => {
        if (currentStep === 1) {
            if (!productData.name || !productData.code || !productData.categoryId || !productData.brandId || !productData.unitId || !productData.typeId) {
                toast.error('Please fill all required fields');
                return;
            }

            // Check if product code exists before proceeding
            try {
                const response = await productService.checkProductCode(productData.code);
                if (response.data?.success && response.data.exists) {
                    toast.error('This Product Code already exists! Cannot add this record.');
                    return;
                }
            } catch (error) {
                console.error('Error checking product code:', error);
            }

            setIsVariationModalOpen(true);
            return;
        }
        
        if (currentStep === 2) {
            setCurrentStep(4); // Skip Variations, go to Review
            return;
        }

        if (currentStep === 3) {
            setCurrentStep(4); // Go to Review
            return;
        }

        setCurrentStep(prev => Math.min(prev + 1, steps.length));
    };

    const prevStep = () => {
        if (currentStep === 4) {
             if (productData.hasVariations) {
                setCurrentStep(3);
                return;
            } else {
                setCurrentStep(2);
                return;
            }
        }
        if (currentStep === 3 || currentStep === 2) {
            setCurrentStep(1);
            return;
        }
        setCurrentStep(prev => Math.max(prev - 1, 1));
    };

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

    const [isImporting, setIsImporting] = useState(false);

    const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files.length > 0) {
            const file = e.target.files[0];
            const formData = new FormData();
            formData.append('file', file);

            setIsImporting(true);
            try {
                // @ts-ignore
                const response = await productService.importProducts(formData);
                const data = response.data;
                if (data.success) {
                    toast.success(`Imported: ${data.data.successCount}, Skipped: ${data.data.skippedCount}`);
                    if (data.data.errors.length > 0) {
                        data.data.errors.forEach((err: any) => {
                            toast.error(`${err.name}: ${err.error}`, { duration: 5000 });
                        });
                    }
                } else {
                    toast.error(data.message || 'Import failed');
                }
            } catch (error: any) {
                console.error("Import error:", error);
                toast.error(error.response?.data?.message || 'Failed to import products');
            } finally {
                setIsImporting(false);
                // Clear input
                e.target.value = '';
            }
        }
    };

    const handleDownloadTemplate = () => {
        const headers = ['Name', 'Code', 'Category', 'Brand', 'Unit', 'Type', 'Barcode', 'Color', 'Size', 'Storage', 'CostPrice', 'MRP', 'RSP', 'WSP', 'InitialQty', 'MfgDate', 'ExpDate'];
        const exampleRow = ['iPhone 14', 'IP14', 'Electronics', 'Apple', 'Piece', 'Mobile', '123456789012', 'Blue', 'N/A', '128GB', '150000', '210000', '200000', '190000', '10', '2025-01-01', '2027-01-01'];

        const csvContent = [
            headers.join(','),
            exampleRow.join(',')
        ].join('\n');

        const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
        const link = document.createElement('a');
        if (link.download !== undefined) {
            const url = URL.createObjectURL(blob);
            link.setAttribute('href', url);
            link.setAttribute('download', 'product_import_template.csv');
            link.style.visibility = 'hidden';
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
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
        if (currentVariation.color || currentVariation.size || currentVariation.storage || currentVariation.barcode || currentVariation.initialQty > 0) {
            setVariations([...variations, currentVariation]);
            setCurrentVariation({ 
                color: "", 
                size: "", 
                storage: "", 
                barcode: "",
                initialQty: 0,
                costPrice: 0,
                mrp: 0,
                rsp: 0,
                wsp: 0,
                mfgDate: "",
                expDate: ""
            });
            toast.success('Variation added successfully');
        } else {
            toast.error('Please fill at least color, size or initial stock');
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
                color: v.color || 'Default',
                size: v.size || 'Default',
                capacity: v.storage || 'N/A',
                initialQty: v.initialQty,
                costPrice: v.costPrice,
                mrp: v.mrp,
                rsp: v.rsp,
                wsp: v.wsp,
                mfgDate: v.mfgDate,
                expDate: v.expDate,
                statusId: 1
            }));

            // If no variations added by user, use the main stock info if provided
            if (processedVariations.length === 0) {
                processedVariations.push({
                    barcode: mainBarcode,
                    color: 'Default',
                    size: 'Default',
                    capacity: 'N/A',
                    initialQty: productData.initialQty,
                    costPrice: productData.costPrice,
                    mrp: productData.mrp,
                    rsp: productData.rsp,
                    wsp: productData.wsp,
                    mfgDate: productData.mfgDate,
                    expDate: productData.expDate,
                    statusId: 1
                });
            }

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
                typeId: "",
                initialQty: 0,
                costPrice: 0,
                mrp: 0,
                rsp: 0,
                wsp: 0,
                mfgDate: "",
                expDate: "",
                hasVariations: false,
            });
            setVariations([]);
            setSelectedCategory(null);
            setSelectedBrand(null);
            setSelectedUnit(null);
            setSelectedProductType(null);
            setCurrentStep(1);

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
            // Modal closing with Escape
            if (e.key === "Escape") {
                setIsCategoryModalOpen(false);
                setIsBrandModalOpen(false);
                setIsUnitModalOpen(false);
                setIsTypeModalOpen(false);
                setIsVariationModalOpen(false);
                setShowColorSelect(false);
            }

            // Arrow navigation for list
            if (e.key === "ArrowDown") {
                e.preventDefault();
                setSelectedIndex((prev) =>
                    prev < currentPageData.length - 1 ? prev + 1 : prev
                );
            } else if (e.key === "ArrowUp") {
                e.preventDefault();
                setSelectedIndex((prev) => (prev > 0 ? prev - 1 : prev));
            } else if (e.key === "PageDown") {
                e.preventDefault();
                goToNextPage();
            } else if (e.key === "PageUp") {
                e.preventDefault();
                goToPreviousPage();
            } else if (e.key === "Home") {
                e.preventDefault();
                setSelectedIndex(0);
            } else if (e.key === "End") {
                e.preventDefault();
                setSelectedIndex(currentPageData.length - 1);
            }

            // Alt Key Combinations
            if (e.altKey) {
                switch (e.key.toLowerCase()) {
                    case 'n': // Next Step
                        e.preventDefault();
                        if (currentStep < 4) nextStep();
                        break;
                    case 'p': // Previous Step
                        e.preventDefault();
                        if (currentStep > 1) prevStep();
                        break;
                    case 's': // Save / Complete
                        e.preventDefault();
                        if (currentStep === 4 && !isSubmitting) handleSubmitProduct();
                        break;
                    case 'a': // Add Variation
                        e.preventDefault();
                        if (currentStep === 3) handleAddVariation();
                        break;
                }
            }

            // Ctrl + S as standard save
            if (e.ctrlKey && e.key === 's') {
                e.preventDefault();
                if (currentStep === 4 && !isSubmitting) handleSubmitProduct();
            }

            // Simple Enter for next/submit (if not in input)
            if (e.key === "Enter" && !e.shiftKey) {
                const target = e.target as HTMLElement;
                // If in a modal, don't trigger step navigation
                if (isCategoryModalOpen || isBrandModalOpen || isUnitModalOpen || isTypeModalOpen) return;
                
                if (target.tagName !== 'INPUT' && target.tagName !== 'TEXTAREA' && target.tagName !== 'BUTTON') {
                     if (currentStep < 4) nextStep();
                     else if (currentStep === 4 && !isSubmitting) handleSubmitProduct();
                }
            }
            
            // F-Keys for Quick Adds
            if (e.key === 'F1') { e.preventDefault(); openModal('category'); }
            if (e.key === 'F2') { e.preventDefault(); openModal('brand'); }
            if (e.key === 'F3') { e.preventDefault(); openModal('unit'); }
            if (e.key === 'F4') { e.preventDefault(); openModal('type'); }
            
            // Shift + Enter always next/submit
            if (e.key === "Enter" && e.shiftKey) {
                e.preventDefault();
                if (!isSubmitting) {
                    if (currentStep < 4) nextStep();
                    else handleSubmitProduct();
                }
            }
        };

        window.addEventListener("keydown", handleKeyDown);
        return () => window.removeEventListener("keydown", handleKeyDown);
    }, [currentStep, isSubmitting, isCategoryModalOpen, isBrandModalOpen, isUnitModalOpen, isTypeModalOpen, productData, variations, currentPageData]);

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
            <div className="flex flex-col gap-4 min-h-[calc(100vh-120px)]">
                <div className="flex items-center justify-between">
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
                    <div className="flex gap-2">
                        <button
                            onClick={handleDownloadTemplate}
                            className="flex items-center gap-2 px-4 py-2 bg-white border border-gray-200 text-gray-700 hover:bg-gray-50 hover:text-emerald-600 font-medium rounded-lg shadow-sm transition-all "
                            title="Download CSV Template"
                        >
                            <Download size={18} />
                            <span>Template</span>
                        </button>
                        <input
                            type="file"
                            accept=".xlsx, .xls, .csv"
                            onChange={handleFileChange}
                            className="hidden"
                            id="product-import"
                        />
                        <label
                            htmlFor="product-import"
                            className={`flex items-center gap-2 px-4 py-2 bg-white border border-gray-200 text-gray-700 hover:bg-gray-50 hover:text-emerald-600 font-medium rounded-lg shadow-sm transition-all cursor-pointer ${isImporting ? 'opacity-50 cursor-not-allowed' : ''}`}
                        >
                            {isImporting ? <Loader2 size={18} className="animate-spin text-emerald-600" /> : <Upload size={18} />}
                            <span>{isImporting ? 'Importing...' : 'Import Products'}</span>
                        </label>
                    </div>
                    {/* Shortcuts Hint Style from Quotation */}
                    <div className="hidden lg:flex items-center gap-2 bg-white px-4 py-2 rounded-xl border border-gray-100 shadow-sm border-b-2">
                        <div className="flex items-center gap-1.5 px-2 py-1 bg-gray-50 rounded-lg border border-gray-100">
                            <span className="text-[10px] font-black text-gray-500 bg-white px-1.5 py-0.5 rounded shadow-sm border border-gray-200">F1-F4</span>
                            <span className="text-[10px] font-bold text-gray-400 uppercase tracking-tight">Quick Add</span>
                        </div>
                        <div className="flex items-center gap-1.5 px-2 py-1 bg-gray-50 rounded-lg border border-gray-100">
                            <span className="text-[10px] font-black text-gray-500 bg-white px-1.5 py-0.5 rounded shadow-sm border border-gray-200">↑↓</span>
                            <span className="text-[10px] font-bold text-gray-400 uppercase tracking-tight">Nav List</span>
                        </div>
                        <div className="flex items-center gap-1.5 px-2 py-1 bg-gray-50 rounded-lg border border-gray-100">
                            <span className="text-[10px] font-black text-gray-500 bg-white px-1.5 py-0.5 rounded shadow-sm border border-gray-200">ALT+N</span>
                            <span className="text-[10px] font-bold text-gray-400 uppercase tracking-tight">Next</span>
                        </div>
                        <div className="flex items-center gap-1.5 px-2 py-1 bg-gray-50 rounded-lg border border-gray-100">
                            <span className="text-[10px] font-black text-gray-500 bg-white px-1.5 py-0.5 rounded shadow-sm border border-gray-200">ALT+A</span>
                            <span className="text-[10px] font-bold text-gray-400 uppercase tracking-tight">Variant</span>
                        </div>
                        <div className="flex items-center gap-1.5 px-2 py-1 bg-gray-50 rounded-lg border border-gray-100">
                            <span className="text-[10px] font-black text-gray-500 bg-white px-1.5 py-0.5 rounded shadow-sm border border-gray-200">CTRL+S</span>
                            <span className="text-[10px] font-bold text-gray-400 uppercase tracking-tight">Save</span>
                        </div>
                        <div className="flex items-center gap-1.5 px-2 py-1 bg-gray-50 rounded-lg border border-gray-100">
                            <span className="text-[10px] font-black text-gray-500 bg-white px-1.5 py-0.5 rounded shadow-sm border border-gray-200">ESC</span>
                            <span className="text-[10px] font-bold text-gray-400 uppercase tracking-tight">Close</span>
                        </div>
                    </div>

                    
                </div>

                <div
                    className="bg-white rounded-xl p-8 flex flex-col border border-gray-200 shadow-sm flex-1"
                >
                    {/* Stepper */}
                    <div className="mb-8 overflow-x-auto pb-4">
                        <div className="flex items-center justify-between min-w-[600px]">
                            {steps.map((step, idx) => (
                                <div key={step.id} className="flex items-center flex-1 last:flex-none">
                                    <div className="flex flex-col items-center relative">
                                        <div 
                                            onClick={() => {
                                                if (step.id < currentStep) setCurrentStep(step.id);
                                            }}
                                            className={`w-10 h-10 rounded-full flex items-center justify-center transition-all cursor-pointer ${
                                            currentStep === step.id 
                                                ? 'bg-emerald-600 text-white ring-4 ring-emerald-100' 
                                                : step.id < currentStep 
                                                    ? 'bg-emerald-100 text-emerald-600' 
                                                    : 'bg-gray-100 text-gray-400'
                                        }`}>
                                            <step.icon size={20} />
                                        </div>
                                        <span className={`text-xs font-semibold mt-2 ${currentStep === step.id ? 'text-emerald-700' : 'text-gray-500'}`}>
                                            {step.title}
                                        </span>
                                    </div>
                                    {idx < steps.length - 1 && (
                                        <div className={`flex-1 h-0.5 mx-4 mt-[-20px] ${step.id < currentStep ? 'bg-emerald-500' : 'bg-gray-200'}`}></div>
                                    )}
                                </div>
                            ))}
                        </div>
                    </div>

                    {currentStep === 1 && (
                        <div className="animate-in fade-in slide-in-from-right-4 duration-300">
                            <div className="flex items-center gap-2 mb-6">
                                <div className="p-2 bg-emerald-50 rounded-lg">
                                    <Package className="text-emerald-600" size={20} />
                                </div>
                                <div>
                                    <h2 className="text-xl font-semibold text-gray-800">Product Information</h2>
                                    <p className="text-sm text-gray-500">Provide the fundamental details for your new product.</p>
                                </div>
                            </div>

                            <div className={"grid md:grid-cols-3 gap-6"}>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">
                                        Product Name <span className="text-red-500 font-bold">*</span>
                                    </label>
                                    <input
                                        type="text"
                                        value={productData.name}
                                        onChange={(e) => setProductData({ ...productData, name: e.target.value })}
                                        placeholder="e.g. iPhone 15 Pro"
                                        className={`w-full text-sm rounded-lg py-2.5 px-4 border-2 transition-all outline-none ${!productData.name && isSubmitting ? 'border-red-200 bg-red-50' : 'border-gray-200 focus:border-emerald-500 focus:ring-4 focus:ring-emerald-50'}`}
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">
                                        Product Code <span className="text-red-500 font-bold">*</span>
                                    </label>
                                    <input
                                        type="text"
                                        value={productData.code}
                                        onChange={(e) => setProductData({ ...productData, code: e.target.value })}
                                        placeholder="e.g. IP15P-128"
                                        className={`w-full text-sm rounded-lg py-2.5 px-4 border-2 transition-all outline-none ${!productData.code && isSubmitting ? 'border-red-200 bg-red-50' : 'border-gray-200 focus:border-emerald-500 focus:ring-4 focus:ring-emerald-50'}`}
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">
                                        Barcode
                                    </label>
                                    <input
                                        type="text"
                                        value={productData.barcode}
                                        onChange={(e) => setProductData({ ...productData, barcode: e.target.value })}
                                        placeholder="Leave empty for auto-generate"
                                        className="w-full text-sm rounded-lg py-2.5 px-4 border-2 border-gray-200 focus:border-emerald-500 focus:ring-4 focus:ring-emerald-50 transition-all outline-none bg-gray-50"
                                    />
                                </div>
                                <div>
                                    <div className="flex justify-between items-center mb-1">
                                        <label className="block text-sm font-medium text-gray-700">
                                            Category <span className="text-red-500 font-bold">*</span>
                                        </label>
                                        <button
                                            onClick={() => openModal('category')}
                                            className="text-xs text-emerald-600 hover:underline font-medium"
                                        >
                                            Quick Add
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
                                            Brand <span className="text-red-500 font-bold">*</span>
                                        </label>
                                        <button
                                            onClick={() => openModal('brand')}
                                            className="text-xs text-emerald-600 hover:underline font-medium"
                                        >
                                            Quick Add
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
                                            Unit <span className="text-red-500 font-bold">*</span>
                                        </label>
                                        <button
                                            onClick={() => openModal('unit')}
                                            className="text-xs text-emerald-600 hover:underline font-medium"
                                        >
                                            Quick Add
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
                                            Product Type <span className="text-red-500 font-bold">*</span>
                                        </label>
                                        <button
                                            onClick={() => openModal('type')}
                                            className="text-xs text-emerald-600 hover:underline font-medium"
                                        >
                                            Quick Add
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
                        </div>
                    )}

                    {currentStep === 2 && (
                        <div className="animate-in fade-in slide-in-from-right-4 duration-300">
                            <div className="flex items-center justify-between mb-6">
                                <div className="flex items-center gap-2">
                                    <div className="p-2 bg-blue-50 rounded-lg">
                                        <Plus className="text-blue-600" size={20} />
                                    </div>
                                    <div>
                                        <h2 className="text-xl font-semibold text-gray-800">Initial Stock & Pricing <span className="text-xs bg-gray-100 text-gray-500 px-2 py-1 rounded ml-2 font-normal italic">Optional</span></h2>
                                        <p className="text-sm text-gray-500">Configure opening stock and pricing details if available.</p>
                                    </div>
                                </div>
                                {variations.length > 0 && (
                                    <div className="px-4 py-2 bg-amber-50 border border-amber-200 rounded-lg flex items-center gap-2 text-amber-700 text-sm animate-pulse">
                                        <span>Notice: Variations added. This section will be ignored.</span>
                                    </div>
                                )}
                            </div>

                            <div className="grid lg:grid-cols-3 gap-6">
                                {/* Stock Section */}
                                <div className="bg-emerald-50/50 rounded-2xl p-6 border border-emerald-100">
                                    <div className="flex items-center gap-2 mb-4">
                                        <div className="p-1.5 bg-emerald-100 rounded-lg">
                                            <Package size={16} className="text-emerald-600" />
                                        </div>
                                        <h3 className="text-sm font-bold text-emerald-900 uppercase tracking-wider">Inventory</h3>
                                    </div>
                                    <div className="space-y-4">
                                        <div>
                                            <label className="block text-xs font-bold text-emerald-700/60 mb-1.5 uppercase ml-1">Opening Stock Qty</label>
                                            <input
                                                type="number"
                                                value={productData.initialQty}
                                                onChange={(e) => setProductData({ ...productData, initialQty: parseFloat(e.target.value) || 0 })}
                                                className="w-full text-lg rounded-xl py-3 px-4 border-2 border-white bg-white focus:border-emerald-500 shadow-sm transition-all outline-none font-bold text-emerald-700"
                                            />
                                        </div>
                                        <div className="grid grid-cols-2 gap-3 pt-2">
                                            <div>
                                                <label className="block text-[10px] font-bold text-gray-400 mb-1 uppercase">Mfg Date</label>
                                                <input
                                                    type="date"
                                                    value={productData.mfgDate}
                                                    onChange={(e) => setProductData({ ...productData, mfgDate: e.target.value })}
                                                    className="w-full text-xs rounded-lg py-2 px-3 border border-gray-100 bg-white"
                                                />
                                            </div>
                                            <div>
                                                <label className="block text-[10px] font-bold text-gray-400 mb-1 uppercase">Exp Date</label>
                                                <input
                                                    type="date"
                                                    value={productData.expDate}
                                                    onChange={(e) => setProductData({ ...productData, expDate: e.target.value })}
                                                    className="w-full text-xs rounded-lg py-2 px-3 border border-gray-100 bg-white text-red-600 font-medium"
                                                />
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                {/* Pricing Section */}
                                <div className="lg:col-span-2 bg-gray-50 rounded-2xl p-6 border border-gray-100">
                                    <div className="flex items-center gap-2 mb-4">
                                        <div className="p-1.5 bg-gray-200 rounded-lg">
                                            <Plus size={16} className="text-gray-600" />
                                        </div>
                                        <h3 className="text-sm font-bold text-gray-700 uppercase tracking-wider">Pricing Configuration</h3>
                                    </div>
                                    <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                                        <div className="lg:col-span-2">
                                            <label className="block text-xs font-bold text-gray-400 mb-1.5 uppercase ml-1">Retail Price (LKR)</label>
                                            <input
                                                type="number"
                                                value={productData.rsp}
                                                onChange={(e) => setProductData({ ...productData, rsp: parseFloat(e.target.value) || 0 })}
                                                className="w-full text-2xl rounded-xl py-4 px-5 border-2 border-white bg-white focus:border-emerald-500 shadow-sm transition-all outline-none font-bold text-emerald-600 font-mono"
                                            />
                                        </div>
                                        <div className="lg:col-span-2">
                                            <label className="block text-xs font-bold text-gray-400 mb-1.5 uppercase ml-1">Wholesale Price (LKR)</label>
                                            <input
                                                type="number"
                                                value={productData.wsp}
                                                onChange={(e) => setProductData({ ...productData, wsp: parseFloat(e.target.value) || 0 })}
                                                className="w-full text-2xl rounded-xl py-4 px-5 border-2 border-white bg-white focus:border-orange-500 shadow-sm transition-all outline-none font-bold text-orange-600 font-mono"
                                            />
                                        </div>
                                        <div>
                                            <label className="block text-[10px] font-bold text-gray-400 mb-1.5 uppercase ml-1">Cost Price</label>
                                            <input
                                                type="number"
                                                value={productData.costPrice}
                                                onChange={(e) => setProductData({ ...productData, costPrice: parseFloat(e.target.value) || 0 })}
                                                className="w-full text-sm rounded-xl py-2 px-4 border-2 border-white bg-white focus:border-blue-500 shadow-sm transition-all outline-none font-mono"
                                            />
                                        </div>
                                        <div>
                                            <label className="block text-[10px] font-bold text-gray-400 mb-1.5 uppercase ml-1">MRP</label>
                                            <input
                                                type="number"
                                                value={productData.mrp}
                                                onChange={(e) => setProductData({ ...productData, mrp: parseFloat(e.target.value) || 0 })}
                                                className="w-full text-sm rounded-xl py-2 px-4 border-2 border-white bg-white focus:border-purple-500 shadow-sm transition-all outline-none font-mono"
                                            />
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}

                    {currentStep === 3 && (
                        <div className="animate-in fade-in slide-in-from-right-4 duration-300">
                             <div className="flex items-center gap-2 mb-6">
                                <div className="p-2 bg-purple-50 rounded-lg">
                                    <Trash2 className="text-purple-600" size={20} />
                                </div>
                                <div>
                                    <h2 className="text-xl font-semibold text-gray-800">Product Variations <span className="text-xs bg-gray-100 text-gray-500 px-2 py-1 rounded ml-2 font-normal italic">Optional</span></h2>
                                    <p className="text-sm text-gray-500">Add different colors, sizes, or capacities for this product.</p>
                                </div>
                            </div>

                            <div className="bg-white rounded-2xl p-6 border border-gray-100 shadow-sm">
                                <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
                                    <div className="relative group">
                                        <label className="block text-xs font-bold text-gray-500 mb-1.5 uppercase tracking-wider ml-1">Variation Color</label>
                                        <div className="flex gap-2">
                                            <input
                                                type="text"
                                                value={currentVariation.color}
                                                onChange={(e) => setCurrentVariation({ ...currentVariation, color: e.target.value })}
                                                onFocus={() => setShowColorSelect(true)}
                                                placeholder="e.g. Matte Black"
                                                className="w-full text-sm rounded-xl py-2.5 px-4 border-2 border-gray-100 focus:border-emerald-500 focus:ring-4 focus:ring-emerald-50 transition-all outline-none"
                                            />
                                            <button
                                                onClick={() => setShowColorSelect(!showColorSelect)}
                                                className="p-2.5 border-2 border-gray-100 rounded-xl bg-white hover:border-emerald-200 transition-all"
                                            >
                                                <div className="w-6 h-6 rounded-lg border border-gray-200" style={{ backgroundColor: COMMON_COLORS.find(c => c.name === currentVariation.color)?.code || '#f3f4f6' }}></div>
                                            </button>
                                        </div>
                                        {showColorSelect && (
                                            <>
                                                <div className="fixed inset-0 z-40" onClick={() => setShowColorSelect(false)}></div>
                                                <div className="absolute top-full left-0 mt-3 p-4 bg-white rounded-2xl shadow-2xl border border-gray-100 z-50 w-72 grid grid-cols-5 gap-3 animate-in fade-in zoom-in-95 duration-200">
                                                    {COMMON_COLORS.map((color) => (
                                                        <button
                                                            key={color.name}
                                                            onClick={() => {
                                                                setCurrentVariation({ ...currentVariation, color: color.name });
                                                                setShowColorSelect(false);
                                                            }}
                                                            title={color.name}
                                                            className="w-10 h-10 rounded-xl border-2 border-gray-100 hover:scale-110 hover:border-emerald-500 transition-all shadow-sm"
                                                            style={{ backgroundColor: color.code }}
                                                        />
                                                    ))}
                                                </div>
                                            </>
                                        )}
                                    </div>
                                    <div>
                                        <label className="block text-xs font-bold text-gray-500 mb-1.5 uppercase tracking-wider ml-1">Size / Dimension</label>
                                        <input
                                            type="text"
                                            value={currentVariation.size}
                                            onChange={(e) => setCurrentVariation({ ...currentVariation, size: e.target.value })}
                                            placeholder="e.g. XL / 6.7 inch"
                                            className="w-full text-sm rounded-xl py-2.5 px-4 border-2 border-gray-100 focus:border-emerald-500 focus:ring-4 focus:ring-emerald-50 transition-all outline-none"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-xs font-bold text-gray-500 mb-1.5 uppercase tracking-wider ml-1">Storage / RAM</label>
                                        <input
                                            type="text"
                                            value={currentVariation.storage}
                                            onChange={(e) => setCurrentVariation({ ...currentVariation, storage: e.target.value })}
                                            placeholder="e.g. 512GB / 12GB"
                                            className="w-full text-sm rounded-xl py-2.5 px-4 border-2 border-gray-100 focus:border-emerald-500 focus:ring-4 focus:ring-emerald-50 transition-all outline-none"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-xs font-bold text-gray-500 mb-1.5 uppercase tracking-wider ml-1">Variant Barcode</label>
                                        <input
                                            type="text"
                                            value={currentVariation.barcode}
                                            onChange={(e) => setCurrentVariation({ ...currentVariation, barcode: e.target.value })}
                                            placeholder="Auto-generated if empty"
                                            className="w-full text-sm rounded-xl py-2.5 px-4 border-2 border-gray-100 focus:border-emerald-500 focus:ring-4 focus:ring-emerald-50 transition-all outline-none bg-gray-50/50"
                                        />
                                    </div>
                                </div>

                                <div className="bg-gray-50/50 rounded-2xl p-6 border border-gray-100">
                                    <h4 className="text-[10px] font-bold text-gray-400 uppercase tracking-[0.2em] mb-4 flex items-center gap-2">
                                        <Plus size={14} className="text-emerald-500" /> Variant Stock Details
                                    </h4>
                                    <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
                                        <div>
                                            <label className="block text-[10px] font-bold text-gray-500 mb-1 uppercase tracking-tight">Stock Qty</label>
                                            <input
                                                type="number"
                                                value={currentVariation.initialQty}
                                                onChange={(e) => setCurrentVariation({ ...currentVariation, initialQty: parseFloat(e.target.value) || 0 })}
                                                onKeyDown={(e) => e.key === 'Enter' && handleAddVariation()}
                                                className="w-full text-sm rounded-xl py-2 px-3 border-2 border-white bg-white focus:border-emerald-500 shadow-sm transition-all outline-none font-bold text-emerald-700"
                                            />
                                        </div>
                                        <div>
                                            <label className="block text-[10px] font-bold text-gray-500 mb-1 uppercase tracking-tight">Cost Price</label>
                                            <input
                                                type="number"
                                                value={currentVariation.costPrice}
                                                onChange={(e) => setCurrentVariation({ ...currentVariation, costPrice: parseFloat(e.target.value) || 0 })}
                                                onKeyDown={(e) => e.key === 'Enter' && handleAddVariation()}
                                                className="w-full text-sm rounded-xl py-2 px-3 border-2 border-white bg-white focus:border-blue-500 shadow-sm transition-all outline-none font-mono"
                                            />
                                        </div>
                                        <div>
                                            <label className="block text-[10px] font-bold text-gray-500 mb-1 uppercase tracking-tight">MRP</label>
                                            <input
                                                type="number"
                                                value={currentVariation.mrp}
                                                onChange={(e) => setCurrentVariation({ ...currentVariation, mrp: parseFloat(e.target.value) || 0 })}
                                                onKeyDown={(e) => e.key === 'Enter' && handleAddVariation()}
                                                className="w-full text-sm rounded-xl py-2 px-3 border-2 border-white bg-white focus:border-purple-500 shadow-sm transition-all outline-none font-mono"
                                            />
                                        </div>
                                        <div>
                                            <label className="block text-[10px] font-bold text-gray-500 mb-1 uppercase tracking-tight">Retail Price</label>
                                            <input
                                                type="number"
                                                value={currentVariation.rsp}
                                                onChange={(e) => setCurrentVariation({ ...currentVariation, rsp: parseFloat(e.target.value) || 0 })}
                                                onKeyDown={(e) => e.key === 'Enter' && handleAddVariation()}
                                                className="w-full text-sm rounded-xl py-2 px-3 border-2 border-white bg-white focus:border-emerald-500 shadow-sm transition-all outline-none font-mono text-emerald-600 font-bold"
                                            />
                                        </div>
                                        <div>
                                            <label className="block text-[10px] font-bold text-gray-500 mb-1 uppercase tracking-tight">Wholesale</label>
                                            <input
                                                type="number"
                                                value={currentVariation.wsp}
                                                onChange={(e) => setCurrentVariation({ ...currentVariation, wsp: parseFloat(e.target.value) || 0 })}
                                                onKeyDown={(e) => e.key === 'Enter' && handleAddVariation()}
                                                className="w-full text-sm rounded-xl py-2 px-3 border-2 border-white bg-white focus:border-orange-500 shadow-sm transition-all outline-none font-mono text-orange-600"
                                            />
                                        </div>
                                    </div>

                                    <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mt-6 pt-4 border-t border-gray-100">
                                        <div className="lg:col-span-2 flex items-center gap-2">
                                            <div className="p-1.5 bg-amber-50 rounded-lg">
                                                <Download size={14} className="text-amber-600 rotate-180" />
                                            </div>
                                            <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Expiration Tracking</span>
                                        </div>
                                        <div>
                                            <label className="block text-[9px] font-bold text-gray-400 mb-1 uppercase ml-1">Mfg Date</label>
                                            <input
                                                type="date"
                                                value={currentVariation.mfgDate}
                                                onChange={(e) => setCurrentVariation({ ...currentVariation, mfgDate: e.target.value })}
                                                onKeyDown={(e) => e.key === 'Enter' && handleAddVariation()}
                                                className="w-full text-[11px] rounded-lg py-1.5 px-3 border border-gray-200 bg-white focus:border-emerald-500 transition-all outline-none text-gray-600"
                                            />
                                        </div>
                                        <div>
                                            <label className="block text-[9px] font-bold text-gray-400 mb-1 uppercase ml-1">Exp Date</label>
                                            <input
                                                type="date"
                                                value={currentVariation.expDate}
                                                onChange={(e) => setCurrentVariation({ ...currentVariation, expDate: e.target.value })}
                                                onKeyDown={(e) => e.key === 'Enter' && handleAddVariation()}
                                                className="w-full text-[11px] rounded-lg py-1.5 px-3 border border-gray-200 bg-white focus:border-red-400 focus:ring-4 focus:ring-red-50/50 transition-all outline-none text-gray-600 font-medium"
                                            />
                                        </div>
                                    </div>

                                    <div className="mt-8 pt-6 border-t border-gray-100 flex justify-end">
                                        <button
                                            onClick={handleAddVariation}
                                            className="min-w-[220px] flex items-center justify-center gap-3 py-3.5 px-8 bg-gray-900 hover:bg-black text-white font-bold rounded-2xl shadow-xl transition-all active:scale-95 group hover:-translate-y-0.5"
                                        >
                                            <Plus size={22} className="group-hover:rotate-90 transition-transform" /> 
                                            <span>Add Variation to List</span>
                                        </button>
                                    </div>
                                </div>
                            </div>

                            {variations.length > 0 && (
                                <div className="mt-6">
                                <h3 className="text-sm font-bold text-gray-700 mb-3 flex items-center gap-2">
                                    Added Variations: 
                                    <span className="bg-emerald-100 text-emerald-700 px-2 py-0.5 rounded-full text-xs">
                                        {variations.length}
                                    </span>
                                </h3>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                                    {variations.map((v, index) => (
                                        <div key={index} className="flex items-center justify-between bg-white p-4 rounded-xl border border-gray-200 shadow-sm hover:border-emerald-200 transition-all group">
                                            <div className="flex flex-col gap-1">
                                                <div className="flex gap-2">
                                                    {v.color && <span className="text-xs font-bold px-2 py-0.5 bg-gray-100 rounded-md text-gray-700">{v.color}</span>}
                                                    {v.size && <span className="text-xs font-bold px-2 py-0.5 bg-blue-50 rounded-md text-blue-700">{v.size}</span>}
                                                    {v.storage && <span className="text-xs font-bold px-2 py-0.5 bg-purple-50 rounded-md text-purple-700">{v.storage}</span>}
                                                </div>
                                                <div className="text-[11px] text-gray-500 grid grid-cols-2 gap-x-3 gap-y-1 mt-1">
                                                    <span>Qty: <strong className="text-emerald-600">{v.initialQty}</strong></span>
                                                    <span>Retail: <strong className="text-blue-600">{v.rsp}</strong></span>
                                                    <span>Cost: <strong className="text-gray-700">{v.costPrice}</strong></span>
                                                    <span>WSP: <strong className="text-orange-600">{v.wsp}</strong></span>
                                                    {v.expDate && <span className="col-span-2 text-red-500">Exp: {v.expDate}</span>}
                                                </div>
                                            </div>
                                            <button
                                                onClick={() => handleRemoveVariation(index)}
                                                className="p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors opacity-0 group-hover:opacity-100"
                                            >
                                                <Trash2 size={16} />
                                            </button>
                                        </div>
                                    ))}
                                    </div>
                                </div>
                            )}
                        </div>
                    )}

                {currentStep === 4 && (
                    <div className="animate-in fade-in slide-in-from-right-4 duration-300">
                             <div className="flex items-center gap-2 mb-6">
                                <div className="p-2 bg-emerald-50 rounded-lg">
                                    <Package className="text-emerald-600" size={20} />
                                </div>
                                <div>
                                    <h2 className="text-xl font-semibold text-gray-800">Review & Confirm</h2>
                                    <p className="text-sm text-gray-500">Please review the details before finalizing the product.</p>
                                </div>
                            </div>

                            <div className="grid md:grid-cols-2 gap-8">
                                <div className="space-y-6">
                                    <div className="bg-gray-50 rounded-2xl p-6 border border-gray-100">
                                        <h3 className="text-sm font-bold text-gray-400 uppercase tracking-wider mb-4">Basic Information</h3>
                                        <div className="grid grid-cols-2 gap-y-4">
                                            <div className="text-sm text-gray-500 italic">Product Name</div>
                                            <div className="text-sm font-semibold text-gray-800">{productData.name}</div>
                                            
                                            <div className="text-sm text-gray-500 italic">Product Code</div>
                                            <div className="text-sm font-semibold text-gray-800 font-mono">{productData.code}</div>
                                            
                                            <div className="text-sm text-gray-500 italic">Category</div>
                                            <div className="text-sm font-semibold text-emerald-700">{selectedCategory?.label || 'N/A'}</div>
                                            
                                            <div className="text-sm text-gray-500 italic">Brand</div>
                                            <div className="text-sm font-semibold text-gray-800">{selectedBrand?.label || 'N/A'}</div>
                                        </div>
                                    </div>
                                </div>

                                <div className="space-y-6">
                                    <div className="bg-emerald-50/30 rounded-2xl p-6 border border-emerald-100">
                                        <h3 className="text-sm font-bold text-emerald-600 uppercase tracking-wider mb-4">Stock Overview</h3>
                                        {variations.length > 0 ? (
                                             <div className="space-y-2">
                                                <p className="text-sm text-gray-600 mb-2">Creating <span className="font-bold text-emerald-700">{variations.length} variations</span></p>
                                                <div className="max-h-[300px] overflow-y-auto pr-2 space-y-2">
                                                    {variations.map((v, i) => (
                                                        <div key={i} className="p-3 bg-white rounded-xl border border-emerald-100 flex flex-col gap-1 shadow-sm">
                                                            <div className="flex justify-between items-center text-xs">
                                                                <span className="font-bold text-gray-700">{v.color} {v.size} {v.storage && `(${v.storage})`}</span>
                                                                <span className="font-bold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded">Qty: {v.initialQty}</span>
                                                            </div>
                                                            <div className="grid grid-cols-3 gap-2 text-[10px] text-gray-500 pt-1 border-t border-gray-50">
                                                                <div>Cost: <strong>{v.costPrice}</strong></div>
                                                                <div>Retail: <strong className="text-blue-600">{v.rsp}</strong></div>
                                                                <div>WSP: <strong className="text-orange-600">{v.wsp}</strong></div>
                                                            </div>
                                                            {(v.mfgDate || v.expDate) && (
                                                                <div className="flex gap-3 text-[9px] text-gray-400 mt-1">
                                                                    {v.mfgDate && <span>MFG: {v.mfgDate}</span>}
                                                                    {v.expDate && <span className="text-red-400">EXP: {v.expDate}</span>}
                                                                </div>
                                                            )}
                                                        </div>
                                                    ))}
                                                </div>
                                            </div>
                                        ) : (
                                            <div className="grid grid-cols-2 gap-y-4">
                                                <div className="text-sm text-gray-500 italic">Opening Stock</div>
                                                <div className="text-sm font-bold text-emerald-600">{productData.initialQty}</div>
                                                
                                                <div className="text-sm text-gray-500 italic">Retail Price</div>
                                                <div className="text-sm font-bold text-blue-600">LKR {productData.rsp.toLocaleString()}</div>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}

                    <div className="flex justify-between items-center mt-12 pt-6 border-t border-gray-100">
                        <button
                            onClick={prevStep}
                            disabled={currentStep === 1}
                            className={`flex items-center gap-2 px-6 py-2.5 rounded-xl font-medium transition-all ${currentStep === 1 ? 'opacity-0 cursor-default' : 'text-gray-600 hover:bg-gray-100'}`}
                        >
                            <ChevronLeft size={20} /> Previous
                        </button>
                        
                        <div className="flex gap-4">
                            {currentStep < steps.length ? (
                                <button
                                    onClick={nextStep}
                                    className="flex items-center gap-2 px-8 py-3 bg-emerald-600 hover:bg-emerald-700 text-white font-semibold rounded-xl shadow-lg shadow-emerald-100 transition-all hover:-translate-y-0.5 active:translate-y-0"
                                >
                                    Next Step <ChevronRight size={20} />
                                </button>
                            ) : (
                                <button
                                    onClick={handleSubmitProduct}
                                    disabled={isSubmitting}
                                    className={`flex items-center gap-2 px-10 py-3 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white font-bold rounded-xl shadow-xl shadow-emerald-200 transition-all ${isSubmitting ? 'opacity-50 cursor-not-allowed' : 'hover:-translate-y-1'}`}
                                >
                                    {isSubmitting ? <Loader2 className="animate-spin" size={20} /> : <Package size={20} />}
                                    Complete & Create Product
                                </button>
                            )}
                        </div>
                    </div>
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

                {/* Variation Choice Confirmation Modal */}
                {isVariationModalOpen && (
                    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
                        <div className="fixed inset-0 bg-gray-900/40 backdrop-blur-md transition-all ease-out duration-500" onClick={() => setIsVariationModalOpen(false)}></div>
                        <div className="bg-white rounded-[2.5rem] shadow-2xl w-full max-w-lg relative z-10 overflow-hidden border border-white/20 animate-in zoom-in-95 fade-in duration-300">
                             <div className="absolute top-0 left-0 w-full h-2 bg-gradient-to-r from-blue-500 via-emerald-500 to-purple-500"></div>
                            <div className="p-10">
                                <div className="w-20 h-20 bg-gradient-to-br from-emerald-50 to-teal-50 rounded-3xl flex items-center justify-center mb-8 mx-auto ring-8 ring-emerald-50/50">
                                    <Package className="text-emerald-600" size={40} />
                                </div>
                                <h3 className="text-3xl font-black text-gray-900 text-center mb-3">Product Structure</h3>
                                <p className="text-gray-500 text-center mb-10 text-lg">Does this product come in different variants like <b>Size</b>, <b>Color</b>, or <b>Storage</b>?</p>
                                
                                <div className="grid grid-cols-1 gap-4">
                                    <button
                                        onClick={() => {
                                            setProductData(prev => ({ ...prev, hasVariations: false }));
                                            setIsVariationModalOpen(false);
                                            setCurrentStep(2);
                                        }}
                                        className="flex items-center gap-5 p-6 rounded-3xl border-2 border-gray-100 hover:border-blue-500 hover:bg-blue-50/50 transition-all group relative overflow-hidden text-left"
                                    >
                                        <div className="w-14 h-14 rounded-2xl bg-blue-100/50 text-blue-600 flex items-center justify-center group-hover:bg-blue-600 group-hover:text-white transition-all shrink-0">
                                            <Package size={24} />
                                        </div>
                                        <div>
                                            <span className="block font-black text-gray-800 text-xl group-hover:text-blue-700">Simple Product</span>
                                            <span className="text-sm text-gray-500">Single stock item with no variants</span>
                                        </div>
                                         <ChevronRight className="ml-auto text-gray-300 group-hover:text-blue-500" size={20} />
                                    </button>

                                    <button
                                        onClick={() => {
                                            setProductData(prev => ({ ...prev, hasVariations: true }));
                                            setIsVariationModalOpen(false);
                                            setCurrentStep(3);
                                        }}
                                        className="flex items-center gap-5 p-6 rounded-3xl border-2 border-gray-100 hover:border-emerald-500 hover:bg-emerald-50/50 transition-all group relative overflow-hidden text-left"
                                    >
                                         <div className="w-14 h-14 rounded-2xl bg-emerald-100/50 text-emerald-600 flex items-center justify-center group-hover:bg-emerald-600 group-hover:text-white transition-all shrink-0">
                                            <Plus size={24} />
                                        </div>
                                        <div>
                                            <span className="block font-black text-gray-800 text-xl group-hover:text-emerald-700">Variable Product</span>
                                            <span className="text-sm text-gray-500">Has multiple sizes, colors, etc.</span>
                                        </div>
                                        <ChevronRight className="ml-auto text-gray-300 group-hover:text-emerald-500" size={20} />
                                    </button>
                                </div>
                            </div>
                            <div className="bg-gray-50/80 backdrop-blur-sm p-6 text-center border-t border-gray-100">
                                <button 
                                    onClick={() => setIsVariationModalOpen(false)}
                                    className="text-sm font-bold text-gray-400 hover:text-gray-900 transition-colors uppercase tracking-[0.2em]"
                                >
                                    Cancel & Return
                                </button>
                            </div>
                        </div>
                    </div>
                )}

              
            </div>
        </>
    );
}

export default CreateProducts;  