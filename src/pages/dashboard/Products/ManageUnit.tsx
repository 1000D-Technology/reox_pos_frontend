 import { ChevronLeft, ChevronRight, Pencil, Trash } from "lucide-react";
import { useState, useEffect } from "react";
import ManegerUnitupdate from "../../../components/ManegerUnitupdate";

// --- Helper component for the Action Buttons (Edit and Delete) ---
const ActionButtons = ({ onEdit, onDelete, unitName }: { onEdit: (name: string) => void, onDelete: (name: string) => void, unitName: string }) => (
    <div className="flex justify-start gap-2 pl-2">
        <button 
            className="w-8 h-8 flex items-center justify-center rounded-full bg-green-100 text-[#059669] hover:bg-green-200 transition"
            title="Edit"
            onClick={(e) => {
                e.stopPropagation();
                onEdit(unitName);
            }}
        >
            <Pencil className="h-5 w-5" />
        </button>
        <button 
            className="w-8 h-8 flex items-center justify-center rounded-full bg-red-100 text-red-500 hover:bg-red-200 transition"
            title="Delete"
            onClick={(e) => {
                e.stopPropagation();
                onDelete(unitName);
            }}
        >
           <Trash className="h-5 w-5" />
        </button>
    </div>
);

// --- Main Component ---
function ManageUnit() {
    // Modal state
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [currentUnitName, setCurrentUnitName] = useState("");
    const [selectedIndex, setSelectedIndex] = useState(0);
    
    // Sample Data to populate the table
    const unitData = [
        { id: 1, unitName: '02458695', createdOn: '2025-05-02' },
        { id: 2, unitName: 'Kilogram', createdOn: '2025-05-03' },
        { id: 3, unitName: 'Liter', createdOn: '2025-05-04' },
        { id: 4, unitName: 'Piece', createdOn: '2025-05-05' },
    ];

    // Handle edit button click to open the modal
    const handleEditClick = (unitName: string) => {
        setCurrentUnitName(unitName);
        setIsModalOpen(true);
    };

    // Handle delete button click
    const handleDeleteClick = (unitName: string) => {
        // Implement delete logic here, e.g., confirm and remove from unitData
        if (window.confirm(`Are you sure you want to delete the unit "${unitName}"?`)) {
            // For now, just log; in real app, update state or call API
            console.log(`Deleting unit: ${unitName}`);
            // Example: setUnitData(unitData.filter(unit => unit.unitName !== unitName));
        }
    };

    useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
          if (e.key === "ArrowDown") {
            setSelectedIndex((prev) => (prev < unitData.length - 1 ? prev + 1 : prev));
          } else if (e.key === "ArrowUp") {
            setSelectedIndex((prev) => (prev > 0 ? prev - 1 : prev));
          }
        };
    
        window.addEventListener("keydown", handleKeyDown);
        return () => window.removeEventListener("keydown", handleKeyDown);
      }, [unitData.length]);

    return (
        <div className="relative flex flex-col gap-4 h-full">
            {/* Main content - conditionally apply blur class */}
            <div className={`${isModalOpen ? 'filter blur-sm pointer-events-none' : ''} transition-all duration-300 ease-in-out h-full flex flex-col gap-4`}>
                <div>
                    {/* Breadcrumb Navigation */}
                    <div className="text-sm text-gray-500 flex items-center">
                        <span>Pages</span>
                        <span className="mx-2">›</span>
                        <span className="text-black">Manage Unit</span>
                    </div>
                    {/* Page Title */}
                    <h1 className="text-3xl font-semibold text-gray-500">Manage Unit</h1>
                </div>

                <div className="flex flex-col bg-[#FFFFFF] rounded-lg shadow-md p-5 flex-grow">
                    
                    {/* Search and Save Unit Section */}
                    <div className="grid grid-cols gap-10 mb-5">
                        
                        <div className="flex flex-wrap justify-between items-end mb-5 gap-4">
                            
                            {/* Search Unit Section */}
                            <div className="w-full md:w-auto">
                                <span className="text-sm text-[#3a3737] mb-1 block font-Geist">Search Unit</span>
                                <input
                                    type="text"
                                    name="search"
                                    placeholder="Search Unit"
                                    className="w-full md:w-64 h-11 border border-gray-300 rounded-lg px-4 focus:outline-none focus:ring-1 focus:ring-gray-400"
                                />
                            </div>

                            {/* Unit Name Input and Save Unit Button Section */}
                            <div className="w-full md:w-auto flex gap-2 items-end">
                                {/* Unit Name Input */}
                                <div>
                                    <span className="text-sm  text-[#2a2828] mb-1 block font-Geist">Unit Name</span>
                                    <input
                                        type="text"
                                        name="unitName"
                                        placeholder="Enter New Unit"
                                        className="w-full md:w-64 h-11 border border-gray-300 rounded-lg px-4 focus:outline-none focus:ring-1 focus:ring-gray-400"
                                    />
                                </div>
                                
                                {/* Save Unit Button */}
                                <button 
                                    className="bg-[#059669] text-[#fffafa]  block font-Geist px-6 py-2 rounded-lg hover:bg-[#047857] h-13 mt-1 w-40 gap-10 transition duration-150 ease-in-out whitespace-nowrap"
                                >
                                    Save Unit
                                </button>
                            </div>
                        </div>
                    </div>

                    {/* --- Unit List Table --- */}
                     {/* --- Unit List Table --- */}
<div className="flex flex-col flex-grow border-gray-200 h-full rounded-t-2xl">
    
    {/* Table */}
    <div className="overflow-y-auto max-h-md md:h-[320px] lg:h-[500px] rounded-t-lg scrollbar-thin scrollbar-thumb-gray-300 scrollbar-track-gray-100">
        <table className="min-w-full divide-y divide-gray-200 table-fixed">
            <thead className="bg-emerald-600 sticky top-0 z-10 h-12">
                <tr>
                    <th scope="col" className="w-[10%] px-4 py-2 text-left text-md font-Geist text-white uppercase tracking-wider">
                        #
                    </th>
                    <th scope="col" className="w-[35%] px-4 py-2 text-left  text-md font-Geist text-white uppercase tracking-wider">
                        Unit Name
                    </th>
                    <th scope="col" className="w-[35%] px-4 py-2 text-left  text-md font-Geist text-white uppercase tracking-wider">
                        Created On
                    </th>
                    <th scope="col" className="w-[20%] px-8 py-2 text-left  text-md font-Geist text-white uppercase tracking-wider">
                        Actions
                    </th>
                </tr>
            </thead>

            <tbody className="bg-white divide-y divide-gray-200">
                {unitData.map((unit, index) => (
                    <tr
                        key={unit.id}
                        data-index={index}
                        className={`hover:bg-gray-50 h-12 ${
                            index === selectedIndex ? "bg-green-100 border-l-4 border-green-600" : ""
                        }`}
                    >
                        <td className="w-[10%] px-4 py-2 whitespace-nowrap text-sm font-medium text-gray-900">
                            {unit.id}
                        </td>
                        <td className="w-[35%] px-4 py-2 whitespace-nowrap text-sm text-gray-700">
                            {unit.unitName}
                        </td>
                        <td className="w-[35%] px-4 py-2 whitespace-nowrap text-sm text-gray-700">
                            {unit.createdOn}
                        </td>
                        <td className="w-[20%] px-4 py-2 whitespace-nowrap text-sm font-medium">
                            <ActionButtons
                                onEdit={handleEditClick}
                                onDelete={handleDeleteClick}
                                unitName={unit.unitName}
                            />
                        </td>
                    </tr>
                ))}
            </tbody>
        </table>
    </div>

    {/* Pagination */}
    <nav className="bg-white flex items-center justify-center border-x border-b border-gray-200 rounded-b-lg py-3 mt-auto">
        <div className="flex items-center space-x-2">
            <button className="flex items-center px-2 py-2 text-sm font-medium text-gray-500 hover:text-gray-700">
                <ChevronLeft className="mr-2 h-5 w-5" /> Previous
            </button>
            <button className="px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white">
                1
            </button>
            <button className="px-4 py-2 border border-transparent text-sm font-medium rounded-md text-gray-500 hover:bg-gray-100">
                2
            </button>
            <button className="px-4 py-2 border border-transparent text-sm font-medium rounded-md text-gray-500 hover:bg-gray-100">
                3
            </button>
            <span className="text-gray-500 px-2">...</span>
            <button className="flex items-center px-2 py-2 text-sm font-medium text-gray-500 hover:text-gray-700">
                Next <ChevronRight className="ml-2 h-5 w-5" />
            </button>
        </div>
    </nav>
</div>
                </div>
            </div>
            
            {/* Update Unit Modal - Positioned absolutely */}
            <ManegerUnitupdate 
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                currentUnitName={currentUnitName}
            />
        </div>
    );
}

export default ManageUnit;