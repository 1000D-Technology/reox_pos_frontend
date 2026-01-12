import { useState,useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
    Search, Barcode, ShoppingCart, Trash2, Plus, Minus,
    CreditCard, Banknote, Building2,
    DollarSign, Package, Edit3, Percent, FileText, X, Check, UserPlus, Phone, Tag, Printer, Download, RotateCcw,
    ArrowUpDown, BanknoteIcon, ArrowRightLeft, AlertCircle
} from 'lucide-react';
import TypeableSelect from "../../components/TypeableSelect.tsx";

// Update demo products with isBulk property
const demoProducts = [
    { id: 1, name: 'Coca Cola 330ml', barcode: '8901234567890', price: 150, wholesalePrice: 130, stock: 150, category: 'Beverages', isBulk: false },
    { id: 2, name: 'Lays Chips 50g', barcode: '8901234567891', price: 80, wholesalePrice: 70, stock: 200, category: 'Snacks', isBulk: false },
    { id: 3, name: 'Rice 50kg Bag', barcode: '8901234567892', price: 5000, wholesalePrice: 4500, stock: 50, category: 'Grains', isBulk: true },
    { id: 4, name: 'Rice 1kg', barcode: '8901234567893', price: 120, wholesalePrice: 100, stock: 500, category: 'Grains', isBulk: false },
    { id: 5, name: 'Sugar 50kg Bag', barcode: '8901234567894', price: 6000, wholesalePrice: 5500, stock: 30, category: 'Sweeteners', isBulk: true },
    { id: 6, name: 'Sugar 1kg', barcode: '8901234567895', price: 140, wholesalePrice: 120, stock: 400, category: 'Sweeteners', isBulk: false },
    { id: 7, name: 'Flour 50kg Bag', barcode: '8901234567896', price: 4500, wholesalePrice: 4000, stock: 40, category: 'Baking', isBulk: true },
    { id: 8, name: 'Flour 1kg', barcode: '8901234567897', price: 100, wholesalePrice: 85, stock: 600, category: 'Baking', isBulk: false },
];

const demoInvoices = [
    {
        invoiceNo: 'INV001',
        date: '2024-01-15',
        customer: { name: 'Rajesh Kumar', contact: '0771234567' },
        items: [
            { id: 1, name: 'Coca Cola 330ml', barcode: '8901234567890', price: 150, quantity: 2, discount: 0 },
            { id: 2, name: 'Lays Chips 50g', barcode: '8901234567891', price: 80, quantity: 3, discount: 5 },
        ],
        subtotal: 528,
        discount: 10,
        total: 475.20,
        paymentMethods: [{ methodId: 'cash', amount: 475.20 }]
    },
    {
        invoiceNo: 'INV002',
        date: '2024-01-15',
        customer: { name: 'Priya Sharma', contact: '0772234567' },
        items: [
            { id: 3, name: 'Dairy Milk Chocolate', barcode: '8901234567892', price: 200, quantity: 1, discount: 0 },
            { id: 4, name: 'Parle-G Biscuits', barcode: '8901234567893', price: 40, quantity: 5, discount: 0 },
        ],
        subtotal: 400,
        discount: 0,
        total: 400,
        paymentMethods: [{ methodId: 'card', amount: 400 }]
    },
];


const demoCustomers = [
    { id: 1, name: 'Rajesh Kumar', contact: '0771234567',credit:5000 },
    { id: 2, name: 'Priya Sharma', contact: '0772234567',credit:5000 },
    { id: 3, name: 'Amit Patel', contact: '0773234567',credit:5000 },
    { id: 4, name: 'Sunita Rao', contact: '0774234567',credit:5000 },
    { id: 5, name: 'Vikram Singh', contact: '0775234567',credit:5000 },
];

interface CartItem {
    id: number;
    name: string;
    barcode: string;
    price: number;
    wholesalePrice: number;
    quantity: number;
    discount: number;
    stock: number;
    category: string;
}

interface PaymentAmount {
    methodId: string;
    amount: number;
}

interface Customer {
    id: number;
    name: string;
    contact: string;
}
interface ReturnItem extends CartItem {
    returnQuantity: number;
}
interface Product {
    id: number;
    name: string;
    barcode: string;
    price: number;
    wholesalePrice: number;
    stock: number;
    category: string;
    isBulk: boolean;
}

