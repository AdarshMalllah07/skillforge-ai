import { describe, expect, it } from 'vitest';
import {
  assignmentCreateSchema,
  candidateUpdateSchema,
  courseUpdateSchema,
  parseBody,
  submissionCreateSchema,
  userUpdateSchema,
} from './validation';

describe('request validation (zod)', () => {
  it('rejects unknown fields on user update', () => {
    const result = parseBody(userUpdateSchema, { name: 'Ada', role: 'SUPERADMIN' });
    expect(result).toHaveProperty('error');
  });

  it('accepts valid user updates', () => {
    const result = parseBody(userUpdateSchema, {
      name: 'Ada Lovelace',
      role: 'INSTRUCTOR',
      bio: 'Math & machines',
    });
    expect(result).toHaveProperty('data');
  });

  it('requires assignment title on create', () => {
    const result = parseBody(assignmentCreateSchema, { description: 'no title' });
    expect(result).toHaveProperty('error');
  });

  it('accepts assignment create payloads', () => {
    const result = parseBody(assignmentCreateSchema, {
      title: 'Build an auth middleware',
      type: 'CODE',
      maxScore: 100,
    });
    expect(result).toHaveProperty('data');
  });

  it('rejects invalid course status', () => {
    const result = parseBody(courseUpdateSchema, { status: 'LIVE' });
    expect(result).toHaveProperty('error');
  });

  it('requires submission content', () => {
    const result = parseBody(submissionCreateSchema, { assignmentId: 'assign_1' });
    expect(result).toHaveProperty('error');
  });

  it('accepts candidate updates with urls', () => {
    const result = parseBody(candidateUpdateSchema, {
      name: 'Candidate',
      githubProfile: 'https://github.com/example',
      linkedInProfile: 'https://www.linkedin.com/in/example',
    });
    expect(result).toHaveProperty('data');
  });
});
