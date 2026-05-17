import { Routes, Route, Link, useLocation, Navigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";

// ─── Admin Sub-pages ───────────────────────────────────────────
import AdminClasses from "./AdminClasses";
import AdminSubjects from "./AdminSubjects";
import AdminChapters from "./AdminChapters";
import AdminNotes from "./AdminNotes";
import AdminQuizzes from "./AdminQuizzes";
import AdminFlashcards from "./AdminFlashcards";
import AdminAssignments from "./AdminAssignments";

// ─── Sidebar Nav Item ──────────────────────────────────────────
const NavItem = ({
  to,
  icon,
  label,
}: {
  to: string;
  icon: string;
  label: string;
}) => {
  const location = useLocation();
  const isActive = location.pathname === to;

  return (
    <Link
      to={to}
      className={`flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all ${isActive
          ? "bg-indigo-600 text-white shadow-sm"
          : "text-gray-600 hover:bg-indigo-50 hover:text-indigo-600"
        }`}
    >
      <span className="text-lg">{icon}</span>
      {label}
    </Link>
  );
};

// ─── Admin Panel Layout ────────────────────────────────────────
const AdminPanel = () => {
  const { user } = useAuth();

  return (
    <div className="min-h-screen bg-gray-50 flex">

      {/* ── Sidebar ───────────────────────────────────────────── */}
      <aside className="hidden md:flex flex-col w-60 bg-white border-r border-gray-100 p-4 sticky top-16 h-[calc(100vh-4rem)] overflow-y-auto shrink-0">
        <div className="mb-6">
          <p className="text-xs text-gray-400 uppercase tracking-wider px-4 mb-2">
            Content
          </p>
          <nav className="space-y-1">
            <NavItem to="/admin/classes" icon="🏫" label="Classes" />
            <NavItem to="/admin/subjects" icon="📚" label="Subjects" />
            <NavItem to="/admin/chapters" icon="📖" label="Chapters" />
            <NavItem to="/admin/notes" icon="📝" label="Notes" />
          </nav>
        </div>

        <div className="mb-6">
          <p className="text-xs text-gray-400 uppercase tracking-wider px-4 mb-2">
            Learning
          </p>
          <nav className="space-y-1">
            <NavItem to="/admin/quizzes" icon="✅" label="Quizzes" />
            <NavItem to="/admin/flashcards" icon="🃏" label="Flashcards" />
            <NavItem to="/admin/assignments" icon="📋" label="Assignments" />
          </nav>
        </div>

        {/* ── Admin Info ──────────────────────────────────────── */}
        <div className="mt-auto pt-4 border-t border-gray-100">
          <div className="flex items-center gap-3 px-2">
            {user?.avatar ? (
              <img
                src={user.avatar}
                alt={user.displayName}
                className="w-8 h-8 rounded-full object-cover"
              />
            ) : (
              <div className="w-8 h-8 rounded-full bg-indigo-100 flex items-center justify-center text-indigo-600 font-bold text-sm">
                {user?.displayName?.[0]?.toUpperCase()}
              </div>
            )}
            <div className="min-w-0">
              <p className="text-sm font-medium text-gray-700 truncate">
                {user?.displayName}
              </p>
              <p className="text-xs text-gray-400 capitalize">{user?.role}</p>
            </div>
          </div>
        </div>
      </aside>

      {/* ── Mobile Tab Bar ────────────────────────────────────── */}
      <div className="md:hidden fixed bottom-0 left-0 right-0 bg-white border-t border-gray-100 flex items-center justify-around px-2 py-2 z-40">
        {[
          { to: "/admin/classes", icon: "🏫", label: "Classes" },
          { to: "/admin/notes", icon: "📝", label: "Notes" },
          { to: "/admin/quizzes", icon: "✅", label: "Quizzes" },
          { to: "/admin/flashcards", icon: "🃏", label: "Cards" },
          { to: "/admin/assignments", icon: "📋", label: "Tasks" },
        ].map(({ to, icon, label }) => {
          const isActive = location.pathname === to;
          return (
            <Link
              key={to}
              to={to}
              className={`flex flex-col items-center gap-0.5 px-3 py-1 rounded-xl transition-all ${isActive ? "text-indigo-600" : "text-gray-400"
                }`}
            >
              <span className="text-xl">{icon}</span>
              <span className="text-xs">{label}</span>
            </Link>
          );
        })}
      </div>

      {/* ── Main Content ──────────────────────────────────────── */}
      <main className="flex-1 min-w-0 pb-20 md:pb-0">
        <Routes>
          <Route index element={<Navigate to="/admin/classes" replace />} />
          <Route path="classes" element={<AdminClasses />} />
          <Route path="subjects" element={<AdminSubjects />} />
          <Route path="chapters" element={<AdminChapters />} />
          <Route path="notes" element={<AdminNotes />} />
          <Route path="quizzes" element={<AdminQuizzes />} />
          <Route path="flashcards" element={<AdminFlashcards />} />
          <Route path="assignments" element={<AdminAssignments />} />
        </Routes>
      </main>
    </div>
  );
};

export default AdminPanel;
