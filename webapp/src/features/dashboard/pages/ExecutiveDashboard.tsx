import { useCallback } from 'react'
import { useNavigate } from 'react-router-dom'
import { Col, Row, Card } from 'antd'
import { Bar, BarChart, CartesianGrid, Legend, Line, LineChart, Tooltip as RTooltip, XAxis, YAxis, Cell } from 'recharts'
import { createDashboardService } from '../services/dashboard-mock.service'
import DashboardPageShell, { useDashboardPageTrigger } from '../shared/DashboardPageShell'
import KpiCard from '../shared/KpiCard'
import ChartCard from '../shared/ChartCard'
import AlertTable from '../shared/AlertTable'
import { useDashboardQuery } from '../shared/useDashboardQuery'
import { exportCsv } from '../shared/exportCsv'
import { MISSIONS, STATUSES, ORGANIZATIONS } from '../mocks/dashboard.mock-data'
import { RED, SUCCESS, WARNING, DANGER } from '../../../theme'

const svc = createDashboardService()

/** Thang màu số lượng (xanh dương) — không dùng đỏ để tránh hiểu nhầm là cảnh báo. */
function heatColor(value: number, max: number): string {
  if (max <= 0 || value <= 0) return '#f5f5f5'
  const t = Math.min(1, value / max)
  if (t < 0.34) return '#e6f4ff'
  if (t < 0.67) return '#91caff'
  return '#1677ff'
}

