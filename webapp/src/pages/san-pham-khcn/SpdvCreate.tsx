import { useNavigate } from 'react-router-dom'
import { useMemo, useState } from 'react'
import {
  Alert,
  App,
  Button,
  Card,
  Checkbox,
  Col,
  Form,
  Input,
  InputNumber,
  Row,
  Segmented,
  Select,
  Space,
  Typography,
} from 'antd'
import { PlusOutlined, SaveOutlined } from '@ant-design/icons'
import { PageHeader } from '../../components/ui'
import {
  LINH_VUC_SPDV_OPTIONS,
  NHOM_DONG_SPDV_OPTIONS,
  TRANG_THAI_SAN_PHAM_SPDV_LABEL,
  VONG_DOI_SPDV_LABEL,
  type TrangThaiSanPhamSpdv,
  type VongDoiSpdv,
} from '../../data/rd07Spdv'
import { seedCongNgheLoi, seedHoSoSHTT } from '../../data/sanPhamKhcn'
import { useSpdv } from '../../store/SpdvContext'

const { Text } = Typography

type LienQuanMode = 'dropdown' | 'list'

const CONG_NGHE_LOI_OPTIONS = seedCongNgheLoi.map((x) => ({
  value: x.ma,
  label: `${x.ma} — ${x.ten}`,
}))

const SHTT_OPTIONS = seedHoSoSHTT.map((x) => ({
  value: x.ma,
  label: `${x.ma} — ${x.ten}`,
}))

function RelatedPickList({
  options,
  value,
  onChange,
  searchPlaceholder,
}: {
  options: { value: string; label: string }[]
  value?: string[]
  onChange?: (v: string[]) => void
  searchPlaceholder: string
}) {
  const [q, setQ] = useState('')
  const filtered = useMemo(() => {
    const s = q.trim().toLowerCase()
    if (!s) return options
    return options.filter((o) => o.label.toLowerCase().includes(s) || o.value.toLowerCase().includes(s))
  }, [options, q])

  return (
    <div
      style={{
        border: '1px solid #d9d9d9',
        borderRadius: 8,
        padding: 12,
        background: '#fafafa',
      }}
    >
      <Input.Search
        allowClear
        placeholder={searchPlaceholder}
        value={q}
        onChange={(e) => setQ(e.target.value)}
        style={{ marginBottom: 8 }}
      />
      <div style={{ maxHeight: 180, overflowY: 'auto' }}>
        <Checkbox.Group
          style={{ display: 'flex', flexDirection: 'column', gap: 8 }}
          value={value}
          onChange={(checked) => onChange?.(checked as string[])}
          options={filtered}
        />
        {filtered.length === 0 && (
          <Text type="secondary" style={{ fontSize: 12 }}>
            Không có mục phù hợp
          </Text>
        )}
      </div>
      <Text type="secondary" style={{ fontSize: 12, display: 'block', marginTop: 8 }}>
        Đã chọn: {(value ?? []).length}/{options.length}
      </Text>
    </div>
  )
}

interface FormValues {
  linhVuc: string
  nhomDong: string
  ten: string
  ma: string
  congNgheLoi?: string[]
  taiSanShtt?: string[]
  trangThaiSanPham: TrangThaiSanPhamSpdv
  vongDoi?: VongDoiSpdv
  doanhThu?: number
  khachHang?: string
}

