const pool = require('../config/db');
const bcrypt = require('bcryptjs');

// GET /api/employer/profile
const getEmployerProfile = async (req, res) => {
  const userId = req.user.userId;

  try {
    const [userRows] = await pool.execute(
      'SELECT id, username, email, profile_picture FROM Users WHERE id = ? AND role = ?',
      [userId, 'employer']
    );

    if (userRows.length === 0) {
      return res.status(404).json({ message: 'Employer not found' });
    }

    const [companyRows] = await pool.execute(
      'SELECT company_name, company_description FROM Companies WHERE user_id = ?',
      [userId]
    );

    const employerProfile = {
      ...userRows[0],
      ...companyRows[0] || {}
    };

    res.status(200).json(employerProfile);
  } catch (error) {
    console.error('Error fetching employer profile:', error);
    res.status(500).json({ message: 'Internal server error', error: error.message });
  }
};

// const getEmployerProfile = async (req, res) => {
//   const userId = req.user.userId;  // Extracting user ID from JWT

//   try {
//     // Query the view instead of joining tables directly
//     const [rows] = await pool.execute(
//       'SELECT * FROM employer_profile_view WHERE user_id = ?',
//       [userId]
//     );

//     if (rows.length === 0) {
//       return res.status(404).json({ message: 'Employer not found' });
//     }

//     res.status(200).json(rows[0]); // Send back the first row (the employer profile)
//   } catch (error) {
//     console.error('Error fetching employer profile:', error);
//     res.status(500).json({ message: 'Internal server error', error: error.message });
//   }
// };


//using transactions
// PUT /api/employer/profile
const updateEmployerProfile = async (req, res) => {
  const userId = req.user.userId;
  const { username, email, company_name, company_description } = req.body;

  if (!username || !email) {
    return res.status(400).json({ message: 'Username and email are required' });
  }

  const connection = await pool.getConnection();
  try {
    await connection.beginTransaction();

    // Only update username and email (exclude profile_picture here!)
    await connection.execute(
      'UPDATE Users SET username = ?, email = ? WHERE id = ? AND role = ?',
      [username, email, userId, 'employer']
    );

    const [existingCompany] = await connection.execute(
      'SELECT * FROM Companies WHERE user_id = ?',
      [userId]
    );

    if (existingCompany.length > 0) {
      await connection.execute(
        'UPDATE Companies SET company_name = ?, company_description = ? WHERE user_id = ?',
        [company_name, company_description, userId]
      );
    } else {
      await connection.execute(
        'INSERT INTO Companies (user_id, company_name, company_description, created_at) VALUES (?, ?, ?, ?)',
        [userId, company_name, company_description, new Date()]
      );
    }

    await connection.commit();
    res.status(200).json({ message: 'Profile updated successfully' });
  } catch (error) {
    await connection.rollback();
    console.error('Error updating employer profile:', error);
    res.status(500).json({ message: 'Internal server error', error: error.message });
  } finally {
    connection.release();
  }
};

// PUT /api/employer/update-password
const updateEmployerPassword = async (req, res) => {
  const userId = req.user.userId;
  const { newPassword } = req.body;

  if (!newPassword || newPassword.length < 6) {
    return res.status(400).json({ message: 'Password must be at least 6 characters' });
  }

  try {
    const hashedPassword = await bcrypt.hash(newPassword, 10);

    const [result] = await pool.execute(
      'UPDATE Users SET password = ? WHERE id = ? AND role = ?',
      [hashedPassword, userId, 'employer']
    );

    if (result.affectedRows === 0) {
      return res.status(404).json({ message: 'Employer not found or unauthorized' });
    }

    res.status(200).json({ message: 'Password updated successfully' });
  } catch (error) {
    console.error('Error updating password:', error);
    res.status(500).json({ message: 'Internal server error', error: error.message });
  }
};

// PUT /api/employer/upload-profile-picture
const uploadProfilePicture = async (req, res) => {
  const userId = req.user.userId;
  const { profilePicture } = req.body;

  if (!profilePicture) {
    return res.status(400).json({ message: 'No profile picture provided' });
  }

  try {
    const [result] = await pool.execute(
      'UPDATE Users SET profile_picture = ? WHERE id = ? AND role = ?',
      [profilePicture, userId, 'employer']
    );

    if (result.affectedRows === 0) {
      return res.status(404).json({ message: 'Employer not found or unauthorized' });
    }

    res.status(200).json({ message: 'Profile picture updated successfully' });
  } catch (error) {
    console.error('Error updating profile picture:', error);
    res.status(500).json({ message: 'Internal server error', error: error.message });
  }
};


module.exports = {
  getEmployerProfile,
  updateEmployerProfile,
  updateEmployerPassword,
  uploadProfilePicture,
};
