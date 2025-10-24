import {
    ChevronLeft,
    ChevronRight,
    Edit,
    Eye,
    Printer,
    RefreshCw,
    SearchCheck,
    Trash,

} from 'lucide-react';

import { useEffect, useState } from 'react';

function ManageCategory() {

    const salesData = [
        {
            no: '01',
            categoryname: 'adoo',
            createdon: '2025-05-02',

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
        <div className={'flex flex-col gap-4 h-full'}>
            <div>
                <div className="text-sm text-gray-500 flex items-center">
                    <span>Pages</span>
                    <span className="mx-2">›</span>
                    <span className="text-black">Manage Category</span>
                </div>
                <h1 className="text-3xl font-semibold text-gray-500">Manage Category</h1>
            </div>

            <div className={'bg-white rounded-md p-4  '}>
                <div className={'grid md:grid-cols-5 gap-4 '}>
                    <div className=''>
                        <label htmlFor="quotation-id"
                            className="block text-sm font-medium text-gray-700 mb-1">Search Category</label>
                        <input type="text" id="quotation-id" placeholder="Search Category..."
                            className="w-full text-sm rounded-md py-2 px-2  border-2 border-gray-100 " />

                    </div>

                    <div className='col-3'>
                    </div>

                    <div className=''>
                        <label htmlFor="quotation-id"
                            className="block text-sm font-medium text-gray-700 mb-1">Category Name</label>
                        <input type="text" id="quotation-id" placeholder="Enter New Category..."
                            className="w-full text-sm rounded-md py-2 px-2  border-2 border-gray-100 " />

                    </div>
                    <div className={'grid grid-cols-1 md:items-end items-start gap-2 text-white font-medium'}>
                        <button className={'bg-emerald-600 py-2 rounded-md flex items-center justify-center'}>
                            Save Unit
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
                                {['#', 'Categoary Name', 'Created On', 'Actions'
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
                                    <td className="px-6 py-2 whitespace-nowrap text-sm font-medium">{sale.no}</td>
                                    <td className="px-6 py-2 whitespace-nowrap text-sm font-medium">{sale.categoryname}</td>
                                    <td className="px-6 py-2 whitespace-nowrap text-sm font-medium">{sale.createdon}</td>
                                    <td className="px-6 py-2 whitespace-nowrap text-sm font-medium">
                                        <div className="flex items-center space-x-2">
                                            <div className="relative group">
                                                <button
                                                    className="p-2 bg-green-100 rounded-full text-green-700 hover:bg-green-200 transition-colors">
                                                    <Edit className="w-5 h-5" />
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


        </div>
    );
}

export default ManageCategory;


