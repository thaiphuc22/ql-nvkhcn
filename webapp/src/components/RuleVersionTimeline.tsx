import { useState } from 'react'
import {
  Button,
  Descriptions,
  Drawer,
  Empty,
  Space,
  Table,
  Tag,
  Typography,
} from 'antd'
import { ClockCircleOutlined, EyeOutlined } from '@ant-design/icons'
import { useRules } from '../store/RuleContext'
import {
  RULE_CATEGORY_LABEL,
  RULE_KIND_META,
  RULE_STATUS_META,
  type RuleVersion,
} from '../data/rules'

const { Text, Paragraph } = Typography

interface Props {
  ruleId: string
}

export default function RuleVersionTimeline({ ruleId }: Props) {
  const { get, getVersions } = useRules()
  const rule = get(ruleId)
  const allVersions = getVersions(ruleId)

  // Gộp current version (từ rule hiện tại) vào đầu danh sách
  const merged: (RuleVersion & { isCurrent?: boolean })[] = []
  if (rule) {
    merged.push({
      id: `current-${rule.id}`,
      ruleId: rule.id,
      version: rule.version,
      ten: rule.ten,
      moTa: rule.moTa,
      category: rule.category,
      kind: rule.kind,
      rdApDung: rule.rdApDung,
      trangThai: rule.trangThai,
      dmnXml: rule.dmnXml,
      serviceInterface: rule.serviceInterface,
      capNhat: rule.capNhat,
      nguoiCapNhat: rule.nguoiCapNhat,
      changeNote: '(phiên bản hiện tại)',
      isCurrent: true,
    })
  }
  // Thêm các version history snapshot (đã lọc bỏ trùng version với current)
  for (const v of allVersions) {
    if (v.version !== rule?.version) {
      merged.push({ ...v, isCurrent: false })
    }
  }
  // Sort giảm dần theo version
  merged.sort((a, b) => b.version - a.version)

  const [drawerOpen, setDrawerOpen] = useState(false)
  const [selectedVersion, setSelectedVersion] = useState<(typeof merged)[0] | null>(null)

  const openDetail = (v: (typeof merged)[0]) => {
    setSelectedVersion(v)
    setDrawerOpen(true)
  }

  if (merged.length === 0) {
    return <Empty description="Chưa có lịch sử phiên bản." />
  }

  return (
    <>
      <Table<typeof merged[0]>
        dataSource={merged}
        rowKey="id"
        size="small"
        pagination={false}
        columns={[
          {
            title: 'Phiên bản',
            dataIndex: 'version',
            width: 100,
            render: (v: number, r) => (
              <Space>
                <Tag color={r.isCurrent ? 'green' : 'default'}>v{v}</Tag>
                {r.isCurrent && (
                  <Text type="secondary" style={{ fontSize: 12 }}>
                    (hiện tại)
                  </Text>
                )}
              </Space>
            ),
          },
          {
            title: 'Ngày cập nhật',
            dataIndex: 'capNhat',
            width: 120,
            render: (d: string) => (
              <Text type="secondary">
                <ClockCircleOutlined style={{ marginRight: 4 }} />
                {d}
              </Text>
            ),
          },
          {
            title: 'Người cập nhật',
            dataIndex: 'nguoiCapNhat',
            width: 160,
          },
          {
            title: 'Ghi chú thay đổi',
            dataIndex: 'changeNote',
            ellipsis: true,
          },
          {
            title: '',
            width: 100,
            render: (_, r) => (
              <Button
                type="link"
                size="small"
                icon={<EyeOutlined />}
                onClick={() => openDetail(r)}
              >
                Xem chi tiết
              </Button>
            ),
          },
        ]}
      />

      <Drawer
        title={`Phiên bản v${selectedVersion?.version ?? ''} ${selectedVersion?.isCurrent ? '(hiện tại)' : ''}`}
        open={drawerOpen}
        onClose={() => setDrawerOpen(false)}
        width={640}
        extra={
          selectedVersion?.isCurrent && (
            <Tag color="green">Đang hiệu lực</Tag>
          )
        }
      >
        {selectedVersion && (
          <Space direction="vertical" size={16} style={{ width: '100%' }}>
            <Descriptions
              size="small"
              bordered
              column={2}
              items={[
                { key: 'ten', label: 'Tên luật', children: selectedVersion.ten },
                { key: 'loai', label: 'Loại', children: RULE_CATEGORY_LABEL[selectedVersion.category] },
                { key: 'kind', label: 'Kiểu', children: <Tag color={RULE_KIND_META[selectedVersion.kind].color}>{RULE_KIND_META[selectedVersion.kind].label}</Tag> },
                { key: 'status', label: 'Trạng thái', children: <Tag color={RULE_STATUS_META[selectedVersion.trangThai].color}>{RULE_STATUS_META[selectedVersion.trangThai].label}</Tag> },
                { key: 'rd', label: 'RD áp dụng', children: selectedVersion.rdApDung.join(', ') },
                { key: 'capnhat', label: 'Cập nhật', children: `${selectedVersion.capNhat} · ${selectedVersion.nguoiCapNhat}` },
                { key: 'note', label: 'Ghi chú', children: selectedVersion.changeNote },
              ]}
            />

            <Descriptions size="small" bordered column={1}>
              <Descriptions.Item label="Mô tả">
                {selectedVersion.moTa}
              </Descriptions.Item>
            </Descriptions>

            {selectedVersion.kind === 'DMN' && selectedVersion.dmnXml && (
              <div>
                <Text strong style={{ display: 'block', marginBottom: 8 }}>
                  DMN XML (nguồn chuẩn)
                </Text>
                <Paragraph
                  code
                  copyable
                  style={{
                    maxHeight: 400,
                    overflow: 'auto',
                    fontSize: 12,
                    whiteSpace: 'pre',
                    background: '#fafafa',
                    padding: 12,
                    borderRadius: 6,
                  }}
                >
                  {selectedVersion.dmnXml}
                </Paragraph>
              </div>
            )}

            {selectedVersion.kind === 'SERVICE' && selectedVersion.serviceInterface && (
              <Descriptions size="small" bordered column={1}>
                <Descriptions.Item label="Đầu vào">
                  {selectedVersion.serviceInterface.inputs || '—'}
                </Descriptions.Item>
                <Descriptions.Item label="Đầu ra">
                  {selectedVersion.serviceInterface.output || '—'}
                </Descriptions.Item>
              </Descriptions>
            )}
          </Space>
        )}
      </Drawer>
    </>
  )
}
