const express = require('express');
const AttendanceLog = require('../schemas/AttendanceLogs');
const mongoose = require('mongoose');

const router = express.Router();

router.get('/', async (req, res) => {
  try {
    const { classId } = req.query;
    const filter = classId && mongoose.Types.ObjectId.isValid(classId)
      ? { classId: new mongoose.Types.ObjectId(classId) }
      : {};
    const logs = await AttendanceLog.find(filter)
      .sort({ timestamp: -1 })
      .lean();
    res.json({
      success: true,
      attendance: logs,
      count: logs.length
    });
  } catch (error) {
    console.error('Get attendance error:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching attendance',
      error: error.message
    });
  }
});

router.post('/mark', async (req, res) => {
  try {
    const { students, timestamp, classId } = req.body;

    if (!students || !Array.isArray(students) || students.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'Students array is required'
      });
    }

    const record = await AttendanceLog.create({
      classId: classId || null,
      timestamp: timestamp ? new Date(timestamp) : new Date(),
      students: students.map(s => ({
        name: s.name,
        confidence: s.confidence != null ? s.confidence : 0,
        matched: s.matched != null ? s.matched : true
      })),
      count: students.length
    });

    res.status(201).json({
      success: true,
      message: `Attendance marked for ${students.length} student(s)`,
      record: {
        _id: record._id,
        classId: record.classId,
        timestamp: record.timestamp,
        students: record.students,
        count: record.count
      }
    });
  } catch (error) {
    console.error('Error marking attendance:', error);
    res.status(500).json({
      success: false,
      message: 'Error marking attendance',
      error: error.message
    });
  }
});

module.exports = router;
