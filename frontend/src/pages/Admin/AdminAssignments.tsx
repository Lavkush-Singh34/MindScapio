
import { useEffect, useState, useCallback } from "react";
import MDEditor from "@uiw/react-md-editor";
import api from "../../services/api";
import type { IClass, ISubject, IChapter, IAssignment } from "../../types";

const STATUS_STYLE = {
  draft: "bg-amber-50 text-amber-700 border-amber-200",
  published: "bg-green-50 text-green-700 border-green-200",
  closed: "bg-gray-100 text-gray-500 border-gray-200",
};

const NEXT_STATUS: Record<string, string | null> = {
  draft: "published",
  published: "closed",
  closed: null,
};

const NEXT_LABEL: Record<string, string | null> = {
  draft: "📢 Publish",
  published: "🔒 Close",
  closed: null,
};

// ─── Assignment Form (slide-over) ──────────────────────────────
const AssignmentForm = ({
  classes,
  initial,
  onSave,
  onClose,
}: {
  classes: IClass[];
  initial?: IAssignment | null;
  onSave: () => void;
  onClose: () => void;
}) => {
  const [classId, setClassId] = useState(typeof initial?.classId === "object" ? initial.classId._id : initial?.classId ?? "");
  const [subjectId, setSubjectId] = useState(typeof initial?.subjectId === "object" ? initial.subjectId._id : initial?.subjectId ?? "");
  const [chapterId, setChapterId] = useState(typeof initial?.chapterId === "object" ? initial.chapterId._id : initial?.chapterId ?? "");
  const [title, setTitle] = useState(initial?.title ?? "");
  const [description, setDescription] = useState(initial?.description ?? "");
  const [instructions, setInstructions] = useState(initial?.instructions ?? "");
  const [totalMarks, setTotalMarks] = useState(initial?.totalMarks ?? 10);
  const [dueDate, setDueDate] = useState(
    initial?.dueDate ? new Date(initial.dueDate).toISOString().slice(0, 16) : ""
  );

  const [subjects, setSubjects] = useState<ISubject[]>([]);
  const [chapters, setChapters] = useState<IChapter[]>([]);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState("");

  // Fetch subjects when classId changes
  useEffect(() => {
    if (!classId) { setSubjects([]); setChapters([]); return; }
    api.get(`/subjects?classId=${classId}`).then(({ data }) => setSubjects(data.data)).catch(() => { });
  }, [classId]);

  // Fetch chapters when subjectId changes
  useEffect(() => {
    if (!subjectId) { setChapters([]); return; }
    api.get(`/chapters/admin?subjectId=${subjectId}`).then(({ data }) => setChapters(data.data)).catch(() => { });
  }, [subjectId]);

  // On edit — pre-fetch for existing ids
  useEffect(() => {
    if (!initial) return;
    const cid = typeof initial.classId === "object" ? initial.classId._id : initial.classId;
    const sid = typeof initial.subjectId === "object" ? initial.subjectId._id : initial.subjectId;
    if (cid) api.get(`/subjects?classId=${cid}`).then(({ data }) => setSubjects(data.data)).catch(() => { });
    if (sid) api.get(`/chapters/admin?subjectId=${sid}`).then(({ data }) => setChapters(data.data)).catch(() => { });
  }, []);

  const handleClassChange = (val: string) => { setClassId(val); setSubjectId(""); setChapterId(""); setError(""); };
  const handleSubjectChange = (val: string) => { setSubjectId(val); setChapterId(""); setError(""); };

  const handleSave = async () => {
    if (!title.trim()) return setError("Title is required");
    if (!description.trim()) return setError("Description is required");
    if (!dueDate) return setError("Due date is required");
    if (!classId) return setError("Select a class");
    if (!subjectId) return setError("Select a subject");
    if (!chapterId) return setError("Select a chapter");
    if (new Date(dueDate) <= new Date()) return setError("Due date must be in the future");

    setIsSaving(true);
    setError("");
    try {
      const payload = {
        title: title.trim(), description, instructions,
        totalMarks, dueDate: new Date(dueDate).toISOString(),
        chapterId, subjectId, classId,
      };
      if (initial?._id) {
        await api.patch(`/assignments/${initial._id}`, payload);
      } else {
        await api.post("/assignments", payload);
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
      <div className="fixed top-0 right-0 h-full w-full max-w-2xl bg-white z-50 shadow-2xl flex flex-col">

        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100 shrink-0">
          <div>
            <h2 className="font-bold text-gray-900 text-lg">{initial ? "Edit Assignment" : "New Assignment"}</h2>
            <p className="text-xs text-gray-400 mt-0.5">{initial ? "Update assignment details" : "Create a new homework assignment"}</p>
          </div>
          <button onClick={onClose} className="w-8 h-8 flex items-center justify-center rounded-xl bg-gray-100 hover:bg-gray-200 text-gray-500 text-lg">×</button>
        </div>

        {/* Body */}
        <div className="flex-1 overflow-y-auto px-6 py-5 space-y-5">

          {/* Class → Subject → Chapter */}
          <div className="grid grid-cols-3 gap-3">
            <div>
              <label className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-1.5 block">Class <span className="text-red-400">*</span></label>
              <select value={classId} onChange={(e) => handleClassChange(e.target.value)}
                className="w-full px-3 py-2.5 rounded-xl border border-gray-200 focus:border-gray-400 focus:outline-none text-gray-800 text-sm bg-gray-50">
                <option value="">Pick</option>
                {classes.sort((a, b) => a.grade - b.grade).map((cls) => (
                  <option key={cls._id} value={cls._id}>{cls.name}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-1.5 block">Subject <span className="text-red-400">*</span></label>
              <select value={subjectId} onChange={(e) => handleSubjectChange(e.target.value)} disabled={!classId}
                className="w-full px-3 py-2.5 rounded-xl border border-gray-200 focus:border-gray-400 focus:outline-none text-gray-800 text-sm bg-gray-50 disabled:opacity-40">
                <option value="">{!classId ? "—" : "Pick"}</option>
                {subjects.map((sub) => <option key={sub._id} value={sub._id}>{sub.icon} {sub.name}</option>)}
              </select>
            </div>
            <div>
              <label className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-1.5 block">Chapter <span className="text-red-400">*</span></label>
              <select value={chapterId} onChange={(e) => { setChapterId(e.target.value); setError(""); }} disabled={!subjectId}
                className="w-full px-3 py-2.5 rounded-xl border border-gray-200 focus:border-gray-400 focus:outline-none text-gray-800 text-sm bg-gray-50 disabled:opacity-40">
                <option value="">{!subjectId ? "—" : "Pick"}</option>
                {chapters.sort((a, b) => a.order - b.order).map((chap) => (
                  <option key={chap._id} value={chap._id}>{chap.order}. {chap.name}</option>
                ))}
              </select>
            </div>
          </div>

          {/* Title + Marks + Due Date */}
          <div className="grid grid-cols-3 gap-3">
            <div className="col-span-1">
              <label className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-1.5 block">Title <span className="text-red-400">*</span></label>
              <input type="text" value={title} onChange={(e) => { setTitle(e.target.value); setError(""); }}
                placeholder="e.g. Chapter 1 Homework"
                className="w-full px-3 py-2.5 rounded-xl border border-gray-200 focus:border-gray-400 focus:outline-none text-gray-800 text-sm bg-gray-50" />
            </div>
            <div>
              <label className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-1.5 block">Total Marks</label>
              <input type="number" value={totalMarks} min={1} max={100}
                onChange={(e) => setTotalMarks(Number(e.target.value))}
                className="w-full px-3 py-2.5 rounded-xl border border-gray-200 focus:border-gray-400 focus:outline-none text-gray-800 text-sm bg-gray-50" />
            </div>
            <div>
              <label className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-1.5 block">Due Date <span className="text-red-400">*</span></label>
              <input type="datetime-local" value={dueDate} onChange={(e) => { setDueDate(e.target.value); setError(""); }}
                className="w-full px-3 py-2.5 rounded-xl border border-gray-200 focus:border-gray-400 focus:outline-none text-gray-800 text-sm bg-gray-50" />
            </div>
          </div>

          {/* Description — Markdown */}
          <div>
            <label className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-1.5 block">
              Description — Markdown <span className="text-red-400">*</span>
            </label>
            <div data-color-mode="light">
              <MDEditor value={description} onChange={(val) => setDescription(val ?? "")} height={280} preview="live" />
            </div>
          </div>

          {/* Instructions — Markdown */}
          <div>
            <label className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-1.5 block">
              Instructions <span className="text-gray-300 font-normal normal-case tracking-normal">(optional)</span>
            </label>
            <div data-color-mode="light">
              <MDEditor value={instructions} onChange={(val) => setInstructions(val ?? "")} height={180} preview="live" />
            </div>
            <p className="text-xs text-gray-400 mt-1">e.g. "Write answers in your notebook and bring to class"</p>
          </div>

          {error && <div className="bg-red-50 border border-red-100 text-red-600 text-sm px-4 py-3 rounded-xl">{error}</div>}
        </div>

        {/* Footer */}
        <div className="px-6 py-4 border-t border-gray-100 flex gap-3 shrink-0 bg-gray-50">
          <button onClick={onClose} className="flex-1 py-3 rounded-xl bg-white border border-gray-200 text-gray-600 font-medium text-sm hover:bg-gray-50 transition-colors">Cancel</button>
          <button onClick={handleSave} disabled={isSaving}
            className="flex-1 py-3 rounded-xl bg-gray-900 text-white font-medium text-sm hover:bg-gray-800 transition-colors disabled:opacity-50">
            {isSaving ? "Saving…" : initial ? "Update Assignment" : "Create Assignment"}
          </button>
        </div>
      </div>
    </>
  );
};

// ─── Assignment Card ───────────────────────────────────────────
const AssignmentCard = ({
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
  const subject = typeof assignment.subjectId === "object" ? assignment.subjectId : null;
  const chapter = typeof assignment.chapterId === "object" ? assignment.chapterId : null;
  const due = new Date(assignment.dueDate);
  const isOverdue = due < new Date() && assignment.status !== "closed";
  const next = NEXT_STATUS[assignment.status];
  const nextLabel = NEXT_LABEL[assignment.status];

  return (
    <div className="group bg-white rounded-2xl border border-gray-100 hover:border-gray-200 hover:shadow-sm transition-all duration-200 overflow-hidden">
      <div className="p-5">
        <div className="flex items-start justify-between gap-3">
          <div className="flex-1 min-w-0">
            {/* Subject + chapter tags */}
            <div className="flex items-center gap-2 flex-wrap mb-1">
              {subject && (
                <span className="text-xs font-semibold bg-slate-50 text-slate-700 px-2 py-0.5 rounded-lg">
                  {subject.icon} {subject.name}
                </span>
              )}
              {chapter && <span className="text-xs text-gray-400">Ch. {chapter.name}</span>}
            </div>

            <p className="font-semibold text-gray-900 truncate">{assignment.title}</p>

            {/* Meta row */}
            <div className="flex items-center gap-3 mt-1.5 flex-wrap text-xs text-gray-400">
              <span>🏅 {assignment.totalMarks} marks</span>
              <span className={isOverdue ? "text-red-500 font-medium" : ""}>
                📅 {due.toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" })}
                {isOverdue && " · Overdue"}
              </span>
            </div>
          </div>

          {/* Status badge */}
          <span className={`shrink-0 text-xs px-2.5 py-1 rounded-lg border font-semibold capitalize ${STATUS_STYLE[assignment.status as keyof typeof STATUS_STYLE]}`}>
            {assignment.status}
          </span>
        </div>
      </div>

      {/* Action bar */}
      <div className="flex border-t border-gray-50 bg-gray-50/50 divide-x divide-gray-100 opacity-0 group-hover:opacity-100 transition-opacity">
        {next && nextLabel && (
          <button onClick={() => onStatusChange(next)}
            className="flex-1 py-2 text-xs font-semibold text-gray-700 hover:text-gray-900 hover:bg-gray-100 transition-colors">
            {nextLabel}
          </button>
        )}
        {/* If closed, no transition button — show placeholder space */}
        {!next && <div className="flex-1" />}
        <button onClick={onEdit}
          className="flex-1 py-2 text-xs font-medium text-gray-600 hover:text-gray-900 hover:bg-gray-100 transition-colors">
          ✏️ Edit
        </button>
        <button onClick={onDelete}
          className="flex-1 py-2 text-xs font-medium text-red-400 hover:text-red-600 hover:bg-red-50 transition-colors">
          🗑 Delete
        </button>
      </div>
    </div>
  );
};

// ─── Admin Assignments Page ────────────────────────────────────
const AdminAssignments = () => {
  const [classes, setClasses] = useState<IClass[]>([]);
  const [subjects, setSubjects] = useState<ISubject[]>([]);
  const [assignments, setAssignments] = useState<IAssignment[]>([]);

  const [filterClassId, setFilterClassId] = useState("");
  const [filterSubjectId, setFilterSubjectId] = useState("");
  const [filterStatus, setFilterStatus] = useState<string>("all");

  const [isLoading, setIsLoading] = useState(false);
  const [formOpen, setFormOpen] = useState(false);
  const [editingAssignment, setEditingAssignment] = useState<IAssignment | null>(null);

  // Fetch classes once
  useEffect(() => {
    api.get("/classes").then(({ data }) => {
      setClasses(data.data);
      if (data.data.length > 0) setFilterClassId(data.data[0]._id);
    }).catch(() => { });
  }, []);

  // Fetch subjects when class changes
  useEffect(() => {
    if (!filterClassId) return;
    api.get(`/subjects?classId=${filterClassId}`).then(({ data }) => {
      setSubjects(data.data);
      setFilterSubjectId("");
    }).catch(() => { });
  }, [filterClassId]);

  // Fetch assignments
  const fetchAssignments = useCallback(async () => {
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
  }, [filterClassId, filterSubjectId]);

  useEffect(() => { fetchAssignments(); }, [fetchAssignments]);

  const handleSaved = () => { setFormOpen(false); setEditingAssignment(null); fetchAssignments(); };

  const handleStatusChange = async (assignment: IAssignment, status: string) => {
    await api.patch(`/assignments/${assignment._id}/status`, { status });
    fetchAssignments();
  };

  const handleDelete = async (assignment: IAssignment) => {
    if (!confirm(`Delete "${assignment.title}"?`)) return;
    await api.delete(`/assignments/${assignment._id}`);
    fetchAssignments();
  };

  // Client-side status filter
  const filtered = filterStatus === "all"
    ? assignments
    : assignments.filter((a) => a.status === filterStatus);

  const isFormOpen = formOpen || !!editingAssignment;

  return (
    <div className="p-6 max-w-5xl mx-auto">

      {/* Header */}
      <div className="flex items-center justify-between mb-5">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 tracking-tight">Assignments</h1>
          <p className="text-gray-400 text-sm mt-0.5">Create and manage homework assignments</p>
        </div>
        <button onClick={() => { setEditingAssignment(null); setFormOpen(true); }}
          className="bg-gray-900 text-white px-5 py-2.5 rounded-xl text-sm font-semibold hover:bg-gray-800 transition-colors">
          + New Assignment
        </button>
      </div>

      {/* Filter bar */}
      <div className="bg-white border border-gray-100 rounded-2xl px-5 py-4 mb-5 space-y-3">

        {/* Class pills */}
        <div>
          <p className="text-[10px] font-bold text-gray-300 uppercase tracking-widest mb-2">Class</p>
          <div className="flex gap-1.5 flex-wrap">
            {classes.sort((a, b) => a.grade - b.grade).map((cls) => (
              <button key={cls._id} onClick={() => setFilterClassId(cls._id)}
                className={`px-3 py-1 rounded-lg text-xs font-semibold border transition-all ${filterClassId === cls._id ? "bg-gray-900 text-white border-gray-900" : "bg-white text-gray-500 border-gray-200 hover:border-gray-400"
                  }`}>{cls.name}</button>
            ))}
          </div>
        </div>

        {/* Subject pills — with "All" option */}
        {subjects.length > 0 && (
          <div>
            <p className="text-[10px] font-bold text-gray-300 uppercase tracking-widest mb-2">Subject</p>
            <div className="flex gap-1.5 flex-wrap">
              <button onClick={() => setFilterSubjectId("")}
                className={`px-3 py-1 rounded-lg text-xs font-semibold border transition-all ${!filterSubjectId ? "bg-slate-600 text-white border-slate-600" : "bg-white text-gray-500 border-gray-200 hover:border-slate-300"
                  }`}>All</button>
              {subjects.map((sub) => (
                <button key={sub._id} onClick={() => setFilterSubjectId(sub._id)}
                  className={`px-3 py-1 rounded-lg text-xs font-semibold border transition-all ${filterSubjectId === sub._id ? "bg-slate-600 text-white border-slate-600" : "bg-white text-gray-500 border-gray-200 hover:border-slate-300"
                    }`}>{sub.icon} {sub.name}</button>
              ))}
            </div>
          </div>
        )}

        {/* Status filter */}
        <div>
          <p className="text-[10px] font-bold text-gray-300 uppercase tracking-widest mb-2">Status</p>
          <div className="flex gap-1.5 flex-wrap">
            {["all", "draft", "published", "closed"].map((s) => (
              <button key={s} onClick={() => setFilterStatus(s)}
                className={`px-3 py-1 rounded-lg text-xs font-semibold border transition-all capitalize ${filterStatus === s ? "bg-gray-900 text-white border-gray-900" : "bg-white text-gray-500 border-gray-200 hover:border-gray-400"
                  }`}>{s}</button>
            ))}
          </div>
        </div>
      </div>

      {/* Assignments list */}
      {isLoading ? (
        <div className="space-y-3">
          {[...Array(3)].map((_, i) => <div key={i} className="bg-gray-100 rounded-2xl h-24 animate-pulse" />)}
        </div>
      ) : filtered.length === 0 ? (
        <div className="text-center py-20 text-gray-300">
          <p className="text-5xl mb-3">📋</p>
          <p className="text-sm font-medium">
            {assignments.length === 0 ? "No assignments yet" : "No assignments match this filter"}
          </p>
          {assignments.length === 0 && (
            <button onClick={() => { setEditingAssignment(null); setFormOpen(true); }}
              className="mt-4 text-sm text-gray-900 font-semibold underline underline-offset-2">
              Create the first one →
            </button>
          )}
        </div>
      ) : (
        <div className="space-y-3">
          {filtered.map((assignment) => (
            <AssignmentCard
              key={assignment._id}
              assignment={assignment}
              onEdit={() => { setFormOpen(false); setEditingAssignment(assignment); }}
              onDelete={() => handleDelete(assignment)}
              onStatusChange={(status) => handleStatusChange(assignment, status)}
            />
          ))}
        </div>
      )}

      {/* Slide-over form */}
      {isFormOpen && (
        <AssignmentForm
          classes={classes}
          initial={editingAssignment}
          onSave={handleSaved}
          onClose={() => { setFormOpen(false); setEditingAssignment(null); }}
        />
      )}
    </div>
  );
};

export default AdminAssignments;

