const express = require('express');
const mongoose = require('mongoose');
const path = require('path');
const fs = require('fs');
const multer = require('multer');
const mammoth = require('mammoth');
const { extractText } = require('unpdf');
const AssignmentSubmission = require('../schemas/AssignmentSubmission');
const Assignment = require('../schemas/Assignment');
const Student = require('../schemas/Student');

const router = express.Router();

const GEMINI_MODEL = 'gemini-2.5-flash';

// ── Text extraction (for AI grading) ──────────────────────────────────────────
async function extractTextFromPDF(filePath) {
  const buffer = fs.readFileSync(filePath);
  const uint8 = new Uint8Array(buffer);
  const { text } = await extractText(uint8, { mergePages: true });
  return Array.isArray(text) ? text.join(' ') : (text || '');
}

async function extractTextFromDOCX(filePath) {
  const result = await mammoth.extractRawText({ path: filePath });
  return result.value || '';
}

async function extractTextFromFile(filePath, mimeType) {
  const ext = path.extname(filePath).toLowerCase();
  try {
    if (ext === '.pdf' || mimeType === 'application/pdf') {
      return await extractTextFromPDF(filePath);
    }
    if (
      ext === '.docx' ||
      ext === '.doc' ||
      mimeType === 'application/vnd.openxmlformats-officedocument.wordprocessingml.document' ||
      mimeType === 'application/msword'
    ) {
      return await extractTextFromDOCX(filePath);
    }
    return fs.readFileSync(filePath, 'utf8');
  } catch (err) {
    console.error('Extract submission text error:', err.message);
    return '';
  }
}

// ── Gemini grading (one submission at a time) ─────────────────────────────────
function getGeminiUrl() {
  const key = process.env.GEMINI_API_KEY;
  if (!key) return null;
  return `https://generativelanguage.googleapis.com/v1beta/models/${GEMINI_MODEL}:generateContent?key=${key}`;
}

