import {
    ChevronLeft,
    ChevronRight,
    Copy,
    Eye,
    HandCoins,
    Printer,
    RefreshCw,
} from "lucide-react";
import { useEffect, useState } from "react";
import toast, { Toaster } from 'react-hot-toast';
import { supplierService } from '../../../services/supplierService';
import { grnService } from '../../../services/grnService';
import { paymentTypeService } from '../../../services/paymentTypeService';
import TypeableSelect from "../../../components/TypeableSelect.tsx";
import GrnViewPopup from '../../../components/models/GrnViewPopup';

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

interface ApiError {
    response?: {
        data?: {
            message?: string;
        };
    };
    message?: string;
}

function SupplierPayment() {
    const [grnData, setGrnData] = useState<GRNData[]>([]);
    const [isLoadingGRN, setIsLoadingGRN] = useState(true);
    const [stats, setStats] = useState({
        totalGrn: 0,
        totalAmount: 0,
        totalPaid: 0,
        totalBalance: 0
    });
    const [isLoadingStats, setIsLoadingStats] = useState(true);

    const [selectedIndex, setSelectedIndex] = useState(0);
    const [suppliers, setSuppliers] = useState<SupplierOption[]>([]);
    const [isLoadingSuppliers, setIsLoadingSuppliers] = useState(true);
    const [selectedSupplier, setSelectedSupplier] = useState<SupplierOption | null>(null);

    // Payment processing state
    const [selectedBillNumber, setSelectedBillNumber] = useState<string | null>(null);
    const [selectedInvoice, setSelectedInvoice] = useState<any>(null);
    const [billNumberOptions, setBillNumberOptions] = useState<{ id: number, bill_number: string, total: number, balance: number }[]>([]);
    const [isLoadingBills, setIsLoadingBills] = useState(false);
    const [paymentTypes, setPaymentTypes] = useState<any[]>([]);
    const [selectedPaymentType, setSelectedPaymentType] = useState<string | null>(null);
    const [isLoadingPaymentTypes, setIsLoadingPaymentTypes] = useState(true);
    const [paymentAmount, setPaymentAmount] = useState<string>('');
    const [isProcessingPayment, setIsProcessingPayment] = useState(false);
    const [selectedBill, setSelectedBill] = useState<any>(null);

    // Popup State
    const [selectedGrn, setSelectedGrn] = useState<any>(null);
    const [isViewPopupOpen, setIsViewPopupOpen] = useState(false);
    const [isLoadingDetails, setIsLoadingDetails] = useState(false);
    const [shouldAutoPrint, setShouldAutoPrint] = useState(false);

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


    useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            if (e.key === "ArrowDown") {
                e.preventDefault();
                setSelectedIndex((prev) => (prev < grnData.length - 1 ? prev + 1 : prev));
            } else if (e.key === "ArrowUp") {
                e.preventDefault();
                setSelectedIndex((prev) => (prev > 0 ? prev - 1 : prev));
            } else if (e.key === "Enter" && e.shiftKey) {
                // View on Shift+Enter
                e.preventDefault();
                if (grnData[selectedIndex]) {
                    fetchGrnDetails(grnData[selectedIndex].id, false);
                }
            }
        };

        window.addEventListener("keydown", handleKeyDown);
        return () => window.removeEventListener("keydown", handleKeyDown);
    }, [grnData.length, selectedIndex]);

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

    // Fetch GRN Details
    const fetchGrnDetails = async (grnId: number, autoPrint: boolean = false) => {
        setIsLoadingDetails(true);
        setShouldAutoPrint(autoPrint);
        try {
            const response = await grnService.getGRNDetails(grnId);
            if (response.data.success) {
                setSelectedGrn(response.data.data);
                setIsViewPopupOpen(true);
            } else {
                toast.error('Failed to load GRN details');
            }
        } catch (error) {
            const apiError = error as ApiError;
            console.error('Error fetching GRN details:', error);
            toast.error(apiError.response?.data?.message || 'Failed to load GRN details');
        } finally {
            setIsLoadingDetails(false);
        }
    };

    // Fetch bills when supplier changes
    useEffect(() => {
        const fetchBills = async () => {
            if (!selectedSupplier?.value) {
                setBillNumberOptions([]);
                setSelectedBillNumber(null);
                return;
            }

            try {
                setIsLoadingBills(true);
                const response = await grnService.getBillsBySupplier(selectedSupplier.value);
                setBillNumberOptions(response.data.data || []);
            } catch (error) {
                console.error('Error fetching bills:', error);
                toast.error('Failed to load bill numbers');
                setBillNumberOptions([]);
            } finally {
                setIsLoadingBills(false);
            }
        };

        fetchBills();
    }, [selectedSupplier]);

    // Fetch payment types on component mount
    useEffect(() => {
        const fetchPaymentTypes = async () => {
            try {
                setIsLoadingPaymentTypes(true);
                const response = await paymentTypeService.getPaymentType();
                setPaymentTypes(response.data.data || []);
            } catch (error) {
                console.error('Error fetching payment types:', error);
                toast.error('Failed to load payment types');
            } finally {
                setIsLoadingPaymentTypes(false);
            }
        };

        fetchPaymentTypes();
    }, []);

    // Handle payment processing
    const handlePayment = async () => {
        // Validation
        if (!selectedBill) {
            toast.error('Please select a bill first');
            return;
        }

        if (!paymentAmount || parseFloat(paymentAmount) <= 0) {
            toast.error('Please enter a valid payment amount');
            return;
        }

        if (!selectedPaymentType) {
            toast.error('Please select a payment type');
            return;
        }

        const amount = parseFloat(paymentAmount);
        const balance = parseFloat(selectedInvoice?.balance || '0');

        if (amount > balance) {
            toast.error('Payment amount cannot exceed the outstanding balance');
            return;
        }

        try {
            setIsProcessingPayment(true);

            const paymentData = {
                grn_id: selectedBill.id,
                payment_amount: amount,
                payment_type_id: parseInt(selectedPaymentType)
            };

            const response = await grnService.processPayment(paymentData);

            if (response.data.success) {
                toast.success('Payment processed successfully!');

                // Clear form
                setPaymentAmount('');
                setSelectedPaymentType(null);
                setSelectedBillNumber(null);
                setSelectedBill(null);
                setSelectedInvoice(null);

                // Refresh data
                const grnResponse = await grnService.getGRNList();
                setGrnData(grnResponse.data.data || []);

                const statsResponse = await grnService.getStats();
                setStats(statsResponse.data.data);

                // Refresh bills for the same supplier
                if (selectedSupplier?.value) {
                    const billsResponse = await grnService.getBillsBySupplier(selectedSupplier.value);
                    setBillNumberOptions(billsResponse.data.data || []);
                }
            }
        } catch (error: any) {
            console.error('Payment processing error:', error);
            const errorMessage = error.response?.data?.message || 'Failed to process payment';
            toast.error(errorMessage);
        } finally {
            setIsProcessingPayment(false);
        }
    };

    // Handle form clear
    const handleClear = () => {
        setSelectedSupplier(null);
        setSelectedBillNumber(null);
        setSelectedBill(null);
        setSelectedInvoice(null);
        setPaymentAmount('');
        setSelectedPaymentType(null);
        setBillNumberOptions([]);
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
                <div>
                    <div className="text-sm text-gray-400 flex items-center">
                        <span>Supplier</span>
                        <span className="mx-2">›</span>
                        <span className="text-gray-700 font-medium">Supplier Payments</span>
                    </div>
                    <h1 className="text-3xl font-semibold bg-gradient-to-r from-gray-800 to-gray-600 bg-clip-text text-transparent">
                        Supplier Payments
                    </h1>
                </div>

                <div
                    className={'bg-white rounded-xl p-4 flex flex-col border border-gray-200'}
                >
                    <h2 className="text-xl font-semibold text-gray-700 mb-3">Payment Processing</h2>
                    <div className={'grid md:grid-cols-6 gap-4'}>
                        <div>
                            <label htmlFor="supplier" className="block text-sm font-medium text-gray-700 mb-1">
                                Supplier
                            </label>
                            <TypeableSelect
                                options={suppliers}
                                value={selectedSupplier?.value || null}
                                onChange={(opt) => {
                                    setSelectedSupplier(opt);
                                    setSelectedBillNumber(null); // Reset bill number when supplier changes
                                }}
                                placeholder={isLoadingSuppliers ? "Loading suppliers..." : "Type to search supplier"}
                                disabled={isLoadingSuppliers}
                            />
                        </div>
                        <div>
                            <label htmlFor="bill-number" className="block text-sm font-medium text-gray-700 mb-1">
                                Bill Number
                            </label>
                            <select
                                id="bill-number"
                                value={selectedBillNumber || ''}
                                onChange={(e) => {
                                    const billNumber = e.target.value || null;
                                    setSelectedBillNumber(billNumber);

                                    // Find the selected bill object and set invoice details
                                    if (billNumber) {
                                        const selectedBillData = billNumberOptions.find(bill => bill.bill_number === billNumber);
                                        if (selectedBillData) {
                                            setSelectedBill(selectedBillData);
                                            setSelectedInvoice({
                                                amount: selectedBillData.total.toFixed(2),
                                                balance: selectedBillData.balance.toFixed(2)
                                            });
                                        }
                                    } else {
                                        setSelectedBill(null);
                                        setSelectedInvoice(null);
                                    }
                                }}
                                disabled={!selectedSupplier || isLoadingBills}
                                className="w-full text-sm rounded-lg py-2 px-3 border-2 border-gray-200 focus:border-emerald-400 focus:outline-none transition-all disabled:bg-gray-100 disabled:cursor-not-allowed"
                            >
                                <option value="">
                                    {isLoadingBills ? 'Loading bills...' : !selectedSupplier ? 'Select supplier first' : 'Select Bill Number...'}
                                </option>
                                {billNumberOptions.map((bill) => (
                                    <option key={bill.id} value={bill.bill_number}>
                                        {bill.bill_number}
                                    </option>
                                ))}
                            </select>
                        </div>
                        <div className="flex flex-col justify-end">
                            <label className="block text-xs font-medium text-gray-500 mb-1">
                                Total: <span className="text-gray-700 font-semibold">
                                    LKR {selectedInvoice?.amount || '0.00'}
                                </span>
                            </label>
                            <label className="text-sm font-semibold text-gray-700">
                                Balance: <span className={`${parseFloat(selectedInvoice?.balance || '0') > 0 ? 'text-red-600' : 'text-emerald-600'}`}>
                                    LKR {selectedInvoice?.balance || '0.00'}
                                </span>
                            </label>
                        </div>

                        <div>
                            <label htmlFor="new-payment" className="block text-sm font-medium text-gray-700 mb-1">
                                New Payment
                            </label>
                            <input
                                type="number"
                                id="new-payment"
                                value={paymentAmount}
                                onChange={(e) => setPaymentAmount(e.target.value)}
                                placeholder="Enter Amount..."
                                min="0"
                                step="0.01"
                                max={selectedInvoice?.balance}
                                className="w-full text-sm rounded-lg py-2 px-3 border-2 border-gray-200 focus:border-emerald-400 focus:outline-none transition-all"
                            />
                        </div>

                        <div>
                            <label htmlFor="payment-type" className="block text-sm font-medium text-gray-700 mb-1">
                                Payment Type
                            </label>
                            <select
                                id="payment-type"
                                value={selectedPaymentType || ''}
                                onChange={(e) => setSelectedPaymentType(e.target.value || null)}
                                disabled={isLoadingPaymentTypes}
                                className="w-full text-sm rounded-lg py-2 px-3 border-2 border-gray-200 focus:border-emerald-400 focus:outline-none transition-all disabled:bg-gray-100 disabled:cursor-not-allowed"
                            >
                                <option value="">
                                    {isLoadingPaymentTypes ? 'Loading payment types...' : 'Select Payment Type...'}
                                </option>
                                {paymentTypes.map((paymentType) => (
                                    <option key={paymentType.id} value={paymentType.id}>
                                        {paymentType.payment_types}
                                    </option>
                                ))}
                            </select>
                        </div>

                        <div className={'grid grid-cols-2 md:items-end items-start gap-2 text-white font-medium'}>
                            <button
                                onClick={handlePayment}
                                disabled={isProcessingPayment || !selectedBill || !paymentAmount || !selectedPaymentType}
                                className={'bg-gradient-to-r from-emerald-500 to-emerald-600 hover:from-emerald-600 hover:to-emerald-700 py-2 rounded-lg flex items-center justify-center transition-all disabled:opacity-50 disabled:cursor-not-allowed'}
                            >
                                {isProcessingPayment ? (
                                    <RefreshCw className="animate-spin mr-2" size={14} />
                                ) : (
                                    <HandCoins className="mr-2" size={14} />
                                )}
                                {isProcessingPayment ? 'Processing...' : 'Pay Now'}
                            </button>
                            <button
                                onClick={handleClear}
                                disabled={isProcessingPayment}
                                className={'bg-gradient-to-r from-gray-500 to-gray-600 hover:from-gray-600 hover:to-gray-700 py-2 rounded-lg flex items-center justify-center transition-all disabled:opacity-50 disabled:cursor-not-allowed'}
                            >
                                <RefreshCw className="mr-2" size={14} />Clear
                            </button>
                        </div>
                    </div>
                </div>

                <div
                    className={'flex flex-col bg-white rounded-xl h-full p-4 justify-between border border-gray-200'}
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
                                            className={`px-6 py-3 text-left text-xs font-bold text-white uppercase tracking-wider ${i === 0 ? 'rounded-tl-lg' : i === arr.length - 1 ? 'rounded-tr-lg' : ''
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
                                            className={`cursor-pointer transition-all ${selectedIndex === index
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
                                                <span className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${grn.statusName === 'Active' ? 'bg-yellow-100 text-yellow-800' : 'bg-green-100 text-green-800'
                                                    }`}>
                                                    {grn.statusName === 'Active' ? 'Pending' : 'Complete'}
                                                </span>
                                            </td>
                                            <td className="px-6 py-2 whitespace-nowrap text-sm font-medium">
                                                <div className="flex gap-2">
                                                    <button
                                                        onClick={(e) => {
                                                            e.stopPropagation();
                                                            fetchGrnDetails(grn.id, false);
                                                        }}
                                                        disabled={isLoadingDetails}
                                                        className="p-2 bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white rounded-lg transition-all disabled:opacity-50"
                                                    >
                                                        <Eye size={16} />
                                                    </button>
                                                    <button
                                                        onClick={(e) => {
                                                            e.stopPropagation();
                                                            fetchGrnDetails(grn.id, true);
                                                        }}
                                                        disabled={isLoadingDetails}
                                                        className="p-2 bg-gradient-to-r from-emerald-500 to-emerald-600 hover:from-emerald-600 hover:to-emerald-700 text-white rounded-lg transition-all disabled:opacity-50"
                                                    >
                                                        <Printer size={16} />
                                                    </button>
                                                    <button
                                                        onClick={(e) => {
                                                            e.stopPropagation();
                                                            navigator.clipboard.writeText(grn.billNumber);
                                                            toast.success('Bill number copied to clipboard');
                                                        }}
                                                        className="p-2 bg-gradient-to-r from-purple-500 to-purple-600 hover:from-purple-600 hover:to-purple-700 text-white rounded-lg transition-all"
                                                    >
                                                        <Copy size={16} />
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
                                className={`flex items-center px-3 py-2 text-sm font-medium rounded-lg transition-all ${currentPage === 1
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
                                        className={`px-4 py-2 text-sm font-semibold rounded-lg transition-all ${currentPage === page
                                            ? 'bg-gradient-to-r from-emerald-500 to-emerald-600 text-white'
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
                                className={`flex items-center px-3 py-2 text-sm font-medium rounded-lg transition-all ${currentPage === totalPages
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
            {/* GRN View Popup */}
            <GrnViewPopup
                isOpen={isViewPopupOpen}
                onClose={() => setIsViewPopupOpen(false)}
                grnData={selectedGrn}
                autoPrint={shouldAutoPrint}
            />
        </>
    );
}

export default SupplierPayment;