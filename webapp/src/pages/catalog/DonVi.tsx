/**
 * Đơn vị (Organizational Units) - Full Catalog Page
 * Route: /phan-he/PH2/don-vi
 *
 * Features:
 * - Tree view / Table view toggle
 * - Search & filters
 * - Add/Edit/Delete operations
 * - Unit details panel
 */
import { useMemo, useState } from 'react'
import {
  Button,
  Card,
  Col,
  Drawer,
  Form,
  Input,
  message,
  Modal,
  Popconfirm,
  Row,
  Select,
  Space,
  Switch,
  Table,
  Tag,
  Tooltip,
  Tree,
  TreeSelect,
  Typography,
} from 'antd'
import {
  ApartmentOutlined,
  BuildOutlined,
  DeleteOutlined,
  EditOutlined,
  EyeOutlined,
  PlusOutlined,
  SearchOutlined,
} from '@ant-design/icons'
import type { DataNode } from 'antd/es/tree'
import type { ColumnsType } from 'antd/es/table'
import { PageHeader, StatCard } from '../../components/ui'
import {
  seedDonVi,
  DonVi,
  LOAI_DON_VI,
  LOAI_DON_VI_COLOR,
  TRANG_THAI_OPTIONS,
  type DonViLoai,
} from '../../data/catalogDonVi'

const { Text } = Typography
const { TextArea } = Input

// ─── Types ───────────────────────────────────────────────────────────────────
interface DonViFormValues {
  ma: string
  ten: string
  tenVietTat?: string
  parentId?: string
  loai: DonViLoai
  capDonVi?: number
  nguoiPhuTrach?: string
  dienThoai?: string
  email?: string
  diaChi?: string
  thuTu?: number
  moTa?: string
  trangThai: 'active' | 'inactive'
}

// ─── Helpers ─────────────────────────────────────────────────────────────────
function buildTree(units: DonVi[]): DataNode[] {
  const map = new Map<string, DataNode>()
  const roots: DataNode[] = []

  units.forEach((u) => {
    map.set(u.id, { title: u.ten, key: u.id })
  })

  units.forEach((u) => {
    const node = map.get(u.id)!
    if (u.parentId && map.has(u.parentId)) {
      const parent = map.get(u.parentId)!
      if (!parent.children) parent.children = []
      parent.children.push(node)
    } else {
      roots.push(node)
    }
  })

  return roots
}

function getDescendants(units: DonVi[], parentId: string): string[] {
  const result: string[] = []
  const children = units.filter((u) => u.parentId === parentId)
  children.forEach((c) => {
    result.push(c.id)
    result.push(...getDescendants(units, c.id))
  })
  return result
}

