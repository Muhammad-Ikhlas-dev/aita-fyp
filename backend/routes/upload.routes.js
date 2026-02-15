const express = require('express');
const multer = require('multer');
const path = require('path');
const mongoose = require('mongoose');
const LabeledImage = require('../schemas/LabeledImage');

const router = express.Router();
const uploadDir = path.join(__dirname, '..', 'labeled_images');

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, uploadDir);
  },
  filename: function (req, file, cb) {
    const name = req.query.name || 'unnamed';
    const cleanName = name.replace(/[^a-zA-Z0-9]/g, '_');
    const timestamp = Date.now();
    const ext = path.extname(file.originalname) || '.jpg';
    cb(null, `${cleanName}_${timestamp}${ext}`);
  }
});

const upload = multer({
  storage,
  limits: { fileSize: 10 * 1024 * 1024 },
  fileFilter: function (req, file, cb) {
    if (file.mimetype.startsWith('image/')) {
      cb(null, true);
    } else {
      cb(new Error('Only image files are allowed!'), false);
    }
  }
});

router.post('/', upload.single('image'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: 'No file uploaded'
      });
    }
    const name = req.query.name;
    const classId = req.query.classId;
    if (!name) {
      return res.status(400).json({
        success: false,
        message: 'Name parameter is required'
      });
    }

    const filePath = `/labeled_images/${req.file.filename}`;
    await LabeledImage.create({
      filename: req.file.filename,
      originalName: req.file.originalname,
      path: filePath,
      label: name.trim(),
      classId: classId && mongoose.Types.ObjectId.isValid(classId)
        ? new mongoose.Types.ObjectId(classId)
        : null,
      size: req.file.size,
      mimeType: req.file.mimetype
    });

    res.json({
      success: true,
      message: 'File uploaded successfully',
      file: {
        filename: req.file.filename,
        path: filePath,
        size: req.file.size,
        name: name.trim()
      }
    });
  } catch (error) {
    console.error('Upload error:', error);
    res.status(500).json({
      success: false,
      message: 'Error uploading file',
      error: error.message
    });
  }
});

module.exports = router;
