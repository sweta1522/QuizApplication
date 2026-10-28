import { memo, useEffect, useRef, useState, type FormEvent } from 'react'
import type { Question } from '../types/quiz'

interface Props {
  question: Question
  /** Submitted answer; null if skipped, undefined if not yet seen. */
  submittedOptionId?: string | null
  /** Another never-seen question remains. */
  hasPending: boolean
  skippedCount: number
  /** Move focus to the question when it appears (after the first one). */
  focusOnMount?: boolean
  onSubmit: (optionId: string) => void
  onSkip: () => void
  onNext: () => void
  onFinish: () => void
}

export const QuestionCard = memo(function QuestionCard({
  question,
  submittedOptionId,
  hasPending,
  skippedCount,
  focusOnMount,
  onSubmit,
  onSkip,
  onNext,
  onFinish,
}: Props) {
  const [pending, setPending] = useState<string | null>(null)
  const nextRef = useRef<HTMLButtonElement>(null)
  const fieldsetRef = useRef<HTMLFieldSetElement>(null)
  const answered = typeof submittedOptionId === 'string'
  const skipped = submittedOptionId === null
  const correct = answered && submittedOptionId === question.correctOptionId

  useEffect(() => {
    if (focusOnMount) fieldsetRef.current?.focus()
  }, [focusOnMount])

  // Move focus to the next action once feedback appears.
  useEffect(() => {
    if (answered) nextRef.current?.focus()
  }, [answered])

  const submit = (e: FormEvent) => {
    e.preventDefault()
    if (!answered && pending) onSubmit(pending)
  }

  return (
    <form className="card question" onSubmit={submit}>
      <fieldset ref={fieldsetRef} tabIndex={-1}>
        <legend id={`q-${question.id}`}>{question.text}</legend>
        <ul className="options">
          {question.options.map((o) => {
            const chosen = (answered ? submittedOptionId : pending) === o.id
            const isCorrect = answered && o.id === question.correctOptionId
            const isWrong = answered && chosen && !isCorrect
            return (
              <li key={o.id}>
                <label
                  className={`option${chosen ? ' chosen' : ''}${isCorrect ? ' correct' : ''}${isWrong ? ' wrong' : ''}`}
                >
                  <input
                    type="radio"
                    name={question.id}
                    value={o.id}
                    checked={chosen}
                    disabled={answered}
                    onChange={() => setPending(o.id)}
                  />
                  <span>{o.text}</span>
                  {isCorrect && <span className="badge">✓ Correct answer</span>}
                  {isWrong && <span className="badge">✗ Your answer</span>}
                </label>
              </li>
            )
          })}
        </ul>
      </fieldset>

      <div aria-live="polite" className="feedback-region">
        {answered && (
          <div className={`feedback ${correct ? 'feedback-correct' : 'feedback-wrong'}`}>
            <p className="feedback-title">{correct ? '✓ Correct!' : '✗ Incorrect'}</p>
            <p>{question.explanation}</p>
          </div>
        )}
        {skipped && <p className="note">⏭ You skipped this question earlier. You can answer it now.</p>}
      </div>

      <div className="actions">
        {!answered ? (
          <>
            <button type="submit" className="btn" disabled={!pending}>
              Check answer
            </button>
            {!skipped && (
              <button type="button" className="btn btn-secondary" onClick={onSkip}>
                Skip question
              </button>
            )}
          </>
        ) : hasPending ? (
          <button type="button" ref={nextRef} className="btn" onClick={onNext}>
            Next question
          </button>
        ) : (
          <button type="button" ref={nextRef} className="btn" onClick={onFinish}>
            {skippedCount > 0 ? 'Finish quiz' : 'See results'}
          </button>
        )}
      </div>
    </form>
  )
})
