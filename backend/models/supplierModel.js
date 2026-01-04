const db = require("../config/db");

class Supplier {
    static async createCompany(companyData) {
        const query = `INSERT INTO company (company_name, company_email, company_contact) VALUES (?, ?, ?)`;
        const [result] = await db.execute(query, [companyData.name, companyData.email || null, companyData.contact]);
        return result.insertId;
    }

    static async createSupplier(data) {
        const query = `
            INSERT INTO supplier 
            (supplier_name, email, contact_number, company_id, bank_id, account_number) 
            VALUES (?, ?, ?, ?, ?, ?)
        `;
        const [result] = await db.execute(query, [
            data.supplierName,
            data.email || null,
            data.contactNumber,
            data.companyId,
            data.bankId || null,
            data.accountNumber || null
        ]);
        return result.insertId;
    }
}

module.exports = Supplier;