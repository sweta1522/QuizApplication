// @vitest-environment node
import { describe, it, expect } from 'vitest'
import request from 'supertest'
import { createApp } from './app.js'

const app = createApp()

describe('mock API', () => {
  it('lists categories with counts', async () => {
    const res = await request(app).get('/api/categories')
    expect(res.status).toBe(200)
    expect(res.body.length).toBeGreaterThan(0)
    expect(res.body[0]).toHaveProperty('quizCount')
  })
  it('lists quizzes in a category', async () => {
    const res = await request(app).get('/api/categories/science/quizzes')
    expect(res.status).toBe(200)
    expect(res.body[0].questionCount).toBeGreaterThanOrEqual(5)
    expect(res.body[0]).not.toHaveProperty('questions')
  })
  it('returns a full quiz', async () => {
    const res = await request(app).get('/api/quizzes/science-basics')
    expect(res.status).toBe(200)
    expect(res.body.questions.length).toBeGreaterThanOrEqual(5)
  })
  it('404s unknown ids and 400s malformed ids', async () => {
    expect((await request(app).get('/api/quizzes/nope')).status).toBe(404)
    expect((await request(app).get('/api/quizzes/BAD_ID!')).status).toBe(400)
    expect((await request(app).get('/api/categories/nope/quizzes')).status).toBe(404)
  })
  it('simulates failure', async () => {
    expect((await request(app).get('/api/categories?fail=1')).status).toBe(500)
  })
})
