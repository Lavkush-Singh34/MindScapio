# 🎓 MindScapio

A full-stack AI-powered tutoring platform for Class 1–10 students. Built with MERN + TypeScript, designed for mobile-first learning with Google login, Markdown notes, quizzes, flashcards, and assignments.

---

## ✨ Features

### 👨‍🎓 Students & Parents
- **Google Login** — one tap sign in, no password needed
- **Class-wise Content** — drill down from Class → Subject → Chapter
- **Notes** — beautifully rendered Markdown notes, mobile friendly
- **Flashcards** — flip cards for quick exam revision, filter by difficulty
- **Quizzes** — timed MCQ, True/False and subjective tests with instant scoring
- **Assignments** — view homework with due dates and download as PDF
- **Leaderboard** — class-wise quiz rankings
- **Profile & Progress** — quiz history, scores, pass/fail stats
- **Parent Dashboard** — add multiple children, track their progress

### 🛠️ Admin & Teachers
- **Admin Panel** — full content management dashboard
- **Markdown Editor** — live preview editor for notes and assignments
- **AI Workflow** — paste AI generated Markdown directly into editor
- **Bulk Flashcards** — import AI generated flashcard JSON in one click
- **Quiz Builder** — create MCQ, subjective and true/false questions
- **Publish Control** — draft content before making it live
- **Schedule Quizzes** — set a date/time for daily quizzes to go live
- **Class/Subject/Chapter CRUD** — full content hierarchy management

---

## 🏗️ Tech Stack

| Layer | Technology |
|---|---|
| Frontend | React + TypeScript + Vite |
| Styling | Tailwind CSS v4 |
| Backend | Node.js + Express + TypeScript |
| Database | MongoDB Atlas + Mongoose |
| Auth | Google OAuth 2.0 + Passport.js + JWT |
| Markdown | react-markdown + remark-gfm |
| MD Editor | @uiw/react-md-editor |
| Validation | Zod |
| Dev Runner | tsx watch |
| Package Manager | pnpm |

---

## 📁 Project Structure

```
mindscapio/
├── PROGRESS.md
├── README.md
├── frontend/                    # React + Vite + TypeScript
│   ├── src/
│   │   ├── components/
│   │   │   ├── layout/          # Navbar
│   │   │   ├── ui/              # Reusable components
│   │   │   └── shared/
│   │   ├── context/             # AuthContext
│   │   ├── pages/
│   │   │   ├── Auth/            # Login, AuthSuccess
│   │   │   ├── Home/            # Public landing page
│   │   │   ├── Dashboard/       # Student dashboard
│   │   │   ├── Notes/           # Class→Subject→Chapter→Notes
│   │   │   ├── Quiz/            # Timed quiz attempt
│   │   │   ├── Flashcards/      # Flip card revision
│   │   │   ├── Assignments/     # Homework viewer
│   │   │   ├── Profile/         # Progress + quiz history
│   │   │   └── Admin/           # Full admin panel
│   │   ├── routes/              # AppRoutes + protected routes
│   │   ├── services/            # Axios API instance
│   │   └── types/               # Global TypeScript interfaces
│   ├── .env
│   └── package.json
│
└── backend/                     # Node + Express + TypeScript
    ├── src/
    │   ├── config/              # DB connection + env loader
    │   ├── controllers/         # Route handler logic
    │   ├── middleware/          # Auth, error, validation
    │   ├── models/              # Mongoose schemas
    │   └── routes/              # Express route definitions
    ├── server.ts                # Entry point
    ├── .env
    └── package.json
```

---

## 🚀 Getting Started

### Prerequisites
- Node.js 18+
- pnpm
- MongoDB Atlas account
- Google Cloud Console project (for OAuth)

### 1. Clone the repo

```bash
git clone https://github.com/Lavkush-Singh34/mindscapio.git
cd mindscapio
```

### 2. Setup Backend

```bash
cd backend
pnpm install
```

