import {
    CalendarDays,
    ChartLine,
    ChevronLeft,
    ChevronRight,
    Eye,
    FileSpreadsheet,
    Printer,
    RefreshCw,
    SearchCheck,
    ChartNoAxesCombined,
    ArrowUpRight,
    Loader2,
    X,
    RotateCcw
} from 'lucide-react';
import { useEffect, useState, useRef } from 'react';
import toast, { Toaster } from 'react-hot-toast';
import invoiceService from '../../../services/invoiceService';
import type { Invoice, InvoiceStats } from '../../../services/invoiceService';
import { printBill } from "../../../utils/billPrinter";
import TypeableSelect from '../../../components/TypeableSelect';
import { userService } from '../../../services/userService';

function ManageUserSales() {
    // State Management
    const [sales, setSales] = useState<Invoice[]>([]);
    const [stats, setStats] = useState<InvoiceStats | null>(null);
    const [cashiers, setCashiers] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [statsLoading, setStatsLoading] = useState(true);
    const [selectedIndex, setSelectedIndex] = useState(0);
    
    // Filter State
    const [invoiceNumber, setInvoiceNumber] = useState('');
    const [cashierName, setCashierName] = useState('');
    const [fromDate, setFromDate] = useState('');
    const [toDate, setToDate] = useState('');
    
    // Pagination State
    const [currentPage, setCurrentPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const [totalRecords, setTotalRecords] = useState(0);
    const itemsPerPage = 10;

    // Detail Modal State
    const [showDetailModal, setShowDetailModal] = useState(false);
    const [selectedInvoiceDetails, setSelectedInvoiceDetails] = useState<any>(null);
    const [detailsLoading, setDetailsLoading] = useState(false);

    // Ref for focus
    const searchRef = useRef<HTMLInputElement>(null);

    // Fetch Sales
    const fetchSales = async () => {
        try {
            setLoading(true);
            const response = await invoiceService.getAllInvoices({
                invoiceNumber: invoiceNumber || undefined,
                cashierName: cashierName || undefined,
                fromDate: fromDate || undefined,
                toDate: toDate || undefined,
                page: currentPage,
                limit: itemsPerPage
            });

            if (response.success) {
                setSales(response.data);
                setTotalPages(response.pagination.totalPages);
                setTotalRecords(response.pagination.totalRecords);
                setSelectedIndex(0);
            }
        } catch (error) {
            console.error('Error fetching sales:', error);
            toast.error('Failed to load sales data');
            setSales([]);
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
                toDate: toDate || undefined,
                cashierName: cashierName || undefined
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

    // Fetch Cashiers
    const fetchCashiers = async () => {
        try {
            const response = await userService.getAllUsers();
            if (response.success) {
                // Map users to SelectOption format and sort alphabetically
                const options = response.data
                    .map((u: any) => ({
                        value: u.name,
                        label: `${u.name} (${u.role_name || 'User'})`
                    }))
                    .sort((a: any, b: any) => a.label.localeCompare(b.label));
                setCashiers(options);
            }
        } catch (error) {
            console.error('Error fetching cashiers:', error);
            toast.error('Failed to load cashier list');
        }
    };

    // Initial Load
    useEffect(() => {
        fetchSales();
        fetchStats();
    }, [currentPage]);

    useEffect(() => {
        fetchCashiers();
    }, []);

    // Keyboard Navigation
    useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            const isTyping = e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement;

            if (e.key === "ArrowDown") {
                if (isTyping) return;
                e.preventDefault();
                setSelectedIndex((prev) => (prev < sales.length - 1 ? prev + 1 : prev));
            } else if (e.key === "ArrowUp") {
                if (isTyping) return;
                e.preventDefault();
                setSelectedIndex((prev) => (prev > 0 ? prev - 1 : prev));
            } else if (e.key === "Enter") {
                if (isTyping && e.target === searchRef.current) {
                    handleSearch();
                    return;
                }
                if (!showDetailModal && sales.length > 0) {
                    e.preventDefault();
                    handleViewDetails(sales[selectedIndex].invoiceID);
                }
            } else if (e.key === "Escape") {
                e.preventDefault();
                if (showDetailModal) setShowDetailModal(false);
                if (isTyping) (e.target as HTMLElement).blur();
            } else if (e.key.toLowerCase() === "p") {
                if (isTyping) return;
                e.preventDefault();
                if (showDetailModal && selectedInvoiceDetails) {
                    handlePrint(selectedInvoiceDetails.invoiceNo);
                } else if (!showDetailModal && sales.length > 0) {
                    handlePrint(sales[selectedIndex].invoiceID);
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
    }, [sales.length, selectedIndex, showDetailModal, selectedInvoiceDetails]);

    // Handle Search
    const handleSearch = () => {
        if (currentPage === 1) {
            fetchSales();
            fetchStats();
        } else {
            setCurrentPage(1);
        }
    };

    // Handle Reset
    const handleReset = () => {
        setInvoiceNumber('');
        setCashierName('');
        setFromDate('');
        setToDate('');
        setCurrentPage(1);
        setTimeout(() => {
            fetchSales();
            fetchStats();
        }, 100);
    };

    // Format currency
    const formatCurrency = (amount: string | number) => {
        return `LKR ${Number(amount).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
    };

    // Handle View Details
    const handleViewDetails = async (invoiceID: string) => {
        try {
            setDetailsLoading(true);
            setShowDetailModal(true);
            const response = await invoiceService.getInvoiceDetails(invoiceID);
            if (response.success) {
                setSelectedInvoiceDetails(response.data);
            }
        } catch (error) {
            console.error('Error fetching details:', error);
            toast.error('Failed to load details');
        } finally {
            setDetailsLoading(false);
        }
    };

    // Handle Print
    const handlePrint = async (invoiceID: string) => {
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
                        discount: 0
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
            console.error('Error printing:', error);
            toast.error('Failed to print');
        }
    };

    const summaryCards = [
        {
            icon: ChartNoAxesCombined,
            label: 'Total Sales',
            value: statsLoading ? 'Loading...' : formatCurrency(stats?.totalSales || 0),
            trend: '+12.5%',
            color: 'bg-gradient-to-br from-emerald-400 to-emerald-500',
            iconColor: 'text-white'
        },
        {
            icon: FileSpreadsheet,
            label: 'Invoices',
            value: statsLoading ? 'Loading...' : stats?.invoiceCount.toString() || '0',
            trend: '+8.3%',
            color: 'bg-gradient-to-br from-blue-400 to-blue-500',
            iconColor: 'text-white'
        },
        {
            icon: RotateCcw,
            label: 'Refunded',
            value: statsLoading ? 'Loading...' : formatCurrency(stats?.totalRefunded || 0),
            trend: '',
            color: 'bg-gradient-to-br from-red-400 to-red-500',
            iconColor: 'text-white'
        },
        {
            icon: ChartLine,
            label: 'Total Profit',
            value: statsLoading ? 'Loading...' : formatCurrency(stats?.totalProfit || 0),
            trend: '',
            color: 'bg-gradient-to-br from-indigo-400 to-indigo-500',
            iconColor: 'text-white'
        },
        {
            icon: CalendarDays,
            label: 'Period',
            value: statsLoading ? 'Loading...' : stats?.dateRange || 'All Time',
            trend: '',
            color: 'bg-gradient-to-br from-purple-400 to-purple-500',
            iconColor: 'text-white'
        },
    ];

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
                            <span className="text-gray-700 font-medium">User Sales</span>
                        </div>
                        <h1 className="text-3xl font-semibold bg-linear-to-r from-gray-800 to-gray-600 bg-clip-text text-transparent leading-tight">
                            User Sales Management
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
                <div className="grid md:grid-cols-5 grid-cols-2 gap-4">
                    {summaryCards.map((stat, i) => (
                        <div key={i} className="bg-white p-4 rounded-xl border border-gray-200 flex items-center gap-4 hover:shadow-sm transition-shadow">
                            <div className={`p-3 rounded-lg ${stat.color}`}>
                                <stat.icon className="w-6 h-6 text-white" />
                            </div>
                            <div className="flex-1">
                                <div className="flex items-center justify-between">
                                    <p className="text-sm text-gray-500">{stat.label}</p>
                                    {stat.trend && (
                                        <div className={`flex items-center gap-0.5 text-[10px] font-semibold text-emerald-600`}>
                                            <ArrowUpRight className="w-3 h-3" />
                                            {stat.trend}
                                        </div>
                                    )}
                                </div>
                                <p className="text-sm font-bold text-gray-700 truncate">{stat.value}</p>
                            </div>
                        </div>
                    ))}
                </div>

                {/* Filter Section */}
                <div className="bg-white rounded-xl border border-gray-200 p-4">
                    <h2 className="text-xl font-semibold text-gray-700 mb-3">Filter</h2>
                    <div className="grid md:grid-cols-4 gap-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Invoice ID</label>
                            <input
                                ref={searchRef}
                                type="text"
                                value={invoiceNumber}
                                onChange={(e) => setInvoiceNumber(e.target.value)}
                                placeholder="Enter Invoice ID... (F)"
                                className="w-full text-sm rounded-lg py-2 px-3 border-2 border-gray-100 focus:border-emerald-400 focus:outline-none transition-all"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Cashier Name</label>
                            <TypeableSelect
                                options={cashiers}
                                value={cashierName}
                                onChange={(opt) => {
                                    setCashierName(opt ? String(opt.value) : '');
                                    // Auto-trigger search when selected
                                    setTimeout(() => handleSearch(), 0);
                                }}
                                placeholder="Select Cashier..."
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">From Date</label>
                            <input
                                type="date"
                                value={fromDate}
                                onChange={(e) => setFromDate(e.target.value)}
                                className="w-full text-sm rounded-lg py-2 px-3 border-2 border-gray-100 focus:border-emerald-400 focus:outline-none transition-all"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">To Date</label>
                            <input
                                type="date"
                                value={toDate}
                                onChange={(e) => setToDate(e.target.value)}
                                className="w-full text-sm rounded-lg py-2 px-3 border-2 border-gray-100 focus:border-emerald-400 focus:outline-none transition-all"
                            />
                        </div>
                        <div className="grid grid-cols-2 gap-2 items-end">
                            <button
                                onClick={handleSearch}
                                disabled={loading}
                                className="bg-emerald-500 text-white font-bold py-2 rounded-lg hover:bg-emerald-600 transition-colors flex items-center justify-center gap-2 disabled:opacity-50"
                            >
                                {loading ? <Loader2 className="animate-spin" size={16} /> : <SearchCheck size={16} />}
                                Search
                            </button>
                            <button
                                onClick={handleReset}
                                disabled={loading}
                                className="bg-gray-500 text-white font-bold py-2 rounded-lg hover:bg-gray-600 transition-colors flex items-center justify-center gap-2 disabled:opacity-50"
                            >
                                <RefreshCw size={16} />
                                Reset
                            </button>
                        </div>
                    </div>
                </div>

                {/* Sales Table */}
                <div className="bg-white rounded-xl border border-gray-200 p-4 flex flex-col justify-between h-full shadow-sm">
                    <div className="overflow-y-auto max-h-md md:h-[300px] lg:h-[300px] rounded-lg scrollbar-thin scrollbar-thumb-emerald-300 scrollbar-track-gray-100">
                        <table className="min-w-full divide-y divide-gray-200 relative">
                            <thead className="sticky top-0 z-10 bg-emerald-500 text-white shadow-sm">
                                <tr>
                                    {[
                                        'ID', 'Customer', 'Gross', 'Discount', 'Net Total', 'Profit', 'Cash', 'Card', 'Balance', 'Cashier', 'Date & Time', 'Action'
                                    ].map((head, i) => (
                                        <th key={i} className="px-4 py-3 text-left text-[10px] font-bold text-white uppercase tracking-widest">
                                            <div className="flex items-center gap-1">
                                                {head}
                                                {head === 'Cashier' && <RefreshCw size={10} className="text-emerald-200 animate-pulse" />}
                                            </div>
                                        </th>
                                    ))}
                                </tr>
                            </thead>
                            <tbody className="bg-white divide-y divide-gray-100">
                                {loading ? (
                                    <tr>
                                        <td colSpan={12} className="py-20 text-center">
                                            <div className="flex flex-col items-center gap-2">
                                                <Loader2 className="animate-spin text-emerald-500" size={40} />
                                                <span className="text-gray-500 font-medium">Fetching sales data...</span>
                                            </div>
                                        </td>
                                    </tr>
                                ) : sales.length === 0 ? (
                                    <tr>
                                        <td colSpan={12} className="py-12 text-center text-gray-500 font-medium">
                                            No sales records found for this period.
                                        </td>
                                    </tr>
                                ) : (
                                    sales.map((sale, idx) => (
                                        <tr key={sale.id} onClick={() => setSelectedIndex(idx)} className={`cursor-pointer transition-colors ${selectedIndex === idx ? 'bg-emerald-50/50 border-l-4 border-emerald-500' : 'hover:bg-gray-50'}`}>
                                            <td className="px-4 py-3 whitespace-nowrap text-sm font-semibold text-gray-800 tracking-tight">
                                                #{sale.id} <span className="text-[10px] text-gray-400 font-normal">({sale.invoiceID})</span>
                                            </td>
                                            <td className="px-4 py-3 whitespace-nowrap text-sm font-medium text-gray-700">{sale.customerName}</td>
                                            <td className="px-4 py-3 whitespace-nowrap text-sm font-bold text-gray-800">{formatCurrency(sale.grossAmount)}</td>
                                            <td className="px-4 py-3 whitespace-nowrap text-sm font-bold text-red-500">{formatCurrency(sale.discount)}</td>
                                            <td className="px-4 py-3 whitespace-nowrap text-sm font-bold text-emerald-600">{formatCurrency(sale.netAmount)}</td>
                                            <td className="px-4 py-3 whitespace-nowrap text-sm font-bold text-indigo-600">{formatCurrency(sale.profit)}</td>
                                            <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-600 font-medium">{formatCurrency(sale.cashPay)}</td>
                                            <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-600 font-medium">{formatCurrency(sale.cardPay)}</td>
                                            <td className="px-4 py-3 whitespace-nowrap text-sm font-bold text-orange-600">{formatCurrency(sale.balance)}</td>
                                            <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-700 font-medium">{sale.cashier}</td>
                                            <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-500 font-mono text-[11px]">
                                                {sale.issuedDate.replace(' ', '\n')}
                                            </td>
                                            <td className="px-4 py-3 whitespace-nowrap text-sm font-medium">
                                                <div className="flex gap-2">
                                                    <button onClick={(e) => { e.stopPropagation(); handleViewDetails(sale.invoiceID); }} className="p-1.5 bg-blue-500 text-white rounded-md hover:bg-blue-600 transition-colors shadow-sm">
                                                        <Eye size={14} />
                                                    </button>
                                                    <button onClick={(e) => { e.stopPropagation(); handlePrint(sale.invoiceID); }} className="p-1.5 bg-emerald-500 text-white rounded-md hover:bg-emerald-600 transition-colors shadow-sm">
                                                        <Printer size={14} />
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
                    <div className="mt-4 flex items-center justify-between border-t-2 border-gray-50 pt-4">
                        <div className="text-xs text-gray-500">
                            Showing {sales.length > 0 ? ((currentPage - 1) * itemsPerPage) + 1 : 0} to {Math.min(currentPage * itemsPerPage, totalRecords)} of {totalRecords} sales
                        </div>
                        <div className="flex items-center gap-2">
                            <button onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))} disabled={currentPage === 1 || loading} className="p-2 rounded-lg hover:bg-gray-100 disabled:opacity-50 transition-colors">
                                <ChevronLeft size={18} />
                            </button>
                            {[...Array(totalPages)].map((_, i) => {
                                const p = i + 1;
                                if (p === 1 || p === totalPages || (p >= currentPage - 1 && p <= currentPage + 1)) {
                                    return (
                                        <button key={p} onClick={() => setCurrentPage(p)} className={`px-3 py-1.5 rounded-lg text-sm font-bold transition-all ${currentPage === p ? 'bg-emerald-500 text-white shadow-md' : 'text-gray-600 hover:bg-gray-100'}`}>
                                            {p}
                                        </button>
                                    );
                                } else if (p === currentPage - 2 || p === currentPage + 2) {
                                    return <span key={p} className="text-gray-300">...</span>;
                                }
                                return null;
                            })}
                            <button onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))} disabled={currentPage === totalPages || loading} className="p-2 rounded-lg hover:bg-gray-100 disabled:opacity-50 transition-colors">
                                <ChevronRight size={18} />
                            </button>
                        </div>
                    </div>
                </div>

                {/* Detail Modal */}
                {showDetailModal && (
                    <div className="fixed inset-0 bg-gray-900/10 backdrop-blur-xs z-50 flex items-center justify-center p-4">
                        <div className="bg-white rounded-2xl w-full max-w-4xl max-h-[90vh] overflow-hidden shadow-2xl flex flex-col">
                            <div className="bg-linear-to-r from-emerald-500 to-emerald-600 p-4 flex items-center justify-between text-white">
                                <h3 className="text-lg font-bold">Sales Detail View</h3>
                                <button onClick={() => setShowDetailModal(false)} className="hover:bg-white/20 p-1.5 rounded-lg transition-colors">
                                    <X size={20} />
                                </button>
                            </div>
                            <div className="flex-1 overflow-y-auto p-6">
                                {detailsLoading ? (
                                    <div className="h-64 flex flex-col items-center justify-center gap-3">
                                        <Loader2 className="animate-spin text-emerald-500" size={40} />
                                        <span className="text-gray-500">Loading details...</span>
                                    </div>
                                ) : selectedInvoiceDetails && (
                                    <div className="space-y-6">
                                        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-4">
                                            <div className="bg-gray-50 p-3 rounded-xl">
                                                <p className="text-[10px] text-gray-500 uppercase font-bold tracking-wider">Invoice No</p>
                                                <p className="font-bold text-gray-800">{selectedInvoiceDetails.invoiceNo}</p>
                                            </div>
                                            <div className="bg-gray-50 p-3 rounded-xl">
                                                <p className="text-[10px] text-gray-500 uppercase font-bold tracking-wider">Date & Time</p>
                                                <p className="font-bold text-gray-800 text-sm">{selectedInvoiceDetails.date}</p>
                                            </div>
                                            <div className="bg-emerald-50 p-3 rounded-xl">
                                                <p className="text-[10px] text-emerald-600 uppercase font-bold tracking-wider">Gross Total</p>
                                                <p className="font-bold text-emerald-700">{formatCurrency(selectedInvoiceDetails.grossAmount)}</p>
                                            </div>
                                            <div className="bg-blue-50 p-3 rounded-xl border border-blue-100">
                                                <p className="text-[10px] text-blue-600 uppercase font-bold tracking-wider">Profit</p>
                                                <p className="font-bold text-blue-700">{formatCurrency(selectedInvoiceDetails.profit)}</p>
                                            </div>
                                            <div className="bg-gray-50 p-3 rounded-xl">
                                                <p className="text-[10px] text-gray-500 uppercase font-bold tracking-wider">Customer</p>
                                                <p className="font-bold text-gray-800 truncate">{selectedInvoiceDetails.customer}</p>
                                            </div>
                                        </div>

                                        <div className="grid grid-cols-3 gap-4 border-t border-b border-gray-100 py-4 font-mono">
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

                                        <div className="rounded-xl border border-gray-100 overflow-hidden">
                                            <table className="w-full text-left">
                                                <thead className="bg-gray-50 text-[10px] font-bold text-gray-400 uppercase tracking-widest">
                                                    <tr>
                                                        <th className="py-3 px-2">Product</th>
                                                        <th className="py-3 px-2 text-right">Cost</th>
                                                        <th className="py-3 px-2 text-right">Price</th>
                                                        <th className="py-3 px-2 text-center">Qty</th>
                                                        <th className="py-3 px-2 text-right">Profit</th>
                                                        <th className="py-3 px-2 text-right">Total</th>
                                                    </tr>
                                                </thead>
                                                <tbody className="divide-y divide-gray-50">
                                                    {selectedInvoiceDetails.items?.map((item: any, i: number) => (
                                                        <tr key={i} className="border-b border-gray-50 hover:bg-gray-50/50 transition-colors">
                                                            <td className="py-3 px-2 text-sm font-medium text-gray-700">{item.name}</td>
                                                            <td className="py-3 px-2 text-sm text-right text-gray-400 font-mono italic">{formatCurrency(item.costPrice)}</td>
                                                            <td className="py-3 px-2 text-sm text-right text-gray-600 font-mono">{formatCurrency(item.price)}</td>
                                                            <td className="py-3 px-2 text-sm text-center text-gray-600 font-bold">{item.quantity}</td>
                                                            <td className="py-3 px-2 text-sm text-right font-bold text-blue-600">
                                                                {formatCurrency((item.price - (item.costPrice || 0)) * item.quantity)}
                                                            </td>
                                                            <td className="py-3 px-2 text-sm text-right font-black text-gray-800">
                                                                {formatCurrency(item.price * item.quantity)}
                                                            </td>
                                                        </tr>
                                                    ))}
                                                </tbody>
                                            </table>
                                        </div>

                                        <div className="flex justify-between gap-6 pt-4 border-t">
                                            <div className="flex-1 space-y-2">
                                                <h4 className="text-xs font-bold text-gray-400 uppercase tracking-widest">Payment Info</h4>
                                                {selectedInvoiceDetails.payments?.map((p: any, i: number) => (
                                                    <div key={i} className="flex justify-between items-center bg-gray-50 px-3 py-1.5 rounded-lg border border-gray-100">
                                                        <span className="text-xs font-medium text-gray-600">{p.method}</span>
                                                        <span className="text-sm font-bold text-gray-800">{formatCurrency(p.amount)}</span>
                                                    </div>
                                                ))}
                                                {selectedInvoiceDetails.creditBalance > 0 && (
                                                    <div className="flex justify-between items-center bg-orange-50 px-3 py-1.5 rounded-lg border border-orange-100">
                                                        <span className="text-xs font-bold text-orange-600 uppercase">Credit Balance</span>
                                                        <span className="text-sm font-black text-orange-700">{formatCurrency(selectedInvoiceDetails.creditBalance)}</span>
                                                    </div>
                                                )}
                                            </div>

                                            <div className="w-72 space-y-2">
                                                <div className="flex justify-between text-sm">
                                                    <span className="text-gray-500 font-medium">Subtotal</span>
                                                    <span className="font-bold text-gray-700">{formatCurrency(selectedInvoiceDetails.subTotal || selectedInvoiceDetails.total)}</span>
                                                </div>
                                                <div className="flex justify-between text-sm">
                                                    <span className="text-gray-500 font-medium">Discount</span>
                                                    <span className="font-bold text-red-500">-{formatCurrency(selectedInvoiceDetails.discount || 0)}</span>
                                                </div>
                                                <div className="h-px bg-gray-100 w-full my-2"></div>
                                                <div className="flex justify-between text-lg font-black bg-emerald-50 p-2 rounded-lg border border-emerald-100">
                                                    <span className="text-emerald-800 uppercase text-xs mt-1.5">Net Total</span>
                                                    <span className="text-emerald-700">{formatCurrency(selectedInvoiceDetails.total)}</span>
                                                </div>
                                                <div className="flex justify-between text-md font-bold text-blue-600 px-2">
                                                    <span className="uppercase text-[10px] mt-1">Total Profit</span>
                                                    <span>{formatCurrency(selectedInvoiceDetails.profit || 0)}</span>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                )}
                            </div>
                            <div className="p-4 bg-gray-50 flex gap-2">
                                <button onClick={() => handlePrint(selectedInvoiceDetails.invoiceNo)} className="flex-1 bg-emerald-500 text-white font-bold py-2 rounded-xl hover:bg-emerald-600 transition-colors flex items-center justify-center gap-2">
                                    <Printer size={18} /> Print Invoice
                                </button>
                                <button onClick={() => setShowDetailModal(false)} className="px-6 py-2 bg-white border border-gray-200 text-gray-600 font-bold rounded-xl hover:bg-gray-50 transition-colors">
                                    Close
                                </button>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </>
    );
}

export default ManageUserSales;