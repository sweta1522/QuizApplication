interface Props {
  /** Positions (0-based) of skipped questions in presentation order. */
  indexes: number[]
  current: number
  onGoTo: (index: number) => void
}

export function SkippedNav({ indexes, current, onGoTo }: Props) {
  if (indexes.length === 0) return null
  return (
    <nav aria-label="Skipped questions" className="skipped-nav">
      <span>Skipped questions ({indexes.length}):</span>
      {indexes.map((i) => (
        <button
          key={i}
          type="button"
          className={`btn${i === current ? '' : ' btn-secondary'}`}
          aria-current={i === current ? 'step' : undefined}
          onClick={() => onGoTo(i)}
        >
          Question {i + 1}
        </button>
      ))}
    </nav>
  )
}
