import { forwardRef, useEffect, useImperativeHandle, useRef } from 'react'
import { FormEditor } from '@bpmn-io/form-js'
import '@bpmn-io/form-js/dist/assets/form-js-editor.css'
import '@bpmn-io/form-js/dist/assets/properties-panel.css'
import '../branding/bpmnio-skin.css'
import { TranslateViModule } from '../branding/translate-vi'
import { observeViLabels } from '../branding/relabel-vi'

export interface FormDesignerHandle {
  /** Lấy schema hiện tại từ editor (dùng khi Lưu). */
  getSchema: () => unknown
}

interface Props {
  schema: unknown
}

/**
 * Trình thiết kế biểu mẫu (Camunda Form Designer) — nhúng `FormEditor` của
 * @bpmn-io/form-js. Cùng công cụ kéo–thả mà Camunda Modeler dùng để tạo eForm,
 * nhưng chạy thẳng trong UI custom. Kết quả `saveSchema()` là JSON form-js chuẩn,
 * gán được vào formKey của User Task trong BPMN.
 */
const FormDesigner = forwardRef<FormDesignerHandle, Props>(({ schema }, ref) => {
  const containerRef = useRef<HTMLDivElement>(null)
  const editorRef = useRef<FormEditor | null>(null)

  useEffect(() => {
    const el = containerRef.current
    if (!el) return
    const editor = new FormEditor({
      container: el,
      // Việt hoá nhãn palette/thuộc tính qua module translate (chuẩn didi).
      additionalModules: [TranslateViModule],
    } as never)
    editorRef.current = editor
    void editor.importSchema(schema as never)
    // Việt hoá nhãn palette/properties (form-js render nhãn thẳng, không qua translate).
    const stopRelabel = observeViLabels(el)
    return () => {
      stopRelabel()
      editor.destroy()
      editorRef.current = null
    }
    // Chỉ dựng lại editor khi đổi biểu mẫu (schema tham chiếu khác).
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [schema])

  useImperativeHandle(ref, () => ({
    getSchema: () => editorRef.current?.saveSchema(),
  }))

  return (
    <div
      ref={containerRef}
      className="vht-designer"
      style={{ height: '68vh', border: '1px solid var(--vht-border)', borderRadius: 'var(--vht-radius)' }}
    />
  )
})

FormDesigner.displayName = 'FormDesigner'
export default FormDesigner
