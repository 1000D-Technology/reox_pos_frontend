import {ChevronLeft, ChevronRight} from "lucide-react";
import {useEffect, useState} from "react";
import TypeableSelect from "../../../components/TypeableSelect.tsx";

function CreateProducts() {
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

    // 🔹 Handle Up / Down arrow keys
    useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            if (e.key === "ArrowDown") {
                setSelectedIndex((prev) =>
                    prev < salesData.length - 1 ? prev + 1 : prev
                );
            } else if (e.key === "ArrowUp") {
                setSelectedIndex((prev) => (prev > 0 ? prev - 1 : prev));
            }
        };

        window.addEventListener("keydown", handleKeyDown);
        return () => window.removeEventListener("keydown", handleKeyDown);
    }, [salesData.length]);
    return (
        <>
            <div className={"flex flex-col gap-4 h-full"}>
                <div>
                    <div className="text-sm text-gray-500 flex items-center">
                        <span>Pages</span>
                        <span className="mx-2">›</span>
                        <span className="text-black">Create Product</span>
                    </div>
                    <h1 className="text-3xl font-semibold text-gray-500">Create Product</h1>
                </div>

                <div className={"bg-white rounded-md p-4 flex flex-col"}>

                    <span className="text-lg font-semibold my-4">Basic Product Information</span>

                    <div className={"grid md:grid-cols-5 gap-4 "}>
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


                        <div>
                            <label
                                htmlFor="product-image"
                                className="block text-sm font-medium text-gray-700 mb-1"
                            >
                                Image
                            </label>
                            <input
                                type="file"
                                id="product-image"
                                accept=".jpg,.jpeg,.png,image/jpeg,image/png,image/jpg"
                                className="w-full text-sm rounded-md py-2 px-2 border-2 border-gray-100"
                                placeholder="Select Image"
                            />
                        </div>
                    </div>
                    <span className="text-lg font-semibold my-4">Product Variations (Optional)</span>

                    <div className={"grid md:grid-cols-5 gap-4 "}>
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
                                "bg-emerald-600 p-2 rounded-md w-1/6 flex justify-center items-center cursor-pointer"
                            }
                        >
                            Save Product &nbsp;<p className={'text-yellow-400'}>(Shift + Enter)</p>
                        </button>
                    </div>
                </div>

                <div
                    className={
                        "flex flex-col bg-white rounded-md h-full p-4 justify-between"
                    }
                >
                    <div
                        className="overflow-y-auto max-h-md md:h-[320px] lg:h-[320px] rounded-md scrollbar-thin scrollbar-thumb-gray-300 scrollbar-track-gray-100">
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
                                    "Created On  ",
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
        </>
    );
}

export default CreateProducts;
