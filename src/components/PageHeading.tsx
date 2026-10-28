import { useEffect, useRef, type ReactNode } from 'react'

interface Props {
  children: ReactNode
  /** Plain-text document title. */
  title: string
}

/** h1 that sets the document title and receives focus on mount (route change). */
export function PageHeading({ children, title }: Props) {
  const ref = useRef<HTMLHeadingElement>(null)
  useEffect(() => {
    document.title = `${title} · QuizApp`
    ref.current?.focus({ preventScroll: false })
  }, [title])
  return (
    <h1 ref={ref} tabIndex={-1} className="page-heading">
      {children}
    </h1>
  )
}
