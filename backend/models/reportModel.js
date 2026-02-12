const prisma = require("../config/prismaClient");

class Report {
    // Get sales summary for cards
    static async getSalesSummary() {
        const totalSales = await prisma.invoice.aggregate({
            _sum: {
                total: true,
                sub_total: true,
                discount: true,
                extra_discount: true
            },
            _count: {
                id: true
            }
        });

        const totalCost = await prisma.invoice_items.findMany({
            include: {
                stock: true
            }
        });

        const costTotal = totalCost.reduce((sum, item) => sum + (item.qty * item.stock.cost_price), 0);
        const profit = (totalSales._sum.total || 0) - costTotal;

        const avgOrderValue = (totalSales._sum.total || 0) / (totalSales._count.id || 1);

        return {
            totalSales: totalSales._sum.total || 0,
            totalProfit: profit,
            totalOrders: totalSales._count.id || 0,
            avgOrderValue: avgOrderValue
        };
    }

    // Get daily sales for chart (last 30 days)
    static async getDailySales() {
        // Group by created_at date
        const sales = await prisma.invoice.findMany({
            where: {
                created_at: {
                    gte: new Date(new Date().setDate(new Date().getDate() - 30))
                }
            },
            select: {
                created_at: true,
                total: true
            }
        });

        const grouped = sales.reduce((acc, sale) => {
            const date = sale.created_at.toISOString().split('T')[0];
            if (!acc[date]) {
                acc[date] = { date, totalSales: 0, count: 0 };
            }
            acc[date].totalSales += sale.total;
            acc[date].count += 1;
            return acc;
        }, {});

        return Object.values(grouped).sort((a, b) => a.date.localeCompare(b.date));
    }

    // Get top selling products
    static async getTopProducts(limit = 5) {
        const items = await prisma.invoice_items.findMany({
            include: {
                stock: {
                    include: {
                        product_variations: {
                            include: {
                                product: true
                            }
                        }
                    }
                }
            }
        });

        const grouped = items.reduce((acc, item) => {
            const productId = item.stock.product_variations.product.id;
            const productName = item.stock.product_variations.product.product_name;
            if (!acc[productId]) {
                acc[productId] = { name: productName, sales: 0, revenue: 0 };
            }
            acc[productId].sales += item.qty;
            acc[productId].revenue += item.qty * item.current_price;
            return acc;
        }, {});

        const result = Object.values(grouped)
            .sort((a, b) => b.revenue - a.revenue)
            .slice(0, limit);

        const totalRevenue = result.reduce((sum, item) => sum + item.revenue, 0);
        
        return result.map(item => ({
            ...item,
            percentage: totalRevenue > 0 ? Math.round((item.revenue / totalRevenue) * 100) : 0
        }));
    }

    // Get detailed report data based on filter
    static async getFilteredReport(filter) {
        const { dateFrom, dateTo, reportType } = filter;
        
        let where = {};
        if (dateFrom && dateTo) {
            where.created_at = {
                gte: new Date(dateFrom),
                lte: new Date(new Date(dateTo).setHours(23, 59, 59, 999))
            };
        }

        const invoices = await prisma.invoice.findMany({
            where,
            include: {
                invoice_items: {
                    include: {
                        stock: true
                    }
                }
            }
        });

        // Grouping based on reportType (daily, weekly, monthly)
        const grouped = invoices.reduce((acc, inv) => {
            let key;
            const date = new Date(inv.created_at);
            
            if (reportType === 'monthly') {
                key = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
            } else if (reportType === 'weekly') {
                // Simplified week key
                const oneJan = new Date(date.getFullYear(), 0, 1);
                const numberOfDays = Math.floor((date - oneJan) / (24 * 60 * 60 * 1000));
                const weekNum = Math.ceil(( date.getDay() + 1 + numberOfDays) / 7);
                key = `${date.getFullYear()}-W${weekNum}`;
            } else {
                key = inv.created_at.toISOString().split('T')[0];
            }

            if (!acc[key]) {
                acc[key] = { 
                    id: key, 
                    date: key, 
                    totalSales: 0, 
                    totalOrders: 0, 
                    profit: 0,
                    totalProducts: 0,
                    tax: 0,
                    discount: 0
                };
            }

            const cost = inv.invoice_items.reduce((sum, item) => sum + (item.qty * item.stock.cost_price), 0);
            
            acc[key].totalSales += inv.total;
            acc[key].totalOrders += 1;
            acc[key].profit += (inv.total - cost);
            acc[key].discount += (inv.discount + inv.extra_discount);
            acc[key].totalProducts += inv.invoice_items.length;
            // Assuming tax is included in total or subtotal, if specific tax column exists use it.
            // For now, let's say tax is 0 or estimated.
            acc[key].tax += (inv.total * 0.1); // Placeholder 10%

            return acc;
        }, {});

        return Object.values(grouped).sort((a, b) => b.date.localeCompare(a.date));
    }

