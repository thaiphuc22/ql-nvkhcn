/**
 * Danh mục dùng chung của HR Tools — **đợt 1.5** của
 * `docs/plan/hr-tools-ke-hoach-thi-cong-2026-08-26.md` §5.
 *
 * ## Vì sao một file cấu hình thay vì 11 màn
 *
 * `Book1` liệt kê 6 danh mục, §2.2 của kế hoạch thêm `Ký hiệu công` + `Nhóm công việc`, BRD §4.6
 * thêm 4 cái nữa ⇒ **12 danh mục**, mỗi cái đủ `Danh sách · Chi tiết · CRUD · Import · Export`.
 * Mười một trong số đó là **cùng một khuôn** (danh sách phẳng theo mẫu DMDC); chỉ `Đơn vị` khác vì
 * nó là cây 5 cấp. Viết 11 trang gần giống nhau là 11 chỗ phải sửa mỗi lần đổi khuôn bảng — đúng
 * loại lỗi mà bộ mockup (`docs/mockup/hr-tools/src/pages/10-danh-muc.page.js`) đã tránh bằng vòng
 * lặp trên một mảng cấu hình. Ở đây làm y hệt: **cấu hình là dữ liệu**, trang là một.
 *
 * ## Ranh giới của cách này
 *
 * Kiểu `DanhMucRow` có index signature (`[k: string]: unknown`) — đó là cái giá phải trả để một
 * trang phục vụ 11 danh mục. Đổi lại, mọi thứ *đọc* dữ liệu (cột bảng, trường form, bộ lọc) đều
 * khai kiểu chặt trong `DanhMucDinhNghia`, nên sai tên trường lộ ra ở **cấu hình**, nơi nó nằm
 * ngay cạnh dữ liệu seed. Khi lên backend (đợt 6) thì tầng này là chỗ duy nhất phải nối API.
 *
 * ## Nguồn dữ liệu seed
 *
 * Toàn bộ số liệu lấy từ `docs/hr_tool/trich-xuat/` (sheet `List`, `BM0`, `Book1`) qua bộ mockup đã
 * duyệt. **Không bịa thêm mã/tên mới** — mọi dòng import BM0 sẽ đối chiếu với chính các danh mục
 * này, nên một cái tên bịa ở đây là một dòng bị chặn oan ở đợt 2.
 */

import { DON_VI_CAP_5_TAT_CA, DON_VI_CAP_5_THEO_KHOI, KHOI_OPTIONS } from './don-vi';
import { UNG_VIEN_NHAN_SU } from './nhan-su';

/** Mã danh mục — cũng là đoạn route `/hr/danh-muc/:loai`. */
export type DanhMucLoai =
  | 'chuc-danh'
  | 'nhan-vien'
  | 'nguon-kinh-phi'
  | 'san-pham'
  | 'thu-vien-cong-viec'
  | 'ky-hieu-cong'
  | 'nhom-cong-viec'
  | 'loai-cpnc'
  | 'doi-tac'
  | 'nhiem-vu-mau'
  | 'trang-thai-nhiem-vu';

/**
 * Một bản ghi danh mục.
 *
 * `ma` là khoá nghiệp vụ (người dùng nhìn thấy và gõ vào file import), `id` là khoá kỹ thuật —
 * hai thứ khác nhau vì `ma` **sửa được** ở vài danh mục, còn `id` thì không.
 *
 * `hoatDong = false` nghĩa là *ngừng hoạt động*, **không phải xoá**: master data đã đi vào bảng
 * công kỳ trước thì không được xoá cứng, nếu không số báo cáo cũ đổi sau lưng người đã ký.
 */
export interface DanhMucRow {
  id: string;
  ma: string;
  ten: string;
  hoatDong: boolean;
  [truong: string]: unknown;
}

/** Kiểu ô của một cột bảng — quyết định cách canh lề và định dạng, không phải cách lưu. */
export type DanhMucKieuO = 'chu' | 'so' | 'giua' | 'co-khong' | 'khoa-o';

export interface DanhMucCot {
  field: string;
  header: string;
  width?: string;
  kieu?: DanhMucKieuO;
}

export type DanhMucKieuTruong = 'chu' | 'chu-dai' | 'so' | 'chon' | 'bat-tat';

export interface DanhMucTruong {
  field: string;
  label: string;
  kieu: DanhMucKieuTruong;
  batBuoc?: boolean;
  goiY?: string;
  /** Dòng chú thích dưới ô nhập — chỗ ghi luật nghiệp vụ, không phải chỗ nhắc lại nhãn. */
  moTa?: string;
  options?: readonly string[];
  /** Trường khoá sau khi tạo (mã danh mục là khoá đối chiếu import). */
  khoaKhiSua?: boolean;
}

/** Bộ lọc select — tuỳ chọn suy ra từ chính dữ liệu đang có, không khai cứng. */
export interface DanhMucBoLoc {
  field: string;
  label: string;
}

export interface DanhMucDinhNghia {
  key: DanhMucLoai;
  /** Nhãn trang: `Danh mục Chức danh`. */
  ten: string;
  /** Nhãn trong câu: `chức danh` — dùng cho toast, nút, hộp xác nhận. */
  tenDon: string;
  moTa: string;
  cot: readonly DanhMucCot[];
  truong: readonly DanhMucTruong[];
  boLoc: readonly DanhMucBoLoc[];
  timKiemGoiY: string;
  /** Bật khối *Tìm kiếm nâng cao* thay cho hàng lọc gọn (mockup artboard 12). */
  timKiemNangCao?: boolean;
  /**
   * Danh mục do **hệ thống định nghĩa**: không thêm, không xoá, chỉ sửa được các cột hành vi.
   * `trang-thai-nhiem-vu` là trường hợp duy nhất — mã trạng thái được code đọc thẳng, thêm một mã
   * mới ở đây không sinh ra hành vi nào.
   */
  heThong?: boolean;
  /** Nhãn cột dùng cho file mẫu import + file xuất Excel. */
  importCot: readonly string[];
}

