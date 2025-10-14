 import {
    ChevronLeft,
    ChevronRight,
    XCircle,
    Eye,
    Printer,
    RefreshCw,
    SearchCheck,
    Trash,
} from 'lucide-react';
import { useEffect, useState } from 'react';
// Import StokeInvoice component
import StokeInvoice from '../../../components/StokeInvoice';

function QuotationList() {
    // Existing states
    const [selectedIndex, setSelectedIndex] = useState(0);
    const [showQuotationAdd, setShowQuotationAdd] = useState(false);
    // New state for invoice visibility
    const [showInvoice, setShowInvoice] = useState(false);

    // Add sample data to prevent undefined errors
    const salesData = [
        {
            quotationId: 'Q-001',
            grossAmount: '20,000.00',
            discount: '5%',
            discountAmount: '1,000.00',
            netAmount: '19,000.00',
            createBy: 'John Doe',
            createAt: '2025-10-14'
        },
        {
            quotationId: 'Q-002',
            grossAmount: '15,000.00',
            discount: '0%',
            discountAmount: '0.00',
            netAmount: '15,000.00',
            createBy: 'Jane Smith',
            createAt: '2025-10-13'
        }
    ];

    // Existing handlers
    const handleViewQuotation = () => {
        setShowQuotationAdd(true);
    };

    const handleCloseQuotationAdd = () => {
        setShowQuotationAdd(false);
    };

    // New handlers for invoice
    const handleViewInvoice = () => {
        setShowInvoice(true);
    };

    const handleCloseInvoice = () => {
        setShowInvoice(false);
    };

    return (
        <div className={'h-full flex flex-col p-4 sm:p-6 lg:p-8'}>
            <div className="flex justify-between items-center mb-6">
                <h1 className="text-2xl font-semibold text-gray-800">Quotation List</h1>
                <button 
                    onClick={handleViewQuotation}
                    className="bg-emerald-600 text-white px-4 py-2 rounded-md hover:bg-emerald-700 transition-colors"
                >
                    New Quotation
                </button>
            </div>
            
            <div className="flex-1 min-h-0">
                {!showQuotationAdd ? (
                    <div className="bg-white h-full rounded-xl w-full p-4 sm:p-6 lg:p-8 flex flex-col shadow-md">
                        {/* Properly structure the table */}
                        <div className="overflow-x-auto">
                            <table className="min-w-full divide-y divide-gray-200">
                                <thead className="bg-gray-50">
                                    <tr>
                                        <th scope="col" className="px-4 sm:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                            ID
                                        </th>
                                        <th scope="col" className="px-4 sm:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                            Amount
                                        </th>
                                        <th scope="col" className="px-4 sm:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                            Created By
                                        </th>
                                        <th scope="col" className="px-4 sm:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                            Date
                                        </th>
                                        <th scope="col" className="px-4 sm:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                            Actions
                                        </th>
                                    </tr>
                                </thead>
                                <tbody className="bg-white divide-y divide-gray-200">
                                    {salesData.map((sale, index) => (
                                        <tr key={sale.quotationId} 
                                            onClick={() => setSelectedIndex(index)}
                                            className={`cursor-pointer ${index === selectedIndex
                                                ? "bg-green-100 border-l-4 border-green-600"
                                                : "hover:bg-green-50"}`}>
                                            <td className="px-4 sm:px-6 py-4 whitespace-nowrap">
                                                <div className="text-sm font-medium text-gray-900">{sale.quotationId}</div>
                                            </td>
                                            <td className="px-4 sm:px-6 py-4 whitespace-nowrap">
                                                <div className="text-sm text-gray-900">{sale.netAmount}</div>
                                            </td>
                                            <td className="px-4 sm:px-6 py-4 whitespace-nowrap">
                                                <div className="text-sm text-gray-900">{sale.createBy}</div>
                                            </td>
                                            <td className="px-4 sm:px-6 py-4 whitespace-nowrap">
                                                <div className="text-sm text-gray-900">{sale.createAt}</div>
                                            </td>
                                            <td className="px-4 sm:px-6 py-2 whitespace-nowrap text-sm font-medium">
                                                <div className="flex items-center space-x-2">
                                                    {/* Print button */}
                                                    <div className="relative group">
                                                        <button className="p-2 bg-green-100 rounded-full text-green-700 hover:bg-green-200 transition-colors">
                                                            <Printer className="w-5 h-5" />
                                                        </button>
                                                        <span className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 w-max px-2 py-1 text-xs text-white bg-gray-900 rounded-md invisible group-hover:visible opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                                                            Print Quotation
                                                        </span>
                                                    </div>

                                                    {/* Eye button - Updated to open StokeInvoice */}
                                                    <div className="relative group">
                                                        <button
                                                            onClick={(e) => {
                                                                e.stopPropagation();
                                                                setSelectedIndex(index);
                                                                handleViewInvoice();
                                                            }}
                                                            className="p-2 bg-yellow-100 rounded-full text-yellow-700 hover:bg-yellow-200 transition-colors">
                                                            <Eye className="w-5 h-5" />
                                                        </button>
                                                        <span className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 w-max px-2 py-1 text-xs text-white bg-gray-900 rounded-md invisible group-hover:visible opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                                                            View Quotation
                                                        </span>
                                                    </div>

                                                    {/* Delete button */}
                                                    <div className="relative group">
                                                        <button 
                                                            onClick={(e) => e.stopPropagation()}
                                                            className="p-2 bg-red-100 rounded-full text-red-700 hover:bg-red-200 transition-colors">
                                                            <Trash className="w-5 h-5" />
                                                        </button>
                                                        <span className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 w-max px-2 py-1 text-xs text-white bg-gray-900 rounded-md invisible group-hover:visible opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                                                            Delete
                                                        </span>
                                                    </div>
                                                </div>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                        
                        {/* Pagination */}
                        <div className="flex justify-between items-center mt-4 pt-4 border-t border-gray-200">
                            <div className="text-sm text-gray-700">
                                Showing <span className="font-medium">1</span> to <span className="font-medium">2</span> of <span className="font-medium">2</span> results
                            </div>
                            <div className="flex items-center space-x-2">
                                <button className="px-3 py-1 rounded-md bg-gray-200 text-gray-700 hover:bg-gray-300 disabled:opacity-50">
                                    <ChevronLeft className="w-5 h-5" />
                                </button>
                                <button className="px-3 py-1 rounded-md bg-emerald-600 text-white">
                                    1
                                </button>
                                <button className="px-3 py-1 rounded-md bg-gray-200 text-gray-700 hover:bg-gray-300 disabled:opacity-50">
                                    <ChevronRight className="w-5 h-5" />
                                </button>
                            </div>
                        </div>
                    </div>
                ) : (
                    /* Implement basic quotation view */
                    <div className="bg-white h-full rounded-xl w-full p-4 sm:p-6 lg:p-8 flex flex-col shadow-md">
                        <div className="flex justify-between items-center mb-6">
                            <h2 className="text-xl font-semibold text-gray-800">Quotation Details</h2>
                            <button 
                                onClick={handleCloseQuotationAdd}
                                className="p-2 bg-gray-100 rounded-full hover:bg-gray-200"
                            >
                                <XCircle className="w-6 h-6 text-gray-500" />
                            </button>
                        </div>
                        <div className="flex-1">
                            {/* Quotation form would go here */}
                            <p className="text-gray-600">Quotation detail form content</p>
                        </div>
                    </div>
                )}
            </div>

            {/* Conditionally render StokeInvoice */}
            {showInvoice && (
                <StokeInvoice 
                    onClose={handleCloseInvoice} 
                    quotationData={salesData[selectedIndex]} 
                />
            )}
        </div>
    );
}

export default QuotationList;