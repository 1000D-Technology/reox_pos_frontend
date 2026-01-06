import { useEffect, useState } from "react";
import TypeableSelect from "../../../components/TypeableSelect.tsx";
import { productService } from "../../../services/productService.ts";
import { supplierService } from "../../../services/supplierService.ts";
import axiosInstance from "../../../api/axiosInstance.ts";
import toast, { Toaster } from 'react-hot-toast';

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

    // Generate bill number
    const generateBillNumber = (): string => {
        const randomNum = Math.floor(Math.random() * 90000000) + 10000000; // Generate 8 digit random number (10000000-99999999)
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

        // Clean company name - remove spaces and special characters, take first 8 chars
        const cleanCompanyName = companyName.replace(/[^a-zA-Z0-9]/g, '').toUpperCase().substring(0, 8);

        return `${date}${month}${year}-${cleanCompanyName}`;
    };

    const generateBarcode = (): string => {
        // Generate 12 random digits
        let barcode = '';
        for (let i = 0; i < 12; i++) {
            barcode += Math.floor(Math.random() * 10);
        }

        // Calculate check digit (EAN-13 standard)
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
            // Validation
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

            // Generate barcode if empty
            const finalBarcode = barcode.trim() || generateBarcode();

            // Create new GRN item
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

            // Add to GRN data
            setGrnData(prevData => [...prevData, newItem]);

            // Clear form fields
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
        setFormKey(prev => prev + 1); // Force TypeableSelect to remount and clear
    };

    // Remove item from GRN
    const removeItem = (index: number) => {
        setGrnData(prevData => prevData.filter((_, i) => i !== index));
        // Adjust selectedIndex if needed
        if (index === selectedIndex && grnData.length > 1) {
            setSelectedIndex(prev => prev > 0 ? prev - 1 : 0);
        } else if (index < selectedIndex) {
            setSelectedIndex(prev => prev - 1);
        } else if (grnData.length === 1) {
            setSelectedIndex(0);
        }
        toast.success('Item removed from GRN');
    };

    // Fetch products
    const fetchProducts = async () => {
        setIsLoadingProducts(true);
        try {
            const response = await productService.getProductsForDropdown();
            if (response.data.success && response.data.data) {
                const productOptions = response.data.data
                    .filter((product: any) => product && product.id && product.product_name) // Safety filter
                    .map((product: any) => ({
                        value: product.id.toString(),
                        label: product.product_name
                    }));
                setProducts(productOptions);
            } else {
                console.error('Invalid response structure:', response.data);
                toast.error('Invalid response from server');
            }
        } catch (error) {
            console.error('Error fetching products:', error);
            toast.error('Failed to load products');
        } finally {
            setIsLoadingProducts(false);
        }
    };

    // Fetch suppliers
    const fetchSuppliers = async () => {
        setIsLoadingSuppliers(true);
        try {
            const response = await supplierService.getSuppliers();
            if (response.data.success) {
                const supplierOptions = response.data.data.map((supplier: any) => ({
                    value: supplier.id.toString(),
                    label: supplier.companyName 
                        ? `${supplier.supplierName} - ${supplier.companyName}`
                        : supplier.supplierName,
                    companyName: supplier.companyName
                }));
                setSuppliers(supplierOptions);
            }
        } catch (error) {
            console.error('Error fetching suppliers:', error);
            toast.error('Failed to load suppliers');
        } finally {
            setIsLoadingSuppliers(false);
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
                
                // Auto-select first variant if available
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

    // Fetch payment types
    const fetchPaymentTypes = async () => {
        setIsLoadingPaymentTypes(true);
        try {
            const response = await axiosInstance.get('/api/grn/payment-types');
            
            if (response.data && response.data.success) {
                const paymentOptions = response.data.data
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
            console.error('Error fetching payment types:', error);
        } finally {
            setIsLoadingPaymentTypes(false);
        }
    };

    // Create GRN function
    const createGrn = async () => {
        try {
            // Validation
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

            // Prepare data for backend
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

            console.log('Creating GRN with data:', grnPayload);

            const response = await axiosInstance.post('/api/grn/add', grnPayload);

            if (response.data.success) {
                toast.success(`GRN created successfully! GRN ID: ${response.data.grnId}`);
                
                // Reset form
                setGrnData([]);
                setSelectedSupplier(null);
                setSelectedPaymentType(null);
                setPaidAmount('');
                setBillNumber(generateBillNumber());
                clearForm();
            } else {
                toast.error('Failed to create GRN');
            }
        } catch (error) {
            console.error('Error creating GRN:', error);
        }
    };

    // Load initial data
    useEffect(() => {
        fetchProducts();
        fetchSuppliers();
        fetchPaymentTypes();
        setBillNumber(generateBillNumber()); // Generate bill number on component mount
    }, []);

    // Load variants when product changes
    useEffect(() => {
        if (selectedProduct) {
            setSelectedVariant(null); // Reset variant selection
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
            
            // If companyName is not available, try to extract it from the label
            if (!companyName && selectedSupplier.label.includes(' - ')) {
                companyName = selectedSupplier.label.split(' - ')[1]; // Get the part after " - "
            } else if (!companyName) {
                companyName = selectedSupplier.label; // Fallback to supplier name if no company name
            }
            
            setBatchNumber(generateBatchNumber(companyName));
        } else {
            setBatchNumber('');
        }
    }, [selectedSupplier]);

    // 🔹 Handle Up / Down arrow keys
    useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            if (e.key === "ArrowDown") {
                setSelectedIndex((prev) =>
                    prev < grnData.length - 1 ? prev + 1 : prev
                );
            } else if (e.key === "ArrowUp") {
                setSelectedIndex((prev) => (prev > 0 ? prev - 1 : prev));
            }
        };

        window.addEventListener("keydown", handleKeyDown);
        return () => window.removeEventListener("keydown", handleKeyDown);
    }, [grnData.length]);

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
                            background: '#10B981',
                        },
                    },
                    error: {
                        duration: 4000,
                        style: {
                            background: '#EF4444',
                        },
                    },
                    loading: {
                        style: {
                            background: '#3B82F6',
                        },
                    },
                }}
            />
            <div className={'flex flex-col gap-4 h-full'}>
                <div>
                    <div className="text-sm text-gray-500 flex items-center">
                        <span>Pages</span>
                        <span className="mx-2">›</span>
                        <span className="text-black">Create GRN</span>
                    </div>
                    <h1 className="text-3xl font-semibold text-gray-500">Create GRN</h1>
                </div>

                <div className={'bg-white rounded-md p-4 flex flex-col'}>
                    <span className="text-lg font-semibold my-4">Basic Bill Information</span>
                    <div className={'grid md:grid-cols-5 gap-4 '}>
                        <div>
                            <label
                                htmlFor="billnumber"
                                className="block text-sm font-medium text-gray-700 mb-1"
                            >
                                Bill Number <span className="text-red-500">*</span>
                            </label>
                            <input
                                type="text"
                                id="billnumber"
                                value={billNumber}
                                onChange={(e) => setBillNumber(e.target.value)}
                                placeholder="Enter Bill Number"
                                className="w-full text-sm rounded-md py-2 px-2 border-2 border-gray-100"
                            />
                        </div>
                        <div>
                            <label
                                htmlFor="supplier"
                                className="block text-sm font-medium text-gray-700 mb-1"
                            >
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
                                allowCreate={false}
                            />
                        </div>

                    </div>
                    <span className="text-lg font-semibold my-4">Basic GRN Information</span>
                    <div className={'grid md:grid-cols-5 gap-4 '}>
                        <div>
                            <label
                                htmlFor="supplier"
                                className="block text-sm font-medium text-gray-700 mb-1"
                            >
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
                                allowCreate={false}
                            />
                        </div>
                        <div>
                            <label
                                htmlFor="productvariants"
                                className="block text-sm font-medium text-gray-700 mb-1"
                            >
                                Select Product Variants <span className="text-red-500">*</span>
                            </label>
                            <select
                                id="productvariants"
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
                                className="w-full text-sm rounded-md py-2 px-2 border-2 border-gray-100 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
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
                            <label
                                htmlFor="barcode"
                                className="block text-sm font-medium text-gray-700 mb-1"
                            >
                                Barcode
                            </label>
                            <input
                                type="text"
                                id="barcode"
                                value={barcode}
                                onChange={(e) => setBarcode(e.target.value)}
                                placeholder="Enter Barcode (auto-generated if empty)"
                                className="w-full text-sm rounded-md py-2 px-2  border-2 border-gray-100 "
                            />
                        </div>
                        <div>
                            <label
                                htmlFor="batchnumber"
                                className="block text-sm font-medium text-gray-700 mb-1"
                            >
                                Batch Number
                            </label>
                            <input
                                type="text"
                                id="batchnumber"
                                value={batchNumber}
                                onChange={(e) => setBatchNumber(e.target.value)}
                                placeholder="Enter Batch Number"
                                className="w-full text-sm rounded-md py-2 px-2  border-2 border-gray-100 "
                            />
                        </div>
                        <div>
                            <label
                                htmlFor="mfdate"
                                className="block text-sm font-medium text-gray-700 mb-1"
                            >
                                Manufacture Date
                            </label>
                            <input
                                type="date"
                                id="mfdate"
                                value={mfDate}
                                onChange={(e) => setMfDate(e.target.value)}
                                className="w-full text-sm rounded-md py-2 px-2  border-2 border-gray-100 "
                            />
                        </div>
                        <div>
                            <label
                                htmlFor="exdate"
                                className="block text-sm font-medium text-gray-700 mb-1"
                            >
                                Expire Date
                            </label>
                            <input
                                type="date"
                                id="exdate"
                                value={exDate}
                                onChange={(e) => setExDate(e.target.value)}
                                className="w-full text-sm rounded-md py-2 px-2  border-2 border-gray-100 "
                            />
                        </div>
                        <div>
                            <label
                                htmlFor="coprice"
                                className="block text-sm font-medium text-gray-700 mb-1"
                            >
                                Cost Price <span className="text-red-500">*</span>
                            </label>
                            <input
                                type="number"
                                id="coprice"
                                value={costPrice}
                                onChange={(e) => setCostPrice(e.target.value)}
                                placeholder="Enter Cost Price"
                                className="w-full text-sm rounded-md py-2 px-2  border-2 border-gray-100 "
                            />
                        </div>
                        <div>
                            <label
                                htmlFor="mrpprice"
                                className="block text-sm font-medium text-gray-700 mb-1"
                            >
                                Manufacture Retail Price <span className="text-red-500">*</span>
                            </label>
                            <input
                                type="number"
                                id="mrpprice"
                                value={mrp}
                                onChange={(e) => setMrp(e.target.value)}
                                placeholder="Enter Manufacture Retail Price"
                                className="w-full text-sm rounded-md py-2 px-2  border-2 border-gray-100 "
                            />
                        </div>
                        <div>
                            <label
                                htmlFor="rsprice"
                                className="block text-sm font-medium text-gray-700 mb-1"
                            >
                                Retail Selling Price <span className="text-red-500">*</span>
                            </label>
                            <input
                                type="number"
                                id="rsprice"
                                value={rsp}
                                onChange={(e) => setRsp(e.target.value)}
                                placeholder="Enter Retail Selling Price"
                                className="w-full text-sm rounded-md py-2 px-2  border-2 border-gray-100 "
                            />
                        </div>
                        <div>
                            <label
                                htmlFor="wprice"
                                className="block text-sm font-medium text-gray-700 mb-1"
                            >
                                Wholesale Selling Price
                            </label>
                            <input
                                type="number"
                                id="wprice"
                                value={wsp}
                                onChange={(e) => setWsp(e.target.value)}
                                placeholder="Enter Wholesale Selling Price"
                                className="w-full text-sm rounded-md py-2 px-2  border-2 border-gray-100 "
                            />
                        </div>
                        <div>
                            <label
                                htmlFor="qty"
                                className="block text-sm font-medium text-gray-700 mb-1"
                            >
                                Quantity <span className="text-red-500">*</span>
                            </label>
                            <input
                                type="number"
                                id="qty"
                                value={qty}
                                onChange={(e) => setQty(e.target.value)}
                                placeholder="Enter Quantity"
                                className="w-full text-sm rounded-md py-2 px-2  border-2 border-gray-100 "
                            />
                        </div>
                        <div>
                            <label
                                htmlFor="freeqty"
                                className="block text-sm font-medium text-gray-700 mb-1"
                            >
                                Free Quantity
                            </label>
                            <input
                                type="number"
                                id="freeqty"
                                value={freeQty}
                                onChange={(e) => setFreeQty(e.target.value)}
                                placeholder="Enter Free Quantity"
                                className="w-full text-sm rounded-md py-2 px-2  border-2 border-gray-100 "
                            />
                        </div>
                        <div className={'flex justify-center items-end'}>
                            <button 
                                onClick={addToGrn}
                                className={'bg-emerald-600 w-full rounded-sm p-2 text-white font-semibold cursor-pointer hover:bg-emerald-500'}
                            >
                                ADD TO GRN ( Enter )
                            </button>

                        </div>
                    </div>
                    <span className="text-lg font-semibold mt-4">GRN Items</span>
                    <div
                        className={
                            "flex flex-col bg-white rounded-md h-full py-4 justify-between"
                        }
                    >
                        <div
                            className="overflow-y-auto max-h-md md:h-[320px] lg:h-[320px] rounded-md bg-gray-50 scrollbar-thin scrollbar-thumb-gray-300 scrollbar-track-gray-100">
                            <table className="min-w-full divide-y divide-gray-200">
                                <thead className="bg-emerald-600 sticky top-0 z-10">
                                    <tr>
                                        {[

                                            "Product Name",
                                            "Product Variants ID",
                                            "Barcode",
                                            "Batch Number",
                                            "MFD",
                                            "EXP",
                                            "Cost Price",
                                            "MRP",
                                            "RSP",
                                            "WSP",
                                            "QTY",
                                            "Free QTY",
                                            "Actions",
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
                                    {grnData.map((sale, index) => (
                                        <tr
                                            key={index}
                                            onClick={() => setSelectedIndex(index)}
                                            className={`cursor-pointer ${index === selectedIndex
                                                    ? "bg-green-100 border-l-4 border-green-600"
                                                    : "hover:bg-green-50"
                                                }`}
                                        >
                                            <td className="px-6 py-2 whitespace-nowrap text-sm font-medium">
                                                {sale.productName}
                                            </td>
                                            <td className="px-6 py-2 whitespace-nowrap text-sm font-medium">
                                                {sale.productVariant}
                                            </td>
                                            <td className="px-6 py-2 whitespace-nowrap text-sm font-medium">
                                                {sale.barcode}
                                            </td>
                                            <td className="px-6 py-2 whitespace-nowrap text-sm font-medium">
                                                {sale.batch}
                                            </td>
                                            <td className="px-6 py-2 whitespace-nowrap text-sm font-medium">
                                                {sale.mfd}
                                            </td>
                                            <td className="px-6 py-2 whitespace-nowrap text-sm font-medium">
                                                {sale.exp}
                                            </td>
                                            <td className="px-6 py-2 whitespace-nowrap text-sm font-medium">
                                                {sale.cost}
                                            </td>
                                            <td className="px-6 py-2 whitespace-nowrap text-sm font-medium">
                                                {sale.mrp}
                                            </td>
                                            <td className="px-6 py-2 whitespace-nowrap text-sm font-medium">
                                                {sale.rsp}
                                            </td>
                                            <td className="px-6 py-2 whitespace-nowrap text-sm font-medium">
                                                {sale.wsp}
                                            </td>
                                            <td className="px-6 py-2 whitespace-nowrap text-sm font-medium">
                                                {sale.qty}
                                            </td>
                                            <td className="px-6 py-2 whitespace-nowrap text-sm font-medium">
                                                {sale.free}
                                            </td>
                                            <td className="px-6 py-2 whitespace-nowrap text-sm font-medium">
                                                <button
                                                    onClick={(e) => {
                                                        e.stopPropagation(); // Prevent row selection when clicking button
                                                        removeItem(index);
                                                    }}
                                                    className="bg-red-500 hover:bg-red-600 text-white px-3 py-1 rounded text-xs font-medium transition-colors duration-200"
                                                >
                                                    Remove
                                                </button>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>


                    </div>
                    <div className={'flex justify-between mt-2'}>
                        <div className={'w-3/5'}>
                            <div className={'grid md:grid-cols-3 gap-4 '}>
                                <div>
                                    <label
                                        htmlFor="supplier"
                                        className="block text-sm font-medium text-gray-700 mb-1"
                                    >
                                        Payment Type<span className="text-red-500">*</span>
                                    </label>
                                    <select
                                        id="paymenttype"
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
                                        className="w-full text-sm rounded-md py-2 px-2 border-2 border-gray-100 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
                                    >
                                        <option value="">
                                            {isLoadingPaymentTypes ? "Loading payment types..." : "Select Payment Type"}
                                        </option>
                                        {paymentTypes.map((paymentType) => (
                                            <option key={paymentType.value} value={paymentType.value}>
                                                {paymentType.label}
                                            </option>
                                        ))}
                                    </select>
                                </div>
                                <div>
                                    <label
                                        htmlFor="wprice"
                                        className="block text-sm font-medium text-gray-700 mb-1"
                                    >
                                        Paid Amount <span className="text-red-500">*</span>
                                    </label>
                                    <input
                                        type="number"
                                        id="wprice"
                                        value={paidAmount}
                                        onChange={(e) => setPaidAmount(e.target.value)}
                                        placeholder="Enter Paid Amount"
                                        className="w-full text-sm rounded-md py-2 px-2  border-2 border-gray-100 "
                                    />
                                </div>


                            </div>
                        </div>
                        <div className={'w-2/5'}>
                            <div className={'flex flex-col gap-2'}>
                                <div className={'flex justify-between'}>
                                    <span className={'font-semibold'}>Total Items :</span>
                                    <span>{totalItems}</span>
                                </div>
                                <div className={'flex justify-between'}>
                                    <span className={'font-semibold'}>Total Quantity :</span>
                                    <span>{totalQuantity}</span>
                                </div>
                                <div className={'flex justify-between'}>
                                    <span className={'font-semibold'}>Total Cost :</span>
                                    <span>{totalCost.toFixed(2)}</span>
                                </div>
                                <div className={'flex justify-between border-t pt-2 font-bold text-lg'}>
                                    <span>GRN Total :</span>
                                    <span>{totalCost.toFixed(2)}</span>
                                </div>
                                <div className={'flex justify-between  pt-2 font-bold text-lg text-red-500'}>
                                    <span>Paid Amount :</span>
                                    <span>-{paidAmountNum.toFixed(2)}</span>
                                </div>
                                <div className={'flex justify-between border-y pt-2 font-bold text-lg text-emerald-600'}>
                                    <span>Balance :</span>
                                    <span>{balance.toFixed(2)}</span>
                                </div>
                            </div>
                            <div>
                                <button 
                                    onClick={createGrn}
                                    className={'bg-emerald-600 w-full rounded-sm p-2 mt-4 text-white font-semibold cursor-pointer hover:bg-emerald-500'}
                                >
                                    CREATE GRN ( Shift+Enter )
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
