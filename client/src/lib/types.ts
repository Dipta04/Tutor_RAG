export type UserRole = "Student" | "Teacher";

export interface SessionUser {
  username: string;
  fullname: string;
  role: UserRole;
  grade: number;
}

export interface LoginResponse {
  message: string;
  username: string;
  fullname: string;
  role: UserRole;
  grade: number;
}

export interface ChatResponse {
  answer: string;
  sources: string[];
}

export interface QuizResponse {
  quiz: string;
  sources: string[];
  quiz_id: string;
}

export interface QuestionResult {
  question_number: number;
  user_answer: string;
  correct_answer: string;
  is_correct: boolean;
}

export interface QuizCheckResponse {
  message: string;
  score: number;
  total: number;
  results: QuestionResult[];
}

export interface QuizAttempt {
  id: string;
  quiz_id: string;
  timestamp: string;
  topic: string;
  score: number;
  total: number;
  results: QuestionResult[];
  quiz_content: string;
}

export interface QuizHistoryResponse {
  message: string;
  history: QuizAttempt[];
}

export interface UploadResponse {
  message: string;
  doc_id: string;
  grade: number;
  chunks: number;
  access: string;
}
