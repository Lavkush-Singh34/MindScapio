// src/pages/Notes/NotesPage.tsx
// Step 50 — Class → Subject → Chapter drill-down with Markdown note renderer

import { useEffect, useState } from "react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { useAuth } from "../../context/AuthContext";
import api from "../../services/api";

// ─── Types ────────────────────────────────────────────────────────────────────

interface Class {
  _id: string;
  name: string;   // e.g. "Class 6"
  order: number;
}

interface Subject {
  _id: string;
  name: string;
  icon?: string;  // emoji or icon string stored in DB
  slug: string;
  classId: string;
}

interface Chapter {
  _id: string;
  title: string;
  order: number;
  isPublished: boolean;
  subjectId: string;
}

interface Note {
  _id: string;
  content: string;  // raw Markdown string
  isPublished: boolean;
  chapterId: string;
}

// ─── Component ────────────────────────────────────────────────────────────────

export default function NotesPage() {
  const { user } = useAuth();
  const isAdmin = user?.role === "admin" || user?.role === "teacher";

  // ── Selection state ─────────────────────────────────────────────────────────
  const [selectedClass, setSelectedClass] = useState<Class | null>(null);
  const [selectedSubject, setSelectedSubject] = useState<Subject | null>(null);
  const [selectedChapter, setSelectedChapter] = useState<Chapter | null>(null);

  // ── Data state ───────────────────────────────────────────────────────────────
  const [classes, setClasses] = useState<Class[]>([]);
  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [chapters, setChapters] = useState<Chapter[]>([]);
  const [note, setNote] = useState<Note | null>(null);

  // ── Loading / error state ────────────────────────────────────────────────────
  const [loadingClasses, setLoadingClasses] = useState(true);
  const [loadingSubjects, setLoadingSubjects] = useState(false);
  const [loadingChapters, setLoadingChapters] = useState(false);
  const [loadingNote, setLoadingNote] = useState(false);
  const [noteError, setNoteError] = useState<string | null>(null);

  // ── 1. Fetch all classes on mount ─────────────────────────────────────────
  useEffect(() => {
    (async () => {
      try {
        const res = await api.get("/classes");
        const sorted: Class[] = (res.data.data ?? []).sort(
          (a: Class, b: Class) => a.order - b.order
        );
        setClasses(sorted);

        // Pre-select the student's assigned class if available
        const assignedClassId = user?.classId;
        if (assignedClassId) {
          const match = sorted.find((c) => c._id === assignedClassId);
          if (match) setSelectedClass(match);
        }
      } finally {
        setLoadingClasses(false);
      }
    })();
  }, [user?.classId]);

  // ── 2. Fetch subjects when class changes ──────────────────────────────────
  useEffect(() => {
    if (!selectedClass) return;
    setSelectedSubject(null);
    setSelectedChapter(null);
    setNote(null);
    setSubjects([]);
    setChapters([]);
    setLoadingSubjects(true);

    (async () => {
      try {
        const res = await api.get(`/subjects?classId=${selectedClass._id}`);
        setSubjects(res.data.data ?? []);
      } finally {
        setLoadingSubjects(false);
      }
    })();
  }, [selectedClass]);

  // ── 3. Fetch chapters when subject changes ────────────────────────────────
  useEffect(() => {
    if (!selectedSubject) return;
    setSelectedChapter(null);
    setNote(null);
    setChapters([]);
    setLoadingChapters(true);

    (async () => {
      try {
        // Admin sees all chapters (including drafts); students see published only
        const endpoint = isAdmin
          ? `/chapters/admin?subjectId=${selectedSubject._id}`
          : `/chapters?subjectId=${selectedSubject._id}`;
        const res = await api.get(endpoint);
        const sorted: Chapter[] = (res.data.data ?? []).sort(
          (a: Chapter, b: Chapter) => a.order - b.order
        );
        setChapters(sorted);
      } finally {
        setLoadingChapters(false);
      }
    })();
  }, [selectedSubject, isAdmin]);

  // ── 4. Fetch note when chapter changes ────────────────────────────────────
  useEffect(() => {
    if (!selectedChapter) return;
    setNote(null);
    setNoteError(null);
    setLoadingNote(true);

    (async () => {
      try {
        const endpoint = isAdmin
          ? `/notes/admin?chapterId=${selectedChapter._id}`
          : `/notes?chapterId=${selectedChapter._id}`;
        const res = await api.get(endpoint);
        // API returns array; take first note for this chapter
        const notes: Note[] = res.data.data ?? [];
        if (notes.length === 0) {
          setNoteError("No notes available for this chapter yet.");
        } else {
          setNote(notes[0]);
        }
      } catch {
        setNoteError("Failed to load notes. Please try again.");
      } finally {
        setLoadingNote(false);
      }
    })();
  }, [selectedChapter, isAdmin]);

  // ── Helpers ───────────────────────────────────────────────────────────────

  /** Reset downstream selections when a panel item is picked */
  const handleSelectClass = (cls: Class) => {
    setSelectedClass(cls);
  };

  const handleSelectSubject = (sub: Subject) => {
    setSelectedSubject(sub);
  };

  const handleSelectChapter = (ch: Chapter) => {
    setSelectedChapter(ch);
  };

  // ── Render ────────────────────────────────────────────────────────────────
  return (
    <div className="flex h-[calc(100vh-64px)] overflow-hidden bg-gray-50">

      {/* ── Panel 1: Classes ──────────────────────────────────────────────── */}
      <aside className="w-44 shrink-0 border-r border-gray-200 bg-white overflow-y-auto">
        <div className="px-3 py-3 border-b border-gray-100">
          <p className="text-xs font-semibold text-gray-400 uppercase tracking-widest">
            Class
          </p>
        </div>

        {loadingClasses ? (
          <PanelSkeleton rows={5} />
        ) : (
          <ul className="py-1">
            {classes.map((cls) => (
              <li key={cls._id}>
                <button
                  onClick={() => handleSelectClass(cls)}
                  className={`w-full text-left px-4 py-2.5 text-sm transition-colors ${selectedClass?._id === cls._id
                      ? "bg-indigo-50 text-indigo-700 font-semibold border-r-2 border-indigo-600"
                      : "text-gray-700 hover:bg-gray-50"
                    }`}
                >
                  {cls.name}
                </button>
              </li>
            ))}
          </ul>
        )}
      </aside>

      {/* ── Panel 2: Subjects ─────────────────────────────────────────────── */}
      <aside className="w-48 shrink-0 border-r border-gray-200 bg-white overflow-y-auto">
        <div className="px-3 py-3 border-b border-gray-100">
          <p className="text-xs font-semibold text-gray-400 uppercase tracking-widest">
            Subject
          </p>
        </div>

        {!selectedClass ? (
          <EmptyHint text="Select a class" />
        ) : loadingSubjects ? (
          <PanelSkeleton rows={4} />
        ) : subjects.length === 0 ? (
          <EmptyHint text="No subjects found" />
        ) : (
          <ul className="py-1">
            {subjects.map((sub) => (
              <li key={sub._id}>
                <button
                  onClick={() => handleSelectSubject(sub)}
                  className={`w-full text-left px-4 py-2.5 text-sm transition-colors flex items-center gap-2 ${selectedSubject?._id === sub._id
                      ? "bg-indigo-50 text-indigo-700 font-semibold border-r-2 border-indigo-600"
                      : "text-gray-700 hover:bg-gray-50"
                    }`}
                >
                  {sub.icon && <span className="text-base">{sub.icon}</span>}
                  <span className="truncate">{sub.name}</span>
                </button>
              </li>
            ))}
          </ul>
        )}
      </aside>

      {/* ── Panel 3: Chapters ─────────────────────────────────────────────── */}
      <aside className="w-56 shrink-0 border-r border-gray-200 bg-white overflow-y-auto">
        <div className="px-3 py-3 border-b border-gray-100">
          <p className="text-xs font-semibold text-gray-400 uppercase tracking-widest">
            Chapter
          </p>
        </div>

        {!selectedSubject ? (
          <EmptyHint text="Select a subject" />
        ) : loadingChapters ? (
          <PanelSkeleton rows={4} />
        ) : chapters.length === 0 ? (
          <EmptyHint text="No chapters found" />
        ) : (
          <ul className="py-1">
            {chapters.map((ch) => (
              <li key={ch._id}>
                <button
                  onClick={() => handleSelectChapter(ch)}
                  className={`w-full text-left px-4 py-2.5 text-sm transition-colors ${selectedChapter?._id === ch._id
                      ? "bg-indigo-50 text-indigo-700 font-semibold border-r-2 border-indigo-600"
                      : "text-gray-700 hover:bg-gray-50"
                    }`}
                >
                  <span className="flex items-center justify-between gap-1">
                    <span className="truncate">{ch.title}</span>
                    {/* Show draft badge to admins/teachers */}
                    {isAdmin && !ch.isPublished && (
                      <span className="shrink-0 text-[10px] bg-amber-100 text-amber-700 rounded px-1 py-0.5 font-medium">
                        Draft
                      </span>
                    )}
                  </span>
                </button>
              </li>
            ))}
          </ul>
        )}
      </aside>

      {/* ── Main Content: Note Viewer ─────────────────────────────────────── */}
      <main className="flex-1 overflow-y-auto">
        {!selectedChapter ? (
          // Empty state — nothing selected yet
          <div className="flex flex-col items-center justify-center h-full text-center px-8">
            <div className="text-5xl mb-4">📖</div>
            <h2 className="text-xl font-semibold text-gray-700 mb-1">
              Select a chapter to view notes
            </h2>
            <p className="text-sm text-gray-400">
              Use the panels on the left to drill down to a chapter.
            </p>
          </div>
        ) : loadingNote ? (
          <NoteLoadingSkeleton />
        ) : noteError ? (
          <div className="flex flex-col items-center justify-center h-full text-center px-8">
            <div className="text-4xl mb-3">🗒️</div>
            <p className="text-gray-500 text-sm">{noteError}</p>
          </div>
        ) : note ? (
          <NoteViewer
            note={note}
            chapterTitle={selectedChapter.title}
            subjectName={selectedSubject?.name ?? ""}
            className={selectedClass?.name ?? ""}
            isAdmin={isAdmin}
          />
        ) : null}
      </main>
    </div>
  );
}

