// Settings configuration interfaces

export interface PrintSettings {
    language: string;
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

export interface POSSettings {
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
    stockCodeType: 'barcode' | 'qr';
}
