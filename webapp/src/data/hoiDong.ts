// Hội đồng (HĐXD) — thực thể quản lý Hội đồng xét duyệt đề tài KHCN.
// Tự động thành lập khi hồ sơ đến bước Họp (Task_7 / Task_10) trong RD02.02.

/** Vai trò trong Hội đồng xét duyệt. */
export type VaiTroHoiDong =
  | 'CHU_TICH'     // Chủ tịch
  | 'PHAN_BIEN_1'  // Phản biện 1 – chuyên KHCN
  | 'PHAN_BIEN_2'  // Phản biện 2 – chuyên TCKT/tiến độ
  | 'UY_VIEN'      // Ủy viên (3–5 người)
  | 'THU_KY_KH'    // Thư ký Khoa học

export const VAI_TRO_HD: Record<VaiTroHoiDong, { ten: string; mau: string; thuTu: number }> = {
  CHU_TICH:    { ten: 'Chủ tịch',      mau: 'red',    thuTu: 1 },
  PHAN_BIEN_1: { ten: 'Phản biện 1',   mau: 'blue',   thuTu: 2 },
  PHAN_BIEN_2: { ten: 'Phản biện 2',   mau: 'cyan',   thuTu: 3 },
  UY_VIEN:     { ten: 'Ủy viên',       mau: 'green',  thuTu: 4 },
  THU_KY_KH:   { ten: 'Thư ký KH',     mau: 'orange', thuTu: 5 },
}

export interface ThanhVienHoiDong {
  id: string
  /** Ánh xạ đến AppUser.id — undefined nếu là thành viên tự do */
  userId?: string
  hoTen: string
  vaiTro: VaiTroHoiDong
  donVi: string
  hocHamHocVi?: string
  linhVucChuyenMon: string[]
  email?: string
  dienThoai?: string
  kinhNghiemNam?: number
  /** Trạng thái tham gia họp */
  trangThai: 'duKien' | 'chapNhan' | 'tuChoi' | 'vangMat'
  diemTrungBinh?: number
  yKienDongGop?: string
}

export interface HoiDong {
  id: string
  /** FK về HoSo.id */
  maHoSo: string
  /** FK về NhiemVu.ma */
  maNhiemVu: string
  tenDeTai: string
  linhVucNghienCuu: string[]
  phiEn: 1 | 2
  ngayThanhLap: string
  ngayHopDuKien: string
  diaDiem?: string
  trangThai: 'sapLap' | 'dangHop' | 'daKetThuc' | 'huyBo'
  thanhVien: ThanhVienHoiDong[]
  bienBanHopFile?: string
  ketQuaDanhGia?: 'DAT' | 'CANH_CAO' | 'KHDAT'
  tomTatKetLuan?: string
  ngayKetThuc?: string
}

// ---------------------------------------------------------------------------
// Experts pool — nguồn thành viên có lý lịch khoa học
// ---------------------------------------------------------------------------

export interface ExpertProfile {
  userId: string
  hoTen: string
  email: string
  donVi: string
  hocHamHocVi: string
  linhVucChuyenMon: string[]
  kinhNghiemNam: number
}

