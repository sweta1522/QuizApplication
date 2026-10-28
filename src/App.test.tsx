import { render, screen, waitFor, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { MemoryRouter } from 'react-router-dom'
import { axe } from 'jest-axe'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import App from './App'
import { clearApiCache } from './api/client'
import { resetAttemptsCache } from './storage/attempts'
import data from '../server/data/quizzes.json'

function mockApi() {
  vi.stubGlobal(
    'fetch',
    vi.fn(async (url: string) => {
      const json = (body: unknown, status = 200) =>
        new Response(JSON.stringify(body), { status })
      let m: RegExpMatchArray | null
      if (url === '/api/categories')
        return json(
          data.categories.map((c) => ({ ...c, quizCount: 1, questionCount: 5 })),
        )
      if ((m = url.match(/^\/api\/categories\/(.+)\/quizzes$/)))
        return json(
          data.quizzes
            .filter((q) => q.categoryId === m![1])
            .map(({ questions, ...q }) => ({ ...q, questionCount: questions.length })),
        )
      if ((m = url.match(/^\/api\/quizzes\/(.+)$/))) {
        const quiz = data.quizzes.find((q) => q.id === m![1])
        return quiz ? json(quiz) : json({ error: { message: 'Quiz not found' } }, 404)
      }
      return json({}, 404)
    }),
  )
}

const renderAt = (path: string) =>
  render(
    <MemoryRouter initialEntries={[path]}>
      <App />
    </MemoryRouter>,
  )

beforeEach(() => {
  clearApiCache()
  resetAttemptsCache()
  mockApi()
})

describe('quiz flow', () => {
  it('browse → take quiz → results → progress, with no a11y violations', async () => {
    const user = userEvent.setup()
    const { container } = renderAt('/')

    await screen.findByRole('heading', { name: /test your knowledge/i })
    await user.click(await screen.findByRole('button', { name: /science/i }))
    await user.click(await screen.findByRole('link', { name: /start quiz: science basics/i }))

    await screen.findByRole('progressbar')
    expect((await axe(container)).violations).toEqual([])

    const quiz = data.quizzes.find((q) => q.id === 'science-basics')!
    for (let i = 0; i < quiz.questions.length; i++) {
      expect(screen.getByRole('progressbar')).toHaveAttribute(
        'aria-valuetext',
        `Question ${i + 1} of ${quiz.questions.length}`,
      )
      const legend = screen.getByRole('group')
      const q = quiz.questions.find((x) => legend.textContent!.includes(x.text))!
      // Answer the first question wrong on purpose, the rest correctly.
      const target =
        i === 0
          ? q.options.find((o) => o.id !== q.correctOptionId)!
          : q.options.find((o) => o.id === q.correctOptionId)!
      await user.click(screen.getByRole('radio', { name: target.text }))
      await user.click(screen.getByRole('button', { name: /check answer/i }))
      expect(screen.getByText(q.explanation)).toBeInTheDocument()
      expect(screen.getByText(i === 0 ? /✗ Incorrect/ : /✓ Correct!/)).toBeInTheDocument()
      await user.click(
        screen.getByRole('button', { name: i === quiz.questions.length - 1 ? /see results/i : /next question/i }),
      )
    }

    await screen.findByText('4 / 5')
    expect(screen.getByText('80%')).toBeInTheDocument()
    expect(screen.getByText(/Excellent/)).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /show incorrect questions \(1\)/i })).toBeInTheDocument()
    expect(screen.getByRole('link', { name: /retake quiz/i })).toBeInTheDocument()

    await user.click(within(screen.getByRole('navigation')).getByRole('link', { name: /my progress/i }))
    const table = await screen.findByRole('table')
    expect(within(table).getByText('4/5')).toBeInTheDocument()
    expect(screen.getByRole('img', { name: /line chart/i })).toBeInTheDocument()
  })

  it('shows empty state on progress page and not-found for unknown quiz/attempt', async () => {
    const view = renderAt('/progress')
    await screen.findByText(/no attempts yet/i)
    expect((await axe(view.container)).violations).toEqual([])
    view.unmount()

    renderAt('/quiz/does-not-exist')
    await screen.findByRole('heading', { name: /quiz not found/i })
  })

  it('shows results-not-found for an unknown attempt', async () => {
    renderAt('/results/missing')
    await screen.findByRole('heading', { name: /results not found/i })
  })

  it('shows an error with retry when the API fails', async () => {
    vi.stubGlobal('fetch', vi.fn().mockRejectedValue(new TypeError('offline')))
    const user = userEvent.setup()
    renderAt('/')
    await screen.findByRole('alert')
    mockApi()
    await user.click(screen.getByRole('button', { name: /try again/i }))
    await waitFor(() => expect(screen.getByRole('button', { name: /science/i })).toBeInTheDocument())
  })
})

