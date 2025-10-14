 import {
    ChevronLeft,
    ChevronRight,
    XCircle, // Renamed from CircleXIcon to XCircle for Lucide React
    Eye,
    Printer,
    RefreshCw,
    SearchCheck,
    Trash,
} from 'lucide-react';

import { useEffect, useState } from 'react';

function QuotationList() {

    const salesData = [
        {
            quotationId: '250929003',
            grossAmount: '25000.00',
            discount: '0.00',
            discountAmount: '650.00',
            netAmount: '650.00',
            createBy: 'shanila',
            createAt: '9/29/2025, 8:51:54 AM',
        },
        {
            quotationId: '250929004', // Fixed 'quationId' to 'quotationId' for consistency
            grossAmount: '25000.00',
            discount: '0.00',
            discountAmount: '650.00',
            netAmount: '650.00',
            createBy: 'john',
            createAt: '9/29/2025, 9:00:00 AM',
        },
        {
            quotationId: '250929005',
            grossAmount: '15000.00',
            discount: '5.00',
            discountAmount: '750.00',
            netAmount: '14250.00',
            createBy: 'doe',
            createAt: '9/30/2025, 10:30:00 AM',
        },
    ];

    // 🔹 Selected row state
    const [selectedIndex, setSelectedIndex] = useState(0);
    // 🔹 State to control the visibility of the Quotation Add div
    const [showQuotationAdd, setShowQuotationAdd] = useState(false);

    // 🔹 Handle Up / Down arrow keys
    useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            if (e.key === "ArrowDown") {
                e.preventDefault(); // Prevent default scroll behavior
                setSelectedIndex((prev) => (prev < salesData.length - 1 ? prev + 1 : prev));
            } else if (e.key === "ArrowUp") {
                e.preventDefault(); // Prevent default scroll behavior
                setSelectedIndex((prev) => (prev > 0 ? prev - 1 : prev));
            }
        };

        window.addEventListener("keydown", handleKeyDown);
        return () => window.removeEventListener("keydown", handleKeyDown);
    }, [salesData.length]);

    // 🔹 Function to handle opening the quotation add view
    const handleViewQuotation = () => {
        setShowQuotationAdd(true);
    };

    // 🔹 Function to handle closing the quotation add view
    const handleCloseQuotationAdd = () => {
        setShowQuotationAdd(false);
    };

    return (
        <div className={'h-full flex flex-col p-4 sm:p-6 lg:p-8'}>
            <div className="h-auto mb-6 flex flex-col gap-4"> {/* Changed h-[27%] to h-auto for responsiveness */}

                <div>
                    <div className="text-sm text-gray-500 flex items-center">
                        <span>Pages</span>
                        <span className="mx-2">›</span>
                        <span className="text-black">Manage Quotations</span>
                    </div>
                    <h1 className="text-2xl sm:text-3xl font-semibold text-gray-500 mt-1">Manage Quotations</h1>
                </div>


                <div className="bg-white p-4 sm:p-6 pt-3 rounded-xl shadow-md">
                    <h2 className="text-lg sm:text-xl font-semibold text-[#8C8C8C]">Filter</h2>
                    <div className="mt-2 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6 items-end">
                        <div className="">
                            <label htmlFor="quotation-id"
                                className="block text-sm font-medium text-gray-700 mb-1">Quotation ID</label>
                            <input type="text" id="quotation-id" placeholder="Enter Quotation ID"
                                className="w-full text-sm rounded-md py-2 px-2 text-[#737373] border-2 border-gray-100 focus:ring-emerald-500 focus:border-emerald-500" />
                        </div>
                        <div className="">
                            <label htmlFor="from-date" className="block text-sm font-medium text-gray-700 mb-1">From
                                Date</label>
                            <div className="">
                                <input type="date" id="from-date" placeholder="Select Date"
                                    className="w-full text-sm rounded-md py-2 px-2 text-[#737373] border-2 border-gray-100 focus:ring-emerald-500 focus:border-emerald-500" />
                            </div>
                        </div>
                        <div className="">
                            <label htmlFor="to-date" className="block text-sm font-medium text-gray-700 mb-1">To
                                Date</label>
                            <div className="relative">
                                <input type="date" id="to-date" placeholder="Select Date"
                                    className="w-full text-sm rounded-md py-2 px-2 text-[#737373] border-2 border-gray-100 focus:ring-emerald-500 focus:border-emerald-500" />
                            </div>
                        </div>
                        <div className="grid grid-cols-1 sm:grid-cols-2 w-full gap-2">
                            <button
                                className="w-full flex items-center justify-center bg-emerald-600 text-white px-4 py-2 rounded-md shadow-sm hover:bg-emerald-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-emerald-500 text-sm">
                                <SearchCheck className="mr-2" size={16} />
                                Search
                            </button>
                            <button
                                className="w-full flex items-center justify-center bg-gray-400 text-white px-4 py-2 rounded-md shadow-sm hover:bg-gray-500 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-400 text-sm">
                                <RefreshCw className="mr-2" size={16} />
                                Clear
                            </button>
                        </div>
                    </div>
                </div>
            </div>

            <div className="flex-1 min-h-0"> {/* Use flex-1 and min-h-0 to make it fill remaining space */}
                {/* Sales Table Section */}
                {!showQuotationAdd ? (
                    <div className="bg-white h-full rounded-xl w-full p-4 sm:p-6 lg:p-8 flex flex-col shadow-md">
                        <div className="overflow-x-auto flex-1 mb-4"> {/* flex-1 to allow table to grow */}
                            <table className="min-w-full divide-y divide-gray-200">
                                <thead className="bg-emerald-600 rounded-lg"> {/* Adjusted rounded-full to rounded-lg */}
                                    <tr>
                                        {['Quotation ID', 'Gross Amount (LKR)', 'Discount %', 'Discount Amount', 'NET Amount', 'Created By', 'Created AT', 'Actions'].map(header => (
                                            <th key={header} scope="col"
                                                className="px-4 sm:px-6 py-3 text-left text-xs font-medium text-white uppercase tracking-wider">
                                                {header}
                                            </th>
                                        ))}
                                    </tr>
                                </thead>
                                <tbody className="bg-white divide-y divide-gray-200">
                                    {salesData.map((sale, index) => (
                                        <tr
                                            key={sale.quotationId} // Changed key to quotationId for uniqueness
                                            onClick={() => setSelectedIndex(index)}
                                            className={`cursor-pointer ${index === selectedIndex
                                                ? "bg-green-100 border-l-4 border-green-600"
                                                : "hover:bg-green-50"
                                                }`}
                                        >
                                            <td className="px-4 sm:px-6 py-2 whitespace-nowrap text-sm font-medium text-gray-900">{sale.quotationId}</td>
                                            <td className="px-4 sm:px-6 py-2 whitespace-nowrap text-sm text-gray-500">{sale.grossAmount}</td>
                                            <td className="px-4 sm:px-6 py-2 whitespace-nowrap text-sm text-gray-500">{sale.discount}</td>
                                            <td className="px-4 sm:px-6 py-2 whitespace-nowrap text-sm text-gray-500">{sale.discountAmount}</td>
                                            <td className="px-4 sm:px-6 py-2 whitespace-nowrap text-sm text-gray-500">{sale.netAmount}</td>
                                            <td className="px-4 sm:px-6 py-2 whitespace-nowrap text-sm text-gray-500">{sale.createBy}</td>
                                            <td className="px-4 sm:px-6 py-2 whitespace-nowrap text-sm text-gray-500">{sale.createAt}</td>
                                            <td className="px-4 sm:px-6 py-2 whitespace-nowrap text-sm font-medium">
                                                <div className="flex items-center space-x-2">
                                                    <div className="relative group">
                                                        <button
                                                            className="p-2 bg-green-100 rounded-full text-green-700 hover:bg-green-200 transition-colors">
                                                            <Printer className="w-5 h-5" />
                                                        </button>
                                                        <span
                                                            className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 w-max px-2 py-1 text-xs text-white bg-gray-900 rounded-md invisible group-hover:visible opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                                                            Print Quotation
                                                        </span>
                                                    </div>


                                                    <div className="relative group">
                                                        <button
                                                            onClick={handleViewQuotation}
                                                            className="p-2 bg-yellow-100 rounded-full text-yellow-700 hover:bg-yellow-200 transition-colors">
                                                            <Eye className="w-5 h-5" />
                                                        </button>
                                                        <span
                                                            className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 w-max px-2 py-1 text-xs text-white bg-gray-900 rounded-md invisible group-hover:visible opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                                                            View Quotation
                                                        </span>
                                                    </div>


                                                    <div className="relative group">
                                                        <button
                                                            className="p-2 bg-red-100 rounded-full text-red-700 hover:bg-red-200 transition-colors">
                                                            <Trash className="w-5 h-5" />
                                                        </button>
                                                        <span
                                                            className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 w-max px-2 py-1 text-xs text-white bg-gray-900 rounded-md invisible group-hover:visible opacity-0 group-hover:opacity-100 transition-opacity duration-300">
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
                        <nav className="bg-white flex items-center justify-center py-3">
                            <div className="flex items-center space-x-2">
                                <button className="flex items-center px-2 py-2 text-sm font-medium text-gray-500 hover:text-gray-700">
                                    <ChevronLeft className="mr-2 h-5 w-5" /> Previous
                                </button>
                                <button className="px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50">1</button>
                                <button className="px-4 py-2 border border-transparent text-sm font-medium rounded-md text-gray-500 hover:bg-gray-100">2</button>
                                <button className="px-4 py-2 border border-transparent text-sm font-medium rounded-md text-gray-500 hover:bg-gray-100">3</button>
                                <span className="text-gray-500 px-2">...</span>
                                <button className="flex items-center px-2 py-2 text-sm font-medium text-gray-500 hover:text-gray-700">
                                    Next <ChevronRight className="ml-2 h-5 w-5" />
                                </button>
                            </div>
                        </nav>
                    </div>
                ) : (
                    // This is the "Quotation Add" view, now containing the invoice structure
                    <div className="relative flex items-center justify-center h-full p-4"> {/* Added relative and padding */}
                        <div className="bg-white rounded-lg shadow-xl max-w-4xl w-full mx-auto p-6 sm:p-8 lg:p-10 relative"> {/* Adjusted max-w and padding */}
                            {/* Close button positioned at the top-right corner of the invoice */}
                            <div className="absolute top-4 right-4 z-10">
                                <button
                                    onClick={handleCloseQuotationAdd}
                                    className="p-2 text-black rounded-full bg-gray-100 hover:bg-gray-200 transition-colors"
                                    aria-label="Close"
                                >
                                    <XCircle className="w-6 h-6" />
                                </button>
                            </div>

                            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6">
                                <h1 className=" font-bold text-2xl text-gray-800 mb-2 ">COMPANY NAME</h1>
                                <div className="text-right">
                                    <h2 className=" font-bold text-2xl text-gray-800">INVOICE</h2> {/* Changed to QUOTATION */}
                                </div>
                            </div>

                            <div className="bg-emerald-600 text-white p-3 sm:p-4 rounded-md mb-6 flex flex-col sm:flex-row justify-between text-sm sm:text-base">
                                <div className="mb-1 sm:mb-0">
                                    <span className="font-semibold">INVOICE #:</span> 245254
                                </div>
                                <div className="mb-1 sm:mb-0 bg-white text-black p-1 rounded-md">
                                <div>
                                    <span className="font-semibold">Date:</span> 05/01/2025
                                </div>
                                </div>
                            </div>

                            <div className="overflow-x-auto mb-6">
                                <table className="min-w-full divide-y divide-gray-200">
                                    <thead className="bg-emerald-600">
                                        <tr>
                                            <th scope="col" className="px-4 sm:px-6 py-3 text-left text-xs font-medium text-white uppercase tracking-wider">
                                                SL
                                            </th>
                                            <th scope="col" className="px-4 sm:px-6 py-3 text-left text-xs font-medium text-white uppercase tracking-wider">
                                                Product Name
                                            </th>
                                            <th scope="col" className="px-4 sm:px-6 py-3 text-left text-xs font-medium text-white uppercase tracking-wider">
                                                Price
                                            </th>
                                            <th scope="col" className="px-4 sm:px-6 py-3 text-left text-xs font-medium text-white uppercase tracking-wider">
                                                Qty
                                            </th>
                                            <th scope="col" className="px-4 sm:px-6 py-3 text-left text-xs font-medium text-white uppercase tracking-wider">
                                                Total
                                            </th>
                                        </tr>
                                    </thead>
                                    <tbody className="bg-white divide-y divide-gray-200">
                                        <tr>
                                            <td className="px-4 sm:px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">1</td>
                                            <td className="px-4 sm:px-6 py-4 whitespace-nowrap text-sm text-gray-500">Sugar</td>
                                            <td className="px-4 sm:px-6 py-4 whitespace-nowrap text-sm text-gray-500">5000.00</td>
                                            <td className="px-4 sm:px-6 py-4 whitespace-nowrap text-sm text-gray-500">2</td>
                                            <td className="px-4 sm:px-6 py-4 whitespace-nowrap text-sm text-gray-500">10000.00</td>
                                        </tr>
                                        <tr>
                                            <td className="px-4 sm:px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">2</td>
                                            <td className="px-4 sm:px-6 py-4 whitespace-nowrap text-sm text-gray-500">Flour</td>
                                            <td className="px-4 sm:px-6 py-4 whitespace-nowrap text-sm text-gray-500">2000.00</td>
                                            <td className="px-4 sm:px-6 py-4 whitespace-nowrap text-sm text-gray-500">5</td>
                                            <td className="px-4 sm:px-6 py-4 whitespace-nowrap text-sm text-gray-500">10000.00</td>
                                        </tr>
                                    </tbody>
                                </table>
                            </div>

                            <div className="flex justify-end  mt-28">
                                <div className="w-full sm:w-1/2">
                                    <div className="flex justify-between py-2 border-t border-gray-200">
                                        <span className="text-sm font-medium text-gray-700">Subtotal:</span>
                                        <span className="text-sm font-medium text-gray-900">20000.00</span>
                                    </div>
                                    <div className="flex justify-between py-2 border-b border-gray-200">
                                        <span className="text-sm font-medium text-gray-700">Tax:</span>
                                        <span className="text-sm font-medium text-gray-900">0.00</span>
                                    </div>
                                    <div className="flex justify-between py-2 bg-black text-white px-4 rounded-b-md">
                                        <span className="text-base sm:text-lg font-bold">Total:</span>
                                        <span className="text-base sm:text-lg font-bold">20000.00</span>
                                    </div>
                                </div>
                            </div>

                            <div className="mt-8 text-start text-sm text-gray-600">
                                Thank you for your business!
                            </div>

                            <div className="mt-4 p-4 rounded-md text-xs text-gray-500">
                                <h3 className="font-semibold text-gray-700 mb-1">Terms & Condition</h3>
                                All quotations are valid for 30 days. Prices are subject to change without prior notice.
                            </div>

                            <div className="mt-12 text-right">
                                <div className="border-t border-gray-300 inline-block pt-2 px-8">
                                    <span className="text-sm font-medium text-gray-700">Authorized Sign</span>
                                </div>
                            </div>
                        </div>
                    </div>

                )}
            </div>
        </div>
    );
}

export default QuotationList;