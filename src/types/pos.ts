import type { Product } from './product';

export interface CartItem extends Product {
    quantity: number;
    discount: number;
    discountType: 'percentage' | 'fixed' | 'price'; // Required type
    discountAmount?: number;
    discountedPrice?: number;
    // Unit conversion fields
    subUnitName?: string;        // e.g., "Pieces"
    subUnitQuantity?: number;    // e.g., 24
    conversionFactor?: number;   // e.g., 12
}

export interface PaymentAmount {
    methodId: string;
    amount: number;
}