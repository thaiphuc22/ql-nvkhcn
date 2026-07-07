import { useEffect, useRef, useState } from 'react'
import { Alert, App, Modal, Radio, Select, Space, Typography } from 'antd'
import FormRenderer, { type FormRendererHandle } from './FormRenderer'
import { buildYKien, isApprove } from '../forms'
import { branchByOutcome, resolveRouting } from '../data/stepRouting'
import { useDossiers } from '../store/DossierContext'
import { useProcesses } from '../store/ProcessContext'
import { useForms } from '../store/FormContext'
import { useAuth, usePermissions } from '../store/AuthContext'

const { Text } = Typography

interface Props {
  dossierId: string | null
  open: boolean
  onClose: () => void
}

/** Định tuyến khi kết luận KHÔNG phải "Đồng ý": trả lại chỉnh sửa hay từ chối hẳn. */
type NegRoute = 'return' | 'reject'

/**
 * Modal "Xử lý công việc" — mở biểu mẫu (Camunda Form) của bước hiện tại và
 * ĐỊNH TUYẾN hồ sơ theo kết luận (Action → Routing).
 *
 * Tách 2 tầng đúng như mô hình mapping:
 *  - Form (data): phiếu nhận xét/phê duyệt của bước, xác định qua binding formKey
 *    của user task (cấu hình ở Chi tiết quy trình → "Biểu mẫu theo bước").
 *  - Routing (định tuyến): kết luận "Đồng ý" → sang bước kế; kết luận phủ định →
 *    theo lựa chọn "Trả lại để chỉnh sửa" (về bước trước — rework loop) hoặc
 *    "Từ chối — lưu hồ sơ" (kết thúc). Khớp các gateway RD01.01.
 */
export default function TaskFormModal({ dossierId, open, onClose }: Props) {
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
  const bound = proc?.taskSteps?.find((ts) => ts.ten === step?.ten)
  const formKey = bound?.formKey ?? step?.formKey ?? 'phieu-nhan-xet'
  const form = getForm(formKey) ?? getForm('phieu-nhan-xet')!
  // Check quyền theo candidateGroups của bước (mock — DossierContext không tự check).
  const allowed = canProcessStep(step)

  // Routing khai báo cho bước hiện tại (nguồn chung với sơ đồ nhánh — stepRouting.ts).
  const routing = resolveRouting(proc, d?.steps ?? [], step?.ten)
  const approveBranch = branchByOutcome(routing, 'APPROVE') ?? branchByOutcome(routing, 'SUBMIT')
  const returnBranch = branchByOutcome(routing, 'RETURN')
  const rejectBranch = branchByOutcome(routing, 'REJECT')
  // Đích rework mặc định lấy từ bảng routing; fallback = bước liền trước.
  const reworkDefaultIdx = returnBranch?.toStepIndex

  // Định tuyến khi phủ định + bước đích để trả về.
  const [negRoute, setNegRoute] = useState<NegRoute>('return')
  const [returnTarget, setReturnTarget] = useState<number>(0)
  // Các bước phía trước bước hiện tại — đích khả dĩ của "Trả lại".
  const earlierSteps = d ? d.steps.slice(0, d.buocHienTai) : []
  useEffect(() => {
    if (!d) return
    setNegRoute('return')
    setReturnTarget(reworkDefaultIdx ?? Math.max(0, d.buocHienTai - 1))
  }, [d?.id, d?.buocHienTai, open, reworkDefaultIdx])

  function handleOk() {
    if (!allowed) return
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
    } else if (negRoute === 'return') {
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
      open={open && !!d && !!step}
      title={`Xử lý công việc — ${form.ten}`}
      okText="Xác nhận xử lý"
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

          {earlierSteps.length > 0 && (
            <Alert
              type="warning"
              style={{ marginTop: 14 }}
              message="Định tuyến khi KHÔNG thông qua"
              description={
                <Space direction="vertical" size={8} style={{ width: '100%' }}>
                  <Text type="secondary" style={{ fontSize: 12 }}>
                    Kết luận “Đồng ý/Thông qua/Đạt”{' '}
                    {approveBranch?.toStepTen
                      ? `sẽ chuyển sang bước “${approveBranch.toStepTen}”.`
                      : approveBranch?.kind === 'complete'
                        ? 'sẽ hoàn tất hồ sơ.'
                        : 'sẽ chuyển sang bước kế tiếp.'}{' '}
                    Nếu kết luận phủ định, hồ sơ được định tuyến theo lựa chọn dưới đây:
                  </Text>
                  <Radio.Group value={negRoute} onChange={(e) => setNegRoute(e.target.value)}>
                    <Space direction="vertical" size={4}>
                      <Radio value="return">
                        {returnBranch?.label ?? 'Trả lại để chỉnh sửa'} — quay về bước trước (rework)
                      </Radio>
                      <Radio value="reject">
                        {rejectBranch?.label ?? 'Từ chối'} — {rejectBranch?.terminalLabel ?? 'lưu hồ sơ, kết thúc luồng'}
                      </Radio>
                    </Space>
                  </Radio.Group>
                  {negRoute === 'return' && (
                    <Select
                      style={{ width: '100%' }}
                      value={returnTarget}
                      onChange={setReturnTarget}
                      options={earlierSteps.map((s, i) => ({
                        value: i,
                        label: `${i + 1}. ${s.ten} — ${s.vaiTro}`,
                      }))}
                    />
                  )}
                </Space>
              }
            />
          )}
        </>
      )}
    </Modal>
  )
}
