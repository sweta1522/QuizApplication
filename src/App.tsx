import { lazy, Suspense } from 'react'
import { Route, Routes } from 'react-router-dom'
import { Layout } from './components/Layout'
import { LoadingState } from './components/StateViews'
import HomePage from './pages/HomePage'

const QuizPage = lazy(() => import('./pages/QuizPage'))
const ResultsPage = lazy(() => import('./pages/ResultsPage'))
const ProgressPage = lazy(() => import('./pages/ProgressPage'))
const NotFoundPage = lazy(() => import('./pages/NotFoundPage'))

export default function App() {
  return (
    <Suspense fallback={<LoadingState />}>
      <Routes>
        <Route element={<Layout />}>
          <Route index element={<HomePage />} />
          <Route path="quiz/:quizId" element={<QuizPage />} />
          <Route path="results/:attemptId" element={<ResultsPage />} />
          <Route path="progress" element={<ProgressPage />} />
          <Route path="*" element={<NotFoundPage />} />
        </Route>
      </Routes>
    </Suspense>
  )
}
