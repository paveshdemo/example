const mongoose = require('mongoose');

const documentAuditTrailSchema = new mongoose.Schema({
  document: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Document',
    required: true
  },
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  action: {
    type: String,
    enum: ['viewed', 'downloaded', 'uploaded', 'deleted'],
    required: true
  },
  ipAddress: {
    type: String
  },
  userAgent: {
    type: String
  },
  timestamp: {
    type: Date,
    default: Date.now
  }
}, {
  timestamps: true
});

// Create index for efficient querying
documentAuditTrailSchema.index({ document: 1, user: 1 });
documentAuditTrailSchema.index({ document: 1, timestamp: -1 });
documentAuditTrailSchema.index({ user: 1, timestamp: -1 });

module.exports = mongoose.model('DocumentAuditTrail', documentAuditTrailSchema);
