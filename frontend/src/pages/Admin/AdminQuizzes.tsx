import { useEffect, useState } from "react";
import api from "../../services/api";
import type { IClass, ISubject, IChapter, IQuiz, IQuestion } from "../../types";

// ─── Question Form ─────────────────────────────────────────────
const QuestionForm = ({
  quizId,
  chapterId,
  subjectId,
  classId,
  onSave,
  onCancel,
}: {
  quizId: string;
  chapterId: string;
  subjectId: string;
  classId: string;
  onSave: () => void;
  onCancel: () => void;
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

  const handleOptionChange = (index: number, value: string) => {
    const updated = [...options];
    updated[index] = value;
    setOptions(updated);
  };

  const handleSave = async () => {
    if (!questionText.trim()) {
      setError("Question text is required");
      return;
    }
    if (type === "mcq" && options.some((o) => !o.trim())) {
      setError("All 4 options are required for MCQ");
      return;
    }
    if (type === "subjective" && !answerText.trim()) {
      setError("Model answer is required for subjective questions");
      return;
    }
    setIsSaving(true);
    setError("");
    try {
      await api.post("/questions", {
        questionText: questionText.trim(),
        type,
        difficulty,
        marks,
        explanation: explanation.trim(),
        quizId,
        chapterId,
        subjectId,
        classId,
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
    <div className="bg-indigo-50 rounded-2xl p-5 border border-indigo-100 mt-4">
      <h4 className="font-semibold text-gray-800 mb-4">Add Question</h4>

      <div className="space-y-4">

        {/* ── Type + Difficulty + Marks ────────────────────── */}
        <div className="grid grid-cols-3 gap-3">
          <div>
            <label className="text-xs text-gray-600 mb-1 block">Type</label>
            <select
              value={type}
              onChange={(e) => setType(e.target.value as any)}
              className="w-full px-3 py-2 rounded-xl border border-gray-200 focus:border-indigo-400 focus:outline-none text-gray-700 text-sm"
            >
              <option value="mcq">MCQ</option>
              <option value="subjective">Subjective</option>
              <option value="true_false">True/False</option>
            </select>
          </div>
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
            <label className="text-xs text-gray-600 mb-1 block">Marks</label>
            <input
              type="number"
              value={marks}
              min={1}
              onChange={(e) => setMarks(Number(e.target.value))}
              className="w-full px-3 py-2 rounded-xl border border-gray-200 focus:border-indigo-400 focus:outline-none text-gray-700 text-sm"
            />
          </div>
        </div>

        {/* ── Question Text ─────────────────────────────────── */}
        <div>
          <label className="text-xs text-gray-600 mb-1 block">
            Question <span className="text-red-400">*</span>
          </label>
          <textarea
            value={questionText}
            onChange={(e) => {
              setQuestionText(e.target.value);
              setError("");
            }}
            placeholder="Enter question text..."
            rows={3}
            className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-indigo-400 focus:outline-none text-gray-700 text-sm resize-none"
          />
        </div>

        {/* ── MCQ Options ──────────────────────────────────── */}
        {type === "mcq" && (
          <div className="space-y-2">
            <label className="text-xs text-gray-600 block">
              Options <span className="text-red-400">*</span>
            </label>
            {options.map((opt, i) => (
              <div key={i} className="flex items-center gap-2">
                <button
                  onClick={() => setCorrectOption(i)}
                  className={`w-8 h-8 rounded-lg border text-sm font-bold shrink-0 transition-all ${correctOption === i
                      ? "bg-green-500 text-white border-green-500"
                      : "bg-white text-gray-400 border-gray-200 hover:border-green-300"
                    }`}
                >
                  {["A", "B", "C", "D"][i]}
                </button>
                <input
                  type="text"
                  value={opt}
                  onChange={(e) => handleOptionChange(i, e.target.value)}
                  placeholder={`Option ${["A", "B", "C", "D"][i]}`}
                  className="flex-1 px-3 py-2 rounded-xl border border-gray-200 focus:border-indigo-400 focus:outline-none text-gray-700 text-sm"
                />
              </div>
            ))}
            <p className="text-xs text-gray-400">
              Click A/B/C/D to mark correct answer
            </p>
          </div>
        )}

        {/* ── Subjective Answer ─────────────────────────────── */}
        {type === "subjective" && (
          <div>
            <label className="text-xs text-gray-600 mb-1 block">
              Model Answer <span className="text-red-400">*</span>
            </label>
            <textarea
              value={answerText}
              onChange={(e) => setAnswerText(e.target.value)}
              placeholder="Enter model answer..."
              rows={3}
              className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-indigo-400 focus:outline-none text-gray-700 text-sm resize-none"
            />
          </div>
        )}

        {/* ── True/False ────────────────────────────────────── */}
        {type === "true_false" && (
          <div>
            <label className="text-xs text-gray-600 mb-1 block">
              Correct Answer
            </label>
            <div className="flex gap-3">
              {[true, false].map((val) => (
                <button
                  key={String(val)}
                  onClick={() => setCorrectAnswer(val)}
                  className={`flex-1 py-2.5 rounded-xl border font-medium text-sm transition-all ${correctAnswer === val
                      ? "bg-indigo-600 text-white border-indigo-600"
                      : "bg-white text-gray-600 border-gray-200 hover:border-indigo-300"
                    }`}
                >
                  {val ? "✅ True" : "❌ False"}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* ── Explanation ───────────────────────────────────── */}
        <div>
          <label className="text-xs text-gray-600 mb-1 block">
            Explanation (shown after answer)
          </label>
          <textarea
            value={explanation}
            onChange={(e) => setExplanation(e.target.value)}
            placeholder="Why is this the correct answer?"
            rows={2}
            className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-indigo-400 focus:outline-none text-gray-700 text-sm resize-none"
          />
        </div>

        {error && <p className="text-red-500 text-sm">{error}</p>}

        <div className="flex gap-3">
          <button
            onClick={onCancel}
            className="flex-1 py-2.5 rounded-xl bg-white text-gray-600 border border-gray-200 font-medium hover:bg-gray-50 text-sm transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={handleSave}
            disabled={isSaving}
            className="flex-1 py-2.5 rounded-xl bg-indigo-600 text-white font-medium hover:bg-indigo-700 text-sm transition-colors disabled:opacity-50"
          >
            {isSaving ? "Saving..." : "Add Question"}
          </button>
        </div>
      </div>
    </div>
  );
};

// ─── Quiz Form ─────────────────────────────────────────────────
const QuizForm = ({
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
  initial?: Partial<IQuiz>;
  onSave: (data: {
    title: string;
    description: string;
    type: string;
    difficulty: string;
    duration: number;
    totalMarks: number;
    chapterId: string;
    subjectId: string;
    classId: string;
    scheduledAt?: string;
  }) => Promise<void>;
  onCancel: () => void;
}) => {
  const [title, setTitle] = useState(initial?.title ?? "");
  const [description, setDescription] = useState(initial?.description ?? "");
  const [type, setType] = useState(initial?.type ?? "mcq");
  const [difficulty, setDifficulty] = useState(initial?.difficulty ?? "medium");
  const [duration, setDuration] = useState(initial?.duration ?? 30);
  const [totalMarks, setTotalMarks] = useState(initial?.totalMarks ?? 0);
  const [scheduledAt, setScheduledAt] = useState(initial?.scheduledAt ?? "");
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
    if (!classId) { setError("Please select a class"); return; }
    if (!subjectId) { setError("Please select a subject"); return; }
    if (!chapterId) { setError("Please select a chapter"); return; }
    setIsSaving(true);
    setError("");
    try {
      await onSave({
        title: title.trim(),
        description: description.trim(),
        type,
        difficulty,
        duration,
        totalMarks,
        chapterId,
        subjectId,
        classId,
        scheduledAt: scheduledAt || undefined,
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
        {initial?._id ? "Edit Quiz" : "Create New Quiz"}
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
                <option key={cls._id} value={cls._id}>{cls.name}</option>
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
            placeholder="e.g. Chapter 1 Quick Test"
            className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-indigo-400 focus:outline-none text-gray-700"
          />
        </div>

        {/* ── Description ────────────────────────────────────── */}
        <div>
          <label className="text-sm text-gray-600 mb-1 block">
            Description (optional)
          </label>
          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Brief info about this quiz"
            rows={2}
            className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-indigo-400 focus:outline-none text-gray-700 resize-none"
          />
        </div>

        {/* ── Type + Difficulty + Duration ─────────────────── */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div>
            <label className="text-sm text-gray-600 mb-1 block">Type</label>
            <select
              value={type}
              onChange={(e) => setType(e.target.value)}
              className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-indigo-400 focus:outline-none text-gray-700"
            >
              <option value="mcq">MCQ</option>
              <option value="subjective">Subjective</option>
              <option value="mixed">Mixed</option>
            </select>
          </div>
          <div>
            <label className="text-sm text-gray-600 mb-1 block">
              Difficulty
            </label>
            <select
              value={difficulty}
              onChange={(e) => setDifficulty(e.target.value)}
              className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-indigo-400 focus:outline-none text-gray-700"
            >
              <option value="easy">Easy</option>
              <option value="medium">Medium</option>
              <option value="hard">Hard</option>
            </select>
          </div>
          <div>
            <label className="text-sm text-gray-600 mb-1 block">
              Duration (minutes)
            </label>
            <input
              type="number"
              value={duration}
              min={1}
              max={180}
              onChange={(e) => setDuration(Number(e.target.value))}
              className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-indigo-400 focus:outline-none text-gray-700"
            />
          </div>
        </div>

        {/* ── Scheduled At ──────────────────────────────────── */}
        <div>
          <label className="text-sm text-gray-600 mb-1 block">
            Schedule Date (optional)
          </label>
          <input
            type="datetime-local"
            value={scheduledAt}
            onChange={(e) => setScheduledAt(e.target.value)}
            className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-indigo-400 focus:outline-none text-gray-700"
          />
          <p className="text-xs text-gray-400 mt-1">
            Quiz goes live on this date for daily quiz feature
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
  const chapter =
    typeof quiz.chapterId === "object" ? quiz.chapterId : null;
  const subject =
    typeof quiz.subjectId === "object" ? quiz.subjectId : null;

  const difficultyColor = {
    easy: "text-green-600 bg-green-50",
    medium: "text-yellow-600 bg-yellow-50",
    hard: "text-red-600 bg-red-50",
  }[quiz.difficulty];

  return (
    <div className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100">
      <div className="flex items-start justify-between gap-4 flex-wrap mb-3">
        <div className="flex-1 min-w-0">
          <p className="font-semibold text-gray-800 truncate">{quiz.title}</p>
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
            <span className={`text-xs px-2 py-0.5 rounded-lg ${difficultyColor}`}>
              {quiz.difficulty}
            </span>
            <span className="text-xs text-gray-400">
              ⏱ {quiz.duration}min
            </span>
            <span className="text-xs text-gray-400">
              🏅 {quiz.totalMarks} marks
            </span>
          </div>
        </div>

        <div className="flex items-center gap-2 flex-wrap">
          <button
            onClick={onTogglePublish}
            className={`text-xs px-3 py-1.5 rounded-lg border font-medium transition-all ${quiz.isPublished
                ? "bg-green-50 text-green-600 border-green-200"
                : "bg-yellow-50 text-yellow-600 border-yellow-200"
              }`}
          >
            {quiz.isPublished ? "✅ Published" : "📝 Draft"}
          </button>
          <button
            onClick={onManageQuestions}
            className="text-xs px-3 py-1.5 rounded-lg border border-indigo-200 text-indigo-600 hover:bg-indigo-50 transition-all"
          >
            ❓ Questions
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
            🗑️
          </button>
        </div>
      </div>
    </div>
  );
};

// ─── Questions Manager ─────────────────────────────────────────
const QuestionsManager = ({
  quiz,
  onClose,
}: {
  quiz: IQuiz;
  onClose: () => void;
}) => {
  const [questions, setQuestions] = useState<IQuestion[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  const chapterId =
    typeof quiz.chapterId === "object" ? quiz.chapterId._id : quiz.chapterId;
  const subjectId =
    typeof quiz.subjectId === "object" ? quiz.subjectId._id : quiz.subjectId;
  const classId =
    typeof quiz.classId === "object" ? quiz.classId._id : quiz.classId;

  const fetchQuestions = async () => {
    try {
      const { data } = await api.get(
        `/questions/admin?quizId=${quiz._id}`
      );
      setQuestions(data.data);
    } catch {
      console.error("Failed to fetch questions");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchQuestions();
  }, []);

  const handleDelete = async (questionId: string) => {
    if (!confirm("Delete this question?")) return;
    await api.delete(`/questions/${questionId}`);
    fetchQuestions();
  };

  return (
    <div className="bg-gray-50 rounded-2xl border border-gray-200 p-5 mb-6">

      {/* ── Header ────────────────────────────────────────── */}
      <div className="flex items-center justify-between mb-4">
        <div>
          <h3 className="font-bold text-gray-800">{quiz.title}</h3>
          <p className="text-xs text-gray-500 mt-0.5">
            {questions.length} questions · {quiz.totalMarks} total marks
          </p>
        </div>
        <div className="flex gap-2">
          <button
            onClick={() => setShowForm(!showForm)}
            className="text-sm bg-indigo-600 text-white px-4 py-2 rounded-xl hover:bg-indigo-700 transition-colors"
          >
            + Add Question
          </button>
          <button
            onClick={onClose}
            className="text-sm bg-gray-200 text-gray-600 px-4 py-2 rounded-xl hover:bg-gray-300 transition-colors"
          >
            Close
          </button>
        </div>
      </div>

      {/* ── Question Form ──────────────────────────────────── */}
      {showForm && (
        <QuestionForm
          quizId={quiz._id}
          chapterId={chapterId}
          subjectId={subjectId}
          classId={classId}
          onSave={() => {
            setShowForm(false);
            fetchQuestions();
          }}
          onCancel={() => setShowForm(false)}
        />
      )}

      {/* ── Questions List ─────────────────────────────────── */}
      {isLoading ? (
        <div className="space-y-2 mt-4">
          {Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className="h-12 bg-gray-200 rounded-xl animate-pulse" />
          ))}
        </div>
      ) : questions.length === 0 ? (
        <div className="text-center py-8 text-gray-400">
          <p className="text-3xl mb-2">❓</p>
          <p className="text-sm">No questions yet. Add your first question!</p>
        </div>
      ) : (
        <div className="space-y-2 mt-4">
          {questions.map((q, index) => (
            <div
              key={q._id}
              className="bg-white rounded-xl p-4 flex items-start justify-between gap-3"
            >
              <div className="flex items-start gap-3 flex-1 min-w-0">
                <span className="w-7 h-7 bg-indigo-50 text-indigo-600 rounded-lg flex items-center justify-center text-xs font-bold shrink-0">
                  {index + 1}
                </span>
                <div className="min-w-0">
                  <p className="text-sm text-gray-800 line-clamp-2">
                    {q.questionText}
                  </p>
                  <div className="flex gap-2 mt-1">
                    <span className="text-xs text-gray-400 capitalize">
                      {q.type.replace("_", "/")}
                    </span>
                    <span className="text-xs text-gray-400">
                      {q.marks} mark{q.marks > 1 ? "s" : ""}
                    </span>
                    <span
                      className={`text-xs capitalize ${q.difficulty === "easy"
                          ? "text-green-500"
                          : q.difficulty === "medium"
                            ? "text-yellow-500"
                            : "text-red-500"
                        }`}
                    >
                      {q.difficulty}
                    </span>
                  </div>
                </div>
              </div>
              <button
                onClick={() => handleDelete(q._id)}
                className="text-xs text-red-400 hover:text-red-600 shrink-0"
              >
                🗑️
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

// ─── Admin Quizzes Page ────────────────────────────────────────
const AdminQuizzes = () => {
  const [classes, setClasses] = useState<IClass[]>([]);
  const [subjects, setSubjects] = useState<ISubject[]>([]);
  const [chapters, setChapters] = useState<IChapter[]>([]);
  const [quizzes, setQuizzes] = useState<IQuiz[]>([]);

  const [formSubjects, setFormSubjects] = useState<ISubject[]>([]);
  const [formChapters, setFormChapters] = useState<IChapter[]>([]);

  const [filterClassId, setFilterClassId] = useState("");
  const [filterSubjectId, setFilterSubjectId] = useState("");
  const [filterChapterId, setFilterChapterId] = useState("");

  const [isLoading, setIsLoading] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const [editingQuiz, setEditingQuiz] = useState<IQuiz | null>(null);
  const [managingQuiz, setManagingQuiz] = useState<IQuiz | null>(null);

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

  // ── Fetch subjects on class filter change ──────────────────
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

  // ── Fetch chapters on subject filter change ────────────────
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

  // ── Fetch quizzes ──────────────────────────────────────────
  const fetchQuizzes = async () => {
    if (!filterChapterId) return;
    setIsLoading(true);
    try {
      const { data } = await api.get(
        `/quizzes/admin?chapterId=${filterChapterId}`
      );
      setQuizzes(data.data);
    } catch {
      console.error("Failed to fetch quizzes");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchQuizzes();
  }, [filterChapterId]);

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

  // ── CRUD ───────────────────────────────────────────────────
  const handleCreate = async (formData: any) => {
    await api.post("/quizzes", formData);
    setShowForm(false);
    fetchQuizzes();
  };

  const handleUpdate = async (formData: any) => {
    await api.patch(`/quizzes/${editingQuiz?._id}`, formData);
    setEditingQuiz(null);
    fetchQuizzes();
  };

  const handleTogglePublish = async (quiz: IQuiz) => {
    await api.patch(`/quizzes/${quiz._id}/publish`);
    fetchQuizzes();
  };

  const handleDelete = async (quiz: IQuiz) => {
    if (!confirm(`Delete "${quiz.title}"?`)) return;
    await api.delete(`/quizzes/${quiz._id}`);
    fetchQuizzes();
  };

  return (
    <div className="p-6 max-w-5xl mx-auto">

      {/* ── Header ────────────────────────────────────────────── */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">Quizzes</h1>
          <p className="text-gray-500 text-sm mt-1">
            Create quizzes and manage questions
          </p>
        </div>
        {!showForm && !editingQuiz && (
          <button
            onClick={() => setShowForm(true)}
            className="bg-indigo-600 text-white px-5 py-2.5 rounded-xl text-sm font-medium hover:bg-indigo-700 transition-colors"
          >
            + New Quiz
          </button>
        )}
      </div>

      {/* ── Forms ─────────────────────────────────────────────── */}
      {showForm && (
        <QuizForm
          classes={classes}
          subjects={formSubjects}
          chapters={formChapters}
          onClassChange={handleFormClassChange}
          onSubjectChange={handleFormSubjectChange}
          onSave={handleCreate}
          onCancel={() => setShowForm(false)}
        />
      )}

      {editingQuiz && (
        <QuizForm
          classes={classes}
          subjects={formSubjects.length > 0 ? formSubjects : subjects}
          chapters={formChapters.length > 0 ? formChapters : chapters}
          onClassChange={handleFormClassChange}
          onSubjectChange={handleFormSubjectChange}
          initial={editingQuiz}
          onSave={handleUpdate}
          onCancel={() => setEditingQuiz(null)}
        />
      )}

      {/* ── Questions Manager ─────────────────────────────────── */}
      {managingQuiz && (
        <QuestionsManager
          quiz={managingQuiz}
          onClose={() => setManagingQuiz(null)}
        />
      )}

      {/* ── Filters ───────────────────────────────────────────── */}
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

      {/* ── Quizzes List ──────────────────────────────────────── */}
      {isLoading ? (
        <div className="space-y-3">
          {Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className="bg-gray-100 rounded-2xl h-20 animate-pulse" />
          ))}
        </div>
      ) : quizzes.length === 0 ? (
        <div className="text-center py-16 text-gray-400">
          <p className="text-4xl mb-3">✅</p>
          <p>No quizzes yet for this chapter.</p>
        </div>
      ) : (
        <div className="space-y-3">
          {quizzes.map((quiz) => (
            <QuizCard
              key={quiz._id}
              quiz={quiz}
              onEdit={() => {
                setShowForm(false);
                setManagingQuiz(null);
                setEditingQuiz(quiz);
              }}
              onDelete={() => handleDelete(quiz)}
              onTogglePublish={() => handleTogglePublish(quiz)}
              onManageQuestions={() => {
                setShowForm(false);
                setEditingQuiz(null);
                setManagingQuiz(
                  managingQuiz?._id === quiz._id ? null : quiz
                );
              }}
            />
          ))}
        </div>
      )}
    </div>
  );
};

export default AdminQuizzes;
