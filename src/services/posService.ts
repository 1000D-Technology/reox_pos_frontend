import axiosInstance from '../api/axiosInstance';

export const posService = {
    //get available products for POS
    getPOSProductsList : ()=> 
        axiosInstance.get('/api/pos/products/available'),
    
    //search product by barcode
    searchByBarcode : (barcode: string)=> 
        axiosInstance.get(`/api/pos/products/barcode/${barcode}`),
}
