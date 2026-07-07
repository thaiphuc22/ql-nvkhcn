import { Empty, Space, Tag, Typography } from 'antd'
import {
  ArrowRightOutlined,
  CheckCircleOutlined,
  RollbackOutlined,
  StopOutlined,
  ThunderboltOutlined,
} from '@ant-design/icons'
import { resolveGroups } from '../data/approvalMatrix'
import type { RouteKind, ResolvedBranch } from '../data/stepRouting'

const { Text } = Typography

/** Bước tối thiểu mà sơ đồ cần đọc (khớp DossierStep). */
export interface DiagramStep {
  ten: string
  vaiTro: string
  vaiTroCodes: string[]
  hanXuLy?: string
}

/** Nhánh NGOẠI LỆ (nét đứt) — không thuộc luồng chuẩn, cần duyệt riêng. */
export interface ExceptionBranchView {
  label: string
  targetLabel: string
}

interface Props {
  currentStepTen: string
  currentStepRole: string
  branches: ResolvedBranch[]
  /** Chuỗi bước của hồ sơ — để tra vai trò/hạn/người dự kiến ở bước đích. */
  steps: DiagramStep[]
  /** Hiển thị người dự kiến (Ma trận phê duyệt) ở bước đích. Mặc định bật. */
  showApprovers?: boolean
  /** Nhánh ngoại lệ khả dụng ở bước này (vẽ nét đứt, tách khỏi luồng chuẩn). */
  exceptionBranches?: ExceptionBranchView[]
  /**
   * 'active' (mặc định): node đầu là bước ĐANG xử lý (viền đỏ, tag "Đang xử lý").
   * 'reference': bước chỉ để tham chiếu trong "Toàn bộ sơ đồ" (viền xám, không tag).
   */
  variant?: 'active' | 'reference'
}

// Vai trò khởi tạo/soạn thảo — không resolve "người nhận việc".
const NON_APPROVAL = new Set(['PM', 'PA', 'NNC'])

const KIND_META: Record<
  RouteKind,
  { color: string; tag: string; label: string; icon: React.ReactNode }
> = {
  forward: { color: '#1677ff', tag: 'blue', label: 'Đi tiếp', icon: <ArrowRightOutlined /> },
  complete: { color: '#52c41a', tag: 'green', label: 'Hoàn tất', icon: <CheckCircleOutlined /> },
  rework: { color: '#fa8c16', tag: 'orange', label: 'Trả lại', icon: <RollbackOutlined /> },
  reject: { color: '#cf1322', tag: 'red', label: 'Kết thúc', icon: <StopOutlined /> },
}

function approverNames(codes: string[]): string[] {
  if (!codes.length || codes.every((c) => NON_APPROVAL.has(c))) return []
  return resolveGroups(codes).map((a) => a.user.hoTen)
}

/**
 * Sơ đồ nhánh cho MỘT bước: node "bạn đang ở đây" → các nhánh kết quả (Action →
 * Routing). Đọc từ `ResolvedBranch[]` do `resolveRouting` (stepRouting.ts) trả về —
 * cùng nguồn với nút bấm ở TaskFormModal, không tự suy diễn nhánh riêng.
 */
