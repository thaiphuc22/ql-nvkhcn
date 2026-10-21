/** Cấu hình lưu trữ tài liệu dự án theo QĐ 1752/QĐ-VHT-KHCN và BM-PYC. */

export type GiaiDoanSanPham = 'TKT' | 'NCTD' | 'EVT' | 'DVT' | 'MP' | 'AS';

export type TrangThaiPyc =
  | 'nhap'
  | 'cho_bgd_trung_tam'
  | 'cho_bgd_khoi'
  | 'cho_cntt'
  | 'da_khai_bao'
  | 'tu_choi';

export type QuyenThuMuc = 'view' | 'update' | 'none';

export interface ThuMucMau {
  ma: string;
  ten: string;
  moTa: string;
  children?: ThuMucMau[];
}

export interface MauCayTheoGiaiDoan {
  giaiDoan: GiaiDoanSanPham;
  ten: string;
  cay: ThuMucMau[];
}

export interface TrungTamKyHieu {
  kyHieu: string;
  ten: string;
  khoi: 'K1' | 'K2' | 'K3';
}

export interface UserPhanQuyenPyc {
  viTri: string;
  hoTen: string;
  maNv: string;
  quyenMacDinh: QuyenThuMuc;
}

export interface PycKhaiBaoCauHinh {
  id: string;
  maPyc: string;
  ngayTao: string;
  donViDeXuat: string;
  maNhiemVu: string;
  tenNhiemVu: string;
  maSanPham: string;
  khoi: 'K1' | 'K2' | 'K3';
  trungTam: string;
  giaiDoan: GiaiDoanSanPham[];
  soQuyetDinh: string;
  ngayQuyetDinh: string;
  chuNhiem: string;
  dauMoiTrungTam: string;
  trangThai: TrangThaiPyc;
  users: UserPhanQuyenPyc[];
  ghiChu: string;
  nguoiTao: string;
}

export interface NodeKhoNhiemVu {
  id: string;
  path: string;
  ma: string;
  ten: string;
  moTa: string;
  children: NodeKhoNhiemVu[];
  files: FileKhoNhiemVu[];
}

export interface FileKhoNhiemVu {
  id: string;
  ten: string;
  tenChuan: string;
  hopLeTen: boolean;
  uploadedAt: string;
  nguoi: string;
}

export interface KhoNhiemVu {
  maNhiemVu: string;
  pycId: string;
  rootPath: string;
  cay: NodeKhoNhiemVu[];
  capNhat: string;
}

export const GIAI_DOAN_LABEL: Record<GiaiDoanSanPham, string> = {
  TKT: 'Tiền khả thi',
  NCTD: 'Nghiên cứu thăm dò',
  EVT: 'Nghiên cứu thiết kế',
  DVT: 'Sản xuất thử nghiệm',
  MP: 'Sản xuất loạt',
  AS: 'Sau bán hàng',
};

export const TRANG_THAI_PYC_LABEL: Record<TrangThaiPyc, string> = {
  nhap: 'Nháp',
  cho_bgd_trung_tam: 'Chờ BGĐ Trung tâm thẩm định',
  cho_bgd_khoi: 'Chờ BGĐ Khối phê duyệt',
  cho_cntt: 'Chờ P.CNTT khai báo',
  da_khai_bao: 'Đã khai báo phân vùng',
  tu_choi: 'Từ chối',
};

export const TRANG_THAI_PYC_COLOR: Record<TrangThaiPyc, string> = {
  nhap: 'default',
  cho_bgd_trung_tam: 'gold',
  cho_bgd_khoi: 'orange',
  cho_cntt: 'blue',
  da_khai_bao: 'green',
  tu_choi: 'red',
};

/** Phụ lục 1 — ký hiệu trung tâm (QĐ 1752). */
export const TRUNG_TAM_KY_HIEU: TrungTamKyHieu[] = [
  { kyHieu: 'Rada', ten: 'Trung tâm Ra-đa', khoi: 'K1' },
  { kyHieu: 'TTTCDT', ten: 'Trung tâm Thông tin và tác chiến điện tử', khoi: 'K1' },
  { kyHieu: 'QDT', ten: 'Trung tâm Quang điện tử', khoi: 'K1' },
  { kyHieu: 'MHMP', ten: 'Trung tâm Mô hình mô phỏng', khoi: 'K1' },
  { kyHieu: 'CHDK', ten: 'Trung tâm Chỉ huy điều khiển', khoi: 'K1' },
  { kyHieu: 'VTBR', ten: 'Trung tâm Nghiên cứu thiết bị VT băng rộng', khoi: 'K2' },
  { kyHieu: 'CNTD', ten: 'Trung tâm Nghiên cứu CN truyền dẫn', khoi: 'K2' },
  { kyHieu: 'CNCM', ten: 'Trung tâm Nghiên cứu CN chuyển mạch', khoi: 'K2' },
  { kyHieu: 'OCS', ten: 'Trung tâm Nghiên cứu OCS', khoi: 'K2' },
  { kyHieu: 'SMC', ten: 'Trung tâm Smart connect', khoi: 'K2' },
  { kyHieu: 'TBYT', ten: 'Trung tâm Nghiên cứu thiết bị y tế', khoi: 'K2' },
  { kyHieu: 'CHIP', ten: 'Trung tâm Chip 5G', khoi: 'K3' },
  { kyHieu: 'CORE', ten: 'Phòng core', khoi: 'K3' },
];