/** Pool experts cho demo Hội đồng — đa dạng đơn vị + lĩnh vực */
export const EXPERT_POOL: ExpertProfile[] = [
  // TT Nghiên cứu Vô tuyến (2 người)
  {
    userId: 'EXP-001',
    hoTen: 'PGS.TS. Nguyễn Văn An',
    email: 'annv@viettel.com.vn',
    donVi: 'TT Nghiên cứu Vô tuyến',
    hocHamHocVi: 'PGS.TS.',
    linhVucChuyenMon: ['Vô tuyến', 'Truyền thông', 'Anten'],
    kinhNghiemNam: 18,
  },
  {
    userId: 'EXP-002',
    hoTen: 'TS. Trần Thị Bình',
    email: 'binhtt@viettel.com.vn',
    donVi: 'TT Nghiên cứu Vô tuyến',
    hocHamHocVi: 'TS.',
    linhVucChuyenMon: ['Vô tuyến', 'Xử lý tín hiệu', 'DSP'],
    kinhNghiemNam: 12,
  },
  // TT Nghiên cứu Điều khiển (2 người)
  {
    userId: 'EXP-003',
    hoTen: 'GS.TSKH. Lê Đình Cường',
    email: 'cuongld@viettel.com.vn',
    donVi: 'TT Nghiên cứu Điều khiển',
    hocHamHocVi: 'GS.TSKH.',
    linhVucChuyenMon: ['Điều khiển', 'AI', 'Hệ thống nhúng'],
    kinhNghiemNam: 25,
  },
  {
    userId: 'EXP-004',
    hoTen: 'TS. Phạm Minh Đức',
    email: 'ducpm@viettel.com.vn',
    donVi: 'TT Nghiên cứu Điều khiển',
    hocHamHocVi: 'TS.',
    linhVucChuyenMon: ['AI', 'Machine Learning', 'Điều khiển'],
    kinhNghiemNam: 10,
  },
  // TT Nghiên cứu Vật liệu (2 người)
  {
    userId: 'EXP-005',
    hoTen: 'PGS.TS. Hoàng Thị Eva',
    email: 'evaht@viettel.com.vn',
    donVi: 'TT Nghiên cứu Vật liệu',
    hocHamHocVi: 'PGS.TS.',
    linhVucChuyenMon: ['Vật liệu', 'Vi điện tử', 'Công nghệ nano'],
    kinhNghiemNam: 15,
  },
  {
    userId: 'EXP-006',
    hoTen: 'TS. Vũ Quang Hùng',
    email: 'hungvq@viettel.com.vn',
    donVi: 'TT Nghiên cứu Vật liệu',
    hocHamHocVi: 'TS.',
    linhVucChuyenMon: ['Vật liệu', 'Cơ khí chính xác'],
    kinhNghiemNam: 9,
  },
  // TT Nghiên cứu Tác chiến Điện tử (2 người)
  {
    userId: 'EXP-007',
    hoTen: 'GS.TS. Bùi Xuân Lai',
    email: 'laibx@viettel.com.vn',
    donVi: 'TT Nghiên cứu Tác chiến ĐT',
    hocHamHocVi: 'GS.TS.',
    linhVucChuyenMon: ['Tác chiến Điện tử', 'Radar', 'EW'],
    kinhNghiemNam: 22,
  },
  {
    userId: 'EXP-008',
    hoTen: 'TS. Đặng Thị Hương',
    email: 'huongdt@viettel.com.vn',
    donVi: 'TT Nghiên cứu Tác chiến ĐT',
    hocHamHocVi: 'TS.',
    linhVucChuyenMon: ['Tác chiến Điện tử', 'Mô phỏng'],
    kinhNghiemNam: 11,
  },
  // Ban KHCN (2 người)
  {
    userId: 'EXP-009',
    hoTen: 'PGS.TS. Trịnh Đình Long',
    email: 'longtd@viettel.com.vn',
    donVi: 'Ban KHCN VHT',
    hocHamHocVi: 'PGS.TS.',
    linhVucChuyenMon: ['Quản lý KHCN', 'AI', 'IoT'],
    kinhNghiemNam: 20,
  },
  {
    userId: 'EXP-010',
    hoTen: 'ThS. Ngô Thanh Sơn',
    email: 'sonnt@viettel.com.vn',
    donVi: 'Ban KHCN VHT',
    hocHamHocVi: 'ThS.',
    linhVucChuyenMon: ['Quản lý KHCN', 'Tiêu chuẩn'],
    kinhNghiemNam: 8,
  },
  // TP Tài chính Kế toán (2 người)
  {
    userId: 'EXP-011',
    hoTen: 'ThS. Lê Thị Mai Lan',
    email: 'lanltm@viettel.com.vn',
    donVi: 'TP Tài chính Kế toán',
    hocHamHocVi: 'ThS.',
    linhVucChuyenMon: ['Tài chính', 'Kế toán', 'Quản lý dự án'],
    kinhNghiemNam: 14,
  },
  {
    userId: 'EXP-012',
    hoTen: 'KS. Hoàng Đình Nam',
    email: 'namhd@viettel.com.vn',
    donVi: 'TP Tài chính Kế toán',
    hocHamHocVi: 'KS.',
    linhVucChuyenMon: ['Tài chính', 'Quản lý dự án', 'Đấu thầu'],
    kinhNghiemNam: 7,
  },
  // TP Nhân sự (1 người)
  {
    userId: 'EXP-013',
    hoTen: 'ThS. Phạm Thị Ngọc',
    email: 'ngocpt@viettel.com.vn',
    donVi: 'TP Nhân sự',
    hocHamHocVi: 'ThS.',
    linhVucChuyenMon: ['Nhân sự', 'Đào tạo', 'Quản lý'],
    kinhNghiemNam: 12,
  },
  // Ban KHCN Tập đoàn (2 người)
  {
    userId: 'EXP-014',
    hoTen: 'GS.TS. Cao Minh Thắng',
    email: 'thangcm@viettel.com.vn',
    donVi: 'Ban CNCNC Tập đoàn',
    hocHamHocVi: 'GS.TS.',
    linhVucChuyenMon: ['AI', 'Big Data', 'Cloud Computing'],
    kinhNghiemNam: 24,
  },
  {
    userId: 'EXP-015',
    hoTen: 'PGS.TS. Đỗ Thu Hà',
    email: 'hadt@viettel.com.vn',
    donVi: 'Ban CNCNC Tập đoàn',
    hocHamHocVi: 'PGS.TS.',
    linhVucChuyenMon: ['An ninh mạng', 'Blockchain', 'IoT'],
    kinhNghiemNam: 16,
  },
]

