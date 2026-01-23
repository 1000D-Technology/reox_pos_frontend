// Types matching your Setting.tsx
interface PrintSettings {
    rollSize: string;
    fontSize: string;
    headerText: string;
    footerText: string;
    showLogo: boolean;
    showBarcode: boolean;
    showQR: boolean;
    paperWidth: string;
    copies: number;
    autocut: boolean;
    printDate: boolean;
    printTime: boolean;
}

interface POSSettings {
    storeName: string;
    storeAddress: string;
    storePhone: string;
    storeEmail: string;
    taxRate: number;
    currency: string;
    defaultDiscount: number;
    lowStockAlert: number;
    enableSound: boolean;
    enableVibration: boolean;
    quickSaleMode: boolean;
    showCustomerDisplay: boolean;
}

interface CartItem {
    id: number;
    name: string;
    price: number;
    quantity: number;
    discount: number;
}

interface Customer {
    id: number;
    name: string;
    contact: string;
}

interface PaymentAmount {
    methodId: string;
    amount: number;
}

export interface BillData {
    invoiceId: number;
    invoiceNumber: string;
    date: Date;
    customer: Customer | null;
    items: CartItem[];
    subtotal: number;
    discount: number;
    total: number;
    paymentAmounts: PaymentAmount[];
    itemsCount?: number;
    isReturn?: boolean;
    originalPayments?: { method: string, amount: number }[];
    // Debt information for returns
    oldDebt?: number;
    debtReduction?: number;
    newDebt?: number;
    refundedCash?: number;
}

