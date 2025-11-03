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
    {
      productID: "250929004",
      productType: "Salt",
      productName: "Salt",
      productCode: "TS426",
      cabinNumber: "6",
      barcode: "742388564",
      supplier: "Jeewan",
      categories: "Grocery",
      unit: "Kg",
      colors: "White",
      MRP: "30000",
      lockedPrice: "30000",
      image: "image.jpg",
    },
    {
      productID: "250929005",
      productType: "Rice",
      productName: "Rice",
      productCode: "TS427",
      cabinNumber: "7",
      barcode: "742388565",
      supplier: "Jeewan",
      categories: "Grocery",
      unit: "Kg",
      colors: "Brown",
      MRP: "40000",
      lockedPrice: "40000",
      image: "image.jpg",
    },
    {
      productID: "250929006",
      productType: "Wheat",
      productName: "Wheat",
      productCode: "TS428",
      cabinNumber: "8",
      barcode: "742388566",
      supplier: "Jeewan",
      categories: "Grocery",
      unit: "Kg",
      colors: "Golden",
      MRP: "35000",
      lockedPrice: "35000",
      image: "image.jpg",
    },
    {
      productID: "250929007",
      productType: "Corn",
      productName: "Corn",
      productCode: "TS429",
      cabinNumber: "9",
      barcode: "742388567",
      supplier: "Jeewan",
      categories: "Grocery",
      unit: "Kg",
      colors: "Yellow",
      MRP: "45000",
      lockedPrice: "45000",
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

        {/* Responsive table: horizontal scroll on small screens + hide less-critical columns on small screens */}
        <div className="overflow-x-auto rounded-md">
          <div className="min-w-[900px]"> {/* ensure table has a minimum width so columns stay aligned */}
            <table className="min-w-full divide-y divide-gray-200 table-fixed">
              <thead className="bg-red-500 sticky top-0 z-10">
                <tr>
                  <th className="w-12 px-6 py-3 text-left text-sm font-medium text-white tracking-wider">#</th>
                  <th className="w-36 px-6 py-3 text-left text-sm font-medium text-white tracking-wider">Product ID</th>
                  <th className="w-40 px-6 py-3 text-left text-sm font-medium text-white tracking-wider">Product Type</th>
                  <th className="w-48 px-6 py-3 text-left text-sm font-medium text-white tracking-wider">Product Name</th>

                  {/* hide these less-critical columns on small screens */}
                  <th className="hidden md:table-cell w-36 px-6 py-3 text-left text-sm font-medium text-white tracking-wider">Product Code</th>
                  <th className="hidden md:table-cell w-28 px-6 py-3 text-left text-sm font-medium text-white tracking-wider">Cabin</th>
                  <th className="hidden lg:table-cell w-36 px-6 py-3 text-left text-sm font-medium text-white tracking-wider">Barcode</th>
                  <th className="hidden lg:table-cell w-36 px-6 py-3 text-left text-sm font-medium text-white tracking-wider">Supplier</th>
                  <th className="hidden lg:table-cell w-36 px-6 py-3 text-left text-sm font-medium text-white tracking-wider">Category</th>
                  <th className="hidden md:table-cell w-24 px-6 py-3 text-left text-sm font-medium text-white tracking-wider">Unit</th>
                  <th className="hidden lg:table-cell w-24 px-6 py-3 text-left text-sm font-medium text-white tracking-wider">Color</th>
                  <th className="hidden lg:table-cell w-32 px-6 py-3 text-left text-sm font-medium text-white tracking-wider">MRP</th>
                  <th className="hidden lg:table-cell w-32 px-6 py-3 text-left text-sm font-medium text-white tracking-wider">Locked Price</th>

                  <th className="w-28 px-6 py-3 text-left text-sm font-medium text-white tracking-wider">Image</th>
                  <th className="w-24 px-6 py-3 text-left text-sm font-medium text-white tracking-wider">Actions</th>
                </tr>
              </thead>

              <tbody className="bg-white divide-y divide-gray-200">
                {salesData.map((sale, index) => (
                  <tr
                    key={index}
                    onClick={() => setSelectedIndex(index)}
                    className={`cursor-pointer ${index === selectedIndex ? "bg-red-100 border-l-4 border-red-500" : "hover:bg-green-50"}`}
                  >
                    <td className="px-6 py-2 whitespace-nowrap text-sm font-medium">{index + 1}</td>

                    <td className="px-6 py-2 whitespace-nowrap text-sm text-gray-700">
                      <div className="max-w-[120px] truncate">{sale.productID}</div>
                    </td>

                    <td className="px-6 py-2 whitespace-nowrap text-sm text-gray-700">
                      <div className="max-w-[140px] truncate">{sale.productType}</div>
                    </td>

                    <td className="px-6 py-2 whitespace-nowrap text-sm text-gray-700">
                      <div className="max-w-[160px] truncate">{sale.productName}</div>
                    </td>

                    <td className="hidden md:table-cell px-6 py-2 whitespace-nowrap text-sm text-gray-700">
                      <div className="max-w-[120px] truncate">{sale.productCode}</div>
                    </td>

                    <td className="hidden md:table-cell px-6 py-2 whitespace-nowrap text-sm text-gray-700">{sale.cabinNumber}</td>

                    <td className="hidden lg:table-cell px-6 py-2 whitespace-nowrap text-sm text-gray-700">
                      <div className="max-w-[140px] truncate">{sale.barcode}</div>
                    </td>

                    <td className="hidden lg:table-cell px-6 py-2 whitespace-nowrap text-sm text-gray-700">
                      <div className="max-w-[140px] truncate">{sale.supplier}</div>
                    </td>

                    <td className="hidden lg:table-cell px-6 py-2 whitespace-nowrap text-sm text-gray-700">
                      <div className="max-w-[140px] truncate">{sale.categories}</div>
                    </td>

                    <td className="hidden md:table-cell px-6 py-2 whitespace-nowrap text-sm text-gray-700">{sale.unit}</td>

                    <td className="hidden lg:table-cell px-6 py-2 whitespace-nowrap text-sm text-gray-700">{sale.colors}</td>

                    <td className="hidden lg:table-cell px-6 py-2 whitespace-nowrap text-sm text-gray-700">{sale.MRP}</td>

                    <td className="hidden lg:table-cell px-6 py-2 whitespace-nowrap text-sm text-gray-700">{sale.lockedPrice}</td>

                    <td className="px-6 py-2 whitespace-nowrap text-sm text-gray-700">
                      <img src="/1.png" alt={sale.productName} className="w-12 h-12 object-cover rounded-md" />
                    </td>

                    <td className="px-6 py-2 whitespace-nowrap text-sm text-gray-700">
                      <button className="p-2 bg-green-100 rounded-full text-black hover:bg-red-200 transition-colors">
                        <Unlink2 className="w-5 h-5" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
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
