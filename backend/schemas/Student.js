const mongoose = require('mongoose');

const studentSchema = new mongoose.Schema({
  fullName: {
    type: String,
    required: true,
    trim: true,
    maxlength: 255
  },
  email: {
    type: String,
    required: true,
    trim: true,
    lowercase: true,
    unique: true,
    index: true
  },
  password: {
    type: String,
    required: true,
    minlength: 6,
    select: false
  },
  rollNo: {
    type: String,
    required: true,
    trim: true,
    index: true
  },
  photo: {
    type: String,
    default: null
  }
}, {
  timestamps: true,
  collection: 'students'
});

module.exports = mongoose.model('Student', studentSchema);
