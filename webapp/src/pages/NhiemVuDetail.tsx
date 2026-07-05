import { useMemo } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { Card, Col, Descriptions, Row, Steps, Tag, Typography } from 'antd'
import type { ColumnsType } from 'antd/es/table'
import { ExperimentOutlined } from '@ant-design/icons'
import { GIAI_DOAN, GIAI_DOAN_COLOR, GIAI_DOAN_ORDER } from '../data/nhiemVu'
import { LOAI_TO_GIAIDOAN, type Dossier } from '../data/dossiers'
import { useNhiemVu } from '../store/NhiemVuContext'
import { useDossiers } from '../store/DossierContext'
import { PageHeader, NotFound, EntityTable, DossierStatusTag } from '../components/ui'

const { Text, Paragraph } = Typography

type StepStatus = 'finish' | 'process' | 'error' | 'wait'

export default function NhiemVuDetail() {
  const { ma = '' } = useParams()
  const navigate = useNavigate()
  const { getByMa } = useNhiemVu()
  const { list } = useDossiers()

  const nv = getByMa(decodeURIComponent(ma))
  const hoSo = useMemo(
    () => list.filter((d) => d.maNV === decodeURIComponent(ma)).sort((a, b) => a.ngayTao.localeCompare(b.ngayTao)),
    [list, ma],
  )

  if (!nv) {
    return (
      <NotFound
        title="Không tìm thấy nhiệm vụ"
        subTitle={`Mã "${ma}" không tồn tại.`}
        onBack={() => navigate('/nhiem-vu')}
        backText="Về danh sách nhiệm vụ"
      />
    )
  }

  const curIdx = GIAI_DOAN_ORDER.indexOf(nv.giaiDoan)

  const lifecycleItems = GIAI_DOAN_ORDER.map((stage, i) => {
    const hs = hoSo.find((d) => LOAI_TO_GIAIDOAN[d.loai] === stage)
    let status: StepStatus = 'wait'
    if (hs) status = hs.trangThai === 'approved' ? 'finish' : hs.trangThai === 'rejected' ? 'error' : 'process'
    return {
      title: GIAI_DOAN[stage],
      status,
      description: (
        <div style={{ fontSize: 12 }}>
          {hs ? (
            <a onClick={() => navigate(`/ho-so/${encodeURIComponent(hs.id)}`)}>{hs.id}</a>
          ) : (
            <Text type="secondary">Chưa phát sinh</Text>
          )}
          {i === curIdx && <div><Tag color={GIAI_DOAN_COLOR[stage]} style={{ marginTop: 4 }}>Hiện tại</Tag></div>}
        </div>
      ),
    }
  })

  const cols: ColumnsType<Dossier> = [
    { title: 'Mã hồ sơ', dataIndex: 'id', width: 130, render: (v: string) => <Text code>{v}</Text> },
    { title: 'Loại', dataIndex: 'loai', width: 120, render: (v: string) => <Tag color="blue">{v}</Tag> },
    { title: 'Quy trình', dataIndex: 'quyTrinh', width: 110, render: (v: string) => <Tag>{v}</Tag> },
    {
      title: 'Bước hiện tại',
      key: 'buoc',
      render: (_, r) => (r.trangThai === 'processing' ? <Text>{r.steps[r.buocHienTai]?.ten ?? '—'}</Text> : <Text type="secondary">—</Text>),
    },
    { title: 'Trạng thái', dataIndex: 'trangThai', width: 140, render: (_, r) => <DossierStatusTag status={r.trangThai} /> },
    { title: 'Ngày tạo', dataIndex: 'ngayTao', width: 110 },
  ]

  const cn = nv.chuNhiem

  return (
    <div>
      <PageHeader
        breadcrumb={[
          { label: 'Quản lý NV KHCN', to: '/nhiem-vu' },
          { label: 'Nhiệm vụ KHCN', to: '/nhiem-vu' },
          { label: nv.ma },
        ]}
        onBack={() => navigate('/nhiem-vu')}
        icon={<ExperimentOutlined style={{ fontSize: 24, color: '#ee0033' }} />}
        title={nv.ten}
        tag={<Tag color={GIAI_DOAN_COLOR[nv.giaiDoan]}>{GIAI_DOAN[nv.giaiDoan]}</Tag>}
        code={
          <>
            <Text code>{nv.ma}</Text>{' '}
            <Text type="secondary">· cấp {nv.cap} · {nv.donViChuTri}</Text>
          </>
        }
      />

      <Card title="Vòng đời nhiệm vụ (Chủ trương → Quyết toán)" size="small" style={{ marginBottom: 16 }}>
        <Steps size="small" responsive current={curIdx} items={lifecycleItems} />
      </Card>

      <Row gutter={16}>
        <Col xs={24} lg={13}>
          <Card title="Thông tin nhiệm vụ" style={{ marginBottom: 16 }}>
            <Descriptions column={1} size="small" bordered>
              <Descriptions.Item label="Mã NV KHCN">{nv.ma}</Descriptions.Item>
              <Descriptions.Item label="Tên nhiệm vụ">{nv.ten}</Descriptions.Item>
              <Descriptions.Item label="Cấp">{nv.cap}</Descriptions.Item>
              <Descriptions.Item label="Đơn vị chủ trì">{nv.donViChuTri}</Descriptions.Item>
              <Descriptions.Item label="Thời gian thực hiện">{nv.thoiGianThucHien}</Descriptions.Item>
              <Descriptions.Item label="Tổng dự toán (PL1–PL6)">{nv.duToan}</Descriptions.Item>
              <Descriptions.Item label="Giai đoạn hiện tại"><Tag color={GIAI_DOAN_COLOR[nv.giaiDoan]}>{GIAI_DOAN[nv.giaiDoan]}</Tag></Descriptions.Item>
            </Descriptions>
          </Card>

          <Card title="Chủ nhiệm đề tài (PM)" size="small">
            <Descriptions column={1} size="small">
              <Descriptions.Item label="Họ tên">{cn.hocHamHocVi ? `${cn.hocHamHocVi} ` : ''}{cn.hoTen}</Descriptions.Item>
              {cn.maNhanVien && <Descriptions.Item label="Mã nhân viên">{cn.maNhanVien}</Descriptions.Item>}
              {cn.email && <Descriptions.Item label="Email">{cn.email}</Descriptions.Item>}
              {cn.sdt && <Descriptions.Item label="Điện thoại">{cn.sdt}</Descriptions.Item>}
              {cn.donViCongTac && <Descriptions.Item label="Đơn vị công tác">{cn.donViCongTac}</Descriptions.Item>}
            </Descriptions>
          </Card>
        </Col>

        <Col xs={24} lg={11}>
          <Card
            title={`Hồ sơ thuộc nhiệm vụ (${hoSo.length})`}
            size="small"
            extra={<Text type="secondary" style={{ fontSize: 12 }}>1 nhiệm vụ có nhiều hồ sơ theo giai đoạn</Text>}
          >
            <Paragraph type="secondary" style={{ fontSize: 12, marginTop: 0 }}>
              Bấm một hồ sơ để xem chi tiết + timeline phê duyệt.
            </Paragraph>
            <EntityTable<Dossier>
              rowKey="id"
              columns={cols}
              dataSource={hoSo}
              pagination={false}
              onRowClick={(r) => navigate(`/ho-so/${encodeURIComponent(r.id)}`)}
              emptyText="Nhiệm vụ chưa có hồ sơ nào."
            />
          </Card>
        </Col>
      </Row>
    </div>
  )
}
