const PurchaseRequest = require('../models/PurchaseRequest');
const Property = require('../models/Property');
const User = require('../models/User');
const { createNotification } = require('../utils/notification');

// @desc    Create purchase request
// @route   POST /api/purchase-requests
const createPurchaseRequest = async (req, res) => {
  try {
    const { propertyId, notes } = req.body;

    // Check property exists and is available
    const property = await Property.findById(propertyId);
    if (!property) {
      return res.status(404).json({ success: false, message: 'Property not found' });
    }
    if (property.status !== 'available') {
      return res.status(400).json({ success: false, message: 'Property is not available for purchase' });
    }

    // Check for duplicate request
    const existingRequest = await PurchaseRequest.findOne({
      property: propertyId,
      customer: req.user._id
    });
    if (existingRequest) {
      return res.status(400).json({ success: false, message: 'You have already submitted a request for this property' });
    }

    const purchaseRequest = await PurchaseRequest.create({
      property: propertyId,
      customer: req.user._id,
      customerName: req.user.name,
      customerEmail: req.user.email,
      customerPhone: req.user.phone || '',
      notes
    });

    res.status(201).json({ success: true, data: purchaseRequest });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Get my purchase requests (customer)
// @route   GET /api/purchase-requests/my
const getMyPurchaseRequests = async (req, res) => {
  try {
    const requests = await PurchaseRequest.find({ customer: req.user._id })
      .populate('property', 'title price status location images')
      .sort({ createdAt: -1 });
    res.json({ success: true, count: requests.length, data: requests });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Get all purchase requests (admin)
// @route   GET /api/purchase-requests
const getAllPurchaseRequests = async (req, res) => {
  try {
    const { status, propertyId } = req.query;
    let query = {};
    if (status) query.status = status;
    if (propertyId) query.property = propertyId;

    const requests = await PurchaseRequest.find(query)
      .populate('property', 'title price status location images')
      .populate('customer', 'name email phone')
      .sort({ createdAt: -1 });

    res.json({ success: true, count: requests.length, data: requests });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Get single purchase request
// @route   GET /api/purchase-requests/:id
const getPurchaseRequest = async (req, res) => {
  try {
    const request = await PurchaseRequest.findById(req.params.id)
      .populate('property')
      .populate('customer', 'name email phone address');

    if (!request) {
      return res.status(404).json({ success: false, message: 'Purchase request not found' });
    }
    res.json({ success: true, data: request });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Approve purchase request & finalize sale
// @route   PUT /api/purchase-requests/:id/approve
const approvePurchaseRequest = async (req, res) => {
  try {
    const request = await PurchaseRequest.findById(req.params.id);
    if (!request) {
      return res.status(404).json({ success: false, message: 'Request not found' });
    }
    if (request.status !== 'pending') {
      return res.status(400).json({ success: false, message: 'Request already processed' });
    }

    // Check property still available
    const property = await Property.findById(request.property);
    if (!property || property.status !== 'available') {
      return res.status(400).json({ success: false, message: 'Property is no longer available' });
    }

    // Approve request
    request.status = 'approved';
    request.adminNotes = req.body.adminNotes || '';
    request.reviewedBy = req.user._id;
    request.reviewedAt = new Date();
    await request.save();

    // Update property status and assign owner
    property.status = 'sold';
    property.owner = request.customer;
    await property.save();

    // Reject all other pending requests for this property
    await PurchaseRequest.updateMany(
      { property: request.property, _id: { $ne: request._id }, status: 'pending' },
      { status: 'rejected', adminNotes: 'Property sold to another buyer', reviewedBy: req.user._id, reviewedAt: new Date() }
    );

    // Notify customer
    await createNotification(
      request.customer,
      'Purchase Request Approved',
      `Your purchase request for property "${property.title}" has been approved!`,
      'purchase_approved',
      request._id
    );

    res.json({ success: true, data: request, message: 'Purchase request approved and sale finalized' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Reject purchase request
// @route   PUT /api/purchase-requests/:id/reject
const rejectPurchaseRequest = async (req, res) => {
  try {
    const request = await PurchaseRequest.findById(req.params.id);
    if (!request) {
      return res.status(404).json({ success: false, message: 'Request not found' });
    }
    if (request.status !== 'pending') {
      return res.status(400).json({ success: false, message: 'Request already processed' });
    }

    request.status = 'rejected';
    request.adminNotes = req.body.adminNotes || 'Request rejected by admin';
    request.reviewedBy = req.user._id;
    request.reviewedAt = new Date();
    await request.save();

    const property = await Property.findById(request.property);

    await createNotification(
      request.customer,
      'Purchase Request Rejected',
      `Your purchase request for property "${property ? property.title : ''}" has been rejected. Reason: ${request.adminNotes}`,
      'purchase_rejected',
      request._id
    );

    res.json({ success: true, data: request });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Update purchase request status (general)
// @route   PUT /api/purchase-requests/:id
const updatePurchaseRequest = async (req, res) => {
  try {
    const request = await PurchaseRequest.findById(req.params.id);
    if (!request) {
      return res.status(404).json({ success: false, message: 'Request not found' });
    }
    const { status, adminNotes } = req.body;
    if (status === 'approved') {
      // Delegate to approve logic
      const property = await Property.findById(request.property);
      if (!property || property.status !== 'available') {
        return res.status(400).json({ success: false, message: 'Property is no longer available' });
      }
      request.status = 'approved';
      request.adminNotes = adminNotes || '';
      request.reviewedBy = req.user._id;
      request.reviewedAt = new Date();
      await request.save();
      property.status = 'sold';
      property.owner = request.customer;
      await property.save();
      await PurchaseRequest.updateMany(
        { property: request.property, _id: { $ne: request._id }, status: 'pending' },
        { status: 'rejected', adminNotes: 'Property sold to another buyer', reviewedBy: req.user._id, reviewedAt: new Date() }
      );
      await createNotification(request.customer, 'Purchase Request Approved', `Your purchase request has been approved!`, 'purchase_approved', request._id);
    } else if (status === 'rejected') {
      request.status = 'rejected';
      request.adminNotes = adminNotes || '';
      request.reviewedBy = req.user._id;
      request.reviewedAt = new Date();
      await request.save();
      await createNotification(request.customer, 'Purchase Request Rejected', `Your purchase request has been rejected.`, 'purchase_rejected', request._id);
    }
    res.json({ success: true, data: request });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

module.exports = {
  createPurchaseRequest, getMyPurchaseRequests, getAllPurchaseRequests,
  getPurchaseRequest, approvePurchaseRequest, rejectPurchaseRequest, updatePurchaseRequest
};