export const generateBillHTML = (data: BillData): string => {
    const { invoiceNumber, date, customer, items, subtotal, discount, total, paymentAmounts, isReturn, originalPayments, oldDebt, debtReduction, newDebt, refundedCash } = data;

    // Fetch settings from localStorage
    const savedPrintSettings = localStorage.getItem('printSettings');
    const savedPOSSettings = localStorage.getItem('posSettings');
    const savedLogoPath = localStorage.getItem('logoPath');

    const printSettings: PrintSettings = savedPrintSettings ? JSON.parse(savedPrintSettings) : {
        headerText: 'WELCOME',
        footerText: 'Thank you!',
        showLogo: false
    };

    const posSettings: POSSettings = savedPOSSettings ? JSON.parse(savedPOSSettings) : {
        storeName: 'POS System',
        storeAddress: '',
        storePhone: '',
        storeEmail: '',
        currency: 'Rs.'
    };

    const discountAmount = (subtotal * discount) / 100;
    const totalPaid = paymentAmounts.reduce((sum, p) => sum + p.amount, 0);
    const balance = isReturn ? 0 : totalPaid - total;
    
    // Format date
    // Format date (Using UTC components to match stored Local Time)
    const dateStr = `${date.getUTCDate()}/${date.getUTCMonth() + 1}/${date.getUTCFullYear()}`;
    const hours = date.getUTCHours().toString().padStart(2, '0');
    const minutes = date.getUTCMinutes().toString().padStart(2, '0');
    const seconds = date.getUTCSeconds().toString().padStart(2, '0');
    // Convert to 12-hour format if preferred, usually receipts use 24h or simple
    const ampm = parseInt(hours) >= 12 ? 'PM' : 'AM';
    const hours12 = parseInt(hours) % 12 || 12;
    const timeStr = `${hours12}:${minutes}:${seconds} ${ampm}`;

    // Generate items rows
    const itemsRows = items.map(item => {
        const itemTotal = item.price * item.quantity;
        const itemDiscountVal = (itemTotal * item.discount) / 100;
        const finalItemTotal = itemTotal - itemDiscountVal;
        
        return `
            <tr>
                <td class="item-name">
                    ${item.name}
                    ${item.discount > 0 ? `<div class="item-discount">Desc: ${item.discount}%</div>` : ''}
                </td>
                <td class="text-right">${item.quantity}</td>
                <td class="text-right">${item.price.toFixed(2)}</td>
                <td class="text-right">${finalItemTotal.toFixed(2)}</td>
            </tr>
        `;
    }).join('');

    // Payment methods rows
    let paymentRows = '';
    
    if (isReturn) {
        // For returns, show detailed debt/refund information
        const actualCashRefund = refundedCash !== undefined ? refundedCash : total;
        
        if (debtReduction && debtReduction > 0) {
            // Debt was reduced
            paymentRows += `
                <div style="border: 2px solid #dc2626; border-radius: 8px; padding: 8px; margin-bottom: 10px; background: #fee2e2;">
                    <div style="font-weight: 800; font-size: 14px; color: #991b1b; text-align: center; margin-bottom: 6px;">
                        ⚠️ DEBT REDUCTION
                    </div>
                    <div class="summary-row" style="font-size: 12px; color: #7f1d1d;">
                        <span>Return Value:</span>
                        <span style="font-weight: bold;">Rs ${total.toFixed(2)}</span>
                    </div>
                    <div class="summary-row" style="font-size: 12px; color: #7f1d1d;">
                        <span>Old Outstanding Debt:</span>
                        <span style="font-weight: bold;">Rs ${(oldDebt || 0).toFixed(2)}</span>
                    </div>
                    <div class="summary-row" style="font-size: 12px; color: #16a34a; font-weight: bold;">
                        <span>Debt Reduced By:</span>
                        <span>Rs ${debtReduction.toFixed(2)}</span>
                    </div>
                    <div style="border-top: 2px solid #dc2626; margin: 6px 0; padding-top: 6px;">
                        <div class="summary-row" style="font-size: 13px; font-weight: 900; color: #991b1b;">
                            <span>New Outstanding Debt:</span>
                            <span>Rs ${(newDebt || 0).toFixed(2)}</span>
                        </div>
                    </div>
                    <div class="summary-row" style="font-size: 13px; font-weight: 900; color: #047857; margin-top: 8px; border-top: 1px dashed #dc2626; padding-top: 6px;">
                        <span>CASH REFUNDED:</span>
                        <span>Rs ${actualCashRefund.toFixed(2)}</span>
                    </div>
                </div>
            `;
        } else {
            // No debt, just cash refund
            paymentRows += `
                <div class="summary-row" style="font-weight: bold; margin-bottom: 8px; font-size: 16px; color: #047857;">
                    <span>CASH REFUNDED:</span>
                    <span>Rs ${actualCashRefund.toFixed(2)}</span>
                </div>
            `;
        }
        
        if (originalPayments && originalPayments.length > 0) {
            paymentRows += `
                <div style="border-top: 1px dashed #ccc; margin: 8px 0; padding-top: 5px;">
                    <div style="font-size: 12px; font-weight: 600; text-align: center; margin-bottom: 4px;">Original Payments</div>
                    ${originalPayments.map(p => `
                        <div class="summary-row" style="font-size: 12px; color: #555;">
                            <span>${p.method}:</span>
                            <span>${p.amount.toFixed(2)}</span>
                        </div>
                    `).join('')}
                </div>
            `;
        }
    } else {
        // Normal Sale
        paymentRows = paymentAmounts
            .filter(p => p.amount > 0)
            .map(p => `
                <div class="summary-row">
                    <span>Paid (${p.methodId === 'cash' ? 'Cash' : p.methodId === 'card' ? 'Card' : 'Credit'}):</span>
                    <span>${p.amount.toFixed(2)}</span>
                </div>
            `).join('');
    }

    return `
        <!DOCTYPE html>
        <html>
        <head>
            <title>Bill #${invoiceNumber}</title>
            <script src="https://cdn.jsdelivr.net/npm/jsbarcode@3.11.0/dist/JsBarcode.all.min.js"></script>
            <script src="https://cdnjs.cloudflare.com/ajax/libs/qrcodejs/1.0.0/qrcode.min.js"></script>
            <style>
                body {
                    font-family: 'Arial', 'Helvetica', sans-serif;
                    font-size: 14px;
                    line-height: 1.4;
                    width: 80mm; /* Standard receipt printer width */
                    margin: 0;
                    padding: 10px;
                    background: white;
                    color: black;
                }
                .header {
                    text-align: center;
                    margin-bottom: 12px;
                    border-bottom: 2px dashed #000;
                    padding-bottom: 12px;
                }
                .logo {
                    max-width: 60%;
                    max-height: 80px;
                    margin-bottom: 8px;
                    display: block;
                    margin-left: auto;
                    margin-right: auto;
                }
                .shop-name {
                    font-size: 18px;
                    font-weight: 800;
                    margin-bottom: 6px;
                    text-transform: uppercase;
                }
                .header-text {
                    font-size: 12px;
                    margin-bottom: 4px;
                    font-weight: 600;
                }
                .meta-info {
                    margin-bottom: 12px;
                    font-size: 12px;
                    text-align: center;
                }
                .customer-info {
                    margin-bottom: 12px;
                    border-bottom: 2px dashed #000;
                    padding-bottom: 8px;
                }
                table {
                    width: 100%;
                    border-collapse: collapse;
                    margin-bottom: 12px;
                }
                th {
                    text-align: left;
                    border-bottom: 2px solid #000;
                    padding: 4px 0;
                    font-weight: 800;
                    font-size: 13px;
                }
                td {
                    padding: 6px 0;
                    vertical-align: top;
                }
                .text-right {
                    text-align: right;
                }
                .item-name {
                    width: 45%;
                    font-weight: 500;
                }
                .item-discount {
                    font-size: 11px;
                    font-style: italic;
                    color: #444;
                }
                .totals {
                    border-top: 2px dashed #000;
                    padding-top: 8px;
                    margin-bottom: 12px;
                }
                .summary-row {
                    display: flex;
                    justify-content: space-between;
                    margin-bottom: 4px;
                }
                .grand-total {
                    font-weight: 900;
                    font-size: 18px;
                    margin-top: 8px;
                    border-top: 2px solid #000;
                    padding-top: 8px;
                }
                .footer {
                    text-align: center;
                    margin-top: 20px;
                    font-size: 12px;
                    font-weight: 500;
                }
                .software-credit {
                    margin-top: 10px;
                    font-size: 10px;
                    color: #666;
                    border-top: 1px dotted #ccc;
                    padding-top: 5px;
                }
                #barcode {
                    width: 100%;
                    height: 40px;
                    margin: 5px 0;
                }
                #qrcode img {
                    margin: 0 auto;
                }
                @media print {
                    @page {
                        margin: 0;
                        size: auto; 
                    }
                    body {
                        margin: 0;
                        padding: 5px;
                    }
                }
            </style>
        </head>
        <body>
            <div class="header">
                <div class="shop-name">${posSettings.storeName}</div>
                ${printSettings.showLogo && savedLogoPath ? `<img src="${savedLogoPath}" class="logo" alt="Logo" />` : ''}
                ${isReturn ? '<div style="font-weight:900; font-size:16px; margin: 5px 0; border: 2px solid black; padding: 2px;">RETURN RECEIPT</div>' : ''}
                ${printSettings.headerText ? `<div class="header-text">${printSettings.headerText}</div>` : ''}
                <div>${posSettings.storeAddress}</div>
                <div>Tel: ${posSettings.storePhone}</div>
                ${posSettings.storeEmail ? `<div>${posSettings.storeEmail}</div>` : ''}
            </div>

            <div class="meta-info">
                <div class="summary-row">
                    <span>${isReturn ? 'Ref Invoice' : 'Invoice'} #: ${invoiceNumber}</span>
                </div>
                <div class="summary-row">
                    <span>Date: ${dateStr}</span>
                    <span>Time: ${timeStr}</span>
                </div>
            </div>

            ${customer ? `
            <div class="customer-info">
                <strong>Customer:</strong> ${customer.name}<br/>
                Tel: ${customer.contact}
            </div>
            ` : ''}

            <table>
                <thead>
                    <tr>
                        <th class="item-name">Item</th>
                        <th class="text-right">Qty</th>
                        <th class="text-right">Price</th>
                        <th class="text-right">Total</th>
                    </tr>
                </thead>
                <tbody>
                    ${itemsRows}
                </tbody>
            </table>

            <div class="totals">
                <div class="summary-row">
                    <span>Subtotal:</span>
                    <span>${subtotal.toFixed(2)}</span>
                </div>
                ${discount > 0 ? `
                <div class="summary-row">
                    <span>Discount (${discount}%):</span>
                    <span>-${discountAmount.toFixed(2)}</span>
                </div>
                ` : ''}
                <div class="summary-row grand-total">
                    <span>TOTAL:</span>
                    <span>${total.toFixed(2)}</span>
                </div>
            </div>

            <div class="totals">
                ${paymentRows}
                <div class="summary-row" style="margin-top: 5px; font-weight: bold;">
                    <span>${balance >= 0 ? 'Change' : 'Balance Due'}:</span>
                    <span>${Math.abs(balance).toFixed(2)}</span>
                </div>
            </div>

            <div class="footer">
                ${printSettings.showQR ? `
                <div style="display: flex; justify-content: center; margin-bottom: 10px;">
                    <div id="qrcode"></div>
                </div>
                ` : ''}

                <div style="margin-bottom: 10px;">
                    ${printSettings.footerText}
                </div>
                
                <div style="margin-top: 15px; padding-top: 10px; border-top: 1px dashed #000; text-align: center;">
                    <div style="font-size: 10px; font-weight: 800; margin-bottom: 2px; text-transform: uppercase; color: #333;">
                        ${isReturn ? 'Return' : 'Sale'} Transaction
                    </div>
                    <div style="font-size: 14px; font-weight: 900; margin-bottom: 5px;">
                        #${invoiceNumber}
                    </div>
                    <div style="display: flex; justify-content: center; margin-bottom: 5px;">
                        <svg id="barcode-bottom"></svg>
                    </div>
                </div>

                <div class="software-credit">
                    REOX POS System by <strong>1000D Technology (Pvt) Ltd.</strong>
                    <br/>
                    Contact us - 0774227449
                </div>
            </div>

            <script>
                // Barcode Bottom (Always shown)
                try {
                    JsBarcode("#barcode-bottom", "${invoiceNumber}", {
                        format: "CODE128",
                        width: 1.5,
                        height: 45,
                        displayValue: false, // We show it above manually for better styling
                        margin: 0,
                        fontSize: 12,
                        textMargin: 0
                    });
                } catch (e) {
                    console.error("Bottom Barcode generation failed", e);
                }

                // Header Barcode (Optional based on settings)
                ${printSettings.showBarcode ? `
                try {
                    // Logic for old barcode element if it exists
                    if(document.getElementById("barcode")) {
                         JsBarcode("#barcode", "${invoiceNumber}", {
                            format: "CODE128",
                            width: 1.5,
                            height: 40,
                            displayValue: true,
                            margin: 0,
                            fontSize: 12,
                            textMargin: 0
                        });
                    }
                } catch (e) {
                    console.error("Header Barcode generation failed", e);
                }
                ` : ''}

                // QR Code
                ${printSettings.showQR ? `
                try {
                    new QRCode(document.getElementById("qrcode"), {
                        text: "MECARD:N:Mediland ;ORG:Mediland Healthcare ;TEL:+94777904907;EMAIL:info@mediland@gmail.com;ADR:67/1/1, Samudrasanna Road, Mount lavinia, Srilanka.;;",
                        width: 80,
                        height: 80,
                        colorDark : "#000000",
                        colorLight : "#ffffff",
                        correctLevel : QRCode.CorrectLevel.H
                    });
                } catch (e) {
                    console.error("QR Code generation failed", e);
                }
                ` : ''}
            </script>
        </body>
        </html>
    `;
};

export const printBill = (data: BillData) => {
    const printWindow = window.open('', '_blank');
    if (printWindow) {
        const html = generateBillHTML(data);
        printWindow.document.write(html);
        printWindow.document.close();
        
        // Wait for content to load then print
        printWindow.onload = () => {
            printWindow.focus();
            printWindow.print();
            // Optional: Close window after printing
            // printWindow.close();
        };
    } else {
        console.error("Failed to open print window");
    }
};
