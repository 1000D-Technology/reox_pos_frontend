import axiosInstance from '../api/axiosInstance';

export const posService = {
    //get available products for POS (Using standard stock variations API)
    // Get products with stock (Source stock for POS/Conversion)
    getPOSProductsList : ()=> 
        axiosInstance.get('/api/stock/all-variations', { params: { hasStock: true } }),

    //get all products (Using standard products API)
    getAllProductsList : ()=> 
        axiosInstance.get('/api/products'),
    
    //search product by barcode
    searchByBarcode : (barcode: string)=> 
        axiosInstance.get(`/api/pos/products/barcode/${barcode}`),

    // search products (Using standard stock search API for results)
    searchProducts: (query: string) =>
        axiosInstance.get('/api/stock/search', { params: { q: query } }),

    //create invoice
    createInvoice: (data: any) =>
        axiosInstance.post('/api/pos/invoice', data),

    // convert bulk stock to loose stock
    convertBulkToLoose: (data: { bulkStockId: number, looseVariationId: number, deductQty: number, addQty: number }) =>
        axiosInstance.post('/api/pos/convert', data),

    // get invoice by number
    getInvoiceByNo: (invoiceNo: string) =>
        axiosInstance.get(`/api/pos/invoice/${invoiceNo}`),

    // process return
    processReturn: (data: { invoiceNo: string, items: { id: number, returnQuantity: number }[] }) =>
        axiosInstance.post('/api/pos/return', data),
}
