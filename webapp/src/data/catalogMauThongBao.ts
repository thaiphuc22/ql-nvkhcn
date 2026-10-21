/**
 * Module Thông báo — Phân hệ Quản trị Quy trình (PH4).
 * Mock store: mẫu, kênh (Email/SMS/Web/App), trigger sự kiện, nhật ký gửi.
 */

export type MauThongBaoLoai = 'email' | 'sms' | 'web' | 'app'
export type MauThongBaoTrangThai = 'active' | 'inactive'
export type KenhCode = 'email' | 'sms' | 'web' | 'app'
export type SendStatus = 'success' | 'failed' | 'pending' | 'retrying'

export interface BienBanSuKien {
  suKien: string
  moTa: string
  kichHoat: boolean
}

export interface MauThongBao {
  id: string
  ma: string
  ten: string
  loai: MauThongBaoLoai
  tieuDe?: string
  noiDung: string
  moTa?: string
  trangThai: MauThongBaoTrangThai
  bienBanSuKien: BienBanSuKien[]
  nguoiTao: string
  ngayTao: string
  ngayCapNhat?: string
  lichSu?: Array<{
    hanhDong: string
    nguoiThucHien: string
    ngay: string
    chiTiet?: string
  }>
}

export interface KenhThongBao {
  code: KenhCode
  ten: string
  moTa: string
  enabled: boolean
  cauHinh: Record<string, string>
}

export interface TriggerThongBao {
  id: string
  suKien: string
  mauId: string
  mauMa: string
  mauTen: string
  kenh: KenhCode
  kichHoat: boolean
  nguoiNhanRule: string
  ngayTao: string
}

export interface SendLog {
  id: string
  thoiGian: string
  nguoiNhan: string
  diaChi: string
  kenh: KenhCode
  mauMa: string
  mauTen: string
  suKien?: string
  maHoSo?: string
  trangThai: SendStatus
  loi?: string
  soLanGui: number
}

export const LOAI_OPTIONS = [
  { value: 'email', label: 'Email' },
  { value: 'sms', label: 'SMS' },
  { value: 'web', label: 'Web (chuông in-app)' },
  { value: 'app', label: 'App (push mobile)' },
]

export const TRANG_THAI_OPTIONS = [
  { value: 'active', label: 'Hoạt động' },
  { value: 'inactive', label: 'Không hoạt động' },
]

export const SU_KIEN_OPTIONS = [
  { value: 'TAO_HO_SO', label: 'Tạo hồ sơ mới' },
  { value: 'TRINH_DUYET', label: 'Trình duyệt hồ sơ' },
  { value: 'DUYET_HO_SO', label: 'Duyệt hồ sơ' },
  { value: 'TU_CHOI_HO_SO', label: 'Từ chối hồ sơ' },
  { value: 'TRA_LAI_BUOC', label: 'Trả lại bước' },
  { value: 'TAO_HOI_DONG', label: 'Tạo hội đồng xét duyệt' },
  { value: 'GUI_THONG_BAO_HOP', label: 'Gửi thông báo họp' },
  { value: 'HOAN_THANH_BUOC', label: 'Hoàn thành bước quy trình' },
  { value: 'QUA_HAN_XU_LY', label: 'Hồ sơ quá hạn xử lý' },
  { value: 'CANH_BAO_SLA', label: 'Cảnh báo SLA / milestone' },
  { value: 'INCIDENT_BPMN', label: 'Incident BPMN / job thất bại' },
]

export const NGUOI_NHAN_RULE_OPTIONS = [
  { value: 'assignee', label: 'Người được gán task' },
  { value: 'candidate_group', label: 'Nhóm vai trò (candidateGroup)' },
  { value: 'chu_nhiem', label: 'Chủ nhiệm nhiệm vụ' },
  { value: 'nguoi_tao', label: 'Người tạo hồ sơ' },
  { value: 'custom', label: 'Danh sách tùy chỉnh' },
]

