import mongoose, { Schema } from 'mongoose';

const enrollmentSchema = new Schema(
  {
    _id: { type: String, required: true },
    courseId: { type: String, required: true },
    studentId: { type: String, required: true },
    enrolledAt: { type: Date, default: Date.now },
  },
  { timestamps: true }
);

enrollmentSchema.index({ courseId: 1, studentId: 1 }, { unique: true });
enrollmentSchema.index({ studentId: 1 });

export const Enrollment =
  mongoose.models.Enrollment || mongoose.model('Enrollment', enrollmentSchema);
