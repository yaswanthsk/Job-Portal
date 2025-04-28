const pool = require('../config/db');
const upload = require('../middleware/multer'); // Assuming multer setup is in the `middleware/multer.js` file
const fs = require('fs');
const path = require('path');

// Toggle Save/Unsave Job
// const toggleSaveJob = async (req, res) => {
//   const { jobId } = req.params;
//   const user_id = req.user?.userId;

//   if (!user_id) {
//     return res.status(401).json({ message: 'Unauthorized' });
//   }

//   try {
//     // Check if already saved
//     const [existing] = await pool.execute(
//       'SELECT * FROM saved_jobs WHERE user_id = ? AND job_id = ?',
//       [user_id, jobId]
//     );

//     if (existing.length > 0) {
//       // Unsave the job
//       await pool.execute(
//         'DELETE FROM saved_jobs WHERE user_id = ? AND job_id = ?',
//         [user_id, jobId]
//       );
//       return res.status(200).json({ message: 'Job unsaved successfully.' });
//     } else {
//       // Save the job
//       await pool.execute(
//         'INSERT INTO saved_jobs (user_id, job_id, saved_at) VALUES (?, ?, NOW())',
//         [user_id, jobId]
//       );
//       return res.status(201).json({ message: 'Job saved successfully.' });
//     }
//   } catch (error) {
//     console.error('Error saving/unsaving job:', error);
//     res.status(500).json({ message: 'Server error', error: error.message });
//   }
// };