export default function SpdvCreate() {
  const navigate = useNavigate()
  const { message } = App.useApp()
  const [form] = Form.useForm<FormValues>()
  const { list, create, ky } = useSpdv()
  const [lienQuanMode, setLienQuanMode] = useState<LienQuanMode>('list')
  const trangThaiSanPham = Form.useWatch('trangThaiSanPham', form)
  const isKinhDoanh = trangThaiSanPham === 'kinh_doanh'

  const onFinish = (v: FormValues) => {
    const trangThai = v.trangThaiSanPham
    const ma = v.ma.trim().toUpperCase()
    if (list.some((x) => x.ma.toLowerCase() === ma.toLowerCase())) {
      message.error(`Mã SPDV ${ma} đã tồn tại.`)
      return
    }

    const item = create({
      ma,
      ten: v.ten.trim(),
      linhVuc: v.linhVuc,
      nhomDong: v.nhomDong,
      congNgheLoi: v.congNgheLoi?.length ? v.congNgheLoi : undefined,
      taiSanShtt: v.taiSanShtt?.length ? v.taiSanShtt : undefined,
      trangThaiSanPham: trangThai,
      khachHang: isKinhDoanh ? v.khachHang?.trim() : undefined,
      doanhThu: isKinhDoanh ? v.doanhThu : undefined,
      phanLoai: trangThai === 'kinh_doanh' ? 'SPDV_KD' : 'SPDV_NCPT',
      vongDoi:
        isKinhDoanh && v.vongDoi
          ? v.vongDoi
          : trangThai === 'thu_nghiem'
            ? 'nghiem_thu'
            : trangThai === 'kinh_doanh'
              ? 'kinh_doanh'
              : 'nghien_cuu',
      quyHienHanh: ky.quy,
      updatedByTuyen: 'QLDM_SPDV',
    })

    message.success(`Đã thêm SPDV ${item.ma}`)
    navigate('/san-pham-nghien-cuu')
  }

  return (
    <div>
      <PageHeader
        breadcrumb={[
          { label: 'Quản trị KHCN', to: '/nhiem-vu' },
          { label: 'Danh mục SPDV (RD07)', to: '/san-pham-nghien-cuu' },
          { label: 'Thêm mới' },
        ]}
        onBack={() => navigate('/san-pham-nghien-cuu')}
        icon={<PlusOutlined style={{ fontSize: 24, color: '#ee0033' }} />}
        title="Thêm mới sản phẩm dịch vụ"
      />

      <Alert
        type="info"
        showIcon
        style={{ marginBottom: 16 }}
        message="Thông tin danh mục SPDV"
        description={
          <Text type="secondary">
            Khai báo lĩnh vực, nhóm/dòng, tên và trạng thái sản phẩm. Với SPDV kinh doanh, bổ sung vòng đời,
            doanh thu và khách hàng.
          </Text>
        }
      />

      <Form<FormValues>
        form={form}
        layout="vertical"
        requiredMark
        onFinish={onFinish}
        initialValues={{ trangThaiSanPham: 'nghien_cuu', vongDoi: 'kinh_doanh' }}
      >
        <Card title="Thông tin SPDV" style={{ marginBottom: 16 }}>
          <Row gutter={16}>
            <Col xs={24} md={12}>
              <Form.Item
                name="linhVuc"
                label="Lĩnh vực của SPDV"
                rules={[{ required: true, message: 'Chọn lĩnh vực SPDV' }]}
              >
                <Select
                  showSearch
                  placeholder="Chọn lĩnh vực"
                  options={LINH_VUC_SPDV_OPTIONS.map((x) => ({ value: x, label: x }))}
                />
              </Form.Item>
            </Col>
            <Col xs={24} md={12}>
              <Form.Item
                name="nhomDong"
                label="Nhóm/Dòng SPDV"
                rules={[{ required: true, message: 'Chọn nhóm/dòng SPDV' }]}
              >
                <Select
                  showSearch
                  placeholder="Chọn nhóm / dòng"
                  options={NHOM_DONG_SPDV_OPTIONS.map((x) => ({ value: x, label: x }))}
                />
              </Form.Item>
            </Col>
            <Col xs={24} md={8}>
              <Form.Item
                name="ma"
                label="Mã SPDV"
                rules={[
                  { required: true, message: 'Nhập mã SPDV' },
                  { whitespace: true, message: 'Nhập mã SPDV' },
                ]}
              >
                <Input placeholder="VD: SPDV.NC.015" />
              </Form.Item>
            </Col>
            <Col xs={24} md={16}>
              <Form.Item
                name="ten"
                label="Tên SPDV"
                rules={[
                  { required: true, message: 'Nhập tên SPDV' },
                  { whitespace: true, message: 'Nhập tên SPDV' },
                ]}
              >
                <Input placeholder="VD: Module AI nhận dạng mục tiêu" />
              </Form.Item>
            </Col>
            <Col span={24}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
                <Text strong>Công nghệ lõi &amp; tài sản SHTT liên quan</Text>
                <Segmented<LienQuanMode>
                  size="small"
                  value={lienQuanMode}
                  onChange={setLienQuanMode}
                  options={[
                    { value: 'list', label: 'Danh sách' },
                    { value: 'dropdown', label: 'Dropdown' },
                  ]}
                />
              </div>
            </Col>
            <Col xs={24} md={12}>
              <Form.Item name="congNgheLoi" label="Công nghệ lõi liên quan">
                {lienQuanMode === 'dropdown' ? (
                  <Select
                    mode="multiple"
                    allowClear
                    showSearch
                    optionFilterProp="label"
                    placeholder="Chọn công nghệ lõi"
                    options={CONG_NGHE_LOI_OPTIONS}
                  />
                ) : (
                  <RelatedPickList
                    options={CONG_NGHE_LOI_OPTIONS}
                    searchPlaceholder="Tìm công nghệ lõi…"
                  />
                )}
              </Form.Item>
            </Col>
            <Col xs={24} md={12}>
              <Form.Item name="taiSanShtt" label="Tài sản sở hữu trí tuệ liên quan">
                {lienQuanMode === 'dropdown' ? (
                  <Select
                    mode="multiple"
                    allowClear
                    showSearch
                    optionFilterProp="label"
                    placeholder="Chọn tài sản SHTT"
                    options={SHTT_OPTIONS}
                  />
                ) : (
                  <RelatedPickList options={SHTT_OPTIONS} searchPlaceholder="Tìm tài sản SHTT…" />
                )}
              </Form.Item>
            </Col>
            <Col xs={24} md={12}>
              <Form.Item
                name="trangThaiSanPham"
                label="Trạng thái sản phẩm"
                rules={[{ required: true, message: 'Chọn trạng thái sản phẩm' }]}
                extra="Nghiên cứu, thử nghiệm, kinh doanh…"
              >
                <Select
                  options={(Object.keys(TRANG_THAI_SAN_PHAM_SPDV_LABEL) as TrangThaiSanPhamSpdv[]).map(
                    (k) => ({ value: k, label: TRANG_THAI_SAN_PHAM_SPDV_LABEL[k] }),
                  )}
                />
              </Form.Item>
            </Col>
          </Row>
        </Card>

        {isKinhDoanh && (
          <Card title="Đối với sản phẩm kinh doanh" style={{ marginBottom: 16 }}>
            <Row gutter={16}>
              <Col xs={24} md={8}>
                <Form.Item
                  name="vongDoi"
                  label="Trạng thái vòng đời sản phẩm"
                  rules={[{ required: true, message: 'Chọn vòng đời sản phẩm' }]}
                >
                  <Select
                    options={(Object.keys(VONG_DOI_SPDV_LABEL) as VongDoiSpdv[]).map((k) => ({
                      value: k,
                      label: VONG_DOI_SPDV_LABEL[k],
                    }))}
                  />
                </Form.Item>
              </Col>
              <Col xs={24} md={8}>
                <Form.Item
                  name="doanhThu"
                  label="Doanh thu (VNĐ)"
                  rules={[{ required: true, message: 'Nhập doanh thu' }]}
                >
                  <InputNumber<number>
                    style={{ width: '100%' }}
                    min={0}
                    step={1_000_000}
                    formatter={(val) => `${val ?? ''}`.replace(/\B(?=(\d{3})+(?!\d))/g, '.')}
                    parser={(val) => Number((val ?? '').replace(/\./g, '')) || 0}
                  />
                </Form.Item>
              </Col>
              <Col xs={24} md={8}>
                <Form.Item
                  name="khachHang"
                  label="Khách hàng"
                  rules={[{ required: true, message: 'Nhập khách hàng' }]}
                >
                  <Input placeholder="VD: Vùng 4 / Khối quốc phòng" />
                </Form.Item>
              </Col>
            </Row>
          </Card>
        )}

        <Space>
          <Button onClick={() => navigate('/san-pham-nghien-cuu')}>Huỷ</Button>
          <Button type="primary" htmlType="submit" icon={<SaveOutlined />}>
            Lưu SPDV
          </Button>
        </Space>
      </Form>
    </div>
  )
}
