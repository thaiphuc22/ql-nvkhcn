import { forwardRef, useEffect, useImperativeHandle, useRef } from 'react'
import { Form } from '@bpmn-io/form-js'
import '@bpmn-io/form-js/dist/assets/form-js.css'
import '../branding/bpmnio-skin.css'

export interface FormSubmitResult {
  data: Record<string, unknown>
  errors: Record<string, unknown>
}

export interface FormRendererHandle {
  submit: () => FormSubmitResult
}

interface Props {
  schema: unknown
  data?: Record<string, unknown>
}

/**
 * Render một Camunda Form (form-js schema) bằng @bpmn-io/form-js trong UI custom.
 * Cùng renderer mà Camunda Tasklist dùng — nhưng nhúng thẳng vào app của ta.
 */
const FormRenderer = forwardRef<FormRendererHandle, Props>(({ schema, data }, ref) => {
  const containerRef = useRef<HTMLDivElement>(null)
  const formRef = useRef<Form | null>(null)

  useEffect(() => {
    const el = containerRef.current
    if (!el) return
    const form = new Form({ container: el })
    formRef.current = form
    // importSchema trả về Promise — không cần await cho render.
    void form.importSchema(schema as never, data ?? {})
    return () => {
      form.destroy()
      formRef.current = null
    }
    // Chỉ import lại khi đổi schema (giữ nguyên dữ liệu người dùng nhập).
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [schema])

  useImperativeHandle(ref, () => ({
    submit: () => formRef.current!.submit() as FormSubmitResult,
  }))

  return <div ref={containerRef} className="vht-form" />
})

FormRenderer.displayName = 'FormRenderer'
export default FormRenderer
