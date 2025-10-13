import {
    ChartLine,
    ChevronLeft,
    ChevronRight,
    CreditCard,
    Eye,
    Printer,
    RefreshCw,
    Scale,
    SearchCheck,
    Trash,
    Users
} from 'lucide-react';
import { ChartNoAxesCombined } from 'lucide-react';
import { useEffect, useState } from 'react';

function QuatationList() {

    const salesData = [
        {
            quationId: '250929003',
            grossAmount: '25000.00',
            discount: '0.00',
            discountAmount: '650.00',
            netAmount: '650.00',
            createBy: 'shanila',
            createAt: '9/29/2025, 8:51:54 AM',
        },
        {
            quationId: '250929003',
            grossAmount: '25000.00',
            discount: '0.00',
            discountAmount: '650.00',
            netAmount: '650.00',
            createBy: 'shanila',
            createAt: '9/29/2025, 8:51:54 AM',
        }

    ];

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

    return (
        <div className={'h-full'}>
            <div className="h-[30%] flex flex-col gap-4">

                <div>
                    <div className="text-sm text-gray-500 flex items-center">
                        <span>Pages</span>
                        <span className="mx-2">›</span>
                        <span className="text-black">Manage Quotations</span>
                    </div>
                    <h1 className="text-3xl font-semibold text-gray-500 mt-1">Manage Quotations</h1>
                </div>


                <div className="bg-white p-6 pt-3 rounded-xl ">
                    <h2 className="text-xl font-semibold text-[#8C8C8C]">Filter</h2>
                    <div className="mt-2 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 items-end">
                        <div className="">
                            <label htmlFor="invoice-number"
                                className="block text-sm font-medium text-gray-700 mb-1">Quotation ID</label>
                            <input type="text" id="invoice-number" placeholder="Select User"
                                className="w-full text-sm rounded-md py-2 px-2 text-[#737373] border-2 border-gray-100 " />
                        </div>
                        <div className="">
                            <label htmlFor="from-date" className="block text-sm font-medium text-gray-700 mb-1">From
                                Date</label>
                            <div className="">
                                <input type="date" id="from-date" placeholder="Select Date"
                                    className="w-full text-sm rounded-md py-2 px-2 text-[#737373] border-2 border-gray-100 " />
                            </div>
                        </div>
                        <div className="">
                            <label htmlFor="to-date" className="block text-sm font-medium text-gray-700 mb-1">To
                                Date</label>
                            <div className="relative">
                                <input type="date" id="to-date" placeholder="Select Date"
                                    className="w-full text-sm rounded-md py-2 px-2 text-[#737373] border-2 border-gray-100 " />
                            </div>
                        </div>
                        <div className="grid grid-cols-2 w-full gap-2">
                            <button
                                className="w-full flex items-center justify-center bg-emerald-600 text-white px-4 py-2 rounded-md shadow-sm hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500">
                                <SearchCheck className="mr-2" size={14} />
                                Search
                            </button>
                            <button
                                className="w-full flex items-center justify-center bg-gray-400 text-white px-4 py-2 rounded-md shadow-sm hover:bg-gray-300 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-400">
                                <RefreshCw className="mr-2" size={14} />
                                Clear
                            </button>
                        </div>
                    </div>
                </div>
            </div>

            <div className="h-[70%]">
                {/* Sales Table Section */}
                <div className="bg-white h-full rounded-xl w-full p-8">
                    <div className="overflow-x-auto h-[95%]">
                        <table className="min-w-full divide-y divide-gray-200">
                            <thead className="bg-emerald-600 rounded-full">
                                <tr>
                                    {['Quotation ID', 'Gross Amount (LKR)', 'Discount %', 'Discount Amount', 'NET Amount', 'Created By', 'Created AT', 'Actions'].map(header => (
                                        <th key={header} scope="col"
                                            className="px-6 py-3 text-left text-xs font-medium text-white tracking-wider">
                                            {header}
                                        </th>
                                    ))}
                                </tr>
                            </thead>
                            <tbody className="bg-white divide-y divide-gray-200">
                                {salesData.map((sale, index) => (
                                    <tr
                                        key={sale.quationId}
                                        onClick={() => setSelectedIndex(index)}
                                        className={`cursor-pointer ${index === selectedIndex
                                            ? "bg-green-100 border-l-4 border-green-600"
                                            : "hover:bg-green-50"
                                            }`}
                                    >
                                        <td className="px-6 py-2 whitespace-nowrap text-sm font-medium">{sale.quationId}</td>
                                        <td className="px-6 py-2 whitespace-nowrap text-sm font-medium">{sale.grossAmount}</td>
                                        <td className="px-6 py-2 whitespace-nowrap text-sm font-medium">{sale.discount}</td>
                                        <td className="px-6 py-2 whitespace-nowrap text-sm font-medium">{sale.discountAmount}</td>
                                        <td className="px-6 py-2 whitespace-nowrap text-sm font-medium">{sale.netAmount}</td>
                                        <td className="px-6 py-2 whitespace-nowrap text-sm font-medium">{sale.createBy}</td>
                                        <td className="px-6 py-2 whitespace-nowrap text-sm font-medium">{sale.createAt}</td>
                                        <td className="px-6 py-2 whitespace-nowrap text-sm font-medium">
                                            <div className="flex items-center space-x-2">
                                                <div className="relative group">
                                                    <button
                                                        className="p-2 bg-green-100 rounded-full text-green-700 hover:bg-green-200 transition-colors">
                                                        <Printer className="w-5 h-5" />
                                                    </button>
                                                    <span
                                                        className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 w-max px-2 py-1 text-xs text-white bg-gray-900 rounded-md invisible group-hover:visible opacity-0 group-hover:opacity-100 transition-opacity">
                                                        Print Quotation
                                                    </span>
                                                </div>
                                                <div className="relative group">
                                                    <button
                                                        className="p-2 bg-yellow-100 rounded-full text-yellow-700 hover:bg-yellow-200 transition-colors">
                                                        <Eye className="w-5 h-5" />
                                                    </button>
                                                    <span
                                                        className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 w-max px-2 py-1 text-xs text-white bg-gray-900 rounded-md invisible group-hover:visible opacity-0 group-hover:opacity-100 transition-opacity">
                                                        View Quotation
                                                    </span>
                                                </div>
                                                <div className="relative group">
                                                    <button
                                                        className="p-2 bg-red-100 rounded-full text-red-700 hover:bg-red-200 transition-colors">
                                                        <Trash className="w-5 h-5" />
                                                    </button>
                                                    <span
                                                        className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 w-max px-2 py-1 text-xs text-white bg-gray-900 rounded-md invisible group-hover:visible opacity-0 group-hover:opacity-100 transition-opacity">
                                                        View Quotation
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
                    <nav className="bg-white flex items-center justify-center sm:px-6">
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
            </div>
        </div>
    );
}

export default QuatationList;