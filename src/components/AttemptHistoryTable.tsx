import { Link } from 'react-router-dom'
import type { Attempt } from '../types/quiz'
import { formatDate } from '../utils/format'

export function AttemptHistoryTable({ attempts }: { attempts: Attempt[] }) {
  return (
    <div className="table-wrap">
      <table>
        <caption className="visually-hidden">Attempt history, newest first</caption>
        <thead>
          <tr>
            <th scope="col">Date</th>
            <th scope="col">Quiz</th>
            <th scope="col">Score</th>
            <th scope="col">Percent</th>
            <th scope="col">
              <span className="visually-hidden">Actions</span>
            </th>
          </tr>
        </thead>
        <tbody>
          {attempts.map((a) => (
            <tr key={a.id}>
              <td>{formatDate(a.completedAt)}</td>
              <td>{a.quizTitle}</td>
              <td>
                {a.score}/{a.total}
              </td>
              <td>{a.percentage}%</td>
              <td>
                <Link to={`/results/${a.id}`}>
                  Review<span className="visually-hidden"> {a.quizTitle} on {formatDate(a.completedAt)}</span>
                </Link>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}
