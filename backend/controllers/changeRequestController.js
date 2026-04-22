const ChangeRequest = require('../models/ChangeRequest');
const Property = require('../models/Property');
const { createNotification } = require('../utils/notification');

// @desc    Create change request
// @route   POST /api/change-requests
const createChangeRequest = async (req, res) => {
  try {
    const { property, type, title, description, priority } = req.body;

    // Verify customer owns the property
    const prop = await Property.findById(property);
    if (!prop) {
      return res.status(404).json({ success: false, message: 'Property not found' });
    }
    if (prop.owner.toString() !== req.user._id.toString()) {
      return res.status(403).json({ success: false, message: 'You do not own this property' });
    }

    const request = await ChangeRequest.create({
      property, customer: req.user._id, type, title, description, priority
    });

    res.status(201).json({ success: true, data: request });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Get my change requests
// @route   GET /api/change-requests/my
const getMyChangeRequests = async (req, res) => {
  try {
    const requests = await ChangeRequest.find({ customer: req.user._id })
      .populate('property', 'title _id')
      .sort({ createdAt: -1 });
    res.json({ success: true, count: requests.length, data: requests });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Get all change requests (admin)
// @route   GET /api/change-requests
const getAllChangeRequests = async (req, res) => {
  try {
    const { status, propertyId, customerId } = req.query;
    let query = {};
    if (status) query.status = status;
    if (propertyId) query.property = propertyId;
    if (customerId) query.customer = customerId;

    const requests = await ChangeRequest.find(query)
      .populate('property', 'title _id')
      .populate('customer', 'name email')
      .sort({ createdAt: -1 });

    res.json({ success: true, count: requests.length, data: requests });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Get single change request
// @route   GET /api/change-requests/:id
const getChangeRequest = async (req, res) => {
  try {
    const request = await ChangeRequest.findById(req.params.id)
      .populate('property', 'title location _id')
      .populate('customer', 'name email phone');

    if (!request) {
      return res.status(404).json({ success: false, message: 'Change request not found' });
    }

    // Customer can only see own requests
    if (req.user.role === 'customer' && request.customer._id.toString() !== req.user._id.toString()) {
      return res.status(403).json({ success: false, message: 'Access denied' });
    }

    res.json({ success: true, data: request });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Update change request (customer - pending only)
// @route   PUT /api/change-requests/:id
const updateChangeRequest = async (req, res) => {
  try {
    let request = await ChangeRequest.findById(req.params.id);
    if (!request) {
      return res.status(404).json({ success: false, message: 'Request not found' });
    }
    if (request.customer.toString() !== req.user._id.toString()) {
      return res.status(403).json({ success: false, message: 'Access denied' });
    }
    if (request.status !== 'pending') {
      return res.status(400).json({ success: false, message: 'Can only edit pending requests' });
    }

    const { type, title, description, priority } = req.body;
    request = await ChangeRequest.findByIdAndUpdate(
      req.params.id,
      { type, title, description, priority },
      { new: true, runValidators: true }
    );

    res.json({ success: true, data: request });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Delete change request (customer - pending only)
// @route   DELETE /api/change-requests/:id
const deleteChangeRequest = async (req, res) => {
  try {
    const request = await ChangeRequest.findById(req.params.id);
    if (!request) {
      return res.status(404).json({ success: false, message: 'Request not found' });
    }
    if (request.customer.toString() !== req.user._id.toString()) {
      return res.status(403).json({ success: false, message: 'Access denied' });
    }
    if (request.status !== 'pending') {
      return res.status(400).json({ success: false, message: 'Can only delete pending requests' });
    }

    await ChangeRequest.findByIdAndDelete(req.params.id);
    res.json({ success: true, message: 'Request deleted' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Approve change request (admin)
// @route   PUT /api/change-requests/:id/approve
const approveChangeRequest = async (req, res) => {
  try {
    const request = await ChangeRequest.findById(req.params.id);
    if (!request) {
      return res.status(404).json({ success: false, message: 'Request not found' });
    }
    if (request.status !== 'pending') {
      return res.status(400).json({ success: false, message: 'Request already processed' });
    }

    request.status = 'approved';
    request.adminNotes = req.body.adminNotes || '';
    request.reviewedBy = req.user._id;
    request.reviewedAt = new Date();
    await request.save();

    // Link the approved construction request to the property
    const property = await Property.findById(request.property);
    if (property) {
      property.approvedConstructionRequest = request._id;
      property.constructionStatus = 'in_progress';
      await property.save();
    }

    await createNotification(
      request.customer,
      'Change Request Approved',
      `Your change request "${request.title}" has been approved. Maintenance staff will be assigned shortly.`,
      'request_approved',
      request._id
    );

    res.json({ success: true, data: request });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Reject change request (admin)
// @route   PUT /api/change-requests/:id/reject
const rejectChangeRequest = async (req, res) => {
  try {
    const request = await ChangeRequest.findById(req.params.id);
    if (!request) {
      return res.status(404).json({ success: false, message: 'Request not found' });
    }
    if (request.status !== 'pending') {
      return res.status(400).json({ success: false, message: 'Request already processed' });
    }

    request.status = 'rejected';
    request.adminNotes = req.body.adminNotes || 'Rejected by admin';
    request.reviewedBy = req.user._id;
    request.reviewedAt = new Date();
    await request.save();

    await createNotification(
      request.customer,
      'Change Request Rejected',
      `Your change request "${request.title}" has been rejected. Reason: ${request.adminNotes}`,
      'request_rejected',
      request._id
    );

    res.json({ success: true, data: request });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Assign staff to change request
// @route   PUT /api/change-requests/:id/assign-staff
const assignStaffToRequest = async (req, res) => {
  try {
    const { staffId } = req.body;
    const request = await ChangeRequest.findById(req.params.id);
    
    if (!request) {
      return res.status(404).json({ success: false, message: 'Change request not found' });
    }

    // Only allow ONE staff per maintenance request
    if (request.assignedStaff && request.assignedStaff.length > 0) {
      return res.status(400).json({ 
        success: false, 
        message: 'A staff member is already assigned to this maintenance request. Only one staff member can be assigned per request.' 
      });
    }

    if (!request.assignedStaff.includes(staffId)) {
      request.assignedStaff.push(staffId);
      await request.save();
    }

    const updated = await ChangeRequest.findById(req.params.id)
      .populate('assignedStaff', 'name email phone role');

    res.json({ success: true, data: updated });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Remove staff from change request
// @route   DELETE /api/change-requests/:id/assign-staff/:staffId
const removeStaffFromRequest = async (req, res) => {
  try {
    const { staffId } = req.params;
    const request = await ChangeRequest.findById(req.params.id);
    
    if (!request) {
      return res.status(404).json({ success: false, message: 'Change request not found' });
    }

    request.assignedStaff = request.assignedStaff.filter(id => id.toString() !== staffId);
    await request.save();

    const updated = await ChangeRequest.findById(req.params.id)
      .populate('assignedStaff', 'name email phone role');

    res.json({ success: true, data: updated });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

module.exports = {
  createChangeRequest, getMyChangeRequests, getAllChangeRequests,
  getChangeRequest, updateChangeRequest, deleteChangeRequest,
  approveChangeRequest, rejectChangeRequest,
  assignStaffToRequest, removeStaffFromRequest
};
