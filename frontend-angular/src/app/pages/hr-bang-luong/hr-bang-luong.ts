import { Component, computed, inject, signal } from '@angular/core';

import {
  CmmButtonComponent,
  CmmCheckboxComponent,
  CmmDialogComponent,
  CmmInputText,
  CmmSelectComponent,
  ToastService,
} from '@khcn-core/ui';

import { AuthService } from '../../core/auth/auth.service';
import {
  DongBangLuong,
  KHOAN_MUC_LUONG,
  tongDongLuong,
} from '../../core/models/hr/bang-luong';
import { soCong } from '../../core/models/hr/bang-cong';
import { formatTien } from '../../core/models/hr/nhiem-vu';
import { nhanKy } from '../../core/models/hr/ky';
import { BangCongService } from '../../core/services/hr/bang-cong.service';
import { BangLuongService } from '../../core/services/hr/bang-luong.service';
import { KyService } from '../../core/services/hr/ky.service';
import { QuyenHrService } from '../../core/services/hr/quyen-hr.service';
import { exportCsv, exportTableToXls } from '../../core/utils/export-bieu-mau';
import { HrImportPreview } from '../../shared/hr/import-preview/import-preview';
import { ImportDongPreview, demTheoMuc } from '../../shared/hr/import-preview/import-preview.model';
import { HrPageCard } from '../../shared/hr/page-card/page-card';
import { HrTrangThaiTag } from '../../shared/hr/trang-thai-tag/trang-thai-tag';

/**
 * **Bảng lương tháng BM0** — artboard 23 (vai trò HR) và 24 (vai trò PA). Kế hoạch §7.
 *
 * ## MỘT màn, hai hình dạng — và đó là điểm nghiệp vụ chính
 *
 * Artboard 23 và 24 **không phải hai màn**: cùng route, cùng component, khác nhau ở quyền. Ma trận
 * quyền của khách (§7.2) cho **chỉ HR** xem và xuất dữ liệu lương.
 *
 * **Fail-closed nghĩa là KHÔNG RENDER**, không phải render rồi chặn khi bấm. Trong template, toàn
 * bộ cột tiền nằm trong `@if (xemCotTien())` — không có quyền thì các `<td>` ấy **không tồn tại
 * trong DOM**. Nghiệm thu phải soi DOM chứ không nhìn bằng mắt (§14 mục 11): đăng nhập tài khoản PA
 * rồi tìm chuỗi tiền trong HTML — không được có.
 *
 * ⚠ **Đừng nghiệm thu bằng tài khoản admin.** Admin thấy mọi thứ (xem `QuyenHrService.laAdmin`),
 * nên soi fail-closed trên admin thì luôn thấy đủ cột và tưởng là đúng.
 *
 * ## Bảng lương chỉ import, chỉ đọc
 *
 * BRD giới hạn rõ: *"không xử lý lương chi tiết"*. Việc duy nhất của dữ liệu này là làm **tử số**
 * của công thức phân bổ CPNC (§4.1) — 14 khoản mục, chia pro-rata **từng khoản**, không nhân vào
 * tổng rồi chia ngược.
 */
@Component({
  selector: 'app-hr-bang-luong',
  imports: [
    CmmButtonComponent,
    CmmCheckboxComponent,
    CmmDialogComponent,
    CmmInputText,
    CmmSelectComponent,
    HrImportPreview,
    HrPageCard,
    HrTrangThaiTag,
  ],
  templateUrl: './hr-bang-luong.html',
  styleUrl: './hr-bang-luong.scss',
})
export class HrBangLuongPage {
  private readonly service = inject(BangLuongService);
  private readonly bangCong = inject(BangCongService);
  private readonly kyService = inject(KyService);
  private readonly quyen = inject(QuyenHrService);
  private readonly auth = inject(AuthService);
  private readonly toast = inject(ToastService);

  readonly xemCotTien = this.quyen.xemCotTien;
  readonly duocXuat = this.quyen.xuatBangLuong;
  readonly duocNhap = this.quyen.nhapBM0;
  readonly nhanVaiTro = this.quyen.nhanVaiTro;
  readonly vaiTroChuaBiet = this.quyen.vaiTroChuaBiet;

