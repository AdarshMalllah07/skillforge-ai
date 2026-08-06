import mongoose, { Schema } from 'mongoose';
import { UserRole } from '../types';

export type ThemePreference = 'light' | 'dark' | 'system';

export interface IUserPreferences {
  theme: ThemePreference;
  sidebarCollapsed: boolean;
}

export interface IUser {
  _id: string;
  name: string;
  email: string;
  password: string;
  role: UserRole;
  avatar: string;
  title?: string;
  bio?: string;
  skills?: string[];
  githubUrl?: string;
  linkedInUrl?: string;
  /** True when admin provisioned the account without a password (setup email pending). */
  invitePending?: boolean;
  preferences?: IUserPreferences;
  createdAt?: Date;
  updatedAt?: Date;
}

const preferencesSchema = new Schema(
  {
    theme: {
      type: String,
      enum: ['light', 'dark', 'system'],
      default: 'system',
    },
    sidebarCollapsed: { type: Boolean, default: false },
  },
  { _id: false }
);

const userSchema = new Schema(
  {
    _id: { type: String, required: true },
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true, lowercase: true, trim: true },
    password: { type: String, required: true },
    role: {
      type: String,
      enum: ['STUDENT', 'INSTRUCTOR', 'EVALUATOR', 'ADMIN'],
      required: true,
      default: 'STUDENT',
    },
    avatar: {
      type: String,
      default: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=250&q=80',
    },
    title: String,
    bio: String,
    skills: [String],
    githubUrl: String,
    linkedInUrl: String,
    invitePending: { type: Boolean, default: false },
    preferences: {
      type: preferencesSchema,
      default: () => ({ theme: 'system', sidebarCollapsed: false }),
    },
  },
  { timestamps: true }
);

userSchema.index({ role: 1 });

export const User =
  (mongoose.models.User as mongoose.Model<IUser>) || mongoose.model<IUser>('User', userSchema);

// Repair stale Next.js model cache that predates invitePending / preferences
if (!User.schema.path('invitePending')) {
  User.schema.add({ invitePending: { type: Boolean, default: false } });
}
if (!User.schema.path('preferences')) {
  User.schema.add({
    preferences: {
      type: preferencesSchema,
      default: () => ({ theme: 'system', sidebarCollapsed: false }),
    },
  });
}
