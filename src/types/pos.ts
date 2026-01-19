import type { Product } from './product';

export interface CartItem extends Product {
    quantity: number;
    discount: number;
    discountType: 'percentage' | 'fixed' | 'price'; // Required type
}

export interface PaymentAmount {
    methodId: string;
    amount: number;
}