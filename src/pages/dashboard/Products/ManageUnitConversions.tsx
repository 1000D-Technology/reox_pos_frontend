import {
    ChevronLeft,
    ChevronRight,
    Pencil,
    Plus,
    Trash,
    X,
    ArrowRight,
} from 'lucide-react';
import { useEffect, useState } from 'react';
import toast, { Toaster } from 'react-hot-toast';
import { unitService } from '../../../services/unitService';
import { unitConversionService, type UnitConversion } from '../../../services/unitConversionService';
import ConfirmationModal from '../../../components/modals/ConfirmationModal';

interface Unit {
    id: number;
    name: string;
    created_at?: string;
}

function ManageUnitConversions() {
    // Units state
    const [units, setUnits] = useState<Unit[]>([]);
    const [isLoadingUnits, setIsLoadingUnits] = useState(false);

    // Conversions state
    const [conversions, setConversions] = useState<UnitConversion[]>([]);
    const [isLoadingConversions, setIsLoadingConversions] = useState(false);
    const [isSaving, setIsSaving] = useState(false);
    const [isUpdating, setIsUpdating] = useState(false);
    const [isDeleting, setIsDeleting] = useState(false);

    // Form state
    const [parentUnitId, setParentUnitId] = useState<number | null>(null);
    const [childUnitId, setChildUnitId] = useState<number | null>(null);
    const [conversionFactor, setConversionFactor] = useState('');

    // Modal state
    const [isEditModalOpen, setIsEditModalOpen] = useState(false);
    const [selectedConversion, setSelectedConversion] = useState<UnitConversion | null>(null);
    const [editConversionFactor, setEditConversionFactor] = useState('');
    const [conversionToDelete, setConversionToDelete] = useState<UnitConversion | null>(null);

    // Pagination state
    const [currentPage, setCurrentPage] = useState(1);
    const [itemsPerPage] = useState(10);
    const [selectedIndex, setSelectedIndex] = useState(0);

    const totalPages = Math.ceil(conversions.length / itemsPerPage);
    const startIndex = (currentPage - 1) * itemsPerPage;
    const endIndex = startIndex + itemsPerPage;
    const currentConversions = conversions.slice(startIndex, endIndex);

    const conversionData = currentConversions.map((conv, index) => ({
        ...conv,
        no: (startIndex + index + 1).toString(),
    }));

    // Fetch units
    const fetchUnits = async () => {
        try {
            setIsLoadingUnits(true);
            const response = await unitService.getUnits();
            if (response.data.success) {
                setUnits(response.data.data);
            } else {
                toast.error('Failed to load units');
            }
        } catch (error: any) {
            console.error('Error fetching units:', error);
            toast.error('Error loading units');
        } finally {
            setIsLoadingUnits(false);
        }
    };

    // Fetch conversions
    const fetchConversions = async () => {
        try {
            setIsLoadingConversions(true);
            const response = await unitConversionService.getUnitConversions();
            if (response.data.success) {
                setConversions(response.data.data);
            } else {
                toast.error('Failed to load unit conversions');
            }
        } catch (error: any) {
            console.error('Error fetching conversions:', error);
            toast.error('Error loading unit conversions');
        } finally {
            setIsLoadingConversions(false);
        }
    };

    useEffect(() => {
        fetchUnits();
        fetchConversions();
    }, []);

    // Keyboard navigation
    useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            if (e.key === "Escape") {
                setIsEditModalOpen(false);
                setConversionToDelete(null);
            }

            if (e.key === "ArrowDown") {
                const target = e.target as HTMLElement;
                if (target.tagName !== 'INPUT' && target.tagName !== 'SELECT' && target.tagName !== 'TEXTAREA') {
                    e.preventDefault();
                    setSelectedIndex((prev) => (prev < conversionData.length - 1 ? prev + 1 : prev));
                }
            } else if (e.key === "ArrowUp") {
                const target = e.target as HTMLElement;
                if (target.tagName !== 'INPUT' && target.tagName !== 'SELECT' && target.tagName !== 'TEXTAREA') {
                    e.preventDefault();
                    setSelectedIndex((prev) => (prev > 0 ? prev - 1 : prev));
                }
            } else if (e.key === "PageDown") {
                const target = e.target as HTMLElement;
                if (target.tagName !== 'INPUT' && target.tagName !== 'SELECT' && target.tagName !== 'TEXTAREA') {
                    e.preventDefault();
                    goToPage(currentPage + 1);
                }
            } else if (e.key === "PageUp") {
                const target = e.target as HTMLElement;
                if (target.tagName !== 'INPUT' && target.tagName !== 'SELECT' && target.tagName !== 'TEXTAREA') {
                    e.preventDefault();
                    goToPage(currentPage - 1);
                }
            }

            if (e.key === "Enter" && !e.shiftKey) {
                const target = e.target as HTMLElement;
                if (target.tagName !== 'INPUT' && target.tagName !== 'SELECT' && target.tagName !== 'TEXTAREA' && conversionData[selectedIndex] && !isEditModalOpen) {
                    handleEditClick(conversionData[selectedIndex]);
                }
            }

            if (e.key === "Enter" && e.shiftKey && isEditModalOpen) {
                e.preventDefault();
                if (!isUpdating) {
                    handleUpdateConversion();
                }
            }

            if (e.altKey) {
                switch (e.key.toLowerCase()) {
                    case 'e':
                        e.preventDefault();
                        if (conversionData[selectedIndex]) {
                            handleEditClick(conversionData[selectedIndex]);
                        }
                        break;
                    case 'd':
                        e.preventDefault();
                        if (conversionData[selectedIndex]) {
                            handleDeleteClick(conversionData[selectedIndex]);
                        }
                        break;
                }
            }
        };

        window.addEventListener("keydown", handleKeyDown);
        return () => window.removeEventListener("keydown", handleKeyDown);
    }, [conversionData, isEditModalOpen, isUpdating, selectedIndex, currentPage]);

    const handleEditClick = (conversion: UnitConversion) => {
        setSelectedConversion(conversion);
        setEditConversionFactor(conversion.conversion_factor.toString());
        setIsEditModalOpen(true);
    };

    const handleCloseModal = () => {
        setIsEditModalOpen(false);
        setSelectedConversion(null);
        setEditConversionFactor('');
        setIsUpdating(false);
    };

    const handleSaveConversion = async () => {
        if (!parentUnitId) {
            toast.error('Please select a parent unit');
            return;
        }

        if (!childUnitId) {
            toast.error('Please select a child/sub-unit');
            return;
        }

        if (parentUnitId === childUnitId) {
            toast.error('Parent unit and sub-unit cannot be the same');
            return;
        }

        if (!conversionFactor || parseFloat(conversionFactor) <= 0) {
            toast.error('Conversion factor must be greater than 0');
            return;
        }

        setIsSaving(true);
        const createConversionPromise = unitConversionService.createUnitConversion({
            parent_unit_id: parentUnitId,
            child_unit_id: childUnitId,
            conversion_factor: parseFloat(conversionFactor),
        });

        try {
            await toast.promise(createConversionPromise, {
                loading: 'Adding unit conversion...',
                success: () => {
                    setParentUnitId(null);
                    setChildUnitId(null);
                    setConversionFactor('');
                    fetchConversions();
                    return 'Unit conversion added successfully!';
                },
                error: (err) => err.response?.data?.message || 'Failed to add unit conversion',
            });
        } catch (error: any) {
            console.error('Error adding unit conversion:', error);
        } finally {
            setIsSaving(false);
        }
    };

    const handleUpdateConversion = async () => {
        if (!editConversionFactor || parseFloat(editConversionFactor) <= 0) {
            toast.error('Conversion factor must be greater than 0');
            return;
        }

        if (!selectedConversion) {
            toast.error('No conversion selected');
            return;
        }

        setIsUpdating(true);
        const updateConversionPromise = unitConversionService.updateUnitConversion(
            selectedConversion.id,
            { conversion_factor: parseFloat(editConversionFactor) }
        );

        try {
            await toast.promise(updateConversionPromise, {
                loading: 'Updating conversion...',
                success: () => {
                    handleCloseModal();
                    fetchConversions();
                    return 'Conversion updated successfully!';
                },
                error: (err) => err.response?.data?.message || 'Failed to update conversion',
            });
        } catch (error: any) {
            console.error('Error updating conversion:', error);
        } finally {
            setIsUpdating(false);
        }
    };

    const handleDeleteClick = (conversion: UnitConversion) => {
        setConversionToDelete(conversion);
    };

    const handleDeleteConversion = async () => {
        if (!conversionToDelete) {
            toast.error('No conversion selected');
            return;
        }

        setIsDeleting(true);
        const deleteConversionPromise = unitConversionService.deleteUnitConversion(conversionToDelete.id);

        try {
            await toast.promise(deleteConversionPromise, {
                loading: 'Deleting conversion...',
                success: () => {
                    setConversionToDelete(null);
                    fetchConversions();
                    return 'Conversion deleted successfully!';
                },
                error: (err) => err.response?.data?.message || 'Failed to delete conversion',
            });
        } catch (error: any) {
            console.error('Error deleting conversion:', error);
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
                <div className="flex justify-between items-center mb-4">
                    <div>
                        <div className="text-sm text-gray-400 flex items-center">
                            <span>Products</span>
                            <span className="mx-2">›</span>
                            <span className="text-gray-700 font-medium">Unit Conversions</span>
                        </div>
                        <h1 className="text-3xl font-semibold bg-linear-to-r from-gray-800 to-gray-600 bg-clip-text text-transparent">
                            Manage Unit Conversions
                        </h1>
                        <p className="text-sm text-gray-500 mt-1">Define sub-unit relationships (e.g., 1 Box = 12 Pieces)</p>
                    </div>

                    {/* Shortcuts Hint */}
                    <div className="hidden lg:flex items-center gap-2 bg-white px-4 py-2 rounded-xl border border-gray-100 shadow-sm border-b-2">
                        <div className="flex items-center gap-1.5 px-2 py-1 bg-gray-50 rounded-lg border border-gray-100">
                            <span className="text-[10px] font-black text-gray-500 bg-white px-1.5 py-0.5 rounded shadow-sm border border-gray-200">↑↓</span>
                            <span className="text-[10px] font-bold text-gray-400 uppercase tracking-tight">Navigate</span>
                        </div>
                        <div className="flex items-center gap-1.5 px-2 py-1 bg-gray-50 rounded-lg border border-gray-100">
                            <span className="text-[10px] font-black text-gray-500 bg-white px-1.5 py-0.5 rounded shadow-sm border border-gray-200">ALT+E</span>
                            <span className="text-[10px] font-bold text-gray-400 uppercase tracking-tight">Edit</span>
                        </div>
                        <div className="flex items-center gap-1.5 px-2 py-1 bg-gray-50 rounded-lg border border-gray-100">
                            <span className="text-[10px] font-black text-gray-500 bg-white px-1.5 py-0.5 rounded shadow-sm border border-gray-200">ALT+D</span>
                            <span className="text-[10px] font-bold text-gray-400 uppercase tracking-tight">Delete</span>
                        </div>
                    </div>
                </div>

                {/* Add Conversion Form */}
                <div className={'flex flex-col bg-white rounded-xl p-6 gap-6 border border-gray-200'}>
                    <h2 className="text-lg font-semibold text-gray-800">Add New Unit Conversion</h2>
                    <div className={'grid md:grid-cols-6 gap-4'}>
                        <div className="md:col-span-2">
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                Parent Unit <span className="text-red-500">*</span>
                            </label>
                            <select
                                value={parentUnitId || ''}
                                onChange={(e) => setParentUnitId(e.target.value ? parseInt(e.target.value) : null)}
                                className="w-full text-sm rounded-lg py-2 px-3 border-2 border-gray-200 focus:border-emerald-400 focus:outline-none transition-all"
                                disabled={isLoadingUnits}
                            >
                                <option value="">Select parent unit...</option>
                                {units.map((unit) => (
                                    <option key={unit.id} value={unit.id}>
                                        {unit.name}
                                    </option>
                                ))}
                            </select>
                        </div>

                        <div className="md:col-span-2">
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                Sub-Unit <span className="text-red-500">*</span>
                            </label>
                            <select
                                value={childUnitId || ''}
                                onChange={(e) => setChildUnitId(e.target.value ? parseInt(e.target.value) : null)}
                                className="w-full text-sm rounded-lg py-2 px-3 border-2 border-gray-200 focus:border-emerald-400 focus:outline-none transition-all"
                                disabled={isLoadingUnits}
                            >
                                <option value="">Select sub-unit...</option>
                                {units.map((unit) => (
                                    <option key={unit.id} value={unit.id}>
                                        {unit.name}
                                    </option>
                                ))}
                            </select>
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                Conversion Factor <span className="text-red-500">*</span>
                            </label>
                            <input
                                type="number"
                                step="0.01"
                                min="0.01"
                                value={conversionFactor}
                                onChange={(e) => setConversionFactor(e.target.value)}
                                placeholder="12"
                                className="w-full text-sm rounded-lg py-2 px-3 border-2 border-gray-200 focus:border-emerald-400 focus:outline-none transition-all"
                            />
                            <p className="text-xs text-gray-500 mt-1">How many sub-units = 1 parent unit</p>
                        </div>

                        <div className={'flex items-end'}>
                            <button
                                onClick={handleSaveConversion}
                                disabled={isSaving}
                                className={`bg-gradient-to-r from-emerald-500 to-emerald-600 hover:from-emerald-600 hover:to-emerald-700 w-full py-2 rounded-lg flex items-center justify-center shadow-lg shadow-emerald-200 hover:shadow-xl transition-all text-white font-medium ${
                                    isSaving ? 'opacity-50 cursor-not-allowed' : ''
                                }`}
                            >
                                <Plus className="mr-2" size={16} />
                                {isSaving ? 'Adding...' : 'Add Conversion'}
                            </button>
                        </div>
                    </div>

                    {/* Example Display */}
                    {parentUnitId && childUnitId && conversionFactor && (
                        <div className="bg-emerald-50 border border-emerald-200 rounded-lg p-4">
                            <div className="flex items-center justify-center gap-3 text-emerald-800">
                                <span className="font-semibold">1 {units.find(u => u.id === parentUnitId)?.name}</span>
                                <span className="text-2xl">=</span>
                                <span className="font-semibold">{conversionFactor} {units.find(u => u.id === childUnitId)?.name}</span>
                            </div>
                        </div>
                    )}
                </div>

                {/* Conversions Table */}
                <div className={'flex flex-col bg-white rounded-xl p-6 gap-6 border border-gray-200'}>
                    <h2 className="text-lg font-semibold text-gray-800">Existing Unit Conversions</h2>

                    <div className="overflow-y-auto max-h-md md:h-[320px] lg:h-[400px] rounded-lg scrollbar-thin scrollbar-thumb-emerald-300 scrollbar-track-gray-100">
                        <table className="min-w-full divide-y divide-gray-200">
                            <thead className="bg-gradient-to-r from-emerald-500 to-emerald-600 sticky top-0 z-10">
                                <tr>
                                    {['No', 'Parent Unit', 'Conversion', 'Sub-Unit', 'Factor', 'Actions'].map((header, i, arr) => (
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
                                {isLoadingConversions ? (
                                    <tr>
                                        <td colSpan={6} className="px-6 py-8 text-center text-gray-500">
                                            <div className="flex justify-center items-center">
                                                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-emerald-500"></div>
                                            </div>
                                        </td>
                                    </tr>
                                ) : conversionData.length === 0 ? (
                                    <tr>
                                        <td colSpan={6} className="px-6 py-8 text-center text-gray-500">
                                            No unit conversions found. Add your first conversion above!
                                        </td>
                                    </tr>
                                ) : (
                                    conversionData.map((conv, index) => (
                                        <tr
                                            key={conv.id}
                                            onClick={() => setSelectedIndex(index)}
                                            onDoubleClick={() => handleEditClick(conv)}
                                            className={`cursor-pointer transition-all ${
                                                selectedIndex === index
                                                    ? 'bg-emerald-50 border-l-4 border-emerald-500'
                                                    : 'hover:bg-emerald-50/10'
                                            }`}
                                        >
                                            <td className="px-6 py-3 whitespace-nowrap text-sm font-semibold text-gray-800">
                                                {conv.no}
                                            </td>
                                            <td className="px-6 py-3 whitespace-nowrap text-sm font-medium text-gray-700">
                                                {conv.parent_unit_name}
                                            </td>
                                            <td className="px-6 py-3 whitespace-nowrap text-sm text-gray-600">
                                                <div className="flex items-center gap-2">
                                                    <span className="font-semibold text-emerald-600">1</span>
                                                    <ArrowRight size={16} className="text-gray-400" />
                                                    <span className="font-semibold text-blue-600">{conv.conversion_factor}</span>
                                                </div>
                                            </td>
                                            <td className="px-6 py-3 whitespace-nowrap text-sm font-medium text-gray-700">
                                                {conv.child_unit_name}
                                            </td>
                                            <td className="px-6 py-3 whitespace-nowrap text-sm text-gray-600">
                                                <span className="bg-gray-100 px-3 py-1 rounded-full text-xs font-medium">
                                                    ×{conv.conversion_factor}
                                                </span>
                                            </td>
                                            <td className="px-6 py-3 whitespace-nowrap text-sm font-medium">
                                                <div className="flex space-x-2">
                                                    <button
                                                        onClick={() => handleEditClick(conv)}
                                                        className="p-2 bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white rounded-lg shadow-md hover:shadow-lg transition-all"
                                                    >
                                                        <Pencil size={16} />
                                                    </button>
                                                    <button
                                                        onClick={() => handleDeleteClick(conv)}
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

                    {/* Pagination */}
                    <nav className="bg-white flex items-center justify-between sm:px-6 pt-4 border-t-2 border-gray-100">
                        <div className="text-sm text-gray-600">
                            Showing <span className="font-bold text-gray-800">{startIndex + 1}-{Math.min(endIndex, conversions.length)}</span> of{' '}
                            <span className="font-bold text-gray-800">{conversions.length}</span> conversions
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
                                <ChevronLeft className="mr-2 h-5 w-5" /> Previous
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
                                Next <ChevronRight className="ml-2 h-5 w-5" />
                            </button>
                        </div>
                    </nav>
                </div>
            </div>

            {/* Edit Modal */}
            {isEditModalOpen && selectedConversion && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
                    <div className="bg-white rounded-2xl shadow-2xl p-8 w-full max-w-md relative">
                        <button
                            onClick={handleCloseModal}
                            className="absolute top-4 right-4 p-2 hover:bg-gray-100 rounded-full transition-all"
                        >
                            <X size={20} className="text-gray-600" />
                        </button>

                        <h2 className="text-2xl font-bold text-gray-800 mb-6">Update Conversion Factor</h2>

                        <div className="mb-4 bg-gray-50 p-4 rounded-lg">
                            <div className="text-sm text-gray-600 mb-2">Conversion:</div>
                            <div className="flex items-center justify-center gap-3">
                                <span className="font-semibold text-gray-800">{selectedConversion.parent_unit_name}</span>
                                <ArrowRight size={20} className="text-gray-400" />
                                <span className="font-semibold text-gray-800">{selectedConversion.child_unit_name}</span>
                            </div>
                        </div>

                        <div className="mb-6">
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                Conversion Factor <span className="text-red-500">*</span>
                            </label>
                            <input
                                type="number"
                                step="0.01"
                                min="0.01"
                                value={editConversionFactor}
                                onChange={(e) => setEditConversionFactor(e.target.value)}
                                placeholder="Enter conversion factor"
                                className="w-full text-sm rounded-lg py-3 px-4 border-2 border-gray-200 focus:border-emerald-400 focus:outline-none transition-all"
                            />
                            <p className="text-xs text-gray-500 mt-2">
                                1 {selectedConversion.parent_unit_name} = {editConversionFactor || '?'} {selectedConversion.child_unit_name}
                            </p>
                        </div>

                        <div className="flex gap-3">
                            <button
                                onClick={handleCloseModal}
                                className="flex-1 py-3 bg-gray-100 hover:bg-gray-200 text-gray-700 font-medium rounded-lg transition-all"
                            >
                                Cancel
                            </button>
                            <button
                                onClick={handleUpdateConversion}
                                disabled={isUpdating}
                                className={`flex-1 py-3 bg-gradient-to-r from-emerald-500 to-emerald-600 hover:from-emerald-600 hover:to-emerald-700 text-white font-medium rounded-lg shadow-lg shadow-emerald-200 hover:shadow-xl transition-all ${
                                    isUpdating ? 'opacity-50 cursor-not-allowed' : ''
                                }`}
                            >
                                {isUpdating ? 'Updating...' : 'Update'}
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Delete Confirmation Modal */}
            <ConfirmationModal
                isOpen={!!conversionToDelete}
                title="Delete Unit Conversion"
                message={`Are you sure you want to delete this conversion: 1 ${conversionToDelete?.parent_unit_name} = ${conversionToDelete?.conversion_factor} ${conversionToDelete?.child_unit_name}?`}
                itemName={''}
                itemType="conversion"
                onConfirm={handleDeleteConversion}
                onCancel={() => setConversionToDelete(null)}
                isLoading={isDeleting}
                confirmButtonText="Delete"
                loadingText="Deleting..."
            />
        </>
    );
}

export default ManageUnitConversions;
