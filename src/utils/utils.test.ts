import { describe, expect, it } from 'vitest'
import { performanceMessage } from './messages'
import { buildAttempt, percentage } from './scoring'
import { shuffle } from './shuffle'
import type { Quiz } from '../types/quiz'

describe('performanceMessage', () => {
  it.each([
    [0, /give up/],
    [39, /give up/],
    [40, /practicing/],
    [59, /practicing/],
    [60, /Good/],
    [79, /Good/],
    [80, /Excellent/],
    [99, /Excellent/],
    [100, /Perfect/],
  ])('%i%%', (pct, re) => expect(performanceMessage(pct)).toMatch(re))
})

describe('percentage', () => {
  it('rounds and guards against zero total', () => {
    expect(percentage(1, 3)).toBe(33)
    expect(percentage(2, 3)).toBe(67)
    expect(percentage(0, 0)).toBe(0)
  })
})

describe('shuffle', () => {
  it('keeps all items and does not mutate', () => {
    const input = [1, 2, 3, 4, 5]
    const out = shuffle(input)
    expect([...out].sort()).toEqual(input)
    expect(input).toEqual([1, 2, 3, 4, 5])
  })
})

describe('buildAttempt', () => {
  const quiz: Quiz = {
    id: 'q', categoryId: 'c', title: 'T', description: '', difficulty: 'easy', estimatedMinutes: 1,
    questions: ['a', 'b'].map((id) => ({
      id, text: id, explanation: '', correctOptionId: `${id}1`,
      options: [{ id: `${id}1`, text: 'x' }, { id: `${id}2`, text: 'y' }],
    })),
  }
  it('scores answers and counts skipped/unanswered questions', () => {
    const a = buildAttempt(quiz, ['a', 'b'], { a: 'a1', b: 'b2' })
    expect(a).toMatchObject({ score: 1, total: 2, percentage: 50 })
    const partial = buildAttempt(quiz, ['a', 'b'], { a: 'a1' })
    expect(partial).toMatchObject({ score: 1, total: 2, percentage: 50 })
    expect(partial.answers[1].selectedOptionId).toBeNull()
    const skipped = buildAttempt(quiz, ['a', 'b'], { a: null, b: null })
    expect(skipped).toMatchObject({ score: 0, total: 2, percentage: 0 })
  })
})
