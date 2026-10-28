import type { ReactNode } from 'react'

export function LoadingState({ label = 'Loading…' }: { label?: string }) {
  return (
    <div className="state-box" role="status" aria-live="polite">
      <span className="spinner" aria-hidden="true" />
      <p>{label}</p>
    </div>
  )
}

export function ErrorState({
  message,
  onRetry,
}: {
  message: string
  onRetry?: () => void
}) {
  return (
    <div className="state-box" role="alert">
      <p>
        <strong>Something went wrong.</strong> {message}
      </p>
      {onRetry && (
        <button className="btn" onClick={onRetry}>
          Try again
        </button>
      )}
    </div>
  )
}

export function EmptyState({ children }: { children: ReactNode }) {
  return <div className="state-box">{children}</div>
}
