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
import { ProductAddModal } from '../../components/pos/ProductAddModal';
import type { Product, CartItem, PaymentAmount } from '../../types';
import toast, { Toaster } from 'react-hot-toast';
import { printBill } from '../../utils/billPrinter';

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
        id: item.stockID || item.stock_id || item.productID || item.id,
        name: item.displayName || item.productName || item.name,
        barcode: item.barcode || '',
        price: parseFloat(item.price || item.Price || item.selling_price) || 0,
        wholesalePrice: parseFloat(item.wholesalePrice || item.wsp) || 0,
        stock: parseInt(item.currentStock || item.stockQty || item.stock || item.qty) || 0,
        category: item.unit || item.category || 'Pcs',
        productCode: item.productCode || item.product_id_code || '',
        isBulk: Boolean(item.isBulk) || String(item.unit || '').toLowerCase().includes('kg') || String(item.unit || '').toLowerCase().includes('bag'),
        batch: item.batchName || item.batch || item.batch_name || '',
        expiry: item.expiry || item.exp || null
    };
};


const demoCustomers: Customer[] = [
    { id: 1, name: 'Rajesh Kumar', contact: '0771234567' },
    { id: 2, name: 'Priya Sharma', contact: '0772234567' },
    { id: 3, name: 'Amit Patel', contact: '0773234567' },
    { id: 4, name: 'Sunita Rao', contact: '0774234567' },
    { id: 5, name: 'Vikram Singh', contact: '0775234567' },
];

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
    const [customers, setCustomers] = useState<Customer[]>(demoCustomers);
    const [sessionChecked, setSessionChecked] = useState(false);
    const [showProductAddModal, setShowProductAddModal] = useState(false);
    const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
    const [currentSession, setCurrentSession] = useState<any>(null);
    const [isSubmitting, setIsSubmitting] = useState(false);

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
                toast.error('Failed to load products');
            } finally {
                setProductsLoading(false);
            }
        };
        loadProducts();
    }, []);

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

                const response = await cashSessionService.checkActiveCashSession(userId, counterCode);
                if (response.hasActiveSession) {
                    setCurrentSession(response.session);
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

    useEffect(() => {
        const isAlphanumericSearch = /^[a-zA-Z0-9]+$/.test(searchTerm.trim());

        console.log('=== BARCODE SEARCH DEBUG ===');
        console.log('Search Term:', searchTerm);
        console.log('Is Alphanumeric:', isAlphanumericSearch);
        console.log('Length:', searchTerm.length);

        if (isAlphanumericSearch && searchTerm.length >= 6) {
            const searchBarcode = async () => {
                console.log('🔍 BARCODE SEARCH STARTED');
                const startTime = performance.now();

                try {
                    setBarcodeSearchLoading(true);
                    const response = await posService.searchByBarcode(searchTerm.trim());
                    const endTime = performance.now();
                    const duration = (endTime - startTime).toFixed(2);

                    console.log('✅ API Call Success in', `${duration}ms`);

                    if (response.data?.success && response.data.data) {
                        // Handle both single product and array of products
                        const productsData = Array.isArray(response.data.data)
                            ? response.data.data
                            : [response.data.data];

                        const matchingProducts = productsData.map(mapAPIProductToProduct);

                        console.log(`📦 Found ${matchingProducts.length} product(s) with barcode ${searchTerm}`);

                        if (matchingProducts.length === 1) {
                            // Single product - directly open modal
                            const product = matchingProducts[0];
                            if (product.stock <= 0) {
                                toast.error('Product is out of stock!');
                                setSearchTerm('');
                                return;
                            }
                            handleProductSelect(product);
                            toast.success(`Found: ${product.name}`);
                        } else if (matchingProducts.length > 1) {
                            // Multiple products - show in filtered list
                            setProducts(prevProducts => {
                                const otherProducts = prevProducts.filter(
                                    p => !matchingProducts.some((mp: Product) => mp.id === p.id)
                                );
                                return [...matchingProducts, ...otherProducts];
                            });
                            toast.success(`Found ${matchingProducts.length} products with this barcode`);
                            setBarcodeSearchLoading(false);
                            return; // Don't clear search term - show filtered products
                        }

                        setSearchTerm('');
                    } else {
                        console.warn('❌ Product Not Found');
                        toast.error('Product not found with this barcode');
                        setSearchTerm('');
                    }
                } catch (error: unknown) {
                    console.error('❌ BARCODE SEARCH FAILED');
                    const err = error as { response?: { data?: { message?: string } } };
                    const message = err.response?.data?.message || 'Failed to search barcode';
                    toast.error(message);
                    setSearchTerm('');
                } finally {
                    setBarcodeSearchLoading(false);
                }
            };

            const debounceTimer = setTimeout(searchBarcode, 300);
            return () => clearTimeout(debounceTimer);
        }
    }, [searchTerm]);





    useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            if (e.key === 'F1') {
                e.preventDefault();
                setShowCashModal(true);
            } if (e.key === 'F2') {
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
            <div className="h-screen flex items-center justify-center">
                <div className="text-center">
                    <div className="w-16 h-16 border-4 border-emerald-500 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
                    <p className="text-gray-600 text-lg">Loading...</p>
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
        const itemDiscount = item.discountType === 'percentage'
            ? (itemTotal * item.discount) / 100
            : item.discount;
        return sum + (itemTotal - itemDiscount);
    }, 0);
    const discountAmount = (subtotal * discount) / 100;
    const total = subtotal - discountAmount;
    const itemsCount = cartItems.reduce((sum, item) => sum + item.quantity, 0);

    const totalPaid = paymentAmounts.reduce((sum, p) => sum + p.amount, 0);
    const remaining = total - totalPaid;

    const isAlphanumericSearch = /^[a-zA-Z0-9]+$/.test(searchTerm.trim());
    const filteredProducts = isAlphanumericSearch && searchTerm.length >= 6
        ? []
        : products.filter(p =>
            p.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
            p.productCode.toLowerCase().includes(searchTerm.toLowerCase())
        );

    const handleProductSelect = (product: Product) => {
        setSelectedProduct(product);
        setShowProductAddModal(true);
    };
    // Update the addToCartWithDetails function signature and implementation
    const addToCartWithDetails = (
        product: Product,
        quantity: number,
        discount: number,
        discountType: 'percentage' | 'price',
        discountAmount: number,
        discountedPrice: number
    ) => {
        if (quantity <= 0) {
            toast.error("Quantity must be greater than 0");
            return;
        }

        if (product.stock <= 0) {
            toast.error("Product is out of stock!");
            return;
        }

        if (quantity > product.stock) {
            toast.error("Cannot add more than available stock");
            return;
        }

        setCartItems(prevCart => {
            const existingItem = prevCart.find(item => item.id === product.id);

            if (existingItem) {
                const newQuantity = existingItem.quantity + quantity;
                if (newQuantity > product.stock) {
                    toast.error("Cannot add more than available stock");
                    return prevCart;
                } return prevCart.map(item =>
                    item.id === product.id
                        ? {
                            ...item,
                            quantity: newQuantity,
                            discount,
                            discountType,
                            discountAmount,
                            discountedPrice: discountedPrice * (newQuantity / quantity) // Scale up for increased quantity
                        }
                        : item
                );
            }

            const priceToUse = billingMode === 'wholesale' ? product.wholesalePrice : product.price;
            return [...prevCart, {
                ...product,
                price: priceToUse,
                quantity,
                discount,
                discountType,
                discountAmount,
                discountedPrice,
                isBulk: product.isBulk
            }];
        });

        toast.success(`${product.name} added to cart`);
    };
    const updateQuantity = (id: number, delta: number) => {
        setCartItems(prevItems => {
            return prevItems.map(item => {
                if (item.id === id) {
                    const newQuantity = item.quantity + delta;
                    if (newQuantity < 1) return item;

                    const product = products.find(p => p.id === id);
                    if (product && newQuantity > product.stock) {
                        toast.error("Cannot exceed available stock");
                        return item;
                    }

                    return { ...item, quantity: newQuantity };
                }
                return item;
            });
        });
    };

    const updateCartItem = (
        id: number,
        quantity: number,
        price: number,
        discount: number,
        discountType: 'percentage' | 'price'
    ) => {
        setCartItems(prevItems =>
            prevItems.map(item => {
                if (item.id === id) {
                    const subtotal = price * quantity;
                    const discountAmount = discountType === 'percentage'
                        ? (subtotal * discount) / 100
                        : discount;
                    const discountedPrice = subtotal - discountAmount;

                    return {
                        ...item,
                        quantity,
                        price,
                        discount,
                        discountType,
                        discountAmount,
                        discountedPrice
                    };
                }
                return item;
            })
        );
        toast.success('Cart item updated successfully');
    };
    const updateItemPrice = (id: number, newPrice: number) => {
        setCartItems(cartItems.map(item =>
            item.id === id ? { ...item, price: Math.max(0, newPrice) } : item
        ));
    };

    const updateItemDiscount = (id: number, newDiscount: number) => {
        setCartItems(cartItems.map(item => {
            if (item.id === id) {
                const maxDiscount = item.discountType === 'percentage' ? 100 : item.price * item.quantity;
                return { ...item, discount: Math.max(0, Math.min(maxDiscount, newDiscount)) };
            }
            return item;
        }));
    };

    const removeFromCart = (id: number) => {
        setCartItems(cartItems.filter(item => item.id !== id));
        if (editingItem === id) setEditingItem(null);
    };

    const clearCart = () => {
        setCartItems([]);
        setEditingItem(null);
        setPaymentAmounts([]);
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
        if (!value) setSelectedCustomer(null);
    };

    const handleCustomerSelect = (customer: Customer) => {
        setSelectedCustomer(customer);
        setCustomerSearchTerm(customer.name);
    };

    const registerCustomer = async (name: string, contact: string, email?: string, creditBalance?: number) => {
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
                    contact: customerFromAPI.contact,
                    email: customerFromAPI.email,
                    status_id: customerFromAPI.status_id,
                    status_name: customerFromAPI.status_name
                };

                setCustomers([...customers, newCustomer]);
                setSelectedCustomer(newCustomer);
                setCustomerSearchTerm(name);
                setShowRegistrationModal(false);
                toast.success('Customer registered successfully!');
            }
        } catch (error: any) {
            console.error('Error registering customer:', error);
            const errorMessage = error.response?.data?.message || 'Failed to register customer';
            toast.error(errorMessage);
        }
    };

    const completePayment = () => {
        if (cartItems.length > 0) {
            setShowBillModal(true);
        }
    };
    
    const submitInvoice = async () => {
         try {
            if (isSubmitting) return;

            if (!currentSession) {
                toast.error('No active cash session found. Please restart the POS.');
                return;
            }
            setIsSubmitting(true);
            const sessionId = currentSession.id;
            const userId = currentSession.user_id || authService.getUserId() || 1;
             
            const items = cartItems.map(item => ({
                stock_id: item.id,
                qty: item.quantity,
                price: item.price,
                discount: item.discountType === 'percentage' ? item.discount : 0,
                discountAmount: item.discountType === 'price' ? item.discount : 0,
                quantity: item.quantity
            }));

            const payload = {
                customer_id: selectedCustomer?.id,
                user_id: userId,
                items,
                payment_details: paymentAmounts,
                discount,
                total_amount: total,
                sub_total: subtotal,
                cash_session_id: sessionId
            };
            
            console.log('🚀 SUBMITTING INVOICE:');
            console.log('Payment Amounts:', paymentAmounts);
            console.log('Total:', total);
            console.log('Subtotal:', subtotal);
            console.log('Full Payload:', JSON.stringify(payload, null, 2));
            
            const response = await posService.createInvoice(payload);
            if (response.data?.success) {
                toast.success('Invoice Created!');
                
                // Print the bill
                const invoiceData = response.data.data;
                printBill({
                    invoiceId: invoiceData.id,
                    invoiceNumber: invoiceData.invoice_number,
                    date: new Date(invoiceData.created_at),
                    customer: selectedCustomer,
                    items: cartItems,
                    subtotal: subtotal,
                    discount: discount,
                    total: total,
                    paymentAmounts: paymentAmounts
                });

                closeBillAndReset();
            }
         } catch (error) {
             console.error(error);
             toast.error('Failed to create invoice');
         } finally {
             setIsSubmitting(false);
         }
    }

    const closeBillAndReset = () => {
        setShowBillModal(false);
        clearCart();
        setSelectedCustomer(null);
        setCustomerSearchTerm('');
        setDiscount(0);
    };

    const calculateItemTotal = (item: CartItem) => {
        const itemTotal = item.price * item.quantity;
        const itemDiscount = item.discountType === 'percentage'
            ? (itemTotal * item.discount) / 100
            : item.discount;
        return itemTotal - itemDiscount;
    };

    return (
        <div className="h-full bg-linear-to-br from-gray-50 to-gray-100 p-4 flex flex-col overflow-hidden">
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
                    onAddToCart={handleProductSelect}
                    isNumericSearch={/^\d+$/.test(searchTerm)}
                    filteredProducts={filteredProducts}
                />
                <CartPanel
                    cartItems={cartItems}
                    itemsCount={itemsCount}
                    billingMode={billingMode}
                    onClearCart={clearCart}
                    onRemoveItem={removeFromCart}
                    onUpdateItem={updateCartItem}  // Changed from multiple update functions
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
                />
            </div>

            <ProductAddModal
                isOpen={showProductAddModal}
                onClose={() => {
                    setShowProductAddModal(false);
                    setSelectedProduct(null);
                }}
                product={selectedProduct}
                billingMode={billingMode}
                onAddToCart={addToCartWithDetails}
            />

            <ReturnModal isOpen={showReturnModal} onClose={() => setShowReturnModal(false)} />
            <BillModal
                isOpen={showBillModal}
                onClose={closeBillAndReset}
                cartItems={cartItems}
                customer={selectedCustomer}
                subtotal={subtotal}
                discount={discount}
                total={total}
                paymentAmounts={paymentAmounts}
                onComplete={submitInvoice}
                isProcessing={isSubmitting}
            />
            <CustomerRegistrationModal
                isOpen={showRegistrationModal}
                onClose={() => setShowRegistrationModal(false)}
                onRegister={registerCustomer}
            /><BulkLooseModal isOpen={showBulkLooseModal} onClose={() => setShowBulkLooseModal(false)} />
            <CashManagementModal isOpen={showCashModal} onClose={() => setShowCashModal(false)} />

            <Toaster position="top-right" />
        </div>
    );
};

export default POSInterface;