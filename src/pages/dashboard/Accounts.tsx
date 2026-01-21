import {
    ChevronLeft,
    ChevronRight,
    TrendingUp,
    TrendingDown,
    Calendar,
    Clock,
    User,
    Search,
    Filter,
    Download,
    Eye,
    X,
    Banknote,
    ArrowRightLeft,
    CheckCircle,
    AlertCircle
} from 'lucide-react';

import { useEffect, useState } from 'react';
import toast, { Toaster } from 'react-hot-toast';


interface Cashier {
    id: number;
    name: string;
    email: string;
    contactNumber: string;
}

interface CashierSession {
    id: number;
    cashierId: number;
    cashierName: string;
    date: string;
    openingTime: string;
    closingTime: string | null;
    openingBalance: number;
    closingBalance: number | null;
    totalSales: number;
    totalExpenses: number;
    cashIn: number;
    cashOut: number;
    expectedBalance: number;
    actualBalance: number | null;
    difference: number | null;
    status: 'Open' | 'Closed';
}

interface Transaction {
    id: number;
    sessionId: number;
    type: 'Sale' | 'Expense' | 'Cash In' | 'Cash Out';
    amount: number;
    description: string;
    time: string;
    reference: string;
}

interface SessionDetail {
    session: CashierSession;
    transactions: Transaction[];
}

