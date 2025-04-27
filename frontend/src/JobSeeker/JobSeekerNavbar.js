import React from 'react';
import { Link, useNavigate  } from 'react-router-dom';
import './JobSeekerLanding.css'; // Reusing existing CSS class names

const JobSeekerNavbar = () => {

  const navigate = useNavigate(); // Hook to navigate programmatically

  const handleLogout = () => {
    localStorage.removeItem('token');
    navigate('/login'); 
  };

  return (
    <nav className="SavedJobs-navbar">
      <div className="SavedJobs-logo">Jobify</div>
      <ul className="SavedJobs-nav-links">
        <li><Link to="/jobseeker/dashboard">Browse Jobs</Link></li>
        <li><Link to="/jobseeker/savedjob" className="SavedJobs-link">Saved</Link></li>
        <li><Link to="/jobseeker/my-applications" className="SavedJobs-link">My Applications</Link></li>
        <li><Link to="/jobseeker/profile">Profile</Link></li>
        <li><button onClick={handleLogout} className="SavedJobs-logoutBtn">Logout</button></li>

      </ul>
    </nav>
  );
};

export default JobSeekerNavbar;
