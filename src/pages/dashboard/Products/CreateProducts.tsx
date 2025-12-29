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

    type Variation = {
        color: string;
        size: string;
        storage: string;
        barcode: string;
    };

    const [variations, setVariations] = useState<Variation[]>([]);
    const [currentVariation, setCurrentVariation] = useState<Variation>({
        color: "",
        size: "",
        storage: "",
        barcode: "",
    });

    const handleAddVariation = () => {
        if (currentVariation.color || currentVariation.size || currentVariation.storage || currentVariation.barcode) {
            setVariations([...variations, currentVariation]);
            setCurrentVariation({ color: "", size: "", storage: "", barcode: "" });
        }
    };

    const handleRemoveVariation = (index: number) => {
        setVariations(variations.filter((_, i) => i !== index));
    };

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
                                Product Name <span className="text-red-500">*</span>
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
                                Category <span className="text-red-500">*</span>
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
                                Brand <span className="text-red-500">*</span>
                            </label>
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
                                Unit <span className="text-red-500">*</span>
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
                                Product Type <span className="text-red-500">*</span>
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

                    <div className="grid md:grid-cols-5 gap-4">
                        <div>
                            <label htmlFor="color" className="block text-sm font-medium text-gray-700 mb-1">
                                Color
                            </label>
                            <TypeableSelect
                                options={color}
                                value={currentVariation.color || null}
                                onChange={(opt) =>
                                    setCurrentVariation({
                                        ...currentVariation,
                                        color: opt?.label || "",
                                    })
                                }
                                placeholder="Type to search Color"
                                allowCreate={true}
                            />
                        </div>
                        <div>
                            <label htmlFor="size" className="block text-sm font-medium text-gray-700 mb-1">
                                Size
                            </label>
                            <input
                                type="number"
                                id="size"
                                value={currentVariation.size}
                                onChange={(e) =>
                                    setCurrentVariation({ ...currentVariation, size: e.target.value })
                                }
                                placeholder="Enter Size"
                                className="w-full text-sm rounded-md py-2 px-2 border-2 border-gray-100"
                            />
                        </div>
                        <div>
                            <label htmlFor="storage" className="block text-sm font-medium text-gray-700 mb-1">
                                Storage/Capacity
                            </label>
                            <input
                                type="number"
                                id="storage"
                                value={currentVariation.storage}
                                onChange={(e) =>
                                    setCurrentVariation({ ...currentVariation, storage: e.target.value })
                                }
                                placeholder="Enter Storage/Capacity"
                                className="w-full text-sm rounded-md py-2 px-2 border-2 border-gray-100"
                            />
                        </div>
                        <div>
                            <label htmlFor="varBarcode" className="block text-sm font-medium text-gray-700 mb-1">
                                Barcode
                            </label>
                            <input
                                type="text"
                                id="varBarcode"
                                value={currentVariation.barcode}
                                onChange={(e) =>
                                    setCurrentVariation({ ...currentVariation, barcode: e.target.value })
                                }
                                placeholder="Enter Barcode"
                                className="w-full text-sm rounded-md py-2 px-2 border-2 border-gray-100"
                            />
                        </div>
                        <div className="flex items-end justify-end pe-2">
                            <button
                                type="button"
                                onClick={handleAddVariation}
                                className="bg-gray-600 text-white px-4 py-2 rounded-md hover:bg-gray-700 w-[88%] cursor-pointer"
                            >
                                Add Variation ( Enter )
                            </button>
                        </div>
                    </div>

                    {variations.length > 0 && (
                        <div className="mt-6">
                            <div className="flex items-center justify-between mb-4">
                                <h3 className="text-base font-semibold text-gray-800">
                                    Product Variations
                                    <span className="ml-2 px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-green-800">
                    {variations.length}
                </span>
                                </h3>
                            </div>

                            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                                {variations.map((variation, index) => (
                                    <div
                                        key={index}
                                        className="relative bg-gradient-to-br from-white via-gray-50 to-white rounded-xl border border-gray-200 shadow-sm hover:shadow-lg hover:border-blue-300 transition-all duration-300 overflow-hidden group"
                                    >
                                        {/* Top Header Bar */}
                                        <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-green-500 via-blue-500 to-green-500"></div>

                                        {/* Variation Number Badge */}
                                        <div className="absolute top-3 left-3 bg-gradient-to-r from-green-600 to-green-700 text-white text-xs font-bold px-3 py-1 rounded-full shadow-md">
                                            #{index + 1}
                                        </div>

                                        {/* Remove Button - Top Right */}
                                        <button
                                            type="button"
                                            onClick={() => handleRemoveVariation(index)}
                                            className="absolute top-3 right-3 flex items-center justify-center w-8 h-8 bg-red-500 hover:bg-red-600 text-white rounded-full shadow-md hover:shadow-lg transition-all duration-200 transform hover:scale-110 group-hover:rotate-90 z-10"
                                            title="Remove Variation"
                                        >
                                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                            </svg>
                                        </button>

                                        {/* Content */}
                                        <div className="p-5 pt-12 pb-4">
                                            <div className="space-y-3 grid grid-cols-2">
                                                {variation.color && (
                                                    <div className="flex items-start gap-3 group/item">
                                                        <div className="flex-shrink-0 flex items-center justify-center w-10 h-10 rounded-lg bg-gradient-to-br from-purple-100 to-purple-200 group-hover/item:scale-110 transition-transform duration-200">
                                                            <svg className="w-5 h-5 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 21a4 4 0 01-4-4V5a2 2 0 012-2h4a2 2 0 012 2v12a4 4 0 01-4 4zm0 0h12a2 2 0 002-2v-4a2 2 0 00-2-2h-2.343M11 7.343l1.657-1.657a2 2 0 012.828 0l2.829 2.829a2 2 0 010 2.828l-8.486 8.485M7 17h.01" />
                                                            </svg>
                                                        </div>
                                                        <div className="flex-1 min-w-0">
                                                            <span className="block text-xs text-gray-500 font-medium uppercase tracking-wide">Color</span>
                                                            <p className="text-sm font-bold text-gray-800 truncate mt-0.5">{variation.color}</p>
                                                        </div>
                                                    </div>
                                                )}

                                                {variation.size && (
                                                    <div className="flex items-start gap-3 group/item">
                                                        <div className="flex-shrink-0 flex items-center justify-center w-10 h-10 rounded-lg bg-gradient-to-br from-green-100 to-green-200 group-hover/item:scale-110 transition-transform duration-200">
                                                            <svg className="w-5 h-5 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 8V4m0 0h4M4 4l5 5m11-1V4m0 0h-4m4 0l-5 5M4 16v4m0 0h4m-4 0l5-5m11 5l-5-5m5 5v-4m0 4h-4" />
                                                            </svg>
                                                        </div>
                                                        <div className="flex-1 min-w-0">
                                                            <span className="block text-xs text-gray-500 font-medium uppercase tracking-wide">Size</span>
                                                            <p className="text-sm font-bold text-gray-800 truncate mt-0.5">{variation.size}</p>
                                                        </div>
                                                    </div>
                                                )}

                                                {variation.storage && (
                                                    <div className="flex items-start gap-3 group/item">
                                                        <div className="flex-shrink-0 flex items-center justify-center w-10 h-10 rounded-lg bg-gradient-to-br from-orange-100 to-orange-200 group-hover/item:scale-110 transition-transform duration-200">
                                                            <svg className="w-5 h-5 text-orange-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 8h14M5 8a2 2 0 110-4h14a2 2 0 110 4M5 8v10a2 2 0 002 2h10a2 2 0 002-2V8m-9 4h4" />
                                                            </svg>
                                                        </div>
                                                        <div className="flex-1 min-w-0">
                                                            <span className="block text-xs text-gray-500 font-medium uppercase tracking-wide">Storage</span>
                                                            <p className="text-sm font-bold text-gray-800 truncate mt-0.5">{variation.storage}</p>
                                                        </div>
                                                    </div>
                                                )}

                                                {variation.barcode && (
                                                    <div className="flex items-start gap-3 group/item">
                                                        <div className="flex-shrink-0 flex items-center justify-center w-10 h-10 rounded-lg bg-gradient-to-br from-blue-100 to-blue-200 group-hover/item:scale-110 transition-transform duration-200">
                                                            <svg className="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v1m6 11h2m-6 0h-2v4m0-11v3m0 0h.01M12 12h4.01M16 20h4M4 12h4m12 0h.01M5 8h2a1 1 0 001-1V5a1 1 0 00-1-1H5a1 1 0 00-1 1v2a1 1 0 001 1zm12 0h2a1 1 0 001-1V5a1 1 0 00-1-1h-2a1 1 0 00-1 1v2a1 1 0 001 1zM5 20h2a1 1 0 001-1v-2a1 1 0 00-1-1H5a1 1 0 00-1 1v2a1 1 0 001 1z" />
                                                            </svg>
                                                        </div>
                                                        <div className="flex-1 min-w-0">
                                                            <span className="block text-xs text-gray-500 font-medium uppercase tracking-wide">Barcode</span>
                                                            <p className="text-sm font-bold text-gray-800 truncate mt-0.5">{variation.barcode}</p>
                                                        </div>
                                                    </div>
                                                )}
                                            </div>
                                        </div>

                                        {/* Bottom Gradient Line */}
                                        <div className="absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r from-green-500 via-blue-500 to-green-500 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}


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
