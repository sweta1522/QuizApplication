# QuizApp

React + TypeScript (Vite) front end with a Node/Express mock API.

## Run locally

```
npm install
npm run dev:all     # web on http://localhost:5173, API on http://localhost:4000
```

Other scripts: `npm run dev` (web only), `npm run dev:server` (API only), `npm test`, `npm run build`, `npm run lint`.

## Mock API

| Endpoint | Description |
|---|---|
| `GET /api/categories` | Categories with quiz/question counts |
| `GET /api/categories/:id/quizzes` | Quiz summaries for a category |
| `GET /api/quizzes/:id` | Full quiz with questions, correct answer and explanation |
| `GET /api/health` | Health check |

Append `?delay=1000` or `?fail=1` to any `/api` call to simulate latency or a server error.

## Features

- Browse categories and start a quiz (≥5 questions each, shuffled order).
- Check each answer with explanation, or skip it and come back to skipped questions later; progress bar, resume after refresh, restart.
- Results with score, percentage, performance message, review with All / Incorrect / Missed (skipped) filters, retake.
- Attempt history and score-over-time chart persisted in `localStorage`.
- Accessible: keyboard operable, labelled landmarks, live feedback, focus management, reduced motion, AA contrast.
