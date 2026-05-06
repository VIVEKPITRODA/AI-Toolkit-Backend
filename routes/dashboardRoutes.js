const express = require("express");
const router = express.Router();
const { protect } = require("../middleware/auth");
const {
  trackUsage,
  getDashboardSummary,
} = require("../controllers/dashboardController");

router.post("/track", protect, trackUsage);
router.get("/summary", protect, getDashboardSummary);

module.exports = router;