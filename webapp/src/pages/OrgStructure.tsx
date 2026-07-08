import { useMemo, useState } from 'react'
import {
  Avatar,
  Button,
  Card,
  Col,
  Empty,
  Form,
  Input,
  Modal,
  Popconfirm,
  Row,
  Select,
  Space,
  Tag,
  Tooltip,
  Tree,
  Typography,
  message,
} from 'antd'
import {
  ApartmentOutlined,
  DeleteOutlined,
  EditOutlined,
  PlusOutlined,
  TeamOutlined,
  UserAddOutlined,
  UserDeleteOutlined,
} from '@ant-design/icons'
import type { ColumnsType } from 'antd/es/table'
import type { DataNode } from 'antd/es/tree'
import {
  ORG_LOAI_LABEL,
  buildOrgTree,
  orgUnits as seedUnits,
  type OrgTreeNode,
  type OrgUnit,
} from '../data/orgUnits'
import { users as seedAppUsers, type AppUser } from '../data/users'
import HelpButton from '../components/HelpButton'
import { PageHeader, StatCard, EntityTable } from '../components/ui'

const { Text } = Typography

/** Chữ cái đầu của họ tên → nhãn avatar (tối đa 2 ký tự). */
function initials(name: string): string {
  const parts = name.trim().split(/\s+/)
  const first = parts[0]?.[0] ?? ''
  const last = parts.length > 1 ? parts[parts.length - 1][0] : ''
  return (first + last).toUpperCase()
}

/** Ánh xạ ban đầu userId → unitId dựa trên donVi khớp tên đơn vị. */
function seedMembership(units: OrgUnit[], list: AppUser[]): Record<string, string> {
  const byName = new Map(units.map((u) => [u.name, u.id]))
  const m: Record<string, string> = {}
  list.forEach((u) => {
    const id = byName.get(u.donVi)
    if (id) m[u.id] = id
  })
  return m
}

interface UnitFormValues {
  name: string
  code: string
  loai: OrgUnit['loai']
  parentId: string
}

