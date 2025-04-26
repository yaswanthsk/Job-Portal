import React, { useState } from 'react';
import EmployerNavbar from '../Navbar/EmployerNavbar'; // Importing the Navbar component
import './PostJob.css';
import api from '../utils/api';
import { toast } from 'react-toastify';


const PostJob = () => {
  const [errors, setErrors] = useState({});

  const [jobData, setJobData] = useState({
    title: '',
    description: '', // Description field added here
    skills_required: '',
    experience_required: '',
    salary: '',
    location: '',
    job_type: '',
    posted_at: new Date().toISOString() // Automatically set posted_at to current date/time
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setJobData({ ...jobData, [name]: value });
  };

  const validate = () => {
    const newErrors = {};
  
    if (!jobData.title.trim()) {
      newErrors.title = 'Job title is required';
    }
  
    if (!jobData.skills_required.trim()) {
      newErrors.skills_required = 'Skills are required';
    }
  
    if (!jobData.experience_required.trim()) {
      newErrors.experience_required = 'Experience is required';
    }
  
    if (!jobData.salary.trim()) {
      newErrors.salary = 'Salary is required';
    }
  
    if (!jobData.location.trim()) {
      newErrors.location = 'Location is required';
    }
  
    if (!jobData.job_type) {
      newErrors.job_type = 'Job type is required';
    }
  
    if (!jobData.description.trim()) {
      newErrors.description = 'Description is required';
    } else if (jobData.description.trim().length < 20) {
      newErrors.description = 'Description must be at least 20 characters';
    }
  
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };
  
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) return;

    try {
      // Get the token from localStorage or wherever you're storing it
      const token = localStorage.getItem('token');
  
      if (!token) {
        toast.error("You need to log in first!");
        return;
      }
  
      // Send job data to API with Authorization header
      const response = await api.post(
        'auth/post-job', 
        jobData);  
  
      console.log('Job Posted:', response.data);  // Log response data on success
      toast.success(response.data.message || 'Job posted successfully!');
    } catch (error) {
      if (error.response && error.response.data && error.response.data.message) {
        toast.error(error.response.data.message);
      } else {
        toast.error('Failed to post job. Please try again.');
      }
    }
  };
  
  

  return (
    <div className="post-job-container">
      <EmployerNavbar /> {/* Including the Navbar here */}
      <div className="post-job-content">
        <h1 className="post-job-title">Post a New Job</h1>
        <form className="post-job-form" onSubmit={handleSubmit}>
            <div className="input-wrapper">
                <i className="fas fa-briefcase input-icon"></i>
                <input 
                  type="text" 
                  className="form-input" 
                  name="title"
                  placeholder="Job Title" 
                  value={jobData.title} 
                  onChange={handleChange} 
                />
                {errors.title && <div className="input-error">{errors.title}</div>}
            </div>
            <div className="input-wrapper">
                <i className="fas fa-tools input-icon"></i>
                <input 
                  type="text" 
                  className="form-input" 
                  name="skills_required" 
                  placeholder="Skills Required" 
                  value={jobData.skills_required} 
                  onChange={handleChange} 
                />
            {errors.skills_required && <div className="input-error">{errors.skills_required}</div>}
            </div>
            <div className="input-wrapper">
                <i className="fas fa-user-tie input-icon"></i>
                <input 
                  type="text" 
                  className="form-input" 
                  name="experience_required" 
                  placeholder="Experience Required" 
                  value={jobData.experience_required} 
                  onChange={handleChange} 
                />
            {errors.experience_required && <div className="input-error">{errors.experience_required}</div>}

            </div>
            <div className="input-wrapper">
                <i className="fas fa-money-bill input-icon"></i>
                <input 
                  type="text" 
                  className="form-input" 
                  name="salary" 
                  placeholder="Salary" 
                  value={jobData.salary} 
                  onChange={handleChange} 
                />
              {errors.salary && <div className="input-error">{errors.salary}</div>}
              
            </div>
            <div className="input-wrapper">
                <i className="fas fa-map-marker-alt input-icon"></i>
                <input 
                  type="text" 
                  className="form-input" 
                  name="location" 
                  placeholder="Location" 
                  value={jobData.location} 
                  onChange={handleChange} 
                />
            {errors.location && <div className="input-error">{errors.location}</div>}

            </div>
            <div className="input-wrapper">
                  <i className="fas fa-clock input-icon"></i>
                  <select
                    name="job_type"
                    value={jobData.job_type}
                    onChange={handleChange}
                    className="form-input"
                    required
                  >
                     <option value="" disabled>Select Job Type</option>
                    <option value="Full-time">Full-time</option>
                    <option value="Part-time">Part-time</option>
                    <option value="Contract">Contract</option>
                    <option value="Internship">Internship</option>
                  </select>
                  {errors.job_type && <div className="input-error">{errors.job_type}</div>}
                </div>
            {/* Description Field */}
            <div className="input-wrapper">
                <i className="fas fa-file-alt input-icon"></i>
                <textarea 
                  className="form-input" 
                  name="description" 
                  placeholder="Job Description" 
                  value={jobData.description} 
                  onChange={handleChange} 
                />
                {errors.description && <div className="input-error">{errors.description}</div>}
            </div>

            <button type="submit" className="form-submit-button">Post Job</button>
        </form>
      </div>
    </div>
  );
};

export default PostJob;
