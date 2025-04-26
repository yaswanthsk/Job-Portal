const pool = require('../config/db');

// Helper to get company_id from user_id
const getCompanyId = async (user_id) => {
  const [rows] = await pool.execute(
    'SELECT company_id FROM companies WHERE user_id = ?',
    [user_id]
  );
  return rows.length ? rows[0].company_id : null;
};

// Post a Job
const postJob = async (req, res) => {
  const {
    title,
    description,
    skills_required,
    experience_required,
    salary,
    location,
    job_type,
    posted_at
  } = req.body;

  const user_id = req.user?.userId;

  // Validate job_type to be one of the allowed values
  const validJobTypes = ['Full-time', 'Part-time', 'Contract', 'Internship'];

  if (!validJobTypes.includes(job_type)) {
    return res.status(400).json({ message: 'Invalid job type.' });
  }

  // Default the posted_at to the current date if not provided
  const jobData = {
    title: title || null,
    description: description || null,
    skills_required: skills_required || null,
    experience_required: experience_required || null,
    salary: salary || null,
    location: location || null,
    job_type: job_type || 'Full-time', // Default to 'Full-time' if not provided
    posted_at: posted_at || new Date(),
  };

  try {
    const company_id = await getCompanyId(user_id);

    if (!company_id) {
      return res.status(400).json({ message: 'Company not found for this employer.' });
    }

    await pool.execute(
      `INSERT INTO jobs 
      (company_id, title, description, skills_required, experience_required, salary, location, job_type, posted_at, job_status) 
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        company_id,
        jobData.title,
        jobData.description,
        jobData.skills_required,
        jobData.experience_required,
        jobData.salary,
        jobData.location,
        jobData.job_type,
        jobData.posted_at,
        'active'
      ]
    );

    res.status(201).json({ message: 'Job posted successfully!' });
  } catch (error) {
    console.error('Error posting job:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};


// used Stored Procedure
const getAllJobs = async (req, res) => {
  try {
    const [jobs] = await pool.execute(
      `SELECT j.*, c.company_name 
      FROM jobs j 
      JOIN companies c ON j.company_id = c.company_id 
      WHERE j.job_status = 'active'
      ORDER BY j.posted_at DESC`
    );
    res.status(200).json(jobs);
  } catch (error) {
    console.error('Error fetching jobs:', error);
    res.status(500).json({ message: 'Failed to fetch jobs', error: error.message });
  }
};


const getEmployerJobs = async (req, res) => {
  const { userId } = req.query;  // Expecting the employer's userId to be passed in the query parameters
  
  if (!userId) {
    return res.status(400).json({ message: 'User ID is required' });
  }

  try {
    // Get the company_id using the userId from the companies table
    const [company] = await pool.execute('SELECT company_id FROM companies WHERE user_id = ?', [userId]);

    if (!company || company.length === 0) {
      return res.status(404).json({ message: 'Employer not found' });
    }

    const companyId = company[0].company_id;

    // Fetch jobs posted by the specific employer (using company_id)
    const [jobs] = await pool.execute(`
      SELECT j.*, c.company_name 
      FROM jobs j
      JOIN companies c ON j.company_id = c.company_id
      WHERE j.company_id = ?
      ORDER BY j.posted_at DESC
    `, [companyId]);

    res.status(200).json(jobs);
  } catch (error) {
    console.error('Error fetching employer jobs:', error);
    res.status(500).json({ message: 'Failed to fetch jobs', error: error.message });
  }
};

// Update a Job
// const updateJob = async (req, res) => {
//   const jobId = req.params.id;
//   const {
//     title,
//     description,
//     skills_required,
//     experience_required,
//     salary,
//     location,
//     job_type
//   } = req.body;

//   const user_id = req.user?.userId;

//   if (!user_id) {
//     return res.status(401).json({ message: 'Unauthorized' });
//   }

//   // Validate job_type
//   const validJobTypes = ['Full-time', 'Part-time', 'Contract', 'Internship'];
//   if (job_type && !validJobTypes.includes(job_type)) {
//     return res.status(400).json({ message: 'Invalid job type.' });
//   }

//   try {
//     const company_id = await getCompanyId(user_id);

//     if (!company_id) {
//       return res.status(400).json({ message: 'Company not found for this employer.' });
//     }

//     // Check if the job belongs to this company
//     const [existing] = await pool.execute(
//       'SELECT * FROM jobs WHERE job_id = ? AND company_id = ?',
//       [jobId, company_id]
//     );

//     if (existing.length === 0) {
//       return res.status(404).json({ message: 'Job not found or not authorized.' });
//     }

//     // Update the job
//     await pool.execute(
//       `UPDATE jobs SET 
//         title = ?, 
//         description = ?, 
//         skills_required = ?, 
//         experience_required = ?, 
//         salary = ?, 
//         location = ?, 
//         job_type = ? 
//       WHERE job_id = ? AND company_id = ?`,
//       [
//         title,
//         description,
//         skills_required,
//         experience_required,
//         salary,
//         location,
//         job_type,
//         jobId,
//         company_id
//       ]
//     );

//     res.status(200).json({ message: 'Job updated successfully!' });
//   } catch (error) {
//     console.error('Error updating job:', error);
//     res.status(500).json({ message: 'Server error', error: error.message });
//   }
// };

const updateJob = async (req, res) => {
  const jobId = req.params.id;
  const {
    title,description,skills_required,experience_required,salary,location,job_type} = req.body;
  const user_id = req.user?.userId;
  if (!user_id) {
    return res.status(401).json({ message: 'Unauthorized' });
  }
  const validJobTypes = ['Full-time', 'Part-time', 'Contract', 'Internship'];
  if (job_type && !validJobTypes.includes(job_type)) {
    return res.status(400).json({ message: 'Invalid job type.' });
  }
  try {
    // Call stored procedure instead of doing it manually
    await pool.execute('CALL update_job(?, ?, ?, ?, ?, ?, ?, ?, ?)', [
      user_id, jobId, title, description,skills_required,experience_required,salary,location,job_type]);
    res.status(200).json({ message: 'Job updated successfully!' });
  } catch (error) {
    console.error('Error updating job:', error);
    res.status(500).json({ message: error.sqlMessage || 'Server error' });
  }
};


// Delete a Job
const deleteJob = async (req, res) => {
  const jobId = req.params.jobId;
  const user_id = req.user?.userId;

  if (!user_id) {
    return res.status(401).json({ message: 'Unauthorized' });
  }

  try {
    const company_id = await getCompanyId(user_id);

    if (!company_id) {
      return res.status(400).json({ message: 'Company not found for this employer.' });
    }

    // Check if job exists and belongs to the employer's company
    const [job] = await pool.execute(
      'SELECT * FROM jobs WHERE job_id = ? AND company_id = ?',
      [jobId, company_id]
    );

    if (job.length === 0) {
      return res.status(404).json({ message: 'Job not found or not authorized.' });
    }

    // Delete the job
    await pool.execute(
      'DELETE FROM jobs WHERE job_id = ? AND company_id = ?',
      [jobId, company_id]
    );

    res.status(200).json({ message: 'Job deleted successfully!' });
  } catch (error) {
    console.error('Error deleting job:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};


const closeJob = async (req, res) => {
  const { jobId } = req.params;

  try {
    // Update the job status to 'Closed'
    const [result] = await pool.execute(
      'UPDATE jobs SET job_status = ? WHERE job_id = ?',
      ["closed",jobId]
    );

    if (result.affectedRows === 0) {
      return res.status(404).json({ message: 'Job not found' });
    }

    res.status(200).json({ message: 'Job status updated to Closed' });
  } catch (error) {
    console.error('Error closing job:', error);
    res.status(500).json({ message: 'Internal Server Error Failed to close job', error: error.message });
  }
};


// const getJobStats = async (req, res) => {
//   const user_id = req.user?.userId;

//   if (!user_id) {
//     return res.status(401).json({ message: 'Unauthorized' });
//   }

//   try {
//     // Get company_id from user_id
//     const company_id = await getCompanyId(user_id);

//     if (!company_id) {
//       return res.status(400).json({ message: 'Company not found for this employer.' });
//     }

//     // Query to get total jobs, active jobs, and total applications
//     const [jobStats] = await pool.execute(
//       `SELECT 
//         (SELECT COUNT(*) FROM jobs WHERE company_id = ?) AS totalJobs,
//         (SELECT COUNT(*) FROM jobs WHERE company_id = ? AND job_status = 'active') AS activeJobs,
//         (SELECT COUNT(*) FROM applications a 
//             JOIN jobs j ON a.job_id = j.job_id 
//             WHERE j.company_id = ?) AS totalApplications
//       `,
//       [company_id, company_id, company_id]
//     );

//     res.status(200).json({
//       totalJobs: jobStats[0].totalJobs,
//       activeJobs: jobStats[0].activeJobs,
//       totalApplications: jobStats[0].totalApplications
//     });

//   } catch (error) {
//     console.error('Error fetching job stats:', error);
//     res.status(500).json({ message: 'Server error', error: error.message });
//   }
// };


//using Views
const getJobStats = async (req, res) => {
  const user_id = req.user?.userId;

  if (!user_id) {
    return res.status(401).json({ message: 'Unauthorized' });
  }

  try {
    // Get company_id from user_id
    const company_id = await getCompanyId(user_id);

    if (!company_id) {
      return res.status(400).json({ message: 'Company not found for this employer.' });
    }

    // Query the job_stats_view for the company statistics
    const [jobStats] = await pool.execute(
      'SELECT totalJobs, activeJobs, totalApplications FROM job_stats_view WHERE company_id = ?',
      [company_id]
    );

    res.status(200).json({
      totalJobs: jobStats[0].totalJobs,
      activeJobs: jobStats[0].activeJobs,
      totalApplications: jobStats[0].totalApplications
    });

  } catch (error) {
    console.error('Error fetching job stats:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};


// GET /api/employer/applications
// const getEmployerApplications = async (req, res) => {
//   const userId = req.user.userId;

//   try {
//     // Step 1: Get the employer's company_id
//     const [companyResult] = await pool.execute(
//       'SELECT company_id FROM Companies WHERE user_id = ?',
//       [userId]
//     );

//     if (companyResult.length === 0) {
//       return res.status(404).json({ message: 'Company not found for this employer' });
//     }

//     const companyId = companyResult[0].companies_id;

//     // Step 2: Fetch applications for jobs posted by this company
//     const [applications] = await pool.execute(
//       `
//       SELECT 
//         a.application_id,
//         a.job_id,
//         j.title AS job_title,
//         j.location AS job_location,
//         j.salary,
//         j.experience_required,
//         j.skills_required,
//         j.location,
//         j.description AS job_description,
//         j.job_type,
//         a.application_status,
//         a.created_at AS applied_at,

//         u.id AS user_id,
//         u.username,
//         u.email,

//         jp.name AS applicant_name,
//         jp.skills,
//         jp.experience,
//         jp.resume_link,
//         jp.phone,
//         jp.profile_photo,
//         jp.is_fresher,
//         jp.current_title,
//         jp.willing_to_relocate,
//         jp.linkedin_url,
//         jp.github_url

//       FROM Applications a
//       JOIN Jobs j ON a.job_id = j.job_id
//       JOIN Companies c ON j.company_id = c.company_id
//       JOIN JobSeekerProfile jp ON a.jobseeker_id = jp.jobseeker_id
//       JOIN Users u ON jp.user_id = u.id
//       WHERE c.user_id = ?
//       ORDER BY a.created_at DESC
//       `,
//       [userId]
//     );

//     res.status(200).json(applications);
//   } catch (error) {
//     console.error('Error fetching employer applications:', error);
//     res.status(500).json({ message: 'Internal server error', error: error.message });
//   }
// };


//using views
const getEmployerApplications = async (req, res) => {
  const userId = req.user.userId;

  try {
    // Step 1: Get the employer's company_id
    const [companyResult] = await pool.execute('SELECT company_id FROM Companies WHERE user_id = ?',[userId]);
    if (companyResult.length === 0) {
      return res.status(404).json({ message: 'Company not found for this employer' });
    }
    const companyId = companyResult[0].company_id;
    // Step 2: Fetch applications for jobs posted by this company using the view
    const [applications] = await pool.execute(`SELECT * FROM employer_applications_view WHERE company_id = ? ORDER BY applied_at DESC`,[companyId]);

    res.status(200).json(applications);
  } catch (error) {
    console.error('Error fetching employer applications:', error);
    res.status(500).json({ message: 'Internal server error', error: error.message });
  }
};



// PUT /api/application-status/:applicationId
const updateApplicationStatus = async (req, res) => {
  const { applicationId } = req.params;
  const { status } = req.body; // status will be 'Accepted' or 'Rejected'

  if (!['Accepted', 'Rejected'].includes(status)) {
      return res.status(400).json({ message: 'Invalid status' });
  }

  try {
      // Update the application status
      const [result] = await pool.execute(
          'UPDATE Applications SET application_status = ? WHERE application_id = ?',
          [status, applicationId]
      );
      if (result.affectedRows === 0) {
          return res.status(404).json({ message: 'Application not found' });
      }

      res.status(200).json({ message: 'Application status updated' });
  } catch (error) {
      console.error('Error updating application status:', error);
      res.status(500).json({ message: 'Internal server error', error: error.message });
  }
};


const getRecentActivity = async (req, res) => {
  try {
    const userId = req.user.userId;
    const companyId = await getCompanyId(userId);
    if (!companyId) {
      return res.status(404).json({ message: 'Company not found for this user' });
    }
    const query = `
      (
        SELECT  j.company_id, CONCAT('Posted a new job: ', j.title) AS activity, CONVERT_TZ(j.posted_at, '+00:00', '+05:30') AS activity_time
        FROM jobs j WHERE j.company_id = ?
      )
      UNION
      (
        SELECT  j.company_id, CONCAT('Received a new application for: ', j.title) AS activity,
        a.created_at AS activity_time FROM applications a JOIN jobs j ON a.job_id = j.job_id
        WHERE j.company_id = ?
      )
      ORDER BY activity_time DESC
      LIMIT 5`;

    const [results] = await pool.query(query, [companyId, companyId]);
    res.json(results);
  } catch (err) {
    console.error('Error fetching recent activity:', err);
    res.status(500).json({ message: 'Failed to fetch recent activity' });
  }
};


module.exports = {
  postJob,
  getAllJobs,
  getEmployerJobs,
  updateJob,
  deleteJob,
  closeJob,
  getJobStats,
  getEmployerApplications,
  updateApplicationStatus,
  getRecentActivity 
};

