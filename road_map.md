Here's a clean MERN stack folder structure with separate frontend and backend:

```
mindscapio/
├── frontend/                          # React + TypeScript (Vite)
│   ├── public/
│   │   └── favicon.ico
│   ├── src/
│   │   ├── assets/                    # Images, fonts, icons
│   │   ├── components/
│   │   │   ├── ui/                    # Reusable base components (Button, Input, Modal)
│   │   │   ├── layout/                # Navbar, Sidebar, Footer
│   │   │   └── shared/                # Shared across pages (Cards, Loaders)
│   │   ├── pages/
│   │   │   ├── Home/
│   │   │   ├── Auth/
│   │   │   │   ├── Login.tsx
│   │   │   │   └── Register.tsx
│   │   │   ├── Dashboard/
│   │   │   ├── Notes/
│   │   │   │   ├── index.tsx          # Class → Subject → Chapter drill-down
│   │   │   │   └── ChapterView.tsx
│   │   │   ├── Tests/
│   │   │   └── Students/
│   │   ├── hooks/                     # Custom React hooks
│   │   ├── context/                   # React Context (AuthContext, ThemeContext)
│   │   ├── store/                     # Zustand / Redux slices
│   │   ├── services/                  # Axios API call functions
│   │   │   ├── api.ts                 # Axios base instance
│   │   │   ├── authService.ts
│   │   │   ├── notesService.ts
│   │   │   └── studentService.ts
│   │   ├── types/                     # Global TypeScript interfaces/types
│   │   ├── utils/                     # Helper functions
│   │   ├── routes/
│   │   │   └── AppRoutes.tsx          # React Router config
│   │   ├── styles/                    # Global CSS / Tailwind base
│   │   ├── App.tsx
│   │   └── main.tsx
│   ├── .env
│   ├── index.html
│   ├── tsconfig.json
│   ├── vite.config.ts
│   └── package.json
│
├── backend/                           # Node + Express + TypeScript
│   ├── src/
│   │   ├── config/
│   │   │   ├── db.ts                  # MongoDB connection
│   │   │   └── env.ts                 # Env variable loader
│   │   ├── controllers/               # Route handler logic
│   │   │   ├── auth.controller.ts
│   │   │   ├── notes.controller.ts
│   │   │   ├── student.controller.ts
│   │   │   └── test.controller.ts
│   │   ├── middleware/
│   │   │   ├── auth.middleware.ts     # JWT verify
│   │   │   ├── error.middleware.ts    # Global error handler
│   │   │   └── validate.middleware.ts # Zod / Joi validation
│   │   ├── models/                    # Mongoose schemas
│   │   │   ├── User.model.ts
│   │   │   ├── Student.model.ts
│   │   │   ├── Note.model.ts
│   │   │   ├── Chapter.model.ts
│   │   │   └── Test.model.ts
│   │   ├── routes/
│   │   │   ├── auth.routes.ts
│   │   │   ├── notes.routes.ts
│   │   │   ├── student.routes.ts
│   │   │   └── test.routes.ts
│   │   ├── services/                  # Business logic (separate from controllers)
│   │   │   ├── auth.service.ts
│   │   │   └── notes.service.ts
│   │   ├── types/                     # Shared TS types/interfaces
│   │   ├── utils/                     # Helpers (JWT, hash, response formatter)
│   │   │   ├── jwt.ts
│   │   │   ├── hash.ts
│   │   │   └── apiResponse.ts
│   │   └── app.ts                     # Express app setup
│   ├── server.ts                      # Entry point (starts server)
│   ├── .env
│   ├── tsconfig.json
│   └── package.json
│
├── .gitignore
└── README.md
```

**Key decisions explained:**

**Frontend**
- `services/` holds all Axios calls — pages never call `fetch` directly
- `routes/AppRoutes.tsx` is the single source of truth for routing
- `pages/Notes/` already scaffolded for your class → subject → chapter UI

**Backend**
- `controllers/` only handle req/res — business logic lives in `services/`
- `middleware/` has auth, error handling, and validation as separate concerns
- `models/` has `Chapter.model.ts` separate from `Note.model.ts` to support the drill-down hierarchy

**pnpm workspace tip** — since you're using pnpm in Termux, you can add a root `pnpm-workspace.yaml` to manage both together:

```yaml
# pnpm-workspace.yaml (at root)
packages:
  - 'frontend'
  - 'backend'
```

Then run both with a root `package.json` script using `concurrently`.
