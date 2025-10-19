
import {

  ChevronLeft, ChevronRight,
 FileText,

  RefreshCw,
  SearchCheck,
} from "lucide-react";
import {useEffect, useState} from "react";

function StockList() {

  const salesData = [
    {
      productID: '250929003',
      productName: 'Suger',
      unit: 'Unknown',
      discountAmount: '0.00',
      costPrice: '650.00',
      MRP: '650.00',
      Price: '0.00',
      supplier: 'Saman Silva',
      stockQty: '50',
    },


  ];

  // 🔹 Selected row state
  const [selectedIndex, setSelectedIndex] = useState(0);

  // 🔹 Handle Up / Down arrow keys
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "ArrowDown") {
        setSelectedIndex((prev) => (prev < salesData.length - 1 ? prev + 1 : prev));
      } else if (e.key === "ArrowUp") {
        setSelectedIndex((prev) => (prev > 0 ? prev - 1 : prev));
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [salesData.length]);
  return (
      <>
        <div className={'flex flex-col gap-4 h-full'}>
          <div>
            <div className="text-sm text-gray-500 flex items-center">
              <span>Pages</span>
              <span className="mx-2">›</span>
              <span className="text-black">Stock List</span>
            </div>
            <h1 className="text-3xl font-semibold text-gray-500">Stock List</h1>
          </div>

          <div className={'bg-white rounded-md p-4 flex flex-col'}>
            <h2 className="text-xl font-semibold text-gray-400">Filter</h2>
            <div className={'grid md:grid-cols-5 gap-4 '}>
              <div>
                <label htmlFor="category"
                       className="block text-sm font-medium text-gray-700 mb-1">Category</label>
                <select id="category"
                        className="w-full text-sm rounded-md py-2 px-2  border-2 border-gray-100 ">
                  <option selected>Choose Cashier</option>
                  <option value="US">Frank</option>
                  <option value="CA">Elsa</option>
                  <option value="FR">Saman</option>
                  <option value="DE">Kumara</option>
                </select>

              </div>
              <div>
                <label htmlFor="unit"
                       className="block text-sm font-medium text-gray-700 mb-1">Unit</label>
                <select id="unit"
                        className="w-full text-sm rounded-md py-2 px-2  border-2 border-gray-100 ">
                  <option selected>Choose Cashier</option>
                  <option value="US">Frank</option>
                  <option value="CA">Elsa</option>
                  <option value="FR">Saman</option>
                  <option value="DE">Kumara</option>
                </select>

              </div>
              <div>
                <label htmlFor="supplier"
                       className="block text-sm font-medium text-gray-700 mb-1">Supplier</label>
                <select id="unit"
                        className="w-full text-sm rounded-md py-2 px-2  border-2 border-gray-100 ">
                  <option selected>Choose Cashier</option>
                  <option value="US">Frank</option>
                  <option value="CA">Elsa</option>
                  <option value="FR">Saman</option>
                  <option value="DE">Kumara</option>
                </select>

              </div>
              <div>
                <label htmlFor="product"
                       className="block text-sm font-medium text-gray-700 mb-1">Product ID / Name</label>
                <input type="text" id="product" placeholder="Enter Invoice Number..."
                       className="w-full text-sm rounded-md py-2 px-2  border-2 border-gray-100 "/>

              </div>
              <div className={'grid grid-cols-2 md:items-end items-start gap-2 text-white font-medium'}>
                <button className={'bg-emerald-600 py-2 rounded-md flex items-center justify-center'}>
                  <SearchCheck className="mr-2" size={14}/>Search
                </button>
                <button className={'bg-gray-500 py-2 rounded-md flex items-center justify-center'}><RefreshCw
                    className="mr-2" size={14}/>Clear
                </button>
              </div>
            </div>
          </div>
          <div className={'flex flex-col bg-white rounded-md h-full p-4 justify-between'}>
            <div
                className="overflow-y-auto max-h-md md:h-[320px] lg:h-[500px] rounded-md scrollbar-thin scrollbar-thumb-gray-300 scrollbar-track-gray-100">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-emerald-600 sticky top-0 z-10">
                <tr>
                  {[
                    'Product ID',
                    'Product Name',
                    'Unit',
                    'Discount Amount',
                    'Cost Price',
                    'MRP',
                    'Price',
                    'Supplier',
                    'Stock QTY',


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
                        {sale.unit}
                      </td>
                      <td className="px-6 py-2 whitespace-nowrap text-sm font-medium">
                        {sale.discountAmount}
                      </td>
                      <td className="px-6 py-2 whitespace-nowrap text-sm font-medium">
                        {sale.costPrice}
                      </td>
                      <td className="px-6 py-2 whitespace-nowrap text-sm font-medium">
                        {sale.MRP}
                      </td>
                      <td className="px-6 py-2 whitespace-nowrap text-sm font-medium">
                        {sale.Price}
                      </td>
                      <td className="px-6 py-2 whitespace-nowrap text-sm font-medium">
                        {sale.supplier}
                      </td>
                      <td className="px-6 py-2 whitespace-nowrap text-sm font-medium">
                        {sale.stockQty}
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

          <div className={'bg-white flex justify-center p-4 gap-4'}>
            <button
                className={'bg-emerald-600 px-6 py-2 font-medium text-white rounded-md flex gap-2 items-center shadow-sm'}>
              <FileText size={15}/>Exel
            </button>
            <button
                className={'bg-yellow-600 px-6 py-2 font-medium text-white rounded-md flex gap-2 items-center shadow-sm'}>
              <FileText size={15}/>CSV
            </button>
            <button
                className={'bg-red-500 px-6 py-2 font-medium text-white rounded-md flex gap-2 items-center shadow-sm'}>
              <FileText size={15}/>PDF
            </button>
          </div>
        </div>
      </>
  );
}

export default StockList;
