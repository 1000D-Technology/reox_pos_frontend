import {ChevronLeft, ChevronRight, Unlink2} from "lucide-react";
import { useEffect, useState } from "react";

function RemovedProducts() {
  const salesData = [
    {
      productID: "250929003",
      productType: "Sugar",
      productName: "Suger",
      productCode: "TS425",
      cabinNumber: "5",
      barcode: "742388563",
      supplier: "Jeewan",
      categories: "Grocery",
      unit: "Kg",
      colors: "Red",
      MRP: "25000",
      lockedPrice: "25000",
      image: "image.jpg",
    },
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
    <div>
      <div className="mb-8">
        <div className="text-sm text-gray-500 flex items-center">
          <span>Pages</span>
          <span className="mx-2">›</span>
          <span className="text-black">Removed Product</span>
        </div>

        <h1 className="text-3xl font-semibold text-gray-500">
          Removed Product
        </h1>
      </div>

      <div className="flex flex-col bg-[#FFFFFF] rounded-lg p-5 gap-2">
        <div className="flex items-center gap-6 mb-4 mt-5">
          <div className="flex flex-col">
            <label className="text-sm text-gray-500 mb-1 font-Geist font-bold">
              Product Type
            </label>
            <input
              type="text"
              placeholder="Type to search types"
              className="border border-gray-300 text-sm rounded-lg px-3 py-2 w-70 focus:outline-none focus:ring-1 focus:ring-emerald-500"
            />
          </div>

          <div className="flex flex-col">
            <label className="text-sm text-gray-500 mb-1 font-Geist font-bold">
              Search Product
            </label>
            <input
              type="text"
              placeholder="Type to search types"
              className="border border-gray-300 text-sm rounded-lg px-3 py-2 w-70 focus:outline-none focus:ring-1 focus:ring-emerald-500"
            />
          </div>
        </div>

        {/* Table section */}
        <div className="overflow-y-auto max-h-md md:h-[320px] lg:h-[500px] rounded-md scrollbar-thin scrollbar-thumb-gray-300 scrollbar-track-gray-100">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-red-500 sticky top-0 z-10">
              <tr>
                {[
                  "#",
                  "Product ID",
                  "Product Type",
                  "Product Name",
                  "Product Code",
                  "Cabin Number",
                  "Barcode",
                  "Supplier",
                  "Category",
                  "Unit",
                  "Color",
                  "MRP",
                  "Locked Price",
                  "Image",
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
                      ? "bg-red-100 border-l-4 border-red-500"
                      : "hover:bg-green-50"
                  }`}
                >
                  <td className="px-6 py-2 whitespace-nowrap text-sm font-medium">
                    {index + 1}
                  </td>
                  <td className="px-6 py-2 whitespace-nowrap text-sm font-medium">
                    {sale.productID}
                  </td>
                  <td className="px-6 py-2 whitespace-nowrap text-sm font-medium">
                    {sale.productType}
                  </td>
                  <td className="px-6 py-2 whitespace-nowrap text-sm font-medium">
                    {sale.productName}
                  </td>
                  <td className="px-6 py-2 whitespace-nowrap text-sm font-medium">
                    {sale.productCode}
                  </td>
                  <td className="px-6 py-2 whitespace-nowrap text-sm font-medium">
                    {sale.cabinNumber}
                  </td>
                  <td className="px-6 py-2 whitespace-nowrap text-sm font-medium">
                    {sale.barcode}
                  </td>
                  <td className="px-6 py-2 whitespace-nowrap text-sm font-medium">
                    {sale.supplier}
                  </td>
                  <td className="px-6 py-2 whitespace-nowrap text-sm font-medium">
                    {sale.categories}
                  </td>
                  <td className="px-6 py-2 whitespace-nowrap text-sm font-medium">
                    {sale.unit}
                  </td>
                  <td className="px-6 py-2 whitespace-nowrap text-sm font-medium">
                    {sale.colors}
                  </td>
                  <td className="px-6 py-2 whitespace-nowrap text-sm font-medium">
                    {sale.MRP}
                  </td>
                  <td className="px-6 py-2 whitespace-nowrap text-sm font-medium">
                    {sale.lockedPrice}
                  </td>
                  <td className="px-6 py-2 whitespace-nowrap text-sm font-medium">
                      <img src="/1.png" alt="{sale.productName}"></img>
                  </td>
                  <td className="px-6 py-2 whitespace-nowrap text-sm font-medium">
                      <button
                          className="p-2 bg-green-100 rounded-full text-black  hover:bg-red-200 transition-colors">
                          <Unlink2  className="w-5 h-5"/>

                      </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        <nav className="bg-white flex items-center justify-center sm:px-6 mt-4">
          <div className="flex items-center space-x-2">
            <button className="flex items-center px-2 py-2 text-sm font-medium text-gray-500 hover:text-gray-700">
              <ChevronLeft className="mr-2 h-5 w-5" /> Previous
            </button>
            <button className="px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white">
              1
            </button>
            <button className="px-4 py-2 border border-transparent text-sm font-medium rounded-md text-gray-500 hover:bg-gray-100">
              2
            </button>
            <button className="px-4 py-2 border border-transparent text-sm font-medium rounded-md text-gray-500 hover:bg-gray-100">
              3
            </button>
            <span className="text-gray-500 px-2">...</span>
            <button className="flex items-center px-2 py-2 text-sm font-medium text-gray-500 hover:text-gray-700">
              Next <ChevronRight className="ml-2 h-5 w-5" />
            </button>
          </div>
        </nav>
      </div>
    </div>
  );
}

export default RemovedProducts;
