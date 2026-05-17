import { useEffect, useState } from "react";
import { useAuth } from "../../context/AuthContext";
import api from "../../services/api";
import type { ITestResult, IUser } from "../../types";

// ─── Stat Card ─────────────────────────────────────────────────
const StatCard = ({
  icon,
  label,
  value,
  color,
}: {
  icon: string;
  label: string;
  value: string | number;
  color: string;
}) => (
  <div className={`${color} rounded-2xl p-5 flex items-center gap-4`}>
    <div className="text-3xl">{icon}</div>
    <div>
      <p className="text-2xl font-bold">{value}</p>
      <p className="text-sm opacity-70">{label}</p>
    </div>
  </div>
);

// ─── Result Row ────────────────────────────────────────────────
const ResultRow = ({ result }: { result: ITestResult }) => {
  const quiz =
    typeof result.quizId === "object" ? result.quizId : null;
  const subject =
    typeof result.subjectId === "object" ? result.subjectId : null;

  return (
    <div className="flex items-center justify-between py-4 border-b border-gray-50 last:border-0 gap-4 flex-wrap">
      <div className="flex-1 min-w-0">
        <p className="font-medium text-gray-800 truncate">
          {quiz?.title ?? "Quiz"}
        </p>
        <p className="text-xs text-gray-400 mt-0.5">
          {subject?.name} ·{" "}
          {new Date(result.createdAt).toLocaleDateString("en-IN", {
            day: "numeric",
            month: "short",
            year: "numeric",
          })}
        </p>
      </div>

      {/* ── Score Badge ───────────────────────────────────── */}
      <div className="flex items-center gap-3">
        <div
          className={`text-sm font-bold px-3 py-1 rounded-xl ${result.isPassed
              ? "bg-green-50 text-green-600"
              : "bg-red-50 text-red-500"
            }`}
        >
          {result.percentage}%
        </div>
        <div className="text-xs text-gray-400">
          {result.marksObtained}/{result.totalMarks}
        </div>
        <div
          className={`text-xs px-2 py-1 rounded-lg font-medium ${result.isPassed
              ? "bg-green-50 text-green-600"
              : "bg-red-50 text-red-500"
            }`}
        >
          {result.isPassed ? "Passed" : "Failed"}
        </div>
      </div>
    </div>
  );
};