// ------------------------------------------------- danh mục được danh mục khác tham chiếu

/*
 * Hai danh mục dưới đây khai **trước** `DANH_MUC_DINH_NGHIA` vì chính cấu hình đọc chúng để dựng
 * tuỳ chọn cho ô `select` (Nhân viên → Chức danh, Thư viện công việc → Nhóm công việc). `const`
 * không được hoisted, nên để chúng ở khối seed phía dưới là lỗi TDZ ngay lúc nạp module — và
 * triệu chứng không phải một lỗi dễ đọc mà là cả file danh mục không nạp được.
 */

const CHUC_DANH: DanhMucRow[] = [
  row('CD-KS1', 'Kỹ sư bậc 1', { nhom: 'Kỹ thuật', moTaCd: 'Kỹ sư mới, dưới 2 năm kinh nghiệm' }),
  row('CD-KS3', 'Kỹ sư bậc 3', { nhom: 'Kỹ thuật', moTaCd: 'Kỹ sư chủ trì hạng mục' }),
  row('CD-KSC', 'Kỹ sư chính', { nhom: 'Kỹ thuật', moTaCd: 'Chủ trì thiết kế hệ thống' }),
  row('CD-TPB', 'Trưởng phòng ban', { nhom: 'Quản lý', moTaCd: 'Quản lý đơn vị cấp 5' }),
  row('CD-CVCN', 'Chuyên viên Công nghệ', { nhom: 'Kỹ thuật', moTaCd: 'Chuyên viên nghiên cứu' }),
  row('CD-TLDA', 'Trợ lý dự án', { nhom: 'Hỗ trợ', moTaCd: 'Trợ lý đề tài/dự án (PA)' }),
  row('CD-NVKT', 'Nhân viên Kế toán', { nhom: 'Nghiệp vụ', moTaCd: 'Phòng Tài chính' }),
  row('CD-CVNS', 'Chuyên viên Nhân sự', { nhom: 'Nghiệp vụ', moTaCd: 'Phòng Tổ chức Lao động' }),
];

const NHOM_CONG_VIEC: DanhMucRow[] = [
  row('NCV-01', 'Giải pháp', { thuTu: 1, soNoiDung: 18 }),
  row('NCV-02', 'Thiết kế', { thuTu: 2, soNoiDung: 26 }),
  row('NCV-03', 'Phát triển', { thuTu: 3, soNoiDung: 41 }),
  row('NCV-04', 'Kiểm thử', { thuTu: 4, soNoiDung: 19 }),
  row('NCV-05', 'Triển khai', { thuTu: 5, soNoiDung: 9 }),
  row('NCV-06', 'Quản lý dự án', { thuTu: 6, soNoiDung: 5 }),
];

// ---------------------------------------------------------------------------- định nghĩa

const TRANG_THAI_LOC: DanhMucBoLoc = { field: 'hoatDong', label: 'Trạng thái' };

