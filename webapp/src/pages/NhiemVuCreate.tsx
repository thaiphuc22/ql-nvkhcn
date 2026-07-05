import { useMemo } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  Alert,
  App,
  Button,
  Card,
  Col,
  DatePicker,
  Form,
  Input,
  InputNumber,
  Row,
  Select,
  Space,
  Typography,
} from 'antd'
import { ExperimentOutlined, SaveOutlined } from '@ant-design/icons'
import dayjs, { type Dayjs } from 'dayjs'
import { chuNhiemLabel, nextNhiemVuMa, type Cap, type ChuNhiem } from '../data/nhiemVu'
import { createChuTruongHoSo } from '../data/dossiers'
import { useNhiemVu } from '../store/NhiemVuContext'
import { useDossiers } from '../store/DossierContext'
import { PageHeader } from '../components/ui'

const { Text } = Typography
const { RangePicker } = DatePicker

/** Học hàm/học vị thường gặp (theo trường "Thông tin PM" mục 3 tài liệu). */
const HOC_VI = ['GS.TS.', 'PGS.TS.', 'TS.', 'ThS.', 'KS.', 'CN.']

interface FormValues {
  ten: string
  cap: Cap
  donViChuTri: string
  thoiGian: [Dayjs, Dayjs]
  duToan: number
  hocHamHocVi?: string
  hoTen: string
  maNhanVien?: string
  email?: string
  sdt?: string
  donViCongTac?: string
}

