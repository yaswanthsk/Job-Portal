import React, { useEffect, useState } from 'react';
import api from '../utils/api';
import './MyApplications.css';
import JobSeekerNavbar from './JobSeekerNavbar';

const MyApplications = () => {
  const [applications, setApplications] = useState([]);

  useEffect(() => {
    const fetchApplications = async () => {
      try {
        const token = localStorage.getItem('token');
        if (!token) return;
        const response = await api.get('/auth/jobseeker-applications'); 
        setApplications(response.data);
        console.log(response.data)
      } catch (err) {
        console.error('Error fetching applications:', err);
      }
    };

    fetchApplications();
  }, []);

  return (
    <>
      <JobSeekerNavbar />
      <div className="myApplications-container">
        <h2 className="myApplications-title">My Applications</h2>
        {applications.length === 0 ? (
          <p className="myApplications-noApplications">You haven't applied to any jobs yet.</p>
        ) : (
          <div className="myApplications-listWrapper">
            {applications.map((app) => (
              <div key={app.application_id} className="myApplications-card">
                <div className="myApplications-jobDetails">
                  <h3 className="myApplications-jobTitle">{app.job_title}</h3>
                  <p className="myApplications-companyName">{app.company_name}</p>
                  <div className="myApplications-jobMeta">
                    <span className="myApplications-location">{app.job_location}</span>
                    <span className="myApplications-jobtype">{app.job_type}</span>
                    <span className="myApplications-salary">{app.salary}</span>
                  </div>
                </div>
                <div className={`myApplications-statusTag myApplications-${app.application_status.toLowerCase()}`}>
                  
                  {app.application_status}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </>
  );
};

export default MyApplications;
