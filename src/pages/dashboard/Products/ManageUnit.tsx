import {
    ChevronLeft,
    ChevronRight,
     Pencil,
    Trash,
    X,
} from 'lucide-react';

import { useEffect, useState } from 'react';
import axiosInstance from '../../../api/axiosInstance';


interface Unit {
    no: string;
    unitName: string;
    createdOn: string;
}

function ManageUnit() {
    const [newUnitName, setNewUnitName] = useState('');
    const [isSaving, setIsSaving] = useState(false);

    const salesData: Unit[] = [
        {
            no: '1',
            unitName: 'XXL',
            createdOn: '2025-05-02',
        },
        {
            no: '2',
            unitName: 'Large',
            createdOn: '2025-05-01',
        },
        {
            no: '3',
            unitName: 'Medium',
            createdOn: '2025-04-30',
        }
    ];


    const [isModalOpen, setIsModalOpen] = useState(false);


    const [selectedUnit, setSelectedUnit] = useState<Unit | null>(null);

    // 🔹 Selected row state
    const [selectedIndex, setSelectedIndex] = useState(0);

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
        setIsModalOpen(true);
    };


    const handleCloseModal = () => {
        setIsModalOpen(false);
        setSelectedUnit(null);
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
                // TODO: Refresh units list here
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
                        <input type="text" id="search-unit" placeholder="Search Unit..."
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
                                key={index}
                                onClick={() => setSelectedIndex(index)}
                                className={`cursor-pointer ${index === selectedIndex
                                    ? "bg-green-100 border-l-4 border-green-600"
                                    : "hover:bg-green-50"
                                }`}
                            >
                                <td className="px-6 py-2 whitespace-nowrap text-sm font-medium">{sale.no}</td>
                                <td className="px-6 py-2 whitespace-nowrap text-sm font-medium">{sale.unitName}</td>
                                <td className="px-6 py-2 whitespace-nowrap text-sm font-medium">{sale.createdOn}</td>
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
                                                    Edit Category
                                                </span>
                                        </div>

                                        <div className="relative group">
                                            <button
                                                className="p-2 bg-red-100 rounded-full text-red-700 hover:bg-red-200 transition-colors">
                                                <Trash size={15}/>
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

                <nav className="bg-white flex items-center justify-center sm:px-6 pt-4">
                    <div className="flex items-center space-x-2">
                        <button className="flex items-center px-2 py-2 text-sm font-medium text-gray-500 hover:text-gray-700">
                            <ChevronLeft className="mr-2 h-5 w-5" /> Previous
                        </button>
                        <button className="px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white">1</button>
                        <button className="px-4 py-2 border border-transparent text-sm font-medium rounded-md text-gray-500 hover:bg-gray-100">2</button>
                        <button className="px-4 py-2 border border-transparent text-sm font-medium rounded-md text-gray-500 hover:bg-gray-100">3</button>
                        <span className="text-gray-500 px-2">...</span>
                        <button className="flex items-center px-2 py-2 text-sm font-medium text-gray-500 hover:text-gray-700">
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
                                    className="w-full text-sm rounded-md py-2 px-3 border border-gray-300 focus:border-emerald-500 focus:ring-emerald-500"
                                />
                            </div>
                        </div>

                        <div className="mt-10 flex justify-end">
                            <button className="w-1/2  bg-emerald-600 text-white font-semibold py-2.5 rounded-lg hover:bg-emerald-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-emerald-500">
                                Update Unit
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}

export default ManageUnit;