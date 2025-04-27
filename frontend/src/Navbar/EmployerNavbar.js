import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import './EmployerNavbar.css';

const EmployerNavbar = ({ isAuthenticated = true, userRole = 'employer' }) => {
  const [showMobileMenu, setShowMobileMenu] = useState(false);
  const navigate = useNavigate();

  const handleLogout = () => {
    localStorage.clear();
    navigate('/login');
  };

  const toggleMobileMenu = () => {
    setShowMobileMenu(!showMobileMenu);
  };

  return (
    <nav className="navbar">
      <div className="navbar-container">
        {/* Logo */}
        <h2 className="navbar-logo">CAREER CONNECT</h2>

        {/* Hamburger Icon */}
        <div className="navbar-hamburger" onClick={toggleMobileMenu}>
          ☰
        </div>

        {/* Navbar links */}
        <div className={`navbar-links ${showMobileMenu ? 'show' : ''}`}>
          {isAuthenticated && userRole === 'employer' && (
            <>
              <Link to="/employer/dashboard" className="navbar-link">Dashboard</Link>
              <Link to="/employer/post-job" className="navbar-link">Post Job</Link>
              <Link to="/employer/profile" className="navbar-link">Profile</Link>
            </>
          )}

          {isAuthenticated && (
            <button className="navbar-logout" onClick={handleLogout}>Logout</button>
          )}
        </div>
      </div>
    </nav>
  );
};

export default EmployerNavbar;
