import type { Attempt } from '../types/quiz'

const STORAGE_KEY = 'quizapp:v1:attempts'
const MAX_ATTEMPTS = 100

type Listener = () => void
const listeners = new Set<Listener>()

// Used when localStorage is unavailable or full.
let memory: Attempt[] = []
let storageWorks = true

let lastRaw: string | null | undefined
let lastParsed: Attempt[] = []

export function isAttempt(v: unknown): v is Attempt {
  if (!v || typeof v !== 'object') return false
  const a = v as Record<string, unknown>
  return (
    typeof a.id === 'string' &&
    typeof a.quizId === 'string' &&
    typeof a.quizTitle === 'string' &&
    typeof a.score === 'number' &&
    typeof a.total === 'number' &&
    typeof a.percentage === 'number' &&
    typeof a.completedAt === 'string' &&
    !Number.isNaN(Date.parse(a.completedAt)) &&
    Array.isArray(a.answers)
  )
}

function parse(raw: string | null): Attempt[] {
  if (!raw) return []
  try {
    const data = JSON.parse(raw)
    return Array.isArray(data) ? data.filter(isAttempt) : []
  } catch {
    return []
  }
}

/** Stable snapshot (same reference until storage changes), newest first. */
export function getAttempts(): Attempt[] {
  if (!storageWorks) return memory
  let raw: string | null
  try {
    raw = localStorage.getItem(STORAGE_KEY)
  } catch {
    storageWorks = false
    return memory
  }
  if (raw !== lastRaw) {
    lastRaw = raw
    lastParsed = parse(raw)
  }
  return lastParsed
}

export function isStorageAvailable() {
  getAttempts()
  return storageWorks
}

export function saveAttempt(attempt: Attempt) {
  const current = getAttempts()
  if (current.some((a) => a.id === attempt.id)) return
  const next = [attempt, ...current].slice(0, MAX_ATTEMPTS)
  try {
    if (!storageWorks) throw new Error('unavailable')
    localStorage.setItem(STORAGE_KEY, JSON.stringify(next))
  } catch {
    storageWorks = false
    memory = next
  }
  listeners.forEach((l) => l())
}

export function subscribe(listener: Listener) {
  listeners.add(listener)
  const onStorage = (e: StorageEvent) => {
    if (e.key === STORAGE_KEY || e.key === null) listener()
  }
  window.addEventListener('storage', onStorage)
  return () => {
    listeners.delete(listener)
    window.removeEventListener('storage', onStorage)
  }
}

/** Test helper. */
export function resetAttemptsCache() {
  lastRaw = undefined
  lastParsed = []
  memory = []
  storageWorks = true
}
