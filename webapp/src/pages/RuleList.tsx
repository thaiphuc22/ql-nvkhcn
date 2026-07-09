import { useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  App,
  Button,
  Col,
  Form,
  Input,
  Modal,
  Popconfirm,
  Row,
  Select,
  Space,
  Tag,
  Tooltip,
  Typography,
} from 'antd'
import {
  ApartmentOutlined,
  CopyOutlined,
  DeleteOutlined,
  PlusOutlined,
  StopOutlined,
  CheckCircleOutlined,
} from '@ant-design/icons'
import {
  EntityTable,
  FilterBar,
  LIST_SCROLL_Y,
  PageHeader,
  StatCard,
  StatusTag,
} from '../components/ui'
import { useRules } from '../store/RuleContext'
import { usePermissions } from '../store/AuthContext'
import {
  RULE_CATEGORY_COLOR,
  RULE_CATEGORY_LABEL,
  RULE_KIND_META,
  RULE_STATUS_META,
  type BusinessRule,
  type RuleCategory,
  type RuleKind,
  type RuleStatus,
} from '../data/rules'

const { Text } = Typography

/** Preset các giai đoạn RD (cho phép nhập thêm mã tuỳ ý). */
const RD_OPTIONS = ['RD01.01', 'RD02.01', 'RD05.01', 'RD06.01', 'RD08.01', 'RD10.01', 'RD03.6'].map(
  (v) => ({ value: v, label: v }),
)

interface CreateForm {
  ten: string
  moTa: string
  category: RuleCategory
  kind: RuleKind
  rdApDung: string[]
}