function tm(ma: string, ten: string, moTa: string, children?: ThuMucMau[]): ThuMucMau {
  return { ma, ten, moTa, children };
}

/** Cây Level 7+ theo BM-PYC / Phụ lục 2. */
export const MAU_CAY_THEO_GIAI_DOAN: MauCayTheoGiaiDoan[] = [
  {
    giaiDoan: 'NCTD',
    ten: 'Nghiên cứu thăm dò',
    cay: [
      tm('HSQL', 'HSQL', 'Hồ sơ thuyết minh, dự toán, QĐ phê duyệt, giao NV, TTr chủ trương, gia hạn', [
        tm('PD', 'PD', 'Thuyết minh, dự toán, QĐ, giao NV, TTr chủ trương'),
        tm('KH', 'KH', 'Tài liệu kế hoạch chi tiết'),
        tm('BC', 'BC', 'Báo cáo quản lý định kỳ/đột xuất'),
        tm('DC', 'DC', 'TTr điều chỉnh, báo cáo gia hạn'),
        tm('NT', 'NT', 'Hồ sơ nghiệm thu'),
      ]),
      tm('NC', 'NC', 'Hồ sơ, tài liệu nghiên cứu'),
      tm('Khac', 'Khac', 'Tài liệu ngoài phạm vi HSQL/NC'),
    ],
  },
  {
    giaiDoan: 'EVT',
    ten: 'Nghiên cứu phát triển sản phẩm',
    cay: [
      tm('HSQL', 'HSQL', 'Hồ sơ quản lý', [
        tm('PD', 'PD', 'Thuyết minh, dự toán, QĐ, giao NV, TTr chủ trương'),
        tm('KH', 'KH', 'Kick-off, kế hoạch chi tiết nghiên cứu thiết kế'),
        tm('BC', 'BC', 'Báo cáo giai đoạn / định kỳ'),
        tm('DC', 'DC', 'TTr điều chỉnh, gia hạn'),
        tm('NT', 'NT', 'Hồ sơ nghiệm thu đề tài'),
      ]),
      tm('NCTK', 'NCTK', 'Hồ sơ nghiên cứu thiết kế sản phẩm', [
        tm('SP', 'SP', 'Tài liệu mức System', [
          tm('TKHT', 'TKHT', 'Thiết kế hệ thống, chỉ tiêu nội/ngoại SP'),
          tm('DKSP', 'DKSP', 'Bài đo / phương pháp đo / kết quả đo SP'),
          tm('TNSP', 'TNSP', 'Hồ sơ thử nghiệm sản phẩm'),
          tm('KSCL', 'KSCL', 'Đánh giá chất lượng / log QLCL'),
        ]),
        tm('SubA', 'SubSystem-A', 'Tài liệu Sub-system A', [
          tm('Mod1', 'Module-1', 'Module mẫu', [
            tm('HW', 'HW', 'Thiết kế HW', [
              tm('YC', 'YC', 'Yêu cầu thiết kế HW'),
              tm('TK', 'TK', 'TK kiến trúc, SCH, PCB …'),
              tm('HSCN', 'HSCN', 'Hồ sơ công nghệ'),
              tm('GCDK', 'GCDK', 'Gia công, đo kiểm, bring-up'),
            ]),
            tm('ME', 'ME', 'Thiết kế ME', [
              tm('YC', 'YC', 'Yêu cầu thiết kế ME'),
              tm('TK', 'TK', 'TK tổng thể, ID, 3D, mô phỏng'),
              tm('HSCN', 'HSCN', 'HSCN 2D/BOM/gia công'),
              tm('GCDK', 'GCDK', 'Gia công, đo kiểm'),
            ]),
            tm('SW', 'SW', 'Thiết kế SW', [
              tm('YC', 'YC', 'BRD, SRS, RTM, Use case'),
              tm('TK', 'TK', 'HLD, DD, PI plan …'),
              tm('Code', 'Code', 'Source code, thông báo phát hành'),
              tm('Test', 'Test', 'Test case, defect log, KQKT'),
            ]),
            tm('DK', 'DK', 'Đo kiểm module'),
          ]),
        ]),
      ]),
      tm('HSCG', 'HSCG', 'Hồ sơ chuyển giao sang DVT'),
      tm('Khac', 'Khac', 'Tài liệu ngoài HSQL/NCTK/HSCG'),
    ],
  },
  {
    giaiDoan: 'DVT',
    ten: 'Sản xuất thử nghiệm',
    cay: [
      tm('HSQL', 'HSQL', 'Hồ sơ quản lý dự án', [
        tm('PD', 'PD', 'Thuyết minh, dự toán, QĐ, giao NV'),
        tm('KH', 'KH', 'Kick-off, kế hoạch SXTN'),
        tm('BC', 'BC', 'Báo cáo quản lý'),
        tm('DC', 'DC', 'Điều chỉnh / gia hạn'),
        tm('NT', 'NT', 'Nghiệm thu'),
      ]),
      tm('CBSX', 'CBSX', 'Chuẩn bị sản xuất (checklist VTLK, TL sản xuất)'),
      tm('SX', 'SX', 'Hồ sơ giai đoạn sản xuất', [
        tm('QLCL', 'QLCL', 'Nhật ký SX, biên bản kiểm tra'),
        tm('HSCN', 'HSCN', 'Quy trình công nghệ, lắp ráp'),
        tm('DCSX', 'DCSX', 'Điều chỉnh tài liệu SXTN'),
      ]),
      tm('HSCG', 'HSCG', 'Chuyển giao sang MP'),
      tm('Khac', 'Khac', 'Tài liệu khác'),
    ],
  },
  {
    giaiDoan: 'TKT',
    ten: 'Tiền khả thi',
    cay: [
      tm('HSQL', 'HSQL', 'Hồ sơ quản lý tiền khả thi', [
        tm('PD', 'PD', 'Thuyết minh, dự toán, QĐ'),
        tm('KH', 'KH', 'Kế hoạch'),
        tm('BC', 'BC', 'Báo cáo'),
        tm('DC', 'DC', 'Điều chỉnh'),
        tm('NT', 'NT', 'Nghiệm thu'),
      ]),
      tm('Khac', 'Khac', 'Khác'),
    ],
  },
  {
    giaiDoan: 'MP',
    ten: 'Sản xuất loạt',
    cay: [tm('HSQL', 'HSQL', 'Hồ sơ quản lý MP'), tm('Khac', 'Khac', 'Bổ sung theo nhu cầu thực tế')],
  },
  {
    giaiDoan: 'AS',
    ten: 'Sau bán hàng',
    cay: [tm('HSQL', 'HSQL', 'Hồ sơ sau bán hàng'), tm('Khac', 'Khac', 'Bổ sung theo nhu cầu thực tế')],
  },
];

