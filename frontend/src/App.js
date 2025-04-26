import React from 'react';
import './App.css';
import { Routes, Route, useNavigate } from 'react-router-dom';
import { ToastContainer } from 'react-toastify';
import { useEffect } from 'react';
import { setLogoutFunction } from './utils/api'; 
import 'react-toastify/dist/ReactToastify.css';
import ProtectedRoute from './utils/ProtectedRoute';

import Signup from './Authentication/Signup';
import Login from './Authentication/Login';
import Home from './Home/Home';
import EmployerNavbar from './Navbar/EmployerNavbar';
import EmployerDashboard from './Employer/EmployerDashboard';
import PostJob from './Employer/PostJob';
import ViewJobs from './Employer/ViewJobs';
import EmployerProfile from './Employer/EmployerProfile';
import JobSeekerLanding from './JobSeeker/JobSeekerLanding';
import SavedJobs from './JobSeeker/SavedJobs';
import JobDetails from './JobSeeker/JobDetails';
import JobSeekerProfile from './JobSeeker/JobSeekerProfile';
import ViewApplications from './Employer/ViewApplications';
import MyApplications from './JobSeeker/MyApplications';


function App() {

const navigate = useNavigate();

  useEffect(() => {
    setLogoutFunction(() => {
      navigate('/login');
    });
  }, [navigate]);

  return (
    <div className="App">
      <ToastContainer />
      <Routes>

        {/* Public Routes */}
        <Route path="/" element={<Home />} />
        <Route path="/login" element={<Login />} />
        <Route path="/signup" element={<Signup />} />

        {/* Employer Protected Routes */}
        <Route 
          path="/employer/dashboard" 
          element={
            <ProtectedRoute allowedRoles={['employer']}>
              <> <EmployerNavbar /> <EmployerDashboard /> </>
            </ProtectedRoute>
          }
        />
        
        <Route 
          path="/employer/post-job" 
          element={
            <ProtectedRoute allowedRoles={['employer']}>
              <PostJob />
            </ProtectedRoute>
          }
        />

        <Route 
          path="/employer/view-jobs" 
          element={
            <ProtectedRoute allowedRoles={['employer']}>
              <> <EmployerNavbar /> <ViewJobs /> </>
            </ProtectedRoute>
          }
        />

        <Route 
          path="/employer/profile" 
          element={
            <ProtectedRoute allowedRoles={['employer']}>
              <> <EmployerNavbar /> <EmployerProfile /> </>
            </ProtectedRoute>
          }
        />

        <Route 
          path="/employer/view-applications" 
          element={
            <ProtectedRoute allowedRoles={['employer']}>
              <ViewApplications />
            </ProtectedRoute>
          }
        />

        {/* Job Seeker Protected Routes */}
        <Route 
          path="/jobseeker/dashboard" 
          element={
            <ProtectedRoute allowedRoles={['seeker']}>
              <JobSeekerLanding />
            </ProtectedRoute>
          }
        />

        <Route 
          path="/jobseeker/savedjob" 
          element={
            <ProtectedRoute allowedRoles={['seeker']}>
              <SavedJobs />
            </ProtectedRoute>
          }
        />

        <Route 
          path="/jobseeker/job-details/:jobId" 
          element={
            <ProtectedRoute allowedRoles={['seeker']}>
              <JobDetails />
            </ProtectedRoute>
          }
        />

        <Route 
          path="/jobseeker/profile" 
          element={
            <ProtectedRoute allowedRoles={['seeker']}>
              <JobSeekerProfile />
            </ProtectedRoute>
          }
        />

        <Route 
          path="/jobseeker/my-applications" 
          element={
            <ProtectedRoute allowedRoles={['seeker']}>
              <MyApplications />
            </ProtectedRoute>
          }
        />

      </Routes>
    </div>
  );
}

export default App;
