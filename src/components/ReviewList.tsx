import { useState } from 'react'
import type { AnswerRecord } from '../types/quiz'

type Filter = 'all' | 'incorrect' | 'missed'

const status = (a: AnswerRecord): 'correct' | 'incorrect' | 'missed' =>
  a.selectedOptionId === null
    ? 'missed'
    : a.selectedOptionId === a.correctOptionId
      ? 'correct'
      : 'incorrect'

const EMPTY: Record<Filter, string> = {
  all: 'There are no questions to show.',
  incorrect: 'You didn’t answer any question incorrectly — nice!',
  missed: 'You didn’t skip any questions.',
}

export function ReviewList({ answers }: { answers: AnswerRecord[] }) {
  const [filter, setFilter] = useState<Filter>('all')
  const counts = {
    all: answers.length,
    incorrect: answers.filter((a) => status(a) === 'incorrect').length,
    missed: answers.filter((a) => status(a) === 'missed').length,
  }
  const shown = filter === 'all' ? answers : answers.filter((a) => status(a) === filter)
  const text = (a: AnswerRecord, id: string | null) =>
    a.options.find((o) => o.id === id)?.text ?? '—'
  const filters: [Filter, string][] = [
    ['all', 'Show all questions'],
    ['incorrect', 'Show incorrect questions'],
    ['missed', 'Show missed questions'],
  ]

  return (
    <section aria-labelledby="review-heading">
      <h2 id="review-heading">Review your answers</h2>
      <div role="group" aria-label="Filter questions" className="actions">
        {filters.map(([key, label]) => (
          <button
            key={key}
            type="button"
            className={`btn${filter === key ? '' : ' btn-secondary'}`}
            aria-pressed={filter === key}
            onClick={() => setFilter(key)}
          >
            {label} ({counts[key]})
          </button>
        ))}
      </div>
      {shown.length === 0 ? (
        <p className="state-box" role="status">
          {EMPTY[filter]}
        </p>
      ) : (
        <ol className="review-list">
          {shown.map((a) => {
            const s = status(a)
            return (
              <li key={a.questionId} className="card">
                <p className="review-q">{a.text}</p>
                <p className={s === 'correct' ? 'tag-correct' : 'tag-wrong'}>
                  {s === 'correct' ? '✓ Correct' : s === 'incorrect' ? '✗ Incorrect' : '⏭ Skipped'}
                </p>
                {s === 'missed' ? (
                  <p className="muted">You skipped this question.</p>
                ) : (
                  <p>
                    <span className="muted">Your answer:</span> {text(a, a.selectedOptionId)}
                  </p>
                )}
                {s !== 'correct' && (
                  <p>
                    <span className="muted">Correct answer:</span> {text(a, a.correctOptionId)}
                  </p>
                )}
                <p className="muted">{a.explanation}</p>
              </li>
            )
          })}
        </ol>
      )}
    </section>
  )
}
