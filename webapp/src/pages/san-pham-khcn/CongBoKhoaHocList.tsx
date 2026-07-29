import { useMemo, useState } from 'react'
import { Button, Col, Form, Input, InputNumber, Modal, Popconfirm, Row, Select, Space, Tag, message } from 'antd'
import { EditOutlined, EyeOutlined, HistoryOutlined, PlusOutlined, StopOutlined } from '@ant-design/icons'
import type { ColumnsType } from 'antd/es/table'
import { useNavigate } from 'react-router-dom'
import { PageHeader, StatCard, EntityTable } from '../../components/ui'
import {
  seedCongBoKhoaHoc, TRANG_THAI_SP_COLOR, TRANG_THAI_SP_LABEL, type CongBoKhoaHoc, type TrangThaiSP,
} from '../../data/sanPhamKhcn'
import HistoryDrawer from './HistoryDrawer'

export default function CongBoKhoaHocList() {
  const navigate = useNavigate()
  const [data, setData] = useState(seedCongBoKhoaHoc)
  const [search, setSearch] = useState('')
  const [modalOpen, setModalOpen] = useState(false)
  const [detail, setDetail] = useState<CongBoKhoaHoc | null>(null)
  const [edit, setEdit] = useState<CongBoKhoaHoc | null>(null)
  const [historyOf, setHistoryOf] = useState<CongBoKhoaHoc | null>(null)
  const [form] = Form.useForm()

  const filtered = useMemo(() => {
    const s = search.trim().toLowerCase()
    return data.filter((r) => r.trangThai !== 'deleted' && (
      !s || r.ma.toLowerCase().includes(s) || r.ten.toLowerCase().includes(s) || r.maNV.toLowerCase().includes(s)
    ))
  }, [data, search])

  const openCreate = () => { setEdit(null); form.resetFields(); setModalOpen(true) }
  const openEdit = (r: CongBoKhoaHoc) => { setEdit(r); form.setFieldsValue(r); setModalOpen(true) }

  const save = async () => {
    const v = await form.validateFields()
    if (edit) {
      setData((prev) => prev.map((x) => x.id === edit.id ? {
        ...x, ...v, updatedAt: new Date().toLocaleDateString('vi-VN'),
        history: [...x.history, { at: new Date().toLocaleString('vi-VN'), actor: 'Người dùng hiện tại', action: 'Chỉnh sửa' }],
      } : x))
      message.success('Đã cập nhật công bố khoa học')
    } else {
      const id = `CB${String(data.length + 1).padStart(3, '0')}`
      setData((prev) => [{
        id, ma: v.ma, ten: v.ten, loai: v.loai, maNV: v.maNV, tenNV: v.tenNV,
        tacGia: v.tacGia, noiXuatBan: v.noiXuatBan, nam: v.nam, trangThai: 'draft',
        updatedAt: new Date().toLocaleDateString('vi-VN'),
        history: [{ at: new Date().toLocaleString('vi-VN'), actor: 'Người dùng hiện tại', action: 'Tạo mới' }],
      }, ...prev])
      message.success('Đã tạo công bố khoa học')
    }
    setModalOpen(false)
  }

  const softDelete = (r: CongBoKhoaHoc) => {
    setData((prev) => prev.map((x) => x.id === r.id ? {
      ...x, trangThai: 'inactive' as TrangThaiSP,
      history: [...x.history, { at: new Date().toLocaleString('vi-VN'), actor: 'Người dùng hiện tại', action: 'Xóa sử dụng' }],
    } : x))
    message.success('Đã ngừng sử dụng công bố')
  }

  const cols: ColumnsType<CongBoKhoaHoc> = [
    { title: 'Mã', dataIndex: 'ma', width: 120, render: (v) => <code>{v}</code> },
    { title: 'Tên', dataIndex: 'ten', ellipsis: true },
    { title: 'Loại', dataIndex: 'loai', width: 140 },
    { title: 'Nhiệm vụ', dataIndex: 'maNV', width: 120, render: (v) => <a onClick={() => navigate(`/nhiem-vu/${encodeURIComponent(v)}`)}>{v}</a> },
    { title: 'Tác giả', dataIndex: 'tacGia', width: 160, ellipsis: true },
    { title: 'Năm', dataIndex: 'nam', width: 80 },
    { title: 'Trạng thái', dataIndex: 'trangThai', width: 130, render: (v: TrangThaiSP) => <Tag color={TRANG_THAI_SP_COLOR[v]}>{TRANG_THAI_SP_LABEL[v]}</Tag> },
    {
      title: 'Thao tác', key: 'act', width: 180, fixed: 'right',
      render: (_, r) => (
        <Space size={0}>
          <Button type="link" size="small" icon={<EyeOutlined />} onClick={() => setDetail(r)} />
          <Button type="link" size="small" icon={<EditOutlined />} onClick={() => openEdit(r)} />
          <Button type="link" size="small" icon={<HistoryOutlined />} onClick={() => setHistoryOf(r)} />
          <Popconfirm title="Ngừng sử dụng công bố này?" onConfirm={() => softDelete(r)}>
            <Button type="link" size="small" danger icon={<StopOutlined />} />
          </Popconfirm>
        </Space>
      ),
    },
  ]

  return (
    <div>
      <PageHeader
        title="Bài báo / Sáng chế / Giải pháp hữu ích"
        breadcrumb={[{ label: 'Quản trị KHCN', to: '/nhiem-vu' }, { label: 'Công bố khoa học' }]}
        extra={<Button type="primary" icon={<PlusOutlined />} onClick={openCreate}>Tạo mới</Button>}
      />
      <Row gutter={12} style={{ marginBottom: 16 }}>
        <Col span={6}><StatCard title="Tổng công bố" value={filtered.length} /></Col>
        <Col span={6}><StatCard title="Bài báo" value={filtered.filter((x) => x.loai === 'Bài báo').length} /></Col>
        <Col span={6}><StatCard title="Sáng chế" value={filtered.filter((x) => x.loai === 'Sáng chế').length} color="#daa520" /></Col>
        <Col span={6}><StatCard title="GPHI" value={filtered.filter((x) => x.loai === 'Giải pháp hữu ích').length} color="#006e0d" /></Col>
      </Row>
      <Input.Search placeholder="Tìm mã, tên, mã NV..." allowClear style={{ maxWidth: 360, marginBottom: 12 }} onSearch={setSearch} onChange={(e) => !e.target.value && setSearch('')} />
      <EntityTable rowKey="id" columns={cols} dataSource={filtered} />

      <Modal open={modalOpen} title={edit ? 'Chỉnh sửa công bố' : 'Tạo mới công bố'} onCancel={() => setModalOpen(false)} onOk={save} width={720} destroyOnClose>
        <Form form={form} layout="vertical" initialValues={{ nam: 2026, loai: 'Bài báo' }}>
          <Row gutter={12}>
            <Col span={8}><Form.Item name="ma" label="Mã" rules={[{ required: true }]}><Input /></Form.Item></Col>
            <Col span={8}><Form.Item name="loai" label="Loại" rules={[{ required: true }]}><Select options={['Bài báo', 'Sáng chế', 'Giải pháp hữu ích'].map((x) => ({ value: x, label: x }))} /></Form.Item></Col>
            <Col span={8}><Form.Item name="nam" label="Năm" rules={[{ required: true }]}><InputNumber style={{ width: '100%' }} min={2000} max={2100} /></Form.Item></Col>
            <Col span={24}><Form.Item name="ten" label="Tên" rules={[{ required: true }]}><Input /></Form.Item></Col>
            <Col span={8}><Form.Item name="maNV" label="Mã nhiệm vụ" rules={[{ required: true }]}><Input /></Form.Item></Col>
            <Col span={16}><Form.Item name="tenNV" label="Tên nhiệm vụ" rules={[{ required: true }]}><Input /></Form.Item></Col>
            <Col span={12}><Form.Item name="tacGia" label="Tác giả" rules={[{ required: true }]}><Input /></Form.Item></Col>
            <Col span={12}><Form.Item name="noiXuatBan" label="Nơi xuất bản"><Input /></Form.Item></Col>
          </Row>
        </Form>
      </Modal>

      <Modal open={!!detail} title="Chi tiết công bố khoa học" onCancel={() => setDetail(null)} footer={<Button onClick={() => setDetail(null)}>Đóng</Button>} width={640}>
        {detail && (
          <Space direction="vertical" style={{ width: '100%' }}>
            <div><b>Mã:</b> {detail.ma}</div>
            <div><b>Tên:</b> {detail.ten}</div>
            <div><b>Loại:</b> {detail.loai}</div>
            <div><b>Nhiệm vụ:</b> {detail.maNV} — {detail.tenNV}</div>
            <div><b>Tác giả:</b> {detail.tacGia}</div>
            <div><b>Nơi xuất bản:</b> {detail.noiXuatBan || '—'}</div>
            <div><b>Năm:</b> {detail.nam}</div>
            <div><b>Trạng thái:</b> <Tag color={TRANG_THAI_SP_COLOR[detail.trangThai]}>{TRANG_THAI_SP_LABEL[detail.trangThai]}</Tag></div>
          </Space>
        )}
      </Modal>

      <HistoryDrawer open={!!historyOf} title={historyOf?.ten ?? ''} entries={historyOf?.history ?? []} onClose={() => setHistoryOf(null)} />
    </div>
  )
}
