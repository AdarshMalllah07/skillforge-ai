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

SkillForge AI is a full-stack Learning Management System built for the House of EdTech Fullstack Developer assignment. It goes beyond basic CRUD by combining course management, submissions, role-based access, analytics, and Google Gemini AI for curriculum generation and grading assistance.

---

# Assignment Alignment

| Requirement | Implementation |
|-------------|----------------|
| **Next.js 16** + TypeScript | App Router, API routes, SSR/client data fetching |
| **React.js** | React 19 with Hooks & Context API |
| **Tailwind CSS** | Tailwind CSS 4 + custom UI components |
| **PostgreSQL / MongoDB** | MongoDB Atlas via Mongoose |
| **CRUD** | Courses, Users, Assignments, Submissions, Enrollments |
| **Auth & Authorization** | JWT + bcrypt + role-based access (Student / Instructor / Evaluator / Admin) |
| **AI add-on** | Google Gemini — course generation, evaluation, tutor chat |
| **Deployment + CI/CD** | Vercel + GitHub Actions (Node 20) |
| **Footer mandate** | Candidate name, GitHub, and LinkedIn links in app footer |

---

# Core Features

## AI-Powered Learning

- AI Course Generation
- AI Assignment Evaluation
- AI Assisted Grading
- AI Tutor Assistance
- Intelligent Curriculum Planning

## Student Portal

- Secure Authentication
- Browse & Enroll in Courses
- Assignment Submission
- Track Learning Progress
- Personal Dashboard
- AI Learning Assistant

## Instructor Portal

- Create & Manage Courses
- Create Assignments
- AI Generated Course Content
- Student Performance Tracking
- Course Analytics

## Evaluator Portal

- Review Student Submissions
- AI Assisted Evaluation
- Performance Reports
- Assessment Analytics

## Admin Panel

- User Management
- Role Management
- Course Management
- Platform Analytics

---

# Live Project

**Live Application:** https://skillforge-ai-h35u.vercel.app

**GitHub Repository:** https://github.com/AdarshMalllah07/skillforge-ai

---

# Technology Stack

| Layer | Technologies |
|--------|--------------|
| Framework | **Next.js 16** (App Router) + TypeScript |
| UI | React 19, Tailwind CSS 4, Motion, Lucide |
| API | Next.js Route Handlers (`app/api/*`) |
| Database | MongoDB + Mongoose |
| Authentication | JWT + bcryptjs |
| AI | Google Gemini (`@google/genai`) |
| Email | Nodemailer (password reset / invites) |
| Deployment | Vercel |
| CI/CD | GitHub Actions |

---

# System Architecture

```
                 Browser (React 19 + Tailwind)

                            │

                   Next.js 16 App Router

              ┌─────────────┼─────────────┐
         Pages / SSR    API Routes     Middleware
              │             │              │
              └─────────────┼──────────────┘
                            │
              ┌─────────────┼─────────────┐
         JWT Auth      Business Logic    Gemini AI
              └─────────────┼─────────────┘
                            │
                      MongoDB Atlas
```

---

# Authentication & Authorization

- JWT Authentication
- Secure Password Hashing (bcrypt)
- Role-Based Access Control (RBAC)
- Protected API Routes
- Authorization helpers in `server/middleware/auth.ts`

---

# User Roles

| Role | Permissions |
|------|-------------|
| Student | Learn, Submit Assignments, AI Tutor |
| Instructor | Manage Courses, Create Assignments |
| Evaluator | Review & Evaluate Submissions |
| Admin | Complete Platform Management |

---

# Project Structure

```
app/                 # Next.js App Router (pages + API routes)
├── api/             # REST API route handlers
├── admin/           # Admin dashboards
├── student/         # Student dashboards
├── instructor/      # Instructor dashboards
├── evaluator/       # Evaluator dashboards
└── ...

server/              # Shared backend (models, auth, email, db)
├── models/
├── middleware/
├── email/
├── db.ts
└── seed.ts

src/                 # Shared UI + client libs
├── components/
├── lib/
└── types.ts

.github/workflows/   # CI/CD pipeline
```

---

# API Overview

| Endpoint | Description |
|-----------|-------------|
| `/api/auth/*` | Login, register, password flows, profile |
| `/api/users` | User management |
| `/api/courses` | Courses & assignments CRUD |
| `/api/submissions` | Student submissions CRUD |
| `/api/ai/*` | Course generation, evaluation, tutor |
| `/api/candidate` | Candidate footer profile info |
| `/api/health` | Health check |

---

# Security

- JWT Authentication
- Password Hashing
- Input Validation & Sanitization
- Protected Routes / RBAC
- Environment Variables for secrets
- Secure MongoDB connection

---

# Real-World Considerations

- **Scalability:** Stateless JWT auth + MongoDB indexes; API handlers are modular for horizontal scale on Vercel
- **Error Handling:** Centralized `withApi` wrapper, client ErrorBoundary, structured logging to `logs/`
- **Performance:** App Router code splitting, Turbopack (Next 16 default), service worker cache versioning
- **Security:** Role checks on every mutating route; secrets never committed

---

# Getting Started

## Prerequisites

- Node.js **20.9+** (required by Next.js 16)
- MongoDB (local or Atlas)
- Gemini API key (for AI features)

## Clone & Install

```bash
git clone https://github.com/AdarshMalllah07/skillforge-ai.git
cd skillforge-ai
npm install
```

## Configure Environment

Copy `.env.example` to `.env` and fill in values:

```env
MONGODB_URI=
JWT_SECRET=
JWT_EXPIRES_IN=7d
PORT=3000
GEMINI_API_KEY=
APP_URL=http://localhost:3000
```

## Development

```bash
npm run dev
```

## Production

```bash
npm run build
npm start
```

---

# Scripts

| Command | Description |
|----------|-------------|
| `npm run dev` | Development server (Next.js 16 + Turbopack) |
| `npm run build` | Production build |
| `npm start` | Start production server |
| `npm run lint` | TypeScript type check |
| `npm run seed` | Seed database |
| `npm run create-super-admin` | Ensure super admin exists |
| `npm run clean` | Remove `.next` / `dist` |

---

# Default Admin Credentials

| Username | Password |
|----------|----------|
| admin | Password@12345 |

> Change the default password immediately after first login in production.

---

# Author

## Adarsh Mallah

Full Stack Developer passionate about building scalable, secure, and AI-powered web applications.

- **GitHub:** https://github.com/AdarshMalllah07
- **LinkedIn:** https://www.linkedin.com/in/adarsh-mallah-011279312/

---

<div align="center">

Made with Next.js 16, React 19, MongoDB & Google Gemini AI

</div>