  readonly khoanMuc = KHOAN_MUC_LUONG;
  readonly formatTien = formatTien;
  readonly soCong = soCong;

  readonly maKy = signal(this.kyService.macDinh());
  readonly donViFilter = signal<string | null>(null);
  readonly tuKhoa = signal('');

  readonly kyOptions = computed(() =>
    this.kyService.chonDuoc().map((k) => ({ value: k.maKy, label: nhanKy(k.maKy) })),
  );

  readonly nhanKyHienTai = computed(() => nhanKy(this.maKy()));
  readonly daKhoa = computed(() => this.kyService.daKhoa(this.maKy()));
  readonly lanNhap = computed(() => this.service.lanNhap(this.maKy()));

  readonly tatCa = computed(() => this.service.theoKy(this.maKy()));

  readonly donViOptions = computed(() =>
    [...new Set(this.tatCa().map((r) => r.donVi))]
      .filter(Boolean)
      .sort((a, b) => a.localeCompare(b, 'vi'))
      .map((v) => ({ value: v, label: v })),
  );

  readonly rows = computed(() => {
    const q = this.tuKhoa().trim().toLocaleLowerCase('vi');
    const donVi = this.donViFilter();
    return this.tatCa().filter((r) => {
      if (donVi && r.donVi !== donVi) return false;
      if (!q) return true;
      return (
        r.maNhanVien.toLocaleLowerCase('vi').includes(q) ||
        r.hoTen.toLocaleLowerCase('vi').includes(q)
      );
    });
  });

  readonly tongTheoKhoan = computed(() => this.service.tongTheoKhoan(this.rows()));

  readonly tongCong = computed(() =>
    this.rows().reduce((sum, r) => sum + tongDongLuong(r), 0),
  );

  readonly tongCongTinhLuong = computed(() =>
    this.rows().reduce((sum, r) => sum + r.congTinhLuong, 0),
  );

  /**
   * Công **đã phân bổ** của từng người trong kỳ.
   *
   * Đợt 2 chưa có `PhanBoCong`, nên con số này còn là `0` — và màn hiện đúng `0` kèm cảnh báo
   * *"còn N công chưa phân bổ"*, chứ **không** bịa số cho đẹp. Đợt 3 nối vào đây; chữ ký hàm giữ
   * nguyên để trang không phải sửa.
   */
  congDaPhanBo(_maNhanVien: string): number {
    return 0;
  }

  tongDong(r: DongBangLuong): number {
    return tongDongLuong(r);
  }

  /** Ô khoản mục vắng mặt hiện `—`, KHÔNG phải `0` — hai thứ khác nghĩa. Xem `DongBangLuong.khoan`. */
  oKhoan(r: DongBangLuong, ma: string): string {
    const v = r.khoan[ma];
    return v === undefined ? '—' : formatTien(v);
  }

  /** Tổng một khoản; khoản không ai có ⇒ `—`, cùng cách hiện với ô người. */
  oTongKhoan(ma: string): string {
    const coAi = this.rows().some((r) => r.khoan[ma] !== undefined);
    return coAi ? formatTien(this.tongTheoKhoan()[ma]) : '—';
  }

  /** Cảnh báo phân bổ cho vai trò không xem được tiền — thay cho cột tiền, không phải thêm vào. */
  trangThaiPhanBo(r: DongBangLuong): { nhan: string; loai: 'success' | 'warning' } {
    const con = r.congTinhLuong - this.congDaPhanBo(r.maNhanVien);
    return con <= 0.001
      ? { nhan: 'Đã phân bổ đủ', loai: 'success' }
      : { nhan: `Còn ${soCong(con)} công chưa phân bổ`, loai: 'warning' };
  }

  private actor(): string {
    return this.auth.user()?.hoTen ?? 'Người dùng demo';
  }

  // ------------------------------------------------------------------- xuất

