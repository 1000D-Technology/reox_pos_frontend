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


interface Category {
    id: number;
    name: string;
    created_at?: string;
    no?: string;
    categoryname?: string;
    createdon?: string;
}

function ManageCategory() {
    const [newCategoryName, setNewCategoryName] = useState('');
    const [isSaving, setIsSaving] = useState(false);
    const [categories, setCategories] = useState<Category[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [isSearching, setIsSearching] = useState(false);
    const [updateCategoryName, setUpdateCategoryName] = useState('');
    const [isUpdating, setIsUpdating] = useState(false);
    
    // Confirmation modal state
    const [isConfirmModalOpen, setIsConfirmModalOpen] = useState(false);
    const [categoryToDelete, setCategoryToDelete] = useState<Category | null>(null);
    const [isDeleting, setIsDeleting] = useState(false);
    
    // Pagination states
    const [currentPage, setCurrentPage] = useState(1);
    const [itemsPerPage] = useState(10);
    
    // Use categories directly (no more frontend filtering)
    const totalPages = Math.ceil(categories.length / itemsPerPage);
    const startIndex = (currentPage - 1) * itemsPerPage;
    const endIndex = startIndex + itemsPerPage;
    const currentCategories = categories.slice(startIndex, endIndex);
    
    // Transform categories for display
    const salesData: Category[] = currentCategories.map((category, index) => ({
        ...category,
        no: (startIndex + index + 1).toString(),
        categoryname: category.name,
        createdon: category.created_at ? new Date(category.created_at).toLocaleDateString('en-US', {
            year: 'numeric',
            month: '2-digit',
            day: '2-digit'
        }) : '-'
    }));

    // State for controlling the modal visibility
    const [isModalOpen, setIsModalOpen] = useState(false);

    // 2. Specify that the state can be a 'Category' object or 'null'
    const [selectedCategory, setSelectedCategory] = useState<Category | null>(null);

    // 🔹 Selected row state
    const [selectedIndex, setSelectedIndex] = useState(0);

    // Fetch categories from API (regular or search)
    const fetchCategories = async (searchQuery?: string) => {
        try {
            setIsLoading(true);
            
            let response;
            if (searchQuery && searchQuery.trim()) {
                // Use search endpoint
                setIsSearching(true);
                response = await axiosInstance.get(`/api/common/categories/search?q=${encodeURIComponent(searchQuery)}`);
            } else {
                // Use regular endpoint
                setIsSearching(false);
                response = await axiosInstance.get('/api/common/categories');
            }
            
            if (response.data.success) {
                setCategories(response.data.data);
            } else {
                toast.error('Failed to fetch categories');
            }
        } catch (error: any) {
            console.error('Error fetching categories:', error);
            toast.error('Error loading categories. Please try again.');
        } finally {
            setIsLoading(false);
            setIsSearching(false);
        }
    };

    // Load categories on component mount
    useEffect(() => {
        fetchCategories();
    }, []);

    // Handle search with debouncing
    useEffect(() => {
        const timeoutId = setTimeout(() => {
            fetchCategories(searchTerm);
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


    const handleEditClick = (category: Category) => {
        setSelectedCategory(category);
        setUpdateCategoryName(category.name || '');
        setIsModalOpen(true);
    };


    const handleCloseModal = () => {
        setIsModalOpen(false);
        setSelectedCategory(null);
        setUpdateCategoryName('');
        setIsUpdating(false);
    };

    const handleSaveCategory = async () => {
        if (!newCategoryName.trim()) {
            toast.error('Please enter a category name');
            return;
        }

        setIsSaving(true);
        
        const createCategoryPromise = axiosInstance.post('/api/common/categories', {
            name: newCategoryName.trim()
        });

        try {
            await toast.promise(
                createCategoryPromise,
                {
                    loading: 'Adding category...',
                    success: (res) => {
                        setNewCategoryName('');
                        fetchCategories(searchTerm);
                        setCurrentPage(1);
                        return res.data.message || 'Category added successfully!';
                    },
                    error: (err) => {
                        return err.response?.data?.message || 'Failed to add category';
                    }
                }
            );
        } catch (error: any) {
            console.error('Error adding category:', error);
        } finally {
            setIsSaving(false);
        }
    };

    const handleUpdateCategory = async () => {
        if (!updateCategoryName.trim()) {
            toast.error('Please enter a category name');
            return;
        }

        if (!selectedCategory) {
            toast.error('No category selected');
            return;
        }

        setIsUpdating(true);
        
        const updateCategoryPromise = axiosInstance.put(`/api/common/categories/${selectedCategory.id}`, {
            name: updateCategoryName.trim()
        });

        try {
            await toast.promise(
                updateCategoryPromise,
                {
                    loading: 'Updating category...',
                    success: (res) => {
                        handleCloseModal();
                        fetchCategories(searchTerm);
                        return res.data.message || 'Category updated successfully!';
                    },
                    error: (err) => {
                        return err.response?.data?.message || 'Failed to update category';
                    }
                }
            );
        } catch (error: any) {
            console.error('Error updating category:', error);
        } finally {
            setIsUpdating(false);
        }
    };

    // Handle category delete
    const handleDeleteCategory = (category: Category, e: React.MouseEvent) => {
        e.stopPropagation();
        setCategoryToDelete(category);
        setIsConfirmModalOpen(true);
    };

    // Confirm category deletion
    const confirmDeleteCategory = async () => {
        if (!categoryToDelete) return;
        
        setIsDeleting(true);
        
        const deleteCategoryPromise = axiosInstance.delete(`/api/common/categories/${categoryToDelete.id}`);

        try {
            await toast.promise(
                deleteCategoryPromise,
                {
                    loading: 'Deleting category...',
                    success: (res) => {
                        fetchCategories(searchTerm);
                        const newTotalPages = Math.ceil((categories.length - 1) / itemsPerPage);
                        if (currentPage > newTotalPages && newTotalPages > 0) {
                            setCurrentPage(newTotalPages);
                        }
                        return res.data.message || 'Category deleted successfully!';
                    },
                    error: (err) => {
                        return err.response?.data?.message || 'Failed to delete category';
                    }
                }
            );
        } catch (error: any) {
            console.error('Error deleting category:', error);
        } finally {
            setIsDeleting(false);
            setIsConfirmModalOpen(false);
            setCategoryToDelete(null);
        }
    };

    // Cancel category deletion
    const cancelDeleteCategory = () => {
        setIsConfirmModalOpen(false);
        setCategoryToDelete(null);
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
                title="Delete Category"
                message="Are you sure you want to delete this {itemType}"
                itemName={categoryToDelete?.name || ""}
                itemType="category"
                onConfirm={confirmDeleteCategory}
                onCancel={cancelDeleteCategory}
                isLoading={isDeleting}
                confirmButtonText="Delete"
                loadingText="Deleting..."
                isDanger={true}
            />
            
            <div>
                <div className="text-sm text-gray-500 flex items-center">
                    <span>Pages</span>
                    <span className="mx-2">›</span>
                    <span className="text-black">Manage Category</span>
                </div>
                <h1 className="text-3xl font-semibold text-gray-500">Manage Category</h1>
            </div>

            <div className={'flex flex-col bg-white rounded-md  p-4 justify-between gap-8'}>

                <div className={'grid md:grid-cols-5 gap-4'}>  
                    <div>
                        <label htmlFor="search-category"
                            className="block text-sm font-medium text-gray-700 mb-1">Search Category</label>
                        <input 
                            type="text" 
                            id="search-category" 
                            placeholder="Search Category..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="w-full text-sm rounded-md py-2 px-2 border-2 border-gray-100 focus:border-emerald-500 focus:ring-emerald-500" />
                    </div>

                    <div className='md:col-span-2'></div>

                    <div>
                        <label htmlFor="new-category"
                            className="block text-sm font-medium text-gray-700 mb-1">Category Name</label>
                        <input 
                            type="text" 
                            id="new-category" 
                            placeholder="Enter New Category"
                            value={newCategoryName}
                            onChange={(e) => setNewCategoryName(e.target.value)}
                            onKeyDown={(e) => e.key === 'Enter' && handleSaveCategory()}
                            disabled={isSaving}
                            className="w-full text-sm rounded-md py-2 px-2 border-2 border-gray-100 focus:border-emerald-500 focus:ring-emerald-500" />
                    </div>
                    <div className={'grid  md:items-end items-start gap-2 text-white font-medium'}>
                        <button 
                            onClick={handleSaveCategory}
                            disabled={isSaving}
                            className={'bg-emerald-600 py-2 rounded-md flex items-center justify-center hover:bg-emerald-700 disabled:opacity-50 disabled:cursor-not-allowed'}>
                            {isSaving ? 'Saving...' : 'Save Category'}
                        </button>
                    </div>
                </div>

                <div
                    className="overflow-y-auto max-h-md md:h-[320px] lg:h-[690px] rounded-md scrollbar-thin scrollbar-thumb-gray-300 scrollbar-track-gray-100">
                    <table className="min-w-full divide-y divide-gray-200">
                        <thead className="bg-emerald-600 sticky top-0 z-10">
                            <tr>
                                {['#', 'Category Name', 'Created On', 'Actions'].map((header, i, arr) => (
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
                                    <td className="px-6 py-2 whitespace-nowrap text-sm font-medium">{sale.categoryname}</td>
                                    <td className="px-6 py-2 whitespace-nowrap text-sm font-medium">{sale.createdon}</td>
                                    <td className="px-6 py-2 whitespace-nowrap text-sm font-medium">
                                        <div className="flex items-center space-x-2">
                                            <div className="relative group">
                                                <button
                                                    onClick={() => handleEditClick(sale)}
                                                    className="p-2 bg-green-100 rounded-full text-green-700 hover:bg-green-200 transition-colors">
                                                    <Pencil size={15}/>
                                                </button>
                                                <span
                                                    className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 w-max px-2 py-1 text-xs text-white bg-gray-900 rounded-md invisible group-hover:visible opacity-0 group-hover:opacity-100 transition-opacity">
                                                    Edit Category
                                                </span>
                                            </div>

                                            <div className="relative group">
                                                <button
                                                    onClick={(e) => handleDeleteCategory(sale, e)}
                                                    className="p-2 bg-red-100 rounded-full text-red-700 hover:bg-red-200 transition-colors">
                                                    <Trash size={15} />
                                                </button>
                                                <span
                                                    className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 w-max px-2 py-1 text-xs text-white bg-gray-900 rounded-md invisible group-hover:visible opacity-0 group-hover:opacity-100 transition-opacity">
                                                    Delete Category
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
                        Showing {startIndex + 1} to {Math.min(endIndex, categories.length)} of {categories.length} categories
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

            {/* Update Category Modal */}
            {isModalOpen && selectedCategory && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-white/10 backdrop-blur-sm">
                    <div className="bg-white rounded-2xl shadow-xl p-8 w-full max-w-md relative ">
                        <button
                            onClick={handleCloseModal}
                            className="absolute top-4 right-4 text-gray-400 hover:text-gray-600">
                            <X className="w-6 h-6" />
                        </button>

                        <h2 className="text-3xl font-bold text-[#525252] mb-10">Update Category</h2>

                        <div className="space-y-4">
                            <p className="text-sm text-gray-600">
                                Current Category Name :
                                <span className="font-semibold text-teal-600 ml-2">{selectedCategory.categoryname || selectedCategory.name}</span>
                            </p>
                            <div>
                                <label htmlFor="update-category-name" className="block text-sm font-bold text-gray-700 mb-1">
                                    New Category Name
                                </label>
                                <input
                                    type="text"
                                    id="update-category-name"
                                    placeholder="Enter Category Name"
                                    value={updateCategoryName}
                                    onChange={(e) => setUpdateCategoryName(e.target.value)}
                                    onKeyDown={(e) => e.key === 'Enter' && handleUpdateCategory()}
                                    disabled={isUpdating}
                                    className="w-full text-sm rounded-md py-2 px-3 border border-gray-300 focus:border-emerald-500 focus:ring-emerald-500"
                                />
                            </div>
                        </div>

                        <div className="mt-10 flex justify-end">
                            <button 
                                onClick={handleUpdateCategory}
                                disabled={isUpdating}
                                className="w-1/2 bg-emerald-600 text-white font-semibold py-2.5 rounded-lg hover:bg-emerald-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-emerald-500 disabled:opacity-50 disabled:cursor-not-allowed">
                                {isUpdating ? 'Updating...' : 'Update Category'}
                            </button>
                        </div>
                    </div>
                </div>
            )}
            </div>
        </>
    );
}

export default ManageCategory;