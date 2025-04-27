import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../utils/api'; // <-- Import your custom axios instance
import './Home.css';

const Home = () => {
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [jobs, setJobs] = useState([]);
  const navigate = useNavigate();

  const images = [
    'https://img.freepik.com/premium-photo/young-woman-working-laptop-office_52137-45754.jpg?w=1380',
    'https://img.freepik.com/free-photo/career-employment-job-work-concept_53876-123876.jpg?t=st=1745393500~exp=1745397100~hmac=9a2648fed23b833f5d45721be655e68eaab5e340dab2c6e3d06567157d047961&w=1800',
    'https://media.istockphoto.com/id/693293382/photo/man-hand-writing-job-vacancy-with-black-marker-on-visual-screen.jpg?s=612x612&w=0&k=20&c=jAqWfyVcI5wToX03BCz67ym9BMzj8cJ7if8qqAtMAII='
  ];

  // Function to change images
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentImageIndex((prevIndex) => (prevIndex + 1) % images.length);
    }, 3000); // Change image every 3 seconds

    return () => clearInterval(interval); // Cleanup interval on component unmount
  }, [images.length]);

  useEffect(() => {
    const fetchJobs = async () => {
      try {
        const res = await api.get('/auth/all-jobs');
        setJobs(res.data);
        console.log(res.data)
      } catch (err) {
        console.error('Error fetching jobs:', err);
      }
    };

    fetchJobs();
  }, []);

  const handleApplyClick = () => {
    navigate('/login');
  };

  return (
    <div className="Home-container">
      {/* Navbar */}
      <nav className="Home-navbar">
        <div className="Home-logo">CAREER CONNECT</div>
        <div className="Home-nav-links">
          <a href="/login" className="Home-nav-btn">Login</a>
          <a href="/signup" className="Home-nav-btn signup">Signup</a>
        </div>
      </nav>

      {/* Hero Section */}
      <header className="Home-hero">
        <div className="Home-hero-content">
          <h1 className="Home-title">Launch Your Career with Code Career</h1>
          <p className="Home-subtitle">
            Whether you're a fresh graduate or an experienced professional, discover job opportunities tailored to your skills and ambitions.
          </p>
          <p className="Home-subtitle">
            Join a community where talent meets opportunity — connect with top companies and take the next step in your journey today.
          </p>
        </div>

        <div className="Home-image-carousel">
          <img src={images[currentImageIndex]} alt="Carousel" className="Home-carousel-img" />
        </div>
      </header>

      {/* Featured Jobs Section */}
      <section className="Home-featured-jobs">
        <h2>Featured Jobs</h2>
        <div className="Home-job-carousel">
          {jobs.length > 0 ? (
            jobs.map((job) => (
              <div className="Home-job-item" key={job.job_id}>
                <h3>{job.title}</h3>
                <p>Company: {job.company_name}</p>
                <button className="Home-btn secondary" onClick={handleApplyClick}>
                  Apply Now
                </button>
              </div>
            ))
          ) : (
            <p>Loading jobs...</p>
          )}
        </div>
      </section>


      {/* How It Works Section */}
      <section className="Home-how-it-works">
        <h2>How It Works</h2>
        <div className="Home-how-it-steps">
          <div className="Home-how-it-step">
            <h3>1. Create an Account</h3>
            <p>Sign up for free and create your profile.</p>
          </div>
          <div className="Home-how-it-step">
            <h3>2. Search for Jobs</h3>
            <p>Find jobs that match your skills and interests.</p>
          </div>
          <div className="Home-how-it-step">
            <h3>3. Apply & Get Hired</h3>
            <p>Submit applications and connect with employers.</p>
          </div>
        </div>
      </section>

      {/* Testimonials Section */}
      <section className="Home-testimonials">
        <h2>What Our Users Say</h2>
        <div className="Home-testimonial-list">
          <div className="Home-testimonial-item">
            <p>"Code Career helped me land my dream job as a full-stack developer. The process was simple and fast!"</p>
            <h4>- John Doe</h4>
          </div>
          <div className="Home-testimonial-item">
            <p>"I found the perfect candidate for my company's open position through this platform!"</p>
            <h4>- Sarah Lee, CEO of Tech Innovators</h4>
          </div>
        </div>
      </section>

      {/* Newsletter Section */}
      <section className="Home-newsletter">
        <h2>Stay Informed, Stay Ahead</h2>
        <p>Explore job search tips, resume writing guides, and industry insights to get ahead in your career.</p>

      </section>


      {/* Footer Section */}
      <footer className="Home-footer">
        <div className="Home-footer-content">
          <div className="Home-footer-section">
            <h4>Contact Us</h4>
            <p>Email: support@codecareer.com</p>
            <p>Phone: +91 98765 43210</p>
          </div>
          <div className="Home-footer-section">
            <h4>Location</h4>
            <p>Code Career HQ</p>
            <p>123 Career Street, Tech City, IN 560001</p>
          </div>
          <div className="Home-footer-section">
            <h4>Quick Links</h4>
            <a href="/about">About Us</a>
            <a href="/contact">Contact</a>
            <a href="/privacy">Privacy Policy</a>
          </div>
        </div>
        <div className="Home-footer-bottom">
          <p>&copy; {new Date().getFullYear()} Code Career. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
};

export default Home;
