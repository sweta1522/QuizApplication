interface Props {
  current: number
  total: number
  answered?: number
  skipped?: number
}

export function ProgressBar({ current, total, answered, skipped }: Props) {
  const pct = total > 0 ? Math.round((current / total) * 100) : 0
  return (
    <div className="progress">
      <p className="progress-label" aria-hidden="true">
        Question {current} of {total}
      </p>
      {answered !== undefined && skipped !== undefined && (
        <p className="muted small">
          {answered} answered · {skipped} skipped
        </p>
      )}
      <div
        className="progress-track"
        role="progressbar"
        aria-label="Quiz progress"
        aria-valuemin={1}
        aria-valuemax={total}
        aria-valuenow={current}
        aria-valuetext={`Question ${current} of ${total}`}
      >
        <div className="progress-fill" style={{ width: `${pct}%` }} />
      </div>
    </div>
  )
}