// ─── Edit Profile Modal ────────────────────────────────────────
const EditProfileModal = ({
  currentName,
  onSave,
  onClose,
}: {
  currentName: string;
  onSave: (name: string) => Promise<void>;
  onClose: () => void;
}) => {
  const [name, setName] = useState(currentName);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState("");

  const handleSave = async () => {
    if (name.trim().length < 2) {
      setError("Name must be at least 2 characters");
      return;
    }
    setIsSaving(true);
    try {
      await onSave(name.trim());
      onClose();
    } catch {
      setError("Failed to update name. Please try again.");
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 px-4">
      <div className="bg-white rounded-2xl shadow-2xl p-6 w-full max-w-sm">
        <h3 className="text-lg font-bold text-gray-800 mb-4">
          Edit Display Name
        </h3>
        <input
          type="text"
          value={name}
          onChange={(e) => {
            setName(e.target.value);
            setError("");
          }}
          placeholder="Your name"
          className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-indigo-400 focus:outline-none text-gray-700 mb-2"
        />
        {error && (
          <p className="text-red-500 text-xs mb-3">{error}</p>
        )}
        <div className="flex gap-3 mt-4">
          <button
            onClick={onClose}
            className="flex-1 py-3 rounded-xl bg-gray-100 text-gray-600 font-medium hover:bg-gray-200 transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={handleSave}
            disabled={isSaving}
            className="flex-1 py-3 rounded-xl bg-indigo-600 text-white font-medium hover:bg-indigo-700 transition-colors disabled:opacity-50"
          >
            {isSaving ? "Saving..." : "Save"}
          </button>
        </div>
      </div>
    </div>
  );
};

// ─── Child Card ────────────────────────────────────────────────
const ChildCard = ({ child }: { child: IUser }) => (
  <div className="bg-white rounded-2xl p-4 shadow-sm border border-gray-100 flex items-center gap-4">
    <div className="w-12 h-12 rounded-full bg-indigo-100 flex items-center justify-center text-indigo-600 font-bold text-lg">
      {child.displayName?.[0]?.toUpperCase()}
    </div>
    <div>
      <p className="font-semibold text-gray-800">{child.displayName}</p>
      <p className="text-xs text-gray-500">Class {child.class}</p>
    </div>
  </div>
);

// ─── Add Child Modal ───────────────────────────────────────────
const AddChildModal = ({
  onAdd,
  onClose,
}: {
  onAdd: (name: string, cls: number) => Promise<void>;
  onClose: () => void;
}) => {
  const [name, setName] = useState("");
  const [cls, setCls] = useState(1);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState("");

  const handleAdd = async () => {
    if (name.trim().length < 2) {
      setError("Name must be at least 2 characters");
      return;
    }
    setIsSaving(true);
    try {
      await onAdd(name.trim(), cls);
      onClose();
    } catch {
      setError("Failed to add child. Please try again.");
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 px-4">
      <div className="bg-white rounded-2xl shadow-2xl p-6 w-full max-w-sm">
        <h3 className="text-lg font-bold text-gray-800 mb-4">
          Add Child
        </h3>

        {/* ── Child Name ────────────────────────────────────── */}
        <label className="text-sm text-gray-600 mb-1 block">
          Child's Name
        </label>
        <input
          type="text"
          value={name}
          onChange={(e) => {
            setName(e.target.value);
            setError("");
          }}
          placeholder="Enter child's name"
          className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-indigo-400 focus:outline-none text-gray-700 mb-4"
        />

        {/* ── Class Selector ────────────────────────────────── */}
        <label className="text-sm text-gray-600 mb-1 block">
          Class
        </label>
        <select
          value={cls}
          onChange={(e) => setCls(Number(e.target.value))}
          className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-indigo-400 focus:outline-none text-gray-700 mb-2"
        >
          {Array.from({ length: 10 }, (_, i) => i + 1).map((g) => (
            <option key={g} value={g}>
              Class {g}
            </option>
          ))}
        </select>

        {error && (
          <p className="text-red-500 text-xs mb-3">{error}</p>
        )}

        <div className="flex gap-3 mt-4">
          <button
            onClick={onClose}
            className="flex-1 py-3 rounded-xl bg-gray-100 text-gray-600 font-medium hover:bg-gray-200 transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={handleAdd}
            disabled={isSaving}
            className="flex-1 py-3 rounded-xl bg-indigo-600 text-white font-medium hover:bg-indigo-700 transition-colors disabled:opacity-50"
          >
            {isSaving ? "Adding..." : "Add Child"}
          </button>
        </div>
      </div>
    </div>
  );
};

// ─── Profile Page ──────────────────────────────────────────────
const ProfilePage = () => {
  const { user, updateUser } = useAuth();
  const [results, setResults] = useState<ITestResult[]>([]);
  const [isLoadingResults, setIsLoadingResults] = useState(true);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showAddChildModal, setShowAddChildModal] = useState(false);

  // ── Fetch quiz history ─────────────────────────────────────
  useEffect(() => {
    const fetchResults = async () => {
      try {
        const { data } = await api.get("/test-results/student");
        setResults(data.data);
      } catch {
        console.error("Failed to fetch results");
      } finally {
        setIsLoadingResults(false);
      }
    };
    fetchResults();
  }, []);

  // ── Calculate stats ────────────────────────────────────────
  const totalQuizzes = results.length;
  const passed = results.filter((r) => r.isPassed).length;
  const avgScore =
    totalQuizzes > 0
      ? Math.round(
        results.reduce((sum, r) => sum + r.percentage, 0) / totalQuizzes
      )
      : 0;
  const bestScore =
    totalQuizzes > 0 ? Math.max(...results.map((r) => r.percentage)) : 0;

  // ── Update display name ────────────────────────────────────
  const handleUpdateName = async (name: string) => {
    const { data } = await api.patch("/auth/update-profile", {
      displayName: name,
    });
    updateUser(data.data);
  };

  // ── Add child ──────────────────────────────────────────────
  const handleAddChild = async (name: string, cls: number) => {
    await api.post("/auth/add-child", {
      displayName: name,
      class: cls,
    });
    // Refresh user to get updated children list
    const { data } = await api.get("/auth/me");
    updateUser(data.data);
  };

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">

      {/* ── Profile Header ────────────────────────────────────── */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 mb-6">
        <div className="flex items-center gap-5 flex-wrap">

          {/* ── Avatar ──────────────────────────────────────── */}
          {user?.avatar ? (
            <img
              src={user.avatar}
              alt={user.displayName}
              className="w-20 h-20 rounded-full object-cover border-4 border-indigo-100"
            />
          ) : (
            <div className="w-20 h-20 rounded-full bg-indigo-100 flex items-center justify-center text-indigo-600 font-bold text-3xl">
              {user?.displayName?.[0]?.toUpperCase()}
            </div>
          )}

          {/* ── Info ────────────────────────────────────────── */}
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-3 flex-wrap">
              <h1 className="text-2xl font-bold text-gray-800">
                {user?.displayName}
              </h1>
              <button
                onClick={() => setShowEditModal(true)}
                className="text-xs text-indigo-600 border border-indigo-200 px-3 py-1 rounded-lg hover:bg-indigo-50 transition-colors"
              >
                ✏️ Edit Name
              </button>
            </div>
            <p className="text-gray-500 text-sm mt-1">{user?.email}</p>
            <span className="inline-block mt-2 text-xs bg-indigo-50 text-indigo-600 border border-indigo-100 px-3 py-1 rounded-lg capitalize font-medium">
              {user?.role}
            </span>
            {user?.role === "student" && user.class && (
              <span className="inline-block mt-2 ml-2 text-xs bg-purple-50 text-purple-600 border border-purple-100 px-3 py-1 rounded-lg font-medium">
                Class {user.class}
              </span>
            )}
          </div>
        </div>
      </div>

      {/* ── Stats ─────────────────────────────────────────────── */}
      {user?.role === "student" && (
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
          <StatCard
            icon="✅"
            label="Quizzes Taken"
            value={totalQuizzes}
            color="bg-indigo-50 text-indigo-700"
          />
          <StatCard
            icon="🎯"
            label="Passed"
            value={passed}
            color="bg-green-50 text-green-700"
          />
          <StatCard
            icon="📊"
            label="Avg Score"
            value={`${avgScore}%`}
            color="bg-purple-50 text-purple-700"
          />
          <StatCard
            icon="🏆"
            label="Best Score"
            value={`${bestScore}%`}
            color="bg-yellow-50 text-yellow-700"
          />
        </div>
      )}

      {/* ── Children Section — parent only ────────────────────── */}
      {user?.role === "parent" && (
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 mb-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-bold text-gray-800">
              My Children
            </h2>
            <button
              onClick={() => setShowAddChildModal(true)}
              className="text-sm bg-indigo-600 text-white px-4 py-2 rounded-xl hover:bg-indigo-700 transition-colors"
            >
              + Add Child
            </button>
          </div>

          {user.children && user.children.length > 0 ? (
            <div className="space-y-3">
              {user.children.map((child) => (
                <ChildCard
                  key={typeof child === "object" ? child._id : child}
                  child={typeof child === "object" ? child : ({ _id: child, displayName: "Child" } as IUser)}
                />
              ))}
            </div>
          ) : (
            <div className="text-center py-8 text-gray-400">
              <p className="text-3xl mb-2">👨‍👧</p>
              <p className="text-sm">No children added yet.</p>
            </div>
          )}
        </div>
      )}

      {/* ── Quiz History — student only ────────────────────────── */}
      {user?.role === "student" && (
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
          <h2 className="text-lg font-bold text-gray-800 mb-4">
            Quiz History
          </h2>

          {isLoadingResults ? (
            <div className="space-y-4">
              {Array.from({ length: 4 }).map((_, i) => (
                <div
                  key={i}
                  className="h-14 bg-gray-100 rounded-xl animate-pulse"
                />
              ))}
            </div>
          ) : results.length === 0 ? (
            <div className="text-center py-10 text-gray-400">
              <p className="text-3xl mb-2">📝</p>
              <p className="text-sm">No quizzes taken yet.</p>
            </div>
          ) : (
            <div>
              {results.map((result) => (
                <ResultRow key={result._id} result={result} />
              ))}
            </div>
          )}
        </div>
      )}

      {/* ── Modals ────────────────────────────────────────────── */}
      {showEditModal && (
        <EditProfileModal
          currentName={user?.displayName ?? ""}
          onSave={handleUpdateName}
          onClose={() => setShowEditModal(false)}
        />
      )}

      {showAddChildModal && (
        <AddChildModal
          onAdd={handleAddChild}
          onClose={() => setShowAddChildModal(false)}
        />
      )}
    </div>
  );
};

export default ProfilePage;