// ─── Sub-components ───────────────────────────────────────────────────────────

/** Rendered note with Markdown and header bar */
function NoteViewer({
  note,
  chapterTitle,
  subjectName,
  className,
  isAdmin,
}: {
  note: Note;
  chapterTitle: string;
  subjectName: string;
  className: string;
  isAdmin: boolean;
}) {
  return (
    <div className="max-w-3xl mx-auto px-6 py-8">
      {/* Breadcrumb */}
      <p className="text-xs text-gray-400 mb-1 tracking-wide">
        {className} &rsaquo; {subjectName} &rsaquo; {chapterTitle}
      </p>

      {/* Title row */}
      <div className="flex items-start justify-between gap-4 mb-6">
        <h1 className="text-2xl font-bold text-gray-900">{chapterTitle}</h1>

        <div className="flex items-center gap-2 shrink-0">
          {/* Draft badge for admins */}
          {isAdmin && !note.isPublished && (
            <span className="text-xs bg-amber-100 text-amber-700 rounded-full px-3 py-1 font-medium">
              Draft
            </span>
          )}

          {/* PDF Download — placeholder until Puppeteer backend is ready */}
          <button
            disabled
            title="PDF download coming soon"
            className="flex items-center gap-1.5 text-sm px-3 py-1.5 rounded-lg border border-gray-200 text-gray-400 cursor-not-allowed select-none"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-4 w-4"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={1.5}
                d="M12 10v6m0 0l-3-3m3 3l3-3M3 17V7a2 2 0 012-2h6l2 2h4a2 2 0 012 2v8a2 2 0 01-2 2H5a2 2 0 01-2-2z"
              />
            </svg>
            Download PDF
          </button>
        </div>
      </div>

      <hr className="border-gray-100 mb-8" />

      {/* ── Markdown Content ──────────────────────────────────────────────── */}
      <article className="prose prose-indigo prose-sm sm:prose max-w-none">
        <ReactMarkdown remarkPlugins={[remarkGfm]}>
          {note.content}
        </ReactMarkdown>
      </article>
    </div>
  );
}

