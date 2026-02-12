import api from '../api/axiosConfig';

export interface InvoiceFilters {
    invoiceNumber?: string;
    cashierName?: string;
    customerId?: number;
    fromDate?: string;
    toDate?: string;
    page?: number;
    limit?: number;
    order?: 'asc' | 'desc';
}

export interface Invoice {
    id: number;
    invoiceID: string;
    grossAmount: string;
    discount: string;
    netAmount: string;
    profit: string;
    cashPay: string;
    cardPay: string;
    balance: string;
    issuedDate: string;
    cashier: string;
    customerName?: string;
    itemCount?: number;
    refundedAmount?: string;
    paymentMethods?: string;
}

export interface InvoiceStats {
    totalSales: number;
    totalProfit: number;
    invoiceCount: number;
    dateRange: string;
    totalRefunded?: number;
}

export interface InvoiceResponse {
    success: boolean;
    data: Invoice[];
    pagination: {
        currentPage: number;
        totalPages: number;
        totalRecords: number;
        itemsPerPage: number;
    };
}

export interface InvoiceStatsResponse {
    success: boolean;
    data: InvoiceStats;
}

export interface InvoiceDetail {
    id: number;
    invoiceNo: string;
    date: string;
    customer: string;
    customerId?: number;
    customerContact?: string;
    total: number;
    subTotal?: number;
    discount?: number;
    grossAmount?: number;
    profit?: number;
    creditBalance?: number;
    refundedAmount?: number;
    items: Array<{
        id: number;
        name: string;
        price: number;
        costPrice?: number;
        quantity: number;
        category?: string;
        isBulk?: boolean;
        returnedQuantity: number;
        returnQuantity: number;
    }>;
    payments: Array<{
        method: string;
        amount: number;
    }>;
}

export interface InvoiceDetailResponse {
    success: boolean;
    data: InvoiceDetail;
}

export const invoiceService = {
    /**
     * Get all invoices with optional filters and pagination
     */
    getAllInvoices: async (filters: InvoiceFilters = {}): Promise<InvoiceResponse> => {
        const params = new URLSearchParams();
        
        if (filters.invoiceNumber) params.append('invoiceNumber', filters.invoiceNumber);
        if (filters.cashierName) params.append('cashierName', filters.cashierName);
        if (filters.customerId) params.append('customerId', filters.customerId.toString());
        if (filters.fromDate) params.append('fromDate', filters.fromDate);
        if (filters.toDate) params.append('toDate', filters.toDate);
        if (filters.page) params.append('page', filters.page.toString());
        if (filters.limit) params.append('limit', filters.limit.toString());
        if (filters.order) params.append('order', filters.order);

        const response = await api.get(`/pos/invoices?${params.toString()}`);
        return response.data;
    },

    /**
     * Get invoice statistics
     */
    getInvoiceStats: async (filters?: { fromDate?: string; toDate?: string; cashierName?: string }): Promise<InvoiceStatsResponse> => {
        const params = new URLSearchParams();
        
        if (filters?.fromDate) params.append('fromDate', filters.fromDate);
        if (filters?.toDate) params.append('toDate', filters.toDate);
        if (filters?.cashierName) params.append('cashierName', filters.cashierName);

        const response = await api.get(`/pos/invoices/stats?${params.toString()}`);
        return response.data;
    },

    /**
     * Get single invoice details by invoice number
     */
    getInvoiceDetails: async (invoiceNo: string): Promise<InvoiceDetailResponse> => {
        const response = await api.get(`/pos/invoice/${invoiceNo}`);
        return response.data;
    },

    /**
     * Process payment for customer invoice
     */
    processInvoicePayment: async (paymentData: {
        invoice_id: string;
        payment_amount: number;
        payment_type_id: number;
        user_id?: number;
    }) => {
        const response = await api.post(`/pos/invoice/payment`, paymentData);
        return response.data;
    },

    /**
     * Process credit payment for customer (across multiple invoices)
     */
    processCreditPayment: async (paymentData: {
        customer_id: number;
        payment_amount: number;
        payment_type_id: number;
        user_id?: number;
    }) => {
        const response = await api.post(`/pos/credit/payment`, paymentData);
        return response.data;
    },

    /**
     * Get credit payment history for a customer
     */
    getCreditHistory: async (customerId: number, page: number = 1, limit: number = 10) => {
        const response = await api.get(`/pos/credit-history/${customerId}`, {
            params: { page, limit }
        });
        return response.data;
    }
};

export default invoiceService;
