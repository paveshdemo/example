const express = require('express');
const router = express.Router();
const {
  createPurchaseRequest, getMyPurchaseRequests, getAllPurchaseRequests,
  getPurchaseRequest, approvePurchaseRequest, rejectPurchaseRequest, updatePurchaseRequest
} = require('../controllers/purchaseRequestController');
const { protect, authorize } = require('../middleware/auth');

router.post('/', protect, authorize('customer'), createPurchaseRequest);
router.get('/my', protect, authorize('customer'), getMyPurchaseRequests);
router.get('/', protect, authorize('admin'), getAllPurchaseRequests);
router.get('/:id', protect, getPurchaseRequest);
router.put('/:id', protect, authorize('admin'), updatePurchaseRequest);
router.put('/:id/approve', protect, authorize('admin'), approvePurchaseRequest);
router.put('/:id/reject', protect, authorize('admin'), rejectPurchaseRequest);

module.exports = router;
