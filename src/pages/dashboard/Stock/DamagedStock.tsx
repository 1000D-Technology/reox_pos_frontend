import {
    ChevronLeft,
    ChevronRight,
    Eye,
    NotepadText,
    Plus,
    Printer,
    RefreshCw,
    SearchCheck,
    Trash,

} from 'lucide-react';

import { useEffect, useState } from 'react';
import TypeableSelect from '../../../components/TypeableSelect';

function DamagedStock() {

    const options = [
        { value: 'apple', label: 'Apple' },
        { value: 'banana', label: 'Banana' },
        { value: 'orange', label: 'Orange' },

    ];
    type SelectOption = {
        value: string;
        label: string;
    };
    const [selected, setSelected] = useState<SelectOption | null>(null);

    const salesData = [
        {
            productId: '250929003',
            productName: 'Bat',
            unit: '0.00',
            discountAmount: '650.00',
            costPrice: '650.00',
            mrp: '1000.00',
            price: '650.00',
            supplier: 'shanila',
            stock: 'new',
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
                    <span className="text-black">Damaged Stock</span>
                </div>
                <h1 className="text-3xl font-semibold text-gray-500">Damaged Stock</h1>
            </div>

            <div className={'bg-white rounded-md p-4 flex flex-col'}>
                <h2 className="text-xl font-semibold text-gray-400">Filter</h2>
                <div className={'grid md:grid-cols-5 gap-4 '}>
                    <div>
                        <label htmlFor="quotation-id"
                            className="block text-sm font-medium text-gray-700 mb-1">Category</label>

                        <div >
                            <TypeableSelect
                                className="w-1/2"
                                options={options}
                                value={selected?.value || null}
                                onChange={(opt) => opt ? setSelected({ value: String(opt.value), label: opt.label }) : setSelected(null)}
                                placeholder="Search fruits..."
                                allowCreate={true}
                            />
                        </div>

                    </div>
                    <div>
                        <label htmlFor="quotation-id"
                            className="block text-sm font-medium text-gray-700 mb-1">Unit</label>
                        <div >
                            <TypeableSelect
                                className="w-[20px]"
                                options={options}
                                value={selected?.value || null}
                                onChange={(opt) => opt ? setSelected({ value: String(opt.value), label: opt.label }) : setSelected(null)}
                                placeholder="Search fruits..."
                                allowCreate={true}
                            />
                        </div>

                    </div>
                    <div>
                        <label htmlFor="quotation-id"
                            className="block text-sm font-medium text-gray-700 mb-1">Supplier</label>
                        <div >
                            <TypeableSelect
                                className="w-[20px]"
                                options={options}
                                value={selected?.value || null}
                                onChange={(opt) => opt ? setSelected({ value: String(opt.value), label: opt.label }) : setSelected(null)}
                                placeholder="Search fruits..."
                                allowCreate={true}
                            />
                        </div>

                    </div>
                    <div>
                        <label htmlFor="quotation-id"
                            className="block text-sm font-medium text-gray-700 mb-1">Product ID/Name</label>
                        <input type="text" id="quotation-id" placeholder="Select Product Id"
                            className="w-full text-sm rounded-md py-2 px-2  border-2 border-gray-100 " />

                    </div>
                    <div className={'grid grid-cols-2 md:items-end items-start gap-2 text-white font-medium'}>
                        <button className={'bg-emerald-600 py-2 rounded-md flex items-center justify-center'}>
                            <SearchCheck className="mr-2" size={14} />Search
                        </button>
                        <button className={'bg-gray-500 py-2 rounded-md flex items-center justify-center'}><RefreshCw
                            className="mr-2" size={14} />Cancel
                        </button>
                    </div>

                    <div className='col-span-5'>
                        <hr className='text-[#8C8C8C]' />
                    </div>

                    <div>
                        <label htmlFor="quotation-id"
                            className="block text-sm font-medium text-gray-700 mb-1">Product ID/Name</label>
                        <input type="text" id="quotation-id" placeholder="Search...."
                            className="w-full text-sm rounded-md py-2 px-2  border-2 border-gray-100 " />

                    </div>
                    <div>
                        <label htmlFor="quotation-id"
                            className="block text-sm font-medium text-gray-700 mb-1">Select Stock</label>
                        <div >
                            <TypeableSelect
                                className="w-[20px]"
                                options={options}
                                value={selected?.value || null}
                                onChange={(opt) => opt ? setSelected({ value: String(opt.value), label: opt.label }) : setSelected(null)}
                                placeholder="Search fruits..."
                                allowCreate={true}
                            />
                        </div>

                    </div>
                    <div>
                        <label htmlFor="quotation-id"
                            className="block text-sm font-medium text-gray-700 mb-1">Damaged Quantity</label>
                        <input type="text" id="quotation-id" placeholder="Enter  QTY"
                            className="w-full text-sm rounded-md py-2 px-2  border-2 border-gray-100 " />

                    </div>
                    <div className={'grid grid-cols-2 md:items-end items-start gap-2 text-white font-medium'}>
                        <button className={'bg-emerald-600 py-2 rounded-md flex items-center justify-center'}>
                            <Plus className="mr-2" size={14} />Add
                        </button>
                    </div>
                </div>
            </div>
            <div className={'flex flex-col bg-white rounded-md h-2/3 p-4 justify-between'}>
                <div
                    className="overflow-y-auto max-h-md md:h-[320px] lg:h-[500px] rounded-md scrollbar-thin scrollbar-thumb-gray-300 scrollbar-track-gray-100">
                    <table className="min-w-full divide-y divide-gray-200">
                        <thead className="bg-[#991B1B] sticky top-0 z-10">
                            <tr>
                                {['Product ID', 'Product Name', 'Unit', 'Discount Amount', 'Cost Price', 'MRP', 'Price', 'Supplier', "Stock"
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
                                        ? "bg-red-100 border-l-4 border-red-600"
                                        : "hover:bg-red-50"
                                        }`}
                                >
                                    <td className="px-6 py-2 whitespace-nowrap text-sm font-medium">{sale.productId}</td>
                                    <td className="px-6 py-2 whitespace-nowrap text-sm font-medium">{sale.productName}</td>
                                    <td className="px-6 py-2 whitespace-nowrap text-sm font-medium">{sale.unit}</td>
                                    <td className="px-6 py-2 whitespace-nowrap text-sm font-medium">{sale.discountAmount}</td>
                                    <td className="px-6 py-2 whitespace-nowrap text-sm font-medium">{sale.costPrice}</td>
                                    <td className="px-6 py-2 whitespace-nowrap text-sm font-medium">{sale.mrp}</td>
                                    <td className="px-6 py-2 whitespace-nowrap text-sm font-medium">{sale.price}</td>
                                    <td className="px-6 py-2 whitespace-nowrap text-sm font-medium">{sale.supplier}</td>
                                    <td className="px-6 py-2 whitespace-nowrap text-sm font-medium">{sale.stock}</td>

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

            <div className='flex  bg-white rounded-md p-4 justify-center'>
                <div className='flex gap-2'>
                    <div className='bg-[#059669] flex gap-2 text-white font-semibold rounded-md py-2 px-8'><NotepadText className="h-5 w-5" />Excel</div>
                    <div className='bg-[#F59E0B] flex gap-2 text-white font-semibold rounded-md py-2 px-8'><NotepadText className="h-5 w-5" />CSV</div>
                    <div className='bg-[#EF4444] flex gap-2 text-white font-semibold rounded-md py-2 px-8'><NotepadText className="h-5 w-5" />PDF</div>
                </div>
            </div>


        </div>
    );
}

export default DamagedStock;

