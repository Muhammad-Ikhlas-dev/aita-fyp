const mongoose = require('mongoose');

const studentEntrySchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true
  },
  confidence: {
    type: Number,
    required: true,
    min: 0,
    max: 100
  },
  matched: {
    type: Boolean,
    default: true
  }
}, { _id: false });

const attendanceLogSchema = new mongoose.Schema({
  timestamp: {
    type: Date,
    required: true,
    default: Date.now,
    index: true
  },
  students: {
    type: [studentEntrySchema],
    required: true,
    validate: {
      validator: function (v) {
        return Array.isArray(v) && v.length > 0;
      },
      message: 'At least one student is required'
    }
  },
  count: {
    type: Number,
    required: true,
    min: 0
  }
}, {
  timestamps: true,
  collection: 'attendance_logs'
});

// Keep count in sync with students.length when saving
attendanceLogSchema.pre('save', function () {
  if (this.students && this.students.length > 0) {
    this.count = this.students.length;
  }
});

module.exports = mongoose.model('AttendanceLog', attendanceLogSchema);
