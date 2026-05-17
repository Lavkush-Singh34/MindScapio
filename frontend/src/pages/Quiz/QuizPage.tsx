import { useEffect, useState, useCallback } from "react";
import { useParams, useNavigate } from "react-router-dom";
import api from "../../services/api";
import { useAuth } from "../../context/AuthContext";
import type { IQuiz, IQuestion } from "../../types";

// ─── Timer Component ───────────────────────────────────────────
const Timer = ({
  duration,
  onExpire,
}: {
  duration: number;
  onExpire: () => void;
}) => {
  const [seconds, setSeconds] = useState(duration * 60);

  useEffect(() => {
    const interval = setInterval(() => {
      setSeconds((prev) => {
        if (prev <= 1) {
          clearInterval(interval);
          onExpire();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(interval);
  }, [onExpire]);

  const minutes = Math.floor(seconds / 60);
  const secs = seconds % 60;
  const isWarning = seconds <= 60; // Red when 1 minute left

  return (
    <div
      className={`flex items-center gap-2 font-mono font-bold text-lg px-4 py-2 rounded-xl ${isWarning
          ? "bg-red-50 text-red-600 border border-red-200"
          : "bg-indigo-50 text-indigo-600 border border-indigo-100"
        }`}
    >
      ⏱ {String(minutes).padStart(2, "0")}:{String(secs).padStart(2, "0")}
    </div>
  );
};

// ─── Question Card ─────────────────────────────────────────────
const QuestionCard = ({
  question,
  index,
  answer,
  onAnswer,
}: {
  question: IQuestion;
  index: number;
  answer: {
    selectedOption?: number;
    writtenAnswer?: string;
    booleanAnswer?: boolean;
  };
  onAnswer: (
    questionId: string,
    value: {
      selectedOption?: number;
      writtenAnswer?: string;
      booleanAnswer?: boolean;
    }
  ) => void;
}) => (
  <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
    {/* ── Question Header ─────────────────────────────────── */}
    <div className="flex items-start justify-between gap-4 mb-4">
      <div className="flex items-start gap-3">
        <span className="w-8 h-8 bg-indigo-50 text-indigo-600 rounded-lg flex items-center justify-center font-bold text-sm shrink-0">
          {index + 1}
        </span>
        <p className="text-gray-800 font-medium leading-relaxed">
          {question.questionText}
        </p>
      </div>
      <span className="text-xs text-gray-400 shrink-0">
        {question.marks} mark{question.marks > 1 ? "s" : ""}
      </span>
    </div>

    {/* ── MCQ Options ─────────────────────────────────────── */}
    {question.type === "mcq" && question.options && (
      <div className="space-y-2 mt-4">
        {question.options.map((option, optIndex) => (
          <button
            key={optIndex}
            onClick={() =>
              onAnswer(question._id, { selectedOption: optIndex })
            }
            className={`w-full text-left px-4 py-3 rounded-xl border transition-all text-sm ${answer.selectedOption === optIndex
                ? "bg-indigo-50 border-indigo-400 text-indigo-700 font-medium"
                : "bg-gray-50 border-gray-100 text-gray-700 hover:border-indigo-200 hover:bg-indigo-50"
              }`}
          >
            <span className="font-semibold mr-2">
              {["A", "B", "C", "D"][optIndex]}.
            </span>
            {option}
          </button>
        ))}
      </div>
    )}

    {/* ── True/False Options ──────────────────────────────── */}
    {question.type === "true_false" && (
      <div className="flex gap-3 mt-4">
        {[true, false].map((val) => (
          <button
            key={String(val)}
            onClick={() => onAnswer(question._id, { booleanAnswer: val })}
            className={`flex-1 py-3 rounded-xl border font-medium text-sm transition-all ${answer.booleanAnswer === val
                ? "bg-indigo-50 border-indigo-400 text-indigo-700"
                : "bg-gray-50 border-gray-100 text-gray-700 hover:border-indigo-200"
              }`}
          >
            {val ? "✅ True" : "❌ False"}
          </button>
        ))}
      </div>
    )}

    {/* ── Subjective Answer ───────────────────────────────── */}
    {question.type === "subjective" && (
      <textarea
        value={answer.writtenAnswer ?? ""}
        onChange={(e) =>
          onAnswer(question._id, { writtenAnswer: e.target.value })
        }
        placeholder="Write your answer here..."
        rows={4}
        className="w-full mt-4 px-4 py-3 rounded-xl border border-gray-200 focus:border-indigo-400 focus:outline-none text-sm text-gray-700 resize-none"
      />
    )}
  </div>
);

// ─── Result Screen ─────────────────────────────────────────────
const ResultScreen = ({
  percentage,
  marksObtained,
  totalMarks,
  isPassed,
  timeTaken,
  onRetake,
}: {
  percentage: number;
  marksObtained: number;
  totalMarks: number;
  isPassed: boolean;
  timeTaken: number;
  onRetake: () => void;
}) => {
  const navigate = useNavigate();

  const minutes = Math.floor(timeTaken / 60);
  const seconds = timeTaken % 60;

  return (
    <div className="max-w-lg mx-auto px-4 py-16 text-center">
      <div className="bg-white rounded-3xl shadow-lg border border-gray-100 p-8">
        {/* ── Result Emoji ──────────────────────────────────── */}
        <div className="text-6xl mb-4">
          {isPassed ? "🎉" : "😔"}
        </div>

        <h2 className="text-2xl font-bold text-gray-800 mb-1">
          {isPassed ? "Congratulations!" : "Better luck next time!"}
        </h2>
        <p className="text-gray-500 text-sm mb-6">
          {isPassed
            ? "You passed the quiz!"
            : "You did not reach the passing score."}
        </p>

        {/* ── Score Circle ──────────────────────────────────── */}
        <div
          className={`w-32 h-32 rounded-full flex flex-col items-center justify-center mx-auto mb-6 border-8 ${isPassed
              ? "border-green-400 bg-green-50"
              : "border-red-300 bg-red-50"
            }`}
        >
          <p
            className={`text-3xl font-bold ${isPassed ? "text-green-600" : "text-red-500"
              }`}
          >
            {percentage}%
          </p>
          <p className="text-xs text-gray-500">Score</p>
        </div>

        {/* ── Stats ─────────────────────────────────────────── */}
        <div className="grid grid-cols-3 gap-4 mb-8">
          <div className="bg-gray-50 rounded-xl p-3">
            <p className="text-lg font-bold text-gray-800">
              {marksObtained}/{totalMarks}
            </p>
            <p className="text-xs text-gray-500">Marks</p>
          </div>
          <div className="bg-gray-50 rounded-xl p-3">
            <p className="text-lg font-bold text-gray-800">40%</p>
            <p className="text-xs text-gray-500">Passing</p>
          </div>
          <div className="bg-gray-50 rounded-xl p-3">
            <p className="text-lg font-bold text-gray-800">
              {minutes}m {seconds}s
            </p>
            <p className="text-xs text-gray-500">Time</p>
          </div>
        </div>

        {/* ── Action Buttons ────────────────────────────────── */}
        <div className="flex flex-col gap-3">
          <button
            onClick={onRetake}
            className="w-full bg-indigo-600 text-white font-semibold py-3 rounded-xl hover:bg-indigo-700 transition-colors"
          >
            Retake Quiz
          </button>
          <button
            onClick={() => navigate("/notes")}
            className="w-full bg-gray-100 text-gray-700 font-semibold py-3 rounded-xl hover:bg-gray-200 transition-colors"
          >
            Back to Notes
          </button>
        </div>
      </div>
    </div>
  );
};

// ─── Quiz Page ─────────────────────────────────────────────────
const QuizPage = () => {
  const { quizId } = useParams<{ quizId: string }>();
  const { user } = useAuth();
  const navigate = useNavigate();

  const [quiz, setQuiz] = useState<IQuiz | null>(null);
  const [questions, setQuestions] = useState<IQuestion[]>([]);
  const [testResultId, setTestResultId] = useState<string | null>(null);
  const [answers, setAnswers] = useState<
    Record<
      string,
      {
        questionId: string;
        selectedOption?: number;
        writtenAnswer?: string;
        booleanAnswer?: boolean;
      }
    >
  >({});
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [result, setResult] = useState<{
    percentage: number;
    marksObtained: number;
    totalMarks: number;
    isPassed: boolean;
    timeTaken: number;
  } | null>(null);

  // ── Fetch quiz and start attempt ──────────────────────────
  useEffect(() => {
    const initQuiz = async () => {
      try {
        // Fetch quiz details
        const { data: quizData } = await api.get(`/quizzes/${quizId}`);
        setQuiz(quizData.data);

        // Fetch questions — no answers included
        const { data: questionsData } = await api.get(
          `/questions?quizId=${quizId}`
        );
        setQuestions(questionsData.data);

        // Start quiz attempt on backend
        const { data: resultData } = await api.post("/test-results/start", {
          quizId,
          chapterId:
            typeof quizData.data.chapterId === "string"
              ? quizData.data.chapterId
              : quizData.data.chapterId._id,
          subjectId:
            typeof quizData.data.subjectId === "string"
              ? quizData.data.subjectId
              : quizData.data.subjectId._id,
          classId:
            typeof quizData.data.classId === "string"
              ? quizData.data.classId
              : quizData.data.classId._id,
        });
        setTestResultId(resultData.data._id);
      } catch {
        console.error("Failed to initialize quiz");
        navigate("/notes");
      } finally {
        setIsLoading(false);
      }
    };
    initQuiz();
  }, [quizId, navigate]);

  // ── Handle answer selection ────────────────────────────────
  const handleAnswer = (
    questionId: string,
    value: {
      selectedOption?: number;
      writtenAnswer?: string;
      booleanAnswer?: boolean;
    }
  ) => {
    setAnswers((prev) => ({
      ...prev,
      [questionId]: { questionId, ...value },
    }));
  };

  // ── Submit quiz ────────────────────────────────────────────
  const handleSubmit = useCallback(async () => {
    if (!testResultId || isSubmitting) return;
    setIsSubmitting(true);

    try {
      const answersArray = questions.map((q) => ({
        questionId: q._id,
        ...(answers[q._id] ?? {}),
      }));

      const { data } = await api.post("/test-results/submit", {
        testResultId,
        answers: answersArray,
      });

      setResult({
        percentage: data.data.percentage,
        marksObtained: data.data.marksObtained,
        totalMarks: data.data.totalMarks,
        isPassed: data.data.isPassed,
        timeTaken: data.data.timeTaken,
      });
    } catch {
      console.error("Failed to submit quiz");
    } finally {
      setIsSubmitting(false);
    }
  }, [testResultId, isSubmitting, questions, answers]);

  // ── Retake quiz ────────────────────────────────────────────
  const handleRetake = () => {
    setResult(null);
    setAnswers({});
    setTestResultId(null);
    setIsLoading(true);
    window.location.reload();
  };

  // ── Loading state ──────────────────────────────────────────
  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-indigo-200 border-t-indigo-600 rounded-full animate-spin mx-auto mb-4" />
          <p className="text-gray-500">Loading quiz...</p>
        </div>
      </div>
    );
  }

  // ── Result screen ──────────────────────────────────────────
  if (result) {
    return (
      <ResultScreen
        {...result}
        onRetake={handleRetake}
      />
    );
  }

  const answeredCount = Object.keys(answers).length;
  const totalCount = questions.length;

  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-8">

      {/* ── Quiz Header ───────────────────────────────────────── */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-5 mb-6 flex items-center justify-between flex-wrap gap-4">
        <div>
          <h1 className="text-lg font-bold text-gray-800">{quiz?.title}</h1>
          <p className="text-sm text-gray-500 mt-0.5">
            {totalCount} questions · {quiz?.totalMarks} marks ·{" "}
            <span
              className={`font-medium ${quiz?.difficulty === "easy"
                  ? "text-green-500"
                  : quiz?.difficulty === "medium"
                    ? "text-yellow-500"
                    : "text-red-500"
                }`}
            >
              {quiz?.difficulty}
            </span>
          </p>
        </div>
        {quiz?.duration && (
          <Timer duration={quiz.duration} onExpire={handleSubmit} />
        )}
      </div>

      {/* ── Progress Bar ──────────────────────────────────────── */}
      <div className="mb-6">
        <div className="flex justify-between text-xs text-gray-500 mb-1">
          <span>{answeredCount} answered</span>
          <span>{totalCount - answeredCount} remaining</span>
        </div>
        <div className="w-full bg-gray-100 rounded-full h-2">
          <div
            className="bg-indigo-500 h-2 rounded-full transition-all duration-300"
            style={{
              width: `${totalCount > 0 ? (answeredCount / totalCount) * 100 : 0}%`,
            }}
          />
        </div>
      </div>

      {/* ── Questions ─────────────────────────────────────────── */}
      <div className="space-y-4 mb-8">
        {questions.map((question, index) => (
          <QuestionCard
            key={question._id}
            question={question}
            index={index}
            answer={answers[question._id] ?? {}}
            onAnswer={handleAnswer}
          />
        ))}
      </div>

      {/* ── Submit Button ─────────────────────────────────────── */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-5 flex items-center justify-between">
        <p className="text-sm text-gray-500">
          {answeredCount}/{totalCount} questions answered
        </p>
        <button
          onClick={handleSubmit}
          disabled={isSubmitting}
          className="bg-indigo-600 text-white font-semibold px-8 py-3 rounded-xl hover:bg-indigo-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isSubmitting ? "Submitting..." : "Submit Quiz"}
        </button>
      </div>
    </div>
  );
};

export default QuizPage;
