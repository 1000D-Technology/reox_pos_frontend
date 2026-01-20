import {
    BookmarkCheck,
    ChevronLeft,
    ChevronRight,
    Copy,
    DollarSign,
    Download,
    Eye,
    FileSpreadsheet,
    Printer,
    RefreshCw,
    SearchCheck,
    ArrowUpRight,
    ArrowDownRight,
} from "lucide-react";
import { useEffect, useState } from "react";
import toast, { Toaster } from 'react-hot-toast';
import { supplierService } from '../../../services/supplierService';
import { grnService } from '../../../services/grnService';
import TypeableSelect from '../../../components/TypeableSelect';

interface GRNData {
    id: number;
    supplierName: string;
    supplierId: number;
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

interface SupplierOption {
    value: string | number;
    label: string;
}



function SupplierGrn() {

     const [grnData, setGrnData] = useState<GRNData[]>([]);
    const [isLoadingGRN, setIsLoadingGRN] = useState(true);
    const [stats, setStats] = useState({
        totalGrn: 0,
        totalAmount: 0,
        totalPaid: 0,
        totalBalance: 0
    });
    const [isLoadingStats, setIsLoadingStats] = useState(true);
    
    const summaryCards = [
        {
            icon: FileSpreadsheet,
            label: 'Total Bills',
            value: isLoadingStats ? '...' : stats.totalGrn.toString(),
            trend: '',
            color: 'bg-gradient-to-br from-emerald-400 to-emerald-500',
            iconColor: 'text-white',
            bgGlow: 'shadow-emerald-200'
        },
        {
            icon: DollarSign,
            label: 'Total Amount',
            value: isLoadingStats ? '...' : `LKR ${stats.totalAmount.toLocaleString()}`,
            trend: '',
            color: 'bg-gradient-to-br from-purple-400 to-purple-500',
            iconColor: 'text-white',
            bgGlow: 'shadow-purple-200'
        },
        {
            icon: Download,
            label: 'Total Paid',
            value: isLoadingStats ? '...' : `LKR ${stats.totalPaid.toLocaleString()}`,
            trend: '',
            color: 'bg-gradient-to-br from-blue-400 to-blue-500',
            iconColor: 'text-white',
            bgGlow: 'shadow-blue-200'
        },
        {
            icon: DollarSign,
            label: 'Total Balance',
            value: isLoadingStats ? '...' : `LKR ${stats.totalBalance.toLocaleString()}`,
            trend: '',
            color: 'bg-gradient-to-br from-red-400 to-red-500',
            iconColor: 'text-white',
            bgGlow: 'shadow-red-200'
        },
        
    ];

   

    const [selectedIndex, setSelectedIndex] = useState(0);
    const [suppliers, setSuppliers] = useState<SupplierOption[]>([]);
    const [isLoadingSuppliers, setIsLoadingSuppliers] = useState(true);
    const [selectedSupplier, setSelectedSupplier] = useState<SupplierOption | null>(null);
    
    // Search form state
    const [fromDate, setFromDate] = useState('');
    const [toDate, setToDate] = useState('');
    const [isSearching, setIsSearching] = useState(false);

    useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            if (e.key === "ArrowDown") {
                e.preventDefault();
                setSelectedIndex((prev) => (prev < grnData.length - 1 ? prev + 1 : prev));
            } else if (e.key === "ArrowUp") {
                e.preventDefault();
                setSelectedIndex((prev) => (prev > 0 ? prev - 1 : prev));
            }
        };

