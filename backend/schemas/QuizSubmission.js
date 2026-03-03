const mongoose = require('mongoose');

const quizSubmissionSchema = new mongoose.Schema({
  quizId: { type: mongoose.Schema.Types.ObjectId, ref: 'Quiz', required: true },
  studentId: { type: mongoose.Schema.Types.ObjectId, ref: 'Student', required: true },
  answers: [{
    questionId: mongoose.Schema.Types.ObjectId,
    studentAnswer: String,
    isCorrect: Boolean, // For MCQs (auto-check)
    aiFeedback: String  // For Short Answers (AI-check)
  }],
  score: { type: Number, default: 0 },
  totalPoints: { type: Number, required: true },
  status: { type: String, enum: ['pending', 'graded'], default: 'pending' },
  submittedAt: { type: Date, default: Date.now }
}, { timestamps: true });

// Prevent multiple attempts if desired
quizSubmissionSchema.index({ quizId: 1, studentId: 1 }, { unique: true });

module.exports = mongoose.model('QuizSubmission', quizSubmissionSchema);