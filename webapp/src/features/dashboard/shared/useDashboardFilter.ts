import { useCallback, useMemo } from 'react'
import { useSearchParams } from 'react-router-dom'
import type { DashboardFilter } from '../models/dashboard.models'
import dayjs from 'dayjs'

export type TimePreset = 'today' | '7d' | '30d' | 'quarter' | 'year' | 'custom'

export interface DashboardFilterState extends DashboardFilter {
  timePreset?: TimePreset
}

const PRESET_KEYS: TimePreset[] = ['today', '7d', '30d', 'quarter', 'year', 'custom']

function parseArray(v: string | null): string[] | undefined {
  if (!v) return undefined
  const arr = v.split(',').filter(Boolean)
  return arr.length ? arr : undefined
}

function serializeArray(arr?: string[]): string | undefined {
  return arr?.length ? arr.join(',') : undefined
}

export function defaultFilterState(): DashboardFilterState {
  const now = dayjs()
  return {
    timePreset: '30d',
    fromDate: now.subtract(30, 'day').format('YYYY-MM-DD'),
    toDate: now.format('YYYY-MM-DD'),
    planYear: now.year(),
  }
}

export function applyTimePreset(preset: TimePreset): Pick<DashboardFilterState, 'fromDate' | 'toDate' | 'timePreset'> {
  const now = dayjs()
  switch (preset) {
    case 'today':
      return { timePreset: preset, fromDate: now.format('YYYY-MM-DD'), toDate: now.format('YYYY-MM-DD') }
    case '7d':
      return { timePreset: preset, fromDate: now.subtract(7, 'day').format('YYYY-MM-DD'), toDate: now.format('YYYY-MM-DD') }
    case '30d':
      return { timePreset: preset, fromDate: now.subtract(30, 'day').format('YYYY-MM-DD'), toDate: now.format('YYYY-MM-DD') }
    case 'quarter': {
      const qStart = now.startOf('month').subtract((now.month() % 3), 'month')
      return { timePreset: preset, fromDate: qStart.format('YYYY-MM-DD'), toDate: now.format('YYYY-MM-DD') }
    }
    case 'year':
      return { timePreset: preset, fromDate: now.startOf('year').format('YYYY-MM-DD'), toDate: now.format('YYYY-MM-DD') }
    default:
      return { timePreset: 'custom' }
  }
}

export function useDashboardFilter() {
  const [params, setParams] = useSearchParams()

  const draft = useMemo((): DashboardFilterState => {
    const preset = (params.get('timePreset') as TimePreset) || '30d'
    return {
      timePreset: PRESET_KEYS.includes(preset) ? preset : '30d',
      fromDate: params.get('fromDate') ?? defaultFilterState().fromDate,
      toDate: params.get('toDate') ?? defaultFilterState().toDate,
      planYear: params.get('planYear') ? Number(params.get('planYear')) : dayjs().year(),
      organizationIds: parseArray(params.get('organizationIds')),
      managementLevels: parseArray(params.get('managementLevels')),
      missionTypes: parseArray(params.get('missionTypes')),
      scienceFields: parseArray(params.get('scienceFields')),
      statuses: parseArray(params.get('statuses')),
      processCodes: parseArray(params.get('processCodes')),
    }
  }, [params])

  const applied = draft

  const setDraft = useCallback((patch: Partial<DashboardFilterState>) => {
    setParams((prev) => {
      const next = new URLSearchParams(prev)
      const merged = { ...draft, ...patch }
      if (merged.timePreset) next.set('timePreset', merged.timePreset)
      if (merged.fromDate) next.set('fromDate', merged.fromDate)
      if (merged.toDate) next.set('toDate', merged.toDate)
      if (merged.planYear) next.set('planYear', String(merged.planYear))
      const arrays: Array<[keyof DashboardFilter, string]> = [
        ['organizationIds', serializeArray(merged.organizationIds) ?? ''],
        ['managementLevels', serializeArray(merged.managementLevels) ?? ''],
        ['missionTypes', serializeArray(merged.missionTypes) ?? ''],
        ['scienceFields', serializeArray(merged.scienceFields) ?? ''],
        ['statuses', serializeArray(merged.statuses) ?? ''],
        ['processCodes', serializeArray(merged.processCodes) ?? ''],
      ]
      for (const [k, v] of arrays) {
        if (v) next.set(k, v)
        else next.delete(k)
      }
      return next
    }, { replace: true })
  }, [draft, setParams])

  const applyPreset = useCallback((preset: TimePreset) => {
    const dates = applyTimePreset(preset)
    setDraft(dates)
  }, [setDraft])

  const reset = useCallback(() => {
    setParams({}, { replace: true })
  }, [setParams])

  const toFilter = useCallback((): DashboardFilter => ({
    fromDate: applied.fromDate,
    toDate: applied.toDate,
    planYear: applied.planYear,
    organizationIds: applied.organizationIds,
    managementLevels: applied.managementLevels?.filter((x) => x !== 'Tất cả'),
    missionTypes: applied.missionTypes,
    scienceFields: applied.scienceFields,
    statuses: applied.statuses,
    processCodes: applied.processCodes,
  }), [applied])

  return { draft, applied, setDraft, applyPreset, reset, toFilter }
}
