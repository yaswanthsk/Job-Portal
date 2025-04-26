const multer = require('multer');
const path = require('path');
const fs = require('fs');

// Check if 'uploads' folder exists, if not create it
const uploadDir = path.join(__dirname, '..', 'uploads');
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

// Set up storage for file uploads (e.g., storing in local 'uploads' folder)
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, uploadDir); // Save files to the 'uploads' folder
  },
  filename: (req, file, cb) => {
    cb(null, Date.now() + path.extname(file.originalname)); // Save file with unique timestamp
  }
});

// Filter for valid file types (e.g., images for profile and PDFs for resumes)
const fileFilter = (req, file, cb) => {
  if (file.mimetype === 'application/pdf' || file.mimetype.startsWith('image/')) {
    cb(null, true);
  } else {
    cb(new Error('Invalid file type! Only PDF and image files are allowed'), false);
  }
};

const upload = multer({
  storage,
  fileFilter,
});

module.exports = upload;
