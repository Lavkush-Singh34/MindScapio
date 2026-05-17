import { useEffect, useState } from "react";
import { useSearchParams } from "react-router-dom";
import api from "../../services/api";
import type { IClass, ISubject, IChapter, INote } from "../../types";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";

// ─── Install these if not already ─────────────────────────────
// pnpm add react-markdown remark-gfm

// ─── Breadcrumb ────────────────────────────────────────────────
const Breadcrumb = ({
  items,
}: {
  items: { label: string; onClick?: () => void }[];
}) => (
  <div className="flex items-center gap-2 text-sm text-gray-500 mb-6 flex-wrap">
    {items.map((item, index) => (
      <span key={index} className="flex items-center gap-2">
        {index > 0 && <span className="text-gray-300">›</span>}
        {item.onClick ? (
          <button
            onClick={item.onClick}
            className="hover:text-indigo-600 transition-colors"
          >
            {item.label}
          </button>
        ) : (
          <span className="text-gray-800 font-medium">{item.label}</span>
        )}
      </span>
    ))}
  </div>
);

// ─── Skeleton Loader ───────────────────────────────────────────
const SkeletonCard = () => (
  <div className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100 animate-pulse">
    <div className="h-4 bg-gray-200 rounded w-3/4 mb-3" />
    <div className="h-3 bg-gray-100 rounded w-1/2" />
  </div>
);

