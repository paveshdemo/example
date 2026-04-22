const express = require('express');
const router = express.Router();
const {
  getCustomers, getCustomer, updateCustomer,
  getStaffUsers, createStaffUser, updateStaffUser,
  toggleUserActive, getMaintenanceStaff,
  getAllUsers, getUser, createUser, updateUser, deleteUser, getUserProperties
} = require('../controllers/userController');
const { protect, authorize } = require('../middleware/auth');

// General user CRUD (Admin)
router.get('/', protect, authorize('admin'), getAllUsers);
router.post('/', protect, authorize('admin'), createUser);

// Sub-resource routes (must come before /:id)
router.get('/customers', protect, authorize('admin'), getCustomers);
router.get('/customers/:id', protect, authorize('admin'), getCustomer);
router.put('/customers/:id', protect, authorize('admin'), updateCustomer);

router.get('/staff', protect, authorize('admin'), getStaffUsers);
router.post('/staff', protect, authorize('admin'), createStaffUser);
router.put('/staff/:id', protect, authorize('admin'), updateStaffUser);

router.get('/maintenance-staff', protect, authorize('admin'), getMaintenanceStaff);

// /:id routes (must come after named routes)
router.get('/:id', protect, authorize('admin'), getUser);
router.put('/:id', protect, authorize('admin'), updateUser);
router.delete('/:id', protect, authorize('admin'), deleteUser);
router.get('/:id/properties', protect, authorize('admin'), getUserProperties);
router.put('/:id/toggle-active', protect, authorize('admin'), toggleUserActive);

module.exports = router;