let _templates: MauThongBao[] = [
  {
    id: 'TB001',
    ma: 'EMAIL-001',
    ten: 'Thông báo tạo hồ sơ mới',
    loai: 'email',
    tieuDe: '[QTKHCN] Thông báo tạo hồ sơ mới - {{maHoSo}}',
    noiDung:
      'Kính gửi Quý anh/chị,\n\nHệ thống QTKHCN xin thông báo đã tiếp nhận hồ sơ mới:\n\n- Mã hồ sơ: {{maHoSo}}\n- Tên nhiệm vụ: {{tenNhiemVu}}\n- Ngày tạo: {{ngayTao}}\n- Người tạo: {{nguoiTao}}\n\nVui lòng đăng nhập hệ thống để xem chi tiết.\n\nTrân trọng,\nHệ thống QTKHCN',
    moTa: 'Email gửi khi có hồ sơ mới được tạo trong hệ thống',
    trangThai: 'active',
    bienBanSuKien: [{ suKien: 'TAO_HO_SO', moTa: 'Tạo hồ sơ mới', kichHoat: true }],
    nguoiTao: 'admin',
    ngayTao: '2026-01-15',
    ngayCapNhat: '2026-06-20',
  },
  {
    id: 'TB002',
    ma: 'EMAIL-002',
    ten: 'Thông báo trình duyệt hồ sơ',
    loai: 'email',
    tieuDe: '[QTKHCN] Yêu cầu phê duyệt - {{maHoSo}}',
    noiDung:
      'Kính gửi {{nguoiNhan}},\n\nHồ sơ sau đã được trình duyệt và cần sự phê duyệt của bạn:\n\n- Mã hồ sơ: {{maHoSo}}\n- Tên nhiệm vụ: {{tenNhiemVu}}\n- Người trình: {{nguoiTrinh}}\n- Ngày trình: {{ngayTrinh}}\n\nVui lòng đăng nhập hệ thống để xem xét và phê duyệt.\n\nTrân trọng,\nHệ thống QTKHCN',
    moTa: 'Email thông báo cần phê duyệt hồ sơ',
    trangThai: 'active',
    bienBanSuKien: [{ suKien: 'TRINH_DUYET', moTa: 'Trình duyệt hồ sơ', kichHoat: true }],
    nguoiTao: 'admin',
    ngayTao: '2026-01-15',
    ngayCapNhat: '2026-06-20',
  },
  {
    id: 'TB003',
    ma: 'SMS-001',
    ten: 'SMS nhắc họp hội đồng',
    loai: 'sms',
    noiDung:
      '[QTKHCN] Nhắc họp: HĐXD {{tenHoSo}} vào lúc {{gioHop}} ngày {{ngayHop}} tại {{diaDiem}}. Vui lòng xác nhận tham dự.',
    moTa: 'SMS nhắc thành viên hội đồng về lịch họp',
    trangThai: 'active',
    bienBanSuKien: [{ suKien: 'GUI_THONG_BAO_HOP', moTa: 'Gửi thông báo họp', kichHoat: true }],
    nguoiTao: 'admin',
    ngayTao: '2026-02-01',
    ngayCapNhat: '2026-06-15',
  },
  {
    id: 'TB004',
    ma: 'WEB-001',
    ten: 'Chuông in-app — nhiệm vụ mới',
    loai: 'web',
    tieuDe: 'Bạn có nhiệm vụ phê duyệt mới',
    noiDung: 'Hồ sơ {{maHoSo}} đang chờ xử lý tại bước {{buocHienTai}}.',
    moTa: 'Thông báo chuông trên Web khi có task mới',
    trangThai: 'active',
    bienBanSuKien: [{ suKien: 'TRINH_DUYET', moTa: 'Trình duyệt hồ sơ', kichHoat: true }],
    nguoiTao: 'admin',
    ngayTao: '2026-02-10',
    ngayCapNhat: '2026-07-01',
  },
  {
    id: 'TB005',
    ma: 'EMAIL-003',
    ten: 'Cảnh báo quá hạn xử lý',
    loai: 'email',
    tieuDe: '[QTKHCN] Cảnh báo — Hồ sơ quá hạn xử lý',
    noiDung:
      'Kính gửi {{nguoiNhan}},\n\nHệ thống cảnh báo hồ sơ sau đã quá hạn xử lý:\n\n- Mã hồ sơ: {{maHoSo}}\n- Bước hiện tại: {{buocHienTai}}\n- Hạn xử lý: {{hanXuLy}}\n- Số ngày trễ: {{soNgayTre}}\n\nĐề nghị kiểm tra và xử lý sớm.\n\nTrân trọng,\nHệ thống QTKHCN',
    moTa: 'Email cảnh báo khi hồ sơ quá hạn xử lý',
    trangThai: 'active',
    bienBanSuKien: [{ suKien: 'QUA_HAN_XU_LY', moTa: 'Hồ sơ quá hạn xử lý', kichHoat: true }],
    nguoiTao: 'admin',
    ngayTao: '2026-03-01',
    ngayCapNhat: '2026-06-20',
  },
  {
    id: 'TB006',
    ma: 'APP-001',
    ten: 'Push — duyệt hồ sơ thành công',
    loai: 'app',
    tieuDe: 'Hồ sơ đã được duyệt',
    noiDung: '{{maHoSo}} — {{tenNhiemVu}} đã được phê duyệt.',
    moTa: 'Push notification trên App khi duyệt xong',
    trangThai: 'active',
    bienBanSuKien: [{ suKien: 'DUYET_HO_SO', moTa: 'Duyệt hồ sơ', kichHoat: true }],
    nguoiTao: 'admin',
    ngayTao: '2026-03-15',
    ngayCapNhat: '2026-07-10',
  },
  {
    id: 'TB007',
    ma: 'SMS-002',
    ten: 'SMS nhắc duyệt hồ sơ',
    loai: 'sms',
    noiDung: '[QTKHCN] Hồ sơ {{maHoSo}} đang chờ phê duyệt. Vui lòng đăng nhập QTKHCN để xử lý.',
    moTa: 'SMS nhắc duyệt hồ sơ chờ lâu',
    trangThai: 'inactive',
    bienBanSuKien: [{ suKien: 'TRINH_DUYET', moTa: 'Trình duyệt hồ sơ', kichHoat: false }],
    nguoiTao: 'admin',
    ngayTao: '2026-04-01',
    ngayCapNhat: '2026-06-10',
  },
  {
    id: 'TB008',
    ma: 'WEB-002',
    ten: 'Chuông — incident BPMN',
    loai: 'web',
    tieuDe: 'Incident quy trình cần xử lý',
    noiDung: 'Process {{processKey}} / hồ sơ {{maHoSo}} gặp incident: {{loi}}.',
    moTa: 'Thông báo Web cho admin khi có incident',
    trangThai: 'active',
    bienBanSuKien: [{ suKien: 'INCIDENT_BPMN', moTa: 'Incident BPMN', kichHoat: true }],
    nguoiTao: 'admin',
    ngayTao: '2026-05-01',
    ngayCapNhat: '2026-07-20',
  },
]

