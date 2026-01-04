import {
    ChevronLeft,
    ChevronRight,
    CirclePlus,
    Pencil,

    X,
} from 'lucide-react';

import { useEffect, useState } from 'react';
import toast, { Toaster } from 'react-hot-toast';
import { supplierService } from '../../../services/supplierService';
import TypeableSelect from '../../../components/TypeableSelect';


interface Category {
    no: string;
    name: string;
    email: string;
    contact: string;
    company: string;
    bank: string;
    account: string;
}

function CreateSupplier() {
    // State for company form
    const [companyData, setCompanyData] = useState({
        name: '',
        email: '',
        contact: ''
    });
    const [isSubmitting, setIsSubmitting] = useState(false);
    
    // State for company selection
    const [companies, setCompanies] = useState<{value: string, label: string}[]>([]);
    const [selectedCompany, setSelectedCompany] = useState<{value: string, label: string} | null>(null);
    const [isLoadingCompanies, setIsLoadingCompanies] = useState(false);
    
    // State for bank selection
    const [banks, setBanks] = useState<{value: string, label: string}[]>([]);
    const [selectedBank, setSelectedBank] = useState<{value: string, label: string} | null>(null);
    const [isLoadingBanks, setIsLoadingBanks] = useState(false);
    
    // State for supplier form
    const [supplierData, setSupplierData] = useState({
        supplierName: '',
        email: '',
        contactNumber: '',
        accountNumber: ''
    });
    const [isSubmittingSupplier, setIsSubmittingSupplier] = useState(false);

    // Pagination and supplier data state
    const [salesData, setSalesData] = useState<Category[]>([]);
    const [currentPage, setCurrentPage] = useState(1);
    const [itemsPerPage] = useState(10);
    const [totalItems, setTotalItems] = useState(0);
    const [isLoadingSuppliers, setIsLoadingSuppliers] = useState(false);

    // State for controlling the modal visibility
    const [isModalOpen, setIsModalOpen] = useState(false);

    // 2. Specify that the state can be a 'Category' object or 'null'
    const [selectedCategory, setSelectedCategory] = useState<Category | null>(null);

    // 🔹 Selected row state
    const [selectedIndex, setSelectedIndex] = useState(0);

    // Calculate pagination values
    const totalPages = Math.ceil(totalItems / itemsPerPage);
    const startIndex = (currentPage - 1) * itemsPerPage;
    const endIndex = startIndex + itemsPerPage;
    const currentPageData = salesData.slice(startIndex, endIndex);

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

    // Function to search companies and banks
    const searchCompaniesAndBanks = async () => {
        setIsLoadingCompanies(true);
        setIsLoadingBanks(true);
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
            toast.error('Failed to load data');
        } finally {
            setIsLoadingCompanies(false);
            setIsLoadingBanks(false);
        }
    };

    // Load companies and banks on component mount
    useEffect(() => {
        searchCompaniesAndBanks();
    }, []);

    // Fetch suppliers data
    useEffect(() => {
        const fetchSuppliers = async () => {
            setIsLoadingSuppliers(true);
            try {
                const response = await supplierService.getSuppliers();
                const result = response.data;
                
                if (result.success) {
                    // Transform the backend data to match our Category interface
                    const transformedData = result.data.map((supplier: any, index: number) => ({
                        no: (index + 1).toString(),
                        name: supplier.supplierName || '',
                        email: supplier.email || '',
                        contact: supplier.contactNumber || '',
                        company: supplier.companyName || '',
                        bank: supplier.bankName || '',
                        account: supplier.accountNumber || '',
                    }));
                    setSalesData(transformedData);
                    setTotalItems(transformedData.length);
                } else {
                    toast.error('Failed to load suppliers');
                }
            } catch (error) {
                console.error('Error fetching suppliers:', error);
                toast.error('Failed to load suppliers. Please refresh the page.');
            } finally {
                setIsLoadingSuppliers(false);
            }
        };

        fetchSuppliers();
    }, []);

    // Pagination handlers
    const goToPage = (page: number) => {
        if (page >= 1 && page <= totalPages) {
            setCurrentPage(page);
            setSelectedIndex(0); // Reset selection to first item
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

    // Generate page numbers to display
    const getPageNumbers = () => {
        const pages = [];
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
                pages.push(currentPage - 1);
                pages.push(currentPage);
                pages.push(currentPage + 1);
                pages.push('...');
                pages.push(totalPages);
            }
        }
        
        return pages;
    };


    const handleEditClick = (category: Category) => {
        setSelectedCategory(category);
        setIsModalOpen(true);
    };


    const handleCloseModal = () => {
        setIsModalOpen(false);
        setSelectedCategory(null);
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
                    <span className="text-black">Create Supplier</span>
                </div>
                <h1 className="text-3xl font-semibold text-gray-500">Create Supplier</h1>
            </div>

            <div className={'flex flex-col bg-white rounded-md  p-4 justify-between gap-8'}>

                <div className={'grid md:grid-cols-5 gap-4'}>
                    <div>
                        <label htmlFor="supplier-name"
                            className="block text-sm font-medium text-gray-700 mb-1">Name <span className="text-red-500">*</span></label>
                        <input 
                            type="text" 
                            id="supplier-name" 
                            placeholder="Enter supplier name"
                            value={supplierData.supplierName}
                            onChange={(e) => setSupplierData({...supplierData, supplierName: e.target.value})}
                            className="w-full text-sm rounded-md py-2 px-2 border-2 border-gray-100 focus:border-emerald-500 focus:ring-emerald-500" 
                        />
                    </div>

                    <div>
                        <label htmlFor="supplier-email"
                            className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                        <input 
                            type="email" 
                            id="supplier-email" 
                            placeholder="Enter supplier email"
                            value={supplierData.email}
                            onChange={(e) => setSupplierData({...supplierData, email: e.target.value})}
                            className="w-full text-sm rounded-md py-2 px-2 border-2 border-gray-100 focus:border-emerald-500 focus:ring-emerald-500" 
                        />
                    </div>

                    <div>
                        <label htmlFor="supplier-contact"
                            className="block text-sm font-medium text-gray-700 mb-1">Contact Number <span className="text-red-500">*</span></label>
                        <input 
                            type="text" 
                            id="supplier-contact" 
                            placeholder="Enter contact number (10 digits)"
                            value={supplierData.contactNumber}
                            onChange={(e) => setSupplierData({...supplierData, contactNumber: e.target.value})}
                            className="w-full text-sm rounded-md py-2 px-2 border-2 border-gray-100 focus:border-emerald-500 focus:ring-emerald-500" 
                        />
                    </div>

                    <div>
                        <div className='flex justify-between items-center'>
                            <label htmlFor="search-category" className="block text-sm font-medium text-gray-700 mb-1">Company Name</label>

                            <details className="relative">
                                <summary className="list-none">
                                    <CirclePlus className='text-green-700 hover:bg-green-200 rounded-full p-1 cursor-pointer' size={18} />
                                </summary>

                                {/* Modal built with <details> so no new hooks are required */}
                                <div className="fixed inset-0 z-50 flex items-center justify-center bg-white/10 backdrop-blur-sm">
                                    <div className="bg-white rounded-2xl shadow-xl p-6 w-full max-w-md relative">
                                        <button
                                            type="button"
                                            onClick={(e) => (e.currentTarget.closest('details') as HTMLDetailsElement).removeAttribute('open')}
                                            className="absolute top-3 right-3 text-gray-400 hover:text-gray-600">
                                            <X className="w-5 h-5" />
                                        </button>

                                        <h3 className="text-lg font-semibold mb-4">Add Company</h3>

                                        <div className="space-y-3">
                                            <div>
                                                <label htmlFor="new-company-name" className="block text-sm font-medium text-gray-700 mb-1">
                                                    Company Name <span className="text-red-500">*</span>
                                                </label>
                                                <input
                                                    id="new-company-name"
                                                    type="text"
                                                    placeholder="Enter company name"
                                                    value={companyData.name}
                                                    onChange={(e) => setCompanyData({...companyData, name: e.target.value})}
                                                    className="w-full text-sm rounded-md py-2 px-3 border border-gray-300 focus:border-emerald-500 focus:ring-emerald-500"
                                                />
                                            </div>

                                            <div>
                                                <label htmlFor="new-company-email" className="block text-sm font-medium text-gray-700 mb-1">
                                                    Email
                                                </label>
                                                <input
                                                    id="new-company-email"
                                                    type="email"
                                                    placeholder="Enter company email"
                                                    value={companyData.email}
                                                    onChange={(e) => setCompanyData({...companyData, email: e.target.value})}
                                                    className="w-full text-sm rounded-md py-2 px-3 border border-gray-300 focus:border-emerald-500 focus:ring-emerald-500"
                                                />
                                            </div>

                                            <div>
                                                <label htmlFor="new-company-contact" className="block text-sm font-medium text-gray-700 mb-1">
                                                    Contact Number <span className="text-red-500">*</span>
                                                </label>
                                                <input
                                                    id="new-company-contact"
                                                    type="text"
                                                    placeholder="Enter contact number (e.g., 0771234567)"
                                                    value={companyData.contact}
                                                    onChange={(e) => setCompanyData({...companyData, contact: e.target.value})}
                                                    className="w-full text-sm rounded-md py-2 px-3 border border-gray-300 focus:border-emerald-500 focus:ring-emerald-500"
                                                />
                                            </div>
                                            <div>
                                                <label htmlFor="new-company-email" className="block text-sm font-medium text-gray-700 mb-1">
                                                    Contact Number
                                                </label>
                                                <input
                                                    id="new-company-email"
                                                    type="number"
                                                    placeholder="Enter company Contact Number"
                                                    className="w-full text-sm rounded-md py-2 px-3 border border-gray-300 focus:border-emerald-500 focus:ring-emerald-500"
                                                />
                                            </div>
                                        </div>

                                        <div className="mt-6 flex justify-end gap-2">
                                            <button
                                                type="button"
                                                disabled={isSubmitting}
                                                onClick={async (e) => {
                                                    // Capture modal reference before async operations
                                                    const detailsElement = e.currentTarget.closest('details') as HTMLDetailsElement;
                                                    
                                                    // Basic validation
                                                    if (!companyData.name.trim()) {
                                                        toast.error('Company name is required');
                                                        return;
                                                    }
                                                    
                                                    if (!companyData.contact.trim()) {
                                                        toast.error('Contact number is required');
                                                        return;
                                                    }

                                                    setIsSubmitting(true);

                                                    try {
                                                        const createCompanyPromise = supplierService.createCompany({
                                                            name: companyData.name.trim(),
                                                            email: companyData.email.trim() || undefined,
                                                            contact: companyData.contact.trim()
                                                        });

                                                        toast.loading('Creating company...');

                                                        const response = await createCompanyPromise;
                                                        toast.dismiss();
                                                        
                                                        if (response.data.success) {
                                                            toast.success(response.data.message || 'Company created successfully!');
                                                            
                                                            // Reset form
                                                            setCompanyData({ name: '', email: '', contact: '' });
                                                            
                                                            // Refresh companies list
                                                            searchCompaniesAndBanks();
                                                            
                                                            // Close modal using captured reference
                                                            if (detailsElement) {
                                                                detailsElement.removeAttribute('open');
                                                            }
                                                        } else {
                                                            toast.error(response.data.message || 'Failed to create company');
                                                        }

                                                    } catch (error: any) {
                                                        console.error('Error creating company:', error);
                                                        toast.dismiss();
                                                        
                                                        if (error.response?.data?.message) {
                                                            toast.error(error.response.data.message);
                                                        } else {
                                                            toast.error('Failed to create company. Please try again.');
                                                        }
                                                    } finally {
                                                        setIsSubmitting(false);
                                                    }
                                                }}
                                                className={`py-2 px-4 rounded-md font-semibold text-white ${
                                                    isSubmitting 
                                                        ? 'bg-gray-400 cursor-not-allowed' 
                                                        : 'bg-emerald-600 hover:bg-emerald-700'
                                                }`}>
                                                {isSubmitting ? 'Creating...' : 'Save Company'}
                                            </button>

                                            <button
                                                type="button"
                                                disabled={isSubmitting}
                                                onClick={(e) => {
                                                    setCompanyData({ name: '', email: '', contact: '' });
                                                    (e.currentTarget.closest('details') as HTMLDetailsElement).removeAttribute('open');
                                                }}
                                                className="py-2 px-4 rounded-md border hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed">
                                                Cancel
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            </details>
                        </div>
                        
                        <TypeableSelect
                            options={companies}
                            value={selectedCompany?.value || null}
                            onChange={(opt) => {
                                if (opt) {
                                    setSelectedCompany({
                                        value: String(opt.value),
                                        label: opt.label,
                                    });
                                } else {
                                    setSelectedCompany(null);
                                }
                            }}
                            placeholder="Type to search company"
                            allowCreate={false}
                        />
                      
                    </div>

                    <div>
                        <label htmlFor="new-category"
                            className="block text-sm font-medium text-gray-700 mb-1">Bank</label>
                        <TypeableSelect
                            options={banks}
                            value={selectedBank?.value || null}
                            onChange={(opt) => {
                                if (opt) {
                                    setSelectedBank({
                                        value: String(opt.value),
                                        label: opt.label,
                                    });
                                } else {
                                    setSelectedBank(null);
                                }
                            }}
                            placeholder="Type to search bank"
                            allowCreate={false}
                        />
                    </div>

                    <div>
                        <label htmlFor="account-number"
                            className="block text-sm font-medium text-gray-700 mb-1">Account Number</label>
                        <input 
                            type="text" 
                            id="account-number" 
                            placeholder="Enter account number"
                            value={supplierData.accountNumber}
                            onChange={(e) => setSupplierData({...supplierData, accountNumber: e.target.value})}
                            className="w-full text-sm rounded-md py-2 px-2 border-2 border-gray-100 focus:border-emerald-500 focus:ring-emerald-500" 
                        />
                    </div>

                </div>

                <div className={'flex justify-end border-b-1 mt-[-13px]'}>
                    <button 
                        onClick={async () => {
                            // Validation
                            if (!supplierData.supplierName.trim()) {
                                toast.error('Supplier name is required');
                                return;
                            }
                            
                            if (!supplierData.contactNumber.trim()) {
                                toast.error('Contact number is required');
                                return;
                            }
                            
                            if (supplierData.contactNumber.length !== 10) {
                                toast.error('Contact number must be exactly 10 digits');
                                return;
                            }
                            
                            if (!selectedCompany) {
                                toast.error('Please select a company');
                                return;
                            }

                            setIsSubmittingSupplier(true);

                            try {
                                toast.loading('Creating supplier...');

                                const response = await supplierService.addSupplier({
                                    supplierName: supplierData.supplierName.trim(),
                                    email: supplierData.email.trim() || undefined,
                                    contactNumber: supplierData.contactNumber.trim(),
                                    companyId: parseInt(selectedCompany.value),
                                    bankId: selectedBank ? parseInt(selectedBank.value) : undefined,
                                    accountNumber: supplierData.accountNumber.trim() || undefined
                                });

                                toast.dismiss();
                                
                                if (response.data.success) {
                                    toast.success(response.data.message || 'Supplier created successfully!');
                                    
                                    // Reset form
                                    setSupplierData({ 
                                        supplierName: '', 
                                        email: '', 
                                        contactNumber: '', 
                                        accountNumber: '' 
                                    });
                                    setSelectedCompany(null);
                                    setSelectedBank(null);
                                    
                                    // Refresh suppliers list
                                    const fetchSuppliers = async () => {
                                        try {
                                            const response = await supplierService.getSuppliers();
                                            const result = response.data;
                                            
                                            if (result.success) {
                                                const transformedData = result.data.map((supplier: any, index: number) => ({
                                                    no: (index + 1).toString(),
                                                    name: supplier.supplierName || '',
                                                    email: supplier.email || '',
                                                    contact: supplier.contactNumber || '',
                                                    company: supplier.companyName || '',
                                                    bank: supplier.bankName || '',
                                                    account: supplier.accountNumber || '',
                                                }));
                                                setSalesData(transformedData);
                                                setTotalItems(transformedData.length);
                                            }
                                        } catch (error) {
                                            console.error('Error refreshing suppliers:', error);
                                        }
                                    };
                                    fetchSuppliers();
                                } else {
                                    toast.error(response.data.message || 'Failed to create supplier');
                                }

                            } catch (error: any) {
                                console.error('Error creating supplier:', error);
                                toast.dismiss();
                                
                                if (error.response?.data?.message) {
                                    toast.error(error.response.data.message);
                                } else {
                                    toast.error('Failed to create supplier. Please try again.');
                                }
                            } finally {
                                setIsSubmittingSupplier(false);
                            }
                        }}
                        disabled={isSubmittingSupplier}
                        className={`py-2 px-10 rounded-md font-semibold text-white mb-4 ${
                            isSubmittingSupplier 
                                ? 'bg-gray-400 cursor-not-allowed' 
                                : 'bg-emerald-600 hover:bg-emerald-700'
                        }`}>
                        {isSubmittingSupplier ? 'Creating...' : 'Save Supplier'}
                    </button>
                </div>

                <div
                    className="overflow-y-auto max-h-md md:h-[320px] lg:h-[500px] rounded-md scrollbar-thin scrollbar-thumb-gray-300 scrollbar-track-gray-100">
                    <table className="min-w-full divide-y divide-gray-200">
                        <thead className="bg-emerald-600 sticky top-0 z-10">
                            <tr>
                                {['#', 'Name', 'Email', 'Contact Number','Company Name','Bank','Account Number','Actions'].map((header, i, arr) => (
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
                            {isLoadingSuppliers ? (
                                <tr>
                                    <td colSpan={8} className="px-6 py-8 text-center">
                                        <div className="flex items-center justify-center space-x-2">
                                            <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-emerald-600"></div>
                                            <span className="text-gray-500">Loading suppliers...</span>
                                        </div>
                                    </td>
                                </tr>
                            ) : currentPageData.length === 0 ? (
                                <tr>
                                    <td colSpan={8} className="px-6 py-8 text-center text-gray-500">
                                        No suppliers found
                                    </td>
                                </tr>
                            ) : (
                                currentPageData.map((sale, index) => (
                                    <tr
                                        key={index}
                                        onClick={() => setSelectedIndex(index)}
                                        className={`cursor-pointer ${index === selectedIndex
                                            ? "bg-green-100 border-l-4 border-green-600"
                                            : "hover:bg-green-50"
                                            }`}
                                    >
                                        <td className="px-6 py-2 whitespace-nowrap text-sm font-medium">{startIndex + index + 1}</td>
                                        <td className="px-6 py-2 whitespace-nowrap text-sm font-medium">{sale.name}</td>
                                        <td className="px-6 py-2 whitespace-nowrap text-sm font-medium">{sale.email}</td>
                                        <td className="px-6 py-2 whitespace-nowrap text-sm font-medium">{sale.contact}</td>
                                        <td className="px-6 py-2 whitespace-nowrap text-sm font-medium">{sale.company}</td>
                                        <td className="px-6 py-2 whitespace-nowrap text-sm font-medium">{sale.bank}</td>
                                        <td className="px-6 py-2 whitespace-nowrap text-sm font-medium">{sale.account}</td>
                                        <td className="px-6 py-2 whitespace-nowrap text-sm font-medium">
                                            <div className="flex items-center space-x-2">
                                                <div className="relative group">
                                                    <button
                                                        onClick={() => handleEditClick(sale)}
                                                        className="p-2 bg-green-100 rounded-full text-green-700 hover:bg-green-200 transition-colors">
                                                        <Pencil size={15} />
                                                    </button>
                                                    <span
                                                        className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 w-max px-2 py-1 text-xs text-white bg-gray-900 rounded-md invisible group-hover:visible opacity-0 group-hover:opacity-100 transition-opacity">
                                                        Edit Supplier
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

                <nav className="bg-white flex items-center justify-between px-4 py-3 sm:px-6">
                    <div className="hidden sm:flex sm:flex-1 sm:items-center sm:justify-between">
                        <div>
                            <p className="text-sm text-gray-700">
                                Showing {startIndex + 1} to {Math.min(endIndex, totalItems)} of {totalItems} results
                            </p>
                        </div>
                        
                        <div className="flex items-center space-x-2">
                            <button 
                                onClick={goToPreviousPage}
                                disabled={currentPage === 1}
                                className={`flex items-center px-3 py-2 text-sm font-medium rounded-md ${
                                    currentPage === 1 
                                        ? 'text-gray-400 cursor-not-allowed' 
                                        : 'text-gray-500 hover:text-gray-700 hover:bg-gray-100'
                                }`}
                            >
                                <ChevronLeft className="mr-2 h-4 w-4" />
                                Previous
                            </button>

                            {getPageNumbers().map((pageNum, index) => (
                                pageNum === '...' ? (
                                    <span key={`ellipsis-${index}`} className="px-3 py-2 text-gray-500">
                                        ...
                                    </span>
                                ) : (
                                    <button
                                        key={pageNum}
                                        onClick={() => goToPage(Number(pageNum))}
                                        className={`px-3 py-2 text-sm font-medium rounded-md ${
                                            currentPage === pageNum
                                                ? 'bg-emerald-600 text-white'
                                                : 'text-gray-500 hover:bg-gray-100'
                                        }`}
                                    >
                                        {pageNum}
                                    </button>
                                )
                            ))}

                            <button 
                                onClick={goToNextPage}
                                disabled={currentPage === totalPages}
                                className={`flex items-center px-3 py-2 text-sm font-medium rounded-md ${
                                    currentPage === totalPages 
                                        ? 'text-gray-400 cursor-not-allowed' 
                                        : 'text-gray-500 hover:text-gray-700 hover:bg-gray-100'
                                }`}
                            >
                                Next
                                <ChevronRight className="ml-2 h-4 w-4" />
                            </button>
                        </div>
                    </div>
                    
                    {/* Mobile pagination */}
                    <div className="flex flex-1 justify-between sm:hidden">
                        <button
                            onClick={goToPreviousPage}
                            disabled={currentPage === 1}
                            className={`relative inline-flex items-center px-4 py-2 text-sm font-medium rounded-md ${
                                currentPage === 1 
                                    ? 'text-gray-400 cursor-not-allowed' 
                                    : 'text-gray-500 hover:text-gray-700'
                            }`}
                        >
                            Previous
                        </button>
                        <button
                            onClick={goToNextPage}
                            disabled={currentPage === totalPages}
                            className={`relative inline-flex items-center px-4 py-2 ml-3 text-sm font-medium rounded-md ${
                                currentPage === totalPages 
                                    ? 'text-gray-400 cursor-not-allowed' 
                                    : 'text-gray-500 hover:text-gray-700'
                            }`}
                        >
                            Next
                        </button>
                    </div>
                </nav>
            </div>

            {/* Update Category Modal */}
            {isModalOpen && selectedCategory && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-white/10 backdrop-blur-sm">
                    <div className="bg-white rounded-2xl shadow-xl p-8 w-full max-w-md relative ">
                        <button
                            onClick={handleCloseModal}
                            className="absolute top-4 right-4 text-gray-400 hover:text-gray-600">
                            <X className="w-6 h-6" />
                        </button>

                        <h2 className="text-3xl font-bold text-[#525252] mb-10">Update Supplier</h2>

                        <div className="space-y-2">
                            <p className='text-teal-600'>Saman</p>
                            <p className="text-sm text-gray-600">
                                Current Supplier Contact Number :
                                <span className="font-semibold text-teal-600 ml-2">{selectedCategory.name}</span>
                            </p>
                            <div>
                                <label htmlFor="update-category-name" className="block text-sm font-bold text-gray-700 mb-1">
                                    New Supplier Contact Number
                                </label>
                                <input
                                    type="text"
                                    id="update-category-name"
                                    placeholder="Enter Supplier Contact Number"
                                    className="w-full text-sm rounded-md py-2 px-3 border border-gray-300 focus:border-emerald-500 focus:ring-emerald-500"
                                />
                            </div>
                        </div>

                        <div className="mt-10 flex justify-end">
                            <button className="w-1/2  bg-emerald-600 text-white font-semibold py-2.5 rounded-lg hover:bg-emerald-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-emerald-500">
                                Update Contact
                            </button>
                        </div>
                    </div>
                </div>
            )}


            </div>
        </>
    );
}
export default CreateSupplier
