import { Injectable, computed, inject, signal } from '@angular/core';

import { DanhMucRow } from '../../models/hr/danh-muc';
import {
  DongBangCong,
  LanNhapBangCong,
  docOCong,
  dungBangCong,
  tongCongTuO,
} from '../../models/hr/bang-cong';
import { KY_MAC_DINH, ngayTrongKy } from '../../models/hr/ky';
import { DanhMucService } from './danh-muc.service';
import { KyService } from './ky.service';
import {
  ImportDongPreview,
  ImportVanDe,
  docFilePhanCach,
} from '../../../shared/hr/import-preview/import-preview.model';

/**
 * Signal store in-memory cho **bảng công tháng BM0** — cùng khuôn `NhiemVuService`.
 *
 * ## Bộ luật import ở đây là bộ BM0, KHÔNG phải bộ `PhanBoCong`
 *
 * Kế hoạch §6.6 liệt kê hai bộ luật **khác hẳn nhau** và cảnh báo đừng trộn. Bộ ở file này (BM0 /
 * dữ liệu HRM):
 *
 * | Luật | Xử lý |
 * |---|---|
 * | Mã NV không có trong danh mục Nhân viên | **Chặn dòng** |
 * | Đơn vị cấp 5 không khớp cây đơn vị | **Chặn dòng** |
 * | Ký hiệu công lạ (ngoài danh mục `KyHieuCong`) | **Cảnh báo cho qua**, ghi "chờ khai báo" |
 * | `Công tính lương` ≠ tổng ô trong tháng | **Cảnh báo** — file HRM có thể có điều chỉnh tay |
 * | Import lại kỳ đã có | Hỏi rõ **đè cả kỳ**, không merge từng dòng |
 * | Kỳ đã khoá | **Chặn** |
 *
 * Bộ cho `PhanBoCong` (đợt 3) là: người không thuộc nội dung CV · nhiệm vụ không ở trạng thái
 * *Đang phân bổ* · trùng `(người, ngày)` · vượt `congTinhLuong` của kỳ. Đừng gọi nhầm hàm.
 *
 * ## Import là ĐÈ CẢ KỲ
 *
 * `importRows` **xoá sạch dòng của kỳ đó rồi ghi lại**, không ghép từng dòng. Đó là yêu cầu của
 * khách, và nó là lý do màn hình phải hỏi bằng một hộp xác nhận nêu rõ số dòng sắp mất trước khi
 * gọi hàm này.
 */

function nowStamp(): string {
  const d = new Date();
  const pad = (n: number) => String(n).padStart(2, '0');
  return `${pad(d.getDate())}/${pad(d.getMonth() + 1)} ${pad(d.getHours())}:${pad(d.getMinutes())}`;
}

/** Cột của file BM0 trước phần ma trận ngày. Phần sau là N cột ngày, đúng số ngày của tháng. */
export const BM0_CONG_COT_DAU = ['maNhanVien', 'hoTen', 'chucDanh', 'khoi', 'donVi'] as const;

@Injectable({ providedIn: 'root' })
export class BangCongService {
  private readonly danhMuc = inject(DanhMucService);
  private readonly ky = inject(KyService);

  private readonly rowsSignal = signal<DongBangCong[]>([]);
  private readonly lanNhapSignal = signal<Record<string, LanNhapBangCong>>({});

  readonly rows = this.rowsSignal.asReadonly();

  constructor() {
    // Seed cho kỳ mặc định: dựng từ danh mục Nhân viên + danh mục Ký hiệu công, không khai lại
    // danh sách người lần thứ ba. Chỉ seed MỘT kỳ — các kỳ khác rỗng cho tới khi HR import, đúng
    // như thực tế và đủ để màn "chưa có dữ liệu" có đường chạy.
    this.rowsSignal.set(
      dungBangCong(
        KY_MAC_DINH,
        ngayTrongKy(KY_MAC_DINH),
        this.danhMuc.list('nhan-vien').map((r) => ({
          ma: r.ma,
          ten: r.ten,
          chucDanh: String(r['chucDanh'] ?? ''),
          donVi: String(r['donVi'] ?? ''),
          khoi: String(r['khoi'] ?? ''),
        })),
        (kyHieu) => this.tinhCong(kyHieu),
      ),
    );
    this.lanNhapSignal.set({
      [KY_MAC_DINH]: {
        kyId: KY_MAC_DINH,
        tenFile: 'BM0_BangCong_T05_2025.xlsx',
        soDong: this.rowsSignal().length,
        nhapLuc: '02/06 08:15',
        nhapBoi: 'Nguyễn Thu Hà (HR)',
      },
    });
  }

