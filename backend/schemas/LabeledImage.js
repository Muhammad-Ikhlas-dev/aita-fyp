const mongoose = require('mongoose');

const labeledImageSchema = new mongoose.Schema({
  filename: {
    type: String,
    required: true,
    trim: true
  },
  originalName: {
    type: String,
    required: true
  },
  path: {
    type: String,
    required: true
  },
  label: {
    type: String,
    required: true,
    trim: true,
    index: true
  },
  classId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Class',
    default: null,
    index: true
  },
  uploadedAt: {
    type: Date,
    default: Date.now
  },
  size: {
    type: Number
  },
  mimeType: {
    type: String
  }
}, {
  timestamps: true,
  collection: 'labeled_images'
});

module.exports = mongoose.model('LabeledImage', labeledImageSchema);