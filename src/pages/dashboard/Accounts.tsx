import {
    ChevronLeft,
    ChevronRight,
    TrendingUp,
    Calendar,
    Clock,
    User,
    Download,
    Eye,
    X,
    Banknote,
    ArrowRightLeft,
    AlertCircle
} from 'lucide-react';

import { useEffect, useState } from 'react';
import toast, { Toaster } from 'react-hot-toast';
import { cashSessionService } from '../../services/cashSessionService';

interface User {
    id: number;
    name: string;
    email: string;
    contact: string;
}

interface Counter {
    id: number;
    cashier_counter: string;
}

interface CashierSession {
    id: number;
    cashier: User;
    counter: string;
    date: string;
    openingTime: string;
    openingBalance: number;
    cashTotal: number;
    cardTotal: number;
    bankTotal: number;
    totalSales: number;
    cashIn: number;
    cashOut: number;
    expectedBalance: number;
    status: string;
    statusId: number;
    transactionCount: number;
}

interface Transaction {
    id: number;
    type: string;
    typeId: number;
    amount: number;
    description: string;
    time: string;
    datetime: Date;
}

interface SessionDetail {
    session: {
        id: number;
        cashier: string;
        counter: string;
        date: string;
        openingTime: string;
        openingBalance: number;
        cashTotal: number;
        cardTotal: number;
        bankTotal: number;
        totalSales: number;
        cashIn: number;
        cashOut: number;
        expectedBalance: number;
        status: string;
    };
    transactions: Transaction[];
}

