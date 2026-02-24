const express = require('express');
const mongoose = require('mongoose');
const path = require('path');
const fs = require('fs');
const multer = require('multer');
const AssignmentSubmission = require('../schemas/AssignmentSubmission');
const Assignment = require('../schemas/Assignment');

const router = express.Router();

const submissionsDir = path.join(__dirname, '..', 'assignment_submissions');
if (!fs.existsSync(submissionsDir)) {
  fs.mkdirSync(submissionsDir, { recursive: true });
}

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, submissionsDir);
  },
  filename: function (req, file, cb) {
    const ext = path.extname(file.originalname) || '.pdf';
    const base = (file.originalname || 'submission').replace(/\.[^/.]+$/, '').replace(/[^a-zA-Z0-9_-]/g, '_');
    cb(null, `sub_${base}_${Date.now()}${ext}`);
  },
});

const uploadSubmission = multer({
  storage,
  limits: { fileSize: 15 * 1024 * 1024 }, // 15MB
  fileFilter: function (req, file, cb) {
    const allowed = [
      'application/pdf',
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
      'application/msword',
    ];
    const ext = (path.extname(file.originalname) || '').toLowerCase();
    if (allowed.includes(file.mimetype) || ['.pdf', '.docx', '.doc'].includes(ext)) {
      cb(null, true);
    } else {
      cb(new Error('Only PDF or DOCX files are allowed'), false);
    }
  },
});

// POST /api/submissions — upload student assignment (multipart: assignmentId, studentId, file)
router.post('/', uploadSubmission.single('file'), async (req, res) => {
  try {
    const assignmentId = req.body.assignmentId;
    const studentId = req.body.studentId;
    if (!assignmentId || !mongoose.Types.ObjectId.isValid(assignmentId)) {
      return res.status(400).json({ success: false, message: 'Valid assignmentId is required' });
    }
    if (!studentId || !mongoose.Types.ObjectId.isValid(studentId)) {
      return res.status(400).json({ success: false, message: 'Valid studentId is required' });
    }
    if (!req.file || !req.file.path) {
      return res.status(400).json({ success: false, message: 'No file uploaded' });
    }

    const assignment = await Assignment.findById(assignmentId).lean();
    if (!assignment) {
      return res.status(404).json({ success: false, message: 'Assignment not found' });
    }

    const deadline = assignment.deadline ? new Date(assignment.deadline) : null;
    if (deadline && new Date() > deadline) {
      return res.status(400).json({
        success: false,
        message: "Can't turn in - deadline has already reached.",
      });
    }

    const existing = await AssignmentSubmission.findOne({ assignmentId, studentId }).lean();
    if (existing) {
      if (fs.existsSync(existing.filePath)) {
        try { fs.unlinkSync(existing.filePath); } catch (_) {}
      }
      await AssignmentSubmission.findOneAndUpdate(
        { assignmentId, studentId },
        {
          filePath: req.file.path,
          originalName: req.file.originalname || path.basename(req.file.path),
          mimeType: req.file.mimetype,
          submittedAt: new Date(),
        }
      );
    } else {
      await AssignmentSubmission.create({
        assignmentId: new mongoose.Types.ObjectId(assignmentId),
        studentId: new mongoose.Types.ObjectId(studentId),
        filePath: req.file.path,
        originalName: req.file.originalname || path.basename(req.file.path),
        mimeType: req.file.mimetype,
      });
    }

    const updated = await AssignmentSubmission.findOne({ assignmentId, studentId }).lean();
    res.status(201).json({
      success: true,
      message: 'Assignment turned in',
      submission: {
        _id: updated._id,
        assignmentId: updated.assignmentId,
        studentId: updated.studentId,
        originalName: updated.originalName,
        submittedAt: updated.submittedAt,
      },
    });
  } catch (error) {
    console.error('Submit assignment error:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Failed to submit',
    });
  }
});

