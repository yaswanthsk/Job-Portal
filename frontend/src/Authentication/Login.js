import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import api from '../utils/api';
import './Login.css';

const Login = () => {
  const [formData, setFormData] = useState({ username: '', password: '' });
  const [errors, setErrors] = useState({});
  const [isLoading, setIsLoading] = useState(false);
  const [showForgotPassword, setShowForgotPassword] = useState(false);
  const [step, setStep] = useState(1);
  const [forgotData, setForgotData] = useState({
    email: '',
    username: '',
    newPassword: '',
    confirmPassword: ''
  });

  const navigate = useNavigate();

  const validate = () => {
    const newErrors = {};
    if (!formData.username) newErrors.username = 'Username is required';
    if (!formData.password) newErrors.password = 'Password is required';
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
    setErrors({ ...errors, [name]: '' });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) return;

    try {
      setIsLoading(true);
      const response = await api.post('/auth/login', formData);
      toast.success('Login successful!');
      localStorage.setItem('token', response.data.token);

      const user = JSON.parse(atob(response.data.token.split('.')[1]));
      const userRole = user.role;

      if (userRole === 'employer') {
        navigate('/employer/dashboard');
      } else if (userRole === 'seeker') {
        navigate('/jobseeker/dashboard');
      }
    } catch (error) {
      console.error('Error during login:', error);
      toast.error('Invalid credentials! Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="auth-background">
      <div className="jobportal-login-container">
        {!showForgotPassword ? (
          <form className="jobportal-login-form" onSubmit={handleSubmit}>
            <h2 className="jobportal-login-title">Welcome Back</h2>

            <label>Username</label>
            <input
              type="text"
              name="username"
              value={formData.username}
              onChange={handleChange}
              placeholder="Enter your username"
            />
            {errors.username && <span className="input-error">{errors.username}</span>}

            <label>Password</label>
            <input
              type="password"
              name="password"
              value={formData.password}
              onChange={handleChange}
              placeholder="Enter your password"
            />
            {errors.password && <span className="input-error">{errors.password}</span>}

            <button type="submit" className="jobportal-login-button" disabled={isLoading}>
              {isLoading ? 'Logging in...' : 'Login'}
            </button>

            <p className="jobportal-login-switch">
              Don’t have an account? <a href="/signup">Sign up</a>
            </p>

            <p className="jobportal-login-switch">
              Forgot your password?{' '}
              <button
                type="button"
                onClick={() => setShowForgotPassword(true)}
                className="link-button"
              >
                Reset here
              </button>
            </p>
          </form>
        ) : (
          <div className="jobportal-login-form">
            <h2 className="jobportal-login-title">Reset Password</h2>

            {step === 1 && (
              <>
                <label>Email</label>
                <input
                  type="email"
                  name="email"
                  value={forgotData.email}
                  onChange={(e) => setForgotData({ ...forgotData, email: e.target.value })}
                  placeholder="Enter your registered email"
                />
                <button
                  type="button"
                  className="jobportal-login-button"
                  onClick={async () => {
                    try {
                      const res = await api.post('/auth/verify-email', { email: forgotData.email });
                      if (res.data.success) {
                        setStep(2);
                      } else {
                        toast.error('Email not found!');
                      }
                    } catch {
                      toast.error('Something went wrong');
                    }
                  }}
                >
                  Next
                </button>
              </>
            )}

            {step === 2 && (
              <>
                <label>Username</label>
                <input
                  type="text"
                  name="username"
                  value={forgotData.username}
                  onChange={(e) => setForgotData({ ...forgotData, username: e.target.value })}
                  placeholder="Enter your username"
                />
                <button
                  type="button"
                  className="jobportal-login-button"
                  onClick={async () => {
                    try {
                      const res = await api.post('/auth/verify-username', {
                        email: forgotData.email,
                        username: forgotData.username
                      });
                      if (res.data.success) {
                        setStep(3);
                      } else {
                        toast.error('Username and email do not match');
                      }
                    } catch {
                      toast.error('Something went wrong');
                    }
                  }}
                >
                  Next
                </button>
              </>
            )}

            {step === 3 && (
              <>
                <label>New Password</label>
                <input
                  type="password"
                  name="newPassword"
                  value={forgotData.newPassword}
                  onChange={(e) => setForgotData({ ...forgotData, newPassword: e.target.value })}
                  placeholder="Enter new password"
                />

                <label>Confirm Password</label>
                <input
                  type="password"
                  name="confirmPassword"
                  value={forgotData.confirmPassword}
                  onChange={(e) => setForgotData({ ...forgotData, confirmPassword: e.target.value })}
                  placeholder="Confirm new password"
                />

                <button
                  type="button"
                  className="jobportal-login-button"
                  onClick={async () => {
                    if (forgotData.newPassword !== forgotData.confirmPassword) {
                      return toast.error('Passwords do not match');
                    }
                    try {
                      const res = await api.post('/auth/reset-password', {
                        email: forgotData.email,
                        username: forgotData.username,
                        newPassword: forgotData.newPassword
                      });
                      if (res.data.success) {
                        toast.success('Password reset successful!');
                        setShowForgotPassword(false);
                        setStep(1);
                        setForgotData({
                          email: '',
                          username: '',
                          newPassword: '',
                          confirmPassword: ''
                        });
                      }
                    } catch {
                      toast.error('Failed to reset password');
                    }
                  }}
                >
                  Reset Password
                </button>
              </>
            )}

            <p className="jobportal-login-switch">
              <button
                type="button"
                className="link-button"
                onClick={() => {
                  setShowForgotPassword(false);
                  setStep(1);
                }}
              >
                Back to login
              </button>
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default Login;
