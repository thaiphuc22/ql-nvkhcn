import { forwardRef, useEffect, useImperativeHandle, useRef, useState, type ReactNode } from 'react'
import { Button, Space, Tag, Tooltip, Typography } from 'antd'
import {
  AppstoreOutlined,
  CloseOutlined,
  EyeInvisibleOutlined,
  EyeOutlined,
  ProfileOutlined,
  RedoOutlined,
  UndoOutlined,
} from '@ant-design/icons'
import { FormEditor } from '@bpmn-io/form-js'
import '@bpmn-io/form-js/dist/assets/form-js-editor.css'
import '@bpmn-io/form-js/dist/assets/properties-panel.css'
import '../branding/bpmnio-skin.css'
import { TranslateViModule } from '../branding/translate-vi'
import { observeViLabels } from '../branding/relabel-vi'
import { khcnFormSimplePanelModule } from '../formjs/khcnFormSimplePanelModule'
import FormRenderer from './FormRenderer'
import FieldPalette from './formdesign/FieldPalette'
import FieldProperties, { type FField } from './formdesign/FieldProperties'

const { Text } = Typography

const PALETTE_W = 240
const PANEL_W = 340
const PREVIEW_W = 380

export interface FormDesignerHandle {
  /** Lấy schema hiện tại từ editor (dùng khi Lưu). */
  getSchema: () => unknown
  /** Reset trạng thái "Chưa lưu" sau khi Lưu thành công. */
  markSaved: () => void
  /** Còn thay đổi chưa lưu? (FormLibrary hỏi trước khi đóng drawer.) */
  isDirty: () => boolean
}

interface Props {
  schema: unknown
}

/** Header chung cho các dock (Thành phần / Xem trước / Thuộc tính trường). */
function DockHeader({ title, onClose, extra }: { title: string; onClose: () => void; extra?: ReactNode }) {
  return (
    <div
      style={{
        height: 42,
        flex: '0 0 auto',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: '0 8px 0 14px',
        borderBottom: '1px solid var(--vht-border)',
        background: 'var(--vht-surface-2)',
      }}
    >
      <Text strong style={{ whiteSpace: 'nowrap' }}>{title}</Text>
      <Space size={4}>
        {extra}
        <Button type="text" size="small" icon={<CloseOutlined />} onClick={onClose} />
      </Space>
    </div>
  )
}

/**
 * Trình thiết kế biểu mẫu (Camunda Form Designer) — nhúng `FormEditor` của
 * @bpmn-io/form-js theo bố cục CUSTOM ngang BpmnEditor:
 * - Dock trái "Thành phần" = palette NATIVE portal vào (config `palette.parent`),
 *   đóng/mở bằng width (không transform — né lỗi vị trí mirror của dragula).
 * - Canvas kéo–thả ở giữa, full-height (khung cha ghim chiều cao).
 * - Pane "Xem trước trực tiếp" (toggle) render schema hiện tại bằng FormRenderer,
 *   cập nhật debounce ~300ms qua sự kiện 'changed'.
 * - Dock phải "Thuộc tính trường" = properties panel portal (`propertiesPanel.parent`),
 *   2 chế độ Đơn giản/Nâng cao qua `khcnFormSimplePanelModule` (đọc ref, không rebuild).
 * - Toolbar nổi: Undo/Redo + Tag "Chưa lưu"; cảnh báo beforeunload khi dirty.
 * Kết quả `saveSchema()` là JSON form-js chuẩn, gán được vào formKey của User Task.
 */
