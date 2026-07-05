import { useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  Alert,
  Button,
  Col,
  Row,
  Space,
  Tag,
  Typography,
} from 'antd'
import type { ColumnsType } from 'antd/es/table'
import { FolderOpenOutlined, FormOutlined } from '@ant-design/icons'
import type { Dossier } from '../data/dossiers'
import { useDossiers } from '../store/DossierContext'
import { useAuth } from '../store/AuthContext'
import TaskFormModal from '../components/TaskFormModal'
import { PageHeader, StatCard, EntityTable, LIST_SCROLL_Y } from '../components/ui'

const { Text } = Typography
const TODAY = '03/07/2026'

function parseVN(dmy?: string): number | null {
  if (!dmy) return null
  const [d, m, y] = dmy.split('/').map(Number)
  if (!d || !m || !y) return null
  return y * 10000 + m * 100 + d
}

interface Task {
  d: Dossier
  stepTen: string
  vaiTro: string
  han?: string
}

export default function Worklist() {
  const navigate = useNavigate()
  const { list } = useDossiers()
  const { user } = useAuth()
  const currentUser = user?.hoTen ?? 'Người dùng'
  const [formTask, setFormTask] = useState<string | null>(null)

  const tasks: Task[] = useMemo(
    () =>
      list
        .filter((d) => d.trangThai === 'processing')
        .map((d) => {
          const step = d.steps[d.buocHienTai]
          return { d, stepTen: step?.ten ?? '—', vaiTro: step?.vaiTro ?? '', han: step?.hanXuLy }
        })
        .sort((a, b) => (parseVN(a.han) ?? 9e9) - (parseVN(b.han) ?? 9e9)),
    [list],
  )

  const overdueCount = useMemo(
    () => tasks.filter((t) => parseVN(t.han) != null && parseVN(t.han)! < parseVN(TODAY)!).length,
    [tasks],
  )

  const columns: ColumnsType<Task> = [
    { title: 'Mã hồ sơ', key: 'id', width: 128, render: (_, t) => <Text code>{t.d.id}</Text> },
    {
      title: 'Đề tài',
      key: 'dt',
      render: (_, t) => (
        <div>
          <div style={{ fontWeight: 600 }}>{t.d.tenDeTai}</div>
          <Text type="secondary" style={{ fontSize: 12 }}>{t.d.maDeTai} · {t.d.chuNhiem}</Text>
        </div>
      ),
    },
    {
      title: 'Bước cần xử lý',
      key: 'buoc',
      width: 250,
      render: (_, t) => (
        <div>
          <div>{t.stepTen}</div>
          <Text type="secondary" style={{ fontSize: 12 }}>{t.vaiTro}</Text>
        </div>
      ),
    },
    {
      title: 'Quy trình',
      key: 'qt',
      width: 110,
      render: (_, t) => (
        <div>
          <Tag>{t.d.quyTrinh}</Tag>
          <div><Text type="secondary" style={{ fontSize: 12 }}>cấp {t.d.cap}</Text></div>
        </div>
      ),
    },
    {
      title: 'Hạn xử lý',
      key: 'han',
      width: 130,
      sorter: (a, b) => (parseVN(a.han) ?? 9e9) - (parseVN(b.han) ?? 9e9),
      render: (_, t) => {
        if (!t.han) return <Text type="secondary">—</Text>
        const overdue = parseVN(t.han)! < parseVN(TODAY)!
        return (
          <Space direction="vertical" size={0}>
            <Text>{t.han}</Text>
            <Tag color={overdue ? 'red' : 'green'}>{overdue ? 'Quá hạn' : 'Còn hạn'}</Tag>
          </Space>
        )
      },
    },
    {
      title: 'Thao tác',
      key: 'act',
      width: 170,
      render: (_, t) => (
        <Space>
          <Button type="primary" size="small" icon={<FormOutlined />} onClick={() => setFormTask(t.d.id)}>
            Xử lý
          </Button>
          <Button size="small" icon={<FolderOpenOutlined />} onClick={() => navigate(`/ho-so/${encodeURIComponent(t.d.id)}`)} />
        </Space>
      ),
    },
  ]

  return (
    <div>
      <PageHeader title="Việc của tôi" style={{ marginBottom: 0 }} />

      <Row gutter={14} style={{ margin: '18px 0' }}>
        <Col xs={12} md={8}><StatCard title="Việc chờ xử lý" value={tasks.length} color="#1677ff" /></Col>
        <Col xs={12} md={8}><StatCard title="Quá hạn" value={overdueCount} color="#cf1322" /></Col>
        <Col xs={24} md={8}><StatCard title="Người xử lý" value={currentUser} valueStyle={{ fontSize: 18 }} /></Col>
      </Row>

      <Alert
        type="warning"
        showIcon
        style={{ marginBottom: 12 }}
        message="Hạn xử lý (SLA) đang là dữ liệu minh hoạ."
        description="Bộ SLA thật + lọc theo nhóm phụ trách (candidate group / RBAC) sẽ áp dụng khi chốt OQ-006."
      />

      <EntityTable<Task>
        rowKey={(t) => t.d.id}
        columns={columns}
        dataSource={tasks}
        emptyText="Không có việc nào chờ xử lý 🎉"
        scroll={{ y: LIST_SCROLL_Y }}
      />

      <TaskFormModal dossierId={formTask} open={!!formTask} onClose={() => setFormTask(null)} />
    </div>
  )
}
