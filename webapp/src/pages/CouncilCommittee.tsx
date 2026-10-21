import { useMemo, useState } from 'react'
import { useParams } from 'react-router-dom'
import {
  Alert,
  Button,
  Card,
  Checkbox,
  Col,
  DatePicker,
  Descriptions,
  Dropdown,
  Empty,
  Form,
  Input,
  List,
  Modal,
  Radio,
  Row,
  Space,
  Statistic,
  Steps,
  Table,
  Tag,
  Tabs,
  Typography,
  message,
} from 'antd'
import type { ColumnsType } from 'antd/es/table'
import dayjs, { type Dayjs } from 'dayjs'
import {
  CheckCircleOutlined,
  ClockCircleOutlined,
  CloseCircleOutlined,
  CalendarOutlined,
  DeleteOutlined,
  EditOutlined,
  EnvironmentOutlined,
  ExclamationCircleOutlined,
  EyeOutlined,
  FieldTimeOutlined,
  FileTextOutlined,
  InfoCircleOutlined,
  MailOutlined,
  PlusOutlined,
  PrinterOutlined,
  ReloadOutlined,
  TeamOutlined,
  UserAddOutlined,
  UserOutlined,
} from '@ant-design/icons'
import {
  NGUONG_DIEM_HD,
  TRANG_THAI_PHIEN_HOP,
  VAI_TRO_HD,
  coTheMoPhien2,
  coTheThuHoiPhieu,
  danhGiaKetQua,
  demThamGiaPhien,
  duPhieuBatBuoc,
  kiemTraPhienHopHopLe,
  kiemTraQuorum,
  kiemTraThanhPhanBatBuoc,
  seedHoiDong,
  taoHoiDongMacDinh,
  taoPhienHopMacDinh,
  tinhDiemTrungBinh,
  type HoiDong,
  type PhienHopHoiDong,
  type ThanhVienHoiDong,
  type TrangThaiThamGiaPhien,
  type VaiTroHoiDong,
} from '../data/hoiDong'
import { seedHoSo, type HoSo, toView } from '../data/dossiers'
import { seedNhiemVu, type NhiemVu } from '../data/nhiemVu'
import { PageHeader } from '../components/ui'

const { Title, Text } = Typography

const TAG_COLORS: Record<VaiTroHoiDong, string> = {
  CHU_TICH: 'red',
  PHAN_BIEN_1: 'blue',
  PHAN_BIEN_2: 'cyan',
  UY_VIEN: 'green',
  THU_KY_KH: 'orange',
}

const TRANG_THAI_OPTS = {
  duKien: { label: 'Dự kiến', color: 'default', icon: <ClockCircleOutlined /> },
  chapNhan: { label: 'Chấp nhận', color: 'green', icon: <CheckCircleOutlined /> },
  tuChoi: { label: 'Từ chối', color: 'red', icon: <CloseCircleOutlined /> },
  vangMat: { label: 'Vắng mặt', color: 'orange', icon: <InfoCircleOutlined /> },
} as const

const PHIEU_OPTS = {
  chua_nop: { label: 'Chưa nộp', color: 'default' },
  da_gui: { label: 'Đã gửi', color: 'green' },
  thu_hoi: { label: 'Thu hồi', color: 'orange' },
} as const

function formatDate(d: string) {
  if (!d) return '—'
  const [y, m, day] = d.split('-')
  return `${day}/${m}/${y}`
}

function formatDateTime(iso: string) {
  if (!iso) return '—'
  const d = dayjs(iso)
  return d.isValid() ? d.format('DD/MM/YYYY HH:mm') : iso
}

type PhienHopFormValues = {
  ten: string
  loaiPhien: 1 | 2 | 'khac'
  thoiGian: Dayjs
  diaDiem: string
  ghiChu?: string
}

