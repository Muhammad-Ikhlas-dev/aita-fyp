const mongoose = require('mongoose');

const assignmentSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: true,
      trim: true,
      maxlength: 500,
    },
    instructions: {
      type: String,
      default: '',
      trim: true,
    },
    deadline: {
      type: Date,
      required: true,
    },
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Teacher',
      required: true,
    },
    classIds: {
      type: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Class' }],
      default: [],
      required: true,
      validate: {
        validator: function (v) {
          return Array.isArray(v) && v.length > 0;
        },
        message: 'At least one class is required',
      },
    },
    // Uploaded assignment file (pdf, docx, txt, etc.) — stored on server, downloadable
    attachmentPath: { type: String, default: null, trim: true },
    attachmentOriginalName: { type: String, default: null, trim: true },
  },
  {
    timestamps: true,
    collection: 'assignments',
  }
);

module.exports = mongoose.model('Assignment', assignmentSchema);
