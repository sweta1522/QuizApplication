import { Component, type ReactNode } from 'react'

interface Props {
  children: ReactNode
}

export class ErrorBoundary extends Component<Props, { failed: boolean }> {
  state = { failed: false }

  static getDerivedStateFromError() {
    return { failed: true }
  }

  render() {
    if (!this.state.failed) return this.props.children
    return (
      <div role="alert" className="state-box">
        <h1>Something went wrong</h1>
        <p>An unexpected error occurred.</p>
        <button className="btn" onClick={() => window.location.assign('/')}>
          Back to home
        </button>
      </div>
    )
  }
}
