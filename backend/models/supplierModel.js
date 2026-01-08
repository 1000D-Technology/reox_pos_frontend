const db = require("../config/db");

class Supplier {
    static async checkCompanyExists(companyName) {
        const query = "SELECT id FROM company WHERE LOWER(company_name) = LOWER(?)";
        const [rows] = await db.execute(query, [companyName.trim()]);
        return rows.length > 0;
    }

    static async checkCompanyExistsById(companyId) {
        const query = "SELECT id FROM company WHERE id = ?";
        const [rows] = await db.execute(query, [companyId]);
        return rows.length > 0;
    }

    static async checkBankExistsById(bankId) {
        const query = "SELECT id FROM bank WHERE id = ?";
        const [rows] = await db.execute(query, [bankId]);
        return rows.length > 0;
    }

    static async createCompany(companyData) {
        const query = `INSERT INTO company (company_name, company_email, company_contact) VALUES (?, ?, ?)`;
        const [result] = await db.execute(query, [companyData.name, companyData.email || null, companyData.contact]);
        return result.insertId;
    }

    static async searchCompanies(searchTerm) {
        const query = "SELECT id, company_name FROM company WHERE company_name LIKE ? LIMIT 100";
        const [rows] = await db.execute(query, [`%${searchTerm}%`]);
        return rows;
    }

    static async searchBanks(searchTerm) {
        const query = "SELECT id, bank_name FROM bank WHERE bank_name LIKE ? LIMIT 100";
        const [rows] = await db.execute(query, [`%${searchTerm}%`]);
        return rows;
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

    static async getAllSuppliers() {
        const query = `
            SELECT 
                s.id,
                s.supplier_name AS supplierName,
                s.email,
                s.contact_number AS contactNumber,
                c.company_name AS companyName,
                b.bank_name AS bankName,
                s.account_number AS accountNumber,
                st.status_name AS status,
                s.status_id,
                DATE_FORMAT(s.created_at, '%Y-%m-%d') AS joinedDate
            FROM supplier s
            LEFT JOIN company c ON s.company_id = c.id
            LEFT JOIN bank b ON s.bank_id = b.id
            INNER JOIN status st ON s.status_id = st.id
            ORDER BY s.created_at DESC
        `;
        const [rows] = await db.execute(query);
        return rows;
    }

    static async updateContact(supplierId, newContact) {
        const query = `UPDATE supplier SET contact_number = ? WHERE id = ?`;
        const [result] = await db.execute(query, [newContact, supplierId]);
        return result;
    }

    static async updateStatus(supplierId, currentStatusId) {
        // Toggle status: if 1 (Active) change to 2 (Inactive), if 2 (Inactive) change to 1 (Active)
        const newStatusId = currentStatusId === 1 ? 2 : 1;
        const query = `UPDATE supplier SET status_id = ? WHERE id = ?`;
        const [result] = await db.execute(query, [newStatusId, supplierId]);
        return result;
    }
}

module.exports = Supplier;