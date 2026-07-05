import { useRef } from 'react'
import { Alert, App, Modal } from 'antd'
import FormRenderer, { type FormRendererHandle } from './FormRenderer'
import { buildYKien, isApprove } from '../forms'
import { useDossiers } from '../store/DossierContext'
import { useProcesses } from '../store/ProcessContext'
import { useForms } from '../store/FormContext'
import { useAuth } from '../store/AuthContext'

interface Props {
  dossierId: string | null
  open: boolean
  onClose: () => void
}

/**
 * Modal "Xử lý công việc" — mở biểu mẫu (Camunda Form) của bước hiện tại.
 * Form được xác định theo binding formKey của user task trong quy trình
 * (cấu hình ở màn Chi tiết quy trình → tab "Biểu mẫu theo bước").
 */
export default function TaskFormModal({ dossierId, open, onClose }: Props) {
  const { message } = App.useApp()
  const { getById, approveStep, rejectStep } = useDossiers()
  const { getByMa } = useProcesses()
  const { getForm } = useForms()
  const { user } = useAuth()
  const currentUser = user?.hoTen ?? 'Người dùng'
  const formRef = useRef<FormRendererHandle>(null)

  const d = dossierId ? getById(dossierId) : undefined
  const step = d?.steps[d.buocHienTai]
  const proc = d ? getByMa(d.quyTrinh) : undefined
  const bound = proc?.taskSteps?.find((ts) => ts.ten === step?.ten)
  const formKey = bound?.formKey ?? step?.formKey ?? 'phieu-nhan-xet'
  const form = getForm(formKey) ?? getForm('phieu-nhan-xet')!

  function handleOk() {
    const res = formRef.current?.submit()
    if (!res || !d || !step) return
    if (res.errors && Object.keys(res.errors).length > 0) {
      message.error('Vui lòng điền đủ các trường bắt buộc.')
      return
    }
    const data = res.data
    const yKien = buildYKien(data)
    if (isApprove(data.ketLuan)) {
      approveStep(d.id, currentUser, yKien)
      message.success(`Đã xử lý & thông qua bước "${step.ten}".`)
    } else {
      rejectStep(d.id, yKien || 'Đề nghị chỉnh sửa hồ sơ.', currentUser)
      message.warning('Đã trả hồ sơ để chỉnh sửa.')
    }
    onClose()
  }

  return (
    <Modal
      open={open && !!d && !!step}
      title={`Xử lý công việc — ${form.ten}`}
      okText="Xác nhận xử lý"
      cancelText="Đóng"
      width={640}
      destroyOnClose
      onOk={handleOk}
      onCancel={onClose}
    >
      {d && step && (
        <>
          <Alert
            type="info"
            showIcon
            style={{ marginBottom: 14 }}
            message={`Hồ sơ ${d.id} · bước "${step.ten}"`}
            description={`Vai trò: ${step.vaiTro} · Biểu mẫu: ${form.ten}`}
          />
          <FormRenderer key={`${d.id}-${d.buocHienTai}-${formKey}`} ref={formRef} schema={form.schema} />
        </>
      )}
    </Modal>
  )
}
