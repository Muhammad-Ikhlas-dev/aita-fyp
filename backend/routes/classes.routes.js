const express = require('express');
const multer = require('multer');
const path = require('path');
const Class = require('../schemas/Class');
const Enrollment = require('../schemas/Enrollment');
const Student = require('../schemas/Student');

const router = express.Router();
const classCoversDir = path.join(__dirname, '..', 'class_covers');

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, classCoversDir);
  },
  filename: function (req, file, cb) {
    const ext = path.extname(file.originalname) || '.jpg';
    const name = (file.originalname || 'cover').replace(/\.[^/.]+$/, '').replace(/[^a-zA-Z0-9]/g, '_');
    cb(null, `${name}_${Date.now()}${ext}`);
  }
});

const upload = multer({
  storage,
  limits: { fileSize: 5 * 1024 * 1024 },
  fileFilter: function (req, file, cb) {
    if (file.mimetype.startsWith('image/')) {
      cb(null, true);
    } else {
      cb(new Error('Only image files are allowed for cover'), false);
    }
  }
});

router.get('/', async (req, res) => {
  try {
    const { createdBy } = req.query;
    const filter = createdBy ? { createdBy } : {};
    const list = await Class.find(filter).sort({ createdAt: -1 }).lean();
    res.json({
      success: true,
      classes: list,
      count: list.length
    });
  } catch (error) {
    console.error('Get classes error:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching classes',
      error: error.message
    });
  }
});

router.get('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const classDoc = await Class.findById(id).lean();
    if (!classDoc) {
      return res.status(404).json({
        success: false,
        message: 'Class not found'
      });
    }
    res.json({
      success: true,
      class: classDoc
    });
  } catch (error) {
    console.error('Get class error:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching class',
      error: error.message
    });
  }
});

// Class students (enrollments) - more specific routes first
router.get('/:classId/students', async (req, res) => {
  try {
    const { classId } = req.params;
    const classDoc = await Class.findById(classId);
    if (!classDoc) {
      return res.status(404).json({
        success: false,
        message: 'Class not found'
      });
    }
    const enrollments = await Enrollment.find({ classId })
      .populate('studentId', 'fullName email rollNo')
      .sort({ enrolledAt: -1 })
      .lean();
    const students = enrollments
      .filter((e) => e.studentId)
      .map((e) => ({
        id: e.studentId._id.toString(),
        _id: e.studentId._id,
        fullName: e.studentId.fullName,
        email: e.studentId.email,
        rollNo: e.studentId.rollNo || ''
      }));
    res.json({
      success: true,
      students,
      count: students.length
    });
  } catch (error) {
    console.error('Get class students error:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching class students',
      error: error.message
    });
  }
});

router.post('/:classId/students', async (req, res) => {
  try {
    const { classId } = req.params;
    const { studentId } = req.body;
    if (!studentId) {
      return res.status(400).json({
        success: false,
        message: 'studentId is required'
      });
    }
    const classDoc = await Class.findById(classId);
    if (!classDoc) {
      return res.status(404).json({
        success: false,
        message: 'Class not found'
      });
    }
    const student = await Student.findById(studentId).select('fullName email rollNo').lean();
    if (!student) {
      return res.status(404).json({
        success: false,
        message: 'Student not found'
      });
    }
    const existing = await Enrollment.findOne({ classId, studentId });
    if (existing) {
      return res.status(409).json({
        success: false,
        message: 'This student is already added to this class.'
      });
    }
    await Enrollment.create({ classId, studentId });
    res.status(201).json({
      success: true,
      message: 'Student added to class',
      student: {
        id: student._id.toString(),
        _id: student._id,
        fullName: student.fullName,
        email: student.email,
        rollNo: student.rollNo || ''
      }
    });
  } catch (error) {
    console.error('Add class student error:', error);
    if (error.code === 11000) {
      return res.status(409).json({
        success: false,
        message: 'This student is already added to this class.'
      });
    }
    res.status(500).json({
      success: false,
      message: 'Error adding student to class',
      error: error.message
    });
  }
});

router.delete('/:classId/students/:studentId', async (req, res) => {
  try {
    const { classId, studentId } = req.params;
    const deleted = await Enrollment.findOneAndDelete({ classId, studentId });
    if (!deleted) {
      return res.status(404).json({
        success: false,
        message: 'Enrollment not found'
      });
    }
    res.json({
      success: true,
      message: 'Student removed from class'
    });
  } catch (error) {
    console.error('Remove class student error:', error);
    res.status(500).json({
      success: false,
      message: 'Error removing student from class',
      error: error.message
    });
  }
});

router.post('/', upload.single('cover'), async (req, res) => {
  try {
    const { title, subject, description, schedule, createdBy } = req.body;
    const coverFile = req.file;
    if (!coverFile) {
      console.log('Create class: no cover file in request (req.file is undefined)');
    } else {
      console.log('Create class: cover file received', coverFile.filename);
    }

    if (!title || !title.trim()) {
      return res.status(400).json({
        success: false,
        message: 'Class title is required'
      });
    }

    const coverPath = coverFile
      ? `/class_covers/${coverFile.filename}`
      : null;

    const newClass = await Class.create({
      title: title.trim(),
      subject: subject ? String(subject).trim() : '',
      description: description ? String(description).trim() : '',
      schedule: schedule ? String(schedule).trim() : '',
      cover: coverPath,
      createdBy: createdBy || null
    });

    res.status(201).json({
      success: true,
      message: 'Class created successfully',
      class: {
        _id: newClass._id,
        title: newClass.title,
        subject: newClass.subject,
        description: newClass.description,
        schedule: newClass.schedule,
        cover: newClass.cover,
        createdBy: newClass.createdBy,
        createdAt: newClass.createdAt
      }
    });
  } catch (error) {
    console.error('Create class error:', error);
    res.status(500).json({
      success: false,
      message: 'Error creating class',
      error: error.message
    });
  }
});

module.exports = router;