        window.addEventListener("keydown", handleKeyDown);
        return () => window.removeEventListener("keydown", handleKeyDown);
    }, [grnData.length]);

    // Fetch suppliers on component mount
    useEffect(() => {
        const fetchSuppliers = async () => {
            try {
                setIsLoadingSuppliers(true);
                const response = await supplierService.getSupplierDropdownList();
                const supplierOptions = response.data.data.map((supplier: Supplier) => ({
                    value: supplier.id.toString(),
                    label: supplier.companyName
                        ? `${supplier.supplierName} - ${supplier.companyName}`
                        : supplier.supplierName,
                }));
                setSuppliers(supplierOptions);
            } catch (error) {
                console.error('Error fetching suppliers:', error);
                toast.error('Failed to load suppliers');
            } finally {
                setIsLoadingSuppliers(false);
            }
        };

        fetchSuppliers();
    }, []);

    // Fetch stats data on component mount
    useEffect(() => {
        const fetchStats = async () => {
            try {
                setIsLoadingStats(true);
                const response = await grnService.getStats();
                setStats(response.data.data);
            } catch (error) {
                console.error('Error fetching stats:', error);
                toast.error('Failed to load statistics');
            } finally {
                setIsLoadingStats(false);
            }
        };

        fetchStats();
    }, []);

    // Fetch GRN data on component mount
    useEffect(() => {
        const fetchGRNData = async () => {
            try {
                setIsLoadingGRN(true);
                const response = await grnService.getGRNList();
                setGrnData(response.data.data || []);
            } catch (error) {
                console.error('Error fetching GRN data:', error);
                toast.error('Failed to load GRN data');
            } finally {
                setIsLoadingGRN(false);
            }
        };

        fetchGRNData();
    }, []);

    const handleSearch = async () => {
        try {
            setIsSearching(true);
            const queryParams = new URLSearchParams();
            
            // Add supplier name if selected
            if (selectedSupplier && selectedSupplier.label) {
                queryParams.append('supplierName', selectedSupplier.label.split(' - ')[0]);
            }
            
            // Add date filters
            if (fromDate) {
                queryParams.append('fromDate', fromDate);
            }
            if (toDate) {
                queryParams.append('toDate', toDate);
            }
            
            const response = await grnService.searchGRNList(queryParams.toString());
            setGrnData(response.data.data || []);
            
            toast.success(`Found ${response.data.data?.length || 0} GRN records`);
        } catch (error) {
            console.error('Error searching GRN data:', error);
            toast.error('Failed to search GRN data');
        } finally {
            setIsSearching(false);
        }
    };

    const handleReset = async () => {
        try {
            // Clear search form
            setSelectedSupplier(null);
            setFromDate('');
            setToDate('');
            
            // Reload all GRN data
            setIsLoadingGRN(true);
            const response = await grnService.getGRNList();
            setGrnData(response.data.data || []);
            
            toast.success('Filters cleared successfully');
        } catch (error) {
            console.error('Error resetting GRN data:', error);
            toast.error('Failed to reset data');
        } finally {
            setIsLoadingGRN(false);
        }
    };

    // Add state for pagination
    const [currentPage, setCurrentPage] = useState(1);
    const [itemsPerPage] = useState(10);

// Calculate pagination values
    const totalPages = Math.ceil(grnData.length / itemsPerPage);
    const startIndex = (currentPage - 1) * itemsPerPage;
    const endIndex = startIndex + itemsPerPage;
    const currentGRNData = grnData.slice(startIndex, endIndex);