// ─── Component ────────────────────────────────────────────────────────────────
export default function DonViPage() {
  const [data, setData] = useState<DonVi[]>(seedDonVi)
  const [treeView, setTreeView] = useState(true)
  const [searchText, setSearchText] = useState('')
  const [filterLoai, setFilterLoai] = useState<DonViLoai | undefined>()
  const [filterStatus, setFilterStatus] = useState<string | undefined>()
  const [selectedId, setSelectedId] = useState<string | undefined>()
  const [drawerOpen, setDrawerOpen] = useState(false)
  const [drawerMode, setDrawerMode] = useState<'add' | 'edit'>('add')
  const [editRecord, setEditRecord] = useState<DonVi | null>(null)
  const [form] = Form.useForm<DonViFormValues>()
  const [_confirmDeleteId, setConfirmDeleteId] = useState<string | null>(null)

  // Computed
  const tree = useMemo(() => buildTree(data), [data])
  const unitMap = useMemo(() => new Map(data.map((u) => [u.id, u])), [data])
  const selectedUnit = selectedId ? unitMap.get(selectedId) : undefined
  const expandedKeys = useMemo(() => data.map((u) => u.id), [data])

  // Filter logic
  const filteredData = useMemo(() => {
    return data.filter((u) => {
      if (filterLoai && u.loai !== filterLoai) return false
      if (filterStatus && u.trangThai !== filterStatus) return false
      if (searchText) {
        const s = searchText.toLowerCase()
        if (!u.ma.toLowerCase().includes(s) && !u.ten.toLowerCase().includes(s)) return false
      }
      return true
    })
  }, [data, filterLoai, filterStatus, searchText])

  // Stats
  const totalUnits = data.length
  const activeUnits = data.filter((u) => u.trangThai === 'active').length
  const inactiveUnits = data.filter((u) => u.trangThai === 'inactive').length

  // Table columns
  const tableColumns: ColumnsType<DonVi> = [
    {
      title: 'STT',
      key: 'stt',
      width: 60,
      align: 'center',
      render: (_, __, index) => index + 1,
    },
    { title: 'Mã đơn vị', dataIndex: 'ma', key: 'ma', width: 120 },
    { title: 'Tên đơn vị', dataIndex: 'ten', key: 'ten' },
    {
      title: 'Loại',
      dataIndex: 'loai',
      key: 'loai',
      width: 150,
      render: (v: DonViLoai) => (
        <Tag color={LOAI_DON_VI_COLOR[v]}>{LOAI_DON_VI[v]}</Tag>
      ),
    },
    {
      title: 'Thuộc đơn vị',
      dataIndex: 'parentId',
      key: 'parent',
      width: 180,
      render: (v) => (v ? unitMap.get(v)?.ten : <Text type="secondary">—</Text>),
    },
    { title: 'Người phụ trách', dataIndex: 'nguoiQuanLy', key: 'nguoiQuanLy', width: 150 },
    { title: 'Điện thoại', dataIndex: 'dienThoai', key: 'dienThoai', width: 130 },
    {
      title: 'Trạng thái',
      dataIndex: 'trangThai',
      key: 'trangThai',
      width: 120,
      render: (v) => (
        <Tag color={v === 'active' ? 'green' : 'default'}>
          {v === 'active' ? 'Đang sử dụng' : 'Ngừng sử dụng'}
        </Tag>
      ),
    },
    {
      title: 'Thao tác',
      key: 'action',
      width: 140,
      fixed: 'right',
      render: (_, record) => (
        <Space>
          <Tooltip title="Xem chi tiết">
            <Button
              size="small"
              icon={<EyeOutlined />}
              onClick={() => {
                setSelectedId(record.id)
              }}
            />
          </Tooltip>
          <Tooltip title="Sửa">
            <Button
              size="small"
              icon={<EditOutlined />}
              onClick={() => openEdit(record)}
            />
          </Tooltip>
          <Popconfirm
            title="Xóa đơn vị?"
            description={
              getDescendants(data, record.id).length > 0
                ? 'Đơn vị này có đơn vị con. Xóa sẽ xóa cả đơn vị con.'
                : 'Thao tác này không thể hoàn tác.'
            }
            okText="Xóa"
            okButtonProps={{ danger: true }}
            cancelText="Huỷ"
            onConfirm={() => handleDelete(record.id)}
          >
            <Tooltip title="Xóa">
              <Button size="small" danger icon={<DeleteOutlined />} />
            </Tooltip>
          </Popconfirm>
        </Space>
      ),
    },
  ]

  // Handlers
  function openAdd() {
    setDrawerMode('add')
    setEditRecord(null)
    form.resetFields()
    form.setFieldsValue({ trangThai: 'active', loai: 'phongBan' })
    setDrawerOpen(true)
  }

  function openEdit(record: DonVi) {
    setDrawerMode('edit')
    setEditRecord(record)
    form.setFieldsValue({
      ma: record.ma,
      ten: record.ten,
      tenVietTat: (record as any).tenVietTat,
      parentId: record.parentId,
      loai: record.loai,
      nguoiPhuTrach: record.nguoiQuanLy,
      dienThoai: record.dienThoai,
      email: record.email,
      diaChi: record.diaChi,
      moTa: (record as any).moTa,
      trangThai: record.trangThai,
    })
    setDrawerOpen(true)
  }

  function handleSubmit() {
    form.validateFields().then((values) => {
      if (drawerMode === 'add') {
        const newUnit: DonVi = {
          id: `DV${Date.now().toString(36)}`,
          ma: values.ma.trim().toUpperCase(),
          ten: values.ten.trim(),
          loai: values.loai,
          parentId: values.parentId,
          nguoiQuanLy: values.nguoiPhuTrach,
          dienThoai: values.dienThoai,
          email: values.email,
          diaChi: values.diaChi,
          trangThai: values.trangThai,
        }
        setData((prev) => [...prev, newUnit])
        message.success(`Đã thêm đơn vị "${values.ten}"`)
      } else if (editRecord) {
        setData((prev) =>
          prev.map((u) =>
            u.id === editRecord.id
              ? {
                  ...u,
                  ma: values.ma.trim().toUpperCase(),
                  ten: values.ten.trim(),
                  loai: values.loai,
                  parentId: values.parentId,
                  nguoiQuanLy: values.nguoiPhuTrach,
                  dienThoai: values.dienThoai,
                  email: values.email,
                  diaChi: values.diaChi,
                  trangThai: values.trangThai,
                }
              : u,
          ),
        )
        message.success(`Đã cập nhật đơn vị "${values.ten}"`)
      }
      setDrawerOpen(false)
    })
  }

  function handleDelete(id: string) {
    // Remove unit and its children
    const toRemove = new Set([id, ...getDescendants(data, id)])
    setData((prev) => prev.filter((u) => !toRemove.has(u.id)))
    if (selectedId && toRemove.has(selectedId)) {
      setSelectedId(undefined)
    }
    message.success('Đã xóa đơn vị')
    setConfirmDeleteId(null)
  }

  function handleStatusChange(id: string, newStatus: 'active' | 'inactive') {
    // If deactivating a parent, warn if it has active children
    if (newStatus === 'inactive') {
      const children = data.filter((u) => u.parentId === id && u.trangThai === 'active')
      if (children.length > 0) {
        Modal.confirm({
          title: 'Cảnh báo',
          content: `Đơn vị này có ${children.length} đơn vị con đang hoạt động. Tiếp tục sẽ ngừng hoạt động tất cả?`,
          okText: 'Tiếp tục',
          cancelText: 'Huỷ',
          onOk: () => {
            const toUpdate = new Set([id, ...getDescendants(data, id)])
            setData((prev) =>
              prev.map((u) => (toUpdate.has(u.id) ? { ...u, trangThai: 'inactive' } : u)),
            )
            message.success('Đã ngừng sử dụng đơn vị')
          },
        })
        return
      }
    }
    setData((prev) => prev.map((u) => (u.id === id ? { ...u, trangThai: newStatus } : u)))
    message.success(newStatus === 'active' ? 'Đã kích hoạt' : 'Đã ngừng sử dụng')
  }

  return (
    <div>
      <PageHeader
        icon={<ApartmentOutlined style={{ fontSize: 26, color: '#ee0033' }} />}
        title="Danh mục đơn vị"
        extra={
          <Space>
            <Button type="primary" icon={<PlusOutlined />} onClick={openAdd}>
              Thêm đơn vị
            </Button>
          </Space>
        }
      />

      {/* Stats Row */}
      <Row gutter={12} style={{ marginBottom: 16 }}>
        <Col xs={12} sm={6}>
          <StatCard size="small" title="Tổng số đơn vị" value={totalUnits} color="#1890ff" />
        </Col>
        <Col xs={12} sm={6}>
          <StatCard size="small" title="Đang sử dụng" value={activeUnits} color="#52c41a" />
        </Col>
        <Col xs={12} sm={6}>
          <StatCard size="small" title="Ngừng sử dụng" value={inactiveUnits} color="#8c8c8c" />
        </Col>
        <Col xs={12} sm={6}>
          <Card size="small">
            <Space>
              <Text type="secondary">Chế độ xem:</Text>
              <Switch
                checkedChildren="Cây"
                unCheckedChildren="Bảng"
                checked={treeView}
                onChange={setTreeView}
              />
            </Space>
          </Card>
        </Col>
      </Row>

      {/* Search & Filters */}
      <Card size="small" style={{ marginBottom: 16 }}>
        <Row gutter={[12, 12]} align="middle">
          <Col xs={24} sm={12} md={8}>
            <Input.Search
              placeholder="Tìm mã, tên đơn vị..."
              allowClear
              prefix={<SearchOutlined style={{ color: '#8593a3' }} />}
              value={searchText}
              onChange={(e) => setSearchText(e.target.value)}
              onSearch={(v) => setSearchText(v)}
            />
          </Col>
          <Col xs={12} sm={6} md={4}>
            <Select
              placeholder="Loại đơn vị"
              allowClear
              style={{ width: '100%' }}
              value={filterLoai}
              onChange={setFilterLoai}
              options={Object.entries(LOAI_DON_VI).map(([k, v]) => ({ value: k, label: v }))}
            />
          </Col>
          <Col xs={12} sm={6} md={4}>
            <Select
              placeholder="Trạng thái"
              allowClear
              style={{ width: '100%' }}
              value={filterStatus}
              onChange={setFilterStatus}
              options={TRANG_THAI_OPTIONS}
            />
          </Col>
          <Col xs={24} sm={6} md={8}>
            <Text type="secondary">
              Kết quả: <strong>{filteredData.length}</strong> đơn vị
            </Text>
          </Col>
        </Row>
      </Card>

      {/* Main Content */}
      <Row gutter={16}>
        {/* Tree or Table */}
        <Col xs={24} lg={selectedUnit ? 14 : 24}>
          <Card bodyStyle={{ padding: 0 }}>
            {treeView ? (
              <Tree
                treeData={tree}
                expandedKeys={expandedKeys}
                selectedKeys={selectedId ? [selectedId] : []}
                onSelect={(keys) => setSelectedId(keys[0] as string)}
                showLine={{ showLeafIcon: false }}
                style={{ padding: '12px 0', maxHeight: 'calc(100vh - 420px)', overflow: 'auto' }}
                titleRender={(node) => {
                  const u = unitMap.get(node.key as string)
                  if (!u) return node.title as string
                  return (
                    <Space>
                      <BuildOutlined />
                      <Text strong={selectedId === u.id}>{u.ten}</Text>
                      <Tag color={LOAI_DON_VI_COLOR[u.loai]} style={{ marginLeft: 4 }}>
                        {LOAI_DON_VI[u.loai]}
                      </Tag>
                      <Tag color={u.trangThai === 'active' ? 'green' : 'default'}>
                        {u.trangThai === 'active' ? 'Hoạt động' : 'Ngừng'}
                      </Tag>
                    </Space>
                  )
                }}
              />
            ) : (
              <Table
                rowKey="id"
                columns={tableColumns}
                dataSource={filteredData}
                size="small"
                pagination={{
                  pageSize: 10,
                  showSizeChanger: true,
                  pageSizeOptions: [10, 20, 50, 100],
                  showTotal: (total) => `Tổng ${total} dòng`,
                }}
                scroll={{ x: 'max-content', y: 'calc(100vh - 420px)' }}
                onRow={(record) => ({
                  onClick: () => setSelectedId(record.id),
                  style: { cursor: 'pointer' },
                })}
              />
            )}
          </Card>
        </Col>

        {/* Detail Panel */}
        {selectedUnit && (
          <Col xs={24} lg={10}>
            <Card
              title={
                <Space>
                  <BuildOutlined />
                  <span>Chi tiết đơn vị</span>
                </Space>
              }
              extra={
                <Space>
                  <Button
                    size="small"
                    icon={<EditOutlined />}
                    onClick={() => openEdit(selectedUnit)}
                  >
                    Sửa
                  </Button>
                  <Button
                    size="small"
                    onClick={() => setSelectedId(undefined)}
                  >
                    Đóng
                  </Button>
                </Space>
              }
            >
              <Row gutter={[16, 8]}>
                <Col span={12}>
                  <Text type="secondary">Mã đơn vị</Text>
                  <div><Text strong>{selectedUnit.ma}</Text></div>
                </Col>
                <Col span={12}>
                  <Text type="secondary">Loại đơn vị</Text>
                  <div>
                    <Tag color={LOAI_DON_VI_COLOR[selectedUnit.loai]}>
                      {LOAI_DON_VI[selectedUnit.loai]}
                    </Tag>
                  </div>
                </Col>
                <Col span={24}>
                  <Text type="secondary">Tên đơn vị</Text>
                  <div><Text strong>{selectedUnit.ten}</Text></div>
                </Col>
                <Col span={12}>
                  <Text type="secondary">Người phụ trách</Text>
                  <div>{selectedUnit.nguoiQuanLy || '—'}</div>
                </Col>
                <Col span={12}>
                  <Text type="secondary">Điện thoại</Text>
                  <div>{selectedUnit.dienThoai || '—'}</div>
                </Col>
                <Col span={12}>
                  <Text type="secondary">Email</Text>
                  <div>{selectedUnit.email || '—'}</div>
                </Col>
                <Col span={24}>
                  <Text type="secondary">Địa chỉ</Text>
                  <div>{selectedUnit.diaChi || '—'}</div>
                </Col>
                <Col span={12}>
                  <Text type="secondary">Trạng thái</Text>
                  <div>
                    <Tag color={selectedUnit.trangThai === 'active' ? 'green' : 'default'}>
                      {selectedUnit.trangThai === 'active' ? 'Đang sử dụng' : 'Ngừng sử dụng'}
                    </Tag>
                  </div>
                </Col>
                <Col span={12}>
                  <Text type="secondary">Đơn vị cha</Text>
                  <div>
                    {selectedUnit.parentId
                      ? unitMap.get(selectedUnit.parentId)?.ten
                      : <Text type="secondary">—</Text>}
                  </div>
                </Col>
              </Row>

              <div style={{ marginTop: 16, borderTop: '1px solid #f0f0f0', paddingTop: 16 }}>
                <Space>
                  {selectedUnit.trangThai === 'active' ? (
                    <Button
                      size="small"
                      danger
                      onClick={() => handleStatusChange(selectedUnit.id, 'inactive')}
                    >
                      Ngừng sử dụng
                    </Button>
                  ) : (
                    <Button
                      size="small"
                      type="primary"
                      onClick={() => handleStatusChange(selectedUnit.id, 'active')}
                    >
                      Kích hoạt
                    </Button>
                  )}
                  <Popconfirm
                    title="Xóa đơn vị này?"
                    description="Thao tác không thể hoàn tác."
                    okText="Xóa"
                    okButtonProps={{ danger: true }}
                    cancelText="Huỷ"
                    onConfirm={() => handleDelete(selectedUnit.id)}
                  >
                    <Button size="small" danger icon={<DeleteOutlined />}>
                      Xóa
                    </Button>
                  </Popconfirm>
                </Space>
              </div>
            </Card>
          </Col>
        )}
      </Row>

      {/* Add/Edit Drawer */}
      <Drawer
        title={drawerMode === 'add' ? 'Thêm đơn vị mới' : 'Sửa đơn vị'}
        open={drawerOpen}
        onClose={() => setDrawerOpen(false)}
        width={520}
        extra={
          <Space>
            <Button onClick={() => setDrawerOpen(false)}>Huỷ</Button>
            <Button type="primary" onClick={handleSubmit}>
              {drawerMode === 'add' ? 'Thêm mới' : 'Lưu'}
            </Button>
          </Space>
        }
      >
        <Form form={form} layout="vertical" requiredMark="optional">
          <Row gutter={16}>
            <Col span={12}>
              <Form.Item
                name="ma"
                label="Mã đơn vị"
                rules={[
                  { required: true, message: 'Nhập mã đơn vị' },
                  { pattern: /^[A-Z0-9-]+$/, message: 'Chỉ chấp nhận A-Z, 0-9, dấu gạch ngang' },
                ]}
              >
                <Input placeholder="VD: VHT-PKT" />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item
                name="loai"
                label="Loại đơn vị"
                rules={[{ required: true, message: 'Chọn loại đơn vị' }]}
              >
                <Select placeholder="Chọn loại">
                  {Object.entries(LOAI_DON_VI).map(([k, v]) => (
                    <Select.Option key={k} value={k}>{v}</Select.Option>
                  ))}
                </Select>
              </Form.Item>
            </Col>
          </Row>

          <Form.Item
            name="ten"
            label="Tên đơn vị"
            rules={[{ required: true, message: 'Nhập tên đơn vị' }]}
          >
            <Input placeholder="VD: Phòng Kế hoạch Tổng hợp" />
          </Form.Item>

          <Form.Item name="tenVietTat" label="Tên viết tắt">
            <Input placeholder="VD: P.KHTH" />
          </Form.Item>

          <Form.Item name="parentId" label="Đơn vị cha">
            <TreeSelect
              placeholder="Chọn đơn vị cha"
              treeData={tree}
              allowClear
              treeDefaultExpandAll
              value={form.getFieldValue('parentId')}
              onChange={(v) => form.setFieldValue('parentId', v)}
            />
          </Form.Item>

          <Row gutter={16}>
            <Col span={12}>
              <Form.Item name="nguoiPhuTrach" label="Người phụ trách">
                <Input placeholder="Họ tên người phụ trách" />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item name="dienThoai" label="Điện thoại">
                <Input placeholder="VD: 024 3xxx xxxx" />
              </Form.Item>
            </Col>
          </Row>

          <Form.Item name="email" label="Email">
            <Input placeholder="VD: vht@example.com.vn" />
          </Form.Item>

          <Form.Item name="diaChi" label="Địa chỉ">
            <TextArea rows={2} placeholder="Địa chỉ đầy đủ" />
          </Form.Item>

          <Row gutter={16}>
            <Col span={12}>
              <Form.Item name="thuTu" label="Thứ tự hiển thị">
                <Input type="number" placeholder="1" min={1} />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item name="trangThai" label="Trạng thái" initialValue="active">
                <Select>
                  {TRANG_THAI_OPTIONS.map((o) => (
                    <Select.Option key={o.value} value={o.value}>{o.label}</Select.Option>
                  ))}
                </Select>
              </Form.Item>
            </Col>
          </Row>

          <Form.Item name="moTa" label="Mô tả">
            <TextArea rows={3} placeholder="Mô tả thêm về đơn vị này" />
          </Form.Item>
        </Form>
      </Drawer>
    </div>
  )
}