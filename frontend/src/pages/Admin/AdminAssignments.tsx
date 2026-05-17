import { useEffect, useState } from "react";
import MDEditor from "@uiw/react-md-editor";
import api from "../../services/api";
import type { IClass, ISubject, IChapter, IAssignment } from "../../types";

// ─── Assignment Form ───────────────────────────────────────────
const AssignmentForm = ({
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
  initial?: Partial<IAssignment>;
  onSave: (data: {
    title: string;
    description: string;
    instructions: string;
    totalMarks: number;
    dueDate: string;
    chapterId: string;
    subjectId: string;
    classId: string;
  }) => Promise<void>;
  onCancel: () => void;
}) => {
  const [title, setTitle] = useState(initial?.title ?? "");
  const [description, setDescription] = useState(initial?.description ?? "");
  const [instructions, setInstructions] = useState(
    initial?.instructions ?? ""
  );
  const [totalMarks, setTotalMarks] = useState(initial?.totalMarks ?? 10);
  const [dueDate, setDueDate] = useState(
    initial?.dueDate
      ? new Date(initial.dueDate).toISOString().slice(0, 16)
      : ""
  );
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
    if (!description.trim()) { setError("Description is required"); return; }
    if (!dueDate) { setError("Due date is required"); return; }
    if (!classId) { setError("Please select a class"); return; }
    if (!subjectId) { setError("Please select a subject"); return; }
    if (!chapterId) { setError("Please select a chapter"); return; }
    if (new Date(dueDate) <= new Date()) {
      setError("Due date must be in the future");
      return;
    }
    setIsSaving(true);
    setError("");
    try {
      await onSave({
        title: title.trim(),
        description,
        instructions,
        totalMarks,
        dueDate: new Date(dueDate).toISOString(),
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
        {initial?._id ? "Edit Assignment" : "Create New Assignment"}
      </h3>

      <div className="space-y-4">

        {/* ── Class + Subject + Chapter ─────────────────────── */}
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
              {classes.sort((a, b) => a.grade - b.grade).map((cls) => (
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
              className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-indigo-400 focus:outline-none text-gray-700 disabled:bg-gray-50"
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
              className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-indigo-400 focus:outline-none text-gray-700 disabled:bg-gray-50"
            >
              <option value="">
                {!subjectId ? "Select subject first" : "Select chapter"}
              </option>
              {chapters.sort((a, b) => a.order - b.order).map((chap) => (
                <option key={chap._id} value={chap._id}>
                  {chap.order}. {chap.name}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* ── Title + Marks + Due Date ──────────────────────── */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="sm:col-span-1">
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
              placeholder="e.g. Chapter 1 Homework"
              className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-indigo-400 focus:outline-none text-gray-700"
            />
          </div>
          <div>
            <label className="text-sm text-gray-600 mb-1 block">
              Total Marks
            </label>
            <input
              type="number"
              value={totalMarks}
              min={1}
              max={100}
              onChange={(e) => setTotalMarks(Number(e.target.value))}
              className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-indigo-400 focus:outline-none text-gray-700"
            />
          </div>
          <div>
            <label className="text-sm text-gray-600 mb-1 block">
              Due Date <span className="text-red-400">*</span>
            </label>
            <input
              type="datetime-local"
              value={dueDate}
              onChange={(e) => setDueDate(e.target.value)}
              className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-indigo-400 focus:outline-none text-gray-700"
            />
          </div>
        </div>

        {/* ── Description — Markdown Editor ─────────────────── */}
        <div>
          <label className="text-sm text-gray-600 mb-1 block">
            Description (Markdown) <span className="text-red-400">*</span>
          </label>
          <div data-color-mode="light">
            <MDEditor
              value={description}
              onChange={(val) => setDescription(val ?? "")}
              height={300}
              preview="live"
            />
          </div>
        </div>

        {/* ── Instructions — Markdown Editor ────────────────── */}
        <div>
          <label className="text-sm text-gray-600 mb-1 block">
            Instructions (optional)
          </label>
          <div data-color-mode="light">
            <MDEditor
              value={instructions}
              onChange={(val) => setInstructions(val ?? "")}
              height={200}
              preview="live"
            />
          </div>
          <p className="text-xs text-gray-400 mt-1">
            e.g. "Write answers in your notebook and bring to class"
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

// ─── Assignment Row ────────────────────────────────────────────
const AssignmentRow = ({
  assignment,
  onEdit,
  onDelete,
  onStatusChange,
}: {
  assignment: IAssignment;
  onEdit: () => void;
  onDelete: () => void;
  onStatusChange: (status: string) => void;
}) => {
  const subject =
    typeof assignment.subjectId === "object" ? assignment.subjectId : null;
  const chapter =
    typeof assignment.chapterId === "object" ? assignment.chapterId : null;

  const due = new Date(assignment.dueDate);
  const now = new Date();
  const isOverdue = due < now;

  const statusColor = {
    draft: "bg-yellow-50 text-yellow-600 border-yellow-200",
    published: "bg-green-50 text-green-600 border-green-200",
    closed: "bg-gray-50 text-gray-500 border-gray-200",
  }[assignment.status];

  const nextStatus = {
    draft: "published",
    published: "closed",
    closed: null,
  }[assignment.status];

  const nextStatusLabel = {
    draft: "📢 Publish",
    published: "🔒 Close",
    closed: null,
  }[assignment.status];

  return (
    <div className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100">
      <div className="flex items-start justify-between gap-4 flex-wrap">
        <div className="flex-1 min-w-0">
          <p className="font-semibold text-gray-800 truncate">
            {assignment.title}
          </p>
          <div className="flex items-center gap-2 mt-1 flex-wrap text-xs text-gray-400">
            {subject && (
              <span>
                {subject.icon} {subject.name}
              </span>
            )}
            {chapter && <span>📖 {chapter.name}</span>}
            <span>🏅 {assignment.totalMarks} marks</span>
            <span className={isOverdue ? "text-red-500" : ""}>
              📅{" "}
              {due.toLocaleDateString("en-IN", {
                day: "numeric",
                month: "short",
                year: "numeric",
              })}
              {isOverdue && " (Overdue)"}
            </span>
          </div>
        </div>

        <div className="flex items-center gap-2 flex-wrap shrink-0">
          {/* ── Status Badge ──────────────────────────────── */}
          <span
            className={`text-xs px-3 py-1.5 rounded-lg border font-medium capitalize ${statusColor}`}
          >
            {assignment.status}
          </span>

          {/* ── Status Transition Button ──────────────────── */}
          {nextStatus && nextStatusLabel && (
            <button
              onClick={() => onStatusChange(nextStatus)}
              className="text-xs px-3 py-1.5 rounded-lg border border-indigo-200 text-indigo-600 hover:bg-indigo-50 transition-all font-medium"
            >
              {nextStatusLabel}
            </button>
          )}

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
            🗑️
          </button>
        </div>
      </div>
    </div>
  );
};

// ─── Admin Assignments Page ────────────────────────────────────
const AdminAssignments = () => {
  const [classes, setClasses] = useState<IClass[]>([]);
  const [subjects, setSubjects] = useState<ISubject[]>([]);
  const [chapters, setChapters] = useState<IChapter[]>([]);
  const [assignments, setAssignments] = useState<IAssignment[]>([]);

  const [formSubjects, setFormSubjects] = useState<ISubject[]>([]);
  const [formChapters, setFormChapters] = useState<IChapter[]>([]);

  const [filterClassId, setFilterClassId] = useState("");
  const [filterSubjectId, setFilterSubjectId] = useState("");

  const [isLoading, setIsLoading] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const [editingAssignment, setEditingAssignment] =
    useState<IAssignment | null>(null);

  // ── Fetch classes ──────────────────────────────────────────
  useEffect(() => {
    const fetchClasses = async () => {
      try {
        const { data } = await api.get("/classes");
        setClasses(data.data);
        if (data.data.length > 0) setFilterClassId(data.data[0]._id);
      } catch {
        console.error("Failed to fetch classes");
      }
    };
    fetchClasses();
  }, []);

  // ── Fetch subjects on class change ─────────────────────────
  useEffect(() => {
    if (!filterClassId) return;
    const fetch = async () => {
      try {
        const { data } = await api.get(`/subjects?classId=${filterClassId}`);
        setSubjects(data.data);
        setFilterSubjectId("");
      } catch {
        console.error("Failed to fetch subjects");
      }
    };
    fetch();
  }, [filterClassId]);

  // ── Fetch assignments ──────────────────────────────────────
  const fetchAssignments = async () => {
    if (!filterClassId) return;
    setIsLoading(true);
    try {
      const url = filterSubjectId
        ? `/assignments/admin?classId=${filterClassId}&subjectId=${filterSubjectId}`
        : `/assignments/admin?classId=${filterClassId}`;
      const { data } = await api.get(url);
      setAssignments(data.data);
    } catch {
      console.error("Failed to fetch assignments");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchAssignments();
  }, [filterClassId, filterSubjectId]);

  // ── Form cascade ───────────────────────────────────────────
  const handleFormClassChange = async (classId: string) => {
    try {
      const { data } = await api.get(`/subjects?classId=${classId}`);
      setFormSubjects(data.data);
      setFormChapters([]);
    } catch {
      console.error("Failed");
    }
  };

  const handleFormSubjectChange = async (subjectId: string) => {
    try {
      const { data } = await api.get(
        `/chapters/admin?subjectId=${subjectId}`
      );
      setFormChapters(data.data);
    } catch {
      console.error("Failed");
    }
  };

  // ── Create ─────────────────────────────────────────────────
  const handleCreate = async (formData: any) => {
    await api.post("/assignments", formData);
    setShowForm(false);
    fetchAssignments();
  };

  // ── Update ─────────────────────────────────────────────────
  const handleUpdate = async (formData: any) => {
    await api.patch(`/assignments/${editingAssignment?._id}`, formData);
    setEditingAssignment(null);
    fetchAssignments();
  };

  // ── Status change ──────────────────────────────────────────
  const handleStatusChange = async (
    assignment: IAssignment,
    status: string
  ) => {
    await api.patch(`/assignments/${assignment._id}/status`, { status });
    fetchAssignments();
  };

  // ── Delete ─────────────────────────────────────────────────
  const handleDelete = async (assignment: IAssignment) => {
    if (!confirm(`Delete "${assignment.title}"?`)) return;
    await api.delete(`/assignments/${assignment._id}`);
    fetchAssignments();
  };

  return (
    <div className="p-6 max-w-5xl mx-auto">

      {/* ── Header ────────────────────────────────────────────── */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">Assignments</h1>
          <p className="text-gray-500 text-sm mt-1">
            Create and manage homework assignments
          </p>
        </div>
        {!showForm && !editingAssignment && (
          <button
            onClick={() => setShowForm(true)}
            className="bg-indigo-600 text-white px-5 py-2.5 rounded-xl text-sm font-medium hover:bg-indigo-700 transition-colors"
          >
            + New Assignment
          </button>
        )}
      </div>

      {/* ── Forms ─────────────────────────────────────────────── */}
      {showForm && (
        <AssignmentForm
          classes={classes}
          subjects={formSubjects}
          chapters={formChapters}
          onClassChange={handleFormClassChange}
          onSubjectChange={handleFormSubjectChange}
          onSave={handleCreate}
          onCancel={() => setShowForm(false)}
        />
      )}

      {editingAssignment && (
        <AssignmentForm
          classes={classes}
          subjects={formSubjects.length > 0 ? formSubjects : subjects}
          chapters={formChapters}
          onClassChange={handleFormClassChange}
          onSubjectChange={handleFormSubjectChange}
          initial={editingAssignment}
          onSave={handleUpdate}
          onCancel={() => setEditingAssignment(null)}
        />
      )}

      {/* ── Class Filter ──────────────────────────────────────── */}
      <div className="flex gap-2 flex-wrap mb-3">
        {classes.sort((a, b) => a.grade - b.grade).map((cls) => (
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
        <button
          onClick={() => setFilterSubjectId("")}
          className={`px-4 py-1.5 rounded-xl text-sm font-medium border transition-all ${!filterSubjectId
              ? "bg-purple-600 text-white border-purple-600"
              : "bg-white text-gray-600 border-gray-200 hover:border-purple-300"
            }`}
        >
          All Subjects
        </button>
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

      {/* ── Assignments List ──────────────────────────────────── */}
      {isLoading ? (
        <div className="space-y-3">
          {Array.from({ length: 4 }).map((_, i) => (
            <div
              key={i}
              className="bg-gray-100 rounded-2xl h-20 animate-pulse"
            />
          ))}
        </div>
      ) : assignments.length === 0 ? (
        <div className="text-center py-16 text-gray-400">
          <p className="text-4xl mb-3">📋</p>
          <p>No assignments yet for this class.</p>
        </div>
      ) : (
        <div className="space-y-3">
          {assignments.map((assignment) => (
            <AssignmentRow
              key={assignment._id}
              assignment={assignment}
              onEdit={() => {
                setShowForm(false);
                setEditingAssignment(assignment);
              }}
              onDelete={() => handleDelete(assignment)}
              onStatusChange={(status) =>
                handleStatusChange(assignment, status)
              }
            />
          ))}
        </div>
      )}
    </div>
  );
};

export default AdminAssignments;
