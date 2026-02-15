const express = require('express');
const path = require('path');
const fs = require('fs');
const Student = require('../schemas/Student');

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

router.get('/', (req, res) => {
    try {
        const files = fs.readdirSync(uploadDir);

        const studentMap = new Map();

        files
            .filter(file => /\.(jpg|jpeg|png|gif)$/i.test(file))
            .forEach(file => {
                const nameWithoutExt = file.replace(/\.[^/.]+$/, '');
                const parts = nameWithoutExt.split('_');

                if (parts.length > 1 && /^\d+$/.test(parts[parts.length - 1])) {
                    parts.pop();
                }

                const studentName = parts.join('_');

                if (!studentMap.has(studentName)) {
                    const ext = file.split('.').pop();
                    studentMap.set(studentName, {
                        name: studentName,
                        filename: file,
                        extension: ext,
                        url: `/labeled_images/${file}`
                    });
                }
            });

        const students = Array.from(studentMap.values());

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

router.delete('/:filename', (req, res) => {
    try {
        const { filename } = req.params;
        const filePath = path.join(uploadDir, filename);

        if (!fs.existsSync(filePath)) {
            return res.status(404).json({
                success: false,
                message: 'Student not found'
            });
        }

        fs.unlinkSync(filePath);

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
