import axiosInstance from '../api/axiosInstance';

export const paymentTypeService = {
    //get payment type
    getPaymentType : ()=> 
        axiosInstance.get('/api/payment-types'),
}