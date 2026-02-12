import type { PrintSettings } from '../types/settingConfig';

export interface BillData {
    invoiceId: number;
    invoiceNumber: string;
    date: Date;
    customer: {
        id: number;
        name: string;
        contact: string;
    } | null;
    items: {
        id: number;
        name: string;
        price: number;
        quantity: number;
        discount: number;
        category?: string;
        isBulk?: boolean;
    }[];
    subtotal: number;
    discount: number;
    total: number;
    paymentAmounts: {
        methodId: string;
        amount: number;
    }[];
    isReturn?: boolean;
}

export const printBill = (data: BillData) => {
    const printWindow = window.open('', '_blank');
    if (printWindow) {
        const html = generateBillHTML(data);
        printWindow.document.write(html);
        printWindow.document.close();
        printWindow.onload = () => {
            printWindow.focus();
            setTimeout(() => {
                printWindow.print();
                // Optional: close after print? 
                // printWindow.close(); 
            }, 500);
        };
    } else {
        console.error("Failed to open print window");
    }
};

const generateBillHTML = (data: BillData) => {
    // Load settings
    const savedPrintSettings = localStorage.getItem('printSettings');
    const savedPOSSettings = localStorage.getItem('posSettings');
    
    const printSettings: PrintSettings = savedPrintSettings ? JSON.parse(savedPrintSettings) : {
        language: 'english',
        rollSize: '80mm',
        fontSize: 'medium',
        headerText: 'WELCOME TO OUR STORE',
        footerText: 'Thank you for your purchase!',
        showLogo: true,
        showBarcode: true,
        showQR: false,
        paperWidth: '80',
        copies: 1,
        autocut: true,
        printDate: true,
        printTime: true
    };

    const posSettings = savedPOSSettings ? JSON.parse(savedPOSSettings) : {
        storeName: 'My POS Store',
        storeAddress: '123 Main Street',
        storePhone: '+1 234 567 8900',
        storeEmail: 'store@example.com'
    };

    const width = printSettings.rollSize === '58mm' ? '58mm' : '80mm';
    const fontSize = {
        'small': '10px',
        'medium': '12px',
        'large': '14px',
        'extra-large': '16px'
    }[printSettings.fontSize] || '12px';

    const labels = {
        'english': {
            invoice: 'Invoice',
            customer: 'Customer',
            item: 'Item',
            qty: 'Qty',
            price: 'Price',
            total: 'TOTAL',
            subtotal: 'Subtotal',
            discount: 'Discount',
            tel: 'Tel',
            inv: 'Inv',
            date: 'Date'
        },
        'sinhala': {
            invoice: 'ඉන්වොයිසිය',
            customer: 'පාරිභෝගිකයා',
            item: 'භාණ්ඩය',
            qty: 'ප්‍රමා.',
            price: 'මිල',
            total: 'මුළු එකතුව',
            subtotal: 'උප එකතුව',
            discount: 'වට්ටම්',
            tel: 'දුරකථන',
            inv: 'අංකය',
            date: 'දිනය'
        }
    };

    const t = labels[printSettings.language as keyof typeof labels] || labels['english'];

    return `
    <!DOCTYPE html>
    <html>
    <head>
        <title>${t.invoice} #${data.invoiceNumber}</title>
        <script src="https://cdn.jsdelivr.net/npm/jsbarcode@3.11.0/dist/JsBarcode.all.min.js"></script>
        <style>
            @page { margin: 0; }
            body { 
                font-family: 'Courier New', monospace; 
                width: ${width}; 
                margin: 0 auto; 
                padding: 10px; 
                font-size: ${fontSize};
                color: #000;
            }
            .text-center { text-align: center; }
            .text-right { text-align: right; }
            .font-bold { font-weight: bold; }
            .mb-2 { margin-bottom: 5px; }
            .border-b { border-bottom: 1px dashed #000; padding-bottom: 5px; margin-bottom: 5px; }
            .border-t { border-top: 1px dashed #000; padding-top: 5px; margin-top: 5px; }
            
            .header { margin-bottom: 10px; }
            .store-name { font-size: 1.2em; font-weight: bold; }
            
            table { width: 100%; border-collapse: collapse; }
            th { text-align: left; border-bottom: 1px solid #000; }
            td { vertical-align: top; }
            
            .item-row td { padding-bottom: 3px; }
            
            .totals { margin-top: 10px; }
            .footer { margin-top: 20px; text-align: center; font-size: 0.9em; }
            
            img.logo { max-width: 80%; height: auto; margin-bottom: 5px; }
            #barcode { height: 40px; margin-top: 10px; max-width: 100%; }
        </style>
    </head>
    <body>
        <div class="header text-center">
            ${printSettings.showLogo && localStorage.getItem('logoPath') ? 
                `<img src="${localStorage.getItem('logoPath')}" class="logo" />` : ''}
            
            <div class="store-name">${posSettings.storeName}</div>
            <div>${posSettings.storeAddress}</div>
            <div>${t.tel}: ${posSettings.storePhone}</div>
            <div class="border-b"></div>
            
            ${printSettings.headerText ? `<div class="mb-2 font-bold">${printSettings.headerText}</div>` : ''}
            
            <div style="display: flex; justify-content: space-between;">
                <span>${t.inv}: ${data.invoiceNumber}</span>
                ${printSettings.printDate ? `<span>${new Date(data.date).toLocaleDateString()}</span>` : ''}
            </div>
            ${printSettings.printTime ? `<div class="text-right">${new Date(data.date).toLocaleTimeString()}</div>` : ''}
            
            ${data.customer ? `
            <div class="text-left border-b">
                ${t.customer}: ${data.customer.name}<br/>
                ${data.customer.contact}
            </div>` : ''}
        </div>

        <table>
            <thead>
                <tr>
                    <th style="width: 45%">${t.item}</th>
                    <th style="width: 15%" class="text-center">${t.qty}</th>
                    <th style="width: 20%" class="text-right">${t.price}</th>
                    <th style="width: 20%" class="text-right">${t.total}</th>
                </tr>
            </thead>
            <tbody>
                ${data.items.map(item => {
                    const itemTotal = (item.price * item.quantity) - (item.discount || 0);
                    return `
                    <tr class="item-row">
                        <td colspan="4">${item.name}</td>
                    </tr>
                    <tr class="item-row">
                        <td></td>
                        <td class="text-center">${item.quantity}</td>
                        <td class="text-right">${item.price.toFixed(2)}</td>
                        <td class="text-right">${itemTotal.toFixed(2)}</td>
                    </tr>
                    ${item.discount > 0 ? `
                    <tr>
                        <td colspan="4" class="text-right" style="font-size: 0.9em;">(${t.discount}: -${item.discount.toFixed(2)})</td>
                    </tr>` : ''}
                    `;
                }).join('')}
            </tbody>
        </table>

        <div class="totals border-t">
            <div style="display: flex; justify-content: space-between;">
                <span>${t.subtotal}:</span>
                <span>${data.subtotal.toFixed(2)}</span>
            </div>
            ${data.discount > 0 ? `
            <div style="display: flex; justify-content: space-between;">
                <span>${t.discount}:</span>
                <span>-${data.discount.toFixed(2)}</span>
            </div>` : ''}
            
            <div style="display: flex; justify-content: space-between; font-weight: bold; font-size: 1.1em; margin-top: 5px; border-top: 1px solid #000; padding-top: 5px;">
                <span>${t.total}:</span>
                <span>${data.total.toFixed(2)}</span>
            </div>
            
            <div class="border-b" style="margin-top: 10px;"></div>
            
            ${data.paymentAmounts.map(p => `
            <div style="display: flex; justify-content: space-between;">
                <span>${p.methodId.toUpperCase()}:</span>
                <span>${p.amount.toFixed(2)}</span>
            </div>`).join('')}
        </div>

        <div class="footer">
            ${printSettings.footerText ? `<div>${printSettings.footerText}</div>` : ''}
            
            ${printSettings.showBarcode ? `
            <div>
                <svg id="barcode"></svg>
            </div>` : ''}
            
            <div style="margin-top: 10px; font-size: 0.8em;">Software by 1000D Technology</div>
        </div>

        <script>
            try {
                if (${printSettings.showBarcode}) {
                    JsBarcode("#barcode", "${data.invoiceNumber}", {
                        format: "CODE128",
                        width: 1.5,
                        height: 40,
                        displayValue: true
                    });
                }
            } catch (e) { console.error(e); }
        </script>
    </body>
    </html>
    `;
};