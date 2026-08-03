# SkillForge AI

Full-stack AI assessment platform with role-based access, course management, Gemini-powered curriculum generation, submission grading, and analytics.

**Live:** [https://skillforge-ai-orpin.vercel.app](https://skillforge-ai-orpin.vercel.app)

## Features

- **RBAC** — `STUDENT`, `INSTRUCTOR`, `EVALUATOR`, `ADMIN` dashboards
- **Courses & enrollments** — catalog, detail views, assignments
- **AI curriculum generator** — Gemini-assisted course creation
- **Submission portal** — student submissions with AI evaluation
- **Analytics** — assessment overview for staff roles
- **Auth** — JWT sessions, registration, profile avatars

## Stack

| Layer | Tech |
| --- | --- |
| Frontend | React 19, Vite 6, Tailwind CSS 4, Motion |
| Backend | Express, TypeScript |
| Database | MongoDB (Mongoose) |
| AI | Google Gemini (`@google/genai`) |
| Deploy | Vercel (Express Fluid Compute) |

## Prerequisites

- Node.js 20+
- MongoDB (local) or [MongoDB Atlas](https://www.mongodb.com/atlas)
- Gemini API key (for AI features)

## Setup

```bash
git clone <repo-url>
cd skillforge-ai
npm install
cp .env.example .env
```

Edit `.env`:

```env
MONGODB_URI=mongodb://127.0.0.1:27017/edtech_matrix
JWT_SECRET=change_me_in_production
JWT_EXPIRES_IN=7d
PORT=3000
GEMINI_API_KEY=your_gemini_api_key
```

For Atlas, use an `mongodb+srv://...` URI and allow your IP (or `0.0.0.0/0` for serverless hosts like Vercel) under **Network Access**.

## Scripts

| Command | Description |
| --- | --- |
| `npm run dev` | Start Express + Vite HMR (local) |
| `npm run build` | Build client + bundle server to `dist/` |
| `npm start` | Run production server from `dist/server.cjs` |
| `npm run lint` | Typecheck with `tsc --noEmit` |
| `npm run create-super-admin` | Ensure bootstrap admin user exists |
| `npm run seed` | Run database seed |
| `npm run clean` | Remove build artifacts |

## Default admin

On first DB connect the app ensures a super admin:

| Field | Value |
| --- | --- |
| Username | `admin` |
| Password | `Password@12345` |

Change this password after first login in production.

## Project structure

```
├── server.ts              # Express entry (API + SPA / Vite middleware)
├── server/
│   ├── db.ts              # MongoDB connection
│   ├── seed.ts            # Admin bootstrap / seed
│   ├── models/            # Mongoose models
│   ├── routes/            # REST API routes
│   ├── middleware/        # Auth / RBAC
│   └── uploads.ts         # Profile image uploads
├── src/                   # React SPA
├── vercel.json            # Vercel Express build config
└── .env.example           # Environment template
```

## API overview

| Prefix | Purpose |
| --- | --- |
| `/api/auth` | Register, login, profile, avatar |
| `/api/users` | Admin user management |
| `/api/courses` | Courses, assignments, enrollments |
| `/api/submissions` | Student submissions & reviews |
| `/api/ai` | Curriculum generation & AI grading |
| `/api/candidate` | Candidate metadata |

## Deploy on Vercel

1. Install / log in to the Vercel CLI: `npm i -g vercel` then `vercel login`
2. Link the project: `vercel link`
3. Set env vars for **Production** (and Preview):

   - `MONGODB_URI` — Atlas URI including DB name, e.g. `...mongodb.net/edtech_matrix`
   - `JWT_SECRET`
   - `JWT_EXPIRES_IN` (optional, default `7d`)
   - `GEMINI_API_KEY`
   - `VERCEL_EXPERIMENTAL_BACKENDS=1` (recommended for Express bundling)

4. In Atlas → **Network Access**, add `0.0.0.0/0` so Vercel can connect.
5. Deploy:

```bash
vercel --prod
```

Build uses `vercel.json`: Vite → `dist/`, then copies into `public/` for the Express function bundle.

## Local production build

```bash
npm run build
NODE_ENV=production npm start
```

## License

Private / proprietary — all rights reserved unless otherwise noted.