// ---------------------------------------------------------------------------
// Seed data — Hội đồng mock cho demo
// ---------------------------------------------------------------------------

export const seedHoiDong: HoiDong[] = [
  {
    id: 'HD-2026-001',
    maHoSo: 'HS-2026-043',
    maNhiemVu: 'RD.2026.021',
    tenDeTai: 'Nghiên cứu xây dựng nền tảng quản trị quy trình KHCN thông minh cho VHT',
    linhVucNghienCuu: ['AI', 'Quản lý KHCN', 'Process Automation'],
    phiEn: 1,
    ngayThanhLap: '2026-07-20',
    ngayHopDuKien: '2026-07-28',
    diaDiem: 'Phòng họp A3 - Tầng 3, Trụ sở VHT',
    trangThai: 'sapLap',
    thanhVien: [
      {
        id: 'TV-001',
        userId: 'EXP-009',
        hoTen: 'PGS.TS. Trịnh Đình Long',
        vaiTro: 'CHU_TICH',
        donVi: 'Ban KHCN VHT',
        hocHamHocVi: 'PGS.TS.',
        linhVucChuyenMon: ['Quản lý KHCN', 'AI', 'IoT'],
        email: 'longtd@viettel.com.vn',
        kinhNghiemNam: 20,
        trangThai: 'chapNhan',
        diemTrungBinh: 8.5,
      },
      {
        id: 'TV-002',
        userId: 'EXP-014',
        hoTen: 'GS.TS. Cao Minh Thắng',
        vaiTro: 'PHAN_BIEN_1',
        donVi: 'Ban CNCNC Tập đoàn',
        hocHamHocVi: 'GS.TS.',
        linhVucChuyenMon: ['AI', 'Big Data', 'Cloud Computing'],
        email: 'thangcm@viettel.com.vn',
        kinhNghiemNam: 24,
        trangThai: 'chapNhan',
        diemTrungBinh: 9.0,
      },
      {
        id: 'TV-003',
        userId: 'EXP-011',
        hoTen: 'ThS. Lê Thị Mai Lan',
        vaiTro: 'PHAN_BIEN_2',
        donVi: 'TP Tài chính Kế toán',
        hocHamHocVi: 'ThS.',
        linhVucChuyenMon: ['Tài chính', 'Kế toán', 'Quản lý dự án'],
        email: 'lanltm@viettel.com.vn',
        kinhNghiemNam: 14,
        trangThai: 'chapNhan',
        diemTrungBinh: 8.0,
      },
      {
        id: 'TV-004',
        userId: 'EXP-003',
        hoTen: 'GS.TSKH. Lê Đình Cường',
        vaiTro: 'UY_VIEN',
        donVi: 'TT Nghiên cứu Điều khiển',
        hocHamHocVi: 'GS.TSKH.',
        linhVucChuyenMon: ['Điều khiển', 'AI', 'Hệ thống nhúng'],
        email: 'cuongld@viettel.com.vn',
        kinhNghiemNam: 25,
        trangThai: 'duKien',
      },
      {
        id: 'TV-005',
        userId: 'EXP-001',
        hoTen: 'PGS.TS. Nguyễn Văn An',
        vaiTro: 'UY_VIEN',
        donVi: 'TT Nghiên cứu Vô tuyến',
        hocHamHocVi: 'PGS.TS.',
        linhVucChuyenMon: ['Vô tuyến', 'Truyền thông', 'Anten'],
        email: 'annv@viettel.com.vn',
        kinhNghiemNam: 18,
        trangThai: 'duKien',
      },
      {
        id: 'TV-006',
        userId: 'EXP-004',
        hoTen: 'TS. Phạm Minh Đức',
        vaiTro: 'UY_VIEN',
        donVi: 'TT Nghiên cứu Điều khiển',
        hocHamHocVi: 'TS.',
        linhVucChuyenMon: ['AI', 'Machine Learning', 'Điều khiển'],
        email: 'ducpm@viettel.com.vn',
        kinhNghiemNam: 10,
        trangThai: 'tuChoi',
        yKienDongGop: 'Lịch họp trùng với công tác triển khai dự án RD.2026.018',
      },
      {
        id: 'TV-007',
        userId: 'EXP-010',
        hoTen: 'ThS. Ngô Thanh Sơn',
        vaiTro: 'THU_KY_KH',
        donVi: 'Ban KHCN VHT',
        hocHamHocVi: 'ThS.',
        linhVucChuyenMon: ['Quản lý KHCN', 'Tiêu chuẩn'],
        email: 'sonnt@viettel.com.vn',
        kinhNghiemNam: 8,
        trangThai: 'chapNhan',
        diemTrungBinh: 8.2,
      },
    ],
  },
]

