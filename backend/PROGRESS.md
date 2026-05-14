# MindScapio — Project Progress Tracker

## 🧠 Project Overview
A full-stack MERN + TypeScript tutoring platform for managing students across
Class 1–10. Content is AI-generated in Markdown, rendered beautifully on frontend,
and downloadable as PDF. Built by a tuition teacher for parents & students.

---

## 🏗️ Architecture Decisions
- **Stack:** MERN + TypeScript (MongoDB, Express, React, Node)
- **Package Manager:** pnpm (in Termux on Android)
- **Frontend:** React + Vite + TypeScript
- **Backend:** Node + Express + TypeScript, entry via `server.ts`
- **Dev Runner:** `tsx watch` (replaced ts-node-dev — was broken on Termux)
- **Database:** MongoDB Atlas (cloud)
- **Auth:** Google OAuth via Passport.js + JWT
- **Admin login:** Separate email/password (not Google)
- **Markdown storage:** MongoDB (as string)
- **PDF storage:** Cloudinary
- **Markdown rendering:** react-markdown + remark-gfm
- **PDF generation:** Puppeteer (backend, on-demand)
- **Admin editor:** @uiw/react-md-editor (live preview)
- **File uploads:** Multer
- **AI content:** AI generates Markdown → admin pastes → saved to DB

---

## 📦 Backend Dependencies Installed
### Production
- express
- mongoose
- jsonwebtoken
- bcryptjs
- dotenv
- cors
- zod
- passport
- passport-google-oauth20

### Dev
- typescript
- tsx
- @types/express
- @types/node
- @types/jsonwebtoken
- @types/bcryptjs
- @types/cors
- @types/passport
- @types/passport-google-oauth20

---

## 📁 Folder Structure
mindscapio/
├── PROGRESS.md
├── frontend/                         # React + Vite + TypeScript (not started yet)
└── backend/
├── .env                          # Environment variables
├── tsconfig.json                 # TypeScript config
├── package.json                  # pnpm managed
├── server.ts                     # Entry point
└── src/
├── app.ts                    # Express setup, middlewares, routes
├── config/
│   ├── env.ts                # Loads & exports all .env variables
│   └── db.ts                 # MongoDB connection via Mongoose
└── models/
├── User.model.ts         # Admin, Parent, Student roles
├── Class.model.ts        # Class 1–10
├── Subject.model.ts      # Subjects per class with slug
└── Chapter.model.ts     # Chapters per subject, order, publish flag

---

## ✅ Completed Steps

| Step | File | Purpose |
|------|------|---------|
| 1 | `backend/` pnpm init + installs | Project initialized |
| 2 | `backend/tsconfig.json` | TypeScript compiler config |
| 3 | `backend/src/config/env.ts` | Centralized env variable loader |
| 4 | `backend/src/config/db.ts` | MongoDB Atlas connection |
| 5 | `backend/src/app.ts` | Express app, middlewares, health check |
| 6 | `backend/server.ts` | Server entry point |
| 7 | `backend/src/models/User.model.ts` | User schema — admin, parent, student |
| 8 | `backend/src/models/Class.model.ts` | Class 1–10 schema |
| 9 | `backend/src/models/Subject.model.ts` | Subject schema with slug + classId |
| 10 | `backend/src/models/Chapter.model.ts` | Chapter schema with order + isPublished |

---

## 🔄 In Progress
- Step 11: `backend/src/models/Note.model.ts`

## 📋 Pending — Backend
- `Note.model.ts` — Markdown notes per chapter
- `Quiz.model.ts` — Daily quizzes
- `Question.model.ts` — MCQ/subjective questions
- `TestResult.model.ts` — Student score history
- `Assignment.model.ts` — Assignments with due date
- Auth controller + routes (Google OAuth + JWT)
- Notes controller + routes
- Student controller + routes
- Quiz controller + routes
- Error middleware
- Validation middleware (Zod)
- PDF generation route (Puppeteer)

## 📋 Pending — Frontend
- Vite + React + TypeScript setup
- Design system + Tailwind
- Routing (React Router)
- Auth flow (Google login)
- Student dashboard
- Class → Subject → Chapter drill-down UI
- Notes page with Markdown renderer
- PDF download button
- Admin panel
  - Content manager (Markdown editor)
  - Class/Subject/Chapter CRUD
  - Quiz builder
