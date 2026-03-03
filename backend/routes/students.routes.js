const express = require('express');
const path = require('path');
const fs = require('fs');
const mongoose = require('mongoose');
const LabeledImage = require('../schemas/LabeledImage');
const Enrollment = require('../schemas/Enrollment');
const Assignment = require('../schemas/Assignment');
const Quiz = require('../schemas/Quiz');
const AssignmentSubmission = require('../schemas/AssignmentSubmission');
const QuizSubmission = require('../schemas/QuizSubmission');

const router = express.Router();
const uploadDir = path.join(__dirname, '..', 'labeled_images');

// GET /api/students/academic-stats?studentId= — total/missed assignments and quizzes across all enrolled classes
router.get('/academic-stats', async (req, res) => {
  try {
    const { studentId } = req.query;
    if (!studentId || !mongoose.Types.ObjectId.isValid(studentId)) {
      return res.status(400).json({ success: false, message: 'Valid studentId is required' });
    }
    const sid = new mongoose.Types.ObjectId(studentId);

    const enrollments = await Enrollment.find({ studentId: sid }).select('classId').lean();
    const classIds = enrollments.map((e) => e.classId).filter(Boolean);
    if (classIds.length === 0) {
      return res.json({
        success: true,
        totalAssignments: 0,
        missedAssignments: 0,
        totalQuizzes: 0,
        missedQuizzes: 0,
      });
    }

    const now = new Date();

    // Assignments: all in enrolled classes
    const assignments = await Assignment.find({ classIds: { $in: classIds } })
      .select('_id deadline')
      .lean();
    const totalAssignments = assignments.length;
    const pastAssignmentIds = assignments.filter((a) => a.deadline && new Date(a.deadline) < now).map((a) => a._id);
    const submittedPast = await AssignmentSubmission.countDocuments({
      assignmentId: { $in: pastAssignmentIds },
      studentId: sid,
    });
    const missedAssignments = Math.max(0, pastAssignmentIds.length - submittedPast);

    // Quizzes: all in enrolled classes
    const quizzes = await Quiz.find({ classIds: { $in: classIds } })
      .select('_id deadline')
      .lean();
    const totalQuizzes = quizzes.length;
    const pastQuizIds = quizzes.filter((q) => q.deadline && new Date(q.deadline) < now).map((q) => q._id);
    const attemptedPast = await QuizSubmission.countDocuments({
      quizId: { $in: pastQuizIds },
      studentId: sid,
    });
    const missedQuizzes = Math.max(0, pastQuizIds.length - attemptedPast);

    res.json({
      success: true,
      totalAssignments,
      missedAssignments,
      totalQuizzes,
      missedQuizzes,
    });
  } catch (error) {
    console.error('Academic stats error:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Failed to get academic stats',
    });
  }
});

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
