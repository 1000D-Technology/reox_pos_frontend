import {
    ChevronLeft,
    ChevronRight,
    FileText,
    Plus,
    RefreshCw,
    SearchCheck,
    AlertTriangle,
    Package,
    DollarSign,
    TrendingUp,
    Users,
    ArrowUpRight,
    ArrowDownRight,
    X,
} from 'lucide-react';
import { useEffect, useState } from 'react';
import toast, { Toaster } from 'react-hot-toast';
import TypeableSelect from '../../../components/TypeableSelect.tsx';
import { stockService } from '../../../services/stockService';
import { productService } from '../../../services/productService';
import * as XLSX from 'xlsx';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';

function DamagedStock() {
    // State for summary data
    const [summaryData, setSummaryData] = useState({
        damagedItems: 0,
        totalProducts: 0,
        lossValue: 'LKR 0.00',
        thisMonth: 0,
        affectedSuppliers: 0
    });

    const summaryCards = [
        {
            icon: AlertTriangle,
            label: 'Damaged Items',
            value: summaryData.damagedItems.toString(),
            trend: '',
            color: 'bg-linear-to-br from-red-400 to-red-500',
            iconColor: 'text-white',
            bgGlow: ''
        },
        {
            icon: Package,
            label: 'Total Products',
            value: summaryData.totalProducts.toString(),
            trend: '',
            color: 'bg-linear-to-br from-purple-400 to-purple-500',
            iconColor: 'text-white',
            bgGlow: ''
        },
        {
            icon: DollarSign,
            label: 'Loss Value',
            value: summaryData.lossValue,
            trend: '',
            color: 'bg-linear-to-br from-yellow-400 to-yellow-500',
            iconColor: 'text-white',
            bgGlow: ''
        },
        {
            icon: TrendingUp,
            label: 'This Month',
            value: summaryData.thisMonth.toString(),
            trend: '',
            color: 'bg-linear-to-br from-blue-400 to-blue-500',
            iconColor: 'text-white',
            bgGlow: ''
        },
        {
            icon: Users,
            label: 'Affected Suppliers',
            value: summaryData.affectedSuppliers.toString(),
            trend: '',
            color: 'bg-linear-to-br from-emerald-400 to-emerald-500',
            iconColor: 'text-white',
            bgGlow: ''
        },
    ];

    type SelectOption = {
        value: string;
        label: string;
    };

    // Dropdown data states
    const [category, setCategory] = useState<SelectOption[]>([]);
    const [unit, setUnit] = useState<SelectOption[]>([]);
    const [supplier, setSupplier] = useState<SelectOption[]>([]);
    const [productSearch, setProductSearch] = useState<SelectOption[]>([]);
    const [productAdd, setProductAdd] = useState<SelectOption[]>([]);
    const [stock, setStock] = useState<SelectOption[]>([]);
    const [reason, setReason] = useState<SelectOption[]>([]);
    const [status, setStatus] = useState<SelectOption[]>([]);
    const [loading, setLoading] = useState<boolean>(true);
    const [loadingStock, setLoadingStock] = useState<boolean>(false);

    const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
    const [selectedUnit, setSelectedUnit] = useState<string | null>(null);
    const [selectedSupplier, setSelectedSupplier] = useState<string | null>(null);
    const [selectedProduct, setSelectedProduct] = useState<string | null>(null);
    const [selectedProductAdd, setSelectedProductAdd] = useState<string | null>(null);
    const [selectedStock, setSelectedStock] = useState<string | null>(null);
    const [selectedReason, setSelectedReason] = useState<string | null>(null);
    const [selectedStatus, setSelectedStatus] = useState<string | null>(null);
    const [damagedQty, setDamagedQty] = useState<string>('');
    const [description, setDescription] = useState<string>('');
    const [isSubmitting, setIsSubmitting] = useState<boolean>(false);

    // Date filters for search
    const [fromDate, setFromDate] = useState<string>('');
    const [toDate, setToDate] = useState<string>('');
    const [isSearching, setIsSearching] = useState<boolean>(false);

    // Table data state
    const [salesData, setSalesData] = useState<any[]>([]);
    const [loadingTable, setLoadingTable] = useState<boolean>(true);

    // Detail modal state
    const [isDetailModalOpen, setIsDetailModalOpen] = useState<boolean>(false);
    const [selectedDetailRecord, setSelectedDetailRecord] = useState<any>(null);

    const [selectedIndex, setSelectedIndex] = useState(0);
    const [currentPage, setCurrentPage] = useState(1);
    const [itemsPerPage] = useState(10);

    const totalPages = Math.ceil(salesData.length / itemsPerPage);
    const startIndex = (currentPage - 1) * itemsPerPage;
    const endIndex = startIndex + itemsPerPage;
    const currentSalesData = salesData.slice(startIndex, endIndex);

    // Load dropdown data on component mount
    // Load product data with optional search
        const loadProductData = async (query?: string) => {
            try {
                // If query is provided, we use it. If not (initial load), we fetch default limited set.
                // We pass query as 'searchTerm' to backend.
                const productsData = await productService.getProductsForDropdown({ searchTerm: query || '', limit: 10 });

                // Transform products
                if (productsData.data?.success) {
                    const productOptions = productsData.data.data.map((product: any) => ({
                        value: product.id.toString(),
                        label: product.product_name || product.name
                    }));
                    
                    // We update the productAdd list which is used in the "Add Damaged Stock" section
                    setProductAdd(productOptions);
                    
                    // Note: We might also want to update 'productSearch' if that dropdown should also be searchable server-side,
                    // but usually filter inputs behave differently. For now targeting the Add section as requested.
                     if (!query) {
                        // Initial load populates both
                        setProductSearch(productOptions); 
                     }
                }
            } catch (error) {
                console.error('Error loading product data:', error);
            }
        };

        useEffect(() => {
            const loadDropdownData = async () => {
                try {
                    setLoading(true);
    
                    const [categoriesResponse, unitsResponse, suppliersResponse] = await stockService.getStockFilterData();
    
                    // Transform categories
                    if (categoriesResponse.data?.success) {
                        const categoryOptions = categoriesResponse.data.data.map((category: any) => ({
                            value: category.id.toString(),
                            label: category.name
                        }));
                        setCategory(categoryOptions);
                    }
    
                    // Transform units
                    if (unitsResponse.data?.success) {
                        const unitOptions = unitsResponse.data.data.map((unit: any) => ({
                            value: unit.id.toString(),
                            label: unit.name
                        }));
                        setUnit(unitOptions);
                    }
    
                    // Transform suppliers
                    if (suppliersResponse.data?.success) {
                        const supplierOptions = suppliersResponse.data.data.map((supplier: any) => ({
                            value: supplier.id.toString(),
                            label: supplier.supplierName
                        }));
                        setSupplier(supplierOptions);
                    }
    
                    // Initialize reason and return status from API
                    const reasonResponse = await stockService.getReasons();
                    const returnStatusResponse = await stockService.getReturnStatus();
    
                    if (reasonResponse.data?.success) {
                        const reasonOptions = reasonResponse.data.data.map((reason: any) => ({
                            value: reason.id.toString(),
                            label: reason.reason
                        }));
                        setReason(reasonOptions);
                    }
    
                    if (returnStatusResponse.data?.success) {
                        const statusOptions = returnStatusResponse.data.data.map((status: any) => ({
                            value: status.id.toString(),
                            label: status.name
                        }));
                        setStatus(statusOptions);
                    }
    
                    setLoading(false);
                } catch (error) {
                    console.error('Error loading dropdown data:', error);
                    setLoading(false);
                }
            };

            loadDropdownData();
            loadProductData(); // Initial load
            loadSummaryData();
        }, []);

    // Load summary data
    const loadSummaryData = async () => {
        try {
            const response = await stockService.getDamagedSummary();
            if (response.data?.success) {
                setSummaryData({
                    damagedItems: response.data.data.damagedItems,
                    totalProducts: response.data.data.totalProducts,
                    lossValue: response.data.data.lossValue,
                    thisMonth: response.data.data.thisMonth,
                    affectedSuppliers: response.data.data.affectedSuppliers
                });
            }
        } catch (error) {
            console.error('Error loading summary data:', error);
        }
    };

    // Load stock items when product is selected
    useEffect(() => {
        const loadStockForProduct = async () => {
            if (!selectedProductAdd) {
                setStock([]);
                return;
            }

            try {
                setLoadingStock(true);
                const response = await stockService.getStockByVariant(selectedProductAdd);

                if (response.data?.success) {
                    const stockOptions = response.data.data.map((stockItem: any) => ({
                        value: stockItem.stockID.toString(),
                        label: `${stockItem.displayName} (Qty: ${stockItem.quantity}, Price: LKR ${stockItem.price})`
                    }));
                    setStock(stockOptions);
                } else {
                    setStock([]);
                }
            } catch (error) {
                console.error('Error loading stock for product:', error);
                setStock([]);
            } finally {
                setLoadingStock(false);
            }
        };

        loadStockForProduct();
    }, [selectedProductAdd]);

    // Load damaged table data
    const loadDamagedTableData = async () => {
        try {
            setLoadingTable(true);
            const response = await stockService.getDamagedTableData();

            if (response.data?.success) {
                const mappedData = response.data.data.map((item: any) => ({
                    productId: item.productID,
                    productName: item.productName,
                    unit: item.unit,
                    costPrice: item.costPrice,
                    mrp: item.mrp,
                    price: item.price,
                    supplier: item.supplier,
                    stock: item.stockStatus,
                    damagedQty: item.damagedQty,
                    reason: item.reason,
                    status: item.status,
                    id: item.id,
                    description: item.description,
                    date: item.date
                }));
                setSalesData(mappedData);
            } else {
                setSalesData([]);
            }
        } catch (error) {
            console.error('Error loading damaged table data:', error);
            setSalesData([]);
        } finally {
            setLoadingTable(false);
        }
    };

    useEffect(() => {
        loadDamagedTableData();
    }, []);

    useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            const target = e.target as HTMLElement;
            const isInput = target.tagName === 'INPUT' || target.tagName === 'TEXTAREA';

            if (e.key === 'F2') {
                e.preventDefault();
                const searchInput = document.getElementById('filter-product');
                if (searchInput) searchInput.focus();
                return;
            }

            if (e.key === "ArrowDown") {
                e.preventDefault();
                setSelectedIndex((prev) => Math.min(prev + 1, currentSalesData.length - 1));
            } else if (e.key === "ArrowUp") {
                e.preventDefault();
                setSelectedIndex((prev) => Math.max(prev - 1, 0));
            } else if (e.key === "Enter" && !isInput && currentSalesData[selectedIndex]) {
                handleRowDoubleClick(currentSalesData[selectedIndex]);
            }
        };

        window.addEventListener("keydown", handleKeyDown);
        return () => window.removeEventListener("keydown", handleKeyDown);
    }, [currentSalesData, selectedIndex]);

    const goToPage = (page: number) => {
        if (page >= 1 && page <= totalPages) {
            setCurrentPage(page);
            setSelectedIndex(0);
        }
    };

    const goToPreviousPage = () => goToPage(currentPage - 1);
    const goToNextPage = () => goToPage(currentPage + 1);

    const getPageNumbers = () => {
        const pages: (number | string)[] = [];
        for (let i = 1; i <= totalPages; i++) pages.push(i);
        return pages.slice(0, 5); // Simple pagination for brevity
    };

    const handleClearFilters = () => {
        setSelectedCategory(null);
        setSelectedUnit(null);
        setSelectedSupplier(null);
        setSelectedProduct(null);
        setFromDate('');
        setToDate('');
        loadDamagedTableData();
    };

    const handleSearch = async () => {
        try {
            setIsSearching(true);
            setLoadingTable(true);
            const filters = { 
                category_id: selectedCategory || undefined, 
                unit_id: selectedUnit || undefined, 
                supplier_id: selectedSupplier || undefined, 
                product_id: selectedProduct || undefined, 
                fromDate: fromDate || undefined, 
                toDate: toDate || undefined 
            };
            const response = await stockService.searchDamagedRecords(filters);

            if (response.data?.success) {
                const mappedData = response.data.data.map((item: any) => ({
                    productId: item.productID,
                    productName: item.productName,
                    unit: item.unit,
                    costPrice: item.costPrice,
                    mrp: item.mrp,
                    price: item.price,
                    supplier: item.supplier,
                    stock: item.stockStatus,
                    damagedQty: item.damagedQty,
                    reason: item.reason,
                    status: item.status,
                    id: item.id,
                    description: item.description,
                    date: item.date
                }));
                setSalesData(mappedData);
                setCurrentPage(1);
                setSelectedIndex(0);
            }
        } catch (error) {
            console.error('Search failed', error);
        } finally {
            setIsSearching(false);
            setLoadingTable(false);
        }
    };

    const handleClearAdd = () => {
        setSelectedProductAdd(null);
        setSelectedStock(null);
        setDamagedQty('');
        setSelectedReason(null);
        setSelectedStatus(null);
        setDescription('');
    };

    const handleAddDamaged = async () => {
        if (!selectedProductAdd || !selectedStock || !damagedQty || !selectedReason || !selectedStatus) {
            toast.error('Please fill all required fields');
            return;
        }

        try {
            setIsSubmitting(true);
            const response = await stockService.createDamagedRecord({
                productId: selectedProductAdd,
                stockId: selectedStock,
                damagedQty: parseFloat(damagedQty),
                reasonId: selectedReason,
                statusId: selectedStatus,
                description: description.trim() || undefined
            });

            if (response.data?.success) {
                toast.success('Damaged stock record created!');
                handleClearAdd();
                loadDamagedTableData();
                loadSummaryData();
            }
        } catch (error) {
            toast.error('Failed to create record');
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleStatusChange = async (recordId: string, newStatusId: string) => {
        try {
            const response = await stockService.updateDamagedStatus(recordId, newStatusId);
            if (response.data?.success) {
                toast.success('Status updated');
                loadDamagedTableData();
                loadSummaryData();
            }
        } catch (error) {
            toast.error('Failed to update status');
        }
    };

    const handleRowDoubleClick = (record: any) => {
        setSelectedDetailRecord(record);
        setIsDetailModalOpen(true);
    };

    const handleExportExcel = () => toast.success('Exporting to Excel...');
    const handleExportCSV = () => toast.success('Exporting to CSV...');
    const handleExportPDF = () => toast.success('Exporting to PDF...');

    return (
        <div className="flex flex-col gap-4 min-h-full">
            <Toaster position="top-right" />
            
            {/* Header */}
            <div className="flex items-center justify-between mb-2">
                <div>
                    <div className="text-sm text-gray-400 flex items-center">
                        <span>Stock</span>
                        <span className="mx-2">›</span>
                        <span className="text-gray-700 font-medium">Damaged Stock</span>
                    </div>
                    <h1 className="text-3xl font-semibold bg-linear-to-r from-gray-800 to-gray-600 bg-clip-text text-transparent">
                        Damaged Stock Management
                    </h1>
                </div>
                
                <div className="hidden lg:flex items-center gap-3 bg-white px-4 py-2 rounded-xl border border-gray-100 shadow-sm border-b-2">
                    <div className="flex items-center gap-1.5 px-2 py-1 bg-gray-50 rounded-lg border border-gray-200">
                        <span className="text-[10px] font-black text-gray-500 bg-white px-1.5 py-0.5 rounded shadow-sm border border-gray-200">↑↓</span>
                        <span className="text-[10px] font-bold text-gray-400 uppercase tracking-tight">Navigate</span>
                    </div>
                    <div className="flex items-center gap-1.5 px-2 py-1 bg-gray-50 rounded-lg border border-gray-200">
                        <span className="text-[10px] font-black text-gray-500 bg-white px-1.5 py-0.5 rounded shadow-sm border border-gray-200">Enter</span>
                        <span className="text-[10px] font-bold text-gray-400 uppercase tracking-tight">Select</span>
                    </div>
                    <div className="flex items-center gap-1.5 px-2 py-1 bg-gray-50 rounded-lg border border-gray-200">
                        <span className="text-[10px] font-black text-gray-500 bg-white px-1.5 py-0.5 rounded shadow-sm border border-gray-200">F2</span>
                        <span className="text-[10px] font-bold text-gray-400 uppercase tracking-tight">Search</span>
                    </div>
                </div>
            </div>

            <div className="grid md:grid-cols-5 grid-cols-1 gap-4">
                {summaryCards.map((stat, i) => (
                    <div key={i} className="flex items-center p-4 space-x-3 transition-all bg-white rounded-2xl border border-gray-200 cursor-pointer group relative overflow-hidden">
                        <div className="absolute inset-0 bg-linear-to-br from-transparent via-gray-50/50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                        <div className={`p-3 rounded-full ${stat.color} relative z-10 shadow-sm`}>
                            <stat.icon size={20} className="text-white" />
                        </div>
                        <div className="w-px h-10 bg-gray-200 relative z-10"></div>
                        <div className="relative z-10 flex-1">
                            <div className="flex items-center justify-between">
                                <p className="text-xs text-gray-500">{stat.label}</p>
                                <div className="flex items-center gap-0.5 text-[10px] font-semibold text-emerald-600">
                                    <ArrowUpRight className="w-3 h-3" />
                                    +0%
                                </div>
                            </div>
                            <p className="text-sm font-bold text-gray-700">{stat.value}</p>
                        </div>
                    </div>
                ))}
            </div>

            {/* Filter Section - Matching other panels Style */}
            <div className="bg-white rounded-xl p-4 border border-gray-200 flex flex-col">
                <h2 className="text-xl font-semibold text-gray-700 mb-3">Filter Results</h2>
                <div className="grid md:grid-cols-4 gap-4">
                    <div className="relative col-span-2">
                        <SearchCheck className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
                        <input
                            type="text"
                            id="filter-product-main"
                            placeholder="Quick search damaged records by product name, reason or ID... (F2)"
                            className="w-full pl-10 pr-4 py-2.5 text-sm border-2 border-gray-200 rounded-lg focus:border-emerald-500 transition-all outline-none"
                            onChange={(e) => {
                                const val = e.target.value.toLowerCase();
                                // Handle client-side search or state update
                            }}
                        />
                    </div>
                    <div className="grid grid-cols-2 gap-3">
                        <input type="date" value={fromDate} onChange={(e) => setFromDate(e.target.value)} className="w-full text-sm rounded-lg py-2 px-3 border-2 border-gray-200 focus:border-emerald-400 outline-none transition-all" />
                        <input type="date" value={toDate} onChange={(e) => setToDate(e.target.value)} className="w-full text-sm rounded-lg py-2 px-3 border-2 border-gray-200 focus:border-emerald-400 outline-none transition-all" />
                    </div>
                    <div className="grid grid-cols-2 gap-2">
                        <button
                            onClick={handleSearch}
                            disabled={isSearching}
                            className="bg-linear-to-r from-emerald-500 to-emerald-600 hover:from-emerald-600 hover:to-emerald-700 text-white py-2 rounded-lg flex items-center justify-center transition-all disabled:opacity-50"
                        >
                            <SearchCheck className="mr-2" size={16} /> Filter
                        </button>
                        <button
                            onClick={handleClearFilters}
                            className="bg-linear-to-r from-gray-500 to-gray-600 hover:from-gray-600 hover:to-gray-700 text-white py-2 rounded-lg flex items-center justify-center transition-all"
                        >
                            <RefreshCw className="mr-2" size={16} /> Reset
                        </button>
                    </div>
                </div>
            </div>

            {/* Add Damaged Stock Section */}
            <div className="bg-white rounded-2xl p-6 border border-gray-200 flex flex-col gap-6">
                <div className="flex items-center gap-3 pb-3 border-b border-gray-200">
                    <div className="p-2 bg-emerald-100 rounded-xl text-emerald-600">
                        <Plus size={24} />
                    </div>
                    <div>
                        <h2 className="text-xl font-bold text-gray-800 tracking-tight">Add Damaged Stock</h2>
                        <p className="text-xs text-gray-500 uppercase font-medium">Record new damaged inventory</p>
                    </div>
                </div>

                <div className="grid md:grid-cols-4 gap-5">
                    <div className="space-y-1.5 col-span-2">
                        <label className="block text-sm font-bold text-gray-700 mb-1">Select Product</label>
                        <TypeableSelect
                            options={productAdd}
                            value={selectedProductAdd}
                            onChange={(opt) => setSelectedProductAdd(opt?.value as string || null)}
                            placeholder={loading ? "Loading products..." : "Choose a product..."}
                            disabled={loading}
                            onSearch={loadProductData}
                        />
                    </div>
                    <div className="space-y-1.5 col-span-2">
                        <label className="block text-sm font-bold text-gray-700 mb-1">Select Batch/Stock</label>
                        <TypeableSelect
                            options={stock}
                            value={selectedStock}
                            onChange={(opt) => setSelectedStock(opt?.value as string || null)}
                            placeholder={loadingStock ? "Loading..." : !selectedProductAdd ? "Select product first" : "Choose batch..."}
                            disabled={!selectedProductAdd || loadingStock}
                        />
                    </div>
                    <div className="space-y-1.5">
                        <label className="block text-sm font-bold text-gray-700 mb-1">Damaged Qty</label>
                        <input
                            type="number"
                            value={damagedQty}
                            onChange={(e) => setDamagedQty(e.target.value)}
                            placeholder="Qty"
                            className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 outline-none transition-all font-medium"
                        />
                    </div>
                    <div className="space-y-1.5">
                        <label className="block text-sm font-bold text-gray-700 mb-1">Reason</label>
                        <TypeableSelect
                            options={reason}
                            value={selectedReason}
                            onChange={(opt) => setSelectedReason(opt?.value as string || null)}
                            placeholder="Reason..."
                            disabled={loading}
                        />
                    </div>
                    <div className="space-y-1.5">
                        <label className="block text-sm font-bold text-gray-700 mb-1">Status</label>
                        <TypeableSelect
                            options={status}
                            value={selectedStatus}
                            onChange={(opt) => setSelectedStatus(opt?.value as string || null)}
                            placeholder="Status..."
                            disabled={loading}
                        />
                    </div>
                    <div className="space-y-1.5 flex items-end">
                        <button
                            onClick={handleAddDamaged}
                            disabled={isSubmitting}
                            className="w-full py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-xl transition-all active:scale-[0.98] flex items-center justify-center gap-2 group disabled:opacity-50 shadow-lg shadow-emerald-100"
                        >
                            {isSubmitting ? <RefreshCw className="animate-spin" size={18} /> : <Plus size={18} className="group-hover:rotate-90 transition-transform" />}
                            {isSubmitting ? 'Recording...' : 'Record Damage'}
                        </button>
                    </div>
                    <div className="md:col-span-4 space-y-1.5">
                        <label className="block text-sm font-bold text-gray-700 mb-1">Additional Notes</label>
                        <textarea
                            value={description}
                            onChange={(e) => setDescription(e.target.value)}
                            placeholder="Describe the damage (optional)..."
                            rows={1}
                            className="w-full px-4 py-2 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 outline-none transition-all resize-none italic text-gray-600"
                        />
                    </div>
                </div>
            </div>



            <div
                className="flex flex-col bg-white rounded-2xl p-0 overflow-hidden border border-gray-200 flex-1 shadow-sm min-h-[500px]"
            >
                <div className="overflow-auto flex-1 rounded-lg scrollbar-thin scrollbar-thumb-emerald-200 scrollbar-track-gray-50">
                    <table className="min-w-full divide-y divide-gray-200 relative">
                        <thead className="bg-linear-to-r from-emerald-500 to-emerald-600 sticky top-0 z-10">
                            <tr>
                                {['Product Details', 'Pricing', 'Supplier Info', 'Stock/Qty', 'Damage Details', 'Status', 'Date Recorded'].map((header, i, arr) => (
                                    <th
                                        key={i}
                                        scope="col"
                                        className={`px-6 py-5 text-left text-xs font-bold text-white uppercase tracking-wider ${i === 0 ? 'rounded-tl-lg' : ''} ${i === arr.length - 1 ? 'rounded-tr-lg' : ''}`}
                                    >
                                        {header}
                                    </th>
                                ))}
                            </tr>
                        </thead>

                        <tbody className="bg-white divide-y divide-gray-50">
                            {loadingTable ? (
                                Array(5).fill(0).map((_, i) => (
                                    <tr key={i} className="animate-pulse">
                                        <td colSpan={7} className="px-6 py-8"><div className="h-4 bg-gray-100 rounded w-full"></div></td>
                                    </tr>
                                ))
                            ) : currentSalesData.length === 0 ? (
                                <tr>
                                    <td colSpan={7} className="px-6 py-20 text-center">
                                        <div className="flex flex-col items-center gap-3 text-gray-300">
                                            <Package size={64} className="opacity-20" />
                                            <p className="text-lg font-medium">No damaged stock records found</p>
                                        </div>
                                    </td>
                                </tr>
                            ) : (
                                currentSalesData.map((sale, index) => (
                                    <tr
                                        key={index}
                                        onClick={() => setSelectedIndex(index)}
                                        onDoubleClick={() => handleRowDoubleClick(sale)}
                                        className={`group cursor-pointer transition-all ${selectedIndex === index
                                            ? 'bg-emerald-50 border-l-4 border-l-emerald-500'
                                            : 'hover:bg-gray-50'
                                            }`}
                                    >
                                        <td className="px-6 py-5">
                                            <div className="flex flex-col gap-0.5">
                                                <span className="text-xs text-gray-400">{sale.productId}</span>
                                                <span className="text-sm font-semibold text-gray-800 leading-tight">{sale.productName}</span>
                                                <span className="text-[10px] text-gray-500 px-2 py-0.5 bg-gray-100 rounded-full w-fit mt-1">{sale.unit}</span>
                                            </div>
                                        </td>
                                        <td className="px-6 py-5">
                                            <div className="flex flex-col gap-1">
                                                <div className="flex items-center justify-between gap-4">
                                                    <span className="text-[10px] font-bold text-gray-400">COST</span>
                                                    <span className="text-xs font-bold text-blue-600">LKR {sale.costPrice}</span>
                                                </div>
                                                <div className="flex items-center justify-between gap-4">
                                                    <span className="text-[10px] font-bold text-gray-400 uppercase">PRICE</span>
                                                    <span className="text-xs font-bold text-emerald-600">LKR {sale.price}</span>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-6 py-5">
                                            <span className="text-sm font-semibold text-gray-600 bg-purple-50 px-3 py-1 rounded-lg border border-purple-100">{sale.supplier || 'N/A'}</span>
                                        </td>
                                        <td className="px-6 py-5">
                                            <div className="flex flex-col gap-1">
                                                <span className="text-[10px] font-bold text-gray-400 uppercase">{sale.stock}</span>
                                                <div className="flex items-center gap-2">
                                                    <span className="text-lg font-bold text-red-600 leading-none">{sale.damagedQty}</span>
                                                    <span className="text-[10px] font-bold text-gray-400 uppercase">DAMAGED</span>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-6 py-5">
                                            <div className="flex flex-col gap-0.5 max-w-[150px]">
                                                <span className="text-sm font-bold text-gray-700 line-clamp-1">{sale.reason}</span>
                                                <span className="text-[10px] text-gray-500 italic line-clamp-1">{sale.description || 'No notes'}</span>
                                            </div>
                                        </td>
                                        <td className="px-6 py-5">
                                            <div className="relative group/select">
                                                <select
                                                    value={status.find(s => s.label === sale.status)?.value || ''}
                                                    onChange={(e) => handleStatusChange(sale.id, e.target.value)}
                                                    className={`appearance-none px-4 py-2 text-[10px] font-bold uppercase tracking-wider rounded-full border-2 border-transparent focus:ring-4 focus:ring-red-100 cursor-pointer transition-all outline-none ${
                                                        sale.status === 'Damaged' ? 'bg-red-500 text-white' :
                                                        sale.status === 'Pending Review' ? 'bg-orange-500 text-white' :
                                                        sale.status === 'Under Review' ? 'bg-blue-500 text-white' :
                                                        'bg-emerald-500 text-white'
                                                    }`}
                                                >
                                                    {status.map((statusOption) => (
                                                        <option key={statusOption.value} value={statusOption.value} className="bg-white text-gray-800 font-semibold uppercase">
                                                            {statusOption.label}
                                                        </option>
                                                    ))}
                                                </select>
                                                <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none opacity-50 group-hover/select:opacity-100 transition-opacity">
                                                    <ArrowDownRight size={12} className="text-white" />
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-6 py-5">
                                            {sale.date ? (
                                                <div className="flex flex-col items-end">
                                                    <span className="text-xs font-bold text-gray-800">{new Date(sale.date).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })}</span>
                                                    <span className="text-[10px] font-bold text-gray-400 uppercase px-2 py-0.5 bg-gray-50 rounded border border-gray-100">{new Date(sale.date).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                                                </div>
                                            ) : 'N/A'}
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>

                <nav className="bg-white flex items-center justify-between sm:px-6 pt-4 border-t-2 border-gray-200">
                    <div className="text-sm text-gray-600">
                        Showing <span className="font-semibold text-gray-800">{startIndex + 1}</span> to{' '}
                        <span className="font-semibold text-gray-800">{Math.min(endIndex, salesData.length)}</span> of{' '}
                        <span className="font-semibold text-gray-800">{salesData.length}</span> results
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
                            <button
                                key={index}
                                onClick={() => goToPage(Number(page))}
                                className={`px-4 py-2 text-sm font-semibold rounded-lg transition-all ${currentPage === Number(page)
                                    ? 'bg-linear-to-r from-emerald-500 to-emerald-600 text-white'
                                    : 'text-gray-600 hover:bg-emerald-50 hover:text-emerald-600'
                                    }`}
                            >
                                {page}
                            </button>
                        )}

                        <button
                            onClick={goToNextPage}
                            disabled={currentPage === totalPages}
                            className={`flex items-center px-3 py-2 text-sm font-medium rounded-lg transition-all ${currentPage === totalPages
                                ? 'text-gray-400 cursor-not-allowed'
                                : 'text-gray-600 hover:text-emerald-600 hover:bg-emerald-50'
                                }`}
                        >
                            Next <ChevronRight className="ml-2 h-5 w-5" />
                        </button>
                    </div>
                </nav>
            </div>

            {/* Export Buttons */}
            <div className="bg-white flex justify-center p-4 gap-4 rounded-xl border border-gray-200">
                <button onClick={handleExportExcel} className="bg-emerald-500 hover:bg-emerald-600 px-6 py-2 font-semibold text-white rounded-lg flex gap-2 items-center transition-all active:scale-95 border border-gray-100 shadow-sm"><FileText size={15} />Excel</button>
                <button onClick={handleExportCSV} className="bg-blue-500 hover:bg-blue-600 px-6 py-2 font-semibold text-white rounded-lg flex gap-2 items-center transition-all active:scale-95 border border-gray-100 shadow-sm"><FileText size={15} />CSV</button>
                <button onClick={handleExportPDF} className="bg-purple-500 hover:bg-purple-600 px-6 py-2 font-semibold text-white rounded-lg flex gap-2 items-center transition-all active:scale-95 border border-gray-100 shadow-sm"><FileText size={15} />PDF</button>
            </div>

            {/* Detail Modal */}
            {isDetailModalOpen && selectedDetailRecord && (
                <div className="fixed inset-0 z-100 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
                    <div className="bg-white rounded-2xl w-full max-w-2xl overflow-hidden animate-in zoom-in-95 border border-gray-200">
                        <div className="bg-linear-to-r from-emerald-500 to-emerald-600 px-6 py-4 flex items-center justify-between text-white border-b border-gray-200">
                            <h3 className="text-xl font-bold flex items-center gap-2"><div className="p-1 bg-white/20 rounded-lg"><AlertTriangle size={20} /></div> Damaged Stock Details</h3>
                            <button onClick={() => setIsDetailModalOpen(false)}><X size={20} /></button>
                        </div>
                        <div className="p-6 space-y-4">
                            <div className="grid grid-cols-2 gap-4">
                                <div className="bg-gray-50 p-4 rounded-xl border border-gray-200">
                                    <p className="text-[10px] font-bold text-gray-400 uppercase">Product</p>
                                    <p className="font-bold">{selectedDetailRecord.productName}</p>
                                    <p className="text-xs text-gray-500">{selectedDetailRecord.productId}</p>
                                </div>
                                <div className="bg-red-50 p-4 rounded-xl border border-red-200">
                                    <p className="text-[10px] font-bold text-red-400 uppercase">Damaged Qty</p>
                                    <p className="text-2xl font-bold text-red-600">{selectedDetailRecord.damagedQty}</p>
                                </div>
                            </div>
                            <div className="bg-gray-50 p-4 rounded-xl border border-gray-200">
                                <p className="text-[10px] font-bold text-gray-400 uppercase">Notes</p>
                                <p className="italic text-sm text-gray-600">{selectedDetailRecord.description || 'No additional notes'}</p>
                            </div>
                        </div>
                        <div className="bg-gray-50 px-6 py-4 flex justify-end border-t border-gray-200">
                            <button onClick={() => setIsDetailModalOpen(false)} className="px-6 py-2 bg-gray-200 font-bold rounded-xl border border-gray-200 transition-colors hover:bg-gray-300">Close</button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}

export default DamagedStock;