const mongoose = require('mongoose');

const questionSchema = new mongoose.Schema({
  questionText: { type: String, required: true },
  options: [{ type: String }], // Only for multiple choice
  correctAnswer: { type: String, required: true }, // The reference answer for AI or System check
  points: { type: Number, default: 1 },
  type: { type: String, enum: ['mcq', 'short'], default: 'mcq' }
});

const quizSchema = new mongoose.Schema({
  title: { type: String, required: true, trim: true },
  description: { type: String, default: '' },
  deadline: { type: Date, required: true },
  classIds: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Class', required: true }],
  createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'Teacher', required: true },
  questions: [questionSchema],
  timeLimit: { type: Number, default: 30 }, // duration in minutes
}, { timestamps: true });

module.exports = mongoose.model('Quiz', quizSchema);