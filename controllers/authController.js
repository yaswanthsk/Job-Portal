const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const pool = require('../config/db'); // updated MySQL pool

const signup = async (req, res) => {
  const { username, email, password, role, companyName, companyDescription } = req.body;

  const connection = await pool.getConnection(); // Get a new connection from the pool
  try {
    await connection.beginTransaction(); // Start a transaction

    // Hash the password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Insert the user into the Users table
    const [userResult] = await connection.execute(
      `INSERT INTO Users (username, email, password, role)
       VALUES (?, ?, ?, ?)`,
      [username, email, hashedPassword, role || 'seeker']
    );

    // If the user is an employer, insert company details into the Companies table
    if (role === 'employer') {
      const userId = userResult.insertId; // Get the user_id from the inserted user

      await connection.execute(
        `INSERT INTO Companies (user_id, company_name, company_description, created_at)
         VALUES (?, ?, ?, ?)`,
        [userId, companyName, companyDescription, new Date()]
      );
    }

    // Commit the transaction if all operations succeed
    await connection.commit();
    res.status(201).send({ message: 'User registered successfully' });
  } catch (error) {
    // If any operation fails, roll back the transaction
    await connection.rollback();
    console.error('Error during signup:', error);
    res.status(500).send({ message: 'Error registering user', error: error.message });
  } finally {
    // Release the connection back to the pool
    connection.release();
  }
};



const login = async (req, res) => {
  const { username, password } = req.body;

  try {
    const [rows] = await pool.execute(
      'SELECT * FROM Users WHERE username = ?',
      [username]
    );

    if (rows.length === 0) {
      return res.status(401).send({ message: 'Invalid credentials' });
    }

    const user = rows[0];
    const match = await bcrypt.compare(password, user.password);

    if (!match) {
      return res.status(401).send({ message: 'Invalid credentials' });
    }

    const token = jwt.sign({ userId: user.id, role: user.role }, process.env.JWT_SECRET, {
      expiresIn: '1h',
    });

    res.status(200).send({ message: 'Login successful', token });
  } catch (error) {
    console.error('Error during login:', error);
    res.status(500).send({ message: 'Error logging in', error: error.message });
  }
};

module.exports = { signup, login };
