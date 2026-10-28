import type { Attempt } from '../types/quiz'
import { performanceMessage } from '../utils/messages'

export function ScoreSummary({ attempt }: { attempt: Attempt }) {
  const skipped = attempt.answers.filter((a) => a.selectedOptionId === null).length
  const incorrect = attempt.total - attempt.score - skipped
  return (
    <section className="card score" aria-labelledby="score-heading">
      <h2 id="score-heading" className="visually-hidden">
        Your score
      </h2>
      <p className="score-number">
        {attempt.score} / {attempt.total}
      </p>
      <p className="score-pct">{attempt.percentage}%</p>
      <p>{performanceMessage(attempt.percentage)}</p>
      <p className="muted">
        {attempt.score} correct · {incorrect} incorrect · {skipped} skipped
      </p>
    </section>
  )
}
