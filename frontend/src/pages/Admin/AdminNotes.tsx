import { useEffect, useState, useCallback } from "react";
import MDEditor from "@uiw/react-md-editor";
import api from "../../services/api";
import type { IClass, ISubject, IChapter, INote } from "../../types";

// ─── Slide-over Note Form ──────────────────────────────────────
// Fetches its own subjects/chapters — no broken prop cascade
const NoteForm = ({
  classes,
  initial,
  onSave,
  onClose,
}: {
  classes: IClass[];
  initial?: INote | null;
  onSave: () => void;
  onClose: () => void;
}) => {
  const [classId, setClassId] = useState(
    typeof initial?.classId === "object" ? initial.classId._id : initial?.classId ?? ""
  );
  const [subjectId, setSubjectId] = useState(
    typeof initial?.subjectId === "object" ? initial.subjectId._id : initial?.subjectId ?? ""
  );
  const [chapterId, setChapterId] = useState(
    typeof initial?.chapterId === "object" ? initial.chapterId._id : initial?.chapterId ?? ""
  );
  const [title, setTitle] = useState(initial?.title ?? "");
  const [content, setContent] = useState(initial?.content ?? "");

  const [subjects, setSubjects] = useState<ISubject[]>([]);
  const [chapters, setChapters] = useState<IChapter[]>([]);

  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState("");

  // Fetch subjects when classId changes
  useEffect(() => {
    if (!classId) { setSubjects([]); setChapters([]); return; }
    api.get(`/subjects?classId=${classId}`)
      .then(({ data }) => setSubjects(data.data))
      .catch(() => setSubjects([]));
  }, [classId]);

  // Fetch chapters when subjectId changes
  useEffect(() => {
    if (!subjectId) { setChapters([]); return; }
    api.get(`/chapters/admin?subjectId=${subjectId}`)
      .then(({ data }) => setChapters(data.data))
      .catch(() => setChapters([]));
  }, [subjectId]);

  // On edit — fetch subjects/chapters for the pre-filled ids
  useEffect(() => {
    if (!initial) return;
    const cid = typeof initial.classId === "object" ? initial.classId._id : initial.classId;
    const sid = typeof initial.subjectId === "object" ? initial.subjectId._id : initial.subjectId;
    if (cid) {
      api.get(`/subjects?classId=${cid}`).then(({ data }) => setSubjects(data.data)).catch(() => { });
    }
    if (sid) {
      api.get(`/chapters/admin?subjectId=${sid}`).then(({ data }) => setChapters(data.data)).catch(() => { });
    }
  }, []);

  const handleClassChange = (val: string) => {
    setClassId(val);
    setSubjectId("");
    setChapterId("");
  };

  const handleSubjectChange = (val: string) => {
    setSubjectId(val);
    setChapterId("");
  };

  const handleSave = async () => {
    if (!title.trim()) return setError("Title is required");
    if (!content.trim()) return setError("Content is required");
    if (!classId) return setError("Select a class");
    if (!subjectId) return setError("Select a subject");
    if (!chapterId) return setError("Select a chapter");
    setIsSaving(true);
    setError("");
    try {
      const payload = { title: title.trim(), content, chapterId, subjectId, classId };
      if (initial?._id) {
        await api.patch(`/notes/${initial._id}`, payload);
      } else {
        await api.post("/notes", payload);
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
      <div
        className="fixed inset-0 bg-black/30 backdrop-blur-sm z-40"
        onClick={onClose}
      />

      {/* Panel */}
      <div className="fixed top-0 right-0 h-full w-full max-w-2xl bg-white z-50 shadow-2xl flex flex-col overflow-hidden">

        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100 shrink-0">
          <div>
            <h2 className="font-bold text-gray-900 text-lg">
              {initial ? "Edit Note" : "New Note"}
            </h2>
            <p className="text-xs text-gray-400 mt-0.5">
              {initial ? "Update the note details below" : "Fill in the details to create a note"}
            </p>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 flex items-center justify-center rounded-xl bg-gray-100 hover:bg-gray-200 text-gray-500 transition-colors text-lg"
          >
            ×
          </button>
        </div>

        {/* Scrollable body */}
        <div className="flex-1 overflow-y-auto px-6 py-5 space-y-5">

          {/* Class → Subject → Chapter */}
          <div className="grid grid-cols-3 gap-3">
            <div>
              <label className="text-xs font-semibold text-gray-500 mb-1.5 block uppercase tracking-wide">
                Class <span className="text-red-400">*</span>
              </label>
              <select
                value={classId}
                onChange={(e) => handleClassChange(e.target.value)}
                className="w-full px-3 py-2.5 rounded-xl border border-gray-200 focus:border-gray-400 focus:outline-none text-gray-700 text-sm bg-gray-50"
              >
                <option value="">Pick class</option>
                {classes.sort((a, b) => a.grade - b.grade).map((cls) => (
                  <option key={cls._id} value={cls._id}>{cls.name}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="text-xs font-semibold text-gray-500 mb-1.5 block uppercase tracking-wide">
                Subject <span className="text-red-400">*</span>
              </label>
              <select
                value={subjectId}
                onChange={(e) => handleSubjectChange(e.target.value)}
                disabled={!classId}
                className="w-full px-3 py-2.5 rounded-xl border border-gray-200 focus:border-gray-400 focus:outline-none text-gray-700 text-sm bg-gray-50 disabled:opacity-40"
              >
                <option value="">{!classId ? "—" : "Pick subject"}</option>
                {subjects.map((sub) => (
                  <option key={sub._id} value={sub._id}>{sub.icon} {sub.name}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="text-xs font-semibold text-gray-500 mb-1.5 block uppercase tracking-wide">
                Chapter <span className="text-red-400">*</span>
              </label>
              <select
                value={chapterId}
                onChange={(e) => setChapterId(e.target.value)}
                disabled={!subjectId}
                className="w-full px-3 py-2.5 rounded-xl border border-gray-200 focus:border-gray-400 focus:outline-none text-gray-700 text-sm bg-gray-50 disabled:opacity-40"
              >
                <option value="">{!subjectId ? "—" : "Pick chapter"}</option>
                {chapters.sort((a, b) => a.order - b.order).map((chap) => (
                  <option key={chap._id} value={chap._id}>{chap.order}. {chap.name}</option>
                ))}
              </select>
            </div>
          </div>

          {/* Title */}
          <div>
            <label className="text-xs font-semibold text-gray-500 mb-1.5 block uppercase tracking-wide">
              Title <span className="text-red-400">*</span>
            </label>
            <input
              type="text"
              value={title}
              onChange={(e) => { setTitle(e.target.value); setError(""); }}
              placeholder="e.g. The French Revolution — Summary"
              className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-gray-400 focus:outline-none text-gray-800 text-sm bg-gray-50"
            />
          </div>

          {/* Markdown editor */}
          <div>
            <label className="text-xs font-semibold text-gray-500 mb-1.5 block uppercase tracking-wide">
              Content — Markdown <span className="text-red-400">*</span>
            </label>
            <div data-color-mode="light">
              <MDEditor
                value={content}
                onChange={(val) => setContent(val ?? "")}
                height={380}
                preview="live"
              />
            </div>
            <p className="text-xs text-gray-400 mt-1.5">
              Paste AI-generated Markdown here — live preview on the right
            </p>
          </div>

          {error && (
            <div className="bg-red-50 border border-red-100 text-red-600 text-sm px-4 py-3 rounded-xl">
              {error}
            </div>
          )}
        </div>

        {/* Footer actions */}
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
            {isSaving ? "Saving…" : initial ? "Update Note" : "Create Note"}
          </button>
        </div>
      </div>
    </>
  );
};

// ─── Note Card ─────────────────────────────────────────────────
const NoteCard = ({
  note,
  onEdit,
  onDelete,
  onTogglePublish,
}: {
  note: INote;
  onEdit: () => void;
  onDelete: () => void;
  onTogglePublish: () => void;
}) => {
  const chapter = typeof note.chapterId === "object" ? note.chapterId : null;
  const subject = typeof note.subjectId === "object" ? note.subjectId : null;
  const preview = note.content.replace(/[#*`>\-]/g, "").trim().slice(0, 100);

  return (
    <div className="group bg-white rounded-2xl border border-gray-100 hover:border-gray-200 hover:shadow-sm transition-all duration-200 overflow-hidden">
      <div className="p-5">
        <div className="flex items-start justify-between gap-3">
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 flex-wrap mb-1">
              {subject && (
                <span className="text-xs font-semibold bg-emerald-50 text-emerald-700 px-2 py-0.5 rounded-lg">
                  {subject.icon} {subject.name}
                </span>
              )}
              {chapter && (
                <span className="text-xs text-gray-400">
                  Ch. {chapter.name}
                </span>
              )}
            </div>
            <p className="font-semibold text-gray-900 truncate">{note.title}</p>
            {preview && (
              <p className="text-xs text-gray-400 mt-1 line-clamp-1">{preview}…</p>
            )}
          </div>

          {/* Publish badge */}
          <button
            onClick={onTogglePublish}
            className={`shrink-0 text-xs px-2.5 py-1 rounded-lg font-medium border transition-all ${note.isPublished
                ? "bg-green-50 text-green-700 border-green-200 hover:bg-green-100"
                : "bg-amber-50 text-amber-600 border-amber-200 hover:bg-amber-100"
              }`}
          >
            {note.isPublished ? "Live" : "Draft"}
          </button>
        </div>
      </div>

      {/* Action bar — shows on hover */}
      <div className="flex items-center gap-0 border-t border-gray-50 bg-gray-50/50 divide-x divide-gray-100 opacity-0 group-hover:opacity-100 transition-opacity">
        <span className="flex-1 text-xs text-gray-400 px-4 py-2">
          {new Date(note.createdAt).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" })}
        </span>
        <button
          onClick={onEdit}
          className="px-4 py-2 text-xs font-medium text-gray-600 hover:text-gray-900 hover:bg-gray-100 transition-colors"
        >
          ✏️ Edit
        </button>
        <button
          onClick={onDelete}
          className="px-4 py-2 text-xs font-medium text-red-400 hover:text-red-600 hover:bg-red-50 transition-colors"
        >
          🗑 Delete
        </button>
      </div>
    </div>
  );
};

// ─── Admin Notes Page ──────────────────────────────────────────
const AdminNotes = () => {
  const [classes, setClasses] = useState<IClass[]>([]);
  const [subjects, setSubjects] = useState<ISubject[]>([]);
  const [chapters, setChapters] = useState<IChapter[]>([]);
  const [notes, setNotes] = useState<INote[]>([]);

  const [filterClassId, setFilterClassId] = useState("");
  const [filterSubjectId, setFilterSubjectId] = useState("");
  const [filterChapterId, setFilterChapterId] = useState("");

  const [isLoading, setIsLoading] = useState(false);
  const [formOpen, setFormOpen] = useState(false);
  const [editingNote, setEditingNote] = useState<INote | null>(null);

  // Fetch classes once
  useEffect(() => {
    api.get("/classes")
      .then(({ data }) => {
        setClasses(data.data);
        if (data.data.length > 0) setFilterClassId(data.data[0]._id);
      })
      .catch(() => { });
  }, []);

  // Fetch subjects when class changes
  useEffect(() => {
    if (!filterClassId) return;
    api.get(`/subjects?classId=${filterClassId}`)
      .then(({ data }) => {
        setSubjects(data.data);
        setFilterSubjectId(data.data[0]?._id ?? "");
        setFilterChapterId("");
      })
      .catch(() => { });
  }, [filterClassId]);

  // Fetch chapters when subject changes
  useEffect(() => {
    if (!filterSubjectId) return;
    api.get(`/chapters/admin?subjectId=${filterSubjectId}`)
      .then(({ data }) => {
        setChapters(data.data);
        setFilterChapterId(data.data[0]?._id ?? "");
      })
      .catch(() => { });
  }, [filterSubjectId]);

  // Fetch notes when chapter changes
  const fetchNotes = useCallback(async () => {
    if (!filterChapterId) return;
    setIsLoading(true);
    try {
      const { data } = await api.get(`/notes/admin?chapterId=${filterChapterId}`);
      setNotes(data.data);
    } catch {
      console.error("Failed to fetch notes");
    } finally {
      setIsLoading(false);
    }
  }, [filterChapterId]);

  useEffect(() => { fetchNotes(); }, [fetchNotes]);

  const handleSaved = () => {
    setFormOpen(false);
    setEditingNote(null);
    fetchNotes();
  };

  const handleDelete = async (note: INote) => {
    if (!confirm(`Delete "${note.title}"?`)) return;
    await api.delete(`/notes/${note._id}`);
    fetchNotes();
  };

  const handleTogglePublish = async (note: INote) => {
    await api.patch(`/notes/${note._id}/publish`);
    fetchNotes();
  };

  const isFormOpen = formOpen || !!editingNote;

  return (
    <div className="p-6 max-w-5xl mx-auto">

      {/* ── Header ──────────────────────────────────────────────── */}
      <div className="flex items-center justify-between mb-5">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 tracking-tight">Notes</h1>
          <p className="text-gray-400 text-sm mt-0.5">Markdown notes per chapter</p>
        </div>
        <button
          onClick={() => { setEditingNote(null); setFormOpen(true); }}
          className="bg-gray-900 text-white px-5 py-2.5 rounded-xl text-sm font-semibold hover:bg-gray-800 transition-colors"
        >
          + New Note
        </button>
      </div>

      {/* ── Sticky context bar: Class → Subject → Chapter ───────── */}
      <div className="bg-white border border-gray-100 rounded-2xl p-4 mb-5 space-y-3">

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
                      ? "bg-emerald-600 text-white border-emerald-600"
                      : "bg-white text-gray-500 border-gray-200 hover:border-emerald-300"
                    }`}
                >
                  {sub.icon} {sub.name}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Chapter pills */}
        {chapters.length > 0 && (
          <div>
            <p className="text-[10px] font-bold text-gray-300 uppercase tracking-widest mb-2">Chapter</p>
            <div className="flex gap-1.5 flex-wrap">
              {chapters.sort((a, b) => a.order - b.order).map((chap) => (
                <button
                  key={chap._id}
                  onClick={() => setFilterChapterId(chap._id)}
                  className={`px-3 py-1 rounded-lg text-xs font-semibold border transition-all ${filterChapterId === chap._id
                      ? "bg-blue-600 text-white border-blue-600"
                      : "bg-white text-gray-500 border-gray-200 hover:border-blue-300"
                    }`}
                >
                  {chap.order}. {chap.name}
                </button>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* ── Notes list ──────────────────────────────────────────── */}
      {isLoading ? (
        <div className="space-y-3">
          {[...Array(3)].map((_, i) => (
            <div key={i} className="bg-gray-100 rounded-2xl h-24 animate-pulse" />
          ))}
        </div>
      ) : notes.length === 0 ? (
        <div className="text-center py-20 text-gray-300">
          <p className="text-5xl mb-3">📝</p>
          <p className="text-sm font-medium">No notes for this chapter yet</p>
          <button
            onClick={() => { setEditingNote(null); setFormOpen(true); }}
            className="mt-4 text-sm text-gray-900 font-semibold underline underline-offset-2"
          >
            Create the first one →
          </button>
        </div>
      ) : (
        <div className="space-y-3">
          {notes.map((note) => (
            <NoteCard
              key={note._id}
              note={note}
              onEdit={() => { setFormOpen(false); setEditingNote(note); }}
              onDelete={() => handleDelete(note)}
              onTogglePublish={() => handleTogglePublish(note)}
            />
          ))}
        </div>
      )}

      {/* ── Slide-over form ─────────────────────────────────────── */}
      {isFormOpen && (
        <NoteForm
          classes={classes}
          initial={editingNote}
          onSave={handleSaved}
          onClose={() => { setFormOpen(false); setEditingNote(null); }}
        />
      )}
    </div>
  );
};

export default AdminNotes;

