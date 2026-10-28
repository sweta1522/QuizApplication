import type { QuizRunState } from '../state/quizReducer'

const key = (quizId: string) => `quizapp:v1:run:${quizId}`

export function loadRun(quizId: string, validIds: Set<string>): QuizRunState | null {
  try {
    const raw = sessionStorage.getItem(key(quizId))
    if (!raw) return null
    const run = JSON.parse(raw) as QuizRunState
    const ok =
      run?.quizId === quizId &&
      Array.isArray(run.order) &&
      run.order.length === validIds.size &&
      run.order.every((id) => validIds.has(id)) &&
      Number.isInteger(run.index) &&
      run.index >= 0 &&
      run.index < run.order.length &&
      run.selections &&
      typeof run.selections === 'object'
    return ok ? run : null
  } catch {
    return null
  }
}

export function saveRun(run: QuizRunState) {
  try {
    sessionStorage.setItem(key(run.quizId), JSON.stringify(run))
  } catch {
    /* progress just won't survive a refresh */
  }
}

export function clearRun(quizId: string) {
  try {
    sessionStorage.removeItem(key(quizId))
  } catch {
    /* ignore */
  }
}
