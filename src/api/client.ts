import type { Category, Question, Quiz, QuizSummary } from '../types/quiz'

export class ApiError extends Error {
  status: number
  constructor(message: string, status: number) {
    super(message)
    this.name = 'ApiError'
    this.status = status
  }
}

async function getJson<T>(path: string, signal?: AbortSignal): Promise<T> {
  let res: Response
  try {
    res = await fetch(`/api${path}`, { signal })
    // A 304 that the browser could not resolve from its cache: refetch bypassing it.
    if (res.status === 304) res = await fetch(`/api${path}`, { signal, cache: 'reload' })
  } catch (err) {
    if (err instanceof DOMException && err.name === 'AbortError') throw err
    throw new ApiError('Unable to reach the server. Check your connection.', 0)
  }
  if (!res.ok) {
    let message = res.status === 404 ? 'Not found.' : 'The server returned an error.'
    try {
      const body = await res.json()
      if (body?.error?.message) message = body.error.message
    } catch {
      /* keep default message */
    }
    throw new ApiError(message, res.status)
  }
  try {
    return (await res.json()) as T
  } catch {
    throw new ApiError('The server sent an unreadable response.', res.status)
  }
}

/** Drops malformed questions so the UI never renders an unanswerable one. */
export function sanitizeQuiz(quiz: Quiz): Quiz {
  const questions = (quiz.questions ?? []).filter(
    (q: Question) =>
      q.options?.length >= 2 && q.options.some((o) => o.id === q.correctOptionId),
  )
  return { ...quiz, questions }
}

// Promise cache keyed by path; failed requests are evicted so retry works.
const cache = new Map<string, Promise<unknown>>()

function cached<T>(path: string, signal?: AbortSignal): Promise<T> {
  let p = cache.get(path) as Promise<T> | undefined
  if (!p) {
    // The shared request is not tied to one caller's signal.
    p = getJson<T>(path)
    cache.set(path, p)
    p.catch(() => cache.delete(path))
  }
  return withAbort(p, signal)
}

function withAbort<T>(p: Promise<T>, signal?: AbortSignal): Promise<T> {
  if (!signal) return p
  return new Promise<T>((resolve, reject) => {
    const onAbort = () => reject(new DOMException('Aborted', 'AbortError'))
    if (signal.aborted) return onAbort()
    signal.addEventListener('abort', onAbort, { once: true })
    p.then(resolve, reject).finally(() => signal.removeEventListener('abort', onAbort))
  })
}

export const clearApiCache = () => cache.clear()

export const fetchCategories = (signal?: AbortSignal) =>
  cached<Category[]>('/categories', signal)

export const fetchQuizzes = (categoryId: string, signal?: AbortSignal) =>
  cached<QuizSummary[]>(`/categories/${encodeURIComponent(categoryId)}/quizzes`, signal)

export const fetchQuiz = async (quizId: string, signal?: AbortSignal) =>
  sanitizeQuiz(await cached<Quiz>(`/quizzes/${encodeURIComponent(quizId)}`, signal))
