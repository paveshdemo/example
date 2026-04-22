const mongoose = require('mongoose');

const feedbackSchema = new mongoose.Schema({
  customer: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  title: {
    type: String,
    required: [true, 'Feedback title is required'],
    trim: true
  },
  message: {
    type: String,
    required: [true, 'Feedback message is required']
  },
  category: {
    type: String,
    enum: ['general', 'service', 'maintenance', 'payment', 'suggestion', 'complaint'],
    default: 'general'
  },
  rating: {
    type: Number,
    min: 1,
    max: 5
  },
  status: {
    type: String,
    enum: ['submitted', 'reviewed', 'responded'],
    default: 'submitted'
  },
  adminResponse: {
    type: String
  },
  respondedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  respondedAt: {
    type: Date
  },
  isAnonymous: {
    type: Boolean,
    default: false
  }
}, {
  timestamps: true
});

module.exports = mongoose.model('Feedback', feedbackSchema);