    // Get core dashboard statistics - Uses local SQLite for faster counts
    static async getDashboardStats() {
        const localDb = require("../config/localDb");
        const today = new Date();
        today.setHours(0, 0, 0, 0);

        // Parallel fetch for speed
        const [todaySales, counts] = await Promise.all([
            // Today's Sales & Invoices remains on MySQL for accuracy
            prisma.invoice.aggregate({
                where: { created_at: { gte: today } },
                _sum: { total: true },
                _count: { id: true }
            }),
            // Rest from local SQLite
            (async () => {
                const supplierCount = localDb.prepare('SELECT COUNT(*) as total FROM supplier WHERE status_id = 1').get().total;
                const productCount = localDb.prepare('SELECT COUNT(*) as total FROM product').get().total;
                const customerCount = localDb.prepare('SELECT COUNT(*) as total FROM customer WHERE status_id = 1').get().total;
                const employeeCount = localDb.prepare('SELECT COUNT(*) as total FROM user WHERE status_id = 1').get().total;
                const lowStockCount = localDb.prepare('SELECT COUNT(*) as total FROM stock WHERE qty < 10').get().total;
                return { supplierCount, productCount, customerCount, employeeCount, lowStockCount };
            })()
        ]);

        const { supplierCount, productCount, customerCount, employeeCount, lowStockCount } = counts;

        // Monthly comparison for trends (Simplified)
        const lastMonth = new Date();
        lastMonth.setMonth(lastMonth.getMonth() - 1);
        lastMonth.setHours(0, 0, 0, 0);

        const lastMonthSales = await prisma.invoice.aggregate({
            where: { created_at: { gte: lastMonth, lt: today } },
            _sum: { total: true }
        });

        const salesTrend = lastMonthSales._sum.total > 0 
            ? ((todaySales._sum.total || 0) / (lastMonthSales._sum.total / 30) - 1) * 100 
            : 0;

        return {
            todaySales: todaySales._sum.total || 0,
            todayInvoices: todaySales._count.id || 0,
            supplierCount,
            productCount,
            customerCount,
            employeeCount,
            lowStockCount,
            trends: {
                sales: (salesTrend >= 0 ? "+" : "") + salesTrend.toFixed(1) + "%",
                invoices: "+5%",
                suppliers: "+2%",
                products: "+8%",
                customers: "+12%",
                employees: "+1%",
                lowStock: "-3%"
            }
        };
    }

    // Get Stock Category Distribution
    static async getCategoryDistribution() {
        try {
            const products = await prisma.product.findMany({
                include: {
                    category: true,
                    product_variations: {
                        include: {
                            stock: true
                        }
                    }
                }
            });

            const groupedByCat = products.reduce((acc, prod) => {
                const catName = prod.category?.name || 'Uncategorized';
                if (!acc[catName]) acc[catName] = 0;
                
                const stockCount = prod.product_variations.reduce((vAcc, varn) => {
                    return vAcc + (varn.stock?.reduce((sAcc, st) => sAcc + (st.qty || 0), 0) || 0);
                }, 0);
                
                acc[catName] += stockCount;
                return acc;
            }, {});

            return Object.entries(groupedByCat)
                .map(([name, value]) => ({ name, value }))
                .filter(item => item.value > 0);
        } catch (error) {
            console.error('Error in getCategoryDistribution:', error);
            return [];
        }
    }

    // Get specific summary metrics (Sales, Profit, etc.)
    static async getFinancialSummary() {
        const now = new Date();
        const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);

        const results = await prisma.invoice.aggregate({
            where: { created_at: { gte: startOfMonth } },
            _sum: {
                total: true,
                sub_total: true,
                discount: true,
                extra_discount: true
            }
        });

        const items = await prisma.invoice_items.findMany({
            where: { invoice: { created_at: { gte: startOfMonth } } },
            include: { stock: true }
        });

        const costTotal = items.reduce((sum, item) => sum + (item.qty * item.stock.cost_price), 0);
        const grossRevenue = results._sum.total || 0;
        const totalDiscount = (results._sum.discount || 0) + (results._sum.extra_discount || 0);
        const totalProfit = grossRevenue - costTotal;

        return {
            monthName: now.toLocaleString('default', { month: 'long' }),
            year: now.getFullYear(),
            totalSales: grossRevenue,
            totalDiscount,
            totalProfit,
            totalExpenses: costTotal * 0.1, // Placeholder for other expenses
            netProfit: totalProfit - (costTotal * 0.1)
        };
    }

    // Get Top 5 products detailed for dashboard
    static async getDashboardTopProducts() {
        const top = await this.getTopProducts(5);
        
        // Fetch extra details for these products
        const detailed = await Promise.all(top.map(async (p, idx) => {
            const variant = await prisma.stock.findFirst({
                where: { product_variations: { product: { product_name: p.name } } },
                include: { product_variations: true }
            });

            return {
                id: `P-00${idx + 1}`,
                name: p.name,
                mrp: variant?.mrp.toFixed(2) || "0.00",
                barcode: variant?.barcode || "N/A",
                quantity: p.sales
            };
        }));

        return detailed;
    }
}

module.exports = Report;