let _channels: KenhThongBao[] = [
  {
    code: 'email',
    ten: 'Email',
    moTa: 'Gửi qua SMTP nội bộ Viettel',
    enabled: true,
    cauHinh: {
      smtpHost: 'smtp.viettel.com.vn',
      port: '587',
      tls: 'Bật',
      from: 'qtkhcn-noreply@viettel.com.vn',
      replyTo: 'cqkhcn@viettel.com.vn',
    },
  },
  {
    code: 'sms',
    ten: 'SMS',
    moTa: 'Viettel SMS Gateway / Brandname',
    enabled: true,
    cauHinh: {
      endpoint: 'https://sms.viettel.com.vn/api',
      brandname: 'QTKHCN',
      balance: '1,250 tin nhắn',
      encoding: 'Unicode',
    },
  },
  {
    code: 'web',
    ten: 'Web',
    moTa: 'Chuông thông báo trong ứng dụng web',
    enabled: true,
    cauHinh: {
      retentionDays: '30',
      maxUnread: '99',
      sound: 'Bật',
      groupByDossier: 'Bật',
    },
  },
  {
    code: 'app',
    ten: 'App',
    moTa: 'Push notification trên ứng dụng di động',
    enabled: false,
    cauHinh: {
      provider: 'FCM + APNs',
      topicPrefix: 'qtkhcn',
      ttlSeconds: '86400',
      deepLinkBase: 'qtkhcn://ho-so/',
    },
  },
]

