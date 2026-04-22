import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { updateProfile, changePassword } from '../../services/dataService';
import './AdminProfileSettings.css';

const AdminProfileSettings = () => {
  const { user, updateUser } = useAuth();
  
  // Profile Edit State
  const [profileData, setProfileData] = useState({
    name: '',
    email: '',
    phone: '',
    address: ''
  });

  // Password Change State
  const [passwordData, setPasswordData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });

  // UI State
  const [loading, setLoading] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');
  const [errorMessage, setErrorMessage] = useState('');
  const [activeTab, setActiveTab] = useState('profile'); // 'profile' or 'security'

  // Initialize form with user data
  useEffect(() => {
    if (user) {
      setProfileData({
        name: user.name || '',
        email: user.email || '',
        phone: user.phone || '',
        address: user.address || ''
      });
    }
  }, [user]);

  // Handle Profile Update
  const handleProfileSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setSuccessMessage('');
    setErrorMessage('');

    try {
      const updateData = {
        name: profileData.name,
        phone: profileData.phone,
        address: profileData.address
      };

      const res = await updateProfile(updateData);
      updateUser(res.data.data || res.data);
      setSuccessMessage('✅ Profile updated successfully!');
      
      setTimeout(() => setSuccessMessage(''), 3000);
    } catch (err) {
      setErrorMessage(err.response?.data?.message || '❌ Failed to update profile');
    } finally {
      setLoading(false);
    }
  };

  // Handle Password Change
  const handlePasswordSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setSuccessMessage('');
    setErrorMessage('');

    // Validate passwords
    if (passwordData.newPassword !== passwordData.confirmPassword) {
      setErrorMessage('❌ New passwords do not match');
      setLoading(false);
      return;
    }

    if (passwordData.newPassword.length < 6) {
      setErrorMessage('❌ Password must be at least 6 characters');
      setLoading(false);
      return;
    }

    try {
      await changePassword({
        currentPassword: passwordData.currentPassword,
        newPassword: passwordData.newPassword
      });

      setSuccessMessage('✅ Password changed successfully!');
      setPasswordData({
        currentPassword: '',
        newPassword: '',
        confirmPassword: ''
      });
      
      setTimeout(() => setSuccessMessage(''), 3000);
    } catch (err) {
      setErrorMessage(err.response?.data?.message || '❌ Failed to change password');
    } finally {
      setLoading(false);
    }
  };

  const handleProfileChange = (e) => {
    const { name, value } = e.target;
    setProfileData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handlePasswordChange = (e) => {
    const { name, value } = e.target;
    setPasswordData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  return (
    <div className="admin-profile-settings">
      {/* Page Header */}
      <div className="profile-header">
        <div className="header-content">
          <div className="profile-avatar-large">
            {user?.name?.charAt(0).toUpperCase()}
          </div>
          <div>
            <h1 className="profile-title">{user?.name || 'User'}</h1>
            <p className="profile-subtitle">{user?.email}</p>
            <p className="profile-role">
              <span className="role-badge">{user?.role?.toUpperCase()}</span>
            </p>
          </div>
        </div>
      </div>

      {/* Tab Navigation */}
      <div className="profile-tabs">
        <button
          className={`tab-button ${activeTab === 'profile' ? 'active' : ''}`}
          onClick={() => setActiveTab('profile')}
        >
          👤 Personal Information
        </button>
        <button
          className={`tab-button ${activeTab === 'security' ? 'active' : ''}`}
          onClick={() => setActiveTab('security')}
        >
          🔒 Security Settings
        </button>
      </div>

      {/* Alert Messages */}
      {successMessage && (
        <div className="alert alert-success">
          {successMessage}
        </div>
      )}
      {errorMessage && (
        <div className="alert alert-danger">
          {errorMessage}
        </div>
      )}

      <div className="profile-content">
        {/* Personal Information Tab */}
        {activeTab === 'profile' && (
          <div className="settings-card">
            <div className="card-header">
              <h2>👤 Personal Information</h2>
              <p>Update your profile details</p>
            </div>

            <form onSubmit={handleProfileSubmit} className="profile-form">
              {/* Read-only Fields */}
              <div className="form-row">
                <div className="form-group">
                  <label>Email Address</label>
                  <input
                    type="email"
                    value={user?.email || ''}
                    disabled
                    className="form-input form-input-disabled"
                    placeholder="your.email@example.com"
                  />
                  <small className="form-help">Email cannot be changed</small>
                </div>

                <div className="form-group">
                  <label>Account Role</label>
                  <input
                    type="text"
                    value={user?.role || ''}
                    disabled
                    className="form-input form-input-disabled"
                    placeholder="Role"
                  />
                  <small className="form-help">Contact admin to change role</small>
                </div>
              </div>

              {/* Editable Fields */}
              <div className="form-row">
                <div className="form-group">
                  <label>Full Name *</label>
                  <input
                    type="text"
                    name="name"
                    value={profileData.name}
                    onChange={handleProfileChange}
                    className="form-input"
                    placeholder="Enter your full name"
                    required
                  />
                </div>

                <div className="form-group">
                  <label>Phone Number</label>
                  <input
                    type="tel"
                    name="phone"
                    value={profileData.phone}
                    onChange={handleProfileChange}
                    className="form-input"
                    placeholder="+1 (555) 000-0000"
                  />
                </div>
              </div>

              {/* Address Field */}
              <div className="form-group">
                <label>Address</label>
                <textarea
                  name="address"
                  value={profileData.address}
                  onChange={handleProfileChange}
                  className="form-input form-textarea"
                  placeholder="Enter your address"
                  rows="3"
                />
              </div>

              {/* Account Status */}
              <div className="account-status">
                <div className="status-item">
                  <span className="status-label">Account Status</span>
                  <span className={`status-badge ${user?.isActive ? 'active' : 'inactive'}`}>
                    {user?.isActive ? '🟢 Active' : '🔴 Inactive'}
                  </span>
                </div>
                <div className="status-item">
                  <span className="status-label">Member Since</span>
                  <span className="status-value">
                    {new Date(user?.createdAt).toLocaleDateString('en-US', {
                      year: 'numeric',
                      month: 'long',
                      day: 'numeric'
                    })}
                  </span>
                </div>
              </div>

              {/* Submit Button */}
              <button
                type="submit"
                className="btn btn-primary btn-large"
                disabled={loading}
              >
                {loading ? '💾 Saving...' : '💾 Save Changes'}
              </button>
            </form>
          </div>
        )}

        {/* Security Settings Tab */}
        {activeTab === 'security' && (
          <div className="settings-card">
            <div className="card-header">
              <h2>🔒 Security Settings</h2>
              <p>Change your password and manage security</p>
            </div>

            <form onSubmit={handlePasswordSubmit} className="profile-form">
              <div className="security-info">
                <p>🔐 Keep your account secure by using a strong password. Choose a password that's:</p>
                <ul>
                  <li>At least 6 characters long</li>
                  <li>Contains a mix of uppercase and lowercase letters</li>
                  <li>Includes numbers and special characters</li>
                </ul>
              </div>

              {/* Current Password */}
              <div className="form-group">
                <label>Current Password *</label>
                <input
                  type="password"
                  name="currentPassword"
                  value={passwordData.currentPassword}
                  onChange={handlePasswordChange}
                  className="form-input"
                  placeholder="Enter your current password"
                  required
                />
              </div>

              {/* New Password */}
              <div className="form-row">
                <div className="form-group">
                  <label>New Password *</label>
                  <input
                    type="password"
                    name="newPassword"
                    value={passwordData.newPassword}
                    onChange={handlePasswordChange}
                    className="form-input"
                    placeholder="Enter new password"
                    required
                  />
                  <small className="form-help">Must be at least 6 characters</small>
                </div>

                <div className="form-group">
                  <label>Confirm New Password *</label>
                  <input
                    type="password"
                    name="confirmPassword"
                    value={passwordData.confirmPassword}
                    onChange={handlePasswordChange}
                    className="form-input"
                    placeholder="Confirm new password"
                    required
                  />
                </div>
              </div>

              {/* Password Strength Indicator */}
              {passwordData.newPassword && (
                <div className="password-strength">
                  <div className="strength-label">Password Strength:</div>
                  <div className="strength-bar">
                    <div
                      className={`strength-fill ${
                        passwordData.newPassword.length < 8
                          ? 'weak'
                          : passwordData.newPassword.length < 12
                          ? 'medium'
                          : 'strong'
                      }`}
                      style={{
                        width: `${
                          passwordData.newPassword.length < 8
                            ? 33
                            : passwordData.newPassword.length < 12
                            ? 66
                            : 100
                        }%`
                      }}
                    ></div>
                  </div>
                </div>
              )}

              {/* Submit Button */}
              <button
                type="submit"
                className="btn btn-warning btn-large"
                disabled={loading}
              >
                {loading ? '🔄 Updating...' : '🔐 Update Password'}
              </button>
            </form>

            {/* Login Activity */}
            <div className="login-activity">
              <h3>📋 Login Activity</h3>
              <p>Last login: <strong>{new Date(user?.updatedAt).toLocaleDateString()}</strong></p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminProfileSettings;
