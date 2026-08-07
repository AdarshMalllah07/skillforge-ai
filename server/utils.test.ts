import { describe, expect, it } from 'vitest';
import { newId, slugify, toClient } from './utils';

describe('server utils', () => {
  it('slugifies titles for URL-safe course identifiers', () => {
    expect(slugify('Full Stack With Next.js 16!')).toBe('full-stack-with-next-js-16');
    expect(slugify('  Hello World  ')).toBe('hello-world');
  });

  it('strips password and maps _id → id for client payloads', () => {
    const client = toClient({
      _id: 'user_1',
      __v: 0,
      name: 'Ada',
      email: 'ada@example.com',
      password: 'secret-hash',
      invitePending: false,
      preferences: { theme: 'dark', sidebarCollapsed: true },
    });

    expect(client.id).toBe('user_1');
    expect(client._id).toBeUndefined();
    expect(client.__v).toBeUndefined();
    expect(client.password).toBeUndefined();
    expect(client.preferences).toEqual({ theme: 'dark', sidebarCollapsed: true });
  });

  it('generates prefixed unique ids', () => {
    const a = newId('course');
    const b = newId('course');
    expect(a).toMatch(/^course_\d+_[a-z0-9]+$/);
    expect(a).not.toBe(b);
  });
});
