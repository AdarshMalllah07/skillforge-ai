import bcrypt from 'bcryptjs';
import { User } from './models/User';

export const SUPER_ADMIN_USERNAME = 'admin';
export const SUPER_ADMIN_PASSWORD = 'Password@12345';

function resolveSuperAdminEmail(): string {
  const fromEnv = (process.env.ADMIN_EMAIL || process.env.SMTP_USER_EMAIL || '')
    .trim()
    .replace(/^['"]|['"]$/g, '');
  if (fromEnv && fromEnv.includes('@')) return fromEnv.toLowerCase();
  return 'admin@localhost';
}

/**
 * Creates the super admin account only if it does not already exist.
 * Does not overwrite an existing admin on every startup.
 */
export async function ensureSuperAdmin(): Promise<void> {
  const adminEmail = resolveSuperAdminEmail();
  const existing =
    (await User.findById('user_admin_1')) ||
    (await User.findOne({ email: SUPER_ADMIN_USERNAME })) ||
    (await User.findOne({ email: adminEmail })) ||
    (await User.findOne({ role: 'ADMIN' }).sort({ createdAt: 1 }));

  if (existing) {
    console.log(
      `Super admin already present — login: ${SUPER_ADMIN_USERNAME} or ${existing.email}`
    );
    return;
  }

  const hashed = await bcrypt.hash(SUPER_ADMIN_PASSWORD, 10);
  await User.create({
    _id: 'user_admin_1',
    name: 'Super Admin',
    email: adminEmail,
    password: hashed,
    role: 'ADMIN',
    title: 'Platform Administrator',
    bio: '',
    skills: [],
  });
  console.log(
    `Super admin created — login: ${SUPER_ADMIN_USERNAME} or ${adminEmail} / ${SUPER_ADMIN_PASSWORD}`
  );
}

/** Startup seed: admin account only. */
export async function seedDatabase(): Promise<void> {
  await ensureSuperAdmin();
}
