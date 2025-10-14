import { BreadcrumbItem, Breadcrumbs } from "@heroui/breadcrumbs";
import { ClipboardList, RefreshCwIcon, SearchCheckIcon } from "lucide-react";

function StockList() {
  return (
    <>
      <div className="w-full ps-5 ">
        <div>
          <Breadcrumbs>
            <BreadcrumbItem>Pages</BreadcrumbItem>
            <BreadcrumbItem> Stock List</BreadcrumbItem>
          </Breadcrumbs>
        </div>
        <div className="text-4xl font-medium text-gray-400">Stock List</div>
      </div>

      {/* filter */}
      <div className="bg-white p-3 mr-0 rounded-2xl shadow-sm">
        <h3 className="text-lg font-semibold text-gray-800">Filter</h3>
        <div className="flex gap-2 items-end">
          <div className="flex flex-col">
            <label
              htmlFor="cashier"
              className="text-sm font-medium mb-2 text-gray-700"
            >
              Select Cashier
            </label>
            <input
              type="text"
              id="cashier"
              className="w-60 border border-gray-300 rounded-md p-2.5 focus:ring-green-500 focus:border-green-500 text-gray-800 "
              placeholder="select user"
            />
          </div>

          <div className="flex flex-col">
            <label
              htmlFor="unit"
              className="text-sm font-medium mb-2 text-gray-700"
            >
              Unit
            </label>
            <input
              type="text"
              id="unit"
              className="w-60 border border-gray-300 rounded-md p-2.5 focus:ring-green-500 focus:border-green-500 text-gray-800"
              placeholder="select unit"
            />
          </div>

          <div className="flex flex-col">
            <label
              htmlFor="supplier"
              className="text-sm font-medium mb-2 text-gray-700"
            >
              Supplier
            </label>
            <input
              type="text"
              id="supplier"
              className="w-60 border border-gray-300 rounded-md p-2.5 focus:ring-green-500 focus:border-green-500 text-gray-800"
              placeholder="select Supplier"
            />
          </div>

          <div className="flex flex-col">
            <label
              htmlFor="product"
              className="text-sm font-medium mb-2 text-gray-700"
            >
              Product ID/Name
            </label>
            <input
              type="text"
              id="product"
              className="w-60 border border-gray-300 rounded-md p-2.5 focus:ring-green-500 focus:border-green-500 text-gray-800"
              placeholder="select product"
            />
          </div>

          {/* buttons */}

          <div className="flex gap-2 pt-0 items-center justify-end">
            <button className="bg-[#059669] text-white py-2.5 px-4 rounded-md flex items-center justify-center hover:bg-green-700 transition-colors">
              <SearchCheckIcon className="w-4 h-4 mr-2" />
              Search
            </button>
            <button className="bg-gray-200 text-gray-700 py-2.5 px-4 rounded-md flex items-center justify-center hover:bg-gray-300 transition-colors">
              <RefreshCwIcon className="w-4 h-4 mr-2" />
              Clear
            </button>
          </div>
        </div>
      </div>

      {/* table */}
      <div className="bg-white mt-5 rounded-2xl w-full ">
        <div className="grid grid-cols-7 gap-5 bg-[#059669] h-12 rounded-md items-center text-white text-xs font-medium min-w-5xl">
          <div className="px-2">Product ID </div>
          <div>Product Name</div>
          <div>Unit</div>
          <div>Discount Amount</div>
          <div>MRP</div>
          <div>Supplier</div>
          <div>Stock</div>
        </div>
        <div className="grid grid-cols-7 gap-5  h-13  items-center  text-xs font-medium min-w-5xl border-b">
          <div className="px-2">INV-001</div>
          <div>2,500.00</div>
          <div>John Doe</div>
          <div>100.00</div>
          <div>2,400.00</div>
          <div>2,000.00</div>
          <div>400.00</div>
        </div>
          
  </div>
             <div className="bg-white mt-50 rounded-2xl h-20 flex items-center justify-center gap-5">
               <div className="flex items-center gap-2 text-sm">
                 <button className="px-4 py-2 bg-gray-300 rounded-l-md hover:bg-gray-400">Previous</button>
                 <div className="hidden sm:flex items-center gap-1 px-2">
                   <button className="px-3 py-1 bg-white border rounded">1</button>
                   <button className="px-3 py-1 bg-white border rounded">2</button>
                   <button className="px-3 py-1 bg-white border rounded">3</button>
                 </div>
                 <button className="px-4 py-2 bg-gray-300 rounded-r-md hover:bg-gray-400">Next</button>
               </div>
             </div>
  <div className="bg-white mt-2 rounded-2xl w-full h-20  flex items-center justify-center gap-5">
        <button className="bg-[#059669] rounded-2xl w-30 h-12 flex items-center justify-center text-white text-sm">
            <ClipboardList className="mr-2 h-4" />
            PDF
        </button>
        <button className="bg-[#F59E0B] rounded-2xl w-30 h-12 flex items-center justify-center text-white text-sm">
            <ClipboardList className="mr-2 h-4" />
            Excel
        </button>
        <button className="bg-[#EF4444] rounded-2xl w-30 h-12 flex items-center justify-center text-white text-sm">
            <ClipboardList className="mr-2 h-4" />
            CSV
        </button>
         </div>
    </>
  );
}

export default StockList;
