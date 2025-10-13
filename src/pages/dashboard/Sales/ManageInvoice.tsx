import {
  CalendarDays,
  ChartNoAxesCombined,
  ChevronLeft,
  ChevronRight,
  FileSpreadsheet,
  Printer,
  RefreshCcw,
  SaveAll,
  SearchCheck,
} from "lucide-react";

function ManageInvoice() {
  return (
    <div className="h-screen">
      <nav className="flex" aria-label="Breadcrumb">
        <ol className="inline-flex items-center space-x-1 md:space-x-2 rtl:space-x-reverse">
          <li className="inline-flex items-center">
            <a
              href="#"
              className="inline-flex items-center text-sm  text-gray-700 hover:text-blue-600 dark:text-gray-400 dark:hover:text-white"
            >
              Pages
            </a>
          </li>
          <li>
            <div className="flex items-center">
              <svg
                className="rtl:rotate-180 w-2 h-2 text-gray-400"
                aria-hidden="true"
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 6 10"
              >
                <path
                  stroke="currentColor"
                  stroke-linecap="round"
                  stroke-linejoin="round"
                  stroke-width="2"
                  d="m1 9 4-4-4-4"
                />
              </svg>
              <a href="#" className="ms-1 text-sm  text-gray-950">
                Invoice Management
              </a>
            </div>
          </li>
        </ol>
      </nav>

      <div className="text-4xl text-gray-400 font-semibold">
        Invoice Management
      </div>
      <div className="grid grid-cols-3 gap-4 mt-4">
        <div className="bg-white p-2  rounded-xl flex items-center">
          <div className="w-1/4  flex justify-center items-center border-r-2 border-gray-300">
            <div className="bg-[#BBF7D0] rounded-full w-10 h-10 flex justify-center items-center">
              <ChartNoAxesCombined />
            </div>
          </div>
          <div className="w-3/4 m-2 ">
            <div className="text-sm text-gray-500">Total Sales</div>
            <div className="text-lg font-semibold">LKR.5000000.00</div>
          </div>
        </div>

        <div className="bg-white p-2 rounded-xl flex items-center">
          <div className="w-1/4  flex justify-center items-center border-r-2 border-gray-300">
            <div className="bg-[#BBF7D0] rounded-full w-10 h-10 flex justify-center items-center">
              <FileSpreadsheet />
            </div>
          </div>
          <div className="w-3/4 m-2 ">
            <div className="text-sm text-gray-500">Total Invoice</div>
            <div className="text-lg font-semibold">50</div>
          </div>
        </div>

        <div className="bg-white p-2 rounded-xl flex items-center">
          <div className="w-1/4  flex justify-center items-center border-r-2 border-gray-300">
            <div className="bg-[#BBF7D0] rounded-full w-10 h-10 flex justify-center items-center">
              <CalendarDays />
            </div>
          </div>
          <div className="w-3/4 m-2 ">
            <div className="text-sm text-gray-500">Date Range</div>
            <div className="text-lg font-semibold">6 Days</div>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-xl w-full mt-4 p-8">
        <div className="text-2xl text-gray-400 font-bold">Filter</div>
        <div className="flex gap-4 mt-4">
          <div className="w-1/4">
            <label className="text-sm font-medium">Name</label>
            <input
              type="text"
              className="border border-[#E5E5E5] rounded-md p-2 w-full mt-1 text-gray-500"
              placeholder="Enter Invoice Number..."
            />
          </div>
            <div className="w-1/4">
            <label className="text-sm font-medium">From Date</label>
            <div className="relative">
              <input
              type="text"
              className="border border-[#E5E5E5] rounded-md p-2 w-full mt-1 pr-10"
              placeholder="10/01/2025"
              />
              <span className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none">
              <CalendarDays size={18} />
              </span>
            </div>
            </div>
          <div className="w-1/4">
            <label className="text-sm font-medium">To Date</label>
            <div className="relative">
              <input
                type="text"
                className="border border-[#E5E5E5] rounded-md p-2 w-full mt-1 pr-10"
                placeholder="10/01/2025"
              />
              <span className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none">
                <CalendarDays size={18} />
              </span>
            </div>
          </div>
          <div className="w-1/4">
            <div className="flex mt-7">
              <button className="bg-[#059669] text-white px-4 py-2 rounded-md w-full flex items-center justify-center">
                <SearchCheck size={18}/> &nbsp;&nbsp;Search
              </button>
              <button className="bg-[#8C8C8C] text-white px-4 py-2 rounded-md w-full ml-2 flex items-center justify-center">
                <RefreshCcw size={18}/> &nbsp;&nbsp;Clear
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-t-xl w-full h-[40vh] mt-4 p-8">
        <div className="bg-[#059669] p-2 rounded-sm flex">
          <div className="text-white w-1/5">Invoice ID</div>
          <div className="text-white w-1/5">Total Amount (LKR)</div>
          <div className="text-white w-1/5">Issued Date</div>
          <div className="text-white w-1/5">Issued Cashier</div>
          <div className="text-white w-1/5">Actions</div>
        </div>

        <div className="border-b border-gray-300 p-2 rounded-sm flex">
          <div className=" w-1/5 flex items-center">250929003</div>
          <div className="w-1/5 flex items-center">25000.00</div>
          <div className="w-1/5 flex items-center">9/29/2025, 8:51:54 AM</div>
          <div className="w-1/5 flex items-center">Saman Silva</div>
          <div className="w-1/5 flex">
            <div className="relative group w-1/2 flex justify-center items-center">
              <div className="bg-[#BBF7D0] w-10 h-10 flex justify-center items-center rounded-full cursor-pointer">
                <Printer className="text-[#059669]" size={18}/>
              </div>
              <div className="absolute bottom-[-2.2rem] scale-0 group-hover:scale-100 transition-transform duration-200 bg-black text-white text-sm font-medium px-3 py-1 rounded-full shadow-lg">
                Print Invoice
                <div className="absolute top-[-5px] left-1/2 -translate-x-1/2 w-2 h-2 bg-black rotate-45"></div>
              </div>
            </div>

            <div className="relative group w-1/2 flex justify-center items-center">
              <div className="bg-[#FEF08A] rounded-full w-10 h-10 flex justify-center items-center">
                <SaveAll className="text-[#F59E0B]" size={18}/>
              </div>
              <div className="absolute bottom-[-2.2rem] scale-0 group-hover:scale-100 transition-transform duration-200 bg-black text-white text-sm font-medium px-3 py-1 rounded-full shadow-lg">
                Save Invoice
                <div className="absolute top-[-5px] left-1/2 -translate-x-1/2 w-2 h-2 bg-black rotate-45"></div>
              </div>
            </div>
          </div>
        </div>
      </div>
      <div className="flex justify-center bg-white rounded-b-xl w-full h-16 p-4">
        <nav aria-label="Page navigation example">
          <ul className="inline-flex -space-x-px text-sm">
            <li>
              <a
                href="#"
                className="flex items-center justify-center px-3 h-8 ms-0 "
              >
                <ChevronLeft className="w-4 h-4" /> Previous
              </a>
            </li>
            <li>
              <a
                href="#"
                className="flex items-center justify-center px-3 h-8 rounded-md border  border-gray-300 bg-white text-gray-700 shadow-sm"
              >
                1
              </a>
            </li>
            <li>
              <a
                href="#"
                className="flex items-center justify-center px-3 h-8 leading-tight"
              >
                2
              </a>
            </li>
            <li>
              <a
                href="#"
                aria-current="page"
                className="flex items-center justify-center px-3 h-8 leading-tight"
              >
                3
              </a>
            </li>
            <li>
              <a
                href="#"
                className="flex items-center justify-center px-3 h-8 leading-tight"
              >
                ...
              </a>
            </li>

            <li>
              <a
                href="#"
                className="flex items-center justify-center px-3 h-8 leading-tight"
              >
                Next <ChevronRight className="w-4 h-4" />
              </a>
            </li>
          </ul>
        </nav>
      </div>
    </div>
  );
}

export default ManageInvoice;
