 import { XCircle } from "lucide-react"

// Define props interface for type safety
interface StokeInvoiceProps {
    onClose: () => void;
    quotationData: {
        quotationId: string;
        grossAmount: string;
        discount: string;
        discountAmount: string;
        netAmount: string;
        createBy: string;
        createAt: string;
    };
}

function StokeInvoice({ onClose, quotationData }: StokeInvoiceProps) {
  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center">
      <div className="relative flex items-center justify-center h-full p-4">
        <div className="bg-white rounded-lg shadow-xl max-w-4xl w-full mx-auto p-6 sm:p-8 lg:p-10 relative">
          {/* Close button positioned at the top-right corner of the invoice */}
          <div className="absolute top-4 right-4 z-10">
            <button
              onClick={onClose}
              className="p-2 text-black rounded-full bg-gray-100 hover:bg-gray-200 transition-colors"
              aria-label="Close"
            >
              <XCircle className="w-6 h-6" />
            </button>
          </div>

          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6">
            <h1 className="font-bold text-2xl text-gray-800 mb-2">COMPANY NAME</h1>
            <div className="text-right">
              <h2 className="font-bold text-2xl text-gray-800">INVOICE</h2>
            </div>
          </div>

          <div className="bg-emerald-600 text-white p-3 sm:p-4 rounded-md mb-6 flex flex-col sm:flex-row justify-between text-sm sm:text-base">
            <div className="mb-1 sm:mb-0">
              <span className="font-semibold">INVOICE #:</span> {quotationData.quotationId}
            </div>
            <div className="mb-1 sm:mb-0 bg-white text-black p-1 rounded-md">
              <div>
                <span className="font-semibold">Date:</span> {quotationData.createAt}
              </div>
            </div>
          </div>

          <div className="overflow-x-auto mb-6">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-emerald-600">
                <tr>
                  <th scope="col" className="px-4 sm:px-6 py-3 text-left text-xs font-medium text-white uppercase tracking-wider">
                    SL
                  </th>
                  <th scope="col" className="px-4 sm:px-6 py-3 text-left text-xs font-medium text-white uppercase tracking-wider">
                    Product Name
                  </th>
                  <th scope="col" className="px-4 sm:px-6 py-3 text-left text-xs font-medium text-white uppercase tracking-wider">
                    Price
                  </th>
                  <th scope="col" className="px-4 sm:px-6 py-3 text-left text-xs font-medium text-white uppercase tracking-wider">
                    Qty
                  </th>
                  <th scope="col" className="px-4 sm:px-6 py-3 text-left text-xs font-medium text-white uppercase tracking-wider">
                    Total
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                <tr>
                  <td className="px-4 sm:px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">1</td>
                  <td className="px-4 sm:px-6 py-4 whitespace-nowrap text-sm text-gray-500">Sugar</td>
                  <td className="px-4 sm:px-6 py-4 whitespace-nowrap text-sm text-gray-500">5000.00</td>
                  <td className="px-4 sm:px-6 py-4 whitespace-nowrap text-sm text-gray-500">2</td>
                  <td className="px-4 sm:px-6 py-4 whitespace-nowrap text-sm text-gray-500">10000.00</td>
                </tr>
                <tr>
                  <td className="px-4 sm:px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">2</td>
                  <td className="px-4 sm:px-6 py-4 whitespace-nowrap text-sm text-gray-500">Flour</td>
                  <td className="px-4 sm:px-6 py-4 whitespace-nowrap text-sm text-gray-500">2000.00</td>
                  <td className="px-4 sm:px-6 py-4 whitespace-nowrap text-sm text-gray-500">5</td>
                  <td className="px-4 sm:px-6 py-4 whitespace-nowrap text-sm text-gray-500">10000.00</td>
                </tr>
              </tbody>
            </table>
          </div>

          <div className="flex justify-end mt-28">
            <div className="w-full sm:w-1/2">
              <div className="flex justify-between py-2 border-t border-gray-200">
                <span className="text-sm font-medium text-gray-700">Subtotal:</span>
                <span className="text-sm font-medium text-gray-900">{quotationData.grossAmount}</span>
              </div>
              <div className="flex justify-between py-2 border-b border-gray-200">
                <span className="text-sm font-medium text-gray-700">Tax:</span>
                <span className="text-sm font-medium text-gray-900">0.00</span>
              </div>
              <div className="flex justify-between py-2 bg-black text-white px-4 rounded-b-md">
                <span className="text-base sm:text-lg font-bold">Total:</span>
                <span className="text-base sm:text-lg font-bold">{quotationData.netAmount}</span>
              </div>
            </div>
          </div>

          <div className="mt-8 text-start text-sm text-gray-600">
            Thank you for your business!
          </div>

          <div className="mt-4 p-4 rounded-md text-xs text-gray-500">
            <h3 className="font-semibold text-gray-700 mb-1">Terms & Condition</h3>
            All quotations are valid for 30 days. Prices are subject to change without prior notice.
          </div>

          <div className="mt-12 text-right">
            <div className="border-t border-gray-300 inline-block pt-2 px-8">
              <span className="text-sm font-medium text-gray-700">Authorized Sign</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default StokeInvoice;