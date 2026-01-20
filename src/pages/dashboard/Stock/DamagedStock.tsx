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
} from 'lucide-react';
import { useEffect, useState } from 'react';
import toast, { Toaster } from 'react-hot-toast';
import TypeableSelect from '../../../components/TypeableSelect.tsx';
import { stockService } from '../../../services/stockService';
import { productService } from '../../../services/productService';

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
            color: 'bg-gradient-to-br from-red-400 to-red-500',
            iconColor: 'text-white',
            bgGlow: 'shadow-red-200'
        },
        {
            icon: Package,
            label: 'Total Products',
            value: summaryData.totalProducts.toString(),
            trend: '',
            color: 'bg-gradient-to-br from-purple-400 to-purple-500',
            iconColor: 'text-white',
            bgGlow: 'shadow-purple-200'
        },
        {
            icon: DollarSign,
            label: 'Loss Value',
            value: summaryData.lossValue,
            trend: '',
            color: 'bg-gradient-to-br from-yellow-400 to-yellow-500',
            iconColor: 'text-white',
            bgGlow: 'shadow-yellow-200'
        },
        {
            icon: TrendingUp,
            label: 'This Month',
            value: summaryData.thisMonth.toString(),
            trend: '',
            color: 'bg-gradient-to-br from-blue-400 to-blue-500',
            iconColor: 'text-white',
            bgGlow: 'shadow-blue-200'
        },
        {
            icon: Users,
            label: 'Affected Suppliers',
            value: summaryData.affectedSuppliers.toString(),
            trend: '',
            color: 'bg-gradient-to-br from-emerald-400 to-emerald-500',
            iconColor: 'text-white',
            bgGlow: 'shadow-emerald-200'
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

    const [selectedIndex, setSelectedIndex] = useState(0);
    const [currentPage, setCurrentPage] = useState(1);
    const [itemsPerPage] = useState(10);

    const totalPages = Math.ceil(salesData.length / itemsPerPage);
    const startIndex = (currentPage - 1) * itemsPerPage;
    const endIndex = startIndex + itemsPerPage;
    const currentSalesData = salesData.slice(startIndex, endIndex);

    // Load dropdown data on component mount
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
                console.log('Reason API Response Debug:', reasonResponse);
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

        const loadProductData = async () => {
            try {
                const productsData = await productService.getProductsForDropdown();

                // Transform products
                if (productsData.data?.success) {
                    const productOptions = productsData.data.data.map((product: any) => ({
                        value: product.id.toString(),
                        label: product.product_name || product.name
                    }));
                    setProductSearch(productOptions);
                    setProductAdd(productOptions);
                }
            } catch (error) {
                console.error('Error loading product data:', error);
            }
        };

        loadDropdownData();
        loadProductData();
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
            // Keep default values on error
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
                console.log('Selected Product for Stock Load Debug:', selectedProductAdd);
                const response = await stockService.getStockByVariant(selectedProductAdd);

                console.log('Stock API Response Debug:', response);

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
                // Map API response to table format
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
                    status: item.status
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

    // Load damaged table data
    useEffect(() => {
        loadDamagedTableData();
    }, []);

    useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            if (e.key === "ArrowDown") {
                e.preventDefault();
                setSelectedIndex((prev) => (prev < currentSalesData.length - 1 ? prev + 1 : prev));
            } else if (e.key === "ArrowUp") {
                e.preventDefault();
                setSelectedIndex((prev) => (prev > 0 ? prev - 1 : prev));
            }
        };

        window.addEventListener("keydown", handleKeyDown);
        return () => window.removeEventListener("keydown", handleKeyDown);
    }, [currentSalesData.length]);

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
                for (let i = currentPage - 1; i <= currentPage + 1; i++) pages.push(i);
                pages.push('...');
                pages.push(totalPages);
            }
        }

        return pages;
    };

    const handleClearFilters = () => {
        setSelectedCategory(null);
        setSelectedUnit(null);
        setSelectedSupplier(null);
        setSelectedProduct(null);
        setFromDate('');
        setToDate('');
        // Reload original data
        loadDamagedTableData();
    };

    const handleSearch = async () => {
        try {
            setIsSearching(true);
            setLoadingTable(true);

            const filters: any = {};
            if (selectedCategory) filters.category_id = selectedCategory;
            if (selectedUnit) filters.unit_id = selectedUnit;
            if (selectedSupplier) filters.supplier_id = selectedSupplier;
            if (selectedProduct) filters.product_id = selectedProduct;
            if (fromDate) filters.fromDate = fromDate;
            if (toDate) filters.toDate = toDate;

            const response = await stockService.searchDamagedRecords(filters);
            
            if (response.data?.success) {
                // Map API response to table format
                const mappedData = response.data.data.map((item: any) => ({
                    productId: item.product_id_code,
                    productName: item.product_name,
                    unit: item.unit,
                    costPrice: item.cost_price,
                    mrp: item.mrp,
                    price: item.price,
                    supplier: item.supplier,
                    stock: item.stock_label,
                    damagedQty: item.damaged_qty,
                    reason: item.damage_reason,
                    status: item.status
                }));
                setSalesData(mappedData);
                setCurrentPage(1); // Reset to first page
                setSelectedIndex(0);
                
                if (mappedData.length > 0) {
                    toast.success(`Found ${response.data.count || mappedData.length} records`);
                } else {
                    toast.error('No records found matching your search criteria');
                }
            } else {
                setSalesData([]);
                toast.error('No records found matching your search criteria');
            }
        } catch (error) {
            console.error('Error searching damaged records:', error);
            toast.error('Failed to search damaged records');
            setSalesData([]);
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

    const validateForm = () => {
        if (!selectedProductAdd) {
            toast.error('Please select a product');
            return false;
        }
        if (!selectedStock) {
            toast.error('Please select a stock batch');
            return false;
        }
        if (!damagedQty || parseFloat(damagedQty) <= 0) {
            toast.error('Please enter a valid damaged quantity');
            return false;
        }
        if (!selectedReason) {
            toast.error('Please select a reason');
            return false;
        }
        if (!selectedStatus) {
            toast.error('Please select a status');
            return false;
        }
        return true;
    };

    const handleAddDamaged = async () => {
        if (!validateForm()) return;

        try {
            setIsSubmitting(true);

            const response = await stockService.createDamagedRecord({
                productId: selectedProductAdd!,
                stockId: selectedStock!,
                damagedQty: parseFloat(damagedQty),
                reasonId: selectedReason!,
                statusId: selectedStatus!,
                description: description.trim() || undefined
            });

            if (response.data?.success) {
                toast.success('Damaged stock record created successfully!');
                handleClearAdd();
                // Reload table data
                loadDamagedTableData();
            } else {
                toast.error(response.data?.message || 'Failed to create damaged stock record');
            }
        } catch (error: any) {
            console.error('Error creating damaged record:', error);
            toast.error(error.response?.data?.message || 'An error occurred while creating the record');
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <div className={'flex flex-col gap-4 h-full'}>
            {/* Header */}
            <div>
                <div className="text-sm text-gray-400 flex items-center">
                    <span>Stock</span>
                    <span className="mx-2">›</span>
                    <span className="text-gray-700 font-medium">Damaged Stock</span>
                </div>
                <h1 className="text-3xl font-semibold bg-gradient-to-r from-gray-800 to-gray-600 bg-clip-text text-transparent">
                    Damaged Stock
                </h1>
            </div>

            {/* Stats Cards */}
            <div className={'grid md:grid-cols-5 grid-cols-1 gap-4'}>
                {summaryCards.map((stat, i) => (
                    <div
                        key={i}
                        className={`flex items-center p-4 space-x-3 transition-all bg-white rounded-2xl shadow-lg hover:shadow-xl ${stat.bgGlow} cursor-pointer group relative overflow-hidden`}
                    >
                        <div className="absolute inset-0 bg-gradient-to-br from-transparent via-gray-50/50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>

                        <div className={`p-3 rounded-full ${stat.color} shadow-md relative z-10`}>
                            <stat.icon className={`w-6 h-6 ${stat.iconColor}`} />
                        </div>

                        <div className="w-px h-10 bg-gray-200"></div>

                        <div className="relative z-10 flex-1">
                            <div className="flex items-center justify-between">
                                <p className="text-sm text-gray-500">{stat.label}</p>
                                <div className={`flex items-center gap-0.5 text-[10px] font-semibold ${stat.trend.startsWith('+') ? 'text-red-600' : stat.trend.startsWith('-') ? 'text-emerald-600' : 'text-gray-600'}`}>
                                    {stat.trend.startsWith('+') ? <ArrowUpRight className="w-3 h-3" /> : stat.trend.startsWith('-') ? <ArrowDownRight className="w-3 h-3" /> : null}
                                    {stat.trend}
                                </div>
                            </div>
                            <p className="text-sm font-bold text-gray-700">{stat.value}</p>
                        </div>
                    </div>
                ))}
            </div>

            {/* Filter & Add Section */}
            <div
                className={'bg-white rounded-xl p-4 flex flex-col shadow-lg'}
            >
                <h2 className="text-xl font-semibold text-gray-700 mb-3">Filter</h2>
                <div className={'grid md:grid-cols-5 gap-4'}>
                    <div>
                        <label htmlFor="category" className="block text-sm font-medium text-gray-700 mb-1">
                            Category
                        </label>
                        <TypeableSelect
                            options={category}
                            value={selectedCategory}
                            onChange={(opt) => setSelectedCategory(opt?.value as string || null)}
                            placeholder={loading ? "Loading categories..." : "Search categories..."}
                            disabled={loading}
                        />
                    </div>
                    <div>
                        <label htmlFor="unit" className="block text-sm font-medium text-gray-700 mb-1">
                            Unit
                        </label>
                        <TypeableSelect
                            options={unit}
                            value={selectedUnit}
                            onChange={(opt) => setSelectedUnit(opt?.value as string || null)}
                            placeholder={loading ? "Loading units..." : "Search units..."}
                            disabled={loading}
                        />
                    </div>
                    <div>
                        <label htmlFor="supplier" className="block text-sm font-medium text-gray-700 mb-1">
                            Supplier
                        </label>
                        <TypeableSelect
                            options={supplier}
                            value={selectedSupplier}
                            onChange={(opt) => setSelectedSupplier(opt?.value as string || null)}
                            placeholder={loading ? "Loading suppliers..." : "Search suppliers..."}
                            disabled={loading}
                        />
                    </div>
                    <div>
                        <label htmlFor="product" className="block text-sm font-medium text-gray-700 mb-1">
                            Product ID/Name
                        </label>
                        <TypeableSelect
                            options={productSearch}
                            value={selectedProduct}
                            onChange={(opt) => setSelectedProduct(opt?.value as string || null)}
                            placeholder={loading ? "Loading products..." : "Search products..."}
                            disabled={loading}
                        />
                    </div>
                    <div className='col-span-5'>
                        <div className="grid md:grid-cols-2 gap-4">
                            <div>
                                <label htmlFor="fromDate" className="block text-sm font-medium text-gray-700 mb-1">
                                    From Date
                                </label>
                                <input
                                    type="date"
                                    id="fromDate"
                                    value={fromDate}
                                    onChange={(e) => setFromDate(e.target.value)}
                                    className="w-full text-sm rounded-lg py-2 px-3 border-2 border-gray-200 focus:border-red-400 focus:outline-none transition-all"
                                />
                            </div>
                            <div>
                                <label htmlFor="toDate" className="block text-sm font-medium text-gray-700 mb-1">
                                    To Date
                                </label>
                                <input
                                    type="date"
                                    id="toDate"
                                    value={toDate}
                                    onChange={(e) => setToDate(e.target.value)}
                                    className="w-full text-sm rounded-lg py-2 px-3 border-2 border-gray-200 focus:border-red-400 focus:outline-none transition-all"
                                />
                            </div>
                        </div>
                    </div>
                    <div className={'grid grid-cols-2 md:items-end items-start gap-2 text-white font-medium'}>
                        <button 
                            onClick={handleSearch}
                            disabled={isSearching || loading}
                            className={'bg-gradient-to-r from-red-500 to-red-600 hover:from-red-600 hover:to-red-700 py-2 rounded-lg flex items-center justify-center shadow-lg shadow-red-200 hover:shadow-xl transition-all disabled:opacity-50 disabled:cursor-not-allowed'}
                        >
                            <SearchCheck className="mr-2" size={14} />
                            {isSearching ? 'Searching...' : 'Search'}
                        </button>
                        <button 
                            onClick={handleClearFilters} 
                            disabled={loading || loadingTable}
                            className={'bg-gradient-to-r from-gray-500 to-gray-600 hover:from-gray-600 hover:to-gray-700 py-2 rounded-lg flex items-center justify-center shadow-lg shadow-gray-200 hover:shadow-xl transition-all disabled:opacity-50 disabled:cursor-not-allowed'}
                        >
                            <RefreshCw className="mr-2" size={14} />Clear
                        </button>
                    </div>

                    <div className='col-span-5'>
                        <div className="relative">
                            <div className="absolute inset-0 flex items-center">
                                <div className="w-full border-t-2 border-gray-200"></div>
                            </div>
                            <div className="relative flex justify-center">
                                <span className="bg-white px-4 text-sm text-gray-500 font-medium">Add Damaged Stock</span>
                            </div>
                        </div>
                    </div>

                    <div>
                        <label htmlFor="product-add" className="block text-sm font-medium text-gray-700 mb-1">
                            Product ID/Name
                        </label>
                        <TypeableSelect
                            options={productAdd}
                            value={selectedProductAdd}
                            onChange={(opt) => setSelectedProductAdd(opt?.value as string || null)}
                            placeholder={loading ? "Loading products..." : "Search products..."}
                            disabled={loading}
                        />
                    </div>
                    <div>
                        <label htmlFor="stock" className="block text-sm font-medium text-gray-700 mb-1">
                            Select Stock
                        </label>
                        <select
                            id="stock"
                            value={selectedStock || ''}
                            onChange={(e) => setSelectedStock(e.target.value || null)}
                            disabled={!selectedProductAdd || loadingStock}
                            className="w-full text-sm rounded-lg py-2 px-3 border-2 border-gray-200 focus:border-red-400 focus:outline-none transition-all disabled:bg-gray-100 disabled:cursor-not-allowed"
                        >
                            <option value="">
                                {loadingStock ? 'Loading stock...' : !selectedProductAdd ? 'Select product first' : 'Select batch...'}
                            </option>
                            {stock.map((stockItem) => (
                                <option key={stockItem.value} value={stockItem.value}>
                                    {stockItem.label}
                                </option>
                            ))}
                        </select>
                    </div>
                    <div>
                        <label htmlFor="damaged-qty" className="block text-sm font-medium text-gray-700 mb-1">
                            Damaged Quantity
                        </label>
                        <input
                            type="number"
                            id="damaged-qty"
                            value={damagedQty}
                            onChange={(e) => setDamagedQty(e.target.value)}
                            placeholder="Enter damaged QTY"
                            className="w-full text-sm rounded-lg py-2 px-3 border-2 border-gray-200 focus:border-red-400 focus:outline-none transition-all"
                        />
                    </div>
                    <div>
                        <label htmlFor="reason" className="block text-sm font-medium text-gray-700 mb-1">
                            Reason
                        </label>
                        <select
                            id="reason"
                            value={selectedReason || ''}
                            onChange={(e) => setSelectedReason(e.target.value || null)}
                            disabled={loading}
                            className="w-full text-sm rounded-lg py-2 px-3 border-2 border-gray-200 focus:border-red-400 focus:outline-none transition-all disabled:bg-gray-100 disabled:cursor-not-allowed"
                        >
                            <option value="">
                                {loading ? 'Loading reasons...' : 'Select reason...'}
                            </option>
                            {reason.map((reasonItem) => (
                                <option key={reasonItem.value} value={reasonItem.value}>
                                    {reasonItem.label}
                                </option>
                            ))}
                        </select>
                    </div>
                    <div>
                        <label htmlFor="status" className="block text-sm font-medium text-gray-700 mb-1">
                            Status
                        </label>
                        <select
                            id="status"
                            value={selectedStatus || ''}
                            onChange={(e) => setSelectedStatus(e.target.value || null)}
                            disabled={loading}
                            className="w-full text-sm rounded-lg py-2 px-3 border-2 border-gray-200 focus:border-red-400 focus:outline-none transition-all disabled:bg-gray-100 disabled:cursor-not-allowed"
                        >
                            <option value="">
                                {loading ? 'Loading status...' : 'Select status...'}
                            </option>
                            {status.map((statusItem) => (
                                <option key={statusItem.value} value={statusItem.value}>
                                    {statusItem.label}
                                </option>
                            ))}
                        </select>
                    </div>
                    <div className="col-span-3">
                        <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-1">
                            Description
                        </label>
                        <textarea
                            id="description"
                            value={description}
                            onChange={(e) => setDescription(e.target.value)}
                            placeholder="Enter additional description..."
                            rows={1}
                            className="w-full text-sm rounded-lg py-2 px-3 border-2 border-gray-200 focus:border-red-400 focus:outline-none transition-all resize-none"
                        />
                    </div>
                    <div className={'grid grid-cols-2 md:items-end items-start gap-2 text-white font-medium'}>
                        <button
                            onClick={handleAddDamaged}
                            disabled={isSubmitting}
                            className={'bg-gradient-to-r from-red-500 to-red-600 hover:from-red-600 hover:to-red-700 py-2 rounded-lg flex items-center justify-center shadow-lg shadow-red-200 hover:shadow-xl transition-all disabled:opacity-50 disabled:cursor-not-allowed'}
                        >
                            <Plus className="mr-2" size={14} />
                            {isSubmitting ? 'Adding...' : 'Add'}
                        </button>
                        <button onClick={handleClearAdd} className={'bg-gradient-to-r from-gray-500 to-gray-600 hover:from-gray-600 hover:to-gray-700 py-2 rounded-lg flex items-center justify-center shadow-lg shadow-red-200 hover:shadow-xl transition-all'}>
                            <RefreshCw className="mr-2" size={14} />Clear
                        </button>
                    </div>
                </div>
            </div>

            {/* Table */}
            <div
                className={'flex flex-col bg-white rounded-xl h-full p-4 justify-between shadow-lg'}
            >
                <div className="overflow-y-auto max-h-md md:h-[320px] lg:h-[500px] rounded-lg scrollbar-thin scrollbar-thumb-red-300 scrollbar-track-gray-100">
                    <table className="min-w-full divide-y divide-gray-200">
                        <thead className="bg-gradient-to-r from-red-500 to-red-600 sticky top-0 z-10">
                            <tr>
                                {['Product ID', 'Product Name', 'Unit', 'Cost Price', 'MRP', 'Price', 'Supplier', 'Stock', 'Damaged Qty', 'Reason', 'Status'].map((header, i, arr) => (
                                    <th
                                        key={i}
                                        scope="col"
                                        className={`px-6 py-3 text-left text-xs font-bold text-white uppercase tracking-wider ${i === 0 ? 'rounded-tl-lg' : i === arr.length - 1 ? 'rounded-tr-lg' : ''
                                            }`}
                                    >
                                        {header}
                                    </th>
                                ))}
                            </tr>
                        </thead>

                        <tbody className="bg-white divide-y divide-gray-200">
                            {currentSalesData.length === 0 ? (
                                <tr>
                                    <td colSpan={10} className="px-6 py-8 text-center text-gray-500">
                                        No damaged stock records found
                                    </td>
                                </tr>
                            ) : (
                                currentSalesData.map((sale, index) => (
                                    <tr
                                        key={index}
                                        onClick={() => setSelectedIndex(index)}
                                        className={`cursor-pointer transition-all ${selectedIndex === index
                                                ? 'bg-gradient-to-r from-red-50 to-red-100 shadow-md'
                                                : 'hover:bg-gray-50'
                                            }`}
                                    >
                                        <td className="px-6 py-2 whitespace-nowrap text-sm font-semibold text-gray-800">
                                            {sale.productId}
                                        </td>
                                        <td className="px-6 py-2 whitespace-nowrap text-sm font-medium text-gray-700">
                                            {sale.productName}
                                        </td>
                                        <td className="px-6 py-2 whitespace-nowrap text-sm text-gray-600">
                                            {sale.unit}
                                        </td>
                                        <td className="px-6 py-2 whitespace-nowrap text-sm font-medium text-blue-600">
                                            LKR {sale.costPrice}
                                        </td>
                                        <td className="px-6 py-2 whitespace-nowrap text-sm font-medium text-gray-600">
                                            LKR {sale.mrp}
                                        </td>
                                        <td className="px-6 py-2 whitespace-nowrap text-sm font-bold text-emerald-600">
                                            LKR {sale.price}
                                        </td>
                                        <td className="px-6 py-2 whitespace-nowrap text-sm text-gray-600">
                                            {sale.supplier}
                                        </td>
                                        <td className="px-6 py-2 whitespace-nowrap">
                                            <span className="px-3 py-1 text-xs font-semibold rounded-full bg-gradient-to-r from-blue-100 to-blue-200 text-blue-800">
                                                {sale.stock}
                                            </span>
                                        </td>
                                        <td className="px-6 py-2 whitespace-nowrap text-sm font-medium text-orange-600">
                                            {sale.damagedQty}
                                        </td>
                                        <td className="px-6 py-2 whitespace-nowrap text-sm text-gray-600">
                                            {sale.reason}
                                        </td>
                                        <td className="px-6 py-2 whitespace-nowrap">
                                            <span className={`px-3 py-1 text-xs font-semibold rounded-full ${
                                                sale.status === 'Damaged' ? 'bg-gradient-to-r from-red-100 to-red-200 text-red-800' :
                                                sale.status === 'Pending Review' ? 'bg-gradient-to-r from-yellow-100 to-yellow-200 text-yellow-800' :
                                                sale.status === 'Under Review' ? 'bg-gradient-to-r from-yellow-100 to-yellow-200 text-yellow-800' :
                                                sale.status === 'Disposed' ? 'bg-gradient-to-r from-gray-100 to-gray-200 text-gray-800' :
                                                'bg-gradient-to-r from-blue-100 to-blue-200 text-blue-800'
                                            }`}>
                                                {sale.status}
                                            </span>
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>

                <nav className="bg-white flex items-center justify-between sm:px-6 pt-4 border-t-2 border-gray-100">
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
                                    : 'text-gray-600 hover:text-red-600 hover:bg-red-50'
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
                                            ? 'bg-gradient-to-r from-red-500 to-red-600 text-white shadow-md'
                                            : 'text-gray-600 hover:bg-red-50 hover:text-red-600'
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
                                    : 'text-gray-600 hover:text-red-600 hover:bg-red-50'
                                }`}
                        >
                            Next <ChevronRight className="ml-2 h-5 w-5" />
                        </button>
                    </div>
                </nav>
            </div>

            {/* Export Buttons */}
            <div
                className={'bg-white flex justify-center p-4 gap-4 rounded-xl shadow-lg'}
            >
                <button className={'bg-gradient-to-r from-emerald-500 to-emerald-600 hover:from-emerald-600 hover:to-emerald-700 px-6 py-2 font-medium text-white rounded-lg flex gap-2 items-center shadow-lg shadow-emerald-200 hover:shadow-xl transition-all'}>
                    <FileText size={15} />Excel
                </button>
                <button className={'bg-gradient-to-r from-yellow-500 to-yellow-600 hover:from-yellow-600 hover:to-yellow-700 px-6 py-2 font-medium text-white rounded-lg flex gap-2 items-center shadow-lg shadow-yellow-200 hover:shadow-xl transition-all'}>
                    <FileText size={15} />CSV
                </button>
                <button className={'bg-gradient-to-r from-red-500 to-red-600 hover:from-red-600 hover:to-red-700 px-6 py-2 font-medium text-white rounded-lg flex gap-2 items-center shadow-lg shadow-red-200 hover:shadow-xl transition-all'}>
                    <FileText size={15} />PDF
                </button>
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
        </div>

    );
}

export default DamagedStock;