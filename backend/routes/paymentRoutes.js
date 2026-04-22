const express = require('express');
const router = express.Router();
const {
  createPayment, getMyPayments, getAllPayments, getPayment,
  verifyPayment, rejectPayment, getPaymentProgress, getPaymentReports, getPropertyPayments
} = require('../controllers/paymentController');
const { protect, authorize } = require('../middleware/auth');
const { uploadPaymentProof } = require('../middleware/upload');

router.post('/', protect, authorize('customer'), uploadPaymentProof.single('proof'), createPayment);
router.get('/my', protect, authorize('customer'), getMyPayments);
router.get('/reports', protect, authorize('admin'), getPaymentReports);
router.get('/progress/:propertyId', protect, getPaymentProgress);
router.get('/property/:propertyId', protect, getPropertyPayments);
router.get('/', protect, authorize('admin'), getAllPayments);
router.get('/:id', protect, getPayment);
router.put('/:id/verify', protect, authorize('admin'), verifyPayment);
router.put('/:id/reject', protect, authorize('admin'), rejectPayment);

module.exports = router;
