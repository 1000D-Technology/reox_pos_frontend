import {
    ChevronLeft,
    ChevronRight,
     Pencil,
    Trash,
    X,
} from 'lucide-react';

import { useEffect, useState } from 'react';
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
    const [updateUnitName, setUpdateUnitName] = useState('');
    const [isUpdating, setIsUpdating] = useState(false);
    const [isDeleting, setIsDeleting] = useState(false);
    const [unitToDelete, setUnitToDelete] = useState<Unit | null>(null);
    
    // Pagination states
    const [currentPage, setCurrentPage] = useState(1);
    const [itemsPerPage] = useState(10);
    
    // Calculate pagination
    const filteredUnits = units.filter(unit => 
        unit.name.toLowerCase().includes(searchTerm.toLowerCase())
    );
    const totalPages = Math.ceil(filteredUnits.length / itemsPerPage);
    const startIndex = (currentPage - 1) * itemsPerPage;
    const endIndex = startIndex + itemsPerPage;
    const currentUnits = filteredUnits.slice(startIndex, endIndex);
    
    // Transform units for display
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


    const [isModalOpen, setIsModalOpen] = useState(false);


    const [selectedUnit, setSelectedUnit] = useState<Unit | null>(null);

    // 🔹 Selected row state
    const [selectedIndex, setSelectedIndex] = useState(0);

    // Fetch units from API
    const fetchUnits = async () => {
        try {
            setIsLoading(true);
            const response = await axiosInstance.get('/api/common/units');
            
            if (response.data.success) {
                setUnits(response.data.data);
            } else {
                alert('Failed to fetch units');
            }
        } catch (error: any) {
            console.error('Error fetching units:', error);
            alert('Error loading units. Please try again.');
        } finally {
            setIsLoading(false);
        }
    };

    // Load units on component mount
    useEffect(() => {
        fetchUnits();
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
            alert('Please enter a unit name');
            return;
        }

        setIsSaving(true);
        try {
            const response = await axiosInstance.post('/api/common/units', {
                name: newUnitName.trim()
            });

            const result = response.data;

            if (result.success) {
                alert(result.message || 'Unit added successfully!');
                setNewUnitName('');
                // Refresh units list
                await fetchUnits();
                // Reset to first page to see the new unit
                setCurrentPage(1);
            } else {
                alert(result.message || 'Failed to add unit');
            }
        } catch (error: any) {
            console.error('Error adding unit:', error);
            const errorMsg = error.response?.data?.message || 'An error occurred while adding the unit. Please try again.';
            alert(errorMsg);
        } finally {
            setIsSaving(false);
        }
    };

    const handleUpdateUnit = async () => {
        if (!updateUnitName.trim()) {
            alert('Please enter a unit name');
            return;
        }

        if (!selectedUnit) {
            alert('No unit selected');
            return;
        }

        setIsUpdating(true);
        try {
            const response = await axiosInstance.put(`/api/common/units/${selectedUnit.id}`, {
                name: updateUnitName.trim()
            });

            const result = response.data;

            if (result.success) {
                alert(result.message || 'Unit updated successfully!');
                handleCloseModal();
                // Refresh units list
                await fetchUnits();
            } else {
                alert(result.message || 'Failed to update unit');
            }
        } catch (error: any) {
            console.error('Error updating unit:', error);
            const errorMsg = error.response?.data?.message || 'An error occurred while updating the unit. Please try again.';
            alert(errorMsg);
        } finally {
            setIsUpdating(false);
        }
    };

    const handleDeleteClick = (unit: Unit) => {
        setUnitToDelete(unit);
    };

    const handleDeleteUnit = async () => {
        if (!unitToDelete) {
            alert('No unit selected');
            return;
        }

        setIsDeleting(true);
        try {
            const response = await axiosInstance.delete(`/api/common/units/${unitToDelete.id}`);

            const result = response.data;

            if (result.success) {
                alert(result.message || 'Unit deleted successfully!');
                setUnitToDelete(null);
                // Refresh units list
                await fetchUnits();
                // Reset to first page if current page becomes empty
                if (currentUnits.length === 1 && currentPage > 1) {
                    setCurrentPage(currentPage - 1);
                }
            } else {
                alert(result.message || 'Failed to delete unit');
            }
        } catch (error: any) {
            console.error('Error deleting unit:', error);
            const errorMsg = error.response?.data?.message || 'An error occurred while deleting the unit. Please try again.';
            alert(errorMsg);
        } finally {
            setIsDeleting(false);
        }
    };

    return (
        <div className={'flex flex-col gap-4 h-full'}>
            <div>
                <div className="text-sm text-gray-500 flex items-center">
                    <span>Pages</span>
                    <span className="mx-2">›</span>
                    <span className="text-black">Manage Unit</span>
                </div>
                <h1 className="text-3xl font-semibold text-gray-500">Manage Unit</h1>
            </div>

            <div className={'flex flex-col bg-white rounded-md  p-4 justify-between gap-8'}>

                <div className={'grid md:grid-cols-5 gap-4 '}>
                    <div>
                        <label htmlFor="search-unit"
                               className="block text-sm font-medium text-gray-700 mb-1">Search Unit</label>
                        <input 
                            type="text" 
                            id="search-unit" 
                            placeholder="Search Unit..."
                            value={searchTerm}
                            onChange={(e) => {
                                setSearchTerm(e.target.value);
                                setCurrentPage(1); // Reset to first page when searching
                            }}
                            className="w-full text-sm rounded-md py-2 px-2 border-2 border-gray-100 focus:border-emerald-500 focus:ring-emerald-500" />
                    </div>

                    <div className='md:col-span-2'></div>

                    <div>
                        <label htmlFor="new-unit"
                               className="block text-sm font-medium text-gray-700 mb-1">Unit Name</label>
                        <input 
                            type="text" 
                            id="new-unit" 
                            placeholder="Enter New Unit Name"
                            value={newUnitName}
                            onChange={(e) => setNewUnitName(e.target.value)}
                            onKeyDown={(e) => e.key === 'Enter' && handleSaveUnit()}
                            disabled={isSaving}
                            className="w-full text-sm rounded-md py-2 px-2 border-2 border-gray-100 focus:border-emerald-500 focus:ring-emerald-500" />
                    </div>
                    <div className={'grid  md:items-end items-start gap-2 text-white font-medium'}>
                        <button 
                            onClick={handleSaveUnit}
                            disabled={isSaving}
                            className={'bg-emerald-600 py-2 rounded-md flex items-center justify-center hover:bg-emerald-700 disabled:opacity-50 disabled:cursor-not-allowed'}>
                            {isSaving ? 'Saving...' : 'Save Unit'}
                        </button>
                    </div>
                </div>

                <div
                    className="overflow-y-auto max-h-md md:h-[320px] lg:h-[690px] rounded-md scrollbar-thin scrollbar-thumb-gray-300 scrollbar-track-gray-100">
                    {isLoading ? (
                        <div className="flex items-center justify-center h-32">
                            <div className="text-gray-500">Loading units...</div>
                        </div>
                    ) : salesData.length === 0 ? (
                        <div className="flex items-center justify-center h-32">
                            <div className="text-gray-500">
                                {searchTerm ? 'No units found matching your search.' : 'No units found.'}
                            </div>
                        </div>
                    ) : (
                        <table className="min-w-full divide-y divide-gray-200">
                            <thead className="bg-emerald-600 sticky top-0 z-10">
                            <tr>
                                {['#', 'Unit Name', 'Created On', 'Actions'].map((header, i, arr) => (
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
                                    key={sale.id || index}
                                    onClick={() => setSelectedIndex(index)}
                                    className={`cursor-pointer ${index === selectedIndex
                                        ? "bg-green-100 border-l-4 border-green-600"
                                        : "hover:bg-green-50"
                                    }`}
                                >
                                    <td className="px-6 py-2 whitespace-nowrap text-sm font-medium">{sale.no}</td>
                                    <td className="px-6 py-2 whitespace-nowrap text-sm font-medium">{sale.unitName}</td>
                                    <td className="px-6 py-2 whitespace-nowrap text-sm font-medium text-gray-600">{sale.createdOn}</td>
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
                                                        Edit Unit
                                                    </span>
                                            </div>

                                            <div className="relative group">
                                                <button
                                                    onClick={(e) => {
                                                        e.stopPropagation();
                                                        handleDeleteClick(sale);
                                                    }}
                                                    className="p-2 bg-red-100 rounded-full text-red-700 hover:bg-red-200 transition-colors">
                                                    <Trash size={15}/>
                                                </button>
                                                <span
                                                    className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 w-max px-2 py-1 text-xs text-white bg-gray-900 rounded-md invisible group-hover:visible opacity-0 group-hover:opacity-100 transition-opacity">
                                                        Delete Unit
                                                    </span>
                                            </div>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                            </tbody>
                        </table>
                    )}
                </div>

                <nav className="bg-white flex items-center justify-between sm:px-6 pt-4">
                    <div className="text-sm text-gray-500">
                        Showing {startIndex + 1} to {Math.min(endIndex, filteredUnits.length)} of {filteredUnits.length} units
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
            {isModalOpen && selectedUnit && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-white/10 backdrop-blur-sm">
                    <div className="bg-white rounded-2xl shadow-xl p-8 w-full max-w-md relative ">
                        <button
                            onClick={handleCloseModal}
                            className="absolute top-4 right-4 text-gray-400 hover:text-gray-600">
                            <X className="w-6 h-6" />
                        </button>

                        <h2 className="text-3xl font-bold text-[#525252] mb-10">Update Unit</h2>

                        <div className="space-y-4">
                            <p className="text-sm text-gray-600">
                                Current Unit Name :
                                <span className="font-semibold text-teal-600 ml-2">{selectedUnit.unitName}</span>
                            </p>
                            <div>
                                <label htmlFor="update-unit-name" className="block text-sm font-bold text-gray-700 mb-1">
                                    New Unit Name
                                </label>
                                <input
                                    type="text"
                                    id="update-unit-name"
                                    placeholder="Enter Unit"
                                    value={updateUnitName}
                                    onChange={(e) => setUpdateUnitName(e.target.value)}
                                    onKeyDown={(e) => e.key === 'Enter' && handleUpdateUnit()}
                                    disabled={isUpdating}
                                    className="w-full text-sm rounded-md py-2 px-3 border border-gray-300 focus:border-emerald-500 focus:ring-emerald-500"
                                />
                            </div>
                        </div>

                        <div className="mt-10 flex justify-end">
                            <button 
                                onClick={handleUpdateUnit}
                                disabled={isUpdating}
                                className="w-1/2 bg-emerald-600 text-white font-semibold py-2.5 rounded-lg hover:bg-emerald-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-emerald-500 disabled:opacity-50 disabled:cursor-not-allowed">
                                {isUpdating ? 'Updating...' : 'Update Unit'}
                            </button>
                        </div>
                    </div>
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
        </div>
    );
}

export default ManageUnit;