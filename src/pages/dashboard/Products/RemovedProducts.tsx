import { ChevronLeft, ChevronRight, Unlink2 } from "lucide-react";
import { useState, useEffect } from "react";

function RemovedProducts() {
  const [selectedIndex, setSelectedIndex] = useState(0);
  
  // Sample data for removed products
  const removedProducts = [
    {
      id: 1,
      productId: 'P001',
      productType: 'Type A',
      productName: 'Product 1',
      productCode: 'C001',
      cabinNumber: 'CAB1',
      barcode: '123456789',
      supplier: 'Supplier A',
      category: 'Category 1',
      unit: 'Piece',
      color: 'Red',
      mrp: '100',
      lockedPrice: '90',
      image: 'image1.jpg',
    },
    {
      id: 2,
      productId: 'P002',
      productType: 'Type B',
      productName: 'Product 2',
      productCode: 'C002',
      cabinNumber: 'CAB2',
      barcode: '123456780',
      supplier: 'Supplier B',
      category: 'Category 2',
      unit: 'Kg',
      color: 'Blue',
      mrp: '150',
      lockedPrice: '135',
      image: 'image2.jpg',
    },
    {
      id: 3,
      productId: 'P003',
      productType: 'Type C',
      productName: 'Product 3',
      productCode: 'C003',
      cabinNumber: 'CAB3',
      barcode: '123456781',
      supplier: 'Supplier C',
      category: 'Category 3',
      unit: 'Liter',
      color: 'Green',
      mrp: '200',
      lockedPrice: '180',
      image: 'image3.jpg',
    },
    // Add more sample rows as needed
  ];

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "ArrowDown") {
        setSelectedIndex((prev) => (prev < removedProducts.length - 1 ? prev + 1 : prev));
      } else if (e.key === "ArrowUp") {
        setSelectedIndex((prev) => (prev > 0 ? prev - 1 : prev));
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [removedProducts.length]);

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
             
        <div className="flex flex-col  bg-[#FFFFFF] rounded-lg shadow-md p-5 gap-2 ">
            
        <div className="flex items-center gap-6 mb-4 mt-5">
          <div className="flex flex-col">
            <label className="text-sm text-gray-500 mb-1 font-Geist font-bold">Product Type</label>
            <input
              type="text"
              placeholder="Type to search types"
              className="border border-gray-300 text-sm rounded-lg px-3 py-2 w-70 focus:outline-none focus:ring-1 focus:ring-emerald-500"
            />
          </div>

          <div className="flex flex-col">
            <label className="text-sm text-gray-500 mb-1 font-Geist font-bold">Search Product</label>
            <input
              type="text"
              placeholder="Type to search types"
              className="border border-gray-300 text-sm rounded-lg px-3 py-2 w-70 focus:outline-none focus:ring-1 focus:ring-emerald-500"
            />
          </div>
        </div>
 
        {/* table */}
        <div  className="overflow-y-auto max-h-md md:h-[320px] lg:h-[500px] rounded-t-lg scrollbar-thin scrollbar-thumb-gray-300 scrollbar-track-gray-100 mt-6">
        <table className="min-w-full divide-y divide-gray-200 table-fixed">
            <thead className="bg-[#EF4444] sticky top-0 z-10 h-12">
                <tr>
                    <th scope="col" className="w-[5%] px-4 py-2 text-left text-xs font-Geist text-white uppercase tracking-wider">
                        #
                    </th>
                    <th scope="col" className="w-[7%] px-4 py-2 text-left  text-xs font-Geist text-white uppercase tracking-wider">
                    Product ID
                    </th>
                    <th scope="col" className="w-[7%] px-4 py-2 text-left  text-xs font-Geist text-white uppercase tracking-wider">
                    Product Type
                    </th>
                    <th scope="col" className="w-[7%] px-4 py-2 text-left  text-xs font-Geist text-white uppercase tracking-wider">
                   Product Name
                    </th>
                     <th scope="col" className="w-[7%] px-4 py-2 text-left  text-xs font-Geist text-white uppercase tracking-wider">
                     Product Code
                    </th>
                     <th scope="col" className="w-[7%] px-4 py-2 text-left  text-xs font-Geist text-white uppercase tracking-wider">
                       Cabin Number
                    </th>
                     <th scope="col" className="w-[7%] px-4 py-2 text-left  text-xs font-Geist text-white uppercase tracking-wider">
                      Barcode
                    </th>
                     <th scope="col" className="w-[7%] px-4 py-2 text-left  text-xs font-Geist text-white uppercase tracking-wider">
                       Supplier
                    </th>
                     <th scope="col" className="w-[7%] px-4 py-2 text-left  text-xs font-Geist text-white uppercase tracking-wider">
                       Category
                    </th>
                     <th scope="col" className="w-[7%] px-4 py-2 text-left  text-xs font-Geist text-white uppercase tracking-wider">
                       Unit
                    </th>
                     <th scope="col" className="w-[7%] px-4 py-2 text-left  text-xs font-Geist text-white uppercase tracking-wider">
                  Color
                    </th>
                     <th scope="col" className="w-[7%] px-4 py-2 text-left  text-xs font-Geist text-white uppercase tracking-wider">
                      MRP
                    </th>
                     <th scope="col" className="w-[7%] px-4 py-2 text-left  text-xs  font-Geist text-white uppercase tracking-wider">
                    Locked Price
                    </th>
                     <th scope="col" className="w-[7%] px-4 py-2 text-left  text-xs font-Geist text-white uppercase tracking-wider">
                       Image
                    </th>
                     <th scope="col" className="w-[10%] px-2 py-2 text-left  text-xs font-Geist text-white uppercase tracking-wider">
                        Actions
                    </th>
                </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {removedProducts.map((product, index) => (
                <tr key={product.id} className={`hover:bg-gray-50 ${index === selectedIndex ? "bg-green-100" : ""}`}>
                  <td className="px-4 py-2 text-sm text-gray-900">{product.id}</td>
                  <td className="px-4 py-2 text-sm text-gray-700">{product.productId}</td>
                  <td className="px-4 py-2 text-sm text-gray-700">{product.productType}</td>
                  <td className="px-4 py-2 text-sm text-gray-700">{product.productName}</td>
                  <td className="px-4 py-2 text-sm text-gray-700">{product.productCode}</td>
                  <td className="px-4 py-2 text-sm text-gray-700">{product.cabinNumber}</td>
                  <td className="px-4 py-2 text-sm text-gray-700">{product.barcode}</td>
                  <td className="px-4 py-2 text-sm text-gray-700">{product.supplier}</td>
                  <td className="px-4 py-2 text-sm text-gray-700">{product.category}</td>
                  <td className="px-4 py-2 text-sm text-gray-700">{product.unit}</td>
                  <td className="px-4 py-2 text-sm text-gray-700">{product.color}</td>
                  <td className="px-4 py-2 text-sm text-gray-700">{product.mrp}</td>
                  <td className="px-4 py-2 text-sm text-gray-700">{product.lockedPrice}</td>
                  <td className="px-4 py-2 text-sm text-gray-700">{product.image}</td>
                  <td className="px-4 py-2 text-sm text-gray-700">  <button
                                                className="p-2 bg-green-100 rounded-full text-green-700 hover:bg-green-200 transition-colors">
                                                <Unlink2 className="w-5 h-5"/>
                                            </button> </td>
                </tr>
              ))}
            </tbody>
        </table>
        </div>
         <nav className="bg-white flex items-center justify-center    border-gray-200 rounded-b-lg py-3 mt-auto">
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
