import { Injectable, inject, signal } from '@angular/core';

import {
  DongBangLuong,
  KHOAN_MUC_LUONG,
  LanNhapBangLuong,
  dungBangLuong,
} from '../../models/hr/bang-luong';
import { KY_MAC_DINH } from '../../models/hr/ky';
import { BangCongService } from './bang-cong.service';
import { DanhMucService } from './danh-muc.service';
import { KyService } from './ky.service';
import {
  ImportDongPreview,
  ImportVanDe,
  docFilePhanCach,
} from '../../../shared/hr/import-preview/import-preview.model';

/**
 * Signal store in-memory cho **bảng lương tháng BM0** — chỉ import, chỉ đọc (BRD: *"không xử lý
 * lương chi tiết"*).
 *
 * Bộ luật import **cùng khuôn** với bảng công (§6.6): mã NV lạ ⇒ chặn · kỳ đã khoá ⇒ chặn ·
 * import lại ⇒ đè cả kỳ. Khác một điểm: bảng lương **không có ma trận ngày**, nên thay luật "ký
 * hiệu công lạ" bằng luật **khoản mục lạ** — cột không khớp `KHOAN_MUC_LUONG` là cảnh báo cho qua
 * (khách thêm khoản mới trước khi hệ thống kịp khai), còn số không đọc được là lỗi chặn.
 *
 * ⚠ **Store này KHÔNG kiểm tra quyền.** Fail-closed cột tiền là việc của tầng render
 * (`QuyenHrService` + template) — nhưng đó cũng là lý do đừng bao giờ đổ dữ liệu từ đây ra một
 * export/JSON chung mà không hỏi quyền trước.
 */

function nowStamp(): string {
  const d = new Date();
  const pad = (n: number) => String(n).padStart(2, '0');
  return `${pad(d.getDate())}/${pad(d.getMonth() + 1)} ${pad(d.getHours())}:${pad(d.getMinutes())}`;
}

/** Cột định danh của file BM0 lương; sau đó là 14 cột khoản mục theo đúng thứ tự `KHOAN_MUC_LUONG`. */
export const BM0_LUONG_COT_DAU = ['maNhanVien', 'hoTen', 'donVi', 'congTinhLuong'] as const;

@Injectable({ providedIn: 'root' })
export class BangLuongService {
  private readonly bangCong = inject(BangCongService);
  private readonly danhMuc = inject(DanhMucService);
  private readonly ky = inject(KyService);

  private readonly rowsSignal = signal<DongBangLuong[]>([]);
  private readonly lanNhapSignal = signal<Record<string, LanNhapBangLuong>>({});

  readonly rows = this.rowsSignal.asReadonly();

  constructor() {
    // Seed dựng từ chính bảng công của kỳ mặc định ⇒ `congTinhLuong` của hai bảng **bằng nhau theo
    // xây dựng**. Khai rời hai nơi là mở đường cho hai mẫu số khác nhau, và mọi con số CPNC sau đó
    // đều lệch mà không ai biết lệch từ đâu.
    this.rowsSignal.set(dungBangLuong(KY_MAC_DINH, this.bangCong.nguoiKyMacDinh()));
    this.lanNhapSignal.set({
      [KY_MAC_DINH]: {
        kyId: KY_MAC_DINH,
        tenFile: 'BM0_BangLuong_T05_2025.xlsx',
        soDong: this.rowsSignal().length,
        nhapLuc: '02/06 08:22',
        nhapBoi: 'Nguyễn Thu Hà (HR)',
      },
    });
  }

  theoKy(maKy: string): DongBangLuong[] {
    return this.rowsSignal().filter((r) => r.kyId === maKy);
  }

  cua(maKy: string, maNhanVien: string): DongBangLuong | undefined {
    return this.rowsSignal().find((r) => r.kyId === maKy && r.maNhanVien === maNhanVien);
  }

  lanNhap(maKy: string): LanNhapBangLuong | undefined {
    return this.lanNhapSignal()[maKy];
  }

  /** Tổng theo từng khoản của cả kỳ (hoặc của một đơn vị) — dòng `Tổng` cuối bảng và mẫu số §8. */
  tongTheoKhoan(dong: readonly DongBangLuong[]): Record<string, number> {
    const kq: Record<string, number> = {};
    for (const k of KHOAN_MUC_LUONG) {
      kq[k.ma] = dong.reduce((sum, d) => sum + (d.khoan[k.ma] ?? 0), 0);
    }
    return kq;
  }

  // ------------------------------------------------------------------- import