export default function StepRoutingDiagram({
  currentStepTen,
  currentStepRole,
  branches,
  steps,
  showApprovers = true,
  exceptionBranches = [],
  variant = 'active',
}: Props) {
  if (!branches.length) {
    return <Empty description="Bước này chưa cấu hình định tuyến." image={Empty.PRESENTED_IMAGE_SIMPLE} />
  }

  const isRef = variant === 'reference'

  return (
    <div>
      {/* Node bước nguồn */}
      <div
        style={{
          border: `2px solid ${isRef ? '#d9d9d9' : 'var(--vht-red, #cf1322)'}`,
          borderRadius: 8,
          padding: '10px 14px',
          background: isRef ? '#fafafa' : 'rgba(207,19,34,0.04)',
          marginBottom: 4,
        }}
      >
        <Space size={8} wrap>
          {isRef ? (
            <Tag style={{ marginRight: 0 }}>Bước</Tag>
          ) : (
            <Tag color="processing" style={{ marginRight: 0 }}>Đang xử lý</Tag>
          )}
          <Text strong>{currentStepTen}</Text>
        </Space>
        <div>
          <Text type="secondary" style={{ fontSize: 12 }}>{currentStepRole}</Text>
        </div>
      </div>

      {/* Các nhánh kết quả */}
      <div style={{ paddingLeft: 12, borderLeft: '2px dashed #d9d9d9', marginLeft: 12 }}>
        {branches.map((b) => {
          const meta = KIND_META[b.kind]
          const dest = b.toStepIndex !== undefined ? steps[b.toStepIndex] : undefined
          const names = showApprovers && dest ? approverNames(dest.vaiTroCodes) : []
          return (
            <div
              key={b.outcome}
              style={{ display: 'flex', alignItems: 'flex-start', gap: 8, margin: '12px 0' }}
            >
              <Tag color={meta.tag} icon={meta.icon} style={{ marginTop: 2, whiteSpace: 'normal' }}>
                {b.label}
              </Tag>
              <ArrowRightOutlined style={{ color: meta.color, marginTop: 6 }} />
              <div
                style={{
                  flex: 1,
                  border: `1px solid ${meta.color}`,
                  borderLeft: `4px solid ${meta.color}`,
                  borderRadius: 6,
                  padding: '6px 10px',
                  background: '#fff',
                }}
              >
                {dest ? (
                  <>
                    <Text strong>{dest.ten}</Text>
                    {b.kind === 'rework' && (
                      <Tag color="orange" style={{ marginLeft: 6 }}>rework</Tag>
                    )}
                    <div>
                      <Text type="secondary" style={{ fontSize: 12 }}>{dest.vaiTro}</Text>
                    </div>
                    {names.length > 0 && (
                      <div style={{ fontSize: 12 }}>
                        <Text type="secondary">Dự kiến: </Text>
                        {names.join(', ')}
                      </div>
                    )}
                    {dest.hanXuLy && (
                      <div style={{ fontSize: 12 }}>
                        <Text type="secondary">Hạn xử lý: {dest.hanXuLy}</Text>
                      </div>
                    )}
                  </>
                ) : (
                  <Space size={6}>
                    {meta.icon}
                    <Text strong style={{ color: meta.color }}>
                      {b.terminalLabel ?? meta.label}
                    </Text>
                  </Space>
                )}
              </div>
            </div>
          )
        })}

        {exceptionBranches.map((eb) => (
          <div
            key={eb.label}
            style={{ display: 'flex', alignItems: 'flex-start', gap: 8, margin: '12px 0' }}
          >
            <Tag color="volcano" icon={<ThunderboltOutlined />} style={{ marginTop: 2, whiteSpace: 'normal' }}>
              {eb.label}
            </Tag>
            <ArrowRightOutlined style={{ color: '#d4380d', marginTop: 6 }} />
            <div
              style={{
                flex: 1,
                border: '1px dashed #d4380d',
                borderRadius: 6,
                padding: '6px 10px',
                background: 'rgba(212,56,13,0.03)',
              }}
            >
              <Text style={{ color: '#d4380d' }}>{eb.targetLabel}</Text>
              <div>
                <Text type="secondary" style={{ fontSize: 12 }}>
                  Ngoài luồng chuẩn — cần cấp có thẩm quyền duyệt riêng.
                </Text>
              </div>
            </div>
          </div>
        ))}
      </div>
      <Text type="secondary" style={{ fontSize: 11 }}>
        Nhánh liền = Routing Matrix (cùng nguồn nút “Xử lý”); nhánh nét đứt = Ngoại lệ có kiểm soát.
      </Text>
    </div>
  )
}
