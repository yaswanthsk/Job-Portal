import React, { useEffect, useState } from 'react';
import api from '../utils/api';
import './ViewJobs.css';
import { jwtDecode } from 'jwt-decode';
import Modal from 'react-modal';
import { toast } from 'react-toastify';

Modal.setAppElement('#root'); // Set app root for accessibility


const ViewJobs = () => {
  const [jobs, setJobs] = useState([]);
  const [filteredJobs, setFilteredJobs] = useState([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingJob, setEditingJob] = useState(null);

  const [filters, setFilters] = useState({
    jobType: '',
    location: '',
    experience: '',
    salary: '',
    sortBy: '',
  });

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (token) {
      try {
        const decoded = jwtDecode(token);
        const userId = decoded.userId;

        const fetchJobs = async () => {
          try {
            const response = await api.get(`/auth/employer-jobs?userId=${userId}`);
            console.log('Fetched jobs:', response.data);
            setJobs(response.data);
            setFilteredJobs(response.data);
          } catch (error) {
            console.error('Failed to fetch jobs:', error);
          }
        };

        fetchJobs();
      } catch (error) {
        console.error('Error decoding token:', error);
      }
    } else {
      console.log('No token found in localStorage');
    }
  }, []);

  useEffect(() => {
    let filtered = [...jobs];

    if (filters.jobType) {
      filtered = filtered.filter(job => job.job_type === filters.jobType);
    }

    if (filters.location) {
      filtered = filtered.filter(job =>
        job.location.toLowerCase().includes(filters.location.toLowerCase())
      );
    }

    if (filters.experience) {
      const [minExp, maxExp] = filters.experience.split('-').map(Number);
      filtered = filtered.filter(job => {
        const jobExp = parseInt(job.experience_required);
        return !isNaN(jobExp) && jobExp >= minExp && jobExp <= maxExp;
      });
    }

    if (filters.salary) {
      const maxSalary = parseInt(filters.salary);
      filtered = filtered.filter(job => {
        const jobSalaryStr = job.salary.toLowerCase();
        const numMatch = jobSalaryStr.match(/(\d+(\.\d+)?)/);
        if (!numMatch) return false;
        const jobSalary = parseFloat(numMatch[0]) * 100000;
        return jobSalary <= maxSalary;
      });
    }

    if (filters.sortBy === 'date') {
      filtered.sort((a, b) => new Date(b.posted_at) - new Date(a.posted_at));
    } else if (filters.sortBy === 'salary-desc') {
      filtered.sort((a, b) => {
        const salaryA = parseFloat(a.salary.match(/(\d+(\.\d+)?)/)?.[0] || 0);
        const salaryB = parseFloat(b.salary.match(/(\d+(\.\d+)?)/)?.[0] || 0);
        return salaryB - salaryA;
      });
    } else if (filters.sortBy === 'salary-asc') {
      filtered.sort((a, b) => {
        const salaryA = parseFloat(a.salary.match(/(\d+(\.\d+)?)/)?.[0] || 0);
        const salaryB = parseFloat(b.salary.match(/(\d+(\.\d+)?)/)?.[0] || 0);
        return salaryA - salaryB;
      });
    }

    setFilteredJobs(filtered);
  }, [filters, jobs]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFilters(prev => ({ ...prev, [name]: value }));
  };

  const openEditModal = (job) => {
    setEditingJob({ ...job });
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setEditingJob(null);
  };

  const handleEditChange = (e) => {
    const { name, value } = e.target;
    setEditingJob(prev => ({ ...prev, [name]: value }));
  };

  const handleUpdateJob = async (e) => {
    e.preventDefault();
    try {
      const token = localStorage.getItem('token');
      if (!token) return;

      const response = await api.put(`/auth/update-job/${editingJob.job_id}`, editingJob);

      toast.success(response.data.message || 'Job updated successfully!');
      
      // Ensure you're comparing `job_id` and updating the list accordingly
      const updatedList = jobs.map(job =>
        job.job_id === editingJob.job_id ? editingJob : job
      );
      
      // Update both jobs and filteredJobs state
      setJobs(updatedList);
      setFilteredJobs(updatedList);
      
      // Close modal after update
      closeModal();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to update job.');
    }
  };
  
  const handleDeleteJob = async (jobId) => {
    if (!window.confirm("Are you sure you want to delete this job?")) return;

    try {
      const token = localStorage.getItem('token');
      if (!token) return;

      const response = await api.delete(`/auth/delete-job/${jobId}`);
      toast.success(response.data.message || "Job deleted successfully!");
      const updatedJobs = jobs.filter(job => job.job_id !== jobId);
      setJobs(updatedJobs);
      setFilteredJobs(updatedJobs);
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to delete job.");
    }
  };

  const handleCloseJob = async (jobId) => {
    if (!window.confirm("Are you sure you want to close this job?")) return;
  
    try {
      const response = await api.put(`/auth/close-job/${jobId}`, {});
      console.log('Response from API:', response);  // Log the response here
      toast.success(response.data.message || "Job status updated to Closed!");
  
      // Update the job status in the jobs list
      const updatedJobs = jobs.map(job =>
        job.job_id === jobId ? { ...job, job_status: 'closed' } : job
      );
      setJobs(updatedJobs);
      setFilteredJobs(updatedJobs);
    } catch (error) {
      console.error('💥 Error occurred while closing job:', error);
      toast.error(error.response?.data?.message || "Failed to close job.");
    }
  };
  
  
  return (
    <div className="view-jobs-container">
      <h2>All Job Listings</h2>

      {/* Filters */}
      <div className="filters">
        <select name="jobType" value={filters.jobType} onChange={handleChange}>
          <option value="">All Job Types</option>
          <option value="Full-time">Full-time</option>
          <option value="Part-time">Part-time</option>
          <option value="Internship">Internship</option>
        </select>

        <input
          type="text"
          name="location"
          placeholder="Location"
          value={filters.location}
          onChange={handleChange}
        />

        <select name="experience" value={filters.experience} onChange={handleChange}>
          <option value="">Any Experience</option>
          <option value="0-1">0-1 Years</option>
          <option value="2-4">2-4 Years</option>
          <option value="5-10">5-10 Years</option>
        </select>

        <select name="salary" value={filters.salary} onChange={handleChange}>
          <option value="">Any Salary</option>
          <option value="300000">Up to ₹3 LPA</option>
          <option value="400000">Up to ₹4 LPA</option>
          <option value="500000">Up to ₹5 LPA</option>
          <option value="600000">Up to ₹6 LPA</option>
          <option value="1000000">Up to ₹10 LPA</option>
          <option value="2000000">Up to ₹20 LPA</option>
          <option value="3000000">Up to ₹30 LPA</option>

        </select>

        <select name="sortBy" value={filters.sortBy} onChange={handleChange}>
          <option value="">Sort By</option>
          <option value="date">Newest</option>
          <option value="salary-desc">Salary: High to Low</option>
          <option value="salary-asc">Salary: Low to High</option>
        </select>
      </div>

      <div className="job-cards">
        {filteredJobs.length > 0 ? (
          filteredJobs.map((job) => (
            <div key={job.job_id} className="job-card">
              <h3>{job.title}</h3>
              <div className="job-row"><strong>Company:</strong><span>{job.company_name}</span></div>
              <div className="job-row"><strong>Location:</strong><span>{job.location}</span></div>
              <div className="job-row"><strong>Type:</strong><span>{job.job_type}</span></div>
              <div className="job-row"><strong>Salary:</strong><span>₹{job.salary}</span></div>
              <div className="job-row"><strong>Skills:</strong><span>{job.skills_required}</span></div>
              <div className="job-row"><strong>Experience:</strong><span>{job.experience_required} years</span></div>
              <div className="job-row"><strong>Posted:</strong><span>{new Date(job.posted_at).toLocaleDateString()}</span></div>
              <div className="job-row">
                <strong>Status:</strong>
                <span
                  className={`status-badge ${job.job_status}`}
                >
                  {job.job_status}
                </span>
              </div>


              {/* Icon Container */}
              <div className="buttons-container">
                <button className="edit-btn" onClick={() => openEditModal(job)}>
                  <i className="fas fa-edit"></i> {/* Edit Icon */}
                </button>
                <button className="delete-btn" onClick={() => handleDeleteJob(job.job_id)}>
                  <i className="fas fa-trash-alt"></i> {/* Delete Icon */}
                </button>
                <button className="close-btn" onClick={() => handleCloseJob(job.job_id)}>
                  <i className="fas fa-times-circle"></i> {/* Close Icon */}
                </button>

              </div>
            </div>
          ))
        ) : (
          <p>No jobs found.</p>
        )}
      </div>
      <Modal
        isOpen={isModalOpen}
        onRequestClose={closeModal}
        contentLabel="Edit Job Modal"
        style={{
          overlay: { backgroundColor: 'rgba(0, 0, 0, 0.5)' },
          content: {
            top: '50%',
            left: '50%',
            right: 'auto',
            bottom: 'auto',
            marginRight: '-50%',
            transform: 'translate(-50%, -50%)',
            padding: '1.5rem', // Reduced padding inside modal
            width: '100%',
            maxWidth: '500px', // Limit the width of the modal
            borderRadius: '10px',
            maxHeight: '90vh', // Limit the height to 90% of the viewport height
            overflowY: 'auto', // Allow scrolling if content exceeds the max height
          },
        }}
      >
        {editingJob && (
          <form className="edit-job-form" onSubmit={handleUpdateJob}>
            <h2 className="modal-heading">Edit Job</h2>
            <label htmlFor="title">Job Title</label>
            <input
              type="text"
              id="title"
              name="title"
              value={editingJob.title}
              onChange={handleEditChange}
              placeholder="Enter Job Title"
            />
            <label htmlFor="skills_required">Skills Required</label>
            <input
              type="text"
              id="skills_required"
              name="skills_required"
              value={editingJob.skills_required}
              onChange={handleEditChange}
              placeholder="Enter Skills"
            />
            <label htmlFor="experience_required">Experience Required</label>
            <input
              type="text"
              id="experience_required"
              name="experience_required"
              value={editingJob.experience_required}
              onChange={handleEditChange}
              placeholder="Enter Experience"
            />
            <label htmlFor="salary">Salary</label>
            <input
              type="text"
              id="salary"
              name="salary"
              value={editingJob.salary}
              onChange={handleEditChange}
              placeholder="Enter Salary"
            />
            <label htmlFor="location">Location</label>
            <input
              type="text"
              id="location"
              name="location"
              value={editingJob.location}
              onChange={handleEditChange}
              placeholder="Enter Location"
            />
            <label htmlFor="job_type">Job Type</label>
            <select
              id="job_type"
              name="job_type"
              value={editingJob.job_type}
              onChange={handleEditChange}
            >
              <option value="Full-time">Full-time</option>
              <option value="Part-time">Part-time</option>
              <option value="Contract">Contract</option>
              <option value="Internship">Internship</option>
            </select>
            <label htmlFor="description">Job Description</label>
            <textarea
              id="description"
              name="description"
              value={editingJob.description}
              onChange={handleEditChange}
              placeholder="Enter Job Description"
            />
            <div className="modal-buttons">
              <button type="submit">Update</button>
              <button type="button" onClick={closeModal}>
                Cancel
              </button>
            </div>
          </form>
        )}
      </Modal>

    </div>

  );
};

export default ViewJobs;
