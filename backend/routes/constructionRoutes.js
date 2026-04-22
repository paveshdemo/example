const express = require('express');
const router = express.Router();
const { createConstructionUpdate, getPropertyUpdates, getMyUpdates } = require('../controllers/constructionController');
const { protect, authorize } = require('../middleware/auth');
const { uploadConstructionImages } = require('../middleware/upload');

// Error handling middleware for multer
const handleUploadError = (err, req, res, next) => {
  if (err) {
    return res.status(400).json({ success: false, message: err.message || 'File upload error' });
  }
  next();
};

router.post('/', protect, authorize('admin', 'maintenance_staff'), uploadConstructionImages.array('images', 10), handleUploadError, createConstructionUpdate);
router.get('/my', protect, authorize('admin', 'maintenance_staff'), getMyUpdates);
router.get('/property/:propertyId', protect, getPropertyUpdates);

module.exports = router;
