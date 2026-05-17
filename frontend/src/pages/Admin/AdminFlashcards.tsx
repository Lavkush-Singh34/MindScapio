import { useEffect, useState } from "react";
import api from "../../services/api";
import type { IClass, ISubject, IChapter, IFlashcard } from "../../types";

// ─── Single Flashcard Form ─────────────────────────────────────
const FlashcardForm = ({
  chapterId,
  subjectId,
  classId,
  initial,
  onSave,
  onCancel,
}: {
  chapterId: string;
  subjectId: string;
  classId: string;
  initial?: Partial<IFlashcard>;
  onSave: () => void;
  onCancel: () => void;
}) => {
  const [front, setFront] = useState(initial?.front ?? "");
  const [back, setBack] = useState(initial?.back ?? "");
  const [hint, setHint] = useState(initial?.hint ?? "");
  const [difficulty, setDifficulty] = useState(
    initial?.difficulty ?? "medium"
  );
  const [order, setOrder] = useState(initial?.order ?? 1);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState("");

  const handleSave = async () => {
    if (!front.trim()) { setError("Front is required"); return; }
    if (!back.trim()) { setError("Back is required"); return; }
    setIsSaving(true);
    setError("");
    try {
      if (initial?._id) {
        await api.patch(`/flashcards/${initial._id}`, {
          front: front.trim(),
          back: back.trim(),
          hint: hint.trim(),
          difficulty,
          order,
        });
      } else {
        await api.post("/flashcards", {
          front: front.trim(),
          back: back.trim(),
          hint: hint.trim(),
          difficulty,
          order,
          chapterId,
          subjectId,
          classId,
        });
      }
      onSave();
    } catch (err: any) {
      setError(err?.response?.data?.message ?? "Failed to save");
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="bg-indigo-50 rounded-2xl p-5 border border-indigo-100">
      <h4 className="font-semibold text-gray-800 mb-4">
        {initial?._id ? "Edit Flashcard" : "Add Flashcard"}
      </h4>

      <div className="space-y-4">

        {/* ── Difficulty + Order ────────────────────────────── */}
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="text-xs text-gray-600 mb-1 block">
              Difficulty
            </label>
            <select
              value={difficulty}
              onChange={(e) => setDifficulty(e.target.value as any)}
              className="w-full px-3 py-2 rounded-xl border border-gray-200 focus:border-indigo-400 focus:outline-none text-gray-700 text-sm"
            >
              <option value="easy">Easy</option>
              <option value="medium">Medium</option>
              <option value="hard">Hard</option>
            </select>
          </div>
          <div>
            <label className="text-xs text-gray-600 mb-1 block">Order</label>
            <input
              type="number"
              value={order}
              min={1}
              onChange={(e) => setOrder(Number(e.target.value))}
              className="w-full px-3 py-2 rounded-xl border border-gray-200 focus:border-indigo-400 focus:outline-none text-gray-700 text-sm"
            />
          </div>
        </div>

        {/* ── Front ─────────────────────────────────────────── */}
        <div>
          <label className="text-xs text-gray-600 mb-1 block">
            Front (Question/Term) <span className="text-red-400">*</span>
          </label>
          <textarea
            value={front}
            onChange={(e) => {
              setFront(e.target.value);
              setError("");
            }}
            placeholder="e.g. What was the main cause of the French Revolution?"
            rows={3}
            className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-indigo-400 focus:outline-none text-gray-700 text-sm resize-none"
          />
        </div>

        {/* ── Back ──────────────────────────────────────────── */}
        <div>
          <label className="text-xs text-gray-600 mb-1 block">
            Back (Answer/Definition) <span className="text-red-400">*</span>
          </label>
          <textarea
            value={back}
            onChange={(e) => setBack(e.target.value)}
            placeholder="e.g. Financial crisis, social inequality and weak leadership..."
            rows={3}
            className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-indigo-400 focus:outline-none text-gray-700 text-sm resize-none"
          />
        </div>

        {/* ── Hint ──────────────────────────────────────────── */}
        <div>
          <label className="text-xs text-gray-600 mb-1 block">
            Hint (optional — shown before flipping)
          </label>
          <input
            type="text"
            value={hint}
            onChange={(e) => setHint(e.target.value)}
            placeholder="e.g. Think about economic factors..."
            className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-indigo-400 focus:outline-none text-gray-700 text-sm"
          />
        </div>

        {error && <p className="text-red-500 text-sm">{error}</p>}

        <div className="flex gap-3">
          <button
            onClick={onCancel}
            className="flex-1 py-2.5 rounded-xl bg-white text-gray-600 border border-gray-200 font-medium text-sm hover:bg-gray-50 transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={handleSave}
            disabled={isSaving}
            className="flex-1 py-2.5 rounded-xl bg-indigo-600 text-white font-medium text-sm hover:bg-indigo-700 transition-colors disabled:opacity-50"
          >
            {isSaving ? "Saving..." : initial?._id ? "Update" : "Add Card"}
          </button>
        </div>
      </div>
    </div>
  );
};

// ─── Bulk Create Form ──────────────────────────────────────────
const BulkForm = ({
  chapterId,
  subjectId,
  classId,
  onSave,
  onCancel,
}: {
  chapterId: string;
  subjectId: string;
  classId: string;
  onSave: () => void;
  onCancel: () => void;
}) => {
  const [jsonText, setJsonText] = useState("");
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState("");

  const handleSave = async () => {
    setError("");
    let parsed: any[];
    try {
      parsed = JSON.parse(jsonText);
      if (!Array.isArray(parsed)) throw new Error("Must be an array");
    } catch {
      setError("Invalid JSON — must be an array of flashcard objects");
      return;
    }

    // Validate each card has front and back
    const invalid = parsed.some((c) => !c.front || !c.back);
    if (invalid) {
      setError("Each flashcard must have front and back fields");
      return;
    }

    setIsSaving(true);
    try {
      await api.post("/flashcards/bulk", {
        flashcards: parsed,
        chapterId,
        subjectId,
        classId,
      });
      onSave();
    } catch (err: any) {
      setError(err?.response?.data?.message ?? "Failed to save");
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="bg-purple-50 rounded-2xl p-5 border border-purple-100">
      <h4 className="font-semibold text-gray-800 mb-1">
        Bulk Create from AI
      </h4>
      <p className="text-xs text-gray-500 mb-4">
        Ask AI to generate flashcards as JSON array and paste below
      </p>

      {/* ── Example ───────────────────────────────────────── */}
      <div className="bg-white rounded-xl p-3 mb-4 font-mono text-xs text-gray-500 border border-purple-100">
        {`[
  { "front": "Term", "back": "Definition", "hint": "...", "difficulty": "easy" },
  { "front": "Term 2", "back": "Definition 2", "difficulty": "hard" }
]`}
      </div>

      {/* ── JSON Input ────────────────────────────────────── */}
      <textarea
        value={jsonText}
        onChange={(e) => {
          setJsonText(e.target.value);
          setError("");
        }}
        placeholder="Paste AI generated JSON here..."
        rows={8}
        className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-purple-400 focus:outline-none text-gray-700 text-sm resize-none font-mono"
      />

      {error && <p className="text-red-500 text-sm mt-2">{error}</p>}

      <div className="flex gap-3 mt-4">
        <button
          onClick={onCancel}
          className="flex-1 py-2.5 rounded-xl bg-white text-gray-600 border border-gray-200 font-medium text-sm hover:bg-gray-50 transition-colors"
        >
          Cancel
        </button>
        <button
          onClick={handleSave}
          disabled={isSaving}
          className="flex-1 py-2.5 rounded-xl bg-purple-600 text-white font-medium text-sm hover:bg-purple-700 transition-colors disabled:opacity-50"
        >
          {isSaving ? "Creating..." : "Create All Cards"}
        </button>
      </div>
    </div>
  );
};

// ─── Flashcard Row ─────────────────────────────────────────────
const FlashcardRow = ({
  flashcard,
  onEdit,
  onDelete,
  onTogglePublish,
}: {
  flashcard: IFlashcard;
  onEdit: () => void;
  onDelete: () => void;
  onTogglePublish: () => void;
}) => {
  const difficultyColor = {
    easy: "text-green-600 bg-green-50 border-green-200",
    medium: "text-yellow-600 bg-yellow-50 border-yellow-200",
    hard: "text-red-600 bg-red-50 border-red-200",
  }[flashcard.difficulty];

  return (
    <div className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100">
      <div className="flex items-start justify-between gap-4 flex-wrap">
        <div className="flex items-start gap-3 flex-1 min-w-0">

          {/* ── Order Badge ───────────────────────────────── */}
          <span className="w-8 h-8 bg-indigo-50 text-indigo-600 rounded-xl flex items-center justify-center font-bold text-xs shrink-0">
            {flashcard.order}
          </span>

          <div className="min-w-0">
            {/* ── Front ─────────────────────────────────────── */}
            <p className="font-medium text-gray-800 text-sm line-clamp-1">
              Q: {flashcard.front}
            </p>
            {/* ── Back ──────────────────────────────────────── */}
            <p className="text-gray-500 text-xs mt-0.5 line-clamp-1">
              A: {flashcard.back}
            </p>
            {/* ── Hint ──────────────────────────────────────── */}
            {flashcard.hint && (
              <p className="text-indigo-400 text-xs mt-0.5">
                💡 {flashcard.hint}
              </p>
            )}
          </div>
        </div>

        <div className="flex items-center gap-2 flex-wrap shrink-0">
          {/* ── Difficulty ────────────────────────────────── */}
          <span
            className={`text-xs px-2 py-1 rounded-lg border capitalize ${difficultyColor}`}
          >
            {flashcard.difficulty}
          </span>

          {/* ── Publish ───────────────────────────────────── */}
          <button
            onClick={onTogglePublish}
            className={`text-xs px-3 py-1.5 rounded-lg border font-medium transition-all ${flashcard.isPublished
                ? "bg-green-50 text-green-600 border-green-200"
                : "bg-yellow-50 text-yellow-600 border-yellow-200"
              }`}
          >
            {flashcard.isPublished ? "✅ Published" : "📝 Draft"}
          </button>

          <button
            onClick={onEdit}
            className="text-xs px-3 py-1.5 rounded-lg border border-gray-200 text-gray-600 hover:border-indigo-300 hover:text-indigo-600 transition-all"
          >
            ✏️
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

// ─── Admin Flashcards Page ─────────────────────────────────────
const AdminFlashcards = () => {
  const [classes, setClasses] = useState<IClass[]>([]);
  const [subjects, setSubjects] = useState<ISubject[]>([]);
  const [chapters, setChapters] = useState<IChapter[]>([]);
  const [flashcards, setFlashcards] = useState<IFlashcard[]>([]);

  const [filterClassId, setFilterClassId] = useState("");
  const [filterSubjectId, setFilterSubjectId] = useState("");
  const [filterChapterId, setFilterChapterId] = useState("");

  const [isLoading, setIsLoading] = useState(false);
  const [showSingleForm, setShowSingleForm] = useState(false);
  const [showBulkForm, setShowBulkForm] = useState(false);
  const [editingCard, setEditingCard] = useState<IFlashcard | null>(null);

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
        setFilterSubjectId(data.data[0]?._id ?? "");
      } catch {
        console.error("Failed to fetch subjects");
      }
    };
    fetch();
  }, [filterClassId]);

  // ── Fetch chapters on subject change ───────────────────────
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

  // ── Fetch flashcards ───────────────────────────────────────
  const fetchFlashcards = async () => {
    if (!filterChapterId) return;
    setIsLoading(true);
    try {
      const { data } = await api.get(
        `/flashcards/admin?chapterId=${filterChapterId}`
      );
      setFlashcards(data.data);
    } catch {
      console.error("Failed to fetch flashcards");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchFlashcards();
  }, [filterChapterId]);

  // ── Toggle publish ─────────────────────────────────────────
  const handleTogglePublish = async (card: IFlashcard) => {
    await api.patch(`/flashcards/${card._id}/publish`);
    fetchFlashcards();
  };

  // ── Delete ─────────────────────────────────────────────────
  const handleDelete = async (card: IFlashcard) => {
    if (!confirm("Delete this flashcard?")) return;
    await api.delete(`/flashcards/${card._id}`);
    fetchFlashcards();
  };

  // ── Publish all in chapter ─────────────────────────────────
  const handlePublishAll = async () => {
    if (!confirm("Publish all draft flashcards in this chapter?")) return;
    const drafts = flashcards.filter((f) => !f.isPublished);
    await Promise.all(
      drafts.map((f) => api.patch(`/flashcards/${f._id}/publish`))
    );
    fetchFlashcards();
  };

  const currentChapter = chapters.find((c) => c._id === filterChapterId);

  return (
    <div className="p-6 max-w-5xl mx-auto">

      {/* ── Header ────────────────────────────────────────────── */}
      <div className="flex items-center justify-between mb-6 flex-wrap gap-3">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">Flashcards</h1>
          <p className="text-gray-500 text-sm mt-1">
            Create individual cards or bulk import from AI
          </p>
        </div>
        {!showSingleForm && !showBulkForm && !editingCard && filterChapterId && (
          <div className="flex gap-2">
            <button
              onClick={() => setShowBulkForm(true)}
              className="bg-purple-600 text-white px-4 py-2.5 rounded-xl text-sm font-medium hover:bg-purple-700 transition-colors"
            >
              🤖 Bulk from AI
            </button>
            <button
              onClick={() => setShowSingleForm(true)}
              className="bg-indigo-600 text-white px-4 py-2.5 rounded-xl text-sm font-medium hover:bg-indigo-700 transition-colors"
            >
              + Add Card
            </button>
          </div>
        )}
      </div>

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
        {chapters.sort((a, b) => a.order - b.order).map((chap) => (
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

      {/* ── Forms ─────────────────────────────────────────────── */}
      {showSingleForm && filterChapterId && (
        <div className="mb-6">
          <FlashcardForm
            chapterId={filterChapterId}
            subjectId={filterSubjectId}
            classId={filterClassId}
            onSave={() => {
              setShowSingleForm(false);
              fetchFlashcards();
            }}
            onCancel={() => setShowSingleForm(false)}
          />
        </div>
      )}

      {showBulkForm && filterChapterId && (
        <div className="mb-6">
          <BulkForm
            chapterId={filterChapterId}
            subjectId={filterSubjectId}
            classId={filterClassId}
            onSave={() => {
              setShowBulkForm(false);
              fetchFlashcards();
            }}
            onCancel={() => setShowBulkForm(false)}
          />
        </div>
      )}

      {editingCard && (
        <div className="mb-6">
          <FlashcardForm
            chapterId={filterChapterId}
            subjectId={filterSubjectId}
            classId={filterClassId}
            initial={editingCard}
            onSave={() => {
              setEditingCard(null);
              fetchFlashcards();
            }}
            onCancel={() => setEditingCard(null)}
          />
        </div>
      )}

      {/* ── Stats + Publish All ───────────────────────────────── */}
      {flashcards.length > 0 && (
        <div className="flex items-center justify-between mb-4 flex-wrap gap-3">
          <div className="flex gap-4 text-sm text-gray-500">
            <span>
              📦 {flashcards.length} total
            </span>
            <span className="text-green-600">
              ✅ {flashcards.filter((f) => f.isPublished).length} published
            </span>
            <span className="text-yellow-600">
              📝 {flashcards.filter((f) => !f.isPublished).length} drafts
            </span>
          </div>
          {flashcards.some((f) => !f.isPublished) && (
            <button
              onClick={handlePublishAll}
              className="text-sm bg-green-600 text-white px-4 py-2 rounded-xl hover:bg-green-700 transition-colors"
            >
              ✅ Publish All Drafts
            </button>
          )}
        </div>
      )}

      {/* ── Flashcards List ───────────────────────────────────── */}
      {isLoading ? (
        <div className="space-y-3">
          {Array.from({ length: 5 }).map((_, i) => (
            <div
              key={i}
              className="bg-gray-100 rounded-2xl h-16 animate-pulse"
            />
          ))}
        </div>
      ) : flashcards.length === 0 ? (
        <div className="text-center py-16 text-gray-400">
          <p className="text-4xl mb-3">🃏</p>
          <p>No flashcards yet.</p>
          <p className="text-sm mt-1">
            Use "Bulk from AI" to create multiple cards at once!
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {flashcards
            .sort((a, b) => a.order - b.order)
            .map((card) => (
              <FlashcardRow
                key={card._id}
                flashcard={card}
                onEdit={() => {
                  setShowSingleForm(false);
                  setShowBulkForm(false);
                  setEditingCard(card);
                }}
                onDelete={() => handleDelete(card)}
                onTogglePublish={() => handleTogglePublish(card)}
              />
            ))}
        </div>
      )}
    </div>
  );
};

export default AdminFlashcards;
