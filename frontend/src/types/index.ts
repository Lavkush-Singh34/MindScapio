// ─── User ──────────────────────────────────────────────────────
export type UserRole = "admin" | "teacher" | "parent" | "student";

export interface IUser {
  _id: string;
  googleId: string;
  email: string;
  displayName: string;
  avatar: string;
  role: UserRole;
  isActive: boolean;
  children: IUser[];
  class?: number;
  parentId?: string;
  createdAt: string;
  updatedAt: string;
}

// ─── Class ─────────────────────────────────────────────────────
export interface IClass {
  _id: string;
  name: string;
  grade: number;
  description?: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

// ─── Subject ───────────────────────────────────────────────────
export interface ISubject {
  _id: string;
  name: string;
  slug: string;
  icon: string;
  classId: string | IClass;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

// ─── Chapter ───────────────────────────────────────────────────
export interface IChapter {
  _id: string;
  name: string;
  slug: string;
  order: number;
  description?: string;
  subjectId: string | ISubject;
  classId: string | IClass;
  isPublished: boolean;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

// ─── Note ──────────────────────────────────────────────────────
export interface INote {
  _id: string;
  title: string;
  content: string;
  chapterId: string | IChapter;
  subjectId: string | ISubject;
  classId: string | IClass;
  isPublished: boolean;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

// ─── Quiz ──────────────────────────────────────────────────────
export type QuizType = "mcq" | "subjective" | "mixed";
export type DifficultyLevel = "easy" | "medium" | "hard";

export interface IQuiz {
  _id: string;
  title: string;
  description?: string;
  type: QuizType;
  difficulty: DifficultyLevel;
  duration: number;
  totalMarks: number;
  chapterId: string | IChapter;
  subjectId: string | ISubject;
  classId: string | IClass;
  isPublished: boolean;
  isActive: boolean;
  scheduledAt?: string;
  createdAt: string;
  updatedAt: string;
}

// ─── Question ──────────────────────────────────────────────────
export type QuestionType = "mcq" | "subjective" | "true_false";

export interface IQuestion {
  _id: string;
  questionText: string;
  type: QuestionType;
  difficulty: DifficultyLevel;
  marks: number;
  options?: string[];
  correctOption?: number;
  answerText?: string;
  correctAnswer?: boolean;
  explanation?: string;
  quizId: string | IQuiz;
  chapterId: string | IChapter;
  subjectId: string | ISubject;
  classId: string | IClass;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

// ─── Flashcard ─────────────────────────────────────────────────
export interface IFlashcard {
  _id: string;
  front: string;
  back: string;
  hint?: string;
  difficulty: DifficultyLevel;
  order: number;
  chapterId: string | IChapter;
  subjectId: string | ISubject;
  classId: string | IClass;
  isPublished: boolean;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

// ─── Assignment ────────────────────────────────────────────────
export type AssignmentStatus = "draft" | "published" | "closed";

export interface IAssignment {
  _id: string;
  title: string;
  description: string;
  instructions?: string;
  totalMarks: number;
  dueDate: string;
  status: AssignmentStatus;
  chapterId: string | IChapter;
  subjectId: string | ISubject;
  classId: string | IClass;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

// ─── Test Result ───────────────────────────────────────────────
export type AttemptStatus = "in_progress" | "completed" | "abandoned";

export interface IAnswer {
  questionId: string;
  questionText: string;
  type: string;
  marks: number;
  selectedOption?: number;
  writtenAnswer?: string;
  booleanAnswer?: boolean;
  isCorrect?: boolean;
  marksObtained: number;
}

export interface ITestResult {
  _id: string;
  studentId: string | IUser;
  quizId: string | IQuiz;
  chapterId: string | IChapter;
  subjectId: string | ISubject;
  classId: string | IClass;
  answers: IAnswer[];
  totalMarks: number;
  marksObtained: number;
  percentage: number;
  isPassed: boolean;
  status: AttemptStatus;
  timeTaken: number;
  attemptNumber: number;
  startedAt: string;
  completedAt?: string;
  createdAt: string;
  updatedAt: string;
}

// ─── API Response ──────────────────────────────────────────────
// Standard shape returned by all backend endpoints
export interface ApiResponse<T> {
  success: boolean;
  message: string;
  data: T | null;
}
