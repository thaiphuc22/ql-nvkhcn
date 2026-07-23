import { useMemo, useState } from 'react'
import { useParams } from 'react-router-dom'
import {
  Avatar,
  Button,
  Card,
  Col,
  Descriptions,
  Dropdown,
  Empty,
  List,
  Modal,
  Rate,
  Row,
  Space,
  Statistic,
  Steps,
  Table,
  Tag,
  Tabs,
  Tooltip,
  Typography,
  message,
} from 'antd'
import type { ColumnsType } from 'antd/es/table'
import {
  CheckCircleOutlined,
  ClockCircleOutlined,
  CloseCircleOutlined,
  DeleteOutlined,
  EditOutlined,
  EnvironmentOutlined,
  EyeOutlined,
  FieldTimeOutlined,
  FileTextOutlined,
  InfoCircleOutlined,
  MailOutlined,
  PlusOutlined,
  PrinterOutlined,
  TeamOutlined,
  UserAddOutlined,
  UserOutlined,
} from '@ant-design/icons'
import { seedHoiDong, taoHoiDongMacDinh, type HoiDong, type ThanhVienHoiDong, type VaiTroHoiDong, VAI_TRO_HD } from '../data/hoiDong'
import { seedHoSo, type HoSo, toView } from '../data/dossiers'
import { seedNhiemVu, type NhiemVu } from '../data/nhiemVu'

const { Title, Text } = Typography

// Map vai trò → màu tag
const TAG_COLORS: Record<VaiTroHoiDong, string> = {
  CHU_TICH:    'red',
  PHAN_BIEN_1: 'blue',
  PHAN_BIEN_2: 'cyan',
  UY_VIEN:     'green',
  THU_KY_KH:   'orange',
}

// Map trạng thái thành viên
const TRANG_THAI_OPTS = {
  duKien:   { label: 'Dự kiến',   color: 'default', icon: <ClockCircleOutlined /> },
  chapNhan: { label: 'Chấp nhận', color: 'green',   icon: <CheckCircleOutlined /> },
  tuChoi:   { label: 'Từ chối',   color: 'red',    icon: <CloseCircleOutlined /> },
  vangMat:  { label: 'Vắng mặt', color: 'orange',  icon: <InfoCircleOutlined /> },
} as const

function formatDate(d: string) {
  if (!d) return '—'
  const [y, m, day] = d.split('-')
  return `${day}/${m}/${y}`
}

