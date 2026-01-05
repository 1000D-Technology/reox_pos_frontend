import {
    CalendarDays,
    ChartLine,
    ChevronLeft,
    ChevronRight,
    Eye,
    FileSpreadsheet,
    Printer,
    RefreshCw,
    Scale,
    SearchCheck,
} from 'lucide-react';
import { ChartNoAxesCombined } from 'lucide-react';
import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';

function ManageUserSales() {
    const summaryCards = [
        {
            title: 'Total Sales',
            value: 'LKR.500000.00',
            icon: <ChartNoAxesCombined size={20}/>,
            iconBg: 'bg-emerald-100',
            iconColor: 'text-emerald-600'
        },
        {
            title: 'Total Profit',
            value: '50',
            icon: <ChartLine size={20}/>,
            iconBg: 'bg-blue-100',
            iconColor: 'text-blue-600'
        },
        {
            title: 'Total Invoices',
            value: '100',
            icon: <FileSpreadsheet size={20}/>,
            iconBg: 'bg-purple-100',
            iconColor: 'text-purple-600'
        },
        {
            title: 'Total Discount',
            value: '50',
            icon: <Scale size={20}/>,
            iconBg: 'bg-red-100',
            iconColor: 'text-red-600'
        },
        {
            title: 'Date Range',
            value: '2 Days',
            icon: <CalendarDays size={20}/>,
            iconBg: 'bg-orange-100',
            iconColor: 'text-orange-600'
        },
    ];

    const salesData = [
        {
            invoiceId: '250929003',
            grossAmount: '25000.00',
            customer: 'Unknown',
            discount: '0.00',
            netAmount: '650.00',
            cashPay: '650.00',
            cardPay: '0.00',
            balance: '0.00',
            cashier: 'Saman Silva',
            issuedAt: '9/29/2025, 8:51:54 AM',
        },
        {
            invoiceId: '250929004',
            grossAmount: '30000.00',
            customer: 'John Doe',
            discount: '100.00',
            netAmount: '29900.00',
            cashPay: '10000.00',
            cardPay: '19900.00',
            balance: '0.00',
            cashier: 'Nimal Perera',
            issuedAt: '9/29/2025, 9:15:20 AM',
        },
        {
            invoiceId: '250929005',
            grossAmount: '12000.00',
            customer: 'Jane Smith',
            discount: '0.00',
            netAmount: '12000.00',
            cashPay: '12000.00',
            cardPay: '0.00',
            balance: '0.00',
            cashier: 'Kamal Silva',
            issuedAt: '9/29/2025, 10:02:40 AM',
        },
    ];

    const [selectedIndex, setSelectedIndex] = useState(0);

    useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            if (e.key === "ArrowDown") {
                e.preventDefault();
                setSelectedIndex((prev) => (prev < salesData.length - 1 ? prev + 1 : prev));
            } else if (e.key === "ArrowUp") {
                e.preventDefault();
                setSelectedIndex((prev) => (prev > 0 ? prev - 1 : prev));
            }
        };

        window.addEventListener("keydown", handleKeyDown);
        return () => window.removeEventListener("keydown", handleKeyDown);
    }, [salesData.length]);

    return (
        <div className={'flex flex-col gap-4 h-full'}>
            <div>
                <div className="text-sm text-gray-400 flex items-center">
                    <span>Pages</span>
                    <span className="mx-2">›</span>
                    <span className="text-gray-700 font-medium">Cashier Sales Management</span>
                </div>
                <h1 className="text-3xl font-semibold bg-gradient-to-r from-gray-800 to-gray-600 bg-clip-text text-transparent">
                    Cashier Sales Management
                </h1>
            </div>

            <div className={'rounded-md grid md:grid-cols-5 grid-cols-3 gap-4'}>
                {summaryCards.map((card, index) => (
                    <motion.div
                        key={index}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: index * 0.1 }}
                        whileHover={{ scale: 1.03, y: -2 }}
                        className="bg-white p-5 rounded-xl shadow-lg hover:shadow-xl transition-all flex items-center space-x-4"
                    >
                        <div className={`${card.iconBg} p-3 rounded-full`}>
                            <span className={card.iconColor}>{card.icon}</span>
                        </div>
                        <div className='border-l-2 border-gray-200 pl-2'>
                            <p className="text-sm text-gray-500">{card.title}</p>
                            <p className="text-lg font-semibold text-gray-800">{card.value}</p>
                        </div>
                    </motion.div>
                ))}
            </div>

            <div className={'bg-white rounded-xl p-4 flex flex-col shadow-lg'}>
                <h2 className="text-xl font-semibold text-gray-700 mb-3">Filter</h2>
                <div className={'grid md:grid-cols-5 gap-4'}>
                    <div>
                        <label htmlFor="invoice-number" className="block text-sm font-medium text-gray-700 mb-1">
                            Invoice Number
                        </label>
                        <input
                            type="text"
                            id="invoice-number"
                            placeholder="Enter Invoice Number..."
                            className="w-full text-sm rounded-lg py-2 px-3 border-2 border-gray-200 focus:border-emerald-400 focus:outline-none transition-all"
                        />
                    </div>
                    <div>
                        <label htmlFor="cashier" className="block text-sm font-medium text-gray-700 mb-1">
                            Cashier
                        </label>
                        <select
                            id="cashier"
                            className="w-full text-sm rounded-lg py-2 px-3 border-2 border-gray-200 focus:border-emerald-400 focus:outline-none transition-all"
                        >
                            <option value="">Select Cashier</option>
                            <option value="saman">Saman Silva</option>
                            <option value="nimal">Nimal Perera</option>
                            <option value="kamal">Kamal Silva</option>
                        </select>
                    </div>
                    <div>
                        <label htmlFor="from-date" className="block text-sm font-medium text-gray-700 mb-1">
                            From Date
                        </label>
                        <input
                            type="date"
                            id="from-date"
                            className="w-full text-sm rounded-lg py-2 px-3 border-2 border-gray-200 focus:border-emerald-400 focus:outline-none transition-all"
                        />
                    </div>
                    <div>
                        <label htmlFor="to-date" className="block text-sm font-medium text-gray-700 mb-1">
                            To Date
                        </label>
                        <input
                            type="date"
                            id="to-date"
                            className="w-full text-sm rounded-lg py-2 px-3 border-2 border-gray-200 focus:border-emerald-400 focus:outline-none transition-all"
                        />
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
                                'Invoice ID',
                                'Gross Amount',
                                'Customer',
                                'Discount',
                                'Net Amount',
                                'Cash Pay',
                                'Card Pay',
                                'Balance',
                                'Cashier',
                                'Issued At',
                                'Actions'
                            ].map((header, i, arr) => (
                                <th
                                    key={i}
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
                        {salesData.map((sale, index) => (
                            <motion.tr
                                key={index}
                                initial={{ opacity: 0, x: -20 }}
                                animate={{ opacity: 1, x: 0 }}
                                transition={{ delay: 0.05 * index }}
                                onClick={() => setSelectedIndex(index)}
                                whileHover={{ backgroundColor: "rgba(16,185,129,0.05)" }}
                                className={`cursor-pointer transition-all ${
                                    selectedIndex === index
                                        ? 'bg-emerald-50 border-l-4 border-emerald-500'
                                        : 'hover:bg-gray-50'
                                }`}
                            >
                                <td className="px-6 py-2 whitespace-nowrap text-sm font-semibold text-gray-800">
                                    {sale.invoiceId}
                                </td>
                                <td className="px-6 py-2 whitespace-nowrap text-sm font-bold text-emerald-600">
                                    LKR {sale.grossAmount}
                                </td>
                                <td className="px-6 py-2 whitespace-nowrap text-sm font-medium text-gray-700">
                                    {sale.customer}
                                </td>
                                <td className="px-6 py-2 whitespace-nowrap text-sm font-medium text-red-600">
                                    LKR {sale.discount}
                                </td>
                                <td className="px-6 py-2 whitespace-nowrap text-sm font-bold text-blue-600">
                                    LKR {sale.netAmount}
                                </td>
                                <td className="px-6 py-2 whitespace-nowrap text-sm font-medium text-gray-600">
                                    LKR {sale.cashPay}
                                </td>
                                <td className="px-6 py-2 whitespace-nowrap text-sm font-medium text-gray-600">
                                    LKR {sale.cardPay}
                                </td>
                                <td className="px-6 py-2 whitespace-nowrap text-sm font-medium text-gray-600">
                                    LKR {sale.balance}
                                </td>
                                <td className="px-6 py-2 whitespace-nowrap text-sm font-medium text-gray-700">
                                    {sale.cashier}
                                </td>
                                <td className="px-6 py-2 whitespace-nowrap text-sm text-gray-500">
                                    {sale.issuedAt}
                                </td>
                                <td className="px-6 py-2 whitespace-nowrap text-sm font-medium">
                                    <div className="flex space-x-2">
                                        <button className="p-2 bg-gradient-to-r from-blue-500 to-blue-600 text-white rounded-lg hover:from-blue-600 hover:to-blue-700 transition-all shadow-md">
                                            <Eye size={16}/>
                                        </button>
                                        <button className="p-2 bg-gradient-to-r from-emerald-500 to-emerald-600 text-white rounded-lg hover:from-emerald-600 hover:to-emerald-700 transition-all shadow-md">
                                            <Printer size={16}/>
                                        </button>
                                    </div>
                                </td>
                            </motion.tr>
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
    );
}

export default ManageUserSales;