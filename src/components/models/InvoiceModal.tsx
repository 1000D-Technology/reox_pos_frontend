import {CircleX, Printer} from "lucide-react";

const InvoiceModal = ({ onClose }: { onClose: () => void }) => {
    const invoiceData = {
        invoiceNo: "250929003",
        date: "25 June 2025",
        customer: {
            name: "Temporary Customer",
            phone: "0747272489",
        },
        items: [
            {
                id: "PID12345",
                name: "Seat Belt",
                mrp: 600.0,
                discount: 20.0,
                rate: 580.0,
                qty: 5,
                total: 2900.0,
            },
            {
                id: "PID12345",
                name: "Seat Belt",
                mrp: 600.0,
                discount: 20.0,
                rate: 580.0,
                qty: 5,
                total: 2900.0,
            },
        ],
        totalDiscount: 200.0,
        subtotal: 5800.0,
        tax: 0.0,
        total: 5800.0,
        cashier: "Saman Silva",
    };

    const handlePrint = () => window.print();

    return (
        <div
            className="flex items-center justify-center h-full w-full rounded-md bg-clip-padding backdrop-filter backdrop-blur-sm bg-opacity-10 border border-gray-100 ">
            <div className="bg-white rounded-2xl shadow-xl p-8 w-[600px] relative">
                <button
                    className="absolute top-4 right-4 text-gray-500 hover:text-black cursor-pointer"
                    onClick={onClose}
                >
                    <CircleX size={32}/>
                </button>
                <div className="text-center mb-6 w-1/2 mx-auto">
                    <label className="text-3xl">Invoice</label>
                    <hr/>
                    <label className="text-4xl font-semibold mt-1">Vista Motors</label>
                </div>

                <div className="justify-end items-end flex">
                    <div className="mt-2 ">
                        <div>
                            <span className="">Invoice No:</span>{" "}
                            {invoiceData.invoiceNo}
                        </div>
                        <div>{invoiceData.date}</div>
                        <div>Rambewa, Karandththewewa</div>
                    </div>
                </div>
                <div className="mb-4 text-sm">
                    <div className="">BILLED TO:</div>
                    <div>{invoiceData.customer.name}</div>
                    <div>{invoiceData.customer.phone}</div>
                </div>

                <table className="w-full border-collapse text-sm mb-4">
                    <thead>
                    <tr className="bg-[#404040] text-white text-left">
                        <th className="p-2 font-normal">Product ID</th>
                        <th className="p-2 font-normal">Name</th>
                        <th className="p-2 font-normal text-right">MRP</th>
                        <th className="p-2 font-normal text-right">Discount</th>
                        <th className="p-2 font-normal text-right">Rate</th>
                        <th className="p-2 font-normal text-right">QTY</th>
                        <th className="p-2 font-normal text-right">Total</th>
                    </tr>
                    </thead>
                    <tbody>
                    {invoiceData.items.map((item, idx) => (
                        <tr key={idx} className="border-b border-gray-200">
                            <td className="p-2">{item.id}</td>
                            <td className="p-2">{item.name}</td>
                            <td className="p-2 text-right">{item.mrp.toFixed(2)}</td>
                            <td className="p-2 text-right">{item.discount.toFixed(2)}</td>
                            <td className="p-2 text-right">{item.rate.toFixed(2)}</td>
                            <td className="p-2 text-right">{item.qty}</td>
                            <td className="p-2 text-right">{item.total.toFixed(2)}</td>
                        </tr>
                    ))}
                    </tbody>
                </table>

                <div className="text-sm mb-40">


                    <div className="mt-2 flex justify-end">
                        <div className="w-1/3">


                            <div className="flex text-right">
                                <div className="w-1/2">Subtotal</div>
                                <div className="w-1/2">{invoiceData.subtotal.toFixed(2)}</div>
                            </div>

                            <div className="flex mt-2 text-right">
                                <div className="w-1/2">Tax</div>
                                <div className="w-1/2">{invoiceData.tax.toFixed(2)}</div>
                            </div>
                            <div className="mt-2">
                                <hr/>
                            </div>

                            <div className="flex text-right text-lg">
                                <div className="w-1/2">Total</div>
                                <div className="w-1/2">{invoiceData.total.toFixed(2)}</div>
                            </div>
                        </div>
                    </div>


                    <div className="mt-10">
                        Total discount: LKR {invoiceData.totalDiscount.toFixed(2)}
                    </div>

                </div>

                <div className="flex justify-end ">
                    <button
                        onClick={handlePrint}
                        className="bg-black text-white px-4 py-2 rounded-lg hover:bg-gray-800 transition flex "
                    >
                        <Printer size={18} className="mt-1"/> &nbsp; Print Invoice
                    </button>
                </div>
            </div>
        </div>
    );
};

export default InvoiceModal;
