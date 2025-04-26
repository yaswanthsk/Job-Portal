const express = require('express');
const { signup, login, verifyEmail,  verifyUsername, resetPassword} = require('../controllers/authController');
const { postJob,updateJob, deleteJob, getJobStats } = require('../controllers/jobController');
const verifyToken = require('../middleware/verifyToken');
const {getAllJobs,getEmployerJobs, closeJob,getEmployerApplications,updateApplicationStatus, getRecentActivity} = require('../controllers/jobController');
const {getEmployerProfile,updateEmployerProfile,updateEmployerPassword, uploadProfilePicture} = require('../controllers/EmployerProfileController');
const {toggleSaveJob,getSavedJobs, getJobDetails, createJobSeekerProfile,getJobSeekerProfile,updateJobSeekerProfile,applyForJob,getJobSeekerApplications} = require('../controllers/JobSeekerController');
const upload = require('../middleware/multer'); // Import the multer middleware

const router = express.Router();


// POST request to /signup
router.post('/signup', signup);

// POST request to /login
router.post('/login', login);

router.post('/verify-email', verifyEmail);
router.post('/verify-username', verifyUsername);
router.post('/reset-password', resetPassword);

router.post('/post-job', verifyToken, postJob);

router.get('/all-jobs', getAllJobs);

router.get('/employer-jobs', verifyToken, getEmployerJobs);  // Add new route for employer-specific jobs

router.put('/update-job/:id', verifyToken, updateJob);

router.delete('/delete-job/:jobId', verifyToken, deleteJob);

router.put('/close-job/:jobId', verifyToken, closeJob);

router.get('/stats/:id', verifyToken, getJobStats);

router.get('/profile', verifyToken, getEmployerProfile);
router.put('/profile', verifyToken, updateEmployerProfile);

router.put('/update-password', verifyToken, updateEmployerPassword);

router.put('/upload-profile-picture', verifyToken, uploadProfilePicture);

router.post('/save-job/:jobId', verifyToken, toggleSaveJob);

router.get('/saved-jobs', verifyToken, getSavedJobs);

router.get('/jobs/:jobId',verifyToken, getJobDetails);

// Post route to create job seeker profile
router.post('/jobseeker/profile', verifyToken, upload.fields([
    { name: 'resume', maxCount: 1 },
    { name: 'profile_photo', maxCount: 1 },
  ]), createJobSeekerProfile);
  

  // Get job seeker profile (for logged-in user)
router.get('/jobseeker/profile', verifyToken, getJobSeekerProfile);

// Update job seeker profile (with optional resume/profile photo upload)
router.put('/jobseeker/profile', verifyToken, upload.fields([
  { name: 'resume', maxCount: 1 },
  { name: 'profile_photo', maxCount: 1 },
]), updateJobSeekerProfile);

router.post('/apply-for-job/:jobId', verifyToken, applyForJob);

router.get('/employer-applications/:id', verifyToken, getEmployerApplications);

router.put('/application-status/:applicationId', verifyToken, updateApplicationStatus);

router.get('/jobseeker-applications', verifyToken, getJobSeekerApplications);

router.get('/employer-activity', verifyToken, getRecentActivity);


module.exports = router;
