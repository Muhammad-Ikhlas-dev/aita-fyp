const express = require('express');
const AttendanceLog = require('../schemas/AttendanceLogs');

const router = express.Router();

router.post('/mark', async (req, res) => {
    try {
        const { students, timestamp } = req.body;

        if (!students || !Array.isArray(students) || students.length === 0) {
            return res.status(400).json({
                success: false,
                message: 'Students array is required'
            });
        }

        const record = await AttendanceLog.create({
            timestamp: timestamp ? new Date(timestamp) : new Date(),
            students: students.map(s => ({
                name: s.name,
                confidence: s.confidence != null ? s.confidence : 0,
                matched: s.matched != null ? s.matched : true
            })),
            count: students.length
        });

        console.log('Attendance marked:', record);

        res.status(201).json({
            success: true,
            message: `Attendance marked for ${students.length} student(s)`,
            record: {
                _id: record._id,
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
