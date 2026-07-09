// Palette AntD tự viết cho Form Designer (D13 — Lát A). Thay palette native của
// @bpmn-io/form-js bằng UI AntD, NHƯNG vẫn dùng engine form-js:
//
//  • Kéo–thả: mỗi item mang đúng "class ma thuật" của form-js
//    (wrapper `fjs-palette-fields fjs-drag-container fjs-no-drop`, item `fjs-drag-copy`
//     + `data-field-type`). Dragula của form-js kiểm tra classList động khi mousedown
//    trên toàn document, nên item AntD ở dock vẫn thả xuống canvas → `createNewField`
//    của form-js tự thêm field. Ta KHÔNG viết lại drag.
//  • Click: gọi `onAdd(type)` (FormDesigner → modeling.addFormField) thêm vào cuối
//    container đang chọn (group/dynamiclist) hoặc root.
import { useMemo, useState, type ReactNode } from 'react'
import { Input, Empty } from 'antd'
import {
  SearchOutlined,
  FontSizeOutlined,
  AlignLeftOutlined,
  FieldNumberOutlined,
  CalendarOutlined,
  FunctionOutlined,
  PaperClipOutlined,
  CheckSquareOutlined,
  UnorderedListOutlined,
  CheckCircleOutlined,
  DownSquareOutlined,
  TagsOutlined,
  FileTextOutlined,
  Html5Outlined,
  PictureOutlined,
  TableOutlined,
  MinusOutlined,
  ColumnHeightOutlined,
  GroupOutlined,
  BlockOutlined,
} from '@ant-design/icons'

interface Entry {
  type: string
  label: string
  icon: ReactNode
}
interface PaletteGroup {
  id: string
  title: string
  entries: Entry[]
}

// Danh mục loại field (nhãn tiếng Việt + icon AntD). `type` khớp CHÍNH XÁC type
// của form-js — dùng cho cả `data-field-type` (drag) lẫn addFormField (click).
const GROUPS: PaletteGroup[] = [
  {
    id: 'input',
    title: 'Nhập liệu',
    entries: [
      { type: 'textfield', label: 'Ô chữ', icon: <FontSizeOutlined /> },
      { type: 'textarea', label: 'Ô nhiều dòng', icon: <AlignLeftOutlined /> },
      { type: 'number', label: 'Số', icon: <FieldNumberOutlined /> },
      { type: 'datetime', label: 'Ngày / giờ', icon: <CalendarOutlined /> },
      { type: 'expression', label: 'Biểu thức (tự tính)', icon: <FunctionOutlined /> },
      { type: 'filepicker', label: 'Tải tệp', icon: <PaperClipOutlined /> },
    ],
  },
  {
    id: 'selection',
    title: 'Lựa chọn',
    entries: [
      { type: 'checkbox', label: 'Hộp kiểm', icon: <CheckSquareOutlined /> },
      { type: 'checklist', label: 'Danh sách kiểm', icon: <UnorderedListOutlined /> },
      { type: 'radio', label: 'Chọn một (radio)', icon: <CheckCircleOutlined /> },
      { type: 'select', label: 'Danh sách thả xuống', icon: <DownSquareOutlined /> },
      { type: 'taglist', label: 'Nhãn nhiều chọn', icon: <TagsOutlined /> },
    ],
  },
  {
    id: 'presentation',
    title: 'Trình bày',
    entries: [
      { type: 'text', label: 'Văn bản tĩnh', icon: <FileTextOutlined /> },
      { type: 'html', label: 'HTML', icon: <Html5Outlined /> },
      { type: 'image', label: 'Hình ảnh', icon: <PictureOutlined /> },
      { type: 'table', label: 'Bảng dữ liệu', icon: <TableOutlined /> },
      { type: 'separator', label: 'Đường kẻ', icon: <MinusOutlined /> },
      { type: 'spacer', label: 'Khoảng trống', icon: <ColumnHeightOutlined /> },
    ],
  },
  {
    id: 'container',
    title: 'Bố cục / nhóm',
    entries: [
      { type: 'group', label: 'Nhóm', icon: <GroupOutlined /> },
      { type: 'dynamiclist', label: 'Bảng động', icon: <BlockOutlined /> },
    ],
  },
]

interface Props {
  /** Thêm field bằng CLICK (kéo–thả do form-js tự xử lý qua class). */
  onAdd: (type: string) => void
}

/** Palette thành phần — dock trái của Form Designer. */
export default function FieldPalette({ onAdd }: Props) {
  const [q, setQ] = useState('')

  const groups = useMemo(() => {
    const kw = q.trim().toLowerCase()
    if (!kw) return GROUPS
    return GROUPS.map((g) => ({
      ...g,
      entries: g.entries.filter(
        (e) => e.label.toLowerCase().includes(kw) || e.type.includes(kw),
      ),
    })).filter((g) => g.entries.length > 0)
  }, [q])

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
      <div style={{ padding: 8, flex: '0 0 auto' }}>
        <Input
          allowClear
          size="small"
          prefix={<SearchOutlined />}
          placeholder="Tìm thành phần…"
          value={q}
          onChange={(e) => setQ(e.target.value)}
        />
      </div>

      <div style={{ flex: 1, minHeight: 0, overflow: 'auto', padding: '0 8px 10px' }}>
        {groups.length === 0 && (
          <Empty
            image={Empty.PRESENTED_IMAGE_SIMPLE}
            description="Không tìm thấy thành phần"
            style={{ marginTop: 28 }}
          />
        )}

        {groups.map((g) => (
          <div key={g.id} style={{ marginTop: 10 }}>
            <div className="vht-fp-group-title">{g.title}</div>
            {/* Class ma thuật form-js: nguồn kéo (drag-container) + palette (tạo field mới),
                không cho thả VÀO palette (no-drop). */}
            <div className="fjs-palette-fields fjs-drag-container fjs-no-drop vht-fp-list">
              {g.entries.map((e) => (
                <button
                  key={e.type}
                  type="button"
                  className="fjs-drag-copy vht-fp-item"
                  data-field-type={e.type}
                  title={`Thêm “${e.label}” (kéo lên biểu mẫu hoặc bấm)`}
                  onClick={() => onAdd(e.type)}
                >
                  <span className="vht-fp-item-icon">{e.icon}</span>
                  <span className="vht-fp-item-label">{e.label}</span>
                </button>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