  theoKy(maKy: string): DongBangCong[] {
    return this.rowsSignal().filter((r) => r.kyId === maKy);
  }

  lanNhap(maKy: string): LanNhapBangCong | undefined {
    return this.lanNhapSignal()[maKy];
  }

  /** Dòng của một người trong một kỳ — đợt 3 gọi để lấy mẫu số và các ô bị khoá. */
  cua(maKy: string, maNhanVien: string): DongBangCong | undefined {
    return this.rowsSignal().find((r) => r.kyId === maKy && r.maNhanVien === maNhanVien);
  }

  /** Ký hiệu này có tính vào công tính lương không — đọc từ danh mục, không khai cứng. */
  tinhCong(kyHieu: string): boolean {
    const row = this.danhMuc.theoMa('ky-hieu-cong', kyHieu);
    return row?.['tinhCong'] === true;
  }

  /**
   * Ký hiệu này khoá ô chấm công không.
   *
   * `true` cũng cho ký hiệu **không có trong danh mục**: ô mang ký hiệu chưa ai khai thì không biết
   * nó có được chấm hay không, và đoán "được" là cách để một ngày nghỉ lọt vào bảng phân bổ. Đợt 3
   * đọc hàm này cho luật khoá ô §6.4.
   */
  khoaO(kyHieu: string): boolean {
    const row = this.danhMuc.theoMa('ky-hieu-cong', kyHieu);
    if (!row) return true;
    return row['khoaO'] !== false;
  }

  // ------------------------------------------------------------------- import