// ─── Notes Page ────────────────────────────────────────────────
const NotesPage = () => {
  const [searchParams, setSearchParams] = useSearchParams();

  // ── Drill-down state ───────────────────────────────────────
  const [classes, setClasses] = useState<IClass[]>([]);
  const [subjects, setSubjects] = useState<ISubject[]>([]);
  const [chapters, setChapters] = useState<IChapter[]>([]);
  const [notes, setNotes] = useState<INote[]>([]);
  const [selectedNote, setSelectedNote] = useState<INote | null>(null);

  // ── Selected IDs from URL params ───────────────────────────
  const selectedClassId = searchParams.get("classId");
  const selectedSubjectId = searchParams.get("subjectId");
  const selectedChapterId = searchParams.get("chapterId");
  const selectedNoteId = searchParams.get("noteId");

  // ── Loading states ─────────────────────────────────────────
  const [loadingClasses, setLoadingClasses] = useState(true);
  const [loadingSubjects, setLoadingSubjects] = useState(false);
  const [loadingChapters, setLoadingChapters] = useState(false);
  const [loadingNotes, setLoadingNotes] = useState(false);
  const [loadingNote, setLoadingNote] = useState(false);

  // ── Selected objects for breadcrumb labels ─────────────────
  const [selectedClass, setSelectedClass] = useState<IClass | null>(null);
  const [selectedSubject, setSelectedSubject] = useState<ISubject | null>(null);
  const [selectedChapter, setSelectedChapter] = useState<IChapter | null>(null);

  // ── Fetch classes on mount ─────────────────────────────────
  useEffect(() => {
    const fetchClasses = async () => {
      try {
        const { data } = await api.get("/classes");
        setClasses(data.data);
      } catch {
        console.error("Failed to fetch classes");
      } finally {
        setLoadingClasses(false);
      }
    };
    fetchClasses();
  }, []);

  // ── Fetch subjects when class selected ────────────────────
  useEffect(() => {
    if (!selectedClassId) return;
    const fetchSubjects = async () => {
      setLoadingSubjects(true);
      try {
        const { data } = await api.get(`/subjects?classId=${selectedClassId}`);
        setSubjects(data.data);
        const cls = classes.find((c) => c._id === selectedClassId);
        if (cls) setSelectedClass(cls);
      } catch {
        console.error("Failed to fetch subjects");
      } finally {
        setLoadingSubjects(false);
      }
    };
    fetchSubjects();
  }, [selectedClassId, classes]);

  // ── Fetch chapters when subject selected ──────────────────
  useEffect(() => {
    if (!selectedSubjectId) return;
    const fetchChapters = async () => {
      setLoadingChapters(true);
      try {
        const { data } = await api.get(
          `/chapters?subjectId=${selectedSubjectId}`
        );
        setChapters(data.data);
        const sub = subjects.find((s) => s._id === selectedSubjectId);
        if (sub) setSelectedSubject(sub);
      } catch {
        console.error("Failed to fetch chapters");
      } finally {
        setLoadingChapters(false);
      }
    };
    fetchChapters();
  }, [selectedSubjectId, subjects]);

  // ── Fetch notes when chapter selected ─────────────────────
  useEffect(() => {
    if (!selectedChapterId) return;
    const fetchNotes = async () => {
      setLoadingNotes(true);
      try {
        const { data } = await api.get(
          `/notes?chapterId=${selectedChapterId}`
        );
        setNotes(data.data);
        const chap = chapters.find((c) => c._id === selectedChapterId);
        if (chap) setSelectedChapter(chap);
      } catch {
        console.error("Failed to fetch notes");
      } finally {
        setLoadingNotes(false);
      }
    };
    fetchNotes();
  }, [selectedChapterId, chapters]);

  // ── Fetch single note when noteId in URL ──────────────────
  useEffect(() => {
    if (!selectedNoteId) return;
    const fetchNote = async () => {
      setLoadingNote(true);
      try {
        const { data } = await api.get(`/notes/${selectedNoteId}`);
        setSelectedNote(data.data);
      } catch {
        console.error("Failed to fetch note");
      } finally {
        setLoadingNote(false);
      }
    };
    fetchNote();
  }, [selectedNoteId]);

  // ── Navigation helpers ─────────────────────────────────────
  const selectClass = (classId: string) => {
    setSearchParams({ classId });
    setSubjects([]);
    setChapters([]);
    setNotes([]);
    setSelectedNote(null);
    setSelectedSubject(null);
    setSelectedChapter(null);
  };

  const selectSubject = (subjectId: string) => {
    setSearchParams({ classId: selectedClassId!, subjectId });
    setChapters([]);
    setNotes([]);
    setSelectedNote(null);
    setSelectedChapter(null);
  };

  const selectChapter = (chapterId: string) => {
    setSearchParams({
      classId: selectedClassId!,
      subjectId: selectedSubjectId!,
      chapterId,
    });
    setNotes([]);
    setSelectedNote(null);
  };

  const selectNote = (noteId: string) => {
    setSearchParams({
      classId: selectedClassId!,
      subjectId: selectedSubjectId!,
      chapterId: selectedChapterId!,
      noteId,
    });
  };

  // ── Breadcrumb items ───────────────────────────────────────
  const breadcrumbItems = [
    {
      label: "All Classes",
      onClick: selectedClassId
        ? () => setSearchParams({})
        : undefined,
    },
    ...(selectedClass
      ? [
        {
          label: selectedClass.name,
          onClick: selectedSubjectId
            ? () => selectClass(selectedClassId!)
            : undefined,
        },
      ]
      : []),
    ...(selectedSubject
      ? [
        {
          label: selectedSubject.name,
          onClick: selectedChapterId
            ? () => selectSubject(selectedSubjectId!)
            : undefined,
        },
      ]
      : []),
    ...(selectedChapter
      ? [
        {
          label: selectedChapter.name,
          onClick: selectedNoteId
            ? () => selectChapter(selectedChapterId!)
            : undefined,
        },
      ]
      : []),
    ...(selectedNote ? [{ label: selectedNote.title }] : []),
  ];

  // ─── Render Note Content ───────────────────────────────────
  if (selectedNoteId) {
    return (
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <Breadcrumb items={breadcrumbItems} />
        {loadingNote ? (
          <div className="space-y-4">
            {Array.from({ length: 5 }).map((_, i) => (
              <div key={i} className="h-4 bg-gray-200 rounded animate-pulse" />
            ))}
          </div>
        ) : selectedNote ? (
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 sm:p-10">
            <h1 className="text-2xl font-bold text-gray-800 mb-6">
              {selectedNote.title}
            </h1>
            {/* ── Markdown Renderer ─────────────────────────── */}
            <div className="prose prose-indigo max-w-none">
              <ReactMarkdown remarkPlugins={[remarkGfm]}>
                {selectedNote.content}
              </ReactMarkdown>
            </div>
          </div>
        ) : (
          <p className="text-gray-500">Note not found.</p>
        )}
      </div>
    );
  }

  // ─── Render Notes List ─────────────────────────────────────
  if (selectedChapterId) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <Breadcrumb items={breadcrumbItems} />
        <h2 className="text-xl font-bold text-gray-800 mb-4">
          Notes — {selectedChapter?.name}
        </h2>
        {loadingNotes ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {Array.from({ length: 4 }).map((_, i) => (
              <SkeletonCard key={i} />
            ))}
          </div>
        ) : notes.length === 0 ? (
          <div className="text-center py-16 text-gray-400">
            <p className="text-4xl mb-3">📭</p>
            <p>No notes published yet for this chapter.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {notes.map((note) => (
              <button
                key={note._id}
                onClick={() => selectNote(note._id)}
                className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100 hover:border-indigo-200 hover:shadow-md text-left transition-all"
              >
                <h3 className="font-semibold text-gray-800">{note.title}</h3>
                <p className="text-xs text-gray-400 mt-2">
                  {new Date(note.createdAt).toLocaleDateString("en-IN", {
                    day: "numeric",
                    month: "short",
                    year: "numeric",
                  })}
                </p>
              </button>
            ))}
          </div>
        )}
      </div>
    );
  }

  // ─── Render Chapters List ──────────────────────────────────
  if (selectedSubjectId) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <Breadcrumb items={breadcrumbItems} />
        <h2 className="text-xl font-bold text-gray-800 mb-4">
          Chapters — {selectedSubject?.name}
        </h2>
        {loadingChapters ? (
          <div className="space-y-3">
            {Array.from({ length: 5 }).map((_, i) => (
              <SkeletonCard key={i} />
            ))}
          </div>
        ) : chapters.length === 0 ? (
          <div className="text-center py-16 text-gray-400">
            <p className="text-4xl mb-3">📭</p>
            <p>No chapters published yet.</p>
          </div>
        ) : (
          <div className="space-y-3">
            {chapters.map((chapter) => (
              <button
                key={chapter._id}
                onClick={() => selectChapter(chapter._id)}
                className="w-full bg-white rounded-2xl p-5 shadow-sm border border-gray-100 hover:border-indigo-200 hover:shadow-md text-left transition-all flex items-center justify-between"
              >
                <div className="flex items-center gap-4">
                  <span className="w-9 h-9 bg-indigo-50 text-indigo-600 rounded-xl flex items-center justify-center font-bold text-sm">
                    {chapter.order}
                  </span>
                  <div>
                    <h3 className="font-semibold text-gray-800">
                      {chapter.name}
                    </h3>
                    {chapter.description && (
                      <p className="text-xs text-gray-400 mt-0.5">
                        {chapter.description}
                      </p>
                    )}
                  </div>
                </div>
                <span className="text-gray-300 text-xl">›</span>
              </button>
            ))}
          </div>
        )}
      </div>
    );
  }

  // ─── Render Subjects List ──────────────────────────────────
  if (selectedClassId) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <Breadcrumb items={breadcrumbItems} />
        <h2 className="text-xl font-bold text-gray-800 mb-4">
          Subjects — {selectedClass?.name}
        </h2>
        {loadingSubjects ? (
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
            {Array.from({ length: 6 }).map((_, i) => (
              <SkeletonCard key={i} />
            ))}
          </div>
        ) : subjects.length === 0 ? (
          <div className="text-center py-16 text-gray-400">
            <p className="text-4xl mb-3">📭</p>
            <p>No subjects available for this class yet.</p>
          </div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
            {subjects.map((subject) => (
              <button
                key={subject._id}
                onClick={() => selectSubject(subject._id)}
                className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 hover:border-indigo-200 hover:shadow-md text-center transition-all"
              >
                <p className="text-4xl mb-2">{subject.icon}</p>
                <h3 className="font-semibold text-gray-800">{subject.name}</h3>
              </button>
            ))}
          </div>
        )}
      </div>
    );
  }

  // ─── Render Classes List (default view) ───────────────────
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-800">Notes</h1>
        <p className="text-gray-500 mt-1">
          Select your class to browse notes
        </p>
      </div>
      {loadingClasses ? (
        <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
          {Array.from({ length: 10 }).map((_, i) => (
            <div
              key={i}
              className="bg-gray-100 rounded-2xl h-24 animate-pulse"
            />
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
          {classes.map((cls) => (
            <button
              key={cls._id}
              onClick={() => selectClass(cls._id)}
              className="bg-white border border-gray-100 hover:border-indigo-200 hover:bg-indigo-50 rounded-2xl p-4 text-center transition-all shadow-sm group"
            >
              <p className="text-2xl font-bold text-indigo-600 group-hover:scale-110 transition-transform">
                {cls.grade}
              </p>
              <p className="text-xs text-gray-500 mt-1">{cls.name}</p>
            </button>
          ))}
        </div>
      )}
    </div>
  );
};

export default NotesPage;
