import React, { useRef, useState, useEffect } from 'react';
import { X, Printer, Minus, Plus } from 'lucide-react';
import Barcode from 'react-barcode';
import { useReactToPrint } from 'react-to-print';

interface Product {
    productID: number;
    productName: string;
    productCode: string;
    barcode: string;
    price?: number;
}

interface BarcodePrintModalProps {
    isOpen: boolean;
    onClose: () => void;
    product: Product | null;
}

const BarcodePrintModal: React.FC<BarcodePrintModalProps> = ({ isOpen, onClose, product }) => {
    const componentRef = useRef<HTMLDivElement>(null);
    const [quantity, setQuantity] = useState(1);
    const [storeName, setStoreName] = useState('My POS Store');

    // Reset quantity when modal opens/product changes and fetch store name
    useEffect(() => {
        if (isOpen) {
            setQuantity(1);
            const savedPOSSettings = localStorage.getItem('posSettings');
            if (savedPOSSettings) {
                try {
                    const parsed = JSON.parse(savedPOSSettings);
                    if (parsed.storeName) {
                        setStoreName(parsed.storeName);
                    }
                } catch (e) {
                    console.error("Failed to parse POS settings", e);
                }
            }
        }
    }, [isOpen, product]);

    const handlePrint = useReactToPrint({
        contentRef: componentRef,
        documentTitle: `Barcode-${product?.productName || 'product'}`,
    });

    if (!isOpen || !product) return null;

    const barcodeValue = product.barcode || product.productCode || String(product.productID);
    const mrp = product.price ? `MRP: Rs.${product.price.toFixed(2)}` : '';

    return (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 backdrop-blur-sm animate-in fade-in duration-200">
            <div className="bg-white rounded-2xl p-6 w-full max-w-2xl shadow-2xl transform transition-all scale-100">
                <div className="flex justify-between items-center mb-6 border-b border-gray-100 pb-4">
                    <h2 className="text-2xl font-bold bg-gradient-to-r from-gray-800 to-gray-600 bg-clip-text text-transparent flex items-center gap-2">
                        <Printer className="text-emerald-600" size={24} />
                        Print Barcode
                    </h2>
                    <button
                        onClick={onClose}
                        className="p-2 hover:bg-gray-100 rounded-full text-gray-400 hover:text-gray-600 transition-colors"
                    >
                        <X size={24} />
                    </button>
                </div>

                <div className="grid md:grid-cols-2 gap-8">
                    {/* Controls */}
                    <div className="space-y-6">
                        <div className="bg-blue-50 p-4 rounded-xl border border-blue-100">
                            <h3 className="text-sm font-semibold text-blue-900 mb-1">Product Details</h3>
                            <p className="text-blue-700 text-sm mb-1 font-bold">{storeName}</p>
                            <p className="text-blue-700 text-sm mb-1">{product.productName}</p>
                            {mrp && <p className="text-blue-800 text-sm font-bold mb-2">{mrp}</p>}
                            <div className="flex gap-2">
                                <span className="text-xs bg-white px-2 py-1 rounded text-blue-600 border border-blue-200 font-mono">
                                    {barcodeValue}
                                </span>
                            </div>
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                Quantity to Print
                            </label>
                            <div className="flex items-center gap-3 bg-gray-50 p-2 rounded-lg border border-gray-200 w-max">
                                <button
                                    onClick={() => setQuantity(Math.max(1, quantity - 1))}
                                    className="w-8 h-8 flex items-center justify-center bg-white rounded-md shadow-sm border border-gray-200 hover:border-emerald-500 hover:text-emerald-600 transition-all"
                                >
                                    <Minus size={16} />
                                </button>
                                <span className="w-12 text-center font-bold text-lg text-gray-700">{quantity}</span>
                                <button
                                    onClick={() => setQuantity(quantity + 1)}
                                    className="w-8 h-8 flex items-center justify-center bg-white rounded-md shadow-sm border border-gray-200 hover:border-emerald-500 hover:text-emerald-600 transition-all"
                                >
                                    <Plus size={16} />
                                </button>
                            </div>
                        </div>

                        <div className="pt-4">
                            <button
                                onClick={() => handlePrint && handlePrint()}
                                className="w-full flex items-center justify-center gap-2 py-3 px-6 bg-gradient-to-r from-emerald-500 to-emerald-600 hover:from-emerald-600 hover:to-emerald-700 text-white font-semibold rounded-xl shadow-lg shadow-emerald-200 hover:shadow-xl transition-all transform hover:-translate-y-0.5 active:translate-y-0"
                            >
                                <Printer size={20} />
                                Print {quantity} Label{quantity > 1 ? 's' : ''}
                            </button>
                        </div>
                    </div>

                    {/* Preview Area */}
                    <div className="bg-gray-50 rounded-xl border border-gray-200 p-4 flex flex-col items-center justify-center min-h-[300px] overflow-auto">
                        <p className="text-xs font-semibold text-gray-400 mb-4 uppercase tracking-wider">Preview</p>

                        {/* The Printable Content - Hidden from normal layout flow for exact printing but shown here for preview */}
                        <div className="bg-white p-4 shadow-sm border border-gray-100 rounded-lg">
                            <div className="flex flex-col items-center text-center">
                                <p className="text-xs font-bold mb-1 max-w-[150px] truncate">{storeName}</p>
                                <p className="text-xs font-medium mb-1 max-w-[150px] truncate">{product.productName}</p>
                                <Barcode
                                    value={barcodeValue}
                                    width={1.5}
                                    height={40}
                                    fontSize={14}
                                    margin={0}
                                />
                                {product.price && (
                                    <p className="text-xs font-bold mt-1">MRP: Rs.{product.price.toFixed(2)}</p>
                                )}
                            </div>
                        </div>
                        <p className="mt-4 text-xs text-center text-gray-400">
                            Showing 1 of {quantity}
                        </p>
                    </div>
                </div>

                {/* Hidden Printable Area */}
                <div style={{ display: 'none' }}>
                    <div ref={componentRef} className="p-4 print-container">
                        <style>
                            {`
                                @media print {
                                    .print-container {
                                        padding: 10px;
                                        display: flex;
                                        flex-wrap: wrap;
                                        gap: 15px;
                                        justify-content: flex-start;
                                    }
                                    .barcode-item {
                                        page-break-inside: avoid;
                                        display: flex;
                                        flex-direction: column;
                                        align-items: center;
                                        text-align: center;
                                        border: 1px dotted #ccc;
                                        padding: 5px;
                                        width: auto;
                                        min-width: 120px;
                                    }
                                    .store-name { font-size: 10px; font-weight: bold; margin-bottom: 2px; }
                                    .prod-name { font-size: 10px; margin-bottom: 2px; max-width: 140px; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
                                    .mrp-text { font-size: 10px; font-weight: bold; margin-top: 2px; }
                                }
                            `}
                        </style>
                        <div className="flex flex-wrap gap-4">
                            {Array.from({ length: quantity }).map((_, idx) => (
                                <div key={idx} className="barcode-item">
                                    <p className="store-name">{storeName}</p>
                                    <p className="prod-name">{product.productName}</p>
                                    <Barcode
                                        value={barcodeValue}
                                        width={1.3}
                                        height={35}
                                        fontSize={11}
                                        margin={2}
                                        displayValue={true}
                                    />
                                    {product.price && (
                                        <p className="mrp-text">MRP: Rs.{product.price.toFixed(2)}</p>
                                    )}
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default BarcodePrintModal;
