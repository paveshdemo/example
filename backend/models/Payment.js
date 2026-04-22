const mongoose = require('mongoose');

const paymentSchema = new mongoose.Schema({
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
  amount: {
    type: Number,
    required: [true, 'Payment amount is required'],
    min: [1, 'Amount must be greater than 0']
  },
  transactionReference: {
    type: String,
    trim: true
  },
  paymentMethod: {
    type: String,
    enum: ['bank_transfer', 'credit_card', 'debit_card', 'cash', 'cheque', 'online'],
    default: 'bank_transfer'
  },
  proof: {
    type: String  // file path for payment proof
  },
  status: {
    type: String,
    enum: ['pending', 'verified', 'rejected'],
    default: 'pending'
  },
  // Installment fields
  installmentOption: {
    type: String,
    enum: ['full', '3x'],
    default: 'full'
  },
  installmentTerm: {
    type: Number,
    enum: [1, 2, 3],
    default: 1
  },
  totalInstallmentAmount: {
    type: Number,  // Total amount for the 3x plan
    default: null
  },
  remainingBalance: {
    type: Number,
    default: 0  // Balance remaining after this payment
  },
  adminRemarks: {
    type: String
  },
  verifiedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  verifiedAt: {
    type: Date
  }
}, {
  timestamps: true
});

module.exports = mongoose.model('Payment', paymentSchema);
