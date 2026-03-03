const express = require('express');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const bcrypt = require('bcryptjs');
const mongoose = require('mongoose');
const Teacher = require('../schemas/Teacher');

const router = express.Router();
const teacherProfilesDir = path.join(__dirname, '..', 'teacher_profiles');

const storage = multer.diskStorage({
  destination(req, file, cb) {
    cb(null, teacherProfilesDir);
  },
  filename(req, file, cb) {
    const ext = path.extname(file.originalname) || '.jpg';
    const base = (file.originalname || 'profile').replace(/\.[^/.]+$/, '').replace(/[^a-zA-Z0-9_-]/g, '_');
    cb(null, `${base}_${Date.now()}${ext}`);
  },
});

const upload = multer({
  storage,
  limits: { fileSize: 5 * 1024 * 1024 },
  fileFilter(req, file, cb) {
    if (file.mimetype.startsWith('image/')) {
      cb(null, true);
    } else {
      cb(new Error('Only image files are allowed'), false);
    }
  },
});

// PATCH /api/teachers/me — update profile (fullName, email, optional photo). Body: fullName, email; optional multipart field "photo".
router.patch('/me', upload.single('photo'), async (req, res) => {
  try {
    const teacherId = req.body.teacherId || req.query.teacherId;
    if (!teacherId || !mongoose.Types.ObjectId.isValid(teacherId)) {
      return res.status(400).json({ success: false, message: 'Valid teacherId is required' });
    }

    const teacher = await Teacher.findById(teacherId);
    if (!teacher) {
      return res.status(404).json({ success: false, message: 'Teacher not found' });
    }

    const fullName = req.body.fullName != null ? String(req.body.fullName).trim() : undefined;
    const email = req.body.email != null ? String(req.body.email).trim().toLowerCase() : undefined;

    if (fullName !== undefined) teacher.fullName = fullName;
    if (email !== undefined) {
      if (email !== teacher.email) {
        const existing = await Teacher.findOne({ email });
        if (existing) {
          return res.status(409).json({ success: false, message: 'A teacher with this email already exists' });
        }
        teacher.email = email;
      }
    }

    if (req.file) {
      if (teacher.photo) {
        const basename = path.basename(teacher.photo);
        const oldPath = path.join(teacherProfilesDir, basename);
        if (fs.existsSync(oldPath)) {
          try { fs.unlinkSync(oldPath); } catch (e) { /* ignore */ }
        }
      }
      teacher.photo = `/teacher_profiles/${req.file.filename}`;
    }

    await teacher.save();

    const user = {
      id: teacher._id.toString(),
      fullName: teacher.fullName,
      email: teacher.email,
      role: 'teacher',
      photo: teacher.photo || null,
    };

    res.json({
      success: true,
      message: 'Profile updated successfully',
      user,
    });
  } catch (error) {
    console.error('Update teacher profile error:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Failed to update profile',
    });
  }
});

// PATCH /api/teachers/me/password — change password (currentPassword, newPassword). Body: teacherId, currentPassword, newPassword.
router.patch('/me/password', async (req, res) => {
  try {
    const { teacherId, currentPassword, newPassword } = req.body;
    if (!teacherId || !mongoose.Types.ObjectId.isValid(teacherId)) {
      return res.status(400).json({ success: false, message: 'Valid teacherId is required' });
    }
    if (!currentPassword || typeof currentPassword !== 'string') {
      return res.status(400).json({ success: false, message: 'Current password is required' });
    }
    if (!newPassword || typeof newPassword !== 'string' || newPassword.length < 6) {
      return res.status(400).json({ success: false, message: 'New password must be at least 6 characters' });
    }

    const teacher = await Teacher.findById(teacherId).select('+password');
    if (!teacher) {
      return res.status(404).json({ success: false, message: 'Teacher not found' });
    }

    const match = await bcrypt.compare(currentPassword, teacher.password);
    if (!match) {
      return res.status(401).json({ success: false, message: 'Current password is incorrect' });
    }

    teacher.password = await bcrypt.hash(newPassword, 10);
    await teacher.save();

    res.json({ success: true, message: 'Password updated successfully' });
  } catch (error) {
    console.error('Change password error:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Failed to update password',
    });
  }
});

module.exports = router;
