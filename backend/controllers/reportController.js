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

const getDetailedDashboard = async (req, res) => {
    try {
        const stats = await Report.getDashboardStats();
        const summary = await Report.getFinancialSummary();
        const topProducts = await Report.getDashboardTopProducts();
        const categories = await Report.getCategoryDistribution();

        res.json({
            success: true,
            data: {
                stats,
                summary,
                topProducts,
                categories
            }
        });
    } catch (error) {
        console.error('Error in getDetailedDashboard:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to fetch detailed dashboard data'
        });
    }
};

module.exports = {
    getReportDashboardData,
    getFilteredReport,
    getDetailedDashboard
};