const POSInterface = () => {
    const [billingMode, setBillingMode] = useState<'retail' | 'wholesale'>('retail');
    const [cartItems, setCartItems] = useState<CartItem[]>([]);
    const [searchTerm, setSearchTerm] = useState('');
    const [paymentAmounts, setPaymentAmounts] = useState<PaymentAmount[]>([]);
    const [discount, setDiscount] = useState(0);
    const [selectedCustomer, setSelectedCustomer] = useState<Customer | null>(null);
    const [customerSearchTerm, setCustomerSearchTerm] = useState('');
    const [showCustomerDropdown, setShowCustomerDropdown] = useState(false);
    const [showRegistrationModal, setShowRegistrationModal] = useState(false);
    const [showBillModal, setShowBillModal] = useState(false);
    const [editingItem, setEditingItem] = useState<number | null>(null);
    const [amountGiven, setAmountGiven] = useState(0);


    // Bulk-Loose Conversion States
    const [showBulkLooseModal, setShowBulkLooseModal] = useState(false);

    const [bulkQuantity, setBulkQuantity] = useState(1);
    const [looseQuantity, setLooseQuantity] = useState(50);
    const [isTransferring, setIsTransferring] = useState(false);
    const [transferComplete, setTransferComplete] = useState(false);


// Cash Management States
    const [showCashModal, setShowCashModal] = useState(false);
    const [cashTransactionType, setCashTransactionType] = useState<'give' | 'get'>('give');
    const [cashAmount, setCashAmount] = useState(0);
    const [cashReason, setCashReason] = useState('');

    // Return/Refund States
    const [showReturnModal, setShowReturnModal] = useState(false);
    const [returnInvoiceNo, setReturnInvoiceNo] = useState('');
    const [returnItems, setReturnItems] = useState<ReturnItem[]>([]);
    const [originalInvoice, setOriginalInvoice] = useState<any>(null);
    const [returnSearchTerm, setReturnSearchTerm] = useState('');

    // Registration form state
    const [newCustomerName, setNewCustomerName] = useState('');
    const [newCustomerContact, setNewCustomerContact] = useState('');
    const [customers, setCustomers] = useState<Customer[]>(demoCustomers);

    // F-Key Event Handlers
    useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            // F1 - Cash Management
            if (e.key === 'F1') {
                e.preventDefault();
                setShowCashModal(true);
            }
            // F2 - Bulk-Loose Conversion
            if (e.key === 'F2') {
                e.preventDefault();
                setShowBulkLooseModal(true);
            }
            // F3 - Return
            if (e.key === 'F3') {
                e.preventDefault();
                setShowReturnModal(true);
            }
        };

        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, []);

    // Summary Stats
    const subtotal = cartItems.reduce((sum, item) => {
        const itemTotal = item.price * item.quantity;
        const itemDiscount = (itemTotal * item.discount) / 100;
        return sum + (itemTotal - itemDiscount);
    }, 0);
    const discountAmount = (subtotal * discount) / 100;
    const total = subtotal - discountAmount;
    const itemsCount = cartItems.reduce((sum, item) => sum + item.quantity, 0);

    const totalPaid = paymentAmounts.reduce((sum, p) => sum + p.amount, 0);
    const remaining = total - totalPaid;
    const balanceAmount = amountGiven - total;

    // Return calculations
    const returnSubtotal = returnItems.reduce((sum, item) => {
        const itemTotal = item.price * item.returnQuantity;
        const itemDiscount = (itemTotal * item.discount) / 100;
        return sum + (itemTotal - itemDiscount);
    }, 0);
    const returnTotal = returnSubtotal - (returnSubtotal * (originalInvoice?.discount || 0)) / 100;

    const summaryCards = [
        { label: 'Items', value: itemsCount, icon: Package, color: 'bg-emerald-50', iconColor: 'text-emerald-600', bgGlow: 'hover:bg-emerald-50/50' },
        { label: 'Subtotal', value: `Rs ${subtotal.toFixed(2)}`, icon: ShoppingCart, color: 'bg-emerald-50', iconColor: 'text-emerald-600', bgGlow: 'hover:bg-emerald-50/50' },
        { label: 'Discount', value: `${discount}%`, icon: Percent, color: 'bg-emerald-50', iconColor: 'text-emerald-600', bgGlow: 'hover:bg-emerald-50/50' },
        { label: 'Total', value: `Rs ${total.toFixed(2)}`, icon: DollarSign, color: 'bg-emerald-50', iconColor: 'text-emerald-600', bgGlow: 'hover:bg-emerald-50/50' },
    ];

    const filteredCustomers = customers.filter(c =>
        c.name.toLowerCase().includes(customerSearchTerm.toLowerCase()) ||
        c.contact.includes(customerSearchTerm)
    );

    // Update bulk-loose state for TypeableSelect
    const [selectedBulkProduct, setSelectedBulkProduct] = useState<Product | null>(null);
    const [selectedLooseProduct, setSelectedLooseProduct] = useState<Product | null>(null);

    // Prepare options for TypeableSelect
    const bulkProducts = demoProducts.filter(p => p.isBulk);
    const looseProducts = demoProducts.filter(p => !p.isBulk);

    const bulkProductOptions = bulkProducts.map(p => ({
        value: p.id,
        label: `${p.name} - Rs ${p.price.toFixed(2)} (Stock: ${p.stock})`
    }));

    const looseProductOptions = looseProducts.map(p => ({
        value: p.id,
        label: `${p.name} - Rs ${p.price.toFixed(2)} (Stock: ${p.stock})`
    }));

    // Bulk-Loose Transfer
    const handleBulkLooseTransfer = async () => {
        if (!selectedBulkProduct || !selectedLooseProduct || bulkQuantity <= 0 || looseQuantity <= 0) {
            return;
        }

        setIsTransferring(true);
        await new Promise(resolve => setTimeout(resolve, 2000));

        // Update stock logic here
        console.log({
            from: selectedBulkProduct.name,
            to: selectedLooseProduct.name,
            bulkQty: bulkQuantity,
            looseQty: looseQuantity
        });

        setIsTransferring(false);
        setTransferComplete(true);

        setTimeout(() => {
            setTransferComplete(false);
            setSelectedBulkProduct(null);
            setSelectedLooseProduct(null);
            setBulkQuantity(1);
            setLooseQuantity(50);
        }, 1500);
    };

    // Cash Management
    const handleCashTransaction = () => {
        if (cashAmount > 0 && cashReason.trim()) {
            // Process cash transaction
            console.log({
                type: cashTransactionType,
                amount: cashAmount,
                reason: cashReason,
                timestamp: new Date()
            });

            // Reset and close
            setCashAmount(0);
            setCashReason('');
            setShowCashModal(false);
        }
    };

    const loadInvoice = () => {
        const invoice = demoInvoices.find(inv => inv.invoiceNo === returnInvoiceNo.toUpperCase());
        if (invoice) {
            setOriginalInvoice(invoice);
            setReturnItems(invoice.items.map(item => ({
                ...item,
                wholesalePrice: 0,
                stock: 0,
                category: '',
                returnQuantity: 0
            })));
            setSelectedCustomer(invoice.customer as Customer);
        }
    };

    const updateReturnQuantity = (id: number, quantity: number) => {
        setReturnItems(returnItems.map(item => {
            if (item.id === id) {
                return { ...item, returnQuantity: Math.max(0, Math.min(quantity, item.quantity)) };
            }
            return item;
        }));
    };

    const removeReturnItem = (barcode: string) => {
        const item = returnItems.find(i => i.barcode === barcode);
        if (item && item.returnQuantity > 0) {
            updateReturnQuantity(item.id, item.returnQuantity - 1);
        }
    };

    const completeReturn = () => {
        const itemsToReturn = returnItems.filter(item => item.returnQuantity > 0);
        if (itemsToReturn.length > 0) {
            // Show return invoice
            setShowBillModal(true);
            setShowReturnModal(false);
        }
    };

    const filteredReturnItems = returnItems.filter(item =>
        item.name.toLowerCase().includes(returnSearchTerm.toLowerCase()) ||
        item.barcode.includes(returnSearchTerm)
    );

    const addToCart = (product: typeof demoProducts[0]) => {
        const price = billingMode === 'retail' ? product.price : product.wholesalePrice;
        const existingItem = cartItems.find(item => item.id === product.id);

        if (existingItem) {
            setCartItems(cartItems.map(item =>
                item.id === product.id ? { ...item, quantity: item.quantity + 1 } : item
            ));
        } else {
            setCartItems([...cartItems, {
                ...product,
                quantity: 1,
                price,
                discount: 0
            }]);
        }
    };

    const updateQuantity = (id: number, delta: number) => {
        setCartItems(cartItems.map(item =>
            item.id === id ? { ...item, quantity: Math.max(1, item.quantity + delta) } : item
        ).filter(item => item.quantity > 0));
    };

    const updateItemPrice = (id: number, newPrice: number) => {
        setCartItems(cartItems.map(item =>
            item.id === id ? { ...item, price: Math.max(0, newPrice) } : item
        ));
    };

    const updateItemDiscount = (id: number, newDiscount: number) => {
        setCartItems(cartItems.map(item =>
            item.id === id ? { ...item, discount: Math.max(0, Math.min(100, newDiscount)) } : item
        ));
    };

    const removeFromCart = (id: number) => {
        setCartItems(cartItems.filter(item => item.id !== id));
        if (editingItem === id) setEditingItem(null);
    };

    const clearCart = () => {
        setCartItems([]);
        setEditingItem(null);
        setPaymentAmounts([]);
        setAmountGiven(0);
    };

    const filteredProducts = demoProducts.filter(p =>
        p.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        p.barcode.includes(searchTerm)
    );

    const paymentMethods = [
        { id: 'cash', label: 'Cash', icon: Banknote, color: 'bg-emerald-50 text-emerald-700 border-emerald-200' },
        { id: 'card', label: 'Card', icon: CreditCard, color: 'bg-emerald-50 text-emerald-700 border-emerald-200' },
        { id: 'bank', label: 'Bank', icon: Building2, color: 'bg-emerald-50 text-emerald-700 border-emerald-200' },
    ];

    const addPaymentMethod = (methodId: string) => {
        const existingPayment = paymentAmounts.find(p => p.methodId === methodId);
        if (!existingPayment) {
            setPaymentAmounts([...paymentAmounts, { methodId, amount: 0 }]);
        }
    };

    const updatePaymentAmount = (methodId: string, amount: number) => {
        setPaymentAmounts(paymentAmounts.map(p =>
            p.methodId === methodId ? { ...p, amount: Math.max(0, amount) } : p
        ));
    };

    const removePaymentMethod = (methodId: string) => {
        setPaymentAmounts(paymentAmounts.filter(p => p.methodId !== methodId));
    };

    const selectCustomer = (customer: Customer) => {
        setSelectedCustomer(customer);
        setCustomerSearchTerm(customer.name);
        setShowCustomerDropdown(false);
    };

    const handleCustomerSearch = (value: string) => {
        setCustomerSearchTerm(value);
        setShowCustomerDropdown(true);
        if (!value) {
            setSelectedCustomer(null);
        }
    };

    const registerCustomer = () => {
        if (newCustomerName.trim() && newCustomerContact.trim()) {
            const newCustomer: Customer = {
                id: customers.length + 1,
                name: newCustomerName.trim(),
                contact: newCustomerContact.trim()
            };
            setCustomers([...customers, newCustomer]);
            selectCustomer(newCustomer);
            setShowRegistrationModal(false);
            setNewCustomerName('');
            setNewCustomerContact('');
        }
    };

    const completePayment = () => {
        if (cartItems.length > 0) {
            setShowBillModal(true);
        }
    };

    const closeBillAndReset = () => {
        setShowBillModal(false);
        clearCart();
        setSelectedCustomer(null);
        setCustomerSearchTerm('');
        setDiscount(0);
        setReturnItems([]);
        setOriginalInvoice(null);
        setReturnInvoiceNo('');
    };

    const calculateItemTotal = (item: CartItem) => {
        const itemTotal = item.price * item.quantity;
        const itemDiscount = (itemTotal * item.discount) / 100;
        return itemTotal - itemDiscount;
    };
    return (
        <div className="h-screen bg-gradient-to-br  p-4 flex flex-col overflow-hidden">
            {/* Header */}
            <div className="mb-3 flex items-center justify-between bg-white rounded-2xl shadow-lg p-3">
                <div className="flex items-center gap-3">
                    <div className="p-2.5 bg-gradient-to-br from-emerald-500 to-emerald-600 rounded-xl shadow-md">
                        <ShoppingCart className="w-6 h-6 text-white" />
                    </div>
                    <div>
                        <h1 className="text-xl font-bold text-gray-800">POS Terminal</h1>
                        <p className="text-xs text-gray-500">Fast Billing System</p>
                    </div>
                </div>

                {/* Billing Mode Toggle */}
                <div className="flex items-center gap-2 bg-gray-100 p-1.5 rounded-xl">
                    <button
                        onClick={() => setBillingMode('retail')}
                        className={`px-5 py-2 rounded-lg font-semibold transition-all text-sm ${
                            billingMode === 'retail'
                                ? 'bg-emerald-500 text-white shadow-md'
                                : 'text-gray-600 hover:bg-gray-200'
                        }`}
                    >
                        Retail
                    </button>
                    <button
                        onClick={() => setBillingMode('wholesale')}
                        className={`px-5 py-2 rounded-lg font-semibold transition-all text-sm ${
                            billingMode === 'wholesale'
                                ? 'bg-emerald-500 text-white shadow-md'
                                : 'text-gray-600 hover:bg-gray-200'
                        }`}
                    >
                        Wholesale
                    </button>
                </div>

                <div className="flex items-center gap-2">
                    <button
                        onClick={() => setShowCashModal(true)}
                        className="px-4 py-2.5 bg-cyan-50 hover:bg-cyan-100 rounded-xl transition-colors flex items-center gap-2 text-cyan-700 font-semibold group"
                    >
                        <BanknoteIcon className="w-4 h-4" />
                        Cash Manage
                        <span className="text-xs bg-cyan-200 px-1.5 py-0.5 rounded">F1</span>
                    </button>
                    <button
                        onClick={() => setShowBulkLooseModal(true)}
                        className="px-4 py-2.5 bg-purple-50 hover:bg-purple-100 rounded-xl transition-colors flex items-center gap-2 text-purple-700 font-semibold"
                    >
                        <ArrowUpDown className="w-4 h-4" />
                        Bulk-Loose
                        <span className="text-xs bg-purple-200 px-1.5 py-0.5 rounded">F2</span>
                    </button>
                    <button
                        onClick={() => setShowReturnModal(true)}
                        className="px-4 py-2.5 bg-amber-50 hover:bg-amber-100 rounded-xl transition-colors flex items-center gap-2 text-amber-700 font-semibold"
                    >
                        <RotateCcw className="w-4 h-4" />
                        Return
                        <span className="text-xs bg-amber-200 px-1.5 py-0.5 rounded">F3</span>
                    </button>
                </div>
            </div>

            {/* Summary Cards */}
            <div className="grid grid-cols-4 gap-3 mb-3">
                {summaryCards.map((stat, i) => (
                    <motion.div
                        key={i}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: i * 0.1 }}
                        whileHover={{ scale: 1.05, y: -2 }}
                        className={`flex items-center p-3 space-x-3 transition-all bg-white rounded-2xl shadow-lg hover:shadow-xl ${stat.bgGlow} cursor-pointer group relative overflow-hidden`}
                    >
                        <div className="absolute inset-0 bg-gradient-to-br from-transparent via-emerald-50/50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                        <div className={`p-2.5 rounded-full ${stat.color} shadow-md relative z-10`}>
                            <stat.icon className={`w-5 h-5 ${stat.iconColor}`} />
                        </div>
                        <div className="w-px h-8 bg-gray-200"></div>
                        <div className="relative z-10 flex-1">
                            <p className="text-xs text-gray-500 font-medium">{stat.label}</p>
                            <p className="text-lg font-bold text-gray-800">{stat.value}</p>
                        </div>
                    </motion.div>
                ))}
            </div>


            {/* Main Content Grid */}
            <div className="grid grid-cols-12 gap-3 flex-1 overflow-hidden">
                {/* Left: Product Panel */}
                <div className="col-span-4 bg-white rounded-2xl shadow-lg p-3 flex flex-col overflow-hidden">
                    <div className="relative mb-3">
                        <Search className="absolute left-3 top-3 w-4 h-4 text-gray-400" />
                        <input
                            type="text"
                            placeholder="Search product or scan barcode..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="w-full pl-10 pr-10 py-2.5 text-sm bg-gray-50 border-2 border-gray-200 rounded-xl focus:outline-none focus:border-emerald-500 transition-colors"
                        />
                        <Barcode className="absolute right-3 top-3 w-4 h-4 text-gray-400" />
                    </div>

                    <div className="space-y-2 overflow-y-auto flex-1">
                        {filteredProducts.map((product) => (
                            <motion.div
                                key={product.id}
                                whileHover={{ scale: 1.02 }}
                                whileTap={{ scale: 0.98 }}
                                onClick={() => addToCart(product)}
                                className="p-2.5 bg-gray-50 hover:bg-emerald-50 rounded-xl cursor-pointer transition-all border-2 border-transparent hover:border-emerald-200"
                            >
                                <div className="flex justify-between items-start mb-1">
                                    <div className="flex-1">
                                        <h3 className="font-semibold text-sm text-gray-800">{product.name}</h3>
                                        <p className="text-xs text-gray-500">{product.category}</p>
                                    </div>
                                    <div className="text-right">
                                        <p className="font-bold text-sm text-emerald-600">Rs {product.price}</p>
                                        <p className="text-xs text-gray-500 line-through">Rs {product.wholesalePrice}</p>
                                    </div>
                                </div>
                                <div className="flex justify-between items-center text-xs">
                                    <span className="text-gray-500">{product.barcode}</span>
                                    <span className={`px-2 py-0.5 rounded-full ${
                                        product.stock > 100 ? 'bg-emerald-100 text-emerald-700' : 'bg-orange-100 text-orange-700'
                                    }`}>
                                        Stock: {product.stock}
                                    </span>
                                </div>
                            </motion.div>
                        ))}
                    </div>
                </div>

                {/* Center: Cart */}
                <div className="col-span-5 bg-white rounded-2xl shadow-lg p-3 flex flex-col overflow-hidden">
                    <div className="flex justify-between items-center mb-3">
                        <h2 className="text-lg font-bold text-gray-800">Cart Items ({itemsCount})</h2>
                        <button
                            onClick={clearCart}
                            className="flex items-center gap-1.5 px-3 py-1.5 text-sm bg-red-50 text-red-600 hover:bg-red-100 rounded-xl transition-colors"
                        >
                            <Trash2 className="w-3.5 h-3.5" />
                            Clear
                        </button>
                    </div>

                    <div className="space-y-2 overflow-y-auto flex-1">
                        <AnimatePresence>
                            {cartItems.map((item) => (
                                <motion.div
                                    key={item.id}
                                    initial={{ opacity: 0, x: -20 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    exit={{ opacity: 0, x: 20 }}
                                    className={`p-2.5 rounded-xl border-2 transition-all ${
                                        editingItem === item.id
                                            ? 'bg-emerald-50 border-emerald-300'
                                            : 'bg-gray-50 border-transparent'
                                    }`}
                                >
                                    <div className="flex justify-between items-start mb-2">
                                        <div className="flex-1">
                                            <h3 className="font-semibold text-sm text-gray-800">{item.name}</h3>
                                            <div className="flex items-center gap-2 mt-1">
                                                <span className="text-xs text-gray-500">{item.category}</span>
                                                <Tag className="w-3 h-3 text-emerald-600" />
                                                <span className="text-xs font-medium text-emerald-600">
                                                    Wholesale: Rs {item.wholesalePrice}
                                                </span>
                                            </div>
                                        </div>
                                        <div className="flex gap-1">
                                            <button
                                                onClick={() => setEditingItem(editingItem === item.id ? null : item.id)}
                                                className={`p-1.5 rounded-lg transition-colors ${
                                                    editingItem === item.id
                                                        ? 'bg-emerald-500 text-white'
                                                        : 'bg-emerald-50 text-emerald-600 hover:bg-emerald-100'
                                                }`}
                                            >
                                                <Edit3 className="w-3.5 h-3.5" />
                                            </button>
                                            <button
                                                onClick={() => removeFromCart(item.id)}
                                                className="p-1.5 bg-red-50 text-red-600 hover:bg-red-100 rounded-lg transition-colors"
                                            >
                                                <X className="w-3.5 h-3.5" />
                                            </button>
                                        </div>
                                    </div>

                                    {editingItem === item.id ? (
                                        <div className="grid grid-cols-2 gap-2 mb-2">
                                            <div>
                                                <label className="text-xs text-gray-600 mb-1 block">Price</label>
                                                <input
                                                    type="number"
                                                    value={item.price}
                                                    onChange={(e) => updateItemPrice(item.id, Number(e.target.value))}
                                                    className="w-full px-2 py-1.5 text-sm bg-white border-2 border-emerald-300 rounded-lg focus:outline-none"
                                                />
                                            </div>
                                            <div>
                                                <label className="text-xs text-gray-600 mb-1 block">Discount %</label>
                                                <input
                                                    type="number"
                                                    value={item.discount}
                                                    onChange={(e) => updateItemDiscount(item.id, Number(e.target.value))}
                                                    className="w-full px-2 py-1.5 text-sm bg-white border-2 border-emerald-300 rounded-lg focus:outline-none"
                                                    min="0"
                                                    max="100"
                                                />
                                            </div>
                                        </div>
                                    ) : null}

                                    <div className="flex justify-between items-center">
                                        <div className="flex items-center gap-2 bg-white border-2 border-gray-200 rounded-lg p-1">
                                            <button
                                                onClick={() => updateQuantity(item.id, -1)}
                                                className="p-1 bg-gray-100 hover:bg-emerald-500 hover:text-white rounded transition-colors"
                                            >
                                                <Minus className="w-3.5 h-3.5" />
                                            </button>
                                            <span className="px-3 font-semibold text-sm">{item.quantity}</span>
                                            <button
                                                onClick={() => updateQuantity(item.id, 1)}
                                                className="p-1 bg-gray-100 hover:bg-emerald-500 hover:text-white rounded transition-colors"
                                            >
                                                <Plus className="w-3.5 h-3.5" />
                                            </button>
                                        </div>

                                        <div className="text-right">
                                            {item.discount > 0 && (
                                                <>
                                                    <p className="text-xs text-red-500 line-through">
                                                        Rs {(item.price * item.quantity).toFixed(2)}
                                                    </p>
                                                    <p className="text-xs text-emerald-600 font-medium">
                                                        -{item.discount}% off
                                                    </p>
                                                </>
                                            )}
                                            <p className="font-bold text-sm text-emerald-600">
                                                Rs {calculateItemTotal(item).toFixed(2)}
                                            </p>
                                        </div>
                                    </div>
                                </motion.div>
                            ))}
                        </AnimatePresence>

                        {cartItems.length === 0 && (
                            <div className="flex flex-col items-center justify-center h-full text-gray-400">
                                <ShoppingCart className="w-16 h-16 mb-2" />
                                <p className="text-sm">Cart is empty</p>
                            </div>
                        )}
                    </div>
                </div>

                {/* Right: Payment Panel */}
                <div className="col-span-3 space-y-3 flex flex-col overflow-y-auto">
                    {/* Customer Search */}
                    <div className="bg-white rounded-2xl shadow-lg p-3 relative">
                        <div className="flex items-center justify-between mb-1.5">
                            <h3 className="text-xs font-semibold text-gray-600">Customer</h3>
                            <button
                                onClick={() => setShowRegistrationModal(true)}
                                className="flex items-center gap-1 px-2 py-1 text-xs bg-emerald-50 text-emerald-600 hover:bg-emerald-100 rounded-lg transition-colors"
                            >
                                <UserPlus className="w-3 h-3" />
                                Register
                            </button>
                        </div>
                        <div className="relative">
                            <Search className="absolute left-2.5 top-2.5 w-3.5 h-3.5 text-gray-400" />
                            <input
                                type="text"
                                placeholder="Search customer..."
                                value={customerSearchTerm}
                                onChange={(e) => handleCustomerSearch(e.target.value)}
                                onFocus={() => setShowCustomerDropdown(true)}
                                className="w-full pl-8 pr-2.5 py-2 text-sm bg-gray-50 border-2 border-gray-200 rounded-lg focus:outline-none focus:border-emerald-500"
                            />
                        </div>

                        {/* Customer Dropdown */}
                        {showCustomerDropdown && customerSearchTerm && (
                            <div className="absolute left-3 right-3 top-full mt-1 bg-white border-2 border-gray-200 rounded-xl shadow-lg z-50 max-h-48 overflow-y-auto">
                                {filteredCustomers.length > 0 ? (
                                    filteredCustomers.map((customer) => (
                                        <button
                                            key={customer.id}
                                            onClick={() => selectCustomer(customer)}
                                            className="w-full px-3 py-2 text-left hover:bg-emerald-50 transition-colors border-b border-gray-100 last:border-0"
                                        >
                                            <p className="text-sm font-semibold text-gray-800">{customer.name}</p>
                                            <p className="text-xs text-gray-500">{customer.contact}</p>
                                            <p className="text-xs text-gray-500">{customer.credit}</p>
                                        </button>
                                    ))
                                ) : (
                                    <div className="p-3 text-center">
                                        <p className="text-sm text-gray-500 mb-2">No customer found</p>
                                        <button
                                            onClick={() => {
                                                setShowRegistrationModal(true);
                                                setShowCustomerDropdown(false);
                                            }}
                                            className="text-sm text-emerald-600 hover:text-emerald-700 font-medium"
                                        >
                                            Register New Customer
                                        </button>
                                    </div>
                                )}
                            </div>
                        )}

                        {selectedCustomer && (
                            <div className="mt-2 p-2 bg-emerald-50 border-2 border-emerald-200 rounded-lg">
                                <div className="flex items-center justify-between">
                                    <div className={'flex justify-between w-full'}>
                                       <div>
                                           <p className="text-sm font-semibold text-emerald-800">{selectedCustomer.name}</p>
                                           <p className="text-xs text-emerald-600">{selectedCustomer.contact}</p>
                                       </div>
                                        <div className={'flex items-center pe-4 flex-col'}>
                                            <p className="text-xs ">Credit Balance</p>
                                            <p className="text-sm text-red-600 font-semibold">RS.{selectedCustomer.credit}.00</p>
                                        </div>
                                    </div>

                                    <button
                                        onClick={() => {
                                            setSelectedCustomer(null);
                                            setCustomerSearchTerm('');
                                        }}
                                        className="p-1 hover:bg-emerald-100 rounded transition-colors"
                                    >
                                        <X className="w-4 h-4 text-emerald-600" />
                                    </button>
                                </div>
                            </div>
                        )}
                    </div>


                    {/* Payment Methods - Always Visible */}
                    <div className="bg-white rounded-2xl shadow-lg p-3">
                        <h3 className="text-xs font-semibold text-gray-600 mb-2">Payment Methods</h3>
                        <div className="space-y-2">
                            {paymentMethods.map((method) => {
                                const payment = paymentAmounts.find(p => p.methodId === method.id);
                                const amount = payment?.amount || 0;

                                return (
                                    <div key={method.id} className="flex items-center gap-2">
                                        <div className="flex-1">
                                            <div className="flex items-center gap-2 mb-1">
                                                <method.icon className="w-3.5 h-3.5 text-emerald-600" />
                                                <span className="text-xs font-medium text-gray-700">{method.label}</span>
                                            </div>
                                            <input
                                                type="number"
                                                value={amount}
                                                onChange={(e) => {
                                                    const newAmount = Number(e.target.value);
                                                    if (newAmount > 0) {
                                                        if (payment) {
                                                            updatePaymentAmount(method.id, newAmount);
                                                        } else {
                                                            setPaymentAmounts([...paymentAmounts, { methodId: method.id, amount: newAmount }]);
                                                        }
                                                    } else if (payment) {
                                                        setPaymentAmounts(paymentAmounts.filter(p => p.methodId !== method.id));
                                                    }
                                                }}
                                                placeholder="Enter amount"
                                                className="w-full px-2 py-1.5 text-sm bg-gray-50 border-2 border-gray-200 rounded-lg focus:outline-none focus:border-emerald-500"
                                                min="0"
                                            />
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    </div>

                    {/* Total Summary */}
                    <div className="bg-gradient-to-br from-emerald-600 to-emerald-700 rounded-2xl shadow-lg p-3 text-white">
                        <div className="space-y-1.5">
                            <div className="flex justify-between text-xs">
                                <span>Paid Amount:</span>
                                <span className="font-semibold">Rs {totalPaid.toFixed(2)}</span>
                            </div>
                            <div className="flex justify-between text-xs">
                                <span>Balance:</span>
                                <span className={`font-semibold ${remaining > 0 ? 'text-yellow-300' : 'text-emerald-200'}`}>
                                    Rs {Math.abs(remaining).toFixed(2)}
                                </span>
                            </div>
                            <div className="h-px bg-emerald-400"></div>
                            <div className="flex justify-between text-xl font-bold">
                                <span>Total:</span>
                                <span>Rs {total.toFixed(2)}</span>
                            </div>
                            {remaining < 0 && (
                                <div className="text-xs bg-emerald-500/30 p-2 rounded-lg text-center">
                                    Change: Rs {Math.abs(remaining).toFixed(2)}
                                </div>
                            )}
                        </div>
                    </div>

                    <button
                        onClick={completePayment}
                        disabled={cartItems.length === 0}
                        className="w-full py-3 bg-gradient-to-r from-emerald-500 to-emerald-600 text-white rounded-xl font-bold text-base hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed transition-all"
                    >
                        <div className="flex items-center justify-center gap-2">
                            <Check className="w-5 h-5" />
                            Complete Payment
                        </div>
                    </button>
                </div>
            </div>

            {/* Return/Refund Modal */}
            <AnimatePresence>
                {showReturnModal && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4"
                        onClick={() => setShowReturnModal(false)}
                    >
                        <motion.div
                            initial={{ scale: 0.9, y: 20 }}
                            animate={{ scale: 1, y: 0 }}
                            exit={{ scale: 0.9, y: 20 }}
                            onClick={(e) => e.stopPropagation()}
                            className="bg-white rounded-2xl shadow-2xl w-full max-w-4xl max-h-[90vh] overflow-hidden flex flex-col"
                        >
                            {/* Header */}
                            <div className="p-6 border-b border-gray-200 bg-gradient-to-r from-amber-500 to-amber-600">
                                <div className="flex items-center justify-between">
                                    <div className="flex items-center gap-3">
                                        <div className="p-2 bg-white/20 rounded-lg">
                                            <RotateCcw className="w-6 h-6 text-white" />
                                        </div>
                                        <div>
                                            <h2 className="text-2xl font-bold text-white">Return / Refund</h2>
                                            <p className="text-sm text-white/80">Enter invoice number to process return</p>
                                        </div>
                                    </div>
                                    <button
                                        onClick={() => setShowReturnModal(false)}
                                        className="p-2 hover:bg-white/20 rounded-lg transition-colors"
                                    >
                                        <X className="w-6 h-6 text-white" />
                                    </button>
                                </div>
                            </div>

                            {/* Content */}
                            <div className="flex-1 overflow-y-auto p-6">
                                {/* Invoice Search */}
                                <div className="mb-6">
                                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                                        Invoice Number
                                    </label>
                                    <div className="flex gap-2">
                                        <input
                                            type="text"
                                            value={returnInvoiceNo}
                                            onChange={(e) => setReturnInvoiceNo(e.target.value)}
                                            placeholder="Enter invoice number (e.g., INV001)"
                                            className="flex-1 px-4 py-2.5 border-2 border-gray-200 rounded-xl focus:outline-none focus:border-amber-500"
                                        />
                                        <button
                                            onClick={loadInvoice}
                                            className="px-6 py-2.5 bg-amber-500 text-white rounded-xl font-semibold hover:bg-amber-600 transition-colors"
                                        >
                                            Load
                                        </button>
                                    </div>
                                </div>

                                {/* Original Invoice Details */}
                                {originalInvoice && (
                                    <div className="space-y-4">
                                        {/* Invoice Info */}
                                        <div className="p-4 bg-gray-50 rounded-xl">
                                            <div className="grid grid-cols-3 gap-4">
                                                <div>
                                                    <p className="text-xs text-gray-500">Invoice No</p>
                                                    <p className="font-semibold text-gray-800">{originalInvoice.invoiceNo}</p>
                                                </div>
                                                <div>
                                                    <p className="text-xs text-gray-500">Date</p>
                                                    <p className="font-semibold text-gray-800">{originalInvoice.date}</p>
                                                </div>
                                                <div>
                                                    <p className="text-xs text-gray-500">Customer</p>
                                                    <p className="font-semibold text-gray-800">{originalInvoice.customer.name}</p>
                                                </div>
                                            </div>
                                        </div>

                                        {/* Search Products to Return */}
                                        <div className="relative">
                                            <Search className="absolute left-3 top-3 w-4 h-4 text-gray-400" />
                                            <input
                                                type="text"
                                                value={returnSearchTerm}
                                                onChange={(e) => setReturnSearchTerm(e.target.value)}
                                                placeholder="Search by barcode or product name..."
                                                className="w-full pl-10 pr-10 py-2.5 border-2 border-gray-200 rounded-xl focus:outline-none focus:border-amber-500"
                                            />
                                            <Barcode className="absolute right-3 top-3 w-4 h-4 text-gray-400" />
                                        </div>

                                        {/* Return Items List */}
                                        <div className="space-y-2 max-h-64 overflow-y-auto">
                                            {filteredReturnItems.map((item) => (
                                                <div
                                                    key={item.id}
                                                    className="p-3 bg-white border-2 border-gray-100 rounded-xl hover:border-amber-200 transition-colors"
                                                >
                                                    <div className="flex items-center justify-between mb-2">
                                                        <div className="flex-1">
                                                            <h4 className="font-semibold text-gray-800">{item.name}</h4>
                                                            <p className="text-xs text-gray-500">Barcode: {item.barcode}</p>
                                                            <p className="text-xs text-gray-600 mt-1">
                                                                Original Qty: {item.quantity} | Price: Rs {item.price.toFixed(2)}
                                                                {item.discount > 0 && ` | Discount: ${item.discount}%`}
                                                            </p>
                                                        </div>
                                                        <div className="text-right">
                                                            <p className="text-sm font-semibold text-amber-600">
                                                                Rs {(item.price * (1 - item.discount / 100)).toFixed(2)}
                                                            </p>
                                                        </div>
                                                    </div>
                                                    <div className="flex items-center gap-2">
                                                        <label className="text-xs text-gray-600 font-medium">Return Qty:</label>
                                                        <div className="flex items-center gap-2">
                                                            <button
                                                                onClick={() => updateReturnQuantity(item.id, item.returnQuantity - 1)}
                                                                className="p-1 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors"
                                                            >
                                                                <Minus className="w-3 h-3" />
                                                            </button>
                                                            <input
                                                                type="number"
                                                                value={item.returnQuantity}
                                                                onChange={(e) => updateReturnQuantity(item.id, parseInt(e.target.value) || 0)}
                                                                className="w-16 px-2 py-1 border border-gray-200 rounded-lg text-center text-sm"
                                                                min="0"
                                                                max={item.quantity}
                                                            />
                                                            <button
                                                                onClick={() => updateReturnQuantity(item.id, item.returnQuantity + 1)}
                                                                className="p-1 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors"
                                                            >
                                                                <Plus className="w-3 h-3" />
                                                            </button>
                                                        </div>
                                                        {item.returnQuantity > 0 && (
                                                            <span className="text-xs font-semibold text-amber-600 ml-auto">
                                                                Refund: Rs {(item.price * (1 - item.discount / 100) * item.returnQuantity).toFixed(2)}
                                                            </span>
                                                        )}
                                                    </div>
                                                </div>
                                            ))}
                                        </div>

                                        {/* Return Summary */}
                                        <div className="p-4 bg-gradient-to-br from-amber-50 to-amber-100 rounded-xl border-2 border-amber-200">
                                            <div className="space-y-2">
                                                <div className="flex justify-between items-center">
                                                    <span className="text-sm text-gray-600">Return Subtotal:</span>
                                                    <span className="font-semibold text-gray-800">Rs {returnSubtotal.toFixed(2)}</span>
                                                </div>
                                                {originalInvoice.discount > 0 && (
                                                    <div className="flex justify-between items-center">
                                                        <span className="text-sm text-gray-600">Discount ({originalInvoice.discount}%):</span>
                                                        <span className="font-semibold text-gray-800">
                                                            - Rs {(returnSubtotal * originalInvoice.discount / 100).toFixed(2)}
                                                        </span>
                                                    </div>
                                                )}
                                                <div className="pt-2 border-t-2 border-amber-300 flex justify-between items-center">
                                                    <span className="text-lg font-bold text-gray-800">Total Refund:</span>
                                                    <span className="text-2xl font-bold text-amber-600">Rs {returnTotal.toFixed(2)}</span>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                )}

                                {!originalInvoice && (
                                    <div className="text-center py-12">
                                        <div className="p-4 bg-gray-100 rounded-full inline-block mb-4">
                                            <FileText className="w-12 h-12 text-gray-400" />
                                        </div>
                                        <p className="text-gray-500">Enter invoice number to load details</p>
                                    </div>
                                )}
                            </div>

                            {/* Footer */}
                            {originalInvoice && (
                                <div className="p-6 border-t border-gray-200 bg-gray-50">
                                    <div className="flex gap-3">
                                        <button
                                            onClick={() => setShowReturnModal(false)}
                                            className="flex-1 px-6 py-3 bg-gray-200 text-gray-700 rounded-xl font-semibold hover:bg-gray-300 transition-colors"
                                        >
                                            Cancel
                                        </button>
                                        <button
                                            onClick={completeReturn}
                                            disabled={returnItems.filter(i => i.returnQuantity > 0).length === 0}
                                            className="flex-1 px-6 py-3 bg-gradient-to-r from-amber-500 to-amber-600 text-white rounded-xl font-semibold hover:shadow-lg disabled:opacity-50 disabled:cursor-not-allowed transition-all"
                                        >
                                            <div className="flex items-center justify-center gap-2">
                                                <Printer className="w-5 h-5" />
                                                Process Return
                                            </div>
                                        </button>
                                    </div>
                                </div>
                            )}
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Bill Analysis Modal */}
            <AnimatePresence>
                {showBillModal && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4"
                        onClick={() => setShowBillModal(false)}
                    >
                        <motion.div
                            initial={{ scale: 0.9, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            exit={{ scale: 0.9, opacity: 0 }}
                            onClick={(e) => e.stopPropagation()}
                            className="bg-white rounded-2xl shadow-2xl p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto"
                        >
                            {/* Bill Header */}
                            <div className="flex items-center justify-between mb-6 pb-4 border-b-2 border-gray-200">
                                <div>
                                    <h2 className="text-2xl font-bold text-gray-800">Invoice</h2>
                                    <p className="text-sm text-gray-500">#{Date.now()}</p>
                                </div>
                                <button
                                    onClick={() => setShowBillModal(false)}
                                    className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                                >
                                    <X className="w-6 h-6 text-gray-600" />
                                </button>
                            </div>

                            {/* Customer Info */}
                            {selectedCustomer && (
                                <div className="mb-6 p-4 bg-emerald-50 rounded-xl">
                                    <h3 className="text-sm font-semibold text-gray-600 mb-2">Customer Details</h3>
                                    <p className="text-base font-bold text-gray-800">{selectedCustomer.name}</p>
                                    <p className="text-sm text-gray-600">{selectedCustomer.contact}</p>
                                </div>
                            )}

                            {/* Items List */}
                            <div className="mb-6">
                                <h3 className="text-sm font-semibold text-gray-600 mb-3">Items</h3>
                                <div className="space-y-2">
                                    {cartItems.map((item) => (
                                        <div key={item.id} className="flex justify-between items-start p-3 bg-gray-50 rounded-lg">
                                            <div className="flex-1">
                                                <p className="font-semibold text-gray-800">{item.name}</p>
                                                <p className="text-xs text-gray-500">
                                                    Rs {item.price} × {item.quantity}
                                                    {item.discount > 0 && ` (-${item.discount}%)`}
                                                </p>
                                            </div>
                                            <p className="font-bold text-emerald-600">Rs {calculateItemTotal(item).toFixed(2)}</p>
                                        </div>
                                    ))}
                                </div>
                            </div>

                            {/* Payment Methods */}
                            {paymentAmounts.length > 0 && (
                                <div className="mb-6">
                                    <h3 className="text-sm font-semibold text-gray-600 mb-3">Payment Methods</h3>
                                    <div className="space-y-2">
                                        {paymentAmounts.map((payment) => {
                                            const method = paymentMethods.find(m => m.id === payment.methodId);
                                            return (
                                                <div key={payment.methodId} className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                                                    <div className="flex items-center gap-2">
                                                        {method && <method.icon className="w-4 h-4 text-emerald-600" />}
                                                        <span className="font-medium text-gray-700">{method?.label}</span>
                                                    </div>
                                                    <span className="font-bold text-gray-800">Rs {payment.amount.toFixed(2)}</span>
                                                </div>
                                            );
                                        })}
                                    </div>
                                </div>
                            )}



                            {/* Bill Summary */}
                            <div className="mb-6 p-4 bg-gradient-to-br from-emerald-600 to-emerald-700 rounded-xl text-white">
                                <div className="space-y-2">
                                    <div className="flex justify-between">
                                        <span>Subtotal:</span>
                                        <span className="font-semibold">Rs {subtotal.toFixed(2)}</span>
                                    </div>
                                    {discount > 0 && (
                                        <div className="flex justify-between">
                                            <span>Discount ({discount}%):</span>
                                            <span className="font-semibold">- Rs {discountAmount.toFixed(2)}</span>
                                        </div>
                                    )}
                                    <div className="h-px bg-emerald-400"></div>
                                    <div className="flex justify-between text-xl font-bold">
                                        <span>Total:</span>
                                        <span>Rs {total.toFixed(2)}</span>
                                    </div>
                                    <div className="flex justify-between">
                                        <span>Amount Given:</span>
                                        <span className="font-semibold">Rs {amountGiven.toFixed(2)}</span>
                                    </div>
                                    <div className="h-px bg-emerald-400"></div>
                                    <div className={`flex justify-between text-xl font-bold ${balanceAmount >= 0 ? 'text-emerald-200' : 'text-yellow-300'}`}>
                                        <span>{balanceAmount >= 0 ? 'Change:' : 'Balance Due:'}</span>
                                        <span>Rs {Math.abs(balanceAmount).toFixed(2)}</span>
                                    </div>
                                </div>
                            </div>

                            {/* Action Buttons */}
                            <div className="flex gap-3">
                                <button className="flex-1 flex items-center justify-center gap-2 py-3 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-xl font-semibold transition-colors">
                                    <Printer className="w-4 h-4" />
                                    Print
                                </button>
                                <button className="flex-1 flex items-center justify-center gap-2 py-3 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-xl font-semibold transition-colors">
                                    <Download className="w-4 h-4" />
                                    Download
                                </button>
                                <button
                                    onClick={closeBillAndReset}
                                    className="flex-1 flex items-center justify-center gap-2 py-3 bg-gradient-to-r from-emerald-500 to-emerald-600 text-white rounded-xl font-semibold hover:shadow-lg transition-all"
                                >
                                    <Check className="w-4 h-4" />
                                    Complete
                                </button>
                            </div>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Customer Registration Modal */}
            <AnimatePresence>
                {showRegistrationModal && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4"
                        onClick={() => setShowRegistrationModal(false)}
                    >
                        <motion.div
                            initial={{ scale: 0.9, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            exit={{ scale: 0.9, opacity: 0 }}
                            onClick={(e) => e.stopPropagation()}
                            className="bg-white rounded-2xl shadow-2xl p-6 w-full max-w-md"
                        >
                            <div className="flex items-center justify-between mb-4">
                                <h2 className="text-xl font-bold text-gray-800">Register Customer</h2>
                                <button
                                    onClick={() => setShowRegistrationModal(false)}
                                    className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                                >
                                    <X className="w-5 h-5 text-gray-600" />
                                </button>
                            </div>

                            <div className="space-y-4">
                                <div>
                                    <label className="text-sm font-semibold text-gray-700 mb-1.5 block">
                                        Customer Name <span className="text-red-500">*</span>
                                    </label>
                                    <input
                                        type="text"
                                        placeholder="Enter customer name"
                                        value={newCustomerName}
                                        onChange={(e) => setNewCustomerName(e.target.value)}
                                        className="w-full px-3 py-2.5 bg-gray-50 border-2 border-gray-200 rounded-lg focus:outline-none focus:border-emerald-500 transition-colors"
                                    />
                                </div>

                                <div>
                                    <label className="text-sm font-semibold text-gray-700 mb-1.5 block">
                                        Contact Number <span className="text-red-500">*</span>
                                    </label>
                                    <div className="relative">
                                        <Phone className="absolute left-3 top-3 w-4 h-4 text-gray-400" />
                                        <input
                                            type="tel"
                                            placeholder="Enter contact number"
                                            value={newCustomerContact}
                                            onChange={(e) => setNewCustomerContact(e.target.value)}
                                            className="w-full pl-10 pr-3 py-2.5 bg-gray-50 border-2 border-gray-200 rounded-lg focus:outline-none focus:border-emerald-500 transition-colors"
                                        />
                                    </div>
                                </div>

                                <div className="flex gap-3 pt-2">
                                    <button
                                        onClick={() => {
                                            setShowRegistrationModal(false);
                                            setNewCustomerName('');
                                            setNewCustomerContact('');
                                        }}
                                        className="flex-1 py-2.5 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-xl font-semibold transition-colors"
                                    >
                                        Cancel
                                    </button>
                                    <button
                                        onClick={registerCustomer}
                                        disabled={!newCustomerName.trim() || !newCustomerContact.trim()}
                                        className="flex-1 py-2.5 bg-gradient-to-r from-emerald-500 to-emerald-600 text-white rounded-xl font-semibold hover:shadow-lg disabled:opacity-50 disabled:cursor-not-allowed transition-all"
                                    >
                                        <div className="flex items-center justify-center gap-2">
                                            <UserPlus className="w-4 h-4" />
                                            Register
                                        </div>
                                    </button>
                                </div>
                            </div>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Bulk-Loose Conversion Modal */}
            <AnimatePresence>
                {showBulkLooseModal && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4"
                        onClick={(e) => {
                            if (e.target === e.currentTarget && !isTransferring) {
                                setShowBulkLooseModal(false);
                            }
                        }}
                    >
                        <motion.div
                            initial={{ scale: 0.9, y: 20 }}
                            animate={{ scale: 1, y: 0 }}
                            exit={{ scale: 0.9, y: 20 }}
                            className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto"
                            onClick={(e) => e.stopPropagation()}
                        >
                            {/* Header */}
                            <div className="sticky top-0 bg-gradient-to-r from-purple-600 to-purple-700 text-white p-4 rounded-t-2xl flex items-center justify-between">
                                <div className="flex items-center gap-3">
                                    <ArrowRightLeft className="w-6 h-6" />
                                    <div>
                                        <h2 className="text-xl font-bold">Bulk to Loose Conversion</h2>
                                        <p className="text-sm text-purple-100">Transfer bulk products to loose items</p>
                                    </div>
                                </div>
                                <button
                                    onClick={() => !isTransferring && setShowBulkLooseModal(false)}
                                    className="p-2 hover:bg-purple-500 rounded-lg transition-colors"
                                    disabled={isTransferring}
                                >
                                    <X className="w-5 h-5" />
                                </button>
                            </div>

                            <div className="p-6 space-y-6">
                                {/* Bulk Product Selection */}
                                <div className="space-y-3">
                                    <label className="flex items-center gap-2 text-sm font-semibold text-gray-700">
                                        <Package className="w-4 h-4 text-purple-600" />
                                        Select Bulk Product (Source)
                                    </label>
                                    <TypeableSelect
                                        options={bulkProductOptions}
                                        value={selectedBulkProduct?.id || null}
                                        onChange={(option) => {
                                            if (option) {
                                                const product = bulkProducts.find(p => p.id === option.value);
                                                setSelectedBulkProduct(product || null);
                                            } else {
                                                setSelectedBulkProduct(null);
                                            }
                                        }}
                                        placeholder="Search bulk products..."
                                        disabled={isTransferring}
                                        className="w-full"
                                    />
                                    {selectedBulkProduct && (
                                        <motion.div
                                            initial={{ opacity: 0, y: -10 }}
                                            animate={{ opacity: 1, y: 0 }}
                                            className="p-3 bg-purple-50 border-2 border-purple-200 rounded-lg"
                                        >
                                            <div className="flex items-center justify-between">
                                                <div>
                                                    <p className="font-semibold text-purple-900">{selectedBulkProduct.name}</p>
                                                    <p className="text-sm text-purple-700">Stock: {selectedBulkProduct.stock} units</p>
                                                </div>
                                                <div className="text-right">
                                                    <p className="text-lg font-bold text-purple-900">Rs {selectedBulkProduct.price.toFixed(2)}</p>
                                                    <p className="text-xs text-purple-700">{selectedBulkProduct.category}</p>
                                                </div>
                                            </div>
                                        </motion.div>
                                    )}
                                </div>

                                {/* Bulk Quantity Input */}
                                <div className="space-y-2">
                                    <label className="text-sm font-semibold text-gray-700">Bulk Quantity</label>
                                    <div className="flex items-center gap-2">
                                        <button
                                            onClick={() => setBulkQuantity(Math.max(1, bulkQuantity - 1))}
                                            disabled={isTransferring || !selectedBulkProduct}
                                            className="p-2 bg-purple-100 text-purple-700 rounded-lg hover:bg-purple-200 disabled:opacity-50 disabled:cursor-not-allowed"
                                        >
                                            <Minus className="w-4 h-4" />
                                        </button>
                                        <input
                                            type="number"
                                            value={bulkQuantity}
                                            onChange={(e) => setBulkQuantity(Math.max(1, parseInt(e.target.value) || 1))}
                                            disabled={isTransferring || !selectedBulkProduct}
                                            className="flex-1 px-4 py-2 text-center text-lg font-semibold border-2 border-gray-200 rounded-lg focus:border-purple-400 focus:outline-none disabled:opacity-50"
                                        />
                                        <button
                                            onClick={() => setBulkQuantity(bulkQuantity + 1)}
                                            disabled={isTransferring || !selectedBulkProduct}
                                            className="p-2 bg-purple-100 text-purple-700 rounded-lg hover:bg-purple-200 disabled:opacity-50 disabled:cursor-not-allowed"
                                        >
                                            <Plus className="w-4 h-4" />
                                        </button>
                                    </div>
                                </div>

                                {/* Transfer Animation */}
                                <div className="relative py-6">
                                    <div className="flex items-center justify-center gap-4">
                                        <motion.div
                                            animate={isTransferring ? { x: [0, 60, 0] } : {}}
                                            transition={{ repeat: Infinity, duration: 1 }}
                                            className="text-purple-600"
                                        >
                                            <Package className="w-8 h-8" />
                                        </motion.div>
                                        <ArrowRightLeft className={`w-6 h-6 ${isTransferring ? 'text-purple-600 animate-pulse' : 'text-gray-400'}`} />
                                        <Package className={`w-6 h-6 ${isTransferring ? 'text-emerald-600' : 'text-gray-400'}`} />
                                    </div>
                                    {transferComplete && (
                                        <motion.div
                                            initial={{ scale: 0 }}
                                            animate={{ scale: 1 }}
                                            className="absolute inset-0 flex items-center justify-center"
                                        >
                                            <div className="bg-emerald-100 text-emerald-700 rounded-full p-3">
                                                <Check className="w-8 h-8" />
                                            </div>
                                        </motion.div>
                                    )}
                                </div>

                                {/* Loose Product Selection */}
                                <div className="space-y-3">
                                    <label className="flex items-center gap-2 text-sm font-semibold text-gray-700">
                                        <Package className="w-4 h-4 text-emerald-600" />
                                        Select Loose Product (Destination)
                                    </label>
                                    <TypeableSelect
                                        options={looseProductOptions}
                                        value={selectedLooseProduct?.id || null}
                                        onChange={(option) => {
                                            if (option) {
                                                const product = looseProducts.find(p => p.id === option.value);
                                                setSelectedLooseProduct(product || null);
                                            } else {
                                                setSelectedLooseProduct(null);
                                            }
                                        }}
                                        placeholder="Search loose products..."
                                        disabled={isTransferring}
                                        className="w-full"
                                    />
                                    {selectedLooseProduct && (
                                        <motion.div
                                            initial={{ opacity: 0, y: -10 }}
                                            animate={{ opacity: 1, y: 0 }}
                                            className="p-3 bg-emerald-50 border-2 border-emerald-200 rounded-lg"
                                        >
                                            <div className="flex items-center justify-between">
                                                <div>
                                                    <p className="font-semibold text-emerald-900">{selectedLooseProduct.name}</p>
                                                    <p className="text-sm text-emerald-700">Stock: {selectedLooseProduct.stock} units</p>
                                                </div>
                                                <div className="text-right">
                                                    <p className="text-lg font-bold text-emerald-900">Rs {selectedLooseProduct.price.toFixed(2)}</p>
                                                    <p className="text-xs text-emerald-700">{selectedLooseProduct.category}</p>
                                                </div>
                                            </div>
                                        </motion.div>
                                    )}
                                </div>

                                {/* Loose Quantity Input */}
                                <div className="space-y-2">
                                    <label className="text-sm font-semibold text-gray-700">Loose Quantity (per bulk unit)</label>
                                    <div className="flex items-center gap-2">
                                        <button
                                            onClick={() => setLooseQuantity(Math.max(1, looseQuantity - 1))}
                                            disabled={isTransferring || !selectedLooseProduct}
                                            className="p-2 bg-emerald-100 text-emerald-700 rounded-lg hover:bg-emerald-200 disabled:opacity-50 disabled:cursor-not-allowed"
                                        >
                                            <Minus className="w-4 h-4" />
                                        </button>
                                        <input
                                            type="number"
                                            value={looseQuantity}
                                            onChange={(e) => setLooseQuantity(Math.max(1, parseInt(e.target.value) || 1))}
                                            disabled={isTransferring || !selectedLooseProduct}
                                            className="flex-1 px-4 py-2 text-center text-lg font-semibold border-2 border-gray-200 rounded-lg focus:border-emerald-400 focus:outline-none disabled:opacity-50"
                                        />
                                        <button
                                            onClick={() => setLooseQuantity(looseQuantity + 1)}
                                            disabled={isTransferring || !selectedLooseProduct}
                                            className="p-2 bg-emerald-100 text-emerald-700 rounded-lg hover:bg-emerald-200 disabled:opacity-50 disabled:cursor-not-allowed"
                                        >
                                            <Plus className="w-4 h-4" />
                                        </button>
                                    </div>
                                    <p className="text-sm text-gray-600 text-center">
                                        Total: {bulkQuantity} × {looseQuantity} = <span className="font-bold text-emerald-700">{bulkQuantity * looseQuantity}</span> loose units
                                    </p>
                                </div>

                                {/* Transfer Button */}
                                <button
                                    onClick={handleBulkLooseTransfer}
                                    disabled={!selectedBulkProduct || !selectedLooseProduct || isTransferring || transferComplete}
                                    className="w-full py-3 bg-gradient-to-r from-purple-600 to-emerald-600 text-white font-semibold rounded-xl hover:from-purple-700 hover:to-emerald-700 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                                >
                                    {isTransferring ? (
                                        <>
                                            <motion.div
                                                animate={{ rotate: 360 }}
                                                transition={{ repeat: Infinity, duration: 1, ease: "linear" }}
                                            >
                                                <ArrowRightLeft className="w-5 h-5" />
                                            </motion.div>
                                            Processing Transfer...
                                        </>
                                    ) : transferComplete ? (
                                        <>
                                            <Check className="w-5 h-5" />
                                            Transfer Complete!
                                        </>
                                    ) : (
                                        <>
                                            <ArrowRightLeft className="w-5 h-5" />
                                            Transfer Bulk to Loose
                                        </>
                                    )}
                                </button>
                            </div>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Cash Management Modal */}
            <AnimatePresence>
                {showCashModal && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4"
                        onClick={() => setShowCashModal(false)}
                    >
                        <motion.div
                            initial={{ scale: 0.9, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            exit={{ scale: 0.9, opacity: 0 }}
                            onClick={(e) => e.stopPropagation()}
                            className="bg-white rounded-2xl shadow-2xl w-full max-w-md p-6"
                        >
                            <div className="flex items-center justify-between mb-6">
                                <div className="flex items-center gap-3">
                                    <div className="p-3 bg-cyan-100 rounded-xl">
                                        <BanknoteIcon className="w-6 h-6 text-cyan-600" />
                                    </div>
                                    <div>
                                        <h2 className="text-2xl font-bold text-gray-800">Cash Management</h2>
                                        <p className="text-sm text-gray-500">Record cash transactions</p>
                                    </div>
                                </div>
                                <button
                                    onClick={() => setShowCashModal(false)}
                                    className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                                >
                                    <X className="w-5 h-5" />
                                </button>
                            </div>

                            {/* Transaction Type Toggle */}
                            <div className="flex gap-2 mb-4 bg-gray-100 p-2 rounded-xl">
                                <button
                                    onClick={() => setCashTransactionType('give')}
                                    className={`flex-1 py-3 rounded-lg font-semibold transition-all ${
                                        cashTransactionType === 'give'
                                            ? 'bg-red-500 text-white shadow-md'
                                            : 'text-gray-600 hover:bg-gray-200'
                                    }`}
                                >
                                    Cash Give (Out)
                                </button>
                                <button
                                    onClick={() => setCashTransactionType('get')}
                                    className={`flex-1 py-3 rounded-lg font-semibold transition-all ${
                                        cashTransactionType === 'get'
                                            ? 'bg-green-500 text-white shadow-md'
                                            : 'text-gray-600 hover:bg-gray-200'
                                    }`}
                                >
                                    Cash Get (In)
                                </button>
                            </div>

                            {/* Amount Input */}
                            <div className="mb-4">
                                <label className="block text-sm font-semibold text-gray-700 mb-2">
                                    Amount (Rs)
                                </label>
                                <input
                                    type="number"
                                    min="0"
                                    step="0.01"
                                    value={cashAmount}
                                    onChange={(e) => setCashAmount(Number(e.target.value))}
                                    placeholder="Enter amount"
                                    className="w-full p-3 border-2 border-cyan-200 rounded-xl focus:border-cyan-500 focus:outline-none text-lg"
                                />
                            </div>

                            {/* Reason Input */}
                            <div className="mb-6">
                                <label className="block text-sm font-semibold text-gray-700 mb-2">
                                    Reason
                                </label>
                                <textarea
                                    value={cashReason}
                                    onChange={(e) => setCashReason(e.target.value)}
                                    placeholder="Enter transaction reason..."
                                    rows={3}
                                    className="w-full p-3 border-2 border-cyan-200 rounded-xl focus:border-cyan-500 focus:outline-none resize-none"
                                />
                            </div>

                            {/* Warning for Cash Give */}
                            {cashTransactionType === 'give' && cashAmount > 0 && (
                                <div className="mb-4 p-3 bg-red-50 border-2 border-red-200 rounded-xl flex items-start gap-2">
                                    <AlertCircle className="w-5 h-5 text-red-500 mt-0.5 flex-shrink-0" />
                                    <p className="text-sm text-red-700">
                                        <strong>Warning:</strong> This will reduce your cash balance by Rs {cashAmount.toFixed(2)}
                                    </p>
                                </div>
                            )}

                            {/* Confirm Button */}
                            <button
                                onClick={handleCashTransaction}
                                disabled={cashAmount <= 0 || !cashReason.trim()}
                                className={`w-full py-4 rounded-xl font-bold text-white transition-all disabled:opacity-50 disabled:cursor-not-allowed ${
                                    cashTransactionType === 'give'
                                        ? 'bg-gradient-to-r from-red-500 to-red-600 hover:from-red-600 hover:to-red-700'
                                        : 'bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700'
                                }`}
                            >
                                Confirm {cashTransactionType === 'give' ? 'Cash Out' : 'Cash In'}
                            </button>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
};

export default POSInterface;