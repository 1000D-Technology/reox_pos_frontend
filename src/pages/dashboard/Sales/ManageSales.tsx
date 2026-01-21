import {
    ChartLine,
    ChartNoAxesCombined,
    ChevronLeft,
    ChevronRight,
    CreditCard,
    Eye,
    Printer,
    RefreshCw,
    Scale,
    SearchCheck,
    Users,
    Loader2,
    ArrowUpRight,
    ArrowDownRight
} from "lucide-react";
import { useEffect, useState } from "react";
import toast, { Toaster } from 'react-hot-toast';

interface Sale {
    invoiceId: string;
    grossAmount: string;
    customer: string;
    discount: string;
    netAmount: string;
    cashPay: string;
    cardPay: string;
    balance: string;
    cashier: string;
    issuedAt: string;
}

function ManageSales() {
    const summaryCards = [
        {
            icon: ChartNoAxesCombined,
            label: 'Cash Amount',
            value: 'LKR 500,000.00',
            trend: '+12.5%',
            color: 'bg-gradient-to-br from-emerald-400 to-emerald-500',
            iconColor: 'text-white'
        },
        {
            icon: CreditCard,
            label: 'Card Payments',
            value: '50',
            trend: '+8.3%',
            color: 'bg-gradient-to-br from-blue-400 to-blue-500',
            iconColor: 'text-white'
        },
        {
            icon: ChartLine,
            label: 'Total Sales',
            value: 'LKR 10,250.00',
            trend: '+15.7%',
            color: 'bg-gradient-to-br from-purple-400 to-purple-500',
            iconColor: 'text-white'
        },
        {
            icon: Users,
            label: 'Customers',
            value: '50',
            trend: '-3.2%',
            color: 'bg-gradient-to-br from-orange-400 to-orange-500',
            iconColor: 'text-white'
        },
        {
            icon: Scale,
            label: 'Total Discount',
            value: 'LKR 2,500.00',
            trend: '+5.1%',
            color: 'bg-gradient-to-br from-red-400 to-red-500',
            iconColor: 'text-white'
        },
    ];

    const [salesData] = useState<Sale[]>([
        {
            invoiceId: '250929003',
            grossAmount: '25,000.00',
            customer: 'Unknown',
            discount: '0.00',
            netAmount: '25,000.00',
            cashPay: '25,000.00',
            cardPay: '0.00',
            balance: '0.00',
            cashier: 'Saman Silva',
            issuedAt: '9/29/2025, 8:51:54 AM',
        },
        {
            invoiceId: '250929004',
            grossAmount: '30,000.00',
            customer: 'John Doe',
            discount: '100.00',
            netAmount: '29,900.00',
            cashPay: '10,000.00',
            cardPay: '19,900.00',
            balance: '0.00',
            cashier: 'Nimal Perera',
            issuedAt: '9/29/2025, 9:15:20 AM',
        },
        {
            invoiceId: '250929005',
            grossAmount: '12,000.00',
            customer: 'Jane Smith',
            discount: '0.00',
            netAmount: '12,000.00',
            cashPay: '12,000.00',
            cardPay: '0.00',
            balance: '0.00',
            cashier: 'Kamal Silva',
            issuedAt: '9/29/2025, 10:02:40 AM',
        },
    ]);

    const [loading, setLoading] = useState(false);
    const [selectedIndex, setSelectedIndex] = useState(0);
    const [currentPage, setCurrentPage] = useState(1);
    const [itemsPerPage] = useState(10);

    const [invoiceId, setInvoiceId] = useState('');
    const [fromDate, setFromDate] = useState('');
    const [toDate, setToDate] = useState('');

    const handleSearch = () => {
        setLoading(true);
        toast.promise(
            new Promise((resolve) => setTimeout(resolve, 1000)),
            {
                loading: 'Searching sales...',
                success: 'Search completed!',
                error: 'Search failed'
            }
        );
        setTimeout(() => setLoading(false), 1000);
    };

    const handleClearFilters = () => {
        setInvoiceId('');
        setFromDate('');
        setToDate('');
        setCurrentPage(1);
        toast.success('Filters cleared');
    };

    const totalPages = Math.ceil(salesData.length / itemsPerPage);
    const startIndex = (currentPage - 1) * itemsPerPage;
    const paginatedSales = salesData.slice(startIndex, startIndex + itemsPerPage);

    const goToPage = (page: number) => {
        if (page >= 1 && page <= totalPages) {
            setCurrentPage(page);
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
                pages.push(currentPage - 1);
                pages.push(currentPage);
                pages.push(currentPage + 1);
                pages.push('...');
                pages.push(totalPages);
            }
        }

        return pages;
    };

    useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            if (e.key === "ArrowDown") {
                e.preventDefault();
                setSelectedIndex((prev) => (prev < paginatedSales.length - 1 ? prev + 1 : prev));
            } else if (e.key === "ArrowUp") {
                e.preventDefault();
                setSelectedIndex((prev) => (prev > 0 ? prev - 1 : prev));
            } else if (e.key === 'Enter') {
                handleSearch();
            } else if (e.key === 'Delete') {
                handleClearFilters();
            }
        };

        window.addEventListener("keydown", handleKeyDown);
        return () => window.removeEventListener("keydown", handleKeyDown);
    }, [paginatedSales.length]);

    useEffect(() => {
        setSelectedIndex(0);
    }, [currentPage]);

    return (
        <>
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
                            background: '#10B981',
                            color: '#fff',
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
            <div className={'flex flex-col gap-4 h-full'}>
                <div>
                    <div className="text-sm text-gray-400 flex items-center">
                        <span>Sales</span>
                        <span className="mx-2">›</span>
                        <span className="text-gray-700 font-medium">Sales Management</span>
                    </div>
                    <h1 className="text-3xl font-semibold bg-gradient-to-r from-gray-800 to-gray-600 bg-clip-text text-transparent">
                        Sales Management
                    </h1>
                </div>

                <div className={'grid md:grid-cols-5 grid-cols-2 gap-4'}>
                    {summaryCards.map((stat, i) => (
                        <div
                            key={i}
                            className={`flex items-center p-4 space-x-3 transition-all bg-white rounded-xl border border-gray-200 cursor-pointer group relative overflow-hidden`}
                        >
                            <div className="absolute inset-0 bg-gradient-to-br from-transparent via-gray-50/50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>

                            <div className={`p-3 rounded-full ${stat.color} relative z-10`}>
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

                <div
                    className={'bg-white rounded-xl p-6 flex flex-col border border-gray-200'}
                >
                    <h2 className="text-xl font-semibold text-gray-700 mb-4">Filter</h2>
                    <div className={'grid md:grid-cols-4 gap-4'}>
                        <div>
                            <label htmlFor="invoice-id" className="block text-sm font-medium text-gray-700 mb-1">
                                Invoice ID
                            </label>
                            <input
                                type="text"
                                id="invoice-id"
                                placeholder="Enter Invoice ID..."
                                value={invoiceId}
                                onChange={(e) => setInvoiceId(e.target.value)}
                                onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
                                className="w-full text-sm rounded-lg py-2 px-3 border-2 border-gray-200 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-200 outline-none transition-all"
                            />
                        </div>
                        <div>
                            <label htmlFor="from-date" className="block text-sm font-medium text-gray-700 mb-1">
                                From Date
                            </label>
                            <input
                                type="date"
                                id="from-date"
                                value={fromDate}
                                onChange={(e) => setFromDate(e.target.value)}
                                className="w-full text-sm rounded-lg py-2 px-3 border-2 border-gray-200 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-200 outline-none transition-all"
                            />
                        </div>
                        <div>
                            <label htmlFor="to-date" className="block text-sm font-medium text-gray-700 mb-1">
                                To Date
                            </label>
                            <input
                                type="date"
                                id="to-date"
                                value={toDate}
                                onChange={(e) => setToDate(e.target.value)}
                                className="w-full text-sm rounded-lg py-2 px-3 border-2 border-gray-200 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-200 outline-none transition-all"
                            />
                        </div>
                        <div className={'grid grid-cols-2 md:items-end items-start gap-2'}>
                            <div className="relative group">
                                <button
                                    onClick={handleSearch}
                                    disabled={loading}
                                    className={'w-full bg-gradient-to-r from-emerald-500 to-emerald-600 hover:from-emerald-600 hover:to-emerald-700 py-2 rounded-lg flex items-center justify-center transition-all text-white font-medium disabled:opacity-50 disabled:cursor-not-allowed'}
                                >
                                    {loading ? <Loader2 className="mr-2 animate-spin" size={14} /> : <SearchCheck className="mr-2" size={14} />}
                                    Search
                                </button>
                                <span className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 w-max px-2 py-1 text-xs text-white bg-gray-900 rounded-md invisible group-hover:visible opacity-0 group-hover:opacity-100 transition-opacity">
                                    Press Enter to search
                                </span>
                            </div>
                            <div className="relative group">
                                <button
                                    onClick={handleClearFilters}
                                    className={'w-full bg-gradient-to-r from-gray-500 to-gray-600 hover:from-gray-600 hover:to-gray-700 py-2 rounded-lg flex items-center justify-center transition-all text-white font-medium'}
                                >
                                    <RefreshCw className="mr-2" size={14} />Clear
                                </button>
                                <span className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 w-max px-2 py-1 text-xs text-white bg-gray-900 rounded-md invisible group-hover:visible opacity-0 group-hover:opacity-100 transition-opacity">
                                    Press Delete to clear
                                </span>
                            </div>
                        </div>
                    </div>
                </div>

                <div
                    className={'flex flex-col bg-white rounded-xl h-full p-6 justify-between border border-gray-200'}
                >
                    <div className="overflow-y-auto max-h-md md:h-[320px] lg:h-[500px] rounded-lg scrollbar-thin scrollbar-thumb-emerald-300 scrollbar-track-gray-100">
                        <table className="min-w-full divide-y divide-gray-200">
                            <thead className="bg-gradient-to-r from-emerald-500 to-emerald-600 sticky top-0 z-10">
                                <tr>
                                    {[
                                        'Invoice ID',
                                        'Gross Amount',
                                        'Customer',
                                        'Discount',
                                        'Net Amount',
                                        'Cash Pay',
                                        'Card Pay',
                                        'Balance',
                                        'Cashier',
                                        'Issued At',
                                        'Actions'
                                    ].map((header, i, arr) => (
                                        <th
                                            key={i}
                                            className={`px-6 py-3 text-left text-xs font-bold text-white uppercase tracking-wider ${i === 0 ? 'rounded-tl-lg' : i === arr.length - 1 ? 'rounded-tr-lg' : ''
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
                                        <td colSpan={11} className="px-6 py-8 text-center">
                                            <div className="flex items-center justify-center">
                                                <Loader2 className="animate-spin text-emerald-600 mr-2" size={24} />
                                                <span className="text-gray-500">Loading sales data...</span>
                                            </div>
                                        </td>
                                    </tr>
                                ) : paginatedSales.length === 0 ? (
                                    <tr>
                                        <td colSpan={11} className="px-6 py-8 text-center text-gray-500">
                                            No sales data found
                                        </td>
                                    </tr>
                                ) : (
                                    paginatedSales.map((sale, index) => (
                                        <tr
                                            key={index}
                                            onClick={() => setSelectedIndex(index)}
                                            className={`cursor-pointer transition-all ${selectedIndex === index
                                                    ? 'bg-emerald-50 border-l-4 border-emerald-500'
                                                    : 'hover:bg-gray-50'
                                                }`}
                                        >
                                            <td className="px-6 py-2 whitespace-nowrap text-sm font-semibold text-gray-800">
                                                {sale.invoiceId}
                                            </td>
                                            <td className="px-6 py-2 whitespace-nowrap text-sm font-bold text-emerald-600">
                                                LKR {sale.grossAmount}
                                            </td>
                                            <td className="px-6 py-2 whitespace-nowrap text-sm font-medium text-gray-700">
                                                {sale.customer}
                                            </td>
                                            <td className="px-6 py-2 whitespace-nowrap text-sm font-medium text-red-600">
                                                LKR {sale.discount}
                                            </td>
                                            <td className="px-6 py-2 whitespace-nowrap text-sm font-bold text-blue-600">
                                                LKR {sale.netAmount}
                                            </td>
                                            <td className="px-6 py-2 whitespace-nowrap text-sm font-medium text-gray-600">
                                                LKR {sale.cashPay}
                                            </td>
                                            <td className="px-6 py-2 whitespace-nowrap text-sm font-medium text-gray-600">
                                                LKR {sale.cardPay}
                                            </td>
                                            <td className="px-6 py-2 whitespace-nowrap text-sm font-medium text-gray-600">
                                                LKR {sale.balance}
                                            </td>
                                            <td className="px-6 py-2 whitespace-nowrap text-sm font-medium text-gray-700">
                                                {sale.cashier}
                                            </td>
                                            <td className="px-6 py-2 whitespace-nowrap text-sm text-gray-500">
                                                {sale.issuedAt}
                                            </td>
                                            <td className="px-6 py-2 whitespace-nowrap text-sm font-medium">
                                                <div className="flex space-x-2">
                                                    <button className="p-2 bg-gradient-to-r from-blue-500 to-blue-600 text-white rounded-lg hover:from-blue-600 hover:to-blue-700 transition-all">
                                                        <Eye size={16} />
                                                    </button>
                                                    <button className="p-2 bg-gradient-to-r from-emerald-500 to-emerald-600 text-white rounded-lg hover:from-emerald-600 hover:to-emerald-700 transition-all">
                                                        <Printer size={16} />
                                                    </button>
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
                            Showing <span className="font-medium text-emerald-600">{paginatedSales.length === 0 ? 0 : startIndex + 1}</span> to <span className="font-medium text-emerald-600">{Math.min(startIndex + itemsPerPage, salesData.length)}</span> of <span className="font-medium text-emerald-600">{salesData.length}</span> sales
                        </div>
                        <div className="flex items-center space-x-2">
                            <button
                                onClick={() => goToPage(currentPage - 1)}
                                disabled={currentPage === 1}
                                className={`flex items-center px-3 py-2 text-sm font-medium rounded-lg transition-all ${currentPage === 1
                                        ? 'text-gray-400 cursor-not-allowed'
                                        : 'text-gray-600 hover:text-emerald-600 hover:bg-emerald-50'
                                    }`}
                            >
                                <ChevronLeft className="mr-1 h-4 w-4" /> Previous
                            </button>

                            {getPageNumbers().map((page, idx) => (
                                typeof page === 'number' ? (
                                    <button
                                        key={idx}
                                        onClick={() => goToPage(page)}
                                        className={`px-4 py-2 text-sm font-medium rounded-lg transition-all ${currentPage === page
                                                ? 'bg-gradient-to-r from-emerald-500 to-emerald-600 text-white'
                                                : 'text-gray-600 hover:bg-emerald-50 hover:text-emerald-600'
                                            }`}
                                    >
                                        {page}
                                    </button>
                                ) : (
                                    <span key={idx} className="text-gray-400 px-2">{page}</span>
                                )
                            ))}

                            <button
                                onClick={() => goToPage(currentPage + 1)}
                                disabled={currentPage === totalPages || totalPages === 0}
                                className={`flex items-center px-3 py-2 text-sm font-medium rounded-lg transition-all ${currentPage === totalPages || totalPages === 0
                                        ? 'text-gray-400 cursor-not-allowed'
                                        : 'text-gray-600 hover:text-emerald-600 hover:bg-emerald-50'
                                    }`}
                            >
                                Next <ChevronRight className="ml-1 h-4 w-4" />
                            </button>
                        </div>
                    </nav>
                </div>
            </div>
        </>
    );
}

export default ManageSales;