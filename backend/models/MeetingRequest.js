const mongoose = require('mongoose');

const meetingRequestSchema = new mongoose.Schema({
  customer: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  property: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Property'
  },
  title: {
    type: String,
    required: [true, 'Meeting title is required'],
    trim: true
  },
  description: {
    type: String
  },
  requestedDate: {
    type: Date,
    required: [true, 'Requested meeting date is required']
  },
  preferredTime: {
    type: String,
    enum: ['morning', 'afternoon', 'evening'],
    default: 'afternoon'
  },
  status: {
    type: String,
    enum: ['pending', 'scheduled', 'completed', 'cancelled'],
    default: 'pending'
  },
  assignedStaff: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  scheduledDate: {
    type: Date
  },
  meetingLocation: {
    type: String
  },
  notes: {
    type: String
  },
  cancelReason: {
    type: String
  },
  cancelledBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  cancelledAt: {
    type: Date
  }
}, {
  timestamps: true
});

meetingRequestSchema.index({ customer: 1, status: 1 });
meetingRequestSchema.index({ requestedDate: 1, status: 1 });

module.exports = mongoose.model('MeetingRequest', meetingRequestSchema);
