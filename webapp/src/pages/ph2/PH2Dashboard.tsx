/**
 * PH2 Dashboard - Tong quan KHCN
 * Route: /phan-he/PH2/tong-quan
 *
 * Comprehensive real-time overview of KHCN mission execution status:
 * - KPI overview (total, active, completed, overdue)
 * - Summary by category (danh muc de tai)
 * - Summary by costs (chi phi de tai)
 * - Summary by personnel (nhan su)
 * - Summary by intellectual property (tai san tri tue)
 */
import { useState } from 'react'
import {
  Card,
  Col,
  Divider,
  Progress,
  Row,
  Segmented,
  Space,
  Statistic,
  Table,
  Tag,
  Typography,
  Button,
} from 'antd'
import type { ColumnsType } from 'antd/es/table'
import {
  FileTextOutlined,
  CheckCircleOutlined,
  ClockCircleOutlined,
  WarningOutlined,
  CloseCircleOutlined,
  ArrowUpOutlined,
  ArrowDownOutlined,
  TeamOutlined,
  DollarOutlined,
  TrophyOutlined,
  ReloadOutlined,
} from '@ant-design/icons'
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip as RTooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  LineChart,
  Line,
  Legend,
} from 'recharts'
import { PageHeader } from '../../components/ui'
import {
  KPI_HIENTAI,
  DELTA_KPI,
  DANH_MUC_DE_TAI,
  CHI_PHI_DE_TAI,
  TONG_CHI_PHI,
  NHAN_SU,
  TAI_SAN_TRI_TUE,
  GIAI_DOAN_TRENDS,
  GIAI_DOAN_COLORS,
  formatCurrency,
} from '../../data/ph2Dashboard'
import type { GiaiDoan } from '../../data/nhiemVu'

const { Text } = Typography

// Recharts colors
const PIE_COLORS = ['#1890ff', '#52c41a', '#faad14', '#ff4d4f', '#722ed1']

// ===== KPI Card =====
interface KpiCardProps {
  title: string
  value: number
  delta?: number
  deltaLabel?: string
  icon: React.ReactNode
  color: string
  suffix?: string
  precision?: number
}

function KpiCard({ title, value, delta, deltaLabel, icon, color, suffix, precision = 0 }: KpiCardProps) {
  const isPositive = delta !== undefined && delta > 0
  const isNegative = delta !== undefined && delta < 0
  const noChange = delta === 0

  return (
    <Card
      size="small"
      style={{
        borderRadius: 12,
        border: `1px solid ${color}25`,
      }}
      styles={{ body: { padding: '16px 20px' } }}
    >
      <Space direction="vertical" size={8} style={{ width: '100%' }}>
        <Space align="center" size={8}>
          <div
            style={{
              width: 36,
              height: 36,
              borderRadius: 8,
              background: `${color}15`,
              color: color,
              display: 'grid',
              placeItems: 'center',
              fontSize: 18,
            }}
          >
            {icon}
          </div>
          <Text type="secondary" style={{ fontSize: 13 }}>{title}</Text>
        </Space>
        <div style={{ display: 'flex', alignItems: 'baseline', gap: 8 }}>
          <Text strong style={{ fontSize: 28, color: '#262626', lineHeight: 1 }}>
            {precision > 0 ? value.toFixed(precision) : value}
          </Text>
          {suffix && <Text type="secondary" style={{ fontSize: 14 }}>{suffix}</Text>}
        </div>
        {delta !== undefined && (
          <Space size={4}>
            {noChange ? (
              <Text type="secondary" style={{ fontSize: 12 }}>Khong doi</Text>
            ) : (
              <>
                {isPositive && <ArrowUpOutlined style={{ color: '#52c41a', fontSize: 12 }} />}
                {isNegative && <ArrowDownOutlined style={{ color: '#ff4d4f', fontSize: 12 }} />}
                <Text style={{ color: isPositive ? '#52c41a' : '#ff4d4f', fontSize: 12 }}>
                  {isPositive ? '+' : ''}{delta}
                </Text>
                {deltaLabel && <Text type="secondary" style={{ fontSize: 12 }}>{deltaLabel}</Text>}
              </>
            )}
          </Space>
        )}
      </Space>
    </Card>
  )
}

