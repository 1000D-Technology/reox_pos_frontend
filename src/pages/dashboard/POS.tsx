import { useState, useEffect } from 'react';
import { posService } from '../../services/posService';
import { POSHeader } from '../../components/pos/POSHeader';
import { POSSummaryCards } from '../../components/pos/POSSummaryCards';
import { ProductPanel } from '../../components/pos/ProductPanel';

import { PaymentPanel } from '../../components/pos/PaymentPanel';
import { ReturnModal } from '../../components/pos/ReturnModal';
import { BillModal } from '../../components/pos/BillModal';
import { CustomerRegistrationModal } from '../../components/pos/CustomerRegistrationModal';
import { BulkLooseModal } from '../../components/pos/BulkLooseModal';
import { CashManagementModal } from '../../components/pos/CashManagementModal';
import {CartPanel} from "../../components/pos/CartPanel.tsx";

interface Product {
    id: number;
    name: string;
    barcode: string;
    price: number;
    wholesalePrice: number;
    stock: number;
    category: string;
    productCode: string;
    isBulk: boolean;
    batch?: string;
    expiry?: string | null;
}

interface CartItem extends Product {
    quantity: number;
    discount: number;
}

interface PaymentAmount {
    methodId: string;
    amount: number;
}

interface Customer {
    id: number;
    name: string;
    contact: string;
    credit: number;
}

const mapAPIProductToProduct = (apiData: Record<string, unknown>): Product => {
    return {
        id: (apiData.id as number) || (apiData.stockID as number),
        name: (apiData.name as string) || (apiData.displayName as string),
        barcode: apiData.barcode as string,
        price: Number(apiData.price),
        wholesalePrice: Number(apiData.wholesalePrice || 0),
        stock: Number(apiData.stock),
        category: (apiData.category as string) || (apiData.unit as string) || 'Pcs',
        isBulk: apiData.isBulk === true || String(apiData.unit).toLowerCase().includes('kg'),
        productCode: apiData.productCode as string,
        batch: (apiData.batch as string) || '',
        expiry: (apiData.expiry as string) || null
    };
};

const demoCustomers: Customer[] = [
    { id: 1, name: 'Rajesh Kumar', contact: '0771234567', credit: 5000 },
    { id: 2, name: 'Priya Sharma', contact: '0772234567', credit: 5000 },
    { id: 3, name: 'Amit Patel', contact: '0773234567', credit: 5000 },
    { id: 4, name: 'Sunita Rao', contact: '0774234567', credit: 5000 },
    { id: 5, name: 'Vikram Singh', contact: '0775234567', credit: 5000 },
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

    // Barcode search effect
    useEffect(() => {
        const isNumericSearch = /^\d+$/.test(searchTerm.trim());

        if (isNumericSearch && searchTerm.length > 3) {
            const searchBarcode = async () => {
                try {
                    setBarcodeSearchLoading(true);
                    const response = await posService.searchProductByBarcode(searchTerm);
                    if (response.data?.success && response.data.data) {
                        const product = mapAPIProductToProduct(response.data.data);
                        addToCart(product);
                        setSearchTerm('');
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
            return [...prevCart, {
                ...product,
                price: priceToUse,
                quantity: 1,
                discount: 0
            }];
        });
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

    const handleCustomerSearch = (value: string) => {
        setCustomerSearchTerm(value);
        if (!value) {
            setSelectedCustomer(null);
        }
    };

    const registerCustomer = (name: string, contact: string) => {
        const newCustomer: Customer = {
            id: customers.length + 1,
            name: name.trim(),
            contact: contact.trim(),
            credit: 0
        };
        setCustomers([...customers, newCustomer]);
        setSelectedCustomer(newCustomer);
        setCustomerSearchTerm(name);
        setShowRegistrationModal(false);
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
                    onClearCart={clearCart}
                    onRemoveItem={removeFromCart}
                    onUpdateQuantity={updateQuantity}
                    onUpdatePrice={updateItemPrice}
                    onUpdateDiscount={updateItemDiscount}
                    onEditItem={setEditingItem}
                    calculateItemTotal={calculateItemTotal}
                />
                <PaymentPanel
                    selectedCustomer={selectedCustomer}
                    customerSearchTerm={customerSearchTerm}
                    onCustomerSearchChange={handleCustomerSearch}
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
            />
        </div>
    );
};

export default POSInterface;
