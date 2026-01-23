const express = require("express");
const router = express.Router();
const reportController = require("../controllers/reportController");

router.get("/dashboard", reportController.getReportDashboardData);
router.get("/dashboard-detailed", reportController.getDetailedDashboard);
router.get("/filter", reportController.getFilteredReport);

module.exports = router;
