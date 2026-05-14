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
- **Database:** MongoDB Atlas (cloud), cluster: `cluster0.esveu5u.mongodb.net`, DB: `mindscapio`
- **Auth:** Google OAuth via Passport.js + JWT (session: false — stateless)
- **Admin login:** Separate email/password (not Google)
- **Markdown storage:** MongoDB (as string)
- **PDF storage:** Cloudinary
- **Markdown rendering:** react-markdown + remark-gfm
- **PDF generation:** Puppeteer (backend, on-demand)
- **Admin editor:** @uiw/react-md-editor (live preview)
- **File uploads:** Multer
- **AI content:** AI generates Markdown → admin pastes → saved to DB
- **Passing threshold:** 40% for quizzes
- **Roles:** admin, teacher, parent, student
- **Parent/Student login:** Google OAuth (same flow)
- **Admin login:** Email/password (separate)
- **Progress:** Shown on student's own profile page
- **Parent:** Sees child's profile after login, can add multiple children
- **Assignment lifecycle:** draft → published → closed
- **Soft delete:** isActive flag on all models
- **isPublished flag:** On chapters, notes, quizzes, flashcards

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
- express-session

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
- @types/express-session

---

## 📁 Folder Structure
```
mindscapio/
├── PROGRESS.md
├── frontend/                         # Not started yet
└── backend/
    ├── .env                          # Environment variables
    ├── tsconfig.json                 # TypeScript config
    ├── package.json                  # pnpm managed
    ├── server.ts                     # Entry point
    └── src/
        ├── app.ts                    # Express setup, middlewares, routes
        ├── config/
        │   ├── env.ts                # Loads & exports all .env variables
        │   └── db.ts                 # MongoDB Atlas connection
        ├── middleware/
        │   ├── error.middleware.ts   # Global error handler + AppError + sendResponse
        │   ├── auth.middleware.ts    # JWT verify + restrictTo roles
        │   └── validate.middleware.ts # Zod body/query/params validation
        ├── models/
        │   ├── User.model.ts         # admin, teacher, parent, student roles
        │   ├── Class.model.ts        # Class 1–10
        │   ├── Subject.model.ts      # Subjects per class with slug
        │   ├── Chapter.model.ts      # Chapters per subject, order, isPublished
        │   ├── Note.model.ts         # Markdown notes per chapter
        │   ├── Quiz.model.ts         # Daily quizzes with scheduling
        │   ├── Flashcard.model.ts    # Exam prep flip cards
        │   ├── Question.model.ts     # MCQ, subjective, true/false
        │   ├── TestResult.model.ts   # Student attempt history + scores
        │   └── Assignment.model.ts   # Homework with due date
        ├── controllers/
        │   ├── auth.controller.ts    # Google OAuth + JWT + profile + addChild
        │   └── class.controller.ts  # CRUD for Class 1–10
        └── routes/
            └── auth.routes.ts        # /api/auth/* routes
```

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
| 7 | `backend/src/models/User.model.ts` | User schema — admin, teacher, parent, student |
| 8 | `backend/src/models/Class.model.ts` | Class 1–10 schema |
| 9 | `backend/src/models/Subject.model.ts` | Subject schema with slug + classId |
| 10 | `backend/src/models/Chapter.model.ts` | Chapter schema with order + isPublished |
| 11 | `backend/src/models/Note.model.ts` | Markdown notes per chapter |
| 12 | `backend/src/models/Quiz.model.ts` | Daily quizzes with scheduling |
| 13 | `backend/src/models/Flashcard.model.ts` | Exam prep flip cards |
| 14 | `backend/src/models/Question.model.ts` | MCQ, subjective, true/false |
| 15 | `backend/src/models/TestResult.model.ts` | Student attempt history + scores |
| 16 | `backend/src/models/Assignment.model.ts` | Homework with due date |
| 17 | `backend/src/middleware/error.middleware.ts` | Global error handler + AppError + sendResponse |
| 18 | `backend/src/middleware/auth.middleware.ts` | JWT verify + restrictTo + extend req.user |
| 19 | `backend/src/middleware/validate.middleware.ts` | Zod validation for body/query/params |
| 20 | `backend/src/controllers/auth.controller.ts` | Google OAuth + JWT + profile + addChild |
| 21 | `backend/src/routes/auth.routes.ts` | /api/auth/* routes wired |
| 22 | `backend/src/controllers/class.controller.ts` | CRUD for Class 1–10 |

---

## 🔄 In Progress
- Step 23: `backend/src/routes/class.routes.ts`

## 📋 Pending — Backend
- `class.routes.ts` — wire class controllers
- Subject controller + routes
- Chapter controller + routes
- Note controller + routes
- Quiz controller + routes
- Question controller + routes
- Flashcard controller + routes
- TestResult controller + routes
- Assignment controller + routes
- PDF generation route (Puppeteer)
- Multer file upload config

## 📋 Pending — Frontend
- Vite + React + TypeScript setup
- Design system + Tailwind
- Routing (React Router)
- Auth flow (Google login button → /auth/success token extraction)
- Student dashboard
- Class → Subject → Chapter drill-down UI
- Notes page with Markdown renderer (react-markdown)
- PDF download button
- Flashcard flip UI (mobile friendly)
- Admin panel
  - Markdown editor (@uiw/react-md-editor)
  - Class/Subject/Chapter CRUD
  - Quiz + Question builder
- Mobile-first responsive layout

## 📋 Pending — Phase 2 (after core is live)
- Bookmark model + feature
- Highlight + personal notes
- Formula sheet
- Mock tests
- Weak area tracker
- Streak system
- Badges + achievements
- Leaderboard
- Progress report for parents
- Previous year papers
- Offline mode
- Dark mode
- Font size control
- Weekly summary email to parents

---

## 🔑 Key Details
- MongoDB Atlas URI: `cluster0.esveu5u.mongodb.net`, DB: `mindscapio`
- Server runs on port `5000`
- Frontend runs on port `5173` (Vite default)
- Health check: `http://localhost:5000/api/health`
- `AppError(message, statusCode)` — throw anywhere for handled errors
- `sendResponse(res, statusCode, success, message, data)` — standard response shape
- Error middleware registered AFTER all routes in `app.ts`
- `protect` middleware — verifies JWT, attaches `req.user`
- `restrictTo(...roles)` — use after protect to limit by role
- `validate(schema)` — Zod body validation
- `validateQuery(schema)` — Zod query param validation
- `validateParams(schema)` — Zod route param validation
- Google OAuth callback: `/api/auth/google/callback`
- After Google login → JWT sent via redirect to `/auth/success?token=`
- Children don't login via Google — parent manages them via addChild
- `tsx watch` used instead of `ts-node-dev` (broken on Termux)
- All unused middleware params prefixed with `_` to satisfy TypeScript strict mode
- `as Record<string, string>` cast on `req.params` in validateParams
