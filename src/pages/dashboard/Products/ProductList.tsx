import { useState } from "react";
import { BreadcrumbItem, Breadcrumbs } from "@heroui/breadcrumbs";
import {Pencil, Trash2, ClipboardList, SearchCheckIcon, RefreshCwIcon, X,} from "lucide-react";

function ProductList() {
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [selectedImage, setSelectedImage] = useState(null);

    const toggleModal = () => setIsModalOpen(!isModalOpen);

    const handleImageChange = (e) => {
        if (e.target.files && e.target.files[0]) {
            setSelectedImage(URL.createObjectURL(e.target.files[0]));
        }
    };

    return (
        <div className="w-full ps-5 pr-5">
            {/* Breadcrumb */}
            <div className="mb-4">
                <Breadcrumbs>
                    <BreadcrumbItem>Pages</BreadcrumbItem>
                    <BreadcrumbItem>Product List</BreadcrumbItem>
                </Breadcrumbs>
                <h1 className="text-3xl font-medium text-gray-600 mt-2">
                    Product List
                </h1>
            </div>

            {/* Filter Section */}
            <div className="bg-white p-4 rounded-2xl shadow-sm">
                <div className="flex flex-wrap gap-3 items-end">
                    {[
                        { label: "Product Type", placeholder: "Type to search types" },
                        { label: "Search Product", placeholder: "Type to search products" },
                    ].map((input, i) => (
                        <div key={i} className="flex flex-col">
                            <label className="text-sm font-medium mb-1 text-gray-700">
                                {input.label}
                            </label>
                            <input
                                type="text"
                                placeholder={input.placeholder}
                                className="w-60 border border-gray-300 rounded-md p-2.5 focus:ring-green-500 focus:border-green-500 text-gray-800"
                            />
                        </div>
                    ))}

                    <div className="flex gap-2 items-center">
                        <button className="bg-[#059669] text-white py-2.5 px-4 rounded-md flex items-center hover:bg-green-700 transition-colors">
                            <SearchCheckIcon className="w-4 h-4 mr-2" />
                            Search
                        </button>
                        <button className="bg-gray-200 text-gray-700 py-2.5 px-4 rounded-md flex items-center hover:bg-gray-300 transition-colors">
                            <RefreshCwIcon className="w-4 h-4 mr-2" />
                            Clear
                        </button>
                    </div>
                </div>
            </div>

            {/* Product Table */}
            <div className="bg-white mt-5 rounded-2xl w-full">
                <div className="grid grid-cols-14 gap-2 bg-[#059669] h-12 rounded-t-md items-center text-white text-xs font-semibold px-4">
                    <div>Product ID</div>
                    <div>Product Type</div>
                    <div>Product Name</div>
                    <div>Product Code</div>
                    <div>Cabin Number</div>
                    <div>Barcode</div>
                    <div>Supplier</div>
                    <div>Category</div>
                    <div>Unit</div>
                    <div>Color</div>
                    <div>MRP</div>
                    <div>Locked Price</div>
                    <div>Image</div>
                    <div>Actions</div>
                </div>

                {/* Example Row */}
                <div className="grid grid-cols-14 gap-2 items-center text-xs font-medium px-4 py-3 border-b">
                    <div>02458965</div>
                    <div>Sugar</div>
                    <div>Sugar</div>
                    <div>T5425</div>
                    <div>5</div>
                    <div>742389863</div>
                    <div>Jeewan</div>
                    <div>Grocery</div>
                    <div>Kg</div>
                    <div>Red</div>
                    <div>250.00</div>
                    <div>260.00</div>
                    <div>
                        <img
                            src="https://i.ibb.co/W0GyM5v/sample.jpg"
                            alt="Product"
                            className="w-8 h-8 rounded-md object-cover"
                        />
                    </div>
                    <div className="flex gap-2">
                        <button
                            onClick={toggleModal}
                            className="bg-blue-500 hover:bg-blue-600 text-white rounded-md p-1.5"
                        >
                            <Pencil className="w-4 h-4" />
                        </button>

                        <button

                            className="bg-blue-500 hover:bg-blue-600 text-white rounded-md p-1.5"
                        >
                            <Pencil className="w-4 h-4" />
                        </button>
                        <button className="bg-red-500 hover:bg-red-600 text-white rounded-md p-1.5">
                            <Trash2 className="w-4 h-4" />
                        </button>
                    </div>
                </div>
            </div>

            {/* Pagination */}
            <div className="bg-white mt-4 rounded-2xl h-20 flex items-center justify-center gap-5">
                <div className="flex items-center gap-2 text-sm">
                    <button className="px-4 py-2 bg-gray-300 rounded-l-md hover:bg-gray-400">
                        Previous
                    </button>
                    <div className="hidden sm:flex items-center gap-1 px-2">
                        <button className="px-3 py-1 bg-white border rounded">1</button>
                        <button className="px-3 py-1 bg-white border rounded">2</button>
                        <button className="px-3 py-1 bg-white border rounded">3</button>
                    </div>
                    <button className="px-4 py-2 bg-gray-300 rounded-r-md hover:bg-gray-400">
                        Next
                    </button>
                </div>
            </div>

            {/* Export Buttons */}
            <div className="bg-white mt-2 rounded-2xl w-full h-20 flex items-center justify-center gap-5">
                <button className="bg-[#059669] rounded-2xl w-28 h-12 flex items-center justify-center text-white text-sm">
                    <ClipboardList className="mr-2 h-4" /> Excel
                </button>
                <button className="bg-[#F59E0B] rounded-2xl w-28 h-12 flex items-center justify-center text-white text-sm">
                    <ClipboardList className="mr-2 h-4" /> CSV
                </button>
                <button className="bg-[#EF4444] rounded-2xl w-28 h-12 flex items-center justify-center text-white text-sm">
                    <ClipboardList className="mr-2 h-4" /> PDF
                </button>
            </div>

            {isModalOpen && (
                <div className="fixed inset-0 flex items-center justify-center bg-black/50 z-50">
                    <div className="bg-white rounded-2xl p-8 w-[850px] shadow-xl relative">
                        <button
                            className="absolute top-5 right-5 text-gray-500 hover:text-gray-700"
                            onClick={toggleModal}
                        >
                            <X className="w-5 h-5" />
                        </button>

                        <h2 className="text-2xl font-semibold mb-6 text-gray-800">
                            Update Product
                        </h2>

                        {/* ---- Grid Layout (4 on top row, 3 on next) ---- */}
                        <div className="grid grid-cols-4 gap-4">
                            {/* Row 1 */}
                            <div className="flex flex-col">
                                <label className="text-sm font-medium text-gray-700 mb-1">Product Type</label>
                                <input
                                    type="text"
                                    placeholder="Type to search types"
                                    className="border border-gray-300 rounded-md p-2.5 focus:ring-green-500 focus:border-green-500 text-gray-800"
                                />
                            </div>
                            <div className="flex flex-col">
                                <label className="text-sm font-medium text-gray-700 mb-1">Product Name</label>
                                <input
                                    type="text"
                                    placeholder="Enter Product Name"
                                    className="border border-gray-300 rounded-md p-2.5 focus:ring-green-500 focus:border-green-500 text-gray-800"
                                />
                            </div>
                            <div className="flex flex-col">
                                <label className="text-sm font-medium text-gray-700 mb-1">Product Code</label>
                                <input
                                    type="text"
                                    placeholder="Enter Product Code"
                                    className="border border-gray-300 rounded-md p-2.5 focus:ring-green-500 focus:border-green-500 text-gray-800"
                                />
                            </div>
                            <div className="flex flex-col">
                                <label className="text-sm font-medium text-gray-700 mb-1">Cabin Number</label>
                                <input
                                    type="text"
                                    placeholder="Enter Cabin Number"
                                    className="border border-gray-300 rounded-md p-2.5 focus:ring-green-500 focus:border-green-500 text-gray-800"
                                />
                            </div>

                            {/* Row 2 */}
                            <div className="flex flex-col">
                                <label className="text-sm font-medium text-gray-700 mb-1">Barcode</label>
                                <input
                                    type="text"
                                    placeholder="Enter Barcode"
                                    className="border border-gray-300 rounded-md p-2.5 focus:ring-green-500 focus:border-green-500 text-gray-800"
                                />
                            </div>
                            <div className="flex flex-col">
                                <label className="text-sm font-medium text-gray-700 mb-1">Supplier</label>
                                <input
                                    type="text"
                                    placeholder="Type to search suppliers"
                                    className="border border-gray-300 rounded-md p-2.5 focus:ring-green-500 focus:border-green-500 text-gray-800"
                                />
                            </div>
                            <div className="flex flex-col">
                                <label className="text-sm font-medium text-gray-700 mb-1">Category</label>
                                <input
                                    type="text"
                                    placeholder="Type to search categories"
                                    className="border border-gray-300 rounded-md p-2.5 focus:ring-green-500 focus:border-green-500 text-gray-800"
                                />
                            </div>
                            <div className="flex flex-col">
                                <label className="text-sm font-medium text-gray-700 mb-1">Unit</label>
                                <input
                                    type="text"
                                    placeholder="Type to search units"
                                    className="border border-gray-300 rounded-md p-2.5 focus:ring-green-500 focus:border-green-500 text-gray-800"
                                />
                            </div>

                            {/* Row 3 */}
                            <div className="flex flex-col">
                                <label className="text-sm font-medium text-gray-700 mb-1">Color</label>
                                <input
                                    type="text"
                                    placeholder="Type to search colors"
                                    className="border border-gray-300 rounded-md p-2.5 focus:ring-green-500 focus:border-green-500 text-gray-800"
                                />
                            </div>

                            {/* Image Upload */}
                            <div className="flex flex-col">
                                <label className="text-sm font-medium text-gray-700 mb-1">Image</label>
                                <input
                                    type="file"
                                    accept="image/*"
                                    onChange={handleImageChange}
                                    className="border border-gray-300 rounded-md p-2.5 text-gray-800"
                                />
                                {selectedImage && (
                                    <img
                                        src={selectedImage}
                                        alt="Preview"
                                        className="w-20 h-20 rounded-md mt-2 object-cover border"
                                    />
                                )}
                            </div>

                            <div className="flex flex-col">
                                <label className="text-sm font-medium text-gray-700 mb-1">MRP</label>
                                <input
                                    type="text"
                                    placeholder="Enter MRP"
                                    className="border border-gray-300 rounded-md p-2.5 focus:ring-green-500 focus:border-green-500 text-gray-800"
                                />
                            </div>
                            <div className="flex flex-col">
                                <label className="text-sm font-medium text-gray-700 mb-1">Locked Price</label>
                                <input
                                    type="text"
                                    placeholder="Enter Locked Price"
                                    className="border border-gray-300 rounded-md p-2.5 focus:ring-green-500 focus:border-green-500 text-gray-800"
                                />
                            </div>
                        </div>

                        {/* Buttons */}
                        <div className="flex justify-end gap-3 mt-8">
                            <button
                                onClick={toggleModal}
                                className="bg-gray-300 text-gray-700 px-5 py-2 rounded-md hover:bg-gray-400"
                            >
                                Cancel
                            </button>
                            <button className="bg-[#059669] text-white px-5 py-2 rounded-md hover:bg-green-700">
                                Update Product
                            </button>
                        </div>
                    </div>
                </div>
            )}

        </div>
    );
}

export default ProductList;
