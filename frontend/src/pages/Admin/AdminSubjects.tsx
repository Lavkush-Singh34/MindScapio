
import { useEffect, useState, useCallback } from "react";
import api from "../../services/api";
import type { IClass, ISubject } from "../../types";

const EMOJI_PICKS = ["📐", "🔬", "📜", "🌍", "💻", "🎨", "🎵", "📖", "🧮", "⚗️", "🏛️", "🌱", "🧬", "📊", "✏️"];

// ─── Slide-over Subject Form ───────────────────────────────────
const SubjectForm = ({
  classes,
  initial,
  onSave,
  onClose,
}: {
  classes: IClass[];
  initial?: ISubject | null;
  onSave: () => void;
  onClose: () => void;
}) => {
  const [name, setName] = useState(initial?.name ?? "");
  const [slug, setSlug] = useState(initial?.slug ?? "");
  const [icon, setIcon] = useState(initial?.icon ?? "📚");
  const [classId, setClassId] = useState(
    typeof initial?.classId === "object" ? initial.classId._id : initial?.classId ?? ""
  );
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState("");

  const handleNameChange = (val: string) => {
    setName(val);
    if (!initial?._id) {
      setSlug(
        val.toLowerCase().trim()
          .replace(/[^a-z0-9\s-]/g, "")
          .replace(/\s+/g, "-")
      );
    }
    setError("");
  };

  const handleSave = async () => {
    if (!name.trim()) return setError("Name is required");
    if (!slug.trim()) return setError("Slug is required");
    if (!classId) return setError("Select a class");
    if (!/^[a-z0-9-]+$/.test(slug)) return setError("Slug: only lowercase letters, numbers, hyphens");
    setIsSaving(true);
    setError("");
    try {
      const payload = { name: name.trim(), slug, icon, classId };
      if (initial?._id) {
        await api.patch(`/subjects/${initial._id}`, payload);
      } else {
        await api.post("/subjects", payload);
      }
      onSave();
    } catch (err: any) {
      setError(err?.response?.data?.message ?? "Failed to save");
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <>
      {/* Backdrop */}
      <div className="fixed inset-0 bg-black/30 backdrop-blur-sm z-40" onClick={onClose} />

      {/* Panel */}
      <div className="fixed top-0 right-0 h-full w-full max-w-md bg-white z-50 shadow-2xl flex flex-col">

        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100 shrink-0">
          <div>
            <h2 className="font-bold text-gray-900 text-lg">
              {initial ? "Edit Subject" : "New Subject"}
            </h2>
            <p className="text-xs text-gray-400 mt-0.5">
              {initial ? "Update subject details" : "Add a subject to a class"}
            </p>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 flex items-center justify-center rounded-xl bg-gray-100 hover:bg-gray-200 text-gray-500 transition-colors text-lg"
          >
            ×
          </button>
        </div>

        {/* Body */}
        <div className="flex-1 overflow-y-auto px-6 py-5 space-y-5">

          {/* Class */}
          <div>
            <label className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-1.5 block">
              Class <span className="text-red-400">*</span>
            </label>
            <select
              value={classId}
              onChange={(e) => { setClassId(e.target.value); setError(""); }}
              className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-gray-400 focus:outline-none text-gray-800 text-sm bg-gray-50"
            >
              <option value="">Select a class</option>
              {classes.sort((a, b) => a.grade - b.grade).map((cls) => (
                <option key={cls._id} value={cls._id}>{cls.name}</option>
              ))}
            </select>
          </div>

          {/* Icon picker */}
          <div>
            <label className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-1.5 block">
              Icon
            </label>
            <div className="flex items-center gap-3 mb-2">
              <span className="text-4xl w-12 h-12 flex items-center justify-center bg-gray-50 rounded-xl border border-gray-200">
                {icon}
              </span>
              <input
                type="text"
                value={icon}
                onChange={(e) => setIcon(e.target.value)}
                className="w-20 px-3 py-2.5 rounded-xl border border-gray-200 focus:border-gray-400 focus:outline-none text-center text-xl bg-gray-50"
                placeholder="📚"
              />
              <p className="text-xs text-gray-400">Type or pick below</p>
            </div>
            <div className="flex gap-1.5 flex-wrap">
              {EMOJI_PICKS.map((e) => (
                <button
                  key={e}
                  onClick={() => setIcon(e)}
                  className={`w-9 h-9 rounded-xl text-xl flex items-center justify-center border transition-all ${icon === e
                      ? "border-gray-900 bg-gray-900 grayscale-0"
                      : "border-gray-100 bg-gray-50 hover:border-gray-300"
                    }`}
                >
                  {e}
                </button>
              ))}
            </div>
          </div>

          {/* Name */}
          <div>
            <label className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-1.5 block">
              Subject Name <span className="text-red-400">*</span>
            </label>
            <input
              type="text"
              value={name}
              onChange={(e) => handleNameChange(e.target.value)}
              placeholder="e.g. Mathematics"
              className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-gray-400 focus:outline-none text-gray-800 text-sm bg-gray-50"
            />
          </div>

          {/* Slug */}
          <div>
            <label className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-1.5 block">
              Slug <span className="text-red-400">*</span>
            </label>
            <input
              type="text"
              value={slug}
              onChange={(e) => { setSlug(e.target.value.toLowerCase()); setError(""); }}
              placeholder="e.g. mathematics"
              className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-gray-400 focus:outline-none text-gray-800 text-sm bg-gray-50 font-mono"
            />
            <p className="text-xs text-gray-400 mt-1">Used in URLs — auto-generated from name</p>
          </div>

          {error && (
            <div className="bg-red-50 border border-red-100 text-red-600 text-sm px-4 py-3 rounded-xl">
              {error}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="px-6 py-4 border-t border-gray-100 flex gap-3 shrink-0 bg-gray-50">
          <button
            onClick={onClose}
            className="flex-1 py-3 rounded-xl bg-white border border-gray-200 text-gray-600 font-medium text-sm hover:bg-gray-50 transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={handleSave}
            disabled={isSaving}
            className="flex-1 py-3 rounded-xl bg-gray-900 text-white font-medium text-sm hover:bg-gray-800 transition-colors disabled:opacity-50"
          >
            {isSaving ? "Saving…" : initial ? "Update Subject" : "Create Subject"}
          </button>
        </div>
      </div>
    </>
  );
};

// ─── Subject Card ──────────────────────────────────────────────
const SubjectCard = ({
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
  const cls = typeof subject.classId === "object" ? subject.classId : null;

  return (
    <div className="group bg-white rounded-2xl border border-gray-100 hover:border-gray-200 hover:shadow-sm transition-all duration-200 overflow-hidden">
      <div className="flex items-center gap-4 p-5">
        {/* Icon */}
        <div className="w-12 h-12 rounded-xl bg-gray-50 border border-gray-100 flex items-center justify-center text-2xl shrink-0">
          {subject.icon}
        </div>

        {/* Info */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <p className="font-semibold text-gray-900">{subject.name}</p>
            {cls && (
              <span className="text-xs bg-violet-50 text-violet-600 px-2 py-0.5 rounded-lg font-medium">
                {cls.name}
              </span>
            )}
          </div>
          <p className="text-xs text-gray-400 font-mono mt-0.5">{subject.slug}</p>
        </div>

        {/* Status toggle */}
        <button
          onClick={onToggle}
          className={`shrink-0 text-xs px-3 py-1.5 rounded-lg border font-medium transition-all ${subject.isActive
              ? "bg-green-50 text-green-700 border-green-200 hover:bg-green-100"
              : "bg-gray-50 text-gray-400 border-gray-200 hover:bg-gray-100"
            }`}
        >
          {subject.isActive ? "Active" : "Inactive"}
        </button>
      </div>

      {/* Hover actions */}
      <div className="flex border-t border-gray-50 bg-gray-50/50 divide-x divide-gray-100 opacity-0 group-hover:opacity-100 transition-opacity">
        <button
          onClick={onEdit}
          className="flex-1 py-2 text-xs font-medium text-gray-600 hover:text-gray-900 hover:bg-gray-100 transition-colors"
        >
          ✏️ Edit
        </button>
        <button
          onClick={onDelete}
          className="flex-1 py-2 text-xs font-medium text-red-400 hover:text-red-600 hover:bg-red-50 transition-colors"
        >
          🗑 Delete
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
  const [isLoading, setIsLoading] = useState(false);
  const [formOpen, setFormOpen] = useState(false);
  const [editingSubject, setEditingSubject] = useState<ISubject | null>(null);

  // Fetch classes once
  useEffect(() => {
    api.get("/classes")
      .then(({ data }) => {
        setClasses(data.data);
        if (data.data.length > 0) setFilterClassId(data.data[0]._id);
      })
      .catch(() => { });
  }, []);

  // Fetch subjects when filter changes
  const fetchSubjects = useCallback(async () => {
    if (!filterClassId) return;
    setIsLoading(true);
    try {
      const { data } = await api.get(`/subjects?classId=${filterClassId}`);
      setSubjects(data.data);
    } catch {
      console.error("Failed to fetch subjects");
    } finally {
      setIsLoading(false);
    }
  }, [filterClassId]);

  useEffect(() => { fetchSubjects(); }, [fetchSubjects]);

  const handleSaved = () => {
    setFormOpen(false);
    setEditingSubject(null);
    fetchSubjects();
  };

  const handleToggle = async (subject: ISubject) => {
    await api.patch(`/subjects/${subject._id}`, { isActive: !subject.isActive });
    fetchSubjects();
  };

  const handleDelete = async (subject: ISubject) => {
    if (!confirm(`Delete "${subject.name}"? This will hide all its chapters.`)) return;
    await api.delete(`/subjects/${subject._id}`);
    fetchSubjects();
  };

  const isFormOpen = formOpen || !!editingSubject;

  return (
    <div className="p-6 max-w-4xl mx-auto">

      {/* Header */}
      <div className="flex items-center justify-between mb-5">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 tracking-tight">Subjects</h1>
          <p className="text-gray-400 text-sm mt-0.5">Manage subjects per class</p>
        </div>
        <button
          onClick={() => { setEditingSubject(null); setFormOpen(true); }}
          className="bg-gray-900 text-white px-5 py-2.5 rounded-xl text-sm font-semibold hover:bg-gray-800 transition-colors"
        >
          + New Subject
        </button>
      </div>

      {/* Class filter */}
      <div className="bg-white border border-gray-100 rounded-2xl px-5 py-4 mb-5">
        <p className="text-[10px] font-bold text-gray-300 uppercase tracking-widest mb-2">Class</p>
        <div className="flex gap-1.5 flex-wrap">
          {classes.sort((a, b) => a.grade - b.grade).map((cls) => (
            <button
              key={cls._id}
              onClick={() => setFilterClassId(cls._id)}
              className={`px-3 py-1 rounded-lg text-xs font-semibold border transition-all ${filterClassId === cls._id
                  ? "bg-gray-900 text-white border-gray-900"
                  : "bg-white text-gray-500 border-gray-200 hover:border-gray-400"
                }`}
            >
              {cls.name}
            </button>
          ))}
        </div>
      </div>

      {/* Subjects list */}
      {isLoading ? (
        <div className="space-y-3">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="bg-gray-100 rounded-2xl h-20 animate-pulse" />
          ))}
        </div>
      ) : subjects.length === 0 ? (
        <div className="text-center py-20 text-gray-300">
          <p className="text-5xl mb-3">📚</p>
          <p className="text-sm font-medium">No subjects for this class yet</p>
          <button
            onClick={() => { setEditingSubject(null); setFormOpen(true); }}
            className="mt-4 text-sm text-gray-900 font-semibold underline underline-offset-2"
          >
            Create the first one →
          </button>
        </div>
      ) : (
        <div className="space-y-3">
          {subjects.map((subject) => (
            <SubjectCard
              key={subject._id}
              subject={subject}
              onEdit={() => { setFormOpen(false); setEditingSubject(subject); }}
              onDelete={() => handleDelete(subject)}
              onToggle={() => handleToggle(subject)}
            />
          ))}
        </div>
      )}

      {/* Slide-over form */}
      {isFormOpen && (
        <SubjectForm
          classes={classes}
          initial={editingSubject}
          onSave={handleSaved}
          onClose={() => { setFormOpen(false); setEditingSubject(null); }}
        />
      )}
    </div>
  );
};

export default AdminSubjects;

