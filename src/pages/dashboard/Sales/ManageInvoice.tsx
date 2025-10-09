import {
  CalendarDays,
  ChartNoAxesCombined,
  FileSpreadsheet,
  Printer,
  RefreshCcw,
  SaveAll,
  Search,
} from "lucide-react";

function ManageInvoice() {
  return (
    <div>
      <div className="text-4xl text-gray-400 font-bold">Invoice Management</div>

      <div className="flex justify-between mt-4 gap-4">
        <div className="bg-white rounded-xl w-1/3 p-2 flex items-center">
          <div className="w-1/4  flex justify-center items-center border-r-2 border-gray-300">
            <div className="bg-[#BBF7D0] rounded-full w-10 h-10 flex justify-center items-center">
              <ChartNoAxesCombined />
            </div>
          </div>
          <div className="w-3/4 m-2 ">
            <div className="text-sm text-gray-500">Total Sales</div>
            <div className="text-lg font-bold">LKR.5000000.00</div>
          </div>
        </div>

        <div className="bg-white rounded-xl w-1/3 p-2 flex items-center">
          <div className="w-1/4  flex justify-center items-center border-r-2 border-gray-300">
            <div className="bg-[#BBF7D0] rounded-full w-10 h-10 flex justify-center items-center">
              <FileSpreadsheet />
            </div>
          </div>
          <div className="w-3/4 m-2 ">
            <div className="text-sm text-gray-500">Total Invoice</div>
            <div className="text-lg font-bold">50</div>
          </div>
        </div>

        <div className="bg-white rounded-xl w-1/3 p-2 flex items-center">
          <div className="w-1/4  flex justify-center items-center border-r-2 border-gray-300">
            <div className="bg-[#BBF7D0] rounded-full w-10 h-10 flex justify-center items-center">
              <CalendarDays />
            </div>
          </div>
          <div className="w-3/4 m-2 ">
            <div className="text-sm text-gray-500">Date Range</div>
            <div className="text-lg font-bold">6 Days</div>
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
            <input
              type="text"
              className="border border-[#E5E5E5] rounded-md p-2 w-full mt-1"
            />
          </div>
          <div className="w-1/4">
            <label className="text-sm font-medium">To Date</label>
            <input
              type="text"
              className="border border-[#E5E5E5] rounded-md p-2 w-full mt-1"
            />
          </div>
          <div className="w-1/4">
            <div className="flex mt-7">
              <button className="bg-[#059669] text-white px-4 py-2 rounded-md w-full flex items-center justify-center">
                <Search /> &nbsp;&nbsp;Search
              </button>
              <button className="bg-[#8C8C8C] text-white px-4 py-2 rounded-md w-full ml-2 flex items-center justify-center">
                <RefreshCcw /> &nbsp;&nbsp;Clear
              </button>
            </div>
          </div>
        </div>
      </div>
      <div className="bg-white rounded-xl w-full h-full mt-4 p-8">
        <div className="bg-[#059669] p-2 rounded-md flex">
          <div className="text-white w-1/5">Invoice ID</div>
          <div className="text-white w-1/5">Total Amount (LKR)</div>
          <div className="text-white w-1/5">Issued Date</div>
          <div className="text-white w-1/5">Issued Cashier</div>
          <div className="text-white w-1/5">Actions</div>
        </div>

        <div className="border-b border-gray-300 p-2 rounded-md flex">
          <div className=" w-1/5 flex items-center">250929003</div>
          <div className="w-1/5 flex items-center">25000.00</div>
          <div className="w-1/5 flex items-center">9/29/2025, 8:51:54 AM</div>
          <div className="w-1/5 flex items-center">Saman Silva</div>
          <div className="w-1/5 flex">
            <div className="w-1/2 flex justify-center items-center">
              <div className="bg-[#BBF7D0] rounded-full w-10 h-10 flex justify-center items-center">
                 <Printer className="text-[#059669]"/>
              </div>
            </div>
            <div className="w-1/2 flex justify-center items-center">
              <div className="bg-[#FEF08A] rounded-full w-10 h-10 flex justify-center items-center">
                <SaveAll className="text-[#F59E0B]"/>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default ManageInvoice;
