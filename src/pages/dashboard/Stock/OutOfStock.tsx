import {
    RefreshCw,
    SearchCheck,
    ChevronLeft,
    ChevronRight,
    FileText,
    AlertTriangle,
    Package,
    DollarSign,
    TrendingDown,
    Users,
    ArrowUpRight,
    ArrowDownRight,
} from "lucide-react";
import { useEffect, useState } from "react";
import TypeableSelect from "../../../components/TypeableSelect.tsx";
import { productService } from '../../../services/productService';
import { categoryService } from '../../../services/categoryService';
import { supplierService } from '../../../services/supplierService';
import { stockService } from '../../../services/stockService';
import toast, { Toaster } from 'react-hot-toast';
import * as XLSX from 'xlsx';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';

function OutOfStock() {
 
    const [outOfStockCount, setOutOfStockCount] = useState<number>(0);
    const [summaryData, setSummaryData] = useState({
        totalProducts: 0,
        avgDaysOut: '0.0',
        affectedSuppliers: 0
    });

    const summaryCards = [
        {
            icon: AlertTriangle,
            label: 'Out of Stock Items',
            value: outOfStockCount.toString(),
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
            icon: TrendingDown,
            label: 'Avg. Days Out',
            value: summaryData.avgDaysOut,
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

       // State for out-of-stock data
    const [stockData, setStockData] = useState<any[]>([]);
    const [isLoadingStock, setIsLoadingStock] = useState(false);

    // Load out-of-stock data
    const loadOutOfStockData = async () => {
        setIsLoadingStock(true);
        try {
            const response = await stockService.getOutOfStockList();
            if (response.data?.success) {
                setStockData(response.data.data);
                setOutOfStockCount(response.data.count || response.data.data.length);
            } else {
                toast.error('Failed to load out-of-stock data');
            }
        } catch (error) {
            console.error('Error loading out-of-stock data:', error);
            toast.error('Failed to load out-of-stock data');
        } finally {
            setIsLoadingStock(false);
        }
    };

    // Load summary data
    const loadSummaryData = async () => {
        try {
            const response = await stockService.getOutOfStockSummary();
            if (response.data?.success) {
                setSummaryData({
                    totalProducts: response.data.data.totalProducts,
                    avgDaysOut: response.data.data.avgDaysOut,
                    affectedSuppliers: response.data.data.affectedSuppliers
                });
            }
        } catch (error) {
            console.error('Error loading summary data:', error);
            // Keep default values on error
        }
    };

    type SelectOption = {
        value: string | number;
        label: string;
    };

    const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
    const [selectedSupplier, setSelectedSupplier] = useState<string | null>(null);
    const [selectedProduct, setSelectedProduct] = useState<string | null>(null);

    // Dropdown options state
    const [categories, setCategories] = useState<SelectOption[]>([]);
    const [suppliers, setSuppliers] = useState<SelectOption[]>([]);
    const [products, setProducts] = useState<SelectOption[]>([]);
    const [isLoadingDropdowns, setIsLoadingDropdowns] = useState(false);

    // Load dropdown data
    const loadDropdownData = async () => {
        setIsLoadingDropdowns(true);
        try {
            const [productsResponse, categoriesResponse, suppliersResponse] = await Promise.all([
                productService.getProductsForDropdown(),
                categoryService.getCategories(),
                supplierService.getSupplierDropdownList()
            ]);

            // Transform products
            if (productsResponse.data?.success) {
                const productOptions = productsResponse.data.data.map((product: any) => ({
                    value: product.id.toString(),
                    label: product.productName || product.product_name
                }));
                setProducts(productOptions);
            }

            // Transform categories
            if (categoriesResponse.data?.success) {
                const categoryOptions = categoriesResponse.data.data.map((category: any) => ({
                    value: category.id.toString(),
                    label: category.name || category.category_name
                }));
                setCategories(categoryOptions);
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

    // Search functionality
    const handleSearch = async () => {
        setIsLoadingStock(true);
        try {
            // If no filters selected, load all data
            if (!selectedProduct && !selectedCategory && !selectedSupplier) {
                const response = await stockService.getOutOfStockList();
                if (response.data?.success) {
                    setStockData(response.data.data);
                    setCurrentPage(1);
                    setSelectedIndex(0);
                    const count = response.data.count || response.data.data.length;
                    toast.success(`Found ${count} out-of-stock items`);
                } else {
                    toast.error('Failed to load out-of-stock data');
                }
            } else {
                // Search with filters
                const filters = {
                    product: selectedProduct || undefined,
                    category: selectedCategory || undefined,
                    supplier: selectedSupplier || undefined
                };

                const response = await stockService.searchOutOfStock(filters);
                console.log(response);

                if (response.data?.success) {
                    setStockData(response.data.data || []);
                    setCurrentPage(1);
                    setSelectedIndex(0);
                    const count = response.data.count || response.data.data.length;
                    toast.success(`Found ${count} out-of-stock items`);
                } else {
                    toast.error('Search failed');
                    setStockData([]);
                }
            }
        } catch (error) {
            console.error('Error searching out-of-stock data:', error);
            toast.error('Search failed. Please try again.');
            setStockData([]);
        } finally {
            setIsLoadingStock(false);
        }
    };

    // Clear filters and reload all data
    const handleClear = () => {
        setSelectedProduct(null);
        setSelectedCategory(null);
        setSelectedSupplier(null);
        setCurrentPage(1);
        loadOutOfStockData();
        toast.success('Filters cleared');
    };

    // Export to Excel
    const handleExportExcel = () => {
        try {
            const exportData = stockData.map((item, index) => ({
                'No': index + 1,
                'Product ID': item.productID,
                'Product Name': item.productName,
                'Unit': item.unit,
                'Cost Price': item.costPrice,
                'MRP': item.MRP,
                'Price': item.Price,
                'Supplier': item.supplier,
                'Stock': item.stockQty
            }));

            const ws = XLSX.utils.json_to_sheet(exportData);
            const wb = XLSX.utils.book_new();
            XLSX.utils.book_append_sheet(wb, ws, 'Out of Stock');
            
            const timestamp = new Date().toISOString().split('T')[0];
            XLSX.writeFile(wb, `Out_Of_Stock_${timestamp}.xlsx`);
            toast.success('Excel file exported successfully');
        } catch (error) {
            console.error('Error exporting Excel:', error);
            toast.error('Failed to export Excel file');
        }
    };

    // Export to CSV
    const handleExportCSV = () => {
        try {
            const headers = ['No', 'Product ID', 'Product Name', 'Unit', 'Cost Price', 'MRP', 'Price', 'Supplier', 'Stock'];
            const csvData = stockData.map((item, index) => [
                index + 1,
                item.productID,
                item.productName,
                item.unit,
                item.costPrice,
                item.MRP,
                item.Price,
                item.supplier,
                item.stockQty
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
            link.setAttribute('download', `Out_Of_Stock_${timestamp}.csv`);
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
            doc.text('Out of Stock Report', 14, 22);
            
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
                item.productID,
                item.productName,
                item.unit,
                item.costPrice,
                item.MRP,
                item.Price,
                item.supplier,
                item.stockQty
            ]);

            // Add table
            autoTable(doc, {
                startY: 35,
                head: [['No', 'Product ID', 'Product Name', 'Unit', 'Cost Price', 'MRP', 'Price', 'Supplier', 'Stock']],
                body: tableData,
                theme: 'grid',
                headStyles: {
                    fillColor: [239, 68, 68],
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
                    2: { cellWidth: 35 },
                    3: { cellWidth: 15 },
                    4: { cellWidth: 20 },
                    5: { cellWidth: 20 },
                    6: { cellWidth: 20 },
                    7: { cellWidth: 30 },
                    8: { cellWidth: 15 }
                }
            });

            const timestamp = new Date().toISOString().split('T')[0];
            doc.save(`Out_Of_Stock_${timestamp}.pdf`);
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
        loadOutOfStockData();
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
                    toast.success(`Selected: ${selectedItem.productName} (ID: ${selectedItem.productID})`);
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
                        <span className="text-gray-700 font-medium">Out of Stock</span>
                    </div>
                    <h1 className="text-3xl font-semibold bg-gradient-to-r from-gray-800 to-gray-600 bg-clip-text text-transparent">
                        Out of Stock
                    </h1>
                </div>

                {/* Stats Cards */}
                <div className={'grid md:grid-cols-4 grid-cols-1 gap-4'}>
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
                                    <div className={`flex items-center gap-0.5 text-[10px] font-semibold ${stat.trend.startsWith('+') || stat.trend.startsWith('-') ? stat.trend.startsWith('+') ? 'text-red-600' : 'text-emerald-600' : 'text-gray-600'}`}>
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
                    <div className={'grid md:grid-cols-4 gap-4'}>
                        <div>
                            <label htmlFor="product" className="block text-sm font-medium text-gray-700 mb-1">
                                Product
                            </label>
                            <TypeableSelect
                                options={products}
                                value={selectedProduct}
                                onChange={(opt) => setSelectedProduct(opt?.value as string || null)}
                                placeholder={isLoadingDropdowns ? "Loading..." : "Search product..."}
                                disabled={isLoadingDropdowns}
                            />
                        </div>
                        <div>
                            <label htmlFor="category" className="block text-sm font-medium text-gray-700 mb-1">
                                Category
                            </label>
                            <TypeableSelect
                                options={categories}
                                value={selectedCategory}
                                onChange={(opt) => setSelectedCategory(opt?.value as string || null)}
                                placeholder={isLoadingDropdowns ? "Loading..." : "Search categories..."}
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
                                placeholder={isLoadingDropdowns ? "Loading..." : "Search suppliers..."}
                                disabled={isLoadingDropdowns}
                            />
                        </div>
                        <div className={'grid grid-cols-2 md:items-end items-start gap-2 text-white font-medium'}>
                            <button
                                onClick={handleSearch}
                                disabled={isLoadingStock}
                                className={'bg-gradient-to-r from-red-500 to-red-600 hover:from-red-600 hover:to-red-700 py-2 rounded-lg flex items-center justify-center shadow-lg shadow-red-200 hover:shadow-xl transition-all disabled:opacity-50 disabled:cursor-not-allowed'}>
                                <SearchCheck className="mr-2" size={14} />Search
                            </button>
                            <button
                                onClick={handleClear}
                                disabled={isLoadingStock}
                                className={'bg-gradient-to-r from-gray-500 to-gray-600 hover:from-gray-600 hover:to-gray-700 py-2 rounded-lg flex items-center justify-center shadow-lg shadow-gray-200 hover:shadow-xl transition-all disabled:opacity-50 disabled:cursor-not-allowed'}>
                                <RefreshCw className="mr-2" size={14} />Clear
                            </button>
                        </div>
                    </div>
                </div>

                {/* Stock Table */}
                <div
                    className={'flex flex-col bg-white rounded-xl h-full p-4 justify-between shadow-lg'}
                >
                    <div className="overflow-y-auto max-h-md md:h-[320px] lg:h-[500px] rounded-lg scrollbar-thin scrollbar-thumb-red-300 scrollbar-track-gray-100">
                        <table className="min-w-full divide-y divide-gray-200">
                            <thead className="bg-gradient-to-r from-red-500 to-red-600 sticky top-0 z-10">
                                <tr>
                                    {[
                                        'Product ID',
                                        'Product Name',
                                        'Unit',
                                        'Cost Price',
                                        'MRP',
                                        'Price',
                                        'Supplier',
                                        'Stock'
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
                                {isLoadingStock ? (
                                    <tr>
                                        <td colSpan={8} className="px-6 py-8 text-center text-gray-500">
                                            Loading out-of-stock items...
                                        </td>
                                    </tr>
                                ) : currentStockData.length === 0 ? (
                                    <tr>
                                        <td colSpan={8} className="px-6 py-8 text-center text-gray-500">
                                            No out of stock items found
                                        </td>
                                    </tr>
                                ) : (
                                    currentStockData.map((item, index) => (
                                        <tr
                                            key={`${item.productID}-${currentPage}-${index}`}
                                            onClick={() => setSelectedIndex(index)}
                                            className={`cursor-pointer transition-all ${selectedIndex === index
                                                    ? 'bg-red-50 border-l-4 border-l-red-500'
                                                    : 'hover:bg-gray-50'
                                                }`}
                                        >
                                            <td className="px-6 py-2 whitespace-nowrap text-sm font-semibold text-gray-800">
                                                {item.productID}
                                            </td>
                                            <td className="px-6 py-2 whitespace-nowrap text-sm font-medium text-gray-700">
                                                {item.productName}
                                            </td>
                                            <td className="px-6 py-2 whitespace-nowrap text-sm text-gray-600">
                                                {item.unit}
                                            </td>
                                            <td className="px-6 py-2 whitespace-nowrap text-sm font-medium text-blue-600">
                                                {item.costPrice}
                                            </td>
                                            <td className="px-6 py-2 whitespace-nowrap text-sm font-medium text-gray-600">
                                                {item.MRP}
                                            </td>
                                            <td className="px-6 py-2 whitespace-nowrap text-sm font-bold text-emerald-600">
                                                {item.Price}
                                            </td>
                                            <td className="px-6 py-2 whitespace-nowrap text-sm text-gray-600">
                                                {item.supplier}
                                            </td>
                                            <td className="px-6 py-2 whitespace-nowrap">
                                                <span className="px-3 py-1 text-xs font-semibold rounded-full bg-gradient-to-r from-red-100 to-red-200 text-red-800 flex items-center gap-1 w-fit">
                                                    <AlertTriangle className="w-3 h-3" />
                                                    {item.stockQty}
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
                            <span className="font-semibold text-gray-800">{Math.min(endIndex, stockData.length)}</span> of{' '}
                            <span className="font-semibold text-gray-800">{stockData.length}</span> results
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
        </>
    );
}

export default OutOfStock;