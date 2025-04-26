const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const authRoutes = require('./routes/authRoutes');
const verifyToken = require('./middleware/verifyToken'); // Import verifyToken middleware
const path = require('path');


dotenv.config();

const app = express();

// Middleware
app.use(cors());
app.use(express.json()); // Body parsing for JSON
app.use(express.urlencoded({ extended: true }));  // For URL-encoded data


// Routes
app.use('/api/auth', authRoutes);


app.use('/api/protected', verifyToken, (req, res) => {
  // If token is valid, this route will be accessed
  res.status(200).send({ message: 'This is a protected route, you are authorized!' });
});


// Serve static files (like PDFs, images) from the 'uploads' folder
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Example route for serving profile photos and resumes
app.get('/uploads/:filename', (req, res) => {
  const { filename } = req.params;
  res.sendFile(path.join(__dirname, 'uploads', filename));
});


// Start server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
