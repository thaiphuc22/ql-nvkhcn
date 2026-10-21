import { useMemo, useState } from 'react'
import {
  Button, Col, Descriptions, Form, Input, InputNumber, Modal, Popconfirm, Row, Select, Space, Tag, message,
} from 'antd'
import { EditOutlined, EyeOutlined, HistoryOutlined, PlusOutlined, StopOutlined } from '@ant-design/icons'
import type { ColumnsType } from 'antd/es/table'
import { useNavigate } from 'react-router-dom'
import { PageHeader, StatCard, EntityTable } from '../../components/ui'
import {
  KY_THONG_KE_OPTS,
  TRANG_THAI_SP_COLOR,
  TRANG_THAI_SP_LABEL,
  seedCongBoKhoaHoc,
  type CongBoKhoaHoc,
  type TrangThaiSP,
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
      !s
      || r.ma.toLowerCase().includes(s)
      || r.ten.toLowerCase().includes(s)
      || r.maNV.toLowerCase().includes(s)
      || (r.donViChuQuan ?? '').toLowerCase().includes(s)
      || r.tacGia.toLowerCase().includes(s)
    ))
  }, [data, search])

  const openCreate = () => {
    setEdit(null)
    form.resetFields()
    form.setFieldsValue({ nam: 2026, loai: 'Bài báo', kyThongKe: 'quy' })
    setModalOpen(true)
  }
  const openEdit = (r: CongBoKhoaHoc) => { setEdit(r); form.setFieldsValue(r); setModalOpen(true) }

  const save = async () => {
    const v = await form.validateFields()
    if (edit) {
      setData((prev) => prev.map((x) => x.id === edit.id ? {
        ...x, ...v, updatedAt: new Date().toLocaleDateString('vi-VN'),
        history: [...x.history, { at: new Date().toLocaleString('vi-VN'), actor: 'Người dùng hiện tại', action: 'Chỉnh sửa' }],
      } : x))
      message.success('Đã cập nhật bài báo khoa học')
    } else {
      const id = `CB${String(data.length + 1).padStart(3, '0')}`
      setData((prev) => [{
        id,
        ...v,
        loai: v.loai || 'Bài báo',
        trangThai: 'draft' as TrangThaiSP,
        updatedAt: new Date().toLocaleDateString('vi-VN'),
        history: [{ at: new Date().toLocaleString('vi-VN'), actor: 'Người dùng hiện tại', action: 'Tạo mới' }],
      }, ...prev])
      message.success('Đã tạo bài báo khoa học')
    }
    setModalOpen(false)
  }

  const softDelete = (r: CongBoKhoaHoc) => {
    setData((prev) => prev.map((x) => x.id === r.id ? {
      ...x, trangThai: 'inactive' as TrangThaiSP,
      history: [...x.history, { at: new Date().toLocaleString('vi-VN'), actor: 'Người dùng hiện tại', action: 'Xóa sử dụng' }],
    } : x))
    message.success('Đã ngừng sử dụng bài báo')
  }

  const cols: ColumnsType<CongBoKhoaHoc> = [
    { title: 'Mã', dataIndex: 'ma', width: 120, render: (v) => <code>{v}</code> },
    { title: 'Tên bài báo', dataIndex: 'ten', ellipsis: true },
    { title: 'Đơn vị chủ quản', dataIndex: 'donViChuQuan', width: 160, ellipsis: true, render: (v) => v || '—' },
    { title: 'Tác giả', dataIndex: 'tacGia', width: 150, ellipsis: true },
    { title: 'Tạp chí / hội nghị', dataIndex: 'noiXuatBan', width: 180, ellipsis: true, render: (v) => v || '—' },
    { title: 'Thời gian đăng', dataIndex: 'thoiGianDang', width: 120, render: (v) => v || '—' },
    { title: 'Nhiệm vụ', dataIndex: 'maNV', width: 110, render: (v) => <a onClick={() => navigate(`/nhiem-vu/${encodeURIComponent(v)}`)}>{v}</a> },
    { title: 'Trạng thái', dataIndex: 'trangThai', width: 120, render: (v: TrangThaiSP) => <Tag color={TRANG_THAI_SP_COLOR[v]}>{TRANG_THAI_SP_LABEL[v]}</Tag> },
    {
      title: 'Thao tác', key: 'act', width: 180, fixed: 'right',
      render: (_, r) => (
        <Space size={0}>
          <Button type="link" size="small" icon={<EyeOutlined />} onClick={() => setDetail(r)} />
          <Button type="link" size="small" icon={<EditOutlined />} onClick={() => openEdit(r)} />
          <Button type="link" size="small" icon={<HistoryOutlined />} onClick={() => setHistoryOf(r)} />
          <Popconfirm title="Ngừng sử dụng bài báo này?" onConfirm={() => softDelete(r)}>
            <Button type="link" size="small" danger icon={<StopOutlined />} />
          </Popconfirm>
        </Space>
      ),
    },
  ]

  return (
    <div>
      <PageHeader
        title="Quản lý bài báo khoa học"
        breadcrumb={[{ label: 'Quản trị KHCN', to: '/nhiem-vu' }, { label: 'Bài báo khoa học' }]}
        extra={<Button type="primary" icon={<PlusOutlined />} onClick={openCreate}>Tạo mới</Button>}
      />
      <Row gutter={12} style={{ marginBottom: 16 }}>
        <Col span={6}><StatCard title="Tổng bài báo" value={filtered.length} /></Col>
        <Col span={6}><StatCard title="Đã duyệt" value={filtered.filter((x) => x.trangThai === 'approved').length} color="#006e0d" /></Col>
        <Col span={6}><StatCard title="Đã trình" value={filtered.filter((x) => x.trangThai === 'submitted').length} color="#daa520" /></Col>
        <Col span={6}><StatCard title="Nháp" value={filtered.filter((x) => x.trangThai === 'draft').length} /></Col>
      </Row>
      <Input.Search placeholder="Tìm mã, tên, tác giả, đơn vị, mã NV..." allowClear style={{ maxWidth: 420, marginBottom: 12 }} onSearch={setSearch} onChange={(e) => !e.target.value && setSearch('')} />
      <EntityTable rowKey="id" columns={cols} dataSource={filtered} />

      <Modal open={modalOpen} title={edit ? 'Chỉnh sửa bài báo khoa học' : 'Tạo mới bài báo khoa học'} onCancel={() => setModalOpen(false)} onOk={save} width={840} destroyOnClose>
        <Form form={form} layout="vertical">
          <Row gutter={12}>
            <Col span={8}><Form.Item name="ma" label="Mã bài báo" rules={[{ required: true }]}><Input /></Form.Item></Col>
            <Col span={8}><Form.Item name="donViChuQuan" label="Đơn vị chủ quản BBKH" rules={[{ required: true }]}><Input /></Form.Item></Col>
            <Col span={8}><Form.Item name="nam" label="Năm" rules={[{ required: true }]}><InputNumber style={{ width: '100%' }} min={2000} max={2100} /></Form.Item></Col>
            <Col span={24}><Form.Item name="ten" label="Tên bài báo" rules={[{ required: true }]}><Input /></Form.Item></Col>
            <Col span={8}><Form.Item name="maNV" label="Mã nhiệm vụ" rules={[{ required: true }]}><Input /></Form.Item></Col>
            <Col span={16}><Form.Item name="tenNV" label="Tên nhiệm vụ" rules={[{ required: true }]}><Input /></Form.Item></Col>
            <Col span={12}><Form.Item name="tacGia" label="Tác giả" rules={[{ required: true }]}><Input.TextArea rows={2} /></Form.Item></Col>
            <Col span={12}><Form.Item name="tyLeDongGop" label="Tỷ lệ đóng góp" rules={[{ required: true }]}><Input placeholder="VD: 60% / 40%" /></Form.Item></Col>
            <Col span={12}><Form.Item name="noiXuatBan" label="Tạp chí / hội nghị đăng" rules={[{ required: true }]}><Input /></Form.Item></Col>
            <Col span={12}><Form.Item name="thoiGianDang" label="Thời gian đăng" rules={[{ required: true }]}><Input placeholder="dd/MM/yyyy" /></Form.Item></Col>
            <Col span={8}><Form.Item name="thoiGianTinhChiTieu" label="Thời gian tính chỉ tiêu báo cáo"><Input placeholder="VD: Quý 2/2026" /></Form.Item></Col>
            <Col span={8}><Form.Item name="kyThongKe" label="Kỳ thống kê"><Select options={KY_THONG_KE_OPTS} allowClear /></Form.Item></Col>
            <Col span={8}><Form.Item name="loai" label="Phân loại" hidden initialValue="Bài báo"><Input /></Form.Item></Col>
            <Col span={24}><Form.Item name="ghiChuThongKe" label="Ghi chú dữ liệu thống kê"><Input.TextArea rows={2} /></Form.Item></Col>
          </Row>
        </Form>
      </Modal>

      <Modal open={!!detail} title="Chi tiết bài báo khoa học" onCancel={() => setDetail(null)} footer={<Button onClick={() => setDetail(null)}>Đóng</Button>} width={720}>
        {detail && (
          <Descriptions column={2} size="small" bordered>
            <Descriptions.Item label="Mã">{detail.ma}</Descriptions.Item>
            <Descriptions.Item label="Năm">{detail.nam}</Descriptions.Item>
            <Descriptions.Item label="Tên bài báo" span={2}>{detail.ten}</Descriptions.Item>
            <Descriptions.Item label="Đơn vị chủ quản">{detail.donViChuQuan || '—'}</Descriptions.Item>
            <Descriptions.Item label="Nhiệm vụ">{detail.maNV} — {detail.tenNV}</Descriptions.Item>
            <Descriptions.Item label="Tác giả">{detail.tacGia}</Descriptions.Item>
            <Descriptions.Item label="Tỷ lệ đóng góp">{detail.tyLeDongGop || '—'}</Descriptions.Item>
            <Descriptions.Item label="Tạp chí / hội nghị">{detail.noiXuatBan || '—'}</Descriptions.Item>
            <Descriptions.Item label="Thời gian đăng">{detail.thoiGianDang || '—'}</Descriptions.Item>
            <Descriptions.Item label="Chỉ tiêu BC">{detail.thoiGianTinhChiTieu || '—'}</Descriptions.Item>
            <Descriptions.Item label="Kỳ TK">{KY_THONG_KE_OPTS.find((x) => x.value === detail.kyThongKe)?.label || '—'}</Descriptions.Item>
            <Descriptions.Item label="Trạng thái"><Tag color={TRANG_THAI_SP_COLOR[detail.trangThai]}>{TRANG_THAI_SP_LABEL[detail.trangThai]}</Tag></Descriptions.Item>
          </Descriptions>
        )}
      </Modal>

      <HistoryDrawer open={!!historyOf} title={historyOf?.ten ?? ''} entries={historyOf?.history ?? []} onClose={() => setHistoryOf(null)} />
    </div>
  )
}
