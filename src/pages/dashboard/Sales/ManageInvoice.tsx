import {
    CalendarDays,
    ChartNoAxesCombined,
    ChevronLeft,
    ChevronRight,
    Eye,
    FileSpreadsheet,
    Printer,
    RefreshCw,
    SearchCheck,
    ArrowUpRight,
    ArrowDownRight,
    Loader2,
    X,
    Keyboard,
    Command,
} from "lucide-react";
import { useEffect, useState, useRef } from "react";
import invoiceService from "../../../services/invoiceService";
import type { Invoice, InvoiceStats } from "../../../services/invoiceService";
import toast, { Toaster } from 'react-hot-toast';
import { printBill } from "../../../utils/billPrinter";


function ManageInvoice() {
    // State Management
    const [invoices, setInvoices] = useState<Invoice[]>([]);
    const [stats, setStats] = useState<InvoiceStats | null>(null);
    const [loading, setLoading] = useState(true);
    const [statsLoading, setStatsLoading] = useState(true);
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

    // Invoice Detail Modal State
    const [showDetailModal, setShowDetailModal] = useState(false);
    const [selectedInvoiceDetails, setSelectedInvoiceDetails] = useState<any>(null);
    const [detailsLoading, setDetailsLoading] = useState(false);

    // Fetch Invoices
    const fetchInvoices = async () => {
        try {
            setLoading(true);
            const response = await invoiceService.getAllInvoices({
                invoiceNumber: invoiceNumber || undefined,
                fromDate: fromDate || undefined,
                toDate: toDate || undefined,
                page: currentPage,
                limit: itemsPerPage
            });

            if (response.success) {
                setInvoices(response.data);
                setTotalPages(response.pagination.totalPages);
                setTotalRecords(response.pagination.totalRecords);
                setSelectedIndex(0); // Reset selection
            }
        } catch (error) {
            console.error('Error fetching invoices:', error);
            toast.error('Failed to load invoices');
            setInvoices([]);
        } finally {
            setLoading(false);
        }
    };

    // Fetch Statistics
    const fetchStats = async () => {
        try {
            setStatsLoading(true);
            const response = await invoiceService.getInvoiceStats({
                fromDate: fromDate || undefined,
                toDate: toDate || undefined
            });

            if (response.success) {
                setStats(response.data);
            }
        } catch (error) {
            console.error('Error fetching stats:', error);
            setStats(null);
        } finally {
            setStatsLoading(false);
        }
    };

    // Initial Load
    useEffect(() => {
        fetchInvoices();
        fetchStats();
    }, [currentPage]);

    // Handle Search
    const handleSearch = () => {
        setCurrentPage(1); // Reset to first page
        fetchInvoices();
        fetchStats();
    };

    // Handle Reset
    const handleReset = () => {
        setInvoiceNumber('');
        setFromDate('');
        setToDate('');
        setCurrentPage(1);
        
        // Trigger re-fetch with cleared filters
        setTimeout(() => {
            fetchInvoices();
            fetchStats();
        }, 100);
    };

    // Handle View Invoice Details
    const handleViewInvoice = async (invoiceID: string) => {
        try {
            setDetailsLoading(true);
            setShowDetailModal(true);
            
            const response = await invoiceService.getInvoiceDetails(invoiceID);
            
            if (response.success) {
                setSelectedInvoiceDetails(response.data);
            } else {
                toast.error('Failed to load invoice details');
            }
        } catch (error) {
            console.error('Error fetching invoice details:', error);
            toast.error('Failed to load invoice details');
        } finally {
            setDetailsLoading(false);
        }
    };

    // Handle Print Invoice
    const handlePrintInvoice = async (invoiceID: string) => {
        try {
            const response = await invoiceService.getInvoiceDetails(invoiceID);
            
            if (response.success) {
                const invoice = response.data;
                
                const billData: any = {
                    invoiceId: invoice.id || 0, 
                    invoiceNumber: invoice.invoiceNo,
                    date: new Date(invoice.date),
                    customer: {
                        id: invoice.customerId || 0,
                        name: invoice.customer,
                        contact: invoice.customerContact || ''
                    },
                    items: invoice.items.map((item: any) => ({
                        id: item.id,
                        name: item.name,
                        price: item.price,
                        quantity: item.quantity,
                        discount: 0,
                        category: item.category,
                        isBulk: item.isBulk
                    })),
                    subtotal: invoice.subTotal || invoice.total, 
                    discount: invoice.discount || 0,
                    total: invoice.total,
                    paymentAmounts: invoice.payments.map((p: any) => ({
                        methodId: p.method.toLowerCase(),
                        amount: p.amount
                    })),
                    isReturn: false
                };

                printBill(billData);
                toast.success('Print window opened');
            }
        } catch (error) {
            console.error('Error printing invoice:', error);
            toast.error('Failed to print invoice');
        }
    };
            


    // Refs for focus management
    const searchRef = useRef<HTMLInputElement>(null);

    // Keyboard Navigation
    useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            // Ignore shortcuts if user is typing in an input (except for Escape)
            const isTyping = e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement;

            if (e.key === "ArrowDown") {
                if (isTyping) return;
                e.preventDefault();
                setSelectedIndex((prev) => (prev < invoices.length - 1 ? prev + 1 : prev));
            } else if (e.key === "ArrowUp") {
                if (isTyping) return;
                e.preventDefault();
                setSelectedIndex((prev) => (prev > 0 ? prev - 1 : prev));
            } else if (e.key === "Enter") {
                if (isTyping && e.target === searchRef.current) {
                    handleSearch();
                    return;
                }
                if (!showDetailModal && invoices.length > 0) {
                    e.preventDefault();
                    handleViewInvoice(invoices[selectedIndex].invoiceID);
                }
            } else if (e.key === "Escape") {
                e.preventDefault();
                if (showDetailModal) setShowDetailModal(false);
                if (isTyping) (e.target as HTMLElement).blur();
            } else if (e.key.toLowerCase() === "p") {
                if (isTyping) return;
                e.preventDefault();
                if (showDetailModal && selectedInvoiceDetails) {
                    handlePrintInvoice(selectedInvoiceDetails.invoiceNo);
                } else if (!showDetailModal && invoices.length > 0) {
                    handlePrintInvoice(invoices[selectedIndex].invoiceID);
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
    }, [invoices.length, selectedIndex, showDetailModal, selectedInvoiceDetails]);

    // Pagination Handlers
    const goToPage = (page: number) => {
        if (page >= 1 && page <= totalPages) {
            setCurrentPage(page);
        }
    };

    // Format currency
    const formatCurrency = (amount: string | number) => {
        return `LKR ${Number(amount).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
    };

    // Summary Cards Data
    const summaryCards = [
        {
            icon: ChartNoAxesCombined,
            label: 'Total Sales',
            value: statsLoading ? 'Loading...' : formatCurrency(stats?.totalSales || 0),
            trend: '+12%',
            color: 'bg-gradient-to-br from-emerald-400 to-emerald-500',
            iconColor: 'text-white',
        },
        {
            icon: FileSpreadsheet,
            label: 'Total Invoice',
            value: statsLoading ? 'Loading...' : stats?.invoiceCount.toString() || '0',
            trend: '+8%',
            color: 'bg-gradient-to-br from-blue-400 to-blue-500',
            iconColor: 'text-white',
        },
        {
            icon: CalendarDays,
            label: 'Date Range',
            value: statsLoading ? 'Loading...' : stats?.dateRange || 'All Time',
            trend: '',
            color: 'bg-gradient-to-br from-purple-400 to-purple-500',
            iconColor: 'text-white',
        },
    ];

    return (
        <>
            <Toaster position="top-right" />
            
            <div className={'flex flex-col gap-4 h-full'}>
                {/* Header */}
                <div className="flex items-center justify-between">
                    <div>
                        <div className="text-sm text-gray-400 flex items-center">
                            <span>Sales</span>
                            <span className="mx-2">›</span>
                            <span className="text-gray-700 font-medium">Manage Invoice</span>
                        </div>
                        <h1 className="text-3xl font-semibold bg-linear-to-r from-gray-800 to-gray-600 bg-clip-text text-transparent leading-tight">
                            Manage Invoice
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
                            <span className="text-[10px] font-bold text-gray-400 uppercase tracking-tight">View</span>
                        </div>
                        <div className="flex items-center gap-1.5 px-2 py-1 bg-gray-50 rounded-lg border border-gray-200">
                            <span className="text-[10px] font-black text-gray-500 bg-white px-1.5 py-0.5 rounded shadow-sm border border-gray-200">P</span>
                            <span className="text-[10px] font-bold text-gray-400 uppercase tracking-tight">Print</span>
                        </div>
                        <div className="flex items-center gap-1.5 px-2 py-1 bg-gray-50 rounded-lg border border-gray-200">
                            <span className="text-[10px] font-black text-gray-500 bg-white px-1.5 py-0.5 rounded shadow-sm border border-gray-200">F</span>
                            <span className="text-[10px] font-bold text-gray-400 uppercase tracking-tight">Search</span>
                        </div>
                        <div className="flex items-center gap-1.5 px-2 py-1 bg-gray-50 rounded-lg border border-gray-200">
                            <span className="text-[10px] font-black text-gray-500 bg-white px-1.5 py-0.5 rounded shadow-sm border border-gray-200">R</span>
                            <span className="text-[10px] font-bold text-gray-400 uppercase tracking-tight">Reset</span>
                        </div>
                    </div>
                </div>

                {/* Summary Cards */}
                <div className={'grid md:grid-cols-3 grid-cols-1 gap-4'}>
                    {summaryCards.map((stat, i) => (
                        <div
                            key={i}
                            className={`flex items-center p-4 space-x-3 transition-all bg-white rounded-xl border border-gray-200 cursor-pointer group relative overflow-hidden`}
                        >
                            <div className="absolute inset-0 bg-linear-to-br from-transparent via-gray-50/50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>

                            <div className={`p-3 ${stat.color} relative z-10 rounded-lg`}>
                                <stat.icon className={`w-6 h-6 ${stat.iconColor}`} />
                            </div>

                            <div className="w-px h-10 bg-gray-200"></div>

                            <div className="relative z-10 flex-1">
                                <div className="flex items-center justify-between">
                                    <p className="text-sm text-gray-500">{stat.label}</p>
                                    {stat.trend && (
                                        <div className={`flex items-center gap-0.5 text-[10px] font-semibold ${stat.trend.startsWith('+') ? 'text-emerald-600' : 'text-red-600'}`}>
                                            {stat.trend.startsWith('+') ? <ArrowUpRight className="w-3 h-3" /> : <ArrowDownRight className="w-3 h-3" />}
                                            {stat.trend}
                                        </div>
                                    )}
                                </div>
                                <p className="text-sm font-bold text-gray-700">{stat.value}</p>
                            </div>
                        </div>
                    ))}
                </div>

                {/* Filters */}
                <div className={'bg-white rounded-xl border border-gray-200 p-4 flex flex-col'}>
                    <h2 className="text-xl font-semibold text-gray-700 mb-3">Filter</h2>
                    <div className={'grid md:grid-cols-4 gap-4'}>
                        <div>
                            <label htmlFor="invoice-id" className="block text-sm font-medium text-gray-700 mb-1">
                                Invoice Number
                            </label>
                            <input
                                ref={searchRef}
                                type="text"
                                id="invoice-id"
                                placeholder="Enter Invoice ID... (F)"
                                value={invoiceNumber}
                                onChange={(e) => setInvoiceNumber(e.target.value)}
                                className="w-full text-sm rounded-lg py-2 px-3 border-2 border-gray-200 focus:border-emerald-400 focus:outline-none transition-all"
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
                                className="w-full text-sm rounded-lg py-2 px-3 border-2 border-gray-200 focus:border-emerald-400 focus:outline-none transition-all"
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
                                className="w-full text-sm rounded-lg py-2 px-3 border-2 border-gray-200 focus:border-emerald-400 focus:outline-none transition-all"
                            />
                        </div>
                        <div className={'grid grid-cols-2 md:items-end items-start gap-2 text-white font-medium'}>
                            <button
                                onClick={handleSearch}
                                disabled={loading}
                                className={'bg-linear-to-r from-emerald-500 to-emerald-600 hover:from-emerald-600 hover:to-emerald-700 py-2 rounded-lg flex items-center justify-center transition-all disabled:opacity-50'}
                            >
                                {loading ? <Loader2 className="animate-spin" size={14} /> : <SearchCheck className="mr-2" size={14} />}
                                Search
                            </button>
                            <button
                                onClick={handleReset}
                                disabled={loading}
                                className={'bg-linear-to-r from-gray-500 to-gray-600 hover:from-gray-600 hover:to-gray-700 py-2 rounded-lg flex items-center justify-center transition-all disabled:opacity-50'}
                            >
                                <RefreshCw className="mr-2" size={14} />
                                Reset
                            </button>
                        </div>
                    </div>
                </div>

                {/* Invoice Table */}
                <div className="flex flex-col bg-white border border-gray-200 rounded-xl flex-1 p-4 justify-between overflow-hidden">
                    <div className="overflow-auto flex-1 rounded-lg scrollbar-thin scrollbar-thumb-emerald-300 scrollbar-track-gray-100">
                        <table className="min-w-full divide-y divide-gray-200">
                            <thead className="bg-linear-to-r from-emerald-500 to-emerald-600 sticky top-0 z-10">
                                <tr>
                                    {[
                                        'ID',
                                        'Invoice Number',
                                        'Customer',
                                        'Total Amount',
                                        'Date & Time',
                                        'Balance',
                                        'Cashier',
                                        'Action'
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
                                {loading ? (
                                    <tr>
                                        <td colSpan={5} className="px-6 py-8 text-center">
                                            <div className="flex items-center justify-center">
                                                <Loader2 className="animate-spin text-emerald-500 mr-2" size={24} />
                                                <span className="text-gray-500">Loading invoices...</span>
                                            </div>
                                        </td>
                                    </tr>
                                ) : invoices.length === 0 ? (
                                    <tr>
                                        <td colSpan={5} className="px-6 py-8 text-center text-gray-500">
                                            No invoices found. Try adjusting your filters.
                                        </td>
                                    </tr>
                                ) : (
                                    invoices.map((invoice, index) => (
                                        <tr
                                            key={invoice.invoiceID}
                                            onClick={() => setSelectedIndex(index)}
                                            className={`cursor-pointer transition-all ${
                                                selectedIndex === index
                                                    ? 'bg-emerald-50 border-l-4 border-l-emerald-500'
                                                    : 'hover:bg-gray-50'
                                            }`}
                                        >
                                            <td className="px-6 py-2 whitespace-nowrap text-sm font-semibold text-emerald-700">
                                                #{invoice.id}
                                            </td>
                                            <td className="px-6 py-2 whitespace-nowrap text-sm font-semibold text-gray-800">
                                                <div className="flex items-center gap-2">
                                                    {invoice.invoiceID}
                                                    {Number(invoice.refundedAmount) > 0 && (
                                                        <span className="px-2 py-0.5 bg-red-100 text-red-600 text-[10px] font-bold rounded-full border border-red-200 uppercase tracking-tighter">
                                                            Returned
                                                        </span>
                                                    )}
                                                </div>
                                            </td>
                                            <td className="px-6 py-2 whitespace-nowrap text-sm font-medium text-gray-700">
                                                {invoice.customerName}
                                            </td>
                                            <td className="px-6 py-2 whitespace-nowrap text-sm font-bold text-emerald-600">
                                                {formatCurrency(invoice.netAmount)}
                                            </td>
                                            <td className="px-6 py-2 whitespace-nowrap text-sm font-medium text-gray-600">
                                                <div className="flex flex-col">
                                                    <span className="font-semibold text-gray-800">{invoice.issuedDate.split(' ')[0]}</span>
                                                    <span className="text-[11px] text-gray-400 font-mono">{invoice.issuedDate.split(' ')[1]}</span>
                                                </div>
                                            </td>
                                            <td className="px-6 py-2 whitespace-nowrap text-sm font-bold text-orange-600">
                                                {formatCurrency(invoice.balance || 0)}
                                            </td>
                                            <td className="px-6 py-2 whitespace-nowrap text-sm font-medium text-gray-700">
                                                {invoice.cashier}
                                            </td>
                                            <td className="px-6 py-2 whitespace-nowrap text-sm font-medium">
                                                <div className="flex gap-2">
                                                    <button
                                                        onClick={(e) => {
                                                            e.stopPropagation();
                                                            handleViewInvoice(invoice.invoiceID);
                                                        }}
                                                        className="p-2 bg-linear-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white rounded-lg transition-all"
                                                        title="View Invoice"
                                                    >
                                                        <Eye size={16} />
                                                    </button>
                                                    <button
                                                        onClick={(e) => {
                                                            e.stopPropagation();
                                                            handlePrintInvoice(invoice.invoiceID);
                                                        }}
                                                        className="p-2 bg-linear-to-r from-emerald-500 to-emerald-600 hover:from-emerald-600 hover:to-emerald-700 text-white rounded-lg transition-all"
                                                        title="Print Invoice"
                                                    >
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

                    {/* Pagination */}
                    <nav className="bg-white flex items-center justify-between sm:px-6 pt-4 border-t-2 border-gray-100">
                        <div className="flex items-center text-sm text-gray-600">
                            Showing {invoices.length > 0 ? ((currentPage - 1) * itemsPerPage) + 1 : 0} to {Math.min(currentPage * itemsPerPage, totalRecords)} of {totalRecords} invoices
                        </div>
                        <div className="flex items-center space-x-2">
                            <button
                                onClick={() => goToPage(currentPage - 1)}
                                disabled={currentPage === 1 || loading}
                                className="flex items-center px-3 py-2 text-sm font-medium text-gray-600 hover:text-emerald-600 hover:bg-emerald-50 rounded-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                <ChevronLeft className="mr-2 h-5 w-5" /> Previous
                            </button>
                            
                            {/* Page Numbers */}
                            {[...Array(totalPages)].map((_, i) => {
                                const pageNum = i + 1;
                                // Show first, last, current, and adjacent pages
                                if (
                                    pageNum === 1 ||
                                    pageNum === totalPages ||
                                    (pageNum >= currentPage - 1 && pageNum <= currentPage + 1)
                                ) {
                                    return (
                                        <button
                                            key={pageNum}
                                            onClick={() => goToPage(pageNum)}
                                            disabled={loading}
                                            className={`px-4 py-2 text-sm font-medium rounded-lg transition-all ${
                                                currentPage === pageNum
                                                    ? 'bg-linear-to-r from-emerald-500 to-emerald-600 text-white'
                                                    : 'text-gray-600 hover:bg-emerald-50 hover:text-emerald-600'
                                            }`}
                                        >
                                            {pageNum}
                                        </button>
                                    );
                                } else if (pageNum === currentPage - 2 || pageNum === currentPage + 2) {
                                    return <span key={pageNum} className="text-gray-400 px-2">...</span>;
                                }
                                return null;
                            })}

                            <button
                                onClick={() => goToPage(currentPage + 1)}
                                disabled={currentPage === totalPages || loading}
                                className="flex items-center px-3 py-2 text-sm font-medium text-gray-600 hover:text-emerald-600 hover:bg-emerald-50 rounded-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                Next <ChevronRight className="ml-2 h-5 w-5" />
                            </button>
                        </div>
                    </nav>
                </div>

                {/* Invoice Detail Modal */}
                {showDetailModal && (
                    <div className="fixed inset-0 bg-gray-900/10 backdrop-blur-xs z-50 flex items-center justify-center p-4">
                        <div className="bg-white rounded-xl shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
                            {/* Modal Header */}
                            <div className="sticky top-0 bg-linear-to-r from-emerald-500 to-emerald-600 px-6 py-4 flex items-center justify-between rounded-t-xl">
                                <h2 className="text-2xl font-bold text-white">
                                    Invoice Details
                                    {Number(selectedInvoiceDetails?.refundedAmount || 0) > 0 && (
                                        <span className="ml-3 px-3 py-1 bg-red-500 text-white text-xs font-black rounded-full border border-red-400 uppercase tracking-widest shadow-sm">
                                            Returned
                                        </span>
                                    )}
                                </h2>
                                <button
                                    onClick={() => setShowDetailModal(false)}
                                    className="text-white hover:bg-white hover:bg-opacity-20 rounded-lg p-2 transition-all"
                                >
                                    <X size={24} />
                                </button>
                            </div>

                            {/* Modal Content */}
                            <div className="p-6">
                                {detailsLoading ? (
                                    <div className="flex items-center justify-center py-12">
                                        <Loader2 className="animate-spin text-emerald-500 mr-2" size={32} />
                                        <span className="text-gray-600">Loading invoice details...</span>
                                    </div>
                                ) : selectedInvoiceDetails ? (
                                    <div className="space-y-6">
                                        {/* Invoice Info Section */}
                                        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 p-4 bg-gray-50 rounded-xl">
                                            <div>
                                                <p className="text-[10px] text-gray-500 uppercase font-bold tracking-wider">Invoice Number</p>
                                                <p className="text-lg font-bold text-gray-800">{selectedInvoiceDetails.invoiceNo}</p>
                                            </div>
                                            <div>
                                                <p className="text-[10px] text-gray-500 uppercase font-bold tracking-wider">Date & Time</p>
                                                <div className="flex items-center gap-2">
                                                    <p className="text-lg font-semibold text-gray-700">{selectedInvoiceDetails.date.split(' ')[0]}</p>
                                                    <span className="text-[11px] text-gray-400 font-mono bg-gray-100 px-2 py-0.5 rounded-full">{selectedInvoiceDetails.date.split(' ')[1]}</span>
                                                </div>
                                            </div>
                                            <div>
                                                <p className="text-[10px] text-emerald-600 uppercase font-bold tracking-wider">Net Amount</p>
                                                <p className="text-lg font-black text-emerald-600">
                                                    {formatCurrency(selectedInvoiceDetails.total)}
                                                </p>
                                            </div>
                                            <div>
                                                <p className="text-[10px] text-indigo-600 uppercase font-bold tracking-wider">Profit Margin</p>
                                                <p className="text-lg font-black text-indigo-600">
                                                    {formatCurrency(selectedInvoiceDetails.profit)}
                                                </p>
                                            </div>
                                        </div>

                                        {/* Financial Overview Row */}
                                        <div className="grid grid-cols-3 gap-4 border-t border-b border-gray-100 py-4">
                                            <div className="text-center">
                                                <p className="text-[10px] text-gray-400 uppercase font-bold">Gross Total</p>
                                                <p className="text-sm font-bold text-gray-700">{formatCurrency(selectedInvoiceDetails.grossAmount)}</p>
                                            </div>
                                            <div className="text-center border-l border-r border-gray-100">
                                                <p className="text-[10px] text-gray-400 uppercase font-bold">Total Discount</p>
                                                <p className="text-sm font-bold text-red-500">{formatCurrency(selectedInvoiceDetails.discount)}</p>
                                            </div>
                                            <div className="text-center">
                                                <p className="text-[10px] text-gray-400 uppercase font-bold">Credit Balance</p>
                                                <p className="text-sm font-bold text-orange-600">{formatCurrency(selectedInvoiceDetails.creditBalance)}</p>
                                            </div>
                                        </div>

                                        {/* Items Table */}
                                        <div className="overflow-x-auto">
                                            <table className="min-w-full divide-y divide-gray-200 border border-gray-100 rounded-xl overflow-hidden">
                                                <thead className="bg-gray-50">
                                                    <tr>
                                                        <th className="px-4 py-2 text-left text-[10px] font-bold text-gray-400 uppercase tracking-widest">Item</th>
                                                        <th className="px-4 py-2 text-right text-[10px] font-bold text-gray-400 uppercase tracking-widest">Price</th>
                                                        <th className="px-4 py-2 text-center text-[10px] font-bold text-gray-400 uppercase tracking-widest">Qty</th>
                                                        <th className="px-4 py-2 text-right text-[10px] font-bold text-emerald-600 uppercase tracking-widest">Total</th>
                                                    </tr>
                                                </thead>
                                                <tbody className="bg-white divide-y divide-gray-100">
                                                    {selectedInvoiceDetails.items && selectedInvoiceDetails.items.map((item: any, index: number) => {
                                                        const getUnitConfig = (unit: string, isBulkItem: boolean) => {
                                                            const u = unit.toLowerCase().trim();
                                                            if (u.includes('kg') || u.includes('kilo') || u.includes('gram') || u.includes('weight') || (isBulkItem && (u === '' || u === 'pcs'))) 
                                                                return { subLabel: 'g', factor: 1000 };
                                                            if (u === 'l' || u.includes('ltr') || u.includes('liter') || u.includes('litre') || u.includes('vol') || u.includes('ml')) 
                                                                return { subLabel: 'ml', factor: 1000 };
                                                            if (u === 'm' || (u.includes('meter') && !u.includes('centi')) || u.includes('metre') || u.includes('cm')) 
                                                                return { subLabel: 'cm', factor: 100 };
                                                            if (isBulkItem) return { subLabel: 'Units', factor: 1000 };
                                                            return null;
                                                        };

                                                        let displayQty = item.quantity.toString();
                                                        let displayUnit = item.category || '';
                                                        const unitConfig = getUnitConfig(displayUnit, item.isBulk || false);

                                                        if (unitConfig && item.quantity < 1) {
                                                            displayQty = Math.round(item.quantity * unitConfig.factor).toString();
                                                            displayUnit = unitConfig.subLabel;
                                                        }

                                                        return (
                                                            <tr key={index} className="hover:bg-gray-50/50 transition-colors">
                                                                <td className="px-4 py-2.5 text-sm font-medium text-gray-800">{item.name}</td>
                                                                <td className="px-4 py-2.5 text-sm text-right text-gray-500 font-mono">{formatCurrency(item.price)}</td>
                                                                <td className="px-4 py-2.5 text-sm text-center text-gray-700 font-bold">{displayQty} <span className="text-[10px] text-gray-400 font-normal">{displayUnit}</span></td>
                                                                <td className="px-4 py-2.5 text-sm font-black text-right text-emerald-600">
                                                                    {formatCurrency(item.price * item.quantity)}
                                                                </td>
                                                            </tr>
                                                        );
                                                    })}
                                                </tbody>
                                            </table>
                                        </div>

                                        {/* Payments Row */}
                                        {selectedInvoiceDetails.payments && selectedInvoiceDetails.payments.length > 0 && (
                                            <div className="flex flex-wrap gap-2">
                                                {selectedInvoiceDetails.payments.map((payment: any, index: number) => (
                                                    <div key={index} className="flex-1 min-w-[140px] flex justify-between items-center p-2 bg-gray-50 rounded-lg border border-gray-100">
                                                        <span className="text-[10px] font-bold text-gray-400 uppercase">{payment.method}</span>
                                                        <span className="text-xs font-bold text-gray-700">
                                                            {formatCurrency(payment.amount)}
                                                        </span>
                                                    </div>
                                                ))}
                                            </div>
                                        )}

                                        {/* Action Buttons */}
                                        <div className="flex gap-3 pt-4">
                                            <button
                                                onClick={() => handlePrintInvoice(selectedInvoiceDetails.invoiceNo)}
                                                className="flex-1 bg-linear-to-r from-emerald-500 to-emerald-600 hover:from-emerald-600 hover:to-emerald-700 text-white px-4 py-3 rounded-lg transition-all flex items-center justify-center gap-2 font-medium"
                                            >
                                                <Printer size={18} />
                                                Print Invoice
                                            </button>
                                            <button
                                                onClick={() => setShowDetailModal(false)}
                                                className="flex-1 bg-linear-to-r from-gray-500 to-gray-600 hover:from-gray-600 hover:to-gray-700 text-white px-4 py-3 rounded-lg transition-all flex items-center justify-center gap-2 font-medium"
                                            >
                                                Close
                                            </button>
                                        </div>
                                    </div>
                                ) : (
                                    <div className="text-center py-8 text-gray-500">
                                        No invoice details available
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </>
    );
}

export default ManageInvoice;
