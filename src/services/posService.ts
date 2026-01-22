import axiosInstance from '../api/axiosInstance';

export const posService = {
    //get available products for POS
    getPOSProductsList : ()=> 
        axiosInstance.get('/api/pos/products/available'),
    
    //search product by barcode
    searchByBarcode : (barcode: string)=> 
        axiosInstance.get(`/api/pos/products/barcode/${barcode}`),

    // search products
    searchProducts: (query: string) =>
        axiosInstance.get('/api/pos/products/search', { params: { query } }),

    //create invoice
    createInvoice: (data: any) =>
        axiosInstance.post('/api/pos/invoice', data),

    // convert bulk stock to loose stock
    convertBulkToLoose: (data: { bulkStockId: number, looseStockId: number, deductQty: number, addQty: number }) =>
        axiosInstance.post('/api/pos/convert', data),

    // get invoice by number
    getInvoiceByNo: (invoiceNo: string) =>
        axiosInstance.get(`/api/pos/invoice/${invoiceNo}`),

    // process return
    processReturn: (data: { invoiceNo: string, items: { id: number, returnQuantity: number }[] }) =>
        axiosInstance.post('/api/pos/return', data),
}