export const DANH_MUC_DINH_NGHIA: Readonly<Record<DanhMucLoai, DanhMucDinhNghia>> = {
  'chuc-danh': {
    key: 'chuc-danh',
    ten: 'Danh mục Chức danh',
    tenDon: 'chức danh',
    moTa:
      'Chức danh theo HRM. KHÁC với vai trò PM/PA của nhiệm vụ — hai thứ không được gộp ' +
      '(khách ghi rõ ở sheet 1.DS Nhân sự).',
    cot: [
      { field: 'ma', header: 'Mã chức danh', width: '160px' },
      { field: 'ten', header: 'Tên chức danh', width: '320px' },
      { field: 'nhom', header: 'Nhóm chức danh', width: '200px' },
      { field: 'moTaCd', header: 'Mô tả' },
    ],
    truong: [
      { field: 'ma', label: 'Mã chức danh', kieu: 'chu', batBuoc: true, khoaKhiSua: true },
      { field: 'ten', label: 'Tên chức danh', kieu: 'chu', batBuoc: true },
      {
        field: 'nhom',
        label: 'Nhóm chức danh',
        kieu: 'chon',
        batBuoc: true,
        options: ['Kỹ thuật', 'Quản lý', 'Hỗ trợ', 'Nghiệp vụ'],
      },
      { field: 'moTaCd', label: 'Mô tả', kieu: 'chu-dai' },
    ],
    boLoc: [{ field: 'nhom', label: 'Nhóm chức danh' }, TRANG_THAI_LOC],
    timKiemGoiY: 'Tìm theo mã hoặc tên chức danh',
    importCot: ['ma', 'ten', 'nhom', 'moTa'],
  },

  'nhan-vien': {
    key: 'nhan-vien',
    ten: 'Danh mục Nhân viên',
    tenDon: 'nhân viên',
    moTa:
      'Master data người — nguồn của mọi màn chấm công. Mã NV không có trong danh mục này thì ' +
      'dòng BM0 bị CHẶN khi import.',
    cot: [
      { field: 'ma', header: 'Mã NV', width: '110px' },
      { field: 'ten', header: 'Họ và tên', width: '200px' },
      { field: 'chucDanh', header: 'Chức danh', width: '180px' },
      { field: 'donVi', header: 'Đơn vị (cấp 5)', width: '260px' },
      { field: 'khoi', header: 'Khối', width: '170px' },
      { field: 'email', header: 'Email' },
    ],
    truong: [
      {
        field: 'ma',
        label: 'Mã nhân viên',
        kieu: 'chu',
        batBuoc: true,
        khoaKhiSua: true,
        goiY: 'Nhập mã nhân viên trên HRM',
        moTa: 'Trùng mã với hệ thống HRM/SAP — đây là khoá đối chiếu khi import BM0.',
      },
      { field: 'ten', label: 'Họ và tên', kieu: 'chu', batBuoc: true, goiY: 'Nhập họ và tên' },
      { field: 'chucDanh', label: 'Chức danh', kieu: 'chon', batBuoc: true, options: CHUC_DANH.map((c) => c.ten) },
      { field: 'khoi', label: 'Khối (cấp 4)', kieu: 'chon', batBuoc: true, options: KHOI_OPTIONS },
      {
        field: 'donVi',
        label: 'Đơn vị (cấp 5)',
        kieu: 'chon',
        batBuoc: true,
        options: DON_VI_CAP_5_TAT_CA,
        moTa: 'Đơn vị chấm công — quyết định bảng chấm công nào chứa người này.',
      },
      { field: 'email', label: 'Email công tác', kieu: 'chu', goiY: 'Nhập email công tác' },
    ],
    boLoc: [
      { field: 'khoi', label: 'Khối (cấp 4)' },
      { field: 'donVi', label: 'Đơn vị (cấp 5)' },
      { field: 'chucDanh', label: 'Chức danh' },
      TRANG_THAI_LOC,
    ],
    timKiemGoiY: 'Tìm theo mã, họ tên hoặc email',
    timKiemNangCao: true,
    importCot: ['ma', 'hoTen', 'chucDanh', 'khoi', 'donVi', 'email'],
  },

  'nguon-kinh-phi': {
    key: 'nguon-kinh-phi',
    ten: 'Danh mục Nguồn kinh phí',
    tenDon: 'nguồn kinh phí',
    moTa:
      'Phân nguồn quyết định CPNC tính vào nguồn nào. KHÁC với Phân loại nhiệm vụ (quyết định ' +
      'layout màn chấm công) — hai enum khác nhau, đừng gộp.',
    cot: [
      { field: 'ma', header: 'Mã nguồn', width: '150px' },
      { field: 'ten', header: 'Tên nguồn kinh phí', width: '260px' },
      { field: 'lapDuToan', header: 'Lập dự toán', width: '150px', kieu: 'co-khong' },
      { field: 'ghiChu', header: 'Ghi chú' },
    ],
    truong: [
      { field: 'ma', label: 'Mã nguồn', kieu: 'chu', batBuoc: true, khoaKhiSua: true },
      { field: 'ten', label: 'Tên nguồn kinh phí', kieu: 'chu', batBuoc: true },
      {
        field: 'lapDuToan',
        label: 'Có lập dự toán',
        kieu: 'bat-tat',
        moTa:
          'Tắt = chỉ theo dõi số đã phân bổ. Cột "còn lại" của nguồn này phải ĐỂ TRỐNG chứ không ' +
          'hiện 0 — 0 đọc thành "hết nguồn".',
      },
      { field: 'ghiChu', label: 'Ghi chú', kieu: 'chu-dai' },
    ],
    boLoc: [TRANG_THAI_LOC],
    timKiemGoiY: 'Tìm theo mã hoặc tên nguồn',
    importCot: ['ma', 'ten', 'lapDuToan', 'ghiChu'],
  },

  'san-pham': {
    key: 'san-pham',
    ten: 'Danh mục Sản phẩm',
    tenDon: 'sản phẩm',
    moTa:
      'Chỉ dùng cho nhiệm vụ phân loại PAKD — là tầng gom trên nội dung công việc (BM2.2).',
    cot: [
      { field: 'ma', header: 'Mã sản phẩm', width: '150px' },
      { field: 'ten', header: 'Tên sản phẩm', width: '320px' },
      { field: 'nhom', header: 'Nhóm sản phẩm', width: '220px' },
      { field: 'soNhiemVu', header: 'Số nhiệm vụ dùng', width: '170px', kieu: 'so' },
    ],
    truong: [
      { field: 'ma', label: 'Mã sản phẩm', kieu: 'chu', batBuoc: true, khoaKhiSua: true },
      { field: 'ten', label: 'Tên sản phẩm', kieu: 'chu', batBuoc: true },
      {
        field: 'nhom',
        label: 'Nhóm sản phẩm',
        kieu: 'chon',
        options: ['Thiết bị vô tuyến', 'Thiết bị điều khiển', 'Camera', 'Thiết bị đo'],
      },
    ],
    boLoc: [{ field: 'nhom', label: 'Nhóm sản phẩm' }, TRANG_THAI_LOC],
    timKiemGoiY: 'Tìm theo mã hoặc tên sản phẩm',
    importCot: ['ma', 'ten', 'nhom'],
  },

  'thu-vien-cong-viec': {
    key: 'thu-vien-cong-viec',
    ten: 'Danh mục Thư viện công việc',
    tenDon: 'nội dung công việc mẫu',
    moTa:
      'Nội dung công việc mẫu, tái dùng khi lập nhiệm vụ. Nguồn: Book1 module Danh mục. Khác ' +
      'Nhiệm vụ mẫu — ở đây là TỪNG nội dung CV rời, bên kia là cả bộ.',
    cot: [
      { field: 'ma', header: 'Mã', width: '130px' },
      { field: 'ten', header: 'Tên nội dung công việc' },
      { field: 'nhomCongViec', header: 'Nhóm công việc', width: '220px' },
      { field: 'lanDung', header: 'Lần dùng', width: '120px', kieu: 'so' },
    ],
    truong: [
      { field: 'ma', label: 'Mã', kieu: 'chu', batBuoc: true, khoaKhiSua: true },
      { field: 'ten', label: 'Tên nội dung công việc', kieu: 'chu', batBuoc: true },
      { field: 'nhomCongViec', label: 'Nhóm công việc', kieu: 'chon', batBuoc: true, options: NHOM_CONG_VIEC.map((n) => n.ten) },
    ],
    boLoc: [{ field: 'nhomCongViec', label: 'Nhóm công việc' }, TRANG_THAI_LOC],
    timKiemGoiY: 'Tìm theo tên nội dung công việc',
    importCot: ['ma', 'ten', 'nhomCongViec'],
  },

  'ky-hieu-cong': {
    key: 'ky-hieu-cong',
    ten: 'Danh mục Ký hiệu công',
    tenDon: 'ký hiệu công',
    moTa:
      'Ký hiệu trong file BM0 do HR nhập từ SAP/HRM, dạng X:8 · P:8 · DL:8. Cột "Khoá ô chấm ' +
      'công" là thứ ĐIỀU KHIỂN luật khoá ở màn chấm công (§6.4) — không phải nhãn hiển thị.',
    cot: [
      { field: 'ma', header: 'Ký hiệu', width: '120px', kieu: 'giua' },
      { field: 'ten', header: 'Tên ký hiệu', width: '280px' },
      { field: 'tinhCong', header: 'Tính công', width: '150px', kieu: 'co-khong' },
      { field: 'khoaO', header: 'Khoá ô chấm công', width: '190px', kieu: 'khoa-o' },
      { field: 'ghiChu', header: 'Ghi chú' },
    ],
    truong: [
      {
        field: 'ma',
        label: 'Ký hiệu',
        kieu: 'chu',
        batBuoc: true,
        khoaKhiSua: true,
        moTa: 'Đúng chuỗi xuất hiện trong ô của file BM0, phần trước dấu hai chấm (X:8 ⇒ X).',
      },
      { field: 'ten', label: 'Tên ký hiệu', kieu: 'chu', batBuoc: true },
      { field: 'tinhCong', label: 'Tính vào công tính lương', kieu: 'bat-tat' },
      {
        field: 'khoaO',
        label: 'Khoá ô chấm công',
        kieu: 'bat-tat',
        moTa: 'Bật = ô của ngày mang ký hiệu này bị xám ở màn chấm công, hiện nguyên ký hiệu gốc.',
      },
      { field: 'ghiChu', label: 'Ghi chú', kieu: 'chu-dai' },
    ],
    boLoc: [TRANG_THAI_LOC],
    timKiemGoiY: 'Tìm theo ký hiệu hoặc tên',
    importCot: ['ma', 'ten', 'tinhCong', 'khoaO', 'ghiChu'],
  },

  'nhom-cong-viec': {
    key: 'nhom-cong-viec',
    ten: 'Danh mục Nhóm công việc',
    tenDon: 'nhóm công việc',
    moTa: 'Gom nội dung công việc để báo cáo. Nguồn: Book1 sheet Quy trình.',
    cot: [
      { field: 'ma', header: 'Mã nhóm', width: '150px' },
      { field: 'ten', header: 'Tên nhóm công việc', width: '320px' },
      { field: 'thuTu', header: 'Thứ tự', width: '110px', kieu: 'giua' },
      { field: 'soNoiDung', header: 'Số nội dung CV', width: '170px', kieu: 'so' },
    ],
    truong: [
      { field: 'ma', label: 'Mã nhóm', kieu: 'chu', batBuoc: true, khoaKhiSua: true },
      { field: 'ten', label: 'Tên nhóm công việc', kieu: 'chu', batBuoc: true },
      { field: 'thuTu', label: 'Thứ tự hiển thị', kieu: 'so', batBuoc: true },
    ],
    boLoc: [TRANG_THAI_LOC],
    timKiemGoiY: 'Tìm theo tên nhóm',
    importCot: ['ma', 'ten', 'thuTu'],
  },

  'loai-cpnc': {
    key: 'loai-cpnc',
    ten: 'Danh mục Loại chi phí nhân công',
    tenDon: 'khoản mục CPNC',
    moTa:
      'BRD §4.6. Đúng 14 khoản mục của BM3, giữ nguyên THỨ TỰ trong file gốc — thêm hoặc bớt một ' +
      'khoản là đổi bố cục cả BM3, BM3.1 và BM4.',
    cot: [
      { field: 'ma', header: 'Mã khoản', width: '150px' },
      { field: 'ten', header: 'Tên khoản mục CPNC', width: '340px' },
      { field: 'nhom', header: 'Nhóm', width: '160px' },
      { field: 'thuTu', header: 'Thứ tự BM3', width: '140px', kieu: 'giua' },
      { field: 'ghiChu', header: 'Ghi chú' },
    ],
    truong: [
      { field: 'ma', label: 'Mã khoản', kieu: 'chu', batBuoc: true, khoaKhiSua: true },
      { field: 'ten', label: 'Tên khoản mục CPNC', kieu: 'chu', batBuoc: true },
      { field: 'nhom', label: 'Nhóm', kieu: 'chon', batBuoc: true, options: ['Lương', 'Bảo hiểm', 'Phụ cấp'] },
      {
        field: 'thuTu',
        label: 'Thứ tự trong BM3',
        kieu: 'so',
        batBuoc: true,
        moTa: 'Thứ tự cột khi kết xuất BM3/BM3.1/BM4 — đổi số ở đây là đổi bố cục cả ba biểu mẫu.',
      },
      { field: 'ghiChu', label: 'Ghi chú', kieu: 'chu-dai' },
    ],
    boLoc: [{ field: 'nhom', label: 'Nhóm khoản mục' }, TRANG_THAI_LOC],
    timKiemGoiY: 'Tìm theo tên khoản mục',
    importCot: ['ma', 'ten', 'nhom', 'thuTu', 'ghiChu'],
  },

  'doi-tac': {
    key: 'doi-tac',
    ten: 'Danh mục Đối tác',
    tenDon: 'đối tác',
    moTa:
      'BRD §4.6. Đối tác ngoài tham gia nhiệm vụ. Nhân công thuê ngoài KHÔNG có mã NV trong HRM ' +
      'nên không đi qua BM0 — chi phí của họ vào nhiệm vụ theo đường hợp đồng, không theo bảng ' +
      'chấm công.',
    cot: [
      { field: 'ma', header: 'Mã đối tác', width: '150px' },
      { field: 'ten', header: 'Tên đối tác' },
      { field: 'loai', header: 'Loại', width: '190px' },
      { field: 'maSoThue', header: 'Mã số thuế', width: '170px' },
      { field: 'soNhiemVu', header: 'Nhiệm vụ tham gia', width: '190px', kieu: 'so' },
    ],
    truong: [
      { field: 'ma', label: 'Mã đối tác', kieu: 'chu', batBuoc: true, khoaKhiSua: true },
      { field: 'ten', label: 'Tên đối tác', kieu: 'chu', batBuoc: true },
      {
        field: 'loai',
        label: 'Loại đối tác',
        kieu: 'chon',
        batBuoc: true,
        options: ['Viện nghiên cứu', 'Trường đại học', 'Nhà thầu phụ', 'Đơn vị kiểm định'],
      },
      { field: 'maSoThue', label: 'Mã số thuế', kieu: 'chu' },
    ],
    boLoc: [{ field: 'loai', label: 'Loại đối tác' }, TRANG_THAI_LOC],
    timKiemGoiY: 'Tìm theo mã, tên hoặc mã số thuế',
    importCot: ['ma', 'ten', 'loai', 'maSoThue'],
  },

  'nhiem-vu-mau': {
    key: 'nhiem-vu-mau',
    ten: 'Danh mục Nhiệm vụ mẫu',
    tenDon: 'nhiệm vụ mẫu',
    moTa:
      'BRD §4.6. Bộ nội dung công việc dựng sẵn theo phân loại — chọn mẫu khi khai nhiệm vụ mới ' +
      'thì sinh luôn danh sách nội dung CV. Khác Thư viện công việc: thư viện là TỪNG nội dung CV ' +
      'rời, mẫu là cả BỘ.',
    cot: [
      { field: 'ma', header: 'Mã mẫu', width: '150px' },
      { field: 'ten', header: 'Tên nhiệm vụ mẫu' },
      { field: 'phanLoaiApDung', header: 'Phân loại áp dụng', width: '220px' },
      { field: 'soNoiDungCv', header: 'Số nội dung CV', width: '170px', kieu: 'so' },
      { field: 'lanDung', header: 'Lần dùng', width: '130px', kieu: 'so' },
    ],
    truong: [
      { field: 'ma', label: 'Mã mẫu', kieu: 'chu', batBuoc: true, khoaKhiSua: true },
      { field: 'ten', label: 'Tên nhiệm vụ mẫu', kieu: 'chu', batBuoc: true },
      {
        field: 'phanLoaiApDung',
        label: 'Phân loại áp dụng',
        kieu: 'chon',
        batBuoc: true,
        options: ['Đề tài KHCN', 'Phương án kinh doanh', 'Dự án ĐTPT', 'Nhiệm vụ QPAN'],
      },
      { field: 'soNoiDungCv', label: 'Số nội dung CV trong mẫu', kieu: 'so' },
    ],
    boLoc: [{ field: 'phanLoaiApDung', label: 'Phân loại' }, TRANG_THAI_LOC],
    timKiemGoiY: 'Tìm theo tên nhiệm vụ mẫu',
    importCot: ['ma', 'ten', 'phanLoaiApDung', 'soNoiDungCv'],
  },

  'trang-thai-nhiem-vu': {
    key: 'trang-thai-nhiem-vu',
    ten: 'Danh mục Trạng thái nhiệm vụ',
    tenDon: 'trạng thái nhiệm vụ',
    moTa:
      'BRD §4.6. Hai cột giữa ĐIỀU KHIỂN luật khoá ô chấm công (§6.4) và nút Đóng nhiệm vụ — ' +
      'không phải nhãn hiển thị. Sửa một ô ở đây là đổi hành vi màn chấm công.',
    heThong: true,
    cot: [
      { field: 'ma', header: 'Mã', width: '200px' },
      { field: 'ten', header: 'Tên trạng thái', width: '240px' },
      { field: 'choChamCong', header: 'Cho chấm công', width: '170px', kieu: 'co-khong' },
      { field: 'choSuaNhiemVu', header: 'Cho sửa nhiệm vụ', width: '190px', kieu: 'co-khong' },
      { field: 'ghiChu', header: 'Ghi chú' },
    ],
    truong: [
      { field: 'ma', label: 'Mã trạng thái', kieu: 'chu', batBuoc: true, khoaKhiSua: true },
      { field: 'ten', label: 'Tên trạng thái', kieu: 'chu', batBuoc: true },
      {
        field: 'choChamCong',
        label: 'Cho chấm công',
        kieu: 'bat-tat',
        moTa: 'Chỉ nhiệm vụ ở trạng thái bật cờ này mới xuất hiện ở màn chấm công (§6.4).',
      },
      { field: 'choSuaNhiemVu', label: 'Cho sửa nhiệm vụ', kieu: 'bat-tat' },
      { field: 'ghiChu', label: 'Ghi chú', kieu: 'chu-dai' },
    ],
    boLoc: [],
    timKiemGoiY: 'Tìm theo tên trạng thái',
    importCot: ['ma', 'ten', 'choChamCong', 'choSuaNhiemVu', 'ghiChu'],
  },
};