export default function NhiemVuCreate() {
  const navigate = useNavigate()
  const { message } = App.useApp()
  const [form] = Form.useForm<FormValues>()
  const { list, create } = useNhiemVu()
  const { createHoSo } = useDossiers()

  // Mã NV KHCN dự kiến (tạm cấp khi khởi tạo Chủ trương).
  const preview = useMemo(() => nextNhiemVuMa(list), [list])

  const onFinish = (v: FormValues) => {
    const chuNhiem: ChuNhiem = {
      hoTen: v.hoTen.trim(),
      hocHamHocVi: v.hocHamHocVi,
      maNhanVien: v.maNhanVien?.trim() || undefined,
      email: v.email?.trim() || undefined,
      sdt: v.sdt?.trim() || undefined,
      donViCongTac: v.donViCongTac?.trim() || v.donViChuTri.trim(),
    }
    const [start, end] = v.thoiGian
    const nv = create({
      ten: v.ten.trim(),
      cap: v.cap,
      chuNhiem,
      donViChuTri: v.donViChuTri.trim(),
      thoiGianThucHien: `${start.format('MM/YYYY')} – ${end.format('MM/YYYY')}`,
      duToan: `${v.duToan.toLocaleString('vi-VN')} đ`,
    })

    // Hồ sơ Chủ trương SINH CÙNG NV (đúng trình tự RD01: NV ra đời tại hồ sơ này).
    const seq = /RD\.\d{4}\.(\d+)/.exec(nv.ma)?.[1] ?? '000'
    const now = dayjs()
    createHoSo(
      createChuTruongHoSo(nv, {
        id: `HS-2026-${seq}`,
        nguoiKhoiTao: chuNhiemLabel(chuNhiem),
        ngayTao: now.format('YYYY-MM-DD'),
        thoiDiemKhoiTao: now.format('DD/MM/YYYY HH:mm'),
        hanXuLy: now.add(7, 'day').format('DD/MM/YYYY'),
      }),
    )

    message.success(`Đã tạo ${nv.ma} và khởi tạo hồ sơ Chủ trương.`)
    navigate(`/nhiem-vu/${encodeURIComponent(nv.ma)}`)
  }

  return (
    <div>
      <PageHeader
        breadcrumb={[{ label: 'Quản lý NV KHCN', to: '/nhiem-vu' }, { label: 'Tạo nhiệm vụ mới' }]}
        onBack={() => navigate('/nhiem-vu')}
        icon={<ExperimentOutlined style={{ fontSize: 24, color: '#ee0033' }} />}
        title="Tạo Nhiệm vụ KHCN mới"
      />

      <Alert
        type="info"
        showIcon
        style={{ marginBottom: 16 }}
        message="Nhiệm vụ ra đời cùng hồ sơ Chủ trương"
        description={
          <Text type="secondary">
            Theo quy trình RD01, tạo nhiệm vụ sẽ đồng thời khởi tạo <b>hồ sơ Chủ trương</b> (cấp Cơ sở → RD01.01,
            cấp Tập đoàn → RD01.02). Bước “Khởi tạo hồ sơ” hoàn tất ngay, hồ sơ chuyển sang chờ <b>ký duyệt cấp
            Trung tâm/Khối</b>.
          </Text>
        }
      />

      <Form<FormValues>
        form={form}
        layout="vertical"
        requiredMark="optional"
        onFinish={onFinish}
        initialValues={{ cap: 'Cơ sở' }}
      >
        <Row gutter={16}>
          <Col xs={24} lg={14}>
            <Card title="Thông tin chung nhiệm vụ" style={{ marginBottom: 16 }}>
              <Form.Item
                label="Tên nhiệm vụ KHCN"
                name="ten"
                rules={[{ required: true, message: 'Nhập tên nhiệm vụ.' }]}
              >
                <Input placeholder="VD: Nghiên cứu, chế tạo module thu phát VHF băng rộng" />
              </Form.Item>

              <Row gutter={12}>
                <Col xs={24} sm={10}>
                  <Form.Item label="Cấp" name="cap" rules={[{ required: true }]}>
                    <Select
                      options={[
                        { value: 'Cơ sở', label: 'Cơ sở (RD01.01)' },
                        { value: 'Tập đoàn', label: 'Tập đoàn (RD01.02)' },
                      ]}
                    />
                  </Form.Item>
                </Col>
                <Col xs={24} sm={14}>
                  <Form.Item label="Mã NV KHCN (tạm cấp)" tooltip="Mã dự kiến khi khởi tạo Chủ trương; quy tắc cấp mã chính thức đang chờ khách xác nhận.">
                    <Input value={preview.ma} disabled />
                  </Form.Item>
                </Col>
              </Row>

              <Form.Item
                label="Đơn vị chủ trì"
                name="donViChuTri"
                rules={[{ required: true, message: 'Nhập đơn vị chủ trì.' }]}
              >
                <Input placeholder="VD: TT Nghiên cứu Vô tuyến" />
              </Form.Item>

              <Row gutter={12}>
                <Col xs={24} sm={12}>
                  <Form.Item
                    label="Thời gian thực hiện"
                    name="thoiGian"
                    rules={[{ required: true, message: 'Chọn thời gian thực hiện.' }]}
                  >
                    <RangePicker picker="month" style={{ width: '100%' }} format="MM/YYYY" placeholder={['Bắt đầu', 'Kết thúc']} />
                  </Form.Item>
                </Col>
                <Col xs={24} sm={12}>
                  <Form.Item
                    label="Tổng dự toán (PL1–PL6)"
                    name="duToan"
                    rules={[{ required: true, message: 'Nhập dự toán.' }]}
                  >
                    <InputNumber<number>
                      style={{ width: '100%' }}
                      min={0}
                      step={1000000}
                      addonAfter="đ"
                      placeholder="4.850.000.000"
                      formatter={(val) => `${val}`.replace(/\B(?=(\d{3})+(?!\d))/g, '.')}
                      parser={(val) => Number((val ?? '').replace(/\./g, '')) as unknown as number}
                    />
                  </Form.Item>
                </Col>
              </Row>
            </Card>
          </Col>

          <Col xs={24} lg={10}>
            <Card title="Chủ nhiệm đề tài (PM)" style={{ marginBottom: 16 }}>
              <Row gutter={12}>
                <Col xs={10} sm={8}>
                  <Form.Item label="Học vị" name="hocHamHocVi">
                    <Select allowClear placeholder="TS." options={HOC_VI.map((h) => ({ value: h, label: h }))} />
                  </Form.Item>
                </Col>
                <Col xs={14} sm={16}>
                  <Form.Item label="Họ tên" name="hoTen" rules={[{ required: true, message: 'Nhập họ tên chủ nhiệm.' }]}>
                    <Input placeholder="VD: Trần Văn Nam" />
                  </Form.Item>
                </Col>
              </Row>
              <Form.Item label="Mã nhân viên" name="maNhanVien">
                <Input placeholder="VD: VHT0182" />
              </Form.Item>
              <Form.Item label="Email" name="email" rules={[{ type: 'email', message: 'Email không hợp lệ.' }]}>
                <Input placeholder="namtv@viettel.com.vn" />
              </Form.Item>
              <Form.Item label="Điện thoại" name="sdt">
                <Input placeholder="09xx xxx xxx" />
              </Form.Item>
              <Form.Item label="Đơn vị công tác" name="donViCongTac" tooltip="Bỏ trống sẽ lấy theo đơn vị chủ trì.">
                <Input placeholder="Theo đơn vị chủ trì nếu để trống" />
              </Form.Item>
            </Card>
          </Col>
        </Row>

        <Space>
          <Button onClick={() => navigate('/nhiem-vu')}>Hủy</Button>
          <Button type="primary" htmlType="submit" icon={<SaveOutlined />}>
            Tạo nhiệm vụ + hồ sơ Chủ trương
          </Button>
        </Space>
      </Form>
    </div>
  )
}
