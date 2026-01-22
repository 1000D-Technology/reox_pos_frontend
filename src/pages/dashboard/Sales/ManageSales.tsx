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
    Loader2,
    X,
    RotateCcw
} from "lucide-react";
import { useEffect, useState } from "react";
import invoiceService from "../../../services/invoiceService";
import type { Invoice, InvoiceStats } from "../../../services/invoiceService";
import toast, { Toaster } from 'react-hot-toast';
import { printBill } from "../../../utils/billPrinter";

function ManageSales() {
    // State Management
    const [sales, setSales] = useState<Invoice[]>([]);
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

    // Detail Modal State
    const [showDetailModal, setShowDetailModal] = useState(false);
    const [selectedInvoiceDetails, setSelectedInvoiceDetails] = useState<any>(null);
    const [detailsLoading, setDetailsLoading] = useState(false);

    // Fetch Sales
    const fetchSales = async () => {
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
        fetchSales();
        fetchStats();
    }, [currentPage]);

    // Handle Search
    const handleSearch = () => {
        setCurrentPage(1);
        fetchSales();
        fetchStats();
    };

    // Handle Reset
    const handleReset = () => {
        setInvoiceNumber('');
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

    // Keyboard Navigation
    useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            if (e.key === "ArrowDown") {
                e.preventDefault();
                setSelectedIndex((prev) => (prev < sales.length - 1 ? prev + 1 : prev));
            } else if (e.key === "ArrowUp") {
                e.preventDefault();
                setSelectedIndex((prev) => (prev > 0 ? prev - 1 : prev));
            }
        };
        window.addEventListener("keydown", handleKeyDown);
        return () => window.removeEventListener("keydown", handleKeyDown);
    }, [sales.length]);

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
                {/* Breadcrumb & Title */}
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

                {/* Summary Cards */}
                <div className="grid md:grid-cols-4 grid-cols-2 gap-4">
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
                                type="text"
                                value={invoiceNumber}
                                onChange={(e) => setInvoiceNumber(e.target.value)}
                                onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
                                placeholder="Enter Invoice ID..."
                                className="w-full text-sm rounded-lg py-2 px-3 border-2 border-gray-100 focus:border-emerald-400 focus:outline-none transition-all"
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
                        <div className="grid grid-cols-2 gap-2 md:items-end">
                            <button onClick={handleSearch} disabled={loading} className="bg-gradient-to-r from-emerald-500 to-emerald-600 text-white py-2 rounded-lg flex items-center justify-center font-medium hover:from-emerald-600 hover:to-emerald-700 transition-all disabled:opacity-50">
                                {loading ? <Loader2 className="animate-spin" size={14} /> : <SearchCheck className="mr-2" size={14} />}
                                Search
                            </button>
                            <button onClick={handleReset} disabled={loading} className="bg-gradient-to-r from-gray-500 to-gray-600 text-white py-2 rounded-lg flex items-center justify-center font-medium hover:from-gray-600 hover:to-gray-700 transition-all disabled:opacity-50">
                                <RefreshCw className="mr-2" size={14} />
                                Reset
                            </button>
                        </div>
                    </div>
                </div>

                {/* Table Section */}
                <div className="bg-white border border-gray-200 rounded-xl p-4 flex-1 flex flex-col justify-between overflow-hidden">
                    <div className="overflow-x-auto overflow-y-auto max-h-[500px] rounded-lg scrollbar-thin scrollbar-thumb-emerald-300 scrollbar-track-gray-50">
                        <table className="min-w-full divide-y divide-gray-200">
                            <thead className="bg-gradient-to-r from-emerald-500 to-emerald-600 sticky top-0 z-10">
                                <tr>
                                    {[
                                        'Invoice ID', 'Customer', 'Gross', 'Discount', 'Net', 'Cash Pay', 'Card Pay', 'Balance', 'Cashier', 'Issued At', 'Actions'
                                    ].map((head, i, arr) => (
                                        <th key={i} className={`px-4 py-3 text-left text-xs font-bold text-white uppercase tracking-wider ${i === 0 ? 'rounded-tl-lg' : i === arr.length - 1 ? 'rounded-tr-lg' : ''}`}>
                                            {head}
                                        </th>
                                    ))}
                                </tr>
                            </thead>
                            <tbody className="bg-white divide-y divide-gray-200">
                                {loading ? (
                                    <tr>
                                        <td colSpan={11} className="py-12 text-center">
                                            <div className="flex flex-col items-center gap-2">
                                                <Loader2 className="animate-spin text-emerald-500" size={32} />
                                                <span className="text-gray-500 font-medium">Loading sales records...</span>
                                            </div>
                                        </td>
                                    </tr>
                                ) : sales.length === 0 ? (
                                    <tr>
                                        <td colSpan={11} className="py-12 text-center text-gray-500 font-medium">
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
                                            <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-600 font-medium">{formatCurrency(sale.cashPay)}</td>
                                            <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-600 font-medium">{formatCurrency(sale.cardPay)}</td>
                                            <td className="px-4 py-3 whitespace-nowrap text-sm font-bold text-blue-600">{formatCurrency(sale.balance)}</td>
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
                    <div className="fixed inset-0 bg-black/40 backdrop-blur-[2px] z-50 flex items-center justify-center p-4">
                        <div className="bg-white rounded-2xl w-full max-w-4xl max-h-[90vh] overflow-hidden shadow-2xl flex flex-col">
                            <div className="bg-gradient-to-r from-emerald-500 to-emerald-600 p-4 flex items-center justify-between text-white">
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
                                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                                            <div className="bg-gray-50 p-3 rounded-xl">
                                                <p className="text-[10px] text-gray-500 uppercase font-bold tracking-wider">Invoice No</p>
                                                <p className="font-bold text-gray-800">{selectedInvoiceDetails.invoiceNo}</p>
                                            </div>
                                            <div className="bg-gray-50 p-3 rounded-xl">
                                                <p className="text-[10px] text-gray-500 uppercase font-bold tracking-wider">Date & Time</p>
                                                <p className="font-bold text-gray-800 text-sm">{selectedInvoiceDetails.date}</p>
                                            </div>
                                            <div className="bg-gray-50 p-3 rounded-xl">
                                                <p className="text-[10px] text-gray-500 uppercase font-bold tracking-wider">Customer</p>
                                                <p className="font-bold text-gray-800">{selectedInvoiceDetails.customer}</p>
                                            </div>
                                            <div className="bg-emerald-50 p-3 rounded-xl">
                                                <p className="text-[10px] text-emerald-600 uppercase font-bold tracking-wider">Net Total</p>
                                                <p className="font-bold text-emerald-700">{formatCurrency(selectedInvoiceDetails.total)}</p>
                                            </div>
                                        </div>

                                        <table className="w-full border-collapse">
                                            <thead>
                                                <tr className="border-b border-gray-100">
                                                    <th className="text-left py-2 text-xs font-bold text-gray-400 uppercase">Product</th>
                                                    <th className="text-right py-2 text-xs font-bold text-gray-400 uppercase">Price</th>
                                                    <th className="text-right py-2 text-xs font-bold text-gray-400 uppercase">Qty</th>
                                                    <th className="text-right py-2 text-xs font-bold text-gray-400 uppercase">Total</th>
                                                </tr>
                                            </thead>
                                            <tbody>
                                                {selectedInvoiceDetails.items.map((item: any, i: number) => (
                                                    <tr key={i} className="border-b border-gray-50">
                                                        <td className="py-3 text-sm font-medium text-gray-700">{item.name}</td>
                                                        <td className="py-3 text-sm text-right text-gray-600">{formatCurrency(item.price)}</td>
                                                        <td className="py-3 text-sm text-right text-gray-600">{item.quantity}</td>
                                                        <td className="py-3 text-sm text-right font-bold text-emerald-600">{formatCurrency(item.price * item.quantity)}</td>
                                                    </tr>
                                                ))}
                                            </tbody>
                                        </table>

                                        <div className="flex flex-col items-end gap-2 border-t pt-4">
                                            <div className="flex justify-between w-64 text-sm">
                                                <span className="text-gray-500">Subtotal</span>
                                                <span className="font-bold">{formatCurrency(selectedInvoiceDetails.subTotal)}</span>
                                            </div>
                                            <div className="flex justify-between w-64 text-sm">
                                                <span className="text-gray-500">Discount</span>
                                                <span className="font-bold text-red-500">-{formatCurrency(selectedInvoiceDetails.discount)}</span>
                                            </div>
                                            <div className="flex justify-between w-64 text-lg font-black border-t pt-2">
                                                <span className="text-gray-800">NET TOTAL</span>
                                                <span className="text-emerald-600">{formatCurrency(selectedInvoiceDetails.total)}</span>
                                            </div>
                                        </div>
                                    </div>
                                )}
                            </div>
                            <div className="p-4 bg-gray-50 flex gap-2">
                                <button onClick={() => handlePrint(selectedInvoiceDetails.invoiceNo)} className="flex-1 bg-emerald-500 text-white font-bold py-2 rounded-xl hover:bg-emerald-600 transition-colors flex items-center justify-center gap-2">
                                    <Printer size={18} /> Print Invoice
                                </button>
                                <button onClick={() => setShowDetailModal(false)} className="flex-1 bg-gray-800 text-white font-bold py-2 rounded-xl hover:bg-gray-900 transition-colors">
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

export default ManageSales;