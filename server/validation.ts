import { z } from 'zod';

export const userRoles = ['STUDENT', 'INSTRUCTOR', 'EVALUATOR', 'ADMIN'] as const;
export const courseLevels = ['BEGINNER', 'INTERMEDIATE', 'ADVANCED'] as const;
export const courseStatuses = ['DRAFT', 'PUBLISHED', 'ARCHIVED'] as const;
export const assignmentTypes = ['CODE', 'ESSAY', 'PROJECT'] as const;
export const submissionStatuses = ['PENDING', 'AI_EVALUATED', 'GRADED', 'REJECTED'] as const;

const optionalUrl = z
  .string()
  .trim()
  .url()
  .or(z.literal(''))
  .optional();

export const candidateUpdateSchema = z
  .object({
    name: z.string().trim().min(1).max(120).optional(),
    email: z.string().trim().email().optional(),
    githubProfile: optionalUrl,
    linkedInProfile: optionalUrl,
    portfolioWebsite: optionalUrl,
    assignmentTitle: z.string().trim().max(200).optional(),
    companyName: z.string().trim().max(200).optional(),
    submissionDate: z.string().trim().max(40).optional(),
  })
  .strict();

export const userCreateSchema = z
  .object({
    name: z.string().trim().min(1).max(120),
    email: z.string().trim().email(),
    role: z.enum(userRoles),
    title: z.string().trim().max(200).optional(),
    bio: z.string().trim().max(2000).optional(),
    skills: z.array(z.string().trim().max(80)).max(40).optional(),
    avatar: z.string().trim().url().optional(),
    githubUrl: optionalUrl,
    linkedInUrl: optionalUrl,
    password: z.string().min(6).max(128).optional(),
  })
  .strict();

export const userUpdateSchema = z
  .object({
    name: z.string().trim().min(1).max(120).optional(),
    email: z.string().trim().email().optional(),
    role: z.enum(userRoles).optional(),
    title: z.string().trim().max(200).optional(),
    bio: z.string().trim().max(2000).optional(),
    skills: z.array(z.string().trim().max(80)).max(40).optional(),
    avatar: z.string().trim().url().optional(),
    githubUrl: optionalUrl,
    linkedInUrl: optionalUrl,
    password: z.string().min(6).max(128).optional(),
  })
  .strict();

const rubricSchema = z.object({
  id: z.string().optional(),
  title: z.string().trim().min(1).max(200),
  description: z.string().trim().max(1000).optional().default(''),
  maxPoints: z.number().min(0).max(1000),
});

export const assignmentCreateSchema = z
  .object({
    title: z.string().trim().min(1).max(200),
    description: z.string().trim().max(5000).optional().default(''),
    type: z.enum(assignmentTypes).optional().default('CODE'),
    programmingLanguage: z.string().trim().max(40).optional(),
    starterCode: z.string().max(100_000).optional(),
    maxScore: z.number().min(1).max(1000).optional().default(100),
    dueDate: z.string().trim().min(1).optional(),
    rubrics: z.array(rubricSchema).max(20).optional(),
  })
  .strict();

export const assignmentUpdateSchema = assignmentCreateSchema.partial().strict();

export const courseCreateSchema = z
  .object({
    title: z.string().trim().min(1).max(200),
    description: z.string().trim().min(1).max(10_000),
    category: z.string().trim().max(120).optional(),
    level: z.enum(courseLevels).optional(),
    thumbnail: z.string().trim().url().optional(),
    status: z.enum(courseStatuses).optional(),
    modules: z.array(z.record(z.string(), z.unknown())).optional(),
    assignments: z.array(z.record(z.string(), z.unknown())).optional(),
  })
  .strict();

export const courseUpdateSchema = z
  .object({
    title: z.string().trim().min(1).max(200).optional(),
    description: z.string().trim().min(1).max(10_000).optional(),
    category: z.string().trim().max(120).optional(),
    level: z.enum(courseLevels).optional(),
    thumbnail: z.string().trim().url().optional(),
    status: z.enum(courseStatuses).optional(),
    modules: z.array(z.record(z.string(), z.unknown())).optional(),
    assignments: z.array(z.record(z.string(), z.unknown())).optional(),
    rating: z.number().min(0).max(5).optional(),
  })
  .strict();

export const submissionCreateSchema = z
  .object({
    assignmentId: z.string().trim().min(1),
    assignmentTitle: z.string().trim().max(200).optional(),
    courseId: z.string().trim().min(1).optional(),
    courseTitle: z.string().trim().max(200).optional(),
    codeContent: z.string().max(200_000).optional(),
    essayContent: z.string().max(100_000).optional(),
    repositoryUrl: optionalUrl,
    maxScore: z.number().min(1).max(1000).optional(),
  })
  .strict()
  .refine(
    (data) => Boolean(data.codeContent?.trim() || data.essayContent?.trim() || data.repositoryUrl),
    { message: 'Assignment ID and submission content are required' }
  );

export const submissionGradeSchema = z
  .object({
    finalScore: z.number().min(0).max(1000).optional(),
    instructorFeedback: z.string().max(10_000).optional(),
    status: z.enum(submissionStatuses).optional(),
    aiEvaluation: z.record(z.string(), z.unknown()).optional(),
  })
  .strict();

export function parseBody<T>(schema: z.ZodType<T>, data: unknown): { data: T } | { error: string } {
  const result = schema.safeParse(data);
  if (!result.success) {
    const message = result.error.issues.map((issue) => issue.message).join('; ') || 'Invalid request';
    return { error: message };
  }
  return { data: result.data };
}
