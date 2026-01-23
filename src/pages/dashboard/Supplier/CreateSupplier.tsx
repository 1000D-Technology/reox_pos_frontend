import {
    ChevronLeft,
    ChevronRight,
    CirclePlus,
    Pencil,
    X,
    Building2,
    Users,
    Upload,
    Download,
    Loader2
} from 'lucide-react';

import { useEffect, useState } from 'react';
import toast, { Toaster } from 'react-hot-toast';
import { supplierService } from '../../../services/supplierService';
import { companyService } from '../../../services/companyService';
import TypeableSelect from '../../../components/TypeableSelect';

interface Category {
    id: string;
    no: string;
    name: string;
    email: string;
    contact: string;
    company: string;
    companyId: number;
    bank: string;
    bankId: number | null;
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
    const [isCompanyModalOpen, setIsCompanyModalOpen] = useState(false);

    // State for company selection
    const [companies, setCompanies] = useState<{ value: string | number, label: string }[]>([]);
    const [selectedCompany, setSelectedCompany] = useState<{ value: string | number, label: string } | null>(null);

    // State for bank selection
    const [banks, setBanks] = useState<{ value: string | number, label: string }[]>([]);
    const [selectedBank, setSelectedBank] = useState<{ value: string | number, label: string } | null>(null);

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

    // State for controlling the update modal visibility
    const [selectedUpdateCompany, setSelectedUpdateCompany] = useState<{ value: string | number, label: string } | null>(null);
    const [selectedUpdateBank, setSelectedUpdateBank] = useState<{ value: string | number, label: string } | null>(null);
    const [newAccountNumber, setNewAccountNumber] = useState('');
    const [newContactNumber, setNewContactNumber] = useState('');
    const [isUpdatingSupplier, setIsUpdatingSupplier] = useState(false);
    const [isUpdatingContact, setIsUpdatingContact] = useState(false);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [selectedCategory, setSelectedCategory] = useState<Category | null>(null);
    const [selectedIndex, setSelectedIndex] = useState(0);

    // Calculate pagination values
    const totalPages = Math.ceil(totalItems / itemsPerPage);
    const startIndex = (currentPage - 1) * itemsPerPage;
    const endIndex = startIndex + itemsPerPage;
    const currentPageData = salesData.slice(startIndex, endIndex);

    // Handle Up / Down arrow keys
    useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            // Escape to close modals
            if (e.key === "Escape") {
                setIsModalOpen(false);
                setIsCompanyModalOpen(false);
            }

            // Arrow navigation for list
            if (e.key === "ArrowDown") {
                const target = e.target as HTMLElement;
                if (target.tagName !== 'INPUT' && target.tagName !== 'TEXTAREA') {
                    e.preventDefault();
                    setSelectedIndex((prev) => (prev < currentPageData.length - 1 ? prev + 1 : prev));
                }
            } else if (e.key === "ArrowUp") {
                const target = e.target as HTMLElement;
                if (target.tagName !== 'INPUT' && target.tagName !== 'TEXTAREA') {
                    e.preventDefault();
                    setSelectedIndex((prev) => (prev > 0 ? prev - 1 : prev));
                }
            } else if (e.key === "PageDown") {
                const target = e.target as HTMLElement;
                if (target.tagName !== 'INPUT' && target.tagName !== 'TEXTAREA') {
                    e.preventDefault();
                    goToNextPage();
                }
            } else if (e.key === "PageUp") {
                const target = e.target as HTMLElement;
                if (target.tagName !== 'INPUT' && target.tagName !== 'TEXTAREA') {
                    e.preventDefault();
                    goToPreviousPage();
                }
            }

            // Enter key behaviors
            if (e.key === "Enter" && !e.shiftKey) {
                const target = e.target as HTMLElement;
                // Double click simulation on enter
                if (target.tagName !== 'INPUT' && target.tagName !== 'TEXTAREA' && currentPageData[selectedIndex] && !isModalOpen && !isCompanyModalOpen) {
                    handleEditClick(currentPageData[selectedIndex]);
                }
            }

            // Shift + Enter to save
            if (e.key === "Enter" && e.shiftKey) {
                e.preventDefault();
                if (isModalOpen) {
                    handleUpdateContact();
                } else if (isCompanyModalOpen) {
                    handleSubmitCompany();
                } else if (!isSubmittingSupplier) {
                    handleSubmitSupplier();
                }
            }

