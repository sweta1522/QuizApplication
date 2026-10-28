export interface Category {
  id: string
  name: string
  description: string
  icon: string
  quizCount: number
  questionCount: number
}

export type Difficulty = 'easy' | 'medium' | 'hard'

export interface QuizSummary {
  id: string
  categoryId: string
  title: string
  description: string
  difficulty: Difficulty
  estimatedMinutes: number
  questionCount: number
}

export interface Option {
  id: string
  text: string
}

export interface Question {
  id: string
  text: string
  options: Option[]
  correctOptionId: string
  explanation: string
}

export interface Quiz {
  id: string
  categoryId: string
  title: string
  description: string
  difficulty: Difficulty
  estimatedMinutes: number
  questions: Question[]
}

/** Snapshot of one answered question, stored so results can be reviewed later. */
export interface AnswerRecord {
  questionId: string
  text: string
  options: Option[]
  /** null when the question was skipped. */
  selectedOptionId: string | null
  correctOptionId: string
  explanation: string
}

export interface Attempt {
  id: string
  quizId: string
  quizTitle: string
  categoryId: string
  score: number
  total: number
  percentage: number
  completedAt: string
  answers: AnswerRecord[]
}