let _triggers: TriggerThongBao[] = [
  {
    id: 'TRG001',
    suKien: 'TAO_HO_SO',
    mauId: 'TB001',
    mauMa: 'EMAIL-001',
    mauTen: 'Thông báo tạo hồ sơ mới',
    kenh: 'email',
    kichHoat: true,
    nguoiNhanRule: 'chu_nhiem',
    ngayTao: '2026-06-01',
  },
  {
    id: 'TRG002',
    suKien: 'TRINH_DUYET',
    mauId: 'TB002',
    mauMa: 'EMAIL-002',
    mauTen: 'Thông báo trình duyệt hồ sơ',
    kenh: 'email',
    kichHoat: true,
    nguoiNhanRule: 'assignee',
    ngayTao: '2026-06-01',
  },
  {
    id: 'TRG003',
    suKien: 'TRINH_DUYET',
    mauId: 'TB004',
    mauMa: 'WEB-001',
    mauTen: 'Chuông in-app — nhiệm vụ mới',
    kenh: 'web',
    kichHoat: true,
    nguoiNhanRule: 'assignee',
    ngayTao: '2026-06-05',
  },
  {
    id: 'TRG004',
    suKien: 'GUI_THONG_BAO_HOP',
    mauId: 'TB003',
    mauMa: 'SMS-001',
    mauTen: 'SMS nhắc họp hội đồng',
    kenh: 'sms',
    kichHoat: true,
    nguoiNhanRule: 'custom',
    ngayTao: '2026-06-10',
  },
  {
    id: 'TRG005',
    suKien: 'DUYET_HO_SO',
    mauId: 'TB006',
    mauMa: 'APP-001',
    mauTen: 'Push — duyệt hồ sơ thành công',
    kenh: 'app',
    kichHoat: false,
    nguoiNhanRule: 'chu_nhiem',
    ngayTao: '2026-06-15',
  },
  {
    id: 'TRG006',
    suKien: 'QUA_HAN_XU_LY',
    mauId: 'TB005',
    mauMa: 'EMAIL-003',
    mauTen: 'Cảnh báo quá hạn xử lý',
    kenh: 'email',
    kichHoat: true,
    nguoiNhanRule: 'assignee',
    ngayTao: '2026-06-20',
  },
  {
    id: 'TRG007',
    suKien: 'INCIDENT_BPMN',
    mauId: 'TB008',
    mauMa: 'WEB-002',
    mauTen: 'Chuông — incident BPMN',
    kenh: 'web',
    kichHoat: true,
    nguoiNhanRule: 'candidate_group',
    ngayTao: '2026-07-01',
  },
]

let _sendLogs: SendLog[] = [
  {
    id: 'S001',
    thoiGian: '2026-08-27 09:30',
    nguoiNhan: 'Nguyễn Văn An',
    diaChi: 'nv.an@viettel.com.vn',
    kenh: 'email',
    mauMa: 'EMAIL-001',
    mauTen: 'Thông báo tạo hồ sơ mới',
    suKien: 'TAO_HO_SO',
    maHoSo: 'HS-2026-025',
    trangThai: 'success',
    soLanGui: 1,
  },
  {
    id: 'S002',
    thoiGian: '2026-08-27 09:28',
    nguoiNhan: 'Trần Thị Bình',
    diaChi: 'tt.binh@viettel.com.vn',
    kenh: 'email',
    mauMa: 'EMAIL-002',
    mauTen: 'Thông báo trình duyệt hồ sơ',
    suKien: 'TRINH_DUYET',
    maHoSo: 'HS-2026-024',
    trangThai: 'success',
    soLanGui: 1,
  },
  {
    id: 'S003',
    thoiGian: '2026-08-27 09:25',
    nguoiNhan: 'Lê Văn Cường',
    diaChi: '0912345678',
    kenh: 'sms',
    mauMa: 'SMS-001',
    mauTen: 'SMS nhắc họp hội đồng',
    suKien: 'GUI_THONG_BAO_HOP',
    maHoSo: 'HS-2026-020',
    trangThai: 'pending',
    soLanGui: 1,
  },
  {
    id: 'S004',
    thoiGian: '2026-08-27 09:20',
    nguoiNhan: 'Phạm Thị Dung',
    diaChi: 'pt.dung@viettel.com.vn',
    kenh: 'email',
    mauMa: 'EMAIL-003',
    mauTen: 'Cảnh báo quá hạn xử lý',
    suKien: 'QUA_HAN_XU_LY',
    maHoSo: 'HS-2026-018',
    trangThai: 'failed',
    loi: 'SMTP timeout — không kết nối được máy chủ',
    soLanGui: 2,
  },
  {
    id: 'S005',
    thoiGian: '2026-08-27 09:15',
    nguoiNhan: 'Hoàng Văn Em',
    diaChi: 'user:hv.em',
    kenh: 'web',
    mauMa: 'WEB-001',
    mauTen: 'Chuông in-app — nhiệm vụ mới',
    suKien: 'TRINH_DUYET',
    maHoSo: 'HS-2026-024',
    trangThai: 'success',
    soLanGui: 1,
  },
  {
    id: 'S006',
    thoiGian: '2026-08-27 09:10',
    nguoiNhan: 'Nguyễn Thị Phượng',
    diaChi: 'device:ios-a1b2',
    kenh: 'app',
    mauMa: 'APP-001',
    mauTen: 'Push — duyệt hồ sơ thành công',
    suKien: 'DUYET_HO_SO',
    maHoSo: 'HS-2026-016',
    trangThai: 'failed',
    loi: 'Kênh App đang tắt — không gửi được push',
    soLanGui: 1,
  },
  {
    id: 'S007',
    thoiGian: '2026-08-26 16:40',
    nguoiNhan: 'Trần Văn Giang',
    diaChi: '0987654321',
    kenh: 'sms',
    mauMa: 'SMS-002',
    mauTen: 'SMS nhắc duyệt hồ sơ',
    suKien: 'TRINH_DUYET',
    maHoSo: 'HS-2026-015',
    trangThai: 'failed',
    loi: 'Người nhận từ chối / số không hợp lệ',
    soLanGui: 3,
  },
  {
    id: 'S008',
    thoiGian: '2026-08-26 15:05',
    nguoiNhan: 'Admin hệ thống',
    diaChi: 'user:admin',
    kenh: 'web',
    mauMa: 'WEB-002',
    mauTen: 'Chuông — incident BPMN',
    suKien: 'INCIDENT_BPMN',
    maHoSo: 'HS-2026-012',
    trangThai: 'success',
    soLanGui: 1,
  },
]