export default function OrgStructure() {
  const [units, setUnits] = useState<OrgUnit[]>(seedUnits)
  const [membership, setMembership] = useState<Record<string, string>>(() =>
    seedMembership(seedUnits, seedAppUsers),
  )
  const [selectedId, setSelectedId] = useState<string>(seedUnits[0]?.id ?? '')

  // Modal thêm/sửa đơn vị
  const [unitModal, setUnitModal] = useState<{ mode: 'add' | 'edit'; unit?: OrgUnit } | null>(null)
  const [unitForm] = Form.useForm<UnitFormValues>()
  // Modal thêm người dùng vào đơn vị
  const [addUserOpen, setAddUserOpen] = useState(false)
  const [pickedUsers, setPickedUsers] = useState<string[]>([])

  const tree = useMemo(() => buildOrgTree(units), [units])
  const expandedKeys = useMemo(() => units.map((u) => u.id), [units])

  const selectedUnit = units.find((u) => u.id === selectedId)
  const unitById = useMemo(() => new Map(units.map((u) => [u.id, u])), [units])

  const members = useMemo(
    () => seedAppUsers.filter((u) => membership[u.id] === selectedId),
    [membership, selectedId],
  )
  const assignedCount = useMemo(() => Object.keys(membership).length, [membership])

  // Người dùng có thể thêm vào đơn vị đang chọn = những ai chưa thuộc đơn vị này.
  const addableUsers = useMemo(
    () => seedAppUsers.filter((u) => membership[u.id] !== selectedId),
    [membership, selectedId],
  )

  function openAddUnit(parentId?: string) {
    const pid = parentId ?? selectedId ?? units[0]?.id
    if (!pid) return
    unitForm.resetFields()
    unitForm.setFieldsValue({ loai: 'don-vi', parentId: pid })
    setUnitModal({ mode: 'add' })
  }

  function openEditUnit(unit: OrgUnit) {
    unitForm.setFieldsValue({
      name: unit.name,
      code: unit.code,
      loai: unit.loai,
      parentId: unit.parentId ?? '',
    })
    setUnitModal({ mode: 'edit', unit })
  }

  function submitUnit() {
    unitForm.validateFields().then((v) => {
      if (unitModal?.mode === 'add') {
        const id = `U${Date.now().toString(36)}`
        setUnits((prev) => [
          ...prev,
          { id, name: v.name.trim(), code: v.code.trim(), loai: v.loai, parentId: v.parentId },
        ])
        setSelectedId(id)
        message.success('Đã thêm đơn vị con.')
      } else if (unitModal?.unit) {
        const target = unitModal.unit.id
        setUnits((prev) =>
          prev.map((u) =>
            u.id === target
              ? { ...u, name: v.name.trim(), code: v.code.trim(), loai: v.loai }
              : u,
          ),
        )
        message.success('Đã cập nhật đơn vị.')
      }
      setUnitModal(null)
    })
  }

  function deleteUnit(unit: OrgUnit) {
    const hasChild = units.some((u) => u.parentId === unit.id)
    if (hasChild) {
      message.warning('Đơn vị còn đơn vị con — hãy xoá/chuyển đơn vị con trước.')
      return
    }
    const target = unit.id
    // Gỡ mọi người dùng khỏi đơn vị bị xoá (đưa về "chưa gán").
    setMembership((prev) => {
      const next = { ...prev }
      Object.keys(next).forEach((uid) => {
        if (next[uid] === target) delete next[uid]
      })
      return next
    })
    setUnits((prev) => prev.filter((u) => u.id !== target))
    if (selectedId === target) setSelectedId(unit.parentId ?? units[0]?.id ?? '')
    message.success('Đã xoá đơn vị.')
  }

  function confirmAddUsers() {
    if (!pickedUsers.length) {
      setAddUserOpen(false)
      return
    }
    setMembership((prev) => {
      const next = { ...prev }
      pickedUsers.forEach((uid) => {
        next[uid] = selectedId
      })
      return next
    })
    message.success(`Đã thêm ${pickedUsers.length} người dùng vào đơn vị.`)
    setPickedUsers([])
    setAddUserOpen(false)
  }

  function removeMember(uid: string) {
    setMembership((prev) => {
      const next = { ...prev }
      delete next[uid]
      return next
    })
    message.success('Đã chuyển người dùng ra khỏi đơn vị.')
  }

  const columns: ColumnsType<AppUser> = [
    {
      title: 'Họ tên',
      dataIndex: 'hoTen',
      render: (v: string) => (
        <Space size={10}>
          <Avatar style={{ background: '#ffdad8', color: '#bf0027', fontWeight: 700 }} size="small">
            {initials(v)}
          </Avatar>
          <span style={{ fontWeight: 600 }}>{v}</span>
        </Space>
      ),
    },
    {
      title: 'Email',
      dataIndex: 'email',
      width: 200,
      render: (v: string) => <Text code>{v}</Text>,
    },
    {
      title: 'Vai trò',
      dataIndex: 'vaiTro',
      render: (roles: string[]) => (
        <Space size={[6, 6]} wrap>
          {roles.map((r) => (
            <Tag key={r} color="processing" bordered>
              {r}
            </Tag>
          ))}
        </Space>
      ),
    },
    {
      title: '',
      key: 'action',
      width: 120,
      align: 'right',
      render: (_v, r) => (
        <Popconfirm
          title="Chuyển người dùng ra khỏi đơn vị?"
          okText="Chuyển ra"
          cancelText="Huỷ"
          okButtonProps={{ danger: true }}
          onConfirm={() => removeMember(r.id)}
        >
          <Button type="link" size="small" danger icon={<UserDeleteOutlined />}>
            Chuyển ra
          </Button>
        </Popconfirm>
      ),
    },
  ]

  // Dựng node cây kèm cụm icon hành động (hiện khi hover). Tính mỗi lần render để
  // handler luôn bắt đúng state hiện tại (tránh closure cũ).
  const renderNodes = (nodes: OrgTreeNode[]): DataNode[] =>
    nodes.map((n) => {
      const isRootNode = n.parentId == null
      return {
        key: n.id,
        title: (
          <div className="org-node">
            <span className="org-node-label">
              <span style={{ fontWeight: n.loai === 'don-vi' ? 400 : 600 }}>{n.name}</span>
              <Text type="secondary" style={{ fontSize: 11, marginInlineStart: 6 }}>
                {n.code}
              </Text>
            </span>
            {/* stopPropagation: bấm icon không kích hoạt chọn node */}
            <span className="org-node-actions" onClick={(e) => e.stopPropagation()}>
              <Tooltip title="Thêm đơn vị con">
                <Button
                  type="text"
                  size="small"
                  icon={<PlusOutlined />}
                  onClick={() => openAddUnit(n.id)}
                />
              </Tooltip>
              <Tooltip title="Sửa">
                <Button
                  type="text"
                  size="small"
                  icon={<EditOutlined />}
                  onClick={() => openEditUnit(n)}
                />
              </Tooltip>
              <Popconfirm
                title="Xoá đơn vị này?"
                description="Người dùng thuộc đơn vị sẽ trở về trạng thái chưa gán."
                okText="Xoá"
                cancelText="Huỷ"
                okButtonProps={{ danger: true }}
                onConfirm={() => deleteUnit(n)}
                disabled={isRootNode}
              >
                <Tooltip title={isRootNode ? 'Không thể xoá đơn vị gốc' : 'Xoá'}>
                  <Button
                    type="text"
                    size="small"
                    danger
                    icon={<DeleteOutlined />}
                    disabled={isRootNode}
                  />
                </Tooltip>
              </Popconfirm>
            </span>
          </div>
        ),
        children: n.children.length ? renderNodes(n.children) : undefined,
      }
    })
  const treeData = renderNodes(tree)

  return (
    <div>
      <style>{`
        .org-node { display: flex; align-items: center; justify-content: space-between; gap: 8px; width: 100%; }
        .org-node-actions { display: inline-flex; gap: 0; opacity: 0; transition: opacity .15s; }
        .ant-tree-treenode:hover .org-node-actions { opacity: 1; }
      `}</style>
      <PageHeader
        title="Cơ cấu tổ chức"
        icon={<ApartmentOutlined style={{ fontSize: 26, color: 'var(--vht-red)' }} />}
        style={{ marginBottom: 0 }}
        extra={<HelpButton section="donvi" />}
      />

      <Row gutter={14} style={{ margin: '18px 0' }}>
        <Col xs={8}>
          <StatCard title="Đơn vị" value={units.length} color="#1677ff" />
        </Col>
        <Col xs={8}>
          <StatCard title="Đã gán người dùng" value={assignedCount} color="#17935a" />
        </Col>
        <Col xs={8}>
          <StatCard title="Chưa gán" value={seedAppUsers.length - assignedCount} color="#722ed1" />
        </Col>
      </Row>

      <Row gutter={16} align="stretch">
        {/* Section trái — cây tổ chức đơn vị (CRUD) */}
        <Col xs={24} md={9} lg={8}>
          <Card
            title={
              <Space size={8}>
                <ApartmentOutlined />
                Cây tổ chức đơn vị
              </Space>
            }
            styles={{ body: { paddingTop: 12 } }}
            extra={
              <Tooltip title="Thêm đơn vị con (chọn đơn vị cha trong hộp thoại)">
                <Button
                  type="primary"
                  size="small"
                  icon={<PlusOutlined />}
                  onClick={() => openAddUnit()}
                >
                  Thêm
                </Button>
              </Tooltip>
            }
          >
            <Tree
              blockNode
              showLine
              treeData={treeData}
              selectedKeys={selectedId ? [selectedId] : []}
              expandedKeys={expandedKeys}
              onSelect={(keys) => keys[0] && setSelectedId(String(keys[0]))}
            />
          </Card>
        </Col>

        {/* Section phải — người dùng thuộc đơn vị (CRUD) */}
        <Col xs={24} md={15} lg={16}>
          <Card
            title={
              <Space size={8}>
                <TeamOutlined />
                {selectedUnit ? (
                  <span>
                    Người dùng — {selectedUnit.name}{' '}
                    <Tag style={{ marginInlineStart: 4 }}>{ORG_LOAI_LABEL[selectedUnit.loai]}</Tag>
                  </span>
                ) : (
                  'Người dùng'
                )}
              </Space>
            }
            extra={
              <Button
                type="primary"
                icon={<UserAddOutlined />}
                onClick={() => {
                  setPickedUsers([])
                  setAddUserOpen(true)
                }}
                disabled={!selectedUnit}
              >
                Thêm người dùng
              </Button>
            }
          >
            {selectedUnit ? (
              <EntityTable<AppUser>
                rowKey="id"
                columns={columns}
                dataSource={members}
                emptyText="Đơn vị chưa có người dùng. Bấm “Thêm người dùng” để gán."
              />
            ) : (
              <Empty description="Chọn một đơn vị ở cây bên trái" />
            )}
          </Card>
        </Col>
      </Row>

      {/* Modal thêm/sửa đơn vị */}
      <Modal
        open={!!unitModal}
        title={unitModal?.mode === 'edit' ? 'Sửa đơn vị' : 'Thêm đơn vị con'}
        okText={unitModal?.mode === 'edit' ? 'Lưu' : 'Thêm'}
        cancelText="Huỷ"
        onOk={submitUnit}
        onCancel={() => setUnitModal(null)}
        forceRender
      >
        <Form form={unitForm} layout="vertical" style={{ marginTop: 12 }}>
          {unitModal?.mode === 'add' && (
            <Form.Item
              name="parentId"
              label="Đơn vị cha"
              rules={[{ required: true, message: 'Chọn đơn vị cha' }]}
            >
              <Select
                showSearch
                optionFilterProp="label"
                placeholder="Chọn đơn vị cha..."
                options={units.map((u) => ({
                  value: u.id,
                  label: `${u.name} (${u.code})`,
                }))}
              />
            </Form.Item>
          )}
          <Form.Item
            name="name"
            label="Tên đơn vị"
            rules={[{ required: true, message: 'Nhập tên đơn vị' }]}
          >
            <Input placeholder="VD: Trung tâm Nghiên cứu" />
          </Form.Item>
          <Form.Item
            name="code"
            label="Mã đơn vị"
            rules={[{ required: true, message: 'Nhập mã đơn vị' }]}
          >
            <Input placeholder="VD: TTNC" />
          </Form.Item>
          <Form.Item name="loai" label="Loại đơn vị" rules={[{ required: true }]}>
            <Select
              options={Object.entries(ORG_LOAI_LABEL).map(([value, label]) => ({ value, label }))}
            />
          </Form.Item>
        </Form>
      </Modal>

      {/* Modal thêm người dùng vào đơn vị */}
      <Modal
        open={addUserOpen}
        title={`Thêm người dùng vào: ${selectedUnit?.name ?? ''}`}
        okText="Thêm"
        cancelText="Huỷ"
        onOk={confirmAddUsers}
        onCancel={() => setAddUserOpen(false)}
        destroyOnClose
      >
        <Text type="secondary">
          Chọn người dùng để gán vào đơn vị. Người đang thuộc đơn vị khác sẽ được chuyển sang đơn vị
          này.
        </Text>
        <Select
          mode="multiple"
          style={{ width: '100%', marginTop: 12 }}
          placeholder="Chọn người dùng..."
          value={pickedUsers}
          onChange={setPickedUsers}
          optionFilterProp="label"
          options={addableUsers.map((u) => ({
            value: u.id,
            label: `${u.hoTen} — ${u.email}`,
            title: membership[u.id]
              ? `Đang thuộc: ${unitById.get(membership[u.id])?.name ?? ''}`
              : 'Chưa gán đơn vị',
          }))}
        />
      </Modal>
    </div>
  )
}
