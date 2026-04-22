const mongoose = require('mongoose');

const constructionUpdateSchema = new mongoose.Schema({
  property: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Property',
    required: true
  },
  updatedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  status: {
    type: String,
    enum: ['not_started', 'foundation', 'framing', 'roofing', 'interior', 'finishing', 'completed'],
    required: true
  },
  percentage: {
    type: Number,
    required: true,
    min: 0,
    max: 100
  },
  notes: {
    type: String
  },
  images: [{
    type: String
  }]
}, {
  timestamps: true
});

module.exports = mongoose.model('ConstructionUpdate', constructionUpdateSchema);