/** Thứ tự hiển thị trên menu + trang mục lục danh mục. */
export const DANH_MUC_THU_TU: readonly DanhMucLoai[] = [
  'nhan-vien',
  'chuc-danh',
  'nguon-kinh-phi',
  'loai-cpnc',
  'san-pham',
  'thu-vien-cong-viec',
  'nhom-cong-viec',
  'ky-hieu-cong',
  'nhiem-vu-mau',
  'doi-tac',
  'trang-thai-nhiem-vu',
];

export function laDanhMucLoai(value: string | null | undefined): value is DanhMucLoai {
  return !!value && value in DANH_MUC_DINH_NGHIA;
}

// ------------------------------------------------------------------------------- seed

function row(ma: string, ten: string, extra: Record<string, unknown> = {}, hoatDong = true): DanhMucRow {
  return { id: `${ma}`, ma, ten, hoatDong, ...extra };
}

/**
 * Nhân viên — seed **từ chính `UNG_VIEN_NHAN_SU`**, không phải một danh sách viết tay.
 *
 * Đây là điểm dễ sai nhất của cả đợt 1.5. App đã có một master data người: `UNG_VIEN_NHAN_SU`
 * (phẳng hoá từ `org-users`), và nó là thứ mà **pop-up chọn nhân sự** đọc, **`timUngVien`** tra khi
 * validate file import, và các dòng `NhanSuNhiemVu` trỏ tới qua `maNhanVien`. Bộ mockup vẽ danh mục
 * này bằng mã HRM thật của khách (`801234`, `805512`…); chép nguyên số đó vào đây là dựng **master
 * data người thứ hai**, và hậu quả cụ thể là: màn chi tiết nhân viên luôn báo *"0 nhiệm vụ"*, còn
 * mọi dòng import mang mã `NV004` thì bị chặn với lý do *"không có trong danh mục"* — trong khi
 * người đó có thật.
 *
 * Nên: danh mục là **cùng một tập người**, chỉ bổ sung `khoi` (cấp 4) mà `org-users` không có —
 * suy ra từ cây đơn vị chứ không đoán bằng chuỗi. Khi lên backend (đợt 6), `org-users` bên
 * `identity-service` là nguồn, danh mục này là bản chiếu để HR bổ sung dữ liệu nhân sự — không
 * phải nơi khai người mới.
 */
