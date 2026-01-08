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
    Users,
    ShoppingCart,
    ArrowUpRight,
    ArrowDownRight,
} from "lucide-react";
import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import TypeableSelect from "../../../components/TypeableSelect.tsx";

function LowStock() {
    const summaryCards = [
        {
            icon: AlertCircle,
            label: 'Low Stock Items',
            value: '23',
            trend: '+5',
            color: 'bg-gradient-to-br from-orange-400 to-orange-500',
            iconColor: 'text-white',
            bgGlow: 'shadow-orange-200'
        },
        {
            icon: Package,
            label: 'Total Products',
            value: '1,245',
            trend: '+12%',
            color: 'bg-gradient-to-br from-purple-400 to-purple-500',
            iconColor: 'text-white',
            bgGlow: 'shadow-purple-200'
        },
        {
            icon: DollarSign,
            label: 'Potential Loss',
            value: 'LKR 340,250.00',
            trend: '+18%',
            color: 'bg-gradient-to-br from-red-400 to-red-500',
            iconColor: 'text-white',
            bgGlow: 'shadow-red-200'
        },
        {
            icon: TrendingDown,
            label: 'Below Threshold',
            value: '15',
            trend: '+3',
            color: 'bg-gradient-to-br from-yellow-400 to-yellow-500',
            iconColor: 'text-white',
            bgGlow: 'shadow-yellow-200'
        },
        {
            icon: ShoppingCart,
            label: 'Reorder Required',
            value: '8',
            trend: '+2',
            color: 'bg-gradient-to-br from-blue-400 to-blue-500',
            iconColor: 'text-white',
            bgGlow: 'shadow-blue-200'
        },
    ];

    const salesData = [
        {
            productID: '250929003',
            productName: 'Patha ala',
            unit: 'kg',
            discountAmount: '0.00',
            costPrice: '1050.00',
            MRP: '1050.00',
            Price: '1050.00',
            supplier: 'Bimalsha kostha',
            stockQty: '15',
        },
        {
            productID: '250929004',
            productName: 'White Sugar',
            unit: 'kg',
            discountAmount: '50.00',
            costPrice: '175.00',
            MRP: '225.00',
            Price: '210.00',
            supplier: 'Global Foods Ltd',
            stockQty: '8',
        },
        {
            productID: '250929005',
            productName: 'Brown Rice',
            unit: 'kg',
            discountAmount: '0.00',
            costPrice: '220.00',
            MRP: '270.00',
            Price: '270.00',
            supplier: 'Organic Farms Inc',
            stockQty: '12',
        },
    ];

    type SelectOption = {
        value: string;
        label: string;
    };

    const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
    const [selectedUnit, setSelectedUnit] = useState<string | null>(null);
    const [selectedSupplier, setSelectedSupplier] = useState<string | null>(null);
    const [selectedProduct, setSelectedProduct] = useState<string | null>(null);

    const suppliers = [
        { value: 'frank', label: 'Frank Traders' },
        { value: 'elsa', label: 'Elsa Exports' },
        { value: 'saman', label: 'Saman Silva' },
        { value: 'kumara', label: 'Kumara Stores' },
        { value: 'bimalsha', label: 'Bimalsha kostha' },
    ];

    const units = [
        { value: 'kg', label: 'Kilogram' },
        { value: 'ltr', label: 'Litre' },
        { value: 'pcs', label: 'Pieces' },
    ];

    const categories = [
        { value: 'grocery', label: 'Grocery' },
        { value: 'beverages', label: 'Beverages' },
        { value: 'snacks', label: 'Snacks' },
    ];

    const productSearch = [
        { value: 'product1', label: 'Patha ala' },
        { value: 'product2', label: 'White Sugar' },
        { value: 'product3', label: 'Brown Rice' },
    ];

    const [selectedIndex, setSelectedIndex] = useState(0);
    const [currentPage, setCurrentPage] = useState(1);
    const [itemsPerPage] = useState(10);

    const totalPages = Math.ceil(salesData.length / itemsPerPage);
    const startIndex = (currentPage - 1) * itemsPerPage;
    const endIndex = startIndex + itemsPerPage;
    const currentSalesData = salesData.slice(startIndex, endIndex);

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
                                <div className={`flex items-center gap-0.5 text-[10px] font-semibold ${stat.trend.startsWith('+') ? 'text-red-600' : stat.trend.startsWith('-') ? 'text-emerald-600' : 'text-gray-600'}`}>
                                    {stat.trend.startsWith('+') ? <ArrowUpRight className="w-3 h-3" /> : stat.trend.startsWith('-') ? <ArrowDownRight className="w-3 h-3" /> : null}
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
                            placeholder="Search categories..."
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
                            placeholder="Search units..."
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
                            placeholder="Search suppliers..."
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
                            placeholder="Search products..."
                        />
                    </div>
                    <div className={'grid grid-cols-2 md:items-end items-start gap-2 text-white font-medium'}>
                        <button className={'bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 py-2 rounded-lg flex items-center justify-center shadow-lg shadow-orange-200 hover:shadow-xl transition-all'}>
                            <SearchCheck className="mr-2" size={14} />Search
                        </button>
                        <button onClick={handleClearFilters} className={'bg-gradient-to-r from-gray-500 to-gray-600 hover:from-gray-600 hover:to-gray-700 py-2 rounded-lg flex items-center justify-center shadow-lg shadow-gray-200 hover:shadow-xl transition-all'}>
                            <RefreshCw className="mr-2" size={14} />Clear
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
                <div className="overflow-y-auto max-h-md md:h-[320px] lg:h-[500px] rounded-lg scrollbar-thin scrollbar-thumb-orange-300 scrollbar-track-gray-100">
                    <table className="min-w-full divide-y divide-gray-200">
                        <thead className="bg-gradient-to-r from-orange-500 to-orange-600 sticky top-0 z-10">
                        <tr>
                            {['Product ID', 'Product Name', 'Unit', 'Discount', 'Cost Price', 'MRP', 'Price', 'Supplier', 'Stock Status'].map((header, i, arr) => (
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
                        {currentSalesData.length === 0 ? (
                            <tr>
                                <td colSpan={9} className="px-6 py-8 text-center text-gray-500">
                                    No low stock items found
                                </td>
                            </tr>
                        ) : (
                            currentSalesData.map((sale, index) => {
                                const stockStatus = getStockStatus(sale.stockQty);
                                return (
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
                                            <div className="flex items-center gap-2">
                                                    <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold border ${stockStatus.color}`}>
                                                        <AlertCircle className="w-3 h-3 mr-1" />
                                                        {sale.stockQty} units - {stockStatus.label}
                                                    </span>
                                            </div>
                                        </td>
                                    </tr>
                                );
                            })
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
    );
}

export default LowStock;