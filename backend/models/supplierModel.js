const prisma = require("../config/prismaClient");

class Supplier {
    static async checkCompanyExists(companyName) {
        const company = await prisma.company.findFirst({
            where: {
                company_name: {
                    equals: companyName.trim()
                }
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
        const companies = await prisma.company.findMany({
            where: {
                company_name: {
                    contains: searchTerm
                }
            },
            select: {
                id: true,
                company_name: true
            },
            take: 100
        });
        return companies;
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

    static async getAllSuppliers() {
        const suppliers = await prisma.supplier.findMany({
            include: {
                company: {
                    select: {
                        company_name: true
                    }
                },
                bank: {
                    select: {
                        bank_name: true
                    }
                },
                status: {
                    select: {
                        ststus: true
                    }
                }
            },
            orderBy: {
                created_at: 'desc'
            }
        });

        return suppliers.map(s => ({
            id: s.id,
            supplierName: s.supplier_name,
            email: s.email,
            contactNumber: s.contact_number,
            companyName: s.company?.company_name,
            bankName: s.bank?.bank_name,
            accountNumber: s.account_number,
            status: s.status.ststus,
            status_id: s.status_id,
            joinedDate: s.created_at.toISOString().split('T')[0]
        }));
    }

    static async getSupplierDropdownList() {
        const suppliers = await prisma.supplier.findMany({
            where: {
                status_id: 1
            },
            select: {
                id: true,
                supplier_name: true
            },
            orderBy: {
                supplier_name: 'asc'
            }
        });

        return suppliers.map(s => ({
            id: s.id,
            supplierName: s.supplier_name
        }));
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
