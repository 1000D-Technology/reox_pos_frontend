import {
    ChevronLeft,
    ChevronRight,
    Pencil,
    X,
    Users,
    CreditCard,
    CheckCircle,
    Search,
    ArrowUpRight,
    ArrowDownRight,
    Eye,
    Receipt,
    DollarSign,
    Loader2
} from 'lucide-react';

import { useEffect, useState, useRef } from 'react';
import toast, { Toaster } from 'react-hot-toast';
import { customerService } from '../../../services/customerService';
import invoiceService from '../../../services/invoiceService';
import { paymentTypeService } from '../../../services/paymentTypeService';


interface Customer {
    id: number;
    no: string;
    name: string;
    email: string | null;
    phone: string;
    totalCreditBalance: number;
    isActive: boolean;
}

interface Invoice {
    id: number;
    invoiceNumber: string;
    date: string;
    totalAmount: number;
    paidAmount: number;
    balance: number;
    refundedAmount: number;
    status: 'paid' | 'open';
}

interface InvoiceDetail {
    id: number;
    invoiceNumber: string;
    customerName: string;
    date: string;
    dueDate: string;
    items: Array<{ name: string; quantity: number; price: number; total: number }>;
    subtotal: number;
    tax: number;
    totalAmount: number;
    paidAmount: number;
    balance: number;
    refundedAmount: number;
    status: 'paid' | 'open';
}

