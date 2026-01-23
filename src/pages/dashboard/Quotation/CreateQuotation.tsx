import {
    Printer,
    Save,
    Trash,
    Package,
    ShoppingCart,
    DollarSign,
    User,
    Calendar,
    Plus,
    UserPlus,
    Percent,
    FileText
} from 'lucide-react';
import { useEffect, useState } from 'react';
import toast, { Toaster } from 'react-hot-toast';
import { customerService } from '../../../services/customerService';
import { posService } from '../../../services/posService';
import { quotationService } from '../../../services/quotationService';
import TypeableSelect from '../../../components/TypeableSelect';
import { CustomerRegistrationModal } from '../../../components/pos/CustomerRegistrationModal';
import { printQuotation } from '../../../utils/quotationPrinter';

interface QuotationItem {
    id: number; // Stock ID or Product ID
    productId: string; // Product Code
    name: string;
    mrp: number; // Market Retail Price (Selling Price)
    discount: number;
    discountType: 'percentage' | 'price';
    rate: number; // Unit Price
    qty: number;
    amount: number;
}

interface Customer {
    id: number;
    name: string;
    contact: string;
    email?: string;
}

interface Product {
    stockID: number;
    productName: string;
    productCode: string;
    price: number;
    wholesalePrice: number;
    currentStock: number;
    unit: string;
}

