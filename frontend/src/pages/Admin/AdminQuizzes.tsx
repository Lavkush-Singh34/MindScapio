
import { useEffect, useState, useCallback } from "react";
import api from "../../services/api";
import type { IClass, ISubject, IChapter, IQuiz, IQuestion } from "../../types";

const DIFFICULTY_STYLE = {
  easy: "bg-green-50 text-green-700 border-green-200",
  medium: "bg-amber-50 text-amber-700 border-amber-200",
  hard: "bg-red-50 text-red-600 border-red-200",
};

// ─── Question Form ─────────────────────────────────────────────
const QuestionForm = ({
  quizId,
  chapterId,
  subjectId,
  classId,
  onSave,
  onClose,
}: {
  quizId: string;
  chapterId: string;
  subjectId: string;
  classId: string;
  onSave: () => void;
  onClose: () => void;
}) => {
  const [questionText, setQuestionText] = useState("");
  const [type, setType] = useState<"mcq" | "subjective" | "true_false">("mcq");
  const [difficulty, setDifficulty] = useState<"easy" | "medium" | "hard">("medium");
  const [marks, setMarks] = useState(1);
  const [options, setOptions] = useState(["", "", "", ""]);
  const [correctOption, setCorrectOption] = useState(0);
  const [answerText, setAnswerText] = useState("");
  const [correctAnswer, setCorrectAnswer] = useState(true);
  const [explanation, setExplanation] = useState("");
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState("");

  const handleSave = async () => {
    if (!questionText.trim()) return setError("Question text is required");
    if (type === "mcq" && options.some((o) => !o.trim())) return setError("All 4 options are required");
    if (type === "subjective" && !answerText.trim()) return setError("Model answer is required");
    setIsSaving(true);
    setError("");
    try {
      await api.post("/questions", {
        questionText: questionText.trim(),
        type, difficulty, marks,
        explanation: explanation.trim(),
        quizId, chapterId, subjectId, classId,
        ...(type === "mcq" && { options, correctOption }),
        ...(type === "subjective" && { answerText: answerText.trim() }),
        ...(type === "true_false" && { correctAnswer }),
      });
      onSave();
    } catch (err: any) {
      setError(err?.response?.data?.message ?? "Failed to save");
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <>
      <div className="fixed inset-0 bg-black/40 backdrop-blur-sm z-[60]" onClick={onClose} />
      <div className="fixed top-0 right-0 h-full w-full max-w-lg bg-white z-[70] shadow-2xl flex flex-col">

        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100 shrink-0">
          <div>
            <h2 className="font-bold text-gray-900 text-lg">Add Question</h2>
            <p className="text-xs text-gray-400 mt-0.5">Question will be added to this quiz</p>
          </div>
          <button onClick={onClose} className="w-8 h-8 flex items-center justify-center rounded-xl bg-gray-100 hover:bg-gray-200 text-gray-500 text-lg">×</button>
        </div>

        <div className="flex-1 overflow-y-auto px-6 py-5 space-y-5">

          {/* Type + Difficulty + Marks */}
          <div className="grid grid-cols-3 gap-3">
            <div>
              <label className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-1.5 block">Type</label>
              <select value={type} onChange={(e) => setType(e.target.value as any)}
                className="w-full px-3 py-2.5 rounded-xl border border-gray-200 focus:border-gray-400 focus:outline-none text-gray-800 text-sm bg-gray-50">
                <option value="mcq">MCQ</option>
                <option value="subjective">Subjective</option>
                <option value="true_false">True / False</option>
              </select>
            </div>
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
              <label className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-1.5 block">Marks</label>
              <input type="number" value={marks} min={1}
                onChange={(e) => setMarks(Number(e.target.value))}
                className="w-full px-3 py-2.5 rounded-xl border border-gray-200 focus:border-gray-400 focus:outline-none text-gray-800 text-sm bg-gray-50" />
            </div>
          </div>

          {/* Question text */}
          <div>
            <label className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-1.5 block">
              Question <span className="text-red-400">*</span>
            </label>
            <textarea value={questionText} onChange={(e) => { setQuestionText(e.target.value); setError(""); }}
              placeholder="Enter question text…" rows={3}
              className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-gray-400 focus:outline-none text-gray-800 text-sm bg-gray-50 resize-none" />
          </div>

          {/* MCQ options */}
          {type === "mcq" && (
            <div className="space-y-2">
              <label className="text-xs font-bold text-gray-400 uppercase tracking-wider block">
                Options <span className="text-red-400">*</span>
                <span className="text-gray-300 font-normal ml-1 normal-case tracking-normal">— click letter to mark correct</span>
              </label>
              {options.map((opt, i) => (
                <div key={i} className="flex items-center gap-2">
                  <button onClick={() => setCorrectOption(i)}
                    className={`w-8 h-8 rounded-lg border text-xs font-bold shrink-0 transition-all ${correctOption === i
                      ? "bg-gray-900 text-white border-gray-900"
                      : "bg-white text-gray-400 border-gray-200 hover:border-gray-400"
                      }`}>
                    {["A", "B", "C", "D"][i]}
                  </button>
                  <input type="text" value={opt}
                    onChange={(e) => { const u = [...options]; u[i] = e.target.value; setOptions(u); }}
                    placeholder={`Option ${["A", "B", "C", "D"][i]}`}
                    className="flex-1 px-3 py-2.5 rounded-xl border border-gray-200 focus:border-gray-400 focus:outline-none text-gray-800 text-sm bg-gray-50" />
                </div>
              ))}
            </div>
          )}

          {/* Subjective answer */}
          {type === "subjective" && (
            <div>
              <label className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-1.5 block">
                Model Answer <span className="text-red-400">*</span>
              </label>
              <textarea value={answerText} onChange={(e) => setAnswerText(e.target.value)}
                placeholder="Enter model answer…" rows={3}
                className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-gray-400 focus:outline-none text-gray-800 text-sm bg-gray-50 resize-none" />
            </div>
          )}

          {/* True/False */}
          {type === "true_false" && (
            <div>
              <label className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-1.5 block">Correct Answer</label>
              <div className="flex gap-3">
                {[true, false].map((val) => (
                  <button key={String(val)} onClick={() => setCorrectAnswer(val)}
                    className={`flex-1 py-3 rounded-xl border font-semibold text-sm transition-all ${correctAnswer === val
                      ? "bg-gray-900 text-white border-gray-900"
                      : "bg-white text-gray-500 border-gray-200 hover:border-gray-400"
                      }`}>
                    {val ? "✅ True" : "❌ False"}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Explanation */}
          <div>
            <label className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-1.5 block">
              Explanation <span className="text-gray-300 font-normal normal-case tracking-normal">(shown after answer)</span>
            </label>
            <textarea value={explanation} onChange={(e) => setExplanation(e.target.value)}
              placeholder="Why is this the correct answer?" rows={2}
              className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-gray-400 focus:outline-none text-gray-800 text-sm bg-gray-50 resize-none" />
          </div>

          {error && <div className="bg-red-50 border border-red-100 text-red-600 text-sm px-4 py-3 rounded-xl">{error}</div>}
        </div>

        <div className="px-6 py-4 border-t border-gray-100 flex gap-3 shrink-0 bg-gray-50">
          <button onClick={onClose} className="flex-1 py-3 rounded-xl bg-white border border-gray-200 text-gray-600 font-medium text-sm hover:bg-gray-50 transition-colors">Cancel</button>
          <button onClick={handleSave} disabled={isSaving}
            className="flex-1 py-3 rounded-xl bg-gray-900 text-white font-medium text-sm hover:bg-gray-800 transition-colors disabled:opacity-50">
            {isSaving ? "Saving…" : "Add Question"}
          </button>
        </div>
      </div>
    </>
  );
};

// ─── Questions Manager Panel ───────────────────────────────────
const QuestionsPanel = ({
  quiz,
  onClose,
}: {
  quiz: IQuiz;
  onClose: () => void;
}) => {
  const [questions, setQuestions] = useState<IQuestion[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [addingQuestion, setAddingQuestion] = useState(false);

  const chapterId = typeof quiz.chapterId === "object" ? quiz.chapterId._id : quiz.chapterId;
  const subjectId = typeof quiz.subjectId === "object" ? quiz.subjectId._id : quiz.subjectId;
  const classId = typeof quiz.classId === "object" ? quiz.classId._id : quiz.classId;

  const fetchQuestions = useCallback(async () => {
    setIsLoading(true);
    try {
      const { data } = await api.get(`/questions?quizId=${quiz._id}`);
      setQuestions(data.data);
    } catch {
      console.error("Failed to fetch questions");
    } finally {
      setIsLoading(false);
    }
  }, [quiz._id]);

  useEffect(() => { fetchQuestions(); }, [fetchQuestions]);

  const handleDelete = async (q: IQuestion) => {
    if (!confirm("Delete this question?")) return;
    await api.delete(`/questions/${q._id}`);
    fetchQuestions();
  };

  return (
    <>
      <div className="fixed inset-0 bg-black/30 backdrop-blur-sm z-40" onClick={onClose} />
      <div className="fixed top-0 right-0 h-full w-full max-w-xl bg-white z-50 shadow-2xl flex flex-col">

        {/* Header */}
        <div className="px-6 py-4 border-b border-gray-100 shrink-0">
          <div className="flex items-start justify-between gap-3">
            <div>
              <h2 className="font-bold text-gray-900 text-lg leading-tight">{quiz.title}</h2>
              <div className="flex items-center gap-2 mt-1">
                <span className={`text-xs px-2 py-0.5 rounded-lg border font-medium ${DIFFICULTY_STYLE[quiz.difficulty as keyof typeof DIFFICULTY_STYLE]}`}>
                  {quiz.difficulty}
                </span>
                <span className="text-xs text-gray-400">{quiz.duration} min · {quiz.totalMarks} marks</span>
                <span className="text-xs text-gray-400">· {questions.length} questions</span>
              </div>
            </div>
            <button onClick={onClose} className="w-8 h-8 shrink-0 flex items-center justify-center rounded-xl bg-gray-100 hover:bg-gray-200 text-gray-500 text-lg">×</button>
          </div>
        </div>

        {/* Questions list */}
        <div className="flex-1 overflow-y-auto px-6 py-5 space-y-3">
          {isLoading ? (
            [...Array(3)].map((_, i) => <div key={i} className="bg-gray-100 rounded-2xl h-16 animate-pulse" />)
          ) : questions.length === 0 ? (
            <div className="text-center py-16 text-gray-300">
              <p className="text-4xl mb-2">❓</p>
              <p className="text-sm font-medium">No questions yet</p>
            </div>
          ) : (
            questions.map((q, idx) => (
              <div key={q._id} className="group bg-gray-50 rounded-2xl border border-gray-100 overflow-hidden">
                <div className="flex items-start gap-3 p-4">
                  <span className="w-6 h-6 rounded-lg bg-gray-200 text-gray-600 text-xs font-bold flex items-center justify-center shrink-0 mt-0.5">
                    {idx + 1}
                  </span>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm text-gray-800 font-medium leading-snug">{q.questionText}</p>
                    <div className="flex items-center gap-2 mt-1.5 flex-wrap">
                      <span className="text-xs bg-white border border-gray-200 text-gray-500 px-2 py-0.5 rounded-lg">{q.type}</span>
                      <span className={`text-xs px-2 py-0.5 rounded-lg border font-medium ${DIFFICULTY_STYLE[q.difficulty as keyof typeof DIFFICULTY_STYLE]}`}>{q.difficulty}</span>
                      <span className="text-xs text-gray-400">{q.marks} mark{q.marks > 1 ? "s" : ""}</span>
                    </div>
                  </div>
                  <button onClick={() => handleDelete(q)}
                    className="text-xs text-red-400 hover:text-red-600 px-2 py-1 rounded-lg hover:bg-red-50 transition-colors opacity-0 group-hover:opacity-100 shrink-0">
                    🗑
                  </button>
                </div>
              </div>
            ))
          )}
        </div>

        {/* Footer */}
        <div className="px-6 py-4 border-t border-gray-100 shrink-0 bg-gray-50">
          <button
            onClick={() => setAddingQuestion(true)}
            className="w-full py-3 rounded-xl bg-gray-900 text-white font-semibold text-sm hover:bg-gray-800 transition-colors">
            + Add Question
          </button>
        </div>
      </div>

      {/* Question form layered on top */}
      {addingQuestion && (
        <QuestionForm
          quizId={quiz._id}
          chapterId={chapterId}
          subjectId={subjectId}
          classId={classId}
          onSave={() => { setAddingQuestion(false); fetchQuestions(); }}
          onClose={() => setAddingQuestion(false)}
        />
      )}
    </>
  );
};

// ─── Quiz Form ─────────────────────────────────────────────────
const QuizForm = ({
  classes,
  initial,
  onSave,
  onClose,
}: {
  classes: IClass[];
  initial?: IQuiz | null;
  onSave: () => void;
  onClose: () => void;
}) => {
  const [classId, setClassId] = useState(typeof initial?.classId === "object" ? initial.classId._id : initial?.classId ?? "");
  const [subjectId, setSubjectId] = useState(typeof initial?.subjectId === "object" ? initial.subjectId._id : initial?.subjectId ?? "");
  const [chapterId, setChapterId] = useState(typeof initial?.chapterId === "object" ? initial.chapterId._id : initial?.chapterId ?? "");
  const [title, setTitle] = useState(initial?.title ?? "");
  const [description, setDescription] = useState(initial?.description ?? "");
  const [type, setType] = useState(initial?.type ?? "mcq");
  const [difficulty, setDifficulty] = useState(initial?.difficulty ?? "medium");
  const [duration, setDuration] = useState(initial?.duration ?? 30);
  const [scheduledAt, setScheduledAt] = useState(initial?.scheduledAt ?? "");

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
    if (!classId) return setError("Select a class");
    if (!subjectId) return setError("Select a subject");
    if (!chapterId) return setError("Select a chapter");
    setIsSaving(true);
    setError("");
    try {
      const payload = {
        title: title.trim(), description: description.trim(),
        type, difficulty, duration, chapterId, subjectId, classId,
        scheduledAt: scheduledAt || undefined,
      };
      if (initial?._id) {
        await api.patch(`/quizzes/${initial._id}`, payload);
      } else {
        await api.post("/quizzes", payload);
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
            <h2 className="font-bold text-gray-900 text-lg">{initial ? "Edit Quiz" : "New Quiz"}</h2>
            <p className="text-xs text-gray-400 mt-0.5">{initial ? "Update quiz details" : "Create a quiz for a chapter"}</p>
          </div>
          <button onClick={onClose} className="w-8 h-8 flex items-center justify-center rounded-xl bg-gray-100 hover:bg-gray-200 text-gray-500 text-lg">×</button>
        </div>

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

          {/* Title */}
          <div>
            <label className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-1.5 block">Title <span className="text-red-400">*</span></label>
            <input type="text" value={title} onChange={(e) => { setTitle(e.target.value); setError(""); }}
              placeholder="e.g. Chapter 1 Quick Test"
              className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-gray-400 focus:outline-none text-gray-800 text-sm bg-gray-50" />
          </div>

          {/* Description */}
          <div>
            <label className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-1.5 block">Description <span className="text-gray-300 font-normal normal-case tracking-normal">(optional)</span></label>
            <textarea value={description} onChange={(e) => setDescription(e.target.value)}
              placeholder="Brief info about this quiz" rows={2}
              className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-gray-400 focus:outline-none text-gray-800 text-sm bg-gray-50 resize-none" />
          </div>

          {/* Type + Difficulty + Duration */}
          <div className="grid grid-cols-3 gap-3">
            <div>
              <label className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-1.5 block">Type</label>
              <select value={type} onChange={(e) => setType(e.target.value)}
                className="w-full px-3 py-2.5 rounded-xl border border-gray-200 focus:border-gray-400 focus:outline-none text-gray-800 text-sm bg-gray-50">
                <option value="mcq">MCQ</option>
                <option value="subjective">Subjective</option>
                <option value="mixed">Mixed</option>
              </select>
            </div>
            <div>
              <label className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-1.5 block">Difficulty</label>
              <select value={difficulty} onChange={(e) => setDifficulty(e.target.value)}
                className="w-full px-3 py-2.5 rounded-xl border border-gray-200 focus:border-gray-400 focus:outline-none text-gray-800 text-sm bg-gray-50">
                <option value="easy">Easy</option>
                <option value="medium">Medium</option>
                <option value="hard">Hard</option>
              </select>
            </div>
            <div>
              <label className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-1.5 block">Duration (min)</label>
              <input type="number" value={duration} min={1} max={180}
                onChange={(e) => setDuration(Number(e.target.value))}
                className="w-full px-3 py-2.5 rounded-xl border border-gray-200 focus:border-gray-400 focus:outline-none text-gray-800 text-sm bg-gray-50" />
            </div>
          </div>

          {/* Schedule */}
          <div>
            <label className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-1.5 block">Schedule <span className="text-gray-300 font-normal normal-case tracking-normal">(optional — for daily quiz)</span></label>
            <input type="datetime-local" value={scheduledAt} onChange={(e) => setScheduledAt(e.target.value)}
              className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-gray-400 focus:outline-none text-gray-800 text-sm bg-gray-50" />
          </div>

          {error && <div className="bg-red-50 border border-red-100 text-red-600 text-sm px-4 py-3 rounded-xl">{error}</div>}
        </div>

        <div className="px-6 py-4 border-t border-gray-100 flex gap-3 shrink-0 bg-gray-50">
          <button onClick={onClose} className="flex-1 py-3 rounded-xl bg-white border border-gray-200 text-gray-600 font-medium text-sm hover:bg-gray-50 transition-colors">Cancel</button>
          <button onClick={handleSave} disabled={isSaving}
            className="flex-1 py-3 rounded-xl bg-gray-900 text-white font-medium text-sm hover:bg-gray-800 transition-colors disabled:opacity-50">
            {isSaving ? "Saving…" : initial ? "Update Quiz" : "Create Quiz"}
          </button>
        </div>
      </div>
    </>
  );
};

// ─── Quiz Card ─────────────────────────────────────────────────
const QuizCard = ({
  quiz,
  onEdit,
  onDelete,
  onTogglePublish,
  onManageQuestions,
}: {
  quiz: IQuiz;
  onEdit: () => void;
  onDelete: () => void;
  onTogglePublish: () => void;
  onManageQuestions: () => void;
}) => {
  const subject = typeof quiz.subjectId === "object" ? quiz.subjectId : null;
  const chapter = typeof quiz.chapterId === "object" ? quiz.chapterId : null;

  return (
    <div className="group bg-white rounded-2xl border border-gray-100 hover:border-gray-200 hover:shadow-sm transition-all duration-200 overflow-hidden">
      <div className="p-5">
        <div className="flex items-start justify-between gap-3">
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 flex-wrap mb-1">
              {subject && (
                <span className="text-xs font-semibold bg-amber-50 text-amber-700 px-2 py-0.5 rounded-lg">
                  {subject.icon} {subject.name}
                </span>
              )}
              {chapter && <span className="text-xs text-gray-400">Ch. {chapter.name}</span>}
            </div>
            <p className="font-semibold text-gray-900">{quiz.title}</p>
            {quiz.description && (
              <p className="text-xs text-gray-400 mt-0.5 line-clamp-1">{quiz.description}</p>
            )}
            <div className="flex items-center gap-2 mt-2 flex-wrap">
              <span className={`text-xs px-2 py-0.5 rounded-lg border font-medium ${DIFFICULTY_STYLE[quiz.difficulty as keyof typeof DIFFICULTY_STYLE]}`}>
                {quiz.difficulty}
              </span>
              <span className="text-xs text-gray-400">⏱ {quiz.duration} min</span>
              <span className="text-xs text-gray-400">· {quiz.totalMarks} marks</span>
              <span className="text-xs text-gray-400">· {quiz.type}</span>
            </div>
          </div>

          <button onClick={onTogglePublish}
            className={`shrink-0 text-xs px-2.5 py-1 rounded-lg border font-medium transition-all ${quiz.isPublished
              ? "bg-green-50 text-green-700 border-green-200 hover:bg-green-100"
              : "bg-amber-50 text-amber-600 border-amber-200 hover:bg-amber-100"
              }`}>
            {quiz.isPublished ? "Live" : "Draft"}
          </button>
        </div>
      </div>

      {/* Hover actions */}
      <div className="flex border-t border-gray-50 bg-gray-50/50 divide-x divide-gray-100 opacity-0 group-hover:opacity-100 transition-opacity">
        <button onClick={onManageQuestions}
          className="flex-1 py-2 text-xs font-semibold text-gray-700 hover:text-gray-900 hover:bg-gray-100 transition-colors">
          ❓ Questions
        </button>
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

// ─── Admin Quizzes Page ────────────────────────────────────────
const AdminQuizzes = () => {
  const [classes, setClasses] = useState<IClass[]>([]);
  const [subjects, setSubjects] = useState<ISubject[]>([]);
  const [chapters, setChapters] = useState<IChapter[]>([]);
  const [quizzes, setQuizzes] = useState<IQuiz[]>([]);

  const [filterClassId, setFilterClassId] = useState("");
  const [filterSubjectId, setFilterSubjectId] = useState("");
  const [filterChapterId, setFilterChapterId] = useState("");

  const [isLoading, setIsLoading] = useState(false);
  const [formOpen, setFormOpen] = useState(false);
  const [editingQuiz, setEditingQuiz] = useState<IQuiz | null>(null);
  const [managingQuiz, setManagingQuiz] = useState<IQuiz | null>(null);

  // Fetch classes once
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

  const fetchQuizzes = useCallback(async () => {
    if (!filterChapterId) return;
    setIsLoading(true);
    try {
      const { data } = await api.get(`/quizzes/admin?chapterId=${filterChapterId}`);
      setQuizzes(data.data);
    } catch {
      console.error("Failed to fetch quizzes");
    } finally {
      setIsLoading(false);
    }
  }, [filterChapterId]);

  useEffect(() => { fetchQuizzes(); }, [fetchQuizzes]);

  const handleSaved = () => { setFormOpen(false); setEditingQuiz(null); fetchQuizzes(); };

  const handleTogglePublish = async (quiz: IQuiz) => {
    await api.patch(`/quizzes/${quiz._id}/publish`);
    fetchQuizzes();
  };

  const handleDelete = async (quiz: IQuiz) => {
    if (!confirm(`Delete "${quiz.title}"? All questions will be removed.`)) return;
    await api.delete(`/quizzes/${quiz._id}`);
    fetchQuizzes();
  };

  const isFormOpen = formOpen || !!editingQuiz;

  return (
    <div className="p-6 max-w-5xl mx-auto">

      {/* Header */}
      <div className="flex items-center justify-between mb-5">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 tracking-tight">Quizzes</h1>
          <p className="text-gray-400 text-sm mt-0.5">Create quizzes and manage questions</p>
        </div>
        <button onClick={() => { setEditingQuiz(null); setFormOpen(true); }}
          className="bg-gray-900 text-white px-5 py-2.5 rounded-xl text-sm font-semibold hover:bg-gray-800 transition-colors">
          + New Quiz
        </button>
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
                  className={`px-3 py-1 rounded-lg text-xs font-semibold border transition-all ${filterSubjectId === sub._id ? "bg-amber-600 text-white border-amber-600" : "bg-white text-gray-500 border-gray-200 hover:border-amber-300"
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

      {/* Quizzes list */}
      {isLoading ? (
        <div className="space-y-3">
          {[...Array(3)].map((_, i) => <div key={i} className="bg-gray-100 rounded-2xl h-28 animate-pulse" />)}
        </div>
      ) : quizzes.length === 0 ? (
        <div className="text-center py-20 text-gray-300">
          <p className="text-5xl mb-3">✅</p>
          <p className="text-sm font-medium">No quizzes for this chapter yet</p>
          <button onClick={() => { setEditingQuiz(null); setFormOpen(true); }}
            className="mt-4 text-sm text-gray-900 font-semibold underline underline-offset-2">
            Create the first one →
          </button>
        </div>
      ) : (
        <div className="space-y-3">
          {quizzes.map((quiz) => (
            <QuizCard
              key={quiz._id}
              quiz={quiz}
              onEdit={() => { setFormOpen(false); setEditingQuiz(quiz); }}
              onDelete={() => handleDelete(quiz)}
              onTogglePublish={() => handleTogglePublish(quiz)}
              onManageQuestions={() => setManagingQuiz(quiz)}
            />
          ))}
        </div>
      )}

      {/* Quiz slide-over form */}
      {isFormOpen && (
        <QuizForm classes={classes} initial={editingQuiz} onSave={handleSaved}
          onClose={() => { setFormOpen(false); setEditingQuiz(null); }} />
      )}

      {/* Questions manager panel */}
      {managingQuiz && (
        <QuestionsPanel quiz={managingQuiz} onClose={() => setManagingQuiz(null)} />
      )}
    </div>
  );
};

export default AdminQuizzes;

