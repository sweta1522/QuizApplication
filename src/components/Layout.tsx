import { NavLink, Outlet } from 'react-router-dom'
import { ErrorBoundary } from './ErrorBoundary'

export function Layout() {
  return (
    <>
      <a className="skip-link" href="#main">
        Skip to main content
      </a>
      <header className="site-header">
        <div className="container header-inner">
          <NavLink to="/" className="brand">
            <span aria-hidden="true">🧠</span> QuizApp
          </NavLink>
          <nav aria-label="Main">
            <NavLink to="/" end>
              Home
            </NavLink>
            <NavLink to="/progress">My progress</NavLink>
          </nav>
        </div>
      </header>
      <main id="main" className="container">
        <ErrorBoundary>
          <Outlet />
        </ErrorBoundary>
      </main>
      <footer className="container site-footer">Practice, learn and track your growth.</footer>
    </>
  )
}
