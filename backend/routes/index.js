const express = require('express');
const uploadRoutes = require('./upload.routes');
const studentsRoutes = require('./students.routes');
const attendanceRoutes = require('./attendance.routes');
const healthRoutes = require('./health.routes');
const authRoutes = require('./auth.routes');
const classesRoutes = require('./classes.routes');

const router = express.Router();

router.use('/upload', uploadRoutes);
router.use('/students', studentsRoutes);
router.use('/attendance', attendanceRoutes);
router.use('/health', healthRoutes);
router.use('/auth', authRoutes);
router.use('/classes', classesRoutes);

module.exports = router;
