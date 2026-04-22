const ConstructionUpdate = require('../models/ConstructionUpdate');
const Property = require('../models/Property');
const { createNotification } = require('../utils/notification');

// @desc    Create construction update
// @route   POST /api/construction-updates
const createConstructionUpdate = async (req, res) => {
  try {
    const { property, status, percentage, notes } = req.body;

    // Verify staff is assigned to this property (skip for admins)
    const prop = await Property.findById(property);
    if (!prop) {
      return res.status(404).json({ success: false, message: 'Property not found' });
    }

    // Allow admins to update any property, but maintenance staff must be assigned
    if (req.user.role === 'maintenance_staff' && !prop.assignedStaff.includes(req.user._id)) {
      return res.status(403).json({ success: false, message: 'You are not assigned to this property' });
    }

    // Handle uploaded images
    const images = req.files ? req.files.map(file => `/uploads/construction/${file.filename}`) : [];

    const update = await ConstructionUpdate.create({
      property,
      updatedBy: req.user._id,
      status,
      percentage,
      notes,
      images
    });

    // Update property construction status
    prop.constructionStatus = status === 'completed' ? 'completed' : 'in_progress';
    prop.constructionPercentage = percentage;
    await prop.save();

    // Notify property owner
    if (prop.owner) {
      await createNotification(
        prop.owner,
        'Construction Update',
        `Construction update for "${prop.title}": ${status} (${percentage}%)`,
        'construction_update',
        update._id
      );
    }

    res.status(201).json({ success: true, data: update });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Get construction updates for a property
// @route   GET /api/construction-updates/property/:propertyId
const getPropertyUpdates = async (req, res) => {
  try {
    const updates = await ConstructionUpdate.find({ property: req.params.propertyId })
      .populate('updatedBy', 'name')
      .sort({ createdAt: -1 });
    res.json({ success: true, count: updates.length, data: updates });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Get all construction updates by staff member
// @route   GET /api/construction-updates/my
const getMyUpdates = async (req, res) => {
  try {
    const updates = await ConstructionUpdate.find({ updatedBy: req.user._id })
      .populate('property', 'title location')
      .sort({ createdAt: -1 });
    res.json({ success: true, count: updates.length, data: updates });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

module.exports = { createConstructionUpdate, getPropertyUpdates, getMyUpdates };
