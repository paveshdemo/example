const express = require('express');
const router = express.Router();
const {
  uploadDocument: uploadDoc, getAllDocuments, getMyDocuments,
  getDocument, downloadDocument, deleteDocument, getPropertyDocuments,
  getDocumentAuditTrail, getFilteredDocuments
} = require('../controllers/documentController');
const { protect, authorize } = require('../middleware/auth');
const { uploadDocument } = require('../middleware/upload');

// Route order matters - more specific routes first
router.post('/', protect, authorize('admin'), uploadDocument.single('document'), uploadDoc);
router.get('/filtered/search', protect, authorize('admin'), getFilteredDocuments);
router.get('/my', protect, authorize('customer'), getMyDocuments);
router.get('/property/:propertyId', protect, getPropertyDocuments);
router.get('/:id/audit-trail', protect, authorize('admin'), getDocumentAuditTrail);
router.get('/:id/download', protect, downloadDocument);
router.get('/:id', protect, getDocument);
router.get('/', protect, authorize('admin'), getAllDocuments);
router.delete('/:id', protect, authorize('admin'), deleteDocument);

module.exports = router;

