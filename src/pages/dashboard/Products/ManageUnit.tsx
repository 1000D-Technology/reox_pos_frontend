import {
    ChevronLeft,
    ChevronRight,
    Pencil,
    Plus,
    RefreshCw,
    SearchCheck,
    Trash,
    X,
} from 'lucide-react';
import { useEffect, useState } from 'react';
import toast, { Toaster } from 'react-hot-toast';
import { motion } from 'framer-motion';
import axiosInstance from '../../../api/axiosInstance';
import ConfirmationModal from '../../../components/modals/ConfirmationModal';

interface Unit {
    id: number;
    name: string;
    created_at?: string;
    no?: string;
    unitName?: string;
    createdOn?: string;
}

function ManageUnit() {
    const [newUnitName, setNewUnitName] = useState('');
    const [isSaving, setIsSaving] = useState(false);
    const [units, setUnits] = useState<Unit[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [isSearching, setIsSearching] = useState(false);
    const [updateUnitName, setUpdateUnitName] = useState('');
    const [isUpdating, setIsUpdating] = useState(false);
    const [isDeleting, setIsDeleting] = useState(false);
    const [unitToDelete, setUnitToDelete] = useState<Unit | null>(null);
    const [currentPage, setCurrentPage] = useState(1);
    const [itemsPerPage] = useState(10);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [selectedUnit, setSelectedUnit] = useState<Unit | null>(null);
    const [selectedIndex, setSelectedIndex] = useState(0);

    const totalPages = Math.ceil(units.length / itemsPerPage);
    const startIndex = (currentPage - 1) * itemsPerPage;
    const endIndex = startIndex + itemsPerPage;
    const currentUnits = units.slice(startIndex, endIndex);

    const salesData: Unit[] = currentUnits.map((unit, index) => ({
        ...unit,
        no: (startIndex + index + 1).toString(),
        unitName: unit.name,
        createdOn: unit.created_at ? new Date(unit.created_at).toLocaleDateString('en-US', {
            year: 'numeric',
            month: '2-digit',
            day: '2-digit'
        }) : '-'
    }));

    const fetchUnits = async (searchQuery?: string) => {
        try {
            setIsLoading(true);
            let response;
            if (searchQuery && searchQuery.trim()) {
                response = await axiosInstance.get(`/api/common/units/search?q=${searchQuery}`);
            } else {
                response = await axiosInstance.get('/api/common/units');
            }

            if (response.data.success) {
                setUnits(response.data.data);
            } else {
                toast.error('Failed to load units');
            }
        } catch (error: any) {
            console.error('Error fetching units:', error);
            toast.error('Error loading units. Please try again.');
        } finally {
            setIsLoading(false);
            setIsSearching(false);
        }
    };

    useEffect(() => {
        fetchUnits();
    }, []);

    useEffect(() => {
        const timeoutId = setTimeout(() => {
            fetchUnits(searchTerm);
            setCurrentPage(1);
        }, 300);

        return () => clearTimeout(timeoutId);
    }, [searchTerm]);

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

    const handleEditClick = (unit: Unit) => {
        setSelectedUnit(unit);
        setUpdateUnitName(unit.name || '');
        setIsModalOpen(true);
    };

    const handleCloseModal = () => {
        setIsModalOpen(false);
        setSelectedUnit(null);
        setUpdateUnitName('');
        setIsUpdating(false);
    };

    const handleSaveUnit = async () => {
        if (!newUnitName.trim()) {
            toast.error('Please enter a unit name');
            return;
        }

        setIsSaving(true);
        const createUnitPromise = axiosInstance.post('/api/common/units', {
            name: newUnitName.trim()
        });

        try {
            await toast.promise(createUnitPromise, {
                loading: 'Adding unit...',
                success: () => {
                    setNewUnitName('');
                    fetchUnits();
                    return 'Unit added successfully!';
                },
                error: (err) => err.response?.data?.message || 'Failed to add unit'
            });
        } catch (error: any) {
            console.error('Error adding unit:', error);
        } finally {
            setIsSaving(false);
        }
    };

    const handleUpdateUnit = async () => {
        if (!updateUnitName.trim()) {
            toast.error('Please enter a unit name');
            return;
        }

        if (!selectedUnit) {
            toast.error('No unit selected');
            return;
        }

        setIsUpdating(true);
        const updateUnitPromise = axiosInstance.put(`/api/common/units/${selectedUnit.id}`, {
            name: updateUnitName.trim()
        });

        try {
            await toast.promise(updateUnitPromise, {
                loading: 'Updating unit...',
                success: () => {
                    handleCloseModal();
                    fetchUnits();
                    return 'Unit updated successfully!';
                },
                error: (err) => err.response?.data?.message || 'Failed to update unit'
            });
        } catch (error: any) {
            console.error('Error updating unit:', error);
        } finally {
            setIsUpdating(false);
        }
    };

    const handleDeleteClick = (unit: Unit) => {
        setUnitToDelete(unit);
    };

    const handleDeleteUnit = async () => {
        if (!unitToDelete) {
            toast.error('No unit selected');
            return;
        }

        setIsDeleting(true);
        const deleteUnitPromise = axiosInstance.delete(`/api/common/units/${unitToDelete.id}`);

        try {
            await toast.promise(deleteUnitPromise, {
                loading: 'Deleting unit...',
                success: () => {
                    setUnitToDelete(null);
                    fetchUnits();
                    return 'Unit deleted successfully!';
                },
                error: (err) => err.response?.data?.message || 'Failed to delete unit'
            });
        } catch (error: any) {
            console.error('Error deleting unit:', error);
        } finally {
            setIsDeleting(false);
        }
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
    const handleKeyPress = (e: React.KeyboardEvent<HTMLInputElement>) => {
        if (e.key === 'Enter' && !isSaving) {
            e.preventDefault();
            handleSaveUnit();
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
                        <span>Products</span>
                        <span className="mx-2">›</span>
                        <span className="text-gray-700 font-medium">Manage Unit</span>
                    </div>
                    <h1 className="text-3xl font-semibold bg-gradient-to-r from-gray-800 to-gray-600 bg-clip-text text-transparent">
                        Manage Unit
                    </h1>
                </div>

                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className={'flex flex-col bg-white rounded-xl p-6 justify-between gap-6 shadow-lg'}
                >
                    <div className={'grid md:grid-cols-5 gap-4'}>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Search</label>
                            <input
                                type="text"
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                placeholder="Search units..."
                                className="w-full text-sm rounded-lg py-2 px-3 border-2 border-gray-200 focus:border-emerald-400 focus:outline-none transition-all"
                            />
                        </div>
                        <div className='md:col-span-2'></div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Unit Name</label>
                            <input
                                type="text"
                                value={newUnitName}
                                onChange={(e) => setNewUnitName(e.target.value)}
                                onKeyPress={handleKeyPress}
                                placeholder="Enter unit name..."
                                className="w-full text-sm rounded-lg py-2 px-3 border-2 border-gray-200 focus:border-emerald-400 focus:outline-none transition-all"
                            />
                        </div>
                        <div className={'grid md:items-end items-start gap-2 text-white font-medium'}>
                            <button
                                onClick={handleSaveUnit}
                                disabled={isSaving}
                                className={`bg-gradient-to-r from-emerald-500 to-emerald-600 hover:from-emerald-600 hover:to-emerald-700 py-2 rounded-lg flex items-center justify-center shadow-lg shadow-emerald-200 hover:shadow-xl transition-all ${
                                    isSaving ? 'opacity-50 cursor-not-allowed' : ''
                                }`}
                            >
                                <Plus className="mr-2" size={16}/>{isSaving ? 'Adding...' : 'Add Unit'}
                            </button>
                        </div>
                    </div>

                    <div className="overflow-y-auto max-h-md md:h-[320px] lg:h-[630px] rounded-lg scrollbar-thin scrollbar-thumb-emerald-300 scrollbar-track-gray-100">
                        <table className="min-w-full divide-y divide-gray-200">
                            <thead className="bg-gradient-to-r from-emerald-500 to-emerald-600 sticky top-0 z-10">
                            <tr>
                                {['No', 'Unit Name', 'Created On', 'Actions'].map((header, i, arr) => (
                                    <th
                                        key={i}
                                        className={`px-6 py-3 text-left text-xs font-bold text-white uppercase tracking-wider ${
                                            i === 0 ? 'rounded-tl-lg' : i === arr.length - 1 ? 'rounded-tr-lg' : ''
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
                                        Loading units...
                                    </td>
                                </tr>
                            ) : salesData.length === 0 ? (
                                <tr>
                                    <td colSpan={4} className="px-6 py-8 text-center text-gray-500">
                                        No units found
                                    </td>
                                </tr>
                            ) : (
                                salesData.map((unit, index) => (
                                    <motion.tr
                                        key={unit.id}
                                        initial={{ opacity: 0, x: -20 }}
                                        animate={{ opacity: 1, x: 0 }}
                                        transition={{ delay: 0.05 * index }}
                                        onClick={() => setSelectedIndex(index)}
                                        whileHover={{ backgroundColor: "rgba(16,185,129,0.05)" }}
                                        className={`cursor-pointer transition-all ${
                                            selectedIndex === index
                                                ? 'bg-emerald-50 border-l-4 border-emerald-500'
                                                : 'hover:bg-gray-50'
                                        }`}
                                    >
                                        <td className="px-6 py-3 whitespace-nowrap text-sm font-semibold text-gray-800">
                                            {unit.no}
                                        </td>
                                        <td className="px-6 py-3 whitespace-nowrap text-sm font-medium text-gray-700">
                                            {unit.unitName}
                                        </td>
                                        <td className="px-6 py-3 whitespace-nowrap text-sm text-gray-600">
                                            {unit.createdOn}
                                        </td>
                                        <td className="px-6 py-3 whitespace-nowrap text-sm font-medium">
                                            <div className="flex space-x-2">
                                                <button
                                                    onClick={() => handleEditClick(unit)}
                                                    className="p-2 bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white rounded-lg shadow-md hover:shadow-lg transition-all"
                                                >
                                                    <Pencil size={16}/>
                                                </button>
                                                <button
                                                    onClick={() => handleDeleteClick(unit)}
                                                    className="p-2 bg-gradient-to-r from-red-500 to-red-600 hover:from-red-600 hover:to-red-700 text-white rounded-lg shadow-md hover:shadow-lg transition-all"
                                                >
                                                    <Trash size={16}/>
                                                </button>
                                            </div>
                                        </td>
                                    </motion.tr>
                                ))
                            )}
                            </tbody>
                        </table>
                    </div>

                    <nav className="bg-white flex items-center justify-between sm:px-6 pt-4 border-t-2 border-gray-100">
                        <div className="text-sm text-gray-600">
                            Showing <span className="font-bold text-gray-800">{startIndex + 1}-{Math.min(endIndex, units.length)}</span> of{' '}
                            <span className="font-bold text-gray-800">{units.length}</span> units
                        </div>
                        <div className="flex items-center space-x-2">
                            <button
                                onClick={() => goToPage(currentPage - 1)}
                                disabled={currentPage === 1}
                                className={`flex items-center px-3 py-2 text-sm font-medium rounded-lg transition-all ${
                                    currentPage === 1
                                        ? 'text-gray-400 cursor-not-allowed'
                                        : 'text-gray-600 hover:text-emerald-600 hover:bg-emerald-50'
                                }`}
                            >
                                <ChevronLeft className="mr-2 h-5 w-5"/> Previous
                            </button>
                            {getPageNumbers().map((page, index) =>
                                page === '...' ? (
                                    <span key={`ellipsis-${index}`} className="text-gray-400 px-2">...</span>
                                ) : (
                                    <button
                                        key={index}
                                        onClick={() => goToPage(page as number)}
                                        className={`px-4 py-2 text-sm font-medium rounded-lg transition-all ${
                                            currentPage === page
                                                ? 'bg-gradient-to-r from-emerald-500 to-emerald-600 text-white shadow-md'
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
                                className={`flex items-center px-3 py-2 text-sm font-medium rounded-lg transition-all ${
                                    currentPage === totalPages
                                        ? 'text-gray-400 cursor-not-allowed'
                                        : 'text-gray-600 hover:text-emerald-600 hover:bg-emerald-50'
                                }`}
                            >
                                Next <ChevronRight className="ml-2 h-5 w-5"/>
                            </button>
                        </div>
                    </nav>
                </motion.div>
            </div>

            {/* Update Modal */}
            {isModalOpen && selectedUnit && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
                    <motion.div
                        initial={{ opacity: 0, scale: 0.9 }}
                        animate={{ opacity: 1, scale: 1 }}
                        className="bg-white rounded-2xl shadow-2xl p-8 w-full max-w-md relative"
                    >
                        <button
                            onClick={handleCloseModal}
                            className="absolute top-4 right-4 p-2 hover:bg-gray-100 rounded-full transition-all"
                        >
                            <X size={20} className="text-gray-600"/>
                        </button>

                        <h2 className="text-2xl font-bold text-gray-800 mb-6">Update Unit</h2>

                        <div className="mb-6">
                            <label className="block text-sm font-medium text-gray-700 mb-2">Unit Name</label>
                            <input
                                type="text"
                                value={updateUnitName}
                                onChange={(e) => setUpdateUnitName(e.target.value)}
                                placeholder="Enter unit name..."
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
                                onClick={handleUpdateUnit}
                                disabled={isUpdating}
                                className={`flex-1 py-3 bg-gradient-to-r from-emerald-500 to-emerald-600 hover:from-emerald-600 hover:to-emerald-700 text-white font-medium rounded-lg shadow-lg shadow-emerald-200 hover:shadow-xl transition-all ${
                                    isUpdating ? 'opacity-50 cursor-not-allowed' : ''
                                }`}
                            >
                                {isUpdating ? 'Updating...' : 'Update Unit'}
                            </button>
                        </div>
                    </motion.div>
                </div>
            )}

            {/* Delete Confirmation Modal */}
            <ConfirmationModal
                isOpen={!!unitToDelete}
                title="Delete Unit"
                message="Are you sure you want to delete the {itemType}"
                itemName={unitToDelete?.name || ''}
                itemType="unit"
                onConfirm={handleDeleteUnit}
                onCancel={() => setUnitToDelete(null)}
                isLoading={isDeleting}
                confirmButtonText="Delete"
                loadingText="Deleting..."
            />
        </>
    );
}

export default ManageUnit;