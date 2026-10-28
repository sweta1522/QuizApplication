import { useCallback, useEffect, useReducer, useState } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import { PageHeading } from '../components/PageHeading'
import { ProgressBar } from '../components/ProgressBar'
import { QuestionCard } from '../components/QuestionCard'
import { SkippedNav } from '../components/SkippedNav'
import { ErrorState, LoadingState } from '../components/StateViews'
import { useQuiz } from '../hooks/useApi'
import { initRun, nextPendingIndex, quizReducer } from '../state/quizReducer'
import { clearRun, loadRun, saveRun } from '../storage/session'
import { saveAttempt } from '../storage/attempts'
import type { Quiz } from '../types/quiz'
import { buildAttempt } from '../utils/scoring'
import { shuffle } from '../utils/shuffle'
import { ApiError } from '../api/client'

function QuizRunner({ quiz, onRestart }: { quiz: Quiz; onRestart: () => void }) {
  const navigate = useNavigate()
  const [state, dispatch] = useReducer(quizReducer, quiz, (q) => {
    const ids = q.questions.map((x) => x.id)
    return loadRun(q.id, new Set(ids)) ?? initRun(q.id, shuffle(ids))
  })

  useEffect(() => saveRun(state), [state])

  const answeredCount = Object.keys(state.selections).length
  const [navCount, setNavCount] = useState(0)
  useEffect(() => {
    if (answeredCount === 0) return
    const warn = (e: BeforeUnloadEvent) => e.preventDefault()
    window.addEventListener('beforeunload', warn)
    return () => window.removeEventListener('beforeunload', warn)
  }, [answeredCount])

  const questionId = state.order[state.index]
  const question = quiz.questions.find((q) => q.id === questionId)!
  const total = state.order.length
  const skippedIndexes = state.order.flatMap((id, i) => (state.selections[id] === null ? [i] : []))
  const hasPending = nextPendingIndex(state) !== -1
  const currentAnswered = typeof state.selections[questionId] === 'string'

  const onSubmit = useCallback(
    (optionId: string) => dispatch({ type: 'SUBMIT', questionId, optionId }),
    [questionId],
  )
  const onSkip = useCallback(() => {
    dispatch({ type: 'SKIP', questionId })
    setNavCount((n) => n + 1)
  }, [questionId])
  const onNext = useCallback(() => {
    dispatch({ type: 'NEXT' })
    setNavCount((n) => n + 1)
  }, [])
  const onGoTo = useCallback((index: number) => {
    dispatch({ type: 'GO_TO', index })
    setNavCount((n) => n + 1)
  }, [])
  const onFinish = useCallback(() => {
    const attempt = buildAttempt(quiz, state.order, state.selections)
    saveAttempt(attempt)
    clearRun(quiz.id)
    navigate(`/results/${attempt.id}`)
  }, [quiz, state.order, state.selections, navigate])

  return (
    <>
      <div className="row">
        <PageHeading title={quiz.title}>{quiz.title}</PageHeading>
        <button type="button" className="btn btn-secondary" onClick={onRestart}>
          Restart
        </button>
      </div>
      <ProgressBar
        current={state.index + 1}
        total={total}
        answered={state.order.filter((id) => typeof state.selections[id] === 'string').length}
        skipped={skippedIndexes.length}
      />
      <QuestionCard
        key={question.id}
        question={question}
        submittedOptionId={state.selections[question.id]}
        hasPending={hasPending}
        skippedCount={skippedIndexes.length}
        focusOnMount={navCount > 0}
        onSubmit={onSubmit}
        onSkip={onSkip}
        onNext={onNext}
        onFinish={onFinish}
      />
      <SkippedNav indexes={skippedIndexes} current={state.index} onGoTo={onGoTo} />
      {!hasPending && !currentAnswered && (
        <div className="actions">
          <button type="button" className="btn" onClick={onFinish}>
            Finish quiz{skippedIndexes.length > 0 ? ` (${skippedIndexes.length} skipped)` : ''}
          </button>
        </div>
      )}
    </>
  )
}

export default function QuizPage() {
  const { quizId } = useParams()
  const { data: quiz, error, loading, retry } = useQuiz(quizId)
  const [runKey, setRunKey] = useState(0)

  const restart = useCallback(() => {
    if (quizId) clearRun(quizId)
    setRunKey((k) => k + 1)
  }, [quizId])

  if (loading) return <LoadingState label="Loading quiz…" />
  if (error) {
    const notFound = error instanceof ApiError && (error.status === 404 || error.status === 400)
    return notFound ? (
      <div className="state-box">
        <PageHeading title="Quiz not found">Quiz not found</PageHeading>
        <p>We couldn’t find that quiz.</p>
        <Link className="btn" to="/">
          Browse quizzes
        </Link>
      </div>
    ) : (
      <ErrorState message={error.message} onRetry={retry} />
    )
  }
  if (!quiz) return null
  if (quiz.questions.length === 0) {
    return (
      <div className="state-box">
        <PageHeading title={quiz.title}>{quiz.title}</PageHeading>
        <p>This quiz has no playable questions right now.</p>
        <Link className="btn" to="/">
          Back to quizzes
        </Link>
      </div>
    )
  }
  return <QuizRunner key={`${quiz.id}:${runKey}`} quiz={quiz} onRestart={restart} />
}