async function gradeSubmissionWithGemini(assignmentTitle, assignmentInstructions, submissionText) {
  const url = getGeminiUrl();
  if (!url) throw new Error('GEMINI_API_KEY is not configured');

  const prompt = `You are grading a student assignment submission. Give a single overall mark out of 10, regardless of how many questions the assignment has. Reply with ONLY a valid JSON object, no other text. Use exactly these keys: "score" (number from 0 to 10, can use decimals e.g. 7.5) and "feedback" (string, brief feedback for the student).

Assignment title: ${assignmentTitle || '(not provided)'}
Assignment instructions: ${assignmentInstructions || '(none)'}

Student submission text:
---
${(submissionText || '').slice(0, 80000)}
---

Respond with only: {"score": <0-10>, "feedback": "<your feedback>"}`;

  console.log('[Gemini] Grading submission: calling API...');
  const res = await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      contents: [{ role: 'user', parts: [{ text: prompt }] }],
      generationConfig: { responseMimeType: 'application/json' },
    }),
  });

  console.log('[Gemini] Response status:', res.status, res.statusText, '| ok:', res.ok);
  if (!res.ok) {
    const err = await res.text();
    console.error('[Gemini] Error response body:', err);
    throw new Error(`Gemini API ${res.status}: ${err}`);
  }

  const data = await res.json();
  const part = data.candidates?.[0]?.content?.parts?.[0];
  if (!part || part.text == null) {
    console.error('[Gemini] Invalid response format. Full response:', JSON.stringify(data, null, 2));
    throw new Error('Invalid Gemini response');
  }
  const raw = part.text.trim();
  console.log('[Gemini] Raw response text:', raw);

  const parsed = JSON.parse(raw);
  const score = typeof parsed.score === 'number' ? Math.min(10, Math.max(0, parsed.score)) : null;
  const feedback = typeof parsed.feedback === 'string' ? parsed.feedback.slice(0, 2000) : '';
  console.log('[Gemini] Parsed grade — score:', score, '| feedback:', feedback);
  return { score, feedback };
}

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
          gradingStatus: 'pending',
          aiGrade: { score: null, feedback: null },
        }
      );
    } else {
      await AssignmentSubmission.create({
        assignmentId: new mongoose.Types.ObjectId(assignmentId),
        studentId: new mongoose.Types.ObjectId(studentId),
        filePath: req.file.path,
        originalName: req.file.originalname || path.basename(req.file.path),
        mimeType: req.file.mimetype,
        gradingStatus: 'pending',
        aiGrade: { score: null, feedback: null },
      });
    }

    let updated = await AssignmentSubmission.findOne({ assignmentId, studentId }).lean();

    // AI grading: extract text, call Gemini, store score and feedback
    const filePath = path.isAbsolute(req.file.path) ? req.file.path : path.join(__dirname, '..', req.file.path);
    const submissionText = await extractTextFromFile(filePath, req.file.mimetype);
    try {
      console.log('[Gemini] Starting AI grade for submission', updated._id);
      const { score, feedback } = await gradeSubmissionWithGemini(
        assignment.title,
        assignment.instructions,
        submissionText
      );
      console.log('[Gemini] Grading success. Saving to DB — score:', score, 'feedback length:', (feedback || '').length);
      await AssignmentSubmission.findByIdAndUpdate(
        updated._id,
        {
          $set: {
            gradingStatus: 'graded',
            'aiGrade.score': score,
            'aiGrade.feedback': feedback == null ? '' : feedback,
          },
        },
        { new: true }
      );
      updated = await AssignmentSubmission.findOne({ assignmentId, studentId }).lean();
    } catch (gradeErr) {
      console.error('[Gemini] AI grading failed for submission:', updated._id, '—', gradeErr.message);
      if (gradeErr.stack) console.error(gradeErr.stack);
      await AssignmentSubmission.findByIdAndUpdate(
        updated._id,
        {
          $set: {
            gradingStatus: 'failed',
            'aiGrade.score': null,
            'aiGrade.feedback': null,
          },
        },
        { new: true }
      );
      updated = await AssignmentSubmission.findOne({ assignmentId, studentId }).lean();
    }

    res.status(201).json({
      success: true,
      message: 'Assignment turned in',
      submission: {
        _id: updated._id,
        assignmentId: updated.assignmentId,
        studentId: updated.studentId,
        originalName: updated.originalName,
        submittedAt: updated.submittedAt,
        gradingStatus: updated.gradingStatus,
        aiGrade: updated.aiGrade ? { score: updated.aiGrade.score, feedback: updated.aiGrade.feedback } : null,
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

// GET /api/submissions/counts?assignmentIds=id1,id2 — submission counts per assignment (for dashboard)
router.get('/counts', async (req, res) => {
  try {
    const raw = req.query.assignmentIds;
    const ids = (typeof raw === 'string' ? raw.split(',') : Array.isArray(raw) ? raw : [])
      .map((id) => id?.trim()).filter((id) => id && mongoose.Types.ObjectId.isValid(id));
    if (ids.length === 0) {
      return res.json({ success: true, counts: {} });
    }
    const objectIds = ids.map((id) => new mongoose.Types.ObjectId(id));
    const list = await AssignmentSubmission.aggregate([
      { $match: { assignmentId: { $in: objectIds } } },
      { $group: { _id: '$assignmentId', count: { $sum: 1 } } },
    ]);
    const counts = {};
    ids.forEach((id) => { counts[id] = 0; });
    list.forEach((row) => { counts[row._id.toString()] = row.count; });
    res.json({ success: true, counts });
  } catch (error) {
    console.error('Submission counts error:', error);
    res.status(500).json({ success: false, message: error.message || 'Failed to get counts' });
  }
});

// GET /api/submissions/list?assignmentId= — list all submissions for an assignment (for teacher), with student names and rollNo from students table
router.get('/list', async (req, res) => {
  try {
    const { assignmentId } = req.query;
    if (!assignmentId || !mongoose.Types.ObjectId.isValid(assignmentId)) {
      return res.status(400).json({ success: false, message: 'Valid assignmentId is required' });
    }
    const list = await AssignmentSubmission.find({
      assignmentId: new mongoose.Types.ObjectId(assignmentId),
    })
      .select('assignmentId studentId originalName submittedAt gradingStatus aiGrade')
      .sort({ submittedAt: -1 })
      .lean();
    const studentIds = [...new Set(list.map((s) => s.studentId?.toString()).filter(Boolean))];
    const studentsFromDb = await Student.find({ _id: { $in: studentIds } })
      .select('_id fullName email rollNo')
      .lean();
    const studentMap = new Map(studentsFromDb.map((st) => [st._id.toString(), st]));
    const submissions = list.map((s) => {
      const score = s.aiGrade?.score != null ? s.aiGrade.score : null;
      const student = s.studentId ? studentMap.get(s.studentId.toString()) : null;
      const rollNo = student ? (student.rollNo ?? student.roll_no ?? '') : '';
      return {
        _id: s._id,
        assignmentId: s.assignmentId,
        studentId: s.studentId,
        studentName: student?.fullName || '—',
        email: student?.email || '',
        rollNo,
        originalName: s.originalName,
        submittedAt: s.submittedAt,
        gradingStatus: s.gradingStatus || 'pending',
        score,
        aiGrade: s.aiGrade ? { score: s.aiGrade.score, feedback: s.aiGrade.feedback } : null,
      };
    });
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
