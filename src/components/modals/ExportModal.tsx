
import React from 'react';
import { Download, FileText, Table, X } from 'lucide-react';

interface ExportModalProps {
    isOpen: boolean;
    onClose: () => void;
    onExport: (scope: 'all' | 'current') => void;
    type: 'excel' | 'csv' | 'pdf';
    isLoading: boolean;
    entityName?: string;
}

const ExportModal: React.FC<ExportModalProps> = ({ isOpen, onClose, onExport, type, isLoading, entityName = "Stock" }) => {
    if (!isOpen) return null;

    const getIcon = () => {
        switch (type) {
            case 'excel': return <Table className="text-emerald-600" size={32} />;
            case 'csv': return <FileText className="text-blue-600" size={32} />;
            case 'pdf': return <FileText className="text-red-600" size={32} />;
        }
    };

    const getTitle = () => {
        switch (type) {
            case 'excel': return 'Export Excel';
            case 'csv': return 'Export CSV';
            case 'pdf': return 'Export PDF';
        }
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-xs p-4 animate-in fade-in duration-200">
            <div className="bg-white rounded-2xl shadow-xl w-full max-w-md overflow-hidden animate-in zoom-in-95 duration-200">
                <div className="p-6">
                    <div className="flex justify-between items-start mb-6">
                        <div className="flex items-center gap-3">
                            <div className="p-3 bg-gray-50 rounded-xl">
                                {getIcon()}
                            </div>
                            <div>
                                <h3 className="text-xl font-bold text-gray-800">{getTitle()}</h3>
                                <p className="text-sm text-gray-500">Choose export scope</p>
                            </div>
                        </div>
                        <button 
                            onClick={onClose}
                            className="text-gray-400 hover:text-gray-600 p-1 hover:bg-gray-100 rounded-lg transition-colors"
                        >
                            <X size={20} />
                        </button>
                    </div>

                    <div className="space-y-3">
                        <button
                            onClick={() => onExport('all')}
                            disabled={isLoading}
                            className="w-full flex items-center justify-between p-4 border-2 border-gray-100 rounded-xl hover:border-emerald-500 hover:bg-emerald-50 transition-all group group-hover:shadow-md"
                        >
                            <div className="text-left">
                                <span className="block font-semibold text-gray-800 group-hover:text-emerald-700">All {entityName}</span>
                                <span className="text-xs text-gray-500 group-hover:text-emerald-600">Export entire {entityName.toLowerCase()} database</span>
                            </div>
                            <Download size={20} className="text-gray-300 group-hover:text-emerald-600" />
                        </button>

                        <button
                            onClick={() => onExport('current')}
                            disabled={isLoading}
                            className="w-full flex items-center justify-between p-4 border-2 border-gray-100 rounded-xl hover:border-blue-500 hover:bg-blue-50 transition-all group"
                        >
                            <div className="text-left">
                                <span className="block font-semibold text-gray-800 group-hover:text-blue-700">Current View</span>
                                <span className="text-xs text-gray-500 group-hover:text-blue-600">Export currently visible table rows</span>
                            </div>
                            <Download size={20} className="text-gray-300 group-hover:text-blue-600" />
                        </button>
                    </div>

                    {isLoading && (
                        <div className="mt-4 flex items-center justify-center text-sm text-gray-500">
                            <span className="w-4 h-4 border-2 border-gray-300 border-t-emerald-500 rounded-full animate-spin mr-2"></span>
                            Preparing export...
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default ExportModal;