  /**
   * Đọc file và chấm điểm từng dòng — **không ghi gì**. Bộ luật: xem bảng ở chú thích lớp.
   *
   * Số cột ngày lấy theo **kỳ đang nhập**, không phải 31 cố định: file tháng 2 có 28 cột, và đọc
   * thừa ba cột thì ba ô cuối thành ký hiệu rác.
   */
  phanTichFile(maKy: string, noiDung: string): ImportDongPreview[] {
    const ngay = ngayTrongKy(maKy);
    const soCot = BM0_CONG_COT_DAU.length + ngay.length + 1; // +1: cột Công tính lương
    const raws = docFilePhanCach(noiDung, soCot);
    const daThay = new Set<string>();

    return raws.map((o, i) => {
      const vanDe: ImportVanDe[] = [];
      const maNhanVien = (o[0] ?? '').trim();
      const hoTen = (o[1] ?? '').trim();
      const donVi = (o[4] ?? '').trim();

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

      // Đơn vị đối chiếu theo TÊN đơn vị cấp 5 của danh mục Nhân viên. Chuỗi trong file BM0 có dạng
      // `"<tên> - <mã>"`; `tachTenVaMaDonVi` là hàm dùng cho ca đó, ở đây file mẫu đã tách sẵn.
      if (donVi && !this.donViHopLe(donVi)) {
        vanDe.push({
          mucDo: 'LOI',
          moTa: `Đơn vị "${donVi}" không khớp cây đơn vị.`,
          xuLy: 'Đối chiếu cây',
        });
      }

      // Ký hiệu lạ ⇒ CẢNH BÁO CHO QUA, ghi "chờ khai báo". Đây là yêu cầu tường minh của khách,
      // không phải nới lỏng: file HRM có ký hiệu mới trước khi HR kịp khai danh mục.
      const laMoi = new Set<string>();
      let tongO = 0;
      for (let d = 0; d < ngay.length; d++) {
        const oCong = docOCong(o[BM0_CONG_COT_DAU.length + d] ?? '');
        if (!oCong) continue;
        if (!this.danhMuc.theoMa('ky-hieu-cong', oCong.kyHieu)) laMoi.add(oCong.kyHieu);
        else if (this.tinhCong(oCong.kyHieu)) tongO += oCong.soGio / 8;
      }
      for (const k of laMoi) {
        vanDe.push({
          mucDo: 'CANH_BAO',
          moTa: `Ký hiệu công lạ "${k}" — ngoài danh mục Ký hiệu công.`,
          xuLy: 'Ghi "chờ khai báo"',
        });
      }

      const congTho = (o[soCot - 1] ?? '').replace(',', '.').trim();
      const congTinhLuong = Number(congTho);
      if (congTho && Number.isFinite(congTinhLuong) && Math.abs(congTinhLuong - tongO) > 0.01) {
        vanDe.push({
          mucDo: 'CANH_BAO',
          moTa: `Công tính lương (${congTho}) ≠ tổng ô trong tháng (${tongO.toFixed(1)}).`,
          xuLy: 'Vẫn nhập, ghi log',
        });
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

  private donViHopLe(ten: string): boolean {
    return this.danhMuc.list('nhan-vien').some((r) => String(r['donVi'] ?? '') === ten);
  }

  /**
   * Ghi các dòng hợp lệ — **XOÁ SẠCH kỳ đó rồi ghi lại**, không merge.
   *
   * Trả về `-1` khi kỳ đã khoá thay vì ghi: đây là chốt chặn cuối. Màn hình đã phải chặn từ nút,
   * nhưng nếu lọt tới đây thì thà không ghi gì còn hơn sửa số của một kỳ đã trình ký.
   */
  importRows(
    maKy: string,
    preview: readonly ImportDongPreview[],
    tenFile: string,
    actor: string,
  ): number {
    if (!this.ky.choGhi(maKy)) return -1;

    const ngay = ngayTrongKy(maKy);
    const soCot = BM0_CONG_COT_DAU.length + ngay.length + 1;
    const moi: DongBangCong[] = [];

    for (const dong of preview) {
      if (!dong.hopLe) continue;
      const o = dong.duLieu ?? {};
      const cell = (i: number) => (o[String(i)] ?? '').trim();

      const oCong: Record<number, { kyHieu: string; soGio: number }> = {};
      for (let d = 0; d < ngay.length; d++) {
        const parsed = docOCong(cell(BM0_CONG_COT_DAU.length + d));
        if (parsed) oCong[ngay[d].ngay] = parsed;
      }

      const congTho = cell(soCot - 1).replace(',', '.');
      const congSo = Number(congTho);
      moi.push({
        id: `${maKy}-${dong.khoa}`,
        kyId: maKy,
        maNhanVien: dong.khoa,
        hoTen: cell(1),
        chucDanh: cell(2),
        khoi: cell(3),
        donVi: cell(4),
        o: oCong,
        // File thiếu cột tổng thì tính lại từ ô — đừng để `NaN` vào mẫu số của công thức CPNC.
        congTinhLuong: Number.isFinite(congSo) && congTho ? congSo : tongCongTuO(oCong, (k) => this.tinhCong(k)),
      });
    }

    this.rowsSignal.update((prev) => [...prev.filter((r) => r.kyId !== maKy), ...moi]);
    this.lanNhapSignal.update((prev) => ({
      ...prev,
      [maKy]: { kyId: maKy, tenFile, soDong: moi.length, nhapLuc: nowStamp(), nhapBoi: actor },
    }));
    return moi.length;
  }

  /** Nội dung file mẫu `.csv` — tiêu đề + một dòng dựng từ chính dữ liệu đang có của kỳ. */
  fileMau(maKy: string): string {
    const ngay = ngayTrongKy(maKy);
    const header = [...BM0_CONG_COT_DAU, ...ngay.map((d) => String(d.ngay)), 'congTinhLuong'];
    const mau = this.theoKy(maKy)[0];
    if (!mau) return `${header.join(',')}\n`;
    const dong = [
      mau.maNhanVien,
      mau.hoTen,
      mau.chucDanh,
      mau.khoi,
      mau.donVi,
      ...ngay.map((d) => {
        const o = mau.o[d.ngay];
        return o ? `${o.kyHieu}:${o.soGio}` : '';
      }),
      String(mau.congTinhLuong),
    ];
    return `${header.join(',')}\n${dong.join(',')}\n`;
  }

  /** Danh mục người của một kỳ — `bang-luong.service` dựng seed từ đây, không khai lại. */
  readonly nguoiKyMacDinh = computed(() =>
    this.theoKy(KY_MAC_DINH).map((r) => ({
      maNhanVien: r.maNhanVien,
      hoTen: r.hoTen,
      donVi: r.donVi,
      congTinhLuong: r.congTinhLuong,
    })),
  );
}
