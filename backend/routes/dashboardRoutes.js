const express = require('express');
const router = express.Router();
const { getAdminDashboard, getCustomerDashboard, getSalesAnalytics, getFinanceAnalytics } = require('../controllers/dashboardController');
const { protect, authorize } = require('../middleware/auth');

router.get('/admin', protect, authorize('admin'), getAdminDashboard);
router.get('/customer', protect, authorize('customer'), getCustomerDashboard);
router.get('/analytics/sales', protect, authorize('admin'), getSalesAnalytics);
router.get('/analytics/finance', protect, authorize('admin'), getFinanceAnalytics);

module.exports = router;
