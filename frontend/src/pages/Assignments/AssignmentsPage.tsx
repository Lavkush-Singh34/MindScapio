import { useEffect, useState } from "react";
import { useSearchParams } from "react-router-dom";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import api from "../../services/api";
import type { IClass, ISubject, IAssignment } from "../../types";

// ─── Due Date Badge ────────────────────────────────────────────
const DueDateBadge = ({ dueDate }: { dueDate: string }) => {
  const due = new Date(dueDate);
  const now = new Date();
  const diffDays = Math.ceil(
    (due.getTime() - now.getTime()) / (1000 * 60 * 60 * 24)
  );

  const isOverdue = diffDays < 0;
  const isUrgent = diffDays >= 0 && diffDays <= 2;

  const label = isOverdue
    ? "Overdue"
    : diffDays === 0
      ? "Due Today"
      : diffDays === 1
        ? "Due Tomorrow"
        : `Due in ${diffDays} days`;

  const color = isOverdue
    ? "bg-red-50 text-red-600 border-red-200"
    : isUrgent
      ? "bg-orange-50 text-orange-600 border-orange-200"
      : "bg-green-50 text-green-600 border-green-200";

  return (
    <span className={`text-xs px-2 py-1 rounded-lg border font-medium ${color}`}>
      {label}
    </span>
  );
};

// ─── Assignment Card ───────────────────────────────────────────
const AssignmentCard = ({
  assignment,
  onClick,
}: {
  assignment: IAssignment;
  onClick: () => void;
}) => {
  const subject =
    typeof assignment.subjectId === "object" ? assignment.subjectId : null;
  const chapter =
    typeof assignment.chapterId === "object" ? assignment.chapterId : null;

  return (
    <button
      onClick={onClick}
      className="w-full bg-white rounded-2xl p-5 shadow-sm border border-gray-100 hover:border-indigo-200 hover:shadow-md text-left transition-all"
    >
      {/* ── Top Row ─────────────────────────────────────────── */}
      <div className="flex items-start justify-between gap-3 mb-3">
        <h3 className="font-semibold text-gray-800 leading-snug">
          {assignment.title}
        </h3>
        <DueDateBadge dueDate={assignment.dueDate} />
      </div>

      {/* ── Meta ────────────────────────────────────────────── */}
      <div className="flex items-center gap-3 flex-wrap text-xs text-gray-400">
        {subject && (
          <span className="flex items-center gap-1">
            {subject.icon} {subject.name}
          </span>
        )}
        {chapter && (
          <span className="flex items-center gap-1">
            📖 {chapter.name}
          </span>
        )}
        <span>🏅 {assignment.totalMarks} marks</span>
      </div>

      {/* ── Due Date ────────────────────────────────────────── */}
      <p className="text-xs text-gray-400 mt-3">
        {new Date(assignment.dueDate).toLocaleDateString("en-IN", {
          weekday: "short",
          day: "numeric",
          month: "short",
          year: "numeric",
        })}
      </p>
    </button>
  );
};

// ─── Assignment Detail View ────────────────────────────────────
const AssignmentDetail = ({
  assignment,
  onBack,
}: {
  assignment: IAssignment;
  onBack: () => void;
}) => {
  const subject =
    typeof assignment.subjectId === "object" ? assignment.subjectId : null;

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">

      {/* ── Back Button ───────────────────────────────────────── */}
      <button
        onClick={onBack}
        className="text-sm text-indigo-600 hover:underline mb-6 flex items-center gap-1"
      >
        ← Back to Assignments
      </button>

      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 sm:p-10">

        {/* ── Header ────────────────────────────────────────── */}
        <div className="flex items-start justify-between gap-4 mb-6 flex-wrap">
          <div>
            <h1 className="text-2xl font-bold text-gray-800">
              {assignment.title}
            </h1>
            <div className="flex items-center gap-3 mt-2 flex-wrap text-sm text-gray-500">
              {subject && (
                <span>
                  {subject.icon} {subject.name}
                </span>
              )}
              <span>🏅 {assignment.totalMarks} marks</span>
            </div>
          </div>
          <DueDateBadge dueDate={assignment.dueDate} />
        </div>

        {/* ── Description — Markdown ─────────────────────────── */}
        <div className="prose prose-indigo max-w-none mb-6">
          <ReactMarkdown remarkPlugins={[remarkGfm]}>
            {assignment.description}
          </ReactMarkdown>
        </div>

        {/* ── Instructions ──────────────────────────────────── */}
        {assignment.instructions && (
          <div className="bg-indigo-50 border border-indigo-100 rounded-2xl p-5">
            <h3 className="font-semibold text-indigo-800 mb-2">
              📋 Instructions
            </h3>
            <div className="prose prose-indigo max-w-none text-sm">
              <ReactMarkdown remarkPlugins={[remarkGfm]}>
                {assignment.instructions}
              </ReactMarkdown>
            </div>
          </div>
        )}

        {/* ── Due Date Footer ────────────────────────────────── */}
        <div className="mt-6 pt-6 border-t border-gray-100 flex items-center justify-between flex-wrap gap-3">
          <p className="text-sm text-gray-500">
            Due:{" "}
            <span className="font-medium text-gray-700">
              {new Date(assignment.dueDate).toLocaleDateString("en-IN", {
                weekday: "long",
                day: "numeric",
                month: "long",
                year: "numeric",
              })}
            </span>
          </p>

          {/* ── PDF Download placeholder ───────────────────────── */}
          <button
            disabled
            className="flex items-center gap-2 bg-gray-100 text-gray-400 px-4 py-2 rounded-xl text-sm cursor-not-allowed"
            title="PDF download coming soon"
          >
            📥 Download PDF
          </button>
        </div>
      </div>
    </div>
  );
};

