const express = require('express');
const router = express.Router();
const {
  getProperties, getAdminProperties, getProperty, createProperty,
  updateProperty, deleteProperty, updatePropertyStatus, assignStaff, removeStaff,
  getMyProperties, getAssignedProperties
} = require('../controllers/propertyController');
const { protect, authorize } = require('../middleware/auth');
const { uploadPropertyImage } = require('../middleware/upload');

// Error handling middleware for multer
const handleUploadError = (err, req, res, next) => {
  if (err) {
    return res.status(400).json({ success: false, message: err.message || 'File upload error' });
  }
  next();
};

// Public
router.get('/', getProperties);

// Customer
router.get('/my-properties', protect, authorize('customer'), getMyProperties);

// Staff
router.get('/assigned', protect, authorize('maintenance_staff'), getAssignedProperties);

// Admin
router.get('/admin', protect, authorize('admin'), getAdminProperties);
router.post('/', protect, authorize('admin'), uploadPropertyImage.array('images', 10), handleUploadError, createProperty);
router.put('/:id', protect, authorize('admin'), uploadPropertyImage.array('images', 10), handleUploadError, updateProperty);
router.delete('/:id', protect, authorize('admin'), deleteProperty);
router.put('/:id/status', protect, authorize('admin'), updatePropertyStatus);
router.put('/:id/assign-staff', protect, authorize('admin'), assignStaff);
router.delete('/:id/assign-staff/:staffId', protect, authorize('admin'), removeStaff);

// Single property (public)
router.get('/:id', getProperty);

module.exports = router;

