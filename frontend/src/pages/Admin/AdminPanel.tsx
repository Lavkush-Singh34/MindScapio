
import { Routes, Route, Link, useLocation, Navigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";

// ─── Admin Sub-pages ───────────────────────────────────────────
import AdminSubjects from "./AdminSubjects";
import AdminChapters from "./AdminChapters";
import AdminNotes from "./AdminNotes";
import AdminQuizzes from "./AdminQuizzes";
import AdminFlashcards from "./AdminFlashcards";
import AdminAssignments from "./AdminAssignments";

// ─── Nav config ────────────────────────────────────────────────
const NAV = [
  { to: "/admin/subjects", icon: "📚", label: "Subjects", color: "from-violet-500 to-indigo-500" },
  { to: "/admin/chapters", icon: "📖", label: "Chapters", color: "from-blue-500 to-cyan-500" },
  { to: "/admin/notes", icon: "📝", label: "Notes", color: "from-emerald-500 to-teal-500" },
  { to: "/admin/quizzes", icon: "✅", label: "Quizzes", color: "from-amber-500 to-orange-500" },
  { to: "/admin/flashcards", icon: "🃏", label: "Flashcards", color: "from-pink-500 to-rose-500" },
  { to: "/admin/assignments", icon: "📋", label: "Assignments", color: "from-slate-500 to-gray-600" },
];

// ─── Sidebar Item ──────────────────────────────────────────────
const SidebarItem = ({
  to,
  icon,
  label,
  color,
}: {
  to: string;
  icon: string;
  label: string;
  color: string;
}) => {
  const { pathname } = useLocation();
  const active = pathname.startsWith(to);

  return (
    <Link
      to={to}
      className={`group flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all duration-200 ${active
          ? "bg-gray-900 text-white shadow-lg"
          : "text-gray-500 hover:text-gray-900 hover:bg-gray-100"
        }`}
    >
      <span
        className={`w-8 h-8 rounded-lg flex items-center justify-center text-base shrink-0 transition-all duration-200 ${active
            ? `bg-gradient-to-br ${color} shadow-md`
            : "bg-gray-100 group-hover:bg-gray-200"
          }`}
      >
        {icon}
      </span>
      <span className="truncate">{label}</span>
      {active && (
        <span className="ml-auto w-1.5 h-1.5 rounded-full bg-white opacity-70" />
      )}
    </Link>
  );
};

// ─── Mobile Tab ────────────────────────────────────────────────
const MobileTab = ({ to, icon, label }: { to: string; icon: string; label: string }) => {
  const { pathname } = useLocation();
  const active = pathname === to || (to !== "/admin" && pathname.startsWith(to));

  return (
    <Link
      to={to}
      className="flex flex-col items-center gap-0.5 px-2 py-1.5 rounded-xl transition-all"
    >
      <span
        className={`w-9 h-9 rounded-xl flex items-center justify-center text-lg transition-all ${active ? "bg-gray-900 shadow-md" : "bg-transparent"
          }`}
      >
        {icon}
      </span>
      <span className={`text-[10px] font-medium ${active ? "text-gray-900" : "text-gray-400"}`}>
        {label}
      </span>
    </Link>
  );
};

// ─── Admin Home Dashboard ──────────────────────────────────────
const AdminHome = () => {
  const { user } = useAuth();
  const hour = new Date().getHours();
  const greeting = hour < 12 ? "Good morning" : hour < 17 ? "Good afternoon" : "Good evening";

  return (
    <div className="p-6 max-w-4xl mx-auto">
      {/* Welcome */}
      <div className="mb-8">
        <p className="text-sm text-gray-400 font-medium mb-1">{greeting}</p>
        <h1 className="text-3xl font-bold text-gray-900 tracking-tight">
          {user?.displayName?.split(" ")[0]} 👋
        </h1>
        <p className="text-gray-500 mt-1 text-sm">What would you like to manage today?</p>
      </div>

      {/* Quick action cards */}
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 mb-8">
        {NAV.map(({ to, icon, label, color }) => (
          <Link
            key={to}
            to={to}
            className="group relative overflow-hidden bg-white border border-gray-100 rounded-2xl p-5 hover:border-gray-200 hover:shadow-md transition-all duration-200"
          >
            <div
              className={`w-10 h-10 rounded-xl bg-gradient-to-br ${color} flex items-center justify-center text-xl mb-3 shadow-sm group-hover:scale-110 transition-transform duration-200`}
            >
              {icon}
            </div>
            <p className="font-semibold text-gray-800 text-sm">{label}</p>
            <p className="text-xs text-gray-400 mt-0.5">Manage →</p>
          </Link>
        ))}
      </div>

      {/* Tips */}
      <div className="bg-gradient-to-br from-gray-900 to-gray-800 rounded-2xl p-5 text-white">
        <p className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-3">Quick Tips</p>
        <ul className="space-y-2 text-sm text-gray-300">
          <li className="flex items-start gap-2">
            <span className="text-emerald-400 mt-0.5 shrink-0">→</span>
            Notes are written in <strong className="text-white mx-1">Markdown</strong> — paste AI-generated content directly.
          </li>
          <li className="flex items-start gap-2">
            <span className="text-pink-400 mt-0.5 shrink-0">→</span>
            Flashcards support <strong className="text-white mx-1">Markdown + image URLs</strong> in both front and back.
          </li>
          <li className="flex items-start gap-2">
            <span className="text-amber-400 mt-0.5 shrink-0">→</span>
            Always create in order: <strong className="text-white mx-1">Subjects → Chapters → Notes</strong>.
          </li>
        </ul>
      </div>
    </div>
  );
};

// ─── Admin Panel Layout ────────────────────────────────────────
const AdminPanel = () => {
  const { user } = useAuth();
  const { pathname } = useLocation();

  const current = NAV.find((n) => pathname.startsWith(n.to));

  return (
    <div className="min-h-screen bg-gray-50 flex">

      {/* ── Sidebar (desktop) ─────────────────────────────────── */}
      <aside className="hidden md:flex flex-col w-56 bg-white border-r border-gray-100 sticky top-16 h-[calc(100vh-4rem)] overflow-y-auto shrink-0">

        <div className="px-4 py-4 border-b border-gray-100">
          <p className="text-xs font-bold text-gray-400 uppercase tracking-widest">Admin Panel</p>
        </div>

        <nav className="flex-1 p-3 space-y-0.5">
          {/* Dashboard link */}
          <Link
            to="/admin"
            className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all mb-2 ${pathname === "/admin"
                ? "bg-gray-900 text-white"
                : "text-gray-500 hover:text-gray-900 hover:bg-gray-100"
              }`}
          >
            <span className={`w-8 h-8 rounded-lg flex items-center justify-center text-base ${pathname === "/admin" ? "bg-white/10" : "bg-gray-100"
              }`}>
              🏠
            </span>
            Dashboard
            {pathname === "/admin" && (
              <span className="ml-auto w-1.5 h-1.5 rounded-full bg-white opacity-70" />
            )}
          </Link>

          <p className="text-[10px] font-bold text-gray-300 uppercase tracking-widest px-3 pt-2 pb-1">
            Manage
          </p>

          {NAV.map((item) => (
            <SidebarItem key={item.to} {...item} />
          ))}
        </nav>

        {/* User strip */}
        <div className="p-3 border-t border-gray-100">
          <div className="flex items-center gap-2.5 px-2 py-2 rounded-xl hover:bg-gray-50 transition-colors">
            {user?.avatar ? (
              <img
                src={user.avatar}
                alt=""
                className="w-7 h-7 rounded-full object-cover ring-2 ring-gray-100"
              />
            ) : (
              <div className="w-7 h-7 rounded-full bg-gray-900 text-white flex items-center justify-center text-xs font-bold">
                {user?.displayName?.[0]?.toUpperCase()}
              </div>
            )}
            <div className="min-w-0">
              <p className="text-xs font-semibold text-gray-700 truncate">{user?.displayName}</p>
              <p className="text-[10px] text-gray-400 capitalize">{user?.role}</p>
            </div>
          </div>
        </div>
      </aside>

      {/* ── Main area ─────────────────────────────────────────── */}
      <div className="flex-1 min-w-0 flex flex-col">

        {/* Mobile top bar */}
        <div className="md:hidden flex items-center justify-between px-4 py-3 bg-white border-b border-gray-100 sticky top-16 z-30">
          <p className="font-bold text-gray-900 text-sm">
            {current ? `${current.icon} ${current.label}` : "🏠 Dashboard"}
          </p>
          {user?.avatar ? (
            <img src={user.avatar} alt="" className="w-7 h-7 rounded-full object-cover" />
          ) : (
            <div className="w-7 h-7 rounded-full bg-gray-900 text-white flex items-center justify-center text-xs font-bold">
              {user?.displayName?.[0]?.toUpperCase()}
            </div>
          )}
        </div>

        {/* Page content */}
        <main className="flex-1 pb-24 md:pb-0">
          <Routes>
            <Route index element={<AdminHome />} />
            <Route path="classes" element={<Navigate to="/admin/subjects" replace />} />
            <Route path="subjects" element={<AdminSubjects />} />
            <Route path="chapters" element={<AdminChapters />} />
            <Route path="notes" element={<AdminNotes />} />
            <Route path="quizzes" element={<AdminQuizzes />} />
            <Route path="flashcards" element={<AdminFlashcards />} />
            <Route path="assignments" element={<AdminAssignments />} />
          </Routes>
        </main>
      </div>

      {/* ── Mobile bottom tabs ────────────────────────────────── */}
      <div className="md:hidden fixed bottom-0 left-0 right-0 bg-white/95 backdrop-blur border-t border-gray-100 flex items-center justify-around px-1 py-1 z-40">
        <MobileTab to="/admin" icon="🏠" label="Home" />
        <MobileTab to="/admin/notes" icon="📝" label="Notes" />
        <MobileTab to="/admin/quizzes" icon="✅" label="Quizzes" />
        <MobileTab to="/admin/flashcards" icon="🃏" label="Cards" />
        <MobileTab to="/admin/assignments" icon="📋" label="Tasks" />
      </div>
    </div>
  );
};

export default AdminPanel;