function CreateQuotation() {
    // Data State
    const [quotationData, setQuotationData] = useState<QuotationItem[]>([]);
    const [customers, setCustomers] = useState<any[]>([]);
    const [products, setProducts] = useState<any[]>([]);
    
    // Form State
    const [selectedCustomer, setSelectedCustomer] = useState<Customer | null>(null);
    const [quotationDate, setQuotationDate] = useState(new Date().toISOString().split('T')[0]);
    const [validUntil, setValidUntil] = useState(new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]); // +7 days
    const [remarks, setRemarks] = useState('');
    const [showRegistrationModal, setShowRegistrationModal] = useState(false);
    
    // Item Addition State
    const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
    const [addQty, setAddQty] = useState(1);
    const [addDiscount, setAddDiscount] = useState(0);
    const [discountType, setDiscountType] = useState<'percentage' | 'price'>('percentage');

    // Search Debounce
    const [searchTimeout, setSearchTimeout] = useState<ReturnType<typeof setTimeout> | null>(null);

    // Pagination
    const [currentPage] = useState(1); 
    const [itemsPerPage] = useState(10); 

    // --- Loading Data ---
    useEffect(() => {
        loadCustomers();
        loadProducts();
    }, []);

    const loadCustomers = async () => {
        try {
            const response = await customerService.getCustomers();
            if (response.data?.success) {
                setCustomers(response.data.data.map((c: any) => ({
                    value: c.id,
                    label: `${c.name} (${c.contact})`,
                    original: c
                })));
            }
        } catch (error) {
            console.error('Failed to load customers', error);
            toast.error('Failed to load customers');
        }
    };

    const loadProducts = async () => {
        try {
            const response = await posService.getPOSProductsList();
                if (response.data?.success) {
                    setProducts(response.data.data.map((p: any) => ({
                        value: p.stockID || p.stock_id || p.id,
                        label: `${p.productName || p.displayName} (${p.productID || p.product_code}) - LKR ${p.Price || p.price}`,
                        original: {
                            stockID: p.stockID || p.stock_id || p.id,
                            productName: p.productName || p.displayName, 
                            productCode: p.productID || p.product_code || p.productCode,
                            price: parseFloat(p.Price || p.price || 0),
                            wholesalePrice: parseFloat(p.wholesalePrice || p.wsp || '0'),
                            currentStock: parseInt(p.stockQty || p.stock || p.qty || 0),
                            unit: p.unit
                        }
                    })));
                }
        } catch (error) {
            console.error('Failed to load products', error);
            toast.error('Failed to load products');
        }
    };

    const handleProductSearch = (query: string) => {
        if (searchTimeout) clearTimeout(searchTimeout);
        
        if (!query.trim()) {
            loadProducts(); 
            return;
        }

        const timeout = setTimeout(async () => {
            try {
                const response = await posService.searchProducts(query);
                if (response.data?.success) {
                    setProducts(response.data.data.map((p: any) => ({
                        value: p.stockID || p.stock_id || p.id,
                        label: `${p.productName || p.displayName} (${p.productID || p.product_code}) - LKR ${p.Price || p.price}`,
                        original: {
                            stockID: p.stockID || p.stock_id || p.id,
                            productName: p.productName || p.displayName,
                            productCode: p.productID || p.product_code || p.productCode,
                            price: parseFloat(p.Price || p.price || 0),
                            wholesalePrice: parseFloat(p.wholesalePrice || p.wsp || '0'),
                            currentStock: parseInt(p.stockQty || p.stock || p.qty || 0),
                            unit: p.unit
                        }
                    })));
                } else {
                    setProducts([]); 
                }
            } catch (error) {
                console.error("Search failed", error);
            }
        }, 300); 
        setSearchTimeout(timeout);
    };


    // --- Logic ---

    const handleAddItem = () => {
        if (!selectedProduct) {
            toast.error('Please select a product');
            return;
        }
        if (addQty <= 0) {
            toast.error('Quantity must be greater than 0');
            return;
        }

        const subtotal = selectedProduct.price * addQty;
        let discountAmount = 0;

        if (discountType === 'percentage') {
            discountAmount = (subtotal * addDiscount) / 100;
        } else {
            discountAmount = addDiscount * addQty; // Fixed amount per unit * qty
        }

        const totalAmount = subtotal - discountAmount;
        const netUnitPrice = totalAmount / addQty;

        // Validation: Cannot sell below Wholesale Price
        if (netUnitPrice < selectedProduct.wholesalePrice) {
            toast.error(`Price too low! Min price: LKR ${selectedProduct.wholesalePrice} (WSP)`);
            return;
        }

        const newItem: QuotationItem = {
            id: selectedProduct.stockID,
            productId: selectedProduct.productCode,
            name: selectedProduct.productName,
            mrp: selectedProduct.price,
            discount: discountAmount,
            discountType: discountType,
            rate: selectedProduct.price,
            qty: addQty,
            amount: totalAmount > 0 ? totalAmount : 0
        };

        setQuotationData(prev => [...prev, newItem]);
        
        // Reset Item Form
        setSelectedProduct(null);
        setAddQty(1);
        setAddDiscount(0);
        setDiscountType('percentage');
        toast.success('Item added');
    };

    const handleRemoveItem = (index: number) => {
        const globalIndex = ((currentPage - 1) * itemsPerPage) + index;
        setQuotationData(prev => prev.filter((_, i) => i !== globalIndex));
        toast.success('Item removed');
    };

    const handleClear = () => {
        setQuotationData([]);
        setSelectedCustomer(null);
        setRemarks('');
        toast.success('All cleared');
    };

    const handleSave = async (andPrint = false) => {
        if (!selectedCustomer) {
            toast.error('Please select a customer');
            return;
        }
        if (quotationData.length === 0) {
            toast.error('Quotation is empty');
            return;
        }

        const subTotalVal = totalAmount + totalDiscount;
        
        try {
            const payload = {
                customer_id: selectedCustomer.id,
                valid_until: validUntil,
                sub_total: subTotalVal, 
                discount: totalDiscount,
                total: totalAmount,
                items: quotationData.map(item => ({
                    id: item.id, // stockID
                    mrp: item.mrp,
                    discount: item.discount,
                    qty: item.qty,
                    amount: item.amount
                }))
            };

            const response = await quotationService.createQuotation(payload);
            
            if (response.data.success) {
                toast.success('Quotation saved successfully!');
                const savedData = response.data.data;

                if (andPrint) {
                    printQuotation({
                        quotationNumber: savedData.quotation_number,
                        date: new Date(savedData.created_at),
                        validUntil: new Date(savedData.valid_until),
                        customer: selectedCustomer,
                        items: quotationData.map(item => ({
                            name: item.name,
                            quantity: item.qty,
                            unitPrice: item.mrp,
                            discount: item.discount,
                            total: item.amount
                        })),
                        subtotal: subTotalVal,
                        discount: totalDiscount,
                        total: totalAmount,
                        preparedBy: 'Admin' 
                    });
                } else {
                    // If just save, maybe ask to print? Or just done.
                }

                if (andPrint) {
                   handleClear(); // Only clear if printing done, otherwise user might want to check
                } else {
                     handleClear();
                }
            }
        } catch (error: any) {
            console.error('Save failed:', error);
            toast.error(error.response?.data?.message || 'Failed to save quotation');
        }
    };

    const registerCustomer = async (name: string, contact: string, email?: string) => {
        try {
            const response = await customerService.addCustomer({
                name: name.trim(),
                contact: contact.trim(),
                email: email?.trim() || undefined
            });

            if (response.data.success) {
                const customerFromAPI = response.data.data;
                const newCustomer: Customer = {
                    id: customerFromAPI.id,
                    name: customerFromAPI.name,
                    contact: customerFromAPI.contact
                };
                await loadCustomers();
                setSelectedCustomer(newCustomer);
                setShowRegistrationModal(false);
                toast.success('Customer registered successfully!');
            }
        } catch (error: any) {
            console.error('Error registering customer:', error);
            toast.error(error.response?.data?.message || 'Failed to register customer');
        }
    };

    // --- Calculations ---
    const totalItems = quotationData.length;
    const totalQuantity = quotationData.reduce((sum, item) => sum + item.qty, 0);
    const totalDiscount = quotationData.reduce((sum, item) => sum + item.discount, 0);
    const totalAmount = quotationData.reduce((sum, item) => sum + item.amount, 0);

    // --- Pagination ---
    const startIndex = (currentPage - 1) * itemsPerPage;
    const endIndex = startIndex + itemsPerPage;
    const currentPageData = quotationData.slice(startIndex, endIndex);

    // --- Keyboard Events ---
    useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            if (e.key === 'F1') {
                e.preventDefault();
                document.getElementById('product-search-input')?.focus();
            }
            if (e.key === 'F2') {
                e.preventDefault();
                 document.getElementById('customer-search-input')?.focus();
            }
            if (e.key === 'F4') {
                e.preventDefault();
                handleSave(false);
            }
            if (e.key === 'F9') { // Re-purposing F9 as Save & Print if that's preferred, or just Print Preview? 
                // User asked for Save + Print button. Let's make F9 "Print" just warn if not saved? 
                // Or make F9 trigger "Save & Print" directly.
                e.preventDefault();
                handleSave(true);
            }
            if (e.key === 'Insert') {
                e.preventDefault();
                setShowRegistrationModal(true);
            }
            if (e.key === 'Enter' && e.ctrlKey) {
                 handleAddItem();
            }
        };

        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, [selectedProduct, addQty, addDiscount, discountType, quotationData, selectedCustomer, quotationDate, validUntil, remarks]);


    return (
        <>
            <Toaster position="top-right" toastOptions={{ duration: 3000 }} />
            
            <CustomerRegistrationModal 
                isOpen={showRegistrationModal}
                onClose={() => setShowRegistrationModal(false)}
                onRegister={registerCustomer}
            />

            <div className="flex flex-col gap-4 h-full">
                {/* Header */}
                <div className="flex items-center justify-between">
                    <div>
                        <div className="text-sm text-gray-400 flex items-center">
                            <span>Quotation</span>
                            <span className="mx-2">›</span>
                            <span className="text-gray-700 font-medium">Create Quotation</span>
                        </div>
                        <h1 className="text-3xl font-semibold bg-linear-to-r from-gray-800 to-gray-600 bg-clip-text text-transparent">
                            Create Quotation
                        </h1>
                    </div>

                     {/* Shortcuts Hint Style from ManageInvoice */}
                    <div className="hidden lg:flex items-center gap-3 bg-white px-4 py-2 rounded-xl border border-gray-100 shadow-sm border-b-2">
                         <div className="flex items-center gap-1.5 px-2 py-1 bg-gray-50 rounded-lg border border-gray-200">
                            <span className="text-[10px] font-black text-gray-500 bg-white px-1.5 py-0.5 rounded shadow-sm border border-gray-200">F1</span>
                            <span className="text-[10px] font-bold text-gray-400 uppercase tracking-tight">Product</span>
                        </div>
                         <div className="flex items-center gap-1.5 px-2 py-1 bg-gray-50 rounded-lg border border-gray-200">
                            <span className="text-[10px] font-black text-gray-500 bg-white px-1.5 py-0.5 rounded shadow-sm border border-gray-200">F2</span>
                            <span className="text-[10px] font-bold text-gray-400 uppercase tracking-tight">Customer</span>
                        </div>
                        <div className="flex items-center gap-1.5 px-2 py-1 bg-gray-50 rounded-lg border border-gray-200">
                            <span className="text-[10px] font-black text-gray-500 bg-white px-1.5 py-0.5 rounded shadow-sm border border-gray-200">F4</span>
                            <span className="text-[10px] font-bold text-gray-400 uppercase tracking-tight">Save</span>
                        </div>
                        <div className="flex items-center gap-1.5 px-2 py-1 bg-gray-50 rounded-lg border border-gray-200">
                            <span className="text-[10px] font-black text-gray-500 bg-white px-1.5 py-0.5 rounded shadow-sm border border-gray-200">F9</span>
                            <span className="text-[10px] font-bold text-gray-400 uppercase tracking-tight">Save & Print</span>
                        </div>
                        <div className="flex items-center gap-1.5 px-2 py-1 bg-gray-50 rounded-lg border border-gray-200">
                            <span className="text-[10px] font-black text-gray-500 bg-white px-1.5 py-0.5 rounded shadow-sm border border-gray-200">Ins</span>
                            <span className="text-[10px] font-bold text-gray-400 uppercase tracking-tight">New Custo</span>
                        </div>
                    </div>
                </div>

                {/* Main Form Area */}
                <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100 grid md:grid-cols-4 gap-6">
                    {/* Customer Selection */}
                    <div className="md:col-span-2 relative">
                         <div className="flex justify-between items-center mb-1">
                             <label className="text-sm font-medium text-gray-700 flex items-center gap-2">
                                <User size={16} className="text-emerald-500" /> Customer
                            </label>
                            <button 
                                onClick={() => setShowRegistrationModal(true)}
                                className="text-xs text-emerald-600 hover:text-emerald-700 font-bold flex items-center gap-1 bg-emerald-50 px-2 py-0.5 rounded-full transition-colors"
                            >
                                <UserPlus size={12} /> New Customer
                            </button>
                         </div>
                        
                        <TypeableSelect
                             options={customers}
                             value={selectedCustomer ? selectedCustomer.id : null}
                             onChange={(opt) => {
                                 if (opt) {
                                     setSelectedCustomer((opt as any).original);
                                 } else {
                                     setSelectedCustomer(null);
                                 }
                             }}
                             placeholder="Search Customer by Name or Contact (F2)..."
                             id="customer-search-input"
                        />
                    </div>

                    {/* Dates */}
                    <div>
                        <label className="text-sm font-medium text-gray-700 mb-1 flex items-center gap-2">
                           <Calendar size={16} className="text-emerald-500" /> Date
                        </label>
                        <input
                            type="date"
                            value={quotationDate}
                            onChange={(e) => setQuotationDate(e.target.value)}
                            className="w-full text-sm rounded-lg py-2 px-3 border-2 border-gray-100 focus:border-emerald-500 outline-none transition-all"
                        />
                    </div>
                    <div>
                         <label className="text-sm font-medium text-gray-700 mb-1 flex items-center gap-2">
                           <Calendar size={16} className="text-red-500" /> Valid Until
                        </label>
                        <input
                            type="date"
                            value={validUntil}
                            onChange={(e) => setValidUntil(e.target.value)}
                            className="w-full text-sm rounded-lg py-2 px-3 border-2 border-gray-100 focus:border-emerald-500 outline-none transition-all"
                        />
                    </div>
                </div>

                {/* Add Item Section */}
                <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
                    <h2 className="text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2">
                        <Package size={20} className="text-emerald-600" /> Add Products
                    </h2>
                    
                    {/* Selected Product Banner */}
                    <div className="mb-4">
                         {selectedProduct ? (
                             <div className="bg-emerald-50 border border-emerald-100 rounded-lg p-3 flex justify-between items-center animate-in fade-in slide-in-from-top-2">
                                 <div>
                                     <h3 className="text-emerald-900 font-bold">{selectedProduct.productName}</h3>
                                     <div className="flex gap-4 text-xs text-emerald-700 mt-0.5">
                                         <span>Code: {selectedProduct.productCode}</span>
                                         <span>Stock: {selectedProduct.currentStock} {selectedProduct.unit}</span>
                                     </div>
                                 </div>
                                 <div className="text-right">
                                     <span className="block text-xs text-emerald-600 font-medium uppercase">Unit Price</span>
                                     <span className="text-xl font-bold text-emerald-700">LKR {selectedProduct.price.toLocaleString()}</span>
                                 </div>
                             </div>
                         ) : (
                             <div className="bg-gray-50 border border-gray-100 rounded-lg p-3 text-center text-gray-400 text-sm italic">
                                 Start by searching for a product below...
                             </div>
                         )}
                    </div>

                    <div className="grid md:grid-cols-12 gap-4 items-end">
                        <div className="md:col-span-5">
                            <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Search Product</label>
                            <TypeableSelect 
                                options={products}
                                value={selectedProduct ? selectedProduct.stockID : null}
                                onChange={(opt) => {
                                    if (opt) {
                                        const original = (opt as any).original;
                                        setSelectedProduct(original);
                                        // Reset qty/discount on new product select
                                        setAddQty(1);
                                        setAddDiscount(0);
                                        setDiscountType('percentage');
                                    } else {
                                        setSelectedProduct(null);
                                    }
                                }}
                                placeholder="Scan Barcode or Type Name (F1)..."
                                id="product-search-input"
                                onSearch={handleProductSearch}
                            />
                        </div>
                        
                        <div className="md:col-span-1">
                            <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Qty</label>
                            <input 
                                type="number" 
                                min="0.001"
                                step="any"
                                value={addQty}
                                onChange={(e) => setAddQty(parseFloat(e.target.value) || 0)}
                                className="w-full py-2 px-3 rounded-lg border-2 border-gray-100 focus:border-emerald-500 outline-none transition-all font-bold text-center"
                            />
                        </div>
                        
                        <div className="md:col-span-3">
                             <label className="block text-xs font-bold text-gray-500 uppercase mb-1">
                                 Discount 
                                 {selectedProduct && (
                                     <span className="text-[10px] text-gray-400 font-normal normal-case ml-1">
                                         (Max: {(selectedProduct.price - selectedProduct.wholesalePrice).toLocaleString()} LKR / {Math.floor(((selectedProduct.price - selectedProduct.wholesalePrice) / selectedProduct.price) * 100)}%)
                                     </span>
                                 )}
                             </label>
                             <div className="flex">
                                <div className="relative flex-1">
                                    <input 
                                        type="number" 
                                        min="0"     
                                        value={addDiscount}
                                        onChange={(e) => setAddDiscount(parseFloat(e.target.value) || 0)}
                                        className="w-full py-2 pl-3 pr-8 rounded-l-lg border-2 border-r-0 border-gray-100 focus:border-emerald-500 outline-none transition-all text-right font-medium"
                                        placeholder="0.00"
                                    />
                                </div>
                                <div className="flex border-2 border-l-0 border-gray-100 rounded-r-lg overflow-hidden">
                                    <button
                                        onClick={() => setDiscountType('percentage')}
                                        className={`px-2 flex items-center justify-center transition-colors ${discountType === 'percentage' ? 'bg-emerald-500 text-white' : 'bg-gray-50 text-gray-400 hover:bg-gray-100'}`}
                                        title="Percentage (%)"
                                    >
                                        <Percent size={14} />
                                    </button>
                                     <button
                                        onClick={() => setDiscountType('price')}
                                        className={`px-2 flex items-center justify-center transition-colors ${discountType === 'price' ? 'bg-blue-500 text-white' : 'bg-gray-50 text-gray-400 hover:bg-gray-100'}`}
                                        title="Fixed Amount (LKR)"
                                    >
                                        <DollarSign size={14} />
                                    </button>
                                </div>
                             </div>
                        </div>

                        <div className="md:col-span-3 flex flex-col justify-end">
                             {selectedProduct && (
                                 <div className="mb-2 text-right">
                                     <div className="text-xs text-gray-500">Net Amount</div>
                                     <div className={`font-bold ${
                                         ((selectedProduct.price * addQty) - (discountType === 'percentage' ? (selectedProduct.price * addQty * addDiscount / 100) : (addDiscount * addQty))) / addQty < selectedProduct.wholesalePrice
                                         ? 'text-red-500' 
                                         : 'text-emerald-600'
                                     }`}>
                                         LKR {((selectedProduct.price * addQty) - (discountType === 'percentage' ? (selectedProduct.price * addQty * addDiscount / 100) : (addDiscount))).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                                     </div>
                                 </div>
                             )}
                             <button
                                onClick={handleAddItem}
                                className="w-full bg-emerald-500 hover:bg-emerald-600 text-white font-bold py-2.5 rounded-lg shadow-md hover:shadow-lg transition-all flex items-center justify-center gap-2 active:scale-95"
                             >
                                 <Plus size={18} /> Add Item
                             </button>
                        </div>
                    </div>
                </div>

                {/* Items Table */}
                <div className="bg-white rounded-xl p-0 overflow-hidden shadow-md border border-gray-100 flex-1 flex flex-col min-h-0">
                    <div className="overflow-auto flex-1 h-full">
                        <table className="min-w-full divide-y divide-gray-200 relative">
                            <thead className="sticky top-0 z-10 bg-emerald-500 shadow-sm text-white">
                                <tr className="text-white text-xs uppercase tracking-wider font-semibold">
                                    <th className="px-6 py-4 text-left">Product Code</th>
                                    <th className="px-6 py-4 text-left">Description</th>
                                    <th className="px-6 py-4 text-right">Rate</th>
                                    <th className="px-6 py-4 text-center">Qty</th>
                                    <th className="px-6 py-4 text-right">Discount</th>
                                    <th className="px-6 py-4 text-right">Amount</th>
                                    <th className="px-6 py-4 text-center">Action</th>
                                </tr>
                            </thead>
                            <tbody className="bg-white divide-y divide-gray-100">
                                {currentPageData.length === 0 ? (
                                    <tr>
                                        <td colSpan={7} className="px-6 py-12 text-center text-gray-400">
                                            <div className="flex flex-col items-center justify-center gap-3">
                                                <ShoppingCart size={48} className="opacity-20" />
                                                <p>No items added to quotation.</p>
                                            </div>
                                        </td>
                                    </tr>
                                ) : (
                                    currentPageData.map((item, idx) => (
                                        <tr key={idx} className="hover:bg-gray-50 transition-colors">
                                            <td className="px-6 py-3 text-sm font-medium text-gray-600">{item.productId}</td>
                                            <td className="px-6 py-3 text-sm font-bold text-gray-800">{item.name}</td>
                                            <td className="px-6 py-3 text-sm text-right font-mono text-gray-600">{item.rate.toLocaleString('en-US', { minimumFractionDigits: 2 })}</td>
                                            <td className="px-6 py-3 text-sm text-center font-bold">{item.qty}</td>
                                            <td className="px-6 py-3 text-sm text-right text-red-500 font-mono">
                                                {item.discount > 0 ? `-${item.discount.toLocaleString('en-US', { minimumFractionDigits: 2 })}` : '-'}
                                            </td>
                                            <td className="px-6 py-3 text-sm text-right font-bold text-emerald-600 font-mono">
                                                {item.amount.toLocaleString('en-US', { minimumFractionDigits: 2 })}
                                            </td>
                                            <td className="px-6 py-3 text-center">
                                                <button
                                                    onClick={() => handleRemoveItem(idx)}
                                                    className="p-1.5 bg-red-50 text-red-500 rounded-lg hover:bg-red-100 transition-colors"
                                                >
                                                    <Trash size={16} />
                                                </button>
                                            </td>
                                        </tr>
                                    ))
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>

                {/* Footer Section */}
                <div className="grid md:grid-cols-4 gap-4 mt-auto">
                    {/* Summary Cards */}
                    <div className="bg-linear-to-br from-blue-500 to-blue-600 p-4 rounded-xl text-white shadow-lg shadow-blue-200">
                         <div className="flex items-center gap-3 mb-1">
                             <div className="p-2 bg-white/20 rounded-lg"><Package size={20} /></div>
                             <span className="text-sm font-medium opacity-80">Total Items</span>
                         </div>
                         <p className="text-2xl font-bold">{totalItems}</p>
                    </div>
                     <div className="bg-linear-to-br from-indigo-500 to-indigo-600 p-4 rounded-xl text-white shadow-lg shadow-indigo-200">
                         <div className="flex items-center gap-3 mb-1">
                             <div className="p-2 bg-white/20 rounded-lg"><ShoppingCart size={20} /></div>
                             <span className="text-sm font-medium opacity-80">Total Qty</span>
                         </div>
                         <p className="text-2xl font-bold">{totalQuantity}</p>
                    </div>
                     <div className="bg-linear-to-br from-emerald-500 to-emerald-600 p-4 rounded-xl text-white shadow-lg shadow-emerald-200 md:col-span-2 flex flex-col justify-center">
                         <div className="flex items-center justify-between mb-2 border-b border-white/10 pb-2">
                             <span className="flex items-center gap-2 text-sm font-medium"><DollarSign size={16} /> Total Discount</span>
                             <span className="font-mono font-bold">{totalDiscount.toLocaleString('en-US', { minimumFractionDigits: 2 })}</span>
                         </div>
                         <div className="flex items-center justify-between">
                             <span className="text-lg font-bold uppercase tracking-wide">Net Total</span>
                             <span className="text-3xl font-black tracking-tight">LKR {totalAmount.toLocaleString('en-US', { minimumFractionDigits: 2 })}</span>
                         </div>
                    </div>
                </div>
                
                {/* Actions */}
                <div className="grid grid-cols-4 gap-4 bg-white p-4 rounded-xl border border-gray-200 shadow-sm">
                     <button onClick={handleClear} className="col-span-1 flex items-center justify-center gap-2 py-3 rounded-lg border-2 border-gray-200 font-bold text-gray-500 hover:bg-gray-50 hover:text-red-500 transition-colors">
                        <Trash size={20} /> Clear
                     </button>
                     {/* Placeholder for simple Save button if needed, but we have Save and Save & Print */}
                      <button onClick={() => handleSave(false)} className="col-span-1 flex items-center justify-center gap-2 py-3 rounded-lg bg-emerald-500 hover:bg-emerald-600 text-white font-bold transition-colors shadow-emerald-200 shadow-md">
                        <Save size={20} /> Save
                     </button>
                      <button onClick={() => handleSave(true)} className="col-span-2 flex items-center justify-center gap-2 py-3 rounded-lg bg-linear-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white font-bold transition-all shadow-blue-200 shadow-md text-lg">
                        <Printer size={22} /> Save & Print
                     </button>
                </div>
            </div>
        </>
    );
}

export default CreateQuotation;