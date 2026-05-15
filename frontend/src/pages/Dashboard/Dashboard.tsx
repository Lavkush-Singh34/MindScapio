import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import api from "../../services/api";
import type { IClass } from "../../types";

// ─── Quick Link Card ───────────────────────────────────────────
const QuickLinkCard = ({
  icon,
  title,
  description,
  to,
  color,
}: {
  icon: string;
  title: string;
  description: string;
  to: string;
  color: string;
}) => (
  <Link
    to={to}
    className={`${color} rounded-2xl p-6 text-white hover:opacity-90 transition-opacity shadow-sm`}
  >
    <div className="text-3xl mb-3">{icon}</div>
    <h3 className="font-semibold text-lg">{title}</h3>
    <p className="text-sm opacity-80 mt-1">{description}</p>
  </Link>
);

// ─── Stat Card ─────────────────────────────────────────────────
const StatCard = ({
  icon,
  label,
  value,
}: {
  icon: string;
  label: string;
  value: string | number;
}) => (
  <div className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100 flex items-center gap-4">
    <div className="text-3xl">{icon}</div>
    <div>
      <p className="text-2xl font-bold text-gray-800">{value}</p>
      <p className="text-sm text-gray-500">{label}</p>
    </div>
  </div>
);

// ─── Dashboard ─────────────────────────────────────────────────
const Dashboard = () => {
  const { user } = useAuth();
  const [classes, setClasses] = useState<IClass[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // ── Fetch all classes ──────────────────────────────────────
  useEffect(() => {
    const fetchClasses = async () => {
      try {
        const { data } = await api.get("/classes");
        setClasses(data.data);
      } catch {
        console.error("Failed to fetch classes");
      } finally {
        setIsLoading(false);
      }
    };
    fetchClasses();
  }, []);

  // ── Greeting based on time of day ─────────────────────────
  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return "Good Morning";
    if (hour < 17) return "Good Afternoon";
    return "Good Evening";
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">

      {/* ── Welcome Header ──────────────────────────────────── */}
      <div className="mb-8">
        <h1 className="text-2xl sm:text-3xl font-bold text-gray-800">
          {getGreeting()}, {user?.displayName?.split(" ")[0]} 👋
        </h1>
        <p className="text-gray-500 mt-1">
          {user?.role === "admin" || user?.role === "teacher"
            ? "Manage your content and track student progress"
            : "Ready to learn something new today?"}
        </p>
      </div>

      {/* ── Stats Row ───────────────────────────────────────── */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <StatCard icon="📚" label="Classes Available" value={10} />
        <StatCard icon="📖" label="Notes Published" value="—" />
        <StatCard icon="✅" label="Quizzes Taken" value="—" />
        <StatCard icon="🏆" label="Best Score" value="—" />
      </div>

      {/* ── Quick Links ─────────────────────────────────────── */}
      <div className="mb-8">
        <h2 className="text-lg font-semibold text-gray-800 mb-4">
          Quick Access
        </h2>
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <QuickLinkCard
            icon="📚"
            title="Notes"
            description="Read chapter notes"
            to="/notes"
            color="bg-indigo-500"
          />
          <QuickLinkCard
            icon="🧠"
            title="Flashcards"
            description="Quick revision"
            to="/flashcards"
            color="bg-purple-500"
          />
          <QuickLinkCard
            icon="✅"
            title="Quizzes"
            description="Test yourself"
            to="/notes"
            color="bg-green-500"
          />
          <QuickLinkCard
            icon="📝"
            title="Assignments"
            description="View homework"
            to="/assignments"
            color="bg-orange-500"
          />
        </div>
      </div>

      {/* ── Admin Quick Links ────────────────────────────────── */}
      {(user?.role === "admin" || user?.role === "teacher") && (
        <div className="mb-8">
          <h2 className="text-lg font-semibold text-gray-800 mb-4">
            Admin Tools
          </h2>
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            <QuickLinkCard
              icon="⚙️"
              title="Admin Panel"
              description="Manage content"
              to="/admin"
              color="bg-gray-700"
            />
            <QuickLinkCard
              icon="➕"
              title="Add Notes"
              description="Create new notes"
              to="/admin/notes"
              color="bg-teal-500"
            />
            <QuickLinkCard
              icon="❓"
              title="Add Quiz"
              description="Create a quiz"
              to="/admin/quizzes"
              color="bg-blue-500"
            />
            <QuickLinkCard
              icon="🃏"
              title="Add Flashcards"
              description="Create flashcards"
              to="/admin/flashcards"
              color="bg-pink-500"
            />
          </div>
        </div>
      )}

      {/* ── Browse by Class ──────────────────────────────────── */}
      <div>
        <h2 className="text-lg font-semibold text-gray-800 mb-4">
          Browse by Class
        </h2>
        {isLoading ? (
          <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
            {Array.from({ length: 10 }).map((_, i) => (
              <div
                key={i}
                className="bg-gray-100 rounded-2xl h-20 animate-pulse"
              />
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
            {classes.map((cls) => (
              <Link
                key={cls._id}
                to={`/notes?classId=${cls._id}`}
                className="bg-white border border-gray-100 hover:border-indigo-200 hover:bg-indigo-50 rounded-2xl p-4 text-center transition-all shadow-sm group"
              >
                <p className="text-2xl font-bold text-indigo-600 group-hover:scale-110 transition-transform">
                  {cls.grade}
                </p>
                <p className="text-xs text-gray-500 mt-1">{cls.name}</p>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default Dashboard;
