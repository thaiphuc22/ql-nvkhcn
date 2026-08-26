/**
 * Nội dung công việc — con của {@link ../nhiem-vu NhiemVu}, tương ứng dòng `PHÂN LOẠI = Thành phần`
 * của BM5 và cột *Nội dung* của BM2.1/BM2.2.
 *
 * Đây là thực thể **chấm công gán ngày vào**, không phải nhiệm vụ: một người trong một ngày làm cho
 * MỘT nội dung công việc. Hai đặc điểm khiến nó không thể là một cột text trên nhiệm vụ:
 *
 * 1. Mỗi nội dung CV có **đơn vị phân bổ riêng**, khác đơn vị chủ trì của nhiệm vụ (BM5: nhiệm vụ
 *    của Trung tâm Chỉ huy điều khiển có nội dung CV thuộc Phòng Kinh doanh và Trung tâm ĐBCL) —
 *    chính chỗ này sinh ra bước "PA/PM chủ trì xác nhận".
 * 2. Mỗi nội dung CV có **CPNC phê duyệt riêng** và dự phòng riêng; báo cáo cộng ngược lên nhiệm vụ.
 *
 * Ràng buộc *1 ngày = 1 nội dung CV* sống ở tầng `PhanBoCong` (đợt 2), không ở đây.
 */
import type { PhanNguon, TinhTrangPhanBo } from './nhiem-vu';

export interface NoiDungCongViec {
  id: string;
  /** Trỏ tới `NhiemVu.maNhiemVu`. */
  nhiemVuId: string;
  ten: string;
  /** Nhóm công việc (Giải pháp / Phát triển / Kiểm thử…) — danh mục của đợt 1.5, chưa bắt buộc. */
  nhomCongViecId?: string;
  /** Chỉ nhiệm vụ `PAKD` mới có sản phẩm; danh mục sản phẩm cũng thuộc đợt 1.5. */
  sanPhamId?: string;
  /** Đơn vị cấp 5 chịu trách nhiệm phân bổ nội dung này. */
  donViPhanBo: string;
  phanNguon: PhanNguon;
  /** Đơn vị: đồng. Nguồn `BAO_HANH` không lập dự toán ⇒ để `0` và cột "còn lại" phải hiện trống. */
  chiPhiNhanCongPheDuyet: number;
  duPhong: number;
  /** ISO date `yyyy-MM-dd`. */
  tuNgay: string;
  denNgay: string;
  tinhTrangPhanBo: TinhTrangPhanBo;
}

/**
 * Nguồn đã lập dự toán = CPNC phê duyệt **+ dự phòng** (sheet `3.Báo cáo` dòng 9). Không phải chỉ
 * CPNC phê duyệt — bỏ dự phòng thì mọi báo cáo "còn lại" đều thiếu.
 */
export function nguonDaLapDuToan(ndcv: Pick<NoiDungCongViec, 'chiPhiNhanCongPheDuyet' | 'duPhong'>): number {
  return ndcv.chiPhiNhanCongPheDuyet + ndcv.duPhong;
}

