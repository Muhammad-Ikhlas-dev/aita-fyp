const express = require('express');
const bcrypt = require('bcryptjs');
const Teacher = require('../schemas/Teacher');
const Student = require('../schemas/Student');

const router = express.Router();

// POST /api/auth/signup — register a new teacher or student (role + optional rollNo for student)
router.post('/signup', async (req, res) => {
  try {
    const { fullName, email, password, role, rollNo } = req.body;

    if (!fullName || !email || !password || !role) {
      return res.status(400).json({
        success: false,
        message: 'Full name, email, password and role are required'
      });
    }

    if (!['student', 'teacher'].includes(role)) {
      return res.status(400).json({
        success: false,
        message: 'Role must be "student" or "teacher"'
      });
    }

    if (role === 'student' && !rollNo?.trim()) {
      return res.status(400).json({
        success: false,
        message: 'Roll number is required for students'
      });
    }

    const normalizedEmail = email.trim().toLowerCase();
    const hashedPassword = await bcrypt.hash(password, 10);

    if (role === 'teacher') {
      const existing = await Teacher.findOne({ email: normalizedEmail });
      if (existing) {
        return res.status(409).json({
          success: false,
          message: 'A teacher with this email already exists'
        });
      }
      const teacher = await Teacher.create({
        fullName: fullName.trim(),
        email: normalizedEmail,
        password: hashedPassword
      });
      return res.status(201).json({
        success: true,
        message: 'Teacher registered successfully',
        user: {
          id: teacher._id,
          fullName: teacher.fullName,
          email: teacher.email,
          role: 'teacher'
        }
      });
    }

    if (role === 'student') {
      const existing = await Student.findOne({ email: normalizedEmail });
      if (existing) {
        return res.status(409).json({
          success: false,
          message: 'A student with this email already exists'
        });
      }
      const student = await Student.create({
        fullName: fullName.trim(),
        email: normalizedEmail,
        password: hashedPassword,
        rollNo: rollNo.trim()
      });
      return res.status(201).json({
        success: true,
        message: 'Student registered successfully',
        user: {
          id: student._id,
          fullName: student.fullName,
          email: student.email,
          rollNo: student.rollNo,
          role: 'student'
        }
      });
    }
  } catch (error) {
    console.error('Signup error:', error);
    if (error.code === 11000) {
      return res.status(409).json({
        success: false,
        message: 'An account with this email already exists'
      });
    }
    res.status(500).json({
      success: false,
      message: 'Error during signup',
      error: error.message
    });
  }
});

// POST /api/auth/login — authenticate by email/password; returns user (teacher or student) without password
// POST /api/auth/login — authenticate by email/password; returns user (teacher or student) without password
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: 'Email and password are required'
      });
    }

    const normalizedEmail = email.trim().toLowerCase();

    // Check teacher first
    const teacher = await Teacher.findOne({ email: normalizedEmail }).select('+password');
    if (teacher) {
      const match = await bcrypt.compare(password, teacher.password);
      if (!match) {
        return res.status(401).json({
          success: false,
          message: 'Invalid email or password'
        });
      }
      return res.json({
        success: true,
        message: 'Login successful',
        user: {
          id: teacher._id,
          fullName: teacher.fullName,
          email: teacher.email,
          role: 'teacher'
        }
      });
    }

    // Check student
    const student = await Student.findOne({ email: normalizedEmail }).select('+password');
    if (student) {
      const match = await bcrypt.compare(password, student.password);
      if (!match) {
        return res.status(401).json({
          success: false,
          message: 'Invalid email or password'
        });
      }
      return res.json({
        success: true,
        message: 'Login successful',
        user: {
          id: student._id,
          fullName: student.fullName,
          email: student.email,
          rollNo: student.rollNo,
          role: 'student'
        }
      });
    }

    return res.status(401).json({
      success: false,
      message: 'Invalid email or password'
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({
      success: false,
      message: 'Error during login',
      error: error.message
    });
  }
});

module.exports = router;