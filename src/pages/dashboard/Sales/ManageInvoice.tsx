import {
    CalendarDays,
    ChartNoAxesCombined,
    ChevronLeft,
    ChevronRight,
    Eye,
    FileSpreadsheet,
    Printer,
    RefreshCw,
    SearchCheck,
    ArrowUpRight,
    ArrowDownRight,
} from "lucide-react";
import { useEffect, useState } from "react";


function ManageInvoice() {
    const summaryCards = [
        {
            icon: ChartNoAxesCombined,
            label: 'Total Sales',
            value: 'LKR 500,000.00',
            trend: '+12%',
            color: 'bg-gradient-to-br from-emerald-400 to-emerald-500',
            iconColor: 'text-white',
            bgGlow: 'shadow-emerald-200'
        },
        {
            icon: FileSpreadsheet,
            label: 'Total Invoice',
            value: '50',
            trend: '+8%',
            color: 'bg-gradient-to-br from-blue-400 to-blue-500',
            iconColor: 'text-white',
            bgGlow: 'shadow-blue-200'
        },
        {
            icon: CalendarDays,
            label: 'Date Range',
            value: '6 Days',
            trend: '-3%',
            color: 'bg-gradient-to-br from-purple-400 to-purple-500',
            iconColor: 'text-white',
            bgGlow: 'shadow-purple-200'
        },
    ];

    const InvoiceData = [
        {
            invoiceID: '250929003',
            totalAmount: '5200.00',
            issuedDate: 'Unknown',
            cashier: '0.00',
        },
        {
            invoiceID: '250929004',
            totalAmount: '3500.00',
            issuedDate: '2025-01-15',
            cashier: 'John Doe',
        },
        {
            invoiceID: '250929005',
            totalAmount: '8900.00',
            issuedDate: '2025-01-16',
            cashier: 'Jane Smith',
        },
    ];

    const [selectedIndex, setSelectedIndex] = useState(0);

    useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            if (e.key === "ArrowDown") {
                e.preventDefault();
                setSelectedIndex((prev) => (prev < InvoiceData.length - 1 ? prev + 1 : prev));
            } else if (e.key === "ArrowUp") {
                e.preventDefault();
                setSelectedIndex((prev) => (prev > 0 ? prev - 1 : prev));
            }
        };

        window.addEventListener("keydown", handleKeyDown);
        return () => window.removeEventListener("keydown", handleKeyDown);
    }, [InvoiceData.length]);

    return (
        <>
            <div className={'flex flex-col gap-4 h-full'}>
                <div>
                    <div className="text-sm text-gray-400 flex items-center">
                        <span>Sales</span>
                        <span className="mx-2">›</span>
                        <span className="text-gray-700 font-medium">Manage Invoice</span>
                    </div>
                    <h1 className="text-3xl font-semibold bg-gradient-to-r from-gray-800 to-gray-600 bg-clip-text text-transparent">
                        Manage Invoice
                    </h1>
                </div>

                <div className={'grid md:grid-cols-3 grid-cols-1 gap-4'}>
                    {summaryCards.map((stat, i) => (
                        <div
                            key={i}
                            className={`flex items-center p-4 space-x-3 transition-all bg-white rounded-2xl shadow-lg hover:shadow-xl ${stat.bgGlow} cursor-pointer group relative overflow-hidden`}
                        >
                            <div className="absolute inset-0 bg-gradient-to-br from-transparent via-gray-50/50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>

                            <div className={`p-3 rounded-full ${stat.color} shadow-md relative z-10`}>
                                <stat.icon className={`w-6 h-6 ${stat.iconColor}`} />
                            </div>

                            <div className="w-px h-10 bg-gray-200"></div>

                            <div className="relative z-10 flex-1">
                                <div className="flex items-center justify-between">
                                    <p className="text-sm text-gray-500">{stat.label}</p>
                                    <div className={`flex items-center gap-0.5 text-[10px] font-semibold ${stat.trend.startsWith('+') ? 'text-emerald-600' : 'text-red-600'}`}>
                                        {stat.trend.startsWith('+') ? <ArrowUpRight className="w-3 h-3" /> : <ArrowDownRight className="w-3 h-3" />}
                                        {stat.trend}
                                    </div>
                                </div>
                                <p className="text-sm font-bold text-gray-700">{stat.value}</p>
                            </div>
                        </div>
                    ))}
                </div>

                <div className={'bg-white rounded-xl p-4 flex flex-col shadow-lg'}>
                    <h2 className="text-xl font-semibold text-gray-700 mb-3">Filter</h2>
                    <div className={'grid md:grid-cols-4 gap-4'}>
                        <div>
                            <label htmlFor="invoice-number"
                                   className="block text-sm font-medium text-gray-700 mb-1">Invoice Number</label>
                            <input type="text" id="invoice-number" placeholder="Enter Invoice Number..."
                                   className="w-full text-sm rounded-lg py-2 px-3 border-2 border-gray-200 focus:border-emerald-400 focus:outline-none transition-all"/>
                        </div>
                        <div>
                            <label htmlFor="from-date"
                                   className="block text-sm font-medium text-gray-700 mb-1">From Date</label>
                            <input type="date" id="from-date"
                                   className="w-full text-sm rounded-lg py-2 px-3 border-2 border-gray-200 focus:border-emerald-400 focus:outline-none transition-all"/>
                        </div>
                        <div>
                            <label htmlFor="to-date"
                                   className="block text-sm font-medium text-gray-700 mb-1">To Date</label>
                            <input type="date" id="to-date"
                                   className="w-full text-sm rounded-lg py-2 px-3 border-2 border-gray-200 focus:border-emerald-400 focus:outline-none transition-all"/>
                        </div>
                        <div className={'grid grid-cols-2 md:items-end items-start gap-2 text-white font-medium'}>
                            <button className={'bg-gradient-to-r from-emerald-500 to-emerald-600 hover:from-emerald-600 hover:to-emerald-700 py-2 rounded-lg flex items-center justify-center shadow-lg shadow-emerald-200 hover:shadow-xl transition-all'}>
                                <SearchCheck className="mr-2" size={14}/>Search
                            </button>
                            <button className={'bg-gradient-to-r from-gray-500 to-gray-600 hover:from-gray-600 hover:to-gray-700 py-2 rounded-lg flex items-center justify-center shadow-lg shadow-gray-200 hover:shadow-xl transition-all'}>
                                <RefreshCw className="mr-2" size={14}/>Cancel
                            </button>
                        </div>
                    </div>
                </div>

                <div className={'flex flex-col bg-white rounded-xl h-full p-4 justify-between shadow-lg'}>
                    <div className="overflow-y-auto max-h-md md:h-[320px] lg:h-[500px] rounded-lg scrollbar-thin scrollbar-thumb-emerald-300 scrollbar-track-gray-100">
                        <table className="min-w-full divide-y divide-gray-200">
                            <thead className="bg-gradient-to-r from-emerald-500 to-emerald-600 sticky top-0 z-10">
                            <tr>
                                {[
                                    'Invoice Number',
                                    'Total Amount',
                                    'Issued Date',
                                    'Cashier',
                                    'Action'
                                ].map((header, i, arr) => (
                                    <th
                                        key={i}
                                        scope="col"
                                        className={`px-6 py-3 text-left text-xs font-bold text-white uppercase tracking-wider ${
                                            i === 0 ? 'rounded-tl-lg' : i === arr.length - 1 ? 'rounded-tr-lg' : ''
                                        }`}
                                    >
                                        {header}
                                    </th>
                                ))}
                            </tr>
                            </thead>

                            <tbody className="bg-white divide-y divide-gray-200">
                            {InvoiceData.map((invoice, index) => (
                                <tr
                                    key={index}
                                    onClick={() => setSelectedIndex(index)}
                                    className={`cursor-pointer transition-all ${
                                        selectedIndex === index
                                            ? 'bg-emerald-50 border-l-4 border-l-emerald-500'
                                            : 'hover:bg-gray-50'
                                    }`}
                                >
                                    <td className="px-6 py-2 whitespace-nowrap text-sm font-semibold text-gray-800">
                                        {invoice.invoiceID}
                                    </td>
                                    <td className="px-6 py-2 whitespace-nowrap text-sm font-bold text-emerald-600">
                                        LKR {invoice.totalAmount}
                                    </td>
                                    <td className="px-6 py-2 whitespace-nowrap text-sm font-medium text-gray-600">
                                        {invoice.issuedDate}
                                    </td>
                                    <td className="px-6 py-2 whitespace-nowrap text-sm font-medium text-gray-700">
                                        {invoice.cashier}
                                    </td>
                                    <td className="px-6 py-2 whitespace-nowrap text-sm font-medium">
                                        <div className="flex gap-2">
                                            <button className="p-2 bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white rounded-lg shadow-md hover:shadow-lg transition-all">
                                                <Eye size={16}/>
                                            </button>
                                            <button className="p-2 bg-gradient-to-r from-emerald-500 to-emerald-600 hover:from-emerald-600 hover:to-emerald-700 text-white rounded-lg shadow-md hover:shadow-lg transition-all">
                                                <Printer size={16}/>
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                            </tbody>
                        </table>
                    </div>

                    <nav className="bg-white flex items-center justify-center sm:px-6 pt-4 border-t-2 border-gray-100">
                        <div className="flex items-center space-x-2">
                            <button className="flex items-center px-3 py-2 text-sm font-medium text-gray-600 hover:text-emerald-600 hover:bg-emerald-50 rounded-lg transition-all">
                                <ChevronLeft className="mr-2 h-5 w-5"/> Previous
                            </button>
                            <button className="px-4 py-2 bg-gradient-to-r from-emerald-500 to-emerald-600 text-sm font-semibold rounded-lg text-white shadow-md">
                                1
                            </button>
                            <button className="px-4 py-2 text-sm font-medium rounded-lg text-gray-600 hover:bg-emerald-50 hover:text-emerald-600 transition-all">
                                2
                            </button>
                            <button className="px-4 py-2 text-sm font-medium rounded-lg text-gray-600 hover:bg-emerald-50 hover:text-emerald-600 transition-all">
                                3
                            </button>
                            <span className="text-gray-400 px-2">...</span>
                            <button className="flex items-center px-3 py-2 text-sm font-medium text-gray-600 hover:text-emerald-600 hover:bg-emerald-50 rounded-lg transition-all">
                                Next <ChevronRight className="ml-2 h-5 w-5"/>
                            </button>
                        </div>
                    </nav>
                </div>
            </div>
        </>
    );
}

export default ManageInvoice;