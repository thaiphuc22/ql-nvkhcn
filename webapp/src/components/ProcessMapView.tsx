import { Badge, Typography } from 'antd'
import {
  LIFECYCLE_STAGES,
  RD_GROUPS,
  groupsForStage,
  type RdGroupMeta,
} from '../data/processLifecycle'

const { Text, Paragraph } = Typography

export interface ProcessMapItemStats {
  /** Số mục gắn nhóm (quy trình / user / module…) */
  count: number
  /** Instance / việc đang chạy (tuỳ chọn) */
  running?: number
  statusHint?: string
}

export interface ProcessMapViewProps {
  /** Stats theo mã RD (RD01…RD10). Thiếu = 0. */
  statsByRd?: Record<string, ProcessMapItemStats>
  onSelectGroup?: (group: RdGroupMeta) => void
  /** Nhãn phụ dưới tiêu đề */
  subtitle?: string
  /** Highlight nhóm đang lọc */
  activeRd?: string
}

/**
 * Process Map View — 5 giai đoạn vòng đời × 10 nhóm RD (dataflow tổng thể).
 */
export default function ProcessMapView({
  statsByRd = {},
  onSelectGroup,
  subtitle,
  activeRd,
}: ProcessMapViewProps) {
  return (
    <div>
      <div style={{ marginBottom: 16 }}>
        <Text strong style={{ fontSize: 15 }}>
          Sơ đồ tiến trình · 10 nhóm nghiệp vụ
        </Text>
        <Paragraph type="secondary" style={{ margin: '4px 0 0', fontSize: 13 }}>
          {subtitle ??
            'Luồng dữ liệu theo vòng đời dự án: Đề xuất → Tuyển chọn → Thực hiện → Nghiệm thu → Chuyển giao.'}
        </Paragraph>
      </div>

      {/* Timeline header */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: `repeat(${LIFECYCLE_STAGES.length}, minmax(140px, 1fr))`,
          gap: 8,
          marginBottom: 10,
          overflowX: 'auto',
        }}
      >
        {LIFECYCLE_STAGES.map((stage, idx) => (
          <div key={stage.id} style={{ minWidth: 140 }}>
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: 6,
                marginBottom: 4,
              }}
            >
              <span
                style={{
                  width: 22,
                  height: 22,
                  borderRadius: '50%',
                  background: stage.color,
                  color: '#fff',
                  fontSize: 11,
                  fontWeight: 700,
                  display: 'grid',
                  placeItems: 'center',
                  flexShrink: 0,
                }}
              >
                {idx + 1}
              </span>
              <Text strong style={{ fontSize: 13, color: stage.color }}>
                {stage.label}
              </Text>
            </div>
            <Text type="secondary" style={{ fontSize: 11, display: 'block', lineHeight: 1.3 }}>
              {stage.description}
            </Text>
            {idx < LIFECYCLE_STAGES.length - 1 && (
              <div
                aria-hidden
                style={{
                  height: 2,
                  marginTop: 10,
                  background: `linear-gradient(90deg, ${stage.color}, ${LIFECYCLE_STAGES[idx + 1].color})`,
                  borderRadius: 1,
                  opacity: 0.45,
                }}
              />
            )}
          </div>
        ))}
      </div>

      {/* Swimlanes */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: `repeat(${LIFECYCLE_STAGES.length}, minmax(140px, 1fr))`,
          gap: 8,
          overflowX: 'auto',
          paddingBottom: 8,
        }}
      >
        {LIFECYCLE_STAGES.map((stage) => {
          const groups = groupsForStage(stage.id)
          return (
            <div
              key={stage.id}
              style={{
                minWidth: 140,
                background: `${stage.color}08`,
                border: `1px solid ${stage.color}22`,
                borderRadius: 10,
                padding: 10,
                display: 'flex',
                flexDirection: 'column',
                gap: 8,
                minHeight: 180,
              }}
            >
              {groups.map((g) => {
                const st = statsByRd[g.code] ?? { count: 0 }
                const isActive = activeRd === g.code
                const clickable = !!onSelectGroup
                return (
                  <div
                    key={g.code}
                    role={clickable ? 'button' : undefined}
                    tabIndex={clickable ? 0 : undefined}
                    onClick={() => onSelectGroup?.(g)}
                    onKeyDown={(e) => {
                      if (!clickable) return
                      if (e.key === 'Enter' || e.key === ' ') {
                        e.preventDefault()
                        onSelectGroup?.(g)
                      }
                    }}
                    style={{
                      background: '#fff',
                      borderRadius: 8,
                      border: isActive
                        ? `2px solid ${stage.color}`
                        : '1px solid var(--vht-border, #e8e8e8)',
                      padding: '10px 12px',
                      cursor: clickable ? 'pointer' : 'default',
                      boxShadow: isActive
                        ? `0 0 0 3px ${stage.color}22`
                        : '0 1px 2px rgba(0,0,0,0.04)',
                      transition: 'border-color 0.15s, box-shadow 0.15s',
                    }}
                    onMouseEnter={(e) => {
                      if (!clickable || isActive) return
                      ;(e.currentTarget as HTMLElement).style.borderColor = stage.color
                    }}
                    onMouseLeave={(e) => {
                      if (isActive) return
                      ;(e.currentTarget as HTMLElement).style.borderColor =
                        'var(--vht-border, #e8e8e8)'
                    }}
                  >
                    <div
                      style={{
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center',
                        marginBottom: 4,
                        gap: 6,
                      }}
                    >
                      <Text code style={{ fontSize: 12, fontWeight: 700 }}>
                        {g.code}
                      </Text>
                      <Badge
                        count={st.count}
                        showZero
                        overflowCount={99}
                        style={{
                          backgroundColor: st.count > 0 ? stage.color : '#d9d9d9',
                          fontSize: 11,
                        }}
                      />
                    </div>
                    <Text
                      style={{
                        fontSize: 12,
                        fontWeight: 600,
                        display: 'block',
                        lineHeight: 1.35,
                        marginBottom: 4,
                      }}
                    >
                      {g.name}
                    </Text>
                    <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap', alignItems: 'center' }}>
                      <span
                        style={{
                          fontSize: 10,
                          fontWeight: 600,
                          padding: '1px 6px',
                          borderRadius: 4,
                          background: g.phase === 1 ? '#e6f4ff' : '#fff7e6',
                          color: g.phase === 1 ? '#0958d9' : '#d46b08',
                        }}
                      >
                        Pha {g.phase}
                      </span>
                      {st.running != null && st.running > 0 && (
                        <Text type="secondary" style={{ fontSize: 11 }}>
                          {st.running} đang chạy
                        </Text>
                      )}
                      {st.statusHint && (
                        <Text type="secondary" style={{ fontSize: 11 }}>
                          {st.statusHint}
                        </Text>
                      )}
                    </div>
                  </div>
                )
              })}
            </div>
          )
        })}
      </div>

      <Text type="secondary" style={{ fontSize: 11 }}>
        {RD_GROUPS.length} nhóm · {LIFECYCLE_STAGES.length} giai đoạn vòng đời
      </Text>
    </div>
  )
}