// ---------------------------------------------------------------------------
// Helper functions
// ---------------------------------------------------------------------------

let _idCounter = 100
function nextId(prefix: string) {
  return `${prefix}-${++_idCounter}`
}

/** Tạo mã HĐ mới */
export function taoMaHoiDong(): string {
  const now = new Date()
  const y = now.getFullYear()
  const s = String(seedHoiDong.length + 1).padStart(3, '0')
  return `HD-${y}-${s}`
}

/**
 * Parse lĩnh vực nghiên cứu từ tên đề tài.
 * Cần cập nhật khi NhiemVu có trường linhVucNghienCuu riêng.
 */
export function parseLinhVucTuDeTai(tenDeTai: string): string[] {
  const t = tenDeTai.toLowerCase()
  const linhVuc: string[] = []
  if (t.includes('ai') || t.includes('trí tuệ') || t.includes('thông minh') || t.includes('machine learning'))
    linhVuc.push('AI')
  if (t.includes('vô tuyến') || t.includes('anten') || t.includes('viba') || t.includes('rf'))
    linhVuc.push('Vô tuyến')
  if (t.includes('điều khiển') || t.includes('định vị') || t.includes('cảm biến'))
    linhVuc.push('Điều khiển')
  if (t.includes('vật liệu') || t.includes('chế tạo'))
    linhVuc.push('Vật liệu')
  if (t.includes('điện tử') || t.includes('vi điều khiển') || t.includes('mạch'))
    linhVuc.push('Điện tử')
  if (t.includes('tác chiến') || t.includes('radar') || t.includes('ew') || t.includes('điện tử'))
    linhVuc.push('Tác chiến Điện tử')
  if (t.includes('quy trình') || t.includes('workflow') || t.includes('khcn'))
    linhVuc.push('Quản lý KHCN')
  if (t.includes('an ninh') || t.includes('bảo mật') || t.includes('mạng'))
    linhVuc.push('An ninh mạng')
  if (linhVuc.length === 0) linhVuc.push('Công nghệ thông tin')
  return linhVuc
}

/**
 * Lọc experts phù hợp với lĩnh vực nghiên cứu của đề tài.
 * Ưu tiên experts có overlap giữa linhVucChuyenMon và linhVucDeTai.
 */
export function locExpertsTheoLinhVuc(experts: ExpertProfile[], linhVucDeTai: string[]): ExpertProfile[] {
  return experts
    .map((e) => {
      const overlap = e.linhVucChuyenMon.filter((lv) =>
        linhVucDeTai.some((l) => lv.toLowerCase().includes(l.toLowerCase()) || l.toLowerCase().includes(lv.toLowerCase()))
      )
      return { expert: e, score: overlap.length }
    })
    .filter(({ score }) => score > 0)
    .sort((a, b) => b.score - a.score)
    .map(({ expert }) => expert)
}

/**
 * Nhóm experts theo đơn vị, giới hạn tối đa 2 người mỗi đơn vị.
 * Đảm bảo đa dạng đơn vị (ít nhất 4 đơn vị khác nhau).
 */
export function phanBoTheoDonVi(experts: ExpertProfile[]): ExpertProfile[] {
  const usedPerDonVi = new Map<string, number>()
  const result: ExpertProfile[] = []
  for (const e of experts) {
    const cur = usedPerDonVi.get(e.donVi) ?? 0
    if (cur < 2) {
      result.push(e)
      usedPerDonVi.set(e.donVi, cur + 1)
    }
  }
  return result
}

