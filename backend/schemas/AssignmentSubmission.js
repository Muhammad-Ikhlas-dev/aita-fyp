const mongoose = require('mongoose');

const aiGradeSchema = new mongoose.Schema(
  {
    score: { type: Number, default: null },
    feedback: { type: String, default: null },
  },
  { _id: false }
);

const assignmentSubmissionSchema = new mongoose.Schema(
  {
    assignmentId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Assignment',
      required: true,
      index: true,
    },
    studentId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Student',
      required: true,
      index: true,
    },
    filePath: {
      type: String,
      required: true,
      trim: true,
    },
    originalName: {
      type: String,
      required: true,
      trim: true,
    },
    mimeType: {
      type: String,
      default: null,
    },
    submittedAt: {
      type: Date,
      default: Date.now,
    },
    gradingStatus: {
      type: String,
      enum: ['pending', 'graded', 'failed'],
      default: 'pending',
    },
    aiGrade: {
      type: aiGradeSchema,
      default: () => ({ score: null, feedback: null }),
    },
  },
  {
    timestamps: true,
    collection: 'assignment_submissions',
  }
);

// One submission per student per assignment
assignmentSubmissionSchema.index({ assignmentId: 1, studentId: 1 }, { unique: true });

module.exports = mongoose.model('AssignmentSubmission', assignmentSubmissionSchema);
