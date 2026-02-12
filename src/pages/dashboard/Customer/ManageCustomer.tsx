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
    Loader2,
    History
} from 'lucide-react';

import { useEffect, useState, useRef } from 'react';
import toast, { Toaster } from 'react-hot-toast';
import { customerService } from '../../../services/customerService';
import invoiceService from '../../../services/invoiceService';
import { paymentTypeService } from '../../../services/paymentTypeService';
import { authService } from '../../../services/authService';


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
    const [invoicePage, setInvoicePage] = useState(1);
    const [hasMoreInvoices, setHasMoreInvoices] = useState(true);
    const [isLoadingMoreInvoices, setIsLoadingMoreInvoices] = useState(false);

    const [selectedCustomer, setSelectedCustomer] = useState<Customer | null>(null);
    const [selectedInvoice, setSelectedInvoice] = useState<InvoiceDetail | null>(null);
    const [showInvoices, setShowInvoices] = useState(false);
    const [showInvoiceDetail, setShowInvoiceDetail] = useState(false);
    const [selectedIndex, setSelectedIndex] = useState(0);

    // Invoice filters
    const [invoiceFromDate, setInvoiceFromDate] = useState('');
    const [invoiceToDate, setInvoiceToDate] = useState('');
    const [isLoadingInvoiceDetail, setIsLoadingInvoiceDetail] = useState(false);

    // Credit History State
    const [showCreditHistory, setShowCreditHistory] = useState(false);
    const [creditHistory, setCreditHistory] = useState<any[]>([]);
    const [isLoadingHistory, setIsLoadingHistory] = useState(false);
    const [creditHistoryPage, setCreditHistoryPage] = useState(1);
    const [hasMoreCreditHistory, setHasMoreCreditHistory] = useState(true);
    const [isLoadingMoreHistory, setIsLoadingMoreHistory] = useState(false);

    const [isModalOpen, setIsModalOpen] = useState(false);
    const [newName, setNewName] = useState('');
    const [newPhone, setNewPhone] = useState('');
    const [isUpdatingCustomer, setIsUpdatingCustomer] = useState(false);

    const [paymentAmount, setPaymentAmount] = useState('');
    const [paymentMethod, setPaymentMethod] = useState('');
    const [paymentMethods, setPaymentMethods] = useState<Array<{ id: number; name: string }>>([]);
    const [isProcessingPayment, setIsProcessingPayment] = useState(false);
    
    // Credit Payment State (for invoices modal)
    const [creditPaymentAmount, setCreditPaymentAmount] = useState('');
    const [creditPaymentMethod, setCreditPaymentMethod] = useState('');
    const [isProcessingCreditPayment, setIsProcessingCreditPayment] = useState(false);
    
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
        setNewName(customer.name);
        setNewPhone(customer.phone);
        setIsModalOpen(true);
    };

    const handleCloseModal = () => {
        setIsModalOpen(false);
        setSelectedCustomer(null);
        setNewName('');
        setNewPhone('');
        setIsUpdatingCustomer(false);
    };

    const handleUpdateCustomer = async () => {
        if (!selectedCustomer || !newName.trim() || !newPhone.trim()) {
            toast.error('Please enter a name and a valid phone number');
            return;
        }

        setIsUpdatingCustomer(true);
        try {
            const response = await customerService.updateCustomer(selectedCustomer.id, {
                name: newName.trim(),
                contact: newPhone.trim()
            });

            if (response.data.success) {
                // Update local state
                const updatedCustomers = customers.map(customer =>
                    customer.id === selectedCustomer.id
                        ? { ...customer, name: newName.trim(), phone: newPhone.trim() }
                        : customer
                );
                setCustomers(updatedCustomers);
                setFilteredCustomers(updatedCustomers);

                toast.success('Customer updated successfully!');
                handleCloseModal();
            } else {
                toast.error(response.data.message || 'Failed to update customer');
            }
        } catch (error: any) {
            console.error('Error updating customer:', error);
            const errorMessage = error.response?.data?.message || 'Failed to update customer. Please try again.';
            toast.error(errorMessage);
        } finally {
            setIsUpdatingCustomer(false);
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
        // Reset pagination state
        setInvoicePage(1);
        setHasMoreInvoices(true);
        setIsLoadingMoreInvoices(false);
        // Reset credit payment state
        setCreditPaymentAmount('');
        setCreditPaymentMethod(paymentMethods.length > 0 ? paymentMethods[0].id.toString() : '');
        await loadCustomerInvoices(customer.id);
    };

    const handleCreditPayment = async () => {
        if (!selectedCustomer || !creditPaymentAmount || !creditPaymentMethod) {
            toast.error('Please enter payment amount and select payment method');
            return;
        }

        const amount = parseFloat(creditPaymentAmount);
        if (amount <= 0) {
            toast.error('Payment amount must be greater than zero');
            return;
        }

        if (amount > selectedCustomer.totalCreditBalance) {
            toast.error('Payment amount cannot exceed credit balance');
            return;
        }

        try {
            setIsProcessingCreditPayment(true);
            const user = authService.getCurrentUser();

            const response = await invoiceService.processCreditPayment({
                customer_id: selectedCustomer.id,
                payment_amount: amount,
                payment_type_id: parseInt(creditPaymentMethod),
                user_id: user?.id
            });

            if (response.success) {
                toast.success(
                    `Payment of Rs. ${amount.toLocaleString()} processed successfully across ${response.data.invoicesPaid} invoice(s)`
                );
                setCreditPaymentAmount('');
                // Reload customer data and invoices
                await loadCustomers();
                if (selectedCustomer) {
                    await loadCustomerInvoices(selectedCustomer.id, invoiceFromDate, invoiceToDate, 1, false);
                    // Update selected customer with new balance (subtract payment amount)
                    setSelectedCustomer({
                        ...selectedCustomer,
                        totalCreditBalance: selectedCustomer.totalCreditBalance - amount
                    });
                }
            } else {
                toast.error(response.message || 'Failed to process payment');
            }
        } catch (error: any) {
            console.error('Error processing credit payment:', error);
            toast.error(error.response?.data?.message || 'Failed to process payment');
        } finally {
            setIsProcessingCreditPayment(false);
        }
    };

    const handleViewCreditHistory = async (customer: Customer) => {
        setSelectedCustomer(customer);
        setShowCreditHistory(true);
        setCreditHistory([]);
        setCreditHistoryPage(1);
        setHasMoreCreditHistory(true);
        setIsLoadingHistory(true);
        try {
            const response = await invoiceService.getCreditHistory(customer.id, 1, 10);
            if (response.success) {
                setCreditHistory(response.data);
                setHasMoreCreditHistory(response.pagination.hasMore);
                console.log('📊 Initial load - Pagination:', response.pagination);
            } else {
                toast.error('Failed to load credit history');
            }
        } catch (error) {
            console.error('Error loading credit history:', error);
            toast.error('Failed to load credit history');
        } finally {
            setIsLoadingHistory(false);
        }
    };

    const loadCustomerInvoices = async (customerId: number, fromDate?: string, toDate?: string, page: number = 1, append: boolean = false) => {
        try {
            if (append) {
                setIsLoadingMoreInvoices(true);
            } else {
                setIsLoadingInvoices(true);
            }
            
            const response = await invoiceService.getAllInvoices({
                customerId: customerId,
                fromDate: fromDate || undefined,
                toDate: toDate || undefined,
                page: page,
                limit: 10,
                order: 'desc'
            });

            if (response.success) {
                // Map to Invoice interface
                const mappedInvoices: Invoice[] = response.data.map((inv: any) => ({
                    id: inv.id,
                    invoiceNumber: inv.invoiceID,
                    date: inv.issuedDate || inv.date,
                    totalAmount: parseFloat(inv.netAmount || inv.total),
                    paidAmount: parseFloat(inv.netAmount || inv.total) - parseFloat(inv.balance || 0),
                    balance: parseFloat(inv.balance || 0),
                    refundedAmount: parseFloat(inv.refundedAmount || 0),
                    status: parseFloat(inv.balance || 0) === 0 ? 'paid' : 'open'
                }));
                
                if (append) {
                    setCustomerInvoices(prev => [...prev, ...mappedInvoices]);
                } else {
                    setCustomerInvoices(mappedInvoices);
                }
                
                // Update pagination state
                setInvoicePage(response.pagination.currentPage);
                setHasMoreInvoices(response.pagination.currentPage < response.pagination.totalPages);
            }
        } catch (error) {
            console.error('Error loading customer invoices:', error);
            toast.error('Failed to load customer invoices');
            if (!append) {
                setCustomerInvoices([]);
            }
        } finally {
            if (append) {
                setIsLoadingMoreInvoices(false);
            } else {
                setIsLoadingInvoices(false);
            }
        }
    };

    const handleInvoiceDateFilter = () => {
        if (selectedCustomer) {
            // Reset pagination on filter change
            setInvoicePage(1);
            setHasMoreInvoices(true);
            loadCustomerInvoices(selectedCustomer.id, invoiceFromDate, invoiceToDate, 1, false);
        }
    };

    const loadMoreInvoices = async () => {
        if (!selectedCustomer || isLoadingMoreInvoices || !hasMoreInvoices) return;
        
        try {
            const nextPage = invoicePage + 1;
            await loadCustomerInvoices(selectedCustomer.id, invoiceFromDate, invoiceToDate, nextPage, true);
        } catch (error) {
            console.error('Error loading more invoices:', error);
            toast.error('Failed to load more invoices');
        }
    };

    const handleInvoiceScroll = (e: React.UIEvent<HTMLDivElement>) => {
        const { scrollTop, clientHeight, scrollHeight } = e.currentTarget;
        
        // Check if scrolled near bottom (50px threshold)
        if (scrollHeight - scrollTop - clientHeight < 50) {
            if (!isLoadingMoreInvoices && hasMoreInvoices && !isLoadingInvoices) {
                loadMoreInvoices();
            }
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
                setPaymentAmount(detail.balance.toString());
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
                payment_type_id: parseInt(paymentMethod),
                user_id: authService.getUserId() || undefined
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
            return 'bg-gradient-to-r from-rose-500 to-red-600 text-white shadow-sm font-black';
        }
        switch (status) {
            case 'paid':
                return 'bg-gradient-to-r from-emerald-500 to-teal-600 text-white shadow-sm font-black';
            case 'open':
                return 'bg-gradient-to-r from-amber-400 to-orange-500 text-white shadow-sm font-black';
            default:
                return 'bg-gradient-to-r from-slate-400 to-gray-500 text-white shadow-sm font-black';
        }
    };

    const loadMoreCreditHistory = async () => {
        if (!selectedCustomer || isLoadingMoreHistory || !hasMoreCreditHistory) return;
        
        setIsLoadingMoreHistory(true);
        try {
            const nextPage = creditHistoryPage + 1;
            console.log(`📄 Loading page ${nextPage} of credit history for customer ${selectedCustomer.id}`);
            
            const response = await invoiceService.getCreditHistory(selectedCustomer.id, nextPage, 10);
            
            console.log(`✅ Received ${response.data.length} records`);
            console.log('📊 Pagination Info:', {
                currentPage: response.pagination.currentPage,
                totalPages: response.pagination.totalPages,
                totalRecords: response.pagination.totalRecords,
                hasMore: response.pagination.hasMore,
                recordsPerPage: response.pagination.recordsPerPage
            });
            console.log('🔢 Response data sample:', response.data.slice(0, 2));
            
            if (response.success) {
                setCreditHistory(prev => [...prev, ...response.data]);
                setCreditHistoryPage(nextPage);
                setHasMoreCreditHistory(response.pagination.hasMore);
            }
        } catch (error) {
            console.error('Error loading more credit history:', error);
            toast.error('Failed to load more history');
        } finally {
            setIsLoadingMoreHistory(false);
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
                                                    <button
                                                        onClick={(e) => {
                                                            e.stopPropagation();
                                                            handleViewCreditHistory(customer);
                                                        }}
                                                        className="p-2 bg-linear-to-r from-purple-500 to-purple-600 hover:from-purple-600 hover:to-purple-700 text-white rounded-lg transition-all"
                                                        title="View Credit Payment History"
                                                    >
                                                        <History size={16} />
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
                            <div>
                                <label htmlFor="update-customer-name" className="block text-sm font-bold text-gray-700 mb-1">
                                    Customer Name
                                </label>
                                <input
                                    type="text"
                                    id="update-customer-name"
                                    value={newName}
                                    onChange={(e) => setNewName(e.target.value)}
                                    placeholder="Enter Customer Name"
                                    className="w-full text-sm rounded-lg py-2 px-3 border-2 border-gray-200 focus:border-emerald-500 transition-all outline-none"
                                />
                            </div>
                            <div>
                                <label htmlFor="update-phone-number" className="block text-sm font-bold text-gray-700 mb-1">
                                    Phone Number
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
                                onClick={handleUpdateCustomer}
                                disabled={isUpdatingCustomer}
                                className={`px-6 py-2.5 bg-linear-to-r from-emerald-500 to-emerald-600 hover:from-emerald-600 hover:to-teal-600 text-white font-semibold rounded-lg transition-all shadow-md active:scale-95 ${isUpdatingCustomer ? 'opacity-50 cursor-not-allowed grayscale' : ''
                                    }`}
                            >
                                {isUpdatingCustomer ? 'Updating...' : 'Update Customer'}
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

                        <div className="p-6 overflow-y-auto max-h-[calc(90vh-100px)]" onScroll={handleInvoiceScroll}>
                            {/* Credit Payment Section */}
                            <div className="mb-6 p-6 bg-gradient-to-br from-purple-50 to-indigo-50 rounded-2xl border-2 border-purple-200/50">
                                <div className="flex items-center justify-between mb-4">
                                    <div>
                                        <h3 className="text-lg font-bold text-gray-900 flex items-center gap-2">
                                            <CreditCard size={20} className="text-purple-600" />
                                            Credit Payment
                                        </h3>
                                        <p className="text-sm text-gray-600 mt-1">Process payment for customer credit balance</p>
                                    </div>
                                    <div className="text-right">
                                        <p className="text-xs font-bold text-purple-600 uppercase tracking-wider">Credit Balance</p>
                                        <p className={`text-2xl font-black ${
                                            selectedCustomer.totalCreditBalance > 0 ? 'text-red-600' : 'text-emerald-600'
                                        }`}>
                                            Rs. {selectedCustomer.totalCreditBalance.toLocaleString()}
                                        </p>
                                    </div>
                                </div>

                                {selectedCustomer.totalCreditBalance > 0 ? (
                                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                        <div className="space-y-2">
                                            <label htmlFor="credit-payment-amount" className="block text-xs font-bold text-gray-700">
                                                Payment Amount
                                            </label>
                                            <div className="relative">
                                                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500 font-bold">Rs.</span>
                                                <input
                                                    type="number"
                                                    id="credit-payment-amount"
                                                    value={creditPaymentAmount}
                                                    onChange={(e) => {
                                                        const value = e.target.value;
                                                        if (value === '' || parseFloat(value) >= 0) {
                                                            setCreditPaymentAmount(value);
                                                        }
                                                    }}
                                                    placeholder="0.00"
                                                    min="0"
                                                    max={selectedCustomer.totalCreditBalance}
                                                    step="0.01"
                                                    className="w-full text-sm font-bold rounded-lg py-2 pl-10 pr-3 border-2 border-gray-200 bg-white focus:border-purple-500 focus:ring-2 focus:ring-purple-500/20 transition-all outline-none"
                                                />
                                            </div>
                                        </div>

                                        <div className="space-y-2">
                                            <label htmlFor="credit-payment-method" className="block text-xs font-bold text-gray-700">
                                                Payment Method
                                            </label>
                                            <select
                                                id="credit-payment-method"
                                                value={creditPaymentMethod}
                                                onChange={(e) => setCreditPaymentMethod(e.target.value)}
                                                className="w-full text-sm font-medium rounded-lg py-2 px-3 border-2 border-gray-200 bg-white focus:border-purple-500 focus:ring-2 focus:ring-purple-500/20 transition-all outline-none"
                                            >
                                                {paymentMethods.map(method => (
                                                    <option key={method.id} value={method.id}>{method.name}</option>
                                                ))}
                                            </select>
                                        </div>

                                        <div className="flex items-end">
                                            <button
                                                onClick={handleCreditPayment}
                                                disabled={isProcessingCreditPayment || !creditPaymentAmount || !creditPaymentMethod}
                                                className="w-full px-6 py-2 bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 text-white font-bold rounded-lg transition-all shadow-lg shadow-purple-200 active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed disabled:grayscale flex items-center justify-center gap-2"
                                            >
                                                {isProcessingCreditPayment ? (
                                                    <>
                                                        <Loader2 className="animate-spin" size={16} />
                                                        Processing...
                                                    </>
                                                ) : (
                                                    <>
                                                        <CheckCircle size={16} />
                                                        Process Payment
                                                    </>
                                                )}
                                            </button>
                                        </div>
                                    </div>
                                ) : (
                                    <div className="text-center py-4">
                                        <CheckCircle className="w-12 h-12 mx-auto mb-2 text-emerald-500" />
                                        <p className="text-sm font-bold text-emerald-600">No outstanding credit balance</p>
                                        <p className="text-xs text-gray-500 mt-1">This customer has cleared all dues</p>
                                    </div>
                                )}
                            </div>

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
                                    
                                    {/* Loading More Indicator */}
                                    {isLoadingMoreInvoices && (
                                        <div className="flex items-center justify-center py-8">
                                            <Loader2 className="animate-spin text-emerald-500 mr-2" size={24} />
                                            <span className="text-gray-600 text-sm font-medium">Loading more invoices...</span>
                                        </div>
                                    )}
                                    
                                    {/* All Loaded Indicator */}
                                    {!hasMoreInvoices && customerInvoices.length > 0 && !isLoadingInvoices && (
                                        <div className="text-center py-6 mt-4 border-t border-gray-200">
                                            <CheckCircle className="w-8 h-8 mx-auto mb-2 text-emerald-500" />
                                            <p className="text-gray-500 text-sm font-medium">All invoices loaded</p>
                                            <p className="text-gray-400 text-xs mt-1">
                                                Showing {customerInvoices.length} invoice{customerInvoices.length !== 1 ? 's' : ''}
                                            </p>
                                        </div>
                                    )}
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
                        <div className="bg-gradient-to-r from-gray-800 to-gray-900 px-8 py-6 flex justify-between items-center relative overflow-hidden">
                            <div className="absolute inset-0 bg-emerald-500/10 mix-blend-overlay" />
                            <div className="relative z-10">
                                <h2 className="text-2xl font-black text-white tracking-tight">INVOICE DETAILS</h2>
                                <p className="text-emerald-400 text-xs font-bold tracking-[0.2em] uppercase mt-1">Ref: {selectedInvoice.invoiceNumber}</p>
                            </div>
                            <button
                                onClick={() => {
                                    setShowInvoiceDetail(false);
                                    setPaymentAmount('');
                                    if (paymentMethods.length > 0) {
                                        setPaymentMethod(paymentMethods[0].id.toString());
                                    }
                                }}
                                className="relative z-10 p-2 hover:bg-white/10 rounded-xl transition-all hover:scale-110 active:scale-90"
                            >
                                <X size={24} className="text-white" />
                            </button>
                        </div>

                        <div className="p-8 overflow-y-auto max-h-[calc(90vh-120px)] hide-scrollbar">
                            {isLoadingInvoiceDetail ? (
                                <div className="flex flex-col items-center justify-center py-20">
                                    <div className="relative">
                                        <div className="w-16 h-16 border-4 border-emerald-500/20 border-t-emerald-500 rounded-full animate-spin" />
                                        <Loader2 className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-emerald-500" size={24} />
                                    </div>
                                    <span className="mt-4 text-gray-500 font-bold uppercase tracking-widest text-xs">Fetching Invoice...</span>
                                </div>
                            ) : selectedInvoice ? (
                            <>
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-10">
                                <div className="p-5 bg-gray-50 rounded-2xl border border-gray-100">
                                    <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2">Customer Info</p>
                                    <h3 className="text-lg font-bold text-gray-900">{selectedInvoice.customerName}</h3>
                                    <p className="text-xs text-gray-500 font-medium">Verified Account</p>
                                </div>
                                <div className="p-5 bg-gray-50 rounded-2xl border border-gray-100">
                                    <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2">Issue Date</p>
                                    <p className="text-lg font-bold text-gray-900">{selectedInvoice.date}</p>
                                    <div className="flex items-center gap-1 mt-1 text-[10px] text-gray-500 font-bold">
                                        <span>DUE:</span>
                                        <span className="text-gray-900">{selectedInvoice.dueDate}</span>
                                    </div>
                                </div>
                                <div className="p-5 bg-gray-50 rounded-2xl border border-gray-100 flex flex-col justify-between">
                                    <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2">Payment Status</p>
                                    <span className={`w-fit px-4 py-1.5 text-[10px] font-black rounded-lg uppercase tracking-widest shadow-sm ${getStatusBadge(selectedInvoice.status, selectedInvoice.refundedAmount)}`}>
                                        {selectedInvoice.refundedAmount > 0 ? 'Returned' : selectedInvoice.status}
                                    </span>
                                </div>
                            </div>

                            <div className="mb-10">
                                <div className="flex items-center gap-2 mb-4">
                                    <Receipt size={18} className="text-emerald-500" />
                                    <h3 className="text-sm font-black text-gray-900 uppercase tracking-widest">Itemized List</h3>
                                </div>
                                <div className="rounded-2xl border-2 border-gray-50 overflow-hidden shadow-sm">
                                    <table className="w-full">
                                        <thead>
                                            <tr className="bg-gray-900">
                                                <th className="px-6 py-4 text-left text-[10px] font-black text-gray-400 uppercase tracking-[0.2em]">Product/Service</th>
                                                <th className="px-6 py-4 text-center text-[10px] font-black text-gray-400 uppercase tracking-[0.2em]">Qty</th>
                                                <th className="px-6 py-4 text-right text-[10px] font-black text-gray-400 uppercase tracking-[0.2em]">Unit Price</th>
                                                <th className="px-6 py-4 text-right text-[10px] font-black text-gray-400 uppercase tracking-[0.2em]">Total</th>
                                            </tr>
                                        </thead>
                                        <tbody className="divide-y divide-gray-50">
                                            {selectedInvoice.items.map((item, index) => (
                                                <tr key={index} className="hover:bg-emerald-50/30 transition-colors">
                                                    <td className="px-6 py-5">
                                                        <p className="text-sm font-bold text-gray-900">{item.name}</p>
                                                    </td>
                                                    <td className="px-6 py-5 text-center">
                                                        <span className="px-3 py-1 bg-gray-100 rounded-full text-xs font-black text-gray-700">{item.quantity}</span>
                                                    </td>
                                                    <td className="px-6 py-5 text-sm text-gray-500 text-right font-medium">Rs. {item.price.toLocaleString()}</td>
                                                    <td className="px-6 py-5 text-sm font-black text-gray-900 text-right tracking-tight">Rs. {item.total.toLocaleString()}</td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
                                <div className="p-8 bg-gray-900 rounded-3xl text-white relative overflow-hidden">
                                     {/* Receipt pattern overlay */}
                                    <div className="absolute inset-0 opacity-[0.03] pointer-events-none" style={{ backgroundImage: 'radial-gradient(circle at 2px 2px, white 1px, transparent 0)', backgroundSize: '24px 24px' }} />
                                    
                                    <h4 className="text-[10px] font-black text-emerald-500 uppercase tracking-[0.3em] mb-6">Financial Summary</h4>
                                    
                                    <div className="space-y-4">
                                        <div className="flex justify-between items-center group">
                                            <span className="text-gray-400 text-xs font-bold uppercase tracking-wider group-hover:text-white transition-colors">Gross Subtotal</span>
                                            <span className="text-sm font-bold">Rs. {selectedInvoice.subtotal.toLocaleString()}</span>
                                        </div>
                                        <div className="flex justify-between items-center group">
                                            <span className="text-gray-400 text-xs font-bold uppercase tracking-wider group-hover:text-white transition-colors">Applied Discount/Tax</span>
                                            <span className="text-sm font-bold text-emerald-400">- Rs. {selectedInvoice.tax.toLocaleString()}</span>
                                        </div>
                                        
                                        <div className="h-px bg-white/10 my-4" />
                                        
                                        <div className="flex justify-between items-center bg-white/5 p-4 rounded-2xl">
                                            <span className="text-emerald-400 text-xs font-black uppercase tracking-[0.2em]">Net Total</span>
                                            <span className="text-2xl font-black">Rs. {selectedInvoice.totalAmount.toLocaleString()}</span>
                                        </div>
                                        
                                        <div className="flex justify-between items-center px-4">
                                            <span className="text-gray-500 text-[10px] font-black uppercase tracking-widest">Amount Settle</span>
                                            <span className="text-sm font-black text-emerald-500">Rs. {selectedInvoice.paidAmount.toLocaleString()}</span>
                                        </div>

                                        <div className={`mt-6 p-5 rounded-2xl flex justify-between items-center transition-all ${selectedInvoice.balance === 0 ? 'bg-emerald-500/20 border border-emerald-500/50' : 'bg-red-500/10 border border-red-500/30'}`}>
                                            <div>
                                                <p className="text-[9px] font-black uppercase tracking-widest opacity-60">
                                                    {selectedInvoice.balance === 0 ? 'STATUS: FULLY PAID' : 'CURRENT DEBT'}
                                                </p>
                                                <p className="text-xs font-bold">Remaining Balance</p>
                                            </div>
                                            <div className="text-right">
                                                <p className={`text-2xl font-black ${selectedInvoice.balance === 0 ? 'text-emerald-400' : 'text-red-500'}`}>
                                                    Rs. {selectedInvoice.balance.toLocaleString()}
                                                </p>
                                            </div>
                                        </div>
                                    </div>
                                </div>

                            {/* Payment Section - Only show for open invoices */}
                            {selectedInvoice.status === 'open' && selectedInvoice.balance > 0 && (
                                <div className="mt-8 p-8 bg-gradient-to-br from-emerald-50 to-teal-50 rounded-3xl border border-emerald-100 shadow-inner relative overflow-hidden">
                                    {/* Decorative background element */}
                                    <div className="absolute -right-8 -top-8 w-32 h-32 bg-emerald-100/50 rounded-full blur-2xl" />
                                    
                                    <div className="relative z-10">
                                        <div className="flex items-center justify-between mb-6">
                                            <h3 className="text-xl font-bold text-gray-900 flex items-center gap-3">
                                                <div className="p-2 bg-emerald-500 rounded-xl shadow-lg shadow-emerald-200">
                                                    <CreditCard className="text-white" size={20} />
                                                </div>
                                                Payment Settlement
                                            </h3>
                                            <div className="text-right">
                                                <p className="text-xs font-bold text-emerald-600 uppercase tracking-wider mb-1">Outstanding Balance</p>
                                                <p className="text-2xl font-black text-gray-900">Rs. {selectedInvoice.balance.toLocaleString()}</p>
                                            </div>
                                        </div>

                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
                                            <div className="space-y-2">
                                                <label htmlFor="payment-method" className="block text-sm font-bold text-gray-700 flex items-center gap-2">
                                                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                                                    Payment Method
                                                </label>
                                                <div className="relative group">
                                                    <select
                                                        id="payment-method"
                                                        value={paymentMethod}
                                                        onChange={(e) => setPaymentMethod(e.target.value)}
                                                        className="w-full text-base font-semibold rounded-2xl py-4 px-5 border-2 border-gray-100 bg-white focus:border-emerald-500 focus:ring-4 focus:ring-emerald-500/10 transition-all outline-none appearance-none hover:border-emerald-200"
                                                    >
                                                        {paymentMethods.map((method) => (
                                                            <option key={method.id} value={method.id}>
                                                                {method.name}
                                                            </option>
                                                        ))}
                                                    </select>
                                                    <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-gray-400 group-hover:text-emerald-500 transition-colors">
                                                        <ChevronRight size={20} className="rotate-90" />
                                                    </div>
                                                </div>
                                            </div>

                                            <div className="space-y-2">
                                                <label htmlFor="payment-amount" className="block text-sm font-bold text-gray-700 flex items-center gap-2">
                                                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                                                    Amount to Pay
                                                </label>
                                                <div className="relative">
                                                    <span className="absolute left-5 top-1/2 -translate-y-1/2 text-gray-400 font-bold">Rs.</span>
                                                    <input
                                                        type="number"
                                                        id="payment-amount"
                                                        value={paymentAmount}
                                                        onChange={(e) => {
                                                            const val = e.target.value;
                                                            if (parseFloat(val) > selectedInvoice.balance) {
                                                                setPaymentAmount(selectedInvoice.balance.toString());
                                                            } else {
                                                                setPaymentAmount(val);
                                                            }
                                                        }}
                                                        placeholder="0.00"
                                                        min="0"
                                                        max={selectedInvoice.balance}
                                                        step="0.01"
                                                        className="w-full text-xl font-bold rounded-2xl py-4 pl-12 pr-5 border-2 border-gray-100 bg-white focus:border-emerald-500 focus:ring-4 focus:ring-emerald-500/10 transition-all outline-none"
                                                    />
                                                </div>
                                            </div>
                                        </div>

                                        <button
                                            onClick={handlePayment}
                                            disabled={isProcessingPayment || !paymentAmount || !paymentMethod}
                                            className={`w-full relative overflow-hidden group px-8 py-5 bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-600 hover:to-teal-700 text-white font-black text-lg rounded-2xl transition-all shadow-xl shadow-emerald-200 active:scale-95 flex items-center justify-center gap-3 ${
                                                isProcessingPayment || !paymentAmount || !paymentMethod ? 'opacity-50 cursor-not-allowed grayscale' : ''
                                            }`}
                                        >
                                            <div className="absolute inset-0 bg-white/20 translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-500 skew-x-12" />
                                            {isProcessingPayment ? (
                                                <>
                                                    <Loader2 className="animate-spin" size={24} />
                                                    <span>PROCESSING...</span>
                                                </>
                                            ) : (
                                                <>
                                                    <CheckCircle size={24} />
                                                    <span>CONFIRM PAYMENT</span>
                                                </>
                                            )}
                                        </button>
                                        
                                        <div className="mt-4 flex items-center justify-center gap-2 text-xs font-bold text-emerald-600/60 uppercase tracking-tighter">
                                            <CheckCircle size={12} />
                                            Secure Transaction • Instant Settlement
                                        </div>
                                    </div>
                                </div>
                            )}
                        </div>
                        </>
                        ) : (
                                <div className="text-center py-12 flex flex-col items-center justify-center space-y-4">
                                    <div className="p-4 bg-gray-50 rounded-full">
                                        <Receipt size={48} className="text-gray-300" />
                                    </div>
                                    <p className="text-gray-500 font-medium">No invoice details available</p>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            )}

            {/* Credit History Modal */}
            {showCreditHistory && selectedCustomer && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
                    <div className="bg-white rounded-2xl border border-gray-200 w-full max-w-2xl max-h-[90vh] overflow-hidden">
                        <div className="bg-gradient-to-r from-purple-500 to-purple-600 px-6 py-4 flex justify-between items-center">
                            <div>
                                <h2 className="text-2xl font-bold text-white">Credit Payment History</h2>
                                <p className="text-purple-100 text-sm">{selectedCustomer.name}</p>
                            </div>
                            <button
                                onClick={() => {
                                    setShowCreditHistory(false);
                                    setCreditHistory([]);
                                    setCreditHistoryPage(1);
                                    setHasMoreCreditHistory(true);
                                }}
                                className="p-2 hover:bg-white/20 rounded-lg transition-colors"
                            >
                                <X size={24} className="text-white" />
                            </button>
                        </div>
                        <div className="p-6 overflow-y-auto max-h-[calc(90vh-100px)]">
                            {isLoadingHistory ? (
                                <div className="flex items-center justify-center py-12">
                                    <Loader2 className="animate-spin text-purple-500 mr-2" size={32} />
                                    <span className="text-gray-600">Loading history...</span>
                                </div>
                            ) : creditHistory.length > 0 ? (
                                <>
                                    <table className="w-full">
                                        <thead className="bg-gray-50 sticky top-0 z-10">
                                            <tr>
                                                <th className="px-4 py-3 text-left text-sm font-bold text-gray-700">Date</th>
                                                <th className="px-4 py-3 text-left text-sm font-bold text-gray-700">Invoice No</th>
                                                <th className="px-4 py-3 text-right text-sm font-bold text-gray-700">Amount Paid</th>
                                                <th className="px-4 py-3 text-right text-sm font-bold text-gray-700">Remaining Balance</th>
                                            </tr>
                                        </thead>
                                        <tbody className="divide-y divide-gray-200">
                                            {creditHistory.map((item) => (
                                                <tr key={item.id} className="hover:bg-gray-50">
                                                    <td className="px-4 py-3 text-sm text-gray-800">
                                                        {new Date(item.date).toLocaleDateString()}
                                                    </td>
                                                    <td className="px-4 py-3 text-sm font-medium text-gray-900">
                                                        {item.invoiceNumber}
                                                    </td>
                                                    <td className="px-4 py-3 text-sm font-bold text-emerald-600 text-right">
                                                        Rs. {item.amount.toLocaleString()}
                                                    </td>
                                                    <td className="px-4 py-3 text-sm font-semibold text-gray-700 text-right">
                                                        Rs. {item.remainingBalance.toLocaleString()}
                                                    </td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                    <div className="mt-6 flex justify-center">
                                        <button
                                            onClick={loadMoreCreditHistory}
                                            disabled={isLoadingMoreHistory}
                                            className="px-6 py-3 bg-gradient-to-r from-purple-500 to-purple-600 hover:from-purple-600 hover:to-purple-700 text-white font-semibold rounded-lg transition-all shadow-md active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                                        >
                                            {isLoadingMoreHistory ? (
                                                <>
                                                    <Loader2 className="animate-spin" size={20} />
                                                    <span>Loading...</span>
                                                </>
                                            ) : (
                                                <>
                                                    <ChevronRight size={20} />
                                                    <span>Load More</span>
                                                </>
                                            )}
                                        </button>
                                    </div>
                                    {!hasMoreCreditHistory && creditHistory.length > 0 && (
                                        <div className="text-center py-6 mt-4 border-t border-gray-200">
                                            <CheckCircle className="w-8 h-8 mx-auto mb-2 text-purple-500" />
                                            <p className="text-gray-500 text-sm font-medium">All records loaded</p>
                                            <p className="text-gray-400 text-xs mt-1">
                                                Showing {creditHistory.length} payment{creditHistory.length !== 1 ? 's' : ''}
                                            </p>
                                        </div>
                                    )}
                                </>
                            ) : (
                                <div className="text-center py-12 text-gray-500">
                                    <History className="w-16 h-16 mx-auto mb-3 opacity-30" />
                                    <p>No credit payment history found</p>
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