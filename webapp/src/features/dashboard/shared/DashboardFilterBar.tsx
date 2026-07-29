import { Button, Col, DatePicker, Row, Select, Space, Typography } from 'antd'
import dayjs from 'dayjs'
import { FILTER_OPTIONS } from '../mocks/dashboard.mock-data'
import type { DashboardFilterState, TimePreset } from './useDashboardFilter'

const { RangePicker } = DatePicker
const { Text } = Typography

const TIME_PRESETS: { label: string; value: TimePreset }[] = [
  { label: 'Hôm nay', value: 'today' },
  { label: '7 ngày', value: '7d' },
  { label: '30 ngày', value: '30d' },
  { label: 'Quý này', value: 'quarter' },
  { label: 'Năm này', value: 'year' },
]

interface DashboardFilterBarProps {
  draft: DashboardFilterState
  onChange: (patch: Partial<DashboardFilterState>) => void
  onPreset: (preset: TimePreset) => void
  onApply: () => void
  onReset: () => void
  onExport?: () => void
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div>
      <Text type="secondary" style={{ fontSize: 12, display: 'block', marginBottom: 4 }}>{label}</Text>
      {children}
    </div>
  )
}

export default function DashboardFilterBar({ draft, onChange, onPreset, onApply, onReset, onExport }: DashboardFilterBarProps) {
  return (
    <div style={{ marginBottom: 16, padding: 16, background: '#fff', borderRadius: 8, border: '1px solid #f0f0f0' }}>
      <Space wrap size={[8, 8]} style={{ marginBottom: 12 }}>
        {TIME_PRESETS.map((p) => (
          <Button key={p.value} size="small" type={draft.timePreset === p.value ? 'primary' : 'default'} onClick={() => onPreset(p.value)}>
            {p.label}
          </Button>
        ))}
      </Space>
      <Row gutter={[12, 12]}>
        <Col xs={24} md={8} lg={6}>
          <Field label="Khoảng ngày">
            <RangePicker
              style={{ width: '100%' }}
              value={[draft.fromDate ? dayjs(draft.fromDate) : null, draft.toDate ? dayjs(draft.toDate) : null]}
              format="DD/MM/YYYY"
              onChange={(v) => onChange({ fromDate: v?.[0]?.format('YYYY-MM-DD'), toDate: v?.[1]?.format('YYYY-MM-DD'), timePreset: 'custom' })}
            />
          </Field>
        </Col>
        <Col xs={12} md={4} lg={3}>
          <Field label="Năm kế hoạch">
            <Select style={{ width: '100%' }} value={draft.planYear}
              options={FILTER_OPTIONS.planYears.map((y) => ({ label: String(y), value: y }))}
              onChange={(planYear) => onChange({ planYear })} />
          </Field>
        </Col>
        <Col xs={12} md={6} lg={5}>
          <Field label="Đơn vị chủ trì">
            <Select mode="multiple" allowClear maxTagCount={1} style={{ width: '100%' }} placeholder="Tất cả"
              value={draft.organizationIds}
              options={FILTER_OPTIONS.organizations.map((o) => ({ label: o.name, value: o.id }))}
              onChange={(organizationIds) => onChange({ organizationIds })} />
          </Field>
        </Col>
        <Col xs={12} md={6} lg={5}>
          <Field label="Cấp quản lý">
            <Select mode="multiple" allowClear maxTagCount={1} style={{ width: '100%' }} placeholder="Tất cả"
              value={draft.managementLevels}
              options={FILTER_OPTIONS.managementLevels.filter((m) => m !== 'Tất cả').map((m) => ({ label: m, value: m }))}
              onChange={(managementLevels) => onChange({ managementLevels })} />
          </Field>
        </Col>
        <Col xs={12} md={6} lg={5}>
          <Field label="Loại nhiệm vụ">
            <Select mode="multiple" allowClear maxTagCount={1} style={{ width: '100%' }} placeholder="Tất cả"
              value={draft.missionTypes}
              options={FILTER_OPTIONS.missionTypes.map((m) => ({ label: m, value: m }))}
              onChange={(missionTypes) => onChange({ missionTypes })} />
          </Field>
        </Col>
        <Col xs={12} md={6} lg={5}>
          <Field label="Lĩnh vực KHCN">
            <Select mode="multiple" allowClear maxTagCount={1} style={{ width: '100%' }} placeholder="Tất cả"
              value={draft.scienceFields}
              options={FILTER_OPTIONS.scienceFields.map((f) => ({ label: f, value: f }))}
              onChange={(scienceFields) => onChange({ scienceFields })} />
          </Field>
        </Col>
        <Col xs={12} md={6} lg={5}>
          <Field label="Trạng thái">
            <Select mode="multiple" allowClear maxTagCount={1} style={{ width: '100%' }} placeholder="Tất cả"
              value={draft.statuses}
              options={FILTER_OPTIONS.statuses.map((s) => ({ label: s, value: s }))}
              onChange={(statuses) => onChange({ statuses })} />
          </Field>
        </Col>
        <Col xs={12} md={6} lg={5}>
          <Field label="Quy trình">
            <Select mode="multiple" allowClear maxTagCount={2} style={{ width: '100%' }} placeholder="Tất cả"
              value={draft.processCodes}
              options={FILTER_OPTIONS.processCodes.map((c) => ({ label: c, value: c }))}
              onChange={(processCodes) => onChange({ processCodes })} />
          </Field>
        </Col>
        <Col xs={24} md={12} lg={9} style={{ display: 'flex', alignItems: 'flex-end' }}>
          <Space>
            <Button type="primary" onClick={onApply}>Áp dụng</Button>
            <Button onClick={onReset}>Đặt lại</Button>
            {onExport && <Button onClick={onExport}>Xuất báo cáo</Button>}
          </Space>
        </Col>
      </Row>
    </div>
  )
}
