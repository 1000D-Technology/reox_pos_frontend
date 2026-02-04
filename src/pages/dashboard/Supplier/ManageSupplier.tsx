import {
    ChevronLeft,
    ChevronRight,
    Pencil,
    X,
    Users,
    CheckCircle,
    Search,
    ArrowUpRight,
    ArrowDownRight,
    Building2,
    Loader2,
    Phone
} from 'lucide-react';
import TypeableSelect from '../../../components/TypeableSelect';

import { useEffect, useState } from 'react';
import toast, { Toaster } from 'react-hot-toast';
import { supplierService } from '../../../services/supplierService';

interface Category {
    id: string;
    no: string;
    name: string;
    email: string;
    contact: string;
    company: string;
    companyContact: string;
    companyId: number;
    bank: string;
    bankId: number | null;
    account: string;
    status: string;
    statusId: number;
}

function ManageSupplier() {
    const [suppliers, setSuppliers] = useState<Category[]>([]);
    const [filteredSuppliers, setFilteredSuppliers] = useState<Category[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState('');

    const [currentPage, setCurrentPage] = useState(1);
    const [itemsPerPage] = useState(10);
    const [totalPages, setTotalPages] = useState(1);
    const [totalRecords, setTotalRecords] = useState(0);

    // For search results, slice the filtered data for client-side pagination
    const startIndex = (currentPage - 1) * itemsPerPage;
    const endIndex = startIndex + itemsPerPage;
    const currentSuppliers = searchQuery.trim() 
        ? filteredSuppliers.slice(startIndex, endIndex)
        : filteredSuppliers;

    const salesData: Category[] = currentSuppliers.map((supplier, index) => ({
        ...supplier,
        no: (((currentPage - 1) * itemsPerPage) + index + 1).toString()
    }));

    const [newContactNumber, setNewContactNumber] = useState('');
    const [newEmail, setNewEmail] = useState('');
    const [companies, setCompanies] = useState<{ value: string | number, label: string }[]>([]);
    const [selectedCompany, setSelectedCompany] = useState<{ value: string | number, label: string } | null>(null);
    const [banks, setBanks] = useState<{ value: string | number, label: string }[]>([]);
    const [selectedBank, setSelectedBank] = useState<{ value: string | number, label: string } | null>(null);
    const [newAccountNumber, setNewAccountNumber] = useState('');
    const [isUpdatingSupplier, setIsUpdatingSupplier] = useState(false);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [selectedCategory, setSelectedCategory] = useState<Category | null>(null);
    const [selectedIndex, setSelectedIndex] = useState(0);

    // Stats calculation
    const stats = {
        totalSuppliers: suppliers.length,
        activeSuppliers: suppliers.filter(s => s.status === 'Active').length,
        totalCompanies: new Set(suppliers.map(s => s.company)).size
    };

    const summaryCards = [
        {
            icon: Users,
            label: 'Total Suppliers',
            value: stats.totalSuppliers.toString(),
            trend: '+12%',
            color: 'bg-linear-to-br from-emerald-400 to-emerald-500',
            iconColor: 'text-white',
            bgGlow: ''
        },
        {
            icon: CheckCircle,
            label: 'Active Suppliers',
            value: stats.activeSuppliers.toString(),
            trend: '+8%',
            color: 'bg-linear-to-br from-blue-400 to-blue-500',
            iconColor: 'text-white',
            bgGlow: ''
        },
        {
            icon: Building2,
            label: 'Total Companies',
            value: stats.totalCompanies.toString(),
            trend: '+5%',
            color: 'bg-linear-to-br from-purple-400 to-purple-500',
            iconColor: 'text-white',
            bgGlow: ''
        },
    ];

    const handleSearch = (query: string) => {
        setSearchQuery(query);
        setCurrentPage(1);

        if (!query.trim()) {
            fetchSuppliers(1);
            return;
        }

        const lowercaseQuery = query.toLowerCase();
        const filtered = suppliers.filter(supplier =>
            supplier.name.toLowerCase().includes(lowercaseQuery) ||
            supplier.email.toLowerCase().includes(lowercaseQuery) ||
            supplier.contact.toLowerCase().includes(lowercaseQuery) ||
            supplier.company.toLowerCase().includes(lowercaseQuery)
        );

        setFilteredSuppliers(filtered);
        setTotalPages(Math.ceil(filtered.length / itemsPerPage));
        setTotalRecords(filtered.length);
    };

    const fetchSuppliers = async (page: number = currentPage) => {
        try {
            setIsLoading(true);
            const response = await supplierService.getSuppliers(page, itemsPerPage);
            const result = response.data;

            if (result.success && result.data) {
                const transformedData = result.data.map((supplier: any) => ({
                    id: supplier.id.toString(),
                    no: '',
                    name: supplier.supplierName || '',
                    email: supplier.email || '',
                    contact: supplier.contactNumber || '',
                    company: supplier.companyName || '',
                    companyContact: supplier.companyContact || '',
                    companyId: supplier.companyId,
                    bank: supplier.bankName || '',
                    bankId: supplier.bankId,
                    account: supplier.accountNumber || '',
                    status: supplier.status || 'Active',
                    statusId: supplier.status_id || 1
                }));
                setSuppliers(transformedData);
                setFilteredSuppliers(transformedData);
                
                // Handle pagination data with fallbacks
                if (result.pagination) {
                    setTotalPages(result.pagination.totalPages || 1);
                    setTotalRecords(result.pagination.totalRecords || transformedData.length);
                    setCurrentPage(result.pagination.currentPage || 1);
                } else {
                    // Fallback if pagination data is missing
                    setTotalPages(1);
                    setTotalRecords(transformedData.length);
                    setCurrentPage(1);
                }
            } else {
                toast.error('Failed to load suppliers');
            }
        } catch (error) {
            console.error('Error fetching suppliers:', error);
            toast.error('Failed to load suppliers. Please refresh the page.');
        } finally {
            setIsLoading(false);
        }
    };

    const searchCompaniesAndBanks = async () => {
        try {
            const [companiesResponse, banksResponse] = await supplierService.getCompaniesAndBanks();
            if (companiesResponse.data.success) {
                const companyOptions = companiesResponse.data.data.map((company: any) => ({
                    value: company.id.toString(),
                    label: company.company_name
                }));
                setCompanies(companyOptions);
            }

            if (banksResponse.data.success) {
                const bankOptions = banksResponse.data.data.map((bank: any) => ({
                    value: bank.id.toString(),
                    label: bank.bank_name
                }));
                setBanks(bankOptions);
            }
        } catch (error) {
            console.error('Error fetching data:', error);
            toast.error('Failed to load company/bank data');
        }
    };

    useEffect(() => {
        fetchSuppliers();
        searchCompaniesAndBanks();
    }, []);

    useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            if (e.key === "ArrowDown") {
                setSelectedIndex((prev) => (prev < salesData.length - 1 ? prev + 1 : prev));
            } else if (e.key === "ArrowUp") {
                setSelectedIndex((prev) => (prev > 0 ? prev - 1 : prev));
            }
        };

        window.addEventListener("keydown", handleKeyDown);
        return () => window.removeEventListener("keydown", handleKeyDown);
    }, [salesData.length]);

    const handleEditClick = (category: Category) => {
        setSelectedCategory(category);
        setNewContactNumber(category.contact);
        setNewEmail(category.email);
        setSelectedCompany({ value: category.companyId.toString(), label: category.company });
        setSelectedBank(category.bankId ? { value: category.bankId.toString(), label: category.bank } : null);
        setNewAccountNumber(category.account);
        setIsModalOpen(true);
    };

    const handleCloseModal = () => {
        setIsModalOpen(false);
        setSelectedCategory(null);
        setNewContactNumber('');
        setNewEmail('');
        setSelectedCompany(null);
        setSelectedBank(null);
        setNewAccountNumber('');
        setIsUpdatingSupplier(false);
    };

    const handleUpdateSupplier = async () => {
        if (!selectedCategory || !newContactNumber.trim()) {
            toast.error('Please enter a valid contact number');
            return;
        }

        if (newContactNumber.length !== 10) {
            toast.error('Contact number must be exactly 10 digits');
            return;
        }

        if (!selectedCompany) {
            toast.error('Please select a company');
            return;
        }

        setIsUpdatingSupplier(true);
        const updatePromise = supplierService.updateSupplier(
            parseInt(selectedCategory.id),
            {
                contactNumber: newContactNumber.trim(),
                email: newEmail,
                companyId: typeof selectedCompany.value === 'number' ? selectedCompany.value : parseInt(selectedCompany.value as string),
                bankId: selectedBank ? (typeof selectedBank.value === 'number' ? selectedBank.value : parseInt(selectedBank.value as string)) : undefined,
                accountNumber: newAccountNumber.trim()
            }
        );

        try {
            await toast.promise(updatePromise, {
                loading: 'Updating supplier...',
                success: (res) => {
                    handleCloseModal();
                    fetchSuppliers();
                    return res.data.message || 'Supplier updated successfully!';
                },
                error: (err) => err.response?.data?.message || 'Failed to update supplier'
            });
        } catch (error: any) {
            console.error('Error updating supplier:', error);
        } finally {
            setIsUpdatingSupplier(false);
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
                fetchSuppliers(page);
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
    const handleStatusToggle = async (supplierId: string, currentStatusId: number) => {
        try {
            const updatePromise = supplierService.updateSupplierStatus(
                parseInt(supplierId),
                currentStatusId
            );

            await toast.promise(updatePromise, {
                loading: 'Updating status...',
                success: () => {
                    fetchSuppliers();
                    const newStatus = currentStatusId === 1 ? 'deactivated' : 'activated';
                    return `Supplier ${newStatus} successfully!`;
                },
                error: (err) => err.response?.data?.message || 'Failed to update status'
            });
        } catch (error) {
            console.error('Error updating status:', error);
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
                <div>
                    <div className="text-sm text-gray-400 flex items-center">
                        <span>Suppliers</span>
                        <span className="mx-2">›</span>
                        <span className="text-gray-700 font-medium">Manage Supplier</span>
                    </div>
                    <h1 className="text-3xl font-semibold bg-linear-to-r from-gray-800 to-gray-600 bg-clip-text text-transparent">
                        Manage Supplier
                    </h1>
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
                            type="text"
                            value={searchQuery}
                            onChange={(e) => handleSearch(e.target.value)}
                            placeholder="Search suppliers by name, email, contact, or company..."
                            className="w-full pl-10 pr-4 py-2.5 text-sm border-2 border-gray-200 rounded-lg focus:border-emerald-500 transition-all outline-none"
                        />
                    </div>
                </div>

                <div
                    className={'flex flex-col bg-white rounded-xl p-4 justify-between gap-8 border border-gray-200 flex-1 overflow-hidden shadow-sm'}
                >
                    <div
                        className="overflow-auto flex-1 rounded-lg scrollbar-thin scrollbar-thumb-emerald-300 scrollbar-track-gray-100">
                        <table className="min-w-full divide-y divide-gray-200">
                            <thead className="bg-linear-to-r from-emerald-500 to-emerald-600 sticky top-0 z-10">
                                <tr>
                                    {['#', 'Name', 'Email', 'Contact Number', 'Company Name', 'Bank', 'Account Number', 'Status', 'Actions'].map((header, i, arr) => (
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
                                        <td colSpan={9} className="px-6 py-8 text-center">
                                            <div className="flex justify-center items-center">
                                                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-emerald-500"></div>
                                                <span className="ml-3 text-gray-600">Loading suppliers...</span>
                                            </div>
                                        </td>
                                    </tr>
                                ) : salesData.length === 0 ? (
                                    <tr>
                                        <td colSpan={9} className="px-6 py-8 text-center text-gray-500">
                                            No suppliers found
                                        </td>
                                    </tr>
                                ) : (
                                    salesData.map((category, index) => (
                                        <tr
                                            key={category.id}
                                            onClick={() => setSelectedIndex(index)}
                                            className={`cursor-pointer transition-all ${selectedIndex === index
                                                    ? 'bg-emerald-50 border-l-4 border-l-emerald-500'
                                                    : 'hover:bg-gray-50'
                                                }`}
                                        >
                                            <td className="px-6 py-2 whitespace-nowrap text-sm text-gray-600">
                                                {category.no}
                                            </td>
                                            <td className="px-6 py-2 whitespace-nowrap text-sm font-medium text-gray-800">
                                                {category.name}
                                            </td>
                                            <td className="px-6 py-2 whitespace-nowrap text-sm text-gray-600">
                                                {category.email}
                                            </td>
                                            <td className="px-6 py-2 whitespace-nowrap text-sm font-medium text-gray-700">
                                                {category.contact}
                                            </td>
                                            <td className="px-6 py-2 whitespace-nowrap">
                                                <span className="px-3 py-1 text-xs font-semibold rounded-full bg-linear-to-r from-purple-100 to-purple-200 text-purple-800">
                                                    {category.company}
                                                </span>
                                                {category.companyContact && (
                                                    <div className="text-[10px] text-gray-400 mt-1 flex items-center gap-1">
                                                        <Phone size={10} /> {category.companyContact}
                                                    </div>
                                                )}
                                            </td>
                                            <td className="px-6 py-2 whitespace-nowrap">
                                                <span className="px-3 py-1 text-xs font-semibold rounded-full bg-linear-to-r from-blue-100 to-blue-200 text-blue-800">
                                                    {category.bank}
                                                </span>
                                            </td>
                                            <td className="px-6 py-2 whitespace-nowrap text-sm font-medium text-gray-700">
                                                {category.account}
                                            </td>
                                            <td className="px-6 py-2 whitespace-nowrap">
                                                <button
                                                    onClick={(e) => {
                                                        e.stopPropagation();
                                                        handleStatusToggle(category.id, category.statusId);
                                                    }}
                                                    className={`px-4 py-1.5 text-xs font-semibold rounded-full transition-all transform hover:scale-105 ${category.status === 'Active'
                                                            ? 'bg-linear-to-r from-emerald-500 to-emerald-600 text-white hover:from-emerald-600 hover:to-emerald-700'
                                                            : 'bg-linear-to-r from-gray-400 to-gray-500 text-white hover:from-gray-500 hover:to-gray-600'
                                                        }`}
                                                >
                                                    {category.status === 'Active' ? 'Active' : 'Inactive'}
                                                </button>
                                            </td>
                                            <td className="px-6 py-2 whitespace-nowrap text-sm font-medium">
                                                <button
                                                    onClick={(e) => {
                                                        e.stopPropagation();
                                                        handleEditClick(category);
                                                    }}
                                                    className="p-2 bg-linear-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white rounded-lg transition-all"
                                                >
                                                    <Pencil size={16} />
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
                            Showing <span className="font-bold text-gray-800">{salesData.length === 0 ? 0 : ((currentPage - 1) * itemsPerPage) + 1}-{searchQuery.trim() ? Math.min(currentPage * itemsPerPage, filteredSuppliers.length) : Math.min(currentPage * itemsPerPage, totalRecords)}</span> of{' '}
                            <span className="font-bold text-gray-800">{searchQuery.trim() ? filteredSuppliers.length : totalRecords}</span> suppliers
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

            {isModalOpen && selectedCategory && (
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
                                <h2 className="text-xl font-bold text-gray-800">Update Supplier</h2>
                                <p className="text-sm text-gray-500">{selectedCategory.name}</p>
                            </div>
                        </div>

                        <div className="space-y-4">
                            <div>
                                <label htmlFor="update-contact-number" className="block text-sm font-bold text-gray-700 mb-1">
                                    Contact Number
                                </label>
                                <input
                                    type="tel"
                                    id="update-contact-number"
                                    value={newContactNumber}
                                    onChange={(e) => setNewContactNumber(e.target.value)}
                                    placeholder="Enter Contact Number"
                                    className="w-full text-sm rounded-lg py-2 px-3 border-2 border-gray-200 focus:border-emerald-500 transition-all outline-none"
                                    maxLength={10}
                                />
                            </div>

                            <div>
                                <label htmlFor="update-email" className="block text-sm font-bold text-gray-700 mb-1">
                                    Email
                                </label>
                                <input
                                    type="email"
                                    id="update-email"
                                    value={newEmail}
                                    onChange={(e) => setNewEmail(e.target.value)}
                                    placeholder="Enter Email"
                                    className="w-full text-sm rounded-lg py-2 px-3 border-2 border-gray-200 focus:border-emerald-500 transition-all outline-none"
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-bold text-gray-700 mb-1">
                                    Company
                                </label>
                                <TypeableSelect
                                    options={companies}
                                    value={selectedCompany?.value || null}
                                    onChange={(option) => setSelectedCompany(option)}
                                    placeholder="Select Company"
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-bold text-gray-700 mb-1">
                                    Bank
                                </label>
                                <TypeableSelect
                                    options={banks}
                                    value={selectedBank?.value || null}
                                    onChange={(option) => setSelectedBank(option)}
                                    placeholder="Select Bank"
                                />
                            </div>

                            <div>
                                <label htmlFor="update-account-number" className="block text-sm font-bold text-gray-700 mb-1">
                                    Account Number
                                </label>
                                <input
                                    type="text"
                                    id="update-account-number"
                                    value={newAccountNumber}
                                    onChange={(e) => setNewAccountNumber(e.target.value)}
                                    placeholder="Enter Account Number"
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
                                onClick={handleUpdateSupplier}
                                disabled={isUpdatingSupplier}
                                className={`px-6 py-2.5 bg-linear-to-r from-emerald-500 to-emerald-600 hover:from-emerald-600 hover:to-emerald-700 text-white font-semibold rounded-lg transition-all flex items-center justify-center gap-2 ${isUpdatingSupplier ? 'opacity-50 cursor-not-allowed' : ''
                                    }`}
                            >
                                {isUpdatingSupplier ? (
                                    <>
                                        <Loader2 size={18} className="animate-spin" />
                                        Updating...
                                    </>
                                ) : 'Update Supplier'}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </>
    );
}

export default ManageSupplier;