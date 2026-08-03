import mongoose, { Schema } from 'mongoose';

const submissionSchema = new Schema(
  {
    _id: { type: String, required: true },
    assignmentId: { type: String, required: true },
    assignmentTitle: { type: String, required: true },
    courseId: { type: String, required: true },
    courseTitle: { type: String, required: true },
    studentId: { type: String, required: true },
    studentName: { type: String, required: true },
    studentEmail: { type: String, required: true },
    submittedAt: { type: Date, default: Date.now },
    codeContent: String,
    essayContent: String,
    repositoryUrl: String,
    status: {
      type: String,
      enum: ['PENDING', 'AI_EVALUATED', 'GRADED', 'REJECTED'],
      default: 'PENDING',
    },
    aiEvaluation: { type: Schema.Types.Mixed },
    instructorFeedback: String,
    finalScore: Number,
    maxScore: { type: Number, default: 100 },
  },
  { timestamps: true }
);

submissionSchema.index({ studentId: 1 });
submissionSchema.index({ courseId: 1 });
submissionSchema.index({ status: 1 });

export const Submission = mongoose.model('Submission', submissionSchema);