function ManageCustomer() {
    const [customers, setCustomers] = useState<Customer[]>([]);
    const [filteredCustomers, setFilteredCustomers] = useState<Customer[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState('');

    const [currentPage, setCurrentPage] = useState(1);
    const [itemsPerPage] = useState(10);
    const [totalPages, setTotalPages] = useState(1);
    const [totalRecords, setTotalRecords] = useState(0);

    // For search results, slice the filtered data for client-side pagination
    const startIndex = (currentPage - 1) * itemsPerPage;
    const endIndex = startIndex + itemsPerPage;
    const currentCustomers = searchQuery.trim() 
        ? filteredCustomers.slice(startIndex, endIndex)
        : filteredCustomers;

    const customerData: Customer[] = currentCustomers.map((customer, index) => ({
        ...customer,
        no: (startIndex + index + 1).toString()
    }));

    const [customerInvoices, setCustomerInvoices] = useState<Invoice[]>([]);
    const [isLoadingInvoices, setIsLoadingInvoices] = useState(false);

    const [selectedCustomer, setSelectedCustomer] = useState<Customer | null>(null);
    const [selectedInvoice, setSelectedInvoice] = useState<InvoiceDetail | null>(null);
    const [showInvoices, setShowInvoices] = useState(false);
    const [showInvoiceDetail, setShowInvoiceDetail] = useState(false);
    const [selectedIndex, setSelectedIndex] = useState(0);

    // Invoice filters
    const [invoiceFromDate, setInvoiceFromDate] = useState('');
    const [invoiceToDate, setInvoiceToDate] = useState('');
    const [isLoadingInvoiceDetail, setIsLoadingInvoiceDetail] = useState(false);

    const [isModalOpen, setIsModalOpen] = useState(false);
    const [newPhone, setNewPhone] = useState('');
    const [isUpdatingPhone, setIsUpdatingPhone] = useState(false);

    const [paymentAmount, setPaymentAmount] = useState('');
    const [paymentMethod, setPaymentMethod] = useState('');
    const [paymentMethods, setPaymentMethods] = useState<Array<{ id: number; name: string }>>([]);
    const [isProcessingPayment, setIsProcessingPayment] = useState(false);
    const searchRef = useRef<HTMLInputElement>(null);

    // Stats calculation
    const stats = {
        totalCustomers: customers.length,
        activeCustomers: customers.filter(c => c.isActive).length,
        totalCredit: customers.reduce((sum, c) => sum + c.totalCreditBalance, 0)
    };

    const summaryCards = [
        {
            icon: Users,
            label: 'Total Customers',
            value: stats.totalCustomers.toString(),
            trend: '+12%',
            color: 'bg-gradient-to-br from-emerald-400 to-emerald-500',
            iconColor: 'text-white',
            bgGlow: ''
        },
        {
            icon: CheckCircle,
            label: 'Active Customers',
            value: stats.activeCustomers.toString(),
            trend: '+8%',
            color: 'bg-gradient-to-br from-green-400 to-green-500',
            iconColor: 'text-white',
            bgGlow: ''
        },
        {
            icon: CreditCard,
            label: 'Total Credit Balance',
            value: `Rs. ${stats.totalCredit.toLocaleString()}`,
            trend: '-5%',
            color: 'bg-gradient-to-br from-red-400 to-red-500',
            iconColor: 'text-white',
            bgGlow: ''
        },
    ];

    const handleSearch = (query: string) => {
        setSearchQuery(query);
        setCurrentPage(1);

        if (!query.trim()) {
            loadCustomers(1);
            return;
        }

        const lowercaseQuery = query.toLowerCase();
        const filtered = customers.filter(customer =>
            customer.name.toLowerCase().includes(lowercaseQuery) ||
            (customer.email && customer.email.toLowerCase().includes(lowercaseQuery)) ||
            customer.phone.toLowerCase().includes(lowercaseQuery)
        );

        setFilteredCustomers(filtered);
        setTotalPages(Math.ceil(filtered.length / itemsPerPage));
        setTotalRecords(filtered.length);
    };

    // Load customers from API with pagination
    const loadCustomers = async (page: number = currentPage) => {
        try {
            setIsLoading(true);
            const response = await customerService.getCustomers(page, itemsPerPage);

            if (response.data.success) {
                const mappedCustomers: Customer[] = response.data.data.map((customer: any) => ({
                    id: customer.id,
                    no: '',
                    name: customer.name,
                    email: customer.email,
                    phone: customer.contact,
                    totalCreditBalance: customer.credit_balance,
                    isActive: customer.status_name === 'Active'
                }));

                setCustomers(mappedCustomers);
                setFilteredCustomers(mappedCustomers);

                // Handle pagination data with fallbacks
                if (response.data.pagination) {
                    setTotalPages(response.data.pagination.totalPages || 1);
                    setTotalRecords(response.data.pagination.totalRecords || mappedCustomers.length);
                    setCurrentPage(response.data.pagination.currentPage || 1);
                } else {
                    // Fallback if pagination data is missing
                    setTotalPages(1);
                    setTotalRecords(mappedCustomers.length);
                    setCurrentPage(1);
                }
            } else {
                toast.error('Failed to load customers');
            }
        } catch (error: any) {
            console.error('Error loading customers:', error);
            toast.error('Failed to load customers. Please try again.');
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        loadCustomers(1);
        loadPaymentMethods();
    }, []);

    // Load Payment Methods
    const loadPaymentMethods = async () => {
        try {
            const response = await paymentTypeService.getPaymentType();
            if (response.data?.success) {
                const methods = response.data.data.map((method: any) => ({
                    id: method.id,
                    name: method.payment_types
                }));
                setPaymentMethods(methods);
                // Set default to first method (usually Cash)
                if (methods.length > 0) {
                    setPaymentMethod(methods[0].id.toString());
                }
            }
        } catch (error) {
            console.error('Error loading payment methods:', error);
            toast.error('Failed to load payment methods');
        }
    };

    useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            // Focus search input on '/'
            if (e.key === '/' && document.activeElement !== searchRef.current && document.activeElement?.tagName !== 'INPUT') {
                e.preventDefault();
                searchRef.current?.focus();
                return;
            }

            // Global escape to close modals
            if (e.key === "Escape") {
                if (showInvoiceDetail) {
                    setShowInvoiceDetail(false);
                } else if (showInvoices) {
                    setShowInvoices(false);
                    loadCustomers();
                } else if (isModalOpen) {
                    handleCloseModal();
                }
                return;
            }

            // Don't process shortcuts if an input is focused (except search focus already handled)
            if (document.activeElement?.tagName === 'INPUT' && document.activeElement !== searchRef.current) return;

            if (e.key === "ArrowDown") {
                e.preventDefault();
                setSelectedIndex((prev) => (prev < customerData.length - 1 ? prev + 1 : prev));
            } else if (e.key === "ArrowUp") {
                e.preventDefault();
                setSelectedIndex((prev) => (prev > 0 ? prev - 1 : prev));
            } else if (e.key === "Enter") {
                if (!showInvoices && !isModalOpen && customerData[selectedIndex]) {
                    if (e.shiftKey) {
                        handleEditClick(customerData[selectedIndex]);
                    } else {
                        handleViewCustomer(customerData[selectedIndex]);
                    }
                }
            }
        };

        window.addEventListener("keydown", handleKeyDown);
        return () => window.removeEventListener("keydown", handleKeyDown);
    }, [customerData, selectedIndex, showInvoices, showInvoiceDetail, isModalOpen]);

    const handleEditClick = (customer: Customer) => {
        setSelectedCustomer(customer);
        setNewPhone(customer.phone);
        setIsModalOpen(true);
    };

    const handleCloseModal = () => {
        setIsModalOpen(false);
        setSelectedCustomer(null);
        setNewPhone('');
        setIsUpdatingPhone(false);
    };

    const handleUpdatePhone = async () => {
        if (!selectedCustomer || !newPhone.trim()) {
            toast.error('Please enter a valid phone number');
            return;
        }

        setIsUpdatingPhone(true);
        try {
            const response = await customerService.updatePhone(selectedCustomer.id, newPhone.trim());

            if (response.data.success) {
                // Update local state
                const updatedCustomers = customers.map(customer =>
                    customer.id === selectedCustomer.id
                        ? { ...customer, phone: newPhone.trim() }
                        : customer
                );
                setCustomers(updatedCustomers);
                setFilteredCustomers(updatedCustomers);

                toast.success('Phone number updated successfully!');
                handleCloseModal();
            } else {
                toast.error(response.data.message || 'Failed to update phone number');
            }
        } catch (error: any) {
            console.error('Error updating phone:', error);
            // Check if error response contains a message
            const errorMessage = error.response?.data?.message || 'Failed to update phone number. Please try again.';
            toast.error(errorMessage);
        } finally {
            setIsUpdatingPhone(false);
        }
    };

    const handleStatusToggle = async (customerId: number, currentStatus: boolean) => {
        const newStatus = !currentStatus;

        try {
            const response = await customerService.toggleStatus(customerId, newStatus);

            if (response.data.success) {
                // Update local state
                const updatedCustomers = customers.map(customer =>
                    customer.id === customerId
                        ? { ...customer, isActive: newStatus }
                        : customer
                );
                setCustomers(updatedCustomers);
                setFilteredCustomers(updatedCustomers);

                toast.success(`Customer ${newStatus ? 'activated' : 'deactivated'} successfully!`);
            } else {
                toast.error(response.data.message || 'Failed to update customer status');
            }
        } catch (error: any) {
            console.error('Error updating status:', error);
            const errorMessage = error.response?.data?.message || 'Failed to update customer status. Please try again.';
            toast.error(errorMessage);
        }
    };

    const handleViewCustomer = async (customer: Customer) => {
        setSelectedCustomer(customer);
        setShowInvoices(true);
        setInvoiceFromDate('');
        setInvoiceToDate('');
        await loadCustomerInvoices(customer.id);
    };

    const loadCustomerInvoices = async (_customerId: number, fromDate?: string, toDate?: string) => {
        try {
            setIsLoadingInvoices(true);
            const response = await invoiceService.getAllInvoices({
                fromDate: fromDate || undefined,
                toDate: toDate || undefined,
            });

            if (response.success) {
                // Filter invoices for the selected customer by customer ID or name
                // Note: Adjust this based on your actual API response structure
                const filtered = response.data.filter((inv: any) => {
                    // Try matching by customer name since we may not have customerId in invoice
                    const matchesCustomer = inv.customerName === selectedCustomer?.name || 
                                           inv.customer === selectedCustomer?.name;
                    return matchesCustomer;
                });
                
                // Map to Invoice interface
                const mappedInvoices: Invoice[] = filtered.map((inv: any) => ({
                    id: inv.id,
                    invoiceNumber: inv.invoiceID,
                    date: inv.issuedDate || inv.date,
                    totalAmount: parseFloat(inv.netAmount || inv.total),
                    paidAmount: parseFloat(inv.netAmount || inv.total) - parseFloat(inv.balance || 0),
                    balance: parseFloat(inv.balance || 0),
                    refundedAmount: parseFloat(inv.refundedAmount || 0),
                    status: parseFloat(inv.balance || 0) === 0 ? 'paid' : 'open'
                }));
                
                setCustomerInvoices(mappedInvoices);
            }
        } catch (error) {
            console.error('Error loading customer invoices:', error);
            toast.error('Failed to load customer invoices');
            setCustomerInvoices([]);
        } finally {
            setIsLoadingInvoices(false);
        }
    };

    const handleInvoiceDateFilter = () => {
        if (selectedCustomer) {
            loadCustomerInvoices(selectedCustomer.id, invoiceFromDate, invoiceToDate);
        }
    };

    const handleViewInvoice = async (invoice: Invoice) => {
        try {
            setIsLoadingInvoiceDetail(true);
            setShowInvoiceDetail(true);
            
            const response = await invoiceService.getInvoiceDetails(invoice.invoiceNumber);
            
            if (response.success) {
                const invoiceData = response.data;
                
                const detail: InvoiceDetail = {
                    id: invoice.id,
                    invoiceNumber: invoiceData.invoiceNo,
                    customerName: invoiceData.customer,
                    date: invoiceData.date,
                    dueDate: invoiceData.date, // Use same date if no due date
                    items: invoiceData.items.map((item: any) => ({
                        name: item.name,
                        quantity: item.quantity,
                        price: item.price,
                        total: item.price  * item.quantity
                    })),
                    subtotal: invoiceData.subTotal || invoiceData.grossAmount || invoiceData.total,
                    tax: invoiceData.discount || 0,
                    totalAmount: invoiceData.total,
                    paidAmount: invoiceData.total - (invoiceData.creditBalance || 0),
                    balance: invoiceData.creditBalance || 0,
                    refundedAmount: invoiceData.refundedAmount || 0,
                    status: (invoiceData.creditBalance || 0) === 0 ? 'paid' : 'open'
                };
                
                setSelectedInvoice(detail);
            } else {
                toast.error('Failed to load invoice details');
            }
        } catch (error) {
            console.error('Error loading invoice details:', error);
            toast.error('Failed to load invoice details');
        } finally {
            setIsLoadingInvoiceDetail(false);
        }
    };

    const handlePayment = async () => {
        if (!selectedInvoice || !paymentAmount.trim() || !paymentMethod) {
            toast.error('Please enter payment amount and select payment method');
            return;
        }

        const amount = parseFloat(paymentAmount);

        if (isNaN(amount) || amount <= 0) {
            toast.error('Please enter a valid amount greater than 0');
            return;
        }

        if (amount > selectedInvoice.balance) {
            toast.error('Payment amount cannot exceed balance');
            return;
        }

        try {
            setIsProcessingPayment(true);
            
            const paymentData = {
                invoice_id: selectedInvoice.invoiceNumber,
                payment_amount: amount,
                payment_type_id: parseInt(paymentMethod)
            };

            const response = await invoiceService.processInvoicePayment(paymentData);

            if (response.success) {
                const selectedMethodName = paymentMethods.find(m => m.id.toString() === paymentMethod)?.name || 'Unknown';
                toast.success(`Payment of Rs. ${amount.toLocaleString()} via ${selectedMethodName} processed successfully!`);

                // Update the selected invoice details
                const newPaidAmount = selectedInvoice.paidAmount + amount;
                const newBalance = selectedInvoice.balance - amount;
                const newStatus: 'paid' | 'open' = newBalance === 0 ? 'paid' : 'open';

                setSelectedInvoice({
                    ...selectedInvoice,
                    paidAmount: newPaidAmount,
                    balance: newBalance,
                    status: newStatus
                });

                // Update invoice list
                if (selectedCustomer) {
                    setCustomerInvoices(prev => prev.map(inv =>
                        inv.id === selectedInvoice.id
                            ? { ...inv, paidAmount: newPaidAmount, balance: newBalance, status: newStatus }
                            : inv
                    ));
                }

                // Reset payment form
                setPaymentAmount('');
                if (paymentMethods.length > 0) {
                    setPaymentMethod(paymentMethods[0].id.toString());
                }

                // Show fully paid message
                if (newBalance === 0) {
                    toast.success('Invoice fully paid!');
                }
            } else {
                toast.error(response.message || 'Failed to process payment');
            }
        } catch (error: any) {
            console.error('Payment processing error:', error);
            const errorMessage = error.response?.data?.message || 'Failed to process payment. Please try again.';
            toast.error(errorMessage);
        } finally {
            setIsProcessingPayment(false);
        }
    };

    const goToPage = (page: number) => {
        if (page >= 1 && page <= totalPages) {
            setSelectedIndex(0);
            if (searchQuery.trim()) {
                // Client-side pagination for search results
                setCurrentPage(page);
            } else {
                // Server-side pagination for full list
                loadCustomers(page);
            }
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

    const getStatusBadge = (status: string, refundedAmount?: number) => {
        if (refundedAmount && refundedAmount > 0) {
            return 'bg-linear-to-r from-red-500 to-red-600 text-white shadow-sm font-black';
        }
        switch (status) {
            case 'paid':
                return 'bg-linear-to-r from-emerald-500 to-emerald-600 text-white shadow-sm font-black';
            case 'open':
                return 'bg-linear-to-r from-yellow-500 to-yellow-600 text-white shadow-sm font-black';
            default:
                return 'bg-linear-to-r from-gray-400 to-gray-500 text-white shadow-sm font-black';
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
                <div className="flex items-center justify-between">
                    <div>
                        <div className="text-sm text-gray-400 flex items-center">
                            <span>Customers</span>
                            <span className="mx-2">›</span>
                            <span className="text-gray-700 font-medium">Manage Customer</span>
                        </div>
                        <h1 className="text-3xl font-semibold bg-linear-to-r from-gray-800 to-gray-600 bg-clip-text text-transparent">
                            Manage Customer
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
                            <span className="text-[10px] font-black text-gray-500 bg-white px-1.5 py-0.5 rounded shadow-sm border border-gray-200">Shift+↵</span>
                            <span className="text-[10px] font-bold text-gray-400 uppercase tracking-tight">Edit</span>
                        </div>
                        <div className="flex items-center gap-1.5 px-2 py-1 bg-gray-50 rounded-lg border border-gray-200">
                            <span className="text-[10px] font-black text-gray-500 bg-white px-1.5 py-0.5 rounded shadow-sm border border-gray-200">/</span>
                            <span className="text-[10px] font-bold text-gray-400 uppercase tracking-tight">Search</span>
                        </div>
                        <div className="flex items-center gap-1.5 px-2 py-1 bg-gray-50 rounded-lg border border-gray-200">
                            <span className="text-[10px] font-black text-gray-500 bg-white px-1.5 py-0.5 rounded shadow-sm border border-gray-200">Esc</span>
                            <span className="text-[10px] font-bold text-gray-400 uppercase tracking-tight">Close</span>
                        </div>
                    </div>
                </div>

                <div className={'grid md:grid-cols-3 grid-cols-1 gap-4'}>
                    {summaryCards.map((stat, i) => (
                        <div
                            key={i}
                            className={`flex items-center p-4 space-x-3 transition-all bg-white rounded-2xl border border-gray-200 cursor-pointer group relative overflow-hidden`}
                        >
                            <div className="absolute inset-0 bg-linear-to-br from-transparent via-gray-50/50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>

                            <div className={`p-3 rounded-full ${stat.color} relative z-10`}>
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
                        </div>
                    ))}
                </div>

                <div

                    className="bg-white rounded-xl p-4 border border-gray-200"
                >
                    <div className="relative">
                        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
                        <input
                            ref={searchRef}
                            type="text"
                            value={searchQuery}
                            onChange={(e) => handleSearch(e.target.value)}
                            placeholder="Search customers by name, email, or phone..."
                            className="w-full pl-10 pr-4 py-2.5 text-sm border-2 border-gray-200 rounded-lg focus:border-emerald-500 transition-all outline-none"
                        />
                    </div>
                </div>

                <div

                    className={'flex flex-col bg-white rounded-xl p-4 justify-between gap-8 border border-gray-200'}
                >
                    <div className="overflow-y-auto max-h-md md:h-[320px] lg:h-[550px] rounded-lg scrollbar-thin scrollbar-thumb-emerald-300 scrollbar-track-gray-100">
                        <table className="min-w-full divide-y divide-gray-200">
                            <thead className="bg-linear-to-r from-emerald-500 to-emerald-600 sticky top-0 z-10">
                                <tr>
                                    {['#', 'Name', 'Email', 'Phone', 'Credit Balance', 'Status', 'Actions'].map((header, i, arr) => (
                                        <th
                                            key={header}
                                            scope="col"
                                            className={`px-6 py-3 text-left text-xs font-bold text-white uppercase tracking-wider
                                                ${i === 0 ? "rounded-tl-lg" : ""}
                                                ${i === arr.length - 1 ? "rounded-tr-lg" : ""}`}
                                        >
                                            {header}
                                        </th>
                                    ))}
                                </tr>
                            </thead>

                            <tbody className="bg-white divide-y divide-gray-200">
                                {isLoading ? (
                                    <tr>
                                        <td colSpan={7} className="px-6 py-8 text-center">
                                            <div className="flex justify-center items-center">
                                                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-emerald-500"></div>
                                                <span className="ml-3 text-gray-600">Loading customers...</span>
                                            </div>
                                        </td>
                                    </tr>
                                ) : customerData.length === 0 ? (
                                    <tr>
                                        <td colSpan={7} className="px-6 py-8 text-center text-gray-500">
                                            No customers found
                                        </td>
                                    </tr>
                                ) : (
                                    customerData.map((customer, index) => (
                                        <tr
                                            key={customer.id}
                                            onClick={() => setSelectedIndex(index)}
                                            className={`cursor-pointer transition-all ${selectedIndex === index
                                                    ? 'bg-emerald-50 border-l-4 border-l-emerald-500'
                                                    : 'hover:bg-gray-50'
                                                }`}
                                        >
                                            <td className="px-6 py-2 whitespace-nowrap text-sm text-gray-600">
                                                {customer.no}
                                            </td>
                                            <td className="px-6 py-2 whitespace-nowrap text-sm font-medium text-gray-800">
                                                {customer.name}
                                            </td>
                                            <td className="px-6 py-2 whitespace-nowrap text-sm text-gray-600">
                                                {customer.email || 'No email'}
                                            </td>
                                            <td className="px-6 py-2 whitespace-nowrap text-sm font-medium text-gray-700">
                                                {customer.phone}
                                            </td>
                                            <td className="px-6 py-2 whitespace-nowrap">
                                                <span className={`px-3 py-1 text-xs font-semibold rounded-full ${customer.totalCreditBalance > 0
                                                        ? 'bg-linear-to-r from-red-100 to-red-200 text-red-800'
                                                        : 'bg-linear-to-r from-emerald-100 to-emerald-200 text-emerald-800'
                                                    }`}>
                                                    Rs. {customer.totalCreditBalance.toLocaleString()}
                                                </span>
                                            </td>
                                            <td className="px-6 py-2 whitespace-nowrap">
                                                <button
                                                    onClick={(e) => {
                                                        e.stopPropagation();
                                                        handleStatusToggle(customer.id, customer.isActive);
                                                    }}
                                                    className={`px-4 py-1.5 text-xs font-semibold rounded-full transition-all transform hover:scale-105 ${customer.isActive
                                                            ? 'bg-linear-to-r from-emerald-500 to-emerald-600 text-white hover:from-emerald-600 hover:to-emerald-700'
                                                            : 'bg-linear-to-r from-gray-400 to-gray-500 text-white hover:from-gray-500 hover:to-gray-600'
                                                        }`}
                                                >
                                                    {customer.isActive ? 'Active' : 'Inactive'}
                                                </button>
                                            </td>
                                            <td className="px-6 py-2 whitespace-nowrap text-sm font-medium">
                                                <div className="flex gap-2">
                                                    <button
                                                        onClick={(e) => {
                                                            e.stopPropagation();
                                                            handleEditClick(customer);
                                                        }}
                                                        className="p-2 bg-linear-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white rounded-lg transition-all"
                                                    >
                                                        <Pencil size={16} />
                                                    </button>
                                                    <button
                                                        onClick={(e) => {
                                                            e.stopPropagation();
                                                            handleViewCustomer(customer);
                                                        }}
                                                        className="p-2 bg-linear-to-r from-emerald-500 to-emerald-600 hover:from-emerald-600 hover:to-emerald-700 text-white rounded-lg transition-all"
                                                    >
                                                        <Eye size={16} />
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
                            Showing <span className="font-bold text-gray-800">{customerData.length === 0 ? 0 : ((currentPage - 1) * itemsPerPage) + 1}-{searchQuery.trim() ? Math.min(currentPage * itemsPerPage, filteredCustomers.length) : Math.min(currentPage * itemsPerPage, totalRecords)}</span> of{' '}
                            <span className="font-bold text-gray-800">{searchQuery.trim() ? filteredCustomers.length : totalRecords}</span> customers
                        </div>
                        <div className="flex items-center space-x-2">
                            <button
                                onClick={() => goToPage(currentPage - 1)}
                                disabled={currentPage === 1}
                                className={`flex items-center px-3 py-2 text-sm font-medium rounded-lg transition-all ${currentPage === 1
                                        ? 'text-gray-400 cursor-not-allowed'
                                        : 'text-gray-600 hover:bg-emerald-50 hover:text-emerald-600'
                                    }`}
                            >
                                <ChevronLeft className="mr-2 h-5 w-5" /> Previous
                            </button>
                            {getPageNumbers().map((page, index) =>
                                page === '...' ? (
                                    <span key={`ellipsis-${index}`} className="text-gray-400 px-2">...</span>
                                ) : (
                                    <button
                                        key={page}
                                        onClick={() => goToPage(page as number)}
                                        className={`px-4 py-2 text-sm font-medium rounded-lg transition-all ${currentPage === page
                                                ? 'bg-linear-to-r from-emerald-500 to-emerald-600 text-white'
                                                : 'text-gray-600 hover:bg-emerald-50 hover:text-emerald-600'
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
                                        ? 'text-gray-400 cursor-not-allowed'
                                        : 'text-gray-600 hover:bg-emerald-50 hover:text-emerald-600'
                                    }`}
                            >
                                Next <ChevronRight className="ml-2 h-5 w-5" />
                            </button>
                        </div>
                    </nav>
                </div>
            </div>

            {/* Edit Modal */}
            {isModalOpen && selectedCustomer && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
                    <div
                        className="bg-white rounded-2xl border border-gray-200 p-8 w-full max-w-md relative"
                    >
                        <button
                            onClick={handleCloseModal}
                            className="absolute top-4 right-4 p-2 hover:bg-gray-100 rounded-lg transition-colors">
                            <X size={20} className="text-gray-500" />
                        </button>

                        <div className="flex items-center gap-3 mb-6">
                            <div className="p-3 bg-linear-to-br from-emerald-500 to-emerald-600 rounded-xl">
                                <Pencil className="w-6 h-6 text-white" />
                            </div>
                            <div>
                                <h2 className="text-xl font-bold text-gray-800">Update Customer</h2>
                                <p className="text-sm text-gray-500">{selectedCustomer.name}</p>
                            </div>
                        </div>

                        <div className="space-y-4">
                            <p className="text-sm text-gray-600">
                                Current Phone: <span className="font-semibold text-emerald-600">{selectedCustomer.phone}</span>
                            </p>
                            <div>
                                <label htmlFor="update-phone-number" className="block text-sm font-bold text-gray-700 mb-1">
                                    New Phone Number
                                </label>
                                <input
                                    type="tel"
                                    id="update-phone-number"
                                    value={newPhone}
                                    onChange={(e) => setNewPhone(e.target.value)}
                                    placeholder="Enter Phone Number"
                                    className="w-full text-sm rounded-lg py-2 px-3 border-2 border-gray-200 focus:border-emerald-500 transition-all outline-none"
                                />
                            </div>
                        </div>

                        <div className="mt-8 flex justify-end gap-3">
                            <button
                                onClick={handleCloseModal}
                                className="px-6 py-2.5 bg-gray-200 text-gray-700 font-semibold rounded-lg hover:bg-gray-300 transition-all"
                            >
                                Cancel
                            </button>
                            <button
                                onClick={handleUpdatePhone}
                                disabled={isUpdatingPhone}
                                className={`px-6 py-2.5 bg-linear-to-r from-emerald-500 to-emerald-600 hover:from-emerald-600 hover:to-emerald-700 text-white font-semibold rounded-lg transition-all ${isUpdatingPhone ? 'opacity-50 cursor-not-allowed' : ''
                                    }`}
                            >
                                {isUpdatingPhone ? 'Updating...' : 'Update Phone'}
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Invoices Modal */}
            {showInvoices && selectedCustomer && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
                    <div
                        className="bg-white rounded-2xl border border-gray-200 w-full max-w-4xl max-h-[90vh] overflow-hidden"
                    >
                        <div className="bg-linear-to-r from-emerald-500 to-emerald-600 px-6 py-4 flex justify-between items-center">
                            <div>
                                <h2 className="text-2xl font-bold text-white">Customer Invoices</h2>
                                <p className="text-emerald-100 text-sm">{selectedCustomer.name}</p>
                            </div>
                            <button
                                onClick={() => {
                                    setShowInvoices(false);
                                    loadCustomers();
                                }}
                                className="p-2 hover:bg-white/20 rounded-lg transition-colors"
                            >
                                <X size={24} className="text-white" />
                            </button>
                        </div>

                        <div className="p-6 overflow-y-auto max-h-[calc(90vh-100px)]">
                            {/* Date Filter */}
                            <div className="mb-4 pb-4 border-b border-gray-200">
                                <div className="flex items-center gap-3">
                                    <div className="flex-1">
                                        <label className="block text-xs font-semibold text-gray-600 mb-1">From Date</label>
                                        <input
                                            type="date"
                                            value={invoiceFromDate}
                                            onChange={(e) => setInvoiceFromDate(e.target.value)}
                                            className="w-full text-sm rounded-lg py-2 px-3 border-2 border-gray-200 focus:border-emerald-500 transition-all outline-none"
                                        />
                                    </div>
                                    <div className="flex-1">
                                        <label className="block text-xs font-semibold text-gray-600 mb-1">To Date</label>
                                        <input
                                            type="date"
                                            value={invoiceToDate}
                                            onChange={(e) => setInvoiceToDate(e.target.value)}
                                            className="w-full text-sm rounded-lg py-2 px-3 border-2 border-gray-200 focus:border-emerald-500 transition-all outline-none"
                                        />
                                    </div>
                                    <button
                                        onClick={handleInvoiceDateFilter}
                                        disabled={isLoadingInvoices}
                                        className="mt-5 px-4 py-2 bg-gradient-to-r from-emerald-500 to-emerald-600 hover:from-emerald-600 hover:to-emerald-700 text-white font-medium rounded-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                                    >
                                        {isLoadingInvoices ? (
                                            <Loader2 className="animate-spin" size={16} />
                                        ) : (
                                            <Search size={16} />
                                        )}
                                    </button>
                                </div>
                            </div>

                            {isLoadingInvoices ? (
                                <div className="flex items-center justify-center py-12">
                                    <Loader2 className="animate-spin text-emerald-500 mr-2" size={32} />
                                    <span className="text-gray-600">Loading invoices...</span>
                                </div>
                            ) : customerInvoices.length > 0 ? (
                                <div className="space-y-4">
                                    {customerInvoices.map((invoice) => (
                                        <div
                                            key={invoice.id}
                                            className="border-2 border-gray-200 rounded-xl p-4 hover:border-emerald-300 transition-all cursor-pointer hover:shadow-lg"
                                            onClick={() => handleViewInvoice(invoice)}
                                        >
                                            <div className="flex justify-between items-start mb-3">
                                                <div>
                                                    <h3 className="text-lg font-bold text-gray-900 flex items-center gap-2">
                                                        <Receipt size={20} className="text-emerald-600" />
                                                        {invoice.invoiceNumber}
                                                    </h3>
                                                    <p className="text-sm text-gray-500">Date: {invoice.date}</p>
                                                </div>
                                                <span className={`px-3 py-1 text-[10px] font-bold rounded-full border border-white/20 uppercase tracking-widest ${getStatusBadge(invoice.status, invoice.refundedAmount)}`}>
                                                    {invoice.refundedAmount > 0 ? 'Returned' : invoice.status.toUpperCase()}
                                                </span>
                                            </div>
                                            <div className="grid grid-cols-3 gap-4 mt-4">
                                                <div>
                                                    <p className="text-xs text-gray-500">Total Amount</p>
                                                    <p className="text-sm font-bold text-gray-900">Rs. {invoice.totalAmount.toLocaleString()}</p>
                                                </div>
                                                <div>
                                                    <p className="text-xs text-gray-500">Paid Amount</p>
                                                    <p className="text-sm font-bold text-emerald-600">Rs. {invoice.paidAmount.toLocaleString()}</p>
                                                </div>
                                                <div>
                                                    <p className="text-xs text-gray-500">Balance</p>
                                                    <p className={`text-sm font-bold ${invoice.balance === 0 ? 'text-emerald-600' : 'text-red-600'}`}>
                                                        Rs. {invoice.balance.toLocaleString()}
                                                    </p>
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            ) : (
                                <div className="text-center py-12 text-gray-500">
                                    <Receipt className="w-16 h-16 mx-auto mb-3 opacity-30" />
                                    <p>No invoices found for this customer</p>
                                    <p className="text-xs mt-2">Try adjusting the date filters</p>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            )}

            {/* Invoice Detail Modal */}
            {showInvoiceDetail && selectedInvoice && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
                    <div
                        className="bg-white rounded-2xl border border-gray-200 w-full max-w-4xl max-h-[90vh] overflow-hidden"
                    >
                        <div className="bg-gradient-to-r from-emerald-500 to-emerald-600 px-6 py-4 flex justify-between items-center">
                            <h2 className="text-2xl font-bold text-white">Invoice Details</h2>
                            <button
                                onClick={() => {
                                    setShowInvoiceDetail(false);
                                    setPaymentAmount('');
                                    if (paymentMethods.length > 0) {
                                        setPaymentMethod(paymentMethods[0].id.toString());
                                    }
                                }}
                                className="p-2 hover:bg-white/20 rounded-lg transition-colors"
                            >
                                <X size={24} className="text-white" />
                            </button>
                        </div>

                        <div className="p-6 overflow-y-auto max-h-[calc(90vh-100px)]">
                            {isLoadingInvoiceDetail ? (
                                <div className="flex items-center justify-center py-12">
                                    <Loader2 className="animate-spin text-emerald-500 mr-2" size={32} />
                                    <span className="text-gray-600">Loading invoice details...</span>
                                </div>
                            ) : selectedInvoice ? (
                            <>
                            <div className="grid grid-cols-2 gap-6 mb-6">
                                <div>
                                    <p className="text-sm text-gray-500 mb-1">Invoice Number</p>
                                    <h3 className="text-xl font-bold text-gray-900">{selectedInvoice.invoiceNumber}</h3>
                                </div>
                                <div>
                                    <p className="text-sm text-gray-500 mb-1">Customer</p>
                                    <h3 className="text-xl font-bold text-gray-900">{selectedInvoice.customerName}</h3>
                                </div>
                                <div>
                                    <p className="text-sm text-gray-500 mb-1">Invoice Date</p>
                                    <p className="text-gray-900 font-medium">{selectedInvoice.date}</p>
                                </div>
                                <div>
                                    <p className="text-sm text-gray-500 mb-1">Due Date</p>
                                    <p className="text-gray-900 font-medium">{selectedInvoice.dueDate}</p>
                                </div>
                                <div>
                                    <p className="text-sm text-gray-500 mb-1">Status</p>
                                    <span className={`px-3 py-1 text-[10px] font-bold rounded-full border border-white/20 uppercase tracking-widest inline-block ${getStatusBadge(selectedInvoice.status, selectedInvoice.refundedAmount)}`}>
                                        {selectedInvoice.refundedAmount > 0 ? 'Returned' : selectedInvoice.status.toUpperCase()}
                                    </span>
                                </div>
                            </div>

                            <hr className="my-6 border-gray-200" />

                            <h3 className="text-lg font-bold text-gray-900 mb-4">Items</h3>
                            <div className="border-2 border-gray-200 rounded-lg overflow-hidden mb-6">
                                <table className="w-full">
                                    <thead className="bg-gray-50">
                                        <tr>
                                            <th className="px-4 py-3 text-left text-sm font-bold text-gray-700">Item</th>
                                            <th className="px-4 py-3 text-right text-sm font-bold text-gray-700">Quantity</th>
                                            <th className="px-4 py-3 text-right text-sm font-bold text-gray-700">Price</th>
                                            <th className="px-4 py-3 text-right text-sm font-bold text-gray-700">Total</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-gray-200">
                                        {selectedInvoice.items.map((item, index) => (
                                            <tr key={index} className="hover:bg-gray-50">
                                                <td className="px-4 py-3 text-sm text-gray-800">{item.name}</td>
                                                <td className="px-4 py-3 text-sm text-gray-600 text-right">{item.quantity}</td>
                                                <td className="px-4 py-3 text-sm text-gray-600 text-right">Rs. {item.price.toLocaleString()}</td>
                                                <td className="px-4 py-3 text-sm font-semibold text-gray-900 text-right">Rs. {item.total.toLocaleString()}</td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>

                            <div className="bg-gradient-to-r from-gray-50 to-gray-100 rounded-lg p-6 space-y-3">
                                <div className="flex justify-between text-sm">
                                    <span className="text-gray-600 font-medium">Subtotal:</span>
                                    <span className="text-gray-900 font-semibold">Rs. {selectedInvoice.subtotal.toLocaleString()}</span>
                                </div>
                                <div className="flex justify-between text-sm">
                                    <span className="text-gray-600 font-medium">Tax:</span>
                                    <span className="text-gray-900 font-semibold">Rs. {selectedInvoice.tax.toLocaleString()}</span>
                                </div>
                                <hr className="border-gray-300" />
                                <div className="flex justify-between text-lg">
                                    <span className="text-gray-900 font-bold">Total Amount:</span>
                                    <span className="text-gray-900 font-bold">Rs. {selectedInvoice.totalAmount.toLocaleString()}</span>
                                </div>
                                <div className="flex justify-between text-lg">
                                    <span className="text-emerald-700 font-bold">Paid Amount:</span>
                                    <span className="text-emerald-600 font-bold">Rs. {selectedInvoice.paidAmount.toLocaleString()}</span>
                                </div>
                                <hr className="border-gray-300" />
                                <div className="flex justify-between text-xl">
                                    <span className={`font-bold ${selectedInvoice.balance === 0 ? 'text-emerald-600' : 'text-red-600'}`}>
                                        Balance:
                                    </span>
                                    <span className={`font-bold ${selectedInvoice.balance === 0 ? 'text-emerald-600' : 'text-red-600'}`}>
                                        Rs. {selectedInvoice.balance.toLocaleString()}
                                    </span>
                                </div>
                            </div>

                            {/* Payment Section - Only show for open invoices */}
                            {selectedInvoice.status === 'open' && selectedInvoice.balance > 0 && (
                                <div className="mt-6 p-6 bg-gradient-to-r from-blue-50 to-emerald-50 rounded-lg border-2 border-emerald-200">
                                    <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
                                        <DollarSign className="text-emerald-600" size={24} />
                                        Make Payment
                                    </h3>
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                                        <div>
                                            <label htmlFor="payment-method" className="block text-sm font-bold text-gray-700 mb-2">
                                                Payment Method
                                            </label>
                                            <select
                                                id="payment-method"
                                                value={paymentMethod}
                                                onChange={(e) => setPaymentMethod(e.target.value)}
                                                className="w-full text-sm font-semibold rounded-lg py-3 px-4 border-2 border-gray-300 focus:border-emerald-500 transition-all outline-none"
                                            >
                                                {paymentMethods.map((method) => (
                                                    <option key={method.id} value={method.id}>
                                                        {method.name}
                                                    </option>
                                                ))}
                                            </select>
                                        </div>
                                        <div>
                                            <label htmlFor="payment-amount" className="block text-sm font-bold text-gray-700 mb-2">
                                                Payment Amount
                                            </label>
                                            <input
                                                type="number"
                                                id="payment-amount"
                                                value={paymentAmount}
                                                onChange={(e) => setPaymentAmount(e.target.value)}
                                                placeholder="0.00"
                                                min="0"
                                                max={selectedInvoice.balance}
                                                step="0.01"
                                                className="w-full text-lg font-semibold rounded-lg py-3 px-4 border-2 border-gray-300 focus:border-emerald-500 transition-all outline-none"
                                            />
                                            <p className="text-xs text-gray-500 mt-1">
                                                Maximum payable: Rs. {selectedInvoice.balance.toLocaleString()}
                                            </p>
                                        </div>
                                    </div>
                                    <button
                                        onClick={handlePayment}
                                        disabled={isProcessingPayment || !paymentAmount || !paymentMethod}
                                        className={`w-full px-8 py-3 bg-gradient-to-r from-emerald-500 to-emerald-600 hover:from-emerald-600 hover:to-emerald-700 text-white font-bold rounded-lg transition-all transform hover:scale-105 ${isProcessingPayment || !paymentAmount || !paymentMethod ? 'opacity-50 cursor-not-allowed' : ''
                                            }`}
                                    >
                                        {isProcessingPayment ? (
                                            <span className="flex items-center justify-center gap-2">
                                                <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent"></div>
                                                Processing...
                                            </span>
                                        ) : (
                                            'Pay Now'
                                        )}
                                    </button>
                                </div>
                            )}
                            </>
                            ) : (
                                <div className="text-center py-8 text-gray-500">
                                    No invoice details available
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            )}
        </>
    );
}

export default ManageCustomer;