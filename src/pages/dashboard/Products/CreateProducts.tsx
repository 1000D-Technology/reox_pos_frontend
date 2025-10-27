import { ChevronLeft, ChevronRight, FileText } from "lucide-react";
import { useEffect, useState } from "react";
import TypeableSelect from "../../../components/TypeableSelect.tsx";

function CreateProducts() {
  const salesData = [
    {
      productID: "250929003",
      productType: "Sugar",
      productName: "Suger",
      productCode: "TS425",
      cabinNumber: "5",
      barcode: "742388563",
      supplier: "Jeewan",
      categories: "Grocery",
      unit: "Kg",
      colors: "Red",
      MRP: "25000",
      lockedPrice: "25000",
      image: "image.jpg",
    },
  ];

  type SelectOption = {
    value: string;
    label: string;
  };
  const [selected, setSelected] = useState<SelectOption | null>(null);

  const suppliers = [
    { value: "frank", label: "Frank" },
    { value: "elsa", label: "Elsa" },
    { value: "saman", label: "Saman" },
    { value: "kumara", label: "Kumara" },
  ];

  const units = [
    { value: "kg", label: "Kilogram" },
    { value: "ltr", label: "Litre" },
    { value: "pcs", label: "Pieces" },
  ];

  const productType = [
    { value: "suger", label: "Suger" },
    { value: "fima", label: "Fima" },
    { value: "snacks", label: "Snacks" },
  ];

  const categories = [
    { value: "grocery", label: "Grocery" },
    { value: "beverages", label: "Beverages" },
    { value: "snacks", label: "Snacks" },
  ];

  const productName = [
    { value: "suger", label: "Suger" },
    { value: "fima", label: "Fima" },
    { value: "snacks", label: "Snacks" },
  ];
  const cabinNumber = [
    { value: "1", label: "1" },
    { value: "2", label: "2" },
    { value: "3", label: "3" },
  ];
  const color = [
    { value: "red", label: "Red" },
    { value: "yellow", label: "Yellow" },
    { value: "green", label: "Green" },
  ];

  // 🔹 Selected row state
  const [selectedIndex, setSelectedIndex] = useState(0);

  // 🔹 Handle Up / Down arrow keys
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "ArrowDown") {
        setSelectedIndex((prev) =>
          prev < salesData.length - 1 ? prev + 1 : prev
        );
      } else if (e.key === "ArrowUp") {
        setSelectedIndex((prev) => (prev > 0 ? prev - 1 : prev));
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [salesData.length]);
  return (
    <>
      <div className={"flex flex-col gap-4 h-full"}>
        <div>
          <div className="text-sm text-gray-500 flex items-center">
            <span>Pages</span>
            <span className="mx-2">›</span>
            <span className="text-black">Stock List</span>
          </div>
          <h1 className="text-3xl font-semibold text-gray-500">Stock List</h1>
        </div>

        <div className={"bg-white rounded-md p-4 flex flex-col"}>
          <h2 className="text-xl font-semibold text-gray-400">Filter</h2>
          <div className={"grid md:grid-cols-5 gap-4 "}>
            <div>
              <label
                htmlFor="product type"
                className="block text-sm font-medium text-gray-700 mb-1"
              >
                Product Type
              </label>
              <TypeableSelect
                options={productType}
                value={selected?.value || null}
                onChange={(opt) =>
                  opt
                    ? setSelected({
                        value: String(opt.value),
                        label: opt.label,
                      })
                    : setSelected(null)
                }
                placeholder="Type to search types"
                allowCreate={true}
              />
            </div>
            <div>
              <label
                htmlFor="product name"
                className="block text-sm font-medium text-gray-700 mb-1"
              >
                Product Name
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
                htmlFor="product code"
                className="block text-sm font-medium text-gray-700 mb-1"
              >
                Product Code
              </label>
              <input
                type="text"
                id="product code"
                placeholder="Type to search Product Code"
                className="w-full text-sm rounded-md py-2 px-2  border-2 border-gray-100 "
              />
            </div>
            <div>
              <label
                htmlFor="cabin number"
                className="block text-sm font-medium text-gray-700 mb-1"
              >
                Cabin Number
              </label>
              <TypeableSelect
                options={cabinNumber}
                value={selected?.value || null}
                onChange={(opt) =>
                  opt
                    ? setSelected({
                        value: String(opt.value),
                        label: opt.label,
                      })
                    : setSelected(null)
                }
                placeholder="Enter Cabin Number"
                allowCreate={true}
              />
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
                htmlFor="supplier"
                className="block text-sm font-medium text-gray-700 mb-1"
              >
                Supplier
              </label>
              <TypeableSelect
                options={suppliers}
                value={selected?.value || null}
                onChange={(opt) =>
                  opt
                    ? setSelected({
                        value: String(opt.value),
                        label: opt.label,
                      })
                    : setSelected(null)
                }
                placeholder="Type to search types"
                allowCreate={true}
              />
            </div>
            <div>
              <label
                htmlFor="category"
                className="block text-sm font-medium text-gray-700 mb-1"
              >
                Category
              </label>
              <TypeableSelect
                options={categories}
                value={selected?.value || null}
                onChange={(opt) =>
                  opt
                    ? setSelected({
                        value: String(opt.value),
                        label: opt.label,
                      })
                    : setSelected(null)
                }
                placeholder="Type to search types"
                allowCreate={true}
              />
            </div>
            <div>
              <label
                htmlFor="unit"
                className="block text-sm font-medium text-gray-700 mb-1"
              >
                Unit
              </label>
              <TypeableSelect
                options={units}
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
                htmlFor="color"
                className="block text-sm font-medium text-gray-700 mb-1"
              >
                Color
              </label>
              <TypeableSelect
                options={color}
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
                htmlFor="product-image"
                className="block text-sm font-medium text-gray-700 mb-1"
              >
                Image
              </label>
              <input
                type="file"
                id="product-image"
                accept=".jpg,.jpeg,.png,image/jpeg,image/png,image/jpg"
                className="w-full text-sm rounded-md py-2 px-2 border-2 border-gray-100"
                placeholder="Select Image"
              />
            </div>
            <div>
              <label
                htmlFor="product"
                className="block text-sm font-medium text-gray-700 mb-1"
              >
                MRP
              </label>
              <input
                type="text"
                id="product"
                placeholder="Enter MRP"
                className="w-full text-sm rounded-md py-2 px-2  border-2 border-gray-100 "
              />
            </div>
            <div>
              <label
                htmlFor="product"
                className="block text-sm font-medium text-gray-700 mb-1"
              >
                Locked Price
              </label>
              <input
                type="text"
                id="product"
                placeholder="Enter Locked Price"
                className="w-full text-sm rounded-md py-2 px-2  border-2 border-gray-100 "
              />
            </div>
          </div>
          <div
            className={
              "flex justify-end md:items-end items-start p-2 gap-2 text-white font-medium border-b border-gray-200 pt-4"
            }
          >
            <button
              className={
                "bg-emerald-600 p-2 rounded-md w-1/6 flex justify-center items-center"
              }
            >
              Save Product
            </button>
          </div>
        </div>

        <div
          className={
            "flex flex-col bg-white rounded-md h-full p-4 justify-between"
          }
        >
          <div className="overflow-y-auto max-h-md md:h-[320px] lg:h-[500px] rounded-md scrollbar-thin scrollbar-thumb-gray-300 scrollbar-track-gray-100">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-emerald-600 sticky top-0 z-10">
                <tr>
                  {[
                    "Product ID",
                    "Product Type",
                    "Product Name",
                    "Product Code",
                    "Cabin Number",
                    "Barcode",
                    "Supplier",
                    "Category",
                    "Unit",
                    "Color",
                    "MRP",
                    "Locked Price",
                    "Image",
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
                      {sale.productType}
                    </td>
                    <td className="px-6 py-2 whitespace-nowrap text-sm font-medium">
                      {sale.productName}
                    </td>
                    <td className="px-6 py-2 whitespace-nowrap text-sm font-medium">
                      {sale.productCode}
                    </td>
                    <td className="px-6 py-2 whitespace-nowrap text-sm font-medium">
                      {sale.cabinNumber}
                    </td>
                    <td className="px-6 py-2 whitespace-nowrap text-sm font-medium">
                      {sale.barcode}
                    </td>
                    <td className="px-6 py-2 whitespace-nowrap text-sm font-medium">
                      {sale.supplier}
                    </td>
                    <td className="px-6 py-2 whitespace-nowrap text-sm font-medium">
                      {sale.categories}
                    </td>
                    <td className="px-6 py-2 whitespace-nowrap text-sm font-medium">
                      {sale.unit}
                    </td>
                    <td className="px-6 py-2 whitespace-nowrap text-sm font-medium">
                      {sale.colors}
                    </td>
                    <td className="px-6 py-2 whitespace-nowrap text-sm font-medium">
                      {sale.MRP}
                    </td>
                    <td className="px-6 py-2 whitespace-nowrap text-sm font-medium">
                      {sale.lockedPrice}
                    </td>
                    <td className="px-6 py-2 whitespace-nowrap text-sm font-medium">
                      {sale.image}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <nav className="bg-white flex items-center justify-center sm:px-6">
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

        <div className={"bg-white flex justify-center p-4 gap-4"}>
          <button
            className={
              "bg-emerald-600 px-6 py-2 font-medium text-white rounded-md flex gap-2 items-center shadow-sm"
            }
          >
            <FileText size={15} />
            Exel
          </button>
          <button
            className={
              "bg-yellow-600 px-6 py-2 font-medium text-white rounded-md flex gap-2 items-center shadow-sm"
            }
          >
            <FileText size={15} />
            CSV
          </button>
          <button
            className={
              "bg-red-500 px-6 py-2 font-medium text-white rounded-md flex gap-2 items-center shadow-sm"
            }
          >
            <FileText size={15} />
            PDF
          </button>
        </div>
      </div>
    </>
  );
}

export default CreateProducts;
