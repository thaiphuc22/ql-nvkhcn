import { useMemo, useState } from 'react'
import {
  Button, Col, Form, Input, InputNumber, Modal, Popconfirm, Progress, Row, Select, Space, Tag, message,
} from 'antd'
import { DiffOutlined, EditOutlined, EyeOutlined, HistoryOutlined, PlusOutlined, StopOutlined } from '@ant-design/icons'
import type { ColumnsType } from 'antd/es/table'
import { useNavigate } from 'react-router-dom'
import { PageHeader, StatCard, EntityTable } from '../../components/ui'
import {
  seedSanPhamNghienCuu,
  TRANG_THAI_SP_COLOR,
  TRANG_THAI_SP_LABEL,
  type SanPhamNghienCuu,
  type TrangThaiSP,
} from '../../data/sanPhamKhcn'
import HistoryDrawer from './HistoryDrawer'

const { TextArea } = Input

export default function SanPhamNghienCuuList() {
  const navigate = useNavigate()
  const [data, setData] = useState(seedSanPhamNghienCuu)
  const [search, setSearch] = useState('')
  const [modalOpen, setModalOpen] = useState(false)
  const [detail, setDetail] = useState<SanPhamNghienCuu | null>(null)
  const [edit, setEdit] = useState<SanPhamNghienCuu | null>(null)
  const [historyOf, setHistoryOf] = useState<SanPhamNghienCuu | null>(null)
  const [doiChieu, setDoiChieu] = useState(false)
  const [form] = Form.useForm()

  const filtered = useMemo(() => {
    const s = search.trim().toLowerCase()
    return data.filter((r) => r.trangThai !== 'deleted' && (
      !s || r.ma.toLowerCase().includes(s) || r.ten.toLowerCase().includes(s) || r.maNV.toLowerCase().includes(s)
    ))
  }, [data, search])

  const openCreate = () => {
    setEdit(null)
    form.resetFields()
    setModalOpen(true)
  }

  const openEdit = (r: SanPhamNghienCuu) => {
    setEdit(r)
    form.setFieldsValue(r)
    setModalOpen(true)
  }

  const save = async () => {
    const v = await form.validateFields()
    if (edit) {
      setData((prev) => prev.map((x) => x.id === edit.id ? {
        ...x, ...v, updatedAt: new Date().toLocaleDateString('vi-VN'),
        history: [...x.history, { at: new Date().toLocaleString('vi-VN'), actor: 'Người dùng hiện tại', action: 'Chỉnh sửa' }],
      } : x))
      message.success('Đã cập nhật sản phẩm nghiên cứu')
    } else {
      const id = `SP${String(data.length + 1).padStart(3, '0')}`
      const row: SanPhamNghienCuu = {
        id, ma: v.ma, ten: v.ten, loai: v.loai, maNV: v.maNV, tenNV: v.tenNV,
        chiTieuCamKet: v.chiTieuCamKet, ketQuaThucTe: v.ketQuaThucTe || '—', tienDoPct: v.tienDoPct || 0,
        trangThaiNghiemThu: v.trangThaiNghiemThu || 'Chưa nghiệm thu', trangThai: 'draft',
        chuTri: v.chuTri, updatedAt: new Date().toLocaleDateString('vi-VN'),
        history: [{ at: new Date().toLocaleString('vi-VN'), actor: 'Người dùng hiện tại', action: 'Tạo mới' }],
      }
      setData((prev) => [row, ...prev])
      message.success('Đã tạo sản phẩm nghiên cứu')
    }
    setModalOpen(false)
  }

  const softDelete = (r: SanPhamNghienCuu) => {
    setData((prev) => prev.map((x) => x.id === r.id ? {
      ...x, trangThai: 'inactive' as TrangThaiSP,
      history: [...x.history, { at: new Date().toLocaleString('vi-VN'), actor: 'Người dùng hiện tại', action: 'Xóa sử dụng' }],
    } : x))
    message.success('Đã ngừng sử dụng sản phẩm')
  }

  const cols: ColumnsType<SanPhamNghienCuu> = [
    { title: 'Mã', dataIndex: 'ma', width: 120, render: (v) => <code>{v}</code> },
    { title: 'Tên sản phẩm', dataIndex: 'ten', ellipsis: true },
    { title: 'Loại', dataIndex: 'loai', width: 110 },
    {
      title: 'Nhiệm vụ', dataIndex: 'maNV', width: 130,
      render: (v, r) => <a onClick={() => navigate(`/nhiem-vu/${encodeURIComponent(v)}`)}>{r.maNV}</a>,
    },
    { title: 'Tiến độ', dataIndex: 'tienDoPct', width: 120, render: (v: number) => <Progress percent={v} size="small" /> },
    { title: 'Nghiệm thu', dataIndex: 'trangThaiNghiemThu', width: 140, ellipsis: true },
    {
      title: 'Trạng thái', dataIndex: 'trangThai', width: 130,
      render: (v: TrangThaiSP) => <Tag color={TRANG_THAI_SP_COLOR[v]}>{TRANG_THAI_SP_LABEL[v]}</Tag>,
    },
    {
      title: 'Thao tác', key: 'act', width: 200, fixed: 'right',
      render: (_, r) => (
        <Space size={0}>
          <Button type="link" size="small" icon={<EyeOutlined />} onClick={() => setDetail(r)} />
          <Button type="link" size="small" icon={<EditOutlined />} onClick={() => openEdit(r)} />
          <Button type="link" size="small" icon={<HistoryOutlined />} onClick={() => setHistoryOf(r)} />
          <Popconfirm title="Ngừng sử dụng sản phẩm này?" onConfirm={() => softDelete(r)}>
            <Button type="link" size="small" danger icon={<StopOutlined />} />
          </Popconfirm>
        </Space>
      ),
    },
  ]

  return (
    <div>
      <PageHeader
        title="Sản phẩm nghiên cứu"
        breadcrumb={[{ label: 'Quản trị KHCN', to: '/nhiem-vu' }, { label: 'Sản phẩm nghiên cứu' }]}
        extra={
          <Space>
            <Button icon={<DiffOutlined />} onClick={() => setDoiChieu(true)}>Đối chiếu cam kết/thực tế</Button>
            <Button type="primary" icon={<PlusOutlined />} onClick={openCreate}>Tạo mới</Button>
          </Space>
        }
      />
      <Row gutter={12} style={{ marginBottom: 16 }}>
        <Col span={6}><StatCard title="Tổng sản phẩm" value={filtered.length} /></Col>
        <Col span={6}><StatCard title="Đã nghiệm thu" value={filtered.filter((x) => x.trangThaiNghiemThu === 'Đạt').length} color="#006e0d" /></Col>
        <Col span={6}><StatCard title="Đang thực hiện" value={filtered.filter((x) => x.trangThai === 'active').length} color="#daa520" /></Col>
        <Col span={6}><StatCard title="Chênh lệch cam kết" value={filtered.filter((x) => x.trangThaiNghiemThu.includes('Chưa đạt')).length} color="#ba1a1a" /></Col>
      </Row>
      <Input.Search placeholder="Tìm mã, tên, mã NV..." allowClear style={{ maxWidth: 360, marginBottom: 12 }} onSearch={setSearch} onChange={(e) => !e.target.value && setSearch('')} />
      <EntityTable rowKey="id" columns={cols} dataSource={filtered} />

      <Modal open={modalOpen} title={edit ? 'Chỉnh sửa sản phẩm nghiên cứu' : 'Tạo mới sản phẩm nghiên cứu'} onCancel={() => setModalOpen(false)} onOk={save} width={720} destroyOnClose>
        <Form form={form} layout="vertical">
          <Row gutter={12}>
            <Col span={8}><Form.Item name="ma" label="Mã sản phẩm" rules={[{ required: true }]}><Input /></Form.Item></Col>
            <Col span={16}><Form.Item name="ten" label="Tên sản phẩm" rules={[{ required: true }]}><Input /></Form.Item></Col>
            <Col span={8}><Form.Item name="loai" label="Loại" rules={[{ required: true }]}><Select options={['Phần mềm', 'Phần cứng', 'Hệ thống', 'Công cụ'].map((x) => ({ value: x, label: x }))} /></Form.Item></Col>
            <Col span={8}><Form.Item name="maNV" label="Mã nhiệm vụ" rules={[{ required: true }]}><Input /></Form.Item></Col>
            <Col span={8}><Form.Item name="chuTri" label="Chủ trì" rules={[{ required: true }]}><Input /></Form.Item></Col>
            <Col span={24}><Form.Item name="tenNV" label="Tên nhiệm vụ" rules={[{ required: true }]}><Input /></Form.Item></Col>
            <Col span={12}><Form.Item name="chiTieuCamKet" label="Chỉ tiêu cam kết" rules={[{ required: true }]}><TextArea rows={2} /></Form.Item></Col>
            <Col span={12}><Form.Item name="ketQuaThucTe" label="Kết quả thực tế"><TextArea rows={2} /></Form.Item></Col>
            <Col span={8}><Form.Item name="tienDoPct" label="Tiến độ (%)"><InputNumber min={0} max={100} style={{ width: '100%' }} /></Form.Item></Col>
            <Col span={16}><Form.Item name="trangThaiNghiemThu" label="Trạng thái nghiệm thu"><Input /></Form.Item></Col>
          </Row>
        </Form>
      </Modal>

      <Modal open={!!detail} title="Chi tiết sản phẩm nghiên cứu" onCancel={() => setDetail(null)} footer={<Button onClick={() => setDetail(null)}>Đóng</Button>} width={640}>
        {detail && (
          <Space direction="vertical" style={{ width: '100%' }} size={8}>
            <div><b>Mã:</b> {detail.ma}</div>
            <div><b>Tên:</b> {detail.ten}</div>
            <div><b>Loại:</b> {detail.loai}</div>
            <div><b>Nhiệm vụ:</b> {detail.maNV} — {detail.tenNV}</div>
            <div><b>Chủ trì:</b> {detail.chuTri}</div>
            <div><b>Cam kết:</b> {detail.chiTieuCamKet}</div>
            <div><b>Thực tế:</b> {detail.ketQuaThucTe}</div>
            <div><b>Tiến độ:</b> <Progress percent={detail.tienDoPct} /></div>
            <div><b>Nghiệm thu:</b> {detail.trangThaiNghiemThu}</div>
            <div><b>Trạng thái:</b> <Tag color={TRANG_THAI_SP_COLOR[detail.trangThai]}>{TRANG_THAI_SP_LABEL[detail.trangThai]}</Tag></div>
          </Space>
        )}
      </Modal>

      <Modal open={doiChieu} title="Đối chiếu sản phẩm cam kết và thực tế" onCancel={() => setDoiChieu(false)} footer={null} width={900}>
        <EntityTable
          rowKey="id"
          pagination={false}
          dataSource={filtered}
          columns={[
            { title: 'Mã SP', dataIndex: 'ma', width: 110 },
            { title: 'Sản phẩm', dataIndex: 'ten', ellipsis: true },
            { title: 'Cam kết', dataIndex: 'chiTieuCamKet', ellipsis: true },
            { title: 'Thực tế', dataIndex: 'ketQuaThucTe', ellipsis: true },
            { title: 'Tiến độ', dataIndex: 'tienDoPct', width: 90, render: (v: number) => `${v}%` },
            {
              title: 'Kết luận', dataIndex: 'trangThaiNghiemThu', width: 160,
              render: (v: string) => (
                <Tag color={v === 'Đạt' ? 'green' : v.includes('Chưa đạt') ? 'red' : 'orange'}>{v}</Tag>
              ),
            },
          ]}
        />
      </Modal>

      <HistoryDrawer open={!!historyOf} title={historyOf?.ten ?? ''} entries={historyOf?.history ?? []} onClose={() => setHistoryOf(null)} />
    </div>
  )
}
