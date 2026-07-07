import {
  forwardRef,
  useEffect,
  useImperativeHandle,
  useRef,
  useState,
} from 'react'
import { Alert } from 'antd'
import DmnModeler from 'dmn-js/lib/Modeler'
import 'dmn-js/dist/assets/diagram-js.css'
import 'dmn-js/dist/assets/dmn-js-shared.css'
import 'dmn-js/dist/assets/dmn-js-drd.css'
import 'dmn-js/dist/assets/dmn-js-decision-table.css'
import 'dmn-js/dist/assets/dmn-js-decision-table-controls.css'
import 'dmn-js/dist/assets/dmn-js-literal-expression.css'
import 'dmn-js/dist/assets/dmn-font/css/dmn.css'

export interface DmnEditorHandle {
  /** XML hiện tại của editor (đã format) — nguồn để đánh giá/deploy. */
  getXml: () => Promise<string>
}

interface Props {
  xml: string
  height?: string
  /** Gọi khi nội dung thay đổi (để bên ngoài biết cần eval lại). */
  onChange?: () => void
}

/**
 * Trình soạn DMN nhúng dmn-js (DRD + Decision Table). Double-click một decision
 * trong DRD để mở bảng quyết định. Prototype EPIC09 — xem
 * docs/research/EPIC09-dmn-design.md. Authoring: DMN XML = source-of-truth.
 */
const DmnEditor = forwardRef<DmnEditorHandle, Props>(
  ({ xml, height = '68vh', onChange }, ref) => {
    const containerRef = useRef<HTMLDivElement>(null)
    const modelerRef = useRef<DmnModeler | null>(null)
    const [importError, setImportError] = useState('')

    useEffect(() => {
      const el = containerRef.current
      if (!el) return
      const modeler = new DmnModeler({ container: el })
      modelerRef.current = modeler
      let cancelled = false

      modeler
        .importXML(xml)
        .then(() => {
          if (cancelled) return
          setImportError('')
        })
        .catch((error: unknown) => {
          if (cancelled) return
          const detail = error instanceof Error ? error.message : String(error)
          setImportError(`Không thể mở sơ đồ DMN. ${detail}`)
        })

      // dmn-js phát 'views.changed'/'view.contentChanged' khi sửa bảng/DRD.
      const onChanged = () => onChange?.()
      modeler.on('views.changed', onChanged)
      modeler.on('view.contentChanged', onChanged)

      return () => {
        cancelled = true
        modeler.destroy()
        modelerRef.current = null
      }
      // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [xml])

    useImperativeHandle(ref, () => ({
      getXml: async () =>
        (await modelerRef.current!.saveXML({ format: true })).xml ?? '',
    }))

    return (
      <div
        style={{
          position: 'relative',
          height,
          background: '#fff',
          border: '1px solid var(--vht-border)',
          borderRadius: 'var(--vht-radius-sm)',
          overflow: 'hidden',
        }}
      >
        <div ref={containerRef} style={{ height: '100%' }} />
        {importError && (
          <Alert
            type="error"
            showIcon
            closable
            message="Lỗi nạp sơ đồ DMN"
            description={importError}
            onClose={() => setImportError('')}
            style={{ position: 'absolute', top: 12, left: 12, right: 12, zIndex: 5 }}
          />
        )}
      </div>
    )
  },
)

DmnEditor.displayName = 'DmnEditor'
export default DmnEditor
