// middleware/verifyToken.js
const jwt = require('jsonwebtoken');

const verifyToken = (req, res, next) => {
  const token = req.headers['authorization']?.split(' ')[1]; // Extract the token from 'Authorization' header
 
    // If no token is provided, respond with "Access denied"
  if (!token) {
    return res.status(403).send({ message: 'Access denied' });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decoded; // Attach decoded user info to request object
    next(); // Proceed to next middleware/route handler
  } catch (error) {
    if (error.name === 'TokenExpiredError') {
      return res.status(401).send({ message: 'Session timed out. Please log in again.' });
    }
    return res.status(401).send({ message: 'Invalid token' });
  }
};

module.exports = verifyToken;
