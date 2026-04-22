const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/auth');
const {
  createMeetingRequest,
  getAllMeetingRequests,
  getMyMeetingRequests,
  getMeetingRequest,
  scheduleMeetingRequest,
  completeMeetingRequest,
  cancelMeetingRequest,
  getStaffMeetings
} = require('../controllers/meetingController');

// Route order matters - more specific routes first
// Customer routes
router.post('/', protect, createMeetingRequest);
router.get('/my', protect, getMyMeetingRequests);
router.put('/:id/cancel', protect, cancelMeetingRequest);

// Admin and staff routes
router.get('/staff/:staffId', protect, getStaffMeetings);
router.get('/', protect, getAllMeetingRequests);
router.get('/:id', protect, getMeetingRequest);
router.put('/:id/schedule', protect, scheduleMeetingRequest);
router.put('/:id/complete', protect, completeMeetingRequest);

module.exports = router;
