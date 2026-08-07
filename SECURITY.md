# Security Considerations

SkillForge AI addresses production security challenges expected in a multi-role EdTech platform.

## Authentication & sessions

| Risk | Mitigation |
|------|------------|
| Credential theft | Passwords hashed with bcrypt (cost factor 10); never returned in API payloads (`toClient` strips `password`) |
| Session hijacking | Short-lived JWT (`JWT_EXPIRES_IN`, default 7d) in an `httpOnly` / `SameSite=Lax` cookie (`sf_session`); not readable by JS |
| XSS token theft | Auth no longer uses `localStorage`; cookie is `httpOnly` |
| Weak / missing secrets | `JWT_SECRET` is required at runtime (no hardcoded fallback). CI uses placeholders only |

## Authorization

| Risk | Mitigation |
|------|------------|
| Privilege escalation | Role checks on every mutating API via `requireRoles` / `requireAuth` |
| Cross-role UI access | Client route guards (`canAccessPath`) + server-side RBAC (defense in depth) |
| Instructor overreach | Course edit scoped to owner (`canEditCourse`); admins override |
| Draft / submission leakage | Unpublished courses visible only to owner instructor or admin; submissions readable by owner student, course instructor, evaluators, or admin |
| Candidate footer overwrite | `PUT /api/candidate` is admin-only |

## Input validation & injection

| Risk | Mitigation |
|------|------------|
| Malicious payloads | Zod schemas on create/update routes (`server/validation.ts`) + Mongoose `runValidators` where applied |
| NoSQL injection | Mongoose schemas + parameterized queries (no raw string concatenation into filters) |
| Log leakage | API logs omit bodies; `sanitizeForLog` redacts passwords, tokens, emails, setup/reset URLs, and submission content |

## Availability & errors

| Risk | Mitigation |
|------|------------|
| DB outage | `withApi` returns `503` with request id when Mongo is unavailable |
| Unhandled exceptions | Centralized API wrapper logs stack + returns safe 500 JSON (no secret dump) |
| Abuse of AI endpoints | AI routes require authenticated roles; AI scores are advisory and do not set official `finalScore` |

## Contingency plan

1. **Rotate** `JWT_SECRET` and clear `sf_session` cookies if a leak is suspected.
2. **Rotate MongoDB Atlas credentials** if any credential file was ever committed; scrub git history (`git filter-repo` / BFG) after rotation.
3. **Revoke** compromised user accounts from Admin → Users; force password reset via email tokens.
4. **Disable** AI features by removing `GEMINI_API_KEY` if the key is exposed; rotate in Google AI Studio.
5. **Restore** MongoDB from Atlas backups if data integrity is impacted.
6. **Monitor** daily `logs/yyyy-mm-dd.log` for anomalous 401/403/500 spikes.

## Deployment hygiene

- Secrets never committed (`.gitignore` covers `.env*`, `atlas-credentials.env`, `*credentials*.env`)
- HTTPS via Vercel edge network
- CI builds without production credentials
- Service worker cache versioned per build to avoid stale privileged UI
