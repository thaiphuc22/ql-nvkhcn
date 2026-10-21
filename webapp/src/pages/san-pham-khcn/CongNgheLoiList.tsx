import { useMemo, useState } from 'react'
import {
  Button, Col, Descriptions, Form, Input, Modal, Popconfirm, Row, Select, Space, Tag, message,
} from 'antd'
import { EditOutlined, EyeOutlined, HistoryOutlined, PlusOutlined, StopOutlined } from '@ant-design/icons'
import type { ColumnsType } from 'antd/es/table'
import { useNavigate } from 'react-router-dom'
import { PageHeader, StatCard, EntityTable } from '../../components/ui'
import {
  KY_THONG_KE_OPTS,
  TRANG_THAI_SP_COLOR,
  TRANG_THAI_SP_LABEL,
  seedCongNgheLoi,
  type CongNgheLoi,
  type TrangThaiSP,
} from '../../data/sanPhamKhcn'
import HistoryDrawer from './HistoryDrawer'

export default function CongNgheLoiList() {
  const navigate = useNavigate()
  const [data, setData] = useState(seedCongNgheLoi)
  const [search, setSearch] = useState('')
  const [modalOpen, setModalOpen] = useState(false)
  const [detail, setDetail] = useState<CongNgheLoi | null>(null)
  const [edit, setEdit] = useState<CongNgheLoi | null>(null)
  const [historyOf, setHistoryOf] = useState<CongNgheLoi | null>(null)
  const [form] = Form.useForm()

  const filtered = useMemo(() => {
    const s = search.trim().toLowerCase()
    return data.filter((r) => r.trangThai !== 'deleted' && (
      !s
      || r.ma.toLowerCase().includes(s)
      || r.ten.toLowerCase().includes(s)
      || r.maNV.toLowerCase().includes(s)
      || (r.donViChu ?? '').toLowerCase().includes(s)
      || (r.sanPhamUngDung ?? '').toLowerCase().includes(s)
    ))
  }, [data, search])

  const openCreate = () => {
    setEdit(null)
    form.resetFields()
    form.setFieldsValue({ mucDoChinMuoi: 'TRL 4', trangThaiChuyenGiao: 'Nghiên cứu', kyThongKe: 'quy' })
    setModalOpen(true)
  }
  const openEdit = (r: CongNgheLoi) => { setEdit(r); form.setFieldsValue(r); setModalOpen(true) }

  const save = async () => {
    const v = await form.validateFields()
    if (edit) {
      setData((prev) => prev.map((x) => x.id === edit.id ? {
        ...x, ...v, updatedAt: new Date().toLocaleDateString('vi-VN'),
        history: [...x.history, { at: new Date().toLocaleString('vi-VN'), actor: 'Người dùng hiện tại', action: 'Chỉnh sửa' }],
      } : x))
      message.success('Đã cập nhật công nghệ lõi')
    } else {
      const id = `CN${String(data.length + 1).padStart(3, '0')}`
      setData((prev) => [{
        id,
        ...v,
        trangThai: 'draft' as TrangThaiSP,
        updatedAt: new Date().toLocaleDateString('vi-VN'),
        history: [{ at: new Date().toLocaleString('vi-VN'), actor: 'Người dùng hiện tại', action: 'Ghi nhận công nghệ lõi' }],
      }, ...prev])
      message.success('Đã ghi nhận công nghệ lõi')
    }
    setModalOpen(false)
  }

  const softDelete = (r: CongNgheLoi) => {
    setData((prev) => prev.map((x) => x.id === r.id ? {
      ...x, trangThai: 'inactive' as TrangThaiSP,
      history: [...x.history, { at: new Date().toLocaleString('vi-VN'), actor: 'Người dùng hiện tại', action: 'Xóa sử dụng' }],
    } : x))
    message.success('Đã ngừng sử dụng công nghệ')
  }

  const cols: ColumnsType<CongNgheLoi> = [
    { title: 'Mã', dataIndex: 'ma', width: 120, render: (v) => <code>{v}</code> },
    { title: 'Tên công nghệ lõi', dataIndex: 'ten', ellipsis: true },
    { title: 'Đơn vị chủ CNL', dataIndex: 'donViChu', width: 150, ellipsis: true, render: (v) => v || '—' },
    { title: 'SP ứng dụng', dataIndex: 'sanPhamUngDung', width: 180, ellipsis: true, render: (v) => v || '—' },
    { title: 'Hoàn thành', dataIndex: 'thoiGianHoanThanh', width: 100, render: (v) => v || '—' },
    { title: 'Nhiệm vụ', dataIndex: 'maNV', width: 110, render: (v) => <a onClick={() => navigate(`/nhiem-vu/${encodeURIComponent(v)}`)}>{v}</a> },
    { title: 'TRL', dataIndex: 'mucDoChinMuoi', width: 80 },
    { title: 'Trạng thái', dataIndex: 'trangThai', width: 120, render: (v: TrangThaiSP) => <Tag color={TRANG_THAI_SP_COLOR[v]}>{TRANG_THAI_SP_LABEL[v]}</Tag> },
    {
      title: 'Thao tác', key: 'act', width: 180, fixed: 'right',
      render: (_, r) => (
        <Space size={0}>
          <Button type="link" size="small" icon={<EyeOutlined />} onClick={() => setDetail(r)} />
          <Button type="link" size="small" icon={<EditOutlined />} onClick={() => openEdit(r)} />
          <Button type="link" size="small" icon={<HistoryOutlined />} onClick={() => setHistoryOf(r)} />
          <Popconfirm title="Ngừng sử dụng công nghệ này?" onConfirm={() => softDelete(r)}>
            <Button type="link" size="small" danger icon={<StopOutlined />} />
          </Popconfirm>
        </Space>
      ),
    },
  ]

  return (
    <div>
      <PageHeader
        title="Quản lý công nghệ lõi"
        breadcrumb={[{ label: 'Quản trị KHCN', to: '/nhiem-vu' }, { label: 'Công nghệ lõi' }]}
        extra={<Button type="primary" icon={<PlusOutlined />} onClick={openCreate}>Ghi nhận từ nhiệm vụ</Button>}
      />
      <Row gutter={12} style={{ marginBottom: 16 }}>
        <Col span={6}><StatCard title="Tổng công nghệ" value={filtered.length} /></Col>
        <Col span={6}><StatCard title="Sẵn sàng CG" value={filtered.filter((x) => x.trangThaiChuyenGiao.includes('Sẵn sàng')).length} color="#006e0d" /></Col>
        <Col span={6}><StatCard title="Đang hoàn thiện" value={filtered.filter((x) => x.trangThaiChuyenGiao.includes('hoàn thiện')).length} color="#daa520" /></Col>
        <Col span={6}><StatCard title="Nghiên cứu" value={filtered.filter((x) => x.trangThaiChuyenGiao === 'Nghiên cứu').length} /></Col>
      </Row>
      <Input.Search placeholder="Tìm mã, tên, đơn vị, SP ứng dụng, mã NV..." allowClear style={{ maxWidth: 440, marginBottom: 12 }} onSearch={setSearch} onChange={(e) => !e.target.value && setSearch('')} />
      <EntityTable rowKey="id" columns={cols} dataSource={filtered} />

      <Modal open={modalOpen} title={edit ? 'Chỉnh sửa công nghệ lõi' : 'Ghi nhận công nghệ lõi từ nhiệm vụ'} onCancel={() => setModalOpen(false)} onOk={save} width={840} destroyOnClose>
        <Form form={form} layout="vertical">
          <Row gutter={12}>
            <Col span={8}><Form.Item name="ma" label="Mã CNL" rules={[{ required: true }]}><Input /></Form.Item></Col>
            <Col span={16}><Form.Item name="ten" label="Tên công nghệ lõi" rules={[{ required: true }]}><Input /></Form.Item></Col>
            <Col span={12}><Form.Item name="donViChu" label="Đơn vị chủ CNL" rules={[{ required: true }]}><Input /></Form.Item></Col>
            <Col span={12}><Form.Item name="thoiGianHoanThanh" label="Thời gian hoàn thành CNL" rules={[{ required: true }]}><Input placeholder="MM/YYYY hoặc dd/MM/yyyy" /></Form.Item></Col>
            <Col span={24}><Form.Item name="sanPhamUngDung" label="Sản phẩm ứng dụng CNL" rules={[{ required: true }]}><Input.TextArea rows={2} placeholder="Liệt kê SP gắn với CNL" /></Form.Item></Col>
            <Col span={8}><Form.Item name="maNV" label="Mã nhiệm vụ" rules={[{ required: true }]}><Input /></Form.Item></Col>
            <Col span={16}><Form.Item name="tenNV" label="Tên nhiệm vụ" rules={[{ required: true }]}><Input /></Form.Item></Col>
            <Col span={8}><Form.Item name="linhVuc" label="Lĩnh vực" rules={[{ required: true }]}><Input /></Form.Item></Col>
            <Col span={8}><Form.Item name="mucDoChinMuoi" label="Mức độ chín muồi (TRL)" rules={[{ required: true }]}>
              <Select options={['TRL 1', 'TRL 2', 'TRL 3', 'TRL 4', 'TRL 5', 'TRL 6', 'TRL 7', 'TRL 8', 'TRL 9'].map((x) => ({ value: x, label: x }))} />
            </Form.Item></Col>
            <Col span={8}><Form.Item name="trangThaiChuyenGiao" label="Trạng thái chuyển giao" rules={[{ required: true }]}>
              <Select options={['Nghiên cứu', 'Đang hoàn thiện', 'Sẵn sàng chuyển giao nội bộ', 'Đã chuyển giao'].map((x) => ({ value: x, label: x }))} />
            </Form.Item></Col>
            <Col span={12}><Form.Item name="donViTiepNhan" label="Đơn vị tiếp nhận"><Input /></Form.Item></Col>
            <Col span={6}><Form.Item name="thoiGianTinhChiTieu" label="Thời gian tính chỉ tiêu BC"><Input placeholder="VD: Quý 2/2026" /></Form.Item></Col>
            <Col span={6}><Form.Item name="kyThongKe" label="Kỳ thống kê"><Select options={KY_THONG_KE_OPTS} allowClear /></Form.Item></Col>
            <Col span={24}><Form.Item name="ghiChuThongKe" label="Ghi chú dữ liệu thống kê"><Input.TextArea rows={2} /></Form.Item></Col>
          </Row>
        </Form>
      </Modal>

      <Modal open={!!detail} title="Chi tiết công nghệ lõi" onCancel={() => setDetail(null)} footer={<Button onClick={() => setDetail(null)}>Đóng</Button>} width={720}>
        {detail && (
          <Descriptions column={2} size="small" bordered>
            <Descriptions.Item label="Mã">{detail.ma}</Descriptions.Item>
            <Descriptions.Item label="TRL">{detail.mucDoChinMuoi}</Descriptions.Item>
            <Descriptions.Item label="Tên CNL" span={2}>{detail.ten}</Descriptions.Item>
            <Descriptions.Item label="Đơn vị chủ CNL">{detail.donViChu || '—'}</Descriptions.Item>
            <Descriptions.Item label="Hoàn thành">{detail.thoiGianHoanThanh || '—'}</Descriptions.Item>
            <Descriptions.Item label="SP ứng dụng" span={2}>{detail.sanPhamUngDung || '—'}</Descriptions.Item>
            <Descriptions.Item label="Nhiệm vụ nguồn" span={2}>{detail.maNV} — {detail.tenNV}</Descriptions.Item>
            <Descriptions.Item label="Lĩnh vực">{detail.linhVuc}</Descriptions.Item>
            <Descriptions.Item label="Chuyển giao">{detail.trangThaiChuyenGiao}</Descriptions.Item>
            <Descriptions.Item label="Đơn vị tiếp nhận">{detail.donViTiepNhan || '—'}</Descriptions.Item>
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
