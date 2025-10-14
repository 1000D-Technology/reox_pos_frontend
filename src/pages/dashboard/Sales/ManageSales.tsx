import {
    ChartLine,
    ChartNoAxesCombined, ChevronLeft, ChevronRight,
    CreditCard,
    Eye,
    Printer,
    RefreshCw,
    Scale,
    SearchCheck,
    Users
} from "lucide-react";
import {useEffect, useState} from "react";


function ManageSales() {
    const summaryCards = [
        {title: 'Cash Amount', value: 'LKR.500000.00', icon: <ChartNoAxesCombined size={20}/>},
        {title: 'Card Payments', value: '50', icon: <CreditCard size={20}/>},
        {title: 'Total Sales', value: 'LKR.10250.00', icon: <ChartLine size={20}/>},
        {title: 'Customers', value: '50', icon: <Users size={20}/>},
        {title: 'Total Discount', value: '50', icon: <Scale size={20}/>},
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
        },{
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
        },{
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
        },{
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
        },{
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
        },{
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
        <div className={'flex flex-col gap-4 h-full'}>
            <div>
                <div className="text-sm text-gray-500 flex items-center">
                    <span>Pages</span>
                    <span className="mx-2">›</span>
                    <span className="text-black">Sales Management</span>
                </div>
                <h1 className="text-3xl font-semibold text-gray-500">Sales Management</h1>
            </div>
            <div className={' rounded-md grid md:grid-cols-5 grid-cols-3 gap-4'}>
                {summaryCards.map((card, index) => (
                    <div key={index} className="bg-white p-5 rounded-xl  flex items-center space-x-4 ">
                        <div className="bg-[#BBF7D0] p-3 rounded-full">
                            <span className="text-gray-700">{card.icon}</span>
                        </div>
                        <div className='border-l-2 border-[#D9D9D9] pl-2'>
                            <p className="text-sm text-gray-400 ">{card.title}</p>
                            <p className="text-lg font-semibold text-gray-900">{card.value}</p>
                        </div>
                    </div>
                ))}
            </div>
            <div className={'bg-white rounded-md p-4 flex flex-col'}>
                <h2 className="text-xl font-semibold text-gray-400">Filter</h2>
                <div className={'grid md:grid-cols-4 gap-4 '}>
                    <div>
                        <label htmlFor="invoice-number"
                               className="block text-sm font-medium text-gray-700 mb-1">Invoice Number</label>
                        <input type="text" id="invoice-number" placeholder="Enter Invoice Number..."
                               className="w-full text-sm rounded-md py-2 px-2  border-2 border-gray-100 "/>

                    </div>
                    <div>
                        <label htmlFor="from-date"
                               className="block text-sm font-medium text-gray-700 mb-1">From Date</label>
                        <input type="date" id="from-date" placeholder="Enter Invoice Number..."
                               className="w-full text-sm rounded-md py-2 px-2  border-2 border-gray-100 "/>

                    </div>
                    <div>
                        <label htmlFor="to-date"
                               className="block text-sm font-medium text-gray-700 mb-1">To Date</label>
                        <input type="date" id="to-date" placeholder="Enter Invoice Number..."
                               className="w-full text-sm rounded-md py-2 px-2  border-2 border-gray-100 "/>

                    </div>
                    <div className={'grid grid-cols-2 md:items-end items-start gap-2 text-white font-medium'}>
                        <button className={'bg-emerald-600 py-2 rounded-md flex items-center justify-center'}>
                            <SearchCheck className="mr-2" size={14}/>Search
                        </button>
                        <button className={'bg-gray-500 py-2 rounded-md flex items-center justify-center'}><RefreshCw
                            className="mr-2" size={14}/>Cancel
                        </button>
                    </div>
                </div>
            </div>
            <div className={'flex flex-col bg-white rounded-md h-full p-4 justify-between'}>
                <div
                    className="overflow-y-auto max-h-md md:h-[320px] lg:h-[500px] rounded-md scrollbar-thin scrollbar-thumb-gray-300 scrollbar-track-gray-100">
                    <table className="min-w-full divide-y divide-gray-200">
                        <thead className="bg-emerald-600 sticky top-0 z-10">
                        <tr>
                            {[
                                'Invoice ID',
                                'Gross Amount (LKR)',
                                'Customer',
                                'Discount',
                                'NET Amount',
                                'Cash Pay',
                                'Card Pay',
                                'Balance',
                                'Issued Cashier',
                                'Issued At',
                                'Actions'
                            ].map((header, i, arr) => (
                                <th
                                    key={header}
                                    scope="col"
                                    className={`px-6 py-3 text-left text-sm font-medium text-white tracking-wider
                            ${i === 0 ? "rounded-tl-lg" : ""}
                            ${i === arr.length - 1 ? "rounded-tr-lg" : ""}`}
                                >
                                    {header}
                                </th>
                            ))}
                        </tr>
                        </thead>

                        <tbody className="bg-white divide-y divide-gray-200">
                        {salesData.map((sale, index) => (
                            <tr
                                key={index}
                                onClick={() => setSelectedIndex(index)}
                                className={`cursor-pointer ${
                                    index === selectedIndex
                                        ? "bg-green-100 border-l-4 border-green-600"
                                        : "hover:bg-green-50"
                                }`}
                            >
                                <td className="px-6 py-2 whitespace-nowrap text-sm font-medium">
                                    {sale.invoiceId}
                                </td>
                                <td className="px-6 py-2 whitespace-nowrap text-sm font-medium">
                                    {sale.grossAmount}
                                </td>
                                <td className="px-6 py-2 whitespace-nowrap text-sm font-medium">
                                    {sale.customer}
                                </td>
                                <td className="px-6 py-2 whitespace-nowrap text-sm font-medium">
                                    {sale.discount}
                                </td>
                                <td className="px-6 py-2 whitespace-nowrap text-sm font-medium">
                                    {sale.netAmount}
                                </td>
                                <td className="px-6 py-2 whitespace-nowrap text-sm font-medium">
                                    {sale.cashPay}
                                </td>
                                <td className="px-6 py-2 whitespace-nowrap text-sm font-medium">
                                    {sale.cardPay}
                                </td>
                                <td className="px-6 py-2 whitespace-nowrap text-sm font-medium">
                                    {sale.balance}
                                </td>
                                <td className="px-6 py-2 whitespace-nowrap text-sm font-medium">
                                    {sale.cashier}
                                </td>
                                <td className="px-6 py-2 whitespace-nowrap text-sm font-medium">
                                    {sale.issuedAt}
                                </td>
                                <td className="px-6 py-2 whitespace-nowrap text-sm font-medium">
                                    <div className="flex items-center space-x-2">
                                        <div className="relative group">
                                            <button
                                                className="p-2 bg-green-100 rounded-full text-green-700 hover:bg-green-200 transition-colors">
                                                <Printer className="w-5 h-5"/>
                                            </button>
                                            <span
                                                className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 w-max px-2 py-1 text-xs text-white bg-gray-900 rounded-md invisible group-hover:visible opacity-0 group-hover:opacity-100 transition-opacity">
                                        Print Invoice
                                    </span>
                                        </div>
                                        <div className="relative group">
                                            <button
                                                className="p-2 bg-yellow-100 rounded-full text-yellow-700 hover:bg-yellow-200 transition-colors">
                                                <Eye className="w-5 h-5"/>
                                            </button>
                                            <span
                                                className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 w-max px-2 py-1 text-xs text-white bg-gray-900 rounded-md invisible group-hover:visible opacity-0 group-hover:opacity-100 transition-opacity">
                                        View Invoice
                                    </span>
                                        </div>
                                    </div>
                                </td>
                            </tr>
                        ))}
                        </tbody>
                    </table>
                </div>

                <nav className="bg-white flex items-center justify-center sm:px-6">
                    <div className="flex items-center space-x-2">
                        <button
                            className="flex items-center px-2 py-2 text-sm font-medium text-gray-500 hover:text-gray-700">
                            <ChevronLeft className="mr-2 h-5 w-5"/> Previous
                        </button>
                        <button
                            className="px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white">
                            1
                        </button>
                        <button
                            className="px-4 py-2 border border-transparent text-sm font-medium rounded-md text-gray-500 hover:bg-gray-100">
                            2
                        </button>
                        <button
                            className="px-4 py-2 border border-transparent text-sm font-medium rounded-md text-gray-500 hover:bg-gray-100">
                            3
                        </button>
                        <span className="text-gray-500 px-2">...</span>
                        <button
                            className="flex items-center px-2 py-2 text-sm font-medium text-gray-500 hover:text-gray-700">
                            Next <ChevronRight className="ml-2 h-5 w-5"/>
                        </button>
                    </div>
                </nav>
            </div>


        </div>
    )
}

export default ManageSales
