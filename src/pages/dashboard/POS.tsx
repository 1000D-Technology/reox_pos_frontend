import { useState, useEffect } from 'react';
import { posService } from '../../services/posService';
import { customerService } from '../../services/customerService';
import { authService } from '../../services/authService';
import { cashSessionService } from '../../services/cashSessionService';
import { POSHeader } from '../../components/pos/POSHeader';
import { POSSummaryCards } from '../../components/pos/POSSummaryCards';
import { ProductPanel } from '../../components/pos/ProductPanel';
import { PaymentPanel } from '../../components/pos/PaymentPanel';
import { ReturnModal } from '../../components/pos/ReturnModal';
import { BillModal } from '../../components/pos/BillModal';
import { CustomerRegistrationModal } from '../../components/pos/CustomerRegistrationModal';
import { BulkLooseModal } from '../../components/pos/BulkLooseModal';
import { CashManagementModal } from '../../components/pos/CashManagementModal';
import { CartPanel } from "../../components/pos/CartPanel.tsx";
import type { Product, CartItem, PaymentAmount } from '../../types';
import toast, { Toaster } from 'react-hot-toast';

interface Customer {
    id: number;
    name: string;
    contact: string;
    email?: string;
    credit_balance?: number;
    status_id?: number;
    status_name?: string;
}

const mapAPIProductToProduct = (apiData: any): Product => {
    const item = Array.isArray(apiData) ? apiData[0] : apiData;

    return {
        id: item.id || item.stockID,
        name: item.name || item.displayName,
        barcode: item.barcode,
        price: Number(item.price || 0),
        wholesalePrice: Number(item.wholesalePrice || 0),
        stock: Number(item.stock || 0),
        category: item.category || item.unit || 'Pcs',
        productCode: item.productCode || '',
        isBulk: Boolean(item.isBulk) || String(item.unit || '').toLowerCase().includes('kg'),
        batch: item.batch || '',
        expiry: item.expiry || null
    };
};

