import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import api from '../utils/api';
import JobSeekerNavbar from './JobSeekerNavbar';
import { toast } from 'react-toastify';
import './JobDetails.css';

const JobDetails = () => {
  const { jobId } = useParams();
  const [job, setJob] = useState(null);
  const [profileCompleted, setProfileCompleted] = useState(false);  // Added state for profile completion check
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchJobDetails = async () => {
      try {
        const response = await api.get(`/auth/jobs/${jobId}`);
        setJob(response.data);
      } catch (error) {
        console.error('Error fetching job details:', error);
      }
    };

    const checkProfileCompletion = async () => {
      try {
        const response = await api.get('/auth/jobseeker/profile');
        if (response.status === 200 && response.data) {
          // Assume that if profile data exists, it means the profile is completed.
          setProfileCompleted(true);
        } else {
          setProfileCompleted(false);
        }
      } catch (error) {
        console.error('Error fetching profile data:', error);
        setProfileCompleted(false);
      }
      setLoading(false);  // Set loading to false after the check is completed
    };

    fetchJobDetails();
    checkProfileCompletion();
  }, [jobId]);

  const handleApply = async () => {
    if (!profileCompleted) {
      toast.error('Please complete your profile before applying for a job.');
      return;
    }

    try {
      const response = await api.post(`/auth/apply-for-job/${jobId}`);
      if (response.status === 200) {
        toast.success('Application submitted successfully!');
      } else {
        toast.error(response.data.message || 'Failed to apply.');
      }
    } catch (error) {
      toast.error('You may have already applied or an error occurred.');
      console.error('Error applying for the job:', error);
    }
  };

  if (loading) return <p className="JobDetails-loading">Loading job details...</p>;

  if (!job) return <p className="JobDetails-loading">Job not found.</p>;

  return (
    <>
      <JobSeekerNavbar />
      <div className="JobDetails-container">
        <div className="JobDetails-card">
          <div className="JobDetails-header">
            <img
              src="https://cdn-icons-png.flaticon.com/512/3135/3135768.png"
              alt="Company Logo"
              className="JobDetails-company-logo"
            />
            <div className="JobDetails-title-section">
              <h2>{job.title}</h2>
              <p className="JobDetails-company">{job.company_name}</p>
              <p className="JobDetails-location"><i className="fas fa-map-marker-alt"></i> {job.location}</p>
            </div>
          </div>

          <div className="JobDetails-info">
            <p><strong>Description:</strong> {job.description}</p>
            <p><strong>Skills Required:</strong> {job.skills_required}</p>
            <div className="JobDetails-tags">
              <span><i className="fas fa-briefcase"></i> {job.experience_required} yrs exp</span>
              <span><i className="fas fa-money-bill-wave"></i> ₹{job.salary} LPA</span>
              <span><i className="fas fa-clock"></i> {job.job_type}</span>
            </div>
          </div>

          <div className="JobDetails-meta-row">
            <p><i className="fas fa-calendar-alt"></i> Posted on: {new Date(job.posted_at).toDateString()}</p>
            <p><i className="fas fa-building"></i> Work Mode: {job.work_mode || 'Onsite'}</p>
            <p><i className="fas fa-layer-group"></i> Department: {job.department || 'General'}</p>
          </div>

          <div className="JobDetails-benefits">
            <h4 className="JobDetails-left-align">Perks & Benefits</h4>
            <ul>
              <li>Flexible work hours</li>
              <li>Health insurance</li>
              <li>Learning & development allowance</li>
              <li>Performance bonuses</li>
            </ul>
          </div>
          <hr className="JobDetails-divider" />

          <div className="JobDetails-about-company">
            <h4 className="JobDetails-left-align">About the Company</h4>
            <p>{job.company_description || "We are a leading tech company focused on building scalable, efficient solutions for global impact."}</p>
          </div>
          <hr className="JobDetails-divider" />

          <div className="JobDetails-how-to-apply">
            <h4 className="JobDetails-left-align">Tips before applying</h4>
            <p>Make sure your resume highlights your relevant skills. Include measurable achievements. Customize your cover letter!</p>
          </div>

          <div className="JobDetails-back">
            <a href="/jobseeker/dashboard"><i className="fas fa-arrow-left"></i> Back to Listings</a>
          </div>

          {/* Apply button */}
          <div className="JobDetails-cta">
            <button
              onClick={handleApply}
              disabled={!profileCompleted}  // Disable if profile is incomplete
            >
              Apply Now
            </button>
          </div>

          {/* Profile completion message */}
          {!profileCompleted && !loading && (
            <div className="profile-warning">
              <i className="fas fa-exclamation-circle"></i> You must complete your profile before applying for this job.
            </div>
          )}
        </div>
      </div>
    </>
  );
};

export default JobDetails;
