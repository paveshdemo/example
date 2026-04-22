const Feedback = require('../models/Feedback');
const { createNotification } = require('../utils/notification');

// @desc    Create feedback
// @route   POST /api/feedback
const createFeedback = async (req, res) => {
  try {
    const { title, message, category, rating, isAnonymous } = req.body;
    const feedback = await Feedback.create({
      customer: isAnonymous ? null : req.user._id,
      title, 
      message, 
      category, 
      rating,
      isAnonymous: isAnonymous || false
    });
    res.status(201).json({ success: true, data: feedback });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Get my feedback
// @route   GET /api/feedback/my
const getMyFeedback = async (req, res) => {
  try {
    const feedback = await Feedback.find({ customer: req.user._id })
      .sort({ createdAt: -1 });
    res.json({ success: true, count: feedback.length, data: feedback });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Get all feedback (admin)
// @route   GET /api/feedback
const getAllFeedback = async (req, res) => {
  try {
    const { status, category, customerId } = req.query;
    let query = {};
    if (status) query.status = status;
    if (category) query.category = category;
    if (customerId) query.customer = customerId;

    const feedback = await Feedback.find(query)
      .populate('customer', 'name email')
      .sort({ createdAt: -1 });

    res.json({ success: true, count: feedback.length, data: feedback });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Get single feedback
// @route   GET /api/feedback/:id
const getFeedback = async (req, res) => {
  try {
    const feedback = await Feedback.findById(req.params.id)
      .populate('customer', 'name email')
      .populate('respondedBy', 'name');

    if (!feedback) {
      return res.status(404).json({ success: false, message: 'Feedback not found' });
    }

    if (req.user.role === 'customer' && feedback.customer._id.toString() !== req.user._id.toString()) {
      return res.status(403).json({ success: false, message: 'Access denied' });
    }

    res.json({ success: true, data: feedback });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Update feedback (customer - before review)
// @route   PUT /api/feedback/:id
const updateFeedback = async (req, res) => {
  try {
    let feedback = await Feedback.findById(req.params.id);
    if (!feedback) {
      return res.status(404).json({ success: false, message: 'Feedback not found' });
    }
    if (feedback.customer.toString() !== req.user._id.toString()) {
      return res.status(403).json({ success: false, message: 'Access denied' });
    }
    if (feedback.status !== 'submitted') {
      return res.status(400).json({ success: false, message: 'Cannot edit reviewed/responded feedback' });
    }

    const { title, message, category, rating } = req.body;
    feedback = await Feedback.findByIdAndUpdate(
      req.params.id,
      { title, message, category, rating },
      { new: true, runValidators: true }
    );

    res.json({ success: true, data: feedback });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Delete feedback (customer)
// @route   DELETE /api/feedback/:id
const deleteFeedback = async (req, res) => {
  try {
    const feedback = await Feedback.findById(req.params.id);
    if (!feedback) {
      return res.status(404).json({ success: false, message: 'Feedback not found' });
    }
    if (feedback.customer.toString() !== req.user._id.toString()) {
      return res.status(403).json({ success: false, message: 'Access denied' });
    }

    await Feedback.findByIdAndDelete(req.params.id);
    res.json({ success: true, message: 'Feedback deleted' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Respond to feedback (admin)
// @route   PUT /api/feedback/:id/respond
const respondToFeedback = async (req, res) => {
  try {
    const feedback = await Feedback.findById(req.params.id);
    if (!feedback) {
      return res.status(404).json({ success: false, message: 'Feedback not found' });
    }

    feedback.adminResponse = req.body.adminResponse;
    feedback.status = 'responded';
    feedback.respondedBy = req.user._id;
    feedback.respondedAt = new Date();
    await feedback.save();

    // Only send notification if feedback is not anonymous
    if (!feedback.isAnonymous && feedback.customer) {
      await createNotification(
        feedback.customer,
        'Feedback Response',
        `Admin has responded to your feedback: "${feedback.title}"`,
        'feedback_response',
        feedback._id
      );
    }

    res.json({ success: true, data: feedback });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

module.exports = {
  createFeedback, getMyFeedback, getAllFeedback, getFeedback,
  updateFeedback, deleteFeedback, respondToFeedback
};
