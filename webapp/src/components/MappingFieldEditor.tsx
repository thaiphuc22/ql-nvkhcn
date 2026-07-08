// Trình soạn field mapping + value mapping cho 1 MappingConfig (Đợt 2, Slice E).
// Người dùng lowtech thao tác trên danh sách FieldMapping có cấu trúc — không nhập script tự do
// (theo "Transform có kiểm soát", docs/research/integration-screen-upgrade-notes.md).

import type { ReactNode } from 'react'
import { Button, Input, Select, Space, Switch, Tag, Typography } from 'antd'
import { DeleteOutlined, PlusOutlined } from '@ant-design/icons'
import {
  MAPPING_FIELD_TYPE_LABEL,
  TRANSFORM_LABEL,
  type FieldMapping,
  type MappingFieldType,
  type TransformKind,
  type ValueMapping,
} from '../data/integrationMapping'

const { Text } = Typography

let uidSeq = 0
const uid = () => `f-${Date.now().toString(36)}-${(uidSeq++).toString(36)}`

const TYPE_OPTIONS = (Object.keys(MAPPING_FIELD_TYPE_LABEL) as MappingFieldType[]).map((v) => ({
  value: v,
  label: MAPPING_FIELD_TYPE_LABEL[v],
}))

const TRANSFORM_OPTIONS = (Object.keys(TRANSFORM_LABEL) as TransformKind[]).map((v) => ({
  value: v,
  label: TRANSFORM_LABEL[v],
}))

export function newField(): FieldMapping {
  return {
    id: uid(),
    truongQTKHCN: '',
    kieuDuLieu: 'string',
    truongHeNgoai: '',
    batBuoc: false,
  }
}

export default function MappingFieldEditor({
  fields,
  onChange,
}: {
  fields: FieldMapping[]
  onChange: (next: FieldMapping[]) => void
}) {
  const update = (id: string, patch: Partial<FieldMapping>) => {
    onChange(fields.map((f) => (f.id === id ? { ...f, ...patch } : f)))
  }
  const remove = (id: string) => onChange(fields.filter((f) => f.id !== id))
  const add = () => onChange([...fields, newField()])

  return (
    <Space direction="vertical" size={12} style={{ width: '100%' }}>
      {fields.map((f, idx) => {
        const needsValueMapping = f.kieuDuLieu === 'enum' || f.transform === 'enum-map'
        return (
          <div
            key={f.id}
            style={{
              border: '1px solid #e2e2e5',
              borderRadius: 8,
              padding: 12,
              background: '#fafafa',
            }}
          >
            <Space align="start" style={{ width: '100%', justifyContent: 'space-between' }}>
              <Text type="secondary" style={{ fontSize: 12 }}>
                Field {idx + 1}
              </Text>
              <Button
                type="text"
                danger
                size="small"
                icon={<DeleteOutlined />}
                onClick={() => remove(f.id)}
              />
            </Space>

            <Space wrap size={10} style={{ marginTop: 6 }}>
              <LabeledControl label="Trường QTKHCN">
                <Input
                  style={{ width: 160 }}
                  value={f.truongQTKHCN}
                  placeholder="vd: maHoSo"
                  onChange={(e) => update(f.id, { truongQTKHCN: e.target.value })}
                />
              </LabeledControl>
              <LabeledControl label="Kiểu dữ liệu">
                <Select
                  style={{ width: 140 }}
                  value={f.kieuDuLieu}
                  options={TYPE_OPTIONS}
                  onChange={(v: MappingFieldType) => update(f.id, { kieuDuLieu: v })}
                />
              </LabeledControl>
              <LabeledControl label="Trường hệ ngoài">
                <Input
                  style={{ width: 160 }}
                  value={f.truongHeNgoai}
                  placeholder="vd: dossierCode"
                  status={!f.truongHeNgoai.trim() ? 'warning' : undefined}
                  onChange={(e) => update(f.id, { truongHeNgoai: e.target.value })}
                />
              </LabeledControl>
              <LabeledControl label="Bắt buộc">
                <Switch checked={f.batBuoc} onChange={(v) => update(f.id, { batBuoc: v })} />
              </LabeledControl>
              <LabeledControl label="Khoá định danh">
                <Switch checked={!!f.khoaDinhDanh} onChange={(v) => update(f.id, { khoaDinhDanh: v })} />
              </LabeledControl>
              <LabeledControl label="Transform">
                <Select
                  allowClear
                  style={{ width: 220 }}
                  placeholder="Không transform"
                  value={f.transform}
                  options={TRANSFORM_OPTIONS}
                  onChange={(v: TransformKind | undefined) => update(f.id, { transform: v })}
                />
              </LabeledControl>
              {f.transform === 'default-value' && (
                <LabeledControl label="Giá trị mặc định">
                  <Input
                    style={{ width: 160 }}
                    value={f.giaTriMacDinh ?? ''}
                    onChange={(e) => update(f.id, { giaTriMacDinh: e.target.value })}
                  />
                </LabeledControl>
              )}
            </Space>

            {needsValueMapping && (
              <div style={{ marginTop: 10, paddingTop: 10, borderTop: '1px dashed #d9d9d9' }}>
                <Text style={{ fontSize: 12 }} type="secondary">
                  Value mapping — giá trị QTKHCN → giá trị hệ ngoài
                </Text>
                <ValueMappingEditor
                  rows={f.valueMappings ?? []}
                  onChange={(rows) => update(f.id, { valueMappings: rows })}
                />
              </div>
            )}
          </div>
        )
      })}

      <Button icon={<PlusOutlined />} onClick={add} style={{ width: '100%' }}>
        Thêm field
      </Button>
    </Space>
  )
}

function LabeledControl({ label, children }: { label: string; children: ReactNode }) {
  return (
    <div>
      <div style={{ fontSize: 11, color: '#6b7280', marginBottom: 2 }}>{label}</div>
      {children}
    </div>
  )
}

function ValueMappingEditor({
  rows,
  onChange,
}: {
  rows: ValueMapping[]
  onChange: (rows: ValueMapping[]) => void
}) {
  const update = (idx: number, patch: Partial<ValueMapping>) => {
    onChange(rows.map((r, i) => (i === idx ? { ...r, ...patch } : r)))
  }
  const remove = (idx: number) => onChange(rows.filter((_, i) => i !== idx))
  const add = () => onChange([...rows, { qtkhcn: '', heNgoai: '' }])

  return (
    <Space direction="vertical" size={6} style={{ width: '100%', marginTop: 6 }}>
      {rows.map((r, idx) => (
        <Space key={idx} size={8}>
          <Input
            style={{ width: 140 }}
            placeholder="Giá trị QTKHCN"
            value={r.qtkhcn}
            onChange={(e) => update(idx, { qtkhcn: e.target.value })}
          />
          <Tag>→</Tag>
          <Input
            style={{ width: 140 }}
            placeholder="Giá trị hệ ngoài"
            value={r.heNgoai}
            onChange={(e) => update(idx, { heNgoai: e.target.value })}
          />
          <Button type="text" danger size="small" icon={<DeleteOutlined />} onClick={() => remove(idx)} />
        </Space>
      ))}
      <Button size="small" icon={<PlusOutlined />} onClick={add}>
        Thêm value mapping
      </Button>
    </Space>
  )
}