export default function ExecutiveDashboard() {
  const navigate = useNavigate()
  const { filter, filterKey, apply } = useDashboardPageTrigger()
  const fetcher = useCallback((f: typeof filter) => svc.getExecutiveSummary(f), [])
  const { loading, error, data, empty, retry } = useDashboardQuery({ fetcher, filter, reloadToken: filterKey })

  const missionId = (code: string) => MISSIONS.find((m) => m.code === code)?.id ?? code
  const statusCols = STATUSES.slice(0, 4)
  const maxHeat = data ? Math.max(1, ...data.heatmap.map((h) => h.value)) : 1

  return (
    <DashboardPageShell
      title="Tổng quan điều hành KHCN"
      breadcrumbLabel="Tổng quan điều hành"
      loading={loading} error={error} empty={empty} onRetry={retry}
      onApply={apply}
      onExport={() => data && exportCsv('canh-bao.csv', ['Mã', 'Tên', 'Loại'], data.alerts.map((a) => [a.missionCode, a.missionName, a.category]))}
    >
      {data && (
        <>
          <Row gutter={[12, 12]} style={{ marginBottom: 16 }}>
            {data.kpis.map((k) => (
              <Col xs={24} sm={12} lg={8} xl={4} key={k.id}>
                <KpiCard
                  metric={k}
                  onClick={() => k.filterKey && navigate(`/dashboard/danh-muc-nhiem-vu?statuses=${encodeURIComponent(
                    k.id === 'onTrack' ? 'Đúng tiến độ' :
                    k.id === 'atRisk' ? 'Có nguy cơ chậm' :
                    k.id === 'overdue' ? 'Quá hạn' :
                    k.id === 'pending' ? 'Chờ phê duyệt' : '',
                  )}`)}
                />
              </Col>
            ))}
          </Row>

          <Row gutter={[12, 12]} style={{ marginBottom: 16 }}>
            <Col xs={24} lg={8}>
              <ChartCard title="Vòng đời nhiệm vụ" tooltip="Số nhiệm vụ theo giai đoạn vòng đời" height={320}>
                <BarChart
                  data={data.lifecycle.map((l) => ({ label: l.label, value: l.count }))}
                  layout="vertical"
                  margin={{ top: 8, left: 4, right: 24, bottom: 8 }}
                >
                  <CartesianGrid strokeDasharray="3 3" horizontal={false} />
                  <XAxis type="number" allowDecimals={false} />
                  <YAxis type="category" dataKey="label" width={150} tick={{ fontSize: 11 }} interval={0} />
                  <RTooltip formatter={(v: number) => [`${v} nhiệm vụ`, 'Số lượng']} />
                  <Bar dataKey="value" name="Số NV" fill={RED} radius={[0, 4, 4, 0]} barSize={16} />
                </BarChart>
              </ChartCard>
            </Col>
            <Col xs={24} lg={8}>
              <ChartCard title="Phát sinh & hoàn thành theo tháng" height={320}>
                <LineChart data={data.monthly} margin={{ top: 8, left: 0, right: 12, bottom: 8 }}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="month" />
                  <YAxis allowDecimals={false} />
                  <RTooltip />
                  <Legend />
                  <Line type="monotone" dataKey="started" name="Phát sinh" stroke={RED} strokeWidth={2} dot={{ r: 3 }} />
                  <Line type="monotone" dataKey="completed" name="Hoàn thành" stroke={SUCCESS} strokeWidth={2} dot={{ r: 3 }} />
                </LineChart>
              </ChartCard>
            </Col>
            <Col xs={24} lg={8}>
              <ChartCard title="Cơ cấu theo cấp quản lý" height={300}>
                <BarChart data={data.byLevel} margin={{ left: 0, right: 8 }}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="label" />
                  <YAxis allowDecimals={false} />
                  <RTooltip />
                  <Bar dataKey="value" name="Số NV" radius={[4, 4, 0, 0]}>
                    {data.byLevel.map((_, i) => (
                      <Cell key={i} fill={i === 0 ? RED : '#bf0027'} />
                    ))}
                  </Bar>
                </BarChart>
              </ChartCard>
            </Col>
          </Row>

          <Row gutter={[12, 12]} style={{ marginBottom: 16 }}>
            <Col xs={24} lg={10}>
              <Card size="small" title="Heatmap — Đơn vị × Trạng thái">
                <div style={{ overflowX: 'auto' }}>
                  <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 12 }}>
                    <thead>
                      <tr>
                        <th style={{ textAlign: 'left', padding: 8 }}>Đơn vị</th>
                        {statusCols.map((s) => (
                          <th key={s} style={{ padding: 8, textAlign: 'center' }}>{s}</th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {ORGANIZATIONS.map((org) => (
                        <tr key={org.id}>
                          <td style={{ padding: 8, maxWidth: 180 }}>{org.name}</td>
                          {statusCols.map((st) => {
                            const cell = data.heatmap.find((h) => h.row === org.name && h.col === st)
                            const v = cell?.value ?? 0
                            return (
                              <td key={st} style={{ padding: 4, textAlign: 'center' }}>
                                <div style={{
                                  background: heatColor(v, maxHeat),
                                  color: v / maxHeat > 0.6 ? '#fff' : '#1c1c1c',
                                  borderRadius: 6,
                                  padding: '10px 4px',
                                  fontWeight: 600,
                                }}>
                                  {v}
                                </div>
                              </td>
                            )
                          })}
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </Card>
            </Col>
            <Col xs={24} lg={7}>
              <ChartCard title="Top NV rủi ro cao" tooltip="10 nhiệm vụ có mức rủi ro cao nhất" height={280}>
                <BarChart data={data.topRisk.slice(0, 10).map((m) => ({
                  label: m.code,
                  value: m.riskLevel === 'Cao' ? 3 : m.riskLevel === 'Trung bình' ? 2 : 1,
                  name: m.name,
                }))} margin={{ bottom: 24 }}>
                  <XAxis dataKey="label" tick={{ fontSize: 10 }} interval={0} angle={-30} textAnchor="end" height={50} />
                  <YAxis hide />
                  <RTooltip formatter={(v: number) => [v === 3 ? 'Cao' : v === 2 ? 'Trung bình' : 'Thấp', 'Rủi ro']} labelFormatter={(l) => {
                    const m = data.topRisk.find((x) => x.code === l)
                    return m?.name ?? l
                  }} />
                  <Bar dataKey="value" fill={DANGER} radius={[4, 4, 0, 0]} />
                </BarChart>
              </ChartCard>
            </Col>
            <Col xs={24} lg={7}>
              <ChartCard title="Top bước xử lý chậm" tooltip="Thời gian xử lý trung bình (ngày)" height={280}>
                <BarChart data={data.slowSteps} layout="vertical" margin={{ left: 4, right: 12 }}>
                  <XAxis type="number" unit=" ngày" />
                  <YAxis type="category" dataKey="label" width={130} tick={{ fontSize: 10 }} />
                  <RTooltip formatter={(v: number) => [`${v} ngày`, 'Thời gian TB']} />
                  <Bar dataKey="value" fill={WARNING} radius={[0, 4, 4, 0]} />
                </BarChart>
              </ChartCard>
            </Col>
          </Row>

          <Card size="small" title="Bảng cảnh báo cần xử lý">
            <AlertTable alerts={data.alerts} onViewMission={(code) => navigate(`/dashboard/nhiem-vu/${missionId(code)}`)} />
          </Card>
        </>
      )}
    </DashboardPageShell>
  )
}