// ─── Assignments Page ──────────────────────────────────────────
const AssignmentsPage = () => {
  const [searchParams, setSearchParams] = useSearchParams();

  const [classes, setClasses] = useState<IClass[]>([]);
  const [subjects, setSubjects] = useState<ISubject[]>([]);
  const [assignments, setAssignments] = useState<IAssignment[]>([]);
  const [selectedAssignment, setSelectedAssignment] =
    useState<IAssignment | null>(null);

  const selectedClassId = searchParams.get("classId");
  const selectedSubjectId = searchParams.get("subjectId");

  const [selectedClass, setSelectedClass] = useState<IClass | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [loadingContent, setLoadingContent] = useState(false);

  // ── Fetch classes on mount ─────────────────────────────────
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

  // ── Fetch subjects when class selected ────────────────────
  useEffect(() => {
    if (!selectedClassId) return;
    const fetch = async () => {
      setLoadingContent(true);
      try {
        const { data } = await api.get(`/subjects?classId=${selectedClassId}`);
        setSubjects(data.data);
        const cls = classes.find((c) => c._id === selectedClassId);
        if (cls) setSelectedClass(cls);
      } catch {
        console.error("Failed to fetch subjects");
      } finally {
        setLoadingContent(false);
      }
    };
    fetch();
  }, [selectedClassId, classes]);

  // ── Fetch assignments when class or subject changes ────────
  useEffect(() => {
    if (!selectedClassId) return;
    const fetch = async () => {
      setLoadingContent(true);
      try {
        const url = selectedSubjectId
          ? `/assignments?classId=${selectedClassId}&subjectId=${selectedSubjectId}`
          : `/assignments?classId=${selectedClassId}`;
        const { data } = await api.get(url);
        setAssignments(data.data);
      } catch {
        console.error("Failed to fetch assignments");
      } finally {
        setLoadingContent(false);
      }
    };
    fetch();
  }, [selectedClassId, selectedSubjectId]);

  // ── Detail view ────────────────────────────────────────────
  if (selectedAssignment) {
    return (
      <AssignmentDetail
        assignment={selectedAssignment}
        onBack={() => setSelectedAssignment(null)}
      />
    );
  }

  // ── Loading ────────────────────────────────────────────────
  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="w-10 h-10 border-4 border-indigo-200 border-t-indigo-600 rounded-full animate-spin" />
      </div>
    );
  }

  // ── Assignments List ───────────────────────────────────────
  if (selectedClassId) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">

        {/* ── Header ────────────────────────────────────────── */}
        <div className="flex items-center justify-between mb-6 flex-wrap gap-4">
          <div>
            <button
              onClick={() => setSearchParams({})}
              className="text-sm text-indigo-600 hover:underline mb-1 flex items-center gap-1"
            >
              ← Back to Classes
            </button>
            <h1 className="text-xl font-bold text-gray-800">
              Assignments — {selectedClass?.name}
            </h1>
          </div>
        </div>

        {/* ── Subject Filter ────────────────────────────────── */}
        <div className="flex gap-2 flex-wrap mb-6">
          <button
            onClick={() =>
              setSearchParams({ classId: selectedClassId })
            }
            className={`px-4 py-1.5 rounded-xl text-sm font-medium border transition-all ${!selectedSubjectId
                ? "bg-indigo-600 text-white border-indigo-600"
                : "bg-white text-gray-600 border-gray-200 hover:border-indigo-300"
              }`}
          >
            All Subjects
          </button>
          {subjects.map((subject) => (
            <button
              key={subject._id}
              onClick={() =>
                setSearchParams({
                  classId: selectedClassId,
                  subjectId: subject._id,
                })
              }
              className={`px-4 py-1.5 rounded-xl text-sm font-medium border transition-all ${selectedSubjectId === subject._id
                  ? "bg-indigo-600 text-white border-indigo-600"
                  : "bg-white text-gray-600 border-gray-200 hover:border-indigo-300"
                }`}
            >
              {subject.icon} {subject.name}
            </button>
          ))}
        </div>

        {/* ── Assignments List ──────────────────────────────── */}
        {loadingContent ? (
          <div className="space-y-3">
            {Array.from({ length: 4 }).map((_, i) => (
              <div
                key={i}
                className="bg-gray-100 rounded-2xl h-24 animate-pulse"
              />
            ))}
          </div>
        ) : assignments.length === 0 ? (
          <div className="text-center py-16 text-gray-400">
            <p className="text-4xl mb-3">📭</p>
            <p>No assignments published yet.</p>
          </div>
        ) : (
          <div className="space-y-3">
            {assignments.map((assignment) => (
              <AssignmentCard
                key={assignment._id}
                assignment={assignment}
                onClick={() => setSelectedAssignment(assignment)}
              />
            ))}
          </div>
        )}
      </div>
    );
  }

  // ── Class Selection (default) ──────────────────────────────
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-800">Assignments</h1>
        <p className="text-gray-500 mt-1">
          Select your class to view assignments
        </p>
      </div>
      <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
        {classes.map((cls) => (
          <button
            key={cls._id}
            onClick={() => setSearchParams({ classId: cls._id })}
            className="bg-white border border-gray-100 hover:border-indigo-200 hover:bg-indigo-50 rounded-2xl p-4 text-center transition-all shadow-sm group"
          >
            <p className="text-2xl font-bold text-indigo-600 group-hover:scale-110 transition-transform">
              {cls.grade}
            </p>
            <p className="text-xs text-gray-500 mt-1">{cls.name}</p>
          </button>
        ))}
      </div>
    </div>
  );
};

export default AssignmentsPage;
