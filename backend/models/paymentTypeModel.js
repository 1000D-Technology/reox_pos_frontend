const prisma = require("../config/prismaClient");

class PaymentType {
    static async getPaymentType() {
        const paymentTypes = await prisma.payment_types.findMany({
            orderBy: {
                payment_types: 'asc'
            }
        });
        return paymentTypes;
    }
}

module.exports = PaymentType;