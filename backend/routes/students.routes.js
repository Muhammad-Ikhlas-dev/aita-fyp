const express = require('express');
const path = require('path');
const fs = require('fs');
const mongoose = require('mongoose');
const Student = require('../schemas/Student');
const LabeledImage = require('../schemas/LabeledImage');

const router = express.Router();
const uploadDir = path.join(__dirname, '..', 'labeled_images');

// Lookup student by email (for adding to class) - must be before /:filename
router.get('/lookup', async (req, res) => {
  try {
    const email = (req.query.email || '').trim().toLowerCase();
    if (!email) {
      return res.status(400).json({
        success: false,
        message: 'Email is required'
      });
    }
    const student = await Student.findOne({ email }).select('fullName email rollNo').lean();
    if (!student) {
      return res.status(404).json({
        success: false,
        message: "Student isn't on the platform so can't add the student."
      });
    }
    res.json({
      success: true,
      student: {
        id: student._id.toString(),
        _id: student._id,
        fullName: student.fullName,
        email: student.email,
        rollNo: student.rollNo || ''
      }
    });
  } catch (error) {
    console.error('Student lookup error:', error);
    res.status(500).json({
      success: false,
      message: 'Error looking up student',
      error: error.message
    });
  }
});

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