  /**
   * Xuất BM3.1 / BM3.2.
   *
   * Kiểm quyền **lại ở đây** dù nút đã ẩn khi không có quyền: nút ẩn là lớp UI, còn hàm này là chỗ
   * dữ liệu thật sự rời khỏi màn hình. Hai lớp cho cùng một luật là đúng với fail-closed.
   */
  xuatExcel(): void {
    if (!this.duocXuat()) {
      this.toast.error('Bạn không có quyền xuất bảng lương. Chỉ vai trò Nhân sự (HR) được xuất.');
      return;
    }
    exportTableToXls(
      this.rows(),
      [
        { header: 'Mã NV', value: (r) => r.maNhanVien },
        { header: 'Họ và tên', value: (r) => r.hoTen },
        { header: 'Đơn vị', value: (r) => r.donVi },
        { header: 'Công tính lương', value: (r) => soCong(r.congTinhLuong) },
        ...KHOAN_MUC_LUONG.map((k) => ({
          header: k.ten,
          value: (r: DongBangLuong) => (r.khoan[k.ma] === undefined ? '' : r.khoan[k.ma]),
        })),
        { header: 'CỘNG', value: (r) => tongDongLuong(r) },
      ],
      `bang-luong-${this.maKy()}`,
      `Bảng lương tháng — ${this.nhanKyHienTai()}`,
    );
  }

  // ----------------------------------------------------------------- import

  readonly importMo = signal(false);
  readonly importPreview = signal<ImportDongPreview[]>([]);
  readonly importTenFile = signal('');
  readonly importLoiDoc = signal<string | null>(null);

  readonly canhBaoChan = computed(() => {
    const dangCo = this.tatCa().length;
    if (!dangCo) return '';
    return `Kỳ ${this.maKy()} đang có ${dangCo} dòng — nhập lại sẽ ĐÈ CẢ KỲ, không ghép từng dòng.`;
  });

  readonly soHopLe = computed(() => demTheoMuc(this.importPreview()).hopLe);

  moImport(): void {
    if (this.daKhoa()) {
      this.toast.error(`Kỳ ${this.maKy()} đã khoá. Mở lại kỳ ở màn Kỳ chấm công trước khi nhập.`);
      return;
    }
    this.importPreview.set([]);
    this.importTenFile.set('');
    this.importLoiDoc.set(null);
    this.importMo.set(true);
  }

  taiFileMau(): void {
    exportCsv(this.service.fileMau(this.maKy()), `mau-bm0-bang-luong-${this.maKy()}`);
  }

  chonFile(file: File): void {
    this.importTenFile.set(file.name);
    this.importLoiDoc.set(null);
    const reader = new FileReader();
    reader.onload = () => {
      const preview = this.service.phanTichFile(this.maKy(), String(reader.result ?? ''));
      if (!preview.length) {
        this.importLoiDoc.set('File không có dòng dữ liệu nào ngoài hàng tiêu đề.');
        this.importPreview.set([]);
        return;
      }
      this.importPreview.set(preview);
    };
    reader.onerror = () => this.importLoiDoc.set('Không đọc được nội dung file.');
    reader.readAsText(file, 'utf-8');
  }

  readonly deMo = signal(false);
  readonly deHieu = signal(false);

  xacNhanNhap(): void {
    if (this.tatCa().length) {
      this.deHieu.set(false);
      this.deMo.set(true);
      return;
    }
    this.ghiDuLieu();
  }

  huyDe(): void {
    this.deMo.set(false);
  }

  xacNhanDe(): void {
    if (!this.deHieu()) return;
    this.deMo.set(false);
    this.ghiDuLieu();
  }

  private ghiDuLieu(): void {
    this.importMo.set(false);
    const so = this.service.importRows(
      this.maKy(),
      this.importPreview(),
      this.importTenFile() || 'file-nhap.csv',
      this.actor(),
    );
    if (so < 0) {
      this.toast.error(`Kỳ ${this.maKy()} đã khoá trong lúc nhập. Không có dòng nào được ghi.`);
      return;
    }
    this.toast.success(`Đã nhập ${so} dòng vào bảng lương ${this.nhanKyHienTai()}.`);
  }

  /** Số người của kỳ trong bảng công — dùng để đối chiếu hai bảng có khớp danh sách không. */
  readonly soNguoiBangCong = computed(() => this.bangCong.theoKy(this.maKy()).length);
}