//stored Procedure
const toggleSaveJob = async (req, res) => {
  const { jobId } = req.params;
  const user_id = req.user?.userId;

  if (!user_id) {
    return res.status(401).json({ message: 'Unauthorized' });
  }

  try {
    // Call the stored procedure to toggle the job save status
    await pool.execute('CALL toggle_save_job(?, ?)', [user_id, jobId]);
    // Return the response
    return res.status(200).json({ message: 'Job saved/unsaved successfully.' });
  } catch (error) {
    console.error('Error saving/unsaving job:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};


// Get Saved Jobs for a User
const getSavedJobs = async (req, res) => {
  const user_id = req.user?.userId;

  if (!user_id) {
    return res.status(401).json({ message: 'Unauthorized' });
  }

  try {
    const [savedJobs] = await pool.execute(
        'SELECT * FROM v_saved_jobs_detailed WHERE user_id = ? ORDER BY saved_at DESC',
        [user_id]
      );
    res.status(200).json(savedJobs);
  } catch (error) {
    console.error('Error fetching saved jobs:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};


const getJobDetails = async (req, res) => {
  const { jobId } = req.params;

  try {
    const [jobData] = await pool.execute(
      'SELECT * FROM job_details_view WHERE job_id = ?',
      [jobId]
    );

    if (jobData.length === 0) {
      return res.status(404).json({ message: 'Job not found' });
    }

    res.status(200).json(jobData[0]);
  } catch (error) {
    console.error('Error fetching job details:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

const createJobSeekerProfile = async (req, res) => {
  const user_id = req.user?.userId;

  // Check if resume file is uploaded
  const resume_filename = req.files?.resume ? req.files.resume[0].filename : null;
  const profile_photo_base64 = req.body?.profile_photo;  // Expecting base64 string for profile photo

  // Check if both resume and profile photo are provided
  if (!resume_filename || !profile_photo_base64) {
    return res.status(400).json({ message: 'Both resume and profile photo are required.' });
  }

  const {
    name,
    skills,
    experience,
    location,
    phone,
    current_title,
    linkedin_url,
    github_url,
    is_fresher,  // Get fresher/experienced status from frontend
    willing_to_relocate,
  } = req.body;
  
  const willingToRelocate = willing_to_relocate === 'Yes' ? 'Yes' : 'No';


  // Ensure required fields are provided
  if (!name || !phone || !linkedin_url || !github_url) {
    return res.status(400).json({ message: 'Name, phone, LinkedIn, and GitHub URL are required.' });
  }

    // Validate is_fresher input
    if (!['Fresher', 'Experienced'].includes(is_fresher)) {
      return res.status(400).json({ message: 'Invalid fresher status provided.' });
    }


  try {
    // Check if profile already exists for the user
    const [existing] = await pool.execute(
      'SELECT * FROM jobseekerprofile WHERE user_id = ?',
      [user_id]
    );

    if (existing.length > 0) {
      return res.status(409).json({ message: 'Profile already exists.' });
    }

    // Insert the profile into the database with the filenames and base64 string
    await pool.execute(
      `INSERT INTO jobseekerprofile 
        (user_id, name, skills, experience, location, phone, is_fresher, current_title, willing_to_relocate, linkedin_url, github_url, resume_link, profile_photo)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        user_id,
        name,
        skills,
        experience,
        location,
        phone,
        is_fresher,          // directly 'Fresher' or 'Experienced'
        current_title,
        willingToRelocate,    // Use 'Yes' or 'No'
        linkedin_url,
        github_url,
        resume_filename,  // Save filename, not the full path
        profile_photo_base64 // Save base64 string directly
      ]
    );

    // Return success message
    res.status(201).json({ message: 'Profile created successfully.' });

  } catch (error) {
    console.error('Error creating job seeker profile:', error);
    res.status(500).json({ message: 'Server error', error: 'An error occurred while creating the profile.' });
  }
};


// In your JobSeekerController.js
const getJobSeekerProfile = async (req, res) => {
  const user_id = req.user?.userId; // Assuming JWT middleware sets req.user

  if (!user_id) {
    return res.status(401).json({ message: 'Unauthorized' });
  }

  try {
    // Fetch job seeker profile based on user_id
    const [profile] = await pool.execute(
      'SELECT * FROM jobseekerprofile WHERE user_id = ?',
      [user_id]
    );

    if (profile.length === 0) {
      return res.status(404).json({ message: 'Profile not found' });
    }

    res.status(200).json(profile[0]);
  } catch (error) {
    console.error('Error fetching profile:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};


const updateJobSeekerProfile = async (req, res) => {
  const user_id = req.user?.userId;

  const resume_filename = req.files?.resume ? req.files.resume[0].filename : null;

  const {
    name,
    skills,
    experience,
    location,
    phone,
    is_fresher,
    current_title,
    willing_to_relocate,
    linkedin_url,
    github_url,
    profile_photo, // base64 string will come here
  } = req.body;

  if (!user_id) {
    return res.status(401).json({ message: 'Unauthorized' });
  }

  try {
    // Check if profile exists
    const [existing] = await pool.execute(
      'SELECT * FROM jobseekerprofile WHERE user_id = ?',
      [user_id]
    );

    if (existing.length === 0) {
      return res.status(404).json({ message: 'Profile not found.' });
    }

    const willingToRelocate = willing_to_relocate !== undefined
      ? (willing_to_relocate === 'Yes' ? 'Yes' : 'No')
      : undefined;

    // Prepare fields to update dynamically
    const fields = [];
    const values = [];

    if (name) { fields.push('name = ?'); values.push(name); }
    if (skills) { fields.push('skills = ?'); values.push(skills); }
    if (experience) { fields.push('experience = ?'); values.push(experience); }
    if (location) { fields.push('location = ?'); values.push(location); }
    if (phone) { fields.push('phone = ?'); values.push(phone); }
    if (is_fresher && ['Fresher', 'Experienced'].includes(is_fresher)) {
      fields.push('is_fresher = ?');
      values.push(is_fresher);
    }
    if (current_title) { fields.push('current_title = ?'); values.push(current_title); }
    if (willingToRelocate !== undefined) { fields.push('willing_to_relocate = ?'); values.push(willingToRelocate); }
    if (linkedin_url) { fields.push('linkedin_url = ?'); values.push(linkedin_url); }
    if (github_url) { fields.push('github_url = ?'); values.push(github_url); }

    if (resume_filename) {
      // 🔥 Delete old resume file if exists
      const oldResume = existing[0].resume_link;
      if (oldResume) {
        const oldResumePath = path.join(__dirname, '..', 'uploads', oldResume);
        if (fs.existsSync(oldResumePath)) {
          fs.unlinkSync(oldResumePath);
          console.log('✅ Old resume deleted:', oldResume);
        }
      }

      fields.push('resume_link = ?');
      values.push(resume_filename);
    }

    if (profile_photo) {  // base64 string directly
      fields.push('profile_photo = ?');
      values.push(profile_photo);
    }

    // If no fields to update
    if (fields.length === 0) {
      return res.status(400).json({ message: 'No valid fields to update.' });
    }

    values.push(user_id); // For WHERE clause

    const query = `UPDATE jobseekerprofile SET ${fields.join(', ')} WHERE user_id = ?`;
    await pool.execute(query, values);

    res.status(200).json({ message: 'Profile updated successfully.' });
  } catch (error) {
    console.error('Error updating job seeker profile:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};





// controllers/jobController.js

const applyForJob = async (req, res) => {
  const user_id = req.user?.userId;
  const { jobId } = req.params;

  if (!user_id) {
    return res.status(401).json({ message: 'Unauthorized' });
  }

  try {
    // Step 1: Fetch jobseeker_id using user_id
    const [jobseekerRows] = await pool.execute(
      'SELECT jobseeker_id FROM jobseekerprofile WHERE user_id = ?',
      [user_id]
    );

    if (jobseekerRows.length === 0) {
      return res.status(404).json({ message: 'Job Seeker profile not found' });
    }

    const jobseeker_id = jobseekerRows[0].jobseeker_id;

    // Step 2: Check if the user already applied for this job
    const [existingApp] = await pool.execute(
      'SELECT * FROM applications WHERE job_id = ? AND jobseeker_id = ?',
      [jobId, jobseeker_id]
    );

    if (existingApp.length > 0) {
      return res.status(400).json({ message: 'You have already applied for this job.' });
    }

    // Step 3: Insert application
    await pool.execute(
      'INSERT INTO applications (jobseeker_id, job_id, application_status) VALUES (?, ?, ?)',
      [jobseeker_id, jobId, 'Pending']
    );

    res.status(200).json({ message: 'Application submitted successfully!' });
  } catch (error) {
    console.error('Error applying for job:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

const getJobSeekerApplications = async (req, res) => {
  const userId = req.user.userId; // From JWT token

  try {
    // Step 1: Get jobseeker's profile_id (this is linked to the user_id)
    const [jobSeekerResult] = await pool.execute(
      'SELECT jobseeker_id FROM JobSeekerProfile WHERE user_id = ?',
      [userId]
    );

    if (jobSeekerResult.length === 0) {
      return res.status(404).json({ message: 'Jobseeker profile not found' });
    }

    const jobseekerId = jobSeekerResult[0].jobseeker_id;

    // Step 2: Fetch applications for jobs the jobseeker has applied to
    const [applications] = await pool.execute(
      `
      SELECT 
        a.application_id,
        a.job_id,
        j.title AS job_title,
        j.location AS job_location,
        j.salary,
        j.experience_required,
        j.skills_required,
        j.job_type,
        a.application_status,
        a.created_at AS applied_at,
        j.description AS job_description,

        c.company_name,
        c.company_description,
        
        u.id AS user_id,
        u.username,
        u.email,

        jp.name AS applicant_name,
        jp.skills,
        jp.experience,
        jp.resume_link,
        jp.phone,
        jp.profile_photo,
        jp.is_fresher,
        jp.current_title,
        jp.willing_to_relocate,
        jp.linkedin_url,
        jp.github_url

      FROM Applications a
      JOIN Jobs j ON a.job_id = j.job_id
      JOIN Companies c ON j.company_id = c.company_id
      JOIN JobSeekerProfile jp ON a.jobseeker_id = jp.jobseeker_id
      JOIN Users u ON jp.user_id = u.id
      WHERE a.jobseeker_id = ?
      ORDER BY a.created_at DESC
      `,
      [jobseekerId]
    );

    // Return the list of applications for the jobseeker
    res.status(200).json(applications);
  } catch (error) {
    console.error('Error fetching jobseeker applications:', error);
    res.status(500).json({ message: 'Internal server error', error: error.message });
  }
};

module.exports = {
    toggleSaveJob,
    getSavedJobs,
    getJobDetails,
    createJobSeekerProfile,
    updateJobSeekerProfile,
    getJobSeekerProfile,
    applyForJob,
    getJobSeekerApplications
  };
  
