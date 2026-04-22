const express = require('express');
const router = express.Router();
const {
  createFeedback, getMyFeedback, getAllFeedback, getFeedback,
  updateFeedback, deleteFeedback, respondToFeedback
} = require('../controllers/feedbackController');
const { protect, authorize, optionalAuth } = require('../middleware/auth');

// Allow both authenticated and anonymous feedback
router.post('/', optionalAuth, createFeedback);
router.get('/my', protect, authorize('customer'), getMyFeedback);
router.get('/', protect, authorize('admin'), getAllFeedback);
router.get('/:id', protect, getFeedback);
router.put('/:id', protect, authorize('customer'), updateFeedback);
router.delete('/:id', protect, authorize('customer'), deleteFeedback);
router.put('/:id/respond', protect, authorize('admin'), respondToFeedback);

module.exports = router;
