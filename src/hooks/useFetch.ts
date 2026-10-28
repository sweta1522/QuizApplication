import { useCallback, useEffect, useState } from 'react'
import { clearApiCache } from '../api/client'

interface State<T> {
  data: T | null
  error: Error | null
  loading: boolean
}

/** Runs `fetcher` whenever `key` changes; aborts on unmount/key change. */
export function useFetch<T>(
  fetcher: (signal: AbortSignal) => Promise<T>,
  key: string | null,
) {
  const [state, setState] = useState<State<T> & { key: string | null }>({
    data: null,
    error: null,
    loading: key !== null,
    key,
  })
  const [attempt, setAttempt] = useState(0)

  // Reset synchronously when the key changes to avoid showing stale data.
  if (state.key !== key) {
    setState({ data: null, error: null, loading: key !== null, key })
  }

  useEffect(() => {
    if (key === null) return
    const controller = new AbortController()
    fetcher(controller.signal)
      .then((data) => setState({ data, error: null, loading: false, key }))
      .catch((error: unknown) => {
        if (controller.signal.aborted) return
        setState({
          data: null,
          error: error instanceof Error ? error : new Error('Unknown error'),
          loading: false,
          key,
        })
      })
    return () => controller.abort()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [key, attempt])

  const retry = useCallback(() => {
    clearApiCache()
    setState((s) => ({ ...s, loading: true, error: null }))
    setAttempt((n) => n + 1)
  }, [])

  return { data: state.data, error: state.error, loading: state.loading, retry }
}
