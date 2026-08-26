import { Injectable, computed, signal } from '@angular/core';

import {
  LichSuMuc,
  NhiemVu,
  NhiemVuTrangThai,
  PhanLoaiNhiemVu,
  PhanNguon,
  TinhTrangPhanBo,
  seedNhiemVu,
} from '../../models/hr/nhiem-vu';
import { VaiTroNhiemVu, kiemTraVaiTro, seedVaiTroNhiemVu } from '../../models/hr/vai-tro-nhiem-vu';

/**
 * Signal store in-memory cho Nhiệm vụ (HR) — **không `HttpClient`**, đúng khuôn
 * `core/services/service-task.service.ts`. Giai đoạn hiện tại của HR Tools là mock data theo quyết
 * định đã chốt với người dùng (kế hoạch §1); khi có backend (đợt 6) thì lớp này là chỗ duy nhất
 * phải đổi, các trang chỉ đọc signal.
 *
 * Vai trò PM/PA nằm **cùng service** chứ không tách riêng: nó là một phần của chính aggregate nhiệm
 * vụ (luật "1 PM + 1 PA chủ trì, mỗi đơn vị phân bổ 1 PA" đọc cả `donViPhanBo` của nhiệm vụ mới
 * kiểm được), nên tách ra chỉ tạo thêm một service phải inject chéo.
 */

