
import { useEffect, useState, useCallback } from "react";
import api from "../../services/api";
import type { IClass, ISubject, IChapter, IFlashcard } from "../../types";

const DIFFICULTY_STYLE = {
  easy: "bg-green-50 text-green-700 border-green-200",
  medium: "bg-amber-50 text-amber-700 border-amber-200",
  hard: "bg-red-50 text-red-600 border-red-200",
};

// ─── Single Flashcard Form (slide-over) ───────────────────────
const FlashcardForm = ({
  chapterId,
  subjectId,
  classId,
  initial,
  onSave,
  onClose,
}: {
  chapterId: string;
  subjectId: string;
  classId: string;
  initial?: IFlashcard | null;
  onSave: () => void;
  onClose: () => void;
}) => {
  const [front, setFront] = useState(initial?.front ?? "");
  const [back, setBack] = useState(initial?.back ?? "");
  const [hint, setHint] = useState(initial?.hint ?? "");
  const [difficulty, setDifficulty] = useState(initial?.difficulty ?? "medium");
  const [order, setOrder] = useState(initial?.order ?? 1);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState("");

  const handleSave = async () => {
    if (!front.trim()) return setError("Front is required");
    if (!back.trim()) return setError("Back is required");
    setIsSaving(true);
    setError("");
    try {
      const payload = { front: front.trim(), back: back.trim(), hint: hint.trim(), difficulty, order };
      if (initial?._id) {
        await api.patch(`/flashcards/${initial._id}`, payload);
      } else {
        await api.post("/flashcards", { ...payload, chapterId, subjectId, classId });
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
      <div className="fixed top-0 right-0 h-full w-full max-w-lg bg-white z-50 shadow-2xl flex flex-col">

        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100 shrink-0">
          <div>
            <h2 className="font-bold text-gray-900 text-lg">{initial ? "Edit Flashcard" : "New Flashcard"}</h2>
            <p className="text-xs text-gray-400 mt-0.5">Supports Markdown and image URLs</p>
          </div>
          <button onClick={onClose} className="w-8 h-8 flex items-center justify-center rounded-xl bg-gray-100 hover:bg-gray-200 text-gray-500 text-lg">×</button>
        </div>

        <div className="flex-1 overflow-y-auto px-6 py-5 space-y-5">

          {/* Difficulty + Order */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-1.5 block">Difficulty</label>
              <select value={difficulty} onChange={(e) => setDifficulty(e.target.value as any)}
                className="w-full px-3 py-2.5 rounded-xl border border-gray-200 focus:border-gray-400 focus:outline-none text-gray-800 text-sm bg-gray-50">
                <option value="easy">Easy</option>
                <option value="medium">Medium</option>
                <option value="hard">Hard</option>
              </select>
            </div>
            <div>
              <label className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-1.5 block">Order</label>
              <input type="number" value={order} min={1}
                onChange={(e) => setOrder(Number(e.target.value))}
                className="w-full px-3 py-2.5 rounded-xl border border-gray-200 focus:border-gray-400 focus:outline-none text-gray-800 text-sm bg-gray-50" />
            </div>
          </div>

          {/* Front */}
          <div>
            <label className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-1.5 block">
              Front — Question / Term <span className="text-red-400">*</span>
            </label>
            <textarea value={front} onChange={(e) => { setFront(e.target.value); setError(""); }}
              placeholder={"e.g. What is photosynthesis?\n\nOr with image:\n![diagram](https://your-image-url.com/photo.png)"}
              rows={4}
              className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-gray-400 focus:outline-none text-gray-800 text-sm bg-gray-50 resize-none font-mono" />
            <p className="text-xs text-gray-400 mt-1">Supports <strong>Markdown</strong> — use <code className="bg-gray-100 px-1 rounded">![alt](url)</code> for images</p>
          </div>

          {/* Back */}
          <div>
            <label className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-1.5 block">
              Back — Answer / Definition <span className="text-red-400">*</span>
            </label>
            <textarea value={back} onChange={(e) => setBack(e.target.value)}
              placeholder={"e.g. Process where plants convert **sunlight** into glucose.\n\n![diagram](https://your-image-url.com/photo.png)"}
              rows={4}
              className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-gray-400 focus:outline-none text-gray-800 text-sm bg-gray-50 resize-none font-mono" />
            <p className="text-xs text-gray-400 mt-1">Supports <strong>Markdown</strong> — bold, lists, tables, images</p>
          </div>

          {/* Hint */}
          <div>
            <label className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-1.5 block">
              Hint <span className="text-gray-300 font-normal normal-case tracking-normal">(optional — shown before flip)</span>
            </label>
            <input type="text" value={hint} onChange={(e) => setHint(e.target.value)}
              placeholder="e.g. Think about chlorophyll…"
              className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-gray-400 focus:outline-none text-gray-800 text-sm bg-gray-50" />
          </div>

          {error && <div className="bg-red-50 border border-red-100 text-red-600 text-sm px-4 py-3 rounded-xl">{error}</div>}
        </div>

        <div className="px-6 py-4 border-t border-gray-100 flex gap-3 shrink-0 bg-gray-50">
          <button onClick={onClose} className="flex-1 py-3 rounded-xl bg-white border border-gray-200 text-gray-600 font-medium text-sm hover:bg-gray-50 transition-colors">Cancel</button>
          <button onClick={handleSave} disabled={isSaving}
            className="flex-1 py-3 rounded-xl bg-gray-900 text-white font-medium text-sm hover:bg-gray-800 transition-colors disabled:opacity-50">
            {isSaving ? "Saving…" : initial ? "Update Card" : "Create Card"}
          </button>
        </div>
      </div>
    </>
  );
};

// ─── Bulk Import Form (slide-over) ─────────────────────────────
const BulkForm = ({
  chapterId,
  subjectId,
  classId,
  onSave,
  onClose,
}: {
  chapterId: string;
  subjectId: string;
  classId: string;
  onSave: () => void;
  onClose: () => void;
}) => {
  const [jsonText, setJsonText] = useState("");
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState("");
  const [preview, setPreview] = useState<any[]>([]);

  const handlePreview = () => {
    setError("");
    try {
      const parsed = JSON.parse(jsonText);
      if (!Array.isArray(parsed)) throw new Error();
      setPreview(parsed);
    } catch {
      setError("Invalid JSON — must be an array");
      setPreview([]);
    }
  };

  const handleSave = async () => {
    setError("");
    let parsed: any[];
    try {
      parsed = JSON.parse(jsonText);
      if (!Array.isArray(parsed)) throw new Error();
    } catch {
      setError("Invalid JSON — must be an array of flashcard objects");
      return;
    }
    if (parsed.some((c) => !c.front || !c.back)) {
      setError("Every card must have front and back fields");
      return;
    }
    setIsSaving(true);
    try {
      await api.post("/flashcards/bulk", { flashcards: parsed, chapterId, subjectId, classId });
      onSave();
    } catch (err: any) {
      setError(err?.response?.data?.message ?? "Failed to import");
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <>
      <div className="fixed inset-0 bg-black/30 backdrop-blur-sm z-40" onClick={onClose} />
      <div className="fixed top-0 right-0 h-full w-full max-w-xl bg-white z-50 shadow-2xl flex flex-col">

        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100 shrink-0">
          <div>
            <h2 className="font-bold text-gray-900 text-lg">🤖 Bulk Import from AI</h2>
            <p className="text-xs text-gray-400 mt-0.5">Paste AI-generated JSON to create all cards at once</p>
          </div>
          <button onClick={onClose} className="w-8 h-8 flex items-center justify-center rounded-xl bg-gray-100 hover:bg-gray-200 text-gray-500 text-lg">×</button>
        </div>

        <div className="flex-1 overflow-y-auto px-6 py-5 space-y-5">

          {/* Format guide */}
          <div className="bg-gray-900 rounded-2xl p-4">
            <p className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">Expected Format</p>
            <pre className="text-xs text-emerald-400 font-mono leading-relaxed overflow-x-auto">{`[
  {
    "front": "What is photosynthesis?",
    "back": "Plants convert **sunlight** into glucose.\\n\\n![diagram](https://url.com/img.png)",
    "hint": "Think about chlorophyll",
    "difficulty": "easy"
  },
  {
    "front": "Define osmosis",
    "back": "Movement of water across a **semi-permeable membrane**",
    "difficulty": "medium"
  }
]`}</pre>
            <p className="text-xs text-gray-500 mt-2">
              <code className="text-pink-400">front</code> and <code className="text-pink-400">back</code> are required · support Markdown + <code className="text-pink-400">![alt](url)</code> for images<br />
              <code className="text-pink-400">hint</code> and <code className="text-pink-400">difficulty</code> are optional (default: medium)
            </p>
          </div>

          {/* JSON input */}
          <div>
            <label className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-1.5 block">Paste JSON here</label>
            <textarea value={jsonText} onChange={(e) => { setJsonText(e.target.value); setError(""); setPreview([]); }}
              placeholder="Paste AI-generated JSON array…"
              rows={10}
              className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-gray-400 focus:outline-none text-gray-800 text-sm bg-gray-50 resize-none font-mono" />
          </div>

          {/* Preview button */}
          {jsonText.trim() && preview.length === 0 && (
            <button onClick={handlePreview}
              className="w-full py-2.5 rounded-xl border border-gray-200 text-gray-600 text-sm font-medium hover:bg-gray-50 transition-colors">
              👁 Preview ({jsonText.trim() ? "parse & check" : "…"})
            </button>
          )}

          {/* Preview list */}
          {preview.length > 0 && (
            <div>
              <p className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">{preview.length} cards ready to import</p>
              <div className="space-y-2 max-h-48 overflow-y-auto">
                {preview.map((card, i) => (
                  <div key={i} className="bg-gray-50 rounded-xl px-4 py-3 border border-gray-100">
                    <p className="text-xs font-semibold text-gray-700 line-clamp-1">Q: {card.front}</p>
                    <p className="text-xs text-gray-400 mt-0.5 line-clamp-1">A: {card.back}</p>
                    {card.difficulty && (
                      <span className={`mt-1 inline-block text-[10px] px-1.5 py-0.5 rounded border font-medium ${DIFFICULTY_STYLE[card.difficulty as keyof typeof DIFFICULTY_STYLE] ?? ""}`}>
                        {card.difficulty}
                      </span>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

          {error && <div className="bg-red-50 border border-red-100 text-red-600 text-sm px-4 py-3 rounded-xl">{error}</div>}
        </div>

        <div className="px-6 py-4 border-t border-gray-100 flex gap-3 shrink-0 bg-gray-50">
          <button onClick={onClose} className="flex-1 py-3 rounded-xl bg-white border border-gray-200 text-gray-600 font-medium text-sm hover:bg-gray-50 transition-colors">Cancel</button>
          <button onClick={handleSave} disabled={isSaving || !jsonText.trim()}
            className="flex-1 py-3 rounded-xl bg-gray-900 text-white font-medium text-sm hover:bg-gray-800 transition-colors disabled:opacity-50">
            {isSaving ? "Importing…" : `Import All Cards`}
          </button>
        </div>
      </div>
    </>
  );
};

// ─── Flashcard Card ────────────────────────────────────────────
const FlashcardCard = ({
  card,
  onEdit,
  onDelete,
  onTogglePublish,
}: {
  card: IFlashcard;
  onEdit: () => void;
  onDelete: () => void;
  onTogglePublish: () => void;
}) => (
  <div className="group bg-white rounded-2xl border border-gray-100 hover:border-gray-200 hover:shadow-sm transition-all duration-200 overflow-hidden">
    <div className="flex items-start gap-4 p-5">
      {/* Order badge */}
      <span className="w-8 h-8 rounded-xl bg-gray-900 text-white text-xs font-bold flex items-center justify-center shrink-0 mt-0.5">
        {card.order}
      </span>

      <div className="flex-1 min-w-0">
        <p className="text-sm font-semibold text-gray-900 line-clamp-1">Q: {card.front.replace(/!\[.*?\]\(.*?\)/g, "[image]")}</p>
        <p className="text-xs text-gray-500 mt-0.5 line-clamp-1">A: {card.back.replace(/!\[.*?\]\(.*?\)/g, "[image]")}</p>
        {card.hint && <p className="text-xs text-amber-500 mt-0.5">💡 {card.hint}</p>}
        <div className="flex items-center gap-2 mt-2">
          <span className={`text-[10px] px-2 py-0.5 rounded-lg border font-medium capitalize ${DIFFICULTY_STYLE[card.difficulty as keyof typeof DIFFICULTY_STYLE]}`}>
            {card.difficulty}
          </span>
          {card.front.includes("![") && <span className="text-[10px] text-gray-400">🖼 has image</span>}
        </div>
      </div>

      <button onClick={onTogglePublish}
        className={`shrink-0 text-xs px-2.5 py-1 rounded-lg border font-medium transition-all ${card.isPublished
            ? "bg-green-50 text-green-700 border-green-200 hover:bg-green-100"
            : "bg-amber-50 text-amber-600 border-amber-200 hover:bg-amber-100"
          }`}>
        {card.isPublished ? "Live" : "Draft"}
      </button>
    </div>

    {/* Hover actions */}
    <div className="flex border-t border-gray-50 bg-gray-50/50 divide-x divide-gray-100 opacity-0 group-hover:opacity-100 transition-opacity">
      <button onClick={onEdit} className="flex-1 py-2 text-xs font-medium text-gray-600 hover:text-gray-900 hover:bg-gray-100 transition-colors">✏️ Edit</button>
      <button onClick={onDelete} className="flex-1 py-2 text-xs font-medium text-red-400 hover:text-red-600 hover:bg-red-50 transition-colors">🗑 Delete</button>
    </div>
  </div>
);

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
  const [singleOpen, setSingleOpen] = useState(false);
  const [bulkOpen, setBulkOpen] = useState(false);
  const [editingCard, setEditingCard] = useState<IFlashcard | null>(null);

  useEffect(() => {
    api.get("/classes").then(({ data }) => {
      setClasses(data.data);
      if (data.data.length > 0) setFilterClassId(data.data[0]._id);
    }).catch(() => { });
  }, []);

  useEffect(() => {
    if (!filterClassId) return;
    api.get(`/subjects?classId=${filterClassId}`).then(({ data }) => {
      setSubjects(data.data);
      setFilterSubjectId(data.data[0]?._id ?? "");
      setFilterChapterId("");
    }).catch(() => { });
  }, [filterClassId]);

  useEffect(() => {
    if (!filterSubjectId) return;
    api.get(`/chapters/admin?subjectId=${filterSubjectId}`).then(({ data }) => {
      setChapters(data.data);
      setFilterChapterId(data.data[0]?._id ?? "");
    }).catch(() => { });
  }, [filterSubjectId]);

  const fetchFlashcards = useCallback(async () => {
    if (!filterChapterId) return;
    setIsLoading(true);
    try {
      const { data } = await api.get(`/flashcards/admin?chapterId=${filterChapterId}`);
      setFlashcards(data.data);
    } catch {
      console.error("Failed to fetch flashcards");
    } finally {
      setIsLoading(false);
    }
  }, [filterChapterId]);

  useEffect(() => { fetchFlashcards(); }, [fetchFlashcards]);

  const handleSaved = () => { setSingleOpen(false); setBulkOpen(false); setEditingCard(null); fetchFlashcards(); };

  const handleTogglePublish = async (card: IFlashcard) => {
    await api.patch(`/flashcards/${card._id}/publish`);
    fetchFlashcards();
  };

  const handleDelete = async (card: IFlashcard) => {
    if (!confirm("Delete this flashcard?")) return;
    await api.delete(`/flashcards/${card._id}`);
    fetchFlashcards();
  };

  const handlePublishAll = async () => {
    const drafts = flashcards.filter((f) => !f.isPublished);
    if (!drafts.length) return;
    if (!confirm(`Publish all ${drafts.length} draft cards?`)) return;
    await Promise.all(drafts.map((f) => api.patch(`/flashcards/${f._id}/publish`)));
    fetchFlashcards();
  };

  const draftCount = flashcards.filter((f) => !f.isPublished).length;
  const isFormOpen = singleOpen || bulkOpen || !!editingCard;

  return (
    <div className="p-6 max-w-5xl mx-auto">

      {/* Header */}
      <div className="flex items-center justify-between mb-5 flex-wrap gap-3">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 tracking-tight">Flashcards</h1>
          <p className="text-gray-400 text-sm mt-0.5">Create cards or bulk import from AI</p>
        </div>
        {filterChapterId && (
          <div className="flex gap-2">
            <button onClick={() => { setEditingCard(null); setSingleOpen(false); setBulkOpen(true); }}
              className="px-4 py-2.5 rounded-xl text-sm font-semibold border border-gray-200 text-gray-700 hover:bg-gray-50 transition-colors">
              🤖 Bulk Import
            </button>
            <button onClick={() => { setEditingCard(null); setBulkOpen(false); setSingleOpen(true); }}
              className="bg-gray-900 text-white px-4 py-2.5 rounded-xl text-sm font-semibold hover:bg-gray-800 transition-colors">
              + Add Card
            </button>
          </div>
        )}
      </div>

      {/* Context filter bar */}
      <div className="bg-white border border-gray-100 rounded-2xl px-5 py-4 mb-5 space-y-3">
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
        {subjects.length > 0 && (
          <div>
            <p className="text-[10px] font-bold text-gray-300 uppercase tracking-widest mb-2">Subject</p>
            <div className="flex gap-1.5 flex-wrap">
              {subjects.map((sub) => (
                <button key={sub._id} onClick={() => setFilterSubjectId(sub._id)}
                  className={`px-3 py-1 rounded-lg text-xs font-semibold border transition-all ${filterSubjectId === sub._id ? "bg-pink-600 text-white border-pink-600" : "bg-white text-gray-500 border-gray-200 hover:border-pink-300"
                    }`}>{sub.icon} {sub.name}</button>
              ))}
            </div>
          </div>
        )}
        {chapters.length > 0 && (
          <div>
            <p className="text-[10px] font-bold text-gray-300 uppercase tracking-widest mb-2">Chapter</p>
            <div className="flex gap-1.5 flex-wrap">
              {chapters.sort((a, b) => a.order - b.order).map((chap) => (
                <button key={chap._id} onClick={() => setFilterChapterId(chap._id)}
                  className={`px-3 py-1 rounded-lg text-xs font-semibold border transition-all ${filterChapterId === chap._id ? "bg-gray-700 text-white border-gray-700" : "bg-white text-gray-500 border-gray-200 hover:border-gray-400"
                    }`}>{chap.order}. {chap.name}</button>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Stats bar + publish all */}
      {flashcards.length > 0 && (
        <div className="flex items-center justify-between mb-4 flex-wrap gap-2">
          <div className="flex gap-4 text-xs text-gray-400">
            <span>{flashcards.length} total</span>
            <span className="text-green-600">{flashcards.length - draftCount} live</span>
            {draftCount > 0 && <span className="text-amber-600">{draftCount} draft</span>}
          </div>
          {draftCount > 0 && (
            <button onClick={handlePublishAll}
              className="text-xs px-3 py-1.5 rounded-lg bg-green-50 text-green-700 border border-green-200 font-medium hover:bg-green-100 transition-colors">
              Publish all drafts ({draftCount})
            </button>
          )}
        </div>
      )}

      {/* Flashcards list */}
      {isLoading ? (
        <div className="space-y-3">
          {[...Array(4)].map((_, i) => <div key={i} className="bg-gray-100 rounded-2xl h-20 animate-pulse" />)}
        </div>
      ) : flashcards.length === 0 ? (
        <div className="text-center py-20 text-gray-300">
          <p className="text-5xl mb-3">🃏</p>
          <p className="text-sm font-medium">No flashcards for this chapter yet</p>
          {filterChapterId && (
            <div className="flex items-center justify-center gap-3 mt-4">
              <button onClick={() => setBulkOpen(true)} className="text-sm text-gray-500 font-semibold underline underline-offset-2">Bulk import →</button>
              <span className="text-gray-200">or</span>
              <button onClick={() => setSingleOpen(true)} className="text-sm text-gray-900 font-semibold underline underline-offset-2">Add one →</button>
            </div>
          )}
        </div>
      ) : (
        <div className="space-y-3">
          {flashcards
            .sort((a, b) => a.order - b.order)
            .map((card) => (
              <FlashcardCard
                key={card._id}
                card={card}
                onEdit={() => { setSingleOpen(false); setBulkOpen(false); setEditingCard(card); }}
                onDelete={() => handleDelete(card)}
                onTogglePublish={() => handleTogglePublish(card)}
              />
            ))}
        </div>
      )}

      {/* Slide-over forms */}
      {(singleOpen || !!editingCard) && (
        <FlashcardForm
          chapterId={filterChapterId}
          subjectId={filterSubjectId}
          classId={filterClassId}
          initial={editingCard}
          onSave={handleSaved}
          onClose={() => { setSingleOpen(false); setEditingCard(null); }}
        />
      )}
      {bulkOpen && (
        <BulkForm
          chapterId={filterChapterId}
          subjectId={filterSubjectId}
          classId={filterClassId}
          onSave={handleSaved}
          onClose={() => setBulkOpen(false)}
        />
      )}
    </div>
  );
};

export default AdminFlashcards;

