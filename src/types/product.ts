export interface Product {
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
    unitId?: number;  // For unit conversion lookups
}