export const seedNoiDungCongViec: NoiDungCongViec[] = [
  // NV-2024-001 — dữ liệu thật BM5: 3 nội dung CV, 3 đơn vị phân bổ khác nhau.
  {
    id: 'ndcv-001',
    nhiemVuId: 'NV-2024-001',
    ten: 'Nghiên cứu giải pháp nền tảng tự động hoá',
    donViPhanBo: 'Trung tâm Chỉ huy điều khiển',
    phanNguon: 'KHCN',
    chiPhiNhanCongPheDuyet: 12_400_000_000,
    duPhong: 620_000_000,
    tuNgay: '2024-04-08',
    denNgay: '2026-12-31',
    tinhTrangPhanBo: 'DANG_PHAN_BO',
  },
  {
    id: 'ndcv-002',
    nhiemVuId: 'NV-2024-001',
    ten: 'Khảo sát nhu cầu và xây dựng phương án triển khai',
    donViPhanBo: 'Phòng Kinh doanh',
    phanNguon: 'KHCN',
    chiPhiNhanCongPheDuyet: 4_180_000_000,
    duPhong: 210_000_000,
    tuNgay: '2024-04-08',
    denNgay: '2025-12-31',
    tinhTrangPhanBo: 'DANG_PHAN_BO',
  },
  {
    id: 'ndcv-003',
    nhiemVuId: 'NV-2024-001',
    ten: 'Kiểm thử và đánh giá chất lượng sản phẩm',
    donViPhanBo: 'Trung tâm Đảm bảo chất lượng',
    phanNguon: 'KHCN',
    chiPhiNhanCongPheDuyet: 6_463_245_371,
    duPhong: 320_000_000,
    tuNgay: '2025-01-01',
    denNgay: '2026-12-31',
    tinhTrangPhanBo: 'DANG_PHAN_BO',
  },

  // PO-92166 — một nhiệm vụ, ba nguồn. Dòng Bảo hành CỐ Ý không có dự toán (kế hoạch §2.4).
  {
    id: 'ndcv-004',
    nhiemVuId: 'PO-92166',
    ten: 'Sản xuất và tích hợp thiết bị',
    donViPhanBo: 'Trung tâm sản xuất',
    phanNguon: 'SXKD',
    chiPhiNhanCongPheDuyet: 3_900_000_000,
    duPhong: 0,
    tuNgay: '2025-01-01',
    denNgay: '2025-12-31',
    tinhTrangPhanBo: 'DANG_PHAN_BO',
  },
  {
    id: 'ndcv-005',
    nhiemVuId: 'PO-92166',
    ten: 'Bàn giao và hỗ trợ khách hàng',
    donViPhanBo: 'Trung tâm Thông tin Quân sự',
    phanNguon: 'BAN_HANG',
    chiPhiNhanCongPheDuyet: 1_360_000_000,
    duPhong: 0,
    tuNgay: '2025-04-01',
    denNgay: '2025-12-31',
    tinhTrangPhanBo: 'DANG_PHAN_BO',
  },
  {
    id: 'ndcv-006',
    nhiemVuId: 'PO-92166',
    ten: 'Bảo hành thiết bị đã bàn giao',
    donViPhanBo: 'Trung tâm dịch vụ sau bán hàng',
    phanNguon: 'BAO_HANH',
    // Không lập dự toán — chỉ theo dõi số đã phân bổ.
    chiPhiNhanCongPheDuyet: 0,
    duPhong: 0,
    tuNgay: '2025-07-01',
    denNgay: '2025-12-31',
    tinhTrangPhanBo: 'DANG_PHAN_BO',
  },

  {
    id: 'ndcv-007',
    nhiemVuId: 'NV-2026-003',
    ten: 'Nghiên cứu công thức vật liệu',
    donViPhanBo: 'Trung tâm Nền tảng IOT',
    phanNguon: 'KHCN',
    chiPhiNhanCongPheDuyet: 1_040_000_000,
    duPhong: 0,
    tuNgay: '2026-09-01',
    denNgay: '2027-08-31',
    tinhTrangPhanBo: 'DANG_TRINH_PHE_DUYET',
  },
  {
    id: 'ndcv-008',
    nhiemVuId: 'NV-2026-003',
    ten: 'Thử nghiệm chịu nhiệt và lập báo cáo',
    donViPhanBo: 'Phòng Quản lý chất lượng',
    phanNguon: 'KHCN',
    chiPhiNhanCongPheDuyet: 440_000_000,
    duPhong: 0,
    tuNgay: '2027-01-01',
    denNgay: '2027-08-31',
    tinhTrangPhanBo: 'DANG_TRINH_PHE_DUYET',
  },
  {
    id: 'ndcv-009',
    nhiemVuId: 'NV-2024-018',
    ten: 'Tối ưu thuật toán và đo kiểm trên mạng lõi',
    donViPhanBo: 'Trung tâm Nghiên cứu Công nghệ truyền dẫn',
    phanNguon: 'KHCN',
    chiPhiNhanCongPheDuyet: 860_000_000,
    duPhong: 0,
    tuNgay: '2024-03-01',
    denNgay: '2025-12-31',
    tinhTrangPhanBo: 'DA_HET_HAN',
  },
];
