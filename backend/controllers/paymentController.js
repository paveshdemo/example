const Payment = require('../models/Payment');
const Property = require('../models/Property');
const { createNotification } = require('../utils/notification');

// @desc    Create payment
// @route   POST /api/payments
const createPayment = async (req, res) => {
  try {
    const { property, amount, transactionReference, paymentMethod, installmentOption } = req.body;

    console.log('Payment creation request received with:', {
      property,
      amount,
      paymentMethod,
      installmentOption,
      transactionReference,
      hasFile: !!req.file
    });

    // Verify customer owns the property
    const prop = await Property.findById(property);
    if (!prop) {
      return res.status(404).json({ success: false, message: 'Property not found' });
    }
    if (prop.owner.toString() !== req.user._id.toString()) {
      return res.status(403).json({ success: false, message: 'You do not own this property' });
    }

    if (amount <= 0) {
      return res.status(400).json({ success: false, message: 'Amount must be greater than 0' });
    }

    const paymentData = {
      property,
      customer: req.user._id,
      paymentMethod,
      transactionReference,
      installmentOption: installmentOption || 'full'
    };

    // Handle installment logic
    if (installmentOption === '3x') {
      const totalInstallmentAmount = parseFloat(amount);
      
      // Check if there are already verified 3x payments for this property
      const existingVerified3xPayments = await Payment.find({
        property: property,
        customer: req.user._id,
        installmentOption: '3x',
        status: 'verified'
      });

      let installmentTerm = 1;
      let originalTotalAmount = totalInstallmentAmount;
      
      if (existingVerified3xPayments.length > 0) {
        // This is a continuation payment
        console.log('Continuation payment detected. Existing verified payments:', 
          existingVerified3xPayments.map(p => ({
            term: p.installmentTerm,
            amount: p.amount,
            totalAmount: p.totalInstallmentAmount
          }))
        );
        
        const highestTerm = Math.max(...existingVerified3xPayments.map(p => p.installmentTerm));
        installmentTerm = highestTerm + 1;
        originalTotalAmount = existingVerified3xPayments[0].totalInstallmentAmount || totalInstallmentAmount;
      }
      
      const termAmount = Math.round((originalTotalAmount / 3) * 100) / 100;
      
      console.log('3x Payment calculation:', {
        isContinuation: existingVerified3xPayments.length > 0,
        receivedAmount: totalInstallmentAmount,
        originalTotalAmount: originalTotalAmount,
        calculatedTermAmount: termAmount,
        installmentTerm: installmentTerm,
        termsRemaining: 3 - installmentTerm + 1
      });
      
      paymentData.amount = termAmount;
      paymentData.totalInstallmentAmount = originalTotalAmount;
      paymentData.installmentTerm = installmentTerm;
      paymentData.remainingBalance = originalTotalAmount - (termAmount * installmentTerm);
    } else {
      paymentData.amount = parseFloat(amount);
      paymentData.totalInstallmentAmount = parseFloat(amount);
      paymentData.remainingBalance = 0;
    }

    // Handle uploaded proof
    if (req.file) {
      paymentData.proof = `/uploads/payments/${req.file.filename}`;
    }

    const payment = await Payment.create(paymentData);
    res.status(201).json({ success: true, data: payment });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Get customer payment history
// @route   GET /api/payments/my
const getMyPayments = async (req, res) => {
  try {
    const { propertyId } = req.query;
    let query = { customer: req.user._id };
    if (propertyId) query.property = propertyId;

    const payments = await Payment.find(query)
      .populate('property', 'title price totalPaid')
      .sort({ createdAt: -1 });
    
    // Ensure all payments have installmentOption set (fix for old payments)
    const enrichedPayments = payments.map(p => {
      const payment = p.toObject();
      if (!payment.installmentOption) {
        payment.installmentOption = 'full';
      }
      return payment;
    });
    
    res.json({ success: true, count: enrichedPayments.length, data: enrichedPayments });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Get all payments (admin)
// @route   GET /api/payments
const getAllPayments = async (req, res) => {
  try {
    const { status, propertyId, customerId, startDate, endDate } = req.query;
    let query = {};
    if (status) query.status = status;
    if (propertyId) query.property = propertyId;
    if (customerId) query.customer = customerId;
    if (startDate || endDate) {
      query.createdAt = {};
      if (startDate) query.createdAt.$gte = new Date(startDate);
      if (endDate) query.createdAt.$lte = new Date(endDate);
    }

    const payments = await Payment.find(query)
      .populate('property', 'title price')
      .populate('customer', 'name email')
      .sort({ createdAt: -1 });

    // Ensure all payments have installmentOption set (fix for old payments)
    const enrichedPayments = payments.map(p => {
      const payment = p.toObject();
      if (!payment.installmentOption) {
        payment.installmentOption = 'full';
      }
      return payment;
    });

    res.json({ success: true, count: enrichedPayments.length, data: enrichedPayments });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Get single payment
// @route   GET /api/payments/:id
const getPayment = async (req, res) => {
  try {
    const payment = await Payment.findById(req.params.id)
      .populate('property', 'title price location')
      .populate('customer', 'name email phone');

    if (!payment) {
      return res.status(404).json({ success: false, message: 'Payment not found' });
    }

    if (req.user.role === 'customer' && payment.customer._id.toString() !== req.user._id.toString()) {
      return res.status(403).json({ success: false, message: 'Access denied' });
    }

    // Ensure installmentOption is set (fix for old payments)
    const paymentData = payment.toObject();
    if (!paymentData.installmentOption) {
      paymentData.installmentOption = 'full';
    }

    res.json({ success: true, data: paymentData });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Verify payment (admin)
// @route   PUT /api/payments/:id/verify
const verifyPayment = async (req, res) => {
  try {
    const payment = await Payment.findById(req.params.id);
    if (!payment) {
      return res.status(404).json({ success: false, message: 'Payment not found' });
    }
    if (payment.status !== 'pending') {
      return res.status(400).json({ success: false, message: 'Payment already processed' });
    }

    payment.status = 'verified';
    payment.adminRemarks = req.body.adminRemarks || 'Payment verified';
    payment.verifiedBy = req.user._id;
    payment.verifiedAt = new Date();
    await payment.save();

    // Update property payment info
    const property = await Property.findById(payment.property);
    if (property) {
      property.totalPaid = (property.totalPaid || 0) + payment.amount;
      property.paymentPercentage = Math.min(
        100,
        Math.round((property.totalPaid / property.price) * 100)
      );
      property.paymentStatus = property.paymentPercentage >= 100 ? 'completed' : 'partial';
      await property.save();
    }

    // Don't automatically create Term 2 and Term 3
    // Customer will manually create payments for subsequent terms when ready

    await createNotification(
      payment.customer,
      'Payment Verified',
      `Your payment of $${payment.amount} has been verified.`,
      'payment_verified',
      payment._id
    );

    res.json({ success: true, data: payment });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Reject payment (admin)
// @route   PUT /api/payments/:id/reject
const rejectPayment = async (req, res) => {
  try {
    const payment = await Payment.findById(req.params.id);
    if (!payment) {
      return res.status(404).json({ success: false, message: 'Payment not found' });
    }
    if (payment.status !== 'pending') {
      return res.status(400).json({ success: false, message: 'Payment already processed' });
    }

    payment.status = 'rejected';
    payment.adminRemarks = req.body.adminRemarks || 'Payment rejected';
    payment.verifiedBy = req.user._id;
    payment.verifiedAt = new Date();
    await payment.save();

    await createNotification(
      payment.customer,
      'Payment Rejected',
      `Your payment of $${payment.amount} has been rejected. Reason: ${payment.adminRemarks}`,
      'payment_rejected',
      payment._id
    );

    res.json({ success: true, data: payment });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Get payment progress for a property
// @route   GET /api/payments/progress/:propertyId
const getPaymentProgress = async (req, res) => {
  try {
    const property = await Property.findById(req.params.propertyId);
    if (!property) {
      return res.status(404).json({ success: false, message: 'Property not found' });
    }

    const verifiedPayments = await Payment.find({
      property: req.params.propertyId,
      status: 'verified'
    });

    const totalPaid = verifiedPayments.reduce((sum, p) => sum + p.amount, 0);
    const percentage = Math.min(100, Math.round((totalPaid / property.price) * 100));

    res.json({
      success: true,
      data: {
        propertyPrice: property.price,
        totalPaid,
        remaining: Math.max(0, property.price - totalPaid),
        percentage,
        paymentCount: verifiedPayments.length,
        paymentStatus: property.paymentStatus
      }
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Get payment reports (admin)
// @route   GET /api/payments/reports
const getPaymentReports = async (req, res) => {
  try {
    const { startDate, endDate, propertyId, customerId } = req.query;
    let query = { status: 'verified' };
    if (propertyId) query.property = propertyId;
    if (customerId) query.customer = customerId;
    if (startDate || endDate) {
      query.createdAt = {};
      if (startDate) query.createdAt.$gte = new Date(startDate);
      if (endDate) query.createdAt.$lte = new Date(endDate);
    }

    const payments = await Payment.find(query)
      .populate('property', 'title price')
      .populate('customer', 'name email')
      .sort({ createdAt: -1 });

    const totalAmount = payments.reduce((sum, p) => sum + p.amount, 0);

    res.json({
      success: true,
      data: {
        payments,
        summary: {
          totalPayments: payments.length,
          totalAmount,
          averagePayment: payments.length > 0 ? Math.round(totalAmount / payments.length) : 0
        }
      }
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Get payments for a property
// @route   GET /api/payments/property/:propertyId
const getPropertyPayments = async (req, res) => {
  try {
    const query = { property: req.params.propertyId };
    if (req.user.role === 'customer') query.customer = req.user._id;
    const payments = await Payment.find(query)
      .populate('customer', 'name email')
      .sort('-createdAt');
    res.json({ success: true, data: payments });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

module.exports = {
  createPayment, getMyPayments, getAllPayments, getPayment,
  verifyPayment, rejectPayment, getPaymentProgress, getPaymentReports, getPropertyPayments
};