// ===== ChiPhi Table =====
interface ChiPhiRow {
  donVi: string
  duToan: number
  daChi: number
  conLai: number
  tiLeGiaiNganPct: number
}

const chiPhiColumns: ColumnsType<ChiPhiRow> = [
  {
    title: 'Đơn vị',
    dataIndex: 'donVi',
    key: 'donVi',
    render: (v) => <Text>{v}</Text>,
  },
  {
    title: 'Dự toán',
    dataIndex: 'duToan',
    key: 'duToan',
    align: 'right',
    render: (v) => <Text>{formatCurrency(v)}</Text>,
  },
  {
    title: 'Đã chi',
    dataIndex: 'daChi',
    key: 'daChi',
    align: 'right',
    render: (v) => <Text style={{ color: '#52c41a' }}>{formatCurrency(v)}</Text>,
  },
  {
    title: 'Còn lại',
    dataIndex: 'conLai',
    key: 'conLai',
    align: 'right',
    render: (v) => <Text type="secondary">{formatCurrency(v)}</Text>,
  },
  {
    title: 'Tỷ lệ giải ngân',
    dataIndex: 'tiLeGiaiNganPct',
    key: 'tiLeGiaiNganPct',
    align: 'center',
    width: 130,
    render: (v) => (
      <Progress
        percent={v}
        size="small"
        strokeColor={v >= 80 ? '#52c41a' : v >= 60 ? '#faad14' : '#ff4d4f'}
        format={(p) => <Text style={{ fontSize: 11 }}>{p}%</Text>}
      />
    ),
  },
]

