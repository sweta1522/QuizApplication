import { fetchCategories, fetchQuiz, fetchQuizzes } from '../api/client'
import { useFetch } from './useFetch'

export const useCategories = () => useFetch((s) => fetchCategories(s), 'categories')

export const useQuizzes = (categoryId: string | null) =>
  useFetch((s) => fetchQuizzes(categoryId!, s), categoryId && `quizzes:${categoryId}`)

export const useQuiz = (quizId: string | undefined) =>
  useFetch((s) => fetchQuiz(quizId!, s), quizId ? `quiz:${quizId}` : null)
