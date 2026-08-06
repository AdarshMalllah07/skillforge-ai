import mongoose, { Schema } from 'mongoose';

export type PasswordTokenType = 'RESET' | 'SETUP';

export interface IPasswordToken {
  _id: string;
  userId: string;
  tokenHash: string;
  type: PasswordTokenType;
  expiresAt: Date;
  usedAt?: Date | null;
  createdAt?: Date;
  updatedAt?: Date;
}

const passwordTokenSchema = new Schema(
  {
    _id: { type: String, required: true },
    userId: { type: String, required: true, index: true },
    tokenHash: { type: String, required: true },
    type: { type: String, enum: ['RESET', 'SETUP'], required: true },
    expiresAt: { type: Date, required: true },
    usedAt: { type: Date, default: null },
  },
  { timestamps: true }
);

passwordTokenSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 });
passwordTokenSchema.index({ tokenHash: 1 }, { unique: true });

export const PasswordToken =
  mongoose.models.PasswordToken || mongoose.model('PasswordToken', passwordTokenSchema);
