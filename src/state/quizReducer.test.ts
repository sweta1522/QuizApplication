import { describe, expect, it } from 'vitest'
import { initRun, quizReducer } from './quizReducer'

describe('quizReducer', () => {
  const start = initRun('q', ['a', 'b'])

  it('locks an answer once submitted', () => {
    const s1 = quizReducer(start, { type: 'SUBMIT', questionId: 'a', optionId: 'x' })
    const s2 = quizReducer(s1, { type: 'SUBMIT', questionId: 'a', optionId: 'y' })
    expect(s2.selections.a).toBe('x')
  })
  it('ignores submissions for non-current questions', () => {
    expect(quizReducer(start, { type: 'SUBMIT', questionId: 'b', optionId: 'x' })).toBe(start)
  })
  it('skips to the next unseen question without locking the skipped one', () => {
    const s = quizReducer(start, { type: 'SKIP', questionId: 'a' })
    expect(s).toMatchObject({ index: 1, selections: { a: null } })
  })
  it('stays on the last question when nothing else is unseen', () => {
    let s = quizReducer(start, { type: 'SKIP', questionId: 'a' })
    s = quizReducer(s, { type: 'SKIP', questionId: 'b' })
    expect(s.index).toBe(1)
    expect(s.selections).toEqual({ a: null, b: null })
  })
  it('can answer a skipped question after going back, then locks it', () => {
    let s = quizReducer(start, { type: 'SKIP', questionId: 'a' })
    s = quizReducer(s, { type: 'SUBMIT', questionId: 'b', optionId: 'x' })
    s = quizReducer(s, { type: 'GO_TO', index: 0 })
    expect(s.index).toBe(0)
    s = quizReducer(s, { type: 'SUBMIT', questionId: 'a', optionId: 'y' })
    expect(s.selections.a).toBe('y')
    expect(quizReducer(s, { type: 'SUBMIT', questionId: 'a', optionId: 'z' })).toBe(s)
  })
  it('GO_TO only targets skipped questions', () => {
    const s = quizReducer(start, { type: 'SUBMIT', questionId: 'a', optionId: 'x' })
    expect(quizReducer(s, { type: 'GO_TO', index: 0 })).toBe(s)
    expect(quizReducer(s, { type: 'GO_TO', index: 1 })).toBe(s)
    expect(quizReducer(s, { type: 'GO_TO', index: 9 })).toBe(s)
  })
  it('NEXT wraps around to an earlier unseen question', () => {
    const s = { ...initRun('q', ['a', 'b', 'c']), index: 2, selections: { c: 'x' } }
    expect(quizReducer(s, { type: 'NEXT' }).index).toBe(0)
  })
  it('SKIP on an already skipped question is a no-op', () => {
    let s = quizReducer(start, { type: 'SKIP', questionId: 'a' })
    s = quizReducer(s, { type: 'SKIP', questionId: 'b' })
    expect(quizReducer(s, { type: 'GO_TO', index: 0 }).index).toBe(0)
    const back = quizReducer(s, { type: 'GO_TO', index: 0 })
    expect(quizReducer(back, { type: 'SKIP', questionId: 'a' })).toBe(back)
  })
  it('cannot advance before answering or past the end', () => {
    expect(quizReducer(start, { type: 'NEXT' })).toBe(start)
    let s = quizReducer(start, { type: 'SUBMIT', questionId: 'a', optionId: 'x' })
    s = quizReducer(s, { type: 'NEXT' })
    expect(s.index).toBe(1)
    s = quizReducer(s, { type: 'SUBMIT', questionId: 'b', optionId: 'x' })
    expect(quizReducer(s, { type: 'NEXT' })).toBe(s)
  })
})
