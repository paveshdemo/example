const MeetingRequest = require('../models/MeetingRequest');
const User = require('../models/User');
const Property = require('../models/Property');
const { createNotification } = require('../utils/notification');

// @desc    Create new meeting request (Customer)
// @route   POST /api/meetings
const createMeetingRequest = async (req, res) => {
  try {
    const { title, description, requestedDate, preferredTime, property } = req.body;

    if (!requestedDate) {
      return res.status(400).json({ success: false, message: 'Requested date is required' });
    }

    const meeting = await MeetingRequest.create({
      customer: req.user._id,
      title,
      description,
      requestedDate,
      preferredTime: preferredTime || 'afternoon',
      property,
      status: 'pending'
    });

    await meeting.populate('customer', 'name email phone');

    // Notify admin about new meeting request
    const admins = await User.find({ role: 'admin' });
    for (const admin of admins) {
      await createNotification(
        admin._id,
        'New Meeting Request',
        `New meeting request from ${meeting.customer.name}: "${title}"`,
        'meeting_request',
        meeting._id
      );
    }

    res.status(201).json({ success: true, data: meeting });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Get all meeting requests (Admin)
// @route   GET /api/meetings
const getAllMeetingRequests = async (req, res) => {
  try {
    const { status, customerId } = req.query;
    let query = {};

    if (status) query.status = status;
    if (customerId) query.customer = customerId;

    const meetings = await MeetingRequest.find(query)
      .populate('customer', 'name email phone')
      .populate('property', 'title')
      .populate('assignedStaff', 'name email phone')
      .sort({ requestedDate: 1 });

    res.json({ success: true, count: meetings.length, data: meetings });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Get my meeting requests (Customer)
// @route   GET /api/meetings/my
const getMyMeetingRequests = async (req, res) => {
  try {
    const meetings = await MeetingRequest.find({ customer: req.user._id })
      .populate('property', 'title')
      .populate('assignedStaff', 'name email phone')
      .sort({ requestedDate: 1 });

    res.json({ success: true, count: meetings.length, data: meetings });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Get single meeting request
// @route   GET /api/meetings/:id
const getMeetingRequest = async (req, res) => {
  try {
    const meeting = await MeetingRequest.findById(req.params.id)
      .populate('customer', 'name email phone')
      .populate('property', 'title address')
      .populate('assignedStaff', 'name email phone');

    if (!meeting) {
      return res.status(404).json({ success: false, message: 'Meeting request not found' });
    }

    // Access control: customer can only see their own, staff can see assigned
    if (req.user.role === 'customer' && meeting.customer._id.toString() !== req.user._id.toString()) {
      return res.status(403).json({ success: false, message: 'Access denied' });
    }

    if (req.user.role === 'maintenance_staff' && (!meeting.assignedStaff || meeting.assignedStaff._id.toString() !== req.user._id.toString())) {
      return res.status(403).json({ success: false, message: 'Access denied' });
    }

    res.json({ success: true, data: meeting });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Schedule meeting request (Admin assigns staff and sets date)
// @route   PUT /api/meetings/:id/schedule
const scheduleMeetingRequest = async (req, res) => {
  try {
    const { assignedStaffId, scheduledDate, meetingLocation } = req.body;

    if (!scheduledDate) {
      return res.status(400).json({ success: false, message: 'Scheduled date is required' });
    }

    let meeting = await MeetingRequest.findById(req.params.id);
    if (!meeting) {
      return res.status(404).json({ success: false, message: 'Meeting request not found' });
    }

    meeting.status = 'scheduled';
    meeting.assignedStaff = assignedStaffId;
    meeting.scheduledDate = scheduledDate;
    meeting.meetingLocation = meetingLocation;
    await meeting.save();

    await meeting.populate('customer', 'name email');
    await meeting.populate('assignedStaff', 'name email');

    // Notify customer about scheduled meeting
    await createNotification(
      meeting.customer._id,
      'Meeting Scheduled',
      `Your meeting request "${meeting.title}" has been scheduled for ${new Date(scheduledDate).toLocaleDateString()}`,
      'meeting_scheduled',
      meeting._id
    );

    // Notify assigned staff
    await createNotification(
      assignedStaffId,
      'New Meeting Assignment',
      `You have been assigned a new meeting with ${meeting.customer.name}`,
      'meeting_assigned',
      meeting._id
    );

    res.json({ success: true, data: meeting });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Mark meeting as completed
// @route   PUT /api/meetings/:id/complete
const completeMeetingRequest = async (req, res) => {
  try {
    const { notes } = req.body;

    const meeting = await MeetingRequest.findById(req.params.id);
    if (!meeting) {
      return res.status(404).json({ success: false, message: 'Meeting request not found' });
    }

    meeting.status = 'completed';
    if (notes) meeting.notes = notes;
    await meeting.save();

    await meeting.populate('customer', 'name email');

    // Notify customer
    await createNotification(
      meeting.customer._id,
      'Meeting Completed',
      `Your meeting "${meeting.title}" has been completed`,
      'meeting_completed',
      meeting._id
    );

    res.json({ success: true, data: meeting });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Cancel meeting request
// @route   PUT /api/meetings/:id/cancel
const cancelMeetingRequest = async (req, res) => {
  try {
    const { cancelReason } = req.body;

    const meeting = await MeetingRequest.findById(req.params.id);
    if (!meeting) {
      return res.status(404).json({ success: false, message: 'Meeting request not found' });
    }

    // Check access: customer can only cancel their own, admin can cancel any
    if (req.user.role === 'customer' && meeting.customer.toString() !== req.user._id.toString()) {
      return res.status(403).json({ success: false, message: 'Access denied' });
    }

    meeting.status = 'cancelled';
    meeting.cancelReason = cancelReason;
    meeting.cancelledBy = req.user._id;
    meeting.cancelledAt = new Date();
    await meeting.save();

    await meeting.populate('customer', 'name email');

    // Notify customer if cancelled by admin
    if (req.user.role !== 'customer') {
      await createNotification(
        meeting.customer._id,
        'Meeting Cancelled',
        `Your meeting request "${meeting.title}" has been cancelled${cancelReason ? ': ' + cancelReason : ''}`,
        'meeting_cancelled',
        meeting._id
      );
    }

    res.json({ success: true, data: meeting });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Get meetings assigned to staff member
// @route   GET /api/meetings/staff/:staffId
const getStaffMeetings = async (req, res) => {
  try {
    const meetings = await MeetingRequest.find({ 
      assignedStaff: req.params.staffId,
      status: { $in: ['scheduled', 'pending'] }
    })
      .populate('customer', 'name email phone')
      .populate('property', 'title address')
      .sort({ scheduledDate: 1 });

    res.json({ success: true, count: meetings.length, data: meetings });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

module.exports = {
  createMeetingRequest,
  getAllMeetingRequests,
  getMyMeetingRequests,
  getMeetingRequest,
  scheduleMeetingRequest,
  completeMeetingRequest,
  cancelMeetingRequest,
  getStaffMeetings
};
