export interface QuizRunState {
  quizId: string
  /** Question ids in the order they are presented. */
  order: string[]
  index: number
  /** Answers keyed by question id; null means skipped (still answerable). */
  selections: Record<string, string | null>
}

export type QuizAction =
  | { type: 'SUBMIT'; questionId: string; optionId: string }
  | { type: 'SKIP'; questionId: string }
  | { type: 'GO_TO'; index: number }
  | { type: 'NEXT' }

export function initRun(quizId: string, order: string[]): QuizRunState {
  return { quizId, order, index: 0, selections: {} }
}

/** Next unseen (never answered or skipped) question after `from`, wrapping around; -1 if none. */
export function nextPendingIndex(state: QuizRunState, from = state.index): number {
  const n = state.order.length
  for (let step = 1; step < n; step++) {
    const i = (from + step) % n
    if (!(state.order[i] in state.selections)) return i
  }
  return -1
}

export const isLocked = (state: QuizRunState, id: string) =>
  typeof state.selections[id] === 'string'

export function quizReducer(state: QuizRunState, action: QuizAction): QuizRunState {
  switch (action.type) {
    case 'SUBMIT': {
      // Answers are locked once submitted (skipped questions stay open); only the current question is accepted.
      if (isLocked(state, action.questionId)) return state
      if (state.order[state.index] !== action.questionId) return state
      return {
        ...state,
        selections: { ...state.selections, [action.questionId]: action.optionId },
      }
    }
    case 'SKIP': {
      if (action.questionId in state.selections) return state
      if (state.order[state.index] !== action.questionId) return state
      const selections = { ...state.selections, [action.questionId]: null }
      const next = nextPendingIndex({ ...state, selections })
      return { ...state, selections, index: next === -1 ? state.index : next }
    }
    case 'GO_TO': {
      const id = state.order[action.index]
      // Only skipped questions can be revisited.
      if (id === undefined || state.selections[id] !== null) return state
      return { ...state, index: action.index }
    }
    case 'NEXT': {
      if (!(state.order[state.index] in state.selections)) return state
      const next = nextPendingIndex(state)
      return next === -1 ? state : { ...state, index: next }
    }
    default:
      return state
  }
}


FUL-jyUe-kUUH-hZLmU