const express = require('express');
const router = express.Router();
const {
  createChangeRequest, getMyChangeRequests, getAllChangeRequests,
  getChangeRequest, updateChangeRequest, deleteChangeRequest,
  approveChangeRequest, rejectChangeRequest,
  assignStaffToRequest, removeStaffFromRequest
} = require('../controllers/changeRequestController');
const { protect, authorize } = require('../middleware/auth');

router.post('/', protect, authorize('customer'), createChangeRequest);
router.get('/my', protect, authorize('customer'), getMyChangeRequests);
router.get('/', protect, authorize('admin'), getAllChangeRequests);
router.get('/:id', protect, getChangeRequest);
router.put('/:id', protect, authorize('customer'), updateChangeRequest);
router.delete('/:id', protect, authorize('customer'), deleteChangeRequest);
router.put('/:id/approve', protect, authorize('admin'), approveChangeRequest);
router.put('/:id/reject', protect, authorize('admin'), rejectChangeRequest);
router.put('/:id/assign-staff', protect, authorize('admin'), assignStaffToRequest);
router.delete('/:id/assign-staff/:staffId', protect, authorize('admin'), removeStaffFromRequest);

module.exports = router;
