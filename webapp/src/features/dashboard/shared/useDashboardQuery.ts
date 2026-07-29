import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import type { DashboardFilter } from '../models/dashboard.models'

interface UseDashboardQueryOptions<T> {
  fetcher: (filter: DashboardFilter) => Promise<T>
  filter: DashboardFilter
  reloadToken?: number
  isEmpty?: (data: T) => boolean
}

function filterSignature(filter: DashboardFilter): string {
  return JSON.stringify(filter)
}

export function useDashboardQuery<T>({ fetcher, filter, reloadToken = 0, isEmpty }: UseDashboardQueryOptions<T>) {
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(false)
  const [data, setData] = useState<T | null>(null)
  const filterRef = useRef(filter)
  filterRef.current = filter
  const signature = useMemo(() => filterSignature(filter), [filter])
  const fetcherRef = useRef(fetcher)
  fetcherRef.current = fetcher

  const load = useCallback(async () => {
    setLoading(true)
    setError(false)
    try {
      const result = await fetcherRef.current(filterRef.current)
      setData(result)
    } catch {
      setError(true)
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    let cancelled = false
    setLoading(true)
    setError(false)
    ;(async () => {
      try {
        const result = await fetcherRef.current(filterRef.current)
        if (!cancelled) setData(result)
      } catch {
        if (!cancelled) setError(true)
      } finally {
        if (!cancelled) setLoading(false)
      }
    })()
    return () => {
      cancelled = true
    }
  }, [signature, reloadToken])

  const empty = data !== null && (isEmpty ? isEmpty(data) : false)

  return { loading, error, data, empty, retry: load }
}
