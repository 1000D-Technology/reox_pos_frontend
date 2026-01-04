const db = require("../config/db");

class Supplier {
    static async createCompany(companyData){
        const query = `INSERT INTO company (company_name, company_email, company_contact) VALUES (?, ?, ?)`;
        const [result] = await db.execute(query, [companyData.name, companyData.email || null, companyData.contact]);
        return result.insertId;
    }
}

module.exports = Supplier;