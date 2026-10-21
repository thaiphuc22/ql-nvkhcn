/**
 * Danh mục nghiệp vụ - Chi tiết (Business Category Detail)
 * Route: /phan-he/PH2/danh-muc-nghiep-vu/:id
 */
import { useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import {
  Alert,
  Button,
  Card,
  Descriptions,
  Form,
  Input,
  message,
  Row,
  Col,
  Space,
  Switch,
  Tag,
  Timeline,
  Typography,
} from 'antd'
import {
  EditOutlined,
  SaveOutlined,
} from '@ant-design/icons'
import { PageHeader } from '../../components/ui'
import { seedDanhMucNghiepVu } from '../../data/catalogDanhMucNghiepVu'

const { Text } = Typography

export default function DanhMucNghiepVuDetail() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const record = seedDanhMucNghiepVu.find((t) => t.id === id)
  const [editMode, setEditMode] = useState(false)
  const [form] = Form.useForm()

  if (!record) {
    return (
      <div style={{ padding: 24 }}>
        <Alert type="error" message="Không tìm thấy danh mục nghiệp vụ" />
        <Button style={{ marginTop: 16 }} onClick={() => navigate('/phan-he/PH2/danh-muc-nghiep-vu')}>
          Quay lại danh sách
        </Button>
      </div>
    )
  }

  const handleSave = () => {
    message.success('Đã lưu thay đổi')
    setEditMode(false)
  }

  return (
    <div>
      <PageHeader
        icon={<EditOutlined style={{ fontSize: 26, color: '#ee0033' }} />}
        title={record.ten}
        code={`Ma: ${record.ma}`}
        extra={
          <Space>
            {!editMode ? (
              <Button icon={<EditOutlined />} onClick={() => setEditMode(true)}>
                Chinh sua
              </Button>
            ) : (
              <>
                <Button onClick={() => setEditMode(false)}>Huy</Button>
                <Button type="primary" icon={<SaveOutlined />} onClick={handleSave}>
                  Luu
                </Button>
              </>
            )}
          </Space>
        }
        onBack={() => navigate('/phan-he/PH2/danh-muc-nghiep-vu')}
      />

      <Row gutter={16}>
        <Col xs={24} lg={16}>
          <Card title="Thông tin danh mục nghiệp vụ" style={{ marginBottom: 16 }}>
            {editMode ? (
              <Form form={form} layout="vertical" initialValues={record}>
                <Row gutter={16}>
                  <Col span={12}>
                    <Form.Item name="ma" label="Mã nghiệp vụ">
                      <Input />
                    </Form.Item>
                  </Col>
                  <Col span={12}>
                    <Form.Item name="thuTuHienThi" label="Thứ tự hiển thị">
                      <Input type="number" />
                    </Form.Item>
                  </Col>
                </Row>
                <Form.Item name="ten" label="Tên danh mục">
                  <Input />
                </Form.Item>
                <Form.Item name="moTa" label="Mô tả">
                  <Input.TextArea rows={3} />
                </Form.Item>
                <Form.Item name="trangThai" label="Trạng thái" valuePropName="checked">
                  <Switch checkedChildren="Hoạt động" unCheckedChildren="Không hoạt động" />
                </Form.Item>
              </Form>
            ) : (
              <Descriptions column={1} bordered size="small">
                <Descriptions.Item label="Mã nghiệp vụ">
                  <Text code style={{ background: '#ffdad8', color: '#a80022' }}>{record.ma}</Text>
                </Descriptions.Item>
                <Descriptions.Item label="Tên danh mục">
                  <Text strong>{record.ten}</Text>
                </Descriptions.Item>
                <Descriptions.Item label="Mô tả">
                  {record.moTa || '—'}
                </Descriptions.Item>
                <Descriptions.Item label="Thứ tự hiển thị">
                  {record.thuTuHienThi || '—'}
                </Descriptions.Item>
                <Descriptions.Item label="Trạng thái">
                  <Tag color={record.trangThai === 'active' ? 'green' : 'default'}>
                    {record.trangThai === 'active' ? 'Hoạt động' : 'Không hoạt động'}
                  </Tag>
                </Descriptions.Item>
                <Descriptions.Item label="Người tạo">{record.nguoiTao}</Descriptions.Item>
                <Descriptions.Item label="Ngày tạo">{record.ngayTao}</Descriptions.Item>
                {record.ngayCapNhat && (
                  <Descriptions.Item label="Ngày cập nhật">{record.ngayCapNhat}</Descriptions.Item>
                )}
              </Descriptions>
            )}
          </Card>
        </Col>

        <Col xs={24} lg={8}>
          <Card title="Lịch sử thay đổi">
            {record.lichSu && record.lichSu.length > 0 ? (
              <Timeline
                items={record.lichSu.map((item) => ({
                  color: 'blue',
                  children: (
                    <Space direction="vertical" size={0}>
                      <Text>{item.hanhDong}</Text>
                      <Text type="secondary" style={{ fontSize: 12 }}>
                        {item.nguoiThucHien} - {item.ngay}
                      </Text>
                      {item.chiTiet && (
                        <Text type="secondary" style={{ fontSize: 12 }}>{item.chiTiet}</Text>
                      )}
                    </Space>
                  ),
                }))}
              />
            ) : (
              <Text type="secondary">Chưa có lịch sử thay đổi</Text>
            )}
          </Card>
        </Col>
      </Row>
    </div>
  )
}
