import { useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Button, Col, Row, Segmented, Space, Tag, Tooltip, Typography } from 'antd'
import type { ColumnsType } from 'antd/es/table'
import { FolderOpenOutlined, FormOutlined } from '@ant-design/icons'
import { useDossiers } from '../store/DossierContext'
import { useAuth, usePermissions } from '../store/AuthContext'
import {
  PageHeader,
  StatCard,
  EntityTable,
  LIST_SCROLL_Y,
} from '../components/ui'
import HelpButton from '../components/HelpButton'
import {
  buildUserTasksFromDossiers,
  USER_TASK_KIND_META,
  type CamundaUserTask,
  type UserTaskKind,
} from '../data/userTasks'

const { Text } = Typography
const TODAY = '03/07/2026'

function parseVN(dmy?: string): number | null {
  if (!dmy) return null
  const [d, m, y] = dmy.split('/').map(Number)
  if (!d || !m || !y) return null
  return y * 10000 + m * 100 + d
}

/**
 * Việc của tôi — mỗi dòng = 1 Camunda user task instance (taskKey).
 * Cột lấy từ task variables + metadata (processDefinitionKey, elementId, dueDate).
 */
export default function Worklist() {
  const navigate = useNavigate()
  const { list } = useDossiers()
  const { user } = useAuth()
  const { admin, canProcessStep } = usePermissions()
  const currentUser = user?.hoTen ?? 'Người dùng'
  const [showAll] = useState(admin)
  const [kindFilter, setKindFilter] = useState<UserTaskKind | 'all'>('all')

  const tasks: CamundaUserTask[] = useMemo(() => {
    const all = buildUserTasksFromDossiers(list)
    return all
      .filter((t) => (admin && showAll) || canProcessStep(t.step))
      .filter((t) => kindFilter === 'all' || t.taskKind === kindFilter)
      .sort((a, b) => (parseVN(a.dueDate) ?? 9e9) - (parseVN(b.dueDate) ?? 9e9))
  }, [list, admin, showAll, canProcessStep, kindFilter])

  const overdueCount = useMemo(
    () =>
      tasks.filter(
        (t) => parseVN(t.dueDate) != null && parseVN(t.dueDate)! < parseVN(TODAY)!,
      ).length,
    [tasks],
  )

  const columns: ColumnsType<CamundaUserTask> = [
    {
      title: 'Task key',
      dataIndex: 'taskKey',
      width: 148,
      render: (v: string) => (
        <Text code style={{ fontSize: 11 }}>
          {v}
        </Text>
      ),
    },
    {
      title: 'Loại task',
      dataIndex: 'taskKind',
      width: 110,
      render: (k: UserTaskKind) => {
        const m = USER_TASK_KIND_META[k]
        return <Tag color={m.color}>{m.label}</Tag>
      },
    },
    {
      title: 'Mã hồ sơ',
      key: 'maHoSo',
      width: 128,
      render: (_, t) => (
        <div>
          <Text code>{t.variables.maHoSo}</Text>
          <div>
            <Text type="secondary" style={{ fontSize: 11 }}>
              {t.variables.maNV}
            </Text>
          </div>
        </div>
      ),
    },
    {
      title: 'Đề tài',
      key: 'dt',
      render: (_, t) => (
        <div>
          <div style={{ fontWeight: 600 }}>{t.variables.tenDeTai}</div>
          <Text type="secondary" style={{ fontSize: 12 }}>
            {t.variables.maDeTai} · {t.variables.chuNhiem}
          </Text>
        </div>
      ),
    },
    {
      title: 'Quy trình',
      key: 'qt',
      width: 150,
      render: (_, t) => (
        <div>
          <Tag>{t.processDefinitionKey}</Tag>
          <div>
            <Text type="secondary" style={{ fontSize: 11 }}>
              cấp {t.variables.cap}
            </Text>
          </div>
        </div>
      ),
    },
    {
      title: 'Bước cần xử lý',
      key: 'buoc',
      width: 220,
      render: (_, t) => (
        <div>
          <div>{t.elementName}</div>
          <Text type="secondary" style={{ fontSize: 11 }}>
            <Text code style={{ fontSize: 10 }}>
              {t.taskDefinitionKey}
            </Text>
            {t.step?.vaiTro ? ` · ${t.step.vaiTro}` : ''}
          </Text>
        </div>
      ),
    },
    {
      title: 'Hạn xử lý',
      key: 'han',
      width: 120,
      sorter: (a, b) => (parseVN(a.dueDate) ?? 9e9) - (parseVN(b.dueDate) ?? 9e9),
      render: (_, t) => {
        if (!t.dueDate) return <Text type="secondary">—</Text>
        const overdue = parseVN(t.dueDate)! < parseVN(TODAY)!
        return (
          <Space direction="vertical" size={0}>
            <Text>{t.dueDate}</Text>
            <Tag color={overdue ? 'red' : 'green'}>{overdue ? 'Quá hạn' : 'Còn hạn'}</Tag>
          </Space>
        )
      },
    },
    {
      title: 'Thao tác',
      key: 'act',
      width: 170,
      render: (_, t) => {
        const allowed = canProcessStep(t.step)
        return (
          <Space>
            <Tooltip
              title={
                allowed
                  ? undefined
                  : `candidateGroups: ${(t.candidateGroups || []).join(', ') || '—'}`
              }
            >
              <Button
                type="primary"
                size="small"
                icon={<FormOutlined />}
                disabled={!allowed}
                onClick={() => navigate(`/ho-so/${encodeURIComponent(t.dossierId)}`)}
              >
                Xử lý
              </Button>
            </Tooltip>
            <Button
              size="small"
              icon={<FolderOpenOutlined />}
              onClick={() => navigate(`/ho-so/${encodeURIComponent(t.dossierId)}`)}
            />
          </Space>
        )
      },
    },
  ]

  return (
    <div>
      <PageHeader
        title="Việc của tôi"
        style={{ marginBottom: 0 }}
        code={
          <Text type="secondary" style={{ fontSize: 12 }}>
            Mỗi dòng = 1 user task Camunda (task key). Cột lấy từ variables + metadata (mock).
          </Text>
        }
        extra={<HelpButton section="worklist" />}
      />

      <Row gutter={14} style={{ margin: '18px 0' }}>
        <Col xs={12} md={8}>
          <StatCard title="Việc chờ xử lý" value={tasks.length} color="#1677ff" />
        </Col>
        <Col xs={12} md={8}>
          <StatCard title="Quá hạn" value={overdueCount} color="#cf1322" />
        </Col>
        <Col xs={24} md={8}>
          <StatCard title="Người xử lý" value={currentUser} valueStyle={{ fontSize: 18 }} />
        </Col>
      </Row>

      <div style={{ marginBottom: 12 }}>
        <Segmented
          value={kindFilter}
          onChange={(v) => setKindFilter(v as UserTaskKind | 'all')}
          options={[
            { label: 'Tất cả loại', value: 'all' },
            ...((Object.keys(USER_TASK_KIND_META) as UserTaskKind[]).map((k) => ({
              label: USER_TASK_KIND_META[k].label,
              value: k,
            })) as { label: string; value: UserTaskKind }[]),
          ]}
        />
      </div>

      <EntityTable<CamundaUserTask>
        rowKey="taskKey"
        columns={columns}
        dataSource={tasks}
        emptyText="Không có việc nào chờ xử lý 🎉"
        scroll={{ y: LIST_SCROLL_Y }}
      />
    </div>
  )
}
