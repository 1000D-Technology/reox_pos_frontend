import {useEffect, useState} from "react";
import TypeableSelect from "../../../components/TypeableSelect.tsx";

function CreateGrn() {
    const grnData = [
        {
            productName: "Sugar",
            productVariant: "5",
            barcode: "T45S425",
            batch: "A52",
            mfd: "2025.02.12",
            exp: "2027.02.12",
            cost: "500.00",
            mrp: "750.00",
            rsp: "600.00",
            wsp: "550.00",
            qty: "5",
            free: "2",
        },
    ];

    const [selectedIndex, setSelectedIndex] = useState(0);

    type SelectOption = {
        value: string;
        label: string;
    };
    const [selected, setSelected] = useState<SelectOption | null>(null);

    const productName = [
        {value: "suger", label: "Suger"},
        {value: "fima", label: "Fima"},
        {value: "snacks", label: "Snacks"},
    ];
    const supplier = [
        {value: "Samna", label: "Samna"},
        {value: "Jagath", label: "Jagath"},
        {value: "Jagath", label: "Jagath"},
    ];

    // 🔹 Handle Up / Down arrow keys
    useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            if (e.key === "ArrowDown") {
                setSelectedIndex((prev) =>
                    prev < grnData.length - 1 ? prev + 1 : prev
                );
            } else if (e.key === "ArrowUp") {
                setSelectedIndex((prev) => (prev > 0 ? prev - 1 : prev));
            }
        };

        window.addEventListener("keydown", handleKeyDown);
        return () => window.removeEventListener("keydown", handleKeyDown);
    }, [grnData.length]);


    return (
        <>
            <div className={'flex flex-col gap-4 h-full'}>
                <div>
                    <div className="text-sm text-gray-500 flex items-center">
                        <span>Pages</span>
                        <span className="mx-2">›</span>
                        <span className="text-black">Create GRN</span>
                    </div>
                    <h1 className="text-3xl font-semibold text-gray-500">Create GRN</h1>
                </div>

                <div className={'bg-white rounded-md p-4 flex flex-col'}>
                    <span className="text-lg font-semibold my-4">Basic Bill Information</span>
                    <div className={'grid md:grid-cols-5 gap-4 '}>
                        <div>
                            <label
                                htmlFor="product name"
                                className="block text-sm font-medium text-gray-700 mb-1"
                            >
                                Bill Number <span className="text-red-500">*</span>
                            </label>
                            <input
                                type="text"
                                id="product code"
                                placeholder="Enter Your Bill Number"
                                className="w-full text-sm rounded-md py-2 px-2  border-2 border-gray-100 "
                            />
                        </div>
                        <div>
                            <label
                                htmlFor="supplier"
                                className="block text-sm font-medium text-gray-700 mb-1"
                            >
                                Select Supplier <span className="text-red-500">*</span>
                            </label>
                            <TypeableSelect
                                options={supplier}
                                value={selected?.value || null}
                                onChange={(opt) =>
                                    opt
                                        ? setSelected({
                                            value: String(opt.value),
                                            label: opt.label,
                                        })
                                        : setSelected(null)
                                }
                                placeholder="Type to search Supplier"
                                allowCreate={true}
                            />
                        </div>

                    </div>
                    <span className="text-lg font-semibold my-4">Basic GRN Information</span>
                    <div className={'grid md:grid-cols-5 gap-4 '}>
                        <div>
                            <label
                                htmlFor="supplier"
                                className="block text-sm font-medium text-gray-700 mb-1"
                            >
                                Select Product <span className="text-red-500">*</span>
                            </label>
                            <TypeableSelect
                                options={productName}
                                value={selected?.value || null}
                                onChange={(opt) =>
                                    opt
                                        ? setSelected({
                                            value: String(opt.value),
                                            label: opt.label,
                                        })
                                        : setSelected(null)
                                }
                                placeholder="Type to search Product"
                                allowCreate={true}
                            />
                        </div>
                        <div>
                            <label
                                htmlFor="productvariants"
                                className="block text-sm font-medium text-gray-700 mb-1"
                            >
                                Select Product Variants <span className="text-red-500">*</span>
                            </label>
                            <select name="" id=""  className="w-full text-sm rounded-md py-2 px-2  border-2 border-gray-100 cursor-pointer" disabled={true}>
                                <option value="">dwv  f</option>
                                <option value="">dwv  f</option><option value="">dwv  f</option>
                            </select>
                        </div>
                        <div>
                            <label
                                htmlFor="barcode"
                                className="block text-sm font-medium text-gray-700 mb-1"
                            >
                                Barcode
                            </label>
                            <input
                                type="text"
                                id="barcode"
                                placeholder="Enter Barcode"
                                className="w-full text-sm rounded-md py-2 px-2  border-2 border-gray-100 "
                            />
                        </div>
                        <div>
                            <label
                                htmlFor="barcode"
                                className="block text-sm font-medium text-gray-700 mb-1"
                            >
                                Batch Number
                            </label>
                            <input
                                type="text"
                                id="batchnumber"
                                placeholder="Enter Batch Number"
                                className="w-full text-sm rounded-md py-2 px-2  border-2 border-gray-100 "
                            />
                        </div>
                        <div>
                            <label
                                htmlFor="mfdate"
                                className="block text-sm font-medium text-gray-700 mb-1"
                            >
                                Manufacture Date
                            </label>
                            <input
                                type="date"
                                id="mfdate"
                                placeholder="Enter Manufacture Date"
                                className="w-full text-sm rounded-md py-2 px-2  border-2 border-gray-100 "
                            />
                        </div>
                        <div>
                            <label
                                htmlFor="exdate"
                                className="block text-sm font-medium text-gray-700 mb-1"
                            >
                                Expire Date
                            </label>
                            <input
                                type="date"
                                id="exdate"
                                placeholder="Enter Expire Date"
                                className="w-full text-sm rounded-md py-2 px-2  border-2 border-gray-100 "
                            />
                        </div>
                        <div>
                            <label
                                htmlFor="coprice"
                                className="block text-sm font-medium text-gray-700 mb-1"
                            >
                                Cost Price <span className="text-red-500">*</span>
                            </label>
                            <input
                                type="number"
                                id="coprice"
                                placeholder="Enter Cost Price"
                                className="w-full text-sm rounded-md py-2 px-2  border-2 border-gray-100 "
                            />
                        </div>
                        <div>
                            <label
                                htmlFor="reprice"
                                className="block text-sm font-medium text-gray-700 mb-1"
                            >
                                Manufacture Retail Price <span className="text-red-500">*</span>
                            </label>
                            <input
                                type="number"
                                id="reprice"
                                placeholder="Enter Manufacture Retail Price"
                                className="w-full text-sm rounded-md py-2 px-2  border-2 border-gray-100 "
                            />
                        </div>
                        <div>
                            <label
                                htmlFor="reprice"
                                className="block text-sm font-medium text-gray-700 mb-1"
                            >
                                Retail Selling Price <span className="text-red-500">*</span>
                            </label>
                            <input
                                type="number"
                                id="reprice"
                                placeholder="Enter Retail Selling Price"
                                className="w-full text-sm rounded-md py-2 px-2  border-2 border-gray-100 "
                            />
                        </div>
                        <div>
                            <label
                                htmlFor="wprice"
                                className="block text-sm font-medium text-gray-700 mb-1"
                            >
                                Wholesale Selling Price
                            </label>
                            <input
                                type="number"
                                id="wprice"
                                placeholder="Enter Retail Selling Price"
                                className="w-full text-sm rounded-md py-2 px-2  border-2 border-gray-100 "
                            />
                        </div>
                        <div>
                            <label
                                htmlFor="qty"
                                className="block text-sm font-medium text-gray-700 mb-1"
                            >
                                Quantity <span className="text-red-500">*</span>
                            </label>
                            <input
                                type="number"
                                id="qty"
                                placeholder="Enter Quantity"
                                className="w-full text-sm rounded-md py-2 px-2  border-2 border-gray-100 "
                            />
                        </div>
                        <div>
                            <label
                                htmlFor="qty"
                                className="block text-sm font-medium text-gray-700 mb-1"
                            >
                               Free Quantity 
                            </label>
                            <input
                                type="number"
                                id="reprice"
                                placeholder="Enter Quantity"
                                className="w-full text-sm rounded-md py-2 px-2  border-2 border-gray-100 "
                            />
                        </div>
                        <div className={'flex justify-center items-end'}>
                            <button className={'bg-emerald-600 w-full rounded-sm p-2 text-white font-semibold cursor-pointer hover:bg-emerald-500'}>ADD TO GRN ( Enter )</button>

                        </div>
                    </div>
                    <span className="text-lg font-semibold mt-4">GRN Items</span>
                    <div
                        className={
                            "flex flex-col bg-white rounded-md h-full py-4 justify-between"
                        }
                    >
                        <div
                            className="overflow-y-auto max-h-md md:h-[320px] lg:h-[320px] rounded-md bg-gray-50 scrollbar-thin scrollbar-thumb-gray-300 scrollbar-track-gray-100">
                            <table className="min-w-full divide-y divide-gray-200">
                                <thead className="bg-emerald-600 sticky top-0 z-10">
                                <tr>
                                    {[

                                        "Product Name",
                                        "Product Variants ID",
                                        "Barcode",
                                        "Batch Number",
                                        "MFD",
                                        "EXP",
                                        "Cost Price",
                                        "MRP",
                                        "RSP",
                                        "WSP",
                                        "QTY",
                                        "Free QTY",
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
                                {grnData.map((sale, index) => (
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
                                            {sale.productName}
                                        </td>
                                        <td className="px-6 py-2 whitespace-nowrap text-sm font-medium">
                                            {sale.productVariant}
                                        </td>
                                        <td className="px-6 py-2 whitespace-nowrap text-sm font-medium">
                                            {sale.barcode}
                                        </td>
                                        <td className="px-6 py-2 whitespace-nowrap text-sm font-medium">
                                            {sale.batch}
                                        </td>
                                        <td className="px-6 py-2 whitespace-nowrap text-sm font-medium">
                                            {sale.mfd}
                                        </td>
                                        <td className="px-6 py-2 whitespace-nowrap text-sm font-medium">
                                            {sale.exp}
                                        </td>
                                        <td className="px-6 py-2 whitespace-nowrap text-sm font-medium">
                                            {sale.cost}
                                        </td>
                                        <td className="px-6 py-2 whitespace-nowrap text-sm font-medium">
                                            {sale.mrp}
                                        </td>
                                        <td className="px-6 py-2 whitespace-nowrap text-sm font-medium">
                                            {sale.rsp}
                                        </td>
                                        <td className="px-6 py-2 whitespace-nowrap text-sm font-medium">
                                            {sale.wsp}
                                        </td>
                                        <td className="px-6 py-2 whitespace-nowrap text-sm font-medium">
                                            {sale.qty}
                                        </td>
                                        <td className="px-6 py-2 whitespace-nowrap text-sm font-medium">
                                            {sale.free}
                                        </td>
                                    </tr>
                                ))}
                                </tbody>
                            </table>
                        </div>


                    </div>
                    <div className={'flex justify-between mt-2'}>
                        <div className={'w-3/5'}>
                            <div className={'grid md:grid-cols-3 gap-4 '}>
                                <div>
                                    <label
                                        htmlFor="supplier"
                                        className="block text-sm font-medium text-gray-700 mb-1"
                                    >
                                        Payment Type<span className="text-red-500">*</span>
                                    </label>
                                    <select name="" id=""  className="w-full text-sm rounded-md py-2 px-2  border-2 border-gray-100 cursor-pointer" >
                                        <option value="">SELECT</option>
                                        <option value="">Cash</option>
                                        <option value="">Cheque</option>
                                    </select>
                                </div>
                                <div>
                                    <label
                                        htmlFor="wprice"
                                        className="block text-sm font-medium text-gray-700 mb-1"
                                    >
                                        Paid Amount <span className="text-red-500">*</span>
                                    </label>
                                    <input
                                        type="number"
                                        id="wprice"
                                        placeholder="Enter Paid Amount"
                                        className="w-full text-sm rounded-md py-2 px-2  border-2 border-gray-100 "
                                    />
                                </div>


                            </div>
                        </div>
                        <div className={'w-2/5'}>
                            <div className={'flex flex-col gap-2'}>
                                <div className={'flex justify-between'}>
                                    <span className={'font-semibold'}>Total Items :</span>
                                    <span>10</span>
                                </div>
                                <div className={'flex justify-between'}>
                                    <span className={'font-semibold'}>Total Quantity :</span>
                                    <span>50</span>
                                </div>
                                <div className={'flex justify-between'}>
                                    <span className={'font-semibold'}>Total Cost :</span>
                                    <span>2500.00</span>
                                </div>
                                <div className={'flex justify-between border-t pt-2 font-bold text-lg'}>
                                    <span>GRN Total :</span>
                                    <span>2500.00</span>
                                </div>
                                <div className={'flex justify-between  pt-2 font-bold text-lg text-red-500'}>
                                    <span>Paid Amount :</span>
                                    <span>-2500.00</span>
                                </div>
                                <div className={'flex justify-between border-y pt-2 font-bold text-lg text-emerald-600'}>
                                    <span>Balance :</span>
                                    <span>2500.00</span>
                                </div>
                            </div>
                            <div>
                                <button className={'bg-emerald-600 w-full rounded-sm p-2 mt-4 text-white font-semibold cursor-pointer hover:bg-emerald-500'}>CREATE GRN ( Shift+Enter )</button>
                            </div>
                        </div>
                    </div>
                </div>

            </div>
        </>
    );
}

export default CreateGrn;
