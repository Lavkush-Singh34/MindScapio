import { useEffect, useState } from "react";
import { useSearchParams } from "react-router-dom";
import api from "../../services/api";
import type { IClass, ISubject, IChapter, IFlashcard } from "../../types";

// ─── Flip Card Component ───────────────────────────────────────
const FlipCard = ({
  flashcard,
  index,
  total,
}: {
  flashcard: IFlashcard;
  index: number;
  total: number;
}) => {
  const [isFlipped, setIsFlipped] = useState(false);
  const [showHint, setShowHint] = useState(false);

  // Reset flip state when card changes
  useEffect(() => {
    setIsFlipped(false);
    setShowHint(false);
  }, [flashcard._id]);

  const difficultyColor = {
    easy: "bg-green-50 text-green-600 border-green-200",
    medium: "bg-yellow-50 text-yellow-600 border-yellow-200",
    hard: "bg-red-50 text-red-600 border-red-200",
  }[flashcard.difficulty];

  return (
    <div className="flex flex-col items-center">

      {/* ── Card Counter ────────────────────────────────────── */}
      <div className="flex items-center gap-3 mb-4">
        <span className="text-sm text-gray-500">
          {index + 1} / {total}
        </span>
        <span className={`text-xs px-2 py-1 rounded-lg border ${difficultyColor}`}>
          {flashcard.difficulty}
        </span>
      </div>

      {/* ── Flip Card ───────────────────────────────────────── */}
      {/* Perspective wrapper */}
      <div
        className="w-full max-w-lg cursor-pointer"
        style={{ perspective: "1000px" }}
        onClick={() => setIsFlipped(!isFlipped)}
      >
        {/* Inner card — flips on click */}
        <div
          className="relative w-full transition-transform duration-500"
          style={{
            transformStyle: "preserve-3d",
            transform: isFlipped ? "rotateY(180deg)" : "rotateY(0deg)",
            minHeight: "220px",
          }}
        >
          {/* ── Front Face ──────────────────────────────────── */}
          <div
            className="absolute inset-0 bg-white rounded-3xl shadow-lg border-2 border-indigo-100 p-8 flex flex-col items-center justify-center text-center"
            style={{ backfaceVisibility: "hidden" }}
          >
            <p className="text-xs text-indigo-400 uppercase tracking-wider mb-4 font-medium">
              Question
            </p>
            <p className="text-gray-800 text-lg font-medium leading-relaxed">
              {flashcard.front}
            </p>

            {/* ── Hint Button ───────────────────────────────── */}
            {flashcard.hint && !showHint && (
              <button
                onClick={(e) => {
                  e.stopPropagation(); // Prevent card flip
                  setShowHint(true);
                }}
                className="mt-6 text-xs text-indigo-400 hover:text-indigo-600 border border-indigo-100 px-3 py-1 rounded-lg transition-colors"
              >
                💡 Show Hint
              </button>
            )}
            {showHint && flashcard.hint && (
              <p className="mt-4 text-sm text-indigo-500 bg-indigo-50 px-4 py-2 rounded-xl">
                💡 {flashcard.hint}
              </p>
            )}

            <p className="mt-6 text-xs text-gray-300">
              Tap to reveal answer
            </p>
          </div>

          {/* ── Back Face ───────────────────────────────────── */}
          <div
            className="absolute inset-0 bg-indigo-600 rounded-3xl shadow-lg p-8 flex flex-col items-center justify-center text-center"
            style={{
              backfaceVisibility: "hidden",
              transform: "rotateY(180deg)",
            }}
          >
            <p className="text-xs text-indigo-200 uppercase tracking-wider mb-4 font-medium">
              Answer
            </p>
            <p className="text-white text-lg font-medium leading-relaxed">
              {flashcard.back}
            </p>
            <p className="mt-6 text-xs text-indigo-300">
              Tap to flip back
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

// ─── Difficulty Filter ─────────────────────────────────────────
const DifficultyFilter = ({
  selected,
  onChange,
}: {
  selected: string;
  onChange: (val: string) => void;
}) => (
  <div className="flex gap-2 flex-wrap">
    {["all", "easy", "medium", "hard"].map((d) => (
      <button
        key={d}
        onClick={() => onChange(d)}
        className={`px-4 py-1.5 rounded-xl text-sm font-medium border transition-all capitalize ${selected === d
            ? "bg-indigo-600 text-white border-indigo-600"
            : "bg-white text-gray-600 border-gray-200 hover:border-indigo-300"
          }`}
      >
        {d}
      </button>
    ))}
  </div>
);

// ─── Flashcards Page ───────────────────────────────────────────
const FlashcardsPage = () => {
  const [searchParams, setSearchParams] = useSearchParams();

  // ── Drill-down state ───────────────────────────────────────
  const [classes, setClasses] = useState<IClass[]>([]);
  const [subjects, setSubjects] = useState<ISubject[]>([]);
  const [chapters, setChapters] = useState<IChapter[]>([]);
  const [flashcards, setFlashcards] = useState<IFlashcard[]>([]);

  const selectedClassId = searchParams.get("classId");
  const selectedSubjectId = searchParams.get("subjectId");
  const selectedChapterId = searchParams.get("chapterId");

  const [selectedClass, setSelectedClass] = useState<IClass | null>(null);
  const [selectedSubject, setSelectedSubject] = useState<ISubject | null>(null);
  const [selectedChapter, setSelectedChapter] = useState<IChapter | null>(null);

  // ── Flashcard deck state ───────────────────────────────────
  const [currentIndex, setCurrentIndex] = useState(0);
  const [difficulty, setDifficulty] = useState("all");
  const [isLoading, setIsLoading] = useState(true);
  const [loadingContent, setLoadingContent] = useState(false);

  // ── Filtered flashcards ────────────────────────────────────
  const filteredCards =
    difficulty === "all"
      ? flashcards
      : flashcards.filter((f) => f.difficulty === difficulty);

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

  // ── Fetch subjects when class changes ─────────────────────
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

  // ── Fetch chapters when subject changes ───────────────────
  useEffect(() => {
    if (!selectedSubjectId) return;
    const fetch = async () => {
      setLoadingContent(true);
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
        setLoadingContent(false);
      }
    };
    fetch();
  }, [selectedSubjectId, subjects]);

  // ── Fetch flashcards when chapter changes ─────────────────
  useEffect(() => {
    if (!selectedChapterId) return;
    const fetch = async () => {
      setLoadingContent(true);
      setCurrentIndex(0);
      try {
        const { data } = await api.get(
          `/flashcards?chapterId=${selectedChapterId}`
        );
        setFlashcards(data.data);
        const chap = chapters.find((c) => c._id === selectedChapterId);
        if (chap) setSelectedChapter(chap);
      } catch {
        console.error("Failed to fetch flashcards");
      } finally {
        setLoadingContent(false);
      }
    };
    fetch();
  }, [selectedChapterId, chapters]);

  // ── Reset index when difficulty filter changes ─────────────
  useEffect(() => {
    setCurrentIndex(0);
  }, [difficulty]);

  // ── Navigation helpers ─────────────────────────────────────
  const selectClass = (classId: string) => {
    setSearchParams({ classId });
    setSubjects([]);
    setChapters([]);
    setFlashcards([]);
    setSelectedSubject(null);
    setSelectedChapter(null);
  };

  const selectSubject = (subjectId: string) => {
    setSearchParams({ classId: selectedClassId!, subjectId });
    setChapters([]);
    setFlashcards([]);
    setSelectedChapter(null);
  };

  const selectChapter = (chapterId: string) => {
    setSearchParams({
      classId: selectedClassId!,
      subjectId: selectedSubjectId!,
      chapterId,
    });
    setFlashcards([]);
  };

  // ── Loading ────────────────────────────────────────────────
  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="w-10 h-10 border-4 border-indigo-200 border-t-indigo-600 rounded-full animate-spin" />
      </div>
    );
  }

  // ── Flashcard Deck View ────────────────────────────────────
  if (selectedChapterId && !loadingContent) {
    return (
      <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8 py-8">

        {/* ── Header ────────────────────────────────────────── */}
        <div className="mb-6">
          <button
            onClick={() =>
              setSearchParams({
                classId: selectedClassId!,
                subjectId: selectedSubjectId!,
              })
            }
            className="text-sm text-indigo-600 hover:underline mb-2 flex items-center gap-1"
          >
            ← Back to Chapters
          </button>
          <h1 className="text-xl font-bold text-gray-800">
            {selectedChapter?.name} — Flashcards
          </h1>
          <p className="text-sm text-gray-500 mt-1">
            {filteredCards.length} cards
          </p>
        </div>

        {/* ── Difficulty Filter ──────────────────────────────── */}
        <div className="mb-6">
          <DifficultyFilter
            selected={difficulty}
            onChange={setDifficulty}
          />
        </div>

        {filteredCards.length === 0 ? (
          <div className="text-center py-16 text-gray-400">
            <p className="text-4xl mb-3">🃏</p>
            <p>No flashcards found for this filter.</p>
          </div>
        ) : (
          <>
            {/* ── Flip Card ───────────────────────────────────── */}
            <FlipCard
              flashcard={filteredCards[currentIndex]}
              index={currentIndex}
              total={filteredCards.length}
            />

            {/* ── Navigation Buttons ──────────────────────────── */}
            <div className="flex items-center justify-between mt-8">
              <button
                onClick={() =>
                  setCurrentIndex((prev) => Math.max(0, prev - 1))
                }
                disabled={currentIndex === 0}
                className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-white border border-gray-200 text-gray-600 hover:border-indigo-300 disabled:opacity-30 disabled:cursor-not-allowed transition-all"
              >
                ← Previous
              </button>

              {/* ── Dot indicators ────────────────────────────── */}
              <div className="flex gap-1.5">
                {filteredCards.map((_, i) => (
                  <button
                    key={i}
                    onClick={() => setCurrentIndex(i)}
                    className={`w-2 h-2 rounded-full transition-all ${i === currentIndex
                        ? "bg-indigo-600 w-4"
                        : "bg-gray-200 hover:bg-indigo-300"
                      }`}
                  />
                ))}
              </div>

              <button
                onClick={() =>
                  setCurrentIndex((prev) =>
                    Math.min(filteredCards.length - 1, prev + 1)
                  )
                }
                disabled={currentIndex === filteredCards.length - 1}
                className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-indigo-600 text-white hover:bg-indigo-700 disabled:opacity-30 disabled:cursor-not-allowed transition-all"
              >
                Next →
              </button>
            </div>

            {/* ── Completion Message ───────────────────────────── */}
            {currentIndex === filteredCards.length - 1 && (
              <div className="mt-6 bg-green-50 border border-green-200 rounded-2xl p-4 text-center">
                <p className="text-green-700 font-medium">
                  🎉 You've completed all flashcards!
                </p>
                <button
                  onClick={() => setCurrentIndex(0)}
                  className="mt-2 text-sm text-green-600 hover:underline"
                >
                  Start over
                </button>
              </div>
            )}
          </>
        )}
      </div>
    );
  }

  // ── Chapter Selection ──────────────────────────────────────
  if (selectedSubjectId && !loadingContent) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <button
          onClick={() => setSearchParams({ classId: selectedClassId! })}
          className="text-sm text-indigo-600 hover:underline mb-4 flex items-center gap-1"
        >
          ← Back to Subjects
        </button>
        <h2 className="text-xl font-bold text-gray-800 mb-4">
          {selectedSubject?.name} — Select Chapter
        </h2>
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
                <h3 className="font-semibold text-gray-800">{chapter.name}</h3>
              </div>
              <span className="text-gray-300 text-xl">›</span>
            </button>
          ))}
        </div>
      </div>
    );
  }

  // ── Subject Selection ──────────────────────────────────────
  if (selectedClassId && !loadingContent) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <button
          onClick={() => setSearchParams({})}
          className="text-sm text-indigo-600 hover:underline mb-4 flex items-center gap-1"
        >
          ← Back to Classes
        </button>
        <h2 className="text-xl font-bold text-gray-800 mb-4">
          {selectedClass?.name} — Select Subject
        </h2>
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
      </div>
    );
  }

  // ── Class Selection (default) ──────────────────────────────
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-800">Flashcards</h1>
        <p className="text-gray-500 mt-1">
          Select your class to start revising
        </p>
      </div>
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
    </div>
  );
};

export default FlashcardsPage;
