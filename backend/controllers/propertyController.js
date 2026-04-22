const Property = require('../models/Property');

// @desc    Get all properties (public - available only)
// @route   GET /api/properties
const getProperties = async (req, res) => {
  try {
    const { search, type, city, minPrice, maxPrice, status, sort } = req.query;
    let query = {};

    // For public view, show only available. For admin, show all
    if (req.user && req.user.role === 'admin') {
      if (status) query.status = status;
    } else {
      query.status = 'available';
    }

    if (search) {
      query.$or = [
        { title: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } },
        { 'location.city': { $regex: search, $options: 'i' } }
      ];
    }
    if (type) query.type = type;
    if (city) query['location.city'] = { $regex: city, $options: 'i' };
    if (minPrice || maxPrice) {
      query.price = {};
      if (minPrice) query.price.$gte = Number(minPrice);
      if (maxPrice) query.price.$lte = Number(maxPrice);
    }

    let sortOption = { createdAt: -1 };
    if (sort === 'price_asc') sortOption = { price: 1 };
    if (sort === 'price_desc') sortOption = { price: -1 };
    if (sort === 'newest') sortOption = { createdAt: -1 };
    if (sort === 'oldest') sortOption = { createdAt: 1 };

    const properties = await Property.find(query)
      .populate('owner', 'name email')
      .sort(sortOption);

    res.json({ success: true, count: properties.length, data: properties });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Get all properties (admin - includes all statuses)
// @route   GET /api/properties/admin
const getAdminProperties = async (req, res) => {
  try {
    const { search, type, status, sort } = req.query;
    let query = {};

    if (status) query.status = status;
    if (type) query.type = type;
    if (search) {
      query.$or = [
        { title: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } },
        { 'location.city': { $regex: search, $options: 'i' } }
      ];
    }

    let sortOption = { createdAt: -1 };
    if (sort === 'price_asc') sortOption = { price: 1 };
    if (sort === 'price_desc') sortOption = { price: -1 };

    const properties = await Property.find(query)
      .populate('owner', 'name email')
      .populate('assignedStaff', 'name email')
      .sort(sortOption);

    res.json({ success: true, count: properties.length, data: properties });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Get single property
// @route   GET /api/properties/:id
const getProperty = async (req, res) => {
  try {
    console.log('\n========== GET PROPERTY ==========');
    console.log('Requested Property ID:', req.params.id);
    
    const property = await Property.findById(req.params.id)
      .populate('owner', 'name email phone')
      .populate('assignedStaff', 'name email phone');

    if (!property) {
      console.log('❌ Property not found');
      console.log('=====================================\n');
      return res.status(404).json({ success: false, message: 'Property not found' });
    }
    
    console.log('✓ Property found:', property._id);
    console.log('Property data:', {
      title: property.title,
      bedrooms: property.features?.bedrooms,
      bathrooms: property.features?.bathrooms,
      price: property.price,
      status: property.status
    });
    console.log('=====================================\n');
    
    res.json({ success: true, data: property });
  } catch (error) {
    console.error('❌ Error getting property:', error.message);
    console.log('=====================================\n');
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Create property
// @route   POST /api/properties
const createProperty = async (req, res) => {
  try {
    const propertyData = req.body;
    
    // Handle uploaded images
    if (req.files && req.files.length > 0) {
      propertyData.images = req.files.map(file => `/uploads/properties/${file.filename}`);
    }

    const property = await Property.create(propertyData);
    res.status(201).json({ success: true, data: property });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Update property
// @route   PUT /api/properties/:id
const updateProperty = async (req, res) => {
  try {
    console.log('\n========== UPDATE PROPERTY STARTED ==========');
    console.log('Property ID:', req.params.id);
    console.log('Request body structure:', JSON.stringify(req.body, null, 2));
    console.log('Files received:', req.files ? req.files.length : 0);
    
    let property = await Property.findById(req.params.id);
    if (!property) {
      console.log('❌ Property not found');
      console.log('=====================================\n');
      return res.status(404).json({ success: false, message: 'Property not found' });
    }
    
    console.log('✓ Found property:', property._id);

    // Helper to get nested field values from either format:
    // Bracket notation: req.body['location[address]']
    // Nested object: req.body.location.address
    const getBracketValue = (body, prefix, key) => {
      const bracketKey = `${prefix}[${key}]`;
      return body[bracketKey] !== undefined ? body[bracketKey] : body[prefix]?.[key];
    };

    // Extract location fields (handle both formats)
    const locationAddress = getBracketValue(req.body, 'location', 'address');
    const locationCity = getBracketValue(req.body, 'location', 'city');
    const locationState = getBracketValue(req.body, 'location', 'state');
    const locationZipCode = getBracketValue(req.body, 'location', 'zipCode');
    const locationCountry = getBracketValue(req.body, 'location', 'country');

    // Extract features fields (handle both formats)
    const featuresBedrooms = getBracketValue(req.body, 'features', 'bedrooms');
    const featuresBathrooms = getBracketValue(req.body, 'features', 'bathrooms');
    const featuresArea = getBracketValue(req.body, 'features', 'area');
    const featuresParking = getBracketValue(req.body, 'features', 'parking');
    const featuresFurnished = getBracketValue(req.body, 'features', 'furnished');

    console.log('Extracted features:', {
      bedrooms: featuresBedrooms,
      bathrooms: featuresBathrooms,
      area: featuresArea,
      parking: featuresParking,
      furnished: featuresFurnished
    });

    // Build updateData
    const updateData = {
      title: (req.body.title && req.body.title.trim()) || property.title,
      description: (req.body.description && req.body.description.trim()) || property.description,
      type: req.body.type || property.type,
      price: req.body.price ? parseFloat(req.body.price) : property.price,
      status: req.body.status || property.status,
      location: {
        address: (locationAddress && locationAddress.toString().trim()) || property.location?.address,
        city: (locationCity && locationCity.toString().trim()) || property.location?.city,
        state: (locationState && locationState.toString().trim()) || property.location?.state,
        zipCode: (locationZipCode && locationZipCode.toString().trim()) || property.location?.zipCode,
        country: (locationCountry && locationCountry.toString()) || property.location?.country || 'India'
      },
      features: {
        bedrooms: featuresBedrooms !== undefined ? Math.max(0, parseInt(featuresBedrooms) || 0) : property.features?.bedrooms,
        bathrooms: featuresBathrooms !== undefined ? Math.max(0, parseInt(featuresBathrooms) || 0) : property.features?.bathrooms,
        area: featuresArea !== undefined ? Math.max(0, parseInt(featuresArea) || 0) : property.features?.area,
        parking: featuresParking === 'true' || featuresParking === true,
        furnished: featuresFurnished === 'true' || featuresFurnished === true
      }
    };
    
    console.log('Update data prepared:', {
      title: updateData.title,
      bedrooms: updateData.features.bedrooms,
      bathrooms: updateData.features.bathrooms,
      area: updateData.features.area,
      price: updateData.price,
      parking: updateData.features.parking,
      furnished: updateData.features.furnished
    });

    // Handle new uploaded images
    if (req.files && Array.isArray(req.files) && req.files.length > 0) {
      const newImages = req.files.map(file => `/uploads/properties/${file.filename}`);
      updateData.images = [...(property.images || []), ...newImages];
      console.log(`✓ Added ${newImages.length} new images`);
    } else {
      updateData.images = property.images || [];
      console.log('✓ Preserving existing images');
    }

    // Update the property
    property = await Property.findByIdAndUpdate(req.params.id, updateData, {
      new: true,
      runValidators: true
    });

    console.log('✅ Update completed');
    console.log('Returned property features:', {
      bedrooms: property.features?.bedrooms,
      bathrooms: property.features?.bathrooms,
      area: property.features?.area
    });
    
    // Re-fetch to verify
    const verify = await Property.findById(req.params.id);
    console.log('✓ Verification (database re-fetch):', {
      bedrooms: verify.features?.bedrooms,
      bathrooms: verify.features?.bathrooms,
      area: verify.features?.area
    });
    
    console.log('=====================================\n');
    
    res.json({ success: true, data: property, message: 'Property updated successfully' });
  } catch (error) {
    console.error('❌ Update failed:', error.message);
    console.log('=====================================\n');
    res.status(500).json({ success: false, message: error.message || 'Failed to update property' });
  }
};

// @desc    Delete property
// @route   DELETE /api/properties/:id
const deleteProperty = async (req, res) => {
  try {
    const property = await Property.findById(req.params.id);
    if (!property) {
      return res.status(404).json({ success: false, message: 'Property not found' });
    }

    await Property.findByIdAndDelete(req.params.id);
    res.json({ success: true, message: 'Property deleted successfully' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Update property status
// @route   PUT /api/properties/:id/status
const updatePropertyStatus = async (req, res) => {
  try {
    const { status } = req.body;
    const property = await Property.findByIdAndUpdate(
      req.params.id,
      { status },
      { new: true, runValidators: true }
    );
    if (!property) {
      return res.status(404).json({ success: false, message: 'Property not found' });
    }
    res.json({ success: true, data: property });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Assign staff to property
// @route   PUT /api/properties/:id/assign-staff
const assignStaff = async (req, res) => {
  try {
    const { staffId } = req.body;
    const property = await Property.findById(req.params.id);
    if (!property) {
      return res.status(404).json({ success: false, message: 'Property not found' });
    }

    // Check if construction request is approved
    if (!property.approvedConstructionRequest) {
      return res.status(400).json({ 
        success: false, 
        message: 'Cannot assign staff: Construction request must be approved by admin first' 
      });
    }

    if (!property.assignedStaff.includes(staffId)) {
      property.assignedStaff.push(staffId);
      await property.save();
    }

    const updated = await Property.findById(req.params.id)
      .populate('assignedStaff', 'name email');

    res.json({ success: true, data: updated });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Remove staff from property
// @route   DELETE /api/properties/:id/assign-staff/:staffId
const removeStaff = async (req, res) => {
  try {
    const { staffId } = req.params;
    const property = await Property.findById(req.params.id);
    if (!property) {
      return res.status(404).json({ success: false, message: 'Property not found' });
    }

    property.assignedStaff = property.assignedStaff.filter(id => id.toString() !== staffId);
    await property.save();

    const updated = await Property.findById(req.params.id)
      .populate('assignedStaff', 'name email');

    res.json({ success: true, data: updated });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Get customer's owned properties
// @route   GET /api/properties/my-properties
const getMyProperties = async (req, res) => {
  try {
    const properties = await Property.find({ owner: req.user._id })
      .populate('assignedStaff', 'name email');
    res.json({ success: true, count: properties.length, data: properties });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Get staff assigned properties
// @route   GET /api/properties/assigned
const getAssignedProperties = async (req, res) => {
  try {
    const properties = await Property.find({ assignedStaff: req.user._id })
      .populate('owner', 'name email phone');
    res.json({ success: true, count: properties.length, data: properties });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

module.exports = {
  getProperties, getAdminProperties, getProperty, createProperty,
  updateProperty, deleteProperty, updatePropertyStatus, assignStaff, removeStaff,
  getMyProperties, getAssignedProperties
};
