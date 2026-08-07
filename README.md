<div align="center">

# SkillForge AI

### AI-Powered Learning Management & Assessment Platform

Build • Learn • Evaluate • Grow with Artificial Intelligence

<p align="center">
  <a href="https://skillforge-ai-h35u.vercel.app">
    <img src="https://img.shields.io/badge/Live-Demo-4CAF50?style=for-the-badge&logo=vercel&logoColor=white" />
  </a>
  <a href="https://github.com/AdarshMalllah07/skillforge-ai">
    <img src="https://img.shields.io/badge/GitHub-Repository-181717?style=for-the-badge&logo=github" />
  </a>
</p>

<p align="center">
An AI-powered Learning Management System that streamlines course creation, student assessments, AI-assisted grading, and role-based learning experiences for modern educational institutions.
</p>

</div>

---

# Overview

SkillForge AI is a full-stack Learning Management System built for the House of EdTech Fullstack Developer assignment. It goes beyond basic CRUD by combining course management, enrollments, submissions, role-scoped dashboards, analytics, invite-based onboarding, and Google Gemini 3.6 Flash for curriculum generation, submission evaluation, and in-course tutoring.

---

# Assignment Alignment

| Requirement | Implementation |
|-------------|----------------|
| **Next.js 16** + TypeScript | App Router, Route Handlers, Turbopack |
| **React.js** | React 19 with Hooks & Context API |
| **Tailwind CSS** | Tailwind CSS 4 + custom UI primitives |
| **PostgreSQL / MongoDB** | MongoDB Atlas via Mongoose 9 |
| **CRUD** | Courses, Users, Assignments, Submissions, Enrollments |
| **Auth & Authorization** | JWT + bcrypt + RBAC (Student / Instructor / Evaluator / Admin) |
| **AI add-on** | Gemini 3.6 Flash — course generation, evaluation, tutor chat |
| **Deployment + CI/CD** | Vercel + GitHub Actions (typecheck, tests, build on Node 20) |
| **Testing** | Vitest — RBAC, JWT, sanitization (`npm test`) |
| **Security write-up** | [SECURITY.md](./SECURITY.md) mitigations & contingency plans |
| **Footer mandate** | Candidate name, GitHub, and LinkedIn links in app footer |

---

# Core Features

## AI-Powered Learning

- AI Curriculum Generator (`/generator`) — modules, lessons, challenges, and rubrics
- AI Assignment Evaluation with multi-rubric scoring
- AI Tutor chat contextualized to each course
- Markdown + syntax-highlighted AI responses

## Public Landing

- Guest-accessible marketing home (`/`) without login
- Sign in / Get started CTAs into auth flows

## Student Portal (`/student`)

- Browse & enroll in published courses
- Assignment submission (code, essay, repo URL, and optional file upload)
- Role-scoped submissions & analytics
- In-course AI learning assistant

## Instructor Portal (`/instructor`)

- Create & manage own courses and assignments
- AI Architect for curriculum generation
- Review submissions with AI-assisted grading
- Course and performance analytics

## Evaluator Portal (`/evaluator`)

- Review student submissions
- AI-assisted evaluation reports
- Assessment analytics

## Admin Panel (`/admin`)

- User management with invite / setup-password emails
- Course, submission, and platform analytics
- Full access across role portals

## Platform UX

- Light / dark / system theme preferences
- Collapsible sidebar, responsive shell (Topbar + MobileDrawer)
- PWA manifest + build-versioned service worker caching
- Structured daily API/email logs under `logs/`

---

# Live Project

**Live Application:** https://skillforge-ai-h35u.vercel.app

**GitHub Repository:** https://github.com/AdarshMalllah07/skillforge-ai

---

# Technology Stack

| Layer | Technologies |
|--------|--------------|
| Framework | **Next.js 16** (App Router) + TypeScript |
| UI | React 19, Tailwind CSS 4, Geist, Motion, Lucide, Recharts |
| API | Next.js Route Handlers (`app/api/*`) + `withApi` wrapper |
| Database | MongoDB + Mongoose |
| Authentication | JWT + bcryptjs |
| AI | Google Gemini 3.6 Flash (`@google/genai`) |
| Email | Nodemailer (password reset, invites, setup links) |
| PWA | `manifest.webmanifest` + generated `public/sw.js` |
| Deployment | Vercel |
| CI/CD | GitHub Actions (Node 20) |