// ===== Main Component =====
export default function PH2Dashboard() {
  const [period, setPeriod] = useState<'month' | 'quarter'>('month')
  const [costView, setCostView] = useState<'bar' | 'table'>('table')

  // Chart data
  const danhMucChartData = DANH_MUC_DE_TAI.map((d) => ({
    name: d.label,
    fullName: d.label,
    soLuong: d.soLuong,
    thanhTich: d.thanhTich,
    value: d.soLuong,
  }))

  const chiPhiChartData = CHI_PHI_DE_TAI.map((d) => ({
    name: d.donVi.replace('TT Nghiên cứu ', ''),
    fullName: d.donVi,
    duToan: d.duToan,
    daChi: d.daChi,
    conLai: d.conLai,
  }))

  const nhanSuChartData = NHAN_SU.map((d, i) => ({
    name: d.vaiTro,
    value: d.soLuong,
    color: PIE_COLORS[i % PIE_COLORS.length],
  }))

  // Trend chart data
  const trendData = GIAI_DOAN_TRENDS.map((d) => ({
    ...d,
    name: d.thang,
  }))

  return (
    <div>
      <PageHeader
        icon={<FileTextOutlined style={{ fontSize: 26, color: '#ee0033' }} />}
        title="Tong quan nhiem vu KHCN"
        code="Ban coi toan dien tinh hinh thuc hien nhiem vu KHCN"
        extra={
          <Space>
            <Segmented
              value={period}
              onChange={(v) => setPeriod(v as 'month' | 'quarter')}
              options={[
                { label: 'Thang', value: 'month' },
                { label: 'Quy', value: 'quarter' },
              ]}
            />
            <Button icon={<ReloadOutlined />}>Lam moi</Button>
          </Space>
        }
      />

      {/* ===== KPI Row ===== */}
      <Row gutter={[12, 12]} style={{ marginBottom: 20 }}>
        <Col xs={12} sm={8} md={4}>
          <KpiCard
            title="Tong so de tai"
            value={KPI_HIENTAI.tongSoNhiemVu}
            delta={DELTA_KPI.tongSoNhiemVu}
            icon={<FileTextOutlined />}
            color="#1890ff"
          />
        </Col>
        <Col xs={12} sm={8} md={5}>
          <KpiCard
            title="Dang thuc hien"
            value={KPI_HIENTAI.dangThucHien}
            delta={DELTA_KPI.dangThucHien}
            icon={<ClockCircleOutlined />}
            color="#faad14"
          />
        </Col>
        <Col xs={12} sm={8} md={5}>
          <KpiCard
            title="Hoan thanh"
            value={KPI_HIENTAI.hoanThanh}
            delta={DELTA_KPI.hoanThanh}
            icon={<CheckCircleOutlined />}
            color="#52c41a"
          />
        </Col>
        <Col xs={12} sm={8} md={5}>
          <KpiCard
            title="Qua han"
            value={KPI_HIENTAI.quaHan}
            delta={DELTA_KPI.quaHan}
            icon={<WarningOutlined />}
            color="#ff4d4f"
          />
        </Col>
        <Col xs={12} sm={8} md={5}>
          <KpiCard
            title="Bi tu choi"
            value={KPI_HIENTAI.biTuChoi}
            delta={DELTA_KPI.biTuChoi}
            icon={<CloseCircleOutlined />}
            color="#722ed1"
          />
        </Col>
      </Row>

      {/* ===== Row 2: Performance metrics ===== */}
      <Row gutter={[12, 12]} style={{ marginBottom: 20 }}>
        <Col xs={24} md={12}>
          <Card
            size="small"
            title="Ty le hoan thanh"
            extra={<Text type="secondary">6 thang gan nhat</Text>}
            styles={{ body: { padding: '16px 20px' } }}
          >
            <Row gutter={16} align="middle">
              <Col xs={8}>
                <Statistic
                  title="Hoan thanh"
                  value={KPI_HIENTAI.tyLeHoanThanhPct}
                  suffix="%"
                  precision={1}
                  valueStyle={{ color: '#52c41a', fontSize: 32 }}
                  prefix={<CheckCircleOutlined />}
                />
              </Col>
              <Col xs={8}>
                <Statistic
                  title="Qua han"
                  value={KPI_HIENTAI.tyLeQuaHanPct}
                  suffix="%"
                  precision={1}
                  valueStyle={{ color: '#ff4d4f', fontSize: 32 }}
                  prefix={<WarningOutlined />}
                />
              </Col>
              <Col xs={8}>
                <Statistic
                  title="Dang xu ly"
                  value={100 - KPI_HIENTAI.tyLeHoanThanhPct - KPI_HIENTAI.tyLeQuaHanPct}
                  suffix="%"
                  precision={1}
                  valueStyle={{ color: '#faad14', fontSize: 32 }}
                  prefix={<ClockCircleOutlined />}
                />
              </Col>
            </Row>
          </Card>
        </Col>
        <Col xs={24} md={12}>
          <Card
            size="small"
            title="Xu huong giai doan"
            extra={<Text type="secondary">6 thang gan nhat</Text>}
            styles={{ body: { padding: '16px 20px' } }}
          >
            <ResponsiveContainer width="100%" height={120}>
              <LineChart data={trendData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                <XAxis dataKey="name" tick={{ fontSize: 11 }} />
                <YAxis tick={{ fontSize: 11 }} />
                <RTooltip />
                <Legend iconSize={8} iconType="line" />
                <Line type="monotone" dataKey="chuTruong" stroke={GIAI_DOAN_COLORS.chu_truong} strokeWidth={2} dot={false} name="Chu truong" />
                <Line type="monotone" dataKey="xetDuyet" stroke={GIAI_DOAN_COLORS.xet_duyet} strokeWidth={2} dot={false} name="Xet duyet" />
                <Line type="monotone" dataKey="thucHien" stroke={GIAI_DOAN_COLORS.thuc_hien} strokeWidth={2} dot={false} name="Thuc hien" />
                <Line type="monotone" dataKey="nghiemThu" stroke={GIAI_DOAN_COLORS.nghiem_thu} strokeWidth={2} dot={false} name="Nghiem thu" />
              </LineChart>
            </ResponsiveContainer>
          </Card>
        </Col>
      </Row>

      {/* ===== Row 3: Danh muc de tai + Chi phi ===== */}
      <Row gutter={[12, 12]} style={{ marginBottom: 20 }}>
        <Col xs={24} lg={12}>
          <Card
            size="small"
            title={
              <Space>
                <FileTextOutlined style={{ color: '#1890ff' }} />
                <span>Danh muc de tai theo giai doan</span>
              </Space>
            }
            styles={{ body: { padding: '16px 20px' } }}
          >
            <Row gutter={[12, 12]}>
              <Col xs={24} md={14}>
                <ResponsiveContainer width="100%" height={220}>
                  <BarChart data={danhMucChartData} layout="vertical">
                    <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                    <XAxis type="number" tick={{ fontSize: 11 }} />
                    <YAxis type="category" dataKey="name" tick={{ fontSize: 11 }} width={80} />
                    <RTooltip formatter={(v, n) => [v, n]} />
                    <Bar dataKey="soLuong" fill="#1890ff" name="Tong so" radius={[0, 4, 4, 0]} />
                    <Bar dataKey="thanhTich" fill="#52c41a" name="Thanh tich" radius={[0, 4, 4, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </Col>
              <Col xs={24} md={10}>
                <Space direction="vertical" size="middle" style={{ width: '100%' }}>
                  {DANH_MUC_DE_TAI.map((d) => (
                    <div key={d.giaiDoan}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 4 }}>
                        <Text style={{ fontSize: 12 }}>{d.label}</Text>
                        <Text strong style={{ fontSize: 12 }}>{d.soLuong}</Text>
                      </div>
                      <Progress
                        percent={Math.round((d.thanhTich / d.soLuong) * 100)}
                        success={{ percent: 100 }}
                        strokeColor={GIAI_DOAN_COLORS[d.giaiDoan as GiaiDoan]}
                        showInfo={false}
                        size="small"
                      />
                    </div>
                  ))}
                </Space>
              </Col>
            </Row>
          </Card>
        </Col>

        <Col xs={24} lg={12}>
          <Card
            size="small"
            title={
              <Space>
                <DollarOutlined style={{ color: '#52c41a' }} />
                <span>Chi phi de tai theo don vi</span>
              </Space>
            }
            extra={
              <Segmented
                size="small"
                value={costView}
                onChange={(v) => setCostView(v as 'bar' | 'table')}
                options={[
                  { label: 'Bieu do', value: 'bar' },
                  { label: 'Bang', value: 'table' },
                ]}
              />}
            styles={{ body: { padding: '16px 20px' } }}
          >
            {costView === 'table' ? (
              <Table
                size="small"
                columns={chiPhiColumns}
                dataSource={CHI_PHI_DE_TAI}
                rowKey="donVi"
                pagination={false}
                scroll={{ x: 'max-content' }}
              />
            ) : (
              <ResponsiveContainer width="100%" height={220}>
                <BarChart data={chiPhiChartData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                  <XAxis dataKey="name" tick={{ fontSize: 10 }} />
                  <YAxis tick={{ fontSize: 10 }} />
                  <RTooltip formatter={(v, n) => [formatCurrency(v as number), n]} />
                  <Legend iconSize={8} />
                  <Bar dataKey="duToan" fill="#1890ff" name="Du toan" radius={[4, 4, 0, 0]} />
                  <Bar dataKey="daChi" fill="#52c41a" name="Da chi" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            )}
            <div style={{ marginTop: 12, padding: '12px 16px', background: '#f5f5f5', borderRadius: 8 }}>
              <Row gutter={16}>
                <Col span={8}>
                  <Text type="secondary" style={{ fontSize: 11 }}>Tong du toan</Text>
                  <div style={{ fontSize: 16, fontWeight: 600, color: '#1890ff' }}>
                    {formatCurrency(TONG_CHI_PHI.duToan)}
                  </div>
                </Col>
                <Col span={8}>
                  <Text type="secondary" style={{ fontSize: 11 }}>Da chi</Text>
                  <div style={{ fontSize: 16, fontWeight: 600, color: '#52c41a' }}>
                    {formatCurrency(TONG_CHI_PHI.daChi)}
                  </div>
                </Col>
                <Col span={8}>
                  <Text type="secondary" style={{ fontSize: 11 }}>Con lai</Text>
                  <div style={{ fontSize: 16, fontWeight: 600, color: '#faad14' }}>
                    {formatCurrency(TONG_CHI_PHI.conLai)}
                  </div>
                </Col>
              </Row>
            </div>
          </Card>
        </Col>
      </Row>

      {/* ===== Row 4: Nhan su + Tai san tri tue ===== */}
      <Row gutter={[12, 12]} style={{ marginBottom: 20 }}>
        <Col xs={24} lg={12}>
          <Card
            size="small"
            title={
              <Space>
                <TeamOutlined style={{ color: '#722ed1' }} />
                <span>Nhan su tham gia</span>
              </Space>
            }
            styles={{ body: { padding: '16px 20px' } }}
          >
            <Row gutter={[12, 12]} align="middle">
              <Col xs={24} md={10}>
                <ResponsiveContainer width="100%" height={200}>
                  <PieChart>
                    <Pie
                      data={nhanSuChartData}
                      cx="50%"
                      cy="50%"
                      innerRadius={50}
                      outerRadius={80}
                      paddingAngle={2}
                      dataKey="value"
                      label={({ name, percent }) => `${name.split(' ')[0]} ${(percent * 100).toFixed(0)}%`}
                      labelLine={false}
                    >
                      {nhanSuChartData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <RTooltip />
                  </PieChart>
                </ResponsiveContainer>
              </Col>
              <Col xs={24} md={14}>
                <Space direction="vertical" size="middle" style={{ width: '100%' }}>
                  {NHAN_SU.map((d, i) => (
                    <Row key={d.vaiTro} gutter={8} align="middle">
                      <Col xs={12}>
                        <Space size={8}>
                          <div
                            style={{
                              width: 10,
                              height: 10,
                              borderRadius: 2,
                              background: PIE_COLORS[i % PIE_COLORS.length],
                            }}
                          />
                          <Text style={{ fontSize: 13 }}>{d.vaiTro}</Text>
                        </Space>
                      </Col>
                      <Col xs={6}>
                        <Text strong style={{ fontSize: 13 }}>{d.soLuong}</Text>
                      </Col>
                      <Col xs={6}>
                        <Progress
                          percent={Math.round((d.soLuong / NHAN_SU[0].soLuong) * 100)}
                          strokeColor={PIE_COLORS[i % PIE_COLORS.length]}
                          showInfo={false}
                          size="small"
                        />
                      </Col>
                    </Row>
                  ))}
                  <Divider style={{ margin: '8px 0' }} />
                  <Row>
                    <Col span={12}>
                      <Text type="secondary" style={{ fontSize: 12 }}>Tong cong</Text>
                      <div style={{ fontWeight: 600, fontSize: 18, color: '#722ed1' }}>
                        {NHAN_SU.reduce((s, d) => s + d.soLuong, 0)} nguoi
                      </div>
                    </Col>
                  </Row>
                </Space>
              </Col>
            </Row>
          </Card>
        </Col>

        <Col xs={24} lg={12}>
          <Card
            size="small"
            title={
              <Space>
                <TrophyOutlined style={{ color: '#faad14' }} />
                <span>Tai san tri tue</span>
              </Space>
            }
            styles={{ body: { padding: '16px 20px' } }}
          >
            <Row gutter={[12, 12]}>
              {TAI_SAN_TRI_TUE.map((d, i) => (
                <Col key={d.loai} xs={12} sm={6}>
                  <div
                    style={{
                      padding: 16,
                      background: `${PIE_COLORS[i % PIE_COLORS.length]}10`,
                      borderRadius: 8,
                      border: `1px solid ${PIE_COLORS[i % PIE_COLORS.length]}30`,
                      textAlign: 'center',
                    }}
                  >
                    <div
                      style={{
                        fontSize: 28,
                        fontWeight: 700,
                        color: PIE_COLORS[i % PIE_COLORS.length],
                        lineHeight: 1,
                        marginBottom: 8,
                      }}
                    >
                      {d.soLuong}
                    </div>
                    <div style={{ fontSize: 11, color: '#595959', marginBottom: 4 }}>{d.label}</div>
                    <div style={{ fontSize: 11, color: '#8c8c8c' }}>
                      Nam nay: {d.namNay}
                    </div>
                    <Tag
                      color={d.tangTruongPct > 0 ? 'success' : 'error'}
                      style={{ marginTop: 4, fontSize: 10 }}
                    >
                      {d.tangTruongPct > 0 ? '+' : ''}{d.tangTruongPct}% YoY
                    </Tag>
                  </div>
                </Col>
              ))}
            </Row>
            <div style={{ marginTop: 16 }}>
              <Row gutter={16}>
                <Col span={8}>
                  <Text type="secondary" style={{ fontSize: 11 }}>Tong so tai san</Text>
                  <div style={{ fontWeight: 600, fontSize: 18, color: '#faad14' }}>
                    {TAI_SAN_TRI_TUE.reduce((s, d) => s + d.soLuong, 0)}
                  </div>
                </Col>
                <Col span={8}>
                  <Text type="secondary" style={{ fontSize: 11 }}>Dang cho dang ky</Text>
                  <div style={{ fontWeight: 600, fontSize: 18, color: '#1890ff' }}>12</div>
                </Col>
                <Col span={8}>
                  <Text type="secondary" style={{ fontSize: 11 }}>Gia tri chuyen giao</Text>
                  <div style={{ fontWeight: 600, fontSize: 18, color: '#52c41a' }}>
                    ~{formatCurrency(4500)}
                  </div>
                </Col>
              </Row>
            </div>
          </Card>
        </Col>
      </Row>

      {/* ===== Row 5: Recent Activity ===== */}
      <Card
        size="small"
        title={
          <Space>
            <ClockCircleOutlined style={{ color: '#1890ff' }} />
            <span>Hoat dong gan day</span>
          </Space>
        }
        styles={{ body: { padding: '16px 20px' } }}
      >
        <Row gutter={[12, 12]}>
          <Col xs={24} md={8}>
            <Text strong style={{ fontSize: 13, color: '#52c41a' }}>Hoan thanh gan day</Text>
            <Space direction="vertical" size="small" style={{ marginTop: 8, width: '100%' }}>
              <Row justify="space-between">
                <Text style={{ fontSize: 12 }}>RD.2026.012 - Định vị đa cảm biến</Text>
                <Text type="secondary" style={{ fontSize: 11 }}>T6/2026</Text>
              </Row>
              <Row justify="space-between">
                <Text style={{ fontSize: 12 }}>RD.2026.009 - Ạng-ten mảng pha</Text>
                <Text type="secondary" style={{ fontSize: 11 }}>T6/2026</Text>
              </Row>
              <Row justify="space-between">
                <Text style={{ fontSize: 12 }}>RD.2026.034 - Hệ thống GPS độ chính xác cao</Text>
                <Text type="secondary" style={{ fontSize: 11 }}>T6/2026</Text>
              </Row>
            </Space>
          </Col>
          <Col xs={24} md={8}>
            <Text strong style={{ fontSize: 13, color: '#faad14' }}>Dang xu ly</Text>
            <Space direction="vertical" size="small" style={{ marginTop: 8, width: '100%' }}>
              <Row justify="space-between">
                <Text style={{ fontSize: 12 }}>RD.2026.018 - Module VHF băng rộng</Text>
                <Tag color="orange" style={{ fontSize: 10 }}>Thuc hien</Tag>
              </Row>
              <Row justify="space-between">
                <Text style={{ fontSize: 12 }}>RD.2026.021 - Nen tang QTQTHT VHT</Text>
                <Tag color="geekblue" style={{ fontSize: 10 }}>Xet duyet</Tag>
              </Row>
              <Row justify="space-between">
                <Text style={{ fontSize: 12 }}>RD.2026.025 - He thong tac chien DT</Text>
                <Tag color="geekblue" style={{ fontSize: 10 }}>Xet duyet</Tag>
              </Row>
            </Space>
          </Col>
          <Col xs={24} md={8}>
            <Text strong style={{ fontSize: 13, color: '#ff4d4f' }}>Can chu y</Text>
            <Space direction="vertical" size="small" style={{ marginTop: 8, width: '100%' }}>
              <Row justify="space-between">
                <Text style={{ fontSize: 12 }}>RD.2026.027 - Mo phong quy dao bay</Text>
                <Tag color="red" style={{ fontSize: 10 }}>Qua han 15 ngay</Tag>
              </Row>
              <Row justify="space-between">
                <Text style={{ fontSize: 12 }}>RD.2026.031 - XL tín hiệu số radar</Text>
                <Tag color="orange" style={{ fontSize: 10 }}>Qua han 7 ngay</Tag>
              </Row>
              <Row justify="space-between">
                <Text style={{ fontSize: 12 }}>RD.2026.035 - Tu dong hoa trạm BTS</Text>
                <Tag color="warning" style={{ fontSize: 10 }}>Can cap nhat T7</Tag>
              </Row>
            </Space>
          </Col>
        </Row>
      </Card>
    </div>
  )
}