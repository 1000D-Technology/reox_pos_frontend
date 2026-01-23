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

    // Load damaged table data
    useEffect(() => {
        loadDamagedTableData();
    }, []);

    useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            const target = e.target as HTMLElement;
            const isInput = target.tagName === 'INPUT' || target.tagName === 'TEXTAREA';

            // F2 to focus search input (fromDate)
            if (e.key === 'F2') {
                e.preventDefault();
                const searchInput = document.getElementById('filter-category');
                if (searchInput) {
                    searchInput.focus();
                }
                return;
            }

            // Arrow keys for navigation
            if (e.key === "ArrowDown") {
                e.preventDefault();
                setSelectedIndex((prev) => {
                    const nextIndex = prev < currentSalesData.length - 1 ? prev + 1 : prev;
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
                    setSelectedIndex(currentSalesData.length - 1);
                }
            } else if (e.key === "Enter") {
                if (!isInput && currentSalesData.length > 0) {
                    e.preventDefault();
                    const selectedItem = currentSalesData[selectedIndex];
                    if (selectedItem) {
                        handleRowDoubleClick(selectedItem);
                    }
                }
            }
        };

        window.addEventListener("keydown", handleKeyDown);
        return () => window.removeEventListener("keydown", handleKeyDown);
    }, [currentSalesData, selectedIndex, currentPage, totalPages]);

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

    const handleStatusChange = async (recordId: string, newStatusId: string) => {
        try {
            const response = await stockService.updateDamagedStatus(recordId, newStatusId);
            if (response.data?.success) {
                toast.success('Status updated successfully');
                loadDamagedTableData(); // Refresh table
                loadSummaryData(); // Refresh summary cards as well
            } else {
                toast.error('Failed to update status');
            }
        } catch (error) {
            console.error('Error updating status:', error);
            toast.error('Failed to update status');
        }
    };

    const handleRowDoubleClick = (record: any) => {
        setSelectedDetailRecord(record);
        setIsDetailModalOpen(true);
    };

    // Export to Excel
    const handleExportExcel = () => {
        try {
            const exportData = salesData.map((item, index) => ({
                'No': index + 1,
                'Product ID': item.productId,
                'Product Name': item.productName,
                'Unit': item.unit,
                'Cost Price': item.costPrice,
                'MRP': item.mrp,
                'Selling Price': item.price,
                'Supplier': item.supplier || 'N/A',
                'Stock': item.stock,
                'Damaged Qty': item.damagedQty,
                'Reason': item.reason,
                'Status': item.status,
                'Date & Time': item.date ? `${new Date(item.date).toLocaleDateString()} ${new Date(item.date).toLocaleTimeString()}` : 'N/A',
                'Description': item.description || ''
            }));

            const ws = XLSX.utils.json_to_sheet(exportData);
            const wb = XLSX.utils.book_new();
            XLSX.utils.book_append_sheet(wb, ws, 'Damaged Stock');

            const timestamp = new Date().toISOString().split('T')[0];
            XLSX.writeFile(wb, `Damaged_Stock_Report_${timestamp}.xlsx`);
            toast.success('Excel file exported successfully');
        } catch (error) {
            console.error('Error exporting Excel:', error);
            toast.error('Failed to export Excel file');
        }
    };

    // Export to CSV
    const handleExportCSV = () => {
        try {
            const headers = ['No', 'Product ID', 'Product Name', 'Unit', 'Cost Price', 'MRP', 'Selling Price', 'Supplier', 'Stock', 'Damaged Qty', 'Reason', 'Status', 'Date & Time', 'Description'];
            const csvData = salesData.map((item, index) => [
                index + 1,
                item.productId,
                item.productName,
                item.unit,
                item.costPrice,
                item.mrp,
                item.price,
                item.supplier || 'N/A',
                item.stock,
                item.damagedQty,
                item.reason,
                item.status,
                item.date ? `${new Date(item.date).toLocaleDateString()} ${new Date(item.date).toLocaleTimeString()}` : 'N/A',
                item.description || ''
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
            link.setAttribute('download', `Damaged_Stock_Report_${timestamp}.csv`);
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
            const doc = new jsPDF('l', 'mm', 'a4'); // Landscape orientation

            // Add title
            doc.setFontSize(18);
            doc.setTextColor(239, 68, 68); // Red color
            doc.text('Damaged Stock Report', 14, 22);

            // Add date
            doc.setFontSize(10);
            doc.setTextColor(100);
            doc.text(`Generated on: ${new Date().toLocaleString()}`, 14, 30);

            // Prepare table data
            const tableData = salesData.map((item, index) => [
                index + 1,
                item.productId,
                item.productName,
                item.unit,
                item.costPrice,
                item.price,
                item.supplier || 'N/A',
                item.stock,
                item.damagedQty,
                item.reason,
                item.status,
                item.date ? `${new Date(item.date).toLocaleDateString()} ${new Date(item.date).toLocaleTimeString()}` : 'N/A',
                item.description || ''
            ]);

            // Add table
            autoTable(doc, {
                startY: 35,
                head: [['No', 'ID', 'Product', 'Unit', 'Cost', 'Price', 'Supplier', 'Stock', 'Qty', 'Reason', 'Status', 'Date & Time', 'Description']],
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
                }
            });

            const timestamp = new Date().toISOString().split('T')[0];
            doc.save(`Damaged_Stock_Report_${timestamp}.pdf`);
            toast.success('PDF file exported successfully');
        } catch (error) {
            console.error('Error exporting PDF:', error);
            toast.error('Failed to export PDF file');
        }
    };

    return (
        <div className={'flex flex-col gap-4 h-full'}>
            {/* Header */}
            <div className="flex items-center justify-between">
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

                {/* Shortcuts Hint */}
                <div className="hidden lg:flex items-center gap-3 bg-white px-4 py-2 rounded-xl border border-gray-100 shadow-sm border-b-2">
                    <div className="flex items-center gap-1.5 px-2 py-1 bg-gray-50 rounded-lg border border-gray-200">
                        <span className="text-[10px] font-black text-gray-500 bg-white px-1.5 py-0.5 rounded shadow-sm border border-gray-200">↑↓</span>
                        <span className="text-[10px] font-bold text-gray-400 uppercase tracking-tight">Navigate</span>
                    </div>
                    <div className="flex items-center gap-1.5 px-2 py-1 bg-gray-50 rounded-lg border border-gray-200">
                        <span className="text-[10px] font-black text-gray-500 bg-white px-1.5 py-0.5 rounded shadow-sm border border-gray-200">Enter</span>
                        <span className="text-[10px] font-bold text-gray-400 uppercase tracking-tight">Details</span>
                    </div>
                    <div className="flex items-center gap-1.5 px-2 py-1 bg-gray-50 rounded-lg border border-gray-200">
                        <span className="text-[10px] font-black text-gray-500 bg-white px-1.5 py-0.5 rounded shadow-sm border border-gray-200">F2</span>
                        <span className="text-[10px] font-bold text-gray-400 uppercase tracking-tight">Filters</span>
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
                        <div className="absolute inset-0 bg-gradient-to-br from-transparent via-gray-50/50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>

                        <div className={`p-3 rounded-full ${stat.color} shadow-sm relative z-10`}>
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
                className={'bg-white rounded-xl p-4 flex flex-col border border-gray-200'}
            >
                <h2 className="text-xl font-semibold text-gray-700 mb-3">Filter</h2>
                <div className={'grid md:grid-cols-5 gap-4'}>
                    <div>
                        <label htmlFor="category" className="block text-sm font-medium text-gray-700 mb-1">
                            Category
                        </label>
                        <TypeableSelect
                            id="filter-category"
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
                    <div className={'col-span-2 grid grid-cols-2 items-end gap-2 text-white font-medium'}>
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
                className={'flex flex-col bg-white rounded-xl h-full p-4 justify-between border border-gray-200'}
            >
                <div className="overflow-y-auto max-h-md md:h-[320px] lg:h-[500px] rounded-lg scrollbar-thin scrollbar-thumb-red-300 scrollbar-track-gray-100">
                    <table className="min-w-full divide-y divide-gray-200">
                        <thead className="bg-gradient-to-r from-red-500 to-red-600 sticky top-0 z-10">
                            <tr>
                                {['Product ID', 'Product Name', 'Unit', 'Cost Price', 'MRP', 'Price', 'Supplier', 'Stock', 'Damaged Qty', 'Reason', 'Status', 'Date & Time'].map((header, i, arr) => (
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
                                    <td colSpan={12} className="px-6 py-8 text-center text-gray-500">
                                        No damaged stock records found
                                    </td>
                                </tr>
                            ) : (
                                currentSalesData.map((sale, index) => (
                                    <tr
                                        key={index}
                                        onClick={() => setSelectedIndex(index)}
                                        onDoubleClick={() => handleRowDoubleClick(sale)}
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
                                            <select
                                                value={status.find(s => s.label === sale.status)?.value || ''}
                                                onChange={(e) => handleStatusChange(sale.id, e.target.value)}
                                                className={`px-2 py-1 text-xs font-semibold rounded-full border-none focus:ring-2 focus:ring-red-400 cursor-pointer transition-all outline-none ${sale.status === 'Damaged' ? 'bg-red-100 text-red-800' :
                                                        sale.status === 'Pending Review' ? 'bg-yellow-100 text-yellow-800' :
                                                            sale.status === 'Under Review' ? 'bg-yellow-100 text-yellow-800' :
                                                                sale.status === 'Disposed' ? 'bg-gray-100 text-gray-800' :
                                                                    'bg-blue-100 text-blue-800'
                                                    }`}
                                            >
                                                {status.map((statusOption) => (
                                                    <option key={statusOption.value} value={statusOption.value} className="bg-white text-gray-800">
                                                        {statusOption.label}
                                                    </option>
                                                ))}
                                            </select>
                                        </td>
                                        <td className="px-6 py-2 whitespace-nowrap text-sm text-gray-600">
                                            {sale.date ? (
                                                <div className="flex flex-col">
                                                    <span className="font-medium">{new Date(sale.date).toLocaleDateString()}</span>
                                                    <span className="text-[10px] text-gray-400">{new Date(sale.date).toLocaleTimeString()}</span>
                                                </div>
                                            ) : 'N/A'}
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
                className={'bg-white flex justify-center p-4 gap-4 rounded-xl border border-gray-200'}
            >
                <button 
                    onClick={handleExportExcel}
                    className={'bg-gradient-to-r from-emerald-500 to-emerald-600 hover:from-emerald-600 hover:to-emerald-700 px-6 py-2 font-medium text-white rounded-lg flex gap-2 items-center shadow-lg shadow-emerald-200 hover:shadow-xl transition-all active:scale-95'}
                >
                    <FileText size={15} />Excel
                </button>
                <button 
                    onClick={handleExportCSV}
                    className={'bg-gradient-to-r from-yellow-500 to-yellow-600 hover:from-yellow-600 hover:to-yellow-700 px-6 py-2 font-medium text-white rounded-lg flex gap-2 items-center shadow-lg shadow-yellow-200 hover:shadow-xl transition-all active:scale-95'}
                >
                    <FileText size={15} />CSV
                </button>
                <button 
                    onClick={handleExportPDF}
                    className={'bg-gradient-to-r from-red-500 to-red-600 hover:from-red-600 hover:to-red-700 px-6 py-2 font-medium text-white rounded-lg flex gap-2 items-center shadow-lg shadow-red-200 hover:shadow-xl transition-all active:scale-95'}
                >
                    <FileText size={15} />PDF
                </button>
            </div>

            {/* Detail Modal */}
            {isDetailModalOpen && selectedDetailRecord && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
                    <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl overflow-hidden animate-in zoom-in-95 duration-200">
                        {/* Modal Header */}
                        <div className="bg-gradient-to-r from-red-500 to-red-600 px-6 py-4 flex items-center justify-between">
                            <h3 className="text-xl font-bold text-white flex items-center gap-2">
                                <AlertTriangle className="w-6 h-6" />
                                Damaged Record Details
                            </h3>
                            <button 
                                onClick={() => setIsDetailModalOpen(false)}
                                className="p-1.5 hover:bg-white/20 rounded-full transition-colors text-white"
                            >
                                <X size={20} />
                            </button>
                        </div>

                        {/* Modal Content */}
                        <div className="p-6 max-h-[80vh] overflow-y-auto custom-scrollbar">
                            <div className="grid grid-cols-2 gap-6">
                                {/* Product Section */}
                                <div className="space-y-4">
                                    <div>
                                        <h4 className="text-xs font-bold uppercase tracking-wider text-gray-400 mb-2">Product Information</h4>
                                        <div className="bg-gray-50 rounded-xl p-4 border border-gray-100 space-y-3">
                                            <div>
                                                <p className="text-[10px] text-gray-500 uppercase font-bold">Product ID</p>
                                                <p className="text-sm font-semibold text-gray-800">{selectedDetailRecord.productId}</p>
                                            </div>
                                            <div>
                                                <p className="text-[10px] text-gray-500 uppercase font-bold">Product Name</p>
                                                <p className="text-sm font-semibold text-gray-800">{selectedDetailRecord.productName}</p>
                                            </div>
                                            <div>
                                                <p className="text-[10px] text-gray-500 uppercase font-bold">Unit Type</p>
                                                <p className="text-sm font-semibold text-gray-800">{selectedDetailRecord.unit}</p>
                                            </div>
                                        </div>
                                    </div>

                                    <div>
                                        <h4 className="text-xs font-bold uppercase tracking-wider text-gray-400 mb-2">Stock Details</h4>
                                        <div className="bg-gray-50 rounded-xl p-4 border border-gray-100 space-y-3">
                                            <div>
                                                <p className="text-[10px] text-gray-500 uppercase font-bold">Batch/Stock Info</p>
                                                <p className="text-sm font-semibold text-gray-800">{selectedDetailRecord.stock}</p>
                                            </div>
                                            <div>
                                                <p className="text-[10px] text-gray-500 uppercase font-bold">Supplier</p>
                                                <p className="text-sm font-semibold text-gray-800">{selectedDetailRecord.supplier}</p>
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                {/* Damage Section */}
                                <div className="space-y-4">
                                    <div>
                                        <h4 className="text-xs font-bold uppercase tracking-wider text-gray-400 mb-2">Damage Information</h4>
                                        <div className="bg-red-50/30 rounded-xl p-4 border border-red-100 space-y-3">
                                            <div>
                                                <p className="text-[10px] text-red-500 uppercase font-bold">Damaged Quantity</p>
                                                <p className="text-lg font-bold text-red-600">{selectedDetailRecord.damagedQty}</p>
                                            </div>
                                            <div>
                                                <p className="text-[10px] text-gray-500 uppercase font-bold">Reason</p>
                                                <p className="text-sm font-semibold text-gray-800">{selectedDetailRecord.reason}</p>
                                            </div>
                                            <div>
                                                <p className="text-[10px] text-gray-500 uppercase font-bold">Date of Record</p>
                                                <p className="text-sm font-semibold text-gray-800">
                                                    {new Date(selectedDetailRecord.date).toLocaleDateString()} {new Date(selectedDetailRecord.date).toLocaleTimeString()}
                                                </p>
                                            </div>
                                        </div>
                                    </div>

                                    <div>
                                        <h4 className="text-xs font-bold uppercase tracking-wider text-gray-400 mb-2">Pricing (At Time of Record)</h4>
                                        <div className="bg-gray-50 rounded-xl p-4 border border-gray-100 grid grid-cols-2 gap-3">
                                            <div>
                                                <p className="text-[10px] text-gray-500 uppercase font-bold">Cost Price</p>
                                                <p className="text-sm font-semibold text-blue-600">LKR {selectedDetailRecord.costPrice}</p>
                                            </div>
                                            <div>
                                                <p className="text-[10px] text-gray-500 uppercase font-bold">Selling Price</p>
                                                <p className="text-sm font-semibold text-emerald-600">LKR {selectedDetailRecord.price}</p>
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                {/* Full Width Description */}
                                <div className="col-span-2">
                                    <h4 className="text-xs font-bold uppercase tracking-wider text-gray-400 mb-2">Notes / Description</h4>
                                    <div className="bg-gray-50 rounded-xl p-4 border border-gray-100 min-h-[80px]">
                                        <p className="text-sm text-gray-600 italic">
                                            {selectedDetailRecord.description || 'No additional notes provided for this record.'}
                                        </p>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Modal Footer */}
                        <div className="bg-gray-50 px-6 py-4 flex justify-end">
                            <button 
                                onClick={() => setIsDetailModalOpen(false)}
                                className="px-6 py-2 bg-gray-200 hover:bg-gray-300 text-gray-700 font-bold rounded-xl transition-all active:scale-95"
                            >
                                Close
                            </button>
                        </div>
                    </div>
                </div>
            )}

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