export default function CouncilCommittee() {
  const { id } = useParams<{ id: string }>()

  const [hoidongs, setHoidongs] = useState<HoiDong[]>(seedHoiDong)
  const [selectedHDId, setSelectedHDId] = useState<string | null>(
    id ?? (seedHoiDong[0]?.id ?? null)
  )
  const [createModalOpen, setCreateModalOpen] = useState(false)
  const [membersFilter, setMembersFilter] = useState<string>('all')

  const selectedHD = useMemo(
    () => hoidongs.find((h) => h.id === selectedHDId) ?? null,
    [hoidongs, selectedHDId]
  )

  // Lấy danh sách hồ sơ để filter
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

  // Tạo Hội đồng mới từ hồ sơ
  const handleCreateFromDossier = (hoSo: HoSo) => {
    const nv = seedNhiemVu.find((n: NhiemVu) => n.ma === hoSo.maNV)
    if (!nv) return
    const newHD = taoHoiDongMacDinh(hoSo.id, hoSo.maNV, nv.ten, 1)
    setHoidongs((prev) => [...prev, newHD])
    setSelectedHDId(newHD.id)
    setCreateModalOpen(false)
    message.success(`Đã tự động thành lập Hội đồng cho "${hoSo.id}"`)
  }

  // Đếm tổng thành viên đã xác nhận
  const confirmedCount = selectedHD?.thanhVien.filter(
    (tv) => tv.trangThai === 'chapNhan'
  ).length ?? 0

  const columns: ColumnsType<ThanhVienHoiDong> = [
    {
      title: 'Vai trò',
      dataIndex: 'vaiTro',
      width: 140,
      render: (v: VaiTroHoiDong) => (
        <Tag color={TAG_COLORS[v]} style={{ fontWeight: 600 }}>
          {VAI_TRO_HD[v].ten}
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
          <Text type="secondary" style={{ fontSize: 12 }}>{row.hocHamHocVi}</Text>
        </Space>
      ),
    },
    {
      title: 'Đơn vị',
      dataIndex: 'donVi',
      width: 200,
      render: (v: string) => <Text style={{ fontSize: 13 }}>{v}</Text>,
    },
    {
      title: 'Lĩnh vực chuyên môn',
      dataIndex: 'linhVucChuyenMon',
      width: 220,
      render: (lv: string[]) =>
        lv?.map((l) => (
          <Tag key={l} style={{ marginBottom: 2 }}>{l}</Tag>
        )),
    },
    {
      title: 'Kinh nghiệm',
      dataIndex: 'kinhNghiemNam',
      width: 90,
      align: 'center',
      render: (n?: number) => (n ? `${n} năm` : '—'),
      sorter: (a, b) => (a.kinhNghiemNam ?? 0) - (b.kinhNghiemNam ?? 0),
    },
    {
      title: 'Trạng thái',
      dataIndex: 'trangThai',
      width: 120,
      render: (v: ThanhVienHoiDong['trangThai']) => {
        const s = TRANG_THAI_OPTS[v]
        return (
          <Space>
            {s.icon}
            <Text type="secondary" style={{ fontSize: 12 }}>{s.label}</Text>
          </Space>
        )
      },
      filters: [
        { text: 'Dự kiến', value: 'duKien' },
        { text: 'Chấp nhận', value: 'chapNhan' },
        { text: 'Từ chối', value: 'tuChoi' },
        { text: 'Vắng mặt', value: 'vangMat' },
      ],
      onFilter: (value, record) => record.trangThai === value,
    },
    {
      title: 'Điểm TB',
      dataIndex: 'diemTrungBinh',
      width: 80,
      align: 'center',
      render: (d?: number) =>
        d ? (
          <Text strong style={{ color: d >= 8 ? '#52c41a' : d >= 5 ? '#faad14' : '#ff4d4f' }}>
            {d.toFixed(1)}
          </Text>
        ) : (
          <Text type="secondary">—</Text>
        ),
    },
    {
      title: 'Ý kiến',
      dataIndex: 'yKienDongGop',
      width: 180,
      render: (y?: string) =>
        y ? (
          <Tooltip title={y}>
            <Text ellipsis style={{ fontSize: 12, color: '#595959' }}>
              {y.length > 30 ? y.slice(0, 30) + '…' : y}
            </Text>
          </Tooltip>
        ) : null,
    },
    {
      title: '',
      key: 'actions',
      width: 40,
      render: (_: unknown, row: ThanhVienHoiDong) => (
        <Dropdown
          menu={{
            items: [
              { key: 'view', label: 'Xem hồ sơ', icon: <EyeOutlined /> },
              { key: 'mail', label: 'Gửi thư mời', icon: <MailOutlined />, disabled: row.trangThai === 'tuChoi' },
              { key: 'reject', label: 'Từ chối', icon: <CloseCircleOutlined />, danger: true, disabled: row.trangThai === 'tuChoi' },
            ],
          }}
        >
          <Button type="text" size="small">•••</Button>
        </Dropdown>
      ),
    },
  ]

  return (
    <div style={{ padding: '0 24px 24px' }}>
      {/* Header */}
      <div style={{ marginBottom: 24, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <Title level={4} style={{ marginBottom: 4 }}>
            <TeamOutlined style={{ marginRight: 8 }} />
            Quản lý Hội đồng Xét duyệt
          </Title>
          <Text type="secondary">
            Tự động thành lập Hội đồng khi hồ sơ đến bước Họp HĐXD VHT
          </Text>
        </div>
        <Button type="primary" icon={<PlusOutlined />} onClick={() => setCreateModalOpen(true)}>
          Thành lập HĐ mới
        </Button>
      </div>

      <Row gutter={16}>
        {/* ===== LEFT: Danh sách Hội đồng ===== */}
        <Col span={8}>
          <Card
            title={
              <Space>
                <FileTextOutlined />
                <span>Danh sách Hội đồng ({hoidongs.length})</span>
              </Space>
            }
            bodyStyle={{ padding: 0 }}
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
                      background: isSelected ? '#e6f7ff' : undefined,
                      borderLeft: isSelected ? '3px solid #1890ff' : '3px solid transparent',
                    }}
                  >
                    <List.Item.Meta
                      avatar={
                        <div style={{
                          width: 40,
                          height: 40,
                          borderRadius: '50%',
                          background: 'var(--ant-primary-color, #1890ff)',
                          color: 'white',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          fontWeight: 700,
                          fontSize: 16,
                        }}>
                          {hd.phiEn}
                        </div>
                      }
                      title={
                        <Space>
                          <Text strong style={{ color: isSelected ? '#1890ff' : undefined }}>
                            HĐXD {hd.tenDeTai.slice(0, 30)}{hd.tenDeTai.length > 30 ? '…' : ''}
                          </Text>
                        </Space>
                      }
                      description={
                        <Space direction="vertical" size={0}>
                          <Text type="secondary" style={{ fontSize: 12 }}>
                            {hoSo ? `HS: ${hoSo.id} · ${hoSo.maNV}` : hd.maHoSo}
                          </Text>
                          <Space>
                            <Tag color={hd.trangThai === 'sapLap' ? 'blue' : hd.trangThai === 'dangHop' ? 'green' : 'default'}>
                              {hd.trangThai === 'sapLap' ? 'Sắp họp' : hd.trangThai === 'dangHop' ? 'Đang họp' : hd.trangThai === 'daKetThuc' ? 'Đã kết thúc' : 'Hủy'}
                            </Tag>
                            <Text type="secondary" style={{ fontSize: 11 }}>
                              <ClockCircleOutlined style={{ marginRight: 3 }} />
                              {formatDate(hd.ngayHopDuKien)}
                            </Text>
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

        {/* ===== RIGHT: Chi tiết Hội đồng ===== */}
        <Col span={16}>
          {!selectedHD ? (
            <Card>
              <Empty description="Chọn một Hội đồng để xem chi tiết" />
            </Card>
          ) : (
            <>
              {/* --- Info Card --- */}
              <Card style={{ marginBottom: 16 }}>
                <Row gutter={16}>
                  <Col span={16}>
                    <Space direction="vertical" size={4}>
                      <Title level={5} style={{ marginBottom: 0 }}>
                        HĐXD VHT — Phiên {selectedHD.phiEn}
                      </Title>
                      <Text type="secondary">{selectedHD.tenDeTai}</Text>
                      <Space split={<span style={{ color: '#d9d9d9' }}>|</span>}>
                        <Text type="secondary" style={{ fontSize: 12 }}>
                          Mã HĐ: <Text code>{selectedHD.id}</Text>
                        </Text>
                        <Text type="secondary" style={{ fontSize: 12 }}>
                          Mã HS: <Text code>{selectedHD.maHoSo}</Text>
                        </Text>
                        <Text type="secondary" style={{ fontSize: 12 }}>
                          NV: <Text code>{selectedHD.maNhiemVu}</Text>
                        </Text>
                      </Space>
                    </Space>
                    <div style={{ marginTop: 12 }}>
                      {selectedHD.linhVucNghienCuu.map((lv) => (
                        <Tag key={lv} color="blue">{lv}</Tag>
                      ))}
                    </div>
                  </Col>
                  <Col span={8}>
                    <Row gutter={8}>
                      <Col span={12}>
                        <Statistic
                          title="Tổng TV"
                          value={selectedHD.thanhVien.length}
                          prefix={<TeamOutlined />}
                        />
                      </Col>
                      <Col span={12}>
                        <Statistic
                          title="Đã xác nhận"
                          value={confirmedCount}
                          valueStyle={{ color: '#52c41a' }}
                        />
                      </Col>
                      <Col span={12}>
                        <Statistic
                          title="Từ chối"
                          value={selectedHD.thanhVien.filter((t) => t.trangThai === 'tuChoi').length}
                          valueStyle={{ color: '#ff4d4f' }}
                        />
                      </Col>
                      <Col span={12}>
                        <Statistic
                          title="Điểm TB"
                          value={
                            selectedHD.thanhVien.filter((t) => t.diemTrungBinh).length > 0
                              ? (
                                selectedHD.thanhVien.reduce((sum, t) => sum + (t.diemTrungBinh ?? 0), 0) /
                                selectedHD.thanhVien.filter((t) => t.diemTrungBinh).length
                              ).toFixed(1)
                              : '—'
                          }
                          prefix={<Rate disabled character="★" style={{ fontSize: 12 }} />}
                        />
                      </Col>
                    </Row>
                  </Col>
                </Row>

                {/* Timeline + Actions row */}
                <Row gutter={16} style={{ marginTop: 16 }}>
                  <Col span={14}>
                    <Steps
                      size="small"
                      current={
                        selectedHD.trangThai === 'sapLap' ? 0 : selectedHD.trangThai === 'dangHop' ? 1 : 2
                      }
                      items={[
                        { title: 'Thành lập', description: formatDate(selectedHD.ngayThanhLap) },
                        { title: 'Gửi thư mời', description: 'Đã gửi 5/7' },
                        { title: 'Phiên họp', description: formatDate(selectedHD.ngayHopDuKien) },
                        { title: 'Kết thúc', description: selectedHD.trangThai === 'daKetThuc' ? formatDate(selectedHD.ngayKetThuc ?? '') : '—' },
                      ]}
                    />
                  </Col>
                  <Col span={10} style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                    <Button icon={<MailOutlined />} onClick={() => message.info('Đã gửi thư mời đến các thành viên')}>
                      Gửi thư mời
                    </Button>
                    <Button icon={<PrinterOutlined />} onClick={() => message.info('Đang xuất biên bản...')}>
                      Xuất biên bản
                    </Button>
                    <Dropdown
                      menu={{
                        items: [
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

              {/* --- Thông tin địa điểm + thời gian --- */}
              <Card size="small" style={{ marginBottom: 16 }}>
                <Descriptions column={3} size="small">
                  <Descriptions.Item
                    label={<Space><EnvironmentOutlined /> Địa điểm</Space>}
                  >
                    {selectedHD.diaDiem ?? 'Chưa xác định'}
                  </Descriptions.Item>
                  <Descriptions.Item
                    label={<Space><FieldTimeOutlined /> Ngày họp dự kiến</Space>}
                  >
                    {formatDate(selectedHD.ngayHopDuKien)}
                  </Descriptions.Item>
                  <Descriptions.Item label="Đơn vị chủ trì">
                    {(() => {
                      const hs = seedHoSo.find((d: HoSo) => d.id === selectedHD.maHoSo)
                      if (!hs) return '—'
                      const nv = seedNhiemVu.find((n: NhiemVu) => n.ma === hs.maNV)
                      return nv?.donViChuTri ?? '—'
                    })()}
                  </Descriptions.Item>
                </Descriptions>
              </Card>

              {/* --- Danh sách thành viên --- */}
              <Card
                title={
                  <Space>
                    <UserOutlined />
                    <span>Danh sách thành viên ({selectedHD.thanhVien.length} người)</span>
                    <Text type="secondary" style={{ fontWeight: 400, fontSize: 12 }}>
                      Tối đa 2 người mỗi phòng ban
                    </Text>
                  </Space>
                }
                extra={
                  <Space>
                    <Tag color="red">Chủ tịch</Tag>
                    <Tag color="blue">Phản biện 1</Tag>
                    <Tag color="cyan">Phản biện 2</Tag>
                    <Tag color="green">Ủy viên</Tag>
                    <Tag color="orange">Thư ký KH</Tag>
                  </Space>
                }
              >
                <Space direction="vertical" style={{ width: '100%' }} size="middle">
                  {/* Filter tabs */}
                  <Tabs
                    size="small"
                    activeKey={membersFilter}
                    onChange={setMembersFilter}
                    items={[
                      { key: 'all', label: `Tất cả (${selectedHD.thanhVien.length})` },
                      { key: 'chapNhan', label: `Chấp nhận (${selectedHD.thanhVien.filter((t) => t.trangThai === 'chapNhan').length})` },
                      { key: 'duKien', label: `Dự kiến (${selectedHD.thanhVien.filter((t) => t.trangThai === 'duKien').length})` },
                      { key: 'tuChoi', label: `Từ chối (${selectedHD.thanhVien.filter((t) => t.trangThai === 'tuChoi').length})` },
                    ]}
                    style={{ marginBottom: 0 }}
                  />
                  <Table
                    dataSource={filteredMembers}
                    columns={columns}
                    rowKey="id"
                    pagination={false}
                    size="small"
                    footer={() => (
                      <Text type="secondary" style={{ fontSize: 12 }}>
                        <InfoCircleOutlined style={{ marginRight: 4 }} />
                        Đã xác nhận: {confirmedCount}/{selectedHD.thanhVien.length} thành viên ·
                        Điểm trung bình HĐ: {
                          selectedHD.thanhVien.filter((t) => t.diemTrungBinh).length > 0
                            ? (
                                selectedHD.thanhVien.reduce((sum, t) => sum + (t.diemTrungBinh ?? 0), 0) /
                                selectedHD.thanhVien.filter((t) => t.diemTrungBinh).length
                              ).toFixed(1)
                            : '—'
                        }/10
                        {selectedHD.ketQuaDanhGia && (
                          <span> · Kết quả: <Tag color={
                            selectedHD.ketQuaDanhGia === 'DAT' ? 'green' :
                            selectedHD.ketQuaDanhGia === 'CANH_CAO' ? 'orange' : 'red'
                          } style={{ marginLeft: 4 }}>{selectedHD.ketQuaDanhGia}</Tag></span>
                        )}
                      </Text>
                    )}
                  />
                </Space>
              </Card>

              {/* --- Biên bản / Kết luận --- */}
              {selectedHD.trangThai !== 'sapLap' && (
                <Card
                  title={
                    <Space>
                      <FileTextOutlined />
                      <span>Biên bản & Kết luận</span>
                    </Space>
                  }
                  style={{ marginTop: 16 }}
                >
                  {selectedHD.tomTatKetLuan ? (
                    <Descriptions column={1} size="small" bordered>
                      <Descriptions.Item label="Tóm tắt kết luận">
                        {selectedHD.tomTatKetLuan}
                      </Descriptions.Item>
                      {selectedHD.bienBanHopFile && (
                        <Descriptions.Item label="File biên bản">
                          <Button type="link" icon={<FileTextOutlined />} onClick={() => message.info('Mở file biên bản')}>
                            {selectedHD.bienBanHopFile}
                          </Button>
                        </Descriptions.Item>
                      )}
                      {selectedHD.ketQuaDanhGia && (
                        <Descriptions.Item label="Kết quả đánh giá">
                          <Tag color={
                            selectedHD.ketQuaDanhGia === 'DAT' ? 'green' :
                            selectedHD.ketQuaDanhGia === 'CANH_CAO' ? 'orange' : 'red'
                          } style={{ fontSize: 14 }}>
                            {selectedHD.ketQuaDanhGia === 'DAT' ? 'ĐẠT' :
                             selectedHD.ketQuaDanhGia === 'CANH_CAO' ? 'CẢNH BÁO' : 'KHÔNG ĐẠT'}
                          </Tag>
                        </Descriptions.Item>
                      )}
                    </Descriptions>
                  ) : (
                    <Empty description="Chưa có biên bản — phiên họp chưa diễn ra" />
                  )}
                </Card>
              )}
            </>
          )}
        </Col>
      </Row>

      {/* ===== Modal: Tạo HĐ mới từ hồ sơ ===== */}
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
          Chọn một hồ sơ bên dưới để hệ thống tự động thành lập Hội đồng với các thành viên phù hợp lĩnh vực nghiên cứu.
        </Text>
        <List
          style={{ marginTop: 16, maxHeight: 400, overflowY: 'auto' }}
          dataSource={dossiers.filter((d) => !hoidongs.some((h) => h.maHoSo === d.id && h.phiEn === 1))}
          locale={{ emptyText: <Empty description="Tất cả hồ sơ đã có HĐ phiên 1" /> }}
          renderItem={(d) => (
            <List.Item
              key={d.id}
              actions={[
                <Button
                  key="create"
                  type="primary"
                  size="small"
                  icon={<PlusOutlined />}
                  onClick={() => handleCreateFromDossier(d)}
                >
                  Thành lập HĐ
                </Button>,
              ]}
            >
              <List.Item.Meta
                avatar={<Avatar icon={<FileTextOutlined />} style={{ background: 'var(--ant-primary-color, #1890ff)' }} />}
                title={d.id}
                description={
                  <Space direction="vertical" size={0}>
                    <Text style={{ fontSize: 13 }}>{d.nv?.ten ?? d.maDeTai}</Text>
                    <Text type="secondary" style={{ fontSize: 11 }}>
                      {d.maNV} · {d.nv?.cap ?? d.cap} · {d.quyTrinhTen}
                    </Text>
                  </Space>
                }
              />
            </List.Item>
          )}
        />
      </Modal>
    </div>
  )
}