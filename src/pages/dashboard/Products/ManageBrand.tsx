import {
    ChevronLeft,
    ChevronRight,
    Pencil,
    Trash,
    X,
} from 'lucide-react';
import { useEffect, useState } from 'react';
import toast, { Toaster } from 'react-hot-toast';
import { brandService } from '../../../services/brandService';
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
    const [isLoading, setIsLoading] = useState(false);
    const [searchTerm, setSearchTerm] = useState('');
    const [updateBrandName, setUpdateBrandName] = useState('');
    const [isUpdating, setIsUpdating] = useState(false);
    const [isConfirmModalOpen, setIsConfirmModalOpen] = useState(false);
    const [brandToDelete, setBrandToDelete] = useState<Brand | null>(null);
    const [isDeleting, setIsDeleting] = useState(false);
    const [currentPage, setCurrentPage] = useState(1);
    const [itemsPerPage] = useState(10);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [selectedBrand, setSelectedBrand] = useState<Brand | null>(null);
    const [selectedIndex, setSelectedIndex] = useState(0);
    const [isInitialMount, setIsInitialMount] = useState(true);

    const totalPages = Math.ceil(brands.length / itemsPerPage);
    const startIndex = (currentPage - 1) * itemsPerPage;
    const endIndex = startIndex + itemsPerPage;
    const currentBrands = brands.slice(startIndex, endIndex);

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

    const fetchBrands = async (searchQuery?: string) => {
        try {
            setIsLoading(true);
            let response;
            if (searchQuery && searchQuery.trim()) {
                response = await brandService.searchBrands(searchQuery);
            } else {
                response = await brandService.getBrands();
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
        }
    };

    useEffect(() => {
        fetchBrands();
    }, []);

    useEffect(() => {
        // Skip the search effect on initial mount
        if (isInitialMount) {
            setIsInitialMount(false);
            return;
        }

        const timeoutId = setTimeout(() => {
            fetchBrands(searchTerm);
            setCurrentPage(1);
        }, 300);

        return () => clearTimeout(timeoutId);
    }, [searchTerm]);

    useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            // Escape to close modals
            if (e.key === "Escape") {
                setIsModalOpen(false);
                setIsConfirmModalOpen(false);
            }

            // Arrow navigation for list
            if (e.key === "ArrowDown") {
                const target = e.target as HTMLElement;
                if (target.tagName !== 'INPUT' && target.tagName !== 'TEXTAREA') {
                    e.preventDefault();
                    setSelectedIndex((prev) => (prev < salesData.length - 1 ? prev + 1 : prev));
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
                    goToPage(currentPage + 1);
                }
            } else if (e.key === "PageUp") {
                const target = e.target as HTMLElement;
                if (target.tagName !== 'INPUT' && target.tagName !== 'TEXTAREA') {
                    e.preventDefault();
                    goToPage(currentPage - 1);
                }
            }

            // Enter key behaviors
            if (e.key === "Enter" && !e.shiftKey) {
                const target = e.target as HTMLElement;
                // Double click simulation on enter
                if (target.tagName !== 'INPUT' && target.tagName !== 'TEXTAREA' && salesData[selectedIndex] && !isModalOpen) {
                    handleEditClick(salesData[selectedIndex]);
                }
            }

            // Shift + Enter to save in Edit Modal
            if (e.key === "Enter" && e.shiftKey && isModalOpen) {
                e.preventDefault();
                if (!isUpdating) {
                    handleUpdateBrand();
                }
            }

            // Alt Key Combinations
            if (e.altKey) {
                switch (e.key.toLowerCase()) {
                    case 'e': // Edit
                        e.preventDefault();
                        if (salesData[selectedIndex]) {
                            handleEditClick(salesData[selectedIndex]);
                        }
                        break;
                    case 'd': // Delete
                        e.preventDefault();
                        if (salesData[selectedIndex]) {
                            handleDeleteBrand(salesData[selectedIndex], { stopPropagation: () => {} } as any);
                        }
                        break;
                    case 's': // Search Focus
                        e.preventDefault();
                        document.getElementById('brand-search')?.focus();
                        break;
                    case 'a': // Add Input Focus
                        e.preventDefault();
                        document.getElementById('brand-add')?.focus();
                        break;
                }
            }
        };

        window.addEventListener("keydown", handleKeyDown);
        return () => window.removeEventListener("keydown", handleKeyDown);
    }, [salesData, isModalOpen, isUpdating, selectedIndex, currentPage, itemsPerPage]);

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

    const handleKeyPress = (e: React.KeyboardEvent<HTMLInputElement>) => {
        if (e.key === 'Enter' && !isSaving) {
            e.preventDefault();
            handleSaveBrand();
        }
    };

    const handleSaveBrand = async () => {
        if (!newBrandName.trim()) {
            toast.error('Please enter a brand name');
            return;
        }

        setIsSaving(true);
        const createBrandPromise = brandService.createBrand({
            name: newBrandName.trim()
        });

        try {
            await toast.promise(createBrandPromise, {
                loading: 'Adding brand...',
                success: (res) => {
                    setNewBrandName('');
                    fetchBrands(searchTerm);
                    setCurrentPage(1);
                    return res.data.message || 'Brand added successfully!';
                },
                error: (err) => err.response?.data?.message || 'Failed to add brand'
            });
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
        const updateBrandPromise = brandService.updateBrand(selectedBrand.id, {
            name: updateBrandName.trim()
        });

        try {
            await toast.promise(updateBrandPromise, {
                loading: 'Updating brand...',
                success: (res) => {
                    handleCloseModal();
                    fetchBrands(searchTerm);
                    return res.data.message || 'Brand updated successfully!';
                },
                error: (err) => err.response?.data?.message || 'Failed to update brand'
            });
        } catch (error: any) {
            console.error('Error updating brand:', error);
        } finally {
            setIsUpdating(false);
        }
    };

    const handleDeleteBrand = (brand: Brand, e: React.MouseEvent) => {
        e.stopPropagation();
        setBrandToDelete(brand);
        setIsConfirmModalOpen(true);
    };

    const confirmDeleteBrand = async () => {
        if (!brandToDelete) return;

        setIsDeleting(true);
        const deleteBrandPromise = brandService.deleteBrand(brandToDelete.id);

        try {
            await toast.promise(deleteBrandPromise, {
                loading: 'Deleting brand...',
                success: (res) => {
                    fetchBrands(searchTerm);
                    const newTotalPages = Math.ceil((brands.length - 1) / itemsPerPage);
                    if (currentPage > newTotalPages && newTotalPages > 0) {
                        setCurrentPage(newTotalPages);
                    }
                    return res.data.message || 'Brand deleted successfully!';
                },
                error: (err) => err.response?.data?.message || 'Failed to delete brand'
            });
        } catch (error: any) {
            console.error('Error deleting brand:', error);
        } finally {
            setIsDeleting(false);
            setIsConfirmModalOpen(false);
            setBrandToDelete(null);
        }
    };

    const cancelDeleteBrand = () => {
        setIsConfirmModalOpen(false);
        setBrandToDelete(null);
    };

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

                <div className="flex justify-between items-center mb-4">
                    <div>
                        <div className="text-sm text-gray-400 flex items-center">
                            <span>Products</span>
                            <span className="mx-2">›</span>
                            <span className="text-gray-700 font-medium">Manage Brand</span>
                        </div>
                        <h1 className="text-3xl font-semibold bg-linear-to-r from-gray-800 to-gray-600 bg-clip-text text-transparent">
                            Manage Brand
                        </h1>
                    </div>

                    {/* Shortcuts Hint Style */}
                    <div className="hidden lg:flex items-center gap-2 bg-white px-4 py-2 rounded-xl border border-gray-100 shadow-sm border-b-2">
                        <div className="flex items-center gap-1.5 px-2 py-1 bg-gray-50 rounded-lg border border-gray-100">
                            <span className="text-[10px] font-black text-gray-500 bg-white px-1.5 py-0.5 rounded shadow-sm border border-gray-200">↑↓</span>
                            <span className="text-[10px] font-bold text-gray-400 uppercase tracking-tight">Navigate</span>
                        </div>
                        <div className="flex items-center gap-1.5 px-2 py-1 bg-gray-50 rounded-lg border border-gray-100">
                            <span className="text-[10px] font-black text-gray-500 bg-white px-1.5 py-0.5 rounded shadow-sm border border-gray-200">ALT+A</span>
                            <span className="text-[10px] font-bold text-gray-400 uppercase tracking-tight">Add</span>
                        </div>
                        <div className="flex items-center gap-1.5 px-2 py-1 bg-gray-50 rounded-lg border border-gray-100">
                            <span className="text-[10px] font-black text-gray-500 bg-white px-1.5 py-0.5 rounded shadow-sm border border-gray-200">ALT+E</span>
                            <span className="text-[10px] font-bold text-gray-400 uppercase tracking-tight">Edit</span>
                        </div>
                        <div className="flex items-center gap-1.5 px-2 py-1 bg-gray-50 rounded-lg border border-gray-100">
                            <span className="text-[10px] font-black text-gray-500 bg-white px-1.5 py-0.5 rounded shadow-sm border border-gray-200">ALT+D</span>
                            <span className="text-[10px] font-bold text-gray-400 uppercase tracking-tight">Delete</span>
                        </div>
                        <div className="flex items-center gap-1.5 px-2 py-1 bg-gray-50 rounded-lg border border-gray-100">
                            <span className="text-[10px] font-black text-gray-500 bg-white px-1.5 py-0.5 rounded shadow-sm border border-gray-200">ALT+S</span>
                            <span className="text-[10px] font-bold text-gray-400 uppercase tracking-tight">Search</span>
                        </div>
                    </div>
                </div>

                <div
                    className={'flex flex-col bg-white rounded-xl p-6 justify-between gap-6 border border-gray-200'}
                >
                    <div className={'grid md:grid-cols-5 gap-4'}>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Search Brand</label>
                            <input
                                type="text"
                                id="brand-search"
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                placeholder="Search brands..."
                                className="w-full text-sm rounded-lg py-2 px-3 border-2 border-gray-200 focus:border-emerald-400 focus:outline-none transition-all"
                            />
                        </div>

                        <div className='md:col-span-2'></div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Brand Name</label>
                            <input
                                type="text"
                                id="brand-add"
                                value={newBrandName}
                                onChange={(e) => setNewBrandName(e.target.value)}
                                onKeyPress={handleKeyPress}
                                placeholder="Enter brand name..."
                                className="w-full text-sm rounded-lg py-2 px-3 border-2 border-gray-200 focus:border-emerald-400 focus:outline-none transition-all"
                            />
                        </div>
                        <div className={'grid md:items-end items-start gap-2 text-white font-medium'}>
                            <button
                                onClick={handleSaveBrand}
                                disabled={isSaving}
                                className={`bg-gradient-to-r from-emerald-500 to-emerald-600 hover:from-emerald-600 hover:to-emerald-700 py-2 rounded-lg shadow-lg shadow-emerald-200 hover:shadow-xl transition-all ${isSaving ? 'opacity-50 cursor-not-allowed' : ''
                                    }`}
                            >
                                {isSaving ? 'Adding...' : 'Add Brand'}
                            </button>
                        </div>
                    </div>

                    <div className="overflow-y-auto max-h-md md:h-[320px] lg:h-[400px] rounded-lg scrollbar-thin scrollbar-thumb-emerald-300 scrollbar-track-gray-100">
                        <table className="min-w-full divide-y divide-gray-200">
                            <thead className="bg-gradient-to-r from-emerald-500 to-emerald-600 sticky top-0 z-10">
                                <tr>
                                    {['No', 'Brand Name', 'Created On', 'Actions'].map((header, i, arr) => (
                                        <th
                                            key={i}
                                            className={`px-6 py-3 text-left text-xs font-medium text-white uppercase tracking-wider ${i === 0 ? 'rounded-tl-lg' : i === arr.length - 1 ? 'rounded-tr-lg' : ''
                                                }`}
                                        >
                                            {header}
                                        </th>
                                    ))}
                                </tr>
                            </thead>
                            <tbody className="bg-white divide-y divide-gray-200">
                                {isLoading ? (
                                    <tr>
                                        <td colSpan={4} className="px-6 py-8 text-center text-gray-500">
                                            <div className="flex justify-center items-center">
                                                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-emerald-500"></div>
                                            </div>
                                        </td>
                                    </tr>
                                ) : salesData.length === 0 ? (
                                    <tr>
                                        <td colSpan={4} className="px-6 py-8 text-center text-gray-500">
                                            No brands found
                                        </td>
                                    </tr>
                                ) : (
                                    salesData.map((brand, index) => (
                                        <tr
                                            key={brand.id}
                                            className={`hover:bg-emerald-50 transition-colors cursor-pointer ${index === selectedIndex ? 'bg-emerald-100 border-l-4 border-emerald-500' : ''
                                                }`}
                                            onClick={() => setSelectedIndex(index)}
                                            onDoubleClick={() => handleEditClick(brand)}
                                        >
                                            <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                                                {brand.no}
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700 font-medium">
                                                {brand.brandname}
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                                {brand.createdon}
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                                                <div className="flex gap-2">
                                                    <button
                                                        onClick={() => handleEditClick(brand)}
                                                        className="p-2 bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white rounded-lg shadow-md hover:shadow-lg transition-all"
                                                    >
                                                        <Pencil size={16} />
                                                    </button>
                                                    <button
                                                        onClick={(e) => handleDeleteBrand(brand, e)}
                                                        className="p-2 bg-gradient-to-r from-red-500 to-red-600 hover:from-red-600 hover:to-red-700 text-white rounded-lg shadow-md hover:shadow-lg transition-all"
                                                    >
                                                        <Trash size={16} />
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
                            Showing <span className="font-bold text-gray-800">{startIndex + 1}-{Math.min(endIndex, brands.length)}</span> of{' '}
                            <span className="font-bold text-gray-800">{brands.length}</span> brands
                        </div>
                        <div className="flex items-center space-x-2">
                            <button
                                onClick={() => goToPage(currentPage - 1)}
                                disabled={currentPage === 1}
                                className={`flex items-center px-3 py-2 text-sm font-medium rounded-lg transition-all ${currentPage === 1
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
                                        className={`px-4 py-2 text-sm font-medium rounded-lg transition-all ${currentPage === page
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
                                className={`flex items-center px-3 py-2 text-sm font-medium rounded-lg transition-all ${currentPage === totalPages
                                        ? 'text-gray-400 cursor-not-allowed'
                                        : 'text-gray-600 hover:bg-gray-100'
                                    }`}
                            >
                                Next <ChevronRight className="ml-2 h-5 w-5" />
                            </button>
                        </div>
                    </nav>
                </div>

                {isModalOpen && selectedBrand && (
                    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
                        <div
                            className="bg-white rounded-2xl shadow-2xl p-8 w-full max-w-md relative"
                        >
                            <button
                                onClick={handleCloseModal}
                                className="absolute top-4 right-4 p-2 hover:bg-gray-100 rounded-full transition-all"
                            >
                                <X size={20} className="text-gray-600" />
                            </button>

                            <h2 className="text-2xl font-bold text-gray-800 mb-6">Update Brand</h2>

                            <div className="mb-6">
                                <label className="block text-sm font-medium text-gray-700 mb-2">Brand Name</label>
                                <input
                                    type="text"
                                    value={updateBrandName}
                                    onChange={(e) => setUpdateBrandName(e.target.value)}
                                    placeholder="Enter brand name..."
                                    className="w-full text-sm rounded-lg py-3 px-4 border-2 border-gray-200 focus:border-emerald-400 focus:outline-none transition-all"
                                />
                            </div>

                            <div className="flex gap-3">
                                <button
                                    onClick={handleCloseModal}
                                    className="flex-1 py-3 bg-gray-100 hover:bg-gray-200 text-gray-700 font-medium rounded-lg transition-all"
                                >
                                    Cancel
                                </button>
                                <button
                                    onClick={handleUpdateBrand}
                                    disabled={isUpdating}
                                    className={`flex-1 py-3 bg-gradient-to-r from-emerald-500 to-emerald-600 hover:from-emerald-600 hover:to-emerald-700 text-white font-medium rounded-lg shadow-lg shadow-emerald-200 hover:shadow-xl transition-all ${isUpdating ? 'opacity-50 cursor-not-allowed' : ''
                                        }`}
                                >
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