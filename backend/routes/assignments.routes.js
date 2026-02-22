const express = require('express');
const mongoose = require('mongoose');
const path = require('path');
const fs = require('fs');
const multer = require('multer');
const Assignment = require('../schemas/Assignment');

const router = express.Router();

const assignmentFilesDir = path.join(__dirname, '..', 'assignment_files');
if (!fs.existsSync(assignmentFilesDir)) {
  fs.mkdirSync(assignmentFilesDir, { recursive: true });
}

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, assignmentFilesDir);
  },
  filename: function (req, file, cb) {
    const ext = path.extname(file.originalname) || '';
    const base = (file.originalname || 'file').replace(/\.[^/.]+$/, '').replace(/[^a-zA-Z0-9_-]/g, '_');
    cb(null, `${base}_${Date.now()}${ext}`);
  },
});

const uploadAssignmentFile = multer({
  storage,
  limits: { fileSize: 15 * 1024 * 1024 }, // 15MB
  fileFilter: function (req, file, cb) {
    const allowed = [
      'application/pdf',
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
      'application/msword',
      'text/plain',
    ];
    const ext = (path.extname(file.originalname) || '').toLowerCase();
    if (allowed.includes(file.mimetype) || ['.pdf', '.docx', '.doc', '.txt'].includes(ext)) {
      cb(null, true);
    } else {
      cb(new Error('Only PDF, DOCX, DOC or TXT files are allowed'), false);
    }
  },
});

// POST /api/assignments — create/publish assignment (multipart: title, instructions, deadline, classIds, createdBy, optional file)
router.post('/', uploadAssignmentFile.single('file'), async (req, res) => {
  try {
    const body = req.body || {};
    let title = body.title;
    let instructions = body.instructions;
    let deadline = body.deadline;
    let classIds = body.classIds;
    const createdBy = body.createdBy;

    if (typeof classIds === 'string') {
      try {
        classIds = JSON.parse(classIds);
      } catch (_) {
        classIds = [];
      }
    }

    if (!title || !String(title).trim()) {
      return res.status(400).json({
        success: false,
        message: 'Assignment title is required',
      });
    }

    if (!deadline) {
      return res.status(400).json({
        success: false,
        message: 'Deadline is required',
      });
    }

    if (!createdBy || !mongoose.Types.ObjectId.isValid(createdBy)) {
      return res.status(400).json({
        success: false,
        message: 'Valid teacher (createdBy) is required',
      });
    }

    const ids = Array.isArray(classIds) ? classIds : [];
    const validClassIds = ids
      .filter((id) => id && mongoose.Types.ObjectId.isValid(id))
      .map((id) => new mongoose.Types.ObjectId(id));

    if (validClassIds.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'At least one class must be selected',
      });
    }

    const payload = {
      title: String(title).trim(),
      instructions: String(instructions || '').trim(),
      deadline: new Date(deadline),
      createdBy: new mongoose.Types.ObjectId(createdBy),
      classIds: validClassIds,
    };

    if (req.file && req.file.path) {
      payload.attachmentPath = req.file.path;
      payload.attachmentOriginalName = req.file.originalname || path.basename(req.file.path);
    }

    const assignment = await Assignment.create(payload);

    res.status(201).json({
      success: true,
      message: 'Assignment published successfully',
      assignment: {
        _id: assignment._id,
        title: assignment.title,
        instructions: assignment.instructions,
        deadline: assignment.deadline,
        createdBy: assignment.createdBy,
        classIds: assignment.classIds,
        attachmentPath: assignment.attachmentPath,
        attachmentOriginalName: assignment.attachmentOriginalName,
        createdAt: assignment.createdAt,
      },
    });
  } catch (error) {
    console.error('Create assignment error:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Failed to publish assignment',
    });
  }
});

// GET /api/assignments/:id/download — download the assignment file (pdf, docx, txt, etc.)
router.get('/:id/download', async (req, res) => {
  try {
    const { id } = req.params;
    if (!id || !mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ success: false, message: 'Invalid assignment id' });
    }
    const assignment = await Assignment.findById(id).lean();
    if (!assignment) {
      return res.status(404).json({ success: false, message: 'Assignment not found' });
    }
    if (!assignment.attachmentPath || !fs.existsSync(assignment.attachmentPath)) {
      return res.status(404).json({ success: false, message: 'No file attached to this assignment' });
    }
    const filename = assignment.attachmentOriginalName || path.basename(assignment.attachmentPath);
    const ext = path.extname(filename).toLowerCase();
    const mime = {
      '.pdf': 'application/pdf',
      '.docx': 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
      '.doc': 'application/msword',
      '.txt': 'text/plain',
    };
    res.setHeader('Content-Type', mime[ext] || 'application/octet-stream');
    res.setHeader('Content-Disposition', `attachment; filename="${filename.replace(/"/g, '\\"')}"`);
    res.sendFile(path.resolve(assignment.attachmentPath));
  } catch (error) {
    console.error('Download assignment error:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Failed to download',
    });
  }
});

// PATCH /api/assignments/:id — update assignment (deadline only)
router.patch('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { deadline } = req.body;
    if (!id || !mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ success: false, message: 'Invalid assignment id' });
    }
    if (!deadline) {
      return res.status(400).json({ success: false, message: 'Deadline is required' });
    }
    const assignment = await Assignment.findByIdAndUpdate(
      id,
      { deadline: new Date(deadline) },
      { new: true }
    ).lean();
    if (!assignment) {
      return res.status(404).json({ success: false, message: 'Assignment not found' });
    }
    res.json({
      success: true,
      message: 'Deadline updated',
      assignment,
    });
  } catch (error) {
    console.error('Update assignment error:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Failed to update assignment',
    });
  }
});

// DELETE /api/assignments/:id — delete assignment (and attached file from disk)
router.delete('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    if (!id || !mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ success: false, message: 'Invalid assignment id' });
    }
    const assignment = await Assignment.findById(id).lean();
    if (!assignment) {
      return res.status(404).json({ success: false, message: 'Assignment not found' });
    }
    if (assignment.attachmentPath && fs.existsSync(assignment.attachmentPath)) {
      try {
        fs.unlinkSync(assignment.attachmentPath);
      } catch (err) {
        console.error('Could not delete assignment file:', err);
      }
    }
    await Assignment.findByIdAndDelete(id);
    res.json({
      success: true,
      message: 'Assignment deleted',
    });
  } catch (error) {
    console.error('Delete assignment error:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Failed to delete assignment',
    });
  }
});

// GET /api/assignments — list assignments
// Query: createdBy (teacher id) => only that teacher's assignments
//        classId => assignments that include this class (optionally with createdBy for teacher-specific)
router.get('/', async (req, res) => {
  try {
    const { createdBy, classId } = req.query;
    const filter = {};

    if (createdBy && mongoose.Types.ObjectId.isValid(createdBy)) {
      filter.createdBy = new mongoose.Types.ObjectId(createdBy);
    }

    if (classId && mongoose.Types.ObjectId.isValid(classId)) {
      filter.classIds = new mongoose.Types.ObjectId(classId);
    }

    const list = await Assignment.find(filter)
      .sort({ createdAt: -1 })
      .lean();

    res.json({
      success: true,
      assignments: list,
      count: list.length,
    });
  } catch (error) {
    console.error('List assignments error:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Failed to list assignments',
    });
  }
});

module.exports = router;
