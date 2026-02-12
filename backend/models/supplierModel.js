const prisma = require("../config/prismaClient");
const PaginationHelper = require('../utils/paginationHelper');

class Supplier {
    static async checkCompanyExists(companyName) {
        const company = await prisma.company.findFirst({
            where: {
                company_name: companyName.trim()
            }
        });
        return !!company;
    }

    static async checkCompanyExistsById(companyId) {
        const company = await prisma.company.findUnique({
            where: { id: companyId }
        });
        return !!company;
    }

    static async getCompanyIdByName(companyName) {
        const company = await prisma.company.findFirst({
            where: { company_name: companyName.trim() },
            select: { id: true }
        });
        return company ? company.id : null;
    }
  
    static async getBankIdByName(bankName) {
        const bank = await prisma.bank.findFirst({
            where: { bank_name: bankName.trim() },
            select: { id: true }
        });
        return bank ? bank.id : null;
    }

    static async checkBankExistsById(bankId) {
        const bank = await prisma.bank.findUnique({
            where: { id: bankId }
        });
        return !!bank;
    }

    static async createCompany(companyData) {
        const company = await prisma.company.create({
            data: {
                company_name: companyData.name,
                company_email: companyData.email || null,
                company_contact: companyData.contact
            }
        });
        return company.id;
    }

    static async searchCompanies(searchTerm) {
        const localDb = require("../config/localDb");
        const companies = localDb.prepare(`
            SELECT id, company_name, company_email, company_contact
            FROM company
            WHERE company_name LIKE ?
            LIMIT 100
        `).all(`%${searchTerm}%`);
        return companies;
    }

    static async getAllCompanies() {
        return await prisma.company.findMany({
            orderBy: {
                created_at: 'desc'
            }
        });
    }

    static async updateCompany(id, data) {
        try {
            await prisma.company.update({
                where: { id: parseInt(id) },
                data: {
                    company_name: data.name,
                    company_email: data.email || null,
                    company_contact: data.contact
                }
            });
            return { affectedRows: 1 };
        } catch (error) {
            if (error.code === 'P2025') {
                return { affectedRows: 0 };
            }
            throw error;
        }
    }

    static async searchBanks(searchTerm) {
        const banks = await prisma.bank.findMany({
            where: {
                bank_name: {
                    contains: searchTerm
                }
            },
            select: {
                id: true,
                bank_name: true
            },
            take: 100
        });
        return banks;
    }

    static async createBank(bankData) {
        const bank = await prisma.bank.create({
            data: {
                bank_name: bankData.bankName
            }
        });
        return bank.id;
    }

    static async createSupplier(data) {
        const supplier = await prisma.supplier.create({
            data: {
                supplier_name: data.supplierName,
                email: data.email || null,
                contact_number: data.contactNumber,
                company_id: data.companyId,
                bank_id: data.bankId || null,
                account_number: data.accountNumber || null,
                status_id: 1
            }
        });
        return supplier.id;
    }

    static async getAllSuppliers(page = 1, limit = 10) {
        const localDb = require("../config/localDb");
        const skip = (page - 1) * limit;

        const countSql = `SELECT COUNT(*) as total FROM supplier`;
        const totalCount = localDb.prepare(countSql).get().total;

        const sql = `
            SELECT 
                s.id, s.supplier_name, s.email, s.contact_number, 
                c.company_name, c.company_contact, s.company_id,
                st.ststus as status
            FROM supplier s
            LEFT JOIN company c ON s.company_id = c.id
            LEFT JOIN status st ON s.status_id = st.id
            ORDER BY s.id DESC
            LIMIT ? OFFSET ?
        `;
        
        const suppliers = localDb.prepare(sql).all(parseInt(limit), skip);

        return {
            data: suppliers.map(s => ({
                id: s.id,
                supplierName: s.supplier_name,
                email: s.email,
                contactNumber: s.contact_number,
                companyName: s.company_name,
                companyContact: s.company_contact,
                companyId: s.company_id,
                status: s.status,
                joinedDate: 'Synced'
            })),
            pagination: PaginationHelper.getPaginationMetadata(page, limit, totalCount)
        };
    }

    static async getSupplierDropdownList() {
        const localDb = require("../config/localDb");
        const suppliers = localDb.prepare(`
            SELECT id, supplier_name
            FROM supplier
            WHERE status_id = 1
            ORDER BY supplier_name ASC
        `).all();

        return suppliers.map(s => ({
            id: s.id,
            supplierName: s.supplier_name
        }));
    }

    static async updateSupplier(id, data) {
        try {
            await prisma.supplier.update({
                where: { id: parseInt(id) },
                data: {
                    supplier_name: data.supplierName,
                    contact_number: data.contactNumber,
                    email: data.email || null,
                    company_id: parseInt(data.companyId),
                    bank_id: data.bankId ? parseInt(data.bankId) : null,
                    account_number: data.accountNumber || null
                }
            });
            return { affectedRows: 1 };
        } catch (error) {
            if (error.code === 'P2025') {
                return { affectedRows: 0 };
            }
            throw error;
        }
    }

    static async updateContact(supplierId, newContact) {
        try {
            await prisma.supplier.update({
                where: { id: parseInt(supplierId) },
                data: {
                    contact_number: newContact
                }
            });
            return { affectedRows: 1 };
        } catch (error) {
            if (error.code === 'P2025') {
                return { affectedRows: 0 };
            }
            throw error;
        }
    }

    static async updateStatus(supplierId, currentStatusId) {
        // Toggle status: if 1 (Active) change to 2 (Inactive), if 2 (Inactive) change to 1 (Active)
        const newStatusId = currentStatusId === 1 ? 2 : 1;
        try {
            await prisma.supplier.update({
                where: { id: parseInt(supplierId) },
                data: {
                    status_id: newStatusId
                }
            });
            return { affectedRows: 1 };
        } catch (error) {
            if (error.code === 'P2025') {
                return { affectedRows: 0 };
            }
            throw error;
        }
    }
}

module.exports = Supplier;