---

# System Architecture

```
                 Browser (React 19 + Tailwind + PWA)

                            │

                   Next.js 16 App Router

              ┌─────────────┼─────────────┐
         Pages / SSR    API Routes     Client RBAC
              │             │           (AppShell)
              └─────────────┼──────────────┘
                            │
              ┌─────────────┼─────────────┐
         JWT Auth      withApi + Logs    Gemini 3.6 Flash
         + Email       Business Logic    (generate / evaluate / tutor)
              └─────────────┼─────────────┘
                            │
                      MongoDB Atlas
```

---

# Authentication & Authorization

- httpOnly session cookie (`sf_session`) with signed JWT
- Optional `Authorization: Bearer …` accepted for tooling/tests
- Secure password hashing (bcrypt)
- Mongo-backed rate limits on login, register, forgot-password, and AI routes
- Role-based access on API routes (`requireAuth` / `requireRoles` in `server/middleware/auth.ts`)
- Client route guards via `src/lib/routes.ts` + `canAccessPath`
- Auth flows: register, login, logout, forgot/reset password, admin invite → setup password
- Super admin can sign in with username `admin` or configured email
- AI evaluation requires a stored `submissionId`; content is loaded from the database (not client-supplied payloads)

---

# User Roles

| Role | Home | Permissions |
|------|------|-------------|
| Student | `/student` | Enroll, submit, AI tutor, personal analytics |
| Instructor | `/instructor` | Own courses, AI generator, grade, analytics |
| Evaluator | `/evaluator` | Review & grade submissions, analytics |
| Admin | `/admin` | Users, courses, submissions, full platform |

Legacy paths `/submissions` and `/analytics` redirect to the role-scoped equivalents.

---

# Project Structure

```
app/                    # Next.js App Router (pages + API)
├── api/                # REST route handlers
│   ├── auth/           # login, register, me, password flows, avatar
│   ├── ai/             # generate-course, evaluate-submission, tutor-chat
│   ├── courses/        # courses, assignments, enroll, enrollments
│   ├── submissions/
│   ├── users/
│   ├── enrollments/
│   ├── candidate/
│   └── health/
├── admin|student|instructor|evaluator/   # role portals
├── courses/            # catalog + detail + submit
├── generator/          # AI curriculum architect
├── login|signup|forgot-password|reset-password|setup-password/
└── …

lib/server/             # withApi wrapper, ensure-db
server/                 # models, auth, email, db, seed, logger, uploads
src/
├── components/         # dashboards, UI, nav, auth pages
├── lib/                # auth/appData/preferences contexts, api, permissions, routes
└── types.ts

scripts/                # service worker generation
.github/workflows/      # CI/CD
public/                 # assets, uploads, sw.js, manifest
logs/                   # daily runtime logs (gitignored)
```

---

# API Overview

| Endpoint | Description |
|----------|-------------|
| `/api/auth/login` · `/register` · `/logout` | Sign in / sign up / sign out |
| `/api/auth/me` · `/me/avatar` | Current user profile & avatar |
| `/api/auth/forgot-password` · `/reset-password` · `/change-password` | Password flows |
| `/api/users` · `/api/users/[id]` | User CRUD (admin) |
| `/api/users/[id]/resend-setup` | Resend invite / setup email |
| `/api/courses` · `/api/courses/[id]` | Course CRUD |
| `/api/courses/[id]/assignments` | Assignment CRUD |
| `/api/courses/[id]/enroll` · `/enrollments` | Enrollment |
| `/api/enrollments/me` | Current user’s enrollments |
| `/api/submissions` · `/api/submissions/[id]` | Submissions + grading |
| `/api/ai/generate-course` | Gemini curriculum generation |
| `/api/ai/evaluate-submission` | Gemini rubric evaluation (requires stored submission) |
| `/api/ai/tutor-chat` | Gemini course tutor |
| `/api/candidate` | Footer candidate profile |
| `/api/health` | Health check |

---

# Security

