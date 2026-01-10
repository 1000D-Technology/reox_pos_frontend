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
} from "lucide-react";
import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import TypeableSelect from "../../../components/TypeableSelect.tsx";
import { stockService } from "../../../services/stockService.ts";
import toast, { Toaster } from 'react-hot-toast';

function StockList() {
    const summaryCards = [
        {
            icon: Package,
            label: 'Total Products',
            value: '1,245',
            trend: '+12%',
            color: 'bg-gradient-to-br from-emerald-400 to-emerald-500',
            iconColor: 'text-white',
            bgGlow: 'shadow-emerald-200'
        },
        {
            icon: DollarSign,
            label: 'Total Value',
            value: 'LKR 2,540,250.00',
            trend: '+8%',
            color: 'bg-gradient-to-br from-purple-400 to-purple-500',
            iconColor: 'text-white',
            bgGlow: 'shadow-purple-200'
        },
        {
            icon: TrendingUp,
            label: 'Low Stock Items',
            value: '23',
            trend: '-5%',
            color: 'bg-gradient-to-br from-red-400 to-red-500',
            iconColor: 'text-white',
            bgGlow: 'shadow-red-200'
        },
        {
            icon: Users,
            label: 'Total Suppliers',
            value: '45',
            trend: '+3%',
            color: 'bg-gradient-to-br from-blue-400 to-blue-500',
            iconColor: 'text-white',
            bgGlow: 'shadow-blue-200'
        },
        {
            icon: ShoppingCart,
            label: 'Categories',
            value: '12',
            trend: '+2%',
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
    
    // Dropdown options state
    const [suppliers, setSuppliers] = useState<SelectOption[]>([]);
    const [units, setUnits] = useState<SelectOption[]>([]);
    const [categories, setCategories] = useState<SelectOption[]>([]);
    const [isLoadingDropdowns, setIsLoadingDropdowns] = useState(false);

    // Load stock data
    const loadStockData = async () => {
        setIsLoadingStock(true);
        try {
            const response = await stockService.getStockList();
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

    // Load all dropdown data
    const loadDropdownData = async () => {
        setIsLoadingDropdowns(true);
        try {
            const [categoriesResponse, unitsResponse, suppliersResponse] = await stockService.getStockFilterData();

            // Transform categories
            if (categoriesResponse.data?.success) {
                const categoryOptions = categoriesResponse.data.data.map((category: any) => ({
                    value: category.id.toString(),
                    label: category.name || category.category_name
                }));
                setCategories(categoryOptions);
            }

            // Transform units
            if (unitsResponse.data?.success) {
                const unitOptions = unitsResponse.data.data.map((unit: any) => ({
                    value: unit.id.toString(),
                    label: unit.name || unit.unit_name
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

    // Refresh all data
    const handleRefresh = async () => {
        await Promise.all([loadDropdownData(), loadStockData()]);
        toast.success('Data refreshed successfully');
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
    }, []);

    useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            if (e.key === "ArrowDown") {
                e.preventDefault();
                setSelectedIndex((prev) => (prev < currentStockData.length - 1 ? prev + 1 : prev));
            } else if (e.key === "ArrowUp") {
                e.preventDefault();
                setSelectedIndex((prev) => (prev > 0 ? prev - 1 : prev));
            }
        };

        window.addEventListener("keydown", handleKeyDown);
        return () => window.removeEventListener("keydown", handleKeyDown);
    }, [currentStockData.length]);

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
                        <motion.div
                            key={i}
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: i * 0.1 }}
                            whileHover={{ scale: 1.05, y: -2 }}
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
                        </motion.div>
                    ))}
                </div>

                {/* Filter Section */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.6 }}
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
                                placeholder="Enter Product ID or Name..."
                                className="w-full text-sm rounded-lg py-2 px-3 border-2 border-gray-200 focus:border-emerald-400 focus:outline-none transition-all"
                            />
                        </div>
                        <div className={'grid grid-cols-2 md:items-end items-start gap-2 text-white font-medium'}>
                            <button className={'bg-gradient-to-r from-emerald-500 to-emerald-600 hover:from-emerald-600 hover:to-emerald-700 py-2 rounded-lg flex items-center justify-center shadow-lg shadow-emerald-200 hover:shadow-xl transition-all'}>
                                <SearchCheck className="mr-2" size={14} />Search
                            </button>
                            <button 
                                onClick={handleRefresh}
                                disabled={isLoadingDropdowns || isLoadingStock}
                                className={'bg-gradient-to-r from-gray-500 to-gray-600 hover:from-gray-600 hover:to-gray-700 py-2 rounded-lg flex items-center justify-center shadow-lg shadow-gray-200 hover:shadow-xl transition-all disabled:opacity-50 disabled:cursor-not-allowed'}>
                                <RefreshCw className={`mr-2 ${(isLoadingDropdowns || isLoadingStock) ? 'animate-spin' : ''}`} size={14} />
                                {(isLoadingDropdowns || isLoadingStock) ? 'Refreshing...' : 'Refresh'}
                            </button>
                        </div>
                    </div>
                </motion.div>

                {/* Stock Table */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.7 }}
                    className={'flex flex-col bg-white rounded-xl h-full p-4 justify-between shadow-lg'}
                >
                    <div className="overflow-y-auto max-h-md md:h-[320px] lg:h-[500px] rounded-lg scrollbar-thin scrollbar-thumb-emerald-300 scrollbar-track-gray-100">
                        <table className="min-w-full divide-y divide-gray-200">
                            <thead className="bg-gradient-to-r from-emerald-500 to-emerald-600 sticky top-0 z-10">
                            <tr>
                                {[
                                    'Product ID',
                                    'Product Name',
                                    'Unit',
                                    'Discount',
                                    'Cost Price',
                                    'MRP',
                                    'Selling Price',
                                    'Supplier',
                                    'Stock QTY',
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
                                    <td colSpan={9} className="px-6 py-8 text-center text-gray-500">
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
                                            {sale.productID}
                                        </td>
                                        <td className="px-6 py-2 whitespace-nowrap text-sm font-medium text-gray-700">
                                            {sale.productName}
                                        </td>
                                        <td className="px-6 py-2 whitespace-nowrap text-sm text-gray-600">
                                            {sale.unit}
                                        </td>
                                        <td className="px-6 py-2 whitespace-nowrap text-sm font-medium text-purple-600">
                                            LKR {sale.discountAmount}
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
                                                <span className={`px-3 py-1 text-xs font-semibold rounded-full ${
                                                    parseInt(sale.stockQty) < 30
                                                        ? 'bg-gradient-to-r from-red-100 to-red-200 text-red-800'
                                                        : 'bg-gradient-to-r from-emerald-100 to-emerald-200 text-emerald-800'
                                                }`}>
                                                    {sale.stockQty}
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
                                className={`flex items-center px-3 py-2 text-sm font-medium rounded-lg transition-all ${
                                    currentPage === 1
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
                                        className={`px-4 py-2 text-sm font-semibold rounded-lg transition-all ${
                                            currentPage === page
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
                                className={`flex items-center px-3 py-2 text-sm font-medium rounded-lg transition-all ${
                                    currentPage === totalPages
                                        ? 'text-gray-400 cursor-not-allowed'
                                        : 'text-gray-600 hover:text-emerald-600 hover:bg-emerald-50'
                                }`}
                            >
                                Next <ChevronRight className="ml-2 h-5 w-5" />
                            </button>
                        </div>
                    </nav>
                </motion.div>

                {/* Export Buttons */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.8 }}
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
                </motion.div>
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

export default StockList;