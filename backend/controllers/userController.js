const User = require('../models/User');
const Property = require('../models/Property');

// @desc    Get all customers
// @route   GET /api/users/customers
const getCustomers = async (req, res) => {
  try {
    const { search } = req.query;
    let query = { role: 'customer' };
    if (search) {
      query.$or = [
        { name: { $regex: search, $options: 'i' } },
        { email: { $regex: search, $options: 'i' } }
      ];
    }
    const customers = await User.find(query).sort({ createdAt: -1 });
    res.json({ success: true, count: customers.length, data: customers });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Get single customer with owned properties
// @route   GET /api/users/customers/:id
const getCustomer = async (req, res) => {
  try {
    const customer = await User.findById(req.params.id);
    if (!customer || customer.role !== 'customer') {
      return res.status(404).json({ success: false, message: 'Customer not found' });
    }
    const properties = await Property.find({ owner: customer._id });
    res.json({ success: true, data: { customer, properties } });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Update customer
// @route   PUT /api/users/customers/:id
const updateCustomer = async (req, res) => {
  try {
    const { name, phone, address, email } = req.body;

    // Check duplicate email
    if (email) {
      const existing = await User.findOne({ email, _id: { $ne: req.params.id } });
      if (existing) {
        return res.status(400).json({ success: false, message: 'Email already in use' });
      }
    }

    const customer = await User.findByIdAndUpdate(
      req.params.id,
      { name, phone, address, email },
      { new: true, runValidators: true }
    );
    if (!customer) {
      return res.status(404).json({ success: false, message: 'Customer not found' });
    }
    res.json({ success: true, data: customer });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Get all staff users
// @route   GET /api/users/staff
const getStaffUsers = async (req, res) => {
  try {
    const { search, role, isActive } = req.query;
    let query = { role: { $in: ['admin', 'maintenance_staff'] } };
    if (search) {
      query.$or = [
        { name: { $regex: search, $options: 'i' } },
        { email: { $regex: search, $options: 'i' } }
      ];
    }
    if (role) query.role = role;
    if (isActive !== undefined) query.isActive = isActive === 'true';

    const users = await User.find(query).sort({ createdAt: -1 });
    res.json({ success: true, count: users.length, data: users });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Create staff user
// @route   POST /api/users/staff
const createStaffUser = async (req, res) => {
  try {
    const { name, email, password, role, phone } = req.body;

    const existing = await User.findOne({ email });
    if (existing) {
      return res.status(400).json({ success: false, message: 'Email already registered' });
    }

    if (!['admin', 'maintenance_staff'].includes(role)) {
      return res.status(400).json({ success: false, message: 'Invalid staff role' });
    }

    const user = await User.create({ name, email, password, role, phone });
    res.status(201).json({ success: true, data: user });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Update staff user
// @route   PUT /api/users/staff/:id
const updateStaffUser = async (req, res) => {
  try {
    const { name, email, role, phone, isActive } = req.body;

    if (email) {
      const existing = await User.findOne({ email, _id: { $ne: req.params.id } });
      if (existing) {
        return res.status(400).json({ success: false, message: 'Email already in use' });
      }
    }

    const user = await User.findByIdAndUpdate(
      req.params.id,
      { name, email, role, phone, isActive },
      { new: true, runValidators: true }
    );
    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }
    res.json({ success: true, data: user });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Activate/Deactivate user
// @route   PUT /api/users/:id/toggle-active
const toggleUserActive = async (req, res) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }
    user.isActive = !user.isActive;
    await user.save();
    res.json({ success: true, data: user });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Get all maintenance staff (for assignment dropdown)
// @route   GET /api/users/maintenance-staff
const getMaintenanceStaff = async (req, res) => {
  try {
    const assignableRoles = ['maintenance_staff', 'property_inspector', 'property_manager'];
    const staff = await User.find({ 
      role: { $in: assignableRoles }, 
      isActive: true 
    })
      .select('name email phone role');
    res.json({ success: true, data: staff });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Get all users
// @route   GET /api/users
const getAllUsers = async (req, res) => {
  try {
    const users = await User.find().sort({ createdAt: -1 });
    res.json({ success: true, count: users.length, data: users });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Get single user
// @route   GET /api/users/:id
const getUser = async (req, res) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user) return res.status(404).json({ success: false, message: 'User not found' });
    res.json({ success: true, data: user });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Create user (any role)
// @route   POST /api/users
const createUser = async (req, res) => {
  try {
    const { name, email, password, role, phone } = req.body;
    const existing = await User.findOne({ email });
    if (existing) return res.status(400).json({ success: false, message: 'Email already registered' });
    const user = await User.create({ name, email, password, role, phone });
    res.status(201).json({ success: true, data: user });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Update user (any role)
// @route   PUT /api/users/:id
const updateUser = async (req, res) => {
  try {
    const { name, email, phone, role, address, isActive } = req.body;
    if (email) {
      const existing = await User.findOne({ email, _id: { $ne: req.params.id } });
      if (existing) return res.status(400).json({ success: false, message: 'Email already in use' });
    }
    const user = await User.findByIdAndUpdate(req.params.id, { name, email, phone, role, address, isActive }, { new: true, runValidators: true });
    if (!user) return res.status(404).json({ success: false, message: 'User not found' });
    res.json({ success: true, data: user });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Delete user
// @route   DELETE /api/users/:id
const deleteUser = async (req, res) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user) return res.status(404).json({ success: false, message: 'User not found' });
    await user.deleteOne();
    res.json({ success: true, message: 'User deleted' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Get user's properties
// @route   GET /api/users/:id/properties
const getUserProperties = async (req, res) => {
  try {
    const properties = await Property.find({ owner: req.params.id });
    res.json({ success: true, data: properties });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

module.exports = {
  getCustomers, getCustomer, updateCustomer,
  getStaffUsers, createStaffUser, updateStaffUser,
  toggleUserActive, getMaintenanceStaff,
  getAllUsers, getUser, createUser, updateUser, deleteUser, getUserProperties
};