function Accounts() {
    const [users, setUsers] = useState<User[]>([]);
    const [counters, setCounters] = useState<Counter[]>([]);
    const [sessions, setSessions] = useState<CashierSession[]>([]);
    const [filteredSessions, setFilteredSessions] = useState<CashierSession[]>([]);
    const [loading, setLoading] = useState(true);
    
    const [selectedCashier, setSelectedCashier] = useState<number | null>(null);
    const [selectedCounter, setSelectedCounter] = useState<number | null>(null);
    const [selectedDate, setSelectedDate] = useState('');
    const [fromDate, setFromDate] = useState('');
    const [toDate, setToDate] = useState('');
    const [selectedStatus, setSelectedStatus] = useState<number | null>(null);

    const [currentPage, setCurrentPage] = useState(1);
    const [itemsPerPage] = useState(10);

    const [selectedSession, setSelectedSession] = useState<SessionDetail | null>(null);
    const [showDetailModal, setShowDetailModal] = useState(false);
    const [selectedRowIndex, setSelectedRowIndex] = useState<number>(0);

    // Fetch users
    const fetchUsers = async () => {
        try {
            const response = await cashSessionService.getAllUsers();
            if (response.success) {
                setUsers(response.data);
            }
        } catch (error) {
            console.error('Error fetching users:', error);
        }
    };

    // Fetch counters
    const fetchCounters = async () => {
        try {
            const counters = await cashSessionService.getCashierCounters();
            setCounters(counters);
        } catch (error) {
            console.error('Error fetching counters:', error);
        }
    };

    // Fetch sessions
    const fetchSessions = async () => {
        try {
            setLoading(true);
            const params: any = {};
            
            if (selectedDate) {
                params.date = selectedDate;
            } else if (fromDate && toDate) {
                params.fromDate = fromDate;
                params.toDate = toDate;
            }
            // If no date filters, defaults to today in backend
            
            if (selectedCashier) {
                params.userId = selectedCashier;
            }
            
            if (selectedCounter) {
                params.counterId = selectedCounter;
            }
            
            if (selectedStatus) {
                params.status = selectedStatus;
            }

            console.log('fetchSessions - Params being sent:', params);

            const response = await cashSessionService.getAllSessions(params);
            
            if (response.success) {
                setSessions(response.data);
                setFilteredSessions(response.data);
            }
        } catch (error: any) {
            console.error('Error fetching sessions:', error);
            toast.error(error.response?.data?.message || 'Failed to fetch sessions');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchUsers();
        fetchCounters();
        fetchSessions();
    }, [selectedDate, selectedCashier, selectedCounter, selectedStatus, fromDate, toDate]);

    useEffect(() => {
        setFilteredSessions(sessions);
    }, [sessions]);

    const totalPages = Math.ceil(filteredSessions.length / itemsPerPage);
    const startIndex = (currentPage - 1) * itemsPerPage;
    const endIndex = startIndex + itemsPerPage;
    const currentSessions = filteredSessions.slice(startIndex, endIndex);

    // Keyboard shortcuts
    useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            // Ctrl + R: Generate Report
            if (e.ctrlKey && e.key === 'r') {
                e.preventDefault();
                generateExcelReport();
                return;
            }

            // Ctrl + Shift + R: Reset Filters
            if (e.ctrlKey && e.shiftKey && e.key === 'R') {
                e.preventDefault();
                resetFilters();
                return;
            }

            // Escape: Close modal
            if (e.key === 'Escape' && showDetailModal) {
                setShowDetailModal(false);
                return;
            }

            // Don't handle navigation keys if modal is open or user is typing in input
            if (showDetailModal || (e.target as HTMLElement).tagName === 'INPUT' || (e.target as HTMLElement).tagName === 'SELECT') {
                return;
            }

            // Arrow Up: Select previous row
            if (e.key === 'ArrowUp') {
                e.preventDefault();
                setSelectedRowIndex(prev => Math.max(0, prev - 1));
                return;
            }

            // Arrow Down: Select next row
            if (e.key === 'ArrowDown') {
                e.preventDefault();
                setSelectedRowIndex(prev => Math.min(currentSessions.length - 1, prev + 1));
                return;
            }

            // Page Up: Scroll table up
            if (e.key === 'PageUp') {
                e.preventDefault();
                const tableContainer = document.querySelector('.overflow-y-auto');
                if (tableContainer) {
                    tableContainer.scrollBy({ top: -300, behavior: 'smooth' });
                }
                return;
            }

            // Page Down: Scroll table down
            if (e.key === 'PageDown') {
                e.preventDefault();
                const tableContainer = document.querySelector('.overflow-y-auto');
                if (tableContainer) {
                    tableContainer.scrollBy({ top: 300, behavior: 'smooth' });
                }
                return;
            }

            // Arrow Left: Previous page
            if (e.key === 'ArrowLeft' && currentPage > 1) {
                e.preventDefault();
                goToPage(currentPage - 1);
                setSelectedRowIndex(0); // Reset to first row on page change
                return;
            }

            // Arrow Right: Next page
            if (e.key === 'ArrowRight' && currentPage < totalPages) {
                e.preventDefault();
                goToPage(currentPage + 1);
                setSelectedRowIndex(0); // Reset to first row on page change
                return;
            }

            // Home: First page
            if (e.key === 'Home') {
                e.preventDefault();
                goToPage(1);
                setSelectedRowIndex(0);
                return;
            }

            // End: Last page
            if (e.key === 'End') {
                e.preventDefault();
                goToPage(totalPages);
                setSelectedRowIndex(0);
                return;
            }

            // Enter: View details of selected row
            if (e.key === 'Enter' && currentSessions[selectedRowIndex]) {
                e.preventDefault();
                handleViewDetails(currentSessions[selectedRowIndex]);
                return;
            }
        };

        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, [currentPage, totalPages, showDetailModal, currentSessions, selectedRowIndex]);

    // Stats calculation
    const stats = {
        totalOpenSessions: sessions.filter(s => s.statusId === 1).length,
        todayTotalSales: sessions.reduce((sum, s) => sum + s.totalSales, 0),
        todayTotalCash: sessions.reduce((sum, s) => sum + s.expectedBalance, 0),
        totalCashIn: sessions.reduce((sum, s) => sum + s.cashIn, 0),
        totalCashOut: sessions.reduce((sum, s) => sum + s.cashOut, 0)
    };

    const summaryCards = [
        {
            icon: Clock,
            label: 'Open Sessions',
            value: stats.totalOpenSessions.toString(),
            trend: 'Active',
            color: 'bg-gradient-to-br from-emerald-400 to-emerald-500',
            iconColor: 'text-white',
        },
        {
            icon: TrendingUp,
            label: 'Total Sales',
            value: `Rs. ${stats.todayTotalSales.toLocaleString()}`,
            trend: '',
            color: 'bg-gradient-to-br from-blue-400 to-blue-500',
            iconColor: 'text-white',
        },
        {
            icon: Banknote,
            label: 'Expected Cash',
            value: `Rs. ${stats.todayTotalCash.toLocaleString()}`,
            trend: '',
            color: 'bg-gradient-to-br from-green-400 to-green-500',
            iconColor: 'text-white',
        },
        {
            icon: ArrowRightLeft,
            label: 'Cash In/Out',
            value: `+${stats.totalCashIn.toLocaleString()} / -${stats.totalCashOut.toLocaleString()}`,
            trend: '',
            color: 'bg-gradient-to-br from-purple-400 to-purple-500',
            iconColor: 'text-white',
        }
    ];

    const handleViewDetails = async (session: CashierSession) => {
        try {
            const response = await cashSessionService.getSessionDetails(session.id);
            if (response.success) {
                setSelectedSession(response.data);
                setShowDetailModal(true);
            }
        } catch (error: any) {
            console.error('Error fetching session details:', error);
            toast.error('Failed to fetch session details');
        }
    };

    const resetFilters = () => {
        setSelectedCashier(null);
        setSelectedCounter(null);
        setSelectedDate('');
        setFromDate('');
        setToDate('');
        setSelectedStatus(null);
    };

    const generateExcelReport = async () => {
        try {
            toast.loading('Generating report...');
            
            // Import xlsx dynamically
            const XLSX = await import('xlsx');
            
            // Create a new workbook
            const workbook = XLSX.utils.book_new();

            // Prepare summary data
            const summaryData = [
                ['Cash Session Report'],
                ['Generated Date:', new Date().toLocaleString('en-US', { timeZone: 'Asia/Kolkata' })],
                [''],
                ['Summary Statistics'],
                ['Total Sessions:', filteredSessions.length],
                ['Open Sessions:', stats.totalOpenSessions],
                ['Total Sales (All Sessions):', `Rs. ${stats.todayTotalSales.toLocaleString()}`],
                ['Expected Cash (All Sessions):', `Rs. ${stats.todayTotalCash.toLocaleString()}`],
                ['Total Cash In:', `Rs. ${stats.totalCashIn.toLocaleString()}`],
                ['Total Cash Out:', `Rs. ${stats.totalCashOut.toLocaleString()}`],
                ['']
            ];

            // Add filter information
            if (selectedCashier || selectedCounter || selectedDate || (fromDate && toDate) || selectedStatus) {
                summaryData.push(['Applied Filters:']);
                if (selectedCashier) {
                    const cashier = users.find(u => u.id === selectedCashier);
                    summaryData.push(['Cashier:', cashier?.name || '']);
                }
                if (selectedCounter) {
                    const counter = counters.find(c => c.id === selectedCounter);
                    summaryData.push(['Counter:', counter?.cashier_counter || '']);
                }
                if (selectedDate) {
                    summaryData.push(['Date:', selectedDate]);
                } else if (fromDate && toDate) {
                    summaryData.push(['Date Range:', `${fromDate} to ${toDate}`]);
                }
                if (selectedStatus) {
                    summaryData.push(['Status:', selectedStatus === 1 ? 'Open' : 'Closed']);
                }
                summaryData.push(['']);
            }

            // Create summary worksheet
            const summarySheet = XLSX.utils.aoa_to_sheet(summaryData);
            XLSX.utils.book_append_sheet(workbook, summarySheet, 'Summary');

            // Prepare detailed session data
            const sessionHeaders = [
                'Session ID',
                'Cashier Name',
                'Cashier Email',
                'Counter',
                'Date',
                'Opening Time',
                'Opening Balance',
                'Cash Total',
                'Card Total',
                'Bank Total',
                'Total Sales',
                'Cash In',
                'Cash Out',
                'Expected Balance',
                'Status',
                'Transactions Count'
            ];

            const sessionRows = filteredSessions.map(session => [
                session.id,
                session.cashier.name,
                session.cashier.email,
                session.counter,
                session.date,
                session.openingTime,
                session.openingBalance,
                session.cashTotal,
                session.cardTotal,
                session.bankTotal,
                session.totalSales,
                session.cashIn,
                session.cashOut,
                session.expectedBalance,
                session.status,
                session.transactionCount
            ]);

            // Combine headers and data
            const sessionData = [sessionHeaders, ...sessionRows];

            // Create sessions worksheet
            const sessionsSheet = XLSX.utils.aoa_to_sheet(sessionData);

            // Set column widths
            const wscols = [
                { wch: 12 }, // Session ID
                { wch: 20 }, // Cashier Name
                { wch: 25 }, // Cashier Email
                { wch: 15 }, // Counter
                { wch: 12 }, // Date
                { wch: 15 }, // Opening Time
                { wch: 18 }, // Opening Balance
                { wch: 15 }, // Cash Total
                { wch: 15 }, // Card Total
                { wch: 15 }, // Bank Total
                { wch: 15 }, // Total Sales
                { wch: 12 }, // Cash In
                { wch: 12 }, // Cash Out
                { wch: 18 }, // Expected Balance
                { wch: 10 }, // Status
                { wch: 18 }  // Transactions Count
            ];
            sessionsSheet['!cols'] = wscols;

            XLSX.utils.book_append_sheet(workbook, sessionsSheet, 'Sessions');

            // Fetch and prepare transaction details for all sessions
            const transactionHeaders = [
                'Session ID',
                'Cashier',
                'Counter',
                'Date',
                'Transaction Time',
                'Transaction Type',
                'Amount',
                'Description'
            ];

            const allTransactions: any[] = [];

            // Fetch transactions for each session
            for (const session of filteredSessions) {
                try {
                    const response = await cashSessionService.getSessionDetails(session.id);
                    if (response.success && response.data.transactions) {
                        response.data.transactions.forEach((transaction: any) => {
                            allTransactions.push([
                                session.id,
                                session.cashier.name,
                                session.counter,
                                session.date,
                                transaction.time,
                                transaction.type,
                                transaction.amount,
                                transaction.description
                            ]);
                        });
                    }
                } catch (error) {
                    console.error(`Error fetching transactions for session ${session.id}:`, error);
                }
            }

            // Create transactions worksheet
            const transactionData = allTransactions.length > 0 
                ? [transactionHeaders, ...allTransactions]
                : [transactionHeaders, ['No transactions found', '', '', '', '', '', '', '']];

            const transactionsSheet = XLSX.utils.aoa_to_sheet(transactionData);

            // Set column widths for transactions
            const transWscols = [
                { wch: 12 }, // Session ID
                { wch: 20 }, // Cashier
                { wch: 15 }, // Counter
                { wch: 12 }, // Date
                { wch: 15 }, // Transaction Time
                { wch: 15 }, // Transaction Type
                { wch: 15 }, // Amount
                { wch: 50 }  // Description
            ];
            transactionsSheet['!cols'] = transWscols;

            XLSX.utils.book_append_sheet(workbook, transactionsSheet, 'Money Exchange Transactions');

            // Generate filename with current date and time
            const now = new Date();
            const dateStr = now.toISOString().split('T')[0];
            const timeStr = now.toTimeString().split(' ')[0].replace(/:/g, '-');
            const filename = `Cash_Session_Report_${dateStr}_${timeStr}.xlsx`;

            // Write file
            XLSX.writeFile(workbook, filename);

            toast.dismiss();
            toast.success('Full report generated successfully!');
        } catch (error) {
            console.error('Error generating report:', error);
            toast.dismiss();
            toast.error('Failed to generate report');
        }
    };

    const goToPage = (page: number) => {
        if (page >= 1 && page <= totalPages) {
            setCurrentPage(page);
        }
    };

    const getPageNumbers = () => {
        const pages = [];
        const maxPagesToShow = 5;

        if (totalPages <= maxPagesToShow) {
            for (let i = 1; i <= totalPages; i++) pages.push(i);
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

    const getStatusBadge = (statusId: number) => {
        return statusId === 1
            ? 'bg-gradient-to-r from-emerald-500 to-emerald-600 text-white'
            : 'bg-gradient-to-r from-gray-500 to-gray-600 text-white';
    };

    const getTransactionTypeBadge = (typeId: number) => {
        switch (typeId) {
            case 1:
                return 'bg-gradient-to-r from-emerald-500 to-emerald-600 text-white';
            case 2:
                return 'bg-gradient-to-r from-red-500 to-red-600 text-white';
            default:
                return 'bg-gradient-to-r from-gray-400 to-gray-500 text-white';
        }
    };

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
            <div className={'flex flex-col gap-4 h-full'}>
                <div className="flex justify-between items-center">
                    <div>
                        <div className="text-sm text-gray-400 flex items-center">
                            <span>Dashboard</span>
                            <span className="mx-2">›</span>
                            <span className="text-gray-700 font-medium">Accounts</span>
                        </div>
                        <h1 className="text-3xl font-semibold bg-gradient-to-r from-gray-800 to-gray-600 bg-clip-text text-transparent">
                            Cashier Accounts & Sessions
                        </h1>
                    </div>

                    <div className="flex items-center gap-4">
                        {/* Shortcuts Hint */}
                        <div className="hidden xl:flex items-center gap-3 bg-white px-4 py-2 rounded-xl border border-gray-100 shadow-sm border-b-2">
                             <div className="flex items-center gap-1.5 px-2 py-1 bg-gray-50 rounded-lg border border-gray-200">
                                <span className="text-[10px] font-black text-gray-500 bg-white px-1.5 py-0.5 rounded shadow-sm border border-gray-200">↑↓</span>
                                <span className="text-[10px] font-bold text-gray-400 uppercase tracking-tight">Navigate</span>
                            </div>
                            <div className="flex items-center gap-1.5 px-2 py-1 bg-gray-50 rounded-lg border border-gray-200">
                                <span className="text-[10px] font-black text-gray-500 bg-white px-1.5 py-0.5 rounded shadow-sm border border-gray-200">↵</span>
                                <span className="text-[10px] font-bold text-gray-400 uppercase tracking-tight">Details</span>
                            </div>
                            <div className="flex items-center gap-1.5 px-2 py-1 bg-gray-50 rounded-lg border border-gray-200">
                                <span className="text-[10px] font-black text-gray-500 bg-white px-1.5 py-0.5 rounded shadow-sm border border-gray-200">Ctrl+R</span>
                                <span className="text-[10px] font-bold text-gray-400 uppercase tracking-tight">Report</span>
                            </div>
                            <div className="flex items-center gap-1.5 px-2 py-1 bg-gray-50 rounded-lg border border-gray-200">
                                <span className="text-[10px] font-black text-gray-500 bg-white px-1.5 py-0.5 rounded shadow-sm border border-gray-200">Esc</span>
                                <span className="text-[10px] font-bold text-gray-400 uppercase tracking-tight">Close</span>
                            </div>
                        </div>

                        <button
                            onClick={generateExcelReport}
                            className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-emerald-500 to-emerald-600 hover:from-emerald-600 hover:to-emerald-700 text-white font-semibold rounded-xl transition-all h-full"
                        >
                            <Download size={20} />
                            Generate Report
                        </button>
                    </div>
                </div>

                <div className={'grid md:grid-cols-4 grid-cols-1 gap-4'}>
                    {summaryCards.map((stat, i) => (
                        <div
                            key={i}
                            className={`flex items-center p-4 space-x-3 transition-all bg-white rounded-2xl border border-gray-200 cursor-pointer group relative overflow-hidden`}
                        >
                            <div className="absolute inset-0 bg-gradient-to-br from-transparent via-gray-50/50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>

                            <div className={`p-3 rounded-full ${stat.color} relative z-10`}>
                                <stat.icon className={`w-6 h-6 ${stat.iconColor}`} />
                            </div>

                            <div className="w-px h-10 bg-gray-200"></div>

                            <div className="relative z-10 flex-1">
                                <div className="flex items-center justify-between">
                                    <p className="text-xs text-gray-500">{stat.label}</p>
                                    {stat.trend && (
                                        <span className="text-xs font-semibold text-emerald-600 flex items-center">
                                            {stat.trend}
                                        </span>
                                    )}
                                </div>
                                <p className="text-sm font-bold text-gray-700">{stat.value}</p>
                            </div>
                        </div>
                    ))}
                </div>

                {/* Filters Section */}
                <div className="bg-white rounded-xl p-4 border border-gray-200">
                        <div className="grid grid-cols-1 md:grid-cols-6 gap-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Cashier
                                </label>
                                <select
                                    value={selectedCashier || ''}
                                    onChange={(e) => setSelectedCashier(e.target.value ? Number(e.target.value) : null)}
                                    className="w-full px-3 py-2 text-sm border-2 border-gray-200 rounded-lg focus:border-emerald-500 transition-all outline-none"
                                >
                                    <option value="">All Cashiers</option>
                                    {users.map(user => (
                                        <option key={user.id} value={user.id}>{user.name}</option>
                                    ))}
                                </select>
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Counter
                                </label>
                                <select
                                    value={selectedCounter || ''}
                                    onChange={(e) => setSelectedCounter(e.target.value ? Number(e.target.value) : null)}
                                    className="w-full px-3 py-2 text-sm border-2 border-gray-200 rounded-lg focus:border-emerald-500 transition-all outline-none"
                                >
                                    <option value="">All Counters</option>
                                    {counters.map(counter => (
                                        <option key={counter.id} value={counter.id}>{counter.cashier_counter}</option>
                                    ))}
                                </select>
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Specific Date
                                </label>
                                <input
                                    type="date"
                                    value={selectedDate}
                                    onChange={(e) => {
                                        setSelectedDate(e.target.value);
                                        setFromDate('');
                                        setToDate('');
                                    }}
                                    className="w-full px-3 py-2 text-sm border-2 border-gray-200 rounded-lg focus:border-emerald-500 transition-all outline-none"
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    From Date
                                </label>
                                <input
                                    type="date"
                                    value={fromDate}
                                    onChange={(e) => {
                                        setFromDate(e.target.value);
                                        setSelectedDate('');
                                    }}
                                    disabled={!!selectedDate}
                                    className="w-full px-3 py-2 text-sm border-2 border-gray-200 rounded-lg focus:border-emerald-500 transition-all outline-none disabled:bg-gray-100"
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    To Date
                                </label>
                                <input
                                    type="date"
                                    value={toDate}
                                    onChange={(e) => {
                                        setToDate(e.target.value);
                                        setSelectedDate('');
                                    }}
                                    disabled={!!selectedDate}
                                    className="w-full px-3 py-2 text-sm border-2 border-gray-200 rounded-lg focus:border-emerald-500 transition-all outline-none disabled:bg-gray-100"
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Status
                                </label>
                                <select
                                    value={selectedStatus || ''}
                                    onChange={(e) => setSelectedStatus(e.target.value ? Number(e.target.value) : null)}
                                    className="w-full px-3 py-2 text-sm border-2 border-gray-200 rounded-lg focus:border-emerald-500 transition-all outline-none"
                                >
                                    <option value="">All Status</option>
                                    <option value="1">Open</option>
                                    <option value="2">Closed</option>
                                </select>
                            </div>
                        </div>
                        <div className="mt-4">
                            <button
                                onClick={resetFilters}
                                className="px-4 py-2 bg-gradient-to-r from-gray-500 to-gray-600 hover:from-gray-600 hover:to-gray-700 text-white font-semibold rounded-lg transition-all"
                            >
                                Reset Filters
                            </button>
                        </div>
                    </div>

                <div className={'flex flex-col bg-white rounded-xl p-4 justify-between gap-8 border border-gray-200'}>
                    {loading ? (
                        <div className="flex items-center justify-center py-12">
                            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-emerald-500"></div>
                        </div>
                    ) : (
                        <>
                            <div className="overflow-y-auto max-h-md md:h-[320px] lg:h-[450px] rounded-lg scrollbar-thin scrollbar-thumb-emerald-300 scrollbar-track-gray-100">
                                <table className="min-w-full divide-y divide-gray-200">
                                    <thead className="bg-gradient-to-r from-emerald-500 to-emerald-600 sticky top-0 z-10">
                                        <tr>
                                            {['#', 'Cashier', 'Counter', 'Date', 'Opening Time', 'Opening Balance', 'Total Sales', 'Cash In', 'Cash Out', 'Expected Balance', 'Status', 'Actions'].map((header, i, arr) => (
                                                <th
                                                    key={header}
                                                    className={`px-6 py-4 text-left text-xs font-bold text-white uppercase tracking-wider ${i === 0 ? 'rounded-tl-lg' : i === arr.length - 1 ? 'rounded-tr-lg' : ''
                                                        }`}
                                                >
                                                    {header}
                                                </th>
                                            ))}
                                        </tr>
                                    </thead>

                                    <tbody className="bg-white divide-y divide-gray-200">
                                        {currentSessions.length === 0 ? (
                                            <tr>
                                                <td colSpan={12} className="px-6 py-8 text-center">
                                                    <div className="flex flex-col items-center justify-center text-gray-400">
                                                        <AlertCircle size={48} className="mb-2" />
                                                        <p className="text-lg font-semibold">No sessions found</p>
                                                        <p className="text-sm">Try adjusting your filters</p>
                                                    </div>
                                                </td>
                                            </tr>
                                        ) : (
                                            currentSessions.map((session, index) => (
                                                <tr
                                                    key={session.id}
                                                    className={`transition-colors ${
                                                        index === selectedRowIndex 
                                                            ? 'bg-blue-100 hover:bg-blue-200 border-l-4 border-blue-500' 
                                                            : 'hover:bg-gray-50'
                                                    }`}
                                                >
                                                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                                                        {startIndex + index + 1}
                                                    </td>
                                                    <td className="px-6 py-4 whitespace-nowrap">
                                                        <div className="flex items-center">
                                                            
                                                            <div >
                                                                <div className="text-sm font-medium text-gray-900">{session.cashier.name}</div>
                                                                <div className="text-xs text-gray-500">{session.cashier.email}</div>
                                                            </div>
                                                        </div>
                                                    </td>
                                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                                        {session.counter}
                                                    </td>
                                                    <td className="px-6 py-4 whitespace-nowrap">
                                                        <div className="flex items-center text-sm text-gray-900">
                                                            <Calendar className="mr-2 h-4 w-4 text-gray-400" />
                                                            {session.date}
                                                        </div>
                                                    </td>
                                                    <td className="px-6 py-4 whitespace-nowrap">
                                                        <div className="flex items-center text-sm text-gray-900">
                                                            <Clock className="mr-2 h-4 w-4 text-emerald-500" />
                                                            {session.openingTime}
                                                        </div>
                                                    </td>
                                                    <td className="px-6 py-4 whitespace-nowrap text-sm font-semibold text-gray-900">
                                                        Rs. {session.openingBalance.toLocaleString()}
                                                    </td>
                                                    <td className="px-6 py-4 whitespace-nowrap text-sm font-semibold text-blue-600">
                                                        Rs. {session.totalSales.toLocaleString()}
                                                    </td>
                                                    <td className="px-6 py-4 whitespace-nowrap text-sm font-semibold text-emerald-600">
                                                        Rs. {session.cashIn.toLocaleString()}
                                                    </td>
                                                    <td className="px-6 py-4 whitespace-nowrap text-sm font-semibold text-red-600">
                                                        Rs. {session.cashOut.toLocaleString()}
                                                    </td>
                                                    <td className="px-6 py-4 whitespace-nowrap text-sm font-bold text-purple-600">
                                                        Rs. {session.expectedBalance.toLocaleString()}
                                                    </td>
                                                    <td className="px-6 py-4 whitespace-nowrap">
                                                        <span className={`px-3 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${getStatusBadge(session.statusId)}`}>
                                                            {session.status}
                                                        </span>
                                                    </td>
                                                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                                                        <button
                                                            onClick={() => handleViewDetails(session)}
                                                            className="p-2 bg-gradient-to-r from-emerald-500 to-emerald-600 hover:from-emerald-600 hover:to-emerald-700 text-white rounded-lg transition-all"
                                                            title="View Details"
                                                        >
                                                            <Eye size={16} />
                                                        </button>
                                                    </td>
                                                </tr>
                                            ))
                                        )}
                                    </tbody>
                                </table>
                            </div>

                            <nav className="bg-white flex items-center justify-between sm:px-6 pt-4 border-t-2 border-gray-100">
                                <div className="text-sm text-gray-600">
                                    Showing <span className="font-bold text-gray-800">{currentSessions.length === 0 ? 0 : startIndex + 1}-{Math.min(endIndex, filteredSessions.length)}</span> of{' '}
                                    <span className="font-bold text-gray-800">{filteredSessions.length}</span> sessions
                                </div>
                                <div className="flex items-center space-x-2">
                                    <button
                                        onClick={() => goToPage(currentPage - 1)}
                                        disabled={currentPage === 1}
                                        className={`flex items-center px-3 py-2 text-sm font-medium rounded-lg transition-all ${currentPage === 1
                                                ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                                                : 'bg-white text-gray-700 hover:bg-emerald-50 border-2 border-gray-200 hover:border-emerald-500'
                                            }`}
                                    >
                                        <ChevronLeft className="mr-2 h-5 w-5" /> Previous
                                    </button>
                                    {getPageNumbers().map((page, index) =>
                                        page === '...' ? (
                                            <span key={`ellipsis-${index}`} className="px-4 py-2 text-gray-400">...</span>
                                        ) : (
                                            <button
                                                key={page}
                                                onClick={() => goToPage(page as number)}
                                                className={`px-4 py-2 text-sm font-medium rounded-lg transition-all ${currentPage === page
                                                        ? 'bg-gradient-to-r from-emerald-500 to-emerald-600 text-white'
                                                        : 'bg-white text-gray-700 hover:bg-emerald-50 border-2 border-gray-200 hover:border-emerald-500'
                                                    }`}
                                            >
                                                {page}
                                            </button>
                                        )
                                    )}
                                    <button
                                        onClick={() => goToPage(currentPage + 1)}
                                        disabled={currentPage === totalPages}
                                        className={`flex items-center px-3 py-2 text-sm font-medium rounded-lg transition-all ${currentPage === totalPages
                                                ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                                                : 'bg-white text-gray-700 hover:bg-emerald-50 border-2 border-gray-200 hover:border-emerald-500'
                                            }`}
                                    >
                                        Next <ChevronRight className="ml-2 h-5 w-5" />
                                    </button>
                                </div>
                            </nav>
                        </>
                    )}
                </div>
            </div>

            {/* Session Detail Modal */}
            {showDetailModal && selectedSession && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
                    <div className="bg-white rounded-2xl border border-gray-200 w-full max-w-5xl max-h-[90vh] overflow-hidden">
                        <div className="bg-gradient-to-r from-emerald-500 to-emerald-600 px-6 py-4 flex justify-between items-center">
                            <div>
                                <h2 className="text-2xl font-bold text-white">Session Details</h2>
                                <p className="text-sm text-emerald-100">{selectedSession.session.cashier} - {selectedSession.session.date}</p>
                            </div>
                            <button
                                onClick={() => setShowDetailModal(false)}
                                className="p-2 hover:bg-white/20 rounded-lg transition-colors"
                            >
                                <X size={24} className="text-white" />
                            </button>
                        </div>

                        <div className="p-6 overflow-y-auto max-h-[calc(90vh-100px)]">
                            {/* Session Summary */}
                            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
                                <div className="bg-gradient-to-br from-emerald-50 to-emerald-100 rounded-lg p-4 border-2 border-emerald-200">
                                    <p className="text-xs text-emerald-600 font-semibold mb-1">Opening Balance</p>
                                    <p className="text-lg font-bold text-emerald-900">Rs. {selectedSession.session.openingBalance.toLocaleString()}</p>
                                </div>
                                <div className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-lg p-4 border-2 border-blue-200">
                                    <p className="text-xs text-blue-600 font-semibold mb-1">Total Sales</p>
                                    <p className="text-lg font-bold text-blue-900">Rs. {selectedSession.session.totalSales.toLocaleString()}</p>
                                </div>
                                <div className="bg-gradient-to-br from-green-50 to-green-100 rounded-lg p-4 border-2 border-green-200">
                                    <p className="text-xs text-green-600 font-semibold mb-1">Cash In</p>
                                    <p className="text-lg font-bold text-green-900">Rs. {selectedSession.session.cashIn.toLocaleString()}</p>
                                </div>
                                <div className="bg-gradient-to-br from-red-50 to-red-100 rounded-lg p-4 border-2 border-red-200">
                                    <p className="text-xs text-red-600 font-semibold mb-1">Cash Out</p>
                                    <p className="text-lg font-bold text-red-900">Rs. {selectedSession.session.cashOut.toLocaleString()}</p>
                                </div>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                                <div className="bg-gray-50 rounded-lg p-4">
                                    <p className="text-sm text-gray-600 mb-3 font-semibold">Payment Breakdown</p>
                                    <div className="space-y-2">
                                        <div className="flex items-center justify-between">
                                            <span className="text-xs text-gray-500">Cash Total:</span>
                                            <span className="text-sm font-semibold text-gray-900">Rs. {selectedSession.session.cashTotal.toLocaleString()}</span>
                                        </div>
                                        <div className="flex items-center justify-between">
                                            <span className="text-xs text-gray-500">Card Total:</span>
                                            <span className="text-sm font-semibold text-gray-900">Rs. {selectedSession.session.cardTotal.toLocaleString()}</span>
                                        </div>
                                        <div className="flex items-center justify-between">
                                            <span className="text-xs text-gray-500">Bank Total:</span>
                                            <span className="text-sm font-semibold text-gray-900">Rs. {selectedSession.session.bankTotal.toLocaleString()}</span>
                                        </div>
                                    </div>
                                </div>

                                <div className="bg-gray-50 rounded-lg p-4">
                                    <p className="text-sm text-gray-600 mb-3 font-semibold">Session Info</p>
                                    <div className="space-y-2">
                                        <div className="flex items-center justify-between">
                                            <span className="text-xs text-gray-500">Counter:</span>
                                            <span className="text-sm font-semibold text-gray-900">{selectedSession.session.counter}</span>
                                        </div>
                                        <div className="flex items-center justify-between">
                                            <span className="text-xs text-gray-500">Opening Time:</span>
                                            <span className="text-sm font-semibold text-gray-900">{selectedSession.session.openingTime}</span>
                                        </div>
                                        <div className="flex items-center justify-between">
                                            <span className="text-xs text-gray-500">Status:</span>
                                            <span className="text-sm font-semibold text-gray-900">{selectedSession.session.status}</span>
                                        </div>
                                    </div>
                                </div>

                                <div className="bg-purple-50 rounded-lg p-4 border-2 border-purple-200">
                                    <p className="text-sm text-purple-600 mb-3 font-semibold">Expected Balance</p>
                                    <p className="text-2xl font-bold text-purple-900">Rs. {selectedSession.session.expectedBalance.toLocaleString()}</p>
                                    <p className="text-xs text-purple-600 mt-2">Opening + Sales + Cash In - Cash Out</p>
                                </div>
                            </div>

                            {/* Money Exchange Transactions */}
                            <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
                                <ArrowRightLeft className="text-emerald-600" size={24} />
                                Money Exchange Transactions ({selectedSession.transactions.length})
                            </h3>
                            <div className="border-2 border-gray-200 rounded-lg overflow-hidden">
                                <table className="w-full">
                                    <thead className="bg-gray-50">
                                        <tr>
                                            <th className="px-4 py-3 text-left text-xs font-bold text-gray-700">Time</th>
                                            <th className="px-4 py-3 text-left text-xs font-bold text-gray-700">Type</th>
                                            <th className="px-4 py-3 text-left text-xs font-bold text-gray-700">Description</th>
                                            <th className="px-4 py-3 text-right text-xs font-bold text-gray-700">Amount</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-gray-200">
                                        {selectedSession.transactions.length === 0 ? (
                                            <tr>
                                                <td colSpan={4} className="px-4 py-8 text-center text-gray-400">
                                                    No money exchange transactions
                                                </td>
                                            </tr>
                                        ) : (
                                            selectedSession.transactions.map((transaction) => (
                                                <tr key={transaction.id} className="hover:bg-gray-50">
                                                    <td className="px-4 py-3 text-sm text-gray-600">
                                                        <div className="flex items-center gap-2">
                                                            <Clock size={14} className="text-gray-400" />
                                                            {transaction.time}
                                                        </div>
                                                    </td>
                                                    <td className="px-4 py-3">
                                                        <span className={`px-2 py-1 text-xs font-semibold rounded-full ${getTransactionTypeBadge(transaction.typeId)}`}>
                                                            {transaction.type}
                                                        </span>
                                                    </td>
                                                    <td className="px-4 py-3 text-sm text-gray-900">{transaction.description}</td>
                                                    <td className="px-4 py-3 text-sm text-right font-bold">
                                                        <span className={transaction.typeId === 1 ? 'text-emerald-600' : 'text-red-600'}>
                                                            {transaction.typeId === 1 ? '+' : '-'}Rs. {transaction.amount.toLocaleString()}
                                                        </span>
                                                    </td>
                                                </tr>
                                            ))
                                        )}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </>
    );
}

export default Accounts;