import { memo } from 'react'
import type { Category } from '../types/quiz'

interface Props {
  category: Category
  selected: boolean
  onSelect: (id: string) => void
}

export const CategoryCard = memo(function CategoryCard({ category, selected, onSelect }: Props) {
  return (
    <button
      type="button"
      className={`card category-card${selected ? ' selected' : ''}`}
      aria-pressed={selected}
      onClick={() => onSelect(category.id)}
    >
      <span className="category-icon" aria-hidden="true">
        {category.icon}
      </span>
      <span className="category-name">{category.name}</span>
      <span className="muted">{category.description}</span>
      <span className="muted small">
        {category.quizCount} {category.quizCount === 1 ? 'quiz' : 'quizzes'} ·{' '}
        {category.questionCount} questions
      </span>
    </button>
  )
})
