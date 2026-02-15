const mongoose = require('mongoose');

const teacherSchema = new mongoose.Schema({
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
  photo: {
    type: String,
    default: null
  }
}, {
  timestamps: true,
  collection: 'teachers'
});

module.exports = mongoose.model('Teacher', teacherSchema);
