const Document = require('../models/Document');
const Property = require('../models/Property');
const DocumentAuditTrail = require('../models/DocumentAuditTrail');
const { createNotification } = require('../utils/notification');
const fs = require('fs');
const path = require('path');

// @desc    Upload document
// @route   POST /api/documents
const uploadDocument = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ success: false, message: 'Please upload a file' });
    }

    const { title, type, category, property, customer, description } = req.body;

    const document = await Document.create({
      title,
      type: type || 'additional',
      category: category || 'other',
      filePath: `/uploads/documents/${req.file.filename}`,
      fileName: req.file.originalname,
      fileSize: req.file.size,
      mimeType: req.file.mimetype,
      property,
      customer,
      uploadedBy: req.user._id,
      description
    });

    res.status(201).json({ success: true, data: document });

    // Notify customer about the new document
    if (customer) {
      const prop = await Property.findById(property).select('title');
      await createNotification(
        customer,
        'New Legal Document Uploaded',
        `A new document "${title}" has been uploaded for your property "${prop ? prop.title : ''}"`,
        'document_uploaded',
        document._id
      );
    }
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Get all documents (admin)
// @route   GET /api/documents
const getAllDocuments = async (req, res) => {
  try {
    const { property, customer, type, category } = req.query;
    let query = {};
    if (property) query.property = property;
    if (customer) query.customer = customer;
    if (type) query.type = type;
    if (category) query.category = category;

    const documents = await Document.find(query)
      .populate('property', 'title')
      .populate('customer', 'name email')
      .populate('uploadedBy', 'name')
      .sort({ createdAt: -1 });

    res.json({ success: true, count: documents.length, data: documents });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Get customer's documents
// @route   GET /api/documents/my
const getMyDocuments = async (req, res) => {
  try {
    const documents = await Document.find({ customer: req.user._id })
      .populate('property', 'title')
      .sort({ createdAt: -1 });
    res.json({ success: true, count: documents.length, data: documents });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Get single document
// @route   GET /api/documents/:id
const getDocument = async (req, res) => {
  try {
    const document = await Document.findById(req.params.id)
      .populate('property', 'title')
      .populate('customer', 'name email')
      .populate('uploadedBy', 'name');

    if (!document) {
      return res.status(404).json({ success: false, message: 'Document not found' });
    }

    // Access control: admin can see all, customer can only see their own
    if (req.user.role === 'customer' && document.customer._id.toString() !== req.user._id.toString()) {
      return res.status(403).json({ success: false, message: 'Access denied' });
    }

    // Track document access in audit trail
    await DocumentAuditTrail.create({
      document: document._id,
      user: req.user._id,
      action: 'viewed',
      ipAddress: req.ip,
      userAgent: req.get('user-agent')
    });

    res.json({ success: true, data: document });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Download document
// @route   GET /api/documents/:id/download
const downloadDocument = async (req, res) => {
  try {
    const document = await Document.findById(req.params.id);
    if (!document) {
      return res.status(404).json({ success: false, message: 'Document not found' });
    }

    // Access control
    if (req.user.role === 'customer' && document.customer.toString() !== req.user._id.toString()) {
      return res.status(403).json({ success: false, message: 'Access denied' });
    }

    const filePath = path.join(__dirname, '..', document.filePath);
    if (!fs.existsSync(filePath)) {
      return res.status(404).json({ success: false, message: 'File not found on server' });
    }

    // Track document download in audit trail
    await DocumentAuditTrail.create({
      document: document._id,
      user: req.user._id,
      action: 'downloaded',
      ipAddress: req.ip,
      userAgent: req.get('user-agent')
    });

    res.download(filePath, document.fileName);
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Delete document (admin only)
// @route   DELETE /api/documents/:id
const deleteDocument = async (req, res) => {
  try {
    const document = await Document.findById(req.params.id);
    if (!document) {
      return res.status(404).json({ success: false, message: 'Document not found' });
    }

    // Delete file from server
    const filePath = path.join(__dirname, '..', document.filePath);
    if (fs.existsSync(filePath)) {
      fs.unlinkSync(filePath);
    }

    // Track document deletion in audit trail
    await DocumentAuditTrail.create({
      document: document._id,
      user: req.user._id,
      action: 'deleted',
      ipAddress: req.ip,
      userAgent: req.get('user-agent')
    });

    await Document.findByIdAndDelete(req.params.id);
    res.json({ success: true, message: 'Document deleted successfully' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Get documents for a property
// @route   GET /api/documents/property/:propertyId
const getPropertyDocuments = async (req, res) => {
  try {
    const query = { property: req.params.propertyId };
    if (req.user.role === 'customer') query.customer = req.user._id;
    const documents = await Document.find(query)
      .populate('uploadedBy', 'name')
      .sort('-createdAt');
    res.json({ success: true, count: documents.length, data: documents });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Get document audit trail
// @route   GET /api/documents/:id/audit-trail
const getDocumentAuditTrail = async (req, res) => {
  try {
    const document = await Document.findById(req.params.id);
    if (!document) {
      return res.status(404).json({ success: false, message: 'Document not found' });
    }

    const auditTrail = await DocumentAuditTrail.find({ document: req.params.id })
      .populate('user', 'name email role')
      .sort({ timestamp: -1 });

    res.json({ success: true, count: auditTrail.length, data: auditTrail });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Get documents with advanced filtering (by customer name and property type)
// @route   GET /api/documents/filtered/search
const getFilteredDocuments = async (req, res) => {
  try {
    const { customerName, propertyType, category, type } = req.query;
    
    let query = {};
    let properties = [];
    
    // If propertyType filter is provided, find properties with that type
    if (propertyType) {
      properties = await Property.find({ type: propertyType }).select('_id');
      const propertyIds = properties.map(p => p._id);
      query.property = { $in: propertyIds };
    }

    // If category or type filter is provided
    if (category) query.category = category;
    if (type) query.type = type;

    let documents = await Document.find(query)
      .populate('property', 'title type')
      .populate('customer', 'name email')
      .populate('uploadedBy', 'name')
      .sort({ createdAt: -1 });

    // Filter by customer name if provided (client-side filtering after population)
    if (customerName) {
      documents = documents.filter(doc => 
        doc.customer && doc.customer.name.toLowerCase().includes(customerName.toLowerCase())
      );
    }

    res.json({ success: true, count: documents.length, data: documents });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

module.exports = {
  uploadDocument, getAllDocuments, getMyDocuments,
  getDocument, downloadDocument, deleteDocument, getPropertyDocuments,
  getDocumentAuditTrail, getFilteredDocuments
};
