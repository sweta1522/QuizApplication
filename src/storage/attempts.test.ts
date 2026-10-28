import { beforeEach, describe, expect, it } from 'vitest'
import { getAttempts, resetAttemptsCache, saveAttempt } from './attempts'
import type { Attempt } from '../types/quiz'

const make = (id: string): Attempt => ({
  id, quizId: 'q', quizTitle: 'Q', categoryId: 'c', score: 1, total: 2,
  percentage: 50, completedAt: new Date().toISOString(), answers: [],
})

beforeEach(resetAttemptsCache)

describe('attempt storage', () => {
  it('persists newest first and dedupes by id', () => {
    saveAttempt(make('1'))
    saveAttempt(make('2'))
    saveAttempt(make('2'))
    expect(getAttempts().map((a) => a.id)).toEqual(['2', '1'])
  })
  it('returns a stable reference when unchanged', () => {
    saveAttempt(make('1'))
    expect(getAttempts()).toBe(getAttempts())
  })
  it('discards corrupt data', () => {
    localStorage.setItem('quizapp:v1:attempts', '{not json')
    expect(getAttempts()).toEqual([])
    localStorage.setItem('quizapp:v1:attempts', JSON.stringify([{ id: 1 }, make('ok')]))
    expect(getAttempts().map((a) => a.id)).toEqual(['ok'])
  })
  it('caps history at 100 entries', () => {
    for (let i = 0; i < 105; i++) saveAttempt(make(String(i)))
    expect(getAttempts()).toHaveLength(100)
  })
})
