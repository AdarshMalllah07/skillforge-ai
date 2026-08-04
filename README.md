<div align="center">

# ⚔️ SkillForge AI

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

# 📖 Overview

SkillForge AI is a modern Full Stack Learning Management System built to simplify online education using Artificial Intelligence.

The platform enables instructors to create AI-assisted courses, students to learn through an interactive dashboard, evaluators to review submissions efficiently, and administrators to manage the entire learning ecosystem from a single platform.

Unlike traditional LMS platforms, SkillForge AI leverages **Google Gemini AI** to automate curriculum generation, assist in evaluation, and provide intelligent learning support.

---

# ✨ Core Features

## 🤖 AI Powered Learning

- AI Course Generation
- AI Assignment Evaluation
- AI Assisted Grading
- AI Tutor Assistance
- Intelligent Curriculum Planning

---

## 👨‍🎓 Student Portal

- Secure Authentication
- Browse Available Courses
- Course Enrollment
- Assignment Submission
- Track Learning Progress
- Personal Dashboard
- AI Learning Assistant

---

## 👨‍🏫 Instructor Portal

- Create & Manage Courses
- Create Assignments
- AI Generated Course Content
- Student Performance Tracking
- Course Analytics

---

## 📝 Evaluator Portal

- Review Student Submissions
- AI Assisted Evaluation
- Performance Reports
- Assessment Analytics

---

## 👑 Admin Panel

- User Management
- Role Management
- Course Management
- Platform Analytics
- Dashboard Overview

---

# 🚀 Live Project

### 🌐 Live Application

https://skillforge-ai-h35u.vercel.app

### 💻 GitHub Repository

https://github.com/AdarshMalllah07/skillforge-ai

---

# 🛠 Technology Stack

| Layer | Technologies |
|--------|--------------|
| Frontend | React 19, Vite 6, TypeScript |
| Styling | Tailwind CSS 4, Motion |
| Backend | Express.js, TypeScript |
| Database | MongoDB, Mongoose |
| Authentication | JWT |
| AI | Google Gemini API |
| Deployment | Vercel |

---

# 🏗 System Architecture

```
                    Client

                      │

             React + Vite SPA

                      │

            Express REST API Server

     ┌──────────────┼──────────────┐

 Authentication   Business Logic    AI Engine

      JWT           CRUD APIs       Gemini AI

     └──────────────┼──────────────┘

                 MongoDB Atlas
```

---

# 🔐 Authentication & Authorization

✔ JWT Authentication

✔ Secure Password Hashing

✔ Role-Based Access Control (RBAC)

✔ Protected API Routes

✔ Authorization Middleware

---

# 👥 User Roles

| Role | Permissions |
|------|-------------|
| 👨‍🎓 Student | Learn, Submit Assignments, AI Tutor |
| 👨‍🏫 Instructor | Manage Courses, Create Assignments |
| 📝 Evaluator | Review & Evaluate Submissions |
| 👑 Admin | Complete Platform Management |

---

# 📂 Project Structure

```
server/
│
├── models/
├── routes/
├── middleware/
├── db.ts
├── uploads.ts
└── seed.ts

src/
│
├── components/
├── pages/
├── hooks/
├── services/
├── layouts/
└── assets/

public/

vercel.json
server.ts
```

---

# 📡 API Overview

| Endpoint | Description |
|-----------|-------------|
| /api/auth | Authentication APIs |
| /api/users | User Management |
| /api/courses | Courses & Assignments |
| /api/submissions | Student Submissions |
| /api/ai | AI Services |
| /api/candidate | Candidate Information |

---

# ⚡ Performance Optimizations

- Optimized API Design
- Modular Architecture
- Efficient MongoDB Queries
- Lazy Loading
- Component Reusability
- Type Safety with TypeScript
- Production Ready Build

---

# 🔒 Security Features

- JWT Authentication
- Password Hashing
- Input Validation
- Protected Routes
- Environment Variables
- MongoDB Secure Connection

---

# 🚀 Getting Started

## Clone Repository

```bash
git clone https://github.com/AdarshMalllah07/skillforge-ai.git
```

```bash
cd skillforge-ai
```

---

## Install Dependencies

```bash
npm install
```

---

## Configure Environment

Create a `.env` file.

```env
MONGODB_URI=

JWT_SECRET=

JWT_EXPIRES_IN=7d

PORT=3000

GEMINI_API_KEY=
```

---

## Start Development

```bash
npm run dev
```

---

## Production Build

```bash
npm run build
```

```bash
npm start
```

---

# 📜 Available Scripts

| Command | Description |
|----------|-------------|
| npm run dev | Development Server |
| npm run build | Production Build |
| npm start | Start Production Server |
| npm run lint | Type Checking |
| npm run seed | Seed Database |
| npm run clean | Clean Build Files |
| npm run create-super-admin | Create Super Admin |

---

# 👑 Default Admin Credentials

| Username | Password |
|----------|----------|
| admin | Password@12345 |

> ⚠️ Change the default password immediately after the first login in a production environment.

---

# 📸 Application Preview

> Add screenshots here

- Dashboard
- Student Panel
- Instructor Dashboard
- AI Course Generator
- AI Evaluation
- Analytics
- Admin Dashboard

---

# 🌟 Highlights

- Full Stack Architecture
- AI Powered Learning
- Role Based Access Control
- Secure JWT Authentication
- Responsive UI
- RESTful APIs
- MongoDB Integration
- Production Deployment
- Modular Codebase
- Scalable Design

---

# 🚀 Future Enhancements

- Live Classes
- Certificate Generation
- Discussion Forum
- Real-time Notifications
- AI Study Planner
- Leaderboards
- Email Notifications

---

# 👨‍💻 Author

## Adarsh Mallah

Full Stack Developer passionate about building scalable, secure, and AI-powered web applications.

### Connect

**GitHub**

https://github.com/AdarshMalllah07

**LinkedIn**

https://www.linkedin.com/in/adarsh-mallah-011279312/

---

<div align="center">

### ⭐ If you found this project useful, consider giving it a star!

Made with ❤️ using React, Express, MongoDB & Google Gemini AI

</div>