export default function CouncilCommittee() {
  const { id } = useParams<{ id: string }>()

  const [hoidongs, setHoidongs] = useState<HoiDong[]>(() =>
    seedHoiDong.map((h) => ({
      ...h,
      thanhVien: h.thanhVien.map((t) => ({ ...t })),
      phienHop: h.phienHop?.map((p) => ({
        ...p,
        diemDanh: p.diemDanh.map((d) => ({ ...d })),
      })),
    })),
  )
  const [selectedHDId, setSelectedHDId] = useState<string | null>(
    id ?? seedHoiDong[0]?.id ?? null,
  )
  const [createModalOpen, setCreateModalOpen] = useState(false)
  const [membersFilter, setMembersFilter] = useState<string>('all')
  const [phienModalOpen, setPhienModalOpen] = useState(false)
  const [editingPhienId, setEditingPhienId] = useState<string | null>(null)
  const [diemDanhDraft, setDiemDanhDraft] = useState<
    Record<string, TrangThaiThamGiaPhien | undefined>
  >({})
  const [phienForm] = Form.useForm<PhienHopFormValues>()

  const selectedHD = useMemo(
    () => hoidongs.find((h) => h.id === selectedHDId) ?? null,
    [hoidongs, selectedHDId],
  )

  const dossiers = useMemo(() => {
    return seedHoSo
      .map((d: HoSo) => {
        const nv = seedNhiemVu.find((n: NhiemVu) => n.ma === d.maNV)
        return nv ? toView(d, nv) : null
      })
      .filter(Boolean) as ReturnType<typeof toView>[]
  }, [])

  const filteredMembers = useMemo(() => {
    if (!selectedHD) return []
    if (membersFilter === 'all') return selectedHD.thanhVien
    return selectedHD.thanhVien.filter((tv) => tv.trangThai === membersFilter)
  }, [selectedHD, membersFilter])

  const thanhPhan = selectedHD ? kiemTraThanhPhanBatBuoc(selectedHD) : null
  const quorum = selectedHD ? kiemTraQuorum(selectedHD) : null
  const diemTB = selectedHD ? tinhDiemTrungBinh(selectedHD) : undefined
  const ketQuaCalc = selectedHD ? danhGiaKetQua(selectedHD) : null
  const moPhien2Ok = selectedHD ? coTheMoPhien2(selectedHD) : false

  const confirmedCount =
    selectedHD?.thanhVien.filter((tv) => tv.trangThai === 'chapNhan').length ?? 0

  function patchHD(idHd: string, patch: Partial<HoiDong> | ((h: HoiDong) => HoiDong)) {
    setHoidongs((prev) =>
      prev.map((h) => {
        if (h.id !== idHd) return h
        return typeof patch === 'function' ? patch(h) : { ...h, ...patch }
      }),
    )
  }

  const handleCreateFromDossier = (maHoSo: string, maNV: string, tenDeTai: string) => {
    const newHD = taoHoiDongMacDinh(maHoSo, maNV, tenDeTai, 1)
    setHoidongs((prev) => [...prev, newHD])
    setSelectedHDId(newHD.id)
    setCreateModalOpen(false)
    message.success(`Đã tự động thành lập Hội đồng cho "${maHoSo}"`)
  }

  function openTaoPhienHop(existing?: PhienHopHoiDong) {
    if (!selectedHD) return
    if (existing) {
      setEditingPhienId(existing.id)
      phienForm.setFieldsValue({
        ten: existing.ten,
        loaiPhien: existing.loaiPhien,
        thoiGian: dayjs(existing.thoiGian),
        diaDiem: existing.diaDiem,
        ghiChu: existing.ghiChu,
      })
      setDiemDanhDraft(
        Object.fromEntries(existing.diemDanh.map((d) => [d.thanhVienId, d.trangThai])),
      )
    } else {
      setEditingPhienId(null)
      const draft = taoPhienHopMacDinh(selectedHD)
      phienForm.setFieldsValue({
        ten: draft.ten,
        loaiPhien: draft.loaiPhien,
        thoiGian: dayjs(draft.thoiGian),
        diaDiem: draft.diaDiem || selectedHD.diaDiem || '',
        ghiChu: undefined,
      })
      setDiemDanhDraft({})
    }
    setPhienModalOpen(true)
  }

  function setThamGia(thanhVienId: string, trangThai: TrangThaiThamGiaPhien) {
    setDiemDanhDraft((prev) => ({ ...prev, [thanhVienId]: trangThai }))
  }

  function chonTatCa(trangThai: TrangThaiThamGiaPhien) {
    if (!selectedHD) return
    setDiemDanhDraft(
      Object.fromEntries(selectedHD.thanhVien.map((tv) => [tv.id, trangThai])),
    )
  }

  function luuPhienHop() {
    if (!selectedHD) return
    phienForm.validateFields().then((values) => {
      const diemDanh = selectedHD.thanhVien.map((tv) => {
        const st = diemDanhDraft[tv.id]
        if (!st) {
          return { thanhVienId: tv.id, trangThai: undefined as unknown as TrangThaiThamGiaPhien }
        }
        return { thanhVienId: tv.id, trangThai: st }
      })
      const thieuChon = diemDanh.filter((d) => !d.trangThai)
      if (thieuChon.length) {
        message.warning(
          `Cần tích chọn Tham gia / Không tham gia cho đủ ${selectedHD.thanhVien.length} thành viên (thiếu ${thieuChon.length}).`,
        )
        return
      }

      const payload: PhienHopHoiDong = {
        id: editingPhienId ?? taoPhienHopMacDinh(selectedHD).id,
        ten: values.ten.trim(),
        loaiPhien: values.loaiPhien,
        thoiGian: values.thoiGian.toISOString(),
        diaDiem: values.diaDiem.trim(),
        trangThai: editingPhienId
          ? (selectedHD.phienHop?.find((p) => p.id === editingPhienId)?.trangThai ?? 'da_moi')
          : 'da_moi',
        diemDanh: diemDanh as PhienHopHoiDong['diemDanh'],
        ghiChu: values.ghiChu?.trim() || undefined,
        ngayTao:
          selectedHD.phienHop?.find((p) => p.id === editingPhienId)?.ngayTao ??
          new Date().toISOString().slice(0, 10),
      }

      const check = kiemTraPhienHopHopLe(
        payload,
        selectedHD.thanhVien.map((t) => t.id),
      )
      if (!check.ok) {
        message.error(check.loi.join('; '))
        return
      }

      patchHD(selectedHD.id, (h) => {
        const list = [...(h.phienHop ?? [])]
        const idx = list.findIndex((p) => p.id === payload.id)
        if (idx >= 0) list[idx] = payload
        else list.push(payload)

        // Đồng bộ cờ có mặt trên thành viên theo phiên mới nhất
        const thanhVien = h.thanhVien.map((tv) => {
          const dd = payload.diemDanh.find((d) => d.thanhVienId === tv.id)
          return dd
            ? { ...tv, coMatHop: dd.trangThai === 'tham_gia' }
            : tv
        })

        return {
          ...h,
          phienHop: list,
          thanhVien,
          ngayHopDuKien: values.thoiGian.format('YYYY-MM-DD'),
          diaDiem: payload.diaDiem,
          trangThai: h.trangThai === 'sapLap' ? 'dangHop' : h.trangThai,
        }
      })

      setPhienModalOpen(false)
      message.success(
        editingPhienId ? 'Đã cập nhật phiên họp' : 'Đã lập phiên họp hội đồng',
      )
    })
  }

  function chotKetQuaPhien() {
    if (!selectedHD) return
    if (selectedHD.phiEn === 1) {
      Modal.confirm({
        title: 'Chốt biên bản phiên 1?',
        icon: <ExclamationCircleOutlined />,
        content:
          'Phiên 1 chỉ ghi nhận “Đã họp” kèm biên bản và danh sách điều chỉnh — không chấm Đạt/Không đạt.',
        okText: 'Chốt',
        cancelText: 'Hủy',
        onOk: () => {
          patchHD(selectedHD.id, {
            trangThai: 'daKetThuc',
            ngayKetThuc: new Date().toISOString().slice(0, 10),
            bienBanHopFile: selectedHD.bienBanHopFile || `BB-HĐXD-P1-${selectedHD.maHoSo}.pdf`,
            danhSachDieuChinh: selectedHD.danhSachDieuChinh?.length
              ? selectedHD.danhSachDieuChinh
              : ['Bổ sung nội dung theo góp ý HĐ (mock)'],
            tomTatKetLuan:
              selectedHD.tomTatKetLuan ||
              'Phiên 1 hoàn thành. Hội đồng thống nhất danh sách nội dung cần điều chỉnh.',
          })
          message.success('Đã chốt biên bản phiên 1')
        },
      })
      return
    }

    const r = danhGiaKetQua(selectedHD)
    if (!r.ketQua) {
      message.warning(r.lyDo || 'Chưa đủ dữ liệu để chốt kết quả')
      return
    }
    Modal.confirm({
      title: 'Chốt kết quả phiên 2?',
      icon: <ExclamationCircleOutlined />,
      content: (
        <div>
          <p>
            Điểm TB: <Text strong>{r.diemTB?.toFixed(2)}</Text> / 100 (ngưỡng {NGUONG_DIEM_HD})
          </p>
          <p>
            Kết quả:{' '}
            <Tag color={r.ketQua === 'DAT' ? 'green' : 'red'}>
              {r.ketQua === 'DAT' ? 'ĐẠT' : 'KHÔNG ĐẠT'}
            </Tag>
          </p>
          {r.traVeBuoc15 && (
            <Alert
              type="warning"
              showIcon
              message="Không đạt → trả hồ sơ về bước 15 để hoàn thiện và đánh giá lại."
            />
          )}
          {r.lyDo && <Text type="secondary">{r.lyDo}</Text>}
        </div>
      ),
      okText: 'Chốt kết quả',
      cancelText: 'Hủy',
      onOk: () => {
        patchHD(selectedHD.id, {
          trangThai: 'daKetThuc',
          ngayKetThuc: new Date().toISOString().slice(0, 10),
          diemTrungBinhHoiDong: r.diemTB,
          ketQuaDanhGia: r.ketQua,
          traVeBuoc15: r.traVeBuoc15,
          tomTatKetLuan:
            r.ketQua === 'DAT'
              ? `Hội đồng phiên 2 ĐẠT (điểm TB ${r.diemTB?.toFixed(2)} ≥ ${NGUONG_DIEM_HD}).`
              : `Hội đồng phiên 2 KHÔNG ĐẠT. ${r.lyDo ?? ''} Trả về bước 15.`,
          bienBanHopFile: selectedHD.bienBanHopFile || `BB-HĐXD-P2-${selectedHD.maHoSo}.pdf`,
        })
        message.success(
          r.ketQua === 'DAT' ? 'Đã chốt: ĐẠT' : 'Đã chốt: KHÔNG ĐẠT — trả bước 15',
        )
      },
    })
  }

  function thuHoiPhieu(tvId: string) {
    if (!selectedHD) return
    const tv = selectedHD.thanhVien.find((t) => t.id === tvId)
    if (!tv || !coTheThuHoiPhieu(tv)) {
      message.warning('Chỉ thu hồi được khi phiếu đã gửi và Thư ký KH chưa duyệt.')
      return
    }
    Modal.confirm({
      title: 'Thu hồi phiếu đánh giá?',
      content: `Thành viên ${tv.hoTen} có thể chỉnh sửa và gửi lại phiếu.`,
      okText: 'Thu hồi',
      cancelText: 'Hủy',
      onOk: () => {
        patchHD(selectedHD.id, (h) => ({
          ...h,
          thanhVien: h.thanhVien.map((t) =>
            t.id === tvId
              ? {
                  ...t,
                  phieuDanhGia: t.phieuDanhGia
                    ? { ...t.phieuDanhGia, trangThai: 'thu_hoi', daKySo: false }
                    : t.phieuDanhGia,
                }
              : t,
          ),
        }))
        message.success('Đã thu hồi phiếu')
      },
    })
  }

  const columns: ColumnsType<ThanhVienHoiDong> = [
    {
      title: 'Vai trò',
      dataIndex: 'vaiTro',
      width: 110,
      render: (v: VaiTroHoiDong) => (
        <Tag color={TAG_COLORS[v]} style={{ fontWeight: 600 }}>
          {VAI_TRO_HD[v].ten}
          {VAI_TRO_HD[v].batBuoc ? ' *' : ''}
        </Tag>
      ),
      sorter: (a, b) => VAI_TRO_HD[a.vaiTro].thuTu - VAI_TRO_HD[b.vaiTro].thuTu,
    },
    {
      title: 'Họ tên',
      dataIndex: 'hoTen',
      render: (name: string, row) => (
        <Space direction="vertical" size={0}>
          <Text strong>{name}</Text>
          <Text type="secondary" style={{ fontSize: 12 }}>
            {row.hocHamHocVi}
          </Text>
        </Space>
      ),
    },
    {
      title: 'Đơn vị',
      dataIndex: 'donVi',
      width: 170,
      render: (v: string) => <Text style={{ fontSize: 13 }}>{v}</Text>,
    },
    {
      title: 'Có mặt',
      dataIndex: 'coMatHop',
      width: 90,
      align: 'center',
      render: (v?: boolean) =>
        v ? <Tag color="green">Có mặt</Tag> : <Tag>Vắng</Tag>,
    },
    {
      title: 'PĐG',
      key: 'pdg',
      width: 120,
      render: (_, row) => {
        const st = row.phieuDanhGia?.trangThai ?? 'chua_nop'
        const meta = PHIEU_OPTS[st]
        return (
          <Space direction="vertical" size={0}>
            <Tag color={meta.color}>{meta.label}</Tag>
            {row.phieuDanhGia?.daKySo && (
              <Text type="secondary" style={{ fontSize: 11 }}>
                Đã ký số
              </Text>
            )}
          </Space>
        )
      },
    },
    {
      title: 'Điểm',
      key: 'diem',
      width: 80,
      align: 'center',
      render: (_, row) => {
        const d = row.phieuDanhGia?.diemQuyDoi ?? row.diemTrungBinh
        if (d === undefined || row.phieuDanhGia?.trangThai === 'chua_nop') {
          return <Text type="secondary">—</Text>
        }
        return (
          <Text strong style={{ color: d >= NGUONG_DIEM_HD ? '#52c41a' : '#ff4d4f' }}>
            {d.toFixed(2)}
          </Text>
        )
      },
    },
    {
      title: 'Trạng thái',
      dataIndex: 'trangThai',
      width: 110,
      render: (v: ThanhVienHoiDong['trangThai']) => {
        const s = TRANG_THAI_OPTS[v]
        return (
          <Space>
            {s.icon}
            <Text type="secondary" style={{ fontSize: 12 }}>
              {s.label}
            </Text>
          </Space>
        )
      },
    },
    {
      title: '',
      key: 'actions',
      width: 48,
      render: (_: unknown, row: ThanhVienHoiDong) => (
        <Dropdown
          menu={{
            items: [
              { key: 'view', label: 'Xem hồ sơ', icon: <EyeOutlined /> },
              {
                key: 'mail',
                label: 'Gửi thư mời',
                icon: <MailOutlined />,
                disabled: row.trangThai === 'tuChoi',
              },
              {
                key: 'recall',
                label: 'Thu hồi phiếu',
                icon: <ReloadOutlined />,
                disabled: !coTheThuHoiPhieu(row),
                onClick: () => thuHoiPhieu(row.id),
              },
            ],
          }}
        >
          <Button type="text" size="small">
            •••
          </Button>
        </Dropdown>
      ),
    },
  ]

  return (
    <div>
      <PageHeader
        icon={<TeamOutlined style={{ fontSize: 26, color: '#ee0033' }} />}
        title="Quản lý Hội đồng Xét duyệt"
        code="HĐXD VHT — quorum 2/3 · CT + 02 UVPB + Thư ký KH · ngưỡng điểm 70"
        extra={
          <Button type="primary" icon={<PlusOutlined />} onClick={() => setCreateModalOpen(true)}>
            Thành lập HĐ mới
          </Button>
        }
      />

      <Row gutter={16}>
        <Col span={8}>
          <Card
            title={
              <Space>
                <FileTextOutlined />
                <span>Danh sách Hội đồng ({hoidongs.length})</span>
              </Space>
            }
            styles={{ body: { padding: 0 } }}
          >
            <List
              dataSource={hoidongs}
              rowKey="id"
              locale={{ emptyText: <Empty description="Chưa có Hội đồng nào" /> }}
              renderItem={(hd) => {
                const hoSo = seedHoSo.find((d: HoSo) => d.id === hd.maHoSo)
                const isSelected = hd.id === selectedHDId
                return (
                  <List.Item
                    key={hd.id}
                    onClick={() => setSelectedHDId(hd.id)}
                    style={{
                      padding: '12px 16px',
                      cursor: 'pointer',
                      background: isSelected ? '#fff1f0' : undefined,
                      borderLeft: isSelected ? '3px solid #ee0033' : '3px solid transparent',
                    }}
                  >
                    <List.Item.Meta
                      avatar={
                        <div
                          style={{
                            width: 40,
                            height: 40,
                            borderRadius: '50%',
                            background: hd.phiEn === 2 ? '#722ed1' : '#1890ff',
                            color: 'white',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            fontWeight: 700,
                            fontSize: 14,
                          }}
                        >
                          P{hd.phiEn}
                        </div>
                      }
                      title={
                        <Text strong style={{ color: isSelected ? '#ee0033' : undefined }}>
                          Phiên {hd.phiEn} · {hd.tenDeTai.slice(0, 28)}
                          {hd.tenDeTai.length > 28 ? '…' : ''}
                        </Text>
                      }
                      description={
                        <Space direction="vertical" size={0}>
                          <Text type="secondary" style={{ fontSize: 12 }}>
                            {hoSo ? `HS: ${hoSo.id}` : hd.maHoSo} · {hd.id}
                          </Text>
                          <Space wrap>
                            <Tag
                              color={
                                hd.trangThai === 'sapLap'
                                  ? 'blue'
                                  : hd.trangThai === 'dangHop'
                                    ? 'processing'
                                    : hd.trangThai === 'daKetThuc'
                                      ? 'green'
                                      : 'default'
                              }
                            >
                              {hd.phiEn === 1 && hd.trangThai === 'daKetThuc'
                                ? 'Đã họp'
                                : hd.trangThai === 'sapLap'
                                  ? 'Sắp họp'
                                  : hd.trangThai === 'dangHop'
                                    ? 'Đang họp'
                                    : hd.trangThai === 'daKetThuc'
                                      ? 'Đã kết thúc'
                                      : 'Hủy'}
                            </Tag>
                            {hd.ketQuaDanhGia && (
                              <Tag color={hd.ketQuaDanhGia === 'DAT' ? 'green' : 'red'}>
                                {hd.ketQuaDanhGia === 'DAT' ? 'Đạt' : 'Không đạt'}
                              </Tag>
                            )}
                          </Space>
                        </Space>
                      }
                    />
                  </List.Item>
                )
              }}
            />
          </Card>
        </Col>

        <Col span={16}>
          {!selectedHD || !thanhPhan || !quorum ? (
            <Card>
              <Empty description="Chọn một Hội đồng để xem chi tiết" />
            </Card>
          ) : (
            <>
              {!thanhPhan.ok && (
                <Alert
                  type="error"
                  showIcon
                  style={{ marginBottom: 12 }}
                  message="Thiếu thành phần bắt buộc"
                  description={`Cần Chủ tịch + 02 UVPB + Thư ký KH. Thiếu: ${thanhPhan.thieu
                    .map((v) => VAI_TRO_HD[v].ten)
                    .join(', ')}`}
                />
              )}
              {!quorum.ok && (
                <Alert
                  type="warning"
                  showIcon
                  style={{ marginBottom: 12 }}
                  message="Chưa đạt quorum"
                  description={`Cần ≥ ${quorum.canThiet}/${selectedHD.thanhVien.length} thành viên có mặt (2/3) và đủ CT + 02 UVPB + Thư ký KH có mặt. Hiện có mặt: ${quorum.soCoMat}.${
                    quorum.thieuVaiTroBatBuoc.length
                      ? ' Thiếu có mặt: ' +
                        quorum.thieuVaiTroBatBuoc.map((v) => VAI_TRO_HD[v].ten).join(', ')
                      : ''
                  }`}
                />
              )}
              {selectedHD.phiEn === 2 && !moPhien2Ok && (
                <Alert
                  type="error"
                  showIcon
                  style={{ marginBottom: 12 }}
                  message="Chưa đủ tiền đề mở phiên 2"
                  description="Bốn ban KHCN / TCKT / MS / NS phải thẩm định song song và đều Đạt mới được mở họp phiên 2."
                />
              )}
              {quorum.ok && thanhPhan.ok && (
                <Alert
                  type="success"
                  showIcon
                  style={{ marginBottom: 12 }}
                  message={`Quorum đạt (${quorum.soCoMat}/${selectedHD.thanhVien.length}, cần ≥ ${quorum.canThiet}) — đủ thành phần bắt buộc có mặt.`}
                />
              )}

              <Card style={{ marginBottom: 16 }}>
                <Row gutter={16}>
                  <Col span={14}>
                    <Space direction="vertical" size={4}>
                      <Title level={5} style={{ marginBottom: 0 }}>
                        HĐXD VHT — Phiên {selectedHD.phiEn}
                        {selectedHD.phiEn === 1 ? ' (tư vấn)' : ' (xét duyệt)'}
                      </Title>
                      <Text type="secondary">{selectedHD.tenDeTai}</Text>
                      <Space split={<span style={{ color: '#d9d9d9' }}>|</span>}>
                        <Text type="secondary" style={{ fontSize: 12 }}>
                          Mã HĐ: <Text code>{selectedHD.id}</Text>
                        </Text>
                        <Text type="secondary" style={{ fontSize: 12 }}>
                          HS: <Text code>{selectedHD.maHoSo}</Text>
                        </Text>
                      </Space>
                    </Space>
                    <div style={{ marginTop: 12 }}>
                      {selectedHD.linhVucNghienCuu.map((lv) => (
                        <Tag key={lv} color="blue">
                          {lv}
                        </Tag>
                      ))}
                    </div>
                  </Col>
                  <Col span={10}>
                    <Row gutter={[8, 8]}>
                      <Col span={12}>
                        <Statistic title="Thành viên" value={selectedHD.thanhVien.length} prefix={<TeamOutlined />} />
                      </Col>
                      <Col span={12}>
                        <Statistic
                          title="Quorum"
                          value={`${quorum.soCoMat}/${quorum.canThiet}`}
                          valueStyle={{ color: quorum.ok ? '#52c41a' : '#faad14' }}
                        />
                      </Col>
                      <Col span={12}>
                        <Statistic title="Đã xác nhận" value={confirmedCount} valueStyle={{ color: '#52c41a' }} />
                      </Col>
                      <Col span={12}>
                        <Statistic
                          title={`Điểm TB /100`}
                          value={diemTB !== undefined ? diemTB.toFixed(2) : '—'}
                          valueStyle={{
                            color:
                              diemTB === undefined
                                ? undefined
                                : diemTB >= NGUONG_DIEM_HD
                                  ? '#52c41a'
                                  : '#ff4d4f',
                          }}
                        />
                      </Col>
                    </Row>
                  </Col>
                </Row>

                <Row gutter={16} style={{ marginTop: 16 }}>
                  <Col span={14}>
                    <Steps
                      size="small"
                      current={
                        selectedHD.trangThai === 'sapLap'
                          ? 0
                          : selectedHD.trangThai === 'dangHop'
                            ? 2
                            : 3
                      }
                      items={[
                        { title: 'Thành lập', description: formatDate(selectedHD.ngayThanhLap) },
                        { title: 'Thư mời', description: `${confirmedCount}/${selectedHD.thanhVien.length}` },
                        { title: `Phiên ${selectedHD.phiEn}`, description: formatDate(selectedHD.ngayHopDuKien) },
                        {
                          title: selectedHD.phiEn === 1 ? 'Đã họp' : 'Kết quả',
                          description:
                            selectedHD.trangThai === 'daKetThuc'
                              ? formatDate(selectedHD.ngayKetThuc ?? '')
                              : '—',
                        },
                      ]}
                    />
                  </Col>
                  <Col span={10} style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap' }}>
                    <Button
                      icon={<MailOutlined />}
                      onClick={() => message.info('Đã gửi thư mời đến các thành viên')}
                    >
                      Gửi thư mời
                    </Button>
                    <Button
                      type="primary"
                      icon={<CheckCircleOutlined />}
                      onClick={chotKetQuaPhien}
                      disabled={selectedHD.trangThai === 'daKetThuc' || selectedHD.trangThai === 'huyBo'}
                    >
                      {selectedHD.phiEn === 1 ? 'Chốt biên bản P1' : 'Chốt kết quả P2'}
                    </Button>
                    <Dropdown
                      menu={{
                        items: [
                          { key: 'print', label: 'Xuất biên bản', icon: <PrinterOutlined /> },
                          { key: 'edit', label: 'Chỉnh sửa thông tin', icon: <EditOutlined /> },
                          { key: 'member', label: 'Thêm thành viên', icon: <UserAddOutlined /> },
                          { key: 'cancel', label: 'Hủy HĐ', icon: <DeleteOutlined />, danger: true },
                        ],
                      }}
                    >
                      <Button>Thao tác</Button>
                    </Dropdown>
                  </Col>
                </Row>
              </Card>

              {selectedHD.phiEn === 2 && selectedHD.tienDeThamDinh && (
                <Card size="small" title="Tiền đề phiên 2 — Thẩm định song song 4 ban" style={{ marginBottom: 16 }}>
                  <Space wrap>
                    {(
                      [
                        ['khcn', 'KHCN'],
                        ['tckt', 'TCKT'],
                        ['ms', 'MS'],
                        ['ns', 'NS'],
                      ] as const
                    ).map(([k, label]) => {
                      const v = selectedHD.tienDeThamDinh![k]
                      return (
                        <Tag key={k} color={v === 'DAT' ? 'green' : 'red'}>
                          {label}: {v === 'DAT' ? 'Đạt' : 'Chưa đạt'}
                        </Tag>
                      )
                    })}
                    <Text type="secondary">
                      {moPhien2Ok
                        ? 'Đủ điều kiện mở phiên 2 (Thư ký KH xác nhận hồ sơ).'
                        : 'Có ban Chưa đạt → không mở phiên 2.'}
                    </Text>
                  </Space>
                </Card>
              )}

              <Card size="small" style={{ marginBottom: 16 }}>
                <Descriptions column={3} size="small">
                  <Descriptions.Item label={<Space><EnvironmentOutlined /> Địa điểm</Space>}>
                    {selectedHD.diaDiem ?? 'Chưa xác định'}
                  </Descriptions.Item>
                  <Descriptions.Item label={<Space><FieldTimeOutlined /> Ngày họp</Space>}>
                    {formatDate(selectedHD.ngayHopDuKien)}
                  </Descriptions.Item>
                  <Descriptions.Item label="Ngưỡng điểm">
                    <Text code>≥ {NGUONG_DIEM_HD}/100</Text> (cố định)
                  </Descriptions.Item>
                </Descriptions>
              </Card>

              <Card
                size="small"
                style={{ marginBottom: 16 }}
                title={
                  <Space>
                    <CalendarOutlined />
                    <span>Phiên họp ({selectedHD.phienHop?.length ?? 0})</span>
                  </Space>
                }
                extra={
                  <Button
                    type="primary"
                    size="small"
                    icon={<PlusOutlined />}
                    disabled={
                      selectedHD.trangThai === 'huyBo' ||
                      selectedHD.thanhVien.length === 0
                    }
                    onClick={() => openTaoPhienHop()}
                  >
                    Lập phiên họp
                  </Button>
                }
              >
                <Alert
                  type="info"
                  showIcon
                  style={{ marginBottom: 12 }}
                  message="Mỗi phiên họp bắt buộc khai báo thời gian, địa điểm và tích chọn từng thành viên Tham gia / Không tham gia."
                />
                {(selectedHD.phienHop?.length ?? 0) === 0 ? (
                  <Empty description="Chưa có phiên họp — nhấn Lập phiên họp" />
                ) : (
                  <Table
                    size="small"
                    rowKey="id"
                    pagination={false}
                    dataSource={[...(selectedHD.phienHop ?? [])].sort((a, b) =>
                      a.thoiGian.localeCompare(b.thoiGian),
                    )}
                    columns={[
                      {
                        title: 'Tên phiên',
                        dataIndex: 'ten',
                        render: (ten: string, row: PhienHopHoiDong) => (
                          <Space direction="vertical" size={0}>
                            <Text strong>{ten}</Text>
                            <Text type="secondary" style={{ fontSize: 12 }}>
                              {row.loaiPhien === 'khac'
                                ? 'Họp khác'
                                : `Phiên nghiệp vụ ${row.loaiPhien}`}
                            </Text>
                          </Space>
                        ),
                      },
                      {
                        title: 'Thời gian',
                        dataIndex: 'thoiGian',
                        width: 160,
                        render: (v: string) => formatDateTime(v),
                      },
                      {
                        title: 'Địa điểm',
                        dataIndex: 'diaDiem',
                        ellipsis: true,
                      },
                      {
                        title: 'Tham gia',
                        key: 'dd',
                        width: 130,
                        render: (_: unknown, row: PhienHopHoiDong) => {
                          const c = demThamGiaPhien(row)
                          return (
                            <Space size={4}>
                              <Tag color="green">{c.thamGia} có</Tag>
                              <Tag>{c.khongThamGia} không</Tag>
                            </Space>
                          )
                        },
                      },
                      {
                        title: 'Trạng thái',
                        dataIndex: 'trangThai',
                        width: 120,
                        render: (st: PhienHopHoiDong['trangThai']) => {
                          const m = TRANG_THAI_PHIEN_HOP[st]
                          return <Tag color={m.color}>{m.label}</Tag>
                        },
                      },
                      {
                        title: '',
                        key: 'act',
                        width: 90,
                        render: (_: unknown, row: PhienHopHoiDong) => (
                          <Button
                            type="link"
                            size="small"
                            icon={<EditOutlined />}
                            disabled={row.trangThai === 'da_ket_thuc' || row.trangThai === 'huy'}
                            onClick={() => openTaoPhienHop(row)}
                          >
                            Sửa
                          </Button>
                        ),
                      },
                    ]}
                  />
                )}
              </Card>

              <Card
                title={
                  <Space>
                    <UserOutlined />
                    <span>Thành viên ({selectedHD.thanhVien.length})</span>
                    <Text type="secondary" style={{ fontWeight: 400, fontSize: 12 }}>
                      * bắt buộc · tối đa 2 người/đơn vị
                    </Text>
                  </Space>
                }
                extra={
                  <Space wrap>
                    <Tag color="red">Chủ tịch *</Tag>
                    <Tag color="blue">UVPB 1 *</Tag>
                    <Tag color="cyan">UVPB 2 *</Tag>
                    <Tag color="green">Ủy viên</Tag>
                    <Tag color="orange">Thư ký KH *</Tag>
                  </Space>
                }
              >
                <Tabs
                  size="small"
                  activeKey={membersFilter}
                  onChange={setMembersFilter}
                  items={[
                    { key: 'all', label: `Tất cả (${selectedHD.thanhVien.length})` },
                    {
                      key: 'chapNhan',
                      label: `Chấp nhận (${selectedHD.thanhVien.filter((t) => t.trangThai === 'chapNhan').length})`,
                    },
                    {
                      key: 'duKien',
                      label: `Dự kiến (${selectedHD.thanhVien.filter((t) => t.trangThai === 'duKien').length})`,
                    },
                    {
                      key: 'tuChoi',
                      label: `Từ chối (${selectedHD.thanhVien.filter((t) => t.trangThai === 'tuChoi').length})`,
                    },
                  ]}
                />
                <Table
                  dataSource={filteredMembers}
                  columns={columns}
                  rowKey="id"
                  pagination={false}
                  size="small"
                  scroll={{ x: 'max-content' }}
                  footer={() => (
                    <Text type="secondary" style={{ fontSize: 12 }}>
                      <InfoCircleOutlined style={{ marginRight: 4 }} />
                      Quorum {quorum.soCoMat}/{selectedHD.thanhVien.length} (cần ≥ {quorum.canThiet}) ·
                      Phiếu bắt buộc: {duPhieuBatBuoc(selectedHD) ? 'Đủ' : 'Thiếu'} · Điểm TB:{' '}
                      {diemTB !== undefined ? `${diemTB.toFixed(2)}/100` : '—'}
                      {selectedHD.ketQuaDanhGia && (
                        <span>
                          {' '}
                          · Kết quả:{' '}
                          <Tag
                            color={selectedHD.ketQuaDanhGia === 'DAT' ? 'green' : 'red'}
                            style={{ marginLeft: 4 }}
                          >
                            {selectedHD.ketQuaDanhGia === 'DAT' ? 'ĐẠT' : 'KHÔNG ĐẠT'}
                          </Tag>
                        </span>
                      )}
                    </Text>
                  )}
                />
              </Card>

              <Card
                title={
                  <Space>
                    <FileTextOutlined />
                    <span>
                      {selectedHD.phiEn === 1
                        ? 'Biên bản phiên 1 & Danh sách điều chỉnh'
                        : 'Biên bản phiên 2 & Kết quả xét duyệt'}
                    </span>
                  </Space>
                }
                style={{ marginTop: 16 }}
              >
                {selectedHD.phiEn === 1 ? (
                  selectedHD.trangThai === 'daKetThuc' || selectedHD.bienBanHopFile ? (
                    <Descriptions column={1} size="small" bordered>
                      <Descriptions.Item label="Trạng thái">
                        <Tag color="green">Đã họp</Tag>
                      </Descriptions.Item>
                      <Descriptions.Item label="Tóm tắt">
                        {selectedHD.tomTatKetLuan || '—'}
                      </Descriptions.Item>
                      <Descriptions.Item label="File biên bản">
                        {selectedHD.bienBanHopFile ? (
                          <Button type="link" icon={<FileTextOutlined />}>
                            {selectedHD.bienBanHopFile}
                          </Button>
                        ) : (
                          '—'
                        )}
                      </Descriptions.Item>
                      <Descriptions.Item label="Nội dung cần điều chỉnh / làm rõ">
                        {selectedHD.danhSachDieuChinh?.length ? (
                          <ul style={{ margin: 0, paddingLeft: 18 }}>
                            {selectedHD.danhSachDieuChinh.map((x) => (
                              <li key={x}>{x}</li>
                            ))}
                          </ul>
                        ) : (
                          '—'
                        )}
                      </Descriptions.Item>
                    </Descriptions>
                  ) : (
                    <Empty description="Chưa chốt biên bản phiên 1" />
                  )
                ) : (
                  <Descriptions column={1} size="small" bordered>
                    <Descriptions.Item label="Điểm trung bình">
                      {selectedHD.diemTrungBinhHoiDong !== undefined
                        ? `${selectedHD.diemTrungBinhHoiDong.toFixed(2)} / 100`
                        : diemTB !== undefined
                          ? `${diemTB.toFixed(2)} / 100 (tạm tính)`
                          : '—'}
                    </Descriptions.Item>
                    <Descriptions.Item label="Kết quả">
                      {selectedHD.ketQuaDanhGia || ketQuaCalc?.ketQua ? (
                        <Tag
                          color={
                            (selectedHD.ketQuaDanhGia || ketQuaCalc?.ketQua) === 'DAT'
                              ? 'green'
                              : 'red'
                          }
                        >
                          {(selectedHD.ketQuaDanhGia || ketQuaCalc?.ketQua) === 'DAT'
                            ? 'ĐẠT'
                            : 'KHÔNG ĐẠT'}
                        </Tag>
                      ) : (
                        <Text type="secondary">Chưa chốt</Text>
                      )}
                    </Descriptions.Item>
                    {(selectedHD.traVeBuoc15 || ketQuaCalc?.traVeBuoc15) && (
                      <Descriptions.Item label="Xử lý tiếp">
                        <Alert
                          type="warning"
                          showIcon
                          message="Trả hồ sơ về bước 15 để hoàn thiện và đánh giá lại."
                        />
                      </Descriptions.Item>
                    )}
                    <Descriptions.Item label="Ghi chú">
                      {selectedHD.tomTatKetLuan || ketQuaCalc?.lyDo || '—'}
                    </Descriptions.Item>
                    <Descriptions.Item label="File biên bản">
                      {selectedHD.bienBanHopFile ? (
                        <Button type="link" icon={<FileTextOutlined />}>
                          {selectedHD.bienBanHopFile}
                        </Button>
                      ) : (
                        '—'
                      )}
                    </Descriptions.Item>
                  </Descriptions>
                )}
              </Card>
            </>
          )}
        </Col>
      </Row>

      <Modal
        title={
          <Space>
            <TeamOutlined />
            <span>Thành lập Hội đồng mới</span>
          </Space>
        }
        open={createModalOpen}
        onCancel={() => setCreateModalOpen(false)}
        footer={null}
        width={640}
      >
        <Text type="secondary">
          Chọn hồ sơ để tự động lập HĐ với đủ CT + 02 UVPB + Thư ký KH (theo lĩnh vực đề tài).
        </Text>
        <List
          style={{ marginTop: 16, maxHeight: 400, overflowY: 'auto' }}
          dataSource={dossiers.filter(
            (d) => !hoidongs.some((h) => h.maHoSo === d.id && h.phiEn === 1),
          )}
          locale={{ emptyText: <Empty description="Tất cả hồ sơ đã có HĐ phiên 1" /> }}
          renderItem={(d) => (
            <List.Item
              actions={[
                <Button
                  key="create"
                  type="link"
                  onClick={() => handleCreateFromDossier(d.id, d.maNV, d.nv?.ten ?? d.maNV)}
                >
                  Thành lập
                </Button>,
              ]}
            >
              <List.Item.Meta
                title={d.id}
                description={`${d.maNV} — ${d.nv?.ten ?? ''}`}
              />
            </List.Item>
          )}
        />
      </Modal>

      <Modal
        title={
          <Space>
            <CalendarOutlined />
            <span>{editingPhienId ? 'Sửa phiên họp' : 'Lập phiên họp hội đồng'}</span>
          </Space>
        }
        open={phienModalOpen}
        onCancel={() => setPhienModalOpen(false)}
        onOk={luuPhienHop}
        okText={editingPhienId ? 'Cập nhật' : 'Lưu phiên họp'}
        cancelText="Hủy"
        width={780}
        destroyOnClose
      >
        <Alert
          type="warning"
          showIcon
          style={{ marginBottom: 16 }}
          message="Bắt buộc: thời gian, địa điểm, và tích chọn Tham gia / Không tham gia cho mọi thành viên."
        />
        <Form form={phienForm} layout="vertical" requiredMark>
          <Row gutter={12}>
            <Col span={14}>
              <Form.Item
                name="ten"
                label="Tên phiên họp"
                rules={[{ required: true, message: 'Nhập tên phiên họp' }]}
              >
                <Input placeholder="VD: Họp phiên 1" />
              </Form.Item>
            </Col>
            <Col span={10}>
              <Form.Item
                name="loaiPhien"
                label="Loại phiên"
                rules={[{ required: true }]}
              >
                <Radio.Group
                  optionType="button"
                  options={[
                    { label: 'Phiên 1', value: 1 },
                    { label: 'Phiên 2', value: 2 },
                    { label: 'Khác', value: 'khac' },
                  ]}
                />
              </Form.Item>
            </Col>
          </Row>
          <Row gutter={12}>
            <Col span={12}>
              <Form.Item
                name="thoiGian"
                label="Thời gian họp"
                rules={[{ required: true, message: 'Khai báo thời gian họp' }]}
              >
                <DatePicker
                  showTime={{ format: 'HH:mm' }}
                  format="DD/MM/YYYY HH:mm"
                  style={{ width: '100%' }}
                  placeholder="Chọn ngày giờ"
                />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item
                name="diaDiem"
                label="Địa điểm"
                rules={[{ required: true, message: 'Khai báo địa điểm họp' }]}
              >
                <Input placeholder="VD: Phòng họp A3 - Tầng 3, Trụ sở VHT" />
              </Form.Item>
            </Col>
          </Row>
          <Form.Item name="ghiChu" label="Ghi chú">
            <Input.TextArea rows={2} placeholder="Ghi chú thêm (không bắt buộc)" />
          </Form.Item>
        </Form>

        <div style={{ marginBottom: 8, display: 'flex', justifyContent: 'space-between' }}>
          <Text strong>
            Điểm danh thành viên ({selectedHD?.thanhVien.length ?? 0})
          </Text>
          <Space>
            <Button size="small" onClick={() => chonTatCa('tham_gia')}>
              Tất cả tham gia
            </Button>
            <Button size="small" onClick={() => chonTatCa('khong_tham_gia')}>
              Tất cả không
            </Button>
          </Space>
        </div>
        <Table
          size="small"
          rowKey="id"
          pagination={false}
          scroll={{ y: 280 }}
          dataSource={selectedHD?.thanhVien ?? []}
          columns={[
            {
              title: 'Vai trò',
              dataIndex: 'vaiTro',
              width: 110,
              render: (v: VaiTroHoiDong) => (
                <Tag color={TAG_COLORS[v]}>{VAI_TRO_HD[v].ten}</Tag>
              ),
            },
            {
              title: 'Họ tên',
              dataIndex: 'hoTen',
              render: (name: string, row: ThanhVienHoiDong) => (
                <Space direction="vertical" size={0}>
                  <Text>{name}</Text>
                  <Text type="secondary" style={{ fontSize: 12 }}>
                    {row.donVi}
                  </Text>
                </Space>
              ),
            },
            {
              title: 'Tham gia',
              key: 'tham_gia',
              width: 100,
              align: 'center',
              render: (_: unknown, row: ThanhVienHoiDong) => (
                <Checkbox
                  checked={diemDanhDraft[row.id] === 'tham_gia'}
                  onChange={() => setThamGia(row.id, 'tham_gia')}
                />
              ),
            },
            {
              title: 'Không',
              key: 'khong',
              width: 80,
              align: 'center',
              render: (_: unknown, row: ThanhVienHoiDong) => (
                <Checkbox
                  checked={diemDanhDraft[row.id] === 'khong_tham_gia'}
                  onChange={() => setThamGia(row.id, 'khong_tham_gia')}
                />
              ),
            },
          ]}
        />
        {selectedHD && (
          <Text type="secondary" style={{ fontSize: 12, marginTop: 8, display: 'block' }}>
            Đã chọn:{' '}
            {
              selectedHD.thanhVien.filter((tv) => diemDanhDraft[tv.id] === 'tham_gia')
                .length
            }{' '}
            tham gia ·{' '}
            {
              selectedHD.thanhVien.filter(
                (tv) => diemDanhDraft[tv.id] === 'khong_tham_gia',
              ).length
            }{' '}
            không · thiếu{' '}
            {
              selectedHD.thanhVien.filter((tv) => !diemDanhDraft[tv.id]).length
            }
          </Text>
        )}
      </Modal>
    </div>
  )
}
