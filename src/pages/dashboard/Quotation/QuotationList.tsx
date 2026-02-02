import {
    ChevronLeft,
    ChevronRight,
    Eye,
    Printer,
    RefreshCw,
    SearchCheck,
    Loader2,
    X,
} from "lucide-react";
import { useEffect, useState, useRef } from "react";
import toast, { Toaster } from 'react-hot-toast';
import { quotationService } from '../../../services/quotationService';
import { customerService } from '../../../services/customerService';
import { printQuotation } from '../../../utils/quotationPrinter';
import type { QuotationData } from '../../../utils/quotationPrinter';
import TypeableSelect from '../../../components/TypeableSelect';

function QuotationList() {
    // State Management
    const [quotations, setQuotations] = useState<any[]>([]);
    const [customers, setCustomers] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [selectedIndex, setSelectedIndex] = useState(0);
    
    // Filter State
    const [quotationNumber, setQuotationNumber] = useState('');
    const [selectedCustomer, setSelectedCustomer] = useState<any>(null);
    const [fromDate, setFromDate] = useState('');
    const [toDate, setToDate] = useState('');
    
    // Pagination State
    const [currentPage, setCurrentPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const [totalRecords, setTotalRecords] = useState(0);
    const itemsPerPage = 10;

    // Detail Modal State
    const [showDetailModal, setShowDetailModal] = useState(false);
    const [selectedQuotationDetails, setSelectedQuotationDetails] = useState<any>(null);
    const [detailsLoading, setDetailsLoading] = useState(false);

    // Ref for focus
    const searchRef = useRef<HTMLInputElement>(null);

    // Fetch Quotations
    const fetchQuotations = async () => {
        try {
            setLoading(true);
            const response = await quotationService.getAllQuotations({
                quotationNumber: quotationNumber || undefined,
                customerId: selectedCustomer?.value || undefined,
                fromDate: fromDate || undefined,
                toDate: toDate || undefined,
                page: currentPage,
                limit: itemsPerPage
            });

            if (response.data.success) {
                setQuotations(response.data.data);
                setTotalPages(response.data.pagination.totalPages);
                setTotalRecords(response.data.pagination.totalRecords);
                setSelectedIndex(0);
            }
        } catch (error) {
            console.error('Error fetching quotations:', error);
            toast.error('Failed to load quotations');
            setQuotations([]);
        } finally {
            setLoading(false);
        }
    };

    // Fetch Customers for Filter
    const fetchCustomers = async () => {
        try {
            const response = await customerService.getCustomers();
            if (response.data.success) {
                const options = response.data.data.map((c: any) => ({
                    value: c.id,
                    label: `${c.name} (${c.contact})`
                }));
                setCustomers(options);
            }
        } catch (error) {
            console.error('Error fetching customers:', error);
        }
    };

    // Initial Load
    useEffect(() => {
        fetchQuotations();
    }, [currentPage]);

    useEffect(() => {
        fetchCustomers();
    }, []);

    // Keyboard Navigation
    useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            const isTyping = e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement;

            if (e.key === "ArrowDown") {
                if (isTyping) return;
                e.preventDefault();
                setSelectedIndex((prev) => (prev < quotations.length - 1 ? prev + 1 : prev));
            } else if (e.key === "ArrowUp") {
                if (isTyping) return;
                e.preventDefault();
                setSelectedIndex((prev) => (prev > 0 ? prev - 1 : prev));
            } else if (e.key === "Enter") {
                if (isTyping) {
                    handleSearch();
                    return;
                }
                if (!showDetailModal && quotations.length > 0) {
                    e.preventDefault();
                    handleViewDetails(quotations[selectedIndex].id);
                }
            } else if (e.key === "Escape") {
                e.preventDefault();
                if (showDetailModal) setShowDetailModal(false);
                if (isTyping) (e.target as HTMLElement).blur();
            } else if (e.key.toLowerCase() === "p") {
                if (isTyping) return;
                e.preventDefault();
                if (showDetailModal && selectedQuotationDetails) {
                    handlePrint(selectedQuotationDetails);
                } else if (!showDetailModal && quotations.length > 0) {
                    handleViewDetails(quotations[selectedIndex].id).then(d => d && handlePrint(d));
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
    }, [quotations.length, selectedIndex, showDetailModal, selectedQuotationDetails]);

    // Handle Search
    const handleSearch = () => {
        if (currentPage === 1) {
            fetchQuotations();
        } else {
            setCurrentPage(1);
        }
    };

    // Handle Reset
    const handleReset = () => {
        setQuotationNumber('');
        setSelectedCustomer(null);
        setFromDate('');
        setToDate('');
        setCurrentPage(1);
        setTimeout(() => {
            fetchQuotations();
        }, 100);
    };

    // Format currency
    const formatCurrency = (amount: string | number) => {
        return `LKR ${Number(amount).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
    };

    // Handle View Details
    const handleViewDetails = async (id: string | number) => {
        try {
            setDetailsLoading(true);
            setShowDetailModal(true);
            const response = await quotationService.getQuotation(id);
            if (response.data.success) {
                const data = response.data.data;
                setSelectedQuotationDetails(data);
                return data;
            }
        } catch (error) {
            console.error('Error fetching details:', error);
            toast.error('Failed to load details');
        } finally {
            setDetailsLoading(false);
        }
    };

    // Handle Print
    const handlePrint = (quotation: any) => {
        if (!quotation) return;
        
        const printData: QuotationData = {
            quotationNumber: quotation.quotation_number,
            date: new Date(quotation.created_at),
            validUntil: new Date(quotation.valid_until),
            customer: quotation.customer ? {
                name: quotation.customer.name,
                contact: quotation.customer.contact,
                email: quotation.customer.email
            } : null,
            items: quotation.quotation_items.map((item: any) => {
                const pv = item.stock?.product_variations;
                const vName = pv ? [
                    pv.color && pv.color !== 'Default' ? pv.color : null,
                    pv.size && pv.size !== 'Default' ? pv.size : null,
                    pv.storage_capacity && pv.storage_capacity !== 'N/A' ? pv.storage_capacity : null
                ].filter(Boolean).join(' - ') : '';
                
                return {
                    name: pv?.product?.product_name || 'Unknown Item',
                    description: vName,
                    quantity: item.qty,
                    unitPrice: item.price,
                    discount: item.discount_amount,
                    total: item.total
                };
            }),
            subtotal: quotation.sub_total,
            discount: quotation.discount,
            total: quotation.total,
            preparedBy: quotation.user?.name || 'Admin', 
        };
        printQuotation(printData);
    };

    return (
        <>
            <Toaster position="top-right" />
            <div className="flex flex-col gap-4 h-full">
                {/* Header */}
                <div className="flex items-center justify-between">
                    <div>
                        <div className="text-sm text-gray-400 flex items-center">
                            <span>Quotation</span>
                            <span className="mx-2">›</span>
                            <span className="text-gray-700 font-medium">Manage Quotations</span>
                        </div>
                        <h1 className="text-3xl font-semibold bg-linear-to-r from-emerald-600 to-emerald-800 bg-clip-text text-transparent leading-tight">
                            Manage Quotations
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

                {/* Filter Section */}
                <div className="bg-white rounded-xl border border-gray-200 p-4">
                    <div className="grid md:grid-cols-4 gap-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Quotation No</label>
                            <input
                                ref={searchRef}
                                type="text"
                                value={quotationNumber}
                                onChange={(e) => setQuotationNumber(e.target.value)}
                                onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
                                placeholder="Enter Quotation No... (F)"
                                className="w-full text-sm rounded-lg py-2 px-3 border-2 border-gray-100 focus:border-emerald-400 focus:outline-none transition-all"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Customer</label>
                            <TypeableSelect
                                options={customers}
                                value={selectedCustomer ? selectedCustomer.value : ''}
                                onChange={(opt) => {
                                    setSelectedCustomer(opt);
                                    setTimeout(() => handleSearch(), 0);
                                }}
                                placeholder="Select Customer..."
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">From Date</label>
                            <input
                                type="date"
                                value={fromDate}
                                onChange={(e) => setFromDate(e.target.value)}
                                onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
                                className="w-full text-sm rounded-lg py-2 px-3 border-2 border-gray-100 focus:border-emerald-400 focus:outline-none transition-all"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">To Date</label>
                            <input
                                type="date"
                                value={toDate}
                                onChange={(e) => setToDate(e.target.value)}
                                onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
                                className="w-full text-sm rounded-lg py-2 px-3 border-2 border-gray-100 focus:border-emerald-400 focus:outline-none transition-all"
                            />
                        </div>
                        <div className="md:col-span-4 flex justify-end gap-2">
                             <button
                                onClick={handleReset}
                                disabled={loading}
                                className="bg-gray-500 text-white font-bold py-2 px-6 rounded-lg hover:bg-gray-600 transition-colors flex items-center justify-center gap-2 disabled:opacity-50"
                            >
                                <RefreshCw size={16} />
                                Reset
                            </button>
                            <button
                                onClick={handleSearch}
                                disabled={loading}
                                className="bg-emerald-500 text-white font-bold py-2 px-6 rounded-lg hover:bg-emerald-600 transition-colors flex items-center justify-center gap-2 disabled:opacity-50"
                            >
                                {loading ? <Loader2 className="animate-spin" size={16} /> : <SearchCheck size={16} />}
                                Search
                            </button>
                        </div>
                    </div>
                </div>

                {/* Quotations Table */}
                <div className="bg-white rounded-xl border border-gray-200 p-4 flex flex-col justify-between h-full shadow-sm">
                    <div className="overflow-auto flex-1 h-full min-h-0 rounded-lg border border-gray-100">
                        <table className="min-w-full divide-y divide-gray-200 relative mb-20">
                            <thead className="sticky top-0 z-10 bg-emerald-500 text-white shadow-sm">
                                <tr>
                                    {['Quotation #', 'Customer', 'Date', 'Valid Until', 'Amount', 'Status', 'Action'].map((head, i) => (
                                        <th key={i} className="px-4 py-3 text-left text-[10px] font-bold text-white uppercase tracking-widest">
                                            {head}
                                        </th>
                                    ))}
                                </tr>
                            </thead>
                            <tbody className="bg-white divide-y divide-gray-100">
                                {loading ? (
                                    <tr>
                                        <td colSpan={7} className="py-20 text-center">
                                            <div className="flex flex-col items-center gap-2">
                                                <Loader2 className="animate-spin text-emerald-500" size={40} />
                                                <span className="text-gray-500 font-medium">Fetching quotations...</span>
                                            </div>
                                        </td>
                                    </tr>
                                ) : quotations.length === 0 ? (
                                    <tr>
                                        <td colSpan={7} className="py-12 text-center text-gray-500 font-medium">
                                            No quotations found.
                                        </td>
                                    </tr>
                                ) : (
                                    quotations.map((q, idx) => (
                                        <tr key={q.id} onClick={() => setSelectedIndex(idx)} className={`cursor-pointer transition-colors ${selectedIndex === idx ? 'bg-emerald-50/50 border-l-4 border-emerald-500' : 'hover:bg-gray-50'}`}>
                                            <td className="px-4 py-3 whitespace-nowrap text-sm font-semibold text-gray-800 tracking-tight">
                                                {q.quotation_number}
                                            </td>
                                            <td className="px-4 py-3 whitespace-nowrap text-sm font-medium text-gray-700">{q.customer?.name || 'Walk-in'}</td>
                                            <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-500 font-mono">
                                                {new Date(q.created_at).toLocaleDateString()}
                                            </td>
                                            <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-500 font-mono">
                                                {new Date(q.valid_until).toLocaleDateString()}
                                            </td>
                                            <td className="px-4 py-3 whitespace-nowrap text-sm font-bold text-emerald-600">{formatCurrency(q.total)}</td>
                                            <td className="px-4 py-3 whitespace-nowrap">
                                                <span className={`px-2 py-1 rounded-full text-xs font-bold ${new Date(q.valid_until) < new Date() ? 'bg-red-100 text-red-600' : 'bg-green-100 text-green-600'}`}>
                                                    {new Date(q.valid_until) < new Date() ? 'Expired' : 'Active'}
                                                </span>
                                            </td>
                                            <td className="px-4 py-3 whitespace-nowrap text-sm font-medium">
                                                <div className="flex gap-2">
                                                    <button onClick={(e) => { e.stopPropagation(); handleViewDetails(q.id); }} className="p-1.5 bg-blue-500 text-white rounded-md hover:bg-blue-600 transition-colors shadow-sm">
                                                        <Eye size={14} />
                                                    </button>
                                                    <button onClick={(e) => { 
                                                        e.stopPropagation(); 
                                                        handleViewDetails(q.id).then(d => d && handlePrint(d));
                                                    }} className="p-1.5 bg-emerald-500 text-white rounded-md hover:bg-emerald-600 transition-colors shadow-sm">
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
                             Showing {quotations.length > 0 ? ((currentPage - 1) * itemsPerPage) + 1 : 0} to {Math.min(currentPage * itemsPerPage, totalRecords)} of {totalRecords} records
                         </div>
                         <div className="flex items-center gap-2">
                             <button onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))} disabled={currentPage === 1 || loading} className="p-2 rounded-lg hover:bg-gray-100 disabled:opacity-50 transition-colors">
                                 <ChevronLeft size={18} />
                             </button>
                             <span className="text-sm font-bold text-gray-600">Page {currentPage} of {totalPages}</span>
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
                                <h3 className="text-lg font-bold">Quotation Details</h3>
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
                                ) : selectedQuotationDetails && (
                                    <div className="space-y-6">
                                         <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                                            <div className="bg-gray-50 p-3 rounded-xl">
                                                <p className="text-[10px] text-gray-500 uppercase font-bold tracking-wider">Quotation No</p>
                                                <p className="font-bold text-gray-800">{selectedQuotationDetails.quotation_number}</p>
                                            </div>
                                            <div className="bg-gray-50 p-3 rounded-xl">
                                                <p className="text-[10px] text-gray-500 uppercase font-bold tracking-wider">Customer</p>
                                                <p className="font-bold text-gray-800">{selectedQuotationDetails.customer?.name || 'Walk-in'}</p>
                                            </div>
                                            <div className="bg-gray-50 p-3 rounded-xl">
                                                <p className="text-[10px] text-gray-500 uppercase font-bold tracking-wider">Date</p>
                                                <p className="font-bold text-gray-800">{new Date(selectedQuotationDetails.created_at).toLocaleDateString()}</p>
                                            </div>
                                         </div>

                                          <div className="rounded-xl border border-gray-100 overflow-hidden">
                                            <table className="w-full text-left">
                                                <thead className="bg-gray-50 text-[10px] font-bold text-gray-400 uppercase tracking-widest">
                                                    <tr>
                                                        <th className="py-3 px-2">Item</th>
                                                        <th className="py-3 px-2 text-right">Price</th>
                                                        <th className="py-3 px-2 text-center">Qty</th>
                                                        <th className="py-3 px-2 text-right">Discount</th>
                                                        <th className="py-3 px-2 text-right">Total</th>
                                                    </tr>
                                                </thead>
                                                <tbody className="divide-y divide-gray-50">
                                                    {selectedQuotationDetails.quotation_items?.map((item: any, i: number) => (
                                                        <tr key={i} className="border-b border-gray-50 hover:bg-gray-50/50 transition-colors">
                                                            <td className="py-3 px-2 text-sm font-medium text-gray-700">
                                                                {item.stock?.product_variations?.product?.product_name}
                                                                <span className="text-xs text-gray-400 block">
                                                                    {[
                                                                        item.stock?.product_variations?.color && item.stock?.product_variations?.color !== 'Default' ? item.stock?.product_variations?.color : null,
                                                                        item.stock?.product_variations?.size && item.stock?.product_variations?.size !== 'Default' ? item.stock?.product_variations?.size : null,
                                                                        item.stock?.product_variations?.storage_capacity && item.stock?.product_variations?.storage_capacity !== 'N/A' ? item.stock?.product_variations?.storage_capacity : null
                                                                    ].filter(Boolean).join(' - ')}
                                                                </span>
                                                            </td>
                                                            <td className="py-3 px-2 text-sm text-right text-gray-600 font-mono">{formatCurrency(item.price)}</td>
                                                            <td className="py-3 px-2 text-sm text-center text-gray-600 font-bold">{item.qty}</td>
                                                            <td className="py-3 px-2 text-sm text-right text-red-500">{formatCurrency(item.discount_amount)}</td>
                                                            <td className="py-3 px-2 text-sm text-right font-black text-gray-800">{formatCurrency(item.total)}</td>
                                                        </tr>
                                                    ))}
                                                </tbody>
                                            </table>
                                        </div>

                                        <div className="flex justify-end pt-4 border-t">
                                            <div className="w-72 space-y-2">
                                                <div className="flex justify-between text-sm">
                                                    <span className="text-gray-500 font-medium">Subtotal</span>
                                                    <span className="font-bold text-gray-700">{formatCurrency(selectedQuotationDetails.sub_total)}</span>
                                                </div>
                                                 <div className="flex justify-between text-sm">
                                                    <span className="text-gray-500 font-medium">Global Discount</span>
                                                    <span className="font-bold text-red-500">-{formatCurrency(selectedQuotationDetails.discount)}</span>
                                                </div> 
                                                <div className="flex justify-between text-lg font-black bg-emerald-50 p-2 rounded-lg border border-emerald-100">
                                                    <span className="text-emerald-800 uppercase text-xs mt-1.5">Net Total</span>
                                                    <span className="text-emerald-700">{formatCurrency(selectedQuotationDetails.total)}</span>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                )}
                            </div>
                            <div className="p-4 bg-gray-50 flex gap-2">
                                <button onClick={() => handlePrint(selectedQuotationDetails)} className="flex-1 bg-emerald-500 text-white font-bold py-2 rounded-xl hover:bg-emerald-600 transition-colors flex items-center justify-center gap-2">
                                    <Printer size={18} /> Print Quotation
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

export default QuotationList;