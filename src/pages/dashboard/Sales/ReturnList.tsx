import {
    CalendarDays,
    ChevronLeft,
    ChevronRight,
    RefreshCw,
    SearchCheck,
    Loader2,
    RotateCcw,
    FileText,
} from "lucide-react";
import { useEffect, useState, useRef } from "react";
import { posService } from "../../../services/posService";
import toast, { Toaster } from 'react-hot-toast';

interface ReturnRecord {
    id: number;
    invoiceNo: string;
    customer: string;
    date: string;
    returnValue: number;
    refundedAmount: number;
    user: string;
}

function ReturnList() {
    // State Management
    const [returns, setReturns] = useState<ReturnRecord[]>([]);
    const [loading, setLoading] = useState(true);
    const [selectedIndex, setSelectedIndex] = useState(0);

    // Filter State
    const [invoiceNumber, setInvoiceNumber] = useState('');
    const [fromDate, setFromDate] = useState('');
    const [toDate, setToDate] = useState('');

    // Pagination State
    const [currentPage, setCurrentPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const [totalRecords, setTotalRecords] = useState(0);
    const itemsPerPage = 10;

    // Ref for focus
    const searchRef = useRef<HTMLInputElement>(null);

    // Fetch Returns
    const fetchReturns = async () => {
        try {
            setLoading(true);
            const response = await posService.getReturnHistory({
                invoiceNumber: invoiceNumber || undefined,
                fromDate: fromDate || undefined,
                toDate: toDate || undefined,
                page: currentPage,
                limit: itemsPerPage
            });

            if (response.data?.success) {
                setReturns(response.data.data);
                setTotalPages(response.data.pagination.totalPages);
                setTotalRecords(response.data.pagination.totalRecords);
                setSelectedIndex(0);
            }
        } catch (error) {
            console.error('Error fetching returns:', error);
            toast.error('Failed to load return history');
            setReturns([]);
        } finally {
            setLoading(false);
        }
    };

    // Initial Load
    useEffect(() => {
        fetchReturns();
    }, [currentPage]);

    // Handle Search
    const handleSearch = () => {
        setCurrentPage(1);
        fetchReturns();
    };

    // Handle Reset
    const handleReset = () => {
        setInvoiceNumber('');
        setFromDate('');
        setToDate('');
        setCurrentPage(1);
        setTimeout(() => {
            fetchReturns();
        }, 100);
    };

    // Keyboard Navigation
    useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            const isTyping = e.target instanceof HTMLInputElement;

            if (e.key === "ArrowDown") {
                if (isTyping) return;
                e.preventDefault();
                setSelectedIndex((prev) => (prev < returns.length - 1 ? prev + 1 : prev));
            } else if (e.key === "ArrowUp") {
                if (isTyping) return;
                e.preventDefault();
                setSelectedIndex((prev) => (prev > 0 ? prev - 1 : prev));
            } else if (e.key === "Enter") {
                if (isTyping && e.target === searchRef.current) {
                    handleSearch();
                    return;
                }
            } else if (e.key.toLowerCase() === "r") {
                if (isTyping) return;
                e.preventDefault();
                handleReset();
            } else if (e.key.toLowerCase() === "f") {
                if (isTyping) return;
                e.preventDefault();
                searchRef.current?.focus();
            }
        };

        window.addEventListener("keydown", handleKeyDown);
        return () => window.removeEventListener("keydown", handleKeyDown);
    }, [returns.length, selectedIndex]);

    // Format currency
    const formatCurrency = (amount: string | number) => {
        return `LKR ${Number(amount).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
    };

    return (
        <>
            <Toaster position="top-right" />
            <div className="flex flex-col gap-4 h-full">
                {/* Header */}
                <div className="flex items-center justify-between">
                    <div>
                        <div className="text-sm text-gray-400 flex items-center">
                            <span>Sales</span>
                            <span className="mx-2">›</span>
                            <span className="text-gray-700 font-medium">Return History</span>
                        </div>
                        <h1 className="text-3xl font-semibold bg-linear-to-r from-gray-800 to-gray-600 bg-clip-text text-transparent leading-tight">
                            Return History
                        </h1>
                    </div>
                </div>

                {/* Filters */}
                <div className="bg-white rounded-xl border border-gray-200 p-4 flex flex-col">
                    <h2 className="text-xl font-semibold text-gray-700 mb-3">Filter</h2>
                    <div className="grid md:grid-cols-4 gap-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                Invoice Number
                            </label>
                            <input
                                ref={searchRef}
                                type="text"
                                placeholder="Enter Invoice ID... (F)"
                                value={invoiceNumber}
                                onChange={(e) => setInvoiceNumber(e.target.value)}
                                className="w-full text-sm rounded-lg py-2 px-3 border-2 border-gray-200 focus:border-red-400 focus:outline-none transition-all"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                From Date
                            </label>
                            <input
                                type="date"
                                value={fromDate}
                                onChange={(e) => setFromDate(e.target.value)}
                                className="w-full text-sm rounded-lg py-2 px-3 border-2 border-gray-200 focus:border-red-400 focus:outline-none transition-all"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                To Date
                            </label>
                            <input
                                type="date"
                                value={toDate}
                                onChange={(e) => setToDate(e.target.value)}
                                className="w-full text-sm rounded-lg py-2 px-3 border-2 border-gray-200 focus:border-red-400 focus:outline-none transition-all"
                            />
                        </div>
                        <div className="grid grid-cols-2 md:items-end items-start gap-2 text-white font-medium">
                            <button
                                onClick={handleSearch}
                                disabled={loading}
                                className="bg-linear-to-r from-red-500 to-red-600 hover:from-red-600 hover:to-red-700 py-2 rounded-lg flex items-center justify-center transition-all disabled:opacity-50"
                            >
                                {loading ? <Loader2 className="animate-spin" size={14} /> : <SearchCheck className="mr-2" size={14} />}
                                Search
                            </button>
                            <button
                                onClick={handleReset}
                                disabled={loading}
                                className="bg-linear-to-r from-gray-500 to-gray-600 hover:from-gray-600 hover:to-gray-700 py-2 rounded-lg flex items-center justify-center transition-all disabled:opacity-50"
                            >
                                <RefreshCw className="mr-2" size={14} />
                                Reset
                            </button>
                        </div>
                    </div>
                </div>

                {/* Returns Table */}
                <div className="flex flex-col bg-white border border-gray-200 rounded-xl flex-1 p-4 justify-between overflow-hidden">
                    <div className="overflow-auto flex-1 rounded-lg scrollbar-thin scrollbar-thumb-red-300 scrollbar-track-gray-100">
                        <table className="min-w-full divide-y divide-gray-200">
                            <thead className="bg-linear-to-r from-red-500 to-red-600 sticky top-0 z-10">
                                <tr>
                                    {[
                                        'Return ID',
                                        'Invoice Number',
                                        'Customer',
                                        'Return Value',
                                        'Refunded Amount',
                                        'Date & Time',
                                        'User'
                                    ].map((header, i, arr) => (
                                        <th
                                            key={i}
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
                                        <td colSpan={7} className="px-6 py-8 text-center">
                                            <div className="flex items-center justify-center">
                                                <Loader2 className="animate-spin text-red-500 mr-2" size={24} />
                                                <span className="text-gray-500">Loading returns...</span>
                                            </div>
                                        </td>
                                    </tr>
                                ) : returns.length === 0 ? (
                                    <tr>
                                        <td colSpan={7} className="px-6 py-8 text-center text-gray-500">
                                            No return records found.
                                        </td>
                                    </tr>
                                ) : (
                                    returns.map((record, index) => (
                                        <tr
                                            key={record.id}
                                            onClick={() => setSelectedIndex(index)}
                                            className={`cursor-pointer transition-all ${
                                                selectedIndex === index
                                                    ? 'bg-red-50 border-l-4 border-l-red-500'
                                                    : 'hover:bg-gray-50'
                                            }`}
                                        >
                                            <td className="px-6 py-2 whitespace-nowrap text-sm font-semibold text-gray-800">
                                                #{record.id}
                                            </td>
                                            <td className="px-6 py-2 whitespace-nowrap text-sm font-bold text-gray-700">
                                                {record.invoiceNo}
                                            </td>
                                            <td className="px-6 py-2 whitespace-nowrap text-sm font-medium text-gray-600">
                                                {record.customer}
                                            </td>
                                            <td className="px-6 py-2 whitespace-nowrap text-sm font-bold text-red-600">
                                                {formatCurrency(record.returnValue)}
                                            </td>
                                            <td className="px-6 py-2 whitespace-nowrap text-sm font-bold text-orange-600">
                                                {formatCurrency(record.refundedAmount)}
                                            </td>
                                            <td className="px-6 py-2 whitespace-nowrap text-sm text-gray-500">
                                                {new Date(record.date).toLocaleString()}
                                            </td>
                                            <td className="px-6 py-2 whitespace-nowrap text-sm text-gray-600">
                                                {record.user}
                                            </td>
                                        </tr>
                                    ))
                                )}
                            </tbody>
                        </table>
                    </div>

                    {/* Pagination */}
                    <nav className="bg-white flex items-center justify-between sm:px-6 pt-4 border-t-2 border-gray-100">
                        <div className="flex items-center text-sm text-gray-600">
                            Showing {returns.length > 0 ? ((currentPage - 1) * itemsPerPage) + 1 : 0} to {Math.min(currentPage * itemsPerPage, totalRecords)} of {totalRecords} records
                        </div>
                        <div className="flex items-center space-x-2">
                            <button
                                onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                                disabled={currentPage === 1 || loading}
                                className="flex items-center px-3 py-2 text-sm font-medium text-gray-600 hover:text-red-600 hover:bg-red-50 rounded-lg transition-all disabled:opacity-50"
                            >
                                <ChevronLeft className="mr-2 h-5 w-5" /> Previous
                            </button>
                            
                            {[...Array(totalPages)].map((_, i) => {
                                const p = i + 1;
                                if (p === 1 || p === totalPages || (p >= currentPage - 1 && p <= currentPage + 1)) {
                                    return (
                                        <button
                                            key={p}
                                            onClick={() => setCurrentPage(p)}
                                            disabled={loading}
                                            className={`px-4 py-2 text-sm font-medium rounded-lg transition-all ${
                                                currentPage === p
                                                    ? 'bg-linear-to-r from-red-500 to-red-600 text-white'
                                                    : 'text-gray-600 hover:bg-red-50 hover:text-red-600'
                                            }`}
                                        >
                                            {p}
                                        </button>
                                    );
                                } else if (p === currentPage - 2 || p === currentPage + 2) {
                                    return <span key={p} className="text-gray-400 px-2">...</span>;
                                }
                                return null;
                            })}

                            <button
                                onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
                                disabled={currentPage === totalPages || loading}
                                className="flex items-center px-3 py-2 text-sm font-medium text-gray-600 hover:text-red-600 hover:bg-red-50 rounded-lg transition-all disabled:opacity-50"
                            >
                                Next <ChevronRight className="ml-2 h-5 w-5" />
                            </button>
                        </div>
                    </nav>
                </div>
            </div>
        </>
    );
}

export default ReturnList;