  phanTichFile(maKy: string, noiDung: string): ImportDongPreview[] {
    const soCot = BM0_LUONG_COT_DAU.length + KHOAN_MUC_LUONG.length;
    const raws = docFilePhanCach(noiDung, soCot);
    const daThay = new Set<string>();

    return raws.map((o, i) => {
      const vanDe: ImportVanDe[] = [];
      const maNhanVien = (o[0] ?? '').trim();
      const hoTen = (o[1] ?? '').trim();

      if (!maNhanVien) {
        vanDe.push({ mucDo: 'LOI', moTa: 'Thiếu mã nhân viên.' });
      } else if (!this.danhMuc.theoMa('nhan-vien', maNhanVien)) {
        vanDe.push({
          mucDo: 'LOI',
          moTa: `Mã NV ${maNhanVien} không có trong danh mục Nhân viên.`,
          xuLy: 'Thêm vào danh mục',
        });
      }

      if (maNhanVien && daThay.has(maNhanVien)) {
        vanDe.push({ mucDo: 'LOI', moTa: `Mã NV ${maNhanVien} xuất hiện hai lần trong file.` });
      }
      if (maNhanVien) daThay.add(maNhanVien);

      const cong = Number((o[3] ?? '').replace(',', '.'));
      if (!Number.isFinite(cong) || cong <= 0) {
        // Mẫu số bằng 0 hoặc không đọc được là LỖI CHẶN, không phải cảnh báo: dòng đó lọt vào thì
        // mọi phép phân bổ của người này ra `NaN` hoặc `Infinity`, và nó chỉ lộ ra ở báo cáo cuối.
        vanDe.push({ mucDo: 'LOI', moTa: `Công tính lương "${o[3] ?? ''}" không hợp lệ.` });
      }

      for (let k = 0; k < KHOAN_MUC_LUONG.length; k++) {
        const tho = (o[BM0_LUONG_COT_DAU.length + k] ?? '').replace(/[.\s]/g, '').replace(',', '.');
        if (tho && !Number.isFinite(Number(tho))) {
          vanDe.push({
            mucDo: 'LOI',
            moTa: `Khoản "${KHOAN_MUC_LUONG[k].tenNgan}" không phải số: "${o[BM0_LUONG_COT_DAU.length + k]}".`,
          });
        }
      }

      return {
        soDong: i + 2,
        khoa: maNhanVien || '—',
        nhan: hoTen || '—',
        vanDe,
        hopLe: !vanDe.some((v) => v.mucDo === 'LOI'),
        duLieu: Object.fromEntries(o.map((v, k) => [String(k), v])),
      };
    });
  }

  /** Ghi các dòng hợp lệ — **đè cả kỳ**, cùng lý do đã ghi ở `bang-cong.service.ts`. */
  importRows(
    maKy: string,
    preview: readonly ImportDongPreview[],
    tenFile: string,
    actor: string,
  ): number {
    if (!this.ky.choGhi(maKy)) return -1;

    const moi: DongBangLuong[] = [];
    for (const dong of preview) {
      if (!dong.hopLe) continue;
      const o = dong.duLieu ?? {};
      const cell = (i: number) => (o[String(i)] ?? '').trim();

      const khoan: Record<string, number> = {};
      KHOAN_MUC_LUONG.forEach((k, i) => {
        const tho = cell(BM0_LUONG_COT_DAU.length + i).replace(/[.\s]/g, '').replace(',', '.');
        // Ô trống ⇒ khoản VẮNG MẶT, không phải 0 — xem chú thích `DongBangLuong.khoan`.
        if (tho !== '') khoan[k.ma] = Number(tho);
      });

      moi.push({
        id: `${maKy}-${dong.khoa}`,
        kyId: maKy,
        maNhanVien: dong.khoa,
        hoTen: cell(1),
        donVi: cell(2),
        congTinhLuong: Number(cell(3).replace(',', '.')),
        khoan,
      });
    }

    this.rowsSignal.update((prev) => [...prev.filter((r) => r.kyId !== maKy), ...moi]);
    this.lanNhapSignal.update((prev) => ({
      ...prev,
      [maKy]: { kyId: maKy, tenFile, soDong: moi.length, nhapLuc: nowStamp(), nhapBoi: actor },
    }));
    return moi.length;
  }

  fileMau(maKy: string): string {
    const header = [...BM0_LUONG_COT_DAU, ...KHOAN_MUC_LUONG.map((k) => k.ma)];
    const mau = this.theoKy(maKy)[0];
    if (!mau) return `${header.join(',')}\n`;
    const dong = [
      mau.maNhanVien,
      mau.hoTen,
      mau.donVi,
      String(mau.congTinhLuong),
      ...KHOAN_MUC_LUONG.map((k) => (mau.khoan[k.ma] === undefined ? '' : String(mau.khoan[k.ma]))),
    ];
    return `${header.join(',')}\n${dong.join(',')}\n`;
  }
}
