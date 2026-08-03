import bcrypt from 'bcryptjs';
import { User } from './models/User';
import { Course } from './models/Course';
import { Submission } from './models/Submission';
import { Enrollment } from './models/Enrollment';
import { Candidate } from './models/Candidate';

export const SUPER_ADMIN_USERNAME = 'admin';
export const SUPER_ADMIN_PASSWORD = 'Password@12345';

const DEMO_USER_IDS = ['user_instructor_1', 'user_student_1', 'user_evaluator_1'];
const DEMO_COURSE_IDS = [
  'course_next16_mastery',
  'course_backend_nodejs',
  'course_db_optimization',
];
const DEMO_ENROLLMENT_IDS = ['enroll_alex_next16'];
const DEMO_SUBMISSION_IDS = ['sub_alex_next16'];
const DEMO_CANDIDATE_EMAILS = ['ganeshshivhare6@gmail.com'];

/** Creates or resets the super admin account (username: admin / Password@12345). */
export async function ensureSuperAdmin(): Promise<void> {
  const hashed = await bcrypt.hash(SUPER_ADMIN_PASSWORD, 10);
  const existing =
    (await User.findOne({ email: SUPER_ADMIN_USERNAME })) ||
    (await User.findById('user_admin_1')) ||
    (await User.findOne({ email: 'admin@houseofedtech.com' }));

  if (existing) {
    existing.email = SUPER_ADMIN_USERNAME;
    existing.password = hashed;
    existing.role = 'ADMIN';
    existing.name = 'Super Admin';
    existing.title = 'Platform Administrator';
    existing.bio = '';
    existing.skills = [];
    existing.githubUrl = '';
    existing.linkedInUrl = '';
    await existing.save();
    console.log(`Super admin ready — login: ${SUPER_ADMIN_USERNAME} / ${SUPER_ADMIN_PASSWORD}`);
    return;
  }

  await User.create({
    _id: 'user_admin_1',
    name: 'Super Admin',
    email: SUPER_ADMIN_USERNAME,
    password: hashed,
    role: 'ADMIN',
    title: 'Platform Administrator',
    bio: '',
    skills: [],
  });
  console.log(`Super admin created — login: ${SUPER_ADMIN_USERNAME} / ${SUPER_ADMIN_PASSWORD}`);
}

/** Removes previously seeded demo users/courses (keeps only admin bootstrap). */
async function removeDemoSeedData(): Promise<void> {
  const [users, courses, enrollments, submissions, candidates] = await Promise.all([
    User.deleteMany({ _id: { $in: DEMO_USER_IDS } }),
    Course.deleteMany({ _id: { $in: DEMO_COURSE_IDS } }),
    Enrollment.deleteMany({ _id: { $in: DEMO_ENROLLMENT_IDS } }),
    Submission.deleteMany({ _id: { $in: DEMO_SUBMISSION_IDS } }),
    Candidate.deleteMany({ email: { $in: DEMO_CANDIDATE_EMAILS } }),
  ]);

  const removed =
    users.deletedCount +
    courses.deletedCount +
    enrollments.deletedCount +
    submissions.deletedCount +
    candidates.deletedCount;

  if (removed > 0) {
    console.log(`Removed ${removed} demo seed document(s).`);
  }
}

/** On startup: ensure admin only — no default demo users, courses, or submissions. */
export async function seedDatabase(): Promise<void> {
  await ensureSuperAdmin();
  await removeDemoSeedData();
}
