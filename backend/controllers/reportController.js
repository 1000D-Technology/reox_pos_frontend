const Report = require("../models/reportModel");

const getReportDashboardData = async (req, res) => {
    try {
        const summary = await Report.getSalesSummary();
        const dailySales = await Report.getDailySales();
        const topProducts = await Report.getTopProducts();

        res.json({
            success: true,
            data: {
                summary,
                dailySales,
                topProducts
            }
        });
    } catch (error) {
        console.error('Error in getReportDashboardData:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to fetch report dashboard data'
        });
    }
};

const getFilteredReport = async (req, res) => {
    try {
        const filter = {
            dateFrom: req.query.dateFrom,
            dateTo: req.query.dateTo,
            reportType: req.query.reportType || 'daily'
        };

        const reportData = await Report.getFilteredReport(filter);

        res.json({
            success: true,
            data: reportData
        });
    } catch (error) {
        console.error('Error in getFilteredReport:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to fetch filtered report data'
        });
    }
};

// Combined Dashboard endpoint for optimized performance
const getDetailedDashboard = async (req, res) => {
    try {
        const [stats, summary, topProducts, categories, dailySales] = await Promise.all([
            Report.getDashboardStats(),
            Report.getFinancialSummary(),
            Report.getDashboardTopProducts(),
            Report.getCategoryDistribution(),
            Report.getDailySales()
        ]);

        res.json({
            success: true,
            data: {
                stats,
                summary,
                topProducts,
                categories,
                dailySales
            }
        });
    } catch (error) {
        console.error('Error in getDetailedDashboard:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to fetch dashboard data'
        });
    }
};

module.exports = {
    getReportDashboardData,
    getFilteredReport,
    getDetailedDashboard
};
