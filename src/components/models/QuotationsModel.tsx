import { CircleX, Printer } from "lucide-react";

const QuotationsModal = ({ onClose }: { onClose: () => void }) => {
  const invoiceData = {
    invoiceNo: "245254",
    date: "05/01/2025",
    items: [
      {
        id: 1,
        name: "Sugar",
        price: 5000.0,
        qty: 2,
        total: 10000.0,
      },
    ],
    subtotal: 10000.0,
    tax: 0.0,
    total: 10000.0,
  };

  const handlePrint = () => window.print();

  return (
    <div className="flex items-center justify-center h-full w-full rounded-md bg-clip-padding backdrop-filter backdrop-blur-sm bg-opacity-10 border border-gray-100">
      <div className="bg-white rounded-2xl shadow-xl p-8 w-[600px] relative">
        <div className="mb-20">
          {/* Close Button */}
          <button
            className="absolute top-4 right-4 text-gray-500 hover:text-black cursor-pointer"
            onClick={onClose}
          >
            <CircleX size={32} />
          </button>
        </div>
        {/* Header */}
        <div className="flex justify-between items-center">
          <h1 className="text-xl font-semibold">COMPANY NAME</h1>
          <h2 className="text-xl font-semibold">INVOICE</h2>
        </div>

        {/* Invoice Info */}
        <div className="flex justify-between bg-[#059669] text-white px-4 py-2 rounded-md mt-4">
          <p className="flex items-center">
            Invoice #{" "}
            <span>{invoiceData.invoiceNo}</span>
          </p>
          <p className="bg-white text-black px-3 py-1 rounded-md">
            Date: {invoiceData.date}
          </p>
        </div>

        {/* Table */}
        <table className="w-full border-collapse text-sm mt-4">
          <thead>
            <tr className="bg-[#059669] text-white text-left">
              <th className="p-2 font-normal">SL</th>
              <th className="p-2 font-normal">Product Name</th>
              <th className="p-2 font-normal text-right">Price</th>
              <th className="p-2 font-normal text-right">Qty</th>
              <th className="p-2 font-normal text-right">Total</th>
            </tr>
          </thead>
          <tbody className="">
            {invoiceData.items.map((item) => (
              <tr key={item.id} className="border-b border-gray-200">
                <td className="p-2">{item.id}</td>
                <td className="p-2">{item.name}</td>
                <td className="p-2 text-right">{item.price.toFixed(2)}</td>
                <td className="p-2 text-right">{item.qty}</td>
                <td className="p-2 text-right">{item.total.toFixed(2)}</td>
              </tr>
            ))}
            
          </tbody>
        </table>

        {/* Totals */}
        <div className="flex justify-end mt-6 text-sm">
          <div className="w-1/3">
            <div className="flex justify-between">
              <div className="w-1/2 flex justify-end">Subtotal:</div>
              <div className="px-3">{invoiceData.subtotal.toFixed(2)}</div>
            </div>
            <div className="flex justify-between">
              <div className="w-1/2 flex justify-end">Tax:</div>
              <div className="px-3">{invoiceData.tax.toFixed(2)}</div>
            </div>
            <div className="flex justify-between font-semibold bg-black text-white px-3 py-2 rounded-md mt-2">
              <div className="w-1/2 flex justify-end">Total:</div>
              <div>{invoiceData.total.toFixed(2)}</div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="mt-10 text-sm">
          <p>Thank you for your business!</p>

          <div className="mt-4">
            <h3 className="font-semibold">Terms & Condition</h3>
            <p className="text-xs text-gray-600 mt-1">
              All invoices are subject to payment within agreed terms. Late
              payments may incur fees. Ownership remains until full payment is
              received.
            </p>
          </div>

          <div className="flex justify-end mt-8">
            <div className="text-center">
              <div className="border-t border-gray-500 w-40 mx-auto"></div>
              <p className="text-xs mt-1">Authorized Sign</p>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
};

export default QuotationsModal;