- JWT in httpOnly cookies (configurable expiry); `JWT_SECRET` required
- Password hashing (bcrypt)
- Role checks on mutating / sensitive routes; draft course & submission reads scoped
- Zod validation on create/update payloads
- Rate limits on auth and AI endpoints (`server/rateLimit.ts`)
- AI evaluate bound to stored submissions; advisory scores only (no auto `finalScore`)
- Durable uploads via Vercel Blob when `BLOB_READ_WRITE_TOKEN` is set
- Secrets via environment variables (never committed)
- API logs omit bodies; emails, tokens, and reset/setup links are redacted
- Secure MongoDB connection string

Full mitigation strategies and contingency plans: [SECURITY.md](./SECURITY.md)

---

# Testing

| Layer | Tooling |
|-------|---------|
| Unit / integration | Vitest (`npm test`) |
| Coverage | RBAC permissions, JWT + required secret, Zod validation, rate limits, AI eval access, upload store selection, log redaction |
| CI | GitHub Actions: typecheck → tests → production build on push/PR to `main` |

```bash
npm test
```

---

# Real-World Considerations

- **Scalability:** Stateless JWT + MongoDB; serverless-friendly Route Handlers on Vercel
- **Error Handling:** Centralized `withApi` wrapper, client `ErrorBoundary`, structured logs in `logs/yyyy-mm-dd.log` (auto-prune after 14 days)
- **Performance:** App Router code splitting, Turbopack in dev, skeleton loading states, build-versioned service worker
- **Email:** Optional SMTP (`SMTP_ENABLE`); when disabled, reset/invite links are logged to the server console
- **Security:** RBAC on API + client route guards; secrets never committed

---

# Getting Started

## Prerequisites

- Node.js **20.9+** (required by Next.js 16)
- MongoDB (local or Atlas)
- Gemini API key (for AI features)
- Optional: SMTP credentials for invite / password emails

## Clone & Install

```bash
git clone https://github.com/AdarshMalllah07/skillforge-ai.git
cd skillforge-ai
npm install
```

## Configure Environment

Copy `.env.example` to `.env` and fill in values:

```env
MONGODB_URI=mongodb://127.0.0.1:27017/edtech_matrix
JWT_SECRET=change_me_in_production
JWT_EXPIRES_IN=7d
PORT=3000
APP_URL=http://localhost:3000
GEMINI_API_KEY=

# Production uploads on Vercel (leave unset locally → public/uploads)
# BLOB_READ_WRITE_TOKEN=

# Email (optional for local — set SMTP_ENABLE=false to log links to console)
SMTP_ENABLE=false
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER_EMAIL=
SMTP_PASS=
SMTP_FROM=

# Optional override for super admin email (defaults to SMTP_USER_EMAIL or admin@localhost)
# ADMIN_EMAIL=you@example.com
```

## Seed Super Admin

```bash
npm run seed
# or
npm run create-super-admin
```

## Development

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

## Production

```bash
npm run build
npm start
```

---

# Scripts

| Command | Description |
|----------|-------------|
| `npm run dev` | Dev server (predev regenerates service worker) |
| `npm run build` | Production build (prebuild regenerates SW) |
| `npm start` | Start production server |
| `npm run lint` | TypeScript type check (`tsc --noEmit`) |
| `npm test` | Vitest unit / integration suite |
| `npm run seed` | Ensure super admin exists |
| `npm run create-super-admin` | Same as seed (admin only) |
| `npm run generate-sw` | Regenerate `public/sw.js` cache version |
| `npm run clean` | Remove `.next` / `dist` |

---

# Default Admin Credentials

| Login | Password |
|-------|----------|
| `admin` (or admin email from `ADMIN_EMAIL` / `SMTP_USER_EMAIL`) | `Password@12345` |

> Change the default password immediately after first login in production.

---

# Author

## Adarsh Mallah

Full Stack Developer passionate about building scalable, secure, and AI-powered web applications.

- **GitHub:** https://github.com/AdarshMalllah07
- **LinkedIn:** https://www.linkedin.com/in/adarsh-mallah-011279312/

---

<div align="center">

Made with Next.js 16, React 19, MongoDB & Google Gemini 3.6 Flash

</div>
