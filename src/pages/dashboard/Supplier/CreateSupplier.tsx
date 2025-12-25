import {
    ChevronLeft,
    ChevronRight,
    CirclePlus,
    Pencil,

    X,
} from 'lucide-react';

import { useEffect, useState } from 'react';


interface Category {
    no: string;
    name: string;
    email: string;
    contact: string;
    company: string;
    bank: string;
    account: string;
}

function CreateSupplier() {

    const salesData: Category[] = [
        {
            no: '1',
            name: 'BBC',
            email: 'test@gmail.com',
            contact: '076...',
            company: '1000D',
            bank: 'BBC',
            account: '123...',
        },
        
    ];

    // State for controlling the modal visibility
    const [isModalOpen, setIsModalOpen] = useState(false);

    // 2. Specify that the state can be a 'Category' object or 'null'
    const [selectedCategory, setSelectedCategory] = useState<Category | null>(null);

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


    const handleEditClick = (category: Category) => {
        setSelectedCategory(category);
        setIsModalOpen(true);
    };


    const handleCloseModal = () => {
        setIsModalOpen(false);
        setSelectedCategory(null);
    };


    return (
        <div className={'flex flex-col gap-4 h-full'}>
            <div>
                <div className="text-sm text-gray-500 flex items-center">
                    <span>Pages</span>
                    <span className="mx-2">›</span>
                    <span className="text-black">Create Supplier</span>
                </div>
                <h1 className="text-3xl font-semibold text-gray-500">Create Supplier</h1>
            </div>

            <div className={'flex flex-col bg-white rounded-md  p-4 justify-between gap-8'}>

                <div className={'grid md:grid-cols-5 gap-4'}>
                    <div>
                        <label htmlFor="search-category"
                            className="block text-sm font-medium text-gray-700 mb-1">Name</label>
                        <input type="text" id="search-category" placeholder="Type to search types"
                            className="w-full text-sm rounded-md py-2 px-2 border-2 border-gray-100 focus:border-emerald-500 focus:ring-emerald-500" />
                    </div>

                    <div>
                        <label htmlFor="search-category"
                            className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                        <input type="text" id="search-category" placeholder="Type to search Product"
                            className="w-full text-sm rounded-md py-2 px-2 border-2 border-gray-100 focus:border-emerald-500 focus:ring-emerald-500" />
                    </div>

                    <div>
                        <label htmlFor="search-category"
                            className="block text-sm font-medium text-gray-700 mb-1">Product Code</label>
                        <input type="text" id="search-category" placeholder="Type to search Product Code"
                            className="w-full text-sm rounded-md py-2 px-2 border-2 border-gray-100 focus:border-emerald-500 focus:ring-emerald-500" />
                    </div>

                    <div>
                        <div className='flex justify-between items-center'>
                            <label htmlFor="search-category" className="block text-sm font-medium text-gray-700 mb-1">Company Name</label>

                            <details className="relative">
                                <summary className="list-none">
                                    <CirclePlus className='text-green-700 hover:bg-green-200 rounded-full p-1 cursor-pointer' size={18} />
                                </summary>

                                {/* Modal built with <details> so no new hooks are required */}
                                <div className="fixed inset-0 z-50 flex items-center justify-center bg-white/10 backdrop-blur-sm">
                                    <div className="bg-white rounded-2xl shadow-xl p-6 w-full max-w-md relative">
                                        <button
                                            type="button"
                                            onClick={(e) => (e.currentTarget.closest('details') as HTMLDetailsElement).removeAttribute('open')}
                                            className="absolute top-3 right-3 text-gray-400 hover:text-gray-600">
                                            <X className="w-5 h-5" />
                                        </button>

                                        <h3 className="text-lg font-semibold mb-4">Add Company</h3>

                                        <div className="space-y-3">
                                            <div>
                                                <label htmlFor="new-company-name" className="block text-sm font-medium text-gray-700 mb-1">
                                                    Company Name
                                                </label>
                                                <input
                                                    id="new-company-name"
                                                    type="text"
                                                    placeholder="Enter company name"
                                                    className="w-full text-sm rounded-md py-2 px-3 border border-gray-300 focus:border-emerald-500 focus:ring-emerald-500"
                                                />
                                            </div>

                                            <div>
                                                <label htmlFor="new-company-email" className="block text-sm font-medium text-gray-700 mb-1">
                                                    Email
                                                </label>
                                                <input
                                                    id="new-company-email"
                                                    type="email"
                                                    placeholder="Enter company email"
                                                    className="w-full text-sm rounded-md py-2 px-3 border border-gray-300 focus:border-emerald-500 focus:ring-emerald-500"
                                                />
                                            </div>
                                        </div>

                                        <div className="mt-6 flex justify-end gap-2">
                                            <button
                                                type="button"
                                                onClick={(e) => {
                                                    const details = e.currentTarget.closest('details') as HTMLDetailsElement;
                                                    const name = (details.querySelector('#new-company-name') as HTMLInputElement).value;
                                                    const email = (details.querySelector('#new-company-email') as HTMLInputElement).value;
                                                    // replace with real save logic
                                                    console.log('Add company:', { name, email });
                                                    details.removeAttribute('open');
                                                }}
                                                className="bg-emerald-600 text-white py-2 px-4 rounded-md font-semibold hover:bg-emerald-700">
                                                Save Company
                                            </button>

                                            <button
                                                type="button"
                                                onClick={(e) => (e.currentTarget.closest('details') as HTMLDetailsElement).removeAttribute('open')}
                                                className="py-2 px-4 rounded-md border">
                                                Cancel
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            </details>
                        </div>
                        
                        <input type="text" id="search-category" placeholder="Enter Cabin Number"
                            className="w-full text-sm rounded-md py-2 px-2 border-2 border-gray-100 focus:border-emerald-500 focus:ring-emerald-500" />
                      
                    </div>

                    <div>
                        <label htmlFor="new-category"
                            className="block text-sm font-medium text-gray-700 mb-1">Bank</label>
                        <input type="text" id="new-category" placeholder="Select Bank"
                            className="w-full text-sm rounded-md py-2 px-2 border-2 border-gray-100 focus:border-emerald-500 focus:ring-emerald-500" />
                    </div>

                    <div>
                        <label htmlFor="new-category"
                            className="block text-sm font-medium text-gray-700 mb-1">Account Number</label>
                        <input type="text" id="new-category" placeholder="Select Bank"
                            className="w-full text-sm rounded-md py-2 px-2 border-2 border-gray-100 focus:border-emerald-500 focus:ring-emerald-500" />
                    </div>

                </div>

                <div className={'flex justify-end border-b-1 mt-[-13px]'}>
                    <button className={'bg-emerald-600 py-2 px-10 rounded-md font-semibold text-white hover:bg-emerald-700 mb-4'}>
                        Save Suplier
                    </button>
                </div>

                <div
                    className="overflow-y-auto max-h-md md:h-[320px] lg:h-[500px] rounded-md scrollbar-thin scrollbar-thumb-gray-300 scrollbar-track-gray-100">
                    <table className="min-w-full divide-y divide-gray-200">
                        <thead className="bg-emerald-600 sticky top-0 z-10">
                            <tr>
                                {['#', 'Name', 'Email', 'Contact Number','Company Name','Bank','Account Number','Actions'].map((header, i, arr) => (
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
                                    className={`cursor-pointer ${index === selectedIndex
                                        ? "bg-green-100 border-l-4 border-green-600"
                                        : "hover:bg-green-50"
                                        }`}
                                >
                                    <td className="px-6 py-2 whitespace-nowrap text-sm font-medium">{sale.no}</td>
                                    <td className="px-6 py-2 whitespace-nowrap text-sm font-medium">{sale.name}</td>
                                    <td className="px-6 py-2 whitespace-nowrap text-sm font-medium">{sale.email}</td>
                                    <td className="px-6 py-2 whitespace-nowrap text-sm font-medium">{sale.contact}</td>
                                    <td className="px-6 py-2 whitespace-nowrap text-sm font-medium">{sale.company}</td>
                                    <td className="px-6 py-2 whitespace-nowrap text-sm font-medium">{sale.bank}</td>
                                    <td className="px-6 py-2 whitespace-nowrap text-sm font-medium">{sale.account}</td>
                                    <td className="px-6 py-2 whitespace-nowrap text-sm font-medium">
                                        <div className="flex items-center space-x-2">
                                            <div className="relative group">
                                                <button
                                                    onClick={() => handleEditClick(sale)}
                                                    className="p-2 bg-green-100 rounded-full text-green-700 hover:bg-green-200 transition-colors">
                                                    <Pencil size={15} />
                                                </button>
                                                <span
                                                    className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 w-max px-2 py-1 text-xs text-white bg-gray-900 rounded-md invisible group-hover:visible opacity-0 group-hover:opacity-100 transition-opacity">
                                                    Edit Category
                                                </span>
                                            </div>
                                            
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>

                <nav className="bg-white flex items-center justify-center sm:px-6 pt-4">
                    <div className="flex items-center space-x-2">
                        <button className="flex items-center px-2 py-2 text-sm font-medium text-gray-500 hover:text-gray-700">
                            <ChevronLeft className="mr-2 h-5 w-5" /> Previous
                        </button>
                        <button className="px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white">1</button>
                        <button className="px-4 py-2 border border-transparent text-sm font-medium rounded-md text-gray-500 hover:bg-gray-100">2</button>
                        <button className="px-4 py-2 border border-transparent text-sm font-medium rounded-md text-gray-500 hover:bg-gray-100">3</button>
                        <span className="text-gray-500 px-2">...</span>
                        <button className="flex items-center px-2 py-2 text-sm font-medium text-gray-500 hover:text-gray-700">
                            Next <ChevronRight className="ml-2 h-5 w-5" />
                        </button>
                    </div>
                </nav>
            </div>

            {/* Update Category Modal */}
            {isModalOpen && selectedCategory && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-white/10 backdrop-blur-sm">
                    <div className="bg-white rounded-2xl shadow-xl p-8 w-full max-w-md relative ">
                        <button
                            onClick={handleCloseModal}
                            className="absolute top-4 right-4 text-gray-400 hover:text-gray-600">
                            <X className="w-6 h-6" />
                        </button>

                        <h2 className="text-3xl font-bold text-[#525252] mb-10">Update Supplier</h2>

                        <div className="space-y-2">
                            <p className='text-teal-600'>Saman</p>
                            <p className="text-sm text-gray-600">
                                Current Supplier Contact Number :
                                <span className="font-semibold text-teal-600 ml-2">{selectedCategory.name}</span>
                            </p>
                            <div>
                                <label htmlFor="update-category-name" className="block text-sm font-bold text-gray-700 mb-1">
                                    New Supplier Contact Number
                                </label>
                                <input
                                    type="text"
                                    id="update-category-name"
                                    placeholder="Enter Supplier Contact Number"
                                    className="w-full text-sm rounded-md py-2 px-3 border border-gray-300 focus:border-emerald-500 focus:ring-emerald-500"
                                />
                            </div>
                        </div>

                        <div className="mt-10 flex justify-end">
                            <button className="w-1/2  bg-emerald-600 text-white font-semibold py-2.5 rounded-lg hover:bg-emerald-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-emerald-500">
                                Update Contact
                            </button>
                        </div>
                    </div>
                </div>
            )}


        </div>
    );
}
export default CreateSupplier
