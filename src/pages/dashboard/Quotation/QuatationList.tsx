import {
    ChevronLeft,
    ChevronRight,
    Eye,
    Printer,
    RefreshCw,
    SearchCheck,
    Trash,
    Loader2,
} from "lucide-react";
import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import toast, { Toaster } from 'react-hot-toast';

interface Quotation {
    quotationId: string;
    grossAmount: string;
    discount: string;
    discountAmount: string;
    netAmount: string;
    createBy: string;
    createAt: string;
}

function QuotationList() {
    const [quotationsData] = useState<Quotation[]>([
        {
            quotationId: "250929003",
            grossAmount: "25,000.00",
            discount: "5%",
            discountAmount: "1,250.00",
            netAmount: "23,750.00",
            createBy: "Shanila Silva",
            createAt: "9/29/2025, 8:51:54 AM",
        },
        {
            quotationId: "250929004",
            grossAmount: "50,000.00",
            discount: "10%",
            discountAmount: "5,000.00",
            netAmount: "45,000.00",
            createBy: "Kamal Perera",
            createAt: "9/29/2025, 9:15:20 AM",
        },
        {
            quotationId: "250929005",
            grossAmount: "15,000.00",
            discount: "2%",
            discountAmount: "300.00",
            netAmount: "14,700.00",
            createBy: "Nimal Fernando",
            createAt: "9/29/2025, 10:30:45 AM",
        },
    ]);

    const [loading, setLoading] = useState(false);
    const [selectedIndex, setSelectedIndex] = useState(0);
    const [currentPage, setCurrentPage] = useState(1);
    const [itemsPerPage] = useState(10);

    const [quotationId, setQuotationId] = useState('');
    const [fromDate, setFromDate] = useState('');
    const [toDate, setToDate] = useState('');

    const handleSearch = () => {
        setLoading(true);
        toast.promise(
            new Promise((resolve) => setTimeout(resolve, 1000)),
            {
                loading: 'Searching quotations...',
                success: 'Search completed!',
                error: 'Search failed'
            }
        );
        setTimeout(() => setLoading(false), 1000);
    };

    const handleClearFilters = () => {
        setQuotationId('');
        setFromDate('');
        setToDate('');
        setCurrentPage(1);
        toast.success('Filters cleared');
    };

    const handleView = (quotation: Quotation) => {
        toast.success(`Viewing quotation ${quotation.quotationId}`);
    };

    const handlePrint = (quotation: Quotation) => {
        toast.success(`Printing quotation ${quotation.quotationId}`);
    };

    const handleDelete = (quotation: Quotation) => {
        toast.error(`Delete quotation ${quotation.quotationId}`);
    };

    const totalPages = Math.ceil(quotationsData.length / itemsPerPage);
    const startIndex = (currentPage - 1) * itemsPerPage;
    const endIndex = startIndex + itemsPerPage;
    const paginatedQuotations = quotationsData.slice(startIndex, endIndex);

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
                setSelectedIndex((prev) => (prev < paginatedQuotations.length - 1 ? prev + 1 : prev));
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
    }, [paginatedQuotations.length]);

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
            <div className={"flex flex-col gap-4 h-full"}>
                <div>
                    <div className="text-sm text-gray-400 flex items-center">
                        <span>Quotation</span>
                        <span className="mx-2">›</span>
                        <span className="text-gray-700 font-medium">Manage Quotations</span>
                    </div>
                    <h1 className="text-3xl font-semibold bg-gradient-to-r from-gray-800 to-gray-600 bg-clip-text text-transparent">
                        Manage Quotations
                    </h1>
                </div>

                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className={"bg-white rounded-xl p-6 flex flex-col shadow-lg"}
                >
                    <h2 className="text-xl font-semibold text-gray-700 mb-4">Filter</h2>
                    <div className={"grid md:grid-cols-4 gap-4"}>
                        <div>
                            <label htmlFor="quotation-id" className="block text-sm font-medium text-gray-700 mb-1">
                                Quotation ID
                            </label>
                            <input
                                type="text"
                                id="quotation-id"
                                placeholder="Enter Quotation ID..."
                                value={quotationId}
                                onChange={(e) => setQuotationId(e.target.value)}
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
                        <div className={"grid grid-cols-2 md:items-end items-start gap-2"}>
                            <div className="relative group">
                                <button
                                    onClick={handleSearch}
                                    disabled={loading}
                                    className="w-full flex items-center justify-center px-4 py-2 bg-gradient-to-r from-emerald-500 to-emerald-600 hover:from-emerald-600 hover:to-emerald-700 text-white font-medium rounded-lg shadow-lg shadow-emerald-200 hover:shadow-xl transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                                >
                                    {loading ? (
                                        <Loader2 className="w-5 h-5 animate-spin" />
                                    ) : (
                                        <SearchCheck className="w-5 h-5" />
                                    )}
                                </button>
                                <span className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 w-max px-2 py-1 text-xs text-white bg-gray-900 rounded-md invisible group-hover:visible opacity-0 group-hover:opacity-100 transition-opacity">
                                    Search (Enter)
                                </span>
                            </div>
                            <div className="relative group">
                                <button
                                    onClick={handleClearFilters}
                                    className="w-full flex items-center justify-center px-4 py-2 bg-gradient-to-r from-gray-500 to-gray-600 hover:from-gray-600 hover:to-gray-700 text-white font-medium rounded-lg shadow-lg shadow-gray-200 hover:shadow-xl transition-all"
                                >
                                    <RefreshCw className="w-5 h-5" />
                                </button>
                                <span className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 w-max px-2 py-1 text-xs text-white bg-gray-900 rounded-md invisible group-hover:visible opacity-0 group-hover:opacity-100 transition-opacity">
                                    Clear Filters (Delete)
                                </span>
                            </div>
                        </div>
                    </div>
                </motion.div>

                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className={"flex flex-col bg-white rounded-xl h-full p-6 justify-between shadow-lg"}
                >
                    <div className="overflow-y-auto max-h-md md:h-[320px] lg:h-[500px] rounded-lg scrollbar-thin scrollbar-thumb-emerald-300 scrollbar-track-gray-100">
                        <table className="min-w-full divide-y divide-gray-200">
                            <thead className="bg-gradient-to-r from-emerald-500 to-emerald-600 sticky top-0 z-10">
                            <tr>
                                {[
                                    "Quotation ID",
                                    "Gross Amount",
                                    "Discount",
                                    "Discount Amount",
                                    "Net Amount",
                                    "Created By",
                                    "Created At",
                                    "Actions",
                                ].map((header, i, arr) => (
                                    <th
                                        key={i}
                                        scope="col"
                                        className={`px-6 py-3 text-center text-xs font-bold text-white uppercase tracking-wider ${
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
                                    <td colSpan={8} className="px-6 py-8 text-center">
                                        <div className="flex justify-center items-center">
                                            <Loader2 className="w-8 h-8 animate-spin text-emerald-500" />
                                        </div>
                                    </td>
                                </tr>
                            ) : paginatedQuotations.length === 0 ? (
                                <tr>
                                    <td colSpan={8} className="px-6 py-8 text-center text-gray-500">
                                        No quotations found
                                    </td>
                                </tr>
                            ) : (
                                paginatedQuotations.map((quotation, index) => (
                                    <tr
                                        key={index}
                                        onClick={() => setSelectedIndex(index)}
                                        className={`cursor-pointer transition-all ${
                                            selectedIndex === index
                                                ? 'bg-emerald-50 border-l-4 border-emerald-500'
                                                : 'hover:bg-gray-50'
                                        }`}
                                    >
                                        <td className="px-6 py-3 whitespace-nowrap text-sm font-medium text-emerald-600">
                                            {quotation.quotationId}
                                        </td>
                                        <td className="px-6 py-3 whitespace-nowrap text-sm text-gray-700 text-right">
                                            LKR {quotation.grossAmount}
                                        </td>
                                        <td className="px-6 py-3 whitespace-nowrap text-sm text-gray-700 text-center">
                                            <span className="px-2 py-1 bg-blue-100 text-blue-800 rounded-full text-xs font-medium">
                                                {quotation.discount}
                                            </span>
                                        </td>
                                        <td className="px-6 py-3 whitespace-nowrap text-sm text-red-600 text-right">
                                            LKR {quotation.discountAmount}
                                        </td>
                                        <td className="px-6 py-3 whitespace-nowrap text-sm font-semibold text-emerald-600 text-right">
                                            LKR {quotation.netAmount}
                                        </td>
                                        <td className="px-6 py-3 whitespace-nowrap text-sm text-gray-700">
                                            {quotation.createBy}
                                        </td>
                                        <td className="px-6 py-3 whitespace-nowrap text-sm text-gray-500">
                                            {quotation.createAt}
                                        </td>
                                        <td className="px-6 py-3 whitespace-nowrap text-sm font-medium text-center">
                                            <div className="flex items-center justify-center gap-2">
                                                <button
                                                    onClick={(e) => {
                                                        e.stopPropagation();
                                                        handleView(quotation);
                                                    }}
                                                    className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-all"
                                                    title="View"
                                                >
                                                    <Eye size={18} />
                                                </button>
                                                <button
                                                    onClick={(e) => {
                                                        e.stopPropagation();
                                                        handlePrint(quotation);
                                                    }}
                                                    className="p-2 text-emerald-600 hover:bg-emerald-50 rounded-lg transition-all"
                                                    title="Print"
                                                >
                                                    <Printer size={18} />
                                                </button>
                                                <button
                                                    onClick={(e) => {
                                                        e.stopPropagation();
                                                        handleDelete(quotation);
                                                    }}
                                                    className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-all"
                                                    title="Delete"
                                                >
                                                    <Trash size={18} />
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
                            Showing <span className="font-medium text-emerald-600">{paginatedQuotations.length === 0 ? 0 : startIndex + 1}</span> to <span className="font-medium text-emerald-600">{Math.min(endIndex, quotationsData.length)}</span> of <span className="font-medium text-emerald-600">{quotationsData.length}</span> quotations
                        </div>
                        <div className="flex items-center space-x-2">
                            <button
                                onClick={() => goToPage(currentPage - 1)}
                                disabled={currentPage === 1}
                                className={`flex items-center px-3 py-2 text-sm font-medium rounded-lg transition-all ${
                                    currentPage === 1
                                        ? 'text-gray-300 cursor-not-allowed'
                                        : 'text-gray-600 hover:bg-emerald-50 hover:text-emerald-600'
                                }`}
                            >
                                <ChevronLeft className="mr-1 h-4 w-4"/> Previous
                            </button>

                            {getPageNumbers().map((page, idx) => (
                                typeof page === 'number' ? (
                                    <button
                                        key={idx}
                                        onClick={() => goToPage(page)}
                                        className={`px-4 py-2 text-sm font-medium rounded-lg transition-all ${
                                            currentPage === page
                                                ? 'bg-gradient-to-r from-emerald-500 to-emerald-600 text-white shadow-lg shadow-emerald-200'
                                                : 'text-gray-600 hover:bg-emerald-50 hover:text-emerald-600'
                                        }`}
                                    >
                                        {page}
                                    </button>
                                ) : (
                                    <span key={idx} className="text-gray-400 px-2">...</span>
                                )
                            ))}

                            <button
                                onClick={() => goToPage(currentPage + 1)}
                                disabled={currentPage === totalPages || totalPages === 0}
                                className={`flex items-center px-3 py-2 text-sm font-medium rounded-lg transition-all ${
                                    currentPage === totalPages || totalPages === 0
                                        ? 'text-gray-300 cursor-not-allowed'
                                        : 'text-gray-600 hover:bg-emerald-50 hover:text-emerald-600'
                                }`}
                            >
                                Next <ChevronRight className="ml-1 h-4 w-4"/>
                            </button>
                        </div>
                    </nav>
                </motion.div>
            </div>
        </>
    );
}

export default QuotationList;