// Pagination functions
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
                {/* Header */}
                <div>
                    <div className="text-sm text-gray-400 flex items-center">
                        <span>Supplier</span>
                        <span className="mx-2">›</span>
                        <span className="text-gray-700 font-medium">GRN Management</span>
                    </div>
                    <h1 className="text-3xl font-semibold bg-gradient-to-r from-gray-800 to-gray-600 bg-clip-text text-transparent">
                        GRN Management
                    </h1>
                </div>

                {/* Stats Cards */}
                <div className={'grid md:grid-cols-4 grid-cols-1 gap-4'}>
                    {summaryCards.map((stat, i) => (
                        <div
                            key={i}
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
                                    {/* <div className={`flex items-center gap-0.5 text-[10px] font-semibold ${stat.trend.startsWith('+') ? 'text-emerald-600' : 'text-red-600'}`}>
                                        {stat.trend.startsWith('+') ? <ArrowUpRight className="w-3 h-3" /> : <ArrowDownRight className="w-3 h-3" />}
                                        {stat.trend}
                                    </div> */}
                                </div>
                                <p className="text-sm font-bold text-gray-700">{stat.value}</p>
                            </div>
                        </div>
                    ))}
                </div>

                {/* Filter Section */}
                <div
                    className={'bg-white rounded-xl p-4 flex flex-col shadow-lg'}
                >
                    <h2 className="text-xl font-semibold text-gray-700 mb-3">Filter</h2>
                    <div className={'grid md:grid-cols-4 gap-4'}>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                Select Supplier
                            </label>
                            <TypeableSelect
                                options={suppliers}
                                value={selectedSupplier?.value || null}
                                onChange={(opt) => setSelectedSupplier(opt)}
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
                        <div className={'grid grid-cols-2 md:items-end items-start gap-2 text-white font-medium'}>
                            <button 
                                onClick={handleSearch}
                                disabled={isSearching}
                                className={'bg-gradient-to-r from-emerald-500 to-emerald-600 hover:from-emerald-600 hover:to-emerald-700 py-2 rounded-lg flex items-center justify-center shadow-lg shadow-emerald-200 hover:shadow-xl transition-all disabled:opacity-50 disabled:cursor-not-allowed'}
                            >
                                {isSearching ? (
                                    <RefreshCw className="animate-spin mr-2" size={14}/>
                                ) : (
                                    <SearchCheck className="mr-2" size={14}/>
                                )}
                                {isSearching ? 'Searching...' : 'Search'}
                            </button>
                            <button 
                                onClick={handleReset}
                                disabled={isSearching || isLoadingGRN}
                                className={'bg-gradient-to-r from-gray-500 to-gray-600 hover:from-gray-600 hover:to-gray-700 py-2 rounded-lg flex items-center justify-center shadow-lg shadow-gray-200 hover:shadow-xl transition-all disabled:opacity-50 disabled:cursor-not-allowed'}
                            >
                                <RefreshCw className="mr-2" size={14}/>Clear
                            </button>
                        </div>
                    </div>
                </div>

                {/* GRN Table */}
                <div
                    className={'flex flex-col bg-white rounded-xl h-full p-4 justify-between shadow-lg'}
                >
                    <div className="overflow-y-auto max-h-md md:h-[320px] lg:h-[500px] rounded-lg scrollbar-thin scrollbar-thumb-emerald-300 scrollbar-track-gray-100">
                        <table className="min-w-full divide-y divide-gray-200">
                            <thead className="bg-gradient-to-r from-emerald-500 to-emerald-600 sticky top-0 z-10">
                            <tr>
                                {[
                                    'Supplier ID',
                                    'Supplier Name',
                                    'Bill Number',
                                    'Amount',
                                    'Paid',
                                    'Balance',
                                    'Date',
                                    'Status',
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
                            {isLoadingGRN ? (
                                <tr>
                                    <td colSpan={9} className="px-6 py-8 text-center text-gray-500">
                                        <div className="flex items-center justify-center">
                                            <RefreshCw className="animate-spin mr-2" size={16} />
                                            Loading GRN data...
                                        </div>
                                    </td>
                                </tr>
                            ) : grnData.length === 0 ? (
                                <tr>
                                    <td colSpan={9} className="px-6 py-8 text-center text-gray-500">
                                        No GRN records found
                                    </td>
                                </tr>
                            ) : (
                                grnData.map((grn, index) => (
                                    <tr
                                        key={grn.id}
                                        onClick={() => setSelectedIndex(index)}
                                        className={`cursor-pointer transition-all ${
                                            selectedIndex === index
                                                ? 'bg-emerald-50 border-l-4 border-l-emerald-500'
                                                : 'hover:bg-gray-50'
                                        }`}
                                    >
                                        <td className="px-6 py-2 whitespace-nowrap text-sm font-semibold text-gray-800">
                                            {grn.supplierId}
                                        </td>
                                        <td className="px-6 py-2 whitespace-nowrap text-sm font-medium text-gray-700">
                                            {grn.supplierName}
                                        </td>
                                        <td className="px-6 py-2 whitespace-nowrap text-sm text-gray-600">
                                            {grn.billNumber}
                                        </td>
                                        <td className="px-6 py-2 whitespace-nowrap text-sm font-bold text-emerald-600">
                                            LKR {grn.totalAmount.toLocaleString()}
                                        </td>
                                        <td className="px-6 py-2 whitespace-nowrap text-sm font-medium text-blue-600">
                                            LKR {grn.paidAmount.toLocaleString()}
                                        </td>
                                        <td className="px-6 py-2 whitespace-nowrap text-sm font-medium text-red-600">
                                            LKR {grn.balanceAmount.toLocaleString()}
                                        </td>
                                        <td className="px-6 py-2 whitespace-nowrap text-sm text-gray-600">
                                            {grn.grnDate}
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <span className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${
                                                grn.statusName === 'Active' ? 'bg-yellow-100 text-yellow-800' : 'bg-green-100 text-green-800'
                                            }`}>
                                                {grn.statusName === 'Active' ? 'Pending' : 'Complete'}
                                            </span>
                                        </td>
                                        <td className="px-6 py-2 whitespace-nowrap text-sm font-medium">
                                            <div className="flex gap-2">
                                                <button className="p-2 bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white rounded-lg shadow-md hover:shadow-lg transition-all">
                                                    <Eye size={16}/>
                                                </button>
                                                <button className="p-2 bg-gradient-to-r from-emerald-500 to-emerald-600 hover:from-emerald-600 hover:to-emerald-700 text-white rounded-lg shadow-md hover:shadow-lg transition-all">
                                                    <Printer size={16}/>
                                                </button>
                                                <button className="p-2 bg-gradient-to-r from-purple-500 to-purple-600 hover:from-purple-600 hover:to-purple-700 text-white rounded-lg shadow-md hover:shadow-lg transition-all">
                                                    <Copy size={16}/>
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
                            Showing <span className="font-semibold text-gray-800">{startIndex + 1}</span> to{' '}
                            <span className="font-semibold text-gray-800">{Math.min(endIndex, grnData.length)}</span> of{' '}
                            <span className="font-semibold text-gray-800">{grnData.length}</span> results
                        </div>
                        <div className="flex items-center space-x-2">
                            <button
                                onClick={goToPreviousPage}
                                disabled={currentPage === 1}
                                className={`flex items-center px-3 py-2 text-sm font-medium rounded-lg transition-all ${
                                    currentPage === 1
                                        ? 'text-gray-400 cursor-not-allowed'
                                        : 'text-gray-600 hover:text-emerald-600 hover:bg-emerald-50'
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
                                                    ? 'bg-gradient-to-r from-emerald-500 to-emerald-600 text-white shadow-md'
                                                    : 'text-gray-600 hover:bg-emerald-50 hover:text-emerald-600'
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
                                        : 'text-gray-600 hover:text-emerald-600 hover:bg-emerald-50'
                                }`}
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

export default SupplierGrn;