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
import { KHOI_OPTIONS } from '../../core/models/hr/don-vi';
import { DongBangCong, soCong } from '../../core/models/hr/bang-cong';
import { KY_TRANG_THAI_COLOR, KY_TRANG_THAI_LABEL, nhanKy, ngayTrongKy } from '../../core/models/hr/ky';
import { BangCongService } from '../../core/services/hr/bang-cong.service';
import { KyService } from '../../core/services/hr/ky.service';
import { QuyenHrService } from '../../core/services/hr/quyen-hr.service';
import { exportCsv, exportTableToXls } from '../../core/utils/export-bieu-mau';
import { HrImportPreview } from '../../shared/hr/import-preview/import-preview';
import { ImportDongPreview, demTheoMuc } from '../../shared/hr/import-preview/import-preview.model';
import { HrPageCard } from '../../shared/hr/page-card/page-card';
import { HrTrangThaiTag } from '../../shared/hr/trang-thai-tag/trang-thai-tag';

/**
 * **Bảng công tháng BM0** — artboard 22, cùng hai lớp phủ 21B (xác nhận đè cả kỳ) và 21C (đang
 * nhập). Kế hoạch §6.2, §6.6, §6.7.
 *
 * ## Màn này CHỈ ĐỌC — và đó là điểm nghiệp vụ, không phải thiếu tính năng
 *
 * Không có nút sửa ô, không có nút thêm dòng. Đây là số của HRM/SAP; sửa được từng ô nghĩa là số
 * trên màn không còn là số HRM, và mọi đối chiếu sau đó vô nghĩa. Muốn sửa thì **import đè cả kỳ**,
 * và hệ thống phải hỏi rõ *"đè cả kỳ"* chứ không merge từng dòng.
 *
 * ## Bảng ma trận tự dựng, không dùng `UbckTable`
 *
 * Số cột đổi theo tháng (28–31 cột ngày), mỗi ô cần lớp riêng theo ký hiệu, và hàng tiêu đề có hai
 * tầng (số ngày + thứ). `ColumnDefinition[]` dựng được nhưng phải sinh 31 `customTemplate` — mỗi
 * cái là một `TemplateRef` phải khai ở template và `viewChild` ở đây. Bảng HTML thuần rẻ hơn hẳn,
 * và nhịp kích thước vẫn khớp bản đã build nhờ `--vht-built-*` (xem `.scss`).
 *
 * ## Bẫy lịch tháng — đã ghi trong `README.md` của bộ mockup
 *
 * Cột ngày dựng từ `ngayTrongKy(maKy)`, **không** phải mảng 31 cố định. Xếp dữ liệu vào ngày cuối
 * tuần thì luật cuối tuần thắng, ô bị nuốt, bảng **trông vẫn đẹp nhưng tổng công sai** — không
 * checker nào bắt được.
 */
@Component({
  selector: 'app-hr-bang-cong',
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
  templateUrl: './hr-bang-cong.html',
  styleUrl: './hr-bang-cong.scss',
})
export class HrBangCongPage {
  private readonly service = inject(BangCongService);
  private readonly kyService = inject(KyService);
  private readonly quyen = inject(QuyenHrService);
  private readonly auth = inject(AuthService);
  private readonly toast = inject(ToastService);

  readonly duocNhap = this.quyen.nhapBM0;

  readonly maKy = signal(this.kyService.macDinh());
  readonly khoiFilter = signal<string | null>(null);
  readonly donViFilter = signal<string | null>(null);
  readonly tuKhoa = signal('');

  readonly kyOptions = computed(() =>
    this.kyService.chonDuoc().map((k) => ({ value: k.maKy, label: nhanKy(k.maKy) })),
  );
  readonly khoiOptions = KHOI_OPTIONS.map((v) => ({ value: v, label: v }));

  readonly ky = computed(() => this.kyService.get(this.maKy()));
  readonly daKhoa = computed(() => this.ky()?.trangThai === 'DA_KHOA');
  readonly nhanKyHienTai = computed(() => nhanKy(this.maKy()));

  readonly nhanTrangThaiKy = computed(() => {
    const k = this.ky();
    return k ? KY_TRANG_THAI_LABEL[k.trangThai] : '—';
  });

  readonly mauTrangThaiKy = computed(() => {
    const k = this.ky();
    return k ? KY_TRANG_THAI_COLOR[k.trangThai] : 'default';
  });

