export interface QuotationData {
    quotationNumber: string;
    date: Date;
    validUntil: Date;
    customer: {
        name: string;
        contact: string;
        email?: string;
    } | null;
    items: {
        name: string;
        description?: string;
        quantity: number;
        unitPrice: number;
        discount: number; 
        total: number;
    }[];
    subtotal: number;
    discount: number;
    total: number;
    preparedBy: string;
}

export const printQuotation = (data: QuotationData) => {
    const printWindow = window.open('', '_blank');
    if (printWindow) {
        const html = generateQuotationHTML(data);
        printWindow.document.write(html);
        printWindow.document.close();
        printWindow.onload = () => {
            printWindow.focus();
            printWindow.print();
        };
    } else {
        console.error("Failed to open print window");
    }
};

const generateQuotationHTML = (data: QuotationData) => {
    // Fetch settings from localStorage, similar to bill printer
    const savedPOSSettings = localStorage.getItem('posSettings');
    const posSettings = savedPOSSettings ? JSON.parse(savedPOSSettings) : {
        storeName: 'REOX POS',
        storeAddress: '123 Business Street, Colombo',
        storePhone: '+94 77 123 4567',
        storeEmail: 'info@reoxpos.com'
    };

    return `
    <!DOCTYPE html>
    <html>
    <head>
        <title>Quotation #${data.quotationNumber}</title>
         <script src="https://cdn.jsdelivr.net/npm/jsbarcode@3.11.0/dist/JsBarcode.all.min.js"></script>
         <style>
            @page { size: A4; margin: 20mm; }
            body { font-family: 'Helvetica', 'Arial', sans-serif; font-size: 13px; line-height: 1.5; color: #333; margin: 0; padding: 20px; }
            
            .header { display: flex; justify-content: space-between; margin-bottom: 40px; border-bottom: 2px solid #059669; padding-bottom: 20px; }
            .company-info { font-size: 14px; }
            .company-name { font-size: 26px; font-weight: 800; color: #047857; margin-bottom: 5px; text-transform: uppercase; }
            .title { font-size: 32px; font-weight: 800; color: #e5e7eb; text-align: right; text-transform: uppercase; line-height: 1; }
            .meta { text-align: right; margin-top: 10px; font-size: 14px; }
            
            .bill-to { margin-bottom: 30px; background: #f9fafb; padding: 15px; border-radius: 8px; border-left: 4px solid #059669; }
            .bill-to h3 { font-size: 12px; color: #6b7280; text-transform: uppercase; margin: 0 0 8px 0; letter-spacing: 0.05em; }
            .customer-name { font-size: 18px; font-weight: bold; color: #111827; }
            
            table { width: 100%; border-collapse: collapse; margin-bottom: 30px; }
            th { background: #ecfdf5; color: #065f46; padding: 12px 10px; text-align: left; font-weight: bold; border-bottom: 2px solid #059669; font-size: 12px; text-transform: uppercase; }
            td { padding: 12px 10px; border-bottom: 1px solid #e5e5e5; }
            tr:last-child td { border-bottom: none; }
            .text-right { text-align: right; }
            .item-name { font-weight: 600; color: #1f2937; }
            
            .totals { margin-left: auto; width: 40%; background: #f9fafb; padding: 15px; border-radius: 8px; }
            .total-row { display: flex; justify-content: space-between; padding: 5px 0; color: #4b5563; }
            .total-row.final { font-size: 18px; font-weight: bold; border-top: 2px solid #374151; margin-top: 10px; padding-top: 10px; color: #111827; }
            
            .terms { margin-top: 50px; font-size: 11px; color: #6b7280; border-top: 1px solid #e5e5e5; padding-top: 15px; }

            .footer { margin-top: 40px; text-align: center; color: #9ca3af; font-size: 10px; }
            .barcode-container { margin-top: 20px; text-align: center; }
            #barcode { height: 40px; }
            
            .signature-area { margin-top: 60px; display: flex; justify-content: space-between; }
            .signature-box { text-align: center; }
            .signature-line { width: 200px; border-bottom: 1px dashed #9ca3af; margin-bottom: 8px; }
            .signature-label { font-size: 12px; color: #6b7280; }

        </style>
    </head>
    <body>
        <div class="header">
            <div class="company-info">
                <div class="company-name">${posSettings.storeName}</div>
                <div>${posSettings.storeAddress}</div>
                <div>Tel: ${posSettings.storePhone}</div>
                <div>Email: ${posSettings.storeEmail}</div>
            </div>
            <div>
                <div class="title">Quotation</div>
                <div class="meta">
                    <div><strong>Quotation #:</strong> ${data.quotationNumber}</div>
                    <div><strong>Date:</strong> ${new Date(data.date).toLocaleDateString()}</div>
                    <div><strong>Valid Until:</strong> ${new Date(data.validUntil).toLocaleDateString()}</div>
                </div>
            </div>
        </div>

        <div class="bill-to">
            <h3>Bill To</h3>
            <div class="customer-name">${data.customer?.name || 'Walk-in Customer'}</div>
            <div>${data.customer?.contact || ''}</div>
            <div>${data.customer?.email || ''}</div>
        </div>

        <table>
            <thead>
                <tr>
                    <th style="width: 5%;">#</th>
                    <th style="width: 45%;">Item Description</th>
                    <th class="text-right" style="width: 10%;">Qty</th>
                    <th class="text-right" style="width: 15%;">Unit Price</th>
                    <th class="text-right" style="width: 10%;">Discount</th>
                    <th class="text-right" style="width: 15%;">Total</th>
                </tr>
            </thead>
            <tbody>
                ${data.items.map((item, i) => `
                <tr>
                    <td>${i + 1}</td>
                    <td>
                        <div class="item-name">${item.name}</div>
                        ${item.description ? `<div style="font-size: 11px; color: #666;">${item.description}</div>` : ''}
                    </td>
                    <td class="text-right">${item.quantity}</td>
                    <td class="text-right">${item.unitPrice.toLocaleString('en-US', {minimumFractionDigits: 2})}</td>
                    <td class="text-right">${item.discount > 0 ? item.discount.toLocaleString('en-US', {minimumFractionDigits: 2}) : '-'}</td>
                    <td class="text-right font-bold">${item.total.toLocaleString('en-US', {minimumFractionDigits: 2})}</td>
                </tr>
                `).join('')}
            </tbody>
        </table>

        <div class="totals">
            <div class="total-row">
                <span>Subtotal:</span>
                <span>${data.subtotal.toLocaleString('en-US', {minimumFractionDigits: 2})}</span>
            </div>
            <div class="total-row">
                <span>Discount:</span>
                <span>${data.discount.toLocaleString('en-US', {minimumFractionDigits: 2})}</span>
            </div>
            <div class="total-row final">
                <span>Total (LKR):</span>
                <span>${data.total.toLocaleString('en-US', {minimumFractionDigits: 2})}</span>
            </div>
        </div>

        <div class="signature-area">
             <div class="signature-box">
                <div class="signature-line"></div>
                <div class="signature-label">Prepared By: ${data.preparedBy}</div>
            </div>
             <div class="signature-box">
                <div class="signature-line"></div>
                <div class="signature-label">Authorized Signature</div>
            </div>
        </div>

        <div class="terms">
            <strong>Terms & Conditions:</strong>
            <ul style="margin: 5px 0; padding-left: 20px;">
                <li>This quotation is valid for 7 days from the date of issue.</li>
                <li>Prices are subject to change without prior notice.</li>
                <li>Goods once sold will not be returned.</li>
                <li>This is a computer generated quotation.</li>
            </ul>
        </div>
        
        <div class="barcode-container">
            <svg id="barcode"></svg>
        </div>

        <div class="footer">
            Generated by REOX POS System | 1000D Technology (Pvt) Ltd.
        </div>
        
        <script>
            try {
                JsBarcode("#barcode", "${data.quotationNumber}", {
                    format: "CODE128",
                    width: 1.5,
                    height: 40,
                    displayValue: true,
                    fontSize: 12,
                    margin: 0
                });
            } catch (e) {
                console.error("Barcode generation failed", e);
            }
        </script>
    </body>
    </html>
    `;
};
