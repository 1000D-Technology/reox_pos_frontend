import {
    ArrowDownRight,
    ArrowUpRight,
    BadgeDollarSign,
    ChevronLeft,
    ChevronRight,
    Download,
    Eye,
    FileSpreadsheet,
    Printer,
    RefreshCw,
    Scale,
    SearchCheck,
} from "lucide-react";
import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import TypeableSelect from "../../../components/TypeableSelect.tsx";
import { supplierService } from "../../../services/supplierService.ts";
import { grnService } from "../../../services/grnService.ts";
import toast, { Toaster } from 'react-hot-toast';

interface SelectOption {
    value: string | number;
    label: string;
}

interface GrnItem {
    id: number;
    supplierName: string;
    billNumber: string;
    totalAmount: number;
    paidAmount: number;
    balanceAmount: number;
    grnDate: string;
    statusName: string;
}

interface Supplier {
    id: number;
    supplierName: string;
    companyName?: string;
}

interface ApiError {
    response?: {
        data?: {
            message?: string;
        };
    };
}

function GrnList() {
    const [summaryData, setSummaryData] = useState({
        totalGrn: 0,
        totalAmount: 0,
        totalPaid: 0,
        totalBalance: 0
    });

    const getSummaryCards = () => [
        {
            label: 'Total GRN',
            value: summaryData.totalGrn.toString(),
            icon: FileSpreadsheet,
            color: 'bg-emerald-100',
            iconColor: 'text-emerald-600',
            bgGlow: 'shadow-emerald-100',
            trend: '+12%'
        },
        {
            label: 'Total Amount',
            value: `LKR ${summaryData.totalAmount.toFixed(2)}`,
            icon: BadgeDollarSign,
            color: 'bg-purple-100',
            iconColor: 'text-purple-600',
            bgGlow: 'shadow-purple-100',
            trend: '+8%'
        },
        {
            label: 'Total Paid',
            value: `LKR ${summaryData.totalPaid.toFixed(2)}`,
            icon: Download,
            color: 'bg-yellow-100',
            iconColor: 'text-yellow-600',
            bgGlow: 'shadow-yellow-100',
            trend: '+15%'
        },
        {
            label: 'Total Balance',
            value: `LKR ${summaryData.totalBalance.toFixed(2)}`,
            icon: Scale,
            color: 'bg-red-100',
            iconColor: 'text-red-600',
            bgGlow: 'shadow-red-100',
            trend: '-5%'
        },
    ];

    const [grnListData, setGrnListData] = useState<GrnItem[]>([]);
    const [isLoadingGrnList, setIsLoadingGrnList] = useState(false);
    const [selected, setSelected] = useState<SelectOption | null>(null);
    const [suppliers, setSuppliers] = useState<SelectOption[]>([]);
    const [isLoadingSuppliers, setIsLoadingSuppliers] = useState(false);
    const [fromDate, setFromDate] = useState<string>('');
    const [toDate, setToDate] = useState<string>('');
    const [billNumber, setBillNumber] = useState<string>('');
    const [isSearching, setIsSearching] = useState(false);
    const [selectedIndex, setSelectedIndex] = useState(0);
    const [currentPage, setCurrentPage] = useState(1);
    const [itemsPerPage] = useState(10);

    const totalPages = Math.ceil(grnListData.length / itemsPerPage);
    const startIndex = (currentPage - 1) * itemsPerPage;
    const endIndex = startIndex + itemsPerPage;
    const currentPageData = grnListData.slice(startIndex, endIndex);

    const fetchGrnSummary = async () => {
        try {
            const response = await grnService.getStats();
            if (response.data.success) {
                setSummaryData(response.data.data);
            } else {
                toast.error('Failed to load GRN summary');
            }
        } catch (error) {
            const apiError = error as ApiError;
            console.error('Error fetching GRN summary:', error);
            toast.error(apiError.response?.data?.message || 'Failed to load GRN summary');
        }
    };

    const fetchGrnList = async () => {
        setIsLoadingGrnList(true);
        try {
            const response = await grnService.getGRNList();
            if (response.data.success) {
                setGrnListData(response.data.data);
            } else {
                toast.error('Failed to load GRN list');
            }
        } catch (error) {
            const apiError = error as ApiError;
            console.error('Error fetching GRN list:', error);
            toast.error(apiError.response?.data?.message || 'Failed to load GRN list');
        } finally {
            setIsLoadingGrnList(false);
        }
    };

    const fetchSuppliers = async () => {
        setIsLoadingSuppliers(true);
        try {
            const response = await supplierService.getSuppliers();
            if (response.data.success) {
                const supplierOptions = response.data.data.map((supplier: Supplier) => ({
                    value: supplier.id.toString(),
                    label: supplier.companyName
                        ? `${supplier.supplierName} - ${supplier.companyName}`
                        : supplier.supplierName,
                }));
                setSuppliers(supplierOptions);
            } else {
                toast.error('Failed to load suppliers');
            }
        } catch (error) {
            const apiError = error as ApiError;
            console.error('Error fetching suppliers:', error);
            toast.error(apiError.response?.data?.message || 'Failed to load suppliers');
        } finally {
            setIsLoadingSuppliers(false);
        }
    };

    const searchGRNs = async () => {
        setIsSearching(true);
        try {
            const params = new URLSearchParams();

            if (selected) {
                const supplierName = selected.label.includes(' - ')
                    ? selected.label.split(' - ')[0]
                    : selected.label;
                params.append('supplierName', supplierName);
            }
            if (fromDate) params.append('fromDate', fromDate);
            if (toDate) params.append('toDate', toDate);
            if (billNumber.trim()) params.append('billNumber', billNumber.trim());

            const response = await grnService.searchGRNList(params.toString());

            if (response.data.success) {
                setGrnListData(response.data.data);
                toast.success(`Found ${response.data.data.length} GRN records`);
            } else {
                toast.error('Search failed');
            }
        } catch (error) {
            const apiError = error as ApiError;
            console.error('Error searching GRNs:', error);
            toast.error(apiError.response?.data?.message || 'Failed to search GRN records');
        } finally {
            setIsSearching(false);
        }
    };

    const clearSearch = () => {
        setSelected(null);
        setFromDate('');
        setToDate('');
        setBillNumber('');
        fetchGrnList();
        toast.success('Search filters cleared');
    };

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

    const getBalanceColorClass = (balance: number) => {
        if (balance === 0) return 'text-green-600 font-semibold';
        if (balance > 0) return 'text-red-600 font-semibold';
        return 'text-blue-600 font-semibold';
    };

    useEffect(() => {
        fetchGrnSummary();
        fetchGrnList();
        fetchSuppliers();
    }, []);

    useEffect(() => {
        setCurrentPage(1);
        setSelectedIndex(0);
    }, [grnListData.length]);

    useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            if (e.key === "ArrowDown") {
                setSelectedIndex((prev) => (prev < currentPageData.length - 1 ? prev + 1 : prev));
            } else if (e.key === "ArrowUp") {
                setSelectedIndex((prev) => (prev > 0 ? prev - 1 : prev));
            }
        };

        window.addEventListener("keydown", handleKeyDown);
        return () => window.removeEventListener("keydown", handleKeyDown);
    }, [currentPageData.length]);

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
                <div>
                    <div className="text-sm text-gray-400 flex items-center">
                        <span>Pages</span>
                        <span className="mx-2">›</span>
                        <span className="text-gray-700 font-medium">GRN List</span>
                    </div>
                    <h1 className="text-3xl font-semibold bg-gradient-to-r from-gray-800 to-gray-600 bg-clip-text text-transparent">
                        GRN List
                    </h1>
                </div>

                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className={'rounded-xl grid md:grid-cols-4 grid-cols-2 gap-4'}
                >
                    {getSummaryCards().map((stat, i) => (
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
                                    <div className={`flex items-center gap-0.5 text-[10px] font-semibold ${stat.trend.startsWith('+') ? 'text-emerald-600' : 'text-red-600'}`}>
                                        {stat.trend.startsWith('+') ? <ArrowUpRight className="w-3 h-3" /> : <ArrowDownRight className="w-3 h-3" />}
                                        {stat.trend}
                                    </div>
                                </div>
                                <p className="text-sm font-bold text-gray-700">{stat.value}</p>
                            </div>
                        </motion.div>
                    ))}
                </motion.div>

                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.2 }}
                    className={'bg-white rounded-xl p-6 shadow-lg'}
                >
                    <div className={'grid md:grid-cols-5 gap-4'}>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                Select Supplier
                            </label>
                            <TypeableSelect
                                options={suppliers}
                                value={selected?.value || null}
                                onChange={(opt) => setSelected(opt)}
                                placeholder={isLoadingSuppliers ? "Loading suppliers..." : "Type to search Supplier"}
                                disabled={isLoadingSuppliers}
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

                        <div>
                            <label htmlFor="bill-number" className="block text-sm font-medium text-gray-700 mb-1">
                                Bill Number
                            </label>
                            <input
                                type="text"
                                id="bill-number"
                                value={billNumber}
                                onChange={(e) => setBillNumber(e.target.value)}
                                placeholder="Enter Bill Number..."
                                className="w-full text-sm rounded-lg py-2 px-3 border-2 border-gray-200 focus:border-emerald-400 focus:outline-none transition-all"
                            />
                        </div>

                        <div className={'grid grid-cols-2 md:items-end items-start gap-2 text-white font-medium'}>
                            <button
                                onClick={searchGRNs}
                                disabled={isSearching}
                                className={`bg-gradient-to-r from-emerald-500 to-emerald-600 hover:from-emerald-600 hover:to-emerald-700 rounded-lg py-2 px-4 flex items-center justify-center gap-2 shadow-lg shadow-emerald-200 hover:shadow-xl transition-all ${
                                    isSearching ? 'opacity-50 cursor-not-allowed' : ''
                                }`}
                            >
                                <SearchCheck size={18} />
                                {isSearching ? 'Searching...' : 'Search'}
                            </button>
                            <button
                                onClick={clearSearch}
                                className="bg-gradient-to-r from-gray-500 to-gray-600 hover:from-gray-600 hover:to-gray-700 rounded-lg py-2 px-4 flex items-center justify-center gap-2 shadow-lg shadow-gray-200 hover:shadow-xl transition-all"
                            >
                                <RefreshCw size={18} />
                                Clear
                            </button>
                        </div>
                    </div>
                </motion.div>

                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.3 }}
                    className={'flex flex-col bg-white rounded-xl h-full p-6 justify-between shadow-lg'}
                >
                    <div className="overflow-y-auto max-h-md md:h-[320px] lg:h-[500px] rounded-lg scrollbar-thin scrollbar-thumb-emerald-300 scrollbar-track-gray-100">
                        <table className="min-w-full divide-y divide-gray-200">
                            <thead className="bg-gradient-to-r from-emerald-600 to-emerald-700 sticky top-0 z-10">
                            <tr>
                                {[
                                    'No', 'Supplier Name', 'Bill Number', 'Total Amount', 'Paid Amount', 'Balance', 'GRN Date', 'Status', 'Actions'
                                ].map((header, i, arr) => (
                                    <th
                                        key={i}
                                        className={`px-6 py-3 text-left text-xs font-semibold text-white uppercase tracking-wider ${
                                            i === 0 ? 'rounded-tl-lg' : i === arr.length - 1 ? 'rounded-tr-lg' : ''
                                        }`}
                                    >
                                        {header}
                                    </th>
                                ))}
                            </tr>
                            </thead>

                            <tbody className="bg-white divide-y divide-gray-200">
                            {isLoadingGrnList ? (
                                <tr>
                                    <td colSpan={9} className="px-6 py-8 text-center">
                                        <div className="flex items-center justify-center gap-2">
                                            <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-emerald-600"></div>
                                            <span className="text-sm text-gray-500">Loading GRN records...</span>
                                        </div>
                                    </td>
                                </tr>
                            ) : currentPageData.length === 0 ? (
                                <tr>
                                    <td colSpan={9} className="px-6 py-8 text-center text-sm text-gray-500">
                                        No GRN records found
                                    </td>
                                </tr>
                            ) : (
                                currentPageData.map((grn, index) => (
                                    <tr
                                        key={grn.id}
                                        className={`hover:bg-emerald-50 transition-colors ${
                                            selectedIndex === index ? 'bg-emerald-100' : ''
                                        }`}
                                    >
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{startIndex + index + 1}</td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{grn.supplierName}</td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{grn.billNumber}</td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">LKR {grn.totalAmount.toFixed(2)}</td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">LKR {grn.paidAmount.toFixed(2)}</td>
                                        <td className={`px-6 py-4 whitespace-nowrap text-sm ${getBalanceColorClass(grn.balanceAmount)}`}>
                                            LKR {grn.balanceAmount.toFixed(2)}
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                            {new Date(grn.grnDate).toLocaleDateString('en-US', {
                                                year: 'numeric',
                                                month: '2-digit',
                                                day: '2-digit'
                                            })}
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <span className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${
                                                grn.statusName === 'Completed' ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'
                                            }`}>
                                                {grn.statusName}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                                            <div className="flex gap-4">
                                                <button className="text-blue-600 hover:text-blue-900 transition-colors">
                                                    <Eye size={18} />
                                                </button>
                                                <button className="text-emerald-600 hover:text-emerald-900 transition-colors">
                                                    <Printer size={18} />
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
                            Showing {startIndex + 1} to {Math.min(endIndex, grnListData.length)} of {grnListData.length} records
                        </div>
                        <div className="flex items-center space-x-2">
                            <button
                                onClick={() => goToPage(currentPage - 1)}
                                disabled={currentPage === 1}
                                className="p-2 rounded-lg bg-gray-100 text-gray-600 hover:bg-emerald-100 hover:text-emerald-600 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
                            >
                                <ChevronLeft size={18} />
                            </button>

                            {getPageNumbers().map((page, index) => (
                                <button
                                    key={index}
                                    onClick={() => typeof page === 'number' && goToPage(page)}
                                    disabled={page === '...'}
                                    className={`px-3 py-1 rounded-lg text-sm font-medium transition-all ${
                                        page === currentPage
                                            ? 'bg-emerald-600 text-white shadow-lg'
                                            : page === '...'
                                                ? 'cursor-default text-gray-400'
                                                : 'bg-gray-100 text-gray-700 hover:bg-emerald-100 hover:text-emerald-600'
                                    }`}
                                >
                                    {page}
                                </button>
                            ))}

                            <button
                                onClick={() => goToPage(currentPage + 1)}
                                disabled={currentPage === totalPages}
                                className="p-2 rounded-lg bg-gray-100 text-gray-600 hover:bg-emerald-100 hover:text-emerald-600 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
                            >
                                <ChevronRight size={18} />
                            </button>
                        </div>
                    </nav>
                </motion.div>
            </div>
        </>
    );
}

export default GrnList;