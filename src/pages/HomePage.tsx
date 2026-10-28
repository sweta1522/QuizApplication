import { Link, useSearchParams } from 'react-router-dom'
import { useCallback } from 'react'
import { CategoryCard } from '../components/CategoryCard'
import { PageHeading } from '../components/PageHeading'
import { EmptyState, ErrorState, LoadingState } from '../components/StateViews'
import { useCategories, useQuizzes } from '../hooks/useApi'

export default function HomePage() {
  const [params, setParams] = useSearchParams()
  const categories = useCategories()
  const selectedId = params.get('category')
  const selected = categories.data?.find((c) => c.id === selectedId) ?? null
  const quizzes = useQuizzes(selected?.id ?? null)

  const select = useCallback(
    (id: string) => setParams({ category: id }, { replace: true }),
    [setParams],
  )

  return (
    <>
      <section className="hero">
        <PageHeading title="Home">Test your knowledge</PageHeading>
        <p className="lead">
          Pick a category, take a multiple-choice quiz, get instant feedback with explanations,
          then review what you missed and watch your scores improve over time.
        </p>
        <ol className="steps">
          <li>Choose a category</li>
          <li>Answer the questions</li>
          <li>Review your results</li>
        </ol>
      </section>

      <section aria-labelledby="cat-heading">
        <h2 id="cat-heading">Quiz categories</h2>
        {categories.loading && <LoadingState label="Loading categories…" />}
        {categories.error && (
          <ErrorState message={categories.error.message} onRetry={categories.retry} />
        )}
        {categories.data?.length === 0 && <EmptyState>No categories available yet.</EmptyState>}
        {categories.data && categories.data.length > 0 && (
          <div className="grid">
            {categories.data.map((c) => (
              <CategoryCard key={c.id} category={c} selected={c.id === selected?.id} onSelect={select} />
            ))}
          </div>
        )}
      </section>

      <section aria-labelledby="quiz-heading" aria-live="polite" className="quiz-list">
        {selected ? (
          <>
            <h2 id="quiz-heading">{selected.name} quizzes</h2>
            {quizzes.loading && <LoadingState label="Loading quizzes…" />}
            {quizzes.error && <ErrorState message={quizzes.error.message} onRetry={quizzes.retry} />}
            {quizzes.data?.length === 0 && <EmptyState>No quizzes in this category yet.</EmptyState>}
            {quizzes.data?.map((q) => (
              <article key={q.id} className="card quiz-item">
                <div>
                  <h3>{q.title}</h3>
                  <p className="muted">{q.description}</p>
                  <p className="muted small">
                    {q.questionCount} questions · ~{q.estimatedMinutes} min · {q.difficulty}
                  </p>
                </div>
                <Link className="btn" to={`/quiz/${q.id}`}>
                  Start quiz<span className="visually-hidden">: {q.title}</span>
                </Link>
              </article>
            ))}
          </>
        ) : (
          categories.data &&
          categories.data.length > 0 && (
            <>
              <h2 id="quiz-heading" className="visually-hidden">
                Quizzes
              </h2>
              <p className="muted">Select a category above to see its quizzes.</p>
            </>
          )
        )}
      </section>
    </>
  )
}
