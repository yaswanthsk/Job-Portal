import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';  // Import the useNavigate hook
import api from '../utils/api';  // Assuming you have an API utility to handle requests
import { jwtDecode } from 'jwt-decode';  // Import jwt-decode
import './EmployerDashboard.css';
import { formatDistanceToNow } from 'date-fns';

const EmployerDashboard = () => {
  const navigate = useNavigate();  // Initialize useNavigate
  const [totalJobsPosted, setTotalJobsPosted] = useState(0);
  const [activeJobs, setActiveJobs] = useState(0);
  const [applicationsReceived, setApplicationsReceived] = useState(0);
  const [recentActivity, setRecentActivity] = useState([]); // State for storing recent activity

  useEffect(() => {
    const fetchJobStats = async () => {
      try {
        const token = localStorage.getItem('token');  // Get the token for authentication

        if (token) {
          // Decode the token to extract userId
          const decodedToken = jwtDecode(token);
          const userIdFromToken = decodedToken.userId;  // Assuming userId is in the token payload

          // Fetch the total jobs posted and active jobs for this employer in one go
          const jobsResponse = await api.get(`/auth/stats/${userIdFromToken}`);
          const totalPosted = jobsResponse.data.totalJobs;  // Assuming the response contains totalJobs
          const activeJobCount = jobsResponse.data.activeJobs;  // Assuming the response contains activeJobs
          const applications = jobsResponse.data.totalApplications;

          setTotalJobsPosted(totalPosted);
          setActiveJobs(activeJobCount);
          setApplicationsReceived(applications);
        }
      } catch (error) {
        console.error('Error fetching job statistics:', error);
      }
    };

    const fetchRecentActivity = async () => {
      try {
        const response = await api.get('/auth/employer-activity');
        setRecentActivity(response.data);  // Set the fetched activity data
      } catch (error) {
        console.error('Error fetching recent activity:', error);
      }
    };

    if (localStorage.getItem('token')) {
      fetchJobStats();
      fetchRecentActivity();  // Fetch recent activity when the component mounts
    }
  }, []);  // Empty dependency array to run only once after the component mounts

  const goToPostJob = () => {
    navigate('/employer/post-job');  // Navigate to the Post Job page
  };

  const goToViewJob = () => {
    navigate('/employer/view-jobs');
  };

  const goToApplications = () => {
    navigate('/employer/view-applications');
  };

  return (
    <div className="dashboard-container">
      <h1 className="dashboard-title">Welcome, Employer!</h1>

      {/* Stats Section */}
      <div className="dashboard-stats">
        <div className="dashboard-card">Total Jobs Posted<br /><span>{totalJobsPosted}</span></div>
        <div className="dashboard-card">Applications Received<br /><span>{applicationsReceived}</span></div>
        <div className="dashboard-card">Active Jobs<br /><span>{activeJobs}</span></div>
      </div>

      {/* Actions */}
      <div className="dashboard-actions">
        <div className="action-card" onClick={goToPostJob}>➕ Post a New Job</div>
        <div className="action-card" onClick={goToViewJob}>📄 View All Jobs</div>
        <div className="action-card" onClick={goToApplications}>👥 View Applications</div>
      </div>

      {/* Recent Activity */}
      {/* Recent Activity */}
      <div className="dashboard-activity">
        <h2 className="dashboard-section-title">📢 Recent Activity</h2>
        {recentActivity.length > 0 ? (
          <ul className="activity-list">
            {recentActivity.map((item, index) => {
              const isJobPost = item.activity.toLowerCase().includes('posted');
              const icon = isJobPost ? '📄' : '📥';

              return (
                <li key={index} className="activity-item">
                  <div className="activity-icon">{icon}</div>
                  <div className="activity-content">
                    <span className="activity-text">{item.activity}</span>
                    <span className="activity-time">
                      {formatDistanceToNow(new Date(item.activity_time), { addSuffix: true })}
                    </span>
                  </div>
                </li>
              );
            })}

          </ul>
        ) : (
          <p className="no-activity">No recent activity yet.</p>
        )}
      </div>
      

    </div>
  );
};

export default EmployerDashboard;
