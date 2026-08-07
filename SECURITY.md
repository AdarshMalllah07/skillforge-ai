# Security Considerations

SkillForge AI addresses production security challenges expected in a multi-role EdTech platform.

## Authentication & sessions

| Risk | Mitigation |
|------|------------|
| Credential theft | Passwords hashed with bcrypt (cost factor 10); never returned in API payloads (`toClient` strips `password`) |
| Session hijacking | Short-lived JWT (`JWT_EXPIRES_IN`, default 7d); secret stored only in env (`JWT_SECRET`) |
| Weak secrets in prod | Documented in `.env.example`; CI uses placeholders only |

## Authorization

| Risk | Mitigation |
|------|------------|
| Privilege escalation | Role checks on every mutating API via `requireRoles` / `requireAuth` |
| Cross-role UI access | Client route guards (`canAccessPath`) + server-side RBAC (defense in depth) |
| Instructor overreach | Course edit scoped to owner (`canEditCourse`); admins override |

## Input validation & injection

| Risk | Mitigation |
|------|------------|
| Malicious payloads | Required-field checks, password length rules, email normalization |
| NoSQL injection | Mongoose schemas + parameterized queries (no raw string concatenation into filters) |
| Log leakage | `sanitizeForLog` redacts `password`, `token`, `authorization`, etc. |

## Availability & errors

| Risk | Mitigation |
|------|------------|
| DB outage | `withApi` returns `503` with request id when Mongo is unavailable |
| Unhandled exceptions | Centralized API wrapper logs stack + returns safe 500 JSON (no secret dump) |
| Abuse of AI endpoints | AI routes require authenticated roles (instructor/evaluator as applicable) |

## Contingency plan

1. **Rotate** `JWT_SECRET` and invalidate sessions if a leak is suspected.
2. **Revoke** compromised user accounts from Admin → Users; force password reset via email tokens.
3. **Disable** AI features by removing `GEMINI_API_KEY` if the key is exposed; rotate in Google AI Studio.
4. **Restore** MongoDB from Atlas backups if data integrity is impacted.
5. **Monitor** daily `logs/yyyy-mm-dd.log` for anomalous 401/403/500 spikes.

## Deployment hygiene

- Secrets never committed (`.gitignore` covers `.env*`)
- HTTPS via Vercel edge network
- CI builds without production credentials
- Service worker cache versioned per build to avoid stale privileged UI
