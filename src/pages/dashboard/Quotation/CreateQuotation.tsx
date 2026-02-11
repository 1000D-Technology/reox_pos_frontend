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
    FileText,
    Loader2
} from 'lucide-react';
import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useParams, useNavigate } from 'react-router-dom';
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

interface CreateQuotationProps {
    quotationId?: string | number;
    onClose?: () => void;
    onSaveSuccess?: () => void;
}

function CreateQuotation({ quotationId, onClose, onSaveSuccess }: CreateQuotationProps) {
    const { id: paramId } = useParams();
    const navigate = useNavigate();
    const activeId = quotationId || paramId;
    const isEdit = !!activeId;
    const isModal = !!onClose;

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
    const [registerLoading, setRegisterLoading] = useState(false);
    const [loading, setLoading] = useState(false);
    const [saveLoading, setSaveLoading] = useState(false);
    const [printLoading, setPrintLoading] = useState(false);
    
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
        // Only load products initially, customers will be searched
        loadProducts();
    }, []);


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

    const loadQuotation = async (qId: string) => {
        try {
            setLoading(true);
            const response = await quotationService.getQuotation(qId);
            if (response.data.success) {
                const q = response.data.data;
                setSelectedCustomer(q.customer);
                setQuotationDate(new Date(q.created_at).toISOString().split('T')[0]);
                setValidUntil(new Date(q.valid_until).toISOString().split('T')[0]);
                setRemarks(q.remarks || '');
                
                const items: QuotationItem[] = q.quotation_items.map((item: any) => {
                    const productCode = item.stock?.product_variations?.product?.product_code || '';
                    const productName = item.stock?.product_variations?.product?.product_name || 'Unknown Item';
                    const vName = [
                        item.stock?.product_variations?.color && item.stock?.product_variations?.color !== 'Default' ? item.stock?.product_variations?.color : null,
                        item.stock?.product_variations?.size && item.stock?.product_variations?.size !== 'Default' ? item.stock?.product_variations?.size : null,
                        item.stock?.product_variations?.storage_capacity && item.stock?.product_variations?.storage_capacity !== 'N/A' ? item.stock?.product_variations?.storage_capacity : null
                    ].filter(Boolean).join(' - ');

                    return {
                        id: item.stock_id,
                        productId: productCode,
                        name: vName ? `${productName} (${vName})` : productName,
                        mrp: item.price,
                        discount: item.discount_amount,
                        discountType: 'price',
                        rate: item.price,
                        qty: item.qty,
                        amount: item.total
                    };
                });
                setQuotationData(items);
            }
        } catch (error) {
            console.error('Failed to load quotation', error);
            toast.error('Failed to load quotation');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        if (activeId) {
            loadQuotation(activeId.toString());
        }
    }, [activeId]);

    const handleCustomerSearch = (query: string) => {
        if (searchTimeout) clearTimeout(searchTimeout);
        
        if (!query.trim()) {
            setCustomers([]);
            return;
        }

        const timeout = setTimeout(async () => {
            try {
                const response = await customerService.searchCustomers(query);
                if (response.data?.success) {
                    setCustomers(response.data.data.map((c: any) => ({
                        value: c.id,
                        label: `${c.name} (${c.contact})`,
                        original: c
                    })));
                } else {
                    setCustomers([]);
                }
            } catch (error) {
                console.error('Customer search failed', error);
            }
        }, 300);
        setSearchTimeout(timeout);
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

        const existingItemIndex = quotationData.findIndex(item => item.id === selectedProduct.stockID);

        if (existingItemIndex !== -1) {
            // Item exists, update quantity and amounts
            const existingItem = quotationData[existingItemIndex];
            const newQty = existingItem.qty + addQty;
            const subtotal = selectedProduct.price * newQty;
            let discountAmount = 0;

            if (discountType === 'percentage') {
                discountAmount = (subtotal * addDiscount) / 100;
            } else {
                discountAmount = addDiscount * newQty;
            }

            const totalAmount = subtotal - discountAmount;
            const netUnitPrice = totalAmount / newQty;

            // Validation: Cannot sell below Wholesale Price
            if (netUnitPrice < selectedProduct.wholesalePrice) {
                toast.error(`Price too low for consolidated item! Min price: LKR ${selectedProduct.wholesalePrice} (WSP)`);
                return;
            }

            const updatedQuotationData = [...quotationData];
            updatedQuotationData[existingItemIndex] = {
                ...existingItem,
                qty: newQty,
                discount: discountAmount,
                discountType: discountType,
                amount: totalAmount > 0 ? totalAmount : 0
            };

            setQuotationData(updatedQuotationData);
            toast.success('Quantity updated');
        } else {
            // New item, add to list
            const subtotal = selectedProduct.price * addQty;
            let discountAmount = 0;

            if (discountType === 'percentage') {
                discountAmount = (subtotal * addDiscount) / 100;
            } else {
                discountAmount = addDiscount * addQty;
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
            toast.success('Item added');
        }
        
        // Reset Item Form
        setSelectedProduct(null);
        setAddQty(1);
        setAddDiscount(0);
        setDiscountType('percentage');
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
        if (onClose) {
            onClose();
        } else if (isEdit) {
            navigate('/quotation/create-quotation');
        }
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
            if (andPrint) setPrintLoading(true);
            else setSaveLoading(true);

            const payload = {
                customer_id: selectedCustomer.id,
                valid_until: validUntil,
                sub_total: subTotalVal, 
                discount: totalDiscount,
                total: totalAmount,
                remarks: remarks,
                items: quotationData.map(item => ({
                    id: item.id, // stockID
                    mrp: item.mrp,
                    discount: item.discount,
                    qty: item.qty,
                    amount: item.amount
                }))
            };

            const response = isEdit 
                ? await quotationService.updateQuotation(activeId!, payload)
                : await quotationService.createQuotation(payload);
            
            if (response.data.success) {
                toast.success(isEdit ? 'Quotation updated successfully!' : 'Quotation saved successfully!');
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
                }

                if (onSaveSuccess) {
                    onSaveSuccess();
                } else {
                    handleClear();
                }
            }
        } catch (error: any) {
            console.error('Save failed:', error);
            toast.error(error.response?.data?.message || 'Failed to save quotation');
        } finally {
            setSaveLoading(false);
            setPrintLoading(false);
        }
    };

    const registerCustomer = async (name: string, contact: string, email?: string) => {
        try {
            setRegisterLoading(true);
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
                // After registration, we add the new customer to the list so they can be selected
                setCustomers([{
                    value: customerFromAPI.id,
                    label: `${customerFromAPI.name} (${customerFromAPI.contact})`,
                    original: newCustomer
                }]);
                setSelectedCustomer(newCustomer);
                setShowRegistrationModal(false);
                toast.success('Customer registered successfully!');
            }
        } catch (error: any) {
            console.error('Error registering customer:', error);
            toast.error(error.response?.data?.message || 'Failed to register customer');
        } finally {
            setRegisterLoading(false);
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
        <div className="relative">
            <Toaster position="top-right" toastOptions={{ duration: 3000 }} />
            
            <AnimatePresence>
                {loading && (
                    <motion.div 
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="absolute inset-0 z-[60] bg-white/60 backdrop-blur-[2px] flex flex-col items-center justify-center gap-4 rounded-2xl"
                    >
                        <div className="relative">
                            <motion.div 
                                animate={{ rotate: 360 }}
                                transition={{ duration: 1.5, repeat: Infinity, ease: "linear" }}
                                className="w-16 h-16 border-4 border-amber-100 border-t-amber-500 rounded-full"
                            />
                            <div className="absolute inset-0 flex items-center justify-center">
                                <Loader2 size={24} className="text-amber-600 animate-pulse" />
                            </div>
                        </div>
                        <div className="flex flex-col items-center">
                            <span className="text-amber-800 font-bold uppercase tracking-widest text-xs">Loading Quotation</span>
                            <span className="text-gray-400 text-[10px] font-medium">Please wait while we fetch the details...</span>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>

            <CustomerRegistrationModal 
                isOpen={showRegistrationModal}
                onClose={() => setShowRegistrationModal(false)}
                onRegister={registerCustomer}
                isLoading={registerLoading}
            />

            <div className={`flex flex-col gap-4 ${isModal ? 'h-[85vh]' : 'h-full'}`}>
                {/* Header Section */}
                {!isModal && (
                    <div className="flex items-center justify-between">
                        <div>
                            <div className="text-sm text-gray-400 flex items-center">
                                <span>Quotation</span>
                                <span className="mx-2">›</span>
                                <span className="text-gray-700 font-medium">{isEdit ? 'Edit' : 'Create'} Quotation</span>
                            </div>
                            <h1 className="text-3xl font-semibold bg-linear-to-r from-gray-800 to-gray-600 bg-clip-text text-transparent">
                                {isEdit ? 'Edit' : 'Create'} Quotation
                            </h1>
                        </div>
        
                        {/* Shortcuts Legend */}
                        <div className="hidden lg:flex items-center gap-3 bg-white p-2 rounded-2xl border border-gray-200 shadow-xl shadow-gray-100/50">
                            {[
                                { key: 'F1', label: 'Product' },
                                { key: 'F2', label: 'Customer' },
                                { key: 'F4', label: 'Save' },
                                { key: 'F9', label: 'Print' },
                                { key: 'Ins', label: 'New Cust' }
                            ].map((s, idx) => (
                                <div key={idx} className="flex items-center gap-2 px-3 py-1.5 bg-gray-50 rounded-xl border border-gray-200 hover:border-emerald-200 transition-colors group">
                                    <span className="text-[10px] font-black text-gray-600 bg-white px-2 py-1 rounded-lg shadow-sm border border-gray-200 group-hover:text-emerald-600 transition-colors">{s.key}</span>
                                    <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">{s.label}</span>
                                </div>
                            ))}
                        </div>
                    </div>
                )}

                {/* Form Section - Mimics ManageInvoice Filter look */}
                <div className="bg-white rounded-2xl p-6 shadow-xl shadow-gray-100/50 border border-gray-200 grid md:grid-cols-4 gap-6 relative overflow-hidden">
                    <div className="absolute top-0 left-0 w-1 h-full bg-emerald-500"></div>
                    
                    {/* Customer Selection */}
                    <div className="md:col-span-2 space-y-1">
                         <div className="flex justify-between items-center mb-1">
                             <label className="text-sm font-medium text-gray-700 flex items-center gap-2">
                                <User size={16} className="text-emerald-500" /> Customer Information
                            </label>
                            <button 
                                onClick={() => setShowRegistrationModal(true)}
                                className="text-xs text-emerald-600 hover:text-emerald-700 font-bold flex items-center gap-1 bg-emerald-50 px-2 py-0.5 rounded-full transition-colors"
                            >
                                <Plus size={12} /> New Customer
                            </button>
                         </div>
                        
                        <div className="relative group">
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
                                 placeholder="Type Name or Number... (F2)"
                                 id="customer-search-input"
                                 onSearch={handleCustomerSearch}
                            />
                        </div>
                    </div>

                    {/* Dates */}
                    <div className="space-y-1">
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
                    <div className="space-y-1">
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

                {/* Product Selection Section */}
                <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
                    <div className="flex items-center justify-between mb-4">
                        <h2 className="text-lg font-semibold text-gray-800 flex items-center gap-2">
                            <Package size={20} className="text-emerald-600" /> Add Products
                        </h2>
                        {selectedProduct && (
                            <div className="flex items-center gap-4 bg-gray-50 px-3 py-1.5 rounded-lg border border-gray-100">
                                <div className="text-right">
                                    <span className="block text-[10px] text-gray-400 font-bold uppercase">Stock</span>
                                    <span className="text-xs font-bold text-gray-700">{selectedProduct.currentStock} {selectedProduct.unit}</span>
                                </div>
                                <div className="w-px h-6 bg-gray-200"></div>
                                <div className="text-right">
                                    <span className="block text-[10px] text-gray-400 font-bold uppercase">Price</span>
                                    <span className="text-xs font-bold text-emerald-600">LKR {selectedProduct.price.toLocaleString()}</span>
                                </div>
                            </div>
                        )}
                    </div>
                    
                    <div className="grid md:grid-cols-12 gap-4 items-end">
                        <div className="md:col-span-5 relative">
                            <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Search Product (F1)</label>
                            <TypeableSelect 
                                options={products}
                                value={selectedProduct ? selectedProduct.stockID : null}
                                onChange={(opt) => {
                                    if (opt) {
                                        const original = (opt as any).original;
                                        setSelectedProduct(original);
                                        setAddQty(1);
                                        setAddDiscount(0);
                                        setDiscountType('percentage');
                                    } else {
                                        setSelectedProduct(null);
                                    }
                                }}
                                placeholder="Scan Barcode or Type Name..."
                                id="product-search-input"
                                onSearch={handleProductSearch}
                            />
                        </div>
                        
                        <div className="md:col-span-2">
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
                             <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Discount</label>
                             <div className="flex group focus-within:shadow-sm transition-all duration-300">
                                <input 
                                    type="number" 
                                    min="0"     
                                    value={addDiscount}
                                    onChange={(e) => setAddDiscount(parseFloat(e.target.value) || 0)}
                                    className="w-full py-2 pl-3 pr-10 rounded-l-lg border-2 border-r-0 border-gray-100 focus:border-emerald-500 outline-none transition-all text-right font-medium"
                                    placeholder="0.00"
                                />
                                <div className="flex border-2 border-l-0 border-gray-100 rounded-r-lg overflow-hidden">
                                    <button
                                        onClick={() => setDiscountType('percentage')}
                                        className={`w-8 flex items-center justify-center transition-all ${discountType === 'percentage' ? 'bg-emerald-500 text-white' : 'bg-gray-50 text-gray-400 hover:bg-gray-100'}`}
                                        title="Percentage (%)"
                                    >
                                        <Percent size={12} />
                                    </button>
                                     <button
                                        onClick={() => setDiscountType('price')}
                                        className={`w-8 flex items-center justify-center transition-all ${discountType === 'price' ? 'bg-blue-500 text-white' : 'bg-gray-50 text-gray-400 hover:bg-gray-100'}`}
                                        title="Fixed Amount (LKR)"
                                    >
                                        <DollarSign size={12} />
                                    </button>
                                </div>
                             </div>
                        </div>

                        <div className="md:col-span-2">
                             <button
                                onClick={handleAddItem}
                                className="w-full bg-emerald-500 hover:bg-emerald-600 text-white font-bold py-2.5 rounded-lg shadow-md hover:shadow-lg transition-all flex items-center justify-center gap-2 active:scale-95"
                             >
                                 <Plus size={18} /> Add Item
                             </button>
                        </div>
                    </div>
                </div>

                {/* Items Table Section */}
                <div className="bg-white rounded-2xl shadow-xl shadow-gray-200/50 border border-gray-200 flex-1 flex flex-col overflow-hidden">
                    <div className="overflow-auto flex-1 scrollbar-thin scrollbar-thumb-gray-200">
                        <table className="min-w-full divide-y divide-gray-200">
                            <thead className="bg-linear-to-r from-gray-800 to-gray-700 sticky top-0 z-10">
                                <tr>
                                    {[
                                        { label: 'Product Code', align: 'text-left' },
                                        { label: 'Description', align: 'text-left' },
                                        { label: 'Rate', align: 'text-right' },
                                        { label: 'Qty', align: 'text-center' },
                                        { label: 'Discount', align: 'text-right' },
                                        { label: 'Amount', align: 'text-right' },
                                        { label: 'Action', align: 'text-center' }
                                    ].map((h, i) => (
                                        <th key={i} className={`px-6 py-4 ${h.align} text-[10px] text-white uppercase tracking-[0.2em] opacity-80`}>
                                            {h.label}
                                        </th>
                                    ))}
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
                                        <tr key={idx} className="hover:bg-emerald-50/30 transition-colors group">
                                            <td className="px-6 py-4 text-sm font-medium text-gray-500">{item.productId}</td>
                                            <td className="px-6 py-4 text-base font-bold text-gray-800 tracking-tight">{item.name}</td>
                                            <td className="px-6 py-4 text-base text-right font-mono text-gray-700">{item.rate.toLocaleString('en-US', { minimumFractionDigits: 2 })}</td>
                                            <td className="px-6 py-4 text-base text-center font-black text-gray-900 border-x border-gray-50 bg-gray-50/30">{item.qty}</td>
                                            <td className="px-6 py-4 text-base text-right text-red-600 font-mono font-bold">
                                                {item.discount > 0 ? `-${item.discount.toLocaleString('en-US', { minimumFractionDigits: 2 })}` : '-'}
                                            </td>
                                            <td className="px-6 py-4 text-lg text-right font-black text-emerald-600 font-mono tracking-tighter bg-emerald-50/20">
                                                {item.amount.toLocaleString('en-US', { minimumFractionDigits: 2 })}
                                            </td>
                                            <td className="px-6 py-4 text-center">
                                                <button
                                                    onClick={() => handleRemoveItem(idx)}
                                                    className="p-2 bg-red-50 text-red-500 rounded-xl hover:bg-red-500 hover:text-white transition-all shadow-sm hover:scale-110 active:scale-95"
                                                >
                                                    <Trash size={18} />
                                                </button>
                                            </td>
                                        </tr>
                                    ))
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>

                {/* Footer Summary - Mimics ManageInvoice Stats Cards */}
                <div className="grid md:grid-cols-4 gap-4">
                    {/* Items Card */}
                    <div className="flex items-center p-5 bg-white rounded-2xl border border-gray-200 shadow-lg shadow-gray-100/50 group hover:border-blue-200 transition-all">
                        <div className="p-3 bg-linear-to-br from-blue-400 to-blue-600 rounded-xl shadow-lg shadow-blue-200/50">
                            <Package size={22} className="text-white" />
                        </div>
                        <div className="w-px h-10 bg-gray-100 mx-4"></div>
                        <div>
                            <span className="block text-[10px] font-black text-gray-400 uppercase tracking-widest">Total Items</span>
                            <span className="text-xl font-black text-gray-700">{totalItems}</span>
                        </div>
                    </div>

                    {/* Quantity Card */}
                    <div className="flex items-center p-5 bg-white rounded-2xl border border-gray-200 shadow-lg shadow-gray-100/50 group hover:border-indigo-200 transition-all">
                        <div className="p-3 bg-linear-to-br from-indigo-400 to-indigo-600 rounded-xl shadow-lg shadow-indigo-200/50">
                            <ShoppingCart size={22} className="text-white" />
                        </div>
                        <div className="w-px h-10 bg-gray-100 mx-4"></div>
                        <div>
                            <span className="block text-[10px] font-black text-gray-400 uppercase tracking-widest">Total Quantity</span>
                            <span className="text-xl font-black text-gray-700">{totalQuantity}</span>
                        </div>
                    </div>

                    {/* Discount Card */}
                    <div className="flex items-center p-5 bg-white rounded-2xl border border-gray-200 shadow-lg shadow-gray-100/50 group hover:border-red-200 transition-all">
                        <div className="p-3 bg-linear-to-br from-red-400 to-red-600 rounded-xl shadow-lg shadow-red-200/50">
                            <DollarSign size={22} className="text-white" />
                        </div>
                        <div className="w-px h-10 bg-gray-100 mx-4"></div>
                        <div>
                            <span className="block text-[10px] font-black text-gray-400 uppercase tracking-widest">Total Discount</span>
                            <span className="text-xl font-black text-red-600">LKR {totalDiscount.toLocaleString('en-US', { minimumFractionDigits: 2 })}</span>
                        </div>
                    </div>

                    {/* Net Total Card - Standout */}
                    <div className="flex items-center p-5 bg-linear-to-br from-emerald-500 to-emerald-700 rounded-2xl border border-emerald-400 shadow-2xl shadow-emerald-200/50 group">
                        <div className="p-3 bg-white/20 rounded-xl">
                            <FileText size={22} className="text-white" />
                        </div>
                        <div className="w-px h-10 bg-white/20 mx-4"></div>
                        <div className="flex-1">
                            <span className="block text-[10px] font-black text-white/60 uppercase tracking-widest">Net Payable Total</span>
                            <span className="text-2xl font-black text-white tabular-nums drop-shadow-md">LKR {totalAmount.toLocaleString('en-US', { minimumFractionDigits: 2 })}</span>
                        </div>
                    </div>
                </div>
                
                {/* Global Actions - Refined Gradients */}
                <div className="flex gap-4 bg-white p-4 rounded-2xl border border-gray-200 shadow-sm">
                     <button onClick={handleClear} className="px-8 flex items-center justify-center gap-2 py-3.5 rounded-xl border-2 border-gray-100 font-black text-gray-400 uppercase tracking-widest hover:bg-red-50 hover:text-red-500 hover:border-red-100 transition-all active:scale-95">
                        <Trash size={18} /> Clear All
                     </button>
                     <div className="flex-1 flex gap-4">
                        <button 
                            onClick={() => handleSave(false)} 
                            disabled={saveLoading || printLoading}
                            className="flex-1 flex items-center justify-center gap-2 py-3.5 rounded-xl bg-linear-to-r from-gray-700 to-gray-800 hover:from-gray-800 hover:to-gray-900 text-white font-black uppercase tracking-widest transition-all shadow-xl shadow-gray-200 active:scale-95 border-b-4 border-gray-950 disabled:opacity-50"
                        >
                            {saveLoading ? (
                                <motion.div
                                    animate={{ rotate: 360 }}
                                    transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                                    className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full"
                                />
                            ) : (
                                <Save size={20} />
                            )}
                            {saveLoading ? 'Saving...' : 'Save Only'}
                        </button>
                        <button 
                            onClick={() => handleSave(true)} 
                            disabled={saveLoading || printLoading}
                            className="flex-[2] flex items-center justify-center gap-3 py-3.5 rounded-xl bg-linear-to-r from-emerald-500 via-emerald-600 to-teal-600 hover:from-emerald-600 hover:via-emerald-700 hover:to-teal-700 text-white font-black uppercase tracking-widest transition-all shadow-2xl shadow-emerald-200 active:scale-95 border-b-4 border-emerald-800 text-xl disabled:opacity-50"
                        >
                            {printLoading ? (
                                <motion.div
                                    animate={{ rotate: 360 }}
                                    transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                                    className="w-6 h-6 border-2 border-white/30 border-t-white rounded-full"
                                />
                            ) : (
                                <Printer size={24} />
                            )}
                            {printLoading ? 'Processing...' : 'Confirm & Print'}
                        </button>
                     </div>
                </div>
            </div>
        </div>
    );
}

export default CreateQuotation;