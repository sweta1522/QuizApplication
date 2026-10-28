import { useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { AttemptHistoryTable } from '../components/AttemptHistoryTable'
import { PageHeading } from '../components/PageHeading'
import { ProgressChart } from '../components/ProgressChart'
import { useAttempts, useStorageAvailable } from '../hooks/useAttempts'

const CHART_POINTS = 20

export default function ProgressPage() {
  const all = useAttempts()
  const storageOk = useStorageAvailable()
  const [quizId, setQuizId] = useState('all')

  const quizOptions = useMemo(
    () => [...new Map(all.map((a) => [a.quizId, a.quizTitle])).entries()],
    [all],
  )
  const attempts = useMemo(
    () => (quizId === 'all' ? all : all.filter((a) => a.quizId === quizId)),
    [all, quizId],
  )
  const chartData = useMemo(() => attempts.slice(0, CHART_POINTS).reverse(), [attempts])
  const stats = useMemo(() => {
    const n = attempts.length
    const avg = n ? Math.round(attempts.reduce((s, a) => s + a.percentage, 0) / n) : 0
    const best = n ? Math.max(...attempts.map((a) => a.percentage)) : 0
    return { n, avg, best }
  }, [attempts])

  if (all.length === 0) {
    return (
      <>
        <PageHeading title="My progress">My progress</PageHeading>
        {!storageOk && <p role="status" className="state-box">Saving is unavailable in this browser; history will be lost when you close the tab.</p>}
        <div className="state-box">
          <p>No attempts yet. Complete a quiz and your scores will show up here.</p>
          <Link className="btn" to="/">
            Browse quizzes
          </Link>
        </div>
      </>
    )
  }

  return (
    <>
      <PageHeading title="My progress">My progress</PageHeading>
      {!storageOk && (
        <p role="status" className="state-box">
          Saving is unavailable in this browser; history will be lost when you close the tab.
        </p>
      )}
      <div className="row">
        <label>
          Filter by quiz{' '}
          <select value={quizId} onChange={(e) => setQuizId(e.target.value)}>
            <option value="all">All quizzes</option>
            {quizOptions.map(([id, title]) => (
              <option key={id} value={id}>
                {title}
              </option>
            ))}
          </select>
        </label>
      </div>
      <dl className="stats">
        <div className="card">
          <dt>Attempts</dt>
          <dd>{stats.n}</dd>
        </div>
        <div className="card">
          <dt>Average</dt>
          <dd>{stats.avg}%</dd>
        </div>
        <div className="card">
          <dt>Best</dt>
          <dd>{stats.best}%</dd>
        </div>
      </dl>
      <section aria-labelledby="trend-heading" className="card">
        <h2 id="trend-heading">Score over time</h2>
        <ProgressChart attempts={chartData} />
      </section>
      <section aria-labelledby="history-heading">
        <h2 id="history-heading">Attempt history</h2>
        <AttemptHistoryTable attempts={attempts} />
      </section>
    </>
  )
}