Create `backend/.env`:

```env
PORT=5000
MONGO_URI=mongodb+srv://<user>:<password>@cluster0.xxxxx.mongodb.net/mindscapio?retryWrites=true&w=majority
JWT_SECRET=your_super_secret_key_here
NODE_ENV=development
GOOGLE_CLIENT_ID=your_google_client_id
GOOGLE_CLIENT_SECRET=your_google_client_secret
CLIENT_URL=http://localhost:5173
SERVER_URL=http://localhost:5000
```

```bash
pnpm dev
```

Backend runs on `http://localhost:5000`

### 3. Setup Frontend

```bash
cd frontend
pnpm install
```

Create `frontend/.env`:

```env
VITE_API_URL=http://localhost:5000/api
```

```bash
pnpm dev
```

Frontend runs on `http://localhost:5173`

---

## 🔑 Google OAuth Setup

1. Go to [console.cloud.google.com](https://console.cloud.google.com)
2. Create a new project → **MindScapio**
3. APIs & Services → Credentials → Create OAuth 2.0 Client ID
4. Add authorized redirect URI:
   ```
   http://localhost:5000/api/auth/google/callback
   ```
5. Copy Client ID and Secret to `backend/.env`

---

## 👑 Setting Up Admin Account

1. Login with Google on the platform
2. Open MongoDB Atlas → Browse Collections → `users`
3. Find your user document and update:
   ```js
   db.users.updateOne(
     { email: "your-email@gmail.com" },
     { $set: { role: "admin" } }
   )
   ```
4. Logout and login again — Admin Panel will now be visible

---

## 📡 API Overview

| Resource | Base URL |
|---|---|
| Auth | `/api/auth` |
| Classes | `/api/classes` |
| Subjects | `/api/subjects` |
| Chapters | `/api/chapters` |
| Notes | `/api/notes` |
| Quizzes | `/api/quizzes` |
| Questions | `/api/questions` |
| Flashcards | `/api/flashcards` |
| Test Results | `/api/test-results` |
| Assignments | `/api/assignments` |

Health check: `GET /api/health`

---

## 🤖 AI Content Workflow

MindScapio is designed for AI-assisted content creation:

1. **Notes** — Ask AI to generate chapter notes in Markdown → paste in Admin Panel editor → publish
2. **Flashcards** — Ask AI to generate flashcards as JSON array → paste in Bulk Import → publish all
3. **Quizzes** — Use AI to generate MCQ questions → add one by one in Quiz Builder
4. **Assignments** — Ask AI to write assignment description in Markdown → paste and set due date

### Flashcard JSON format for bulk import:
```json
[
  { "front": "Term", "back": "Definition", "hint": "...", "difficulty": "easy" },
  { "front": "Term 2", "back": "Definition 2", "difficulty": "hard" }
]
```

---

## 🗺️ Roadmap

### Phase 2 — Engagement Features
- [ ] Streak system — daily study streaks
- [ ] Badges & achievements
- [ ] Leaderboard improvements
- [ ] Weak area tracker
- [ ] Mock tests (full syllabus)
- [ ] Previous year papers

### Phase 3 — Advanced Features
- [ ] PDF generation (Puppeteer)
- [ ] Offline mode (PWA)
- [ ] Dark mode
- [ ] Weekly progress email to parents
- [ ] Student submission tracking for assignments
- [ ] Subjective answer manual marking

---

## 🙏 Built With

- [React](https://react.dev)
- [Express](https://expressjs.com)
- [MongoDB Atlas](https://www.mongodb.com/atlas)
- [Tailwind CSS](https://tailwindcss.com)
- [Passport.js](https://www.passportjs.org)
- [@uiw/react-md-editor](https://uiwjs.github.io/react-md-editor)
- [Zod](https://zod.dev)

---

## 📄 License

MIT License — feel free to use and modify for your own tutoring platform.

---

<p align="center">Built with ❤️ for students across India 🇮🇳</p>
