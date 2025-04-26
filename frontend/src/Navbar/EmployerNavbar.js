import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Link } from 'react-router-dom';
import './EmployerNavbar.css';

const EmployerNavbar = ({ isAuthenticated = true, userRole = 'employer', onLogout }) => {
  const [showDropdown, setShowDropdown] = useState(false);
  const navigate = useNavigate(); // Initialize navigate function

  const handleProfileClick = () => {
    setShowDropdown(!showDropdown);
  };

  const handleLogout = () => {
    localStorage.clear();         // Clear all local storage
    navigate('/login');           // Redirect to login page
  };

  return (
    <nav className="navbar">
      <div className="navbar-container">
        {/* Logo */}
        <h2 className="navbar-logo">CAREER CONNECT</h2>

        {/* Navbar Links */}
        <div className="navbar-links">

          {isAuthenticated && userRole === 'employer' && (
            <>
              <Link to="/employer/dashboard" className="navbar-link">Dashboard</Link>
              <Link to="/employer/post-job" className="navbar-link">Post Job</Link>
            </>
          )}

          {isAuthenticated ? (
            <>
              {/* Profile Dropdown */}
              <div className="navbar-profile-container">
                <button className="navbar-profile-button" onClick={handleProfileClick}>
                  Profile ▾
                </button>
                {showDropdown && (
                  <div className="navbar-dropdown">
                    <Link to="/employer/profile" className="navbar-dropdown-item">My Profile</Link>
                  </div>
                )}
              </div>

              {/* Logout */}
              <button className="navbar-logout" onClick={handleLogout}>Logout</button>
            </>
          ) : null}
        </div>
      </div>
    </nav>
  );
};

export default EmployerNavbar;
