import { useEffect, useState } from "react";
import { Plus, Trash2, ShoppingCart, Package, Calendar, DollarSign, Barcode } from 'lucide-react';
import TypeableSelect from "../../../components/TypeableSelect.tsx";
import { productService } from "../../../services/productService.ts";
import { supplierService } from "../../../services/supplierService.ts";
import { paymentTypeService } from "../../../services/paymentTypeService.ts";
import { grnService } from "../../../services/grnService.ts";
import toast, { Toaster } from 'react-hot-toast';
import BarcodePrintModal from "../../../components/modals/BarcodePrintModal";

function CreateGrn() {
    type SelectOption = {
        value: string;
        label: string;
        companyName?: string;
    };

    type GrnItem = {
        productName: string;
        productVariant: string;
        variantId: string;
        barcode: string;
        batch: string;
        mfd: string;
        exp: string;
        cost: string;
        mrp: string;
        rsp: string;
        wsp: string;
        qty: string;
        free: string;
    };

    const [grnData, setGrnData] = useState<GrnItem[]>([]);
    const [selectedIndex, setSelectedIndex] = useState(0);

    // Separate states for different selections
    const [selectedSupplier, setSelectedSupplier] = useState<SelectOption | null>(null);
    const [selectedProduct, setSelectedProduct] = useState<SelectOption | null>(null);
    const [selectedVariant, setSelectedVariant] = useState<SelectOption | null>(null);

    // Data states
    const [products, setProducts] = useState<SelectOption[]>([]);
    const [suppliers, setSuppliers] = useState<SelectOption[]>([]);
    const [productVariants, setProductVariants] = useState<SelectOption[]>([]);
    const [paymentTypes, setPaymentTypes] = useState<SelectOption[]>([]);
    const [isLoadingProducts, setIsLoadingProducts] = useState(false);
    const [isLoadingSuppliers, setIsLoadingSuppliers] = useState(false);
    const [isLoadingVariants, setIsLoadingVariants] = useState(false);
    const [isLoadingPaymentTypes, setIsLoadingPaymentTypes] = useState(false);

    // Additional select options
    const [selectedPaymentType, setSelectedPaymentType] = useState<SelectOption | null>(null);
    const [billNumber, setBillNumber] = useState<string>('');
    const [batchNumber, setBatchNumber] = useState<string>('');

    // Form fields state
    const [barcode, setBarcode] = useState<string>('');
    const [mfDate, setMfDate] = useState<string>('');
    const [exDate, setExDate] = useState<string>('');
    const [costPrice, setCostPrice] = useState<string>('');
    const [mrp, setMrp] = useState<string>('');
    const [rsp, setRsp] = useState<string>('');
    const [wsp, setWsp] = useState<string>('');
    const [qty, setQty] = useState<string>('');
    const [freeQty, setFreeQty] = useState<string>('');
    const [paidAmount, setPaidAmount] = useState<string>('');
    const [formKey, setFormKey] = useState<number>(0);

    // Barcode Modal State
    const [isBarcodeModalOpen, setIsBarcodeModalOpen] = useState(false);
    // Use the updated Product interface structure from BarcodePrintModal
    const [productToPrint, setProductToPrint] = useState<{
        productID: number;
        productName: string;
        productCode: string;
        barcode: string;
        price?: number;
    } | null>(null);

    // Generate bill number
    const generateBillNumber = (): string => {
        const randomNum = Math.floor(Math.random() * 90000000) + 10000000;
        return `BILL-${randomNum}`;
    };

    // Generate batch number based on supplier company name and current date
    const generateBatchNumber = (companyName: string): string => {
        const now = new Date();
        const year = now.getFullYear();
        const monthNames = ['JAN', 'FEB', 'MAR', 'APR', 'MAY', 'JUN',
            'JUL', 'AUG', 'SEP', 'OCT', 'NOV', 'DEC'];
        const month = monthNames[now.getMonth()];
        const date = String(now.getDate()).padStart(2, '0');

        const cleanCompanyName = companyName.replace(/[^a-zA-Z0-9]/g, '').toUpperCase().substring(0, 8);

        return `${date}${month}${year}-${cleanCompanyName}`;
    };

    const generateBarcode = (): string => {
        let barcode = '';
        for (let i = 0; i < 12; i++) {
            barcode += Math.floor(Math.random() * 10);
        }

        let sum = 0;
        for (let i = 0; i < 12; i++) {
            const digit = parseInt(barcode[i]);
            sum += (i % 2 === 0) ? digit : digit * 3;
        }
        const checkDigit = (10 - (sum % 10)) % 10;

        return barcode + checkDigit;
    };

    // Add item to GRN
    const addToGrn = () => {
        try {
            if (!selectedProduct) {
                toast.error('Please select a product');
                return;
            }
            if (!selectedVariant) {
                toast.error('Please select a product variant');
                return;
            }
            if (!costPrice || parseFloat(costPrice) <= 0) {
                toast.error('Please enter a valid cost price');
                return;
            }
            if (!mrp || parseFloat(mrp) <= 0) {
                toast.error('Please enter a valid MRP');
                return;
            }
            if (!rsp || parseFloat(rsp) <= 0) {
                toast.error('Please enter a valid retail selling price');
                return;
            }
            if (!qty || parseInt(qty) <= 0) {
                toast.error('Please enter a valid quantity');
                return;
            }

            const finalBarcode = barcode.trim() || generateBarcode();

            const newItem = {
                productName: selectedProduct.label,
                productVariant: selectedVariant.label,
                variantId: selectedVariant.value,
                barcode: finalBarcode,
                batch: batchNumber,
                mfd: mfDate,
                exp: exDate,
                cost: parseFloat(costPrice).toFixed(2),
                mrp: parseFloat(mrp).toFixed(2),
                rsp: parseFloat(rsp).toFixed(2),
                wsp: wsp ? parseFloat(wsp).toFixed(2) : '0.00',
                qty: qty,
                free: freeQty || '0',
            };

            setGrnData(prevData => [...prevData, newItem]);
            clearForm();
            toast.success('Item added to GRN successfully');
        } catch (error) {
            toast.error('An error occurred while adding item to GRN');
        }
    };

    // Clear form fields
    const clearForm = () => {
        setSelectedProduct(null);
        setSelectedVariant(null);
        setBarcode('');
        setMfDate('');
        setExDate('');
        setCostPrice('');
        setMrp('');
        setRsp('');
        setWsp('');
        setQty('');
        setFreeQty('');
        setFormKey(prev => prev + 1);
    };

    // Remove item from GRN
    const removeItem = (index: number) => {
        setGrnData(prevData => prevData.filter((_, i) => i !== index));
        if (index === selectedIndex && grnData.length > 1) {
            setSelectedIndex(prev => prev > 0 ? prev - 1 : 0);
        } else if (index < selectedIndex) {
            setSelectedIndex(prev => prev - 1);
        } else if (grnData.length === 1) {
            setSelectedIndex(0);
        }
        toast.success('Item removed from GRN');
    };

    // Fetch all initial data using Promise.all
    const fetchInitialData = async () => {
        setIsLoadingProducts(true);
        setIsLoadingSuppliers(true);
        setIsLoadingPaymentTypes(true);

        try {
            const [productsResponse, suppliersResponse, paymentTypesResponse] = await Promise.all([
                productService.getProductsForDropdown(),
                supplierService.getSuppliers(),
                paymentTypeService.getPaymentType()
            ]);

            // Handle products response
            if (productsResponse.data.success && productsResponse.data.data) {
                const productOptions = productsResponse.data.data
                    .filter((product: any) => product && product.id && product.product_name)
                    .map((product: any) => ({
                        value: product.id.toString(),
                        label: product.product_name
                    }));
                setProducts(productOptions);
            } else {
                console.error('Invalid products response structure:', productsResponse.data);
                toast.error('Invalid response from products server');
            }

            // Handle suppliers response
            if (suppliersResponse.data.success) {
                const supplierOptions = suppliersResponse.data.data.map((supplier: any) => ({
                    value: supplier.id.toString(),
                    label: supplier.companyName
                        ? `${supplier.supplierName} - ${supplier.companyName}`
                        : supplier.supplierName,
                    companyName: supplier.companyName
                }));
                setSuppliers(supplierOptions);
            }

            // Handle payment types response
            if (paymentTypesResponse.data && paymentTypesResponse.data.success) {
                const paymentOptions = paymentTypesResponse.data.data
                    .filter((paymentType: any) => paymentType && paymentType.id && paymentType.payment_types)
                    .map((paymentType: any) => ({
                        value: paymentType.id.toString(),
                        label: paymentType.payment_types
                    }));
                setPaymentTypes(paymentOptions);
            } else {
                toast.error('Invalid response from payment types API');
            }

        } catch (error) {
            console.error('Error fetching initial data:', error);
            toast.error('Failed to load initial data');
        } finally {
            setIsLoadingProducts(false);
            setIsLoadingSuppliers(false);
            setIsLoadingPaymentTypes(false);
        }
    };

    // Fetch product variants based on selected product
    const fetchProductVariants = async (productId: string) => {
        setIsLoadingVariants(true);
        try {
            const response = await productService.getProductVariants(parseInt(productId));
            if (response.data.success) {
                const variantOptions = response.data.data.map((variant: any) => ({
                    value: variant.id.toString(),
                    label: `${variant.variant_name} - ${variant.size || 'N/A'}`
                }));
                setProductVariants(variantOptions);

                if (variantOptions.length > 0) {
                    setSelectedVariant({
                        value: variantOptions[0].value,
                        label: variantOptions[0].label,
                    });
                }
            }
        } catch (error) {
            console.error('Error fetching product variants:', error);
            toast.error('Failed to load product variants');
            setProductVariants([]);
        } finally {
            setIsLoadingVariants(false);
        }
    };

    // Create GRN function
    const createGrn = async () => {
        try {
            if (!selectedSupplier) {
                toast.error('Please select a supplier');
                return;
            }
            if (!selectedPaymentType) {
                toast.error('Please select a payment type');
                return;
            }
            if (grnData.length === 0) {
                toast.error('Please add at least one item to the GRN');
                return;
            }
            if (!paidAmount || parseFloat(paidAmount) < 0) {
                toast.error('Please enter a valid paid amount');
                return;
            }

            const grnPayload = {
                billNumber: billNumber,
                supplierId: parseInt(selectedSupplier.value),
                grandTotal: totalCost,
                paidAmount: parseFloat(paidAmount),
                balance: balance,
                paymentMethodId: parseInt(selectedPaymentType.value),
                items: grnData.map(item => ({
                    variantId: parseInt(item.variantId),
                    barcode: item.barcode,
                    batchIdentifier: item.batch,
                    mfd: item.mfd || null,
                    exp: item.exp || null,
                    costPrice: parseFloat(item.cost),
                    mrp: parseFloat(item.mrp),
                    rsp: parseFloat(item.rsp),
                    wsp: parseFloat(item.wsp),
                    qty: parseInt(item.qty),
                    freeQty: parseInt(item.free)
                }))
            };

            const response = await grnService.createGRN(grnPayload);

            if (response.data.success) {
                toast.success(`GRN created successfully! GRN ID: ${response.data.grnId}`);

                setGrnData([]);
                setSelectedSupplier(null);
                setSelectedPaymentType(null);
                setPaidAmount('');
                setBillNumber(generateBillNumber());
                clearForm();
            } else {
                toast.error(response.data.message || 'Failed to create GRN');
            }
        } catch (error: any) {
            console.error('Error creating GRN:', error);

            // Handle validation errors (400 status)
            if (error.response && error.response.status === 400) {
                const errorMessage = error.response.data?.message || 'Validation failed. Please check your input.';
                toast.error(errorMessage);
            } else if (error.response && error.response.data?.message) {
                // Handle other API errors
                toast.error(error.response.data.message);
            } else {
                // Handle network errors or other issues
                toast.error('Failed to create GRN. Please check your connection and try again.');
            }
        }
    };

    // Load initial data
    useEffect(() => {
        fetchInitialData();
        setBillNumber(generateBillNumber()); // Generate bill number on component mount
    }, []);

    // Load variants when product changes
    useEffect(() => {
        if (selectedProduct) {
            setSelectedVariant(null);
            fetchProductVariants(selectedProduct.value);
        } else {
            setProductVariants([]);
            setSelectedVariant(null);
        }
    }, [selectedProduct]);

    // Generate batch number when supplier changes
    useEffect(() => {
        if (selectedSupplier) {
            let companyName = selectedSupplier.companyName;

            if (!companyName && selectedSupplier.label.includes(' - ')) {
                companyName = selectedSupplier.label.split(' - ')[1];
            } else if (!companyName) {
                companyName = selectedSupplier.label;
            }

            setBatchNumber(generateBatchNumber(companyName));
        } else {
            setBatchNumber('');
        }
    }, [selectedSupplier]);

    // Handle Up / Down arrow keys
    useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            if (e.key === "ArrowDown") {
                setSelectedIndex((prev) =>
                    prev < grnData.length - 1 ? prev + 1 : prev
                );
            } else if (e.key === "ArrowUp") {
                setSelectedIndex((prev) => (prev > 0 ? prev - 1 : prev));
            } else if (e.key === "Enter") {
                e.preventDefault();
                addToGrn();
            } else if (e.key === "Enter" && e.shiftKey) {
                e.preventDefault();
                createGrn();
            }
        };

        window.addEventListener("keydown", handleKeyDown);
        return () => window.removeEventListener("keydown", handleKeyDown);
    }, [grnData.length, selectedProduct, selectedVariant, costPrice, mrp, rsp, qty]);

    // Calculate totals
    const totalItems = grnData.length;
    const totalQuantity = grnData.reduce((sum, item) => sum + parseInt(item.qty || '0'), 0);
    const totalCost = grnData.reduce((sum, item) => sum + parseFloat(item.cost || '0') * parseInt(item.qty || '0'), 0);
    const paidAmountNum = parseFloat(paidAmount || '0');
    const balance = totalCost - paidAmountNum;

    return (
        <>
            <Toaster
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

            <BarcodePrintModal
                isOpen={isBarcodeModalOpen}
                onClose={() => setIsBarcodeModalOpen(false)}
                product={productToPrint}
            />

            <div className={'flex flex-col gap-4 h-full'}>
                <div>
                    <div className="text-sm text-gray-400 flex items-center">
                        <span>GRN</span>
                        <span className="mx-2">›</span>
                        <span className="text-gray-700 font-medium">Create GRN</span>
                    </div>
                    <h1 className="text-3xl font-semibold bg-gradient-to-r from-gray-800 to-gray-600 bg-clip-text text-transparent">
                        Create Goods Received Note
                    </h1>
                </div>

                {/* Basic Bill Information */}
                <div
                    className={'bg-white rounded-xl p-6 border border-gray-200'}
                >
                    <div className="flex items-center gap-2 mb-4">
                        <ShoppingCart className="text-emerald-600" size={24} />
                        <span className="text-lg font-semibold text-gray-800">Basic Bill Information</span>
                    </div>
                    <div className={'grid md:grid-cols-5 gap-4'}>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                Bill Number <span className="text-red-500">*</span>
                            </label>
                            <input
                                type="text"
                                value={billNumber}
                                onChange={(e) => setBillNumber(e.target.value)}
                                placeholder="Enter Bill Number"
                                className="w-full text-sm rounded-lg py-2 px-3 border-2 border-gray-200 focus:border-emerald-400 focus:outline-none transition-all"
                            />
                        </div>
                        <div className="md:col-span-2">
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                Select Supplier <span className="text-red-500">*</span>
                            </label>
                            <TypeableSelect
                                options={suppliers}
                                value={selectedSupplier?.value || null}
                                onChange={(opt) =>
                                    opt
                                        ? setSelectedSupplier({
                                            value: String(opt.value),
                                            label: opt.label,
                                        })
                                        : setSelectedSupplier(null)
                                }
                                placeholder="Type to search Supplier"
                            />
                        </div>
                    </div>
                </div>

                {/* GRN Item Details */}
                <div
                    className={'bg-white rounded-xl p-6 border border-gray-200'}
                >
                    <div className="flex items-center gap-2 mb-4">
                        <Package className="text-emerald-600" size={24} />
                        <span className="text-lg font-semibold text-gray-800">Add Product Details</span>
                    </div>
                    <div className={'grid md:grid-cols-5 gap-4'}>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                Select Product <span className="text-red-500">*</span>
                            </label>
                            <TypeableSelect
                                key={`product-${formKey}`}
                                options={products}
                                value={selectedProduct?.value || null}
                                onChange={(opt) =>
                                    opt
                                        ? setSelectedProduct({
                                            value: String(opt.value),
                                            label: opt.label,
                                        })
                                        : setSelectedProduct(null)
                                }
                                placeholder="Type to search Product"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                Select Variant <span className="text-red-500">*</span>
                            </label>
                            <select
                                value={selectedVariant?.value || ""}
                                onChange={(e) => {
                                    const value = e.target.value;
                                    if (value) {
                                        const selectedOption = productVariants.find(variant => variant.value === value);
                                        if (selectedOption) {
                                            setSelectedVariant({
                                                value: selectedOption.value,
                                                label: selectedOption.label,
                                            });
                                        }
                                    } else {
                                        setSelectedVariant(null);
                                    }
                                }}
                                disabled={!selectedProduct || isLoadingVariants}
                                className="w-full text-sm rounded-lg py-2 px-3 border-2 border-gray-200 focus:border-emerald-400 focus:outline-none transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                <option value="">
                                    {isLoadingVariants ? "Loading variants..." :
                                        selectedProduct ? "Select product variant" :
                                            "Select a product first"}
                                </option>
                                {productVariants.map((variant) => (
                                    <option key={variant.value} value={variant.value}>
                                        {variant.label}
                                    </option>
                                ))}
                            </select>
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                Barcode
                            </label>
                            <input
                                type="text"
                                value={barcode}
                                onChange={(e) => setBarcode(e.target.value)}
                                placeholder="Auto-generated if empty"
                                className="w-full text-sm rounded-lg py-2 px-3 border-2 border-gray-200 focus:border-emerald-400 focus:outline-none transition-all"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                Batch Number
                            </label>
                            <input
                                type="text"
                                value={batchNumber}
                                onChange={(e) => setBatchNumber(e.target.value)}
                                placeholder="Enter Batch Number"
                                className="w-full text-sm rounded-lg py-2 px-3 border-2 border-gray-200 focus:border-emerald-400 focus:outline-none transition-all"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                <Calendar size={14} className="inline mr-1" />
                                Manufacture Date
                            </label>
                            <input
                                type="date"
                                value={mfDate}
                                onChange={(e) => setMfDate(e.target.value)}
                                className="w-full text-sm rounded-lg py-2 px-3 border-2 border-gray-200 focus:border-emerald-400 focus:outline-none transition-all"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                <Calendar size={14} className="inline mr-1" />
                                Expire Date
                            </label>
                            <input
                                type="date"
                                value={exDate}
                                onChange={(e) => setExDate(e.target.value)}
                                className="w-full text-sm rounded-lg py-2 px-3 border-2 border-gray-200 focus:border-emerald-400 focus:outline-none transition-all"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                <DollarSign size={14} className="inline mr-1" />
                                Cost Price <span className="text-red-500">*</span>
                            </label>
                            <input
                                type="number"
                                value={costPrice}
                                onChange={(e) => setCostPrice(e.target.value)}
                                placeholder="0.00"
                                className="w-full text-sm rounded-lg py-2 px-3 border-2 border-gray-200 focus:border-emerald-400 focus:outline-none transition-all"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                MRP <span className="text-red-500">*</span>
                            </label>
                            <input
                                type="number"
                                value={mrp}
                                onChange={(e) => setMrp(e.target.value)}
                                placeholder="0.00"
                                className="w-full text-sm rounded-lg py-2 px-3 border-2 border-gray-200 focus:border-emerald-400 focus:outline-none transition-all"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                Retail Selling Price <span className="text-red-500">*</span>
                            </label>
                            <input
                                type="number"
                                value={rsp}
                                onChange={(e) => setRsp(e.target.value)}
                                placeholder="0.00"
                                className="w-full text-sm rounded-lg py-2 px-3 border-2 border-gray-200 focus:border-emerald-400 focus:outline-none transition-all"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                Wholesale Price
                            </label>
                            <input
                                type="number"
                                value={wsp}
                                onChange={(e) => setWsp(e.target.value)}
                                placeholder="0.00"
                                className="w-full text-sm rounded-lg py-2 px-3 border-2 border-gray-200 focus:border-emerald-400 focus:outline-none transition-all"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                Quantity <span className="text-red-500">*</span>
                            </label>
                            <input
                                type="number"
                                value={qty}
                                onChange={(e) => setQty(e.target.value)}
                                placeholder="0"
                                className="w-full text-sm rounded-lg py-2 px-3 border-2 border-gray-200 focus:border-emerald-400 focus:outline-none transition-all"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                Free Quantity
                            </label>
                            <input
                                type="number"
                                value={freeQty}
                                onChange={(e) => setFreeQty(e.target.value)}
                                placeholder="0"
                                className="w-full text-sm rounded-lg py-2 px-3 border-2 border-gray-200 focus:border-emerald-400 focus:outline-none transition-all"
                            />
                        </div>
                        <div className={'flex justify-center items-end'}>
                            <button
                                onClick={addToGrn}
                                className={'bg-gradient-to-r from-emerald-500 to-emerald-600 hover:from-emerald-600 hover:to-emerald-700 w-full rounded-lg p-2 text-white font-semibold shadow-lg shadow-emerald-200 hover:shadow-xl transition-all flex items-center justify-center gap-2'}
                            >
                                <Plus size={18} /> Add to GRN
                            </button>
                        </div>
                    </div>
                </div>

                {/* GRN Items Table */}
                <div
                    className={'bg-white rounded-xl p-6 border border-gray-200'}
                >
                    <span className="text-lg font-semibold text-gray-800 block mb-4">GRN Items</span>
                    <div className="overflow-y-auto max-h-md md:h-[320px] lg:h-[320px] rounded-lg scrollbar-thin scrollbar-thumb-emerald-300 scrollbar-track-gray-100">
                        <table className="min-w-full divide-y divide-gray-200">
                            <thead className="bg-gradient-to-r from-emerald-500 to-emerald-600 sticky top-0 z-10">
                                <tr>
                                    {[
                                        "Product Name",
                                        "Variant",
                                        "Barcode",
                                        "Batch",
                                        "MFD",
                                        "EXP",
                                        "Cost",
                                        "MRP",
                                        "RSP",
                                        "WSP",
                                        "QTY",
                                        "Free",
                                        "Actions",
                                    ].map((header, i, arr) => (
                                        <th
                                            key={header}
                                            className={`px-6 py-3 text-left text-xs font-bold text-white uppercase tracking-wider ${i === 0 ? 'rounded-tl-lg' : i === arr.length - 1 ? 'rounded-tr-lg' : ''
                                                }`}
                                        >
                                            {header}
                                        </th>
                                    ))}
                                </tr>
                            </thead>
                            <tbody className="bg-white divide-y divide-gray-200">
                                {grnData.length === 0 ? (
                                    <tr>
                                        <td colSpan={13} className="px-6 py-8 text-center text-gray-500">
                                            No items added yet. Add products to create GRN.
                                        </td>
                                    </tr>
                                ) : (
                                    grnData.map((sale, index) => (
                                        <tr
                                            key={index}
                                            onClick={() => setSelectedIndex(index)}
                                            className={`cursor-pointer transition-all ${index === selectedIndex
                                                ? 'bg-emerald-50 border-l-4 border-emerald-500'
                                                : 'hover:bg-gray-50'
                                                }`}
                                        >
                                            <td className="px-6 py-3 whitespace-nowrap text-sm font-medium text-gray-800">
                                                {sale.productName}
                                            </td>
                                            <td className="px-6 py-3 whitespace-nowrap text-sm text-gray-700">
                                                {sale.productVariant}
                                            </td>
                                            <td className="px-6 py-3 whitespace-nowrap text-sm text-gray-600">
                                                {sale.barcode}
                                            </td>
                                            <td className="px-6 py-3 whitespace-nowrap text-sm text-gray-600">
                                                {sale.batch}
                                            </td>
                                            <td className="px-6 py-3 whitespace-nowrap text-sm text-gray-600">
                                                {sale.mfd || '-'}
                                            </td>
                                            <td className="px-6 py-3 whitespace-nowrap text-sm text-gray-600">
                                                {sale.exp || '-'}
                                            </td>
                                            <td className="px-6 py-3 whitespace-nowrap text-sm font-semibold text-gray-800">
                                                {sale.cost}
                                            </td>
                                            <td className="px-6 py-3 whitespace-nowrap text-sm text-gray-600">
                                                {sale.mrp}
                                            </td>
                                            <td className="px-6 py-3 whitespace-nowrap text-sm text-gray-600">
                                                {sale.rsp}
                                            </td>
                                            <td className="px-6 py-3 whitespace-nowrap text-sm text-gray-600">
                                                {sale.wsp}
                                            </td>
                                            <td className="px-6 py-3 whitespace-nowrap text-sm font-semibold text-emerald-600">
                                                {sale.qty}
                                            </td>
                                            <td className="px-6 py-3 whitespace-nowrap text-sm text-gray-600">
                                                {sale.free}
                                            </td>
                                            <td className="px-6 py-3 whitespace-nowrap text-sm">
                                                <div className="flex gap-2">
                                                    <div className="relative group">
                                                        <button
                                                            onClick={(e) => {
                                                                e.stopPropagation();
                                                                setProductToPrint({
                                                                    productID: 0, // Dummy ID
                                                                    productName: sale.productName,
                                                                    productCode: '',
                                                                    barcode: sale.barcode,
                                                                    price: parseFloat(sale.mrp)
                                                                });
                                                                setIsBarcodeModalOpen(true);
                                                            }}
                                                            className="p-2 bg-gradient-to-r from-yellow-100 to-yellow-200 rounded-lg text-yellow-700 hover:from-yellow-200 hover:to-yellow-300 transition-all shadow-sm"
                                                        >
                                                            <Barcode size={16} />
                                                        </button>
                                                        <span className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 w-max px-2 py-1 text-xs text-white bg-gray-900 rounded-md invisible group-hover:visible opacity-0 group-hover:opacity-100 transition-opacity z-20">
                                                            Print Barcode
                                                        </span>
                                                    </div>

                                                    <button
                                                        onClick={(e) => {
                                                            e.stopPropagation();
                                                            removeItem(index);
                                                        }}
                                                        className="p-2 bg-gradient-to-r from-red-500 to-red-600 hover:from-red-600 hover:to-red-700 text-white rounded-lg shadow-md hover:shadow-lg transition-all"
                                                    >
                                                        <Trash2 size={16} />
                                                    </button>
                                                </div>
                                            </td>
                                        </tr>
                                    ))
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>

                {/* Payment & Summary */}
                <div
                    className={'bg-white rounded-xl p-6 border border-gray-200'}
                >
                    <div className={'flex justify-between gap-6'}>
                        <div className={'w-1/2'}>
                            <span className="text-lg font-semibold text-gray-800 block mb-4">Payment Details</span>
                            <div className={'grid md:grid-cols-2 gap-4'}>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">
                                        Payment Type <span className="text-red-500">*</span>
                                    </label>
                                    <select
                                        value={selectedPaymentType?.value || ""}
                                        onChange={(e) => {
                                            const value = e.target.value;
                                            if (value) {
                                                const selectedOption = paymentTypes.find(paymentType => paymentType.value === value);
                                                if (selectedOption) {
                                                    setSelectedPaymentType({
                                                        value: selectedOption.value,
                                                        label: selectedOption.label,
                                                    });
                                                }
                                            } else {
                                                setSelectedPaymentType(null);
                                            }
                                        }}
                                        disabled={isLoadingPaymentTypes}
                                        className="w-full text-sm rounded-lg py-2 px-3 border-2 border-gray-200 focus:border-emerald-400 focus:outline-none transition-all disabled:opacity-50"
                                    >
                                        <option value="">
                                            {isLoadingPaymentTypes ? "Loading..." : "Select Payment Type"}
                                        </option>
                                        {paymentTypes.map((paymentType) => (
                                            <option key={paymentType.value} value={paymentType.value}>
                                                {paymentType.label}
                                            </option>
                                        ))}
                                    </select>
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">
                                        Paid Amount <span className="text-red-500">*</span>
                                    </label>
                                    <input
                                        type="number"
                                        value={paidAmount}
                                        onChange={(e) => setPaidAmount(e.target.value)}
                                        placeholder="0.00"
                                        className="w-full text-sm rounded-lg py-2 px-3 border-2 border-gray-200 focus:border-emerald-400 focus:outline-none transition-all"
                                    />
                                </div>
                            </div>
                        </div>
                        <div className={'w-1/2'}>
                            <span className="text-lg font-semibold text-gray-800 block mb-4">Summary</span>
                            <div className={'flex flex-col gap-3'}>
                                <div className={'flex justify-between items-center p-3 bg-gray-50 rounded-lg'}>
                                    <span className={'font-medium text-gray-700'}>Total Items:</span>
                                    <span className={'font-bold text-gray-800'}>{totalItems}</span>
                                </div>
                                <div className={'flex justify-between items-center p-3 bg-gray-50 rounded-lg'}>
                                    <span className={'font-medium text-gray-700'}>Total Quantity:</span>
                                    <span className={'font-bold text-gray-800'}>{totalQuantity}</span>
                                </div>
                                <div className={'flex justify-between items-center p-3 bg-emerald-50 rounded-lg'}>
                                    <span className={'font-semibold text-emerald-700'}>Grand Total:</span>
                                    <span className={'font-bold text-emerald-600 text-lg'}>Rs. {totalCost.toFixed(2)}</span>
                                </div>
                                <div className={'flex justify-between items-center p-3 bg-red-50 rounded-lg'}>
                                    <span className={'font-semibold text-red-700'}>Paid Amount:</span>
                                    <span className={'font-bold text-red-600'}>- Rs. {paidAmountNum.toFixed(2)}</span>
                                </div>
                                <div className={'flex justify-between items-center p-3 bg-blue-50 rounded-lg border-2 border-blue-200'}>
                                    <span className={'font-bold text-blue-700'}>Balance:</span>
                                    <span className={'font-bold text-blue-600 text-lg'}>Rs. {balance.toFixed(2)}</span>
                                </div>
                                <button
                                    onClick={createGrn}
                                    className={'bg-gradient-to-r from-emerald-500 to-emerald-600 hover:from-emerald-600 hover:to-emerald-700 w-full rounded-lg p-3 mt-2 text-white font-bold shadow-lg shadow-emerald-200 hover:shadow-xl transition-all'}
                                >
                                    CREATE GRN (Shift+Enter)
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </>
    );
}

export default CreateGrn;