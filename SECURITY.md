# Security Considerations

SkillForge AI addresses production security challenges expected in a multi-role EdTech platform.

## Authentication & sessions

| Risk | Mitigation |
|------|------------|
| Credential theft | Passwords hashed with bcrypt (cost factor 10); never returned in API payloads (`toClient` strips `password`) |
| Session hijacking | Short-lived JWT (`JWT_EXPIRES_IN`, default 7d) in an `httpOnly` / `SameSite=Lax` cookie (`sf_session`); not readable by JS |
| XSS token theft | Auth no longer uses `localStorage`; cookie is `httpOnly` |
| Weak / missing secrets | `JWT_SECRET` is required at runtime (no hardcoded fallback). CI uses placeholders only |
| Auth / reset abuse | Mongo-backed rate limits on login, register, and forgot-password |

## Authorization

| Risk | Mitigation |
|------|------------|
| Privilege escalation | Role checks on every mutating API via `requireRoles` / `requireAuth` |
| Cross-role UI access | Client route guards (`canAccessPath`) + server-side RBAC (defense in depth) |
| Instructor overreach | Course edit scoped to owner (`canEditCourse`); admins override |
| Draft / submission leakage | Unpublished courses visible only to owner instructor or admin; submissions readable by owner student, course instructor, evaluators, or admin |
| Candidate footer overwrite | `PUT /api/candidate` is admin-only |
| AI cost abuse | Evaluate requires a stored `submissionId`; prompt content is loaded from DB; AI routes are rate-limited per user |

## Input validation & injection

| Risk | Mitigation |
|------|------------|
| Malicious payloads | Zod schemas on create/update routes (`server/validation.ts`) + Mongoose `runValidators` where applied |
| NoSQL injection | Mongoose schemas + parameterized queries (no raw string concatenation into filters) |
| Log leakage | API logs omit bodies; `sanitizeForLog` redacts passwords, tokens, emails, setup/reset URLs, and submission content; daily logs retained 14 days |

## Uploads

| Risk | Mitigation |
|------|------------|
| Ephemeral `/tmp` on Vercel | Production uploads use Vercel Blob (`BLOB_READ_WRITE_TOKEN`); local/dev writes under `public/uploads` |
| Type / size abuse | MIME and extension allow-lists; avatar ≤5MB; submission attachment ≤10MB |

## Availability & errors

| Risk | Mitigation |
|------|------------|
| DB outage | `withApi` returns `503` with request id when Mongo is unavailable |
| Unhandled exceptions | Centralized API wrapper logs stack + returns safe 500 JSON (no secret dump) |
| Abuse of AI endpoints | Authenticated roles + per-user rate limits; evaluation bound to stored submissions; AI scores are advisory and do not set official `finalScore` |

## Credential incident response (Atlas / secrets in git)

If MongoDB (or other) credentials were ever committed (e.g. historical `atlas-credentials.env`):

1. **Rotate** the Atlas database user password immediately in the Atlas UI.
2. **Update** `MONGODB_URI` in local `.env` and Vercel project environment variables.
3. **Scrub history** so the secret is not recoverable from old commits:
   ```bash
   # Example with git-filter-repo (destructive; coordinate with the team first)
   git filter-repo --path atlas-credentials.env --invert-paths
   ```
   Or use BFG Repo-Cleaner equivalently.
4. **Force-push** only after team agreement (`git push --force-with-lease`).
5. **Redeploy** so all runtimes pick up the new URI.
6. Confirm `.gitignore` continues to ignore `.env*`, `atlas-credentials.env`, and `*credentials*.env`.

## Contingency plan

1. **Rotate** `JWT_SECRET` and clear `sf_session` cookies if a leak is suspected.
2. **Rotate MongoDB Atlas credentials** if any credential file was ever committed; scrub git history (`git filter-repo` / BFG) after rotation (see above).
3. **Revoke** compromised user accounts from Admin → Users; force password reset via email tokens.
4. **Disable** AI features by removing `GEMINI_API_KEY` if the key is exposed; rotate in Google AI Studio.
5. **Restore** MongoDB from Atlas backups if data integrity is impacted.
6. **Monitor** daily `logs/yyyy-mm-dd.log` for anomalous 401/403/429/500 spikes; delete local logs that predate sanitization if they contain PII.

## Deployment hygiene

- Secrets never committed (`.gitignore` covers `.env*`, `atlas-credentials.env`, `*credentials*.env`)
- HTTPS via Vercel edge network
- Production file uploads via Vercel Blob (`BLOB_READ_WRITE_TOKEN`)
- CI builds without production credentials
- Service worker cache versioned per build to avoid stale privileged UI
