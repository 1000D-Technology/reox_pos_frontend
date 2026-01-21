const db = require("../config/db");

class PaymentType {
    static async getPaymentType() {
        const [rows] = await db.execute(
            "SELECT id, payment_types FROM payment_types ORDER BY payment_types ASC"
        );

        return rows;
    }
}

module.exports = PaymentType;