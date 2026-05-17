import { useEffect, useState } from "react";
import api from "../../services/api";
import type { IClass, ISubject } from "../../types";

// ─── Subject Form ──────────────────────────────────────────────
const SubjectForm = ({
  classes,
  initial,
  onSave,
  onCancel,
}: {
  classes: IClass[];
  initial?: Partial<ISubject>;
  onSave: (data: {
    name: string;
    slug: string;
    icon: string;
    classId: string;
  }) => Promise<void>;
  onCancel: () => void;
}) => {
  const [name, setName] = useState(initial?.name ?? "");
  const [slug, setSlug] = useState(initial?.slug ?? "");
  const [icon, setIcon] = useState(initial?.icon ?? "📚");
  const [classId, setClassId] = useState(
    typeof initial?.classId === "object"
      ? initial.classId._id
      : initial?.classId ?? ""
  );
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState("");

  // ── Auto generate slug from name ──────────────────────────
  const handleNameChange = (value: string) => {
    setName(value);
    if (!initial?._id) {
      // Only auto-generate slug on create, not edit
      setSlug(
        value
          .toLowerCase()
          .trim()
          .replace(/[^a-z0-9\s-]/g, "")
          .replace(/\s+/g, "-")
      );
    }
  };

  const handleSave = async () => {
    if (!name.trim()) { setError("Name is required"); return; }
    if (!slug.trim()) { setError("Slug is required"); return; }
    if (!classId) { setError("Please select a class"); return; }
    if (!/^[a-z0-9-]+$/.test(slug)) {
      setError("Slug can only contain lowercase letters, numbers and hyphens");
      return;
    }
    setIsSaving(true);
    setError("");
    try {
      await onSave({ name: name.trim(), slug, icon, classId });
    } catch (err: any) {
      setError(err?.response?.data?.message ?? "Failed to save");
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 mb-6">
      <h3 className="text-lg font-bold text-gray-800 mb-4">
        {initial?._id ? "Edit Subject" : "Create New Subject"}
      </h3>

      <div className="space-y-4">

        {/* ── Class Selector ────────────────────────────────── */}
        <div>
          <label className="text-sm text-gray-600 mb-1 block">
            Class <span className="text-red-400">*</span>
          </label>
          <select
            value={classId}
            onChange={(e) => setClassId(e.target.value)}
            className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-indigo-400 focus:outline-none text-gray-700"
          >
            <option value="">Select a class</option>
            {classes
              .sort((a, b) => a.grade - b.grade)
              .map((cls) => (
                <option key={cls._id} value={cls._id}>
                  {cls.name}
                </option>
              ))}
          </select>
        </div>

        {/* ── Name ───────────────────────────────────────────── */}
        <div>
          <label className="text-sm text-gray-600 mb-1 block">
            Subject Name <span className="text-red-400">*</span>
          </label>
          <input
            type="text"
            value={name}
            onChange={(e) => handleNameChange(e.target.value)}
            placeholder="e.g. Mathematics"
            className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-indigo-400 focus:outline-none text-gray-700"
          />
        </div>

        {/* ── Slug ───────────────────────────────────────────── */}
        <div>
          <label className="text-sm text-gray-600 mb-1 block">
            Slug <span className="text-red-400">*</span>
          </label>
          <input
            type="text"
            value={slug}
            onChange={(e) => setSlug(e.target.value.toLowerCase())}
            placeholder="e.g. mathematics"
            className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-indigo-400 focus:outline-none text-gray-700 font-mono text-sm"
          />
          <p className="text-xs text-gray-400 mt-1">
            Used in URLs — only lowercase letters, numbers and hyphens
          </p>
        </div>

        {/* ── Icon ───────────────────────────────────────────── */}
        <div>
          <label className="text-sm text-gray-600 mb-1 block">
            Icon (emoji)
          </label>
          <div className="flex items-center gap-3">
            <span className="text-3xl">{icon}</span>
            <input
              type="text"
              value={icon}
              onChange={(e) => setIcon(e.target.value)}
              placeholder="📚"
              className="w-24 px-4 py-3 rounded-xl border border-gray-200 focus:border-indigo-400 focus:outline-none text-gray-700 text-center text-xl"
            />
          </div>
          {/* ── Quick emoji picks ─────────────────────────────── */}
          <div className="flex gap-2 flex-wrap mt-2">
            {["📐", "🔬", "📜", "🌍", "💻", "🎨", "🎵", "📖", "🧮", "⚗️"].map(
              (e) => (
                <button
                  key={e}
                  onClick={() => setIcon(e)}
                  className={`text-xl p-1.5 rounded-lg border transition-all ${icon === e
                      ? "border-indigo-400 bg-indigo-50"
                      : "border-gray-100 hover:border-indigo-200"
                    }`}
                >
                  {e}
                </button>
              )
            )}
          </div>
        </div>

        {error && <p className="text-red-500 text-sm">{error}</p>}

        <div className="flex gap-3 pt-2">
          <button
            onClick={onCancel}
            className="flex-1 py-3 rounded-xl bg-gray-100 text-gray-600 font-medium hover:bg-gray-200 transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={handleSave}
            disabled={isSaving}
            className="flex-1 py-3 rounded-xl bg-indigo-600 text-white font-medium hover:bg-indigo-700 transition-colors disabled:opacity-50"
          >
            {isSaving ? "Saving..." : initial?._id ? "Update" : "Create"}
          </button>
        </div>
      </div>
    </div>
  );
};

// ─── Subject Row ───────────────────────────────────────────────
const SubjectRow = ({
  subject,
  onEdit,
  onDelete,
  onToggle,
}: {
  subject: ISubject;
  onEdit: () => void;
  onDelete: () => void;
  onToggle: () => void;
}) => {
  const cls =
    typeof subject.classId === "object" ? subject.classId : null;

  return (
    <div className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100 flex items-center justify-between gap-4 flex-wrap">
      <div className="flex items-center gap-4">
        <span className="text-3xl">{subject.icon}</span>
        <div>
          <p className="font-semibold text-gray-800">{subject.name}</p>
          <div className="flex items-center gap-2 mt-0.5">
            <span className="text-xs text-gray-400 font-mono">
              {subject.slug}
            </span>
            {cls && (
              <span className="text-xs bg-indigo-50 text-indigo-600 px-2 py-0.5 rounded-lg">
                {cls.name}
              </span>
            )}
          </div>
        </div>
      </div>

      <div className="flex items-center gap-2">
        <button
          onClick={onToggle}
          className={`text-xs px-3 py-1.5 rounded-lg border font-medium transition-all ${subject.isActive
              ? "bg-green-50 text-green-600 border-green-200 hover:bg-green-100"
              : "bg-gray-50 text-gray-400 border-gray-200 hover:bg-gray-100"
            }`}
        >
          {subject.isActive ? "Active" : "Inactive"}
        </button>
        <button
          onClick={onEdit}
          className="text-xs px-3 py-1.5 rounded-lg border border-gray-200 text-gray-600 hover:border-indigo-300 hover:text-indigo-600 transition-all"
        >
          ✏️ Edit
        </button>
        <button
          onClick={onDelete}
          className="text-xs px-3 py-1.5 rounded-lg border border-red-100 text-red-500 hover:bg-red-50 transition-all"
        >
          🗑️ Delete
        </button>
      </div>
    </div>
  );
};

// ─── Admin Subjects Page ───────────────────────────────────────
const AdminSubjects = () => {
  const [classes, setClasses] = useState<IClass[]>([]);
  const [subjects, setSubjects] = useState<ISubject[]>([]);
  const [filterClassId, setFilterClassId] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingSubject, setEditingSubject] = useState<ISubject | null>(null);

  // ── Fetch classes for selector ─────────────────────────────
  useEffect(() => {
    const fetchClasses = async () => {
      try {
        const { data } = await api.get("/classes");
        setClasses(data.data);
        if (data.data.length > 0) {
          setFilterClassId(data.data[0]._id);
        }
      } catch {
        console.error("Failed to fetch classes");
      }
    };
    fetchClasses();
  }, []);

  // ── Fetch subjects when filter changes ────────────────────
  const fetchSubjects = async () => {
    if (!filterClassId) return;
    setIsLoading(true);
    try {
      const { data } = await api.get(
        `/subjects?classId=${filterClassId}`
      );
      setSubjects(data.data);
    } catch {
      console.error("Failed to fetch subjects");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchSubjects();
  }, [filterClassId]);

  // ── Create ─────────────────────────────────────────────────
  const handleCreate = async (formData: {
    name: string;
    slug: string;
    icon: string;
    classId: string;
  }) => {
    await api.post("/subjects", formData);
    setShowForm(false);
    fetchSubjects();
  };

  // ── Update ─────────────────────────────────────────────────
  const handleUpdate = async (formData: {
    name: string;
    slug: string;
    icon: string;
    classId: string;
  }) => {
    await api.patch(`/subjects/${editingSubject?._id}`, formData);
    setEditingSubject(null);
    fetchSubjects();
  };

  // ── Toggle ─────────────────────────────────────────────────
  const handleToggle = async (subject: ISubject) => {
    await api.patch(`/subjects/${subject._id}`, {
      isActive: !subject.isActive,
    });
    fetchSubjects();
  };

  // ── Delete ─────────────────────────────────────────────────
  const handleDelete = async (subject: ISubject) => {
    if (!confirm(`Delete "${subject.name}"? This will hide all its chapters.`))
      return;
    await api.delete(`/subjects/${subject._id}`);
    fetchSubjects();
  };

  return (
    <div className="p-6 max-w-4xl mx-auto">

      {/* ── Header ────────────────────────────────────────────── */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">Subjects</h1>
          <p className="text-gray-500 text-sm mt-1">
            Manage subjects per class
          </p>
        </div>
        {!showForm && !editingSubject && (
          <button
            onClick={() => setShowForm(true)}
            className="bg-indigo-600 text-white px-5 py-2.5 rounded-xl text-sm font-medium hover:bg-indigo-700 transition-colors"
          >
            + New Subject
          </button>
        )}
      </div>

      {/* ── Form ──────────────────────────────────────────────── */}
      {showForm && (
        <SubjectForm
          classes={classes}
          onSave={handleCreate}
          onCancel={() => setShowForm(false)}
        />
      )}

      {editingSubject && (
        <SubjectForm
          classes={classes}
          initial={editingSubject}
          onSave={handleUpdate}
          onCancel={() => setEditingSubject(null)}
        />
      )}

      {/* ── Class Filter ──────────────────────────────────────── */}
      <div className="flex gap-2 flex-wrap mb-6">
        {classes
          .sort((a, b) => a.grade - b.grade)
          .map((cls) => (
            <button
              key={cls._id}
              onClick={() => setFilterClassId(cls._id)}
              className={`px-4 py-1.5 rounded-xl text-sm font-medium border transition-all ${filterClassId === cls._id
                  ? "bg-indigo-600 text-white border-indigo-600"
                  : "bg-white text-gray-600 border-gray-200 hover:border-indigo-300"
                }`}
            >
              {cls.name}
            </button>
          ))}
      </div>

      {/* ── Subjects List ─────────────────────────────────────── */}
      {isLoading ? (
        <div className="space-y-3">
          {Array.from({ length: 4 }).map((_, i) => (
            <div
              key={i}
              className="bg-gray-100 rounded-2xl h-20 animate-pulse"
            />
          ))}
        </div>
      ) : subjects.length === 0 ? (
        <div className="text-center py-16 text-gray-400">
          <p className="text-4xl mb-3">📚</p>
          <p>No subjects yet for this class.</p>
        </div>
      ) : (
        <div className="space-y-3">
          {subjects.map((subject) => (
            <SubjectRow
              key={subject._id}
              subject={subject}
              onEdit={() => {
                setShowForm(false);
                setEditingSubject(subject);
              }}
              onDelete={() => handleDelete(subject)}
              onToggle={() => handleToggle(subject)}
            />
          ))}
        </div>
      )}
    </div>
  );
};

export default AdminSubjects;
