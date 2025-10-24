 import { CircleX } from 'lucide-react';
import { useState, useEffect } from 'react';

interface UpdateUnitModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentUnitName: string;
}

const UpdateUnitModal = ({ isOpen, onClose, currentUnitName }: UpdateUnitModalProps) => {
  const [newUnitName, setNewUnitName] = useState('');

 
  useEffect(() => {
    if (isOpen) {
      setNewUnitName(currentUnitName); 
    }
  }, [isOpen, currentUnitName]);

  if (!isOpen) return null;

  const handleUpdate = () => {
     
    console.log(`Updating unit from "${currentUnitName}" to "${newUnitName}"`);
    alert(`Unit "${currentUnitName}" updated to "${newUnitName}"`);
    onClose(); 
  };

  return (
    <div className="fixed inset-0 backdrop-blur-[2px] ... bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-xl p-6 w-full max-w-md mx-auto relative">
       
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 transition"
          title="Close"
        >
          <CircleX />
        </button>

       
        <div className="w-10/12 mx-auto h-auto flex flex-col justify-center">
        <h2 className="text-2xl font-semibold text-[#525252] mb-6">Update Unit</h2>

      
        <div className="mb-8">
          <span className="text-gray-700 text-Geist font-semibold">Current Unit Name : </span>
          <span className="text-[#059669] text-Geist font-bold">{currentUnitName}</span>
        </div>

        
        <div className="mb-8">
          <label htmlFor="newUnitName" className="block text-gray-700 text-Geist font-semibold mb-2">New Unit Name</label>
          <input
            type="text"
            id="newUnitName"
            placeholder="Enter New Unit"
            value={newUnitName}
            onChange={(e) => setNewUnitName(e.target.value)}
            className="w-full h-11 border border-gray-300 rounded-lg px-4 focus:outline-none focus:ring-1 focus:ring-gray-400"
          />
        </div>

       
        <div className="flex justify-end">
          <button
            onClick={handleUpdate}
            className="bg-[#059669] text-white font-semibold px-6 py-2 rounded-lg hover:bg-[#047857] h-11 transition duration-150 ease-in-out whitespace-nowrap"
          >
            Update Unit
          </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default UpdateUnitModal;