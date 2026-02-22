const express = require('express');
const path = require('path');
const fs = require('fs');
const mongoose = require('mongoose');
const LabeledImage = require('../schemas/LabeledImage');

const router = express.Router();
const uploadDir = path.join(__dirname, '..', 'labeled_images');

// GET /api/students — list labeled face images (optionally filtered by classId) for recognition/UI
router.get('/', async (req, res) => {
  try {
    const { classId } = req.query;
    const filter = classId && mongoose.Types.ObjectId.isValid(classId)
      ? { classId: new mongoose.Types.ObjectId(classId) }
      : {};
    const docs = await LabeledImage.find(filter).sort({ label: 1, uploadedAt: -1 }).lean();
    const students = docs.map((d) => ({
      name: d.label,
      filename: d.filename,
      url: d.path,
      extension: path.extname(d.filename).replace(/^\./, '') || 'jpg'
    }));
    res.json({
      success: true,
      students,
      count: students.length
    });
  } catch (error) {
    console.error('Error reading students:', error);
    res.status(500).json({
      success: false,
      message: 'Error reading student data',
      error: error.message
    });
  }
});

// DELETE /api/students/:filename — remove a labeled image (file + LabeledImage doc)
router.delete('/:filename', async (req, res) => {
  try {
    const { filename } = req.params;
    const doc = await LabeledImage.findOne({ filename });
    if (!doc) {
      return res.status(404).json({
        success: false,
        message: 'Student not found'
      });
    }
    const filePath = path.join(uploadDir, filename);
    if (fs.existsSync(filePath)) {
      fs.unlinkSync(filePath);
    }
    await LabeledImage.deleteOne({ filename });
    res.json({
      success: true,
      message: 'Student deleted successfully'
    });
  } catch (error) {
    console.error('Error deleting student:', error);
    res.status(500).json({
      success: false,
      message: 'Error deleting student',
      error: error.message
    });
  }
});

module.exports = router;
