import {RefreshCw, SearchCheck, ChevronLeft, ChevronRight, FileText} from "lucide-react"
import { useState } from "react"
import TypeableSelect from "../../../components/TypeableSelect.tsx";

function OutOfStock() {
    // Sample data for out-of-stock items
    const stockData = [
        {
            productId: "P-1001",
            productName: "White Sugar",
            unit: "kg",
            discountAmount: "50.00",
            costPrice: "175.00",
            mrp: "225.00",
            price: "210.00",
            supplier: "Global Foods Ltd",
            stock: "0"
        },
        {
            productId: "P-1002",
            productName: "Brown Rice",
            unit: "kg",
            discountAmount: "0.00",
            costPrice: "220.00",
            mrp: "270.00",
            price: "270.00",
            supplier: "Organic Farms Inc",
            stock: "0"
        },
        {
            productId: "P-1003",
            productName: "Wheat Flour",
            unit: "kg",
            discountAmount: "20.00",
            costPrice: "130.00",
            mrp: "160.00",
            price: "140.00",
            supplier: "National Mills",
            stock: "0"
        },
        {
            productId: "P-1004",
            productName: "Vegetable Oil",
            unit: "L",
            discountAmount: "0.00",
            costPrice: "350.00",
            mrp: "420.00",
            price: "420.00",
            supplier: "Sunshine Products",
            stock: "0"
        },
        {
            productId: "P-1005",
            productName: "Black Pepper",
            unit: "g",
            discountAmount: "15.00",
            costPrice: "80.00",
            mrp: "120.00",
            price: "105.00",
            supplier: "Spice World",
            stock: "0"
        }
    ];

    // Selected row state
    const [selectedIndex, setSelectedIndex] = useState(0);
    const category = [
        { value: 'apple', label: 'Apple' },
        { value: 'banana', label: 'Banana' },
        { value: 'orange', label: 'Orange' },

    ];

    const supplier = [
        { value: 'supplier1', label: 'supplier1' },
        { value: 'supplier2', label: 'supplier2' },
        { value: 'supplier3', label: 'supplier3' },

    ];
    const productSearch = [
        { value: 'product12', label: 'product12' },
        { value: 'product2', label: 'product2' },
        { value: 'product3', label: 'product3' },

    ];
    type SelectOption = {
        value: string;
        label: string;
    };

    const [selected, setSelected] = useState<SelectOption | null>(null);

    return (
        <div className={'flex flex-col gap-4 h-full'}>
            <div>
                <div className="text-sm text-gray-500 flex items-center">
                    <span>Pages</span>
                    <span className="mx-2">›</span>
                    <span className="text-black">Out Of Stock</span>
                </div>
                <h1 className="text-3xl font-semibold text-gray-500">Out Of Stock</h1>
            </div>

            {/* Filter section */}
            <div className="w-full bg-white rounded-lg p-5">
                <div className="flex justify-between items-center">
                    <h2 className="text-lg font-semibold text-gray-700">Filter</h2>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6 items-end">
                    {/* Four input fields with improved spacing */}
                    <div className="flex flex-col">
                        <label className="text-sm text-gray-600 mb-1">Product</label>
                        <TypeableSelect
                            className="w-1/2"
                            options={productSearch}
                            value={selected?.value || null}
                            onChange={(opt) => opt ? setSelected({
                                value: String(opt.value),
                                label: opt.label
                            }) : setSelected(null)}
                            placeholder="Search product..."
                            allowCreate={true}
                        />
                    </div>

                    <div className="flex flex-col">
                        <label className="text-sm text-gray-600 mb-1">Category</label>
                        <TypeableSelect
                            className="w-1/2"
                            options={category}
                            value={selected?.value || null}
                            onChange={(opt) => opt ? setSelected({
                                value: String(opt.value),
                                label: opt.label
                            }) : setSelected(null)}
                            placeholder="Search categories..."
                            allowCreate={true}
                        />
                    </div>

                    <div className="flex flex-col">
                        <label className="text-sm text-gray-600 mb-1">Supplier</label>
                        <TypeableSelect
                            className="w-1/2"
                            options={supplier}
                            value={selected?.value || null}
                            onChange={(opt) => opt ? setSelected({
                                value: String(opt.value),
                                label: opt.label
                            }) : setSelected(null)}
                            placeholder="Search suppliers..."
                            allowCreate={true}
                        />
                    </div>

                    <div className="flex flex-col">
                        <label className="text-sm text-gray-600 mb-1">Date</label>
                        <input
                            type="date"
                            placeholder="Select date"
                            className="w-full h-10 border border-gray-300 rounded-lg px-4"
                        />
                    </div>

                    {/* Buttons aligned to the end */}
                    <div className={'grid grid-cols-2 md:items-end items-start gap-2 text-white font-medium'}>
                        <button className={'bg-emerald-600 py-2 rounded-md flex items-center justify-center'}>
                            <SearchCheck className="mr-2" size={14}/>Search
                        </button>
                        <button className={'bg-gray-500 py-2 rounded-md flex items-center justify-center'}>
                            <RefreshCw className="mr-2" size={14}/>Clear
                        </button>
                    </div>
                </div>
            </div>

            {/* Table section */}
            <div className="flex flex-col bg-white rounded-md h-full p-4 justify-between">
                <div
                    className="overflow-y-auto max-h-md md:h-[320px] lg:h-[500px] rounded-md scrollbar-thin scrollbar-thumb-gray-300 scrollbar-track-gray-100">
                    <table className="min-w-full divide-y divide-gray-200">
                        <thead className="sticky top-0 z-10" style={{backgroundColor: '#EF4444'}}>
                        <tr>
                            {[
                                'Product ID',
                                'Product Name',
                                'Unit',
                                'Discount Amount',
                                'Cost Price',
                                'MRP',
                                'Price',
                                'Supplier',
                                'Stock'
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
                        {stockData.map((item, index) => (
                            <tr
                                key={index}
                                onClick={() => setSelectedIndex(index)}
                                className={`cursor-pointer ${
                                    index === selectedIndex
                                        ? "bg-red-100 border-l-4 border-red-600"
                                        : "hover:bg-red-50"
                                }`}
                            >
                                <td className="px-6 py-2 whitespace-nowrap text-sm font-medium">
                                    {item.productId}
                                </td>
                                <td className="px-6 py-2 whitespace-nowrap text-sm font-medium">
                                    {item.productName}
                                </td>
                                <td className="px-6 py-2 whitespace-nowrap text-sm font-medium">
                                    {item.unit}
                                </td>
                                <td className="px-6 py-2 whitespace-nowrap text-sm font-medium">
                                    {item.discountAmount}
                                </td>
                                <td className="px-6 py-2 whitespace-nowrap text-sm font-medium">
                                    {item.costPrice}
                                </td>
                                <td className="px-6 py-2 whitespace-nowrap text-sm font-medium">
                                    {item.mrp}
                                </td>
                                <td className="px-6 py-2 whitespace-nowrap text-sm font-medium">
                                    {item.price}
                                </td>
                                <td className="px-6 py-2 whitespace-nowrap text-sm font-medium">
                                    {item.supplier}
                                </td>
                                <td className="px-6 py-2 whitespace-nowrap text-sm font-medium text-red-600 ">
                                    {item.stock}
                                </td>
                            </tr>
                        ))}
                        </tbody>
                    </table>
                </div>

                {/* Pagination */}
                <nav className="bg-white flex items-center justify-center sm:px-6 mt-4">
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

            <div className={'bg-white flex justify-center p-4 gap-4'}>
                <button
                    className={'bg-emerald-600 px-6 py-2 font-medium text-white rounded-md flex gap-2 items-center shadow-sm'}>
                    <FileText size={15}/>Exel
                </button>
                <button
                    className={'bg-yellow-600 px-6 py-2 font-medium text-white rounded-md flex gap-2 items-center shadow-sm'}>
                    <FileText size={15}/>CSV
                </button>
                <button
                    className={'bg-red-500 px-6 py-2 font-medium text-white rounded-md flex gap-2 items-center shadow-sm'}>
                    <FileText size={15}/>PDF
                </button>
            </div>
        </div>
    )
}

export default OutOfStock