function khoiCua(donVi: string): string {
  for (const [khoi, ds] of Object.entries(DON_VI_CAP_5_THEO_KHOI)) {
    if (ds.includes(donVi)) return khoi;
  }
  // Đơn vị của `org-users` chưa nằm trong cây 5 cấp của khách ⇒ để TRỐNG, không gán bừa vào Khối 1.
  // Ô trống là dấu hiệu đọc được: đợt import danh mục đơn vị thật sẽ lấp nó.
  return '';
}

/*
 * ⚠ `UngVienNhanSu.chucDanh` KHÔNG dùng lại được ở cột Chức danh.
 *
 * Trường đó của `org-users` mang **vai trò trong luồng RD** (`Chủ nhiệm đề tài (PM)`,
 * `Thường trực HĐ KHCN VHT`, `Phó TGĐ chuyên trách`…), còn *Chức danh* của HR Tools là **chức danh
 * HRM** (`Kỹ sư bậc 3`, `Trợ lý dự án`). Kế hoạch §2.2 đã tách rõ hai thứ này khi dựng
 * `VaiTroNhiemVu` — đổ vai trò luồng vào danh mục chức danh là gộp lại đúng cái vừa tách, và hệ quả
 * thấy ngay là ô lọc *Chức danh* đầy những giá trị không có trong danh mục Chức danh.
 *
 * Ở tầng mock, chức danh HRM gán theo mã NV cho **ổn định giữa các lần nạp** (không random) và chỉ
 * là dữ liệu mô phỏng — nguồn thật là file HRM mà HR import ở đợt 2.
 */
