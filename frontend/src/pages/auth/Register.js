import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { registerUser } from '../../services/dataService';

const Register = () => {
  const [formData, setFormData] = useState({
    name: '', email: '', password: '', confirmPassword: '', phone: '', address: ''
  });
  const [errors, setErrors] = useState({});
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  const validateForm = () => {
    const newErrors = {};

    // Full Name validation
    if (!formData.name.trim()) {
      newErrors.name = 'Full Name is required';
    }

    // Email validation
    if (!formData.email.trim()) {
      newErrors.email = 'Email Address is required';
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = 'Email Address is invalid';
    }

    // Password validation
    if (!formData.password) {
      newErrors.password = 'Password is required';
    } else if (formData.password.length < 6) {
      newErrors.password = 'Password must be at least 6 characters';
    }

    // Confirm Password validation
    if (!formData.confirmPassword) {
      newErrors.confirmPassword = 'Confirm Password is required';
    } else if (formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = 'Passwords do not match';
    }

    // Phone validation
    if (!formData.phone.trim()) {
      newErrors.phone = 'Phone Number is required';
    } else if (!/^\d{10}$/.test(formData.phone.replace(/\D/g, ''))) {
      newErrors.phone = 'Phone Number must be 10 digits';
    }

    // Address validation
    if (!formData.address.trim()) {
      newErrors.address = 'Address is required';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (!validateForm()) {
      return;
    }

    setLoading(true);
    try {
      const { confirmPassword, ...data } = formData;
      const res = await registerUser(data);
      login(res.data.data);
      navigate('/customer/dashboard');
    } catch (err) {
      setError(err.response?.data?.message || 'Registration failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
    // Clear error for this field when user starts typing
    if (errors[name]) {
      setErrors({ ...errors, [name]: '' });
    }
  };

  return (
    <div className="auth-page">
      <div className="auth-card" style={{ maxWidth: '520px' }}>
        <h2>Create Account</h2>
        <p className="subtitle">Register to get started</p>

        {error && (
          <div 
            className="alert alert-danger" 
            style={{ 
              padding: '12px 16px', 
              marginBottom: '20px', 
              borderRadius: '4px',
              backgroundColor: '#f8d7da',
              borderColor: '#f5c6cb',
              color: '#721c24',
              display: 'block',
              fontSize: '14px',
              fontWeight: '500'
            }}
            role="alert"
          >
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit}>
          <style>{`
            .form-group .invalid-feedback {
              display: block !important;
              color: #dc3545;
              font-size: 12px;
              margin-top: 4px;
              font-weight: 500;
            }
            .form-group .form-control.is-invalid {
              border-color: #dc3545;
              background-color: #fff5f5;
            }
          `}</style>
          <div className="form-row">
            <div className="form-group">
              <label>Full Name *</label>
              <input
                type="text" name="name" className={`form-control ${errors.name ? 'is-invalid' : ''}`}
                placeholder="Enter your full name"
                value={formData.name} onChange={handleChange} required
              />
              {errors.name && <div className="invalid-feedback">{errors.name}</div>}
            </div>
            <div className="form-group">
              <label>Email Address *</label>
              <input
                type="email" name="email" className={`form-control ${errors.email ? 'is-invalid' : ''}`}
                placeholder="Enter your email"
                value={formData.email} onChange={handleChange} required
              />
              {errors.email && <div className="invalid-feedback">{errors.email}</div>}
            </div>
          </div>
          <div className="form-row">
            <div className="form-group">
              <label>Password *</label>
              <input
                type="password" name="password" className={`form-control ${errors.password ? 'is-invalid' : ''}`}
                placeholder="Min 6 characters"
                value={formData.password} onChange={handleChange} required
              />
              {errors.password && <div className="invalid-feedback">{errors.password}</div>}
            </div>
            <div className="form-group">
              <label>Confirm Password *</label>
              <input
                type="password" name="confirmPassword" className={`form-control ${errors.confirmPassword ? 'is-invalid' : ''}`}
                placeholder="Repeat password"
                value={formData.confirmPassword} onChange={handleChange} required
              />
              {errors.confirmPassword && <div className="invalid-feedback">{errors.confirmPassword}</div>}
            </div>
          </div>
          <div className="form-group">
            <label>Phone *</label>
            <input
              type="text" name="phone" className={`form-control ${errors.phone ? 'is-invalid' : ''}`}
              placeholder="Enter phone number (10 digits)"
              value={formData.phone} onChange={handleChange} required
            />
            {errors.phone && <div className="invalid-feedback">{errors.phone}</div>}
          </div>
          <div className="form-group">
            <label>Address *</label>
            <textarea
              name="address" className={`form-control ${errors.address ? 'is-invalid' : ''}`}
              placeholder="Enter your address" rows="2"
              value={formData.address} onChange={handleChange} required
            />
            {errors.address && <div className="invalid-feedback">{errors.address}</div>}
          </div>
          <button type="submit" className="btn btn-primary btn-lg" style={{ width: '100%' }} disabled={loading}>
            {loading ? 'Creating account...' : 'Register'}
          </button>
        </form>

        <div className="auth-footer">
          Already have an account? <Link to="/login">Sign in</Link>
        </div>
      </div>
    </div>
  );
};

export default Register;