/** Quy tắc đặt tên Điều 3: MASANPHAM_GiaiDoan_[Module_]Ten_Vx.y — tối đa 80 ký tự. */
export function buildTenTaiLieuChuan(input: {
  maSanPham: string;
  giaiDoan: GiaiDoanSanPham;
  module?: string;
  tenHoSo: string;
  version: string;
}): string {
  const parts = [
    input.maSanPham.trim().slice(0, 8),
    input.giaiDoan,
    ...(input.module?.trim() ? [input.module.trim().slice(0, 5)] : []),
    input.tenHoSo.trim().replace(/\s+/g, '-').slice(0, 60),
    input.version.trim() || 'V1.0',
  ];
  return parts.join('_').slice(0, 80);
}

export function validateTenTaiLieu(ten: string): { ok: boolean; message: string } {
  if (!ten) return { ok: false, message: 'Tên tài liệu trống.' };
  if (ten.length > 80) return { ok: false, message: 'Tối đa 80 ký tự (QĐ 1752 Điều 3).' };
  if (/\s/.test(ten)) return { ok: false, message: 'Không dùng khoảng trắng; phân cách bằng - hoặc _.' };
  const re = /^[A-Za-z0-9][A-Za-z0-9._-]{0,7}_(TKT|NCTD|EVT|DVT|MP|AS)(_[A-Za-z0-9-]{1,5})?_[A-Za-z0-9][A-Za-z0-9.-]{0,59}_V\d+\.\d+$/;
  if (!re.test(ten)) {
    return {
      ok: false,
      message: 'Định dạng: MASANPHAM_GiaiDoan_[Module_]TenHoSo_Vx.y',
    };
  }
  return { ok: true, message: 'Hợp lệ.' };
}

export const VI_TRI_PHAN_QUYEN_MAU: string[] = [
  'BAN TGĐ TCT',
  'Chỉ huy phòng ban/trung tâm',
  'P.KHCN',
  'P.Tài chính',
  'P.TCLĐ',
  'P.KD',
  'TT.Mua sắm',
  'TT QLCL',
  'Tổng hợp (Khối)',
  'TTSX / P.SX (Khối)',
  'BGĐ đơn vị chủ trì',
  'BGĐ Khối / BGĐ Trung tâm chủ trì',
  'PGĐ Khối',
  'GĐ Trung tâm',
  'PGĐ Trung tâm',
  'PM',
  'PA',
  'Kỹ sư hệ thống',
  'QA/QC đề tài/dự án',
  'Chuyên viên nghiệp vụ P.KHCN',
  'HW',
  'ME',
  'SW',
  'Sản xuất',
];
