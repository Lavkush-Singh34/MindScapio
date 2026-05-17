import { useEffect, useState } from "react";
import MDEditor from "@uiw/react-md-editor";
import api from "../../services/api";
import type { IClass, ISubject, IChapter, INote } from "../../types";

// ─── Note Form ─────────────────────────────────────────────────
const NoteForm = ({
  classes,
  subjects,
  chapters,
  onClassChange,
  onSubjectChange,
  initial,
  onSave,
  onCancel,
}: {
  classes: IClass[];
  subjects: ISubject[];
  chapters: IChapter[];
  onClassChange: (classId: string) => void;
  onSubjectChange: (subjectId: string) => void;
  initial?: Partial<INote>;
  onSave: (data: {
    title: string;
    content: string;
    chapterId: string;
    subjectId: string;
    classId: string;
  }) => Promise<void>;
  onCancel: () => void;
}) => {
  const [title, setTitle] = useState(initial?.title ?? "");
  const [content, setContent] = useState(initial?.content ?? "");
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
  const [chapterId, setChapterId] = useState(
    typeof initial?.chapterId === "object"
      ? initial.chapterId._id
      : initial?.chapterId ?? ""
  );
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState("");

  const handleClassChange = (value: string) => {
    setClassId(value);
    setSubjectId("");
    setChapterId("");
    onClassChange(value);
  };

  const handleSubjectChange = (value: string) => {
    setSubjectId(value);
    setChapterId("");
    onSubjectChange(value);
  };

  const handleSave = async () => {
    if (!title.trim()) { setError("Title is required"); return; }
    if (!content.trim()) { setError("Content is required"); return; }
    if (!classId) { setError("Please select a class"); return; }
    if (!subjectId) { setError("Please select a subject"); return; }
    if (!chapterId) { setError("Please select a chapter"); return; }
    setIsSaving(true);
    setError("");
    try {
      await onSave({
        title: title.trim(),
        content,
        chapterId,
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
        {initial?._id ? "Edit Note" : "Create New Note"}
      </h3>

      <div className="space-y-4">

        {/* ── Class + Subject + Chapter Row ─────────────────── */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
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
              onChange={(e) => handleSubjectChange(e.target.value)}
              disabled={!classId || subjects.length === 0}
              className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-indigo-400 focus:outline-none text-gray-700 disabled:bg-gray-50 disabled:text-gray-400"
            >
              <option value="">
                {!classId ? "Select class first" : "Select subject"}
              </option>
              {subjects.map((sub) => (
                <option key={sub._id} value={sub._id}>
                  {sub.icon} {sub.name}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="text-sm text-gray-600 mb-1 block">
              Chapter <span className="text-red-400">*</span>
            </label>
            <select
              value={chapterId}
              onChange={(e) => setChapterId(e.target.value)}
              disabled={!subjectId || chapters.length === 0}
              className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-indigo-400 focus:outline-none text-gray-700 disabled:bg-gray-50 disabled:text-gray-400"
            >
              <option value="">
                {!subjectId ? "Select subject first" : "Select chapter"}
              </option>
              {chapters
                .sort((a, b) => a.order - b.order)
                .map((chap) => (
                  <option key={chap._id} value={chap._id}>
                    {chap.order}. {chap.name}
                  </option>
                ))}
            </select>
          </div>
        </div>

        {/* ── Title ──────────────────────────────────────────── */}
        <div>
          <label className="text-sm text-gray-600 mb-1 block">
            Title <span className="text-red-400">*</span>
          </label>
          <input
            type="text"
            value={title}
            onChange={(e) => {
              setTitle(e.target.value);
              setError("");
            }}
            placeholder="e.g. The French Revolution — Summary"
            className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-indigo-400 focus:outline-none text-gray-700"
          />
        </div>

        {/* ── Markdown Editor ───────────────────────────────── */}
        <div>
          <label className="text-sm text-gray-600 mb-1 block">
            Content (Markdown) <span className="text-red-400">*</span>
          </label>
          <div data-color-mode="light">
            <MDEditor
              value={content}
              onChange={(val) => setContent(val ?? "")}
              height={400}
              preview="live"
            />
          </div>
          <p className="text-xs text-gray-400 mt-1">
            Paste AI generated Markdown directly here — live preview on the right
          </p>
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

// ─── Note Row ──────────────────────────────────────────────────
const NoteRow = ({
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
  const chapter =
    typeof note.chapterId === "object" ? note.chapterId : null;
  const subject =
    typeof note.subjectId === "object" ? note.subjectId : null;

  return (
    <div className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100">
      <div className="flex items-start justify-between gap-4 flex-wrap">
        <div className="flex-1 min-w-0">
          <p className="font-semibold text-gray-800 truncate">{note.title}</p>
          <div className="flex items-center gap-2 mt-1 flex-wrap">
            {subject && (
              <span className="text-xs bg-indigo-50 text-indigo-600 px-2 py-0.5 rounded-lg">
                {subject.name}
              </span>
            )}
            {chapter && (
              <span className="text-xs text-gray-400">
                📖 {chapter.name}
              </span>
            )}
            <span className="text-xs text-gray-300">
              {new Date(note.createdAt).toLocaleDateString("en-IN", {
                day: "numeric",
                month: "short",
                year: "numeric",
              })}
            </span>
          </div>
        </div>

        <div className="flex items-center gap-2 flex-wrap">
          <button
            onClick={onTogglePublish}
            className={`text-xs px-3 py-1.5 rounded-lg border font-medium transition-all ${note.isPublished
                ? "bg-green-50 text-green-600 border-green-200 hover:bg-green-100"
                : "bg-yellow-50 text-yellow-600 border-yellow-200 hover:bg-yellow-100"
              }`}
          >
            {note.isPublished ? "✅ Published" : "📝 Draft"}
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
    </div>
  );
};

// ─── Admin Notes Page ──────────────────────────────────────────
const AdminNotes = () => {
  const [classes, setClasses] = useState<IClass[]>([]);
  const [subjects, setSubjects] = useState<ISubject[]>([]);
  const [chapters, setChapters] = useState<IChapter[]>([]);
  const [notes, setNotes] = useState<INote[]>([]);

  // ── Form cascade state ─────────────────────────────────────
  const [formSubjects, setFormSubjects] = useState<ISubject[]>([]);
  const [formChapters, setFormChapters] = useState<IChapter[]>([]);

  // ── Filter state ───────────────────────────────────────────
  const [filterClassId, setFilterClassId] = useState("");
  const [filterSubjectId, setFilterSubjectId] = useState("");
  const [filterChapterId, setFilterChapterId] = useState("");

  const [isLoading, setIsLoading] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const [editingNote, setEditingNote] = useState<INote | null>(null);

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
    const fetch = async () => {
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
    fetch();
  }, [filterClassId]);

  // ── Fetch chapters when filter subject changes ─────────────
  useEffect(() => {
    if (!filterSubjectId) return;
    const fetch = async () => {
      try {
        const { data } = await api.get(
          `/chapters/admin?subjectId=${filterSubjectId}`
        );
        setChapters(data.data);
        setFilterChapterId(data.data[0]?._id ?? "");
      } catch {
        console.error("Failed to fetch chapters");
      }
    };
    fetch();
  }, [filterSubjectId]);

  // ── Fetch notes when filter chapter changes ────────────────
  const fetchNotes = async () => {
    if (!filterChapterId) return;
    setIsLoading(true);
    try {
      const { data } = await api.get(
        `/notes/admin?chapterId=${filterChapterId}`
      );
      setNotes(data.data);
    } catch {
      console.error("Failed to fetch notes");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchNotes();
  }, [filterChapterId]);

  // ── Form cascade handlers ──────────────────────────────────
  const handleFormClassChange = async (classId: string) => {
    try {
      const { data } = await api.get(`/subjects?classId=${classId}`);
      setFormSubjects(data.data);
      setFormChapters([]);
    } catch {
      console.error("Failed to fetch form subjects");
    }
  };

  const handleFormSubjectChange = async (subjectId: string) => {
    try {
      const { data } = await api.get(
        `/chapters/admin?subjectId=${subjectId}`
      );
      setFormChapters(data.data);
    } catch {
      console.error("Failed to fetch form chapters");
    }
  };

  // ── Create ─────────────────────────────────────────────────
  const handleCreate = async (formData: {
    title: string;
    content: string;
    chapterId: string;
    subjectId: string;
    classId: string;
  }) => {
    await api.post("/notes", formData);
    setShowForm(false);
    fetchNotes();
  };

  // ── Update ─────────────────────────────────────────────────
  const handleUpdate = async (formData: {
    title: string;
    content: string;
    chapterId: string;
    subjectId: string;
    classId: string;
  }) => {
    await api.patch(`/notes/${editingNote?._id}`, formData);
    setEditingNote(null);
    fetchNotes();
  };

  // ── Toggle publish ─────────────────────────────────────────
  const handleTogglePublish = async (note: INote) => {
    await api.patch(`/notes/${note._id}/publish`);
    fetchNotes();
  };

  // ── Delete ─────────────────────────────────────────────────
  const handleDelete = async (note: INote) => {
    if (!confirm(`Delete "${note.title}"?`)) return;
    await api.delete(`/notes/${note._id}`);
    fetchNotes();
  };

  return (
    <div className="p-6 max-w-5xl mx-auto">

      {/* ── Header ────────────────────────────────────────────── */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">Notes</h1>
          <p className="text-gray-500 text-sm mt-1">
            Create and manage Markdown notes
          </p>
        </div>
        {!showForm && !editingNote && (
          <button
            onClick={() => setShowForm(true)}
            className="bg-indigo-600 text-white px-5 py-2.5 rounded-xl text-sm font-medium hover:bg-indigo-700 transition-colors"
          >
            + New Note
          </button>
        )}
      </div>

      {/* ── Forms ─────────────────────────────────────────────── */}
      {showForm && (
        <NoteForm
          classes={classes}
          subjects={formSubjects}
          chapters={formChapters}
          onClassChange={handleFormClassChange}
          onSubjectChange={handleFormSubjectChange}
          onSave={handleCreate}
          onCancel={() => setShowForm(false)}
        />
      )}

      {editingNote && (
        <NoteForm
          classes={classes}
          subjects={
            formSubjects.length > 0 ? formSubjects : subjects
          }
          chapters={
            formChapters.length > 0 ? formChapters : chapters
          }
          onClassChange={handleFormClassChange}
          onSubjectChange={handleFormSubjectChange}
          initial={editingNote}
          onSave={handleUpdate}
          onCancel={() => setEditingNote(null)}
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
      <div className="flex gap-2 flex-wrap mb-3">
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

      {/* ── Chapter Filter ────────────────────────────────────── */}
      <div className="flex gap-2 flex-wrap mb-6">
        {chapters
          .sort((a, b) => a.order - b.order)
          .map((chap) => (
            <button
              key={chap._id}
              onClick={() => setFilterChapterId(chap._id)}
              className={`px-4 py-1.5 rounded-xl text-sm font-medium border transition-all ${filterChapterId === chap._id
                  ? "bg-teal-600 text-white border-teal-600"
                  : "bg-white text-gray-600 border-gray-200 hover:border-teal-300"
                }`}
            >
              {chap.order}. {chap.name}
            </button>
          ))}
      </div>

      {/* ── Notes List ────────────────────────────────────────── */}
      {isLoading ? (
        <div className="space-y-3">
          {Array.from({ length: 4 }).map((_, i) => (
            <div
              key={i}
              className="bg-gray-100 rounded-2xl h-20 animate-pulse"
            />
          ))}
        </div>
      ) : notes.length === 0 ? (
        <div className="text-center py-16 text-gray-400">
          <p className="text-4xl mb-3">📝</p>
          <p>No notes yet for this chapter.</p>
        </div>
      ) : (
        <div className="space-y-3">
          {notes.map((note) => (
            <NoteRow
              key={note._id}
              note={note}
              onEdit={() => {
                setShowForm(false);
                setEditingNote(note);
              }}
              onDelete={() => handleDelete(note)}
              onTogglePublish={() => handleTogglePublish(note)}
            />
          ))}
        </div>
      )}
    </div>
  );
};

export default AdminNotes;
