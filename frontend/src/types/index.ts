// User types
export interface Student {
  id: string;
  name: string;
  className: string;
  photo?: string;
  email?: string;
}

export interface Teacher {
  id: string;
  name: string;
  email: string;
}

// Authentication types
export interface AuthUser extends Student | Teacher {
  role: "student" | "teacher" | "admin";
}

export interface AuthContextType {
  user: AuthUser | null;
  isLoading: boolean;
  login: (credentials: LoginCredentials) => Promise<void>;
  logout: () => void;
  isAuthenticated: boolean;
}

export interface LoginCredentials {
  email: string;
  password?: string;
}

// Notes types
export interface Note {
  id: string;
  title: string;
  subject: string;
  chapter: string;
  class: string;
  fileUrl?: string;
  content?: string;
  createdAt: string;
  updatedAt: string;
}

// Homework types
export interface Homework {
  id: string;
  subject: string;
  description: string;
  dueDate: string;
  status: "pending" | "submitted";
  submittedAt?: string;
  fileUrl?: string;
  marks?: number;
}

// Announcement types
export interface Announcement {
  id: string;
  title: string;
  content: string;
  important: boolean;
  createdAt: string;
  createdBy: string;
}

// Test types
export interface TestQuestion {
  id: string;
  question: string;
  options: string[];
  correctAnswer: number;
}

export interface Test {
  id: string;
  title: string;
  subject: string;
  duration?: number;
  questions: TestQuestion[];
  createdAt: string;
}

export interface TestSubmission {
  testId: string;
  answers: number[];
  score: number;
  submittedAt: string;
}

// Doubt types
export interface Doubt {
  id: string;
  studentId: string;
  studentName: string;
  title: string;
  description: string;
  subject?: string;
  createdAt: string;
  replies?: DoubtReply[];
  resolved: boolean;
}

export interface DoubtReply {
  id: string;
  doubtId: string;
  authorId: string;
  authorName: string;
  content: string;
  createdAt: string;
  isTeacherReply: boolean;
}

// API Response types
export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}