const FormDesigner = forwardRef<FormDesignerHandle, Props>(({ schema }, ref) => {
  const wrapperRef = useRef<HTMLDivElement>(null)
  const canvasRef = useRef<HTMLDivElement>(null)
  const paletteRef = useRef<HTMLDivElement>(null)
  const propsRef = useRef<HTMLDivElement>(null)
  const editorRef = useRef<FormEditor | null>(null)
  // dirty + preview — module/handle đọc qua ref để không rebuild editor.
  const dirtyRef = useRef(false)
  const previewOpenRef = useRef(false)
  const previewTimerRef = useRef<number>(0)

  const [paletteOpen, setPaletteOpen] = useState(true)
  const [panelOpen, setPanelOpen] = useState(true)
  const [previewOpen, setPreviewOpen] = useState(false)
  const [previewSchema, setPreviewSchema] = useState<unknown>(null)
  // Field đang chọn + bộ đếm phiên (bump mỗi thay đổi schema) → panel AntD remount đọc lại giá trị.
  const [selectedField, setSelectedField] = useState<FField | null>(null)
  const [selVersion, setSelVersion] = useState(0)
  const [isDirty, setIsDirty] = useState(false)
  const [canUndo, setCanUndo] = useState(false)
  const [canRedo, setCanRedo] = useState(false)

  useEffect(() => {
    const canvasEl = canvasRef.current
    const paletteEl = paletteRef.current
    const propsEl = propsRef.current
    if (!canvasEl || !paletteEl || !propsEl) return
    const editor = new FormEditor({
      container: canvasEl,
      // Việt hoá qua translate (didi) + lọc/Việt hoá nhóm panel (Đơn giản/Nâng cao).
      additionalModules: [TranslateViModule, khcnFormSimplePanelModule(() => false)],
      // Portal palette + properties panel ra 2 dock React (form-js 1.23:
      // ModularSection đọc config.<section>.parent → createPortal; dragula nhận
      // container theo class nên kéo–thả vẫn hoạt động khi palette nằm ngoài editor).
      palette: { parent: paletteEl },
      propertiesPanel: { parent: propsEl },
    } as never)
    editorRef.current = editor

    let ready = false
    const eventBus = editor.get('eventBus') as {
      on: (event: string, cb: (e?: unknown) => void) => void
      off: (event: string, cb: (e?: unknown) => void) => void
    }
    const commandStack = editor.get('commandStack') as {
      canUndo: () => boolean
      canRedo: () => boolean
    }
    const onStackChanged = () => {
      if (!ready) return
      dirtyRef.current = true
      setIsDirty(true)
      setCanUndo(commandStack.canUndo())
      setCanRedo(commandStack.canRedo())
      // Ép panel AntD đọc lại giá trị field sau mỗi lệnh (sửa/undo/redo).
      setSelVersion((v) => v + 1)
    }
    // Panel AntD: theo dõi field đang chọn (null khi bấm vùng trống).
    const onSelectionChanged = (e?: unknown) => {
      const sel = (e as { selection?: FField } | undefined)?.selection ?? null
      setSelectedField(sel && sel.type ? sel : null)
    }
    // Live preview: mỗi thay đổi schema → cập nhật pane xem trước (debounce 300ms).
    const onChanged = () => {
      if (!ready || !previewOpenRef.current) return
      window.clearTimeout(previewTimerRef.current)
      previewTimerRef.current = window.setTimeout(() => {
        setPreviewSchema(editorRef.current?.saveSchema() ?? null)
      }, 300)
    }
    eventBus.on('commandStack.changed', onStackChanged)
    eventBus.on('changed', onChanged)
    eventBus.on('selection.changed', onSelectionChanged)

    dirtyRef.current = false
    setIsDirty(false)
    setCanUndo(false)
    setCanRedo(false)
    setSelectedField(null)
    void editor.importSchema(schema as never).then(() => {
      ready = true
      const sel = (editor.get('selection') as { get: () => unknown }).get() as FField | null
      setSelectedField(sel && sel.type ? sel : null)
    })

    // Việt hoá nhãn render thẳng (palette/panel) — quan sát CẢ wrapper vì
    // 2 dock nằm ngoài container editor.
    const stopRelabel = wrapperRef.current ? observeViLabels(wrapperRef.current) : undefined

    return () => {
      stopRelabel?.()
      window.clearTimeout(previewTimerRef.current)
      eventBus.off('commandStack.changed', onStackChanged)
      eventBus.off('changed', onChanged)
      eventBus.off('selection.changed', onSelectionChanged)
      editor.destroy()
      editorRef.current = null
    }
    // Chỉ dựng lại editor khi đổi biểu mẫu (schema tham chiếu khác).
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [schema])

  // Cảnh báo khi đóng tab/refresh còn thay đổi chưa lưu.
  useEffect(() => {
    if (!isDirty) return
    const onBeforeUnload = (e: BeforeUnloadEvent) => {
      e.preventDefault()
      e.returnValue = ''
    }
    window.addEventListener('beforeunload', onBeforeUnload)
    return () => window.removeEventListener('beforeunload', onBeforeUnload)
  }, [isDirty])

  useImperativeHandle(ref, () => ({
    getSchema: () => editorRef.current?.saveSchema(),
    markSaved: () => {
      dirtyRef.current = false
      setIsDirty(false)
    },
    isDirty: () => dirtyRef.current,
  }))

  const undo = () => (editorRef.current?.get('commandStack') as { undo: () => void } | undefined)?.undo()
  const redo = () => (editorRef.current?.get('commandStack') as { redo: () => void } | undefined)?.redo()

  const togglePreview = () => {
    const next = !previewOpen
    previewOpenRef.current = next
    setPreviewOpen(next)
    if (next) setPreviewSchema(editorRef.current?.saveSchema() ?? null)
  }

  /** Thêm field bằng CLICK từ palette AntD — dựng attrs như `createNewField` của
   *  form-js (layout.row mới), thêm vào cuối container đang chọn (group/dynamiclist)
   *  hoặc root. Kéo–thả đi đường khác (dragula của form-js). */
  const handleAddField = (type: string) => {
    const editor = editorRef.current as unknown as {
      get: (name: string) => unknown
      _getState: () => { schema: { id: string; type: string; components?: unknown[] } }
    } | null
    if (!editor) return
    const modeling = editor.get('modeling') as {
      addFormField: (attrs: unknown, target: unknown, index: number) => unknown
    }
    const selection = editor.get('selection') as { get: () => unknown }
    const layouter = editor.get('formLayouter') as { nextRowId: () => string }
    const root = editor._getState().schema
    const sel = selection.get() as { id: string; type: string; components?: unknown[] } | null
    const isContainer =
      !!sel && sel !== root && Array.isArray(sel.components) && (sel.type === 'group' || sel.type === 'dynamiclist')
    const target = isContainer ? sel! : root
    const index = Array.isArray(target.components) ? target.components.length : 0
    modeling.addFormField(
      { type, _parent: target.id, layout: { row: layouter.nextRowId(), columns: null } },
      target,
      index,
    )
  }

  /** Sửa 1 thuộc tính field (panel AntD). prop lồng như `validate` được panel gộp cả
   *  object con rồi truyền vào đây. Bọc try/catch: đổi key trùng có thể ném trong behavior. */
  const handleEditField = (field: FField, prop: string, value: unknown) => {
    const modeling = editorRef.current?.get('modeling') as
      | { editFormField: (f: unknown, p: string, v: unknown) => void }
      | undefined
    if (!modeling) return
    try {
      modeling.editFormField(field, prop, value)
    } catch (err) {
      // Ví dụ: key trùng/không hợp lệ — giữ nguyên giá trị cũ, không làm sập editor.
      console.warn('[FormDesigner] editFormField bị từ chối:', prop, err)
    }
  }

  /** Xóa field: tìm parent + index rồi removeFormField (đi qua commandStack → undo được). */
  const handleRemoveField = (field: FField) => {
    const editor = editorRef.current
    if (!editor) return
    const registry = editor.get('formFieldRegistry') as {
      get: (id: string) => { components?: { id: string }[] } | undefined
    }
    const modeling = editor.get('modeling') as {
      removeFormField: (f: unknown, parent: unknown, index: number) => void
    }
    const parent = field._parent ? registry.get(field._parent) : undefined
    if (!parent || !Array.isArray(parent.components)) return
    const index = parent.components.findIndex((c) => c.id === field.id)
    if (index < 0) return
    modeling.removeFormField(field, parent, index)
  }

  return (
    <div
      ref={wrapperRef}
      className="vht-designer"
      style={{
        position: 'relative',
        display: 'flex',
        height: '100%',
        minHeight: 0,
        background: '#fff',
        border: '1px solid var(--vht-border)',
        borderRadius: 'var(--vht-radius)',
        overflow: 'hidden',
      }}
    >
      {/* Dock trái: Thành phần (palette native portal) — collapse bằng width */}
      <div
        className="vht-fd-palette-dock"
        style={{
          width: paletteOpen ? PALETTE_W : 0,
          flex: '0 0 auto',
          borderRight: paletteOpen ? '1px solid var(--vht-border)' : 'none',
          overflow: 'hidden',
          transition: 'width 0.18s ease',
        }}
      >
        <div style={{ width: PALETTE_W, height: '100%', display: 'flex', flexDirection: 'column' }}>
          <DockHeader title="Thành phần" onClose={() => setPaletteOpen(false)} />
          {/* Palette AntD tự viết (D13). Kéo–thả vẫn do dragula form-js xử lý qua class. */}
          <div style={{ flex: 1, minHeight: 0 }}>
            <FieldPalette onAdd={handleAddField} />
          </div>
        </div>
      </div>

      {/* Palette NATIVE form-js: giữ module sống nhưng ẩn (portal đích cho
          `palette.parent`). Ta chỉ dùng dịch vụ/dragula của nó, không hiện UI. */}
      <div ref={paletteRef} style={{ display: 'none' }} aria-hidden />

      {/* Canvas kéo–thả */}
      <div ref={canvasRef} className="vht-fd-canvas" style={{ flex: 1, minWidth: 0, height: '100%' }} />

      {/* Pane xem trước trực tiếp (toggle) */}
      {previewOpen && (
        <div
          style={{
            width: PREVIEW_W,
            flex: '0 0 auto',
            display: 'flex',
            flexDirection: 'column',
            borderLeft: '1px solid var(--vht-border)',
            background: 'var(--vht-surface)',
          }}
        >
          <DockHeader title="Xem trước trực tiếp" onClose={togglePreview} />
          <div className="vht-form" style={{ flex: 1, minHeight: 0, overflow: 'auto', padding: 12 }}>
            {previewSchema != null && <FormRenderer schema={previewSchema} />}
          </div>
        </div>
      )}

      {/* Dock phải: Thuộc tính trường (properties panel portal) */}
      <div
        style={{
          width: panelOpen ? PANEL_W : 0,
          flex: '0 0 auto',
          borderLeft: panelOpen ? '1px solid var(--vht-border)' : 'none',
          overflow: 'hidden',
          transition: 'width 0.18s ease',
        }}
      >
        <div style={{ width: PANEL_W, height: '100%', display: 'flex', flexDirection: 'column' }}>
          <DockHeader title="Thuộc tính trường" onClose={() => setPanelOpen(false)} />
          {/* Panel AntD tự viết (D13). Remount theo id#version để nạp lại giá trị. */}
          <div style={{ flex: 1, minHeight: 0, overflow: 'hidden' }}>
            <FieldProperties
              key={selectedField ? `${selectedField.id}#${selVersion}` : 'none'}
              field={selectedField}
              onEdit={handleEditField}
              onRemove={handleRemoveField}
            />
          </div>
        </div>
      </div>

      {/* Panel NATIVE form-js: giữ module sống nhưng ẩn (portal đích cho
          `propertiesPanel.parent`). Chỉ dùng service, không hiện UI. */}
      <div ref={propsRef} style={{ display: 'none' }} aria-hidden />

      {/* Toolbar nổi trên-trái: mở lại palette + Undo/Redo + Chưa lưu */}
      <div
        style={{
          position: 'absolute',
          top: 10,
          left: (paletteOpen ? PALETTE_W : 0) + 12,
          zIndex: 26,
          display: 'flex',
          gap: 8,
          alignItems: 'center',
          transition: 'left 0.18s ease',
        }}
      >
        {!paletteOpen && (
          <Tooltip title="Mở danh sách thành phần" placement="right">
            <Button icon={<AppstoreOutlined />} onClick={() => setPaletteOpen(true)} />
          </Tooltip>
        )}
        <Space.Compact>
          <Tooltip title="Hoàn tác">
            <Button icon={<UndoOutlined />} disabled={!canUndo} onClick={undo} />
          </Tooltip>
          <Tooltip title="Làm lại">
            <Button icon={<RedoOutlined />} disabled={!canRedo} onClick={redo} />
          </Tooltip>
        </Space.Compact>
        {isDirty && <Tag color="warning" style={{ marginInlineEnd: 0 }}>Chưa lưu</Tag>}
      </div>

      {/* Cụm điều khiển trên-phải: Xem trước + mở lại panel */}
      <div
        style={{
          position: 'absolute',
          top: 10,
          right: (panelOpen ? PANEL_W : 0) + (previewOpen ? PREVIEW_W : 0) + 12,
          zIndex: 26,
          display: 'flex',
          gap: 8,
          alignItems: 'center',
          transition: 'right 0.18s ease',
        }}
      >
        <Button icon={previewOpen ? <EyeInvisibleOutlined /> : <EyeOutlined />} onClick={togglePreview}>
          Xem trước
        </Button>
        {!panelOpen && (
          <Tooltip title="Mở panel thuộc tính" placement="left">
            <Button icon={<ProfileOutlined />} onClick={() => setPanelOpen(true)} />
          </Tooltip>
        )}
      </div>
    </div>
  )
})

FormDesigner.displayName = 'FormDesigner'
export default FormDesigner
