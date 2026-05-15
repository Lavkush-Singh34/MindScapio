import { Routes, Route, Navigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import type { UserRole } from "../types";

// ─── Page Imports ──────────────────────────────────────────────
// Auth
import AuthSuccess from "../pages/Auth/AuthSuccess";
import Login from "../pages/Auth/Login";

// Public
import Home from "../pages/Home/Home";

// Protected
import Dashboard from "../pages/Dashboard/Dashboard";
import NotesPage from "../pages/Notes/NotesPage";
import QuizPage from "../pages/Quiz/QuizPage";
import FlashcardsPage from "../pages/Flashcards/FlashcardsPage";
import AssignmentsPage from "../pages/Assignments/AssignmentsPage";
import ProfilePage from "../pages/Profile/ProfilePage";

// Admin
import AdminPanel from "../pages/Admin/AdminPanel";

// ─── Protected Route ───────────────────────────────────────────
// Redirects to login if not authenticated
const ProtectedRoute = ({ children }: { children: React.ReactNode }) => {
  const { isAuthenticated, isLoading } = useAuth();

  // Show nothing while checking auth status
  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <p className="text-gray-500 text-lg">Loading...</p>
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  return <>{children}</>;
};

// ─── Role Based Route ──────────────────────────────────────────
// Redirects to dashboard if role doesn't match
const RoleRoute = ({
  children,
  roles,
}: {
  children: React.ReactNode;
  roles: UserRole[];
}) => {
  const { user, isLoading } = useAuth();

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <p className="text-gray-500 text-lg">Loading...</p>
      </div>
    );
  }

  if (!user || !roles.includes(user.role)) {
    return <Navigate to="/dashboard" replace />;
  }

  return <>{children}</>;
};

// ─── App Routes ────────────────────────────────────────────────
const AppRoutes = () => {
  return (
    <Routes>
      {/* ── Public Routes ───────────────────────────────────── */}
      <Route path="/" element={<Home />} />
      <Route path="/login" element={<Login />} />

      {/* ── Google OAuth callback handler ───────────────────── */}
      <Route path="/auth/success" element={<AuthSuccess />} />

      {/* ── Protected Routes ────────────────────────────────── */}
      <Route
        path="/dashboard"
        element={
          <ProtectedRoute>
            <Dashboard />
          </ProtectedRoute>
        }
      />
      <Route
        path="/notes"
        element={
          <ProtectedRoute>
            <NotesPage />
          </ProtectedRoute>
        }
      />
      <Route
        path="/quiz/:quizId"
        element={
          <ProtectedRoute>
            <QuizPage />
          </ProtectedRoute>
        }
      />
      <Route
        path="/flashcards"
        element={
          <ProtectedRoute>
            <FlashcardsPage />
          </ProtectedRoute>
        }
      />
      <Route
        path="/assignments"
        element={
          <ProtectedRoute>
            <AssignmentsPage />
          </ProtectedRoute>
        }
      />
      <Route
        path="/profile"
        element={
          <ProtectedRoute>
            <ProfilePage />
          </ProtectedRoute>
        }
      />

      {/* ── Admin Routes ────────────────────────────────────── */}
      <Route
        path="/admin/*"
        element={
          <ProtectedRoute>
            <RoleRoute roles={["admin", "teacher"]}>
              <AdminPanel />
            </RoleRoute>
          </ProtectedRoute>
        }
      />

      {/* ── 404 — redirect to home ───────────────────────────── */}
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
};

export default AppRoutes;