const POSInterface = () => {
    const [billingMode, setBillingMode] = useState<'retail' | 'wholesale'>('retail');
    const [cartItems, setCartItems] = useState<CartItem[]>([]);
    const [products, setProducts] = useState<Product[]>([]);
    const [productsLoading, setProductsLoading] = useState(true);
    const [barcodeSearchLoading, setBarcodeSearchLoading] = useState(false);
    const [searchTerm, setSearchTerm] = useState('');
    const [paymentAmounts, setPaymentAmounts] = useState<PaymentAmount[]>([]);
    const [discount, setDiscount] = useState(0);
    const [selectedCustomer, setSelectedCustomer] = useState<Customer | null>(null);
    const [customerSearchTerm, setCustomerSearchTerm] = useState('');
    const [showRegistrationModal, setShowRegistrationModal] = useState(false);
    const [showBillModal, setShowBillModal] = useState(false);
    const [editingItem, setEditingItem] = useState<number | null>(null);
    const [showBulkLooseModal, setShowBulkLooseModal] = useState(false);
    const [showCashModal, setShowCashModal] = useState(false);
    const [showReturnModal, setShowReturnModal] = useState(false);
    const [customers, setCustomers] = useState<Customer[]>([]);
    const [customersLoading, setCustomersLoading] = useState(false);

    // Load products from API
    useEffect(() => {
        const loadProducts = async () => {
            try {
                setProductsLoading(true);
                const response = await posService.getPOSProductsList();
                if (response.data?.success && Array.isArray(response.data.data)) {
                    const mappedProducts = response.data.data.map(mapAPIProductToProduct);
                    setProducts(mappedProducts);
                }
            } catch (error) {
                console.error('Failed to load products:', error);
            } finally {
                setProductsLoading(false);
            }
        };
        loadProducts();
    }, []);

    // Load active cash session
    useEffect(() => {
        const checkSession = async () => {
            try {
                const userId = authService.getUserId();
                const counterCode = localStorage.getItem('current_counter');
                const sessionDate = localStorage.getItem('session_date');
                const today = new Date().toISOString().split('T')[0];

                if (sessionDate && sessionDate !== today) {
                    localStorage.removeItem('current_counter');
                    localStorage.removeItem('session_date');
                    setSessionChecked(true);
                    return;
                }

                if (!userId || !counterCode) {
                    setSessionChecked(true);
                    return;
                }

                const { hasActiveSession, session } = await cashSessionService.checkActiveCashSession(
                    userId,
                    counterCode
                );

                if (hasActiveSession && session) {
                    setCurrentCashSessionId(session.id);
                    console.log('Active session found:', session);
                } else {
                    localStorage.removeItem('current_counter');
                    localStorage.removeItem('session_date');
                }
            } catch (error) {
                console.error('Error checking session:', error);
            } finally {
                setSessionChecked(true);
            }
        };

        checkSession();
    }, []);

    // Barcode search effect
    useEffect(() => {
        const isNumericSearch = /^\d+$/.test(searchTerm.trim());

        if (isNumericSearch && searchTerm.length > 3) {
            const searchBarcode = async () => {
                try {
                    setBarcodeSearchLoading(true);
                    const response = await posService.searchByBarcode(searchTerm);

                    const apiResponse = response.data;

                    if (apiResponse?.success && apiResponse.data) {
                        const product = mapAPIProductToProduct(apiResponse.data);
                        if (product.id) {
                            addToCart(product);
                            setSearchTerm('');
                        } else {
                            console.error('Product ID not found in mapped data', product);
                        }
                    }
                } catch (error) {
                    console.error('Barcode search failed:', error);
                } finally {
                    setBarcodeSearchLoading(false);
                }
            };

            const debounceTimer = setTimeout(searchBarcode, 500);
            return () => clearTimeout(debounceTimer);
        }
    }, [searchTerm]);

    // F-Key Event Handlers
    useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            if (e.key === 'F1') {
                e.preventDefault();
                setShowCashModal(true);
            }
            if (e.key === 'F2') {
                e.preventDefault();
                setShowBulkLooseModal(true);
            }
            if (e.key === 'F3') {
                e.preventDefault();
                setShowReturnModal(true);
            }
        };

        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, []);

    if (!sessionChecked) {
        return (
            <div className="h-screen flex items-center justify-center bg-gradient-to-br">
                <div className="text-center">
                    <div className="w-16 h-16 border-4 border-emerald-500 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
                    <p className="text-gray-600 text-lg">Checking session...</p>
                </div>
            </div>
        );
    }

    const updateItemDiscountType = (id: number, type: 'percentage' | 'price') => {
        setCartItems(prevItems =>
            prevItems.map(item =>
                item.id === id ? { ...item, discountType: type } : item
            )
        );
    };

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

    const isNumericSearch = /^\d+$/.test(searchTerm.trim());

    const filteredProducts = isNumericSearch && searchTerm.length > 0
        ? []
        : products.filter(p =>
            p.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
            p.productCode.toLowerCase().includes(searchTerm.toLowerCase())
        );

    const addToCart = (product: Product) => {
        if (product.stock <= 0) {
            alert("This product is out of stock!");
            return;
        }

        setCartItems(prevCart => {
            const existingItem = prevCart.find(item => item.id === product.id);

            if (existingItem) {
                if (existingItem.quantity >= product.stock) {
                    alert("Cannot add more than available stock");
                    return prevCart;
                }
                return prevCart.map(item =>
                    item.id === product.id ? { ...item, quantity: item.quantity + 1 } : item
                );
            }

            const priceToUse = billingMode === 'wholesale' ? product.wholesalePrice : product.price;

            const newItem: CartItem = {
                ...product,
                price: priceToUse,
                quantity: 1,
                discount: 0,
                discountType: 'percentage' as const,
                isBulk: product.isBulk
            };

            return [...prevCart, newItem];
        });
    };

    const updateQuantity = (id: number, delta: number) => {
        setCartItems(prevCartItems => {
            return prevCartItems.map(item => {
                if (item.id === id) {
                    const newQuantity = item.quantity + delta;
                    
                    // Check stock limit when increasing quantity
                    if (delta > 0) {
                        const product = products.find(p => p.id === id);
                        if (product && newQuantity > product.stock) {
                            toast.error(`Cannot add more than ${product.stock} items. Only ${product.stock} in stock.`);
                            return item; // Return unchanged item
                        }
                    }
                    
                    return { ...item, quantity: Math.max(1, newQuantity) };
                }
                return item;
            }).filter(item => item.quantity > 0);
        });
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
        setEditingItem(null);setPaymentAmounts([]);
    };

    const updatePaymentAmount = (methodId: string, amount: number) => {
        const existingPayment = paymentAmounts.find(p => p.methodId === methodId);
        if (existingPayment) {
            setPaymentAmounts(paymentAmounts.map(p =>
                p.methodId === methodId ? { ...p, amount: Math.max(0, amount) } : p
            ));
        } else {
            setPaymentAmounts([...paymentAmounts, { methodId, amount: Math.max(0, amount) }]);
        }
    };

    const handleCustomerSearch = async (value: string) => {
        setCustomerSearchTerm(value);
        if (!value.trim()) {
            setSelectedCustomer(null);
            setCustomers([]);
            return;
        }

        try {
            setCustomersLoading(true);
            const response = await customerService.searchCustomers(value);
            
            if (response.data?.success && Array.isArray(response.data.data)) {
                setCustomers(response.data.data);
            } else {
                setCustomers([]);
            }
        } catch (error) {
            console.error('Customer search failed:', error);
            setCustomers([]);
            toast.error('Failed to search customers');
        } finally {
            setCustomersLoading(false);
        }
    };

    const handleCustomerSelect = (customer: Customer) => {
        setSelectedCustomer(customer);
        setCustomerSearchTerm(customer.name);
        setCustomers([]); // Clear search results after selection
    };

    const registerCustomer = async (name: string, contact: string, email?: string, creditBalance?: number) => {
        try {
            const customerData = {
                name: name.trim(),
                contact: contact.trim(),
                email: email?.trim() || undefined,
                credit_balance: creditBalance || 0
            };

            const response = await customerService.addCustomer(customerData);
            console.log('Customer registration response:', response);

            if (response.data.success) {
                const customerFromAPI = response.data.data;
                const newCustomer: Customer = {
                    id: customerFromAPI.id,
                    name: customerFromAPI.name,
                    contact: customerFromAPI.contact,
                    email: customerFromAPI.email,
                    credit_balance: customerFromAPI.credit_balance,
                    status_id: customerFromAPI.status_id,
                    status_name: customerFromAPI.status_name
                };

                setCustomers([...customers, newCustomer]);
                setSelectedCustomer(newCustomer);
                setCustomerSearchTerm(name);
                setShowRegistrationModal(false);

                toast.success('Customer registered successfully!');
            } else {
                const errorMessage = response.data.message || 'Failed to register customer';
                toast.error(errorMessage);
            }
        } catch (error: unknown) {
            console.error('Error registering customer:', error);
            const errorMessage = error instanceof Error
                ? error.message
                : 'Failed to register customer. Please try again.';
            toast.error(errorMessage);
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
    };

    const calculateItemTotal = (item: CartItem) => {
        const itemTotal = item.price * item.quantity;
        const itemDiscount = (itemTotal * item.discount) / 100;
        return itemTotal - itemDiscount;
    };

    return (
        <div className="h-screen bg-gradient-to-br p-4 flex flex-col overflow-hidden">
            <POSHeader
                billingMode={billingMode}
                onBillingModeChange={setBillingMode}
                onCashManage={() => setShowCashModal(true)}
                onBulkLoose={() => setShowBulkLooseModal(true)}
                onReturn={() => setShowReturnModal(true)}
            />

            <POSSummaryCards
                itemsCount={itemsCount}
                subtotal={subtotal}
                discount={discount}
                total={total}
            />

            <div className="grid grid-cols-12 gap-3 flex-1 overflow-hidden">
                <ProductPanel
                    searchTerm={searchTerm}
                    onSearchChange={setSearchTerm}
                    products={products}
                    productsLoading={productsLoading}
                    barcodeSearchLoading={barcodeSearchLoading}
                    onAddToCart={addToCart}
                    isNumericSearch={isNumericSearch}
                    filteredProducts={filteredProducts}
                />

                <CartPanel
                    cartItems={cartItems}
                    itemsCount={itemsCount}
                    editingItem={editingItem}
                    billingMode={billingMode}
                    onClearCart={clearCart}
                    onRemoveItem={removeFromCart}
                    onUpdateQuantity={updateQuantity}
                    onUpdatePrice={updateItemPrice}
                    onUpdateDiscount={updateItemDiscount}
                    onUpdateDiscountType={updateItemDiscountType}
                    onEditItem={setEditingItem}
                    calculateItemTotal={calculateItemTotal}
                />

                <PaymentPanel
                    selectedCustomer={selectedCustomer}
                    customerSearchTerm={customerSearchTerm}
                    onCustomerSearchChange={handleCustomerSearch}
                    onCustomerSelect={handleCustomerSelect}
                    onRegisterCustomer={() => setShowRegistrationModal(true)}
                    paymentAmounts={paymentAmounts}
                    onPaymentAmountChange={updatePaymentAmount}
                    totalPaid={totalPaid}
                    remaining={remaining}
                    total={total}
                    cartItemsCount={itemsCount}
                    onCompletePayment={completePayment}
                    customers={customers}
                    customersLoading={customersLoading}
                />
            </div>

            <ReturnModal
                isOpen={showReturnModal}
                onClose={() => setShowReturnModal(false)}
            />

            <BillModal
                isOpen={showBillModal}
                onClose={closeBillAndReset}
                cartItems={cartItems}
                customer={selectedCustomer}
                subtotal={subtotal}
                discount={discount}
                total={total}
                paymentAmounts={paymentAmounts}
            />

            <CustomerRegistrationModal
                isOpen={showRegistrationModal}
                onClose={() => setShowRegistrationModal(false)}
                onRegister={registerCustomer}
            />

            <BulkLooseModal
                isOpen={showBulkLooseModal}
                onClose={() => setShowBulkLooseModal(false)}
                products={products}
            />

            <CashManagementModal
                isOpen={showCashModal}
                onClose={() => setShowCashModal(false)}
                cashSessionId={currentCashSessionId}
            /><Toaster
            position="top-right"
            toastOptions={{
                duration: 4000,
                style: {
                    background: '#363636',
                    color: '#fff',
                },
                success: {
                    duration: 3000,
                    style: {
                        background: '#10b981',
                    },
                },
                error: {
                    duration: 4000,
                    style: {
                        background: '#ef4444',
                    },
                },
            }}
        />
        </div>
    );
};

export default POSInterface;