export const seedMauThongBao = _templates

const listeners = new Set<() => void>()

function notify() {
  listeners.forEach((fn) => fn())
}

export function subscribeThongBao(listener: () => void): () => void {
  listeners.add(listener)
  return () => listeners.delete(listener)
}

export function listMauThongBao(): MauThongBao[] {
  return [..._templates]
}

export function getMauThongBao(id: string): MauThongBao | undefined {
  return _templates.find((t) => t.id === id)
}

export function upsertMauThongBao(item: MauThongBao): void {
  const idx = _templates.findIndex((t) => t.id === item.id)
  if (idx >= 0) _templates[idx] = item
  else _templates = [..._templates, item]
  notify()
}

export function deleteMauThongBao(id: string): void {
  _templates = _templates.filter((t) => t.id !== id)
  _triggers = _triggers.filter((t) => t.mauId !== id)
  notify()
}

export function listKenhThongBao(): KenhThongBao[] {
  return _channels.map((c) => ({ ...c, cauHinh: { ...c.cauHinh } }))
}

export function updateKenhThongBao(code: KenhCode, patch: Partial<KenhThongBao>): void {
  _channels = _channels.map((c) =>
    c.code === code ? { ...c, ...patch, cauHinh: patch.cauHinh ? { ...patch.cauHinh } : c.cauHinh } : c,
  )
  notify()
}

export function listTriggerThongBao(): TriggerThongBao[] {
  return [..._triggers]
}

export function addTriggerThongBao(item: Omit<TriggerThongBao, 'id' | 'ngayTao'>): TriggerThongBao {
  const row: TriggerThongBao = {
    ...item,
    id: 'TRG' + Date.now().toString(36).toUpperCase(),
    ngayTao: new Date().toISOString().slice(0, 10),
  }
  _triggers = [..._triggers, row]
  notify()
  return row
}

export function updateTriggerThongBao(id: string, patch: Partial<TriggerThongBao>): void {
  _triggers = _triggers.map((t) => (t.id === id ? { ...t, ...patch } : t))
  notify()
}

export function deleteTriggerThongBao(id: string): void {
  _triggers = _triggers.filter((t) => t.id !== id)
  notify()
}

export function listSendLogs(): SendLog[] {
  return [..._sendLogs]
}

export function resendLog(id: string): SendLog | undefined {
  const idx = _sendLogs.findIndex((l) => l.id === id)
  if (idx < 0) return undefined
  const cur = _sendLogs[idx]
  const channel = _channels.find((c) => c.code === cur.kenh)
  const next: SendLog = {
    ...cur,
    thoiGian: new Date().toISOString().replace('T', ' ').slice(0, 16),
    soLanGui: cur.soLanGui + 1,
    trangThai: !channel?.enabled ? 'failed' : Math.random() > 0.25 ? 'success' : 'failed',
    loi: undefined,
  }
  if (next.trangThai === 'failed') {
    next.loi = !channel?.enabled
      ? `Kênh ${channel?.ten ?? cur.kenh} đang tắt`
      : 'Gửi lại thất bại — thử lại sau'
  }
  _sendLogs = [..._sendLogs.slice(0, idx), next, ..._sendLogs.slice(idx + 1)]
  notify()
  return next
}

export function cancelPendingLog(id: string): void {
  _sendLogs = _sendLogs.map((l) =>
    l.id === id && l.trangThai === 'pending'
      ? { ...l, trangThai: 'failed' as const, loi: 'Đã hủy bởi quản trị viên' }
      : l,
  )
  notify()
}