/** Skeleton shimmer for sidebar panels */
function PanelSkeleton({ rows }: { rows: number }) {
  return (
    <div className="py-2 px-3 space-y-2">
      {Array.from({ length: rows }).map((_, i) => (
        <div
          key={i}
          className="h-8 bg-gray-100 rounded animate-pulse"
          style={{ opacity: 1 - i * 0.15 }}
        />
      ))}
    </div>
  );
}

/** Skeleton for note content area */
function NoteLoadingSkeleton() {
  return (
    <div className="max-w-3xl mx-auto px-6 py-8 space-y-4 animate-pulse">
      <div className="h-3 w-48 bg-gray-200 rounded" />
      <div className="h-7 w-72 bg-gray-200 rounded" />
      <div className="h-px bg-gray-100 my-6" />
      <div className="space-y-3">
        {[100, 90, 95, 70, 85, 60].map((w, i) => (
          <div key={i} className={`h-4 bg-gray-100 rounded`} style={{ width: `${w}%` }} />
        ))}
      </div>
    </div>
  );
}

/** Subtle hint shown when a panel is waiting for upstream selection */
function EmptyHint({ text }: { text: string }) {
  return (
    <div className="px-4 py-6 text-center">
      <p className="text-xs text-gray-400 italic">{text}</p>
    </div>
  );
}