describe('skipping questions', () => {
  it('records skipped questions and filters the review', async () => {
    const user = userEvent.setup()
    renderAt('/quiz/science-basics')
    await screen.findByRole('progressbar')
    const quiz = data.quizzes.find((q) => q.id === 'science-basics')!
    const n = quiz.questions.length

    for (let i = 0; i < n; i++) {
      const q = quiz.questions.find((x) => screen.getByRole('group').textContent!.includes(x.text))!
      if (i === 0) {
        await user.click(screen.getByRole('button', { name: /skip question/i }))
        continue
      }
      const wrong = i === 1
      const target = q.options.find((o) => (o.id === q.correctOptionId) !== wrong)!
      await user.click(screen.getByRole('radio', { name: target.text }))
      await user.click(screen.getByRole('button', { name: /check answer/i }))
      await user.click(
        screen.getByRole('button', { name: i === n - 1 ? /finish quiz/i : /next question/i }),
      )
    }

    await screen.findByText(`${n - 2} / ${n}`)
    expect(screen.getByText(`${n - 2} correct · 1 incorrect · 1 skipped`)).toBeInTheDocument()
    const review = screen.getByRole('region', { name: /review your answers/i })
    expect(within(review).getAllByRole('listitem')).toHaveLength(n)

    await user.click(screen.getByRole('button', { name: /show missed questions \(1\)/i }))
    expect(within(review).getAllByRole('listitem')).toHaveLength(1)
    expect(within(review).getByText(/you skipped this question/i)).toBeInTheDocument()

    await user.click(screen.getByRole('button', { name: /show incorrect questions \(1\)/i }))
    expect(within(review).getAllByRole('listitem')).toHaveLength(1)
    expect(within(review).queryByText(/you skipped/i)).not.toBeInTheDocument()
  })
})

describe('going back to skipped questions', () => {
  it('lets the user answer a skipped question later', async () => {
    const user = userEvent.setup()
    renderAt('/quiz/science-basics')
    await screen.findByRole('progressbar')
    const quiz = data.quizzes.find((q) => q.id === 'science-basics')!
    const n = quiz.questions.length
    const current = () =>
      quiz.questions.find((x) => screen.getByRole('group').textContent!.includes(x.text))!
    const answer = async (q: (typeof quiz.questions)[number]) => {
      await user.click(screen.getByRole('radio', { name: q.options.find((o) => o.id === q.correctOptionId)!.text }))
      await user.click(screen.getByRole('button', { name: /check answer/i }))
    }

    const skippedText = current().text
    await user.click(screen.getByRole('button', { name: /skip question/i }))
    expect(screen.getByRole('navigation', { name: /skipped questions/i })).toBeInTheDocument()

    for (let i = 1; i < n; i++) {
      await answer(current())
      if (i < n - 1) await user.click(screen.getByRole('button', { name: /next question/i }))
    }
    // Everything else is answered; go back to the skipped one via the strip.
    await user.click(screen.getByRole('button', { name: /^question \d+$/i }))
    expect(screen.getByRole('group')).toHaveTextContent(skippedText)
    expect(screen.getByText(/you skipped this question earlier/i)).toBeInTheDocument()
    expect(screen.queryByRole('button', { name: /skip question/i })).not.toBeInTheDocument()
    await answer(current())
    await user.click(screen.getByRole('button', { name: /see results/i }))

    await screen.findByText(`${n} / ${n}`)
    expect(screen.getByText('100%')).toBeInTheDocument()
    expect(screen.getByText(`${n} correct · 0 incorrect · 0 skipped`)).toBeInTheDocument()
  })

  it('allows finishing with a question still skipped', async () => {
    const user = userEvent.setup()
    renderAt('/quiz/science-basics')
    await screen.findByRole('progressbar')
    const n = data.quizzes.find((q) => q.id === 'science-basics')!.questions.length
    for (let i = 0; i < n; i++) await user.click(screen.getByRole('button', { name: /skip question/i }))
    await user.click(screen.getByRole('button', { name: /finish quiz/i }))
    await screen.findByText(`0 / ${n}`)
    await user.click(screen.getByRole('button', { name: new RegExp(`show missed questions \\(${n}\\)`, 'i') }))
    expect(screen.getAllByText(/you skipped this question/i)).toHaveLength(n)
  })
})

describe('conditional requests', () => {
  it('recovers when the browser surfaces a 304', async () => {
    const real = globalThis.fetch
    mockApi()
    const inner = globalThis.fetch as unknown as (u: string, i?: RequestInit) => Promise<Response>
    vi.stubGlobal(
      'fetch',
      vi.fn(async (u: string, init?: RequestInit) =>
        init?.cache === 'reload' ? inner(u, init) : new Response(null, { status: 304 }),
      ),
    )
    renderAt('/')
    await screen.findByRole('button', { name: /science/i })
    globalThis.fetch = real
  })
})
