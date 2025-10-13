 import { BreadcrumbItem, Breadcrumbs } from "@heroui/breadcrumbs";
// import { Pagination } from "@heroui/pagination";
import { useState } from "react";
import {
  CalendarDays,
  ChartLine,
  FileSpreadsheet,
  LucideChartNoAxesCombined,
  RefreshCwIcon,
  Scale,
  SearchCheckIcon,
  Printer,
  Eye,
  SaveAll,
} from "lucide-react";

function ManageUserSales() {
  const [currentPage, setCurrentPage] = useState(1);
  const totalPages = 5;

  return (
    <>
      <div className="w-full ps-5 ">
        <div>
          <Breadcrumbs>
            <BreadcrumbItem>Pages</BreadcrumbItem>
            <BreadcrumbItem >Cashier Management</BreadcrumbItem>
          </Breadcrumbs>
        </div>
        <div className="text-4xl font-medium text-gray-400">Cashier Management</div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4 p-5">
        <div className="h-23 bg-white rounded-[15px] flex items-center justify-start p-4 shadow-sm">
          <div className="flex-shrink-0 rounded-3xl bg-[#BBF7D0] w-12 h-12 flex items-center justify-center mr-4">
            <LucideChartNoAxesCombined className="w-6 h-6 text-black" />
          </div>
          <div className="border-l border-gray-200 h-12 pl-4 flex flex-col justify-center">
            <div className="text-sm font-light text-gray-600">Total Sales</div>
            <div className="text-base font-medium text-gray-900">
              LKR.5000.00
            </div>
          </div>
        </div>

        <div className="h-23 bg-white rounded-[15px] flex items-center justify-start p-4 shadow-sm">
          <div className="flex-shrink-0 rounded-3xl bg-[#BBF7D0] w-12 h-12 flex items-center justify-center mr-4">
            <ChartLine className="w-6 h-6 text-black" />
          </div>
          <div className="border-l border-gray-200 h-12 pl-4 flex flex-col justify-center">
            <div className="text-sm font-light text-gray-600">Total Profit</div>
            <div className="text-base font-medium text-gray-900">50</div>
          </div>
        </div>

        <div className="h-23 bg-white rounded-[15px] flex items-center justify-start p-4 shadow-sm">
          <div className="flex-shrink-0 rounded-3xl bg-[#BBF7D0] w-12 h-12 flex items-center justify-center mr-4">
            <FileSpreadsheet className="w-6 h-6 text-black" />
          </div>
          <div className="border-l border-gray-200 h-12 pl-4 flex flex-col justify-center">
            <div className="text-sm font-light text-gray-600">
              Total Invoices
            </div>
            <div className="text-base font-medium text-gray-900">50</div>
          </div>
        </div>

        <div className="h-23 bg-white rounded-[15px] flex items-center justify-start p-4 shadow-sm">
          <div className="flex-shrink-0 rounded-3xl bg-[#BBF7D0] w-12 h-12 flex items-center justify-center mr-4">
            <Scale className="w-6 h-6 text-black" />
          </div>
          <div className="border-l border-gray-200 h-12 pl-4 flex flex-col justify-center">
            <div className="text-sm font-light text-gray-600">
              Total Discount
            </div>
            <div className="text-base font-medium text-gray-900">50</div>
          </div>
        </div>

        <div className="h-23 bg-white rounded-[15px] flex items-center justify-start p-4 shadow-sm">
          <div className="flex-shrink-0 rounded-3xl bg-[#BBF7D0] w-12 h-12 flex items-center justify-center mr-4">
            <CalendarDays className="w-6 h-6 text-black" />
          </div>
          <div className="border-l border-gray-200 h-12 pl-4 flex flex-col justify-center">
            <div className="text-sm font-light text-gray-600">Date Range</div>
            <div className="text-base font-medium text-gray-900">2 Days</div>
          </div>
        </div>
      </div>

      <div className="bg-white p-5 mx-5 rounded-2xl shadow-sm">
        <h3 className="text-lg font-semibold mb-4 text-gray-800">Filter</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 items-end">
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
              className="border border-gray-300 rounded-md p-2.5 focus:ring-green-500 focus:border-green-500 text-gray-800"
              placeholder="select user"
            />
          </div>

          <div className="flex flex-col">
            <label
              htmlFor="fromDate"
              className="text-sm font-medium mb-2 text-gray-700"
            >
              From Date
            </label>
            <input
              type="date"
              id="fromDate"
              defaultValue="2025-01-10"
              className="border border-gray-300 rounded-md p-2.5 focus:ring-green-500 focus:border-green-500 text-gray-800"
            />
          </div>

          <div className="flex flex-col">
            <label
              htmlFor="toDate"
              className="text-sm font-medium mb-2 text-gray-700"
            >
              To Date
            </label>
            <input
              type="date"
              id="toDate"
              defaultValue="2025-01-10"
              className="border border-gray-300 rounded-md p-2.5 focus:ring-green-500 focus:border-green-500 text-gray-800"
            />
          </div>

          <div className="flex flex-row gap-4 pt-0 md:pt-6">
            <button className="flex-1 bg-[#059669] text-white py-2.5 px-4 rounded-md flex items-center justify-center hover:bg-green-700 transition-colors">
              <SearchCheckIcon className="w-4 h-4 mr-2" />
              Search
            </button>
            <button className="flex-1 bg-gray-200 text-gray-700 py-2.5 px-4 rounded-md flex items-center justify-center hover:bg-gray-300 transition-colors">
              <RefreshCwIcon className="w-4 h-4 mr-2" />
              Clear
            </button>
          </div>
        </div>
      </div>

      <div className="bg-white p-5 mx-5 my-5 rounded-2xl shadow-sm h-auto">
        <div className="grid grid-cols-11 gap-5 bg-[#059669] h-13 rounded-md items-center text-white text-xs font-medium min-w-5xl">
          <div className="px-2">Invoice ID</div>
          <div>Gross Amount(LKR)</div>
          <div> Customer</div>
          <div>Discount</div>
          <div>NET Amount</div>
          <div>Cash Pay</div>
          <div>Card Pay</div>
          <div>Balance</div>
          <div>Issued Cashier</div>
          <div>Issued At</div>
          <div>Actions</div>
        </div>

        <div className="grid grid-cols-11 gap-5  h-13  items-center  text-xs font-medium min-w-5xl border-b">
            <div className="px-2">INV-001</div>
            <div>2,500.00</div>
            <div>John Doe</div>
            <div>100.00</div>
            <div>2,400.00</div>
            <div>2,000.00</div>
            <div>400.00</div>
            <div>0.00</div>
            <div>Jane Smith</div>
            <div>2025-01-10 10:30</div>
            <div className="flex gap-2">
            <button className="p-1 rounded-full bg-[#BBF7D0]" title="Print">
              <Printer className="w-4 h-4 text-green-600" />
            </button>
            <button className="p-1 rounded-full bg-[#FEF08A]" title="View">
              <SaveAll className="w-4 h-4  text-yellow-600" />
            </button>
            </div>
        </div>


        
        

        
      </div>

      <div className="flex flex-col items-center space-y-3 mx-5 mb-5">
        <div className="flex justify-center items-center gap-4 w-full">
          <button
            onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
            className="px-4 py-2 rounded-md hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed flex items-center transition-colors"
            disabled={currentPage === 1}
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <polyline points="15 18 9 12 15 6"></polyline>
            </svg>
            <span className="ml-1">Previous</span>
          </button>
          
           
          
          <button
            onClick={() => setCurrentPage((prev) => Math.min(prev + 1, totalPages))}
            className="px-4 py-2 rounded-md hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed flex items-center transition-colors"
            disabled={currentPage === totalPages}
          >
            <span className="mr-1">Next</span>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <polyline points="9 18 15 12 9 6"></polyline>
            </svg>
          </button>
        </div>
        <p className="text-sm text-gray-500">
          Showing page <span className="font-semibold text-green-700 border border-gray-300 rounded-md px-2 py-1">{currentPage}</span> of {totalPages}
        </p>
      </div>
    </>
  );
}export default ManageUserSales;
