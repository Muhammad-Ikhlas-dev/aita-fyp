const mongoose = require('mongoose');

const classSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
    trim: true,
    maxlength: 255
  },
  subject: {
    type: String,
    trim: true,
    default: ''
  },
  description: {
    type: String,
    trim: true,
    default: ''
  },
  cover: {
    type: String,
    default: null
  },
  scheduleSlots: {
    type: [
      {
        day: { type: String, trim: true, default: '' },
        time: { type: String, trim: true, default: '' }
      }
    ],
    default: []
  },
  scheduleDay: { type: String, trim: true, default: '' },
  scheduleTime: { type: String, trim: true, default: '' },
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Teacher',
    default: null
  }
}, {
  timestamps: true,
  collection: 'classes'
});

module.exports = mongoose.model('Class', classSchema);
