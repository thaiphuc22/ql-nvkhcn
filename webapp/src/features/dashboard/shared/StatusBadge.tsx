import { Tag } from 'antd'
import type { AlertSeverity, AlertStatus } from '../models/dashboard.models'

const SEVERITY_COLOR: Record<AlertSeverity, string> = {
  CRITICAL: 'red',
  HIGH: 'orange',
  MEDIUM: 'gold',
  LOW: 'default',
}

const SEVERITY_LABEL: Record<AlertSeverity, string> = {
  CRITICAL: 'Nghiêm trọng',
  HIGH: 'Cao',
  MEDIUM: 'Trung bình',
  LOW: 'Thấp',
}

const STATUS_LABEL: Record<AlertStatus, string> = {
  OPEN: 'Chưa xử lý',
  IN_PROGRESS: 'Đang xử lý',
  RESOLVED: 'Đã xử lý',
}

export function SeverityBadge({ severity }: { severity: AlertSeverity }) {
  return <Tag color={SEVERITY_COLOR[severity]}>{SEVERITY_LABEL[severity]}</Tag>
}

export function AlertStatusBadge({ status }: { status: AlertStatus }) {
  const color = status === 'RESOLVED' ? 'green' : status === 'IN_PROGRESS' ? 'blue' : 'orange'
  return <Tag color={color}>{STATUS_LABEL[status]}</Tag>
}

export function MissionStatusBadge({ status }: { status: string }) {
  const color =
    status === 'Đúng tiến độ' || status === 'Hoàn thành' ? 'green' :
    status === 'Quá hạn' ? 'red' :
    status === 'Có nguy cơ chậm' || status === 'Chờ phê duyệt' ? 'orange' : 'default'
  return <Tag color={color}>{status}</Tag>
}

export function RiskLevelBadge({ level }: { level: string }) {
  const color = level === 'Cao' ? 'red' : level === 'Trung bình' ? 'orange' : 'green'
  return <Tag color={color}>{level}</Tag>
}
