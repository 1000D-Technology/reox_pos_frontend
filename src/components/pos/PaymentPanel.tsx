import { Search, UserPlus, X, Check, CreditCard, Banknote, Wallet } from 'lucide-react';
import { useState, useEffect } from 'react';
import { customerService } from '../../services/customerService';

interface Customer {
    id: number;
    name: string;
    contact: string;
    credit: number;
}

interface PaymentMethod {
    id: string;
    label: string;
    icon: any;
}

interface PaymentPanelProps {
    selectedCustomer: Customer | null;
    customerSearchTerm: string;
    onCustomerSearchChange: (term: string) => void;
    onRegisterCustomer: () => void;
    paymentAmounts: Array<{ methodId: string; amount: number }>;
    onPaymentAmountChange: (methodId: string, amount: number) => void;
    totalPaid: number;
    remaining: number;
    total: number;
    cartItemsCount: number;
    onCompletePayment: () => void;
}

const paymentMethods: PaymentMethod[] = [
    { id: 'cash', label: 'Cash', icon: Banknote },
    { id: 'card', label: 'Card', icon: CreditCard },
    { id: 'credit', label: 'Credit', icon: Wallet },
];

export const PaymentPanel = ({
                                 selectedCustomer,
                                 customerSearchTerm,
                                 onCustomerSearchChange,
                                 onRegisterCustomer,
                                 paymentAmounts,
                                 onPaymentAmountChange,
                                 totalPaid,
                                 remaining,
                                 total,
                                 cartItemsCount,
                                 onCompletePayment
                             }: PaymentPanelProps) => {
    const [showCustomerDropdown, setShowCustomerDropdown] = useState(false);
    const [filteredCustomers, setFilteredCustomers] = useState<Customer[]>([]);
    const [localSelectedCustomer, setLocalSelectedCustomer] = useState<Customer | null>(selectedCustomer);

    useEffect(() => {
        setLocalSelectedCustomer(selectedCustomer);
    }, [selectedCustomer]);

    useEffect(() => {
        // Mock customer search - replace with actual API call
        if (customerSearchTerm) {
            // This should be replaced with actual API call
            const mockCustomers: Customer[] = [];
            setFilteredCustomers(mockCustomers);
        } else {
            setFilteredCustomers([]);
        }
    }, [customerSearchTerm]);

    const handleCustomerSearch = (value: string) => {
        onCustomerSearchChange(value);
        setShowCustomerDropdown(value.length > 0);
    };

    const selectCustomer = (customer: Customer) => {
        setLocalSelectedCustomer(customer);
        setShowCustomerDropdown(false);
        onCustomerSearchChange(customer.name);
    };

    const clearCustomer = () => {
        setLocalSelectedCustomer(null);
        onCustomerSearchChange('');
    };
    useEffect(() => {
        const searchCustomers = async () => {
            if (customerSearchTerm.trim().length >= 2) {
                try {
                    const response = await customerService.getCustomers();
                    if (response.data?.success) {
                        const customers = response.data.data;

                        // Filter customers by name or contact
                        const filtered = customers.filter((customer: any) => {
                            const searchLower = customerSearchTerm.toLowerCase();
                            const nameMatch = customer.name.toLowerCase().includes(searchLower);
                            const contactMatch = customer.contact.includes(customerSearchTerm);
                            return nameMatch || contactMatch;
                        }).map((customer: any) => ({
                            id: customer.id,
                            name: customer.name,
                            contact: customer.contact,
                            email: customer.email,
                            credit: customer.credit_balance || 0
                        }));

                        setFilteredCustomers(filtered);
                    }
                } catch (error) {
                    console.error('Failed to search customers:', error);
                    setFilteredCustomers([]);
                }
            } else {
                setFilteredCustomers([]);
            }
        };

        const debounceTimer = setTimeout(searchCustomers, 300);
        return () => clearTimeout(debounceTimer);
    }, [customerSearchTerm]);

    return (
        <div className="col-span-3 space-y-3 flex flex-col overflow-y-auto">
            {/* Customer Search */}
            <div className="bg-white rounded-2xl shadow-lg p-3 relative">
                <div className="flex items-center justify-between mb-1.5">
                    <h3 className="text-xs font-semibold text-gray-600">Customer</h3>
                    <button
                        onClick={onRegisterCustomer}
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
                                    <p className="text-xs text-gray-500">{customer.contact}</p>k
                                    <p className="text-xs text-gray-500">Credit: Rs {customer.credit}</p>
                                </button>
                            ))
                        ) : (
                            <div className="p-3 text-center">
                                <p className="text-sm text-gray-500 mb-2">No customer found</p>
                                <button
                                    onClick={() => {
                                        onRegisterCustomer();
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

                {localSelectedCustomer && (
                    <div className="mt-2 p-2 bg-emerald-50 border-2 border-emerald-200 rounded-lg">
                        <div className="flex items-center justify-between">
                            <div className="flex justify-between w-full">
                                <div>
                                    <p className="text-sm font-semibold text-emerald-800">{localSelectedCustomer.name}</p>
                                    <p className="text-xs text-emerald-600">{localSelectedCustomer.contact}</p>
                                </div>
                                <div className="flex items-center pe-4 flex-col">
                                    <p className="text-xs">Credit Balance</p>
                                    <p className="text-sm text-red-600 font-semibold">Rs {localSelectedCustomer.credit}.00</p>
                                </div>
                            </div>

                            <button
                                onClick={clearCustomer}
                                className="p-1 hover:bg-emerald-100 rounded transition-colors"
                            >
                                <X className="w-4 h-4 text-emerald-600" />
                            </button>
                        </div>
                    </div>
                )}
            </div>

            {/* Payment Methods */}
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
                                        value={amount || ''}
                                        onChange={(e) => {
                                            const newAmount = Number(e.target.value);
                                            onPaymentAmountChange(method.id, newAmount);
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
                onClick={onCompletePayment}
                disabled={cartItemsCount === 0}
                className="w-full py-3 bg-gradient-to-r from-emerald-500 to-emerald-600 text-white rounded-xl font-bold text-base hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed transition-all"
            >
                <div className="flex items-center justify-center gap-2">
                    <Check className="w-5 h-5" />
                    Complete Payment
                </div>
            </button>
        </div>
    );
};