  readonly ngay = computed(() => ngayTrongKy(this.maKy()));
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
    const khoi = this.khoiFilter();
    const donVi = this.donViFilter();
    return this.tatCa().filter((r) => {
      if (khoi && r.khoi !== khoi) return false;
      if (donVi && r.donVi !== donVi) return false;
      if (!q) return true;
      return (
        r.maNhanVien.toLocaleLowerCase('vi').includes(q) ||
        r.hoTen.toLocaleLowerCase('vi').includes(q)
      );
    });
  });

  readonly soCong = soCong;

  /**
   * Lớp CSS của một ô — ba trạng thái, đúng chú giải của artboard 22.
   *
   * Ô cuối tuần **không** đọc dữ liệu: nếu file có ký hiệu ở T7/CN thì đó là ca cần soi riêng, và
   * hiện nó lẫn vào ô thường sẽ làm người đọc tưởng đó là ngày làm việc.
   */
  lopO(row: DongBangCong, ngay: number, cuoiTuan: boolean): string {
    if (cuoiTuan) return 'hr-o hr-o--cuoituan';
    const o = row.o[ngay];
    if (!o) return 'hr-o';
    return this.service.khoaO(o.kyHieu) ? 'hr-o hr-o--khoa' : 'hr-o';
  }

  chuO(row: DongBangCong, ngay: number, cuoiTuan: boolean): string {
    if (cuoiTuan) return '';
    return row.o[ngay]?.kyHieu ?? '';
  }

  /** Tooltip nêu số giờ — file gốc ghi `X:8`, màn hiện ký hiệu, giờ nằm ở tooltip. */
  chuThichO(row: DongBangCong, ngay: number): string {
    const o = row.o[ngay];
    return o ? `${o.kyHieu}:${o.soGio} — ${o.soGio} giờ` : '';
  }

  private actor(): string {
    return this.auth.user()?.hoTen ?? 'Người dùng demo';
  }

  // ------------------------------------------------------------------- xuất

  xuatExcel(): void {
    const ngay = this.ngay();
    exportTableToXls(
      this.rows(),
      [
        { header: 'Mã NV', value: (r) => r.maNhanVien },
        { header: 'Họ và tên', value: (r) => r.hoTen },
        { header: 'Chức danh', value: (r) => r.chucDanh },
        { header: 'Khối', value: (r) => r.khoi },
        { header: 'Đơn vị', value: (r) => r.donVi },
        ...ngay.map((d) => ({
          header: String(d.ngay),
          value: (r: DongBangCong) => {
            const o = r.o[d.ngay];
            return o ? `${o.kyHieu}:${o.soGio}` : '';
          },
        })),
        { header: 'Công tính lương', value: (r) => soCong(r.congTinhLuong) },
      ],
      `bang-cong-${this.maKy()}`,
      `Bảng công tháng — ${this.nhanKyHienTai()}`,
    );
  }

  // ----------------------------------------------------------------- import

  readonly importMo = signal(false);
  readonly importPreview = signal<ImportDongPreview[]>([]);
  readonly importTenFile = signal('');
  readonly importLoiDoc = signal<string | null>(null);

  /** Câu cảnh báo ở chân hộp thoại — nêu SỐ dòng sắp bị đè, không nói chung chung. */
  readonly canhBaoChan = computed(() => {
    const dangCo = this.tatCa().length;
    if (!dangCo) return '';
    return `Kỳ ${this.maKy()} đang có ${dangCo} dòng — nhập lại sẽ ĐÈ CẢ KỲ, không ghép từng dòng.`;
  });

  moImport(): void {
    // Chốt chặn thứ nhất: kỳ đã khoá thì không mở được hộp thoại. Chốt thứ hai ở service.
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
    exportCsv(this.service.fileMau(this.maKy()), `mau-bm0-bang-cong-${this.maKy()}`);
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

  // ------------------------------------------------- xác nhận đè + tiến trình

  readonly deMo = signal(false);
  readonly deHieu = signal(false);
  readonly dangNhap = signal(false);
  readonly tienDo = signal(0);

  readonly soHopLe = computed(() => demTheoMuc(this.importPreview()).hopLe);

  /**
   * Bấm "Nhập" ở hộp preview.
   *
   * Kỳ **đang có dữ liệu** ⇒ chen thêm một hộp xác nhận phá huỷ (artboard 21B) trước khi ghi. Kỳ
   * rỗng thì ghi thẳng — bắt xác nhận "đè" khi không có gì để đè là hộp thoại vô nghĩa, và hộp
   * thoại vô nghĩa dạy người dùng bấm qua mà không đọc.
   */
  xacNhanNhap(): void {
    if (this.tatCa().length) {
      this.deHieu.set(false);
      this.deMo.set(true);
      return;
    }
    void this.ghiDuLieu();
  }

  huyDe(): void {
    this.deMo.set(false);
  }

  xacNhanDe(): void {
    if (!this.deHieu()) return;
    this.deMo.set(false);
    void this.ghiDuLieu();
  }

  /**
   * Ghi dữ liệu kèm lớp phủ tiến trình (artboard 21C).
   *
   * Tiến trình dùng thanh **xác định**, không phải spinner: nó nói cho người dùng biết còn bao lâu,
   * và ảnh chụp tĩnh của một spinner chỉ ra một cung tròn cụt. Ở tầng mock, các bước tiến trình là
   * mô phỏng — khi có backend thì thay bằng tiến trình thật của API, giữ nguyên phần vỏ.
   */
  private async ghiDuLieu(): Promise<void> {
    this.importMo.set(false);
    this.dangNhap.set(true);
    this.tienDo.set(0);

    for (let i = 1; i <= 5; i++) {
      await new Promise((r) => setTimeout(r, 120));
      this.tienDo.set(i * 20);
    }

    const so = this.service.importRows(
      this.maKy(),
      this.importPreview(),
      this.importTenFile() || 'file-nhap.csv',
      this.actor(),
    );
    this.dangNhap.set(false);

    if (so < 0) {
      // Kỳ bị khoá ở giữa chừng (tab khác). Nói rõ hệ thống đã KHÔNG ghi gì — im lặng ở đây là
      // người dùng tưởng đã nhập xong.
      this.toast.error(`Kỳ ${this.maKy()} đã khoá trong lúc nhập. Không có dòng nào được ghi.`);
      return;
    }
    this.toast.success(`Đã nhập ${so} dòng vào bảng công ${this.nhanKyHienTai()}.`);
  }
}
