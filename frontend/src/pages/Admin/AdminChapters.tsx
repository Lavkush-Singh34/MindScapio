import { useEffect, useState } from "react";
import api from "../../services/api";
import type { IClass, ISubject, IChapter } from "../../types";

// ─── Chapter Form ──────────────────────────────────────────────
const ChapterForm = ({
  classes,
  subjects,
  onClassChange,
  initial,
  onSave,
  onCancel,
}: {
  classes: IClass[];
  subjects: ISubject[];
  onClassChange: (classId: string) => void;
  initial?: Partial<IChapter>;
  onSave: (data: {
    name: string;
    slug: string;
    order: number;
    description: string;
    subjectId: string;
    classId: string;
  }) => Promise<void>;
  onCancel: () => void;
}) => {
  const [name, setName] = useState(initial?.name ?? "");
  const [slug, setSlug] = useState(initial?.slug ?? "");
  const [order, setOrder] = useState(initial?.order ?? 1);
  const [description, setDescription] = useState(initial?.description ?? "");
  const [classId, setClassId] = useState(
    typeof initial?.classId === "object"
      ? initial.classId._id
      : initial?.classId ?? ""
  );
  const [subjectId, setSubjectId] = useState(
    typeof initial?.subjectId === "object"
      ? initial.subjectId._id
      : initial?.subjectId ?? ""
  );
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState("");

  // ── Auto generate slug from name ──────────────────────────
  const handleNameChange = (value: string) => {
    setName(value);
    if (!initial?._id) {
      setSlug(
        value
          .toLowerCase()
          .trim()
          .replace(/[^a-z0-9\s-]/g, "")
          .replace(/\s+/g, "-")
      );
    }
  };

  // ── Handle class change ────────────────────────────────────
  const handleClassChange = (value: string) => {
    setClassId(value);
    setSubjectId("");
    onClassChange(value);
  };

  const handleSave = async () => {
    if (!name.trim()) { setError("Name is required"); return; }
    if (!slug.trim()) { setError("Slug is required"); return; }
    if (!classId) { setError("Please select a class"); return; }
    if (!subjectId) { setError("Please select a subject"); return; }
    if (!/^[a-z0-9-]+$/.test(slug)) {
      setError("Slug can only contain lowercase letters, numbers and hyphens");
      return;
    }
    setIsSaving(true);
    setError("");
    try {
      await onSave({
        name: name.trim(),
        slug,
        order,
        description: description.trim(),
        subjectId,
        classId,
      });
    } catch (err: any) {
      setError(err?.response?.data?.message ?? "Failed to save");
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 mb-6">
      <h3 className="text-lg font-bold text-gray-800 mb-4">
        {initial?._id ? "Edit Chapter" : "Create New Chapter"}
      </h3>

      <div className="space-y-4">

        {/* ── Class + Subject Row ───────────────────────────── */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="text-sm text-gray-600 mb-1 block">
              Class <span className="text-red-400">*</span>
            </label>
            <select
              value={classId}
              onChange={(e) => handleClassChange(e.target.value)}
              className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-indigo-400 focus:outline-none text-gray-700"
            >
              <option value="">Select class</option>
              {classes
                .sort((a, b) => a.grade - b.grade)
                .map((cls) => (
                  <option key={cls._id} value={cls._id}>
                    {cls.name}
                  </option>
                ))}
            </select>
          </div>

          <div>
            <label className="text-sm text-gray-600 mb-1 block">
              Subject <span className="text-red-400">*</span>
            </label>
            <select
              value={subjectId}
              onChange={(e) => setSubjectId(e.target.value)}
              disabled={!classId || subjects.length === 0}
              className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-indigo-400 focus:outline-none text-gray-700 disabled:bg-gray-50 disabled:text-gray-400"
            >
              <option value="">
                {!classId
                  ? "Select class first"
                  : subjects.length === 0
                    ? "No subjects found"
                    : "Select subject"}
              </option>
              {subjects.map((sub) => (
                <option key={sub._id} value={sub._id}>
                  {sub.icon} {sub.name}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* ── Name ───────────────────────────────────────────── */}
        <div>
          <label className="text-sm text-gray-600 mb-1 block">
            Chapter Name <span className="text-red-400">*</span>
          </label>
          <input
            type="text"
            value={name}
            onChange={(e) => handleNameChange(e.target.value)}
            placeholder="e.g. Chapter 1: The French Revolution"
            className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-indigo-400 focus:outline-none text-gray-700"
          />
        </div>

        {/* ── Slug + Order Row ──────────────────────────────── */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="sm:col-span-2">
            <label className="text-sm text-gray-600 mb-1 block">
              Slug <span className="text-red-400">*</span>
            </label>
            <input
              type="text"
              value={slug}
              onChange={(e) => setSlug(e.target.value.toLowerCase())}
              placeholder="e.g. french-revolution"
              className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-indigo-400 focus:outline-none text-gray-700 font-mono text-sm"
            />
          </div>
          <div>
            <label className="text-sm text-gray-600 mb-1 block">
              Order <span className="text-red-400">*</span>
            </label>
            <input
              type="number"
              value={order}
              min={1}
              onChange={(e) => setOrder(Number(e.target.value))}
              className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-indigo-400 focus:outline-none text-gray-700"
            />
          </div>
        </div>

        {/* ── Description ────────────────────────────────────── */}
        <div>
          <label className="text-sm text-gray-600 mb-1 block">
            Description (optional)
          </label>
          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Brief overview of this chapter"
            rows={3}
            className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-indigo-400 focus:outline-none text-gray-700 resize-none"
          />
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

// ─── Chapter Row ───────────────────────────────────────────────
const ChapterRow = ({
  chapter,
  onEdit,
  onDelete,
  onTogglePublish,
}: {
  chapter: IChapter;
  onEdit: () => void;
  onDelete: () => void;
  onTogglePublish: () => void;
}) => {
  const subject =
    typeof chapter.subjectId === "object" ? chapter.subjectId : null;

  return (
    <div className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100 flex items-center justify-between gap-4 flex-wrap">
      <div className="flex items-center gap-4">
        {/* ── Order Badge ─────────────────────────────────────── */}
        <div className="w-10 h-10 bg-indigo-50 rounded-xl flex items-center justify-center shrink-0">
          <span className="font-bold text-indigo-600 text-sm">
            {chapter.order}
          </span>
        </div>
        <div>
          <p className="font-semibold text-gray-800">{chapter.name}</p>
          <div className="flex items-center gap-2 mt-0.5 flex-wrap">
            <span className="text-xs text-gray-400 font-mono">
              {chapter.slug}
            </span>
            {subject && (
              <span className="text-xs bg-indigo-50 text-indigo-600 px-2 py-0.5 rounded-lg">
                {subject.name}
              </span>
            )}
          </div>
        </div>
      </div>

      <div className="flex items-center gap-2 flex-wrap">
        {/* ── Publish Toggle ──────────────────────────────────── */}
        <button
          onClick={onTogglePublish}
          className={`text-xs px-3 py-1.5 rounded-lg border font-medium transition-all ${chapter.isPublished
              ? "bg-green-50 text-green-600 border-green-200 hover:bg-green-100"
              : "bg-yellow-50 text-yellow-600 border-yellow-200 hover:bg-yellow-100"
            }`}
        >
          {chapter.isPublished ? "✅ Published" : "📝 Draft"}
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

// ─── Admin Chapters Page ───────────────────────────────────────
const AdminChapters = () => {
  const [classes, setClasses] = useState<IClass[]>([]);
  const [subjects, setSubjects] = useState<ISubject[]>([]);
  const [formSubjects, setFormSubjects] = useState<ISubject[]>([]);
  const [chapters, setChapters] = useState<IChapter[]>([]);
  const [filterClassId, setFilterClassId] = useState("");
  const [filterSubjectId, setFilterSubjectId] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const [editingChapter, setEditingChapter] = useState<IChapter | null>(null);

  // ── Fetch classes on mount ─────────────────────────────────
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

  // ── Fetch subjects when filter class changes ───────────────
  useEffect(() => {
    if (!filterClassId) return;
    const fetchSubjects = async () => {
      try {
        const { data } = await api.get(
          `/subjects?classId=${filterClassId}`
        );
        setSubjects(data.data);
        setFilterSubjectId(data.data[0]?._id ?? "");
      } catch {
        console.error("Failed to fetch subjects");
      }
    };
    fetchSubjects();
  }, [filterClassId]);

  // ── Fetch subjects for form when class changes ─────────────
  const handleFormClassChange = async (classId: string) => {
    try {
      const { data } = await api.get(`/subjects?classId=${classId}`);
      setFormSubjects(data.data);
    } catch {
      console.error("Failed to fetch subjects for form");
    }
  };

  // ── Fetch chapters when subject filter changes ─────────────
  const fetchChapters = async () => {
    if (!filterSubjectId) return;
    setIsLoading(true);
    try {
      const { data } = await api.get(
        `/chapters/admin?subjectId=${filterSubjectId}`
      );
      setChapters(data.data);
    } catch {
      console.error("Failed to fetch chapters");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchChapters();
  }, [filterSubjectId]);

  // ── Create ─────────────────────────────────────────────────
  const handleCreate = async (formData: {
    name: string;
    slug: string;
    order: number;
    description: string;
    subjectId: string;
    classId: string;
  }) => {
    await api.post("/chapters", formData);
    setShowForm(false);
    fetchChapters();
  };

  // ── Update ─────────────────────────────────────────────────
  const handleUpdate = async (formData: {
    name: string;
    slug: string;
    order: number;
    description: string;
    subjectId: string;
    classId: string;
  }) => {
    await api.patch(`/chapters/${editingChapter?._id}`, formData);
    setEditingChapter(null);
    fetchChapters();
  };

  // ── Toggle publish ─────────────────────────────────────────
  const handleTogglePublish = async (chapter: IChapter) => {
    await api.patch(`/chapters/${chapter._id}/publish`);
    fetchChapters();
  };

  // ── Delete ─────────────────────────────────────────────────
  const handleDelete = async (chapter: IChapter) => {
    if (!confirm(`Delete "${chapter.name}"?`)) return;
    await api.delete(`/chapters/${chapter._id}`);
    fetchChapters();
  };

  return (
    <div className="p-6 max-w-4xl mx-auto">

      {/* ── Header ────────────────────────────────────────────── */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">Chapters</h1>
          <p className="text-gray-500 text-sm mt-1">
            Manage chapters per subject
          </p>
        </div>
        {!showForm && !editingChapter && (
          <button
            onClick={() => setShowForm(true)}
            className="bg-indigo-600 text-white px-5 py-2.5 rounded-xl text-sm font-medium hover:bg-indigo-700 transition-colors"
          >
            + New Chapter
          </button>
        )}
      </div>

      {/* ── Forms ─────────────────────────────────────────────── */}
      {showForm && (
        <ChapterForm
          classes={classes}
          subjects={formSubjects}
          onClassChange={handleFormClassChange}
          onSave={handleCreate}
          onCancel={() => setShowForm(false)}
        />
      )}

      {editingChapter && (
        <ChapterForm
          classes={classes}
          subjects={formSubjects.length > 0 ? formSubjects : subjects}
          onClassChange={handleFormClassChange}
          initial={editingChapter}
          onSave={handleUpdate}
          onCancel={() => setEditingChapter(null)}
        />
      )}

      {/* ── Class Filter ──────────────────────────────────────── */}
      <div className="flex gap-2 flex-wrap mb-3">
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

      {/* ── Subject Filter ────────────────────────────────────── */}
      <div className="flex gap-2 flex-wrap mb-6">
        {subjects.map((sub) => (
          <button
            key={sub._id}
            onClick={() => setFilterSubjectId(sub._id)}
            className={`px-4 py-1.5 rounded-xl text-sm font-medium border transition-all ${filterSubjectId === sub._id
                ? "bg-purple-600 text-white border-purple-600"
                : "bg-white text-gray-600 border-gray-200 hover:border-purple-300"
              }`}
          >
            {sub.icon} {sub.name}
          </button>
        ))}
      </div>

      {/* ── Chapters List ─────────────────────────────────────── */}
      {isLoading ? (
        <div className="space-y-3">
          {Array.from({ length: 5 }).map((_, i) => (
            <div
              key={i}
              className="bg-gray-100 rounded-2xl h-20 animate-pulse"
            />
          ))}
        </div>
      ) : chapters.length === 0 ? (
        <div className="text-center py-16 text-gray-400">
          <p className="text-4xl mb-3">📖</p>
          <p>No chapters yet for this subject.</p>
        </div>
      ) : (
        <div className="space-y-3">
          {chapters
            .sort((a, b) => a.order - b.order)
            .map((chapter) => (
              <ChapterRow
                key={chapter._id}
                chapter={chapter}
                onEdit={() => {
                  setShowForm(false);
                  setEditingChapter(chapter);
                }}
                onDelete={() => handleDelete(chapter)}
                onTogglePublish={() => handleTogglePublish(chapter)}
              />
            ))}
        </div>
      )}
    </div>
  );
};

export default AdminChapters;