function nowStamp(): string {
  const d = new Date();
  const pad = (n: number) => String(n).padStart(2, '0');
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())} ${pad(d.getHours())}:${pad(d.getMinutes())}`;
}

function id(prefix: string): string {
  return `${prefix}-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`;
}

export interface NhiemVuInput {
  maNhiemVu: string;
  tenNhiemVu: string;
  maDeTai: string | null;
  tenDeTai: string | null;
  khoi: string;
  donViChuTri: string;
  donViPhanBo: string[];
  phanLoai: PhanLoaiNhiemVu;
  phanNguon: PhanNguon;
  pmMaNhanVien: string;
  paMaNhanVien: string;
  tongDuToan: number;
  chiPhiNhanCongPheDuyet: number;
  duPhong: number;
  tuNgay: string;
  denNgay: string;
  tinhTrangPhanBo: TinhTrangPhanBo;
  moTa: string;
}

@Injectable({ providedIn: 'root' })
export class NhiemVuService {
  private readonly rowsSignal = signal<NhiemVu[]>(seedNhiemVu);
  private readonly vaiTroSignal = signal<VaiTroNhiemVu[]>(seedVaiTroNhiemVu);

  readonly rows = this.rowsSignal.asReadonly();
  readonly vaiTroRows = this.vaiTroSignal.asReadonly();

  /** Nhiệm vụ còn hiệu lực — nguồn cho select "Nhiệm vụ" ở màn Nhân sự. */
  readonly dangHieuLuc = computed(() => this.rowsSignal().filter((d) => d.trangThai === 'HIEU_LUC'));

  list(): NhiemVu[] {
    return this.rowsSignal();
  }

  get(maNhiemVu: string): NhiemVu | undefined {
    return this.rowsSignal().find((d) => d.maNhiemVu === maNhiemVu);
  }

  /** Mã nhiệm vụ đã tồn tại chưa — form gọi trước khi tạo, vì `maNhiemVu` là khoá. */
  daTonTai(maNhiemVu: string, boQua?: string): boolean {
    const ma = maNhiemVu.trim().toUpperCase();
    return this.rowsSignal().some((d) => d.maNhiemVu.toUpperCase() === ma && d.maNhiemVu !== boQua);
  }

  /**
   * Sinh mã kế tiếp theo năm hiện tại (`NV-2026-008`) — người khai vẫn sửa được, vì nhiệm vụ SXKD
   * định danh bằng mã PO của khách (`PO-92166`) chứ không theo khuôn này.
   */
  maKeTiep(): string {
    const nam = new Date().getFullYear();
    const prefix = `NV-${nam}-`;
    const max = this.rowsSignal()
      .filter((d) => d.maNhiemVu.startsWith(prefix))
      .reduce((acc, d) => Math.max(acc, Number(d.maNhiemVu.slice(prefix.length)) || 0), 0);
    return `${prefix}${String(max + 1).padStart(3, '0')}`;
  }

  create(input: NhiemVuInput, actor: string): NhiemVu {
    const row: NhiemVu = {
      ...input,
      maNhiemVu: input.maNhiemVu.trim().toUpperCase(),
      trangThai: 'NHAP',
      nguoiKhaiBao: actor,
      ngayKhaiBao: nowStamp().slice(0, 10),
      lichSu: [{ at: nowStamp(), actor, hanhDong: 'Khai báo nhiệm vụ' }],
    };
    this.rowsSignal.update((prev) => [row, ...prev]);
    return row;
  }

  update(maNhiemVu: string, patch: Partial<NhiemVuInput>, actor: string): void {
    this.rowsSignal.update((prev) =>
      prev.map((d) =>
        d.maNhiemVu === maNhiemVu
          ? {
              ...d,
              ...patch,
              // `maNhiemVu` là khoá — không cho patch đổi, tránh mồ côi các dòng nhân sự / nội dung
              // công việc đang trỏ tới nó.
              maNhiemVu: d.maNhiemVu,
              lichSu: [...d.lichSu, { at: nowStamp(), actor, hanhDong: 'Cập nhật thông tin nhiệm vụ' }],
            }
          : d,
      ),
    );
  }

  remove(maNhiemVu: string): void {
    this.rowsSignal.update((prev) => prev.filter((d) => d.maNhiemVu !== maNhiemVu));
    this.vaiTroSignal.update((prev) => prev.filter((v) => v.nhiemVuId !== maNhiemVu));
  }

  submit(maNhiemVu: string, actor: string): void {
    this.chuyenTrangThai(maNhiemVu, 'CHO_DUYET', actor, 'Trình duyệt');
  }

  approve(maNhiemVu: string, actor: string, ghiChu?: string): void {
    this.chuyenTrangThai(maNhiemVu, 'HIEU_LUC', actor, 'Duyệt bản khai', ghiChu);
  }

  reject(maNhiemVu: string, actor: string, lyDo: string): void {
    this.chuyenTrangThai(maNhiemVu, 'TU_CHOI', actor, 'Từ chối bản khai', lyDo);
  }

  /** Đổi trạng thái vòng đời ngoài luồng duyệt (tạm dừng / mở lại / đóng). */
  doiTrangThai(maNhiemVu: string, trangThai: NhiemVuTrangThai, actor: string, ghiChu?: string): void {
    this.chuyenTrangThai(maNhiemVu, trangThai, actor, `Chuyển trạng thái sang ${trangThai}`, ghiChu);
  }

  private chuyenTrangThai(
    maNhiemVu: string,
    trangThai: NhiemVuTrangThai,
    actor: string,
    hanhDong: string,
    ghiChu?: string,
  ): void {
    const muc: LichSuMuc = { at: nowStamp(), actor, hanhDong, ghiChu };
    this.rowsSignal.update((prev) =>
      prev.map((d) => (d.maNhiemVu === maNhiemVu ? { ...d, trangThai, lichSu: [...d.lichSu, muc] } : d)),
    );
  }

  // ------------------------------------------------------------------ vai trò

  vaiTroTheoNhiemVu(maNhiemVu: string): VaiTroNhiemVu[] {
    return this.vaiTroSignal().filter((v) => v.nhiemVuId === maNhiemVu);
  }

  /** Danh sách lỗi so với luật của khách; rỗng = hợp lệ. Xem `kiemTraVaiTro`. */
  loiVaiTro(maNhiemVu: string): string[] {
    const nv = this.get(maNhiemVu);
    if (!nv) return [];
    return kiemTraVaiTro(this.vaiTroTheoNhiemVu(maNhiemVu), nv);
  }

  themVaiTro(input: Omit<VaiTroNhiemVu, 'id'>): VaiTroNhiemVu {
    const row: VaiTroNhiemVu = { ...input, id: id('vt') };
    this.vaiTroSignal.update((prev) => [...prev, row]);
    return row;
  }

  suaVaiTro(rowId: string, patch: Partial<Omit<VaiTroNhiemVu, 'id' | 'nhiemVuId'>>): void {
    this.vaiTroSignal.update((prev) => prev.map((v) => (v.id === rowId ? { ...v, ...patch } : v)));
  }

  xoaVaiTro(rowId: string): void {
    this.vaiTroSignal.update((prev) => prev.filter((v) => v.id !== rowId));
  }
}
