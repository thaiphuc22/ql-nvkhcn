import { useCallback, useMemo, useState, type ReactNode } from 'react'
import PageHeader from '../../../components/ui/PageHeader'
import DashboardFilterBar from './DashboardFilterBar'
import { DashboardGate } from './DashboardStates'
import { useDashboardFilter } from './useDashboardFilter'
import type { DashboardFilter } from '../models/dashboard.models'

interface DashboardPageShellProps {
  title: string
  breadcrumbLabel: string
  loading: boolean
  error: boolean
  empty: boolean
  onRetry: () => void
  onExport?: () => void
  onApply: () => void
  children: ReactNode
}

export default function DashboardPageShell({
  title, breadcrumbLabel, loading, error, empty, onRetry, onExport, onApply, children,
}: DashboardPageShellProps) {
  const { draft, setDraft, applyPreset, reset } = useDashboardFilter()

  return (
    <>
      <PageHeader title={title} breadcrumb={[{ label: 'Dashboard' }, { label: breadcrumbLabel }]} />
      <DashboardFilterBar
        draft={draft}
        onChange={setDraft}
        onPreset={applyPreset}
        onApply={onApply}
        onReset={reset}
        onExport={onExport}
      />
      <DashboardGate loading={loading} error={error} empty={empty} onRetry={onRetry}>
        {children}
      </DashboardGate>
    </>
  )
}

export function useDashboardPageTrigger() {
  const { toFilter, draft, setDraft, applyPreset, reset } = useDashboardFilter()
  const [filterKey, setFilterKey] = useState(0)
  const baseFilter = toFilter()
  const filter = useMemo((): DashboardFilter => baseFilter, [
    baseFilter.fromDate,
    baseFilter.toDate,
    baseFilter.planYear,
    JSON.stringify(baseFilter.organizationIds ?? []),
    JSON.stringify(baseFilter.managementLevels ?? []),
    JSON.stringify(baseFilter.missionTypes ?? []),
    JSON.stringify(baseFilter.scienceFields ?? []),
    JSON.stringify(baseFilter.statuses ?? []),
    JSON.stringify(baseFilter.processCodes ?? []),
  ])
  const apply = useCallback(() => setFilterKey((k) => k + 1), [])
  return { filter, filterKey, apply, draft, setDraft, applyPreset, reset }
}
