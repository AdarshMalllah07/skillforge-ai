export type UserRole = 'STUDENT' | 'INSTRUCTOR' | 'EVALUATOR' | 'ADMIN';

export type ThemePreference = 'light' | 'dark' | 'system';

export interface UserPreferences {
  theme: ThemePreference;
  sidebarCollapsed: boolean;
}

export const DEFAULT_USER_PREFERENCES: UserPreferences = {
  theme: 'system',
  sidebarCollapsed: false,
};

export interface User {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  avatar: string;
  title?: string;
  bio?: string;
  skills?: string[];
  githubUrl?: string;
  linkedInUrl?: string;
  invitePending?: boolean;
  preferences?: UserPreferences;
  createdAt?: string;
}

export interface RubricCriteria {
  id: string;
  title: string;
  description: string;
  maxPoints: number;
}

export interface Lesson {
  id: string;
  title: string;
  content: string;
  durationMinutes: number;
  type: 'TEXT' | 'VIDEO' | 'EXERCISE';
  videoUrl?: string;
}

export interface Module {
  id: string;
  title: string;
  description: string;
  lessons: Lesson[];
}

export interface Assignment {
  id: string;
  courseId: string;
  title: string;
  description: string;
  type: 'CODE' | 'ESSAY' | 'PROJECT';
  programmingLanguage?: string;
  starterCode?: string;
  testCases?: { input: string; expectedOutput: string; isHidden?: boolean }[];
  maxScore: number;
  dueDate: string;
  rubrics: RubricCriteria[];
}

export interface Course {
  id: string;
  title: string;
  slug: string;
  description: string;
  category: string; // e.g., 'Next.js & Frontend', 'Backend & Node.js', 'Databases & System Design'
  level: 'BEGINNER' | 'INTERMEDIATE' | 'ADVANCED';
  instructorId: string;
  instructorName: string;
  thumbnail: string;
  status: 'DRAFT' | 'PUBLISHED' | 'ARCHIVED';
  modules: Module[];
  assignments: Assignment[];
  createdAt: string;
  updatedAt: string;
  enrolledStudentsCount: number;
  rating: number;
}

export interface RubricEvaluationScore {
  rubricId: string;
  rubricTitle: string;
  score: number;
  maxPoints: number;
  feedback: string;
}

export interface AIEvaluationResult {
  overallScore: number;
  maxScore: number;
  summary: string;
  strengths: string[];
  areasForImprovement: string[];
  securityAndBestPractices: string[];
  rubricScores: RubricEvaluationScore[];
  suggestedGrade: 'PASS' | 'NEEDS_REVISION' | 'FAIL';
  reviewedAt: string;
}

export interface Submission {
  id: string;
  assignmentId: string;
  assignmentTitle: string;
  courseId: string;
  courseTitle: string;
  studentId: string;
  studentName: string;
  studentEmail: string;
  submittedAt: string;
  codeContent?: string;
  essayContent?: string;
  repositoryUrl?: string;
  attachmentUrl?: string;
  attachmentName?: string;
  status: 'PENDING' | 'AI_EVALUATED' | 'GRADED' | 'REJECTED';
  aiEvaluation?: AIEvaluationResult;
  instructorFeedback?: string;
  finalScore?: number;
  maxScore: number;
}

export interface CandidateInfo {
  name: string;
  email: string;
  githubProfile: string;
  linkedInProfile: string;
  portfolioWebsite?: string;
  assignmentTitle: string;
  companyName: string;
  submissionDate: string;
}

export interface FilterOptions {
  search: string;
  category: string;
  level: string;
  status: string;
}
