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
import { motion } from "framer-motion";
import TypeableSelect from "../../../components/TypeableSelect.tsx";

function OutOfStock() {
    const summaryCards = [
        {
            icon: AlertTriangle,
            label: 'Out of Stock Items',
            value: '5',
            trend: '+2',
            color: 'bg-gradient-to-br from-red-400 to-red-500',
            iconColor: 'text-white',
            bgGlow: 'shadow-red-200'
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
            label: 'Lost Revenue',
            value: 'LKR 85,400.00',
            trend: '+15%',
            color: 'bg-gradient-to-br from-yellow-400 to-yellow-500',
            iconColor: 'text-white',
            bgGlow: 'shadow-yellow-200'
        },
        {
            icon: TrendingDown,
            label: 'Avg. Days Out',
            value: '3.5',
            trend: '-8%',
            color: 'bg-gradient-to-br from-blue-400 to-blue-500',
            iconColor: 'text-white',
            bgGlow: 'shadow-blue-200'
        },
        {
            icon: Users,
            label: 'Affected Suppliers',
            value: '12',
            trend: '+5%',
            color: 'bg-gradient-to-br from-emerald-400 to-emerald-500',
            iconColor: 'text-white',
            bgGlow: 'shadow-emerald-200'
        },
    ];

    const stockData = [
        {
            productId: "P-1001",
            productName: "White Sugar",
            unit: "kg",
            discountAmount: "50.00",
            costPrice: "175.00",
            mrp: "225.00",
            price: "210.00",
            supplier: "Global Foods Ltd",
            stock: "0"
        },
        {
            productId: "P-1002",
            productName: "Brown Rice",
            unit: "kg",
            discountAmount: "0.00",
            costPrice: "220.00",
            mrp: "270.00",
            price: "270.00",
            supplier: "Organic Farms Inc",
            stock: "0"
        },
        {
            productId: "P-1003",
            productName: "Wheat Flour",
            unit: "kg",
            discountAmount: "20.00",
            costPrice: "130.00",
            mrp: "160.00",
            price: "140.00",
            supplier: "National Mills",
            stock: "0"
        },
        {
            productId: "P-1004",
            productName: "Vegetable Oil",
            unit: "L",
            discountAmount: "0.00",
            costPrice: "350.00",
            mrp: "420.00",
            price: "420.00",
            supplier: "Sunshine Products",
            stock: "0"
        },
        {
            productId: "P-1005",
            productName: "Black Pepper",
            unit: "g",
            discountAmount: "15.00",
            costPrice: "80.00",
            mrp: "120.00",
            price: "105.00",
            supplier: "Spice World",
            stock: "0"
        }
    ];

    type SelectOption = {
        value: string;
        label: string;
    };

    const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
    const [selectedSupplier, setSelectedSupplier] = useState<string | null>(null);
    const [selectedProduct, setSelectedProduct] = useState<string | null>(null);

    const category = [
        { value: 'apple', label: 'Apple' },
        { value: 'banana', label: 'Banana' },
        { value: 'orange', label: 'Orange' },
    ];

    const supplier = [
        { value: 'supplier1', label: 'Global Foods Ltd' },
        { value: 'supplier2', label: 'Organic Farms Inc' },
        { value: 'supplier3', label: 'National Mills' },
    ];

    const productSearch = [
        { value: 'product1', label: 'White Sugar' },
        { value: 'product2', label: 'Brown Rice' },
        { value: 'product3', label: 'Wheat Flour' },
    ];

    const [selectedIndex, setSelectedIndex] = useState(0);
    const [currentPage, setCurrentPage] = useState(1);
    const [itemsPerPage] = useState(10);

    const totalPages = Math.ceil(stockData.length / itemsPerPage);
    const startIndex = (currentPage - 1) * itemsPerPage;
    const endIndex = startIndex + itemsPerPage;
    const currentStockData = stockData.slice(startIndex, endIndex);

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
                        <span className="text-gray-700 font-medium">Out of Stock</span>
                    </div>
                    <h1 className="text-3xl font-semibold bg-gradient-to-r from-gray-800 to-gray-600 bg-clip-text text-transparent">
                        Out of Stock
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
                                    <div className={`flex items-center gap-0.5 text-[10px] font-semibold ${stat.trend.startsWith('+') || stat.trend.startsWith('-') ? stat.trend.startsWith('+') ? 'text-red-600' : 'text-emerald-600' : 'text-gray-600'}`}>
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
                            <label htmlFor="product" className="block text-sm font-medium text-gray-700 mb-1">
                                Product
                            </label>
                            <TypeableSelect
                                options={productSearch}
                                value={selectedProduct}
                                onChange={(opt) => setSelectedProduct(opt?.value as string || null)}
                                placeholder="Search product..."
                            />
                        </div>
                        <div>
                            <label htmlFor="category" className="block text-sm font-medium text-gray-700 mb-1">
                                Category
                            </label>
                            <TypeableSelect
                                options={category}
                                value={selectedCategory}
                                onChange={(opt) => setSelectedCategory(opt?.value as string || null)}
                                placeholder="Search categories..."
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
                                placeholder="Search suppliers..."
                            />
                        </div>
                        <div>
                            <label htmlFor="date" className="block text-sm font-medium text-gray-700 mb-1">
                                Date
                            </label>
                            <input
                                type="date"
                                id="date"
                                className="w-full text-sm rounded-lg py-2 px-3 border-2 border-gray-200 focus:border-red-400 focus:outline-none transition-all"
                            />
                        </div>
                        <div className={'grid grid-cols-2 md:items-end items-start gap-2 text-white font-medium'}>
                            <button className={'bg-gradient-to-r from-red-500 to-red-600 hover:from-red-600 hover:to-red-700 py-2 rounded-lg flex items-center justify-center shadow-lg shadow-red-200 hover:shadow-xl transition-all'}>
                                <SearchCheck className="mr-2" size={14} />Search
                            </button>
                            <button className={'bg-gradient-to-r from-gray-500 to-gray-600 hover:from-gray-600 hover:to-gray-700 py-2 rounded-lg flex items-center justify-center shadow-lg shadow-gray-200 hover:shadow-xl transition-all'}>
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
                    <div className="overflow-y-auto max-h-md md:h-[320px] lg:h-[500px] rounded-lg scrollbar-thin scrollbar-thumb-red-300 scrollbar-track-gray-100">
                        <table className="min-w-full divide-y divide-gray-200">
                            <thead className="bg-gradient-to-r from-red-500 to-red-600 sticky top-0 z-10">
                            <tr>
                                {[
                                    'Product ID',
                                    'Product Name',
                                    'Unit',
                                    'Discount',
                                    'Cost Price',
                                    'MRP',
                                    'Price',
                                    'Supplier',
                                    'Stock'
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
                                        No out of stock items found
                                    </td>
                                </tr>
                            ) : (
                                currentStockData.map((item, index) => (
                                    <tr
                                        key={index}
                                        onClick={() => setSelectedIndex(index)}
                                        className={`cursor-pointer transition-all ${
                                            selectedIndex === index
                                                ? 'bg-red-50 border-l-4 border-l-red-500'
                                                : 'hover:bg-gray-50'
                                        }`}
                                    >
                                        <td className="px-6 py-2 whitespace-nowrap text-sm font-semibold text-gray-800">
                                            {item.productId}
                                        </td>
                                        <td className="px-6 py-2 whitespace-nowrap text-sm font-medium text-gray-700">
                                            {item.productName}
                                        </td>
                                        <td className="px-6 py-2 whitespace-nowrap text-sm text-gray-600">
                                            {item.unit}
                                        </td>
                                        <td className="px-6 py-2 whitespace-nowrap text-sm font-medium text-purple-600">
                                            LKR {item.discountAmount}
                                        </td>
                                        <td className="px-6 py-2 whitespace-nowrap text-sm font-medium text-blue-600">
                                            LKR {item.costPrice}
                                        </td>
                                        <td className="px-6 py-2 whitespace-nowrap text-sm font-medium text-gray-600">
                                            LKR {item.mrp}
                                        </td>
                                        <td className="px-6 py-2 whitespace-nowrap text-sm font-bold text-emerald-600">
                                            LKR {item.price}
                                        </td>
                                        <td className="px-6 py-2 whitespace-nowrap text-sm text-gray-600">
                                            {item.supplier}
                                        </td>
                                        <td className="px-6 py-2 whitespace-nowrap">
                                                <span className="px-3 py-1 text-xs font-semibold rounded-full bg-gradient-to-r from-red-100 to-red-200 text-red-800 flex items-center gap-1 w-fit">
                                                    <AlertTriangle className="w-3 h-3" />
                                                    {item.stock}
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
                                        className={`px-4 py-2 text-sm font-semibold rounded-lg transition-all ${
                                            currentPage === page
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
                                className={`flex items-center px-3 py-2 text-sm font-medium rounded-lg transition-all ${
                                    currentPage === totalPages
                                        ? 'text-gray-400 cursor-not-allowed'
                                        : 'text-gray-600 hover:text-red-600 hover:bg-red-50'
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
        </>
    );
}

export default OutOfStock;