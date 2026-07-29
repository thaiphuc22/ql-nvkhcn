import { useMemo, useState } from 'react'
import { Button, Col, Form, Input, Modal, Popconfirm, Row, Select, Space, Tag, message } from 'antd'
import { EditOutlined, EyeOutlined, HistoryOutlined, PlusOutlined, SendOutlined, StopOutlined, TeamOutlined } from '@ant-design/icons'
import type { ColumnsType } from 'antd/es/table'
import { useNavigate } from 'react-router-dom'
import { PageHeader, StatCard, EntityTable } from '../../components/ui'
import {
  seedHoSoSHTT, TRANG_THAI_SP_COLOR, TRANG_THAI_SP_LABEL, type HoSoSHTT, type TrangThaiSP,
} from '../../data/sanPhamKhcn'
import HistoryDrawer from './HistoryDrawer'

export default function HoSoSHTTList() {
  const navigate = useNavigate()
  const [data, setData] = useState(seedHoSoSHTT)
  const [search, setSearch] = useState('')
  const [modalOpen, setModalOpen] = useState(false)
  const [ownership, setOwnership] = useState<HoSoSHTT | null>(null)
  const [protection, setProtection] = useState<HoSoSHTT | null>(null)
  const [detail, setDetail] = useState<HoSoSHTT | null>(null)
  const [edit, setEdit] = useState<HoSoSHTT | null>(null)
  const [historyOf, setHistoryOf] = useState<HoSoSHTT | null>(null)
  const [form] = Form.useForm()
  const [ownForm] = Form.useForm()
  const [protForm] = Form.useForm()

  const filtered = useMemo(() => {
    const s = search.trim().toLowerCase()
    return data.filter((r) => r.trangThai !== 'deleted' && (
      !s || r.ma.toLowerCase().includes(s) || r.ten.toLowerCase().includes(s) || r.maNV.toLowerCase().includes(s)
    ))
  }, [data, search])

  const openCreate = () => { setEdit(null); form.resetFields(); setModalOpen(true) }
  const openEdit = (r: HoSoSHTT) => { setEdit(r); form.setFieldsValue(r); setModalOpen(true) }

  const save = async () => {
    const v = await form.validateFields()
    if (edit) {
      setData((prev) => prev.map((x) => x.id === edit.id ? {
        ...x, ...v, updatedAt: new Date().toLocaleDateString('vi-VN'),
        history: [...x.history, { at: new Date().toLocaleString('vi-VN'), actor: 'Người dùng hiện tại', action: 'Chỉnh sửa' }],
      } : x))
      message.success('Đã cập nhật hồ sơ SHTT')
    } else {
      const id = `IP${String(data.length + 1).padStart(3, '0')}`
      setData((prev) => [{
        id, ma: v.ma, ten: v.ten, loai: v.loai, maNV: v.maNV, tenNV: v.tenNV,
        tacGia: v.tacGia, chuSoHuu: v.chuSoHuu, tyLeQuyen: v.tyLeQuyen || 'VHT 100%',
        trangThaiBaoHo: 'Chưa đăng ký', trangThai: 'draft',
        updatedAt: new Date().toLocaleDateString('vi-VN'),
        history: [{ at: new Date().toLocaleString('vi-VN'), actor: 'Người dùng hiện tại', action: 'Tạo mới' }],
      }, ...prev])
      message.success('Đã tạo hồ sơ sở hữu trí tuệ')
    }
    setModalOpen(false)
  }

  const submit = (r: HoSoSHTT) => {
    setData((prev) => prev.map((x) => x.id === r.id ? {
      ...x, trangThai: 'submitted' as TrangThaiSP,
      history: [...x.history, { at: new Date().toLocaleString('vi-VN'), actor: 'Người dùng hiện tại', action: 'Trình duyệt' }],
    } : x))
    message.success('Đã trình duyệt hồ sơ SHTT')
  }

  const softDelete = (r: HoSoSHTT) => {
    setData((prev) => prev.map((x) => x.id === r.id ? {
      ...x, trangThai: 'inactive' as TrangThaiSP,
      history: [...x.history, { at: new Date().toLocaleString('vi-VN'), actor: 'Người dùng hiện tại', action: 'Xóa sử dụng' }],
    } : x))
    message.success('Đã ngừng sử dụng hồ sơ')
  }

  const saveOwnership = async () => {
    if (!ownership) return
    const v = await ownForm.validateFields()
    setData((prev) => prev.map((x) => x.id === ownership.id ? {
      ...x, tacGia: v.tacGia, chuSoHuu: v.chuSoHuu, tyLeQuyen: v.tyLeQuyen,
      history: [...x.history, { at: new Date().toLocaleString('vi-VN'), actor: 'Người dùng hiện tại', action: 'Cập nhật quyền sở hữu' }],
    } : x))
    message.success('Đã cập nhật tác giả/chủ sở hữu/tỷ lệ quyền')
    setOwnership(null)
  }

  const saveProtection = async () => {
    if (!protection) return
    const v = await protForm.validateFields()
    setData((prev) => prev.map((x) => x.id === protection.id ? {
      ...x, ...v,
      history: [...x.history, { at: new Date().toLocaleString('vi-VN'), actor: 'Người dùng hiện tại', action: 'Cập nhật trạng thái bảo hộ' }],
    } : x))
    message.success('Đã cập nhật trạng thái đơn/văn bằng bảo hộ')
    setProtection(null)
  }

  const cols: ColumnsType<HoSoSHTT> = [
    { title: 'Mã', dataIndex: 'ma', width: 130, render: (v) => <code>{v}</code> },
    { title: 'Tên hồ sơ', dataIndex: 'ten', ellipsis: true },
    { title: 'Loại', dataIndex: 'loai', width: 130 },
    { title: 'Nhiệm vụ', dataIndex: 'maNV', width: 120, render: (v) => <a onClick={() => navigate(`/nhiem-vu/${encodeURIComponent(v)}`)}>{v}</a> },
    { title: 'Bảo hộ', dataIndex: 'trangThaiBaoHo', width: 140 },
    { title: 'Trạng thái', dataIndex: 'trangThai', width: 130, render: (v: TrangThaiSP) => <Tag color={TRANG_THAI_SP_COLOR[v]}>{TRANG_THAI_SP_LABEL[v]}</Tag> },
    {
      title: 'Thao tác', key: 'act', width: 260, fixed: 'right',
      render: (_, r) => (
        <Space size={0} wrap>
          <Button type="link" size="small" icon={<EyeOutlined />} onClick={() => setDetail(r)} />
          <Button type="link" size="small" icon={<EditOutlined />} onClick={() => openEdit(r)} />
          <Button type="link" size="small" icon={<TeamOutlined />} onClick={() => { setOwnership(r); ownForm.setFieldsValue(r) }} title="Quyền sở hữu" />
          <Button type="link" size="small" onClick={() => { setProtection(r); protForm.setFieldsValue(r) }}>Bảo hộ</Button>
          {r.trangThai === 'draft' || r.trangThai === 'active' ? (
            <Button type="link" size="small" icon={<SendOutlined />} onClick={() => submit(r)}>Trình duyệt</Button>
          ) : null}
          <Button type="link" size="small" icon={<HistoryOutlined />} onClick={() => setHistoryOf(r)} />
          <Popconfirm title="Ngừng sử dụng hồ sơ này?" onConfirm={() => softDelete(r)}>
            <Button type="link" size="small" danger icon={<StopOutlined />} />
          </Popconfirm>
        </Space>
      ),
    },
  ]

  return (
    <div>
      <PageHeader
        title="Hồ sơ sở hữu trí tuệ"
        breadcrumb={[{ label: 'Quản trị KHCN', to: '/nhiem-vu' }, { label: 'Sở hữu trí tuệ' }]}
        extra={<Button type="primary" icon={<PlusOutlined />} onClick={openCreate}>Tạo mới</Button>}
      />
      <Row gutter={12} style={{ marginBottom: 16 }}>
        <Col span={6}><StatCard title="Tổng hồ sơ" value={filtered.length} /></Col>
        <Col span={6}><StatCard title="Đã trình duyệt" value={filtered.filter((x) => x.trangThai === 'submitted').length} color="#daa520" /></Col>
        <Col span={6}><StatCard title="Đã nộp đơn" value={filtered.filter((x) => !!x.soDon).length} color="#006e0d" /></Col>
        <Col span={6}><StatCard title="Chưa đăng ký" value={filtered.filter((x) => x.trangThaiBaoHo === 'Chưa đăng ký').length} /></Col>
      </Row>
      <Input.Search placeholder="Tìm mã, tên, mã NV..." allowClear style={{ maxWidth: 360, marginBottom: 12 }} onSearch={setSearch} onChange={(e) => !e.target.value && setSearch('')} />
      <EntityTable rowKey="id" columns={cols} dataSource={filtered} />

      <Modal open={modalOpen} title={edit ? 'Chỉnh sửa hồ sơ SHTT' : 'Tạo mới hồ sơ SHTT'} onCancel={() => setModalOpen(false)} onOk={save} width={720} destroyOnClose>
        <Form form={form} layout="vertical">
          <Row gutter={12}>
            <Col span={8}><Form.Item name="ma" label="Mã hồ sơ" rules={[{ required: true }]}><Input /></Form.Item></Col>
            <Col span={16}><Form.Item name="ten" label="Tên hồ sơ" rules={[{ required: true }]}><Input /></Form.Item></Col>
            <Col span={8}><Form.Item name="loai" label="Loại" rules={[{ required: true }]}><Select options={['Sáng chế', 'Giải pháp hữu ích', 'Bản quyền phần mềm', 'Nhãn hiệu'].map((x) => ({ value: x, label: x }))} /></Form.Item></Col>
            <Col span={8}><Form.Item name="maNV" label="Mã nhiệm vụ" rules={[{ required: true }]}><Input /></Form.Item></Col>
            <Col span={8}><Form.Item name="tyLeQuyen" label="Tỷ lệ quyền"><Input placeholder="VHT 100%" /></Form.Item></Col>
            <Col span={24}><Form.Item name="tenNV" label="Tên nhiệm vụ" rules={[{ required: true }]}><Input /></Form.Item></Col>
            <Col span={12}><Form.Item name="tacGia" label="Tác giả" rules={[{ required: true }]}><Input /></Form.Item></Col>
            <Col span={12}><Form.Item name="chuSoHuu" label="Chủ sở hữu" rules={[{ required: true }]}><Input /></Form.Item></Col>
          </Row>
        </Form>
      </Modal>

      <Modal open={!!detail} title="Chi tiết hồ sơ SHTT" onCancel={() => setDetail(null)} footer={<Button onClick={() => setDetail(null)}>Đóng</Button>} width={640}>
        {detail && (
          <Space direction="vertical" style={{ width: '100%' }}>
            <div><b>Mã:</b> {detail.ma}</div>
            <div><b>Tên:</b> {detail.ten}</div>
            <div><b>Loại:</b> {detail.loai}</div>
            <div><b>Nhiệm vụ:</b> {detail.maNV} — {detail.tenNV}</div>
            <div><b>Tác giả:</b> {detail.tacGia}</div>
            <div><b>Chủ sở hữu:</b> {detail.chuSoHuu}</div>
            <div><b>Tỷ lệ quyền:</b> {detail.tyLeQuyen}</div>
            <div><b>Bảo hộ:</b> {detail.trangThaiBaoHo}{detail.soDon ? ` (${detail.soDon})` : ''}</div>
            <div><b>Trạng thái:</b> <Tag color={TRANG_THAI_SP_COLOR[detail.trangThai]}>{TRANG_THAI_SP_LABEL[detail.trangThai]}</Tag></div>
          </Space>
        )}
      </Modal>

      <Modal open={!!ownership} title="Quản lý tác giả, chủ sở hữu và tỷ lệ quyền" onCancel={() => setOwnership(null)} onOk={saveOwnership} destroyOnClose>
        <Form form={ownForm} layout="vertical">
          <Form.Item name="tacGia" label="Tác giả" rules={[{ required: true }]}><Input.TextArea rows={2} /></Form.Item>
          <Form.Item name="chuSoHuu" label="Chủ sở hữu" rules={[{ required: true }]}><Input /></Form.Item>
          <Form.Item name="tyLeQuyen" label="Tỷ lệ quyền" rules={[{ required: true }]}><Input placeholder="VHT 70% / Đơn vị 30%" /></Form.Item>
        </Form>
      </Modal>

      <Modal open={!!protection} title="Theo dõi trạng thái đơn và văn bằng bảo hộ" onCancel={() => setProtection(null)} onOk={saveProtection} destroyOnClose>
        <Form form={protForm} layout="vertical">
          <Form.Item name="trangThaiBaoHo" label="Trạng thái bảo hộ" rules={[{ required: true }]}>
            <Select options={['Chưa đăng ký', 'Đã nộp đơn', 'Đang thẩm định', 'Được cấp bằng', 'Từ chối'].map((x) => ({ value: x, label: x }))} />
          </Form.Item>
          <Form.Item name="soDon" label="Số đơn"><Input /></Form.Item>
          <Form.Item name="ngayNop" label="Ngày nộp"><Input placeholder="dd/MM/yyyy" /></Form.Item>
        </Form>
      </Modal>

      <HistoryDrawer open={!!historyOf} title={historyOf?.ten ?? ''} entries={historyOf?.history ?? []} onClose={() => setHistoryOf(null)} />
    </div>
  )
}
