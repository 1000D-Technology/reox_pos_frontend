import {
    ChevronLeft,
    ChevronRight,
    Printer,
    Save,
    Trash,
    Package,
    ShoppingCart,
    Receipt,
    DollarSign,
} from 'lucide-react';
import { useEffect, useState } from 'react';
import toast, { Toaster } from 'react-hot-toast';

interface QuotationItem {
    productId: string;
    name: string;
    mrp: string;
    discount: string;
    rate: string;
    qty: string;
    amount: string;
}

function CreateQuotation() {
    const [quotationData, setQuotationData] = useState<QuotationItem[]>([
        {
            productId: '250929003',
            name: 'Samsung Galaxy S21',
            mrp: '125,000.00',
            discount: '5,000.00',
            rate: '120,000.00',
            qty: '2',
            amount: '240,000.00',
        },
        {
            productId: '250929004',
            name: 'iPhone 13 Pro',
            mrp: '185,000.00',
            discount: '10,000.00',
            rate: '175,000.00',
            qty: '1',
            amount: '175,000.00',
        },
    ]);

    const [selectedIndex, setSelectedIndex] = useState(0);
    const [currentPage, setCurrentPage] = useState(1);
    const [itemsPerPage] = useState(10);

    const [productCode, setProductCode] = useState('');
    const [customerName, setCustomerName] = useState('');
    const [quotationDate, setQuotationDate] = useState('');
    const [validUntil, setValidUntil] = useState('');
    const [remarks, setRemarks] = useState('');

    const totalPages = Math.ceil(quotationData.length / itemsPerPage);
    const startIndex = (currentPage - 1) * itemsPerPage;
    const endIndex = startIndex + itemsPerPage;
    const currentPageData = quotationData.slice(startIndex, endIndex);

    const totalItems = quotationData.length;
    const totalQuantity = quotationData.reduce((sum, item) => sum + parseInt(item.qty || '0'), 0);
    const totalDiscount = quotationData.reduce((sum, item) => sum + parseFloat(item.discount.replace(',', '') || '0'), 0);
    const totalAmount = quotationData.reduce((sum, item) => {
        const amount = parseFloat(item.amount.replace(',', '') || '0');
        return sum + amount;
    }, 0);

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
                pages.push(currentPage - 1);
                pages.push(currentPage);
                pages.push(currentPage + 1);
                pages.push('...');
                pages.push(totalPages);
            }
        }

        return pages;
    };

    const handleSave = () => {
        toast.success('Quotation saved successfully!');
    };

    const handlePrint = () => {
        toast.success('Printing quotation...');
    };

    const handleClear = () => {
        setProductCode('');
        setCustomerName('');
        setQuotationDate('');
        setValidUntil('');
        setRemarks('');
        setQuotationData([]);
        toast.success('Form cleared!');
    };

    const handleRemoveItem = (index: number) => {
        const newData = quotationData.filter((_, i) => i !== index);
        setQuotationData(newData);
        toast.success('Item removed from quotation');
    };

    useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            if (e.key === "ArrowDown") {
                e.preventDefault();
                setSelectedIndex((prev) => (prev < currentPageData.length - 1 ? prev + 1 : prev));
            } else if (e.key === "ArrowUp") {
                e.preventDefault();
                setSelectedIndex((prev) => (prev > 0 ? prev - 1 : prev));
            }
        };

        window.addEventListener("keydown", handleKeyDown);
        return () => window.removeEventListener("keydown", handleKeyDown);
    }, [currentPageData.length]);

    useEffect(() => {
        setSelectedIndex(0);
    }, [currentPage]);

    return (
        <>
            <Toaster
                position="top-right"
                toastOptions={{
                    duration: 3000,
                    style: {
                        background: '#363636',
                        color: '#fff',
                    },
                    success: {
                        duration: 3000,
                        style: {
                            background: '#10b981',
                        },
                    },
                    error: {
                        duration: 4000,
                        style: {
                            background: '#ef4444',
                        },
                    },
                }}
            />
            <div className={'flex flex-col gap-4 h-full'}>
                <div>
                    <div className="text-sm text-gray-400 flex items-center">
                        <span>Quotation</span>
                        <span className="mx-2">›</span>
                        <span className="text-gray-700 font-medium">Create Quotation</span>
                    </div>
                    <h1 className="text-3xl font-semibold bg-gradient-to-r from-gray-800 to-gray-600 bg-clip-text text-transparent">
                        Create Quotation
                    </h1>
                </div>

                <div
                    className={'bg-white rounded-xl p-6 shadow-lg'}
                >
                    <h2 className="text-xl font-semibold text-gray-700 mb-4">Quotation Details</h2>
                    <div className={'grid md:grid-cols-6 gap-4'}>
                        <div>
                            <label htmlFor="product-code" className="block text-sm font-medium text-gray-700 mb-1">
                                Product Code
                            </label>
                            <input
                                id="product-code"
                                type="text"
                                value={productCode}
                                onChange={(e) => setProductCode(e.target.value)}
                                placeholder="Enter Product Code"
                                className="w-full text-sm rounded-lg py-2 px-3 border-2 border-gray-200 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-200 transition-all outline-none"
                            />
                        </div>
                        <div className='col-span-2'>
                            <label htmlFor="customer-name" className="block text-sm font-medium text-gray-700 mb-1">
                                Customer Name
                            </label>
                            <input
                                id="customer-name"
                                type="text"
                                value={customerName}
                                onChange={(e) => setCustomerName(e.target.value)}
                                placeholder="Enter Customer Name"
                                className="w-full text-sm rounded-lg py-2 px-3 border-2 border-gray-200 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-200 transition-all outline-none"
                            />
                        </div>
                        <div>
                            <label htmlFor="quotation-date" className="block text-sm font-medium text-gray-700 mb-1">
                                Quotation Date
                            </label>
                            <input
                                id="quotation-date"
                                type="date"
                                value={quotationDate}
                                onChange={(e) => setQuotationDate(e.target.value)}
                                className="w-full text-sm rounded-lg py-2 px-3 border-2 border-gray-200 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-200 transition-all outline-none"
                            />
                        </div>
                        <div>
                            <label htmlFor="valid-until" className="block text-sm font-medium text-gray-700 mb-1">
                                Valid Until
                            </label>
                            <input
                                id="valid-until"
                                type="date"
                                value={validUntil}
                                onChange={(e) => setValidUntil(e.target.value)}
                                className="w-full text-sm rounded-lg py-2 px-3 border-2 border-gray-200 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-200 transition-all outline-none"
                            />
                        </div>
                        <div>
                            <label htmlFor="remarks" className="block text-sm font-medium text-gray-700 mb-1">
                                Remarks
                            </label>
                            <input
                                id="remarks"
                                type="text"
                                value={remarks}
                                onChange={(e) => setRemarks(e.target.value)}
                                placeholder="Enter Remarks"
                                className="w-full text-sm rounded-lg py-2 px-3 border-2 border-gray-200 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-200 transition-all outline-none"
                            />
                        </div>
                    </div>
                </div>

                <div
                    className={'flex flex-col bg-white rounded-xl p-6 justify-between gap-6 shadow-lg'}
                >
                    <div className="overflow-y-auto max-h-md md:h-[320px] lg:h-[400px] rounded-lg scrollbar-thin scrollbar-thumb-emerald-300 scrollbar-track-gray-100">
                        <table className="min-w-full divide-y divide-gray-200">
                            <thead className="bg-gradient-to-r from-emerald-600 to-emerald-700 sticky top-0 z-10">
                            <tr>
                                {[
                                    "Product ID",
                                    "Product Name",
                                    "MRP",
                                    "Discount",
                                    "Rate",
                                    "Quantity",
                                    "Amount",
                                    "Actions",
                                ].map((header, i, arr) => (
                                    <th
                                        key={header}
                                        scope="col"
                                        className={`px-6 py-3 text-left text-sm font-medium text-white tracking-wider ${
                                            i === 0 ? "rounded-tl-lg" : ""
                                        } ${i === arr.length - 1 ? "rounded-tr-lg" : ""}`}
                                    >
                                        {header}
                                    </th>
                                ))}
                            </tr>
                            </thead>

                            <tbody className="bg-white divide-y divide-gray-200">
                            {currentPageData.length === 0 ? (
                                <tr>
                                    <td colSpan={8} className="px-6 py-8 text-center text-gray-500">
                                        No items added to quotation yet
                                    </td>
                                </tr>
                            ) : (
                                currentPageData.map((item, index) => (
                                    <tr
                                        key={index}
                                        onClick={() => setSelectedIndex(index)}
                                        className={`cursor-pointer transition-colors ${
                                            index === selectedIndex
                                                ? "bg-emerald-50 border-l-4 border-emerald-600"
                                                : "hover:bg-emerald-50/50"
                                        }`}
                                    >
                                        <td className="px-6 py-2 whitespace-nowrap text-sm font-medium">
                                            {item.productId}
                                        </td>
                                        <td className="px-6 py-2 whitespace-nowrap text-sm font-medium">
                                            {item.name}
                                        </td>
                                        <td className="px-6 py-2 whitespace-nowrap text-sm font-medium">
                                            LKR {item.mrp}
                                        </td>
                                        <td className="px-6 py-2 whitespace-nowrap text-sm font-medium text-red-600">
                                            LKR {item.discount}
                                        </td>
                                        <td className="px-6 py-2 whitespace-nowrap text-sm font-medium">
                                            LKR {item.rate}
                                        </td>
                                        <td className="px-6 py-2 whitespace-nowrap text-sm font-medium">
                                            {item.qty}
                                        </td>
                                        <td className="px-6 py-2 whitespace-nowrap text-sm font-medium text-emerald-600">
                                            LKR {item.amount}
                                        </td>
                                        <td className="px-6 py-2 whitespace-nowrap text-sm font-medium">
                                            <div className="relative group">
                                                <button
                                                    onClick={(e) => {
                                                        e.stopPropagation();
                                                        handleRemoveItem(startIndex + index);
                                                    }}
                                                    className="p-2 bg-gradient-to-r from-red-100 to-red-200 rounded-lg text-red-700 hover:from-red-200 hover:to-red-300 transition-all shadow-sm"
                                                >
                                                    <Trash size={15}/>
                                                </button>
                                                <span className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 w-max px-2 py-1 text-xs text-white bg-gray-900 rounded-md invisible group-hover:visible opacity-0 group-hover:opacity-100 transition-opacity">
                                                    Remove Item
                                                </span>
                                            </div>
                                        </td>
                                    </tr>
                                ))
                            )}
                            </tbody>
                        </table>
                    </div>

                    <nav className="bg-white flex items-center justify-between sm:px-6 pt-4 border-t-2 border-gray-100">
                        <div className="text-sm text-gray-600">
                            Showing <span className="font-medium text-emerald-600">{currentPageData.length === 0 ? 0 : startIndex + 1}</span> to <span className="font-medium text-emerald-600">{Math.min(endIndex, totalItems)}</span> of <span className="font-medium text-emerald-600">{totalItems}</span> items
                        </div>
                        <div className="flex items-center space-x-2">
                            <button
                                onClick={goToPreviousPage}
                                disabled={currentPage === 1}
                                className={`flex items-center px-3 py-2 text-sm font-medium rounded-lg transition-all ${
                                    currentPage === 1
                                        ? 'text-gray-300 cursor-not-allowed'
                                        : 'text-gray-600 hover:bg-emerald-50 hover:text-emerald-600'
                                }`}
                            >
                                <ChevronLeft className="mr-1 h-4 w-4"/> Previous
                            </button>

                            {getPageNumbers().map((page, idx) => (
                                typeof page === 'number' ? (
                                    <button
                                        key={idx}
                                        onClick={() => goToPage(page)}
                                        className={`px-4 py-2 text-sm font-medium rounded-lg transition-all ${
                                            currentPage === page
                                                ? 'bg-gradient-to-r from-emerald-500 to-emerald-600 text-white shadow-lg shadow-emerald-200'
                                                : 'text-gray-600 hover:bg-emerald-50'
                                        }`}
                                    >
                                        {page}
                                    </button>
                                ) : (
                                    <span key={idx} className="text-gray-400 px-2">...</span>
                                )
                            ))}

                            <button
                                onClick={goToNextPage}
                                disabled={currentPage === totalPages}
                                className={`flex items-center px-3 py-2 text-sm font-medium rounded-lg transition-all ${
                                    currentPage === totalPages
                                        ? 'text-gray-300 cursor-not-allowed'
                                        : 'text-gray-600 hover:bg-emerald-50 hover:text-emerald-600'
                                }`}
                            >
                                Next <ChevronRight className="ml-1 h-4 w-4"/>
                            </button>
                        </div>
                    </nav>
                </div>

                <div
                    className="bg-gradient-to-r from-emerald-500 to-emerald-600 p-4 rounded-xl flex text-lg shadow-xl shadow-emerald-200"
                >
                    <div className="text-white w-1/4 pl-5 flex items-center">
                        <Package className="mr-2" size={20}/>
                        Items: <span className='font-bold ml-2'>{totalItems}</span>
                    </div>
                    <div className="text-white w-1/4 text-center flex items-center justify-center">
                        <ShoppingCart className="mr-2" size={20}/>
                        Quantity: <span className='font-bold ml-2'>{totalQuantity}</span>
                    </div>
                    <div className="text-white w-1/4 text-center flex items-center justify-center">
                        <DollarSign className="mr-2" size={20}/>
                        Discount: <span className='font-bold ml-2'>LKR {totalDiscount.toLocaleString('en-US', { minimumFractionDigits: 2 })}</span>
                    </div>
                    <div className="text-white w-1/4 text-end pr-5 flex items-center justify-end">
                        <Receipt className="mr-2" size={20}/>
                        Total: <span className='font-bold ml-2'>LKR {totalAmount.toLocaleString('en-US', { minimumFractionDigits: 2 })}</span>
                    </div>
                </div>

                <div
                    className={'bg-white rounded-xl p-6 shadow-lg flex justify-center'}
                >
                    <div className={'grid md:grid-cols-3 gap-4 '}>
                        <button
                            onClick={handleSave}
                            className='flex items-center justify-center gap-2 px-6 py-3 bg-gradient-to-r from-emerald-500 to-emerald-600 hover:from-emerald-600 hover:to-emerald-700 text-white font-medium rounded-lg shadow-lg shadow-emerald-200 hover:shadow-xl transition-all'
                        >
                            <Save size={20}/>
                            Save Quotation
                        </button>

                        <button
                            onClick={handlePrint}
                            className='flex items-center justify-center gap-2 px-6 py-3 bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white font-medium rounded-lg shadow-lg shadow-blue-200 hover:shadow-xl transition-all'
                        >
                            <Printer size={20}/>
                            Print Quotation
                        </button>

                        <button
                            onClick={handleClear}
                            className='flex items-center justify-center gap-2 px-6 py-3 bg-gradient-to-r from-red-500 to-red-600 hover:from-red-600 hover:to-red-700 text-white font-medium rounded-lg shadow-lg shadow-red-200 hover:shadow-xl transition-all'
                        >
                            <Trash size={20}/>
                            Clear All
                        </button>

                    </div>
                </div>
            </div>
        </>
    );
}

export default CreateQuotation;