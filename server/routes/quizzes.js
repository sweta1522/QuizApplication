import { Router } from 'express'

const ID_PATTERN = /^[a-z0-9-]{1,64}$/
const error = (res, status, code, message) =>
  res.status(status).json({ error: { code, message } })

export function quizRouter({ categories, quizzes }) {
  const router = Router()
  const cache = (res) => res.set('Cache-Control', 'public, max-age=60')

  const summarize = ({ questions, ...quiz }) => ({ ...quiz, questionCount: questions.length })

  router.get('/categories', (_req, res) => {
    cache(res)
    res.json(
      categories.map((c) => {
        const own = quizzes.filter((q) => q.categoryId === c.id)
        return {
          ...c,
          quizCount: own.length,
          questionCount: own.reduce((n, q) => n + q.questions.length, 0),
        }
      }),
    )
  })

  router.get('/categories/:id/quizzes', (req, res) => {
    const { id } = req.params
    if (!ID_PATTERN.test(id)) return error(res, 400, 'BAD_ID', 'Invalid category id')
    if (!categories.some((c) => c.id === id)) return error(res, 404, 'NOT_FOUND', 'Category not found')
    cache(res)
    res.json(quizzes.filter((q) => q.categoryId === id).map(summarize))
  })

  router.get('/quizzes/:id', (req, res) => {
    const { id } = req.params
    if (!ID_PATTERN.test(id)) return error(res, 400, 'BAD_ID', 'Invalid quiz id')
    const quiz = quizzes.find((q) => q.id === id)
    if (!quiz) return error(res, 404, 'NOT_FOUND', 'Quiz not found')
    cache(res)
    res.json(quiz)
  })

  return router
}