export default function RuleList() {
  const navigate = useNavigate()
  const { message } = App.useApp()
  const { list, create, duplicate, setStatus, remove } = useRules()
  const { user } = usePermissions()
  const actor = user?.hoTen ?? 'Người dùng'

  const [q, setQ] = useState('')
  const [fCat, setFCat] = useState<RuleCategory>()
  const [fStatus, setFStatus] = useState<RuleStatus>()
  const [fKind, setFKind] = useState<RuleKind>()
  const [creating, setCreating] = useState(false)
  const [form] = Form.useForm<CreateForm>()

  const filtered = useMemo(() => {
    const kw = q.trim().toLowerCase()
    return list.filter(
      (r) =>
        (!kw || r.ten.toLowerCase().includes(kw) || r.ma.toLowerCase().includes(kw)) &&
        (!fCat || r.category === fCat) &&
        (!fStatus || r.trangThai === fStatus) &&
        (!fKind || r.kind === fKind),
    )
  }, [list, q, fCat, fStatus, fKind])

  const stats = useMemo(
    () => ({
      total: list.length,
      active: list.filter((r) => r.trangThai === 'active').length,
      draft: list.filter((r) => r.trangThai === 'draft').length,
      service: list.filter((r) => r.kind === 'SERVICE').length,
    }),
    [list],
  )

  const submitCreate = async () => {
    const v = await form.validateFields()
    const id = create({ ...v, actor })
    setCreating(false)
    form.resetFields()
    message.success('Đã tạo luật (bản nháp). Soạn nội dung ở màn chi tiết.')
    navigate(`/quan-ly-luat/${id}`)
  }

  return (
    <div>
      <PageHeader
        icon={<ApartmentOutlined style={{ fontSize: 24, color: 'var(--vht-red)' }} />}
        title="Ma trận quyết định"
        // tag={<Tag color="processing">EPIC09 · DMN</Tag>}
        // code={
        //   <Text type="secondary">
        //     Danh mục luật nghiệp vụ — định tuyến, phân loại, ngưỡng… điều khiển quy trình RD
        //   </Text>
        // }
        breadcrumb={[{ label: 'Hệ thống QTKHCN' }, { label: 'Ma trận quyết định' }]}
        extra={
          <Button type="primary" icon={<PlusOutlined />} onClick={() => setCreating(true)}>
            Tạo luật
          </Button>
        }
      />

      <Row gutter={[16, 16]} style={{ marginBottom: 16 }}>
        <Col xs={12} md={6}>
          <StatCard title="Tổng số quy luật" value={stats.total} />
        </Col>
        <Col xs={12} md={6}>
          <StatCard title="Đang hiệu lực" value={stats.active} color="#389e0d" />
        </Col>
        <Col xs={12} md={6}>
          <StatCard title="Bản nháp" value={stats.draft} />
        </Col>
        <Col xs={12} md={6}>
          <StatCard title="Luật dịch vụ (code)" value={stats.service} />
        </Col>
      </Row>

      <FilterBar
        search={{ placeholder: 'Tìm theo tên / mã quyluật', value: q, onChange: setQ, width: 260 }}
        selects={[
          {
            key: 'cat',
            placeholder: 'Loại quy luật',
            value: fCat,
            onChange: (v) => setFCat(v),
            options: (Object.keys(RULE_CATEGORY_LABEL) as RuleCategory[]).map((c) => ({
              value: c,
              label: RULE_CATEGORY_LABEL[c],
            })),
          },
          {
            key: 'kind',
            placeholder: 'Kiểu quy luật',
            value: fKind,
            onChange: (v) => setFKind(v),
            options: (Object.keys(RULE_KIND_META) as RuleKind[]).map((k) => ({
              value: k,
              label: RULE_KIND_META[k].label,
            })),
            width: 200,
          },
          {
            key: 'status',
            placeholder: 'Trạng thái',
            value: fStatus,
            onChange: (v) => setFStatus(v),
            options: (Object.keys(RULE_STATUS_META) as RuleStatus[]).map((s) => ({
              value: s,
              label: RULE_STATUS_META[s].label,
            })),
          },
        ]}
        right={<Text type="secondary">{filtered.length} luật</Text>}
      />

      <EntityTable<BusinessRule>
        rowKey="id"
        dataSource={filtered}
        onRowClick={(r) => navigate(`/quan-ly-luat/${r.id}`)}
        scroll={{ y: LIST_SCROLL_Y }}
        columns={[
          {
            title: 'Mã',
            dataIndex: 'ma',
            render: (ma: string) => <Text code>{ma}</Text>,
          },
          {
            title: 'Tên quyluật',
            dataIndex: 'ten',
            render: (ten: string, r) => (
              <div>
                <div style={{ fontWeight: 600 }}>{ten}</div>
                <Text type="secondary" style={{ fontSize: 12 }}>
                  {r.moTa}
                </Text>
              </div>
            ),
          },
          {
            title: 'Loại',
            dataIndex: 'category',
            render: (c: RuleCategory) => (
              <Tag color={RULE_CATEGORY_COLOR[c]}>{RULE_CATEGORY_LABEL[c]}</Tag>
            ),
          },
          {
            title: 'Kiểu',
            dataIndex: 'kind',
            render: (k: RuleKind) => <Tag color={RULE_KIND_META[k].color}>{RULE_KIND_META[k].label}</Tag>,
          },
          {
            title: 'Quy trình áp dụng',
            dataIndex: 'rdApDung',
            render: (rds: string[]) => (
              <Text>{rds.join(', ')}</Text>
            ),
          },
          {
            title: 'Trạng thái',
            dataIndex: 'trangThai',
            render: (s: RuleStatus) => (
              <StatusTag color={RULE_STATUS_META[s].color} label={RULE_STATUS_META[s].label} />
            ),
          },
          {
            title: 'Phiên bản',
            dataIndex: 'version',
            align: 'center',
            render: (v: number) => <Text type="secondary">v{v}</Text>,
          },
          {
            title: 'Cập nhật',
            dataIndex: 'capNhat',
            render: (d: string, r) => (
              <div style={{ fontSize: 12 }}>
                <div>{d}</div>
                <Text type="secondary">{r.nguoiCapNhat}</Text>
              </div>
            ),
          },
          {
            title: 'Thao tác',
            key: 'actions',
            fixed: 'right',
            render: (_, r) => (
              <Space size={4} onClick={(e) => e.stopPropagation()}>
                <Tooltip title="Nhân bản">
                  <Button
                    size="small"
                    icon={<CopyOutlined />}
                    onClick={() => {
                      const id = duplicate(r.id, actor)
                      message.success('Đã nhân bản thành bản nháp.')
                      navigate(`/quan-ly-luat/${id}`)
                    }}
                  />
                </Tooltip>
                {r.trangThai === 'active' ? (
                  <Tooltip title="Vô hiệu hoá">
                    <Button
                      size="small"
                      icon={<StopOutlined />}
                      onClick={() => {
                        setStatus(r.id, 'disabled', actor)
                        message.success('Đã vô hiệu hoá luật.')
                      }}
                    />
                  </Tooltip>
                ) : (
                  <Tooltip title="Kích hoạt (hiệu lực)">
                    <Button
                      size="small"
                      icon={<CheckCircleOutlined />}
                      onClick={() => {
                        setStatus(r.id, 'active', actor)
                        message.success('Đã kích hoạt luật.')
                      }}
                    />
                  </Tooltip>
                )}
                <Popconfirm
                  title="Xoá luật này?"
                  description="Chỉ xoá trong mock. Không thể hoàn tác."
                  okText="Xoá"
                  okButtonProps={{ danger: true }}
                  cancelText="Huỷ"
                  onConfirm={() => {
                    remove(r.id)
                    message.success('Đã xoá luật.')
                  }}
                >
                  <Button size="small" danger icon={<DeleteOutlined />} />
                </Popconfirm>
              </Space>
            ),
          },
        ]}
      />

      <Modal
        title="Tạo luật nghiệp vụ"
        open={creating}
        onOk={submitCreate}
        onCancel={() => setCreating(false)}
        okText="Tạo & soạn nội dung"
        cancelText="Huỷ"
        destroyOnClose
      >
        <Form
          form={form}
          layout="vertical"
          initialValues={{ category: 'threshold', kind: 'DMN', rdApDung: [] }}
        >
          <Form.Item name="ten" label="Tên luật" rules={[{ required: true, message: 'Nhập tên luật' }]}>
            <Input placeholder="vd: Cần Hội đồng nghiệm thu (RD05)" />
          </Form.Item>
          <Form.Item name="moTa" label="Mô tả" rules={[{ required: true, message: 'Nhập mô tả' }]}>
            <Input.TextArea rows={2} placeholder="Luật này quyết định điều gì?" />
          </Form.Item>
          <Row gutter={12}>
            <Col span={12}>
              <Form.Item name="category" label="Loại luật">
                <Select
                  options={(Object.keys(RULE_CATEGORY_LABEL) as RuleCategory[]).map((c) => ({
                    value: c,
                    label: RULE_CATEGORY_LABEL[c],
                  }))}
                />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item
                name="kind"
                label="Kiểu luật"
                tooltip="DMN: hàm thuần của vài input → soạn bằng bảng. Dịch vụ: cần tra cứu DB/hệ ngoài → dev hiện thực."
              >
                <Select
                  options={(Object.keys(RULE_KIND_META) as RuleKind[]).map((k) => ({
                    value: k,
                    label: RULE_KIND_META[k].label,
                  }))}
                />
              </Form.Item>
            </Col>
          </Row>
          <Form.Item name="rdApDung" label="RD áp dụng" rules={[{ required: true, message: 'Chọn ít nhất 1 giai đoạn RD' }]}>
            <Select mode="tags" placeholder="Chọn hoặc nhập mã RD" options={RD_OPTIONS} />
          </Form.Item>
        </Form>
      </Modal>
    </div>
  )
}
