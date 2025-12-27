
import {
    Barcode,

    ChevronLeft, ChevronRight,
    FileText, Pencil,

    RefreshCw,
    SearchCheck, Trash, X,
} from "lucide-react";
import {useEffect, useState} from "react";
import TypeableSelect from "../../../components/TypeableSelect.tsx";

function ProductList() {
    const [isEditModalOpen, setIsEditModalOpen] = useState(false);
    const [selectedProduct, setSelectedProduct] = useState<typeof salesData[0] | null>(null);

    const salesData = [
        {
            productID: "250929003",
            productName: "Suger",
            productCode: "TS425",
            barcode: "742388563",
            category: "Grocery",
            brand: "Emerald",
            unit: "Kg",
            productType: "Sugar",
            color: "Red",
            size: "25000",
            storage: "5",
            createdOn: "2025.02.01",
        },
    ];


    type SelectOption = {
        value: string;
        label: string;
    };
    const [selected, setSelected] = useState<SelectOption | null>(null);

    const types = [
        {value: 'frank', label: 'Frank'},
        {value: 'elsa', label: 'Elsa'},
        {value: 'saman', label: 'Saman'},
        {value: 'kumara', label: 'Kumara'},
    ];

    const brands = [
        {value: "Emerald", label: "Emerald"},
        {value: "elsa", label: "Elsa"},
        {value: "saman", label: "Saman"},
        {value: "kumara", label: "Kumara"},
    ];

    const units = [
        {value: "kg", label: "Kilogram"},
        {value: "ltr", label: "Litre"},
        {value: "pcs", label: "Pieces"},
    ];

    const productType = [
        {value: "suger", label: "Suger"},
        {value: "fima", label: "Fima"},
        {value: "snacks", label: "Snacks"},
    ];

    const categories = [
        {value: "grocery", label: "Grocery"},
        {value: "beverages", label: "Beverages"},
        {value: "snacks", label: "Snacks"},
    ];

    const productName = [
        {value: "suger", label: "Suger"},
        {value: "fima", label: "Fima"},
        {value: "snacks", label: "Snacks"},
    ];

    const color = [
        {value: "red", label: "Red"},
        {value: "yellow", label: "Yellow"},
        {value: "green", label: "Green"},
    ];

    // 🔹 Selected row state
    const [selectedIndex, setSelectedIndex] = useState(0);



    const EditProductModal = () => {
        if (!isEditModalOpen || !selectedProduct) return null;

        return (
            <div className="fixed inset-0  bg-opacity-50 flex items-center justify-center z-50 bg-white/10 backdrop-blur-sm">
                <div className="bg-white rounded-lg p-6 w-full max-w-7xl max-h-[90vh] overflow-y-auto">
                    <div className="flex justify-between items-center mb-4">
                        <h2 className="text-2xl font-semibold">Edit Product</h2>
                        <button onClick={() => setIsEditModalOpen(false)} className="p-1 hover:bg-gray-100 rounded">
                            <X size={24} />
                        </button>
                    </div>

                    <div className={"bg-white rounded-md p-4 flex flex-col"}>

                        <span className="text-lg font-semibold my-4">Basic Product Information</span>

                        <div className={"grid md:grid-cols-3 gap-4 "}>
                            <div>
                                <label
                                    htmlFor="product name"
                                    className="block text-sm font-medium text-gray-700 mb-1"
                                >
                                    Product Name
                                </label>
                                <TypeableSelect
                                    options={productName}
                                    value={selected?.value || null}
                                    onChange={(opt) =>
                                        opt
                                            ? setSelected({
                                                value: String(opt.value),
                                                label: opt.label,
                                            })
                                            : setSelected(null)
                                    }
                                    placeholder="Type to search Product"
                                    allowCreate={true}
                                />
                            </div>
                            <div>
                                <label
                                    htmlFor="product code"
                                    className="block text-sm font-medium text-gray-700 mb-1"
                                >
                                    Product Code
                                </label>
                                <input
                                    type="text"
                                    id="product code"
                                    placeholder="Type to search Product Code"
                                    className="w-full text-sm rounded-md py-2 px-2  border-2 border-gray-100 "
                                />
                            </div>
                            <div>
                                <label
                                    htmlFor="barcode"
                                    className="block text-sm font-medium text-gray-700 mb-1"
                                >
                                    Barcode
                                </label>
                                <input
                                    type="text"
                                    id="barcode"
                                    placeholder="Enter Barcode"
                                    className="w-full text-sm rounded-md py-2 px-2  border-2 border-gray-100 "
                                />
                            </div>

                            <div>
                                <label
                                    htmlFor="category"
                                    className="block text-sm font-medium text-gray-700 mb-1"
                                >
                                    Category
                                </label>
                                <TypeableSelect
                                    options={categories}
                                    value={selected?.value || null}
                                    onChange={(opt) =>
                                        opt
                                            ? setSelected({
                                                value: String(opt.value),
                                                label: opt.label,
                                            })
                                            : setSelected(null)
                                    }
                                    placeholder="Type to search types"
                                    allowCreate={true}
                                />
                            </div>

                            <div>
                                <label
                                    htmlFor="brand"
                                    className="block text-sm font-medium text-gray-700 mb-1"
                                >
                                    Brand </label>
                                <TypeableSelect
                                    options={brands}
                                    value={selected?.value || null}
                                    onChange={(opt) =>
                                        opt
                                            ? setSelected({
                                                value: String(opt.value),
                                                label: opt.label,
                                            })
                                            : setSelected(null)
                                    }
                                    placeholder="Type to search types"
                                    allowCreate={true}
                                />
                            </div>

                            <div>
                                <label
                                    htmlFor="unit"
                                    className="block text-sm font-medium text-gray-700 mb-1"
                                >
                                    Unit
                                </label>
                                <TypeableSelect
                                    options={units}
                                    value={selected?.value || null}
                                    onChange={(opt) =>
                                        opt
                                            ? setSelected({
                                                value: String(opt.value),
                                                label: opt.label,
                                            })
                                            : setSelected(null)
                                    }
                                    placeholder="Type to search Product"
                                    allowCreate={true}
                                />
                            </div>

                            <div>
                                <label
                                    htmlFor="product type"
                                    className="block text-sm font-medium text-gray-700 mb-1"
                                >
                                    Product Type
                                </label>
                                <TypeableSelect
                                    options={productType}
                                    value={selected?.value || null}
                                    onChange={(opt) =>
                                        opt
                                            ? setSelected({
                                                value: String(opt.value),
                                                label: opt.label,
                                            })
                                            : setSelected(null)
                                    }
                                    placeholder="Type to search types"
                                    allowCreate={true}
                                />
                            </div>

                        </div>
                        <span className="text-lg font-semibold my-4">Product Variations (Optional)</span>

                        <div className={"grid md:grid-cols-3 gap-4 "}>
                            <div>
                                <label
                                    htmlFor="color"
                                    className="block text-sm font-medium text-gray-700 mb-1"
                                >
                                    Color
                                </label>
                                <TypeableSelect
                                    options={color}
                                    value={selected?.value || null}
                                    onChange={(opt) =>
                                        opt
                                            ? setSelected({
                                                value: String(opt.value),
                                                label: opt.label,
                                            })
                                            : setSelected(null)
                                    }
                                    placeholder="Type to search Product"
                                    allowCreate={true}
                                />
                            </div>
                            <div>
                                <label
                                    htmlFor="size"
                                    className="block text-sm font-medium text-gray-700 mb-1"
                                >
                                    Size
                                </label>
                                <input
                                    type="number"
                                    id="size"
                                    placeholder="Enter Size"
                                    className="w-full text-sm rounded-md py-2 px-2  border-2 border-gray-100 "
                                />
                            </div>
                            <div>
                                <label
                                    htmlFor="Storage/Capacity"
                                    className="block text-sm font-medium text-gray-700 mb-1"
                                >
                                    Storage/Capacity
                                </label>
                                <input
                                    type="number"
                                    id="Storage/Capacity"
                                    placeholder="Enter Storage/Capacity"
                                    className="w-full text-sm rounded-md py-2 px-2  border-2 border-gray-100 "
                                />
                            </div>
                        </div>
                        <div
                            className={
                                "flex justify-end md:items-end items-start p-2 gap-2 text-white font-medium  pt-4"
                            }
                        >
                            <button
                                className={
                                    "bg-emerald-600 p-2 rounded-md w-2/6 flex justify-center items-center cursor-pointer"
                                }
                            >
                                Update Product &nbsp;<p className={'text-yellow-400'}>(Shift + Enter)</p>
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        );
    };


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
        <>
            <div className={'flex flex-col gap-4 h-full'}>
                <EditProductModal />

                <div>
                    <div className="text-sm text-gray-500 flex items-center">
                        <span>Pages</span>
                        <span className="mx-2">›</span>
                        <span className="text-black">Product List</span>
                    </div>
                    <h1 className="text-3xl font-semibold text-gray-500">Product List</h1>
                </div>

                <div className={'bg-white rounded-md p-4 flex flex-col'}>

                    <div className={'grid md:grid-cols-5 gap-4 '}>


                        <div>
                            <label htmlFor="supplier"
                                   className="block text-sm font-medium text-gray-700 mb-1">Product Type</label>
                            <TypeableSelect
                                options={types}
                                value={selected?.value || null}
                                onChange={(opt) => opt ? setSelected({ value: String(opt.value), label: opt.label }) : setSelected(null)}
                                placeholder="Search Product Types.."
                                allowCreate={true}
                            />

                        </div>
                        <div>
                            <label htmlFor="product"
                                   className="block text-sm font-medium text-gray-700 mb-1">Product ID / Name</label>
                            <input type="text" id="product" placeholder="Enter Invoice Number..."
                                   className="w-full text-sm rounded-md py-2 px-2  border-2 border-gray-100 "/>

                        </div>
                        <div className={'grid grid-cols-2 md:items-end items-start gap-2 text-white font-medium'}>
                            <button className={'bg-emerald-600 py-2 rounded-md flex items-center justify-center'}>
                                <SearchCheck className="mr-2" size={14}/>Search
                            </button>
                            <button className={'bg-gray-500 py-2 rounded-md flex items-center justify-center'}><RefreshCw
                                className="mr-2" size={14}/>Clear
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
                                    "Product ID",
                                    "Product Name",
                                    "Product Code",
                                    "Barcode",
                                    "Category",
                                    "Brand",
                                    "Unit",
                                    "Product Type",
                                    "Color",
                                    "Size",
                                    "Storage/Capacity",
                                    "Created On",
                                    "Actions",
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
                                        {sale.productID}
                                    </td>
                                    <td className="px-6 py-2 whitespace-nowrap text-sm font-medium">
                                        {sale.productName}
                                    </td>
                                    <td className="px-6 py-2 whitespace-nowrap text-sm font-medium">
                                        {sale.productCode}
                                    </td>
                                    <td className="px-6 py-2 whitespace-nowrap text-sm font-medium">
                                        {sale.barcode}
                                    </td>
                                    <td className="px-6 py-2 whitespace-nowrap text-sm font-medium">
                                        {sale.category}
                                    </td>
                                    <td className="px-6 py-2 whitespace-nowrap text-sm font-medium">
                                        {sale.brand}
                                    </td>
                                    <td className="px-6 py-2 whitespace-nowrap text-sm font-medium">
                                        {sale.unit}
                                    </td>
                                    <td className="px-6 py-2 whitespace-nowrap text-sm font-medium">
                                        {sale.productType}
                                    </td>
                                    <td className="px-6 py-2 whitespace-nowrap text-sm font-medium">
                                        {sale.color}
                                    </td>
                                    <td className="px-6 py-2 whitespace-nowrap text-sm font-medium">
                                        {sale.size}
                                    </td>
                                    <td className="px-6 py-2 whitespace-nowrap text-sm font-medium">
                                        {sale.storage}
                                    </td>
                                    <td className="px-6 py-2 whitespace-nowrap text-sm font-medium">
                                        {sale.createdOn}
                                    </td>
                                    <td className="px-6 py-2 whitespace-nowrap text-sm font-medium flex gap-2">
                                        <div className="relative group">
                                            <button
                                                onClick={(e) => {
                                                    e.stopPropagation();
                                                    setSelectedProduct(sale);
                                                    setIsEditModalOpen(true);
                                                }}
                                                className="p-2 bg-green-100 rounded-full text-green-700 hover:bg-green-200 transition-colors cursor-pointer">
                                                <Pencil size={15} />
                                            </button>

                                            <span
                                                className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 w-max px-2 py-1 text-xs text-white bg-gray-900 rounded-md invisible group-hover:visible opacity-0 group-hover:opacity-100 transition-opacity">
                                                    Edit Product
                                                </span>
                                        </div>

                                        <div className="relative group">
                                            <button
                                                className="p-2 bg-yellow-100 rounded-full text-yellow-700 hover:bg-yellow-200 transition-colors cursor-pointer">
                                                <Barcode size={15}/>
                                            </button>
                                            <span
                                                className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 w-max px-2 py-1 text-xs text-white bg-gray-900 rounded-md invisible group-hover:visible opacity-0 group-hover:opacity-100 transition-opacity">
                                                    Print Barcode
                                                </span>
                                        </div>
                                        <div className="relative group">
                                            <button
                                                className="p-2 bg-red-100 rounded-full text-red-700 hover:bg-red-200 transition-colors cursor-pointer">
                                                <Trash size={15}/>
                                            </button>
                                            <span
                                                className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 w-max px-2 py-1 text-xs text-white bg-gray-900 rounded-md invisible group-hover:visible opacity-0 group-hover:opacity-100 transition-opacity">
                                                    Delete Product
                                                </span>
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
        </>
    );
}

export default ProductList;
