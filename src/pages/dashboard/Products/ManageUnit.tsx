import { ChevronLeft, ChevronRight, Pencil, Trash } from "lucide-react";
import { useState } from "react";
import ManegerUnitupdate from "../../../components/ManegerUnitupdate";

 
const ActionButtons = ({ onEdit, unitName }: { onEdit: (name: string) => void, unitName: string }) => (
    <div className="flex justify-end gap-2 pr-2">
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
        >
           <Trash className="h-5 w-5" />
        </button>
    </div>
);

 
function ManageUnit() {
    
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [currentUnitName, setCurrentUnitName] = useState("");
    
   
    const unitData = [
        { id: 1, unitName: '02458695', createdOn: '2025-05-02' },
        { id: 2, unitName: 'Kilogram', createdOn: '2025-05-03' },
        { id: 3, unitName: 'Liter', createdOn: '2025-05-04' },
        { id: 4, unitName: 'Piece', createdOn: '2025-05-05' },
    ];
 
    const handleEditClick = (unitName: string) => {
        setCurrentUnitName(unitName);
        setIsModalOpen(true);
    };

    return (
        <div className="relative flex flex-col gap-4 h-full">
           
            <div className={`${isModalOpen ? 'filter blur-sm pointer-events-none' : ''} transition-all duration-300 ease-in-out h-full flex flex-col gap-4`}>
                <div>
                   
                    <div className="text-sm text-gray-500 flex items-center">
                        <span>Pages</span>
                        <span className="mx-2">›</span>
                        <span className="text-black">Manage Unit</span>
                    </div>
                   
                    <h1 className="text-4xl font-semibold text-[#8C8C8C]">Manage Unit</h1>
                </div>

                <div className="flex flex-col bg-[#FFFFFF] rounded-lg shadow-md p-5 flex-grow">
                    
                    
                    <div className="grid grid-cols-12 gap-4 mb-5">
                        
                        
                        <div className="col-span-3">
                            <span className="text-sm text-gray-600 mb-1 block font-semibold">Search Unit</span> 
                            <input
                                type="text"
                                name="search"
                                placeholder="Search Unit"
                                className="justify-between h-11 w-70  border border-gray-300 rounded-lg px-4 focus:outline-none focus:ring-1 focus:ring-gray-400"
                            />
                        </div>

                        
                        <div className="col-span-5"></div>
 
                        <div className="col-span-4 flex  items-end">
                           
                            <div className=" w-full">
                                <span className="text-sm text-gray-600 mb-1 block font-semibold">Unit Name</span>
                                <input
                                    type="text"
                                    name="unitName"
                                    placeholder="Enter New Unit"
                                    className=" h-11 w-70  border border-gray-300 rounded-lg px-4 focus:outline-none focus:ring-1 focus:ring-gray-400"
                                />
                            </div>
                            
                         
                            <button 
                                className="w-55 bg-[#059669] text-white font-semibold px-6 py-2 gap-5 rounded-lg hover:bg-[#059669] h-13 transition duration-150 ease-in-out whitespace-nowrap"
                            >
                                Save Unit
                            </button>
                        </div>
                    </div>

                  
                    <div className="flex flex-col flex-grow   border-gray-200 h-full justify-between">
                        
                        
                        <div className="text-white w-full bg-[#059669]   p-3 rounded-t-lg mt-5">
                           
                            <div className="grid grid-cols-12 text-sm font-bold">
                                <span className="col-span-1">#</span>
                                <span className="col-span-3">Unit Name</span>
                                <span className="col-span-4">Created On</span>
                                <span className="col-span-4 text-right pr-2">Actions</span>
                            </div>
                        </div>

                         
                        <div className="bg-white border-x border-gray-200 divide-y divide-gray-100 flex-grow overflow-y-auto h-full mt-4">
                            {unitData.map((unit) => (
                                <div key={unit.id} className="grid grid-cols-12 py-3 text-sm text-gray-700">
                                    <span className="col-span-1 pl-3">{unit.id}</span>
                                    <span className="col-span-3">{unit.unitName}</span>
                                    <span className="col-span-4">{unit.createdOn}</span>
                                    <div className="col-span-4">
                                        <ActionButtons 
                                            onEdit={handleEditClick} 
                                            unitName={unit.unitName} 
                                        />
                                    </div>
                                </div>
                            ))}
                        </div>
                        
                      
                        <nav className="bg-white flex items-center justify-center border-x border-b border-gray-200 rounded-b-lg py-3 mt-auto">
                            <div className="flex items-center space-x-2">
                                <button className="flex items-center px-2 py-2 text-sm font-medium text-gray-500 hover:text-gray-700">
                                    <ChevronLeft className="mr-2 h-5 w-5"/> Previous
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
                                    Next <ChevronRight className="ml-2 h-5 w-5"/>
                                </button>
                            </div>
                        </nav>
                    </div>
                </div>
            </div>
            
           
            <ManegerUnitupdate 
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                currentUnitName={currentUnitName}
            />
        </div>
    );
}

export default ManageUnit;