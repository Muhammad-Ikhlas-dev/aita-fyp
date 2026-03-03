const express = require('express');
const cors = require('cors');
const path = require('path');
const fs = require('fs');
const multer = require('multer');
require('dotenv').config();

const connectDB = require('./config/db');

const app = express();
const PORT = process.env.PORT ?? 5000;

app.use(cors({ origin: 'http://localhost:5173' }));
app.use(express.json());

app.use('/models', express.static(path.join(__dirname, 'models')));

const uploadDir = path.join(__dirname, 'labeled_images');
if (!fs.existsSync(uploadDir)) {
    fs.mkdirSync(uploadDir, { recursive: true });
}
app.use('/labeled_images', express.static(uploadDir));

const classCoversDir = path.join(__dirname, 'class_covers');
if (!fs.existsSync(classCoversDir)) {
    fs.mkdirSync(classCoversDir, { recursive: true });
}
app.use('/class_covers', express.static(classCoversDir));

const teacherProfilesDir = path.join(__dirname, 'teacher_profiles');
if (!fs.existsSync(teacherProfilesDir)) {
    fs.mkdirSync(teacherProfilesDir, { recursive: true });
}
app.use('/teacher_profiles', express.static(teacherProfilesDir));

// Connect to MongoDB, then mount routes and start listening
connectDB()
  .then(() => {
    // Mount API routes only after DB is ready
    app.use('/api', require('./routes'));

    // Error handler middleware
    app.use((error, req, res, next) => {
      if (error instanceof multer.MulterError) {
        if (error.code === 'LIMIT_FILE_SIZE') {
          return res.status(400).json({
            success: false,
            message: 'File is too large. Maximum size is 10MB.'
          });
        }
      }
      res.status(500).json({
        success: false,
        message: error.message || 'Something went wrong!'
      });
    });

    app.listen(PORT, () => {
      console.log(`Server running on http://localhost:${PORT || 5000}`);
      console.log(`Upload directory: ${uploadDir}`);
    });
  })
  .catch((err) => {
    console.error('Failed to start server:', err.message || err);
  });
