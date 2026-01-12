import {
    BookmarkCheck,
    ChevronLeft,
    ChevronRight,
    Copy,
    DollarSign,
    Download,
    FileSpreadsheet,
    HandCoins,
    RefreshCw,
    Save,
    ArrowUpRight,
    ArrowDownRight,
} from "lucide-react";
import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import TypeableSelect from "../../../components/TypeableSelect.tsx";

function SupplierPayment() {

    const summaryCards = [
        {
            title: 'Total Bills',
            value: '50',
            icon: <FileSpreadsheet size={20} />,
            trend: '+12%',
            color: 'bg-gradient-to-br from-emerald-400 to-emerald-500',
            iconColor: 'text-white',
            bgGlow: 'shadow-emerald-200'
        },
        {
            title: 'Total Amount',
            value: 'LKR 154,250.00',
            icon: <DollarSign size={20} />,
            trend: '+8%',
            color: 'bg-gradient-to-br from-purple-400 to-purple-500',
            iconColor: 'text-white',
            bgGlow: 'shadow-purple-200'
        },
        {
            title: 'Total Paid',
            value: 'LKR 1,540,250.00',
            icon: <Download size={20} />,
            trend: '+15%',
            color: 'bg-gradient-to-br from-blue-400 to-blue-500',
            iconColor: 'text-white',
            bgGlow: 'shadow-blue-200'
        },
        {
            title: 'Total Balance',
            value: 'LKR 1,540,250.00',
            icon: <DollarSign size={20} />,
            trend: '-5%',
            color: 'bg-gradient-to-br from-red-400 to-red-500',
            iconColor: 'text-white',
            bgGlow: 'shadow-red-200'
        },
        {
            title: 'Open Bills',
            value: '20',
            icon: <BookmarkCheck size={20} />,
            trend: '+3%',
            color: 'bg-gradient-to-br from-yellow-400 to-yellow-500',
            iconColor: 'text-white',
            bgGlow: 'shadow-yellow-200'
        },
    ];

    const InvoiceData = [
        {
            supplierid: '250929003',
            name: 'ABC Suppliers',
            billnumber: 'BILL-001',
            amount: '5200.00',
            paid: '5200.00',
            balance: '0.00',
            date: '2025-01-15',
            status: 'Paid',
        },
    ];

    const [selectedSupplier, setSelectedSupplier] = useState<string | number | null>(null);
    const [selectedBillNumber, setSelectedBillNumber] = useState<string | number | null>(null);

// Create options for suppliers (unique suppliers from InvoiceData)
    const supplierOptions = Array.from(
        new Set(InvoiceData.map(invoice => invoice.supplierid))
    ).map(id => {
        const invoice = InvoiceData.find(inv => inv.supplierid === id);
        return {
            value: id,
            label: `${id} - ${invoice?.name}`
        };
    });

// Create options for bill numbers (filtered by selected supplier if any)
    const billNumberOptions = InvoiceData
        .filter(invoice => !selectedSupplier || invoice.supplierid === selectedSupplier)
        .map(invoice => ({
            value: invoice.billnumber,
            label: `${invoice.billnumber} (LKR ${invoice.amount})`
        }));

// Get selected invoice details
    const selectedInvoice = InvoiceData.find(
        inv => inv.billnumber === selectedBillNumber
    );

    const [currentPage, setCurrentPage] = useState(1);
    const [itemsPerPage] = useState(10);

// Calculate pagination values
    const totalPages = Math.ceil(InvoiceData.length / itemsPerPage);
    const startIndex = (currentPage - 1) * itemsPerPage;
    const endIndex = startIndex + itemsPerPage;
    const currentInvoiceData = InvoiceData.slice(startIndex, endIndex);

// Pagination functions
    const goToPage = (page: number) => {
        if (page >= 1 && page <= totalPages) {
            setCurrentPage(page);
            setSelectedIndex(0);
        }
    };

    const goToPreviousPage = () => {
        if (currentPage > 1) {
            setCurrentPage(currentPage - 1);
            setSelectedIndex(0);
        }
    };

    const goToNextPage = () => {
        if (currentPage < totalPages) {
            setCurrentPage(currentPage + 1);
            setSelectedIndex(0);
        }
    };

    const getPageNumbers = () => {
        const pages: (number | string)[] = [];
        const maxPagesToShow = 5;

        if (totalPages <= maxPagesToShow) {
            for (let i = 1; i <= totalPages; i++) {
                pages.push(i);
            }
        } else {
            if (currentPage <= 3) {
                for (let i = 1; i <= 4; i++) pages.push(i);
                pages.push('...');
                pages.push(totalPages);
            } else if (currentPage >= totalPages - 2) {
                pages.push(1);
                pages.push('...');
                for (let i = totalPages - 3; i <= totalPages; i++) pages.push(i);
            } else {
                pages.push(1);
                pages.push('...');
                for (let i = currentPage - 1; i <= currentPage + 1; i++) pages.push(i);
                pages.push('...');
                pages.push(totalPages);
            }
        }

        return pages;
    };


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
                        <span>Supplier</span>
                        <span className="mx-2">›</span>
                        <span className="text-gray-700 font-medium">Supplier Payments</span>
                    </div>
                    <h1 className="text-3xl font-semibold bg-gradient-to-r from-gray-800 to-gray-600 bg-clip-text text-transparent">
                        Supplier Payments
                    </h1>
                </div>

                <div className={'grid md:grid-cols-5 grid-cols-1 gap-4'}>
                    {summaryCards.map((card, index) => (
                        <motion.div
                            key={index}
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: index * 0.1 }}
                            whileHover={{ scale: 1.05, y: -2 }}
                            className={`flex items-center p-4 space-x-3 transition-all bg-white rounded-2xl shadow-lg hover:shadow-xl ${card.bgGlow} cursor-pointer group relative overflow-hidden`}
                        >
                            <div className="absolute inset-0 bg-gradient-to-br from-transparent via-gray-50/50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>

                            <div className={`p-3 rounded-full ${card.color} shadow-md relative z-10`}>
                                <span className={card.iconColor}>{card.icon}</span>
                            </div>

                            <div className="w-px h-10 bg-gray-200"></div>

                            <div className="relative z-10 flex-1">
                                <div className="flex items-center justify-between">
                                    <p className="text-sm text-gray-500">{card.title}</p>
                                    <div className={`flex items-center gap-0.5 text-[10px] font-semibold ${card.trend.startsWith('+') ? 'text-emerald-600' : 'text-red-600'}`}>
                                        {card.trend.startsWith('+') ? <ArrowUpRight className="w-3 h-3" /> : <ArrowDownRight className="w-3 h-3" />}
                                        {card.trend}
                                    </div>
                                </div>
                                <p className="text-sm font-bold text-gray-700">{card.value}</p>
                            </div>
                        </motion.div>
                    ))}
                </div>

                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.6 }}
                    className={'bg-white rounded-xl p-4 flex flex-col shadow-lg'}
                >
                    <h2 className="text-xl font-semibold text-gray-700 mb-3">Payment Processing</h2>
                    <div className={'grid md:grid-cols-5 gap-4'}>

                        <div>
                            <label htmlFor="supplier" className="block text-sm font-medium text-gray-700 mb-1">
                                Supplier
                            </label>
                            <TypeableSelect
                                options={supplierOptions}
                                value={selectedSupplier}
                                onChange={(option) => {
                                    setSelectedSupplier(option?.value || null);
                                    setSelectedBillNumber(null); // Reset bill number when supplier changes
                                }}
                                placeholder="Type to search supplier"
                            />
                        </div>
                        <div>
                            <label htmlFor="bill-number" className="block text-sm font-medium text-gray-700 mb-1">
                                Bill Number
                            </label>
                            <TypeableSelect
                                options={billNumberOptions}
                                value={selectedBillNumber}
                                onChange={(option) => setSelectedBillNumber(option?.value || null)}
                                placeholder="Type to select Bill Number..."
                                disabled={!selectedSupplier}
                            />
                        </div>
                        <div className="flex flex-col justify-end">
                            <label className="block text-xs font-medium text-gray-500 mb-1">
                                Total: <span className="text-gray-700 font-semibold">
            LKR {selectedInvoice?.amount || '0.00'}
        </span>
                            </label>
                            <label className="text-sm font-semibold text-gray-700">
                                Balance: <span className={`${parseFloat(selectedInvoice?.balance || '0') > 0 ? 'text-red-600' : 'text-emerald-600'}`}>
            LKR {selectedInvoice?.balance || '0.00'}
        </span>
                            </label>
                        </div>

                        <div>
                            <label htmlFor="new-payment" className="block text-sm font-medium text-gray-700 mb-1">
                                New Payment
                            </label>
                            <input
                                type="text"
                                id="new-payment"
                                placeholder="Enter Amount..."
                                className="w-full text-sm rounded-lg py-2 px-3 border-2 border-gray-200 focus:border-emerald-400 focus:outline-none transition-all"
                            />
                        </div>
                        <div className={'grid grid-cols-2 md:items-end items-start gap-2 text-white font-medium'}>
                            <button className={'bg-gradient-to-r from-emerald-500 to-emerald-600 hover:from-emerald-600 hover:to-emerald-700 py-2 rounded-lg flex items-center justify-center shadow-lg shadow-emerald-200 hover:shadow-xl transition-all'}>
                                <HandCoins className="mr-2" size={14} />Pay Now
                            </button>
                            <button className={'bg-gradient-to-r from-gray-500 to-gray-600 hover:from-gray-600 hover:to-gray-700 py-2 rounded-lg flex items-center justify-center shadow-lg shadow-gray-200 hover:shadow-xl transition-all'}>
                                <RefreshCw className="mr-2" size={14} />Clear
                            </button>
                        </div>
                    </div>
                </motion.div>

                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.7 }}
                    className={'flex flex-col bg-white rounded-xl h-full p-4 justify-between shadow-lg'}
                >
                    <div className="overflow-y-auto max-h-md md:h-[320px] lg:h-[500px] rounded-lg scrollbar-thin scrollbar-thumb-emerald-300 scrollbar-track-gray-100">
                        <table className="min-w-full divide-y divide-gray-200">
                            <thead className="bg-gradient-to-r from-emerald-500 to-emerald-600 sticky top-0 z-10">
                            <tr>
                                {[
                                    'Supplier ID',
                                    'Name',
                                    'Bill Number',
                                    'Amount',
                                    'Paid',
                                    'Balance',
                                    'Date',
                                    'Status',
                                    'Actions',
                                ].map((header, i, arr) => (
                                    <th
                                        key={header}
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
                                        index === selectedIndex
                                            ? 'bg-emerald-50 border-l-4 border-l-emerald-500'
                                            : 'hover:bg-gray-50'
                                    }`}
                                >
                                    <td className="px-6 py-2 whitespace-nowrap text-sm font-semibold text-gray-800">
                                        {invoice.supplierid}
                                    </td>
                                    <td className="px-6 py-2 whitespace-nowrap text-sm font-medium text-gray-700">
                                        {invoice.name}
                                    </td>
                                    <td className="px-6 py-2 whitespace-nowrap text-sm font-medium text-gray-600">
                                        {invoice.billnumber}
                                    </td>
                                    <td className="px-6 py-2 whitespace-nowrap text-sm font-bold text-emerald-600">
                                        LKR {invoice.amount}
                                    </td>
                                    <td className="px-6 py-2 whitespace-nowrap text-sm font-bold text-blue-600">
                                        LKR {invoice.paid}
                                    </td>
                                    <td className="px-6 py-2 whitespace-nowrap text-sm font-bold text-red-600">
                                        LKR {invoice.balance}
                                    </td>
                                    <td className="px-6 py-2 whitespace-nowrap text-sm font-medium text-gray-600">
                                        {invoice.date}
                                    </td>
                                    <td className="px-6 py-2 whitespace-nowrap">
                                            <span className={`px-3 py-1 text-xs font-semibold rounded-full ${
                                                invoice.status === 'Paid'
                                                    ? 'bg-gradient-to-r from-emerald-100 to-emerald-200 text-emerald-800'
                                                    : 'bg-gradient-to-r from-yellow-100 to-yellow-200 text-yellow-800'
                                            }`}>
                                                {invoice.status}
                                            </span>
                                    </td>
                                    <td className="px-6 py-2 whitespace-nowrap text-sm font-medium">
                                        <div className="flex gap-2">
                                            <button className="p-2 bg-gradient-to-r from-yellow-400 to-yellow-500 hover:from-yellow-500 hover:to-yellow-600 text-white rounded-lg shadow-md hover:shadow-lg transition-all">
                                                <Save size={16} />
                                            </button>
                                            <button className="p-2 bg-gradient-to-r from-emerald-500 to-emerald-600 hover:from-emerald-600 hover:to-emerald-700 text-white rounded-lg shadow-md hover:shadow-lg transition-all">
                                                <Copy size={16} />
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            ))}

                            </tbody>
                        </table>
                    </div>

                    <nav className="bg-white flex items-center justify-between sm:px-6 pt-4 border-t-2 border-gray-100">
                        <div className="text-sm text-gray-600">
                            Showing <span className="font-semibold text-gray-800">{startIndex + 1}</span> to{' '}
                            <span className="font-semibold text-gray-800">{Math.min(endIndex, InvoiceData.length)}</span> of{' '}
                            <span className="font-semibold text-gray-800">{InvoiceData.length}</span> results
                        </div>
                        <div className="flex items-center space-x-2">
                            <button
                                onClick={goToPreviousPage}
                                disabled={currentPage === 1}
                                className={`flex items-center px-3 py-2 text-sm font-medium rounded-lg transition-all ${
                                    currentPage === 1
                                        ? 'text-gray-400 cursor-not-allowed'
                                        : 'text-gray-600 hover:text-emerald-600 hover:bg-emerald-50'
                                }`}
                            >
                                <ChevronLeft className="mr-2 h-5 w-5" /> Previous
                            </button>

                            {getPageNumbers().map((page, index) =>
                                    typeof page === 'number' ? (
                                        <button
                                            key={index}
                                            onClick={() => goToPage(page)}
                                            className={`px-4 py-2 text-sm font-semibold rounded-lg transition-all ${
                                                currentPage === page
                                                    ? 'bg-gradient-to-r from-emerald-500 to-emerald-600 text-white shadow-md'
                                                    : 'text-gray-600 hover:bg-emerald-50 hover:text-emerald-600'
                                            }`}
                                        >
                                            {page}
                                        </button>
                                    ) : (
                                        <span key={index} className="text-gray-400 px-2">
                    {page}
                </span>
                                    )
                            )}

                            <button
                                onClick={goToNextPage}
                                disabled={currentPage === totalPages}
                                className={`flex items-center px-3 py-2 text-sm font-medium rounded-lg transition-all ${
                                    currentPage === totalPages
                                        ? 'text-gray-400 cursor-not-allowed'
                                        : 'text-gray-600 hover:text-emerald-600 hover:bg-emerald-50'
                                }`}
                            >
                                Next <ChevronRight className="ml-2 h-5 w-5" />
                            </button>
                        </div>
                    </nav>

                </motion.div>
            </div>
        </>
    );
}

export default SupplierPayment;