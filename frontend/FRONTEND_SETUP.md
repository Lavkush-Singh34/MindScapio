# MindScapio Frontend - Setup & Development Guide

## 🚀 Quick Start

```bash
cd frontend
bun install
bun run dev
```

The app will be available at `http://localhost:5173`

### Demo Credentials
- **Student:** `student@test.com` (password not required for demo)
- **Teacher:** `teacher@test.com`

---

## 📁 Project Structure

```
frontend/
├── src/
│   ├── components/          # Reusable UI components
│   │   ├── Badge.tsx        # Status and info badges
│   │   ├── Button.tsx       # Button component (4 variants)
│   │   ├── Card.tsx         # Card component with hover effects
│   │   ├── Input.tsx        # Input field with icon support
│   │   └── ProtectedRoute.tsx # Auth-protected route wrapper
│   │
│   ├── contexts/            # React contexts
│   │   └── AuthContext.tsx  # Authentication context & provider
│   │
│   ├── hooks/               # Custom React hooks
│   │   └── useNavigation.ts # Mobile/desktop breakpoint hook
│   │
│   ├── layouts/             # Layout components
│   │   ├── Layout.tsx       # Main layout wrapper
│   │   ├── TopNav.tsx       # Sticky top navigation bar
│   │   ├── Sidebar.tsx      # Desktop sidebar + mobile drawer
│   │   └── BottomNav.tsx    # Mobile-only bottom navigation
│   │
│   ├── pages/               # Page components (routes)
│   │   ├── Login.tsx        # Login page (mock auth)
│   │   ├── Dashboard.tsx    # Student/Teacher dashboard
│   │   ├── Notes.tsx        # Notes listing & search
│   │   └── Homework.tsx     # Homework submission page
│   │
│   ├── services/            # API & business logic
│   │   ├── api.ts           # Axios API service with interceptors
│   │   └── auth.ts          # Authentication service (mock)
│   │
│   ├── styles/              # Global stylesheets
│   │   └── layout.css       # Layout-specific styles
│   │
│   ├── types/               # TypeScript type definitions
│   │   └── index.ts         # All shared types
│   │
│   ├── App.tsx              # Main app component with routing
│   ├── App.css              # App-level styles
│   ├── index.css            # Global styles + Tailwind setup
│   └── main.tsx             # React entry point
│
├── .env                     # Environment variables
├── tailwind.config.js       # Tailwind CSS customization
├── vite.config.ts           # Vite configuration
├── tsconfig.json            # TypeScript config
└── package.json             # Dependencies
```

---

## 🎨 Design System

### Color Palette
- **Primary (Indigo):** `primary-500: #6b81ff`
  - Used for main actions, navigation, accents
- **Accent (Orange):** `accent-500: #f97316`
  - Used for warnings, secondary actions
- **Neutral:** Gray scale (50-900)
  - Text, backgrounds, borders

### Typography
- **Display Font:** Space Grotesk (headings, brand text)
- **Body Font:** Poppins (regular text, UI)
- **Mono:** System mono (code, technical text)

### Components
- **Card:** Rounded corners, light shadow, hover lift animation
- **Button:** 4 variants (primary, secondary, outline, ghost) with tap feedback
- **Input:** Icon support, error states, focus ring
- **Badge:** Status indicators (success, pending, warning, info)

---

## 🔐 Authentication Flow

1. User lands on `/login`
2. Types email (student@test.com or teacher@test.com)
3. Auth service stores token + user in localStorage
4. AuthContext updates user state
5. ProtectedRoute allows access to pages
6. User info shown in TopNav, sidebar navigation updates based on role

**Current:** Mock authentication (replace with real API in backend)

---

## 📡 API Integration

The `apiService` automatically:
- Adds Bearer token to all requests
- Handles 401 responses by redirecting to login
- Logs errors to console

### Available Methods:
```typescript
// Notes
apiService.getNotes(className?, subject?)
apiService.getNoteById(id)

// Homework
apiService.getHomework(status?)
apiService.submitHomework(id, file)

// Announcements
apiService.getAnnouncements()

// Tests
apiService.getTests()
apiService.getTestById(id)
apiService.submitTest(id, answers)

// Progress
apiService.getProgress()

// Doubts
apiService.getDoubts()
apiService.createDoubt(doubt)
apiService.replyToDoubt(doubtId, content)
```

---

## 🎯 Pages Status

| Page | Status | Details |
|------|--------|---------|
| Login | ✅ Complete | Mock auth, email-based login |
| Dashboard | ✅ Complete | Student & teacher views with stats |
| Notes | ✅ Complete | Search, filter, mock data |
| Homework | ✅ Complete | File upload, status tracking |
| Announcements | 🔄 Placeholder | Need to implement |
| Tests | 🔄 Placeholder | MCQ UI needed |
| Progress | 🔄 Placeholder | Charts / stats display |
| Doubts | 🔄 Placeholder | Q&A forum UI |
| Schedule | 🔄 Placeholder | Timetable grid |
| Admin Panels | 🔄 Placeholder | CRUD forms needed |

---

## 🎬 Animations

All animations use **Framer Motion**:
- **Page Load:** Fade in + stagger children
- **Card Hover:** Lift up slightly with shadow
- **Button Tap:** Scale down + release
- **Navigation:** Slide in from edges
- **List Items:** Staggered fade-in

---

## 📱 Responsive Breakpoints

- **Mobile:** < 640px (bottom nav, drawer sidebar)
- **Tablet:** 640px - 1024px (responsive grid, mixed)
- **Desktop:** > 1024px (sidebar nav, full layout)

---

## 🛠️ Build & Deployment

```bash
# Development
bun run dev

# Build for production
bun run build

# Preview production build
bun run preview

# Lint
bun run lint
```

---

## 🔗 Frontend-Backend Connection

Update `.env` with your backend URL:
```
VITE_API_URL=http://localhost:5000/api
```

Backend should handle:
- `/api/auth/login` - POST
- `/api/notes` - GET, POST
- `/api/homework` - GET, POST
- `/api/announcements` - GET, POST
- `/api/tests` - GET, POST
- `/api/doubts` - GET, POST

---

## 📝 Notes for Implementation

1. **Styling:** Use `@apply` classes in components for consistency
2. **Animations:** Wrap interactive elements with `motion.div` from Framer Motion
3. **Type Safety:** All API responses should match types in `src/types/index.ts`
4. **Icons:** Using `lucide-react` for all icons
5. **Forms:** Use `react-hook-form` for complex forms (see Login page for basic example)

---

## 🚨 Common Issues

**Issue:** Styles not applying?
- Run `bun install` to ensure Tailwind is installed
- Check `tailwind.config.js` includes all file paths

**Issue:** API calls failing?
- Verify backend is running at `VITE_API_URL`
- Check token is being sent in Authorization header (see `api.ts` interceptor)

**Issue:** TypeScript errors?
- Ensure all types are imported from `src/types/index.ts`
- Run `bun run lint` to check for errors
