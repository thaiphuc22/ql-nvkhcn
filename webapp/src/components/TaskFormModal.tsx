import { useEffect, useRef, useState } from 'react'
import { Alert, App, Modal, Select, Space, Typography } from 'antd'
import FormRenderer, { type FormRendererHandle } from './FormRenderer'
import { buildYKien } from '../forms'
import { branchByOutcome, resolveRouting } from '../data/stepRouting'
import { useDossiers } from '../store/DossierContext'
import { useProcesses } from '../store/ProcessContext'
import { useForms } from '../store/FormContext'
import { useAuth, usePermissions } from '../store/AuthContext'
import type { AvailableAction } from '../data/actionAvailability'

const { Text } = Typography

interface Props {
  dossierId: string | null
  open: boolean
  /** (D10) Action outcome đã chọn — APPROVE_STEP/RETURN_STEP/REJECT_STEP. Nút quyết định
   *  outcome, form chỉ còn là dữ liệu hỗ trợ (không còn trường `ketLuan`). */
  action: AvailableAction | null
  onClose: () => void
}

/**
 * Modal "Xử lý công việc" — mở eForm gắn với MỘT action outcome cụ thể (D10:
 * `getAvailableActions` đã resolve `formKey` theo action) và định tuyến hồ sơ
 * theo outcome của action đó (Action → Routing, nguồn chung `stepRouting.ts`).
 *
 * Outcome do NÚT quyết định (APPROVE/RETURN/REJECT), không còn suy ra từ một
 * trường `ketLuan` trong form — tránh encode kết luận hai lần (D10 rationale).
 */
export default function TaskFormModal({ dossierId, open, action, onClose }: Props) {
  const { message } = App.useApp()
  const { getById, approveStep, rejectStep, returnStep } = useDossiers()
  const { getByMa } = useProcesses()
  const { getForm } = useForms()
  const { user } = useAuth()
  const { canProcessStep } = usePermissions()
  const currentUser = user?.hoTen ?? 'Người dùng'
  const formRef = useRef<FormRendererHandle>(null)

  const d = dossierId ? getById(dossierId) : undefined
  const step = d?.steps[d.buocHienTai]
  const proc = d ? getByMa(d.quyTrinh) : undefined
  const formKey = action?.formKey ?? 'phieu-nhan-xet'
  const form = getForm(formKey) ?? getForm('phieu-nhan-xet')!
  // Check quyền theo candidateGroups của bước (mock — DossierContext không tự check).
  const allowed = canProcessStep(step)

  // Routing khai báo cho bước hiện tại (nguồn chung với sơ đồ nhánh — stepRouting.ts).
  const routing = resolveRouting(proc, d?.steps ?? [], step?.ten)
  const outcome = action?.outcome
  const branch = outcome ? branchByOutcome(routing, outcome) : undefined

  // Đích rework mặc định lấy từ bảng routing; fallback = bước liền trước. Chỉ dùng khi outcome=RETURN.
  const earlierSteps = d ? d.steps.slice(0, d.buocHienTai) : []
  const [returnTarget, setReturnTarget] = useState<number>(0)
  useEffect(() => {
    if (!d) return
    setReturnTarget(branch?.toStepIndex ?? Math.max(0, d.buocHienTai - 1))
  }, [d?.id, d?.buocHienTai, open, branch?.toStepIndex])

  function handleOk() {
    if (!allowed || !d || !step || !outcome) return
    const res = formRef.current?.submit()
    if (!res) return
    if (res.errors && Object.keys(res.errors).length > 0) {
      message.error('Vui lòng điền đủ các trường bắt buộc.')
      return
    }
    const yKien = buildYKien(res.data)
    if (outcome === 'APPROVE') {
      approveStep(d.id, currentUser, yKien)
      message.success(`Đã xử lý & thông qua bước "${step.ten}".`)
    } else if (outcome === 'RETURN') {
      returnStep(d.id, returnTarget, yKien || 'Đề nghị chỉnh sửa hồ sơ.', currentUser)
      message.warning(`Đã trả hồ sơ về bước "${d.steps[returnTarget]?.ten}" để chỉnh sửa.`)
    } else {
      rejectStep(d.id, yKien || 'Không thông qua — lưu hồ sơ.', currentUser)
      message.error(`Đã từ chối hồ sơ tại bước "${step.ten}" — kết thúc luồng.`)
    }
    onClose()
  }

  return (
    <Modal
      open={open && !!d && !!step && !!action}
      title={action ? `${action.label} — ${form.ten}` : 'Xử lý công việc'}
      okText="Xác nhận"
      cancelText="Đóng"
      width={640}
      destroyOnClose
      okButtonProps={{ disabled: !allowed }}
      onOk={handleOk}
      onCancel={onClose}
    >
      {d && step && !allowed && (
        <Alert
          type="warning"
          showIcon
          message="Bạn không thuộc nhóm xử lý bước này."
          description={`Bước "${step.ten}" thuộc vai trò: ${step.vaiTro}.`}
        />
      )}
      {d && step && allowed && (
        <>
          <Alert
            type="info"
            showIcon
            style={{ marginBottom: 14 }}
            message={`Hồ sơ ${d.id} · bước "${step.ten}"`}
            description={`Vai trò: ${step.vaiTro} · Biểu mẫu: ${form.ten}`}
          />
          <FormRenderer key={`${d.id}-${d.buocHienTai}-${formKey}`} ref={formRef} schema={form.schema} />

          {outcome === 'RETURN' && earlierSteps.length > 0 && (
            <Alert
              type="warning"
              style={{ marginTop: 14 }}
              message="Chọn bước sẽ quay lại"
              description={
                <Space direction="vertical" size={8} style={{ width: '100%' }}>
                  <Text type="secondary" style={{ fontSize: 12 }}>
                    Hồ sơ sẽ được trả về bước đã chọn để chỉnh sửa (các bước xen giữa mở lại).
                  </Text>
                  <Select
                    style={{ width: '100%' }}
                    value={returnTarget}
                    onChange={setReturnTarget}
                    options={earlierSteps.map((s, i) => ({
                      value: i,
                      label: `${i + 1}. ${s.ten} — ${s.vaiTro}`,
                    }))}
                  />
                </Space>
              }
            />
          )}

          {outcome === 'APPROVE' && (
            <Alert
              type="success"
              style={{ marginTop: 14 }}
              showIcon
              message={
                branch?.toStepTen
                  ? `Sẽ chuyển sang bước "${branch.toStepTen}".`
                  : (branch?.terminalLabel ?? 'Sẽ chuyển sang bước kế tiếp.')
              }
            />
          )}

          {outcome === 'REJECT' && (
            <Alert
              type="error"
              style={{ marginTop: 14 }}
              showIcon
              message={branch?.terminalLabel ?? 'Hồ sơ kết thúc luồng xử lý — lưu hồ sơ.'}
            />
          )}
        </>
      )}
    </Modal>
  )
}
