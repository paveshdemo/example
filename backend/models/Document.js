const mongoose = require('mongoose');

const documentSchema = new mongoose.Schema({
  title: {
    type: String,
    required: [true, 'Document title is required'],
    trim: true
  },
  type: {
    type: String,
    enum: ['mandatory', 'additional'],
    required: true
  },
  category: {
    type: String,
    enum: ['sale_agreement', 'ownership_certificate', 'tax_document', 'insurance', 'inspection_report', 'other'],
    default: 'other'
  },
  filePath: {
    type: String,
    required: true
  },
  fileName: {
    type: String,
    required: true
  },
  fileSize: {
    type: Number
  },
  mimeType: {
    type: String
  },
  property: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Property',
    required: true
  },
  customer: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  uploadedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  description: {
    type: String
  }
}, {
  timestamps: true
});

module.exports = mongoose.model('Document', documentSchema);
