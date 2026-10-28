import express from 'express'
import cors from 'cors'
import compression from 'compression'
import { readFileSync } from 'node:fs'
import { quizRouter } from './routes/quizzes.js'

const MIN_QUESTIONS = 5

export function loadData() {
  const raw = JSON.parse(
    readFileSync(new URL('./data/quizzes.json', import.meta.url), 'utf8'),
  )
  for (const quiz of raw.quizzes) {
    if (quiz.questions.length < MIN_QUESTIONS) {
      throw new Error(`Quiz "${quiz.id}" has fewer than ${MIN_QUESTIONS} questions`)
    }
  }
  return raw
}

export function createApp(data = loadData()) {
  const app = express()
  app.disable('x-powered-by')
  app.use(cors())
  app.use(compression())
  app.use(express.json())

  // Test helpers: ?delay=ms simulates latency, ?fail=1 simulates a server error
  app.use('/api', async (req, res, next) => {
    const delay = Number(req.query.delay)
    if (Number.isFinite(delay) && delay > 0) {
      await new Promise((r) => setTimeout(r, Math.min(delay, 5000)))
    }
    if (req.query.fail === '1') {
      return res.status(500).json({ error: { code: 'SIMULATED', message: 'Simulated failure' } })
    }
    next()
  })

  app.get('/api/health', (_req, res) => res.json({ status: 'ok' }))
  app.use('/api', quizRouter(data))

  app.use('/api', (_req, res) =>
    res.status(404).json({ error: { code: 'NOT_FOUND', message: 'Route not found' } }),
  )
  app.use((err, _req, res, _next) => {
    console.error(err)
    res.status(500).json({ error: { code: 'INTERNAL', message: 'Something went wrong' } })
  })
  return app
}
