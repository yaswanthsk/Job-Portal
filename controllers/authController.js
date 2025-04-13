const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const sql = require('mssql'); // ✅ Required for sql.VarChar
const poolPromise = require('../config/db');

const signup = async (req, res) => {
  const { username, email, password, role } = req.body;

  try {
    const hashedPassword = await bcrypt.hash(password, 10);
    const pool = await poolPromise;

    const result = await pool.request()
      .input('username', sql.VarChar, username)
      .input('email', sql.VarChar, email)
      .input('password', sql.VarChar, hashedPassword)
      .input('role', sql.VarChar, role || 'seeker') // ✅ fixed from 'jobseeker' to 'seeker'
      .query(`
        INSERT INTO Users (username, email, password, role)
        VALUES (@username, @email, @password, @role)
      `);

    res.status(201).send({ message: 'User registered successfully' });
  } catch (error) {
    console.error('Error details:', error);
    res.status(500).send({ message: 'Error registering user', error: error.message });
  }
};

const login = async (req, res) => {
  const { username, password } = req.body;

  try {
    const pool = await poolPromise;
    const result = await pool.request()
      .input('username', sql.VarChar, username)
      .query('SELECT * FROM Users WHERE username = @username');

    if (result.recordset.length === 0) {
      return res.status(401).send({ message: 'Invalid credentials' });
    }

    const user = result.recordset[0];
    const match = await bcrypt.compare(password, user.password);
    if (!match) {
      return res.status(401).send({ message: 'Invalid credentials' });
    }

    const token = jwt.sign({ userId: user.id, role: user.role }, process.env.JWT_SECRET, { expiresIn: '1h' });

    res.status(200).send({ message: 'Login successful', token });
  } catch (error) {
    console.error(error);
    res.status(500).send({ message: 'Error logging in' });
  }
};

module.exports = { signup, login };