/**
 * Tự động thành lập Hội đồng cho một hồ sơ.
 *
 * Thuật toán:
 * 1. Parse lĩnh vực từ tên đề tài
 * 2. Lọc experts phù hợp
 * 3. Nhóm theo đơn vị, max 2/đơn vị
 * 4. Phân vai trò: kinh nghiệm cao nhất → CHU_TICH,
 *    phù hợp nhất KHCN → PHAN_BIEN_1, giỏi TCKT → PHAN_BIEN_2,
 *    còn lại → UY_VIEN (tối đa 3), kinh nghiệm tổng hợp → THU_KY_KH
 */
export function taoHoiDongMacDinh(
  maHoSo: string,
  maNhiemVu: string,
  tenDeTai: string,
  phiEn: 1 | 2
): HoiDong {
  const linhVuc = parseLinhVucTuDeTai(tenDeTai)
  const filtered = locExpertsTheoLinhVuc(EXPERT_POOL, linhVuc)
  const diverse = phanBoTheoDonVi(filtered)

  // Sắp xếp theo kinh nghiệm giảm dần
  const sorted = [...diverse].sort((a, b) => b.kinhNghiemNam - a.kinhNghiemNam)

  // Tìm experts phù hợp cho từng vai trò
  const tcktExperts = sorted.filter((e) =>
    e.linhVucChuyenMon.some((lv) => lv.toLowerCase().includes('tài chính') || lv.toLowerCase().includes('kế toán'))
  )
  const khcnExperts = sorted.filter((e) =>
    e.linhVucChuyenMon.some((lv) =>
      !lv.toLowerCase().includes('tài chính') && !lv.toLowerCase().includes('kế toán')
    )
  )

  const toMember = (e: ExpertProfile, vaiTro: VaiTroHoiDong): ThanhVienHoiDong => ({
    id: nextId('TV'),
    userId: e.userId,
    hoTen: e.hoTen,
    vaiTro,
    donVi: e.donVi,
    hocHamHocVi: e.hocHamHocVi,
    linhVucChuyenMon: e.linhVucChuyenMon,
    email: e.email,
    kinhNghiemNam: e.kinhNghiemNam,
    trangThai: 'duKien',
  })

  const members: ThanhVienHoiDong[] = []
  let idx = 0

  // 1. Chu tịch — kinh nghiệm cao nhất
  if (sorted[idx]) members.push(toMember(sorted[idx++], 'CHU_TICH'))

  // 2. Phản biện 1 — chuyên KHCN
  const pb1 = khcnExperts.find((e) => !members.some((m) => m.userId === e.userId))
  if (pb1) members.push(toMember(pb1, 'PHAN_BIEN_1'))

  // 3. Phản biện 2 — chuyên TCKT
  const pb2 = tcktExperts.find((e) => !members.some((m) => m.userId === e.userId))
  if (pb2) members.push(toMember(pb2, 'PHAN_BIEN_2'))

  // 4. Ủy viên — tối đa 3 người, đa dạng đơn vị
  const uyViens = sorted
    .filter((e) => !members.some((m) => m.userId === e.userId))
    .slice(0, 3)
  uyViens.forEach((e) => members.push(toMember(e, 'UY_VIEN')))

  // 5. Thư ký KH — người có kinh nghiệm quản lý KHCN
  const tkkh = sorted.find(
    (e) =>
      !members.some((m) => m.userId === e.userId) &&
      e.linhVucChuyenMon.some((lv) => lv.toLowerCase().includes('quản lý') || lv.toLowerCase().includes('khcn'))
  )
  if (tkkh) members.push(toMember(tkkh, 'THU_KY_KH'))

  // Nếu chưa đủ thư ký, lấy người còn lại đầu tiên
  if (!members.some((m) => m.vaiTro === 'THU_KY_KH')) {
    const fallback = sorted.find((e) => !members.some((m) => m.userId === e.userId))
    if (fallback) members.push(toMember(fallback, 'THU_KY_KH'))
  }

  const now = new Date()
  const hopDate = new Date(now)
  hopDate.setDate(hopDate.getDate() + 7)

  return {
    id: taoMaHoiDong(),
    maHoSo,
    maNhiemVu,
    tenDeTai,
    linhVucNghienCuu: linhVuc,
    phiEn,
    ngayThanhLap: now.toISOString().split('T')[0],
    ngayHopDuKien: hopDate.toISOString().split('T')[0],
    diaDiem: 'Phòng họp A3 - Tầng 3, Trụ sở VHT',
    trangThai: 'sapLap',
    thanhVien: members,
  }
}