- Mobile-first responsive layout

---

## 🔑 Key Details
- MongoDB Atlas URI in `.env` — cluster: `cluster0.esveu5u.mongodb.net`
- Atlas DB name: `mindscapio`
- Server runs on port `5000`
- Health check: `http://localhost:5000/api/health`
- Parent logs in via Google → adds children → assigns class
- `isPublished` flag on chapters — admin drafts before publishing
- `isActive` flag on all models — soft delete pattern
- Compound indexes on slug fields for URL-based queries
## ✅ Completed Steps (Updated)

| Step | File | Purpose |
|------|------|---------|
| 11 | `backend/src/models/Note.model.ts` | Markdown notes per chapter |
| 12 | `backend/src/models/Quiz.model.ts` | Daily quizzes with scheduling |
| 13 | `backend/src/models/Flashcard.model.ts` | Exam prep flip cards |
| 14 | `backend/src/models/Question.model.ts` | MCQ, subjective, true/false |
| 15 | `backend/src/models/TestResult.model.ts` | Student attempt history + scores |
| 16 | `backend/src/models/Assignment.model.ts` | Homework with due date |
| 17 | `backend/src/middleware/error.middleware.ts` | Global error handler + AppError class + sendResponse helper |

## 🔄 In Progress
- Step 18: `backend/src/middleware/auth.middleware.ts`

## 📋 Pending — Backend (Updated)
- `auth.middleware.ts` — JWT verification
- `validate.middleware.ts` — Zod request validation
- Auth controller + routes (Google OAuth + Passport.js + JWT)
- Notes controller + routes
- Quiz controller + routes
- Question controller + routes
- Assignment controller + routes
- Flashcard controller + routes
- TestResult controller + routes
- Class/Subject/Chapter controller + routes
- PDF generation route (Puppeteer)
- Multer file upload config

## 🔑 Key Details (Updated)
- `AppError(message, statusCode)` — use anywhere to throw handled errors
- `sendResponse(res, statusCode, success, message, data)` — standard response shape
- Error middleware must be registered AFTER all routes in `app.ts`
- Passing threshold for quizzes: 40%
- Assignment lifecycle: draft → published → closed
- Flashcard front/back both support Markdown
- Question explanation shown after student answers
-## ✅ Completed Steps (add these)

| Step | File | Purpose |
|------|------|---------|
| 23 | `backend/src/routes/class.routes.ts` | /api/classes/* routes wired |
| 24 | `backend/src/controllers/subject.controller.ts` | CRUD for subjects |
| 25 | `backend/src/routes/subject.routes.ts` | /api/subjects/* routes wired |
| 26 | `backend/src/controllers/chapter.controller.ts` | CRUD + publish toggle for chapters |
| 27 | `backend/src/routes/chapter.routes.ts` | /api/chapters/* routes wired |
| 28 | `backend/src/controllers/note.controller.ts` | CRUD + publish toggle for notes |
| 29 | `backend/src/routes/note.routes.ts` | /api/notes/* routes wired |

## 🔄 In Progress
- Step 30: `backend/src/controllers/quiz.controller.ts`

## 📋 Pending — Backend (update this)
- Quiz controller + routes
- Question controller + routes
- Flashcard controller + routes
- TestResult controller + routes
- Assignment controller + routes
- PDF generation route (Puppeteer)
- Multer file upload config

## 📁 Folder Structure (add to routes section)
└── routes/
    ├── auth.routes.ts
    ├── class.routes.ts
    ├── subject.routes.ts
    ├── chapter.routes.ts
    └── note.routes.ts

## 🔑 Key Details (add these)
- `/admin` routes always placed before `/:id` routes — prevents Express route collision
- All list routes for students show published only, admin routes show all including drafts
- `togglePublish` dedicated PATCH `/:id/publish` route on chapters and notes
- Naming convention: singular filenames (note.controller.ts) but plural URLs (/api/notes)
- All 3 parent IDs (chapterId, subjectId, classId) required on create for denormalization TestResult stores answer snapshots — safe if question is edited later
