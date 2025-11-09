import {
    Box, ChevronLeft, ChevronRight,

    Printer,
    PrinterIcon,

    Save,

    Trash,

} from 'lucide-react';

import { useEffect, useState } from 'react';

function CreateQuotation() {

    const salesData = [
        {
            productId: '250929003',
            name: 'shanila',
            mrp: '10',
            discount: '650.00',
            rate: '50',
            qty: '10',
            amount: 'LKR.1000.00',
        },
        {
            productId: '250929003',
            name: 'shanila',
            mrp: '10',
            discount: '650.00',
            rate: '50',
            qty: '10',
            amount: 'LKR.1000.00',
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
                    <span className="text-black">Create Quotation</span>
                </div>
                <h1 className="text-3xl font-semibold text-gray-500">Create Quotation</h1>
            </div>

            <div className={'bg-white rounded-xl p-4 pb-0 flex flex-col'}>
                <h2 className="text-xl font-semibold text-gray-400">Filter</h2>
                <div className={'grid md:grid-cols-6 gap-4 mb-5'}>
                    <div>
                        <label htmlFor="search-type"
                            className="block text-sm font-medium text-gray-700 mb-1">Search Type</label>
                        <select id="search-type"
                            className="w-full text-sm rounded-md py-2 px-2 border-2 border-gray-100">
                            <option value="">Barcode / Product ID</option>
                            <option value="barcode">Barcode</option>
                            <option value="productId">Product ID</option>
                        </select>
                    </div>
                    <div className='col-span-2'>
                        <label htmlFor="from-date"
                            className="block text-sm font-medium text-gray-700 mb-1">Search</label>
                        <div className='flex'>
                            <input type="text" id="from-date" placeholder="Search........."
                                className="w-full text-sm rounded-md py-2 px-2  border-2 border-gray-100 " />
                            <div className='bg-emerald-600 text-white text-xl py-1 flex items-center px-4 font-semibold rounded-sm'>F1</div>
                        </div>
                    </div>
                    <div>
                        <label htmlFor="to-date"
                            className="block text-sm font-medium text-gray-700 mb-1">Unit Price</label>
                        <input type="text" id="to-date" placeholder="LKR."
                            className="w-full text-sm rounded-md py-2 px-2  border-2 border-gray-100 " />

                    </div>
                    <div>
                        <label htmlFor="to-date"
                            className="block text-sm font-medium text-gray-700 mb-1">Discount</label>
                        <input type="text" id="to-date" placeholder="%."
                            className="w-full text-sm rounded-md py-2 px-2  border-2 border-gray-100 " />

                    </div>
                    <div>
                        <label htmlFor="to-date"
                            className="block text-sm font-medium text-gray-700 mb-1">Quantity</label>
                        <input type="text" id="to-date" placeholder="QTY."
                            className="w-full text-sm rounded-md py-2 px-2  border-2 border-gray-100 " />

                    </div>
                </div>

                <div className='bg-emerald-600 flex items-center justify-center text-white py-1 text-center w-70 rounded-tr-xl rounded-bl-xl ml-[-13px] '>
                    <span>Locked Price :</span>&nbsp;
                    <span className='font-semibold text-2xl'>LKR.5000.00</span>
                </div>

            </div>

            <div className={'flex flex-col bg-white rounded-md h-full p-4 justify-between'}>
                <div
                    className="overflow-y-auto max-h-md md:h-[320px] lg:h-[400px] rounded-md scrollbar-thin scrollbar-thumb-gray-300 scrollbar-track-gray-100">
                    <table className="min-w-full divide-y divide-gray-200">
                        <thead className="bg-emerald-600 sticky top-0 z-10">
                            <tr>
                                {['Product ID', 'Name', 'MRP', 'Discount', 'Rate', 'Qty', 'Amount', 'Actions'
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
                                    className={`cursor-pointer ${index === selectedIndex
                                        ? "bg-green-100 border-l-4 border-green-600"
                                        : "hover:bg-green-50"
                                        }`}
                                >
                                    <td className="px-6 py-2 whitespace-nowrap text-sm font-medium">{sale.productId}</td>
                                    <td className="px-6 py-2 whitespace-nowrap text-sm font-medium">{sale.name}</td>
                                    <td className="px-6 py-2 whitespace-nowrap text-sm font-medium">{sale.mrp}</td>
                                    <td className="px-6 py-2 whitespace-nowrap text-sm font-medium">{sale.discount}</td>
                                    <td className="px-6 py-2 whitespace-nowrap text-sm font-medium">{sale.rate}</td>
                                    <td className="px-6 py-2 whitespace-nowrap text-sm font-medium">{sale.qty}</td>
                                    <td className="px-6 py-2 whitespace-nowrap text-sm font-medium">{sale.amount}</td>
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
                                                    className="p-2 bg-red-100 rounded-full text-red-700 hover:bg-red-200 transition-colors">
                                                    <Trash className="w-5 h-5" />
                                                </button>
                                                <span
                                                    className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 w-max px-2 py-1 text-xs text-white bg-gray-900 rounded-md invisible group-hover:visible opacity-0 group-hover:opacity-100 transition-opacity">
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

              <nav className="bg-white flex items-center justify-center sm:px-6">
                    <div className="flex items-center space-x-2">
                        <button
                            className="flex items-center px-2 py-2 text-sm font-medium text-gray-500 hover:text-gray-700">
                            <ChevronLeft className="mr-2 h-5 w-5" /> Previous
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
                            Next <ChevronRight className="ml-2 h-5 w-5" />
                        </button>
                    </div>
                </nav>
            </div>

            <div className="bg-emerald-600 p-2 rounded-md flex text-xl">
                <div className="text-white w-1/4 pl-5">Items: <span className='font-semibold'>2</span></div>
                <div className="text-white w-1/4 text-center">Quantity: <span className='font-semibold'>2</span></div>
                <div className="text-white w-1/4 text-center">Discount: <span className='font-semibold'>LKR.500.00</span></div>
                <div className="text-white w-1/4 text-end pr-5">Total: <span className='font-semibold'>LKR.500.00</span></div>
            </div>

            <div className={'bg-white rounded-xl p-4 pb-0 flex flex-col'}>
                <div className={'grid md:grid-cols-8 gap-4 mb-5'}>
                    <div className='col-span-1 shadow-md text-center text-green-600'>
                        <div className='flex items-center justify-center'>
                            <Box />
                        </div>
                        <label 
                            className="block text-sm font-medium text-[#8C8C8C] mb-1">Stock (F6)
                        </label>
                    </div>
                    <div className='col-span-1 shadow-md text-center text-yellow-600'>
                        <div className='flex items-center justify-center'>
                            <Save />
                        </div>
                        <label 
                            className="block text-sm font-medium text-[#8C8C8C] mb-1">Save (F6)
                        </label>
                    </div>
                    <div className='col-span-1 shadow-md text-center text-green-600'>
                        <div className='flex items-center justify-center'>
                            <PrinterIcon />
                        </div>
                        <label 
                            className="block text-sm font-medium text-[#8C8C8C] mb-1">Print (F6)
                        </label>
                    </div>
                </div>
            </div>


        </div>
    );
}

export default CreateQuotation;

