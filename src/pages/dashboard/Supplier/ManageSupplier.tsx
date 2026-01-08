import {
    ChevronLeft,
    ChevronRight,
    Pencil,
    ToggleLeft,

    X,
} from 'lucide-react';

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
    bank: string;
    account: string;
    status: string;
}

function ManageSupplier() {
    // State for supplier data
    const [suppliers, setSuppliers] = useState<Category[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    
    // Pagination state
    const [currentPage, setCurrentPage] = useState(1);
    const [itemsPerPage] = useState(10);
    
    // Calculate pagination values
    const totalPages = Math.ceil(suppliers.length / itemsPerPage);
    const startIndex = (currentPage - 1) * itemsPerPage;
    const endIndex = startIndex + itemsPerPage;
    const currentSuppliers = suppliers.slice(startIndex, endIndex);
    
    // Transform data for display
    const salesData: Category[] = currentSuppliers.map((supplier, index) => ({
        ...supplier,
        no: (startIndex + index + 1).toString(),
        status: 'Active' // Default status since it's not in the backend yet
    }));
    
    // State for updating contact
    const [newContactNumber, setNewContactNumber] = useState('');
    const [isUpdatingContact, setIsUpdatingContact] = useState(false);

    // State for controlling the modal visibility
    const [isModalOpen, setIsModalOpen] = useState(false);

    // 2. Specify that the state can be a 'Category' object or 'null'
    const [selectedCategory, setSelectedCategory] = useState<Category | null>(null);

    // 🔹 Selected row state
    const [selectedIndex, setSelectedIndex] = useState(0);

    // Fetch suppliers data
    const fetchSuppliers = async () => {
        try {
            setIsLoading(true);
            const response = await supplierService.getSuppliers();
            const result = response.data;
            
            if (result.success) {
                // Transform the backend data to match our Category interface
                const transformedData = result.data.map((supplier: any) => ({
                    id: supplier.id.toString(),
                    no: '',
                    name: supplier.supplierName || '',
                    email: supplier.email || '',
                    contact: supplier.contactNumber || '',
                    company: supplier.companyName || '',
                    bank: supplier.bankName || '',
                    account: supplier.accountNumber || '',
                    status: 'Active'
                }));
                setSuppliers(transformedData);
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

    // Load suppliers on component mount
    useEffect(() => {
        fetchSuppliers();
    }, []);

    // 🔹 Handle Up / Down arrow keys
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
        setIsModalOpen(true);
    };

    const handleCloseModal = () => {
        setIsModalOpen(false);
        setSelectedCategory(null);
        setNewContactNumber('');
        setIsUpdatingContact(false);
    };

    const handleUpdateContact = async () => {
        if (!selectedCategory || !newContactNumber.trim()) {
            toast.error('Please enter a valid contact number');
            return;
        }

        if (newContactNumber.length !== 10) {
            toast.error('Contact number must be exactly 10 digits');
            return;
        }

        setIsUpdatingContact(true);
        const updateContactPromise = supplierService.updateSupplierContact(
            parseInt(selectedCategory.id),
            newContactNumber.trim()
        );

        try {
            await toast.promise(updateContactPromise, {
                loading: 'Updating contact number...',
                success: (res) => {
                    handleCloseModal();
                    fetchSuppliers();
                    return res.data.message || 'Contact number updated successfully!';
                },
                error: (err) => err.response?.data?.message || 'Failed to update contact number'
            });
        } catch (error: any) {
            console.error('Error updating contact:', error);
        } finally {
            setIsUpdatingContact(false);
        }
    };

    // Pagination functions
    const goToPage = (page: number) => {
        if (page >= 1 && page <= totalPages) {
            setCurrentPage(page);
            setSelectedIndex(0);
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
                    <div className="text-sm text-gray-500 flex items-center">
                        <span>Pages</span>
                        <span className="mx-2">›</span>
                        <span className="text-black">Manage Supplier</span>
                    </div>
                    <h1 className="text-3xl font-semibold text-gray-500">Manage Supplier</h1>
                </div>

            <div className={'flex flex-col bg-white rounded-md  p-4 justify-between gap-8'}>

                <div
                    className="overflow-y-auto max-h-md md:h-[320px] lg:h-[720px] rounded-md scrollbar-thin scrollbar-thumb-gray-300 scrollbar-track-gray-100">
                    <table className="min-w-full divide-y divide-gray-200">
                        <thead className="bg-emerald-600 sticky top-0 z-10">
                            <tr>
                                {['#', 'Name', 'Email', 'Contact Number', 'Company Name', 'Bank', 'Account Number', 'Status', 'Actions'].map((header, i, arr) => (
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
                            {isLoading ? (
                                <tr>
                                    <td colSpan={9} className="px-6 py-8 text-center text-gray-500">
                                        <div className="flex justify-center items-center">
                                            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-emerald-500"></div>
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
                                salesData.map((sale, index) => (
                                    <tr
                                        key={sale.id}
                                        onClick={() => setSelectedIndex(index)}
                                        className={`cursor-pointer ${
                                            index === selectedIndex
                                                ? "bg-green-100 border-l-4 border-green-600"
                                                : "hover:bg-green-50"
                                        }`}
                                    >
                                        <td className="px-6 py-2 whitespace-nowrap text-sm font-medium">{sale.no}</td>
                                        <td className="px-6 py-2 whitespace-nowrap text-sm font-medium">{sale.name}</td>
                                        <td className="px-6 py-2 whitespace-nowrap text-sm font-medium">{sale.email}</td>
                                        <td className="px-6 py-2 whitespace-nowrap text-sm font-medium">{sale.contact}</td>
                                        <td className="px-6 py-2 whitespace-nowrap text-sm font-medium">{sale.company}</td>
                                        <td className="px-6 py-2 whitespace-nowrap text-sm font-medium">{sale.bank}</td>
                                        <td className="px-6 py-2 whitespace-nowrap text-sm font-medium">{sale.account}</td>
                                        <td className="px-6 py-2 whitespace-nowrap text-sm font-medium text-green-700">{sale.status}</td>
                                        <td className="px-6 py-2 whitespace-nowrap text-sm font-medium">
                                            <div className="flex items-center space-x-2">
                                                <div className="relative group">
                                                    <button
                                                        onClick={(e) => {
                                                            e.stopPropagation();
                                                            handleEditClick(sale);
                                                        }}
                                                        className="p-2 bg-green-100 rounded-full text-green-700 hover:bg-green-200 transition-colors"
                                                    >
                                                        <Pencil size={15} />
                                                    </button>
                                                </div>
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
                        Showing <span className="font-bold text-gray-800">{startIndex + 1}-{Math.min(endIndex, suppliers.length)}</span> of{' '}
                        <span className="font-bold text-gray-800">{suppliers.length}</span> suppliers
                    </div>
                    <div className="flex items-center space-x-2">
                        <button
                            onClick={() => goToPage(currentPage - 1)}
                            disabled={currentPage === 1}
                            className={`flex items-center px-3 py-2 text-sm font-medium rounded-lg transition-all ${
                                currentPage === 1
                                    ? 'text-gray-400 cursor-not-allowed'
                                    : 'text-gray-600 hover:bg-gray-100'
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
                                    className={`px-4 py-2 text-sm font-medium rounded-lg transition-all ${
                                        currentPage === page
                                            ? 'bg-gradient-to-r from-emerald-500 to-emerald-600 text-white shadow-lg shadow-emerald-200'
                                            : 'text-gray-600 hover:bg-gray-100'
                                    }`}
                                >
                                    {page}
                                </button>
                            )
                        )}
                        <button
                            onClick={() => goToPage(currentPage + 1)}
                            disabled={currentPage === totalPages}
                            className={`flex items-center px-3 py-2 text-sm font-medium rounded-lg transition-all ${
                                currentPage === totalPages
                                    ? 'text-gray-400 cursor-not-allowed'
                                    : 'text-gray-600 hover:bg-gray-100'
                            }`}
                        >
                            Next <ChevronRight className="ml-2 h-5 w-5" />
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
                            <p className='text-teal-600'>{selectedCategory.name}</p>
                            <p className="text-sm text-gray-600">
                                Current Supplier Contact Number :
                                <span className="font-semibold text-teal-600 ml-2">{selectedCategory.contact}</span>
                            </p>
                            <div>
                                <label htmlFor="update-contact-number" className="block text-sm font-bold text-gray-700 mb-1">
                                    New Supplier Contact Number
                                </label>
                                <input
                                    type="tel"
                                    id="update-contact-number"
                                    value={newContactNumber}
                                    onChange={(e) => setNewContactNumber(e.target.value)}
                                    placeholder="Enter Supplier Contact Number"
                                    className="w-full text-sm rounded-md py-2 px-3 border border-gray-300 focus:border-emerald-500 focus:ring-emerald-500 appearance-none"
                                    maxLength={10}
                                />
                            </div>
                        </div>

                        <div className="mt-10 flex justify-end gap-3">
                            <button 
                                onClick={handleCloseModal}
                                className="px-6 py-2.5 bg-gray-200 text-gray-700 font-semibold rounded-lg hover:bg-gray-300 transition-all"
                            >
                                Cancel
                            </button>
                            <button 
                                onClick={handleUpdateContact}
                                disabled={isUpdatingContact}
                                className={`px-6 py-2.5 bg-emerald-600 text-white font-semibold rounded-lg hover:bg-emerald-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-emerald-500 transition-all ${
                                    isUpdatingContact ? 'opacity-50 cursor-not-allowed' : ''
                                }`}
                            >
                                {isUpdatingContact ? 'Updating...' : 'Update Contact'}
                            </button>
                        </div>
                    </div>
                </div>
            )}


            </div>
        </>
    );
}
export default ManageSupplier
