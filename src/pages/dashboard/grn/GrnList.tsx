import {
    BadgeDollarSign,
    CheckCheck,
    ChevronLeft, ChevronRight, Download,
    Eye, Files, FileSpreadsheet,
    Printer,
    RefreshCw,
    Scale,
    SearchCheck,

} from "lucide-react";
import {useEffect, useState} from "react";
import TypeableSelect from "../../../components/TypeableSelect.tsx";
import axiosInstance from "../../../api/axiosInstance.ts";
import { supplierService } from "../../../services/supplierService.ts";
import toast, { Toaster } from 'react-hot-toast';


function GrnList() {
    // Type definitions
    type SelectOption = {
        value: string;
        label: string;
    };

    type GrnItem = {
        id: number;
        supplierName: string;
        billNumber: string;
        totalAmount: number;
        paidAmount: number;
        balanceAmount: number;
        grnDate: string;
        statusName: string;
    };

    // Summary data state
    const [summaryData, setSummaryData] = useState({
        totalGrn: 0,
        totalAmount: 0,
        totalPaid: 0,
        totalBalance: 0
    });
    const [isLoadingSummary, setIsLoadingSummary] = useState(false);

    // Summary cards configuration (without discount)
    const getSummaryCards = () => [
        {title: 'Total GRN', value: summaryData.totalGrn.toString(), icon: <FileSpreadsheet size={20}/>,backgroundColor:'bg-emerald-200',iconColor:'text-emerald-700'},
        {title: 'Total Amount', value: `LKR.${summaryData.totalAmount.toFixed(2)}`, icon: <BadgeDollarSign size={20}/>,backgroundColor:'bg-purple-200',iconColor:'text-purple-700'},
        {title: 'Total Paid', value: `LKR.${summaryData.totalPaid.toFixed(2)}`, icon: <Download size={20}/>,backgroundColor:'bg-yellow-200',iconColor:'text-yellow-700'},
        {title: 'Total Balance', value: `LKR.${summaryData.totalBalance.toFixed(2)}`, icon: <Scale size={20}/>,backgroundColor:'bg-red-200',iconColor:'text-red-700'},
    ];

    // GRN list data state
    const [grnListData, setGrnListData] = useState<GrnItem[]>([]);
    const [isLoadingGrnList, setIsLoadingGrnList] = useState(false);
    
    // Supplier selection state
    const [selected, setSelected] = useState<SelectOption | null>(null);
    const [suppliers, setSuppliers] = useState<SelectOption[]>([]);
    const [isLoadingSuppliers, setIsLoadingSuppliers] = useState(false);
    
    // Search filter states
    const [fromDate, setFromDate] = useState<string>('');
    const [toDate, setToDate] = useState<string>('');
    const [billNumber, setBillNumber] = useState<string>('');
    const [isSearching, setIsSearching] = useState(false);

    // Fetch GRN summary data
    const fetchGrnSummary = async () => {
        setIsLoadingSummary(true);
        try {
            const response = await axiosInstance.get('/api/grn/summary');
            if (response.data.success) {
                setSummaryData(response.data.data);
            } else {
                toast.error('Failed to load GRN summary');
            }
        } catch (error) {
            console.error('Error fetching GRN summary:', error);
            toast.error('Failed to load GRN summary');
        } finally {
            setIsLoadingSummary(false);
        }
    };

    // Fetch GRN list data
    const fetchGrnList = async () => {
        setIsLoadingGrnList(true);
        try {
            const response = await axiosInstance.get('/api/grn/list');
            if (response.data.success) {
                setGrnListData(response.data.data);
            } else {
                toast.error('Failed to load GRN list');
            }
        } catch (error) {
            console.error('Error fetching GRN list:', error);
            toast.error('Failed to load GRN list');
        } finally {
            setIsLoadingGrnList(false);
        }
    };

    // Fetch suppliers data
    const fetchSuppliers = async () => {
        setIsLoadingSuppliers(true);
        try {
            const response = await supplierService.getSuppliers();
            if (response.data.success) {
                const supplierOptions = response.data.data.map((supplier: any) => ({
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
            console.error('Error fetching suppliers:', error);
            toast.error('Failed to load suppliers');
        } finally {
            setIsLoadingSuppliers(false);
        }
    };

    // Search GRN function
    const searchGRNs = async () => {
        setIsSearching(true);
        try {
            const params = new URLSearchParams();
            
            // Add search parameters if they exist
            if (selected) {
                // Extract supplier name from the label (remove company name part)
                const supplierName = selected.label.includes(' - ') 
                    ? selected.label.split(' - ')[0] 
                    : selected.label;
                params.append('supplierName', supplierName);
            }
            if (fromDate) params.append('fromDate', fromDate);
            if (toDate) params.append('toDate', toDate);
            if (billNumber.trim()) params.append('billNumber', billNumber.trim());
            
            const response = await axiosInstance.get(`/api/grn/search?${params.toString()}`);
            
            if (response.data.success) {
                setGrnListData(response.data.data);
                toast.success(`Found ${response.data.data.length} GRN records`);
            } else {
                toast.error('Search failed');
            }
        } catch (error) {
            console.error('Error searching GRNs:', error);
            toast.error('Failed to search GRN records');
        } finally {
            setIsSearching(false);
        }
    };

    // Clear search filters and reload all data
    const clearSearch = () => {
        setSelected(null);
        setFromDate('');
        setToDate('');
        setBillNumber('');
        
        // Reload all GRN data
        fetchGrnList();
        toast.success('Search filters cleared');
    };

    // 🔹 Selected row state
    const [selectedIndex, setSelectedIndex] = useState(0);

    // Pagination state
    const [currentPage, setCurrentPage] = useState(1);
    const [itemsPerPage] = useState(10);

    // Calculate pagination values
    const totalPages = Math.ceil(grnListData.length / itemsPerPage);
    const startIndex = (currentPage - 1) * itemsPerPage;
    const endIndex = startIndex + itemsPerPage;
    const currentPageData = grnListData.slice(startIndex, endIndex);

    // Pagination functions
    const goToPage = (page: number) => {
        setCurrentPage(page);
        setSelectedIndex(0); // Reset selected row when changing pages
    };

    const goToPreviousPage = () => {
        if (currentPage > 1) {
            goToPage(currentPage - 1);
        }
    };

    const goToNextPage = () => {
        if (currentPage < totalPages) {
            goToPage(currentPage + 1);
        }
    };

    // Generate page numbers for display
    const getPageNumbers = () => {
        const pages = [];
        const maxVisiblePages = 5;
        let startPage = Math.max(1, currentPage - Math.floor(maxVisiblePages / 2));
        let endPage = Math.min(totalPages, startPage + maxVisiblePages - 1);

        // Adjust start page if we're near the end
        if (endPage - startPage + 1 < maxVisiblePages) {
            startPage = Math.max(1, endPage - maxVisiblePages + 1);
        }

        for (let i = startPage; i <= endPage; i++) {
            pages.push(i);
        }
        return pages;
    };

    // Load summary data, GRN list, and suppliers on component mount
    useEffect(() => {
        fetchGrnSummary();
        fetchGrnList();
        fetchSuppliers();
    }, []);

    // Reset pagination when data changes
    useEffect(() => {
        setCurrentPage(1);
        setSelectedIndex(0);
    }, [grnListData.length]);

    // 🔹 Handle Up / Down arrow keys
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
                            background: '#10B981',
                        },
                    },
                    error: {
                        duration: 4000,
                        style: {
                            background: '#EF4444',
                        },
                    },
                    loading: {
                        style: {
                            background: '#3B82F6',
                        },
                    },
                }}
            />
            <div className={'flex flex-col gap-4 h-full'}>
            <div>
                <div className="text-sm text-gray-500 flex items-center">
                    <span>Pages</span>
                    <span className="mx-2">›</span>
                    <span className="text-black">GRN List</span>
                </div>
                <h1 className="text-3xl font-semibold text-gray-500">GRN List</h1>
            </div>
            <div className={' rounded-md grid md:grid-cols-4 grid-cols-2 gap-4'}>
                {getSummaryCards().map((card, index) => (
                    <div key={index} className="bg-white p-5 rounded-xl  flex items-center space-x-4 ">
                        <div className={`p-3 rounded-full ${card.backgroundColor}`}>
                            <span className={`${card.iconColor}`}>{card.icon}</span>
                        </div>
                        <div className='border-l-2 border-[#D9D9D9] pl-2'>
                            <p className="text-sm text-gray-400 ">{card.title}</p>
                            <p className="text-lg font-semibold text-gray-900">{card.value}</p>
                        </div>
                    </div>
                ))}
            </div>
            <div className={'bg-white rounded-md p-4 flex flex-col'}>

                <div className={'grid md:grid-cols-5 gap-4 '}>
                    <div>
                        <label
                            htmlFor="supplier"
                            className="block text-sm font-medium text-gray-700 mb-1"
                        >
                            Select Supplier
                        </label>
                        <TypeableSelect
                            options={suppliers}
                            value={selected?.value || null}
                            onChange={(opt) =>
                                opt
                                    ? setSelected({
                                        value: String(opt.value),
                                        label: opt.label,
                                    })
                                    : setSelected(null)
                            }
                            placeholder={isLoadingSuppliers ? "Loading suppliers..." : "Type to search Supplier"}
                            allowCreate={false}
                            disabled={isLoadingSuppliers}
                        />
                    </div>

                    <div>
                        <label htmlFor="from-date"
                               className="block text-sm font-medium text-gray-700 mb-1">From Date</label>
                        <input 
                            type="date" 
                            id="from-date" 
                            value={fromDate}
                            onChange={(e) => setFromDate(e.target.value)}
                            className="w-full text-sm rounded-md py-2 px-2  border-2 border-gray-100 "
                        />
                    </div>
                    <div>
                        <label htmlFor="to-date"
                               className="block text-sm font-medium text-gray-700 mb-1">To Date</label>
                        <input 
                            type="date" 
                            id="to-date" 
                            value={toDate}
                            onChange={(e) => setToDate(e.target.value)}
                            className="w-full text-sm rounded-md py-2 px-2  border-2 border-gray-100 "
                        />
                    </div>
                    <div>
                        <label htmlFor="bill-number"
                               className="block text-sm font-medium text-gray-700 mb-1">Bill Number</label>
                        <input 
                            type="text" 
                            id="bill-number" 
                            value={billNumber}
                            onChange={(e) => setBillNumber(e.target.value)}
                            placeholder="Enter Bill Number..."
                            className="w-full text-sm rounded-md py-2 px-2  border-2 border-gray-100 "
                        />
                    </div>
                    <div className={'grid grid-cols-2 md:items-end items-start gap-2 text-white font-medium'}>
                        <button 
                            onClick={searchGRNs}
                            disabled={isSearching}
                            className={`py-2 rounded-md flex items-center justify-center transition-colors ${
                                isSearching 
                                    ? 'bg-emerald-400 cursor-not-allowed' 
                                    : 'bg-emerald-600 hover:bg-emerald-700'
                            }`}
                        >
                            <SearchCheck className="mr-2" size={14}/>
                            {isSearching ? 'Searching...' : 'Search'}
                        </button>
                        <button 
                            onClick={clearSearch}
                            className={'bg-gray-500 py-2 rounded-md flex items-center justify-center hover:bg-gray-600 transition-colors'}
                        >
                            <RefreshCw className="mr-2" size={14}/>Clear
                        </button>
                    </div>
                </div>
            </div>
            <div className={'flex flex-col bg-white rounded-md h-full p-4 justify-between'}>
                <div
                    className="overflow-y-auto max-h-md md:h-[320px] lg:h-[500px] rounded-md scrollbar-thin scrollbar-thumb-gray-300 scrollbar-track-gray-100">
                    <table className="min-w-full divide-y divide-gray-200">
                        <thead className="bg-emerald-600 sticky top-0 z-10">
                        <tr>
                            {[
                                '#',
                                'Supplier Name',
                                'Bill Number',
                                'Amount',
                                'Paid',
                                'Balance',
                                'Date',
                                'Status',
                                'Actions'
                            ].map((header, i, arr) => (
                                <th
                                    key={header}
                                    scope="col"
                                    className={`px-6 py-3 text-left text-sm font-medium text-white tracking-wider
                            ${i === 0 ? "rounded-tl-lg" : ""}
                            ${i === arr.length - 1 ? "rounded-tr-lg" : ""}`}
                                >
                                    {header}
                                </th>
                            ))}
                        </tr>
                        </thead>

                        <tbody className="bg-white divide-y divide-gray-200">
                        {isLoadingGrnList ? (
                            <tr>
                                <td colSpan={9} className="px-6 py-4 text-center text-sm text-gray-500">
                                    Loading GRN data...
                                </td>
                            </tr>
                        ) : currentPageData.length === 0 ? (
                            <tr>
                                <td colSpan={9} className="px-6 py-4 text-center text-sm text-gray-500">
                                    {grnListData.length === 0 ? 'No GRN records found' : 'No data on this page'}
                                </td>
                            </tr>
                        ) : (
                            currentPageData.map((grn, index) => (
                                <tr
                                    key={grn.id}
                                    onClick={() => setSelectedIndex(index)}
                                    className={`cursor-pointer ${
                                        index === selectedIndex
                                            ? "bg-green-100 border-l-4 border-green-600"
                                            : "hover:bg-green-50"
                                    }`}
                                >
                                    <td className="px-6 py-2 whitespace-nowrap text-sm font-medium">
                                        {grn.id}
                                    </td>
                                    <td className="px-6 py-2 whitespace-nowrap text-sm font-medium">
                                        {grn.supplierName}
                                    </td>
                                    <td className="px-6 py-2 whitespace-nowrap text-sm font-medium">
                                        {grn.billNumber}
                                    </td>
                                    <td className="px-6 py-2 whitespace-nowrap text-sm font-medium">
                                        LKR.{Number(grn.totalAmount).toFixed(2)}
                                    </td>
                                    <td className="px-6 py-2 whitespace-nowrap text-sm font-medium">
                                        LKR.{Number(grn.paidAmount).toFixed(2)}
                                    </td>
                                    <td className="px-6 py-2 whitespace-nowrap text-sm font-medium">
                                        <span className={Number(grn.balanceAmount) > 0 ? 'text-red-600 font-semibold' : ''}>
                                            LKR.{Number(grn.balanceAmount).toFixed(2)}
                                        </span>
                                    </td>
                                    <td className="px-6 py-2 whitespace-nowrap text-sm font-medium">
                                        {grn.grnDate}
                                    </td>
                                    <td className="px-6 py-2 whitespace-nowrap text-sm font-medium">
                                        <span className={`px-2 py-1 text-xs rounded-full ${
                                            grn.statusName === 'Active' ? 'bg-green-100 text-green-800' :
                                            grn.statusName === 'Paid' ? 'bg-blue-100 text-blue-800' :
                                            'bg-gray-100 text-gray-800'
                                        }`}>
                                            {grn.statusName}
                                        </span>
                                    </td>
                                    <td className="px-6 py-2 whitespace-nowrap text-sm font-medium">
                                        <div className="flex items-center space-x-2">
                                            <div className="relative group">
                                                <button
                                                    className="p-2 bg-green-100 rounded-full text-green-700 hover:bg-green-200 transition-colors">
                                                    <Printer className="w-5 h-5"/>
                                                </button>
                                                <span
                                                    className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 w-max px-2 py-1 text-xs text-white bg-gray-900 rounded-md invisible group-hover:visible opacity-0 group-hover:opacity-100 transition-opacity">
                                            Print GRN
                                        </span>
                                            </div>
                                            <div className="relative group">
                                                <button
                                                    className="p-2 bg-yellow-100 rounded-full text-yellow-700 hover:bg-yellow-200 transition-colors">
                                                    <Eye className="w-5 h-5"/>
                                                </button>
                                                <span
                                                    className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 w-max px-2 py-1 text-xs text-white bg-gray-900 rounded-md invisible group-hover:visible opacity-0 group-hover:opacity-100 transition-opacity">
                                            View GRN
                                        </span>
                                            </div>
                                            <div className="relative group">
                                                <button
                                                    className="p-2 bg-blue-100 rounded-full text-blue-700 hover:bg-blue-200 transition-colors">
                                                    <Files className="w-5 h-5"/>
                                                </button>
                                                <span
                                                    className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 w-max px-2 py-1 text-xs text-white bg-gray-900 rounded-md invisible group-hover:visible opacity-0 group-hover:opacity-100 transition-opacity">
                                            View Details
                                        </span>
                                            </div>
                                        </div>
                                    </td>
                                </tr>
                            ))
                        )}
                        </tbody>
                    </table>
                </div>

                <nav className="bg-white flex items-center justify-between sm:px-6 py-3 border-t">
                    <div className="flex items-center text-sm text-gray-700">
                        <span>
                            Showing {startIndex + 1} to {Math.min(endIndex, grnListData.length)} of {grnListData.length} results
                        </span>
                    </div>
                    <div className="flex items-center space-x-2">
                        <button
                            onClick={goToPreviousPage}
                            disabled={currentPage === 1}
                            className={`flex items-center px-3 py-2 text-sm font-medium rounded-md transition-colors ${
                                currentPage === 1 
                                    ? 'text-gray-400 cursor-not-allowed'
                                    : 'text-gray-700 hover:text-gray-900 hover:bg-gray-100'
                            }`}
                        >
                            <ChevronLeft className="mr-1 h-4 w-4" /> Previous
                        </button>
                        
                        <div className="flex items-center space-x-1">
                            {getPageNumbers().map((pageNum) => (
                                <button
                                    key={pageNum}
                                    onClick={() => goToPage(pageNum)}
                                    className={`px-3 py-2 text-sm font-medium rounded-md transition-colors ${
                                        pageNum === currentPage
                                            ? 'bg-emerald-600 text-white'
                                            : 'text-gray-700 hover:bg-gray-100'
                                    }`}
                                >
                                    {pageNum}
                                </button>
                            ))}
                        </div>
                        
                        <button
                            onClick={goToNextPage}
                            disabled={currentPage === totalPages}
                            className={`flex items-center px-3 py-2 text-sm font-medium rounded-md transition-colors ${
                                currentPage === totalPages
                                    ? 'text-gray-400 cursor-not-allowed'
                                    : 'text-gray-700 hover:text-gray-900 hover:bg-gray-100'
                            }`}
                        >
                            Next <ChevronRight className="ml-1 h-4 w-4" />
                        </button>
                    </div>
                </nav>
            </div>


            </div>
        </>
    )
}

export default GrnList
