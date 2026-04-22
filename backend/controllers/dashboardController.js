const Property = require('../models/Property');
const User = require('../models/User');
const Payment = require('../models/Payment');
const PurchaseRequest = require('../models/PurchaseRequest');
const ChangeRequest = require('../models/ChangeRequest');
const Feedback = require('../models/Feedback');

// @desc    Get admin dashboard data
// @route   GET /api/dashboard/admin
const getAdminDashboard = async (req, res) => {
  try {
    const [
      totalProperties,
      availableProperties,
      soldProperties,
      reservedProperties,
      totalCustomers,
      totalStaff,
      pendingPurchaseRequests,
      pendingChangeRequests,
      pendingPayments,
      verifiedPayments,
      totalFeedback,
      pendingInstallments
    ] = await Promise.all([
      Property.countDocuments(),
      Property.countDocuments({ status: 'available' }),
      Property.countDocuments({ status: 'sold' }),
      Property.countDocuments({ status: 'reserved' }),
      User.countDocuments({ role: 'customer' }),
      User.countDocuments({ role: { $in: ['admin', 'maintenance_staff'] } }),
      PurchaseRequest.countDocuments({ status: 'pending' }),
      ChangeRequest.countDocuments({ status: 'pending' }),
      Payment.countDocuments({ status: 'pending' }),
      Payment.find({ status: 'verified' }),
      Feedback.countDocuments(),
      Payment.find({ status: 'pending', installmentOption: '3x' })
    ]);

    const totalRevenue = verifiedPayments.reduce((sum, p) => sum + p.amount, 0);
    const pendingInstallmentsAmount = pendingInstallments.reduce((sum, p) => sum + p.remainingBalance, 0);

    // Recent activity
    const recentPayments = await Payment.find({ status: 'verified' })
      .populate('customer', 'name')
      .populate('property', 'title')
      .sort({ createdAt: -1 })
      .limit(5);

    const recentRequests = await PurchaseRequest.find()
      .populate('customer', 'name')
      .populate('property', 'title')
      .sort({ createdAt: -1 })
      .limit(5);

    res.json({
      success: true,
      data: {
        properties: { total: totalProperties, available: availableProperties, sold: soldProperties, reserved: reservedProperties },
        users: { customers: totalCustomers, staff: totalStaff },
        pendingActions: { purchaseRequests: pendingPurchaseRequests, changeRequests: pendingChangeRequests, payments: pendingPayments },
        financial: { totalRevenue, verifiedPayments: verifiedPayments.length, pendingInstallments: pendingInstallmentsAmount },
        feedback: { total: totalFeedback },
        recentPayments,
        recentRequests
      }
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Get customer dashboard data
// @route   GET /api/dashboard/customer
const getCustomerDashboard = async (req, res) => {
  try {
    const properties = await Property.find({ owner: req.user._id });
    const payments = await Payment.find({ customer: req.user._id, status: 'verified' });
    const pendingPayments = await Payment.find({ customer: req.user._id, status: 'pending' });
    const pendingInstallmentPayments = pendingPayments.filter(p => p.installmentOption === '3x');
    const changeRequests = await ChangeRequest.countDocuments({ customer: req.user._id });
    const pendingChangeRequests = await ChangeRequest.countDocuments({ customer: req.user._id, status: 'pending' });

    const totalPaid = payments.reduce((sum, p) => sum + p.amount, 0);
    const totalPropertyValue = properties.reduce((sum, p) => sum + p.price, 0);
    const totalPendingInstallments = pendingInstallmentPayments.reduce((sum, p) => sum + p.remainingBalance, 0);

    res.json({
      success: true,
      data: {
        properties: properties.map(p => ({
          _id: p._id,
          title: p.title,
          price: p.price,
          totalPaid: p.totalPaid,
          paymentPercentage: p.paymentPercentage,
          constructionStatus: p.constructionStatus,
          constructionPercentage: p.constructionPercentage
        })),
        financial: { totalPaid, totalPropertyValue, remaining: totalPropertyValue - totalPaid, pendingInstallments: totalPendingInstallments },
        requests: { total: changeRequests, pending: pendingChangeRequests },
        pendingPayments: pendingPayments.length
      }
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Get sales analytics (admin)
// @route   GET /api/dashboard/analytics/sales
const getSalesAnalytics = async (req, res) => {
  try {
    const salesByMonth = await PurchaseRequest.aggregate([
      { $match: { status: 'approved' } },
      { $group: { _id: { $dateToString: { format: '%Y-%m', date: '$reviewedAt' } }, count: { $sum: 1 } } },
      { $sort: { _id: 1 } }
    ]);

    const propertyByType = await Property.aggregate([
      { $group: { _id: '$type', count: { $sum: 1 }, sold: { $sum: { $cond: [{ $eq: ['$status', 'sold'] }, 1, 0] } } } }
    ]);

    const propertyByStatus = await Property.aggregate([
      { $group: { _id: '$status', count: { $sum: 1 } } }
    ]);

    res.json({
      success: true,
      data: { salesByMonth, propertyByType, propertyByStatus }
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Get financial analytics (admin)
// @route   GET /api/dashboard/analytics/finance
const getFinanceAnalytics = async (req, res) => {
  try {
    const paymentsByMonth = await Payment.aggregate([
      { $match: { status: 'verified' } },
      { $group: { _id: { $dateToString: { format: '%Y-%m', date: '$createdAt' } }, total: { $sum: '$amount' }, count: { $sum: 1 } } },
      { $sort: { _id: 1 } }
    ]);

    const paymentsByStatus = await Payment.aggregate([
      { $group: { _id: '$status', total: { $sum: '$amount' }, count: { $sum: 1 } } }
    ]);

    const paymentsByMethod = await Payment.aggregate([
      { $match: { status: 'verified' } },
      { $group: { _id: '$paymentMethod', total: { $sum: '$amount' }, count: { $sum: 1 } } }
    ]);

    res.json({
      success: true,
      data: { paymentsByMonth, paymentsByStatus, paymentsByMethod }
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

module.exports = { getAdminDashboard, getCustomerDashboard, getSalesAnalytics, getFinanceAnalytics };
