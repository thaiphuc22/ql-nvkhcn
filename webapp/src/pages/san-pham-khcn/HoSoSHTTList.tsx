import { useMemo, useState } from 'react'
import {
  Button, Col, Descriptions, Form, Input, Modal, Popconfirm, Row, Select, Space, Tag, message,
} from 'antd'
import { EditOutlined, EyeOutlined, HistoryOutlined, PlusOutlined, SendOutlined, StopOutlined, TeamOutlined } from '@ant-design/icons'
import type { ColumnsType } from 'antd/es/table'
import { useNavigate } from 'react-router-dom'
import { PageHeader, StatCard, EntityTable } from '../../components/ui'
import {
  KY_THONG_KE_OPTS,
  LOAI_SHTT_OPTS,
  TRANG_THAI_DANG_KY_SHTT,
  TRANG_THAI_SP_COLOR,
  TRANG_THAI_SP_LABEL,
  labelLoaiShtt,
  seedHoSoSHTT,
  type HoSoSHTT,
  type TrangThaiSP,
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
      !s
      || r.ma.toLowerCase().includes(s)
      || r.ten.toLowerCase().includes(s)
      || r.maNV.toLowerCase().includes(s)
      || (r.donViChuQuan ?? '').toLowerCase().includes(s)
    ))
  }, [data, search])

  const openCreate = () => {
    setEdit(null)
    form.resetFields()
    form.setFieldsValue({ loai: 'SC', trangThaiBaoHo: 'Chưa đăng ký', kyThongKe: 'quy', tyLeQuyen: 'VHT 100%' })
    setModalOpen(true)
  }
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
        id,
        ...v,
        trangThaiBaoHo: v.trangThaiBaoHo || 'Chưa đăng ký',
        tyLeQuyen: v.tyLeQuyen || 'VHT 100%',
        trangThai: 'draft' as TrangThaiSP,
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
      ...x, ...v,
      history: [...x.history, { at: new Date().toLocaleString('vi-VN'), actor: 'Người dùng hiện tại', action: 'Cập nhật quyền sở hữu' }],
    } : x))
    message.success('Đã cập nhật tác giả / tỷ lệ đóng góp / chủ sở hữu')
    setOwnership(null)
  }

  const saveProtection = async () => {
    if (!protection) return
    const v = await protForm.validateFields()
    setData((prev) => prev.map((x) => x.id === protection.id ? {
      ...x, ...v,
      history: [...x.history, { at: new Date().toLocaleString('vi-VN'), actor: 'Người dùng hiện tại', action: 'Cập nhật trạng thái bảo hộ' }],
    } : x))
    message.success('Đã cập nhật trạng thái đăng ký / văn bằng bảo hộ')
    setProtection(null)
  }

  const cols: ColumnsType<HoSoSHTT> = [
    { title: 'Mã', dataIndex: 'ma', width: 130, render: (v) => <code>{v}</code> },
    { title: 'Tên đăng ký', dataIndex: 'ten', ellipsis: true },
    { title: 'Loại TSTT', dataIndex: 'loai', width: 150, render: (v) => labelLoaiShtt(v) },
    { title: 'Đơn vị chủ quản', dataIndex: 'donViChuQuan', width: 160, ellipsis: true, render: (v) => v || '—' },
    { title: 'Nhiệm vụ', dataIndex: 'maNV', width: 120, render: (v) => <a onClick={() => navigate(`/nhiem-vu/${encodeURIComponent(v)}`)}>{v}</a> },
    { title: 'Trạng thái ĐK', dataIndex: 'trangThaiBaoHo', width: 140, ellipsis: true },
    { title: 'TT hồ sơ', dataIndex: 'trangThai', width: 120, render: (v: TrangThaiSP) => <Tag color={TRANG_THAI_SP_COLOR[v]}>{TRANG_THAI_SP_LABEL[v]}</Tag> },
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
        title="Quản lý sở hữu trí tuệ"
        breadcrumb={[{ label: 'Quản trị KHCN', to: '/nhiem-vu' }, { label: 'Sở hữu trí tuệ' }]}
        extra={<Button type="primary" icon={<PlusOutlined />} onClick={openCreate}>Tạo mới</Button>}
      />
      <Row gutter={12} style={{ marginBottom: 16 }}>
        <Col span={6}><StatCard title="Tổng hồ sơ" value={filtered.length} /></Col>
        <Col span={6}><StatCard title="Đã trình duyệt" value={filtered.filter((x) => x.trangThai === 'submitted').length} color="#daa520" /></Col>
        <Col span={6}><StatCard title="Được bảo hộ" value={filtered.filter((x) => x.trangThaiBaoHo === 'Được bảo hộ').length} color="#006e0d" /></Col>
        <Col span={6}><StatCard title="Chưa đăng ký" value={filtered.filter((x) => x.trangThaiBaoHo === 'Chưa đăng ký').length} /></Col>
      </Row>
      <Input.Search placeholder="Tìm mã, tên, đơn vị, mã NV..." allowClear style={{ maxWidth: 400, marginBottom: 12 }} onSearch={setSearch} onChange={(e) => !e.target.value && setSearch('')} />
      <EntityTable rowKey="id" columns={cols} dataSource={filtered} />

      <Modal open={modalOpen} title={edit ? 'Chỉnh sửa hồ sơ SHTT' : 'Tạo mới hồ sơ SHTT'} onCancel={() => setModalOpen(false)} onOk={save} width={880} destroyOnClose>
        <Form form={form} layout="vertical">
          <Row gutter={12}>
            <Col span={8}><Form.Item name="ma" label="Mã hồ sơ" rules={[{ required: true }]}><Input /></Form.Item></Col>
            <Col span={16}><Form.Item name="ten" label="Tên đăng ký" rules={[{ required: true }]}><Input /></Form.Item></Col>
            <Col span={8}><Form.Item name="loai" label="Loại tài sản trí tuệ" rules={[{ required: true }]}><Select options={LOAI_SHTT_OPTS} /></Form.Item></Col>
            <Col span={8}><Form.Item name="donViChuQuan" label="Đơn vị chủ quản TSTT" rules={[{ required: true }]}><Input /></Form.Item></Col>
            <Col span={8}><Form.Item name="maNV" label="Mã nhiệm vụ" rules={[{ required: true }]}><Input /></Form.Item></Col>
            <Col span={24}><Form.Item name="tenNV" label="Tên nhiệm vụ" rules={[{ required: true }]}><Input /></Form.Item></Col>
            <Col span={12}><Form.Item name="tacGia" label="Tác giả" rules={[{ required: true }]}><Input.TextArea rows={2} /></Form.Item></Col>
            <Col span={12}><Form.Item name="tyLeDongGop" label="Tỷ lệ đóng góp" rules={[{ required: true }]}><Input placeholder="VD: 60% / 40%" /></Form.Item></Col>
            <Col span={12}><Form.Item name="chuSoHuu" label="Chủ sở hữu" rules={[{ required: true }]}><Input /></Form.Item></Col>
            <Col span={12}><Form.Item name="tyLeQuyen" label="Tỷ lệ quyền"><Input placeholder="VHT 100%" /></Form.Item></Col>
            <Col span={8}><Form.Item name="trangThaiBaoHo" label="Trạng thái đăng ký"><Select options={TRANG_THAI_DANG_KY_SHTT.map((x) => ({ value: x, label: x }))} /></Form.Item></Col>
            <Col span={8}><Form.Item name="thoiGianTinhChiTieu" label="Thời gian tính chỉ tiêu báo cáo"><Input placeholder="VD: Quý 2/2026" /></Form.Item></Col>
            <Col span={8}><Form.Item name="kyThongKe" label="Kỳ thống kê"><Select options={KY_THONG_KE_OPTS} allowClear /></Form.Item></Col>
            <Col span={24}><Form.Item name="ghiChuThongKe" label="Ghi chú dữ liệu thống kê"><Input.TextArea rows={2} placeholder="Tuần / tháng / quý / năm / ID…" /></Form.Item></Col>
          </Row>
        </Form>
      </Modal>

      <Modal open={!!detail} title="Chi tiết hồ sơ SHTT" onCancel={() => setDetail(null)} footer={<Button onClick={() => setDetail(null)}>Đóng</Button>} width={760}>
        {detail && (
          <Descriptions column={2} size="small" bordered>
            <Descriptions.Item label="Mã">{detail.ma}</Descriptions.Item>
            <Descriptions.Item label="Loại">{labelLoaiShtt(detail.loai)}</Descriptions.Item>
            <Descriptions.Item label="Tên đăng ký" span={2}>{detail.ten}</Descriptions.Item>
            <Descriptions.Item label="Đơn vị chủ quản">{detail.donViChuQuan || '—'}</Descriptions.Item>
            <Descriptions.Item label="Nhiệm vụ">{detail.maNV} — {detail.tenNV}</Descriptions.Item>
            <Descriptions.Item label="Tác giả">{detail.tacGia}</Descriptions.Item>
            <Descriptions.Item label="Tỷ lệ đóng góp">{detail.tyLeDongGop || '—'}</Descriptions.Item>
            <Descriptions.Item label="Chủ sở hữu">{detail.chuSoHuu}</Descriptions.Item>
            <Descriptions.Item label="Tỷ lệ quyền">{detail.tyLeQuyen}</Descriptions.Item>
            <Descriptions.Item label="Trạng thái ĐK">{detail.trangThaiBaoHo}</Descriptions.Item>
            <Descriptions.Item label="Số đơn">{detail.soDon || '—'}</Descriptions.Item>
            <Descriptions.Item label="Chấp nhận đơn">{detail.thoiGianChapNhanDon || '—'} {detail.soVbChapNhanDon ? `(${detail.soVbChapNhanDon})` : ''}</Descriptions.Item>
            <Descriptions.Item label="Công báo">{detail.thoiGianCongBao || '—'} {detail.soVbCongBao ? `(${detail.soVbCongBao})` : ''}</Descriptions.Item>
            <Descriptions.Item label="Bảo hộ">{detail.thoiDiemBaoHo || '—'} {detail.soVbBaoHo ? `(${detail.soVbBaoHo})` : ''}</Descriptions.Item>
            <Descriptions.Item label="Tái tục">{detail.thoiGianTaiTuc || '—'}</Descriptions.Item>
            <Descriptions.Item label="Chỉ tiêu BC">{detail.thoiGianTinhChiTieu || '—'}</Descriptions.Item>
            <Descriptions.Item label="Kỳ TK">{KY_THONG_KE_OPTS.find((x) => x.value === detail.kyThongKe)?.label || '—'}</Descriptions.Item>
            <Descriptions.Item label="TT hồ sơ"><Tag color={TRANG_THAI_SP_COLOR[detail.trangThai]}>{TRANG_THAI_SP_LABEL[detail.trangThai]}</Tag></Descriptions.Item>
          </Descriptions>
        )}
      </Modal>

      <Modal open={!!ownership} title="Tác giả · tỷ lệ đóng góp · chủ sở hữu" onCancel={() => setOwnership(null)} onOk={saveOwnership} destroyOnClose>
        <Form form={ownForm} layout="vertical">
          <Form.Item name="tacGia" label="Tác giả" rules={[{ required: true }]}><Input.TextArea rows={2} /></Form.Item>
          <Form.Item name="tyLeDongGop" label="Tỷ lệ đóng góp" rules={[{ required: true }]}><Input placeholder="60% / 40%" /></Form.Item>
          <Form.Item name="chuSoHuu" label="Chủ sở hữu" rules={[{ required: true }]}><Input /></Form.Item>
          <Form.Item name="tyLeQuyen" label="Tỷ lệ quyền" rules={[{ required: true }]}><Input placeholder="VHT 70% / Đơn vị 30%" /></Form.Item>
        </Form>
      </Modal>

      <Modal open={!!protection} title="Trạng thái đăng ký & văn bằng bảo hộ" onCancel={() => setProtection(null)} onOk={saveProtection} width={720} destroyOnClose>
        <Form form={protForm} layout="vertical">
          <Row gutter={12}>
            <Col span={12}><Form.Item name="trangThaiBaoHo" label="Trạng thái đăng ký" rules={[{ required: true }]}><Select options={TRANG_THAI_DANG_KY_SHTT.map((x) => ({ value: x, label: x }))} /></Form.Item></Col>
            <Col span={12}><Form.Item name="soDon" label="Số đơn"><Input /></Form.Item></Col>
            <Col span={12}><Form.Item name="ngayNop" label="Ngày nộp đơn"><Input placeholder="dd/MM/yyyy" /></Form.Item></Col>
            <Col span={12}><Form.Item name="thoiGianChapNhanDon" label="Thời gian chấp nhận đơn"><Input placeholder="dd/MM/yyyy" /></Form.Item></Col>
            <Col span={12}><Form.Item name="soVbChapNhanDon" label="Số VB chấp nhận đơn"><Input /></Form.Item></Col>
            <Col span={12}><Form.Item name="thoiGianCongBao" label="Thời gian công báo"><Input placeholder="dd/MM/yyyy" /></Form.Item></Col>
            <Col span={12}><Form.Item name="soVbCongBao" label="Số VB công báo"><Input /></Form.Item></Col>
            <Col span={12}><Form.Item name="thoiDiemBaoHo" label="Thời điểm bảo hộ"><Input placeholder="dd/MM/yyyy" /></Form.Item></Col>
            <Col span={12}><Form.Item name="soVbBaoHo" label="Số VB bảo hộ"><Input /></Form.Item></Col>
            <Col span={12}><Form.Item name="thoiGianTaiTuc" label="Thời gian cần tái tục bảo hộ"><Input placeholder="dd/MM/yyyy" /></Form.Item></Col>
          </Row>
        </Form>
      </Modal>

      <HistoryDrawer open={!!historyOf} title={historyOf?.ten ?? ''} entries={historyOf?.history ?? []} onClose={() => setHistoryOf(null)} />
    </div>
  )
}
