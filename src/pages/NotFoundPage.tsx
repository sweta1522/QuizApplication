import { Link } from 'react-router-dom'
import { PageHeading } from '../components/PageHeading'

export default function NotFoundPage() {
  return (
    <div className="state-box">
      <PageHeading title="Page not found">Page not found</PageHeading>
      <p>The page you’re looking for doesn’t exist.</p>
      <Link className="btn" to="/">
        Go home
      </Link>
    </div>
  )
}