const NHAN_VIEN: DanhMucRow[] = UNG_VIEN_NHAN_SU.map((u, i) => ({
  id: u.maNhanVien,
  ma: u.maNhanVien,
  ten: u.hoTen,
  hoatDong: true,
  chucDanh: CHUC_DANH[i % CHUC_DANH.length].ten,
  donVi: u.donVi,
  khoi: khoiCua(u.donVi),
  email: u.email,
}));

const NGUON_KINH_PHI: DanhMucRow[] = [
  row('KHCN', 'Khoa học công nghệ', {
    lapDuToan: true,
    ghiChu: 'Đề tài KHCN — có mã đề tài bên QTKHCN',
  }),
  row('SXKD', 'Sản xuất kinh doanh', { lapDuToan: true, ghiChu: 'Phương án kinh doanh' }),
  row('BANHANG', 'Bán hàng', { lapDuToan: true, ghiChu: 'Theo sản phẩm của PAKD' }),
  row('BAOHANH', 'Bảo hành', {
    lapDuToan: false,
    ghiChu: 'Chỉ theo dõi số đã phân bổ — cột "còn lại" phải ĐỂ TRỐNG, không hiện 0',
  }),
  row('DTPT', 'Đầu tư phát triển', { lapDuToan: true, ghiChu: 'Dự án ĐTPT' }),
  row('QUANLY', 'Quản lý', {
    lapDuToan: false,
    ghiChu: 'Hệ thống tự gán cho công thừa (§4.3) — người dùng không chọn được',
  }),
];

