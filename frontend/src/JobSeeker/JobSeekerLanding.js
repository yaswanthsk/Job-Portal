import React, { useEffect, useState } from 'react';
import { Link , useNavigate} from 'react-router-dom';
import api from '../utils/api';
import './JobSeekerLanding.css';
import { toast } from 'react-toastify';

const JobSeekerLanding = () => {
  const [jobs, setJobs] = useState([]);
  const [filteredJobs, setFilteredJobs] = useState([]);
  const [savedJobs, setSavedJobs] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [suggestions, setSuggestions] = useState([]);
  const [showSuggestions, setShowSuggestions] = useState(false);

  const [locationFilters, setLocationFilters] = useState([]);
  const [jobTypeFilters, setJobTypeFilters] = useState([]);
  const [salaryFilters, setSalaryFilters] = useState([]);
  const [experienceFilters, setExperienceFilters] = useState([]);

  const jobTypes = ['Full-time', 'Part-time', 'Contract', 'Internship'];
  const salaryRanges = ['0-5 LPA', '5-10 LPA', '10+ LPA'];
  const experienceRanges = ['0-1', '1-3', '3+'];

  const navigate = useNavigate();
  
    const handleLogout = () => {
      localStorage.removeItem('token');
      navigate('/login'); 
    };

    
  useEffect(() => {
    const fetchJobs = async () => {
      try {
        const response = await api.get('/auth/all-jobs'); 
        setJobs(response.data);
        setFilteredJobs(response.data);
      } catch (err) {
        console.error('Error fetching jobs:', err);
      }
    };

    fetchJobs();
  }, []);

  useEffect(() => {
    const fetchSavedJobs = async () => {
      const token = localStorage.getItem('token');
      if (!token) return;
  
      try {
        const response = await api.get('/auth/saved-jobs'); // Use axios to fetch saved jobs

        const savedData = response.data;
  
        if (response.status === 200) {          // Map saved job IDs to actual job objects
          const mappedJobs = jobs.filter((job) =>
            savedData.some((saved) => saved.job_id === job.job_id)
          );
          setSavedJobs(mappedJobs);
        } else {
          console.error('Failed to fetch saved jobs:', savedData.message);
        }
      } catch (err) {
        console.error('Error fetching saved jobs:', err);
      }
    };
  
    if (jobs.length > 0) {
      fetchSavedJobs();
    }
  }, [jobs]);
  
  

  const handleSearch = (term) => {
    let results = jobs.filter((job) =>
      job.title.toLowerCase().includes(term.toLowerCase())
    );
    results = applyFilters(results);
    setFilteredJobs(results);
  };

  const handleInputChange = (e) => {
    const value = e.target.value;
    setSearchTerm(value);

    if (value.trim() === '') {
      setSuggestions([]);
      setShowSuggestions(false);
      setFilteredJobs(applyFilters(jobs));
      return;
    }

    const matches = jobs
      .map((job) => job.title)
      .filter((title, index, self) =>
        title.toLowerCase().includes(value.toLowerCase()) &&
        self.indexOf(title) === index
      );

    setSuggestions(matches);
    setShowSuggestions(true);
    handleSearch(value);
  };

  const handleSuggestionClick = (suggestion) => {
    setSearchTerm(suggestion);
    setShowSuggestions(false);
    handleSearch(suggestion);
  };

  const handleCheckboxChange = (filterType, value) => {
    const updateFilters = (prev) =>
      prev.includes(value) ? prev.filter((v) => v !== value) : [...prev, value];

    if (filterType === 'location') setLocationFilters(updateFilters);
    if (filterType === 'jobType') setJobTypeFilters(updateFilters);
    if (filterType === 'salary') setSalaryFilters(updateFilters);
    if (filterType === 'experience') setExperienceFilters(updateFilters);
  };

  const parseSalary = (salaryStr) => {
    const match = salaryStr.match(/(\d+)/);
    return match ? parseInt(match[1]) : 0;
  };

  const parseExperience = (expStr) => {
    const numbers = expStr.match(/\d+/g);
    return numbers ? parseInt(numbers[0]) : 0;
  };

  const handleViewDetails = (jobId) => {
    navigate(`/jobseeker/job-details/${jobId}`);
  };

  const applyFilters = (jobList) => {
    return jobList.filter((job) => {
      const matchesLocation = locationFilters.length === 0 || locationFilters.includes(job.location);
      const matchesJobType = jobTypeFilters.length === 0 || jobTypeFilters.includes(job.job_type);
      const matchesSalary =
        salaryFilters.length === 0 ||
        salaryFilters.some((range) => {
          const salary = parseSalary(job.salary);
          if (range === '0-5 LPA') return salary <= 5;
          if (range === '5-10 LPA') return salary > 5 && salary <= 10;
          if (range === '10+ LPA') return salary > 10;
          return true;
        });
      const matchesExperience =
        experienceFilters.length === 0 ||
        experienceFilters.some((range) => {
          const exp = parseExperience(job.experience_required || '');
          if (range === '0-1') return exp <= 1;
          if (range === '1-3') return exp > 1 && exp <= 3;
          if (range === '3+') return exp > 3;
          return true;
        });

      return matchesLocation && matchesJobType && matchesSalary && matchesExperience;
    });
  };

  useEffect(() => {
    const filtered = applyFilters(
      jobs.filter((job) =>
        job.title.toLowerCase().includes(searchTerm.toLowerCase())
      )
    );
    setFilteredJobs(filtered);
  }, [locationFilters, jobTypeFilters, salaryFilters, experienceFilters]);

  const getUniqueLocations = () => {
    const locations = jobs.map((job) => job.location);
    return [...new Set(locations)];
  };

  const handleSaveJob = async (job) => {
    const token = localStorage.getItem('token');
    if (!token) {
      toast.warning('Please login to save jobs.');
      return;
    }
  
    try {
      const response = await api.post(`/auth/save-job/${job.job_id}`);
      setSavedJobs((prevSavedJobs) => {
        const alreadySaved = prevSavedJobs.some(savedJob => savedJob.job_id === job.job_id);

          if (alreadySaved) {
            return prevSavedJobs.filter(savedJob => savedJob.job_id !== job.job_id);
          } else {
            return [...prevSavedJobs, job];
          }
        });
  
    } catch (error) {
      toast.error('Error saving job');  // Show error message using toast
      console.error('Error saving job:', error);
    }
  };
  
  
  

  return (
    <div className="JobSeekerLanding-container">
      <nav className="JobSeekerLanding-navbar">
        <div className="JobSeekerLanding-logo">CAREER CONNECT</div>
        <ul className="JobSeekerLanding-nav-links">
          <li>Browse Jobs</li>
          <li>
          <Link to="/jobseeker/savedjob" className="JobSeekerLanding-link"> Saved</Link>
          </li>
          <li><Link to="/jobseeker/my-applications" className="JobSeekerLanding-link">My Applications</Link></li>
          <li>
          <Link to="/jobseeker/profile" className="JobSeekerLanding-link"> Profile</Link>
          </li>
          <li><button onClick={handleLogout} className="SavedJobs-logoutBtn">Logout</button></li>

        </ul>
      </nav>

      <header className="JobSeekerLanding-hero">
        <h1 className="JobSeekerLanding-title">Find Your Dream Job</h1>
        <p className="JobSeekerLanding-subtitle">Search from thousands of listings</p>
        <div className="JobSeekerLanding-search-bar">
          <input
            type="text"
            placeholder="Search jobs..."
            value={searchTerm}
            onChange={handleInputChange}
            onFocus={() => setShowSuggestions(true)}
            onBlur={() => setTimeout(() => setShowSuggestions(false), 200)}
          />
          <button onClick={() => handleSearch(searchTerm)}>Search</button>
          {showSuggestions && suggestions.length > 0 && (
            <ul className="JobSeekerLanding-suggestions">
              {suggestions.map((s, index) => (
                <li key={index} onClick={() => handleSuggestionClick(s)}>
                  {s}
                </li>
              ))}
            </ul>
          )}
        </div>
      </header>

      <div className="JobSeekerLanding-main">
        <aside className="JobSeekerLanding-filters">
          <h3>Filters</h3>

          {/* Location */}
          <details>
            <summary>Location</summary>
            {getUniqueLocations().map((loc, idx) => (
              <label key={idx}>
                <span>{loc}</span>
                <input
                  type="checkbox"
                  onChange={() => handleCheckboxChange('location', loc)}
                  checked={locationFilters.includes(loc)}
                />
              </label>
            ))}
          </details>

          {/* Job Type */}
          <details>
            <summary>Job Type</summary>
            {jobTypes.map((type, idx) => (
              <label key={idx}>
                <span>{type}</span>
                <input
                  type="checkbox"
                  onChange={() => handleCheckboxChange('jobType', type)}
                  checked={jobTypeFilters.includes(type)}
                />
              </label>
            ))}
          </details>

          {/* Salary */}
          <details>
            <summary>Salary</summary>
            {salaryRanges.map((range, idx) => (
              <label key={idx}>
                <span>{range}</span>
                <input
                  type="checkbox"
                  onChange={() => handleCheckboxChange('salary', range)}
                  checked={salaryFilters.includes(range)}
                />
              </label>
            ))}
          </details>

          {/* Experience */}
          <details>
            <summary>Experience</summary>
            {experienceRanges.map((range, idx) => (
              <label key={idx}>
                <span>{range} yrs</span>
                <input
                  type="checkbox"
                  onChange={() => handleCheckboxChange('experience', range)}
                  checked={experienceFilters.includes(range)}
                />
              </label>
            ))}
          </details>
        </aside>

        <section className="JobSeekerLanding-jobs">
          <h2>Jobs for You</h2>
          {filteredJobs.length === 0 ? (
            <p>No jobs found.</p>
          ) : (
            <div className="JobSeekerLanding-job-list">
              {filteredJobs.map((job, index) => (
                <div
                  className="JobSeekerLanding-job-card"
                  key={job.job_id}
                  style={{ animationDelay: `${index * 0.1}s` }}
                >
                <div
                className={`JobSeekerLanding-job-save-icon ${savedJobs.some((savedJob) => savedJob.job_id === job.job_id) ? 'saved' : ''}`}
                onClick={() => handleSaveJob(job)}
                >
                <i className={`fas fa-bookmark ${savedJobs.some((savedJob) => savedJob.job_id === job.job_id) ? 'saved' : ''}`}></i>
                </div>
                  <h3>{job.title}</h3>
                  <p>
                    {job.company_name} • {job.location} • ₹{job.salary} LPA
                  </p>
                  <p>Type: {job.job_type} • Exp: {job.experience_required} yrs</p>
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

export default JobSeekerLanding;
