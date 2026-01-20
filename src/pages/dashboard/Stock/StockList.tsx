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
    const [isLoadingSummary, setIsLoadingSummary] = useState(false);

    const summaryCards = [
        {
            icon: Package,
            label: 'Total Products',
            value: summaryData.totalProducts.value,
            trend: '',
            color: 'bg-gradient-to-br from-emerald-400 to-emerald-500',
            iconColor: 'text-white',
            bgGlow: 'shadow-emerald-200'
        },
        {
            icon: DollarSign,
            label: 'Total Value',
            value: summaryData.totalValue.value,
            trend: '',
            color: 'bg-gradient-to-br from-purple-400 to-purple-500',
            iconColor: 'text-white',
            bgGlow: 'shadow-purple-200'
        },
        {
            icon: TrendingUp,
            label: 'Low Stock Items',
            value: summaryData.lowStock.value,
            trend: '',
            color: 'bg-gradient-to-br from-red-400 to-red-500',
            iconColor: 'text-white',
            bgGlow: 'shadow-red-200'
        },
        {
            icon: Users,
            label: 'Total Suppliers',
            value: summaryData.totalSuppliers.value,
            trend: '',
            color: 'bg-gradient-to-br from-blue-400 to-blue-500',
            iconColor: 'text-white',
            bgGlow: 'shadow-blue-200'
        },
        {
            icon: ShoppingCart,
            label: 'Categories',
            value: summaryData.totalCategories.value,
            trend: '',
            color: 'bg-gradient-to-br from-yellow-400 to-yellow-500',
            iconColor: 'text-white',
            bgGlow: 'shadow-yellow-200'
        },
    ];

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

    // Load stock data
    const loadStockData = async () => {
        setIsLoadingStock(true);
        try {
            const response = await stockService.getAllStockWithVariations();
            if (response.data?.success) {
                setStockData(response.data.data);
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
        setIsLoadingSummary(true);
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
        } finally {
            setIsLoadingSummary(false);
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
                response = await stockService.searchStock(filters);
                toast.success('Search completed successfully');
            } else {
                response = await stockService.getStockList();
                toast.success('Showing all stock data');
            }

            if (response.data?.success) {
                setStockData(response.data.data);
                setCurrentPage(1); // Reset to first page
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
        await Promise.all([loadStockData(), loadSummaryData()]);
        toast.success('Filters cleared');
    };

    // Export to Excel
    const handleExportExcel = () => {
        try {
            const exportData = stockData.map((item, index) => ({
                'No': index + 1,
                'Stock ID': item.stock_id,
                'Product Name': item.product_name,
                'Color': item.color || '-',
                'Size': item.size || '-',
                'Storage': item.storage_capacity || '-',
                'Barcode': item.barcode || '-',
                'Unit': item.unit,
                'Batch': item.batch_name || '-',
                'Quantity': item.qty,
                'Cost Price': item.cost_price,
                'MRP': item.mrp,
                'Selling Price': item.selling_price,
                'Supplier': item.supplier || 'N/A',
                'Category': item.category || '-',
                'Brand': item.brand || '-',
                'MFD': item.mfd || '-',
                'EXP': item.exp || '-'
            }));

            const ws = XLSX.utils.json_to_sheet(exportData);
            const wb = XLSX.utils.book_new();
            XLSX.utils.book_append_sheet(wb, ws, 'Stock List');

            const timestamp = new Date().toISOString().split('T')[0];
            XLSX.writeFile(wb, `Stock_List_All_Variations_${timestamp}.xlsx`);
            toast.success('Excel file exported successfully');
        } catch (error) {
            console.error('Error exporting Excel:', error);
            toast.error('Failed to export Excel file');
        }
    };

    // Export to CSV
    const handleExportCSV = () => {
        try {
            const headers = ['No', 'Stock ID', 'Product Name', 'Color', 'Size', 'Storage', 'Barcode', 'Unit', 'Batch', 'Quantity', 'Cost Price', 'MRP', 'Selling Price', 'Supplier', 'Category', 'Brand', 'MFD', 'EXP'];
            const csvData = stockData.map((item, index) => [
                index + 1,
                item.stock_id,
                item.product_name,
                item.color || '-',
                item.size || '-',
                item.storage_capacity || '-',
                item.barcode || '-',
                item.unit,
                item.batch_name || '-',
                item.qty,
                item.cost_price,
                item.mrp,
                item.selling_price,
                item.supplier || 'N/A',
                item.category || '-',
                item.brand || '-',
                item.mfd || '-',
                item.exp || '-'
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
            link.setAttribute('download', `Stock_List_All_Variations_${timestamp}.csv`);
            link.style.visibility = 'hidden';
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);

            toast.success('CSV file exported successfully');
        } catch (error) {
            console.error('Error exporting CSV:', error);
            toast.error('Failed to export CSV file');
        }
    };

    // Export to PDF
    const handleExportPDF = () => {
        try {
            const doc = new jsPDF('landscape'); // Use landscape for more columns
            
            // Add title
            doc.setFontSize(18);
            doc.text('Stock List Report (All Variations)', 14, 22);
            
            // Add date
            doc.setFontSize(10);
            doc.text(`Generated on: ${new Date().toLocaleDateString('en-US', {
                year: 'numeric',
                month: 'long',
                day: 'numeric'
            })}`, 14, 30);

            // Prepare table data
            const tableData = stockData.map((item, index) => [
                index + 1,
                item.stock_id,
                item.product_name,
                `${item.color || '-'} / ${item.size || '-'} / ${item.storage_capacity || '-'}`,
                item.unit,
                item.batch_name || '-',
                item.qty,
                `LKR ${parseFloat(item.cost_price).toFixed(2)}`,
                `LKR ${parseFloat(item.selling_price).toFixed(2)}`,
                item.supplier || 'N/A'
            ]);

            // Add table
            autoTable(doc, {
                startY: 35,
                head: [['No', 'Stock ID', 'Product', 'Variation', 'Unit', 'Batch', 'Qty', 'Cost', 'Price', 'Supplier']],
                body: tableData,
                theme: 'grid',
                headStyles: {
                    fillColor: [16, 185, 129],
                    textColor: 255,
                    fontStyle: 'bold'
                },
                styles: {
                    fontSize: 7,
                    cellPadding: 1.5
                },
                columnStyles: {
                    0: { cellWidth: 10 },
                    1: { cellWidth: 18 },
                    2: { cellWidth: 45 },
                    3: { cellWidth: 40 },
                    4: { cellWidth: 15 },
                    5: { cellWidth: 25 },
                    6: { cellWidth: 12 },
                    7: { cellWidth: 25 },
                    8: { cellWidth: 25 },
                    9: { cellWidth: 35 }
                }
            });

            const timestamp = new Date().toISOString().split('T')[0];
            doc.save(`Stock_List_All_Variations_${timestamp}.pdf`);
            toast.success('PDF file exported successfully');
        } catch (error) {
            console.error('Error exporting PDF:', error);
            toast.error('Failed to export PDF file');
        }
    };

    const [selectedIndex, setSelectedIndex] = useState(0);
    const [currentPage, setCurrentPage] = useState(1);
    const [itemsPerPage] = useState(10);

    const totalPages = Math.ceil(stockData.length / itemsPerPage);
    const startIndex = (currentPage - 1) * itemsPerPage;
    const endIndex = startIndex + itemsPerPage;
    const currentStockData = stockData.slice(startIndex, endIndex);

    useEffect(() => {
        loadDropdownData();
        loadStockData();
        loadSummaryData();
    }, []);

    useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            // Prevent keyboard shortcuts when typing in input fields
            const target = e.target as HTMLElement;
            if (target.tagName === 'INPUT' || target.tagName === 'TEXTAREA') {
                return;
            }

            if (e.key === "ArrowDown") {
                e.preventDefault();
                setSelectedIndex((prev) => (prev < currentStockData.length - 1 ? prev + 1 : prev));
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
                e.preventDefault();
                setSelectedIndex(0);
            } else if (e.key === "End") {
                e.preventDefault();
                setSelectedIndex(currentStockData.length - 1);
            } else if (e.key === "Enter" && currentStockData.length > 0) {
                e.preventDefault();
                const selectedItem = currentStockData[selectedIndex];
                if (selectedItem) {
                    toast.success(`Selected: ${selectedItem.product_name} (Stock ID: ${selectedItem.stock_id})`);
                }
            } else if (e.key === "Escape") {
                e.preventDefault();
                setSelectedIndex(0);
            }
        };

        window.addEventListener("keydown", handleKeyDown);
        return () => window.removeEventListener("keydown", handleKeyDown);
    }, [currentStockData.length, selectedIndex, currentStockData, currentPage, totalPages]);

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

    return (
        <>
            <div className={'flex flex-col gap-4 h-full'}>
                {/* Header */}
                <div>
                    <div className="text-sm text-gray-400 flex items-center">
                        <span>Stock</span>
                        <span className="mx-2">›</span>
                        <span className="text-gray-700 font-medium">Stock List</span>
                    </div>
                    <h1 className="text-3xl font-semibold bg-gradient-to-r from-gray-800 to-gray-600 bg-clip-text text-transparent">
                        Stock List
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
                    className={'bg-white rounded-xl p-4 flex flex-col shadow-lg'}
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
                                className={'bg-gradient-to-r from-emerald-500 to-emerald-600 hover:from-emerald-600 hover:to-emerald-700 py-2 rounded-lg flex items-center justify-center shadow-lg shadow-emerald-200 hover:shadow-xl transition-all disabled:opacity-50 disabled:cursor-not-allowed'}>
                                <SearchCheck className={`mr-2 ${isLoadingStock ? 'animate-pulse' : ''}`} size={14} />
                                {isLoadingStock ? 'Searching...' : 'Search'}
                            </button>
                            <button
                                onClick={handleClearFilters}
                                disabled={isLoadingStock}
                                className={'bg-gradient-to-r from-gray-500 to-gray-600 hover:from-gray-600 hover:to-gray-700 py-2 rounded-lg flex items-center justify-center shadow-lg shadow-gray-200 hover:shadow-xl transition-all disabled:opacity-50 disabled:cursor-not-allowed'}>
                                <RefreshCw className={`mr-2 ${(isLoadingDropdowns || isLoadingStock) ? 'animate-spin' : ''}`} size={14} />
                                {(isLoadingDropdowns || isLoadingStock) ? 'Refreshing...' : 'Refresh'}
                            </button>
                        </div>
                    </div>
                </div>

                {/* Stock Table */}
                <div
                    className={'flex flex-col bg-white rounded-xl h-full p-4 justify-between shadow-lg'}
                >
                    <div className="overflow-y-auto max-h-md md:h-[320px] lg:h-[500px] rounded-lg scrollbar-thin scrollbar-thumb-emerald-300 scrollbar-track-gray-100">
                        <table className="min-w-full divide-y divide-gray-200">
                            <thead className="bg-gradient-to-r from-emerald-500 to-emerald-600 sticky top-0 z-10">
                            <tr>
                                {[
                                    'Stock ID',
                                    'Product Name',
                                    'Color',
                                    'Size',
                                    'Storage',
                                    'Barcode',
                                    'Unit',
                                    'Batch',
                                    'Qty',
                                    'Cost Price',
                                    'MRP',
                                    'Selling Price',
                                    'Supplier',
                                ].map((header, i, arr) => (
                                    <th
                                        key={i}
                                        scope="col"
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
                            {currentStockData.length === 0 ? (
                                <tr>
                                    <td colSpan={13} className="px-6 py-8 text-center text-gray-500">
                                        {isLoadingStock ? 'Loading stock data...' : 'No stock records found'}
                                    </td>
                                </tr>
                            ) : (
                                currentStockData.map((sale, index) => (
                                    <tr
                                        key={index}
                                        onClick={() => setSelectedIndex(index)}
                                        className={`cursor-pointer transition-all ${
                                            selectedIndex === index
                                                ? 'bg-emerald-50 border-l-4 border-l-emerald-500'
                                                : 'hover:bg-gray-50'
                                        }`}
                                    >
                                        <td className="px-6 py-2 whitespace-nowrap text-sm font-semibold text-gray-800">
                                            {sale.stock_id}
                                        </td>
                                        <td className="px-6 py-2 whitespace-nowrap text-sm font-medium text-gray-700">
                                            {sale.product_name}
                                        </td>
                                        <td className="px-6 py-2 whitespace-nowrap text-sm text-gray-600">
                                            {sale.color || '-'}
                                        </td>
                                        <td className="px-6 py-2 whitespace-nowrap text-sm text-gray-600">
                                            {sale.size || '-'}
                                        </td>
                                        <td className="px-6 py-2 whitespace-nowrap text-sm text-gray-600">
                                            {sale.storage_capacity || '-'}
                                        </td>
                                        <td className="px-6 py-2 whitespace-nowrap text-sm text-gray-600">
                                            {sale.barcode || '-'}
                                        </td>
                                        <td className="px-6 py-2 whitespace-nowrap text-sm text-gray-600">
                                            {sale.unit}
                                        </td>
                                        <td className="px-6 py-2 whitespace-nowrap text-sm text-gray-600">
                                            {sale.batch_name || '-'}
                                        </td>
                                        <td className="px-6 py-2 whitespace-nowrap">
                                            <span className={`px-3 py-1 text-xs font-semibold rounded-full ${
                                                parseInt(sale.qty) < 30
                                                    ? 'bg-gradient-to-r from-red-100 to-red-200 text-red-800'
                                                    : 'bg-gradient-to-r from-emerald-100 to-emerald-200 text-emerald-800'
                                            }`}>
                                                {sale.qty}
                                            </span>
                                        </td>
                                        <td className="px-6 py-2 whitespace-nowrap text-sm font-medium text-blue-600">
                                            LKR {parseFloat(sale.cost_price).toFixed(2)}
                                        </td>
                                        <td className="px-6 py-2 whitespace-nowrap text-sm font-medium text-gray-600">
                                            LKR {parseFloat(sale.mrp).toFixed(2)}
                                        </td>
                                        <td className="px-6 py-2 whitespace-nowrap text-sm font-bold text-emerald-600">
                                            LKR {parseFloat(sale.selling_price).toFixed(2)}
                                        </td>
                                        <td className="px-6 py-2 whitespace-nowrap text-sm text-gray-600">
                                            {sale.supplier || 'N/A'}
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
                            <span className="font-semibold text-gray-800">{Math.min(endIndex, stockData.length)}</span> of{' '}
                            <span className="font-semibold text-gray-800">{stockData.length}</span> results
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
                                            ? 'bg-gradient-to-r from-emerald-500 to-emerald-600 text-white shadow-md'
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
                    className={'bg-white flex justify-center p-4 gap-4 rounded-xl shadow-lg'}
                >
                    <button
                        onClick={handleExportExcel}
                        className={'bg-gradient-to-r from-emerald-500 to-emerald-600 hover:from-emerald-600 hover:to-emerald-700 px-6 py-2 font-medium text-white rounded-lg flex gap-2 items-center shadow-lg shadow-emerald-200 hover:shadow-xl transition-all'}>
                        <FileText size={15} />Excel
                    </button>
                    <button
                        onClick={handleExportCSV}
                        className={'bg-gradient-to-r from-yellow-500 to-yellow-600 hover:from-yellow-600 hover:to-yellow-700 px-6 py-2 font-medium text-white rounded-lg flex gap-2 items-center shadow-lg shadow-yellow-200 hover:shadow-xl transition-all'}>
                        <FileText size={15} />CSV
                    </button>
                    <button
                        onClick={handleExportPDF}
                        className={'bg-gradient-to-r from-red-500 to-red-600 hover:from-red-600 hover:to-red-700 px-6 py-2 font-medium text-white rounded-lg flex gap-2 items-center shadow-lg shadow-red-200 hover:shadow-xl transition-all'}>
                        <FileText size={15} />PDF
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

            <BarcodePrintModal
                isOpen={isBarcodeModalOpen}
                onClose={() => setIsBarcodeModalOpen(false)}
                product={selectedProductForBarcode}
            />
        </>
    );
}

export default StockList;