const mongoose = require('mongoose');

const propertySchema = new mongoose.Schema({
  title: {
    type: String,
    required: [true, 'Property title is required'],
    trim: true
  },
  description: {
    type: String,
    required: [true, 'Description is required']
  },
  type: {
    type: String,
    required: [true, 'Property type is required'],
    enum: ['apartment', 'house', 'villa', 'commercial', 'land', 'condo']
  },
  price: {
    type: Number,
    required: [true, 'Price is required'],
    min: 0
  },
  location: {
    address: { type: String, required: true },
    city: { type: String, required: true },
    state: { type: String, required: true },
    zipCode: { type: String },
    country: { type: String, default: 'India' }
  },
  features: {
    bedrooms: { type: Number, default: 0 },
    bathrooms: { type: Number, default: 0 },
    area: { type: Number, default: 0 },
    parking: { type: Boolean, default: false },
    furnished: { type: Boolean, default: false }
  },
  images: [{
    type: String
  }],
  status: {
    type: String,
    enum: ['available', 'sold', 'reserved'],
    default: 'available'
  },
  owner: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    default: null
  },
  assignedStaff: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  }],
  totalPaid: {
    type: Number,
    default: 0
  },
  paymentPercentage: {
    type: Number,
    default: 0
  },
  paymentStatus: {
    type: String,
    enum: ['pending', 'partial', 'completed'],
    default: 'pending'
  },
  constructionStatus: {
    type: String,
    enum: ['not_started', 'in_progress', 'completed'],
    default: 'not_started'
  },
  constructionPercentage: {
    type: Number,
    default: 0,
    min: 0,
    max: 100
  },
  approvedConstructionRequest: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'ChangeRequest',
    default: null
  }
}, {
  timestamps: true
});

// Text index for search
propertySchema.index({ title: 'text', description: 'text', 'location.city': 'text' });

module.exports = mongoose.model('Property', propertySchema);