            // Alt Key Combinations
            if (e.altKey) {
                switch (e.key.toLowerCase()) {
                    case 'e': // Edit
                        e.preventDefault();
                        if (currentPageData[selectedIndex]) {
                            handleEditClick(currentPageData[selectedIndex]);
                        }
                        break;
                    case 'n': // New Company
                        e.preventDefault();
                        setIsCompanyModalOpen(true);
                        break;
                    case 'f': // Focus Name
                        e.preventDefault();
                        document.getElementById('supplier-name-input')?.focus();
                        break;
                }
            }
        };

        window.addEventListener("keydown", handleKeyDown);
        return () => window.removeEventListener("keydown", handleKeyDown);
    }, [currentPageData, isSubmittingSupplier, isModalOpen, isCompanyModalOpen, selectedIndex]);

    const [isImporting, setIsImporting] = useState(false);

    const handleDownloadTemplate = () => {
        const headers = ['Supplier Name', 'Email', 'Contact Number', 'Company', 'Bank', 'Account Number'];
        const exampleRow = ['John Doe', 'john@example.com', '1234567890', 'Tech Corp', 'City Bank', '987654321'];

        const csvContent = [
            headers.join(','),
            exampleRow.join(',')
        ].join('\n');

        const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
        const link = document.createElement('a');
        if (link.download !== undefined) {
            const url = URL.createObjectURL(blob);
            link.setAttribute('href', url);
            link.setAttribute('download', 'supplier_import_template.csv');
            link.style.visibility = 'hidden';
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
        }
    };

    const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files.length > 0) {
            const file = e.target.files[0];
            const formData = new FormData();
            formData.append('file', file);

            setIsImporting(true);
            try {
                // @ts-ignore
                const response = await supplierService.importSuppliers(formData);
                const data = response.data;
                if (data.success) {
                    toast.success(`Imported: ${data.data.successCount}, Skipped: ${data.data.skippedCount}`);
                    if (data.data.errors.length > 0) {
                        data.data.errors.forEach((err: any) => {
                            toast.error(`${err.name}: ${err.error}`, { duration: 5000 });
                        });
                    }
                    // Refresh supplier list
                    const getRes = await supplierService.getSuppliers();
                    if (getRes.data.success) {
                        const transformedData = getRes.data.data.map((supplier: any, index: number) => ({
                            id: supplier.id.toString(),
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
                } else {
                    toast.error(data.message || 'Import failed');
                }
            } catch (error: any) {
                console.error("Import error:", error);
                toast.error(error.response?.data?.message || 'Failed to import suppliers');
            } finally {
                setIsImporting(false);
                // Clear input
                e.target.value = '';
            }
        }
    };

    // Function to search companies and banks
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
            toast.error('Failed to load data');
        } finally {
            // Loading flags were unused
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
                    const transformedData = result.data.map((supplier: any, index: number) => ({
                        id: supplier.id.toString(),
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

    // Generate page numbers to display
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
                pages.push(currentPage - 1);
                pages.push(currentPage);
                pages.push(currentPage + 1);
                pages.push('...');
                pages.push(totalPages);
            }
        }

        return pages;
    };

    const handleSubmitSupplier = async () => {
        if (!supplierData.supplierName.trim()) {
            toast.error('Supplier name is required');
            return;
        }


        if (!supplierData.contactNumber.trim()) {
            toast.error('Contact number is required');
            return;
        }

        if (!selectedCompany) {
            toast.error('Company is required');
            return;
        }

        if (!selectedBank) {
            toast.error('Bank is required');
            return;
        }

        setIsSubmittingSupplier(true);

        try {
            const createSupplierPromise = supplierService.addSupplier({
                supplierName: supplierData.supplierName,
                email: supplierData.email,
                contactNumber: supplierData.contactNumber,
                companyId: typeof selectedCompany.value === 'number' ? selectedCompany.value : parseInt(selectedCompany.value),
                bankId: typeof selectedBank.value === 'number' ? selectedBank.value : parseInt(selectedBank.value),
                accountNumber: supplierData.accountNumber
            });

            await toast.promise(
                createSupplierPromise,
                {
                    loading: 'Creating supplier...',
                    success: (res) => {
                        const response = supplierService.getSuppliers();
                        response.then(result => {
                            if (result.data.success) {
                                const transformedData = result.data.data.map((supplier: any, index: number) => ({
                                    id: supplier.id.toString(),
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
                        });
                        return res.data.message || 'Supplier created successfully!';
                    },
                    error: (err) => err.response?.data?.message || 'Failed to create supplier'
                }
            );

            setSupplierData({
                supplierName: '',
                email: '',
                contactNumber: '',
                accountNumber: ''
            });
            setSelectedCompany(null);
            setSelectedBank(null);

        } catch (error) {
            console.error('Error creating supplier:', error);
        } finally {
            setIsSubmittingSupplier(false);
        }
    };

    const handleSubmitCompany = async () => {
        if (!companyData.name.trim()) {
            toast.error('Company name is required');
            return;
        }

        if (!companyData.contact.trim()) {
            toast.error('Contact number is required');
            return;
        }

        // Sri Lankan mobile number validation for contact
        const sriLankanMobileRegex = /^(\+94|0)?7[0-9]{8}$/;
        if (!sriLankanMobileRegex.test(companyData.contact.replace(/\s/g, ''))) {
            toast.error('Invalid contact number format. Please use a valid Sri Lankan mobile number.');
            return;
        }

        // Email format check - only if provided
        if (companyData.email && companyData.email.trim() !== '') {
            const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
            if (!emailRegex.test(companyData.email)) {
                toast.error('Invalid email format');
                return;
            }
        }

        setIsSubmitting(true);

        try {
            const createCompanyPromise = companyService.createCompany(companyData);

            await toast.promise(
                createCompanyPromise,
                {
                    loading: 'Creating company...',
                    success: (res) => {
                        searchCompaniesAndBanks();
                        return res.data.message || 'Company created successfully!';
                    },
                    error: (err) => err.response?.data?.message || 'Failed to create company'
                }
            );

            setCompanyData({ name: '', email: '', contact: '' });
            setIsCompanyModalOpen(false);

        } catch (error) {
            console.error('Error creating company:', error);
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleUpdateContact = async () => {
        if (!selectedCategory || !newContactNumber.trim()) {
            toast.error('Contact number is required');
            return;
        }

        setIsUpdatingContact(true);

        try {
            const updatePromise = supplierService.updateSupplierContact(
                parseInt(selectedCategory.id),
                newContactNumber
            );

            await toast.promise(
                updatePromise,
                {
                    loading: 'Updating contact...',
                    success: (res) => {
                        const response = supplierService.getSuppliers();
                        response.then(result => {
                            if (result.data.success) {
                                const transformedData = result.data.data.map((supplier: any, index: number) => ({
                                    id: supplier.id.toString(),
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
                        });
                        handleCloseModal();
                        return res.data.message || 'Contact updated successfully!';
                    },
                    error: (err) => err.response?.data?.message || 'Failed to update contact'
                }
            );

        } catch (error) {
            console.error('Error updating contact:', error);
        } finally {
            setIsUpdatingContact(false);
        }
    };

    const handleEditClick = (category: Category) => {
        setSelectedCategory(category);
        setNewContactNumber(category.contact);
        setIsModalOpen(true);
    };

    const handleCloseModal = () => {
        setIsModalOpen(false);
        setSelectedCategory(null);
        setNewContactNumber('');
        setIsUpdatingContact(false);
    };

    const handleCloseCompanyModal = () => {
        setIsCompanyModalOpen(false);
        setCompanyData({ name: '', email: '', contact: '' });
        setIsSubmitting(false);
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
            <div className={"flex flex-col gap-4 h-full"}>
                <div className="flex justify-between items-center mb-1">
                    <div>
                        <div className="text-sm text-gray-400 flex items-center">
                            <span>Suppliers</span>
                            <span className="mx-2">›</span>
                            <span className="text-gray-700 font-medium">Create Supplier</span>
                        </div>
                        <h1 className="text-3xl font-semibold bg-linear-to-r from-gray-800 to-gray-600 bg-clip-text text-transparent">
                            Create New Supplier
                        </h1>
                    </div>

                    <div className="flex gap-4 items-center">
                        

                        <div className="flex gap-2">
                            <button
                                onClick={handleDownloadTemplate}
                                className="flex items-center gap-2 px-3 py-1.5 bg-white border border-gray-200 text-gray-700 hover:bg-gray-50 hover:text-emerald-600 text-xs font-semibold rounded-lg transition-all shadow-sm"
                                title="Download CSV Template"
                            >
                                <Download size={14} />
                                <span>Template</span>
                            </button>
                            <input
                                type="file"
                                accept=".xlsx, .xls, .csv"
                                onChange={handleFileChange}
                                className="hidden"
                                id="supplier-import"
                            />
                            <label
                                htmlFor="supplier-import"
                                className={`flex items-center gap-2 px-3 py-1.5 bg-white border border-gray-200 text-gray-700 hover:bg-gray-50 hover:text-emerald-600 text-xs font-semibold rounded-lg transition-all shadow-sm cursor-pointer ${isImporting ? 'opacity-50 cursor-not-allowed' : ''}`}
                            >
                                {isImporting ? <Loader2 size={14} className="animate-spin text-emerald-600" /> : <Upload size={14} />}
                                <span>{isImporting ? 'Importing...' : 'Import'}</span>
                            </label>
                        </div>
                        {/* Shortcuts Hint Style */}
                        <div className="hidden lg:flex items-center gap-2 bg-white px-4 py-2 rounded-xl border border-gray-100 shadow-sm border-b-2">
                            <div className="flex items-center gap-1.5 px-2 py-1 bg-gray-50 rounded-lg border border-gray-100">
                                <span className="text-[10px] font-black text-gray-500 bg-white px-1.5 py-0.5 rounded shadow-sm border border-gray-200">↑↓</span>
                                <span className="text-[10px] font-bold text-gray-400 uppercase tracking-tight">Navigate</span>
                            </div>
                            <div className="flex items-center gap-1.5 px-2 py-1 bg-gray-50 rounded-lg border border-gray-100">
                                <span className="text-[10px] font-black text-gray-500 bg-white px-1.5 py-0.5 rounded shadow-sm border border-gray-200">ALT+F</span>
                                <span className="text-[10px] font-bold text-gray-400 uppercase tracking-tight">Focus</span>
                            </div>
                            <div className="flex items-center gap-1.5 px-2 py-1 bg-gray-50 rounded-lg border border-gray-100">
                                <span className="text-[10px] font-black text-gray-500 bg-white px-1.5 py-0.5 rounded shadow-sm border border-gray-200">ALT+N</span>
                                <span className="text-[10px] font-bold text-gray-400 uppercase tracking-tight">Company</span>
                            </div>
                            <div className="flex items-center gap-1.5 px-2 py-1 bg-gray-50 rounded-lg border border-gray-100">
                                <span className="text-[10px] font-black text-gray-500 bg-white px-1.5 py-0.5 rounded shadow-sm border border-gray-200">ALT+E</span>
                                <span className="text-[10px] font-bold text-gray-400 uppercase tracking-tight">Edit</span>
                            </div>
                        </div>
                    </div>
                </div>

                <div
                    className={"bg-white rounded-xl p-4 flex flex-col border border-gray-200 shadow-sm"}
                >
                    <div className="flex items-center gap-2 mb-3">
                        <Users className="text-emerald-600" size={20} />
                        <h2 className="text-lg font-semibold text-gray-700">Supplier Information</h2>
                    </div>

                    <div className={"grid md:grid-cols-5 gap-3"}>
                        <div>
                            <label className="block text-[11px] font-bold text-gray-500 uppercase tracking-wider mb-1">
                                Supplier Name
                            </label>
                            <input
                                type="text"
                                id="supplier-name-input"
                                value={supplierData.supplierName}
                                onChange={(e) => setSupplierData({ ...supplierData, supplierName: e.target.value })}
                                placeholder="Supplier Name"
                                className="w-full text-sm rounded-lg py-1.5 px-3 border-2 border-gray-100 focus:border-emerald-500 transition-all outline-none"
                            />
                        </div>
                        <div>
                            <label className="block text-[11px] font-bold text-gray-500 uppercase tracking-wider mb-1">
                                Email (Optional)
                            </label>
                            <input
                                type="email"
                                value={supplierData.email}
                                onChange={(e) => setSupplierData({ ...supplierData, email: e.target.value })}
                                placeholder="Enter Email"
                                className="w-full text-sm rounded-lg py-1.5 px-3 border-2 border-gray-100 focus:border-emerald-500 transition-all outline-none"
                            />
                        </div>
                        <div>
                            <label className="block text-[11px] font-bold text-gray-500 uppercase tracking-wider mb-1">
                                Contact Number
                            </label>
                            <input
                                type="text"
                                value={supplierData.contactNumber}
                                onChange={(e) => setSupplierData({ ...supplierData, contactNumber: e.target.value })}
                                placeholder="Contact Number"
                                className="w-full text-sm rounded-lg py-1.5 px-3 border-2 border-gray-100 focus:border-emerald-500 transition-all outline-none"
                            />
                        </div>
                        <div>
                            <div className="flex justify-between items-center mb-1">
                                <label className="block text-[11px] font-bold text-gray-500 uppercase tracking-wider">
                                    Company
                                </label>
                                <button 
                                    onClick={() => setIsCompanyModalOpen(true)}
                                    className="text-[9px] text-blue-600 hover:text-blue-700 font-bold flex items-center gap-1 bg-blue-50 px-1.5 py-0.5 rounded-full transition-colors"
                                >
                                    <CirclePlus size={8} /> New
                                </button>
                            </div>
                            <TypeableSelect
                                options={companies}
                                value={selectedCompany?.value || null}
                                onChange={(option) => setSelectedCompany(option)}
                                placeholder="Company..."
                            />
                        </div>
                        <div>
                            <label className="block text-[11px] font-bold text-gray-500 uppercase tracking-wider mb-1">
                                Bank
                            </label>
                            <TypeableSelect
                                options={banks}
                                value={selectedBank?.value || null}
                                onChange={(option) => setSelectedBank(option)}
                                placeholder="Bank..."
                            />
                        </div>
                        <div className="flex flex-col">
                            <label className="block text-[11px] font-bold text-gray-500 uppercase tracking-wider mb-1">
                                Account Number
                            </label>
                            <div className="flex gap-2">
                                <input
                                    type="text"
                                    value={supplierData.accountNumber}
                                    onChange={(e) => setSupplierData({ ...supplierData, accountNumber: e.target.value })}
                                    placeholder="Account"
                                    className="flex-1 text-sm rounded-lg py-1.5 px-3 border-2 border-gray-100 focus:border-emerald-500 transition-all outline-none"
                                />
                                
                            </div>
                        </div>
                        <div className="flex flex-col justify-end">
                           
                              <button
                                    onClick={handleSubmitSupplier}
                                    disabled={isSubmittingSupplier}
                                    className={`px-4 py-1.5 bg-gradient-to-r from-emerald-500 to-emerald-600 hover:from-emerald-600 hover:to-emerald-700 text-white text-sm font-bold rounded-lg transition-all shadow-md shadow-emerald-100 ${isSubmittingSupplier ? 'opacity-50 cursor-not-allowed' : ''
                                        }`}
                                >
                                    {isSubmittingSupplier ? '...' : 'Add'}
                                </button>
                        </div>
                      
                    </div>
                </div>

                <div
                    className={"flex flex-col bg-white rounded-xl h-full p-4 justify-between border border-gray-200 shadow-sm"}
                >
                    <div className="flex items-center gap-2 mb-3">
                        <Users className="text-blue-600" size={20} />
                        <h2 className="text-lg font-semibold text-gray-700">Existing Suppliers</h2>
                    </div>
                    <div className="overflow-y-auto max-h-md md:h-[320px] lg:h-[300px] rounded-lg scrollbar-thin scrollbar-thumb-emerald-300 scrollbar-track-gray-100">
                        <table className="min-w-full divide-y divide-gray-200">
                            <thead className="bg-gradient-to-r from-emerald-600 to-emerald-700 sticky top-0 z-10">
                                <tr>
                                    {['No', 'Name', 'Email', 'Contact', 'Company', 'Bank', 'Account', 'Actions'].map((header, i, arr) => (
                                        <th
                                            key={i}
                                            className={`px-6 py-3 text-left text-sm font-medium text-white tracking-wider ${i === 0 ? 'rounded-tl-lg' : i === arr.length - 1 ? 'rounded-tr-lg' : ''
                                                }`}
                                        >
                                            {header}
                                        </th>
                                    ))}
                                </tr>
                            </thead>
                            <tbody className="bg-white divide-y divide-gray-200">
                                {isLoadingSuppliers ? (
                                    <tr>
                                        <td colSpan={8} className="px-6 py-8 text-center text-gray-500">
                                            Loading suppliers...
                                        </td>
                                    </tr>
                                ) : currentPageData.length === 0 ? (
                                    <tr>
                                        <td colSpan={8} className="px-6 py-8 text-center text-gray-500">
                                            No suppliers found
                                        </td>
                                    </tr>
                                ) : (
                                    currentPageData.map((supplier, index) => (
                                        <tr
                                            key={supplier.id}
                                            onClick={() => setSelectedIndex(index)}
                                            onDoubleClick={() => handleEditClick(supplier)}
                                            className={`cursor-pointer transition-colors ${selectedIndex === index
                                                ? "bg-emerald-50 border-l-4 border-emerald-600"
                                                : "hover:bg-emerald-50/50"
                                                }`}
                                        >
                                            <td className="px-6 py-2 whitespace-nowrap text-sm font-medium">{supplier.no}</td>
                                            <td className="px-6 py-2 whitespace-nowrap text-sm font-medium">{supplier.name}</td>
                                            <td className="px-6 py-2 whitespace-nowrap text-sm font-medium">{supplier.email}</td>
                                            <td className="px-6 py-2 whitespace-nowrap text-sm font-medium">{supplier.contact}</td>
                                            <td className="px-6 py-2 whitespace-nowrap text-sm font-medium">{supplier.company}</td>
                                            <td className="px-6 py-2 whitespace-nowrap text-sm font-medium">{supplier.bank}</td>
                                            <td className="px-6 py-2 whitespace-nowrap text-sm font-medium">{supplier.account}</td>
                                            <td className="px-6 py-2 whitespace-nowrap text-sm">
                                                <button
                                                    onClick={(e) => {
                                                        e.stopPropagation();
                                                        handleEditClick(supplier);
                                                    }}
                                                    className="text-emerald-600 hover:text-emerald-800 p-1 rounded transition-colors"
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
                            Showing <span className="font-medium text-emerald-600">{currentPageData.length === 0 ? 0 : startIndex + 1}</span> to <span className="font-medium text-emerald-600">{Math.min(endIndex, totalItems)}</span> of <span className="font-medium text-emerald-600">{totalItems}</span> suppliers
                        </div>
                        <div className="flex items-center space-x-2">
                            <button
                                onClick={goToPreviousPage}
                                disabled={currentPage === 1}
                                className={`flex items-center px-3 py-2 text-sm font-medium rounded-lg transition-all ${currentPage === 1
                                    ? 'text-gray-300 cursor-not-allowed'
                                    : 'text-gray-600 hover:bg-emerald-50 hover:text-emerald-600'
                                    }`}
                            >
                                <ChevronLeft className="mr-1 h-4 w-4" /> Previous
                            </button>

                            {getPageNumbers().map((page, idx) => (
                                typeof page === 'number' ? (
                                    <button
                                        key={idx}
                                        onClick={() => goToPage(page)}
                                        className={`px-4 py-2 text-sm font-medium rounded-lg transition-all ${currentPage === page
                                            ? 'bg-gradient-to-r from-emerald-500 to-emerald-600 text-white'
                                            : 'text-gray-600 hover:bg-emerald-50'
                                            }`}
                                    >
                                        {page}
                                    </button>
                                ) : (
                                    <span key={idx} className="text-gray-400 px-2">...</span>
                                )
                            ))}

                            <button
                                onClick={goToNextPage}
                                disabled={currentPage === totalPages}
                                className={`flex items-center px-3 py-2 text-sm font-medium rounded-lg transition-all ${currentPage === totalPages
                                    ? 'text-gray-300 cursor-not-allowed'
                                    : 'text-gray-600 hover:bg-emerald-50 hover:text-emerald-600'
                                    }`}
                            >
                                Next <ChevronRight className="ml-1 h-4 w-4" />
                            </button>
                        </div>
                    </nav>
                </div>
            </div>

            {/* Add Company Modal */}
            {isCompanyModalOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
                    <div
                        className="bg-white rounded-2xl border border-gray-200 p-8 w-full max-w-md relative"
                    >
                        <button
                            onClick={handleCloseCompanyModal}
                            className="absolute top-4 right-4 p-2 hover:bg-gray-100 rounded-lg transition-colors"
                        >
                            <X size={20} className="text-gray-500" />
                        </button>

                        <div className="flex items-center gap-3 mb-6">
                            <div className="p-3 bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl">
                                <Building2 className="text-white" size={24} />
                            </div>
                            <div>
                                <h3 className="text-xl font-semibold text-gray-800">Add New Company</h3>
                                <p className="text-sm text-gray-500">Create a new company record</p>
                            </div>
                        </div>

                        <div className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    Company Name
                                </label>
                                <input
                                    type="text"
                                    value={companyData.name}
                                    onChange={(e) => setCompanyData({ ...companyData, name: e.target.value })}
                                    placeholder="Enter Company Name"
                                    className="w-full text-sm rounded-lg py-2 px-3 border-2 border-gray-200 focus:border-blue-500 transition-all outline-none"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    Email
                                </label>
                                <input
                                    type="email"
                                    value={companyData.email}
                                    onChange={(e) => setCompanyData({ ...companyData, email: e.target.value })}
                                    placeholder="Enter Email"
                                    className="w-full text-sm rounded-lg py-2 px-3 border-2 border-gray-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition-all outline-none"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    Contact
                                </label>
                                <input
                                    type="text"
                                    value={companyData.contact}
                                    onChange={(e) => setCompanyData({ ...companyData, contact: e.target.value })}
                                    placeholder="Enter Contact"
                                    className="w-full text-sm rounded-lg py-2 px-3 border-2 border-gray-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition-all outline-none"
                                />
                            </div>
                        </div>

                        <div className="mt-8 flex justify-end gap-3">
                            <button
                                onClick={handleCloseCompanyModal}
                                className="px-4 py-2 text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
                            >
                                Cancel
                            </button>
                            <button
                                onClick={handleSubmitCompany}
                                disabled={isSubmitting}
                                className={`px-6 py-2 bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white font-medium rounded-lg shadow-lg shadow-blue-200 transition-all ${isSubmitting ? 'opacity-50 cursor-not-allowed' : ''
                                    }`}
                            >
                                {isSubmitting ? 'Creating...' : 'Create Company'}
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Update Supplier Modal */}
            {isModalOpen && selectedCategory && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
                    <div
                        className="bg-white rounded-2xl shadow-2xl p-8 w-full max-w-md relative"
                    >
                        <button
                            onClick={handleCloseModal}
                            className="absolute top-4 right-4 p-2 hover:bg-gray-100 rounded-lg transition-colors"
                        >
                            <X size={20} className="text-gray-500" />
                        </button>

                        <div className="flex items-center gap-3 mb-6">
                            <div className="p-3 bg-gradient-to-br from-emerald-500 to-emerald-600 rounded-xl">
                                <Pencil className="text-white" size={24} />
                            </div>
                            <div>
                                <h3 className="text-xl font-semibold text-gray-800">Update Supplier</h3>
                                <p className="text-sm text-gray-500">Update contact for {selectedCategory.name}</p>
                            </div>
                        </div>

                        <div className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    Contact Number
                                </label>
                                <input
                                    type="text"
                                    value={newContactNumber}
                                    onChange={(e) => setNewContactNumber(e.target.value)}
                                    placeholder="Enter new contact number"
                                    className="w-full text-sm rounded-lg py-2 px-3 border-2 border-gray-200 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-200 transition-all outline-none"
                                />
                            </div>
                        </div>

                        <div className="mt-8 flex justify-end gap-3">
                            <button
                                onClick={handleCloseModal}
                                className="px-4 py-2 text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
                            >
                                Cancel
                            </button>
                            <button
                                onClick={handleUpdateContact}
                                disabled={isUpdatingContact}
                                className={`px-6 py-2 bg-gradient-to-r from-emerald-500 to-emerald-600 hover:from-emerald-600 hover:to-emerald-700 text-white font-medium rounded-lg shadow-lg shadow-emerald-200 transition-all ${isUpdatingContact ? 'opacity-50 cursor-not-allowed' : ''
                                    }`}
                            >
                                {isUpdatingContact ? 'Updating...' : 'Update Contact'}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </>
    );
}

export default CreateSupplier;