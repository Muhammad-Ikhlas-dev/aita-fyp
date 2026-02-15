// models/LabeledImage.js
const mongoose = require('mongoose');

const labeledImageSchema = new mongoose.Schema({
  // Put fields that make sense for your face recognition / attendance system
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
    required: true  // e.g. '/labeled_images/user123_label.jpg'
  },
  label: {
    type: String,
    required: true,          // e.g. "Muhammad", "Student001", etc.
    index: true              // good for fast lookups by name/ID
  },
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',             // if you have users collection later
    required: false
  },
  uploadedAt: {
    type: Date,
    default: Date.now
  },
  size: {
    type: Number             // in bytes
  },
  mimeType: {
    type: String             // e.g. "image/jpeg"
  },
  // Optional: if you're storing embeddings (face vectors)
  embedding: {
    type: [Number],          // array of numbers (e.g. 128 or 512-dim vector)
    required: false
  }
}, {
  timestamps: true           // auto adds createdAt & updatedAt
});

// Create and export the model
// Mongoose will use "labeled_images" as collection name (pluralized lowercase)
module.exports = mongoose.model('LabeledImage', labeledImageSchema);