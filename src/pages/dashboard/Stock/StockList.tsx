import {
    ChevronLeft,
    ChevronRight,
    FileText,
    RefreshCw,
    SearchCheck,
    ArrowUpRight,
    ArrowDownRight,
    Package,
    DollarSign,
    TrendingUp,
    Users,
    ShoppingCart,
    Barcode,
} from "lucide-react";
import { useEffect, useState } from "react";
import TypeableSelect from "../../../components/TypeableSelect.tsx";
import BarcodePrintModal from "../../../components/modals/BarcodePrintModal.tsx";
import ExportModal from "../../../components/modals/ExportModal.tsx";
import { stockService } from "../../../services/stockService.ts";
import toast, { Toaster } from 'react-hot-toast';
import * as XLSX from 'xlsx';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';

function StockList() {
    // Summary data state
    const [summaryData, setSummaryData] = useState({
        totalProducts: { value: '0', trend: '+0%' },
        totalValue: { value: 'LKR 0.00', trend: '+0%' },
        lowStock: { value: '0', trend: '0%' },
        totalSuppliers: { value: '0', trend: '+0%' },
        totalCategories: { value: '0', trend: '+0%' }
    });
    const summaryCards = [
        {
            icon: Package,
            label: 'Total Products',
            value: summaryData.totalProducts.value,
            trend: '',
            color: 'bg-linear-to-br from-emerald-400 to-emerald-500',
            iconColor: 'text-white',
            bgGlow: 'shadow-emerald-200'
        },
        {
            icon: DollarSign,
            label: 'Total Value',
            value: summaryData.totalValue.value,
            trend: '',
            color: 'bg-linear-to-br from-purple-400 to-purple-500',
            iconColor: 'text-white',
            bgGlow: 'shadow-purple-200'
        },
        {
            icon: TrendingUp,
            label: 'Low Stock Items',
            value: summaryData.lowStock.value,
            trend: '',
            color: 'bg-linear-to-br from-red-400 to-red-500',
            iconColor: 'text-white',
            bgGlow: 'shadow-red-200'
        },
        {
            icon: Users,
            label: 'Total Suppliers',
            value: summaryData.totalSuppliers.value,
            trend: '',
            color: 'bg-linear-to-br from-blue-400 to-blue-500',
            iconColor: 'text-white',
            bgGlow: 'shadow-blue-200'
        },
        {
            icon: ShoppingCart,
            label: 'Categories',
            value: summaryData.totalCategories.value,
            trend: '',
            color: 'bg-linear-to-br from-yellow-400 to-yellow-500',
            iconColor: 'text-white',
            bgGlow: 'shadow-yellow-200'
        },
    ];

    // Stock data state

    // Stock data state
    const [stockData, setStockData] = useState<any[]>([]);
    const [isLoadingStock, setIsLoadingStock] = useState(false);

    type SelectOption = {
        value: string | number;
        label: string;
    };

    const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
    const [selectedUnit, setSelectedUnit] = useState<string | null>(null);
    const [selectedSupplier, setSelectedSupplier] = useState<string | null>(null);
    const [searchQuery, setSearchQuery] = useState<string>('');

    // Dropdown options state
    const [suppliers, setSuppliers] = useState<SelectOption[]>([]);
    const [units, setUnits] = useState<SelectOption[]>([]);
    const [categories, setCategories] = useState<SelectOption[]>([]);
    const [isLoadingDropdowns, setIsLoadingDropdowns] = useState(false);

    // Barcode Modal State
    const [isBarcodeModalOpen, setIsBarcodeModalOpen] = useState(false);
    const [selectedProductForBarcode, setSelectedProductForBarcode] = useState<any>(null);

    // Export Modal State
    const [isExportModalOpen, setIsExportModalOpen] = useState(false);
    const [exportType, setExportType] = useState<'excel' | 'csv' | 'pdf'>('excel');
    const [isExporting, setIsExporting] = useState(false);

    // Load stock data with pagination
    const loadStockData = async (page: number = 1) => {
        setIsLoadingStock(true);
        try {
            const response = await stockService.getStockList(page, itemsPerPage);
            if (response.data?.success) {
                setStockData(response.data.data);
                if (response.data.pagination) {
                    setPagination(response.data.pagination);
                    setCurrentPage(response.data.pagination.currentPage);
                }
            } else {
                toast.error('Failed to load stock data');
            }
        } catch (error) {
            console.error('Error loading stock data:', error);
            toast.error('Failed to load stock data');
        } finally {
            setIsLoadingStock(false);
        }
    };

    // Load summary cards data
    const loadSummaryData = async () => {
        try {
            const response = await stockService.getSummaryCards();
            if (response.data?.success) {
                setSummaryData(response.data.data);
            } else {
                toast.error('Failed to load summary data');
            }
        } catch (error) {
            console.error('Error loading summary data:', error);
            toast.error('Failed to load summary data');
        }
    };

    // Load all dropdown data
    const loadDropdownData = async () => {
        setIsLoadingDropdowns(true);
        try {
            const [categoriesResponse, unitsResponse, suppliersResponse] = await stockService.getStockFilterData();

            // Transform categories
            if (categoriesResponse.data?.success) {
                const categoryOptions = categoriesResponse.data.data.map((category: any) => ({
                    value: category.id.toString(),
                    label: category.name
                }));
                setCategories(categoryOptions);
            }

            // Transform units
            if (unitsResponse.data?.success) {
                const unitOptions = unitsResponse.data.data.map((unit: any) => ({
                    value: unit.id.toString(),
                    label: unit.name
                }));
                setUnits(unitOptions);
            }

            // Transform suppliers
            if (suppliersResponse.data?.success) {
                const supplierOptions = suppliersResponse.data.data.map((supplier: any) => ({
                    value: supplier.id.toString(),
                    label: supplier.supplierName
                }));
                setSuppliers(supplierOptions);
            }



        } catch (error) {
            console.error('Error loading dropdown data:', error);
            toast.error('Failed to load filter options');
        } finally {
            setIsLoadingDropdowns(false);
        }
    };

    // Search stock data with filters
    const handleSearch = async () => {
        setIsLoadingStock(true);
        try {
            const filters = {
                category: selectedCategory || undefined,
                unit: selectedUnit || undefined,
                supplier: selectedSupplier || undefined,
                q: searchQuery.trim() || undefined
            };

            // Remove undefined values
            Object.keys(filters).forEach(key =>
                filters[key as keyof typeof filters] === undefined && delete filters[key as keyof typeof filters]
            );

            let response;
            if (Object.keys(filters).length > 0) {
                response = await stockService.searchStock(filters, 1, itemsPerPage);
                toast.success('Search completed successfully');
            } else {
                response = await stockService.getStockList(1, itemsPerPage);
                toast.success('Showing all stock data');
            }

            if (response.data?.success) {
                setStockData(response.data.data);
                if (response.data.pagination) {
                    setPagination(response.data.pagination);
                    setCurrentPage(1);
                }
            } else {
                toast.error('Failed to search stock data');
            }
        } catch (error) {
            console.error('Error searching stock data:', error);
            toast.error('Failed to search stock data');
        } finally {
            setIsLoadingStock(false);
        }
    };

    // Clear all filters and reload data
    const handleClearFilters = async () => {
        setSelectedCategory(null);
        setSelectedUnit(null);
        setSelectedSupplier(null);
        setSearchQuery('');
        await Promise.all([loadStockData(1), loadSummaryData()]);
        toast.success('Filters cleared');
    };

    // Load specific page with current filters
    const loadPage = async (page: number) => {
        setIsLoadingStock(true);
        try {
            const filters = {
                category: selectedCategory || undefined,
                unit: selectedUnit || undefined,
                supplier: selectedSupplier || undefined,
                q: searchQuery.trim() || undefined
            };

            // Remove undefined values
            Object.keys(filters).forEach(key =>
                filters[key as keyof typeof filters] === undefined && delete filters[key as keyof typeof filters]
            );

            let response;
            if (Object.keys(filters).length > 0) {
                response = await stockService.searchStock(filters, page, itemsPerPage);
            } else {
                response = await stockService.getStockList(page, itemsPerPage);
            }

            if (response.data?.success) {
                setStockData(response.data.data);
                if (response.data.pagination) {
                    setPagination(response.data.pagination);
                    setCurrentPage(page);
                }
                setSelectedIndex(0);
            }
        } catch (error) {
            console.error('Error loading page:', error);
            toast.error('Failed to load page');
        } finally {
            setIsLoadingStock(false);
        }
    };

    // Open Export Modal
    const openExportModal = (type: 'excel' | 'csv' | 'pdf') => {
        setExportType(type);
        setIsExportModalOpen(true);
    };

    // Actual Export Functions
    const generateExcel = (data: any[]) => {
        try {
            const exportData = data.map((item, index) => ({
                'No': index + 1,
                'Product ID': item.productID,
                'Product Name': item.productName,
                'Barcode': item.barcode,
                'Unit': item.unit,
                'Batch': item.batch_name || '-',
                'Quantity': item.stockQty,
                'Cost Price': item.costPrice,
                'MRP': item.MRP,
                'Selling Price': item.Price,
                'Supplier': item.supplier || 'N/A',
                'Category': item.category || '-',
                'Brand': item.brand || '-',
                'MFD': item.mfd ? new Date(item.mfd).toLocaleDateString() : '-',
                'EXP': item.exp ? new Date(item.exp).toLocaleDateString() : '-'
            }));

            const ws = XLSX.utils.json_to_sheet(exportData);
            const wb = XLSX.utils.book_new();
            XLSX.utils.book_append_sheet(wb, ws, 'Stock List');

            const timestamp = new Date().toISOString().split('T')[0];
            XLSX.writeFile(wb, `Stock_List_${timestamp}.xlsx`);
            toast.success('Excel file exported successfully');
        } catch (error) {
            console.error('Error generating Excel:', error);
            toast.error('Failed to generate Excel file');
        }
    };

    const generateCSV = (data: any[]) => {
        try {
            const headers = ['No', 'Product ID', 'Product Name', 'Barcode', 'Unit', 'Batch', 'Quantity', 'Cost Price', 'MRP', 'Selling Price', 'Supplier', 'Category', 'Brand', 'MFD', 'EXP'];
            const csvData = data.map((item, index) => [
                index + 1,
                item.productID,
                item.productName,
                item.barcode,
                item.unit,
                item.batch_name || '-',
                item.stockQty,
                item.costPrice,
                item.MRP,
                item.Price,
                item.supplier || 'N/A',
                item.category || '-',
                item.brand || '-',
                item.mfd ? new Date(item.mfd).toLocaleDateString() : '-',
                item.exp ? new Date(item.exp).toLocaleDateString() : '-'
            ]);

            const csvContent = [
                headers.join(','),
                ...csvData.map(row => row.map(cell => `"${cell}"`).join(','))
            ].join('\n');

            const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
            const link = document.createElement('a');
            const url = URL.createObjectURL(blob);
            const timestamp = new Date().toISOString().split('T')[0];

            link.setAttribute('href', url);
            link.setAttribute('download', `Stock_List_${timestamp}.csv`);
            link.style.visibility = 'hidden';
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);

            toast.success('CSV file exported successfully');
        } catch (error) {
            console.error('Error generating CSV:', error);
            toast.error('Failed to generate CSV file');
        }
    };

    const generatePDF = (data: any[]) => {
        try {
            const doc = new jsPDF();
            doc.setFontSize(18);
            doc.text('Stock List Report', 14, 22);

            doc.setFontSize(10);
            doc.text(`Generated on: ${new Date().toLocaleDateString('en-US', {
                year: 'numeric',
                month: 'long',
                day: 'numeric'
            })}`, 14, 30);

            const tableData = data.map((item, index) => [
                index + 1,
                item.productID,
                item.productName,
                item.barcode,
                item.unit,
                item.batch_name || '-',
                item.stockQty,
                `LKR ${item.costPrice}`,
                `LKR ${item.Price}`,
                item.supplier || 'N/A'
            ]);

            autoTable(doc, {
                startY: 35,
                head: [['No', 'ID', 'Product', 'Barcode', 'Unit', 'Batch', 'Qty', 'Cost', 'Price', 'Supplier']],
                body: tableData,
                theme: 'grid',
                headStyles: { fillColor: [16, 185, 129], textColor: 255, fontStyle: 'bold' },
                styles: { fontSize: 7, cellPadding: 1.5 },
                columnStyles: { 0: { cellWidth: 8 }, 1: { cellWidth: 15 }, 2: { cellWidth: 35 } }
            });

            const timestamp = new Date().toISOString().split('T')[0];
            doc.save(`Stock_List_${timestamp}.pdf`);
            toast.success('PDF file exported successfully');
        } catch (error) {
            console.error('Error generating PDF:', error);
            toast.error('Failed to generate PDF file');
        }
    };

    // Handle Export Confirmation
    const handleExportConfirm = async (scope: 'all' | 'current') => {
        setIsExporting(true);
        try {
            let dataToExport = [];

            if (scope === 'all') {
                // Fetch all data from API
                const response = await stockService.getAllStockWithVariations();
                if (response.data?.success) {
                    dataToExport = response.data.data;
                } else {
                    toast.error('Failed to fetch all stock data');
                    setIsExporting(false);
                    return;
                }
            } else {
                // Use current table data
                dataToExport = stockData;
            }

            if (dataToExport.length === 0) {
                toast.error('No data to export');
                setIsExporting(false);
                return;
            }

            // Generate based on type
            if (exportType === 'excel') generateExcel(dataToExport);
            if (exportType === 'csv') generateCSV(dataToExport);
            if (exportType === 'pdf') generatePDF(dataToExport);

            setIsExportModalOpen(false);
        } catch (error) {
            console.error('Export error:', error);
            toast.error('An error occurred during export');
        } finally {
            setIsExporting(false);
        }
    };

    const [selectedIndex, setSelectedIndex] = useState(0);
    const [currentPage, setCurrentPage] = useState(1);
    const [itemsPerPage] = useState(10);
    
    // Backend pagination state
    const [pagination, setPagination] = useState({
        currentPage: 1,
        totalPages: 1,
        totalItems: 0,
        itemsPerPage: 10,
        hasNextPage: false,
        hasPrevPage: false
    });

    const totalPages = pagination.totalPages;
    const currentStockData = stockData; // Use data directly from backend

    useEffect(() => {
        loadDropdownData();
        loadStockData(1);
        loadSummaryData();
    }, []);

    useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            const target = e.target as HTMLElement;
            const isInput = target.tagName === 'INPUT' || target.tagName === 'TEXTAREA';

            // F2 to focus search input
            if (e.key === 'F2') {
                e.preventDefault();
                const searchInput = document.getElementById('product');
                if (searchInput) {
                    searchInput.focus();
                }
                return;
            }

            // Arrow keys for navigation (allow even if in input, unless it interferes with input navigation? QuotationList allows it to navigate table row)
            if (e.key === "ArrowDown") {
                e.preventDefault();
                setSelectedIndex((prev) => {
                    const nextIndex = prev < currentStockData.length - 1 ? prev + 1 : prev;
                   // Scroll into view logic could be added here if needed
                    return nextIndex;
                });
            } else if (e.key === "ArrowUp") {
                e.preventDefault();
                setSelectedIndex((prev) => (prev > 0 ? prev - 1 : prev));
            } else if (e.key === "PageDown") {
                e.preventDefault();
                if (currentPage < totalPages) {
                    goToNextPage();
                }
            } else if (e.key === "PageUp") {
                e.preventDefault();
                if (currentPage > 1) {
                    goToPreviousPage();
                }
            } else if (e.key === "Home") {
                if (!isInput) {
                    e.preventDefault();
                    setSelectedIndex(0);
                }
            } else if (e.key === "End") {
                 if (!isInput) {
                    e.preventDefault();
                    setSelectedIndex(currentStockData.length - 1);
                }
            } else if (e.key === "Enter") {
                if (isInput) {
                     // If in input, Enter triggers search (handled by onKeyDown on input itself, but we can double ensure or leave it)
                     // Actually, if we want global Enter to select the row ONLY if not in input?
                     // QuotationList: "Enter key triggers search instead of viewing details" if in input.
                     // Here: we have onKeyDown on input calling handleSearch.
                     // So avoiding e.preventDefault() here if isInput allows the input's own handler to fire?
                     // or we can explicitly check.
                     return; 
                }
                
                if (currentStockData.length > 0) {
                    e.preventDefault();
                    const selectedItem = currentStockData[selectedIndex];
                    if (selectedItem) {
                        toast.success(`Selected: ${selectedItem.productName} (Stock ID: ${selectedItem.productID})`);
                        // Logic to open detail view if needed
                    }
                }
            } else if (e.key === "Escape") {
                e.preventDefault();
                setSelectedIndex(0);
                // Maybe clear search if desired?
            }
        };

        window.addEventListener("keydown", handleKeyDown);
        return () => window.removeEventListener("keydown", handleKeyDown);
    }, [currentStockData, selectedIndex, currentPage, totalPages]);

    const goToPage = (page: number) => {
        if (page >= 1 && page <= totalPages && page !== currentPage) {
            loadPage(page);
        }
    };

    const goToPreviousPage = () => {
        if (pagination.hasPrevPage) {
            loadPage(currentPage - 1);
        }
    };

    const goToNextPage = () => {
        if (pagination.hasNextPage) {
            loadPage(currentPage + 1);
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

    return (
        <>
            <div className={'flex flex-col gap-4 h-full'}>
                {/* Header */}
                <div className="flex items-center justify-between">
                    <div>
                        <div className="text-sm text-gray-400 flex items-center">
                            <span>Stock</span>
                            <span className="mx-2">›</span>
                            <span className="text-gray-700 font-medium">Stock List</span>
                        </div>
                        <h1 className="text-3xl font-semibold bg-linear-to-r from-gray-800 to-gray-600 bg-clip-text text-transparent">
                            Stock List
                        </h1>
                    </div>

                    {/* Shortcuts Hint */}
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

                {/* Stats Cards */}
                <div className={'grid md:grid-cols-5 grid-cols-1 gap-4'}>
                    {summaryCards.map((stat, i) => (
                        <div
                            key={i}
                            className={`flex items-center p-4 space-x-3 transition-all bg-white rounded-2xl border border-gray-200 cursor-pointer group relative overflow-hidden`}
                        >
                            <div className="absolute inset-0 bg-linear-to-br from-transparent via-gray-50/50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>

                            <div className={`p-3 rounded-full ${stat.color} shadow-sm relative z-10`}>
                                <stat.icon className={`w-6 h-6 ${stat.iconColor}`} />
                            </div>

                            <div className="w-px h-10 bg-gray-200"></div>

                            <div className="relative z-10 flex-1">
                                <div className="flex items-center justify-between">
                                    <p className="text-sm text-gray-500">{stat.label}</p>
                                    <div className={`flex items-center gap-0.5 text-[10px] font-semibold ${stat.trend.startsWith('+') ? 'text-emerald-600' : 'text-red-600'}`}>
                                        {stat.trend.startsWith('+') ? <ArrowUpRight className="w-3 h-3" /> : <ArrowDownRight className="w-3 h-3" />}
                                        {stat.trend}
                                    </div>
                                </div>
                                <p className="text-sm font-bold text-gray-700">{stat.value}</p>
                            </div>
                        </div>
                    ))}
                </div>

                {/* Filter Section */}
                <div
                    className={'bg-white rounded-xl p-4 flex flex-col border border-gray-200'}
                >
                    <h2 className="text-xl font-semibold text-gray-700 mb-3">Filter</h2>
                    <div className={'grid md:grid-cols-5 gap-4'}>
                        <div>
                            <label htmlFor="category" className="block text-sm font-medium text-gray-700 mb-1">
                                Category
                            </label>
                            <TypeableSelect
                                options={categories}
                                value={selectedCategory}
                                onChange={(opt) => setSelectedCategory(opt?.value as string || null)}
                                placeholder={isLoadingDropdowns ? "Loading..." : "Search categories.."}
                                disabled={isLoadingDropdowns}
                            />
                        </div>
                        <div>
                            <label htmlFor="unit" className="block text-sm font-medium text-gray-700 mb-1">
                                Unit
                            </label>
                            <TypeableSelect
                                options={units}
                                value={selectedUnit}
                                onChange={(opt) => setSelectedUnit(opt?.value as string || null)}
                                placeholder={isLoadingDropdowns ? "Loading..." : "Search units.."}
                                disabled={isLoadingDropdowns}
                            />
                        </div>
                        <div>
                            <label htmlFor="supplier" className="block text-sm font-medium text-gray-700 mb-1">
                                Supplier
                            </label>
                            <TypeableSelect
                                options={suppliers}
                                value={selectedSupplier}
                                onChange={(opt) => setSelectedSupplier(opt?.value as string || null)}
                                placeholder={isLoadingDropdowns ? "Loading..." : "Search suppliers.."}
                                disabled={isLoadingDropdowns}
                            />
                        </div>
                        <div>
                            <label htmlFor="product" className="block text-sm font-medium text-gray-700 mb-1">
                                Product ID / Name
                            </label>
                            <input
                                type="text"
                                id="product"
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                placeholder="Enter Product ID or Name..."
                                className="w-full text-sm rounded-lg py-2 px-3 border-2 border-gray-200 focus:border-emerald-400 focus:outline-none transition-all"
                                onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
                            />
                        </div>
                        <div className={'grid grid-cols-2 md:items-end items-start gap-2 text-white font-medium'}>
                            <button
                                onClick={handleSearch}
                                disabled={isLoadingStock}
                                className={'bg-linear-to-r from-emerald-500 to-emerald-600 hover:from-emerald-600 hover:to-emerald-700 py-2 rounded-lg flex items-center justify-center shadow-lg shadow-emerald-200 hover:shadow-xl transition-all disabled:opacity-50 disabled:cursor-not-allowed'}>
                                <SearchCheck className={`mr-2 ${isLoadingStock ? 'animate-pulse' : ''}`} size={14} />
                                {isLoadingStock ? 'Searching...' : 'Search'}
                            </button>
                            <button
                                onClick={handleClearFilters}
                                disabled={isLoadingStock}
                                className={'bg-linear-to-r from-gray-500 to-gray-600 hover:from-gray-600 hover:to-gray-700 py-2 rounded-lg flex items-center justify-center shadow-lg shadow-gray-200 hover:shadow-xl transition-all disabled:opacity-50 disabled:cursor-not-allowed'}>
                                <RefreshCw className={`mr-2 ${(isLoadingDropdowns || isLoadingStock) ? 'animate-spin' : ''}`} size={14} />
                                {(isLoadingDropdowns || isLoadingStock) ? 'Refreshing...' : 'Refresh'}
                            </button>
                        </div>
                    </div>
                </div>

                {/* Stock Table */}
                <div
                    className="flex flex-col bg-white rounded-xl p-4 justify-between border border-gray-200 flex-1 overflow-hidden"
                >
                    <div className="overflow-auto flex-1 rounded-lg scrollbar-thin scrollbar-thumb-emerald-300 scrollbar-track-gray-100">
                        <table className="min-w-full divide-y divide-gray-200">
                            <thead className="bg-linear-to-r from-emerald-500 to-emerald-600 sticky top-0 z-10">
                                <tr>
                                    {[
                                        'Product ID',
                                        'Product Name',
                                        'Barcode',
                                        'Unit',
                                        'Cost Price',
                                        'MRP',
                                        'Selling Price',
                                        'Supplier',
                                        'Stock QTY',
                                        'Action'
                                    ].map((header, i, arr) => (
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
                                {currentStockData.length === 0 ? (
                                    <tr>
                                        <td colSpan={10} className="px-6 py-8 text-center text-gray-500">
                                            {isLoadingStock ? 'Loading stock data...' : 'No stock records found'}
                                        </td>
                                    </tr>
                                ) : (
                                    currentStockData.map((sale, index) => (
                                        <tr
                                            key={index}
                                            onClick={() => setSelectedIndex(index)}
                                            className={`cursor-pointer transition-all ${selectedIndex === index
                                                ? 'bg-emerald-50 border-l-4 border-l-emerald-500'
                                                : 'hover:bg-gray-50'
                                                }`}
                                        >
                                            <td className="px-6 py-2 whitespace-nowrap text-sm font-semibold text-gray-800">
                                                {sale.productID}
                                            </td>
                                            <td className="px-6 py-2 whitespace-nowrap text-sm font-medium text-gray-700">
                                                {sale.productName}
                                            </td>
                                            <td className="px-6 py-2 whitespace-nowrap text-sm text-gray-500 font-mono">
                                                {sale.barcode}
                                            </td>
                                            <td className="px-6 py-2 whitespace-nowrap text-sm text-gray-600">
                                                {sale.unit}
                                            </td>

                                            <td className="px-6 py-2 whitespace-nowrap text-sm font-medium text-blue-600">
                                                LKR {sale.costPrice}
                                            </td>
                                            <td className="px-6 py-2 whitespace-nowrap text-sm font-medium text-gray-600">
                                                LKR {sale.MRP}
                                            </td>
                                            <td className="px-6 py-2 whitespace-nowrap text-sm font-bold text-emerald-600">
                                                LKR {sale.Price}
                                            </td>
                                            <td className="px-6 py-2 whitespace-nowrap text-sm text-gray-600">
                                                {sale.supplier}
                                            </td>
                                            <td className="px-6 py-2 whitespace-nowrap">
                                        <span className={`px-3 py-1 text-xs font-semibold rounded-full ${parseInt(sale.stockQty) < 30
                                            ? 'bg-linear-to-r from-red-100 to-red-200 text-red-800'
                                            : 'bg-linear-to-r from-emerald-100 to-emerald-200 text-emerald-800'
                                            }`}>
                                            {sale.stockQty}
                                        </span>
                                            </td>
                                            <td className="px-6 py-2 whitespace-nowrap text-center">
                                                <button
                                                    onClick={(e) => {
                                                        e.stopPropagation();
                                                        setSelectedProductForBarcode({
                                                            productID: parseInt(sale.productID),
                                                            productName: sale.productName,
                                                            productCode: '', // Not available in this view, using barcode
                                                            barcode: sale.barcode,
                                                            price: parseFloat(sale.Price.replace(/,/g, ''))
                                                        });
                                                        setIsBarcodeModalOpen(true);
                                                    }}
                                                    className="p-2 text-emerald-600 hover:bg-emerald-50 rounded-lg transition-colors"
                                                    title="Print Barcode"
                                                >
                                                    <Barcode size={18} />
                                                </button>
                                            </td>
                                        </tr>
                                    ))
                                )}
                            </tbody>
                        </table>
                    </div>

                    <nav className="bg-white flex items-center justify-between sm:px-6 pt-4 border-t-2 border-gray-100">
                        <div className="text-sm text-gray-600">
                            Showing <span className="font-semibold text-gray-800">{((currentPage - 1) * itemsPerPage) + 1}</span> to{' '}
                            <span className="font-semibold text-gray-800">{Math.min(currentPage * itemsPerPage, pagination.totalItems)}</span> of{' '}
                            <span className="font-semibold text-gray-800">{pagination.totalItems}</span> results
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
                                Next <ChevronRight className="ml-2 h-5 w-5" />
                            </button>
                        </div>
                    </nav>
                </div>

                {/* Export Buttons */}
                    <div
                    className="bg-white flex justify-center p-4 gap-4 rounded-xl shadow-lg"
                >
                    <button
                        onClick={() => openExportModal('excel')}
                        className="flex items-center gap-2 px-6 py-3 bg-linear-to-r from-emerald-500 to-emerald-600 hover:from-emerald-600 hover:to-emerald-700 text-white font-medium rounded-lg shadow-lg shadow-emerald-200 hover:shadow-xl transition-all"
                    >
                        <FileText size={20} />
                        Excel
                    </button>
                    <button
                        onClick={() => openExportModal('csv')}
                        className="flex items-center gap-2 px-6 py-3 bg-linear-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white font-medium rounded-lg shadow-lg shadow-blue-200 hover:shadow-xl transition-all"
                    >
                        <FileText size={20} />
                        CSV
                    </button>
                    <button
                        onClick={() => openExportModal('pdf')}
                        className="flex items-center gap-2 px-6 py-3 bg-linear-to-r from-red-500 to-red-600 hover:from-red-600 hover:to-red-700 text-white font-medium rounded-lg shadow-lg shadow-red-200 hover:shadow-xl transition-all"
                    >
                        <FileText size={20} />
                        PDF
                    </button>
                </div>
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

            {/* Print & Export Modals */}
            <BarcodePrintModal
                isOpen={isBarcodeModalOpen}
                onClose={() => setIsBarcodeModalOpen(false)}
                product={selectedProductForBarcode}
            />

            <ExportModal
                isOpen={isExportModalOpen}
                onClose={() => setIsExportModalOpen(false)}
                onExport={handleExportConfirm}
                type={exportType}
                isLoading={isExporting}
            />
        </>
    );
}

export default StockList;