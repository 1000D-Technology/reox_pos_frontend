import {
    ChevronLeft,
    ChevronRight,
    FileText,
    RefreshCw,
    SearchCheck,
    AlertCircle,
    Package,
    DollarSign,
    TrendingDown,

    ShoppingCart,
    ArrowUpRight,
    ArrowDownRight,
} from "lucide-react";
import { useEffect, useState } from "react";
import TypeableSelect from "../../../components/TypeableSelect.tsx";
import { stockService } from '../../../services/stockService';
import { productService } from '../../../services/productService';
import toast, { Toaster } from 'react-hot-toast';
import * as XLSX from 'xlsx';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';

function LowStock() {
    // State for summary data
    const [summaryData, setSummaryData] = useState({
        lowStockItems: 0,
        totalProducts: 0,
        potentialLoss: 'LKR 0.00',
        belowThreshold: 0,
        reorderRequired: 0
    });
    
    const summaryCards = [
        {
            icon: AlertCircle,
            label: 'Low Stock Items',
            value: summaryData.lowStockItems.toString(),
            trend: '',
            color: 'bg-gradient-to-br from-orange-400 to-orange-500',
            iconColor: 'text-white',
            bgGlow: 'shadow-orange-200'
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
            label: 'Potential Loss',
            value: summaryData.potentialLoss,
            trend: '',
            color: 'bg-gradient-to-br from-red-400 to-red-500',
            iconColor: 'text-white',
            bgGlow: 'shadow-red-200'
        },
        {
            icon: TrendingDown,
            label: 'Below Threshold',
            value: summaryData.belowThreshold.toString(),
            trend: '',
            color: 'bg-gradient-to-br from-yellow-400 to-yellow-500',
            iconColor: 'text-white',
            bgGlow: 'shadow-yellow-200'
        },
        {
            icon: ShoppingCart,
            label: 'Reorder Required',
            value: summaryData.reorderRequired.toString(),
            trend: '',
            color: 'bg-gradient-to-br from-blue-400 to-blue-500',
            iconColor: 'text-white',
            bgGlow: 'shadow-blue-200'
        },
    ];

    type SelectOption = {
        value: string;
        label: string;
    };

    // Table data state
    const [salesData, setSalesData] = useState<any[]>([]);
    const [loading, setLoading] = useState<boolean>(true);

    // Dropdown data states
    const [categories, setCategories] = useState<SelectOption[]>([]);
    const [units, setUnits] = useState<SelectOption[]>([]);
    const [suppliers, setSuppliers] = useState<SelectOption[]>([]);
    const [productSearch, setProductSearch] = useState<SelectOption[]>([]);
    const [loadingDropdowns, setLoadingDropdowns] = useState<boolean>(true);
    const [isSearching, setIsSearching] = useState<boolean>(false);

    const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
    const [selectedUnit, setSelectedUnit] = useState<string | null>(null);
    const [selectedSupplier, setSelectedSupplier] = useState<string | null>(null);
    const [selectedProduct, setSelectedProduct] = useState<string | null>(null);

    const [selectedIndex, setSelectedIndex] = useState(0);
    const [currentPage, setCurrentPage] = useState(1);
    const [itemsPerPage] = useState(10);

    const totalPages = Math.ceil(salesData.length / itemsPerPage);
    const startIndex = (currentPage - 1) * itemsPerPage;
    const endIndex = startIndex + itemsPerPage;
    const currentSalesData = salesData.slice(startIndex, endIndex);

    // Load low stock data from API
    const loadLowStockData = async () => {
        try {
            setLoading(true);
            const response = await stockService.getLowStockList();
            
            if (response.data?.success) {
                setSalesData(response.data.data);
            } else {
                setSalesData([]);
            }
        } catch (error) {
            console.error('Error loading low stock data:', error);
            setSalesData([]);
        } finally {
            setLoading(false);
        }
    };

    const handleSearch = async () => {
        try {
            setIsSearching(true);
            setLoading(true);

            const filters: any = {};
            if (selectedCategory) filters.category_id = selectedCategory;
            if (selectedUnit) filters.unit_id = selectedUnit;
            if (selectedSupplier) filters.supplier_id = selectedSupplier;
            if (selectedProduct) filters.product_id = selectedProduct;

            const response = await stockService.searchLowStock(filters);
            
            if (response.data?.success) {
                setSalesData(response.data.data);
                setCurrentPage(1); // Reset to first page
                setSelectedIndex(0);
                
                if (response.data.data.length > 0) {
                    toast.success(`Found ${response.data.count || response.data.data.length} records`);
                } else {
                    toast.error('No records found matching your search criteria');
                }
            } else {
                setSalesData([]);
                toast.error('No records found matching your search criteria');
            }
        } catch (error) {
            console.error('Error searching low stock records:', error);
            toast.error('Failed to search low stock records');
            setSalesData([]);
        } finally {
            setIsSearching(false);
            setLoading(false);
        }
    };

    const handleClearFilters = () => {
        setSelectedCategory(null);
        setSelectedUnit(null);
        setSelectedSupplier(null);
        setSelectedProduct(null);
        // Reload original data
        loadLowStockData();
    };

    // Export to Excel
    const handleExportExcel = () => {
        try {
            const exportData = salesData.map((item, index) => ({
                'No': index + 1,
                'Product ID': item.productID,
                'Product Name': item.productName,
                'Unit': item.unit,
                'Cost Price': item.costPrice,
                'MRP': item.mrp,
                'Price': item.price,
                'Supplier': item.supplier,
                'Stock Status': item.stockStatus
            }));

            const ws = XLSX.utils.json_to_sheet(exportData);
            const wb = XLSX.utils.book_new();
            XLSX.utils.book_append_sheet(wb, ws, 'Low Stock');
            
            const timestamp = new Date().toISOString().split('T')[0];
            XLSX.writeFile(wb, `Low_Stock_${timestamp}.xlsx`);
            toast.success('Excel file exported successfully');
        } catch (error) {
            console.error('Error exporting Excel:', error);
            toast.error('Failed to export Excel file');
        }
    };

    // Export to CSV
    const handleExportCSV = () => {
        try {
            const headers = ['No', 'Product ID', 'Product Name', 'Unit', 'Cost Price', 'MRP', 'Price', 'Supplier', 'Stock Status'];
            const csvData = salesData.map((item, index) => [
                index + 1,
                item.productID,
                item.productName,
                item.unit,
                item.costPrice,
                item.mrp,
                item.price,
                item.supplier,
                item.stockStatus
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
            link.setAttribute('download', `Low_Stock_${timestamp}.csv`);
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
            const doc = new jsPDF();
            
            // Add title
            doc.setFontSize(18);
            doc.text('Low Stock Report', 14, 22);
            
            // Add date
            doc.setFontSize(10);
            doc.text(`Generated on: ${new Date().toLocaleDateString('en-US', { 
                year: 'numeric', 
                month: 'long', 
                day: 'numeric' 
            })}`, 14, 30);

            // Prepare table data
            const tableData = salesData.map((item, index) => [
                index + 1,
                item.productID,
                item.productName,
                item.unit,
                item.costPrice,
                item.mrp,
                item.price,
                item.supplier,
                item.stockStatus
            ]);

            // Add table
            autoTable(doc, {
                startY: 35,
                head: [['No', 'Product ID', 'Product Name', 'Unit', 'Cost Price', 'MRP', 'Price', 'Supplier', 'Stock Status']],
                body: tableData,
                theme: 'grid',
                headStyles: {
                    fillColor: [251, 146, 60],
                    textColor: 255,
                    fontStyle: 'bold'
                },
                styles: {
                    fontSize: 8,
                    cellPadding: 2
                },
                columnStyles: {
                    0: { cellWidth: 10 },
                    1: { cellWidth: 20 },
                    2: { cellWidth: 30 },
                    3: { cellWidth: 15 },
                    4: { cellWidth: 20 },
                    5: { cellWidth: 20 },
                    6: { cellWidth: 20 },
                    7: { cellWidth: 25 },
                    8: { cellWidth: 25 }
                }
            });

            const timestamp = new Date().toISOString().split('T')[0];
            doc.save(`Low_Stock_${timestamp}.pdf`);
            toast.success('PDF file exported successfully');
        } catch (error) {
            console.error('Error exporting PDF:', error);
            toast.error('Failed to export PDF file');
        }
    };

    // Load summary data
    const loadSummaryData = async () => {
        try {
            const response = await stockService.getLowStockSummary();
            if (response.data?.success) {
                setSummaryData({
                    lowStockItems: response.data.data.lowStockItems,
                    totalProducts: response.data.data.totalProducts,
                    potentialLoss: response.data.data.potentialLoss,
                    belowThreshold: response.data.data.belowThreshold,
                    reorderRequired: response.data.data.reorderRequired
                });
            }
        } catch (error) {
            console.error('Error loading summary data:', error);
            // Keep default values on error
        }
    };

    useEffect(() => {
        const loadDropdownData = async () => {
            try {
                setLoadingDropdowns(true);

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

                setLoadingDropdowns(false);
            } catch (error) {
                console.error('Error loading dropdown data:', error);
                setLoadingDropdowns(false);
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
                }
            } catch (error) {
                console.error('Error loading product data:', error);
            }
        };

        loadLowStockData();
        loadDropdownData();
        loadProductData();
        loadSummaryData();
        loadSummaryData();
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

    const getStockStatus = (qty: string) => {
        const quantity = parseInt(qty);
        if (quantity <= 10) {
            return { label: 'Critical', color: 'bg-red-100 text-red-700 border-red-200' };
        } else if (quantity <= 20) {
            return { label: 'Low', color: 'bg-orange-100 text-orange-700 border-orange-200' };
        } else {
            return { label: 'Warning', color: 'bg-yellow-100 text-yellow-700 border-yellow-200' };
        }
    };

    return (
        <div className={'flex flex-col gap-4 h-full'}>
            {/* Header */}
            <div>
                <div className="text-sm text-gray-400 flex items-center">
                    <span>Stock</span>
                    <span className="mx-2">›</span>
                    <span className="text-gray-700 font-medium">Low Stock</span>
                </div>
                <h1 className="text-3xl font-semibold bg-gradient-to-r from-gray-800 to-gray-600 bg-clip-text text-transparent">
                    Low Stock
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
                            placeholder={loadingDropdowns ? "Loading categories..." : "Search categories..."}
                            disabled={loadingDropdowns}
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
                            placeholder={loadingDropdowns ? "Loading units..." : "Search units..."}
                            disabled={loadingDropdowns}
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
                            placeholder={loadingDropdowns ? "Loading suppliers..." : "Search suppliers..."}
                            disabled={loadingDropdowns}
                        />
                    </div>
                    <div>
                        <label htmlFor="product" className="block text-sm font-medium text-gray-700 mb-1">
                            Product ID / Name
                        </label>
                        <TypeableSelect
                            options={productSearch}
                            value={selectedProduct}
                            onChange={(opt) => setSelectedProduct(opt?.value as string || null)}
                            placeholder={loadingDropdowns ? "Loading products..." : "Search products..."}
                            disabled={loadingDropdowns}
                        />
                    </div>
                    <div className={'grid grid-cols-2 md:items-end items-start gap-2 text-white font-medium'}>
                        <button 
                            onClick={handleSearch}
                            disabled={isSearching || loadingDropdowns}
                            className={'bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 py-2 rounded-lg flex items-center justify-center shadow-lg shadow-orange-200 hover:shadow-xl transition-all disabled:opacity-50 disabled:cursor-not-allowed'}
                        >
                            <SearchCheck className="mr-2" size={14} />
                            {isSearching ? 'Searching...' : 'Search'}
                        </button>
                        <button 
                            onClick={handleClearFilters} 
                            disabled={loading || loadingDropdowns}
                            className={'bg-gradient-to-r from-gray-500 to-gray-600 hover:from-gray-600 hover:to-gray-700 py-2 rounded-lg flex items-center justify-center shadow-lg shadow-gray-200 hover:shadow-xl transition-all disabled:opacity-50 disabled:cursor-not-allowed'}
                        >
                            <RefreshCw className="mr-2" size={14} />Clear
                        </button>
                    </div>
                </div>
            </div>

            {/* Stock Table */}
            <div
                className={'flex flex-col bg-white rounded-xl h-full p-4 justify-between shadow-lg'}
            >
                <div className="overflow-y-auto max-h-md md:h-[320px] lg:h-[500px] rounded-lg scrollbar-thin scrollbar-thumb-orange-300 scrollbar-track-gray-100">
                    <table className="min-w-full divide-y divide-gray-200">
                        <thead className="bg-gradient-to-r from-orange-500 to-orange-600 sticky top-0 z-10">
                        <tr>
                            {['Product ID', 'Product Name', 'Unit', 'Cost Price', 'MRP', 'Price', 'Supplier', 'Stock Status'].map((header, i, arr) => (
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
                        {loading ? (
                            <tr>
                                <td colSpan={8} className="px-6 py-8 text-center text-gray-500">
                                    Loading low stock items...
                                </td>
                            </tr>
                        ) : currentSalesData.length === 0 ? (
                            <tr>
                                <td colSpan={8} className="px-6 py-8 text-center text-gray-500">
                                    No low stock items found
                                </td>
                            </tr>
                        ) : (
                            currentSalesData.map((sale, index) => (
                                <tr
                                    key={index}
                                    onClick={() => setSelectedIndex(index)}
                                    className={`cursor-pointer transition-all ${
                                        selectedIndex === index
                                            ? 'bg-gradient-to-r from-orange-50 to-orange-100 border-l-4 border-orange-500'
                                            : 'hover:bg-gray-50'
                                    }`}
                                >
                                    <td className="px-6 py-2 whitespace-nowrap text-sm font-semibold text-gray-800">
                                        {sale.productID}
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
                                        <div className="flex items-center gap-2">
                                            <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold border ${
                                                sale.stockStatus?.includes('Critical') ? 'bg-red-100 text-red-700 border-red-200' :
                                                sale.stockStatus?.includes('Low') ? 'bg-orange-100 text-orange-700 border-orange-200' :
                                                'bg-yellow-100 text-yellow-700 border-yellow-200'
                                            }`}>
                                                <AlertCircle className="w-3 h-3 mr-1" />
                                                {sale.stockStatus}
                                            </span>
                                        </div>
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
                            className={`flex items-center px-3 py-2 text-sm font-medium rounded-lg transition-all ${
                                currentPage === 1
                                    ? 'text-gray-400 cursor-not-allowed'
                                    : 'text-gray-600 hover:text-orange-600 hover:bg-orange-50'
                            }`}
                        >
                            <ChevronLeft className="mr-2 h-5 w-5" /> Previous
                        </button>

                        {getPageNumbers().map((page, index) =>
                            typeof page === 'number' ? (
                                <button
                                    key={index}
                                    onClick={() => goToPage(page)}
                                    className={`px-4 py-2 text-sm font-semibold rounded-lg transition-all ${
                                        currentPage === page
                                            ? 'bg-gradient-to-r from-orange-500 to-orange-600 text-white shadow-lg shadow-orange-200'
                                            : 'text-gray-600 hover:text-orange-600 hover:bg-orange-50'
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
                            className={`flex items-center px-3 py-2 text-sm font-medium rounded-lg transition-all ${
                                currentPage === totalPages
                                    ? 'text-gray-400 cursor-not-allowed'
                                    : 'text-gray-600 hover:text-orange-600 hover:bg-orange-50'
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

export default LowStock;