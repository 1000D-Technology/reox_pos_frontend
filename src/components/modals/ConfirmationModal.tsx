interface ConfirmationModalProps {
    isOpen: boolean;
    title: string;
    message: string;
    itemName: string;
    itemType: string;
    onConfirm: () => void;
    onCancel: () => void;
    isLoading?: boolean;
    confirmButtonText?: string;
    loadingText?: string;
    cancelButtonText?: string;
    isDanger?: boolean;
}

function ConfirmationModal({
    isOpen,
    title,
    message,
    itemName,
    itemType,
    onConfirm,
    onCancel,
    isLoading = false,
    confirmButtonText = "Delete",
    loadingText = "Deleting...",
    cancelButtonText = "Cancel",
    isDanger = true
}: ConfirmationModalProps) {
    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
            <div className="bg-white rounded-2xl shadow-xl p-8 w-full max-w-md relative">
                <h2 className={`text-2xl font-bold mb-4 ${isDanger ? 'text-red-600' : 'text-gray-800'}`}>
                    {title}
                </h2>
                
                <p className="text-gray-700 mb-6">
                    {message.replace('{itemType}', itemType)}{' '}
                    <span className={`font-semibold ${isDanger ? 'text-red-600' : 'text-blue-600'}`}>
                        "{itemName}"
                    </span>?
                    <br />
                    <br />
                    <span className={`text-sm ${isDanger ? 'text-red-500' : 'text-gray-500'}`}>
                        This action cannot be undone.
                    </span>
                </p>
                
                <div className="flex justify-end space-x-4">
                    <button 
                        onClick={onCancel}
                        disabled={isLoading}
                        className="px-4 py-2 text-gray-600 border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50">
                        {cancelButtonText}
                    </button>
                    <button 
                        onClick={onConfirm}
                        disabled={isLoading}
                        className={`px-4 py-2 text-white rounded-lg disabled:opacity-50 disabled:cursor-not-allowed ${
                            isDanger 
                                ? 'bg-red-600 hover:bg-red-700' 
                                : 'bg-blue-600 hover:bg-blue-700'
                        }`}>
                        {isLoading ? loadingText : confirmButtonText}
                    </button>
                </div>
            </div>
        </div>
    );
}

export default ConfirmationModal;