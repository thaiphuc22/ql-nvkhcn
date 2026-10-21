import { useMemo, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import {
  Alert,
  Button,
  Col,
  Descriptions,
  Form,
  Input,
  InputNumber,
  Modal,
  Progress,
  Row,
  Select,
  Space,
  Steps,
  Tag,
  Timeline,
  message,
} from 'antd'
import {
  CheckCircleOutlined,
  CloseCircleOutlined,
  EyeOutlined,
  HistoryOutlined,
  MailOutlined,
  PlusOutlined,
  SendOutlined,
  SyncOutlined,
} from '@ant-design/icons'
import type { ColumnsType } from 'antd/es/table'
import { PageHeader, StatCard, EntityTable } from '../../components/ui'
import {
  BUOC_RD07,
  PHAN_LOAI_SPDV_LABEL,
  TRANG_THAI_SPDV_COLOR,
  TRANG_THAI_SPDV_LABEL,
  TUYEN_SPDV_LABEL,
  VONG_DOI_SPDV_LABEL,
  formatVnd,
  TRANG_THAI_SAN_PHAM_SPDV_LABEL,
  type BuocRd07,
  type KyCapNhatSpdv,
  type SpdvItem,
  type TrangThaiSpdv,
  type TuyenSpdv,
  type VongDoiSpdv,
} from '../../data/rd07Spdv'
import { seedCongNgheLoi, seedHoSoSHTT } from '../../data/sanPhamKhcn'
import { useSpdv } from '../../store/SpdvContext'
import HistoryDrawer from './HistoryDrawer'

const { TextArea } = Input

function buocStepStatus(ky: KyCapNhatSpdv, buoc: BuocRd07): 'wait' | 'process' | 'finish' | 'error' {
  if (ky.trangThaiKy === 'ket_thuc_khong_du_can_cu' && buoc === 6) return 'error'
  if (ky.trangThaiKy === 'da_cap_nhat_db' && buoc <= 7) return 'finish'
  if (buoc < ky.buocHienTai) return 'finish'
  if (buoc === ky.buocHienTai) return 'process'
  return 'wait'
}

export default function SanPhamNghienCuuList() {
  const navigate = useNavigate()
  const { list: data, setList: setData, ky, setKy, create } = useSpdv()
  const [search, setSearch] = useState('')
  const [tuyenFilter, setTuyenFilter] = useState<TuyenSpdv | 'ALL'>('ALL')
  const [detail, setDetail] = useState<SpdvItem | null>(null)
  const [historyOf, setHistoryOf] = useState<SpdvItem | null>(null)
  const [modalOpen, setModalOpen] = useState(false)
  const [editMode, setEditMode] = useState<'create' | 'b3' | 'b4' | 'b5' | null>(null)
  const [editing, setEditing] = useState<SpdvItem | null>(null)
  const [form] = Form.useForm()

  const filtered = useMemo(() => {
    const s = search.trim().toLowerCase()
    return data.filter((r) => {
      if (r.trangThai === 'ngung') return false
      if (tuyenFilter === 'TT_KD_VHT' && r.phanLoai !== 'SPDV_KD') return false
      if (tuyenFilter === 'TTNCSP' && r.phanLoai !== 'SPDV_NCPT') return false
      if (tuyenFilter === 'P_TCKT_VHT' && r.doanhThu == null && r.chiPhi == null) return false
      if (!s) return true
      return (
        r.ma.toLowerCase().includes(s) ||
        r.ten.toLowerCase().includes(s) ||
        (r.maNVLienQuan ?? '').toLowerCase().includes(s)
      )
    })
  }, [data, search, tuyenFilter])

  const parallelDone = ky.ttKdXong && ky.ttncspXong && ky.tcktXong

  const openCreate = () => {
    setEditMode('create')
    setEditing(null)
    form.resetFields()
    form.setFieldsValue({ quyHienHanh: ky.quy, vongDoi: 'nghien_cuu', phanLoai: 'SPDV_NCPT' })
    setModalOpen(true)
  }

  const openCapNhatTuyen = (mode: 'b3' | 'b4' | 'b5', row?: SpdvItem) => {
    setEditMode(mode)
    setEditing(row ?? null)
    form.resetFields()
    if (row) form.setFieldsValue(row)
    setModalOpen(true)
  }

  const pushHistory = (item: SpdvItem, action: string, actor: string, buoc: BuocRd07): SpdvItem => ({
    ...item,
    updatedAt: new Date().toLocaleDateString('vi-VN'),
    history: [
      ...item.history,
      { at: new Date().toLocaleString('vi-VN'), actor, action, buoc },
    ],
  })

  const save = async () => {
    const v = await form.validateFields()
    if (editMode === 'create') {
      create({
        ma: v.ma,
        ten: v.ten,
        phanLoai: v.phanLoai,
        vongDoi: v.vongDoi,
        quyHienHanh: v.quyHienHanh || ky.quy,
        maNVLienQuan: v.maNVLienQuan,
        canCuDieuChinh: v.canCuDieuChinh,
        updatedByTuyen: 'QLDM_SPDV',
        trangThai: 'draft_dau_nam',
        historyAction: 'Cập nhật danh mục / trạng thái đầu năm',
      })
      message.success('Đã thêm / cập nhật SPDV đầu năm (Bước 1)')
    } else if (editMode === 'b3' && editing) {
      setData((prev) =>
        prev.map((x) =>
          x.id === editing.id
            ? pushHistory(
                {
                  ...x,
                  ...v,
                  phanLoai: 'SPDV_KD',
                  trangThai: 'dang_cap_nhat_song_song',
                  updatedByTuyen: 'TT_KD_VHT',
                },
                'Cập nhật SPDV kinh doanh của TCT',
                TUYEN_SPDV_LABEL.TT_KD_VHT,
                3,
              )
            : x,
        ),
      )
      setKy((k) => {
        const next = { ...k, ttKdXong: true }
        if (next.ttKdXong && next.ttncspXong && next.tcktXong) {
          next.buocHienTai = 6
          next.trangThaiKy = 'dang_tong_hop'
        }
        return next
      })
      message.success('TT KD VHT đã cập nhật (Bước 3)')
    } else if (editMode === 'b4' && editing) {
      setData((prev) =>
        prev.map((x) =>
          x.id === editing.id
            ? pushHistory(
                {
                  ...x,
                  ...v,
                  phanLoai: 'SPDV_NCPT',
                  trangThai: 'dang_cap_nhat_song_song',
                  updatedByTuyen: 'TTNCSP',
                },
                'Cập nhật SPDV NCPT',
                TUYEN_SPDV_LABEL.TTNCSP,
                4,
              )
            : x,
        ),
      )
      setKy((k) => {
        const next = { ...k, ttncspXong: true }
        if (next.ttKdXong && next.ttncspXong && next.tcktXong) {
          next.buocHienTai = 6
          next.trangThaiKy = 'dang_tong_hop'
        }
        return next
      })
      message.success('TTNCSP đã cập nhật (Bước 4)')
    } else if (editMode === 'b5' && editing) {
      setData((prev) =>
        prev.map((x) =>
          x.id === editing.id
            ? pushHistory(
                {
                  ...x,
                  doanhThu: v.doanhThu,
                  chiPhi: v.chiPhi,
                  loiNhuan: v.loiNhuan ?? (v.doanhThu ?? 0) - (v.chiPhi ?? 0),
                  trangThai: 'cho_tong_hop',
                  updatedByTuyen: 'P_TCKT_VHT',
                },
                'Cập nhật doanh thu / chi phí / lợi nhuận',
                TUYEN_SPDV_LABEL.P_TCKT_VHT,
                5,
              )
            : x,
        ),
      )
      setKy((k) => {
        const next = { ...k, tcktXong: true }
        if (next.ttKdXong && next.ttncspXong && next.tcktXong) {
          next.buocHienTai = 6
          next.trangThaiKy = 'dang_tong_hop'
        }
        return next
      })
      message.success('P.TCKT VHT đã cập nhật DT/CP/LN (Bước 5)')
    }
    setModalOpen(false)
  }

  const guiYeuCauQuy = () => {
    setKy((k) => ({
      ...k,
      buocHienTai: 2,
      trangThaiKy: 'da_gui_yeu_cau',
      ttKdXong: false,
      ttncspXong: false,
      tcktXong: false,
      duCanCu: null,
    }))
    setData((prev) =>
      prev.map((x) =>
        x.quyHienHanh === ky.quy || x.trangThai === 'da_cap_nhat_quy'
          ? pushHistory(
              { ...x, trangThai: 'cho_cap_nhat_quy', quyHienHanh: ky.quy },
              'Nhận yêu cầu cập nhật danh mục SPDV (ngày 20 tháng cuối Quý N)',
              TUYEN_SPDV_LABEL.QLDM_SPDV,
              2,
            )
          : x,
      ),
    )
    setKy((k) => ({ ...k, buocHienTai: 3, trangThaiKy: 'cho_3_tuyen' }))
    message.success('Đã gửi yêu cầu cập nhật (Bước 2) → mở song song Bước 3/4/5')
  }

  const tongHop = (duCanCu: boolean) => {
    if (!parallelDone) {
      message.warning('Chưa đủ cập nhật song song từ TT KD / TTNCSP / P.TCKT')
      return
    }
    if (!duCanCu) {
      setKy((k) => ({
        ...k,
        buocHienTai: 6,
        trangThaiKy: 'ket_thuc_khong_du_can_cu',
        duCanCu: false,
        lyDoKhongDuCanCu: 'Không đủ căn cứ điều chỉnh — gửi thông báo, không cập nhật DB',
        closedAt: new Date().toLocaleDateString('vi-VN'),
      }))
      setData((prev) =>
        prev.map((x) =>
          x.quyHienHanh === ky.quy
            ? pushHistory(
                { ...x, trangThai: 'khong_du_can_cu' },
                'Tổng hợp: Không đủ căn cứ — kết thúc, gửi email thông báo',
                TUYEN_SPDV_LABEL.QLDM_SPDV,
                6,
              )
            : x,
        ),
      )
      message.error('Không đủ căn cứ — luồng kết thúc, đã ghi nhận gửi thông báo')
      return
    }
    setKy((k) => ({
      ...k,
      buocHienTai: 7,
      trangThaiKy: 'da_cap_nhat_db',
      duCanCu: true,
      closedAt: new Date().toLocaleDateString('vi-VN'),
    }))
    setData((prev) =>
      prev.map((x) =>
        x.quyHienHanh === ky.quy
          ? pushHistory(
              { ...x, trangThai: 'da_cap_nhat_quy' },
              `Cập nhật vào Danh mục SPDV tại ${ky.quy}`,
              TUYEN_SPDV_LABEL.QLDM_SPDV,
              7,
            )
          : x,
      ),
    )
    message.success(`Đã cập nhật Danh mục SPDV tại ${ky.quy} (Bước 7 → DB)`)
  }

  const cols: ColumnsType<SpdvItem> = [
    { title: 'Mã SPDV', dataIndex: 'ma', width: 130, render: (v) => <code>{v}</code> },
    { title: 'Tên SPDV', dataIndex: 'ten', ellipsis: true },
    { title: 'Lĩnh vực', dataIndex: 'linhVuc', width: 150, ellipsis: true, render: (v) => v || '—' },
    { title: 'Nhóm/Dòng', dataIndex: 'nhomDong', width: 150, ellipsis: true, render: (v) => v || '—' },
    {
      title: 'TT sản phẩm',
      dataIndex: 'trangThaiSanPham',
      width: 120,
      render: (v: SpdvItem['trangThaiSanPham']) =>
        v ? <Tag>{TRANG_THAI_SAN_PHAM_SPDV_LABEL[v]}</Tag> : '—',
    },
    {
      title: 'Phân loại',
      dataIndex: 'phanLoai',
      width: 140,
      render: (v: SpdvItem['phanLoai']) => PHAN_LOAI_SPDV_LABEL[v],
    },
    {
      title: 'Vòng đời',
      dataIndex: 'vongDoi',
      width: 110,
      render: (v: VongDoiSpdv) => <Tag>{VONG_DOI_SPDV_LABEL[v]}</Tag>,
    },
    { title: 'Quý', dataIndex: 'quyHienHanh', width: 100 },
    {
      title: 'DT / CP / LN',
      key: 'tc',
      width: 200,
      render: (_, r) => (
        <span style={{ fontSize: 12 }}>
          {formatVnd(r.doanhThu)}
          <br />
          <span style={{ color: '#888' }}>{formatVnd(r.chiPhi)} / {formatVnd(r.loiNhuan)}</span>
        </span>
      ),
    },
    {
      title: 'Trạng thái RD07',
      dataIndex: 'trangThai',
      width: 170,
      render: (v: TrangThaiSpdv) => <Tag color={TRANG_THAI_SPDV_COLOR[v]}>{TRANG_THAI_SPDV_LABEL[v]}</Tag>,
    },
    {
      title: 'Thao tác',
      key: 'act',
      width: 220,
      fixed: 'right',
      render: (_, r) => (
        <Space size={0} wrap>
          <Button type="link" size="small" icon={<EyeOutlined />} onClick={() => setDetail(r)} />
          <Button type="link" size="small" icon={<HistoryOutlined />} onClick={() => setHistoryOf(r)} />
          <Button type="link" size="small" onClick={() => openCapNhatTuyen('b3', r)}>
            KD
          </Button>
          <Button type="link" size="small" onClick={() => openCapNhatTuyen('b4', r)}>
            NCPT
          </Button>
          <Button type="link" size="small" onClick={() => openCapNhatTuyen('b5', r)}>
            TCKT
          </Button>
        </Space>
      ),
    },
  ]

  const modalTitle =
    editMode === 'create'
      ? 'Bước 1 — Cập nhật danh mục / trạng thái SPDV đầu năm'
      : editMode === 'b3'
        ? 'Bước 3 — TT KD VHT cập nhật SPDV kinh doanh'
        : editMode === 'b4'
          ? 'Bước 4 — TTNCSP cập nhật SPDV NCPT'
          : editMode === 'b5'
            ? 'Bước 5 — P.TCKT cập nhật DT / CP / LN'
            : ''

  return (
    <div>
      <PageHeader
        title="Quản lý sản phẩm (SPDV)"
        breadcrumb={[
          { label: 'Quản trị KHCN', to: '/nhiem-vu' },
          { label: 'Sản phẩm (SPDV)' },
        ]}
        extra={
          <Space wrap>
            <Button type="primary" icon={<PlusOutlined />} onClick={() => navigate('/san-pham-nghien-cuu/moi')}>
              Thêm mới
            </Button>
            <Link to="/quy-trinh/RD07">
              <Button>Xem quy trình RD07</Button>
            </Link>
            <Button icon={<SendOutlined />} onClick={guiYeuCauQuy}>
              Bước 2 — Gửi yêu cầu (20 cuối quý)
            </Button>
            <Button
              icon={<CloseCircleOutlined />}
              danger
              disabled={!parallelDone || ky.trangThaiKy === 'da_cap_nhat_db'}
              onClick={() => tongHop(false)}
            >
              Bước 6 — Không đủ căn cứ
            </Button>
            <Button
              icon={<CheckCircleOutlined />}
              disabled={!parallelDone || ky.trangThaiKy === 'da_cap_nhat_db'}
              onClick={() => tongHop(true)}
            >
              Bước 6→7 — Đủ căn cứ & cập nhật DB
            </Button>
            <Button icon={<PlusOutlined />} onClick={openCreate}>
              Bước 1 — Cập nhật đầu năm
            </Button>
          </Space>
        }
      />

      <Alert
        type="info"
        showIcon
        style={{ marginBottom: 16 }}
        message="RD07. Quản lý danh mục dịch vụ, sản phẩm nghiên cứu"
        description={
          <span>
            4 tuyến: {Object.values(TUYEN_SPDV_LABEL).join(' · ')}. Timer Bước 2: ngày 20 tháng cuối Quý N.
            Sau Bước 2 mở song song Bước 3 (TT KD) / 4 (TTNCSP) / 5 (P.TCKT); Bước 6 xác thực căn cứ → Bước 7 ghi DB hoặc gửi thông báo nếu không đủ căn cứ.
          </span>
        }
      />

      <Row gutter={12} style={{ marginBottom: 16 }}>
        <Col span={6}>
          <StatCard title={`Kỳ ${ky.quy}`} value={`Bước ${ky.buocHienTai}/7`} />
        </Col>
        <Col span={6}>
          <StatCard
            title="Song song 3/4/5"
            value={`${[ky.ttKdXong, ky.ttncspXong, ky.tcktXong].filter(Boolean).length}/3`}
            color={parallelDone ? '#006e0d' : '#daa520'}
          />
        </Col>
        <Col span={6}>
          <StatCard title="SPDV đang quản lý" value={filtered.length} />
        </Col>
        <Col span={6}>
          <StatCard
            title="Đã cập nhật quý"
            value={data.filter((x) => x.trangThai === 'da_cap_nhat_quy').length}
            color="#006e0d"
          />
        </Col>
      </Row>

      <div style={{ marginBottom: 20, padding: 16, background: '#fafafa', borderRadius: 8 }}>
        <Steps
          size="small"
          current={Math.max(0, ky.buocHienTai - 1)}
          status={ky.trangThaiKy === 'ket_thuc_khong_du_can_cu' ? 'error' : undefined}
          items={BUOC_RD07.map((b) => ({
            title: `B${b.buoc}`,
            description: (
              <span style={{ fontSize: 11 }}>
                {TUYEN_SPDV_LABEL[b.tuyen].replace('Đơn vị Quản lý Danh mục SPDV', 'QLDM')}
              </span>
            ),
            status: buocStepStatus(ky, b.buoc),
          }))}
        />
        <div style={{ marginTop: 12, fontSize: 12, color: '#666' }}>
          {BUOC_RD07.find((b) => b.buoc === ky.buocHienTai)?.ten}
          {BUOC_RD07.find((b) => b.buoc === ky.buocHienTai)?.trigger
            ? ` — ${BUOC_RD07.find((b) => b.buoc === ky.buocHienTai)?.trigger}`
            : ''}
          {ky.trangThaiKy === 'ket_thuc_khong_du_can_cu' && (
            <Tag icon={<MailOutlined />} color="error" style={{ marginLeft: 8 }}>
              Đã gửi thông báo — không cập nhật DB
            </Tag>
          )}
        </div>
        <Progress
          percent={Math.round(((ky.trangThaiKy === 'da_cap_nhat_db' ? 7 : ky.buocHienTai) / 7) * 100)}
          size="small"
          style={{ marginTop: 8, maxWidth: 420 }}
        />
      </div>

      <Space style={{ marginBottom: 12 }} wrap>
        <Input.Search
          placeholder="Tìm mã, tên, mã NV…"
          allowClear
          style={{ width: 320 }}
          onSearch={setSearch}
          onChange={(e) => !e.target.value && setSearch('')}
        />
        <Select
          style={{ width: 260 }}
          value={tuyenFilter}
          onChange={setTuyenFilter}
          options={[
            { value: 'ALL', label: 'Tất cả tuyến' },
            { value: 'TT_KD_VHT', label: 'Lọc SPDV kinh doanh (TT KD)' },
            { value: 'TTNCSP', label: 'Lọc SPDV NCPT (TTNCSP)' },
            { value: 'P_TCKT_VHT', label: 'Có số liệu tài chính (TCKT)' },
          ]}
        />
        <Tag icon={<SyncOutlined spin={!parallelDone} />} color={parallelDone ? 'success' : 'processing'}>
          TT KD: {ky.ttKdXong ? 'xong' : '…'} · TTNCSP: {ky.ttncspXong ? 'xong' : '…'} · TCKT:{' '}
          {ky.tcktXong ? 'xong' : '…'}
        </Tag>
      </Space>

      <EntityTable rowKey="id" columns={cols} dataSource={filtered} scroll={{ x: 1100 }} />

      <Modal open={modalOpen} title={modalTitle} onCancel={() => setModalOpen(false)} onOk={save} width={720} destroyOnClose>
        <Form form={form} layout="vertical">
          {(editMode === 'create' || editMode === 'b3' || editMode === 'b4') && (
            <Row gutter={12}>
              <Col span={8}>
                <Form.Item name="ma" label="Mã SPDV" rules={[{ required: true }]}>
                  <Input disabled={editMode !== 'create'} />
                </Form.Item>
              </Col>
              <Col span={16}>
                <Form.Item name="ten" label="Tên dịch vụ / sản phẩm NC" rules={[{ required: true }]}>
                  <Input />
                </Form.Item>
              </Col>
              <Col span={12}>
                <Form.Item name="phanLoai" label="Phân loại" rules={[{ required: true }]}>
                  <Select
                    options={(Object.keys(PHAN_LOAI_SPDV_LABEL) as SpdvItem['phanLoai'][]).map((k) => ({
                      value: k,
                      label: PHAN_LOAI_SPDV_LABEL[k],
                    }))}
                  />
                </Form.Item>
              </Col>
              <Col span={12}>
                <Form.Item name="vongDoi" label="Vòng đời" rules={[{ required: true }]}>
                  <Select
                    options={(Object.keys(VONG_DOI_SPDV_LABEL) as VongDoiSpdv[]).map((k) => ({
                      value: k,
                      label: VONG_DOI_SPDV_LABEL[k],
                    }))}
                  />
                </Form.Item>
              </Col>
              <Col span={12}>
                <Form.Item name="quyHienHanh" label="Quý / Năm">
                  <Input placeholder="2026-Q2" />
                </Form.Item>
              </Col>
              <Col span={12}>
                <Form.Item name="maNVLienQuan" label="Mã NV KHCN liên quan">
                  <Input />
                </Form.Item>
              </Col>
              <Col span={24}>
                <Form.Item name="canCuDieuChinh" label="Căn cứ điều chỉnh">
                  <TextArea rows={2} placeholder="QĐ BTGĐ / KHN / báo cáo CRM…" />
                </Form.Item>
              </Col>
            </Row>
          )}
          {editMode === 'b5' && (
            <Row gutter={12}>
              <Col span={8}>
                <Form.Item name="doanhThu" label="Doanh thu (VNĐ)" rules={[{ required: true }]}>
                  <InputNumber style={{ width: '100%' }} min={0} />
                </Form.Item>
              </Col>
              <Col span={8}>
                <Form.Item name="chiPhi" label="Chi phí (VNĐ)" rules={[{ required: true }]}>
                  <InputNumber style={{ width: '100%' }} min={0} />
                </Form.Item>
              </Col>
              <Col span={8}>
                <Form.Item name="loiNhuan" label="Lợi nhuận (VNĐ)">
                  <InputNumber style={{ width: '100%' }} />
                </Form.Item>
              </Col>
            </Row>
          )}
        </Form>
      </Modal>

      <Modal
        open={!!detail}
        title="Chi tiết SPDV (RD07)"
        onCancel={() => setDetail(null)}
        footer={<Button onClick={() => setDetail(null)}>Đóng</Button>}
        width={720}
      >
        {detail && (
          <>
            <Descriptions column={2} size="small" bordered>
              <Descriptions.Item label="Mã">{detail.ma}</Descriptions.Item>
              <Descriptions.Item label="Phân loại">{PHAN_LOAI_SPDV_LABEL[detail.phanLoai]}</Descriptions.Item>
              <Descriptions.Item label="Tên" span={2}>
                {detail.ten}
              </Descriptions.Item>
              <Descriptions.Item label="Lĩnh vực">{detail.linhVuc || '—'}</Descriptions.Item>
              <Descriptions.Item label="Nhóm/Dòng">{detail.nhomDong || '—'}</Descriptions.Item>
              <Descriptions.Item label="Công nghệ lõi" span={2}>
                {detail.congNgheLoi?.length ? (
                  <Space size={[4, 4]} wrap>
                    {detail.congNgheLoi.map((ma) => {
                      const cn = seedCongNgheLoi.find((x) => x.ma === ma)
                      return (
                        <Tag key={ma} color="blue">
                          {cn ? `${cn.ma} — ${cn.ten}` : ma}
                        </Tag>
                      )
                    })}
                  </Space>
                ) : (
                  '—'
                )}
              </Descriptions.Item>
              <Descriptions.Item label="Tài sản SHTT" span={2}>
                {detail.taiSanShtt?.length ? (
                  <Space size={[4, 4]} wrap>
                    {detail.taiSanShtt.map((ma) => {
                      const ip = seedHoSoSHTT.find((x) => x.ma === ma)
                      return (
                        <Tag key={ma} color="purple">
                          {ip ? `${ip.ma} — ${ip.ten}` : ma}
                        </Tag>
                      )
                    })}
                  </Space>
                ) : (
                  '—'
                )}
              </Descriptions.Item>
              <Descriptions.Item label="TT sản phẩm">
                {detail.trangThaiSanPham
                  ? TRANG_THAI_SAN_PHAM_SPDV_LABEL[detail.trangThaiSanPham]
                  : '—'}
              </Descriptions.Item>
              <Descriptions.Item label="Khách hàng">{detail.khachHang || '—'}</Descriptions.Item>
              <Descriptions.Item label="Vòng đời">{VONG_DOI_SPDV_LABEL[detail.vongDoi]}</Descriptions.Item>
              <Descriptions.Item label="Quý">{detail.quyHienHanh}</Descriptions.Item>
              <Descriptions.Item label="Doanh thu">{formatVnd(detail.doanhThu)}</Descriptions.Item>
              <Descriptions.Item label="Chi phí">{formatVnd(detail.chiPhi)}</Descriptions.Item>
              <Descriptions.Item label="Lợi nhuận">{formatVnd(detail.loiNhuan)}</Descriptions.Item>
              <Descriptions.Item label="NV liên quan">{detail.maNVLienQuan || '—'}</Descriptions.Item>
              <Descriptions.Item label="Trạng thái RD07" span={2}>
                <Tag color={TRANG_THAI_SPDV_COLOR[detail.trangThai]}>{TRANG_THAI_SPDV_LABEL[detail.trangThai]}</Tag>
              </Descriptions.Item>
              <Descriptions.Item label="Căn cứ" span={2}>
                {detail.canCuDieuChinh || '—'}
              </Descriptions.Item>
            </Descriptions>
            <Timeline
              style={{ marginTop: 16 }}
              items={detail.history.map((h) => ({
                children: (
                  <span>
                    <b>{h.buoc ? `B${h.buoc}` : ''}</b> {h.action} — {h.actor}{' '}
                    <span style={{ color: '#888' }}>({h.at})</span>
                  </span>
                ),
              }))}
            />
          </>
        )}
      </Modal>

      <HistoryDrawer
        open={!!historyOf}
        title={historyOf?.ten ?? ''}
        entries={(historyOf?.history ?? []).map((h) => ({
          at: h.at,
          actor: h.actor,
          action: h.buoc ? `B${h.buoc}: ${h.action}` : h.action,
        }))}
        onClose={() => setHistoryOf(null)}
      />
    </div>
  )
}
