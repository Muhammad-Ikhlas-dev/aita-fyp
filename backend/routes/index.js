const express = require('express');
const uploadRoutes = require('./upload.routes');
const studentsRoutes = require('./students.routes');
const attendanceRoutes = require('./attendance.routes');
const healthRoutes = require('./health.routes');
const authRoutes = require('./auth.routes');
const classesRoutes = require('./classes.routes');
const aiRoutes = require('./ai.routes');
const assignmentsRoutes = require('./assignments.routes');
const submissionsRoutes = require('./submissions.routes');
const plagiarismRoutes = require('./plagiarism.routes');
const quizRoutes = require('./quiz.routes');
const teachersRoutes = require('./teachers.routes');

const router = express.Router();

router.use('/upload', uploadRoutes);
router.use('/teachers', teachersRoutes);
router.use('/assignments', assignmentsRoutes);
router.use('/submissions', submissionsRoutes);
router.use('/plagiarism', plagiarismRoutes);
router.use('/students', studentsRoutes);
router.use('/attendance', attendanceRoutes);
router.use('/health', healthRoutes);
router.use('/auth', authRoutes);
router.use('/classes', classesRoutes);
router.use('/ai', aiRoutes);
router.use('/quizzes', quizRoutes)

module.exports = router;
