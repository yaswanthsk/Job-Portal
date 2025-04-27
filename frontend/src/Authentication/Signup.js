import React, { useState } from 'react';
import { toast } from 'react-toastify';
import { Link,useNavigate } from 'react-router-dom';

import api from '../utils/api';
import './Signup.css';

const Signup = () => {
  const [formData, setFormData] = useState({
    username: '',
    email: '',
    password: '',
    role: 'seeker',
    companyName: '',
    companyDescription: ''
  });

  const [errors, setErrors] = useState({});
  const navigate = useNavigate(); 


  const validate = () => {
    const newErrors = {};

    if (!formData.username) {
      newErrors.username = 'Username is required';
    } else if (!/^[a-zA-Z0-9_]{3,15}$/.test(formData.username)) {
      newErrors.username = 'Username must be 3-15 characters and alphanumeric only';
    }
    // Email validation with full domain check
    if (!formData.email) {
      newErrors.email = 'Email is required';
    } else if (!/\S+@\S+\.\S{2,}$/.test(formData.email)) { // Ensures a valid domain extension like .com, .net, etc.
      newErrors.email = 'Please enter a valid email address with a domain extension (e.g., .com)';
    }

    if (!formData.password) {
      newErrors.password = 'Password is required';
    } else if (formData.password.length < 6) {
      newErrors.password = 'Password must be at least 6 characters';
    } else if (!/(?=.*[a-zA-Z])(?=.*\d)/.test(formData.password)) {
      newErrors.password = 'Password must contain at least one letter and one number';
    }

    if (!formData.role) {
      newErrors.role = 'Role is required';
    }

    if (formData.role === 'employer') {
      if (!formData.companyName || formData.companyName.trim().length === 0) {
        newErrors.companyName = 'Company name is required';
      }

      if (!formData.companyDescription || formData.companyDescription.trim().length < 10) {
        newErrors.companyDescription = 'Description must be at least 10 characters';
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const getPasswordStrength = (password) => {
    let score = 0;

    if (password.length >= 6) score += 1;
    if (/[a-z]/.test(password) && /[A-Z]/.test(password)) score += 1;
    if (/\d/.test(password)) score += 1;
    if (/[@$!%*?&#]/.test(password)) score += 1;

    if (score <= 1) return { label: 'Weak', color: '#ff6b6b' };
    if (score === 2 || score === 3) return { label: 'Moderate', color: '#f0ad4e' };
    if (score === 4) return { label: 'Strong', color: '#28a745' };
    return { label: '', color: '#ccc' };
  };

  const strength = getPasswordStrength(formData.password);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
    setErrors({ ...errors, [name]: '' });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) return;
    try {
      await api.post('/auth/signup', formData);
      toast.success('User registered successfully!');
          // Wait 2 seconds, then navigate to login page
      setTimeout(() => {
        navigate('/login');
      }, 2000);
    } catch (error) {
      console.error('Error during signup:', error);

      if (error.response && error.response.status === 400) {
        const errorMessage = error.response.data.message || 'Email already exists.';
        
        if (errorMessage.includes('Email')) {
          setErrors((prevErrors) => ({
            ...prevErrors,
            email: 'Email already exists',  // ✅ Setting error under email field
          }));
        } else {
          toast.error(errorMessage); // fallback
        }
      } else {
        toast.error('Signup failed! Please try again.');
      }
    }
  };

  return (
    <div className="auth-background">
      <div className="jobportal-signup-container">
        <form className="jobportal-signup-form" onSubmit={handleSubmit}>
          <h2 className="jobportal-signup-title">Create Your Account</h2>

          <div className="jobportal-form-grid">
            <div>
              <label>Username</label>
              <input type="text" name="username" value={formData.username} onChange={handleChange} />
              {errors.username && (
                <div className="input-error-container">
                  <span className="input-error">{errors.username}</span>
                </div>
              )}
            </div>
            <div>
              <label>Email</label>
              <input type="email" name="email" value={formData.email} onChange={handleChange} />
              {errors.email && (
                <div className="input-error-container">
                  <span className="input-error">{errors.email}</span>
                </div>
              )}            </div>
            <div>
              <label>Password</label>
              <input type="password" name="password" value={formData.password} onChange={handleChange} />
              {errors.password && (
                <div className="input-error-container">
                  <span className="input-error">{errors.password}</span>
                </div>
              )}
              {formData.password && (
                <div className="password-strength-container">
                  <div
                    className="password-strength-bar"
                    style={{
                      backgroundColor: strength.color,
                      width:
                        strength.label === 'Weak'
                          ? '33%'
                          : strength.label === 'Moderate'
                            ? '66%'
                            : '100%'
                    }}
                  />
                  <span className="password-strength-text">{strength.label} password</span>
                </div>
              )}


            </div>
            <div>
              <label>Role</label>
              <select name="role" value={formData.role} onChange={handleChange}>
                <option value="seeker">Job Seeker</option>
                <option value="employer">Employer</option>
              </select>
              {errors.role && <span className="input-error">{errors.role}</span>}
            </div>

            {formData.role === 'employer' && (
              <>
                <div>
                  <label>Company Name</label>
                  <input
                    type="text"
                    name="companyName"
                    value={formData.companyName}
                    onChange={handleChange}
                  />
                  {errors.companyName && (
                    <div className="input-error-container">
                      <span className="input-error">{errors.companyName}</span>
                    </div>
                  )}                </div>
                <div>
                  <label>Company Description</label>
                  <input
                    type="text"
                    name="companyDescription"
                    value={formData.companyDescription}
                    onChange={handleChange}
                  />
                  {errors.companyDescription && (
                    <div className="input-error-container">
                      <span className="input-error">{errors.companyDescription}</span>
                    </div>
                  )}                </div>
              </>
            )}
          </div>

          <button type="submit" className="jobportal-signup-button">Sign Up</button>
          <p className="login-redirect"> Already have an account? <Link to="/login">Log in here</Link> </p>
        </form>
      </div>
    </div>
  );
};

export default Signup;
