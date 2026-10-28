import { Link, useParams } from 'react-router-dom'
import { PageHeading } from '../components/PageHeading'
import { ReviewList } from '../components/ReviewList'
import { ScoreSummary } from '../components/ScoreSummary'
import { useAttempts } from '../hooks/useAttempts'

export default function ResultsPage() {
  const { attemptId } = useParams()
  const attempts = useAttempts()
  const attempt = attempts.find((a) => a.id === attemptId)

  if (!attempt) {
    return (
      <div className="state-box">
        <PageHeading title="Results not found">Results not found</PageHeading>
        <p>We couldn’t find those results. They may have been cleared from this browser.</p>
        <Link className="btn" to="/">
          Browse quizzes
        </Link>
      </div>
    )
  }

  return (
    <>
      <PageHeading title="Results">Results: {attempt.quizTitle}</PageHeading>
      <ScoreSummary attempt={attempt} />
      <div className="actions">
        <Link className="btn" to={`/quiz/${attempt.quizId}`}>
          Retake quiz
        </Link>
        <Link className="btn btn-secondary" to={`/?category=${encodeURIComponent(attempt.categoryId)}`}>
          More quizzes
        </Link>
        <Link className="btn btn-secondary" to="/progress">
          My progress
        </Link>
      </div>
      <ReviewList answers={attempt.answers} />
    </>
  )
}