// GET /api/submissions/list?assignmentId= — list all submissions for an assignment (for teacher), with student names
router.get('/list', async (req, res) => {
  try {
    const { assignmentId } = req.query;
    if (!assignmentId || !mongoose.Types.ObjectId.isValid(assignmentId)) {
      return res.status(400).json({ success: false, message: 'Valid assignmentId is required' });
    }
    const list = await AssignmentSubmission.find({
      assignmentId: new mongoose.Types.ObjectId(assignmentId),
    })
      .populate('studentId', 'fullName email')
      .sort({ submittedAt: -1 })
      .lean();
    const submissions = list.map((s) => ({
      _id: s._id,
      assignmentId: s.assignmentId,
      studentId: s.studentId?._id,
      studentName: s.studentId?.fullName || '—',
      email: s.studentId?.email || '',
      originalName: s.originalName,
      submittedAt: s.submittedAt,
    }));
    res.json({
      success: true,
      submissions,
      count: submissions.length,
    });
  } catch (error) {
    console.error('List submissions error:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Failed to list submissions',
    });
  }
});

// GET /api/submissions?assignmentId= &studentId= — get my submission for an assignment
router.get('/', async (req, res) => {
  try {
    const { assignmentId, studentId } = req.query;
    if (!assignmentId || !mongoose.Types.ObjectId.isValid(assignmentId)) {
      return res.json({ success: true, submission: null });
    }
    if (!studentId || !mongoose.Types.ObjectId.isValid(studentId)) {
      return res.json({ success: true, submission: null });
    }
    const submission = await AssignmentSubmission.findOne({
      assignmentId: new mongoose.Types.ObjectId(assignmentId),
      studentId: new mongoose.Types.ObjectId(studentId),
    }).lean();
    res.json({
      success: true,
      submission: submission || null,
    });
  } catch (error) {
    console.error('Get submission error:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Failed to get submission',
    });
  }
});

// DELETE /api/submissions/:id — delete my submission (and file from disk)
router.delete('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const studentId = req.query.studentId;
    if (!id || !mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ success: false, message: 'Invalid submission id' });
    }
    if (!studentId || !mongoose.Types.ObjectId.isValid(studentId)) {
      return res.status(400).json({ success: false, message: 'Student id required' });
    }
    const submission = await AssignmentSubmission.findOne({
      _id: new mongoose.Types.ObjectId(id),
      studentId: new mongoose.Types.ObjectId(studentId),
    });
    if (!submission) {
      return res.status(404).json({ success: false, message: 'Submission not found' });
    }
    const filePath = path.isAbsolute(submission.filePath)
      ? submission.filePath
      : path.join(__dirname, '..', submission.filePath);
    if (fs.existsSync(filePath)) {
      try {
        fs.unlinkSync(filePath);
      } catch (err) {
        console.error('Could not delete submission file:', err);
      }
    }
    await AssignmentSubmission.findByIdAndDelete(id);
    res.json({
      success: true,
      message: 'Submission removed',
    });
  } catch (error) {
    console.error('Delete submission error:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Failed to delete',
    });
  }
});

// GET /api/submissions/:id/file — serve file for preview/download
router.get('/:id/file', async (req, res) => {
  try {
    const { id } = req.params;
    if (!id || !mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ success: false, message: 'Invalid submission id' });
    }
    const submission = await AssignmentSubmission.findById(id).lean();
    if (!submission) {
      return res.status(404).json({ success: false, message: 'Submission not found' });
    }
    const filePath = path.isAbsolute(submission.filePath)
      ? submission.filePath
      : path.join(__dirname, '..', submission.filePath);
    if (!fs.existsSync(filePath)) {
      return res.status(404).json({ success: false, message: 'File not found' });
    }
    const filename = submission.originalName || path.basename(filePath);
    const ext = path.extname(filename).toLowerCase();
    const mime = {
      '.pdf': 'application/pdf',
      '.docx': 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
      '.doc': 'application/msword',
    };
    res.setHeader('Content-Type', mime[ext] || 'application/octet-stream');
    res.setHeader('Content-Disposition', `inline; filename="${filename.replace(/"/g, '\\"')}"`);
    res.sendFile(path.resolve(filePath));
  } catch (error) {
    console.error('Get submission file error:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Failed to get file',
    });
  }
});

module.exports = router;
