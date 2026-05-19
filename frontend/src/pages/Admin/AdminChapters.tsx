
import { useEffect, useState, useCallback } from "react";
import api from "../../services/api";
import type { IClass, ISubject, IChapter } from "../../types";

// ─── Slide-over Chapter Form ───────────────────────────────────
const ChapterForm = ({
  classes,
  initial,
  onSave,
  onClose,
}: {
  classes: IClass[];
  initial?: IChapter | null;
  onSave: () => void;
  onClose: () => void;
}) => {
  const [classId, setClassId] = useState(typeof initial?.classId === "object" ? initial.classId._id : initial?.classId ?? "");
  const [subjectId, setSubjectId] = useState(typeof initial?.subjectId === "object" ? initial.subjectId._id : initial?.subjectId ?? "");
  const [name, setName] = useState(initial?.name ?? "");
  const [order, setOrder] = useState<number>(initial?.order ?? 1);

  const [subjects, setSubjects] = useState<ISubject[]>([]);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState("");

  // Fetch subjects when classId changes (new chapter flow)
  useEffect(() => {
    if (!classId) { setSubjects([]); return; }
    api.get(`/subjects?classId=${classId}`)
      .then(({ data }) => setSubjects(Array.isArray(data.data) ? data.data : []))
      .catch(() => setSubjects([]));
  }, [classId]);

  // On edit — pre-fetch subjects for the existing classId
  useEffect(() => {
    if (!initial) return;
    const cid = typeof initial.classId === "object" ? initial.classId._id : initial.classId;
    if (!cid) return;
    api.get(`/subjects?classId=${cid}`)
      .then(({ data }) => setSubjects(Array.isArray(data.data) ? data.data : []))
      .catch(() => setSubjects([]));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleClassChange = (val: string) => {
    setClassId(val);
    setSubjectId("");
    setError("");
  };

  const handleSave = async () => {
    if (!name.trim()) return setError("Name is required");
    if (!classId) return setError("Select a class");
    if (!subjectId) return setError("Select a subject");
    if (!order || order < 1) return setError("Order must be at least 1");
    setIsSaving(true);
    setError("");
    try {
      const payload = { name: name.trim(), order, subjectId, classId };
      if (initial?._id) {
        await api.patch(`/chapters/${initial._id}`, payload);
      } else {
        await api.post("/chapters", payload);
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
      <div className="fixed inset-0 bg-black/30 backdrop-blur-sm z-40" onClick={onClose} />

      <div className="fixed top-0 right-0 h-full w-full max-w-md bg-white z-50 shadow-2xl flex flex-col">

        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100 shrink-0">
          <div>
            <h2 className="font-bold text-gray-900 text-lg">
              {initial ? "Edit Chapter" : "New Chapter"}
            </h2>
            <p className="text-xs text-gray-400 mt-0.5">
              {initial ? "Update chapter details" : "Add a chapter to a subject"}
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

          {/* Class + Subject */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-1.5 block">
                Class <span className="text-red-400">*</span>
              </label>
              <select
                value={classId}
                onChange={(e) => handleClassChange(e.target.value)}
                className="w-full px-3 py-2.5 rounded-xl border border-gray-200 focus:border-gray-400 focus:outline-none text-gray-800 text-sm bg-gray-50"
              >
                <option value="">Pick class</option>
                {classes.sort((a, b) => a.grade - b.grade).map((cls) => (
                  <option key={cls._id} value={cls._id}>{cls.name}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-1.5 block">
                Subject <span className="text-red-400">*</span>
              </label>
              <select
                value={subjectId}
                onChange={(e) => { setSubjectId(e.target.value); setError(""); }}
                disabled={!classId || subjects.length === 0}
                className="w-full px-3 py-2.5 rounded-xl border border-gray-200 focus:border-gray-400 focus:outline-none text-gray-800 text-sm bg-gray-50 disabled:opacity-40"
              >
                <option value="">
                  {!classId ? "—" : subjects.length === 0 ? "No subjects" : "Pick subject"}
                </option>
                {subjects.map((sub) => (
                  <option key={sub._id} value={sub._id}>{sub.icon} {sub.name}</option>
                ))}
              </select>
            </div>
          </div>

          {/* Chapter Name */}
          <div>
            <label className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-1.5 block">
              Chapter Name <span className="text-red-400">*</span>
            </label>
            <input
              type="text"
              value={name}
              onChange={(e) => { setName(e.target.value); setError(""); }}
              placeholder="e.g. The French Revolution"
              className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-gray-400 focus:outline-none text-gray-800 text-sm bg-gray-50"
            />
          </div>

          {/* Order */}
          <div>
            <label className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-1.5 block">
              Order <span className="text-red-400">*</span>
            </label>
            <input
              type="number"
              value={order}
              min={1}
              onChange={(e) => { setOrder(Number(e.target.value)); setError(""); }}
              className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-gray-400 focus:outline-none text-gray-800 text-sm bg-gray-50"
            />
            <p className="text-xs text-gray-400 mt-1">Chapters are sorted by this number</p>
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
            {isSaving ? "Saving…" : initial ? "Update Chapter" : "Create Chapter"}
          </button>
        </div>
      </div>
    </>
  );
};

// ─── Chapter Card ──────────────────────────────────────────────
const ChapterCard = ({
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
  const subject = typeof chapter.subjectId === "object" ? chapter.subjectId : null;

  return (
    <div className="group bg-white rounded-2xl border border-gray-100 hover:border-gray-200 hover:shadow-sm transition-all duration-200 overflow-hidden">
      <div className="flex items-center gap-4 p-5">

        {/* Order badge */}
        <div className="w-10 h-10 rounded-xl bg-gray-900 text-white flex items-center justify-center text-sm font-bold shrink-0">
          {chapter.order}
        </div>

        {/* Info */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <p className="font-semibold text-gray-900 truncate">{chapter.name}</p>
            {subject && (
              <span className="text-xs bg-blue-50 text-blue-600 px-2 py-0.5 rounded-lg font-medium shrink-0">
                {subject.icon} {subject.name}
              </span>
            )}
          </div>
        </div>

        {/* Publish toggle */}
        <button
          onClick={onTogglePublish}
          className={`shrink-0 text-xs px-3 py-1.5 rounded-lg border font-medium transition-all ${chapter.isPublished
              ? "bg-green-50 text-green-700 border-green-200 hover:bg-green-100"
              : "bg-amber-50 text-amber-600 border-amber-200 hover:bg-amber-100"
            }`}
        >
          {chapter.isPublished ? "Live" : "Draft"}
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

// ─── Admin Chapters Page ───────────────────────────────────────
const AdminChapters = () => {
  const [classes, setClasses] = useState<IClass[]>([]);
  const [subjects, setSubjects] = useState<ISubject[]>([]);
  const [chapters, setChapters] = useState<IChapter[]>([]);

  const [filterClassId, setFilterClassId] = useState("");
  const [filterSubjectId, setFilterSubjectId] = useState("");

  const [isLoading, setIsLoading] = useState(false);
  const [formOpen, setFormOpen] = useState(false);
  const [editingChapter, setEditingChapter] = useState<IChapter | null>(null);

  // Fetch classes once
  useEffect(() => {
    api.get("/classes")
      .then(({ data }) => {
        const list = Array.isArray(data.data) ? data.data : [];
        setClasses(list);
        if (list.length > 0) setFilterClassId(list[0]._id);
      })
      .catch(() => { });
  }, []);

  // Fetch subjects when class filter changes
  useEffect(() => {
    if (!filterClassId) return;
    api.get(`/subjects?classId=${filterClassId}`)
      .then(({ data }) => {
        const list = Array.isArray(data.data) ? data.data : [];
        setSubjects(list);
        setFilterSubjectId(list[0]?._id ?? "");
      })
      .catch(() => setSubjects([]));
  }, [filterClassId]);

  // Fetch chapters when subject filter changes
  const fetchChapters = useCallback(async () => {
    if (!filterSubjectId) return;
    setIsLoading(true);
    try {
      const { data } = await api.get(`/chapters/admin?subjectId=${filterSubjectId}`);
      setChapters(Array.isArray(data.data) ? data.data : []);
    } catch {
      console.error("Failed to fetch chapters");
      setChapters([]);
    } finally {
      setIsLoading(false);
    }
  }, [filterSubjectId]);

  useEffect(() => { fetchChapters(); }, [fetchChapters]);

  const handleSaved = () => {
    setFormOpen(false);
    setEditingChapter(null);
    fetchChapters();
  };

  const handleTogglePublish = async (chapter: IChapter) => {
    await api.patch(`/chapters/${chapter._id}/publish`);
    fetchChapters();
  };

  const handleDelete = async (chapter: IChapter) => {
    if (!confirm(`Delete "${chapter.name}"? Notes inside will also be removed.`)) return;
    await api.delete(`/chapters/${chapter._id}`);
    fetchChapters();
  };

  const isFormOpen = formOpen || !!editingChapter;

  return (
    <div className="p-6 max-w-4xl mx-auto">

      {/* Header */}
      <div className="flex items-center justify-between mb-5">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 tracking-tight">Chapters</h1>
          <p className="text-gray-400 text-sm mt-0.5">Manage chapters per subject</p>
        </div>
        <button
          onClick={() => { setEditingChapter(null); setFormOpen(true); }}
          className="bg-gray-900 text-white px-5 py-2.5 rounded-xl text-sm font-semibold hover:bg-gray-800 transition-colors"
        >
          + New Chapter
        </button>
      </div>

      {/* Context filter bar */}
      <div className="bg-white border border-gray-100 rounded-2xl px-5 py-4 mb-5 space-y-3">

        {/* Class pills */}
        <div>
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

        {/* Subject pills */}
        {subjects.length > 0 && (
          <div>
            <p className="text-[10px] font-bold text-gray-300 uppercase tracking-widest mb-2">Subject</p>
            <div className="flex gap-1.5 flex-wrap">
              {subjects.map((sub) => (
                <button
                  key={sub._id}
                  onClick={() => setFilterSubjectId(sub._id)}
                  className={`px-3 py-1 rounded-lg text-xs font-semibold border transition-all ${filterSubjectId === sub._id
                      ? "bg-blue-600 text-white border-blue-600"
                      : "bg-white text-gray-500 border-gray-200 hover:border-blue-300"
                    }`}
                >
                  {sub.icon} {sub.name}
                </button>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Chapters list */}
      {isLoading ? (
        <div className="space-y-3">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="bg-gray-100 rounded-2xl h-20 animate-pulse" />
          ))}
        </div>
      ) : chapters.length === 0 ? (
        <div className="text-center py-20 text-gray-300">
          <p className="text-5xl mb-3">📖</p>
          <p className="text-sm font-medium">No chapters for this subject yet</p>
          <button
            onClick={() => { setEditingChapter(null); setFormOpen(true); }}
            className="mt-4 text-sm text-gray-900 font-semibold underline underline-offset-2"
          >
            Create the first one →
          </button>
        </div>
      ) : (
        <div className="space-y-3">
          {chapters
            .sort((a, b) => a.order - b.order)
            .map((chapter) => (
              <ChapterCard
                key={chapter._id}
                chapter={chapter}
                onEdit={() => { setFormOpen(false); setEditingChapter(chapter); }}
                onDelete={() => handleDelete(chapter)}
                onTogglePublish={() => handleTogglePublish(chapter)}
              />
            ))}
        </div>
      )}

      {/* Slide-over form */}
      {isFormOpen && (
        <ChapterForm
          classes={classes}
          initial={editingChapter}
          onSave={handleSaved}
          onClose={() => { setFormOpen(false); setEditingChapter(null); }}
        />
      )}
    </div>
  );
};

export default AdminChapters;

