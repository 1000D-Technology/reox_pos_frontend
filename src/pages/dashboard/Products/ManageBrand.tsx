import {
    ChevronLeft,
    ChevronRight,
    Pencil,
    Trash,
    X,
} from 'lucide-react';

import { useEffect, useState } from 'react';
import toast, { Toaster } from 'react-hot-toast';
import axiosInstance from '../../../api/axiosInstance';
import ConfirmationModal from '../../../components/modals/ConfirmationModal';


interface Brand {
    id: number;
    name: string;
    created_at?: string;
    no?: string;
    brandname?: string;
    createdon?: string;
}

function ManageBrand() {
    const [newBrandName, setNewBrandName] = useState('');
    const [isSaving, setIsSaving] = useState(false);
    const [brands, setBrands] = useState<Brand[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [isSearching, setIsSearching] = useState(false);
    const [updateBrandName, setUpdateBrandName] = useState('');
    const [isUpdating, setIsUpdating] = useState(false);
    
    // Confirmation modal state
    const [isConfirmModalOpen, setIsConfirmModalOpen] = useState(false);
    const [brandToDelete, setBrandToDelete] = useState<Brand | null>(null);
    const [isDeleting, setIsDeleting] = useState(false);
    
    // Pagination states
    const [currentPage, setCurrentPage] = useState(1);
    const [itemsPerPage] = useState(10);
    
    // Use brands directly (no more frontend filtering)
    const totalPages = Math.ceil(brands.length / itemsPerPage);
    const startIndex = (currentPage - 1) * itemsPerPage;
    const endIndex = startIndex + itemsPerPage;
    const currentBrands = brands.slice(startIndex, endIndex);
    
    // Transform brands for display
    const salesData: Brand[] = currentBrands.map((brand, index) => ({
        ...brand,
        no: (startIndex + index + 1).toString(),
        brandname: brand.name,
        createdon: brand.created_at ? new Date(brand.created_at).toLocaleDateString('en-US', {
            year: 'numeric',
            month: '2-digit',
            day: '2-digit'
        }) : '-'
    }));

    // State for controlling the modal visibility
    const [isModalOpen, setIsModalOpen] = useState(false);

    // 2. Specify that the state can be a 'Brand' object or 'null'
    const [selectedBrand, setSelectedBrand] = useState<Brand | null>(null);

    // 🔹 Selected row state
    const [selectedIndex, setSelectedIndex] = useState(0);

    // Fetch brands from API (regular or search)
    const fetchBrands = async (searchQuery?: string) => {
        try {
            setIsLoading(true);
            
            let response;
            if (searchQuery && searchQuery.trim()) {
                // Use search endpoint
                setIsSearching(true);
                response = await axiosInstance.get(`/api/common/brands/search?q=${encodeURIComponent(searchQuery)}`);
            } else {
                // Use regular endpoint
                setIsSearching(false);
                response = await axiosInstance.get('/api/common/brands');
            }
            
            if (response.data.success) {
                setBrands(response.data.data);
            } else {
                toast.error('Failed to fetch brands');
            }
        } catch (error: any) {
            console.error('Error fetching brands:', error);
            toast.error('Error loading brands. Please try again.');
        } finally {
            setIsLoading(false);
            setIsSearching(false);
        }
    };

    // Load brands on component mount
    useEffect(() => {
        fetchBrands();
    }, []);

    // Handle search with debouncing
    useEffect(() => {
        const timeoutId = setTimeout(() => {
            fetchBrands(searchTerm);
            setCurrentPage(1); // Reset to first page when searching
        }, 300); // 300ms debounce

        return () => clearTimeout(timeoutId);
    }, [searchTerm]);

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

    const handleEditClick = (brand: Brand) => {
        setSelectedBrand(brand);
        setUpdateBrandName(brand.name || '');
        setIsModalOpen(true);
    };

    const handleCloseModal = () => {
        setIsModalOpen(false);
        setSelectedBrand(null);
        setUpdateBrandName('');
        setIsUpdating(false);
    };

    const handleSaveBrand = async () => {
        if (!newBrandName.trim()) {
            toast.error('Please enter a brand name');
            return;
        }

        setIsSaving(true);
        
        const createBrandPromise = axiosInstance.post('/api/common/brands', {
            name: newBrandName.trim()
        });

        try {
            await toast.promise(
                createBrandPromise,
                {
                    loading: 'Adding brand...',
                    success: (res) => {
                        setNewBrandName('');
                        fetchBrands(searchTerm);
                        setCurrentPage(1);
                        return res.data.message || 'Brand added successfully!';
                    },
                    error: (err) => {
                        return err.response?.data?.message || 'Failed to add brand';
                    }
                }
            );
        } catch (error: any) {
            console.error('Error adding brand:', error);
        } finally {
            setIsSaving(false);
        }
    };

    const handleUpdateBrand = async () => {
        if (!updateBrandName.trim()) {
            toast.error('Please enter a brand name');
            return;
        }

        if (!selectedBrand) {
            toast.error('No brand selected');
            return;
        }

        setIsUpdating(true);
        
        const updateBrandPromise = axiosInstance.put(`/api/common/brands/${selectedBrand.id}`, {
            name: updateBrandName.trim()
        });

        try {
            await toast.promise(
                updateBrandPromise,
                {
                    loading: 'Updating brand...',
                    success: (res) => {
                        handleCloseModal();
                        fetchBrands(searchTerm);
                        return res.data.message || 'Brand updated successfully!';
                    },
                    error: (err) => {
                        return err.response?.data?.message || 'Failed to update brand';
                    }
                }
            );
        } catch (error: any) {
            console.error('Error updating brand:', error);
        } finally {
            setIsUpdating(false);
        }
    };

    // Handle brand delete
    const handleDeleteBrand = (brand: Brand, e: React.MouseEvent) => {
        e.stopPropagation();
        setBrandToDelete(brand);
        setIsConfirmModalOpen(true);
    };

    // Confirm brand deletion
    const confirmDeleteBrand = async () => {
        if (!brandToDelete) return;
        
        setIsDeleting(true);
        
        const deleteBrandPromise = axiosInstance.delete(`/api/common/brands/${brandToDelete.id}`);

        try {
            await toast.promise(
                deleteBrandPromise,
                {
                    loading: 'Deleting brand...',
                    success: (res) => {
                        fetchBrands(searchTerm);
                        const newTotalPages = Math.ceil((brands.length - 1) / itemsPerPage);
                        if (currentPage > newTotalPages && newTotalPages > 0) {
                            setCurrentPage(newTotalPages);
                        }
                        return res.data.message || 'Brand deleted successfully!';
                    },
                    error: (err) => {
                        return err.response?.data?.message || 'Failed to delete brand';
                    }
                }
            );
        } catch (error: any) {
            console.error('Error deleting brand:', error);
        } finally {
            setIsDeleting(false);
            setIsConfirmModalOpen(false);
            setBrandToDelete(null);
        }
    };

    // Cancel brand deletion
    const cancelDeleteBrand = () => {
        setIsConfirmModalOpen(false);
        setBrandToDelete(null);
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
                }}
            />
            <div className={'flex flex-col gap-4 h-full'}>
            <ConfirmationModal
                isOpen={isConfirmModalOpen}
                title="Delete Brand"
                message="Are you sure you want to delete this {itemType}"
                itemName={brandToDelete?.name || ""}
                itemType="brand"
                onConfirm={confirmDeleteBrand}
                onCancel={cancelDeleteBrand}
                isLoading={isDeleting}
                confirmButtonText="Delete"
                loadingText="Deleting..."
                isDanger={true}
            />
            
            <div>
                <div className="text-sm text-gray-500 flex items-center">
                    <span>Pages</span>
                    <span className="mx-2">›</span>
                    <span className="text-black">Manage Brand</span>
                </div>
                <h1 className="text-3xl font-semibold text-gray-500">Manage Brand</h1>
            </div>

            <div className={'flex flex-col bg-white rounded-md  p-4 justify-between gap-8'}>

                <div className={'grid md:grid-cols-5 gap-4 '}>
                    <div>
                        <label htmlFor="search-brand"
                               className="block text-sm font-medium text-gray-700 mb-1">Search Brand</label>
                        <input 
                            type="text" 
                            id="search-brand" 
                            placeholder="Search Brand..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="w-full text-sm rounded-md py-2 px-2 border-2 border-gray-100 focus:border-emerald-500 focus:ring-emerald-500" />
                    </div>

                    <div className='md:col-span-2'></div>

                    <div>
                        <label htmlFor="new-brand"
                               className="block text-sm font-medium text-gray-700 mb-1">Brand Name</label>
                        <input 
                            type="text" 
                            id="new-brand" 
                            placeholder="Enter New Brand Name"
                            value={newBrandName}
                            onChange={(e) => setNewBrandName(e.target.value)}
                            onKeyDown={(e) => e.key === 'Enter' && handleSaveBrand()}
                            disabled={isSaving}
                            className="w-full text-sm rounded-md py-2 px-2 border-2 border-gray-100 focus:border-emerald-500 focus:ring-emerald-500" />
                    </div>
                    <div className={'grid  md:items-end items-start gap-2 text-white font-medium'}>
                        <button 
                            onClick={handleSaveBrand}
                            disabled={isSaving}
                            className={'bg-emerald-600 py-2 rounded-md flex items-center justify-center hover:bg-emerald-700 disabled:opacity-50 disabled:cursor-not-allowed'}>
                            {isSaving ? 'Saving...' : 'Save Brand'}
                        </button>
                    </div>
                </div>

                <div
                    className="overflow-y-auto max-h-md md:h-[320px] lg:h-[690px] rounded-md scrollbar-thin scrollbar-thumb-gray-300 scrollbar-track-gray-100">
                    <table className="min-w-full divide-y divide-gray-200">
                        <thead className="bg-emerald-600 sticky top-0 z-10">
                        <tr>
                            {['#', 'Brand Name', 'Created On', 'Actions'].map((header, i, arr) => (
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
                        {salesData.map((sale, index) => (
                            <tr
                                key={index}
                                onClick={() => setSelectedIndex(index)}
                                className={`cursor-pointer ${index === selectedIndex
                                    ? "bg-green-100 border-l-4 border-green-600"
                                    : "hover:bg-green-50"
                                }`}
                            >
                                <td className="px-6 py-2 whitespace-nowrap text-sm font-medium">{sale.no}</td>
                                <td className="px-6 py-2 whitespace-nowrap text-sm font-medium">{sale.brandname}</td>
                                <td className="px-6 py-2 whitespace-nowrap text-sm font-medium">{sale.createdon}</td>
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
                                                Edit Brand
                                            </span>
                                        </div>

                                        <div className="relative group">
                                            <button
                                                onClick={(e) => handleDeleteBrand(sale, e)}
                                                className="p-2 bg-red-100 rounded-full text-red-700 hover:bg-red-200 transition-colors">
                                                <Trash size={15}/>
                                            </button>
                                            <span
                                                className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 w-max px-2 py-1 text-xs text-white bg-gray-900 rounded-md invisible group-hover:visible opacity-0 group-hover:opacity-100 transition-opacity">
                                                Delete Brand
                                            </span>
                                        </div>
                                    </div>
                                </td>
                            </tr>
                        ))}
                        </tbody>
                    </table>
                </div>

                <nav className="bg-white flex items-center justify-between sm:px-6 pt-4">
                    <div className="text-sm text-gray-500">
                        Showing {startIndex + 1} to {Math.min(endIndex, brands.length)} of {brands.length} brands
                        {searchTerm && <span className="ml-2 text-emerald-600">(filtered by: "{searchTerm}")</span>}
                    </div>
                    <div className="flex items-center space-x-2">
                        <button 
                            onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                            disabled={currentPage === 1}
                            className="flex items-center px-2 py-2 text-sm font-medium text-gray-500 hover:text-gray-700 disabled:opacity-50 disabled:cursor-not-allowed">
                            <ChevronLeft className="mr-2 h-5 w-5" /> Previous
                        </button>
                        
                        {/* Page numbers */}
                        {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                            let pageNum;
                            if (totalPages <= 5) {
                                pageNum = i + 1;
                            } else if (currentPage <= 3) {
                                pageNum = i + 1;
                            } else if (currentPage >= totalPages - 2) {
                                pageNum = totalPages - 4 + i;
                            } else {
                                pageNum = currentPage - 2 + i;
                            }
                            
                            return (
                                <button
                                    key={pageNum}
                                    onClick={() => setCurrentPage(pageNum)}
                                    className={`px-4 py-2 border text-sm font-medium rounded-md ${
                                        currentPage === pageNum
                                            ? 'border-gray-300 text-gray-700 bg-white'
                                            : 'border-transparent text-gray-500 hover:bg-gray-100'
                                    }`}
                                >
                                    {pageNum}
                                </button>
                            );
                        })}
                        
                        {totalPages > 5 && currentPage < totalPages - 2 && (
                            <span className="text-gray-500 px-2">...</span>
                        )}
                        
                        <button 
                            onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
                            disabled={currentPage === totalPages || totalPages === 0}
                            className="flex items-center px-2 py-2 text-sm font-medium text-gray-500 hover:text-gray-700 disabled:opacity-50 disabled:cursor-not-allowed">
                            Next <ChevronRight className="ml-2 h-5 w-5" />
                        </button>
                    </div>
                </nav>
            </div>

            {/* Update Brand Modal */}
            {isModalOpen && selectedBrand && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-white/10 backdrop-blur-sm">
                    <div className="bg-white rounded-2xl shadow-xl p-8 w-full max-w-md relative ">
                        <button
                            onClick={handleCloseModal}
                            className="absolute top-4 right-4 text-gray-400 hover:text-gray-600">
                            <X className="w-6 h-6" />
                        </button>

                        <h2 className="text-3xl font-bold text-[#525252] mb-10">Update Brand</h2>

                        <div className="space-y-4">
                            <p className="text-sm text-gray-600">
                                Current Brand Name :
                                <span className="font-semibold text-teal-600 ml-2">{selectedBrand.brandname || selectedBrand.name}</span>
                            </p>
                            <div>
                                <label htmlFor="update-brand-name" className="block text-sm font-bold text-gray-700 mb-1">
                                    New Brand Name
                                </label>
                                <input
                                    type="text"
                                    id="update-brand-name"
                                    placeholder="Enter Brand Name"
                                    value={updateBrandName}
                                    onChange={(e) => setUpdateBrandName(e.target.value)}
                                    onKeyDown={(e) => e.key === 'Enter' && handleUpdateBrand()}
                                    disabled={isUpdating}
                                    className="w-full text-sm rounded-md py-2 px-3 border border-gray-300 focus:border-emerald-500 focus:ring-emerald-500"
                                />
                            </div>
                        </div>

                        <div className="mt-10 flex justify-end">
                            <button 
                                onClick={handleUpdateBrand}
                                disabled={isUpdating}
                                className="w-1/2 bg-emerald-600 text-white font-semibold py-2.5 rounded-lg hover:bg-emerald-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-emerald-500 disabled:opacity-50 disabled:cursor-not-allowed">
                                {isUpdating ? 'Updating...' : 'Update Brand'}
                            </button>
                        </div>
                    </div>
                </div>
            )}
            </div>
        </>
    );
}

export default ManageBrand;