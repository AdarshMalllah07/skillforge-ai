import mongoose, { Schema } from 'mongoose';

const rubricSchema = new Schema(
  {
    id: String,
    title: String,
    description: String,
    maxPoints: Number,
  },
  { _id: false }
);

const lessonSchema = new Schema(
  {
    id: String,
    title: String,
    content: String,
    durationMinutes: Number,
    type: { type: String, enum: ['TEXT', 'VIDEO', 'EXERCISE'] },
    videoUrl: String,
  },
  { _id: false }
);

const moduleSchema = new Schema(
  {
    id: String,
    title: String,
    description: String,
    lessons: [lessonSchema],
  },
  { _id: false }
);

const assignmentSchema = new Schema(
  {
    id: String,
    courseId: String,
    title: String,
    description: String,
    type: { type: String, enum: ['CODE', 'ESSAY', 'PROJECT'] },
    programmingLanguage: String,
    starterCode: String,
    testCases: [
      {
        input: String,
        expectedOutput: String,
        isHidden: Boolean,
      },
    ],
    maxScore: { type: Number, default: 100 },
    dueDate: String,
    rubrics: [rubricSchema],
  },
  { _id: false }
);

const courseSchema = new Schema(
  {
    _id: { type: String, required: true },
    title: { type: String, required: true },
    slug: { type: String, required: true },
    description: { type: String, required: true },
    category: { type: String, default: 'General Tech' },
    level: {
      type: String,
      enum: ['BEGINNER', 'INTERMEDIATE', 'ADVANCED'],
      default: 'INTERMEDIATE',
    },
    instructorId: { type: String, required: true },
    instructorName: { type: String, required: true },
    thumbnail: {
      type: String,
      default: 'https://images.unsplash.com/photo-1516321318423-f06f85e504b3?auto=format&fit=crop&w=600&q=80',
    },
    status: {
      type: String,
      enum: ['DRAFT', 'PUBLISHED', 'ARCHIVED'],
      default: 'DRAFT',
    },
    modules: { type: [moduleSchema], default: [] },
    assignments: { type: [assignmentSchema], default: [] },
    enrolledStudentsCount: { type: Number, default: 0 },
    rating: { type: Number, default: 5 },
  },
  { timestamps: true }
);

courseSchema.index({ category: 1, level: 1, status: 1 });
courseSchema.index({ title: 'text', description: 'text', category: 'text' });

export const Course = mongoose.models.Course || mongoose.model('Course', courseSchema);
