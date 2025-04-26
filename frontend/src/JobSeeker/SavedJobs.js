import React, { useEffect, useState } from 'react';
import './SavedJobs.css';
import { toast } from 'react-toastify';
import JobSeekerNavbar from './JobSeekerNavbar';  // Import the JobSeekerNavbar component
import { useNavigate } from 'react-router-dom';  // Import useNavigate hook
import api from '../utils/api';

const SavedJobs = () => {
  const [savedJobs, setSavedJobs] = useState([]);
  const [loading, setLoading] = useState(true); // Loading state
  const navigate = useNavigate();  // Initialize the navigate function

  // Fetch saved jobs from backend
  useEffect(() => {
    const fetchSavedJobs = async () => {
      const token = localStorage.getItem('token');
      if (!token) return;

      try {
        const response = await api.get('/auth/saved-jobs');
        setSavedJobs(response.data);
      } catch (error) {
        console.error('Error fetching saved jobs:', error);
        toast.error('Error fetching saved jobs');
      } finally {
        setLoading(false); // Stop loading after fetch
      }
    };

    fetchSavedJobs();
  }, []);

  const handleSaveUnsave = async (jobId) => {
    const token = localStorage.getItem('token');
    if (!token) return;
  
    try {
      const response = await api.post(`/auth/save-job/${jobId}`);

      if (response.status === 200) {
        // Toggle the job in the saved list
        const jobExists = savedJobs.some(job => job.job_id === jobId);

        if (jobExists) {
          // Unsaved job logic
          setSavedJobs(prevSavedJobs => prevSavedJobs.filter(job => job.job_id !== jobId));
          toast.success('Job unsaved successfully!');
        } else {
          // Saved job logic
          const newJob = { job_id: jobId }; // or fetch the job details to include more data
          setSavedJobs(prevSavedJobs => [...prevSavedJobs, newJob]);
          toast.success('Job saved successfully!');
        }
      } else {
        console.error('Error saving/unsaving job:', response.data.message);
        toast.error('Error while saving/unsaving the job');
      }
    } catch (error) {
      console.error('Error saving/unsaving job:', error);
      toast.error('Error while saving/unsaving the job');
    }
  };

  
  // Handle job details view
  const handleViewDetails = (jobId) => {
    navigate(`/jobseeker/job-details/${jobId}`);  // Navigate to the job details page
  };

  return (
    <div className="SavedJobs-container">
      {/* Use the imported JobSeekerNavbar component */}
      <JobSeekerNavbar />

      {/* HERO SECTION */}
      <div className="SavedJobs-main">
        {/* Saved Job Listings */}
        <section className="SavedJobs-jobs">
          <h2>Your Saved Jobs</h2>
          {loading ? (
            <p>Loading saved jobs...</p>
          ) : savedJobs.length === 0 ? (
            <p>No saved jobs found.</p>
          ) : (
            <div className="SavedJobs-job-list">
              {savedJobs.map((job, index) => (
                <div
                  className="SavedJobs-job-card"
                  key={job.job_id}
                  style={{ animationDelay: `${index * 0.1}s` }}
                >
                  <div 
                    className={`SavedJobs-job-save-icon ${savedJobs.some(j => j.job_id === job.job_id) ? 'saved' : ''}`}
                    onClick={() => handleSaveUnsave(job.job_id)} 
                  >
                    <i className={`fas fa-bookmark ${savedJobs.some(j => j.job_id === job.job_id) ? 'saved' : ''}`}></i>
                  </div>
                  <h3>{job.title}</h3>
                  <p>{job.company_name} • {job.location} • ₹{job.salary} LPA</p>
                  <p>Type: {job.job_type} • Exp: {job.experience_required} yrs</p>
                  {/* Add View Details button */}
                  <button onClick={() => handleViewDetails(job.job_id)}>View Details</button>
                </div>
              ))}
            </div>
          )}
        </section>
      </div>
    </div>
  );
};

export default SavedJobs;