const SAN_PHAM: DanhMucRow[] = [
  row('SP-A', 'Sản phẩm A — Khối thu phát cao tần', { nhom: 'Thiết bị vô tuyến', soNhiemVu: 12 }),
  row('SP-B', 'Sản phẩm B — Bộ điều khiển trung tâm', { nhom: 'Thiết bị điều khiển', soNhiemVu: 8 }),
  row('SP-C', 'Sản phẩm C — Camera giám sát AI', { nhom: 'Camera', soNhiemVu: 15 }),
  row('SP-D', 'Sản phẩm D — Trạm quan trắc', { nhom: 'Thiết bị đo', soNhiemVu: 3 }),
];

const THU_VIEN_CONG_VIEC: DanhMucRow[] = [
  row('TV-001', 'Khảo sát, phân tích yêu cầu', { nhomCongViec: 'Giải pháp', lanDung: 87 }),
  row('TV-002', 'Thiết kế kiến trúc hệ thống', { nhomCongViec: 'Giải pháp', lanDung: 64 }),
  row('TV-011', 'Thiết kế khối cao tần', { nhomCongViec: 'Thiết kế', lanDung: 23 }),
  row('TV-021', 'Lập trình firmware', { nhomCongViec: 'Phát triển', lanDung: 119 }),
  row('TV-031', 'Kiểm thử tích hợp', { nhomCongViec: 'Kiểm thử', lanDung: 95 }),
  row('TV-041', 'Triển khai thử nghiệm hiện trường', { nhomCongViec: 'Triển khai', lanDung: 31 }),
  row('TV-051', 'Quản lý tiến độ, báo cáo', { nhomCongViec: 'Quản lý dự án', lanDung: 142 }),
];

/**
 * Ký hiệu công — bộ ký hiệu thật trong file BM0 của khách.
 *
 * `NB` là ký hiệu **chờ khai báo**: đợt 2 gặp ký hiệu lạ trong file import thì *cảnh báo cho qua*
 * và ghi vào đây với `tinhCong`/`khoaO` chưa xác định (`null`), để HR khai sau. Đó là lý do hai
 * cột này nhận `null` chứ không chỉ `true|false`.
 */
const KY_HIEU_CONG: DanhMucRow[] = [
  row('X', 'Đi làm', { tinhCong: true, khoaO: false, ghiChu: 'Ô chấm công bình thường' }),
  row('P', 'Nghỉ phép', { tinhCong: true, khoaO: true, ghiChu: 'Ô xám, hiện ký hiệu gốc' }),
  row('DL', 'Nghỉ lễ', { tinhCong: true, khoaO: true, ghiChu: 'Ô xám, hiện ký hiệu gốc' }),
  row('Ô', 'Nghỉ ốm', { tinhCong: true, khoaO: true, ghiChu: '' }),
  row('TS', 'Nghỉ thai sản', { tinhCong: false, khoaO: true, ghiChu: '' }),
  row('CT', 'Công tác', { tinhCong: true, khoaO: false, ghiChu: 'Vẫn chấm được vào nhiệm vụ' }),
  row('KL', 'Nghỉ không lương', { tinhCong: false, khoaO: true, ghiChu: '' }),
  row('NB', 'Chờ khai báo', {
    tinhCong: null,
    khoaO: null,
    ghiChu: 'Ký hiệu lạ từ file import — cảnh báo cho qua, chờ HR khai',
  }),
];

const LOAI_CPNC: DanhMucRow[] = [
  row('LCP-01', 'Lương tháng', { nhom: 'Lương', thuTu: 1, ghiChu: 'Khoản lớn nhất — chiếm phần lớn CPNC' }),
  row('LCP-02', 'Lương tháng (trừ BH cá nhân)', {
    nhom: 'Lương',
    thuTu: 2,
    ghiChu: 'Là dẫn xuất của LCP-01, không cộng dồn hai lần',
  }),
  row('LCP-03', 'Truy thu/truy lĩnh (lương tháng lần 2)', {
    nhom: 'Lương',
    thuTu: 3,
    ghiChu: 'Có thể ÂM khi truy thu',
  }),
  row('LCP-04', 'Lương SXKD (nếu có)', { nhom: 'Lương', thuTu: 4, ghiChu: 'Chỉ nhiệm vụ phân loại PAKD' }),
  row('LCP-05', 'Lương thử việc, tập nghề', { nhom: 'Lương', thuTu: 5, ghiChu: '' }),
  row('LCP-06', 'Lương kinh doanh thử việc, tập nghề', { nhom: 'Lương', thuTu: 6, ghiChu: '' }),
  row('LCP-07', 'BHXH — Cá nhân', { nhom: 'Bảo hiểm', thuTu: 7, ghiChu: '' }),
  row('LCP-08', 'BHXH — Đơn vị', { nhom: 'Bảo hiểm', thuTu: 8, ghiChu: '' }),
  row('LCP-09', 'BHYT — Cá nhân', { nhom: 'Bảo hiểm', thuTu: 9, ghiChu: '' }),
  row('LCP-10', 'BHYT — Đơn vị', { nhom: 'Bảo hiểm', thuTu: 10, ghiChu: '' }),
  row('LCP-11', 'BHTN — Cá nhân', { nhom: 'Bảo hiểm', thuTu: 11, ghiChu: '' }),
  row('LCP-12', 'BHTN — Đơn vị', { nhom: 'Bảo hiểm', thuTu: 12, ghiChu: '' }),
  row('LCP-13', 'KPCĐ', { nhom: 'Bảo hiểm', thuTu: 13, ghiChu: '' }),
  row('LCP-14', 'Các khoản ăn ca, điện thoại, chi phí phụ cấp', {
    nhom: 'Phụ cấp',
    thuTu: 14,
    ghiChu: 'Gộp nhiều khoản nhỏ — BM3 để một cột',
  }),
];

