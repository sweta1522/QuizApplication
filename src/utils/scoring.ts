import type { AnswerRecord, Attempt, Quiz } from '../types/quiz'

export const percentage = (score: number, total: number) =>
  total > 0 ? Math.round((score / total) * 100) : 0

export function buildAttempt(
  quiz: Quiz,
  order: string[],
  selections: Record<string, string | null>,
  now = new Date(),
): Attempt {
  const byId = new Map(quiz.questions.map((q) => [q.id, q]))
  const answers: AnswerRecord[] = []
  for (const id of order) {
    const q = byId.get(id)
    if (!q) continue
    // Unanswered questions count as skipped.
    const selected = selections[id] ?? null
    answers.push({
      questionId: q.id,
      text: q.text,
      options: q.options,
      selectedOptionId: selected,
      correctOptionId: q.correctOptionId,
      explanation: q.explanation,
    })
  }
  const score = answers.filter((a) => a.selectedOptionId === a.correctOptionId).length
  const total = answers.length
  return {
    id: `${now.getTime().toString(36)}-${Math.random().toString(36).slice(2, 8)}`,
    quizId: quiz.id,
    quizTitle: quiz.title,
    categoryId: quiz.categoryId,
    score,
    total,
    percentage: percentage(score, total),
    completedAt: now.toISOString(),
    answers,
  }
}
