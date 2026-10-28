export function performanceMessage(pct: number): string {
  if (pct >= 100) return 'Perfect score! Flawless work.'
  if (pct >= 80) return 'Excellent! You really know your stuff.'
  if (pct >= 60) return 'Good job! A little more practice and you’ll ace it.'
  if (pct >= 40) return 'Keep practicing — you’re getting there.'
  return 'Don’t give up! Review the questions below and try again.'
}
