import { Injectable, computed, inject, signal } from '@angular/core';

import { LichSuMuc } from '../../models/hr/nhiem-vu';
import {
  NhanSuNhiemVu,
  NhanSuTrangThaiDuyet,
  seedNhanSuNhiemVu,
  timUngVien,
  tinhTongPhanBo,
} from '../../models/hr/nhan-su';
import { NhiemVuService } from './nhiem-vu.service';

/**
 * Signal store in-memory cho Nhân sự tham gia nhiệm vụ — cùng khuôn `NhiemVuService` (không
 * `HttpClient`, xem ghi chú ở đó).
 *
 * Phần đáng chú ý không phải CRUD mà là **luồng import**: `phanTichFileImport` chỉ *đọc và chấm
 * điểm* từng dòng, `importRows` mới ghi. Tách đôi như vậy để màn hình bắt buộc phải hiện preview
 * trước khi nhập — nếu gộp một hàm, cám dỗ "bỏ qua dòng lỗi cho nhanh" sẽ thắng, và người dùng mất
 * dữ liệu mà không biết.
 */

function nowStamp(): string {
  const d = new Date();
  const pad = (n: number) => String(n).padStart(2, '0');
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())} ${pad(d.getHours())}:${pad(d.getMinutes())}`;
}

function id(): string {
  return `ns-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`;
}

export interface NhanSuInput {
  maNhanVien: string;
  hoTen: string;
  email: string;
  donVi: string;
  chucDanh: string;
  nhiemVuId: string;
  vaiTroThamGia: string;
  noiDungCongViecIds: string[];
  /** Tham khảo, có thể bỏ trống — xem ghi chú đầu `models/hr/nhan-su.ts`. */
  tyLePhanBo?: number;
  tuNgay: string;
  denNgay: string;
  ghiChu: string;
}

/** Một dòng thô đọc từ file import, chưa kiểm tra gì. */
export interface ImportRowRaw {
  maNhanVien: string;
  hoTen: string;
  email: string;
  nhiemVuId: string;
  vaiTroThamGia: string;
  tyLePhanBo: string;
  tuNgay: string;
  denNgay: string;
  ghiChu: string;
}

/** Kết quả chấm điểm một dòng import — `loi` rỗng nghĩa là dòng nhập được. */
export interface ImportPreviewRow {
  soDong: number;
  raw: ImportRowRaw;
  loi: string[];
  hopLe: boolean;
}

export const IMPORT_HEADERS = [
  'maNhanVien',
  'hoTen',
  'email',
  'maNhiemVu',
  'vaiTro',
  'tyLePhanBo',
  'tuNgay',
  'denNgay',
  'ghiChu',
] as const;

/**
 * Nội dung file mẫu tải về. **Cố ý có 2 dòng sai** (dòng 3 thiếu mã NV + email sai, dòng 4 trỏ vào
 * nhiệm vụ không tồn tại) để người kiểm thử thấy ngay màn preview bắt lỗi thật. Người dùng thật xoá
 * 2 dòng đó đi là có template sạch.
 *
 * Dòng 2 **bỏ trống `tyLePhanBo`** — đó là dạng dữ liệu đúng theo BM1 và file mẫu phải cho thấy
 * điều đó, chứ không mời người dùng bịa một con số phần trăm.
 */
export const IMPORT_TEMPLATE_CSV = [
  IMPORT_HEADERS.join(','),
  'NV005,Nguyễn Đức Thắng,ptgd@example.com,NV-2024-001,Thành viên,20,2026-01-01,2026-12-31,',
  'NV009,Trịnh Văn Sơn,khcntd@example.com,PO-92166,Kỹ thuật viên,,2025-03-01,2025-12-31,Không khai tỷ lệ',
  ',Người thiếu mã,email-sai,NV-2024-001,Thành viên,10,2026-01-01,2026-12-31,Dòng lỗi mẫu',
  'NV012,Hoàng Minh Đức,hdtd@example.com,NV-KHONG-CO,Thành viên,10,2026-01-01,2026-12-31,Dòng lỗi mẫu',
].join('\r\n');

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const DATE_RE = /^\d{4}-\d{2}-\d{2}$/;

/** Tách CSV đơn giản: tự nhận `,` hay `;`, có hỗ trợ ô bọc dấu nháy kép. */
function tachDong(line: string, delimiter: string): string[] {
  const cells: string[] = [];
  let cur = '';
  let inQuote = false;
  for (let i = 0; i < line.length; i++) {
    const ch = line[i];
    if (ch === '"') {
      if (inQuote && line[i + 1] === '"') {
        cur += '"';
        i++;
      } else {
        inQuote = !inQuote;
      }
    } else if (ch === delimiter && !inQuote) {
      cells.push(cur);
      cur = '';
    } else {
      cur += ch;
    }
  }
  cells.push(cur);
  return cells.map((c) => c.trim());
}

@Injectable({ providedIn: 'root' })
export class NhanSuService {
  private readonly nhiemVuService = inject(NhiemVuService);
  private readonly rowsSignal = signal<NhanSuNhiemVu[]>(seedNhanSuNhiemVu);

  readonly rows = this.rowsSignal.asReadonly();

  /** Số dòng đang chờ duyệt — thẻ đếm ở màn danh sách. */
  readonly soChoDuyet = computed(() => this.rowsSignal().filter((r) => r.trangThaiDuyet === 'CHO_DUYET').length);

  list(): NhanSuNhiemVu[] {
    return this.rowsSignal();
  }

  get(rowId: string): NhanSuNhiemVu | undefined {
    return this.rowsSignal().find((r) => r.id === rowId);
  }

  theoNhiemVu(maNhiemVu: string): NhanSuNhiemVu[] {
    return this.rowsSignal().filter((r) => r.nhiemVuId === maNhiemVu);
  }

  /**
   * Tổng phân bổ của một người trong kỳ giao với `moc`, đã trừ dòng `boQuaId`. Trang gọi hàm này
   * thay vì tự cộng, để cảnh báo ở form / danh sách / import luôn khớp nhau.
   */
  tongPhanBo(maNhanVien: string, moc: { tuNgay: string; denNgay: string }, boQuaId?: string): number {
    return tinhTongPhanBo(this.rowsSignal(), maNhanVien, moc, boQuaId);
  }

  create(input: NhanSuInput, actor: string): NhanSuNhiemVu {
    const row: NhanSuNhiemVu = {
      ...input,
      id: id(),
      trangThaiDuyet: 'NHAP',
      lichSu: [{ at: nowStamp(), actor, hanhDong: 'Thêm nhân sự vào nhiệm vụ' }],
    };
    this.rowsSignal.update((prev) => [row, ...prev]);
    return row;
  }

  update(rowId: string, patch: Partial<NhanSuInput>, actor: string): void {
    this.rowsSignal.update((prev) =>
      prev.map((r) =>
        r.id === rowId
          ? { ...r, ...patch, id: r.id, lichSu: [...r.lichSu, { at: nowStamp(), actor, hanhDong: 'Cập nhật phân công' }] }
          : r,
      ),
    );
  }

  remove(rowId: string): void {
    this.rowsSignal.update((prev) => prev.filter((r) => r.id !== rowId));
  }

  submit(rowIds: readonly string[], actor: string): void {
    this.chuyenTrangThai(rowIds, 'CHO_DUYET', actor, 'Trình duyệt');
  }

  approve(rowIds: readonly string[], actor: string, ghiChu?: string): void {
    this.chuyenTrangThai(rowIds, 'DA_DUYET', actor, 'Duyệt phân công', ghiChu);
  }

  reject(rowIds: readonly string[], actor: string, lyDo: string): void {
    this.chuyenTrangThai(rowIds, 'TU_CHOI', actor, 'Từ chối phân công', lyDo);
  }

  private chuyenTrangThai(
    rowIds: readonly string[],
    trangThaiDuyet: NhanSuTrangThaiDuyet,
    actor: string,
    hanhDong: string,
    ghiChu?: string,
  ): void {
    const targets = new Set(rowIds);
    const muc: LichSuMuc = { at: nowStamp(), actor, hanhDong, ghiChu };
    this.rowsSignal.update((prev) =>
      prev.map((r) => (targets.has(r.id) ? { ...r, trangThaiDuyet, lichSu: [...r.lichSu, muc] } : r)),
    );
  }

  // ------------------------------------------------------------------ import

  /** Đọc nội dung file (CSV) thành dòng thô. Không kiểm tra gì ở bước này. */
  docFileImport(text: string): ImportRowRaw[] {
    const lines = text
      .replace(/^﻿/, '')
      .split(/\r?\n/)
      .filter((l) => l.trim().length > 0);
    if (lines.length === 0) return [];

    const delimiter = lines[0].includes(';') && !lines[0].includes(',') ? ';' : ',';
    const header = tachDong(lines[0], delimiter).map((h) => h.toLowerCase());
    // Chấp nhận file không có dòng tiêu đề: nhận diện bằng ô đầu tiên.
    const coHeader = header[0] === 'manhanvien' || header[0] === 'mã nhân viên';
    const body = coHeader ? lines.slice(1) : lines;

    return body.map((line) => {
      const c = tachDong(line, delimiter);
      return {
        maNhanVien: c[0] ?? '',
        hoTen: c[1] ?? '',
        email: c[2] ?? '',
        nhiemVuId: c[3] ?? '',
        vaiTroThamGia: c[4] ?? '',
        tyLePhanBo: c[5] ?? '',
        tuNgay: c[6] ?? '',
        denNgay: c[7] ?? '',
        ghiChu: c[8] ?? '',
      };
    });
  }

  /**
   * Chấm điểm từng dòng. Trả về ĐỦ mọi dòng — kể cả dòng hỏng — kèm danh sách lỗi, để màn hình
   * hiện preview đầy đủ. Không bao giờ im lặng bỏ dòng lỗi.
   *
   * `tyLePhanBo` **để trống là hợp lệ** (BM1 không có cột này); chỉ khi có giá trị mới soát khoảng
   * 1–100 và cộng dồn. Kiểm tra tổng tính CỘNG DỒN trong nội bộ file: 3 dòng cùng một người, mỗi
   * dòng 40%, cả 3 hợp lệ khi xét riêng nhưng cộng lại là 120% — bắt được lỗi này chỉ khi tích luỹ dần.
   */
  phanTichFileImport(raws: readonly ImportRowRaw[]): ImportPreviewRow[] {
    const daThay = new Set<string>();
    // Bản sao dữ liệu hiện có + các dòng hợp lệ đã duyệt qua, để cộng dồn tỷ lệ.
    const luyKe: NhanSuNhiemVu[] = [...this.rowsSignal()];

    return raws.map((raw, index) => {
      const loi: string[] = [];
      const maNhanVien = raw.maNhanVien.trim().toUpperCase();
      const nhiemVuId = raw.nhiemVuId.trim().toUpperCase();
      const tyLeText = raw.tyLePhanBo.replace('%', '').trim();
      const tyLe = tyLeText ? Number(tyLeText) : undefined;

      if (!maNhanVien) loi.push('Thiếu mã nhân viên.');
      else if (!timUngVien(maNhanVien)) loi.push(`Mã nhân viên ${maNhanVien} không có trong danh mục nhân sự.`);

      if (!raw.email.trim()) loi.push('Thiếu email.');
      else if (!EMAIL_RE.test(raw.email.trim())) loi.push(`Email "${raw.email.trim()}" không hợp lệ.`);

      if (!nhiemVuId) loi.push('Thiếu mã nhiệm vụ.');
      else if (!this.nhiemVuService.get(nhiemVuId)) loi.push(`Nhiệm vụ ${nhiemVuId} không tồn tại.`);

      if (!raw.vaiTroThamGia.trim()) loi.push('Thiếu vai trò tham gia.');

      if (tyLe !== undefined && (!Number.isFinite(tyLe) || tyLe <= 0 || tyLe > 100)) {
        loi.push('Tỷ lệ dự kiến phải bỏ trống hoặc là số trong khoảng 1–100.');
      }

      if (!DATE_RE.test(raw.tuNgay.trim())) loi.push('Từ ngày phải theo định dạng yyyy-MM-dd.');
      if (!DATE_RE.test(raw.denNgay.trim())) loi.push('Đến ngày phải theo định dạng yyyy-MM-dd.');
      if (DATE_RE.test(raw.tuNgay.trim()) && DATE_RE.test(raw.denNgay.trim()) && raw.tuNgay.trim() > raw.denNgay.trim()) {
        loi.push('Từ ngày phải trước Đến ngày.');
      }

      const khoa = `${maNhanVien}|${nhiemVuId}`;
      if (maNhanVien && nhiemVuId) {
        if (daThay.has(khoa)) loi.push('Trùng với một dòng khác trong cùng file.');
        else if (luyKe.some((r) => r.maNhanVien === maNhanVien && r.nhiemVuId === nhiemVuId)) {
          loi.push('Nhân sự này đã có trong nhiệm vụ.');
        }
        daThay.add(khoa);
      }

      if (loi.length === 0) {
        const moc = { tuNgay: raw.tuNgay.trim(), denNgay: raw.denNgay.trim() };
        const tong = tinhTongPhanBo(luyKe, maNhanVien, moc) + (tyLe ?? 0);
        if (tong > 100) {
          loi.push(`Tổng tỷ lệ dự kiến trong kỳ đạt ${tong}% (> 100%).`);
        } else {
          // Chỉ dòng đã sạch mới được cộng vào luỹ kế — dòng hỏng không làm sai tổng của dòng sau.
          luyKe.push({
            id: `preview-${index}`,
            maNhanVien,
            hoTen: raw.hoTen.trim(),
            email: raw.email.trim(),
            donVi: '',
            chucDanh: '',
            nhiemVuId,
            vaiTroThamGia: raw.vaiTroThamGia.trim(),
            noiDungCongViecIds: [],
            tyLePhanBo: tyLe,
            tuNgay: moc.tuNgay,
            denNgay: moc.denNgay,
            trangThaiDuyet: 'NHAP',
            ghiChu: raw.ghiChu.trim(),
            lichSu: [],
          });
        }
      }

      return { soDong: index + 1, raw, loi, hopLe: loi.length === 0 };
    });
  }

  /**
   * Ghi các dòng HỢP LỆ trong preview. Trả về số dòng đã nhập.
   *
   * `noiDungCongViecIds` để rỗng: file import chưa mang cột đó, và đoán nội dung công việc hộ người
   * dùng thì sai nghiệp vụ. Người khai bổ sung ở màn sửa.
   */
  importRows(preview: readonly ImportPreviewRow[], actor: string): number {
    const them: NhanSuNhiemVu[] = [];
    for (const p of preview) {
      if (!p.hopLe) continue;
      const ma = p.raw.maNhanVien.trim().toUpperCase();
      const ungVien = timUngVien(ma);
      const tyLeText = p.raw.tyLePhanBo.replace('%', '').trim();
      them.push({
        id: id(),
        maNhanVien: ma,
        hoTen: p.raw.hoTen.trim() || ungVien?.hoTen || ma,
        email: p.raw.email.trim(),
        donVi: ungVien?.donVi ?? '',
        chucDanh: ungVien?.chucDanh ?? '',
        nhiemVuId: p.raw.nhiemVuId.trim().toUpperCase(),
        vaiTroThamGia: p.raw.vaiTroThamGia.trim(),
        noiDungCongViecIds: [],
        tyLePhanBo: tyLeText ? Number(tyLeText) : undefined,
        tuNgay: p.raw.tuNgay.trim(),
        denNgay: p.raw.denNgay.trim(),
        trangThaiDuyet: 'NHAP',
        ghiChu: p.raw.ghiChu.trim(),
        lichSu: [{ at: nowStamp(), actor, hanhDong: 'Nhập từ file' }],
      });
    }
    if (them.length) this.rowsSignal.update((prev) => [...them, ...prev]);
    return them.length;
  }
}
