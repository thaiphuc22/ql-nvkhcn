import { useMemo } from 'react'
import { Badge, Card, Col, Row, Space, Tag, Tooltip, Typography } from 'antd'
import { ApiOutlined, ExclamationCircleFilled } from '@ant-design/icons'
import { Link } from 'react-router-dom'
import { PageHeader, StatCard, StatusTag } from '../components/ui'
import {
  INTEG_KIND_LABEL,
  INTEG_STATUS,
  SYNC_MODE_LABEL,
  seedIntegrations,
  type IntegrationSystem,
} from '../data/camundaOps'

const { Text, Paragraph } = Typography

const BADGE_STATUS: Record<string, 'success' | 'warning' | 'error'> = {
  healthy: 'success',
  degraded: 'warning',
  down: 'error',
}

/** Trạng thái tích hợp hệ ngoài — Seam B (Camunda ↔ QLNS/MS/SAP/QLTS/PLM/IAM). */
export default function IntegrationStatus() {
  const stats = useMemo(() => {
    const total = seedIntegrations.length
    const healthy = seedIntegrations.filter((s) => s.trangThai === 'healthy').length
    const errors = seedIntegrations.reduce((s, x) => s + x.loi24h, 0)
    const queued = seedIntegrations.reduce((s, x) => s + x.hangDoi, 0)
    return { total, healthy, errors, queued }
  }, [])

  return (
    <div>
      <PageHeader
        title="Trạng thái tích hợp hệ ngoài"
        icon={<ApiOutlined style={{ fontSize: 26, color: '#ee0033' }} />}
      />

      <Row gutter={14} style={{ marginBottom: 18 }}>
        <Col xs={12} md={6}><StatCard title="Hệ tích hợp" value={stats.total} /></Col>
        <Col xs={12} md={6}><StatCard title="Đang khoẻ" value={stats.healthy} color="#17935a" /></Col>
        <Col xs={12} md={6}><StatCard title="Lỗi 24h" value={stats.errors} color="#cf1322" /></Col>
        <Col xs={12} md={6}><StatCard title="Job trong hàng đợi" value={stats.queued} color="#b06f00" /></Col>
      </Row>

      <Row gutter={[14, 14]} style={{ marginBottom: 20 }}>
        {seedIntegrations.map((s) => (
          <Col xs={24} sm={12} lg={8} key={s.key}>
            <SystemCard s={s} />
          </Col>
        ))}
      </Row>

      <Paragraph type="secondary" style={{ fontSize: 12 }}>
        Màn này là <Text strong>sức khoẻ tổng thể</Text> từng hệ (snapshot). Chi tiết từng lần
        <Text strong> job worker</Text> chạy xem ở <Link to="/nhat-ky">Nhật ký → tab "Nhật ký tích hợp"</Link>.
        Camunda điều phối gọi hệ ngoài qua service task; logic tích hợp nằm ở job worker/connector
        (docs/arch/camunda-design.md mục 5). Connector = cấu hình sẵn (đỡ code), job worker = code tay —
        bộ nào có trong license quyết định lựa chọn (OQ-CAM-COMPONENTS).
      </Paragraph>
    </div>
  )
}

function SystemCard({ s }: { s: IntegrationSystem }) {
  const m = INTEG_STATUS[s.trangThai]
  return (
    <Card size="small" style={{ height: '100%' }}>
      <Space direction="vertical" size={8} style={{ width: '100%' }}>
        <Row justify="space-between" align="middle">
          <Space size={8}>
            <Badge status={BADGE_STATUS[s.trangThai]} />
            <Text strong style={{ fontSize: 15 }}>{s.key}</Text>
          </Space>
          <StatusTag color={m.color} label={m.label} />
        </Row>
        <Text type="secondary" style={{ fontSize: 12 }}>{s.ten}</Text>
        <Text style={{ fontSize: 12 }}>{s.moTa}</Text>
        <Space size={6} wrap>
          <Tag>{s.giaoThuc}</Tag>
          <Tag color="blue">{INTEG_KIND_LABEL[s.kieu]}</Tag>
          <Tag>{SYNC_MODE_LABEL[s.syncMode]}</Tag>
        </Space>
        <Row gutter={8} style={{ marginTop: 2 }}>
          <Metric label="Bản ghi 24h" value={s.banGhi24h.toLocaleString('vi-VN')} />
          <Metric label="Lỗi 24h" value={s.loi24h} danger={s.loi24h > 0} />
          <Metric label="Độ trễ" value={s.doTreMs ? `${s.doTreMs}ms` : '—'} danger={s.doTreMs > 1000} />
          <Metric label="Hàng đợi" value={s.hangDoi} danger={s.hangDoi > 3} />
        </Row>
        <Row justify="space-between" align="middle">
          <Tooltip title="Requirement/NFR liên quan">
            <Text type="secondary" style={{ fontSize: 11 }}>{s.ref}</Text>
          </Tooltip>
          <Text type="secondary" style={{ fontSize: 11 }}>Đồng bộ cuối: {s.lanDongBoCuoi}</Text>
        </Row>
      </Space>
    </Card>
  )
}

function Metric({ label, value, danger }: { label: string; value: React.ReactNode; danger?: boolean }) {
  return (
    <Col span={6} style={{ textAlign: 'center' }}>
      <div style={{ fontWeight: 700, fontSize: 15, color: danger ? '#cf1322' : undefined }}>
        {/* Không chỉ dùng màu: kèm icon cảnh báo khi bất thường (WCAG 1.4.1). */}
        {danger && <ExclamationCircleFilled style={{ fontSize: 11, marginInlineEnd: 3 }} />}
        {value}
      </div>
      <Text type="secondary" style={{ fontSize: 10 }}>{label}</Text>
    </Col>
  )
}