function Accounts() {
    const [cashiers] = useState<Cashier[]>([
        { id: 1, name: 'John Doe', email: 'john@example.com', contactNumber: '0771234567' },
        { id: 2, name: 'Jane Smith', email: 'jane@example.com', contactNumber: '0777654321' },
        { id: 3, name: 'Bob Wilson', email: 'bob@example.com', contactNumber: '0761234567' }
    ]);

    const [sessions, setSessions] = useState<CashierSession[]>([
        {
            id: 1,
            cashierId: 1,
            cashierName: 'John Doe',
            date: '2024-01-15',
            openingTime: '08:00 AM',
            closingTime: '05:00 PM',
            openingBalance: 10000,
            closingBalance: 45000,
            totalSales: 50000,
            totalExpenses: 5000,
            cashIn: 10000,
            cashOut: 8000,
            expectedBalance: 57000,
            actualBalance: 45000,
            difference: -12000,
            status: 'Closed'
        },
        {
            id: 2,
            cashierId: 2,
            cashierName: 'Jane Smith',
            date: '2024-01-15',
            openingTime: '08:30 AM',
            closingTime: null,
            openingBalance: 15000,
            closingBalance: null,
            totalSales: 35000,
            totalExpenses: 3000,
            cashIn: 5000,
            cashOut: 2000,
            expectedBalance: 50000,
            actualBalance: null,
            difference: null,
            status: 'Open'
        },
        {
            id: 3,
            cashierId: 1,
            cashierName: 'John Doe',
            date: '2024-01-14',
            openingTime: '08:00 AM',
            closingTime: '05:15 PM',
            openingBalance: 10000,
            closingBalance: 38000,
            totalSales: 42000,
            totalExpenses: 4000,
            cashIn: 8000,
            cashOut: 6000,
            expectedBalance: 50000,
            actualBalance: 38000,
            difference: -12000,
            status: 'Closed'
        }
    ]);

    const [sessionTransactions] = useState<{ [key: number]: Transaction[] }>({
        1: [
            { id: 1, sessionId: 1, type: 'Sale', amount: 15000, description: 'Invoice INV-001', time: '09:30 AM', reference: 'INV-001' },
            { id: 2, sessionId: 1, type: 'Sale', amount: 20000, description: 'Invoice INV-002', time: '11:00 AM', reference: 'INV-002' },
            { id: 3, sessionId: 1, type: 'Expense', amount: 3000, description: 'Office supplies', time: '12:30 PM', reference: 'EXP-001' },
            { id: 4, sessionId: 1, type: 'Cash In', amount: 10000, description: 'Bank deposit', time: '02:00 PM', reference: 'CI-001' },
            { id: 5, sessionId: 1, type: 'Sale', amount: 15000, description: 'Invoice INV-003', time: '03:30 PM', reference: 'INV-003' },
            { id: 6, sessionId: 1, type: 'Cash Out', amount: 8000, description: 'Petty cash withdrawal', time: '04:00 PM', reference: 'CO-001' }
        ],
        2: [
            { id: 7, sessionId: 2, type: 'Sale', amount: 18000, description: 'Invoice INV-004', time: '09:00 AM', reference: 'INV-004' },
            { id: 8, sessionId: 2, type: 'Sale', amount: 17000, description: 'Invoice INV-005', time: '11:30 AM', reference: 'INV-005' },
            { id: 9, sessionId: 2, type: 'Expense', amount: 3000, description: 'Utilities payment', time: '01:00 PM', reference: 'EXP-002' },
            { id: 10, sessionId: 2, type: 'Cash In', amount: 5000, description: 'Customer payment', time: '02:30 PM', reference: 'CI-002' }
        ]
    });

    const [filteredSessions, setFilteredSessions] = useState<CashierSession[]>(sessions);
    const [searchQuery, setSearchQuery] = useState('');
    const [selectedCashier, setSelectedCashier] = useState<number | null>(null);
    const [selectedDate, setSelectedDate] = useState('');
    const [selectedStatus, setSelectedStatus] = useState<'All' | 'Open' | 'Closed'>('All');

    const [currentPage, setCurrentPage] = useState(1);
    const [itemsPerPage] = useState(10);

    const [selectedSession, setSelectedSession] = useState<SessionDetail | null>(null);
    const [showDetailModal, setShowDetailModal] = useState(false);
    const [showFilters, setShowFilters] = useState(false);

    const totalPages = Math.ceil(filteredSessions.length / itemsPerPage);
    const startIndex = (currentPage - 1) * itemsPerPage;
    const endIndex = startIndex + itemsPerPage;
    const currentSessions = filteredSessions.slice(startIndex, endIndex);

    // Stats calculation
    const stats = {
        totalOpenSessions: sessions.filter(s => s.status === 'Open').length,
        todayTotalSales: sessions
            .filter(s => s.date === new Date().toISOString().split('T')[0])
            .reduce((sum, s) => sum + s.totalSales, 0),
        todayTotalCash: sessions
            .filter(s => s.date === new Date().toISOString().split('T')[0])
            .reduce((sum, s) => sum + (s.actualBalance || s.expectedBalance), 0),
        totalDifferences: sessions
            .filter(s => s.status === 'Closed' && s.difference !== null)
            .reduce((sum, s) => sum + (s.difference || 0), 0)
    };

    const summaryCards = [
        {
            icon: Clock,
            label: 'Open Sessions',
            value: stats.totalOpenSessions.toString(),
            trend: 'Active',
            color: 'bg-gradient-to-br from-emerald-400 to-emerald-500',
            iconColor: 'text-white',
            bgGlow: ''
        },
        {
            icon: TrendingUp,
            label: 'Today\'s Sales',
            value: `Rs. ${stats.todayTotalSales.toLocaleString()}`,
            trend: '+12%',
            color: 'bg-gradient-to-br from-blue-400 to-blue-500',
            iconColor: 'text-white',
            bgGlow: ''
        },
        {
            icon: Banknote,
            label: 'Today\'s Cash',
            value: `Rs. ${stats.todayTotalCash.toLocaleString()}`,
            trend: '+8%',
            color: 'bg-gradient-to-br from-green-400 to-green-500',
            iconColor: 'text-white',
            bgGlow: ''
        },
        {
            icon: stats.totalDifferences >= 0 ? TrendingUp : TrendingDown,
            label: 'Cash Differences',
            value: `Rs. ${stats.totalDifferences.toLocaleString()}`,
            trend: stats.totalDifferences >= 0 ? 'Surplus' : 'Shortage',
            color: stats.totalDifferences >= 0
                ? 'bg-gradient-to-br from-emerald-400 to-emerald-500'
                : 'bg-gradient-to-br from-red-400 to-red-500',
            iconColor: 'text-white',
            bgGlow: ''
        }
    ];

    const handleSearch = () => {
        let filtered = sessions;

        if (searchQuery.trim()) {
            const lowercaseQuery = searchQuery.toLowerCase();
            filtered = filtered.filter(session =>
                session.cashierName.toLowerCase().includes(lowercaseQuery) ||
                session.date.includes(lowercaseQuery)
            );
        }

        if (selectedCashier) {
            filtered = filtered.filter(session => session.cashierId === selectedCashier);
        }

        if (selectedDate) {
            filtered = filtered.filter(session => session.date === selectedDate);
        }

        if (selectedStatus !== 'All') {
            filtered = filtered.filter(session => session.status === selectedStatus);
        }

        setFilteredSessions(filtered);
        setCurrentPage(1);
    };

    useEffect(() => {
        handleSearch();
    }, [searchQuery, selectedCashier, selectedDate, selectedStatus]);

    const handleViewDetails = (session: CashierSession) => {
        const transactions = sessionTransactions[session.id] || [];
        setSelectedSession({ session, transactions });
        setShowDetailModal(true);
    };

    const handleCloseSession = (sessionId: number) => {
        const updatedSessions = sessions.map(session => {
            if (session.id === sessionId && session.status === 'Open') {
                const actualBalance = session.expectedBalance; // In real app, this would be user input
                const difference = actualBalance - session.expectedBalance;
                return {
                    ...session,
                    status: 'Closed' as const,
                    closingTime: new Date().toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' }),
                    closingBalance: actualBalance,
                    actualBalance: actualBalance,
                    difference: difference
                };
            }
            return session;
        });
        setSessions(updatedSessions);
        setFilteredSessions(updatedSessions);
        toast.success('Session closed successfully!');
    };

    const resetFilters = () => {
        setSearchQuery('');
        setSelectedCashier(null);
        setSelectedDate('');
        setSelectedStatus('All');
    };

    const exportToCSV = () => {
        toast.success('Export functionality will be implemented');
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

    const getStatusBadge = (status: string) => {
        return status === 'Open'
            ? 'bg-gradient-to-r from-emerald-500 to-emerald-600 text-white'
            : 'bg-gradient-to-r from-gray-500 to-gray-600 text-white';
    };

    const getTransactionTypeBadge = (type: string) => {
        switch (type) {
            case 'Sale':
                return 'bg-gradient-to-r from-emerald-500 to-emerald-600 text-white';
            case 'Expense':
                return 'bg-gradient-to-r from-red-500 to-red-600 text-white';
            case 'Cash In':
                return 'bg-gradient-to-r from-blue-500 to-blue-600 text-white';
            case 'Cash Out':
                return 'bg-gradient-to-r from-orange-500 to-orange-600 text-white';
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
                    <div className="flex gap-3">
                        <button

                            onClick={() => setShowFilters(!showFilters)}
                            className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-gray-500 to-gray-600 hover:from-gray-600 hover:to-gray-700 text-white font-semibold rounded-xl transition-all"
                        >
                            <Filter size={18} />
                            Filters
                        </button>
                        <button
                            onClick={exportToCSV}
                            className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-emerald-500 to-emerald-600 hover:from-emerald-600 hover:to-emerald-700 text-white font-semibold rounded-xl transition-all"
                        >
                            <Download size={18} />
                            Export
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
                                    <span className="text-xs font-semibold text-emerald-600 flex items-center">
                                        {stat.trend}
                                    </span>
                                </div>
                                <p className="text-sm font-bold text-gray-700">{stat.value}</p>
                            </div>
                        </div>
                    ))}
                </div>

                {/* Filters Section */}
                {showFilters && (
                    <div
                        className="bg-white rounded-xl p-4 border border-gray-200"
                    >
                        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
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
                                    {cashiers.map(cashier => (
                                        <option key={cashier.id} value={cashier.id}>{cashier.name}</option>
                                    ))}
                                </select>
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Date
                                </label>
                                <input
                                    type="date"
                                    value={selectedDate}
                                    onChange={(e) => setSelectedDate(e.target.value)}
                                    className="w-full px-3 py-2 text-sm border-2 border-gray-200 rounded-lg focus:border-emerald-500 transition-all outline-none"
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Status
                                </label>
                                <select
                                    value={selectedStatus}
                                    onChange={(e) => setSelectedStatus(e.target.value as 'All' | 'Open' | 'Closed')}
                                    className="w-full px-3 py-2 text-sm border-2 border-gray-200 rounded-lg focus:border-emerald-500 transition-all outline-none"
                                >
                                    <option value="All">All Status</option>
                                    <option value="Open">Open</option>
                                    <option value="Closed">Closed</option>
                                </select>
                            </div>

                            <div className="flex items-end">
                                <button
                                    onClick={resetFilters}
                                    className="w-full px-4 py-2 bg-gradient-to-r from-gray-500 to-gray-600 hover:from-gray-600 hover:to-gray-700 text-white font-semibold rounded-lg transition-all"
                                >
                                    Reset Filters
                                </button>
                            </div>
                        </div>
                    </div>
                )}

                <div

                    className="bg-white rounded-xl p-4 border border-gray-200"
                >
                    <div className="relative">
                        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
                        <input
                            type="text"
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            placeholder="Search by cashier name or date..."
                            className="w-full pl-10 pr-4 py-2.5 text-sm border-2 border-gray-200 rounded-lg focus:border-emerald-500 transition-all outline-none"
                        />
                    </div>
                </div>

                <div

                    className={'flex flex-col bg-white rounded-xl p-4 justify-between gap-8 border border-gray-200'}
                >
                    <div className="overflow-y-auto max-h-md md:h-[320px] lg:h-[450px] rounded-lg scrollbar-thin scrollbar-thumb-emerald-300 scrollbar-track-gray-100">
                        <table className="min-w-full divide-y divide-gray-200">
                            <thead className="bg-gradient-to-r from-emerald-500 to-emerald-600 sticky top-0 z-10">
                                <tr>
                                    {['#', 'Cashier', 'Date', 'Opening Time', 'Closing Time', 'Opening Balance', 'Expected Balance', 'Actual Balance', 'Difference', 'Status', 'Actions'].map((header, i, arr) => (
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
                                        <td colSpan={11} className="px-6 py-8 text-center">
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
                                            className="hover:bg-gray-50 transition-colors"
                                        >
                                            <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                                                {startIndex + index + 1}
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <div className="flex items-center">
                                                    <div className="flex-shrink-0 h-10 w-10">
                                                        <div className="h-10 w-10 rounded-full bg-gradient-to-br from-emerald-400 to-emerald-500 flex items-center justify-center">
                                                            <User className="h-5 w-5 text-white" />
                                                        </div>
                                                    </div>
                                                    <div className="ml-4">
                                                        <div className="text-sm font-medium text-gray-900">{session.cashierName}</div>
                                                    </div>
                                                </div>
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
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <div className="flex items-center text-sm text-gray-900">
                                                    {session.closingTime ? (
                                                        <>
                                                            <Clock className="mr-2 h-4 w-4 text-red-500" />
                                                            {session.closingTime}
                                                        </>
                                                    ) : (
                                                        <span className="text-gray-400">-</span>
                                                    )}
                                                </div>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm font-semibold text-gray-900">
                                                Rs. {session.openingBalance.toLocaleString()}
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm font-semibold text-blue-600">
                                                Rs. {session.expectedBalance.toLocaleString()}
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm font-semibold text-emerald-600">
                                                {session.actualBalance ? `Rs. ${session.actualBalance.toLocaleString()}` : '-'}
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm font-bold">
                                                {session.difference !== null ? (
                                                    <span className={session.difference >= 0 ? 'text-emerald-600' : 'text-red-600'}>
                                                        {session.difference >= 0 ? '+' : ''}Rs. {session.difference.toLocaleString()}
                                                    </span>
                                                ) : (
                                                    <span className="text-gray-400">-</span>
                                                )}
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <span className={`px-3 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${getStatusBadge(session.status)}`}>
                                                    {session.status}
                                                </span>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                                                <div className="flex items-center gap-2">
                                                    <button
                                                        onClick={() => handleViewDetails(session)}
                                                        className="p-2 bg-gradient-to-r from-emerald-500 to-emerald-600 hover:from-emerald-600 hover:to-emerald-700 text-white rounded-lg transition-all"
                                                        title="View Details"
                                                    >
                                                        <Eye size={16} />
                                                    </button>
                                                    {session.status === 'Open' && (
                                                        <button
                                                            onClick={() => handleCloseSession(session.id)}
                                                            className="p-2 bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white rounded-lg transition-all"
                                                            title="Close Session"
                                                        >
                                                            <CheckCircle size={16} />
                                                        </button>
                                                    )}
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
                </div>
            </div>

            {/* Session Detail Modal */}
            {showDetailModal && selectedSession && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
                    <div

                        className="bg-white rounded-2xl border border-gray-200 w-full max-w-5xl max-h-[90vh] overflow-hidden"
                    >
                        <div className="bg-gradient-to-r from-emerald-500 to-emerald-600 px-6 py-4 flex justify-between items-center">
                            <div>
                                <h2 className="text-2xl font-bold text-white">Session Details</h2>
                                <p className="text-sm text-emerald-100">{selectedSession.session.cashierName} - {selectedSession.session.date}</p>
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
                                <div className="bg-gradient-to-br from-red-50 to-red-100 rounded-lg p-4 border-2 border-red-200">
                                    <p className="text-xs text-red-600 font-semibold mb-1">Total Expenses</p>
                                    <p className="text-lg font-bold text-red-900">Rs. {selectedSession.session.totalExpenses.toLocaleString()}</p>
                                </div>
                                <div className="bg-gradient-to-br from-purple-50 to-purple-100 rounded-lg p-4 border-2 border-purple-200">
                                    <p className="text-xs text-purple-600 font-semibold mb-1">Net Cash Flow</p>
                                    <p className="text-lg font-bold text-purple-900">Rs. {(selectedSession.session.cashIn - selectedSession.session.cashOut).toLocaleString()}</p>
                                </div>
                            </div>

                            <div className="grid grid-cols-2 gap-4 mb-6">
                                <div className="bg-gray-50 rounded-lg p-4">
                                    <p className="text-sm text-gray-600 mb-3 font-semibold">Session Timing</p>
                                    <div className="space-y-2">
                                        <div className="flex items-center justify-between">
                                            <span className="text-xs text-gray-500">Opening Time:</span>
                                            <span className="text-sm font-semibold text-gray-900">{selectedSession.session.openingTime}</span>
                                        </div>
                                        <div className="flex items-center justify-between">
                                            <span className="text-xs text-gray-500">Closing Time:</span>
                                            <span className="text-sm font-semibold text-gray-900">{selectedSession.session.closingTime || '-'}</span>
                                        </div>
                                    </div>
                                </div>
                                <div className="bg-gray-50 rounded-lg p-4">
                                    <p className="text-sm text-gray-600 mb-3 font-semibold">Cash Reconciliation</p>
                                    <div className="space-y-2">
                                        <div className="flex items-center justify-between">
                                            <span className="text-xs text-gray-500">Expected Balance:</span>
                                            <span className="text-sm font-semibold text-blue-600">Rs. {selectedSession.session.expectedBalance.toLocaleString()}</span>
                                        </div>
                                        <div className="flex items-center justify-between">
                                            <span className="text-xs text-gray-500">Actual Balance:</span>
                                            <span className="text-sm font-semibold text-emerald-600">{selectedSession.session.actualBalance ? `Rs. ${selectedSession.session.actualBalance.toLocaleString()}` : '-'}</span>
                                        </div>
                                        {selectedSession.session.difference !== null && (
                                            <div className="flex items-center justify-between pt-2 border-t border-gray-200">
                                                <span className="text-xs text-gray-500 font-bold">Difference:</span>
                                                <span className={`text-sm font-bold ${selectedSession.session.difference >= 0 ? 'text-emerald-600' : 'text-red-600'}`}>
                                                    {selectedSession.session.difference >= 0 ? '+' : ''}Rs. {selectedSession.session.difference.toLocaleString()}
                                                </span>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            </div>

                            {/* Transactions */}
                            <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
                                <ArrowRightLeft className="text-emerald-600" size={24} />
                                Transactions
                            </h3>
                            <div className="border-2 border-gray-200 rounded-lg overflow-hidden">
                                <table className="w-full">
                                    <thead className="bg-gray-50">
                                        <tr>
                                            <th className="px-4 py-3 text-left text-xs font-bold text-gray-700">Time</th>
                                            <th className="px-4 py-3 text-left text-xs font-bold text-gray-700">Type</th>
                                            <th className="px-4 py-3 text-left text-xs font-bold text-gray-700">Description</th>
                                            <th className="px-4 py-3 text-left text-xs font-bold text-gray-700">Reference</th>
                                            <th className="px-4 py-3 text-right text-xs font-bold text-gray-700">Amount</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-gray-200">
                                        {selectedSession.transactions.map((transaction) => (
                                            <tr key={transaction.id} className="hover:bg-gray-50">
                                                <td className="px-4 py-3 text-sm text-gray-600">
                                                    <div className="flex items-center gap-2">
                                                        <Clock size={14} className="text-gray-400" />
                                                        {transaction.time}
                                                    </div>
                                                </td>
                                                <td className="px-4 py-3">
                                                    <span className={`px-2 py-1 text-xs font-semibold rounded-full ${getTransactionTypeBadge(transaction.type)}`}>
                                                        {transaction.type}
                                                    </span>
                                                </td>
                                                <td className="px-4 py-3 text-sm text-gray-900">{transaction.description}</td>
                                                <td className="px-4 py-3 text-sm text-gray-600 font-mono">{transaction.reference}</td>
                                                <td className="px-4 py-3 text-sm text-right font-bold">
                                                    <span className={
                                                        transaction.type === 'Sale' || transaction.type === 'Cash In'
                                                            ? 'text-emerald-600'
                                                            : 'text-red-600'
                                                    }>
                                                        {transaction.type === 'Sale' || transaction.type === 'Cash In' ? '+' : '-'}Rs. {transaction.amount.toLocaleString()}
                                                    </span>
                                                </td>
                                            </tr>
                                        ))}
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