const DOI_TAC: DanhMucRow[] = [
  row('DT-001', 'Viện Khoa học và Công nghệ Quân sự', {
    loai: 'Viện nghiên cứu',
    maSoThue: '0100109106',
    soNhiemVu: 4,
  }),
  row('DT-002', 'Đại học Bách khoa Hà Nội', {
    loai: 'Trường đại học',
    maSoThue: '0100686656',
    soNhiemVu: 2,
  }),
  row('DT-003', 'Công ty CP Công nghệ Tân Tiến', {
    loai: 'Nhà thầu phụ',
    maSoThue: '0106284117',
    soNhiemVu: 7,
  }),
  row('DT-004', 'Trung tâm Đo lường Chất lượng 1', {
    loai: 'Đơn vị kiểm định',
    maSoThue: '0100233583',
    soNhiemVu: 1,
  }),
];

const NHIEM_VU_MAU: DanhMucRow[] = [
  row('NVM-01', 'Đề tài nghiên cứu chế tạo thiết bị', {
    phanLoaiApDung: 'Đề tài KHCN',
    soNoiDungCv: 8,
    lanDung: 23,
  }),
  row('NVM-02', 'Đề tài nghiên cứu vật liệu', {
    phanLoaiApDung: 'Đề tài KHCN',
    soNoiDungCv: 6,
    lanDung: 9,
  }),
  row('NVM-03', 'Phương án kinh doanh sản phẩm mới', {
    phanLoaiApDung: 'Phương án kinh doanh',
    soNoiDungCv: 7,
    lanDung: 14,
  }),
  row('NVM-04', 'Dự án đầu tư dây chuyền sản xuất', {
    phanLoaiApDung: 'Dự án ĐTPT',
    soNoiDungCv: 5,
    lanDung: 4,
  }),
  row('NVM-05', 'Nhiệm vụ quốc phòng an ninh', {
    phanLoaiApDung: 'Nhiệm vụ QPAN',
    soNoiDungCv: 5,
    lanDung: 6,
  }),
];

const TRANG_THAI_NHIEM_VU: DanhMucRow[] = [
  row('DANG_TRINH_PD', 'Đang trình phê duyệt', {
    choChamCong: false,
    choSuaNhiemVu: true,
    ghiChu: 'Chưa có quyết định phê duyệt CPNC nên chưa có nguồn để phân bổ',
  }),
  row('DANG_PHAN_BO', 'Đang phân bổ', {
    choChamCong: true,
    choSuaNhiemVu: true,
    ghiChu: 'Trạng thái DUY NHẤT cho chấm công. Luật khoá ô §6.4 dựa vào đúng dòng này',
  }),
  row('TAM_DUNG', 'Tạm dừng', {
    choChamCong: false,
    choSuaNhiemVu: true,
    ghiChu: 'Giữ nguyên số đã phân bổ, chỉ chặn chấm mới',
  }),
  row('DA_HET_HAN', 'Đã hết hạn', {
    choChamCong: false,
    choSuaNhiemVu: false,
    ghiChu: 'Quá thời gian kết thúc — hệ thống tự chuyển, người dùng không đặt tay',
  }),
  row('DA_DONG', 'Đã đóng', {
    choChamCong: false,
    choSuaNhiemVu: false,
    ghiChu: 'Đã trình ký BM.05 xong — chốt sổ, không quay lại được',
  }),
];

export const SEED_DANH_MUC: Readonly<Record<DanhMucLoai, readonly DanhMucRow[]>> = {
  'chuc-danh': CHUC_DANH,
  'nhan-vien': NHAN_VIEN,
  'nguon-kinh-phi': NGUON_KINH_PHI,
  'san-pham': SAN_PHAM,
  'thu-vien-cong-viec': THU_VIEN_CONG_VIEC,
  'ky-hieu-cong': KY_HIEU_CONG,
  'nhom-cong-viec': NHOM_CONG_VIEC,
  'loai-cpnc': LOAI_CPNC,
  'doi-tac': DOI_TAC,
  'nhiem-vu-mau': NHIEM_VU_MAU,
  'trang-thai-nhiem-vu': TRANG_THAI_NHIEM_VU,
};

// --------------------------------------------------------------------------- tiện ích

/** Hiển thị một ô danh mục ra chuỗi. `null` ở cột `co-khong` nghĩa là *chưa khai*, không phải sai. */
export function oDanhMuc(value: unknown, kieu: DanhMucKieuO | undefined): string {
  if (value === null || value === undefined || value === '') return kieu === 'so' ? '0' : '—';
  if (typeof value === 'boolean') return value ? 'Có' : 'Không';
  if (typeof value === 'number') return value.toLocaleString('vi-VN');
  return String(value);
}
