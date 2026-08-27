import { Component, TemplateRef, computed, inject, signal, viewChild } from '@angular/core';

import {
  CmmButtonComponent,
  CmmCheckboxComponent,
  CmmDialogComponent,
  CmmInputText,
  CmmSelectComponent,
  CmmTextareaDirective,
  ColumnDefinition,
  PaginatorProps,
  ToastService,
  UBCKPaginatorModule,
  UBCKPaginatorState,
  UBCKTableModule,
} from '@khcn-core/ui';

import { AuthService } from '../../core/auth/auth.service';
import {
  KY_HANH_DONG_COLOR,
  KY_HANH_DONG_LABEL,
  KY_TRANG_THAI_COLOR,
  KY_TRANG_THAI_LABEL,
  Ky,
  KyHanhDong,
  KyTrangThai,
  ngayTrongKy,
} from '../../core/models/hr/ky';
import { KyService } from '../../core/services/hr/ky.service';
import { QuyenHrService } from '../../core/services/hr/quyen-hr.service';
import { HrPageCard } from '../../shared/hr/page-card/page-card';
import { HrTrangThaiTag } from '../../shared/hr/trang-thai-tag/trang-thai-tag';
import { hrColumns } from '../../shared/hr/table-columns';
import { HR_PAGE_SIZE_MAC_DINH, hrPaginatorProps } from '../../shared/hr/paginator-props';

/**
 * **Kỳ chấm công** — artboard 20 + hộp thoại 21. Kế hoạch §6.1.
 *
 * Màn này nhỏ nhưng là **nền của cả đợt 2, 3, 4**: kỳ khoá bảng công, bảng lương và mọi báo cáo.
 *
 * ## Ba điều nghiệp vụ không được làm hời hợt
 *
 * 1. **Mở lại kỳ đã khoá bắt buộc nêu lý do**, và lý do đi thẳng vào nhật ký hiện ngay dưới bảng.
 *    Không có việc này thì số báo cáo đổi sau lưng người đã ký — và không ai truy được vì sao.
 * 2. **Hộp thoại mở lại kỳ nêu hậu quả bằng CHỮ và bằng SỐ** (bao nhiêu đơn vị đã chốt, đã trình ký
 *    VOffice chưa), cộng một ô tích xác nhận. Ramp brand ≡ danger của design system nên nút đỏ
 *    không nói lên rằng đây là thao tác phá huỷ.
 * 3. **Kỳ trả lương là cột riêng**, không suy ra từ kỳ lương — BM3.2 ghi rõ *"Kỳ lương 06/2025 -
 *    Kỳ trả 07/2025"*, và có tháng khách trả cùng kỳ.
 *
 * **Q2 còn treo với khách**: ai được mở lại kỳ đã khoá. Bản này giả định vai trò HR
 * (`QuyenHrService.moLaiKy`) — một chỗ sửa khi có câu trả lời.
 */
@Component({
  selector: 'app-hr-ky-list',
  imports: [
    UBCKTableModule,
    UBCKPaginatorModule,
    CmmButtonComponent,
    CmmCheckboxComponent,
    CmmDialogComponent,
    CmmInputText,
    CmmSelectComponent,
    CmmTextareaDirective,
    HrPageCard,
    HrTrangThaiTag,
  ],
  templateUrl: './hr-ky-list.html',
  styleUrl: './hr-ky-list.scss',
})
export class HrKyListPage {
  private readonly service = inject(KyService);
  private readonly quyen = inject(QuyenHrService);
  private readonly auth = inject(AuthService);
  private readonly toast = inject(ToastService);

  readonly duocMoLai = this.quyen.moLaiKy;

  readonly tuKhoa = signal('');
  readonly namFilter = signal<string | null>(null);
  readonly pageIndex = signal(1);
  readonly pageSize = signal(HR_PAGE_SIZE_MAC_DINH);

  readonly dem = this.service.demTheoTrangThai;

  readonly namOptions = computed(() =>
    [...new Set(this.service.rows().map((k) => k.maKy.slice(0, 4)))]
      .sort((a, b) => b.localeCompare(a))
      .map((v) => ({ value: v, label: `Năm ${v}` })),
  );

  readonly rows = computed(() => {
    const q = this.tuKhoa().trim().toLocaleLowerCase('vi');
    const nam = this.namFilter();
    return this.service.chonDuoc().filter((k) => {
      if (nam && !k.maKy.startsWith(nam)) return false;
      return !q || k.maKy.includes(q);
    });
  });

  readonly pagedRows = computed<Record<string, unknown>[]>(() => {
    const start = (this.pageIndex() - 1) * this.pageSize();
    return this.rows()
      .slice(start, start + this.pageSize())
      .map((k) => ({
        ...k,
        ky: k,
        _loai: k.loai === 'THANG' ? 'Tháng' : 'Quý',
        _tuNgay: ngay(k.tuNgay),
        _denNgay: ngay(k.denNgay),
        _soNgayCongChuan: k.soNgayCongChuan.toLocaleString('vi-VN', { minimumFractionDigits: 1 }),
        _kyTra: nhanThangNam(k.kyTra),
        _daChot: `${k.donViDaChot} / ${k.tongDonVi}`,
      }));
  });

  private readonly tplThaoTac = viewChild.required<TemplateRef<unknown>>('tplThaoTac');
  private readonly tplTrangThai = viewChild.required<TemplateRef<unknown>>('tplTrangThai');

  readonly columns = computed<ColumnDefinition[][]>(() =>
    hrColumns([
      {
        field: 'thaoTac',
        header: 'Thao tác',
        customTemplate: this.tplThaoTac(),
        minWidth: '160px',
        maxWidth: '160px',
      },
      {
        field: 'trangThai',
        header: 'Trạng thái',
        customTemplate: this.tplTrangThai(),
        minWidth: '140px',
        maxWidth: '140px',
      },
      { field: 'maKy', header: 'Mã kỳ', minWidth: '110px', maxWidth: '110px' },
      { field: '_loai', header: 'Loại', minWidth: '90px', maxWidth: '90px' },
      { field: '_tuNgay', header: 'Từ ngày', minWidth: '120px', maxWidth: '120px' },
      { field: '_denNgay', header: 'Đến ngày', minWidth: '120px', maxWidth: '120px' },
      {
        field: '_soNgayCongChuan',
        header: 'Ngày công chuẩn',
        minWidth: '150px',
        maxWidth: '150px',
      },
      { field: '_kyTra', header: 'Kỳ trả lương', minWidth: '140px', maxWidth: '140px' },
      { field: '_daChot', header: 'Đơn vị đã chốt', minWidth: '150px', maxWidth: '150px' },
    ]),
  );

  readonly tableProps = {
    isShowOrder: true,
    colOrderName: 'STT',
    scrollable: true,
    rowHover: true,
    dataKey: 'maKy',
  };

  readonly paginatorProps = computed<PaginatorProps>(() =>
    hrPaginatorProps(this.rows().length, this.pageIndex(), this.pageSize()),
  );

  doiTrang(state: UBCKPaginatorState): void {
    this.pageIndex.set(state.currentPage);
    this.pageSize.set(state.recordPerPage);
  }

  // -------------------------------------------------------------- nhật ký

  readonly nhatKy = this.service.nhatKy;

  nhanHanhDong(h: KyHanhDong): string {
    return KY_HANH_DONG_LABEL[h];
  }

  mauHanhDong(h: KyHanhDong) {
    return KY_HANH_DONG_COLOR[h];
  }

  nhanTrangThai(t: KyTrangThai): string {
    return KY_TRANG_THAI_LABEL[t];
  }

  mauTrangThai(t: KyTrangThai) {
    return KY_TRANG_THAI_COLOR[t];
  }

  private actor(): string {
    return this.auth.user()?.hoTen ?? 'Người dùng demo';
  }

  /** `2025-04-01` → `01/04/2025` — hộp thoại hiện ngày kiểu Việt, không phải ISO. */
  readonly ngayVN = ngay;

  // ---------------------------------------------------------------- vòng đời

  khoa(k: Ky): void {
    this.service.khoaKy(k.maKy, this.actor());
    this.toast.success(`Đã khoá kỳ ${k.maKy}. Bảng công và bảng lương của kỳ này không sửa được nữa.`);
  }

  readonly moLaiTarget = signal<Ky | null>(null);
  readonly moLaiLyDo = signal('');
  readonly moLaiHieu = signal(false);

  readonly moLaiMo = computed(() => this.moLaiTarget() !== null);

  /** Nút Xác nhận chỉ mở khi **đủ cả hai**: lý do có chữ và ô tích đã đánh. */
  readonly moLaiHopLe = computed(() => this.moLaiLyDo().trim().length > 0 && this.moLaiHieu());

  moMoLai(k: Ky): void {
    this.moLaiLyDo.set('');
    this.moLaiHieu.set(false);
    this.moLaiTarget.set(k);
  }

  dongMoLai(): void {
    this.moLaiTarget.set(null);
  }

  xacNhanMoLai(): void {
    const k = this.moLaiTarget();
    if (!k || !this.moLaiHopLe()) return;
    const ok = this.service.moLaiKy(k.maKy, this.actor(), this.moLaiLyDo());
    this.moLaiTarget.set(null);
    if (ok) this.toast.success(`Đã mở lại kỳ ${k.maKy}. Thao tác được ghi vào nhật ký kèm lý do.`);
    else this.toast.error('Không mở lại được kỳ: thiếu lý do.');
  }

  // ---------------------------------------------------------------- tạo kỳ

  readonly taoMo = signal(false);
  readonly taoForm = signal({ maKy: '', kyTra: '', soNgayCongChuan: 21 });
  readonly taoLoi = signal<string[]>([]);

  moTao(): void {
    this.taoForm.set({ maKy: '', kyTra: '', soNgayCongChuan: 21 });
    this.taoLoi.set([]);
    this.taoMo.set(true);
  }

  capNhatTao<K extends 'maKy' | 'kyTra' | 'soNgayCongChuan'>(field: K, value: string): void {
    this.taoForm.update((prev) => ({
      ...prev,
      [field]: field === 'soNgayCongChuan' ? Number(value) || 0 : value,
    }));
  }

  luuTao(): void {
    const f = this.taoForm();
    const loi: string[] = [];
    if (!/^\d{4}-\d{2}$/.test(f.maKy.trim())) loi.push('Mã kỳ phải có dạng `2025-07`.');
    else if (this.service.daTonTai(f.maKy.trim())) loi.push(`Kỳ ${f.maKy.trim()} đã tồn tại.`);
    if (!/^\d{4}-\d{2}$/.test(f.kyTra.trim())) loi.push('Kỳ trả lương phải có dạng `2025-08`.');
    if (!f.soNgayCongChuan) loi.push('Thiếu ngày công chuẩn.');

    this.taoLoi.set(loi);
    if (loi.length) return;

    // `tuNgay`/`denNgay` suy ra từ mã kỳ, không cho nhập tay: kỳ tháng luôn là trọn tháng, và để
    // người dùng gõ là mở đường cho một kỳ 05/2025 kéo dài tới 03/06 — mọi luật khoá ô sau đó sai.
    const ngayCua = ngayTrongKy(f.maKy.trim());
    this.service.create(
      {
        maKy: f.maKy.trim(),
        loai: 'THANG',
        tuNgay: ngayCua[0]?.iso ?? '',
        denNgay: ngayCua[ngayCua.length - 1]?.iso ?? '',
        soNgayCongChuan: f.soNgayCongChuan,
        kyTra: f.kyTra.trim(),
        tongDonVi: 30,
      },
      this.actor(),
    );
    this.taoMo.set(false);
    this.toast.success(`Đã tạo kỳ ${f.maKy.trim()}.`);
  }
}

/** `2025-05-01` → `01/05/2025`. */
function ngay(iso: string): string {
  const [y, m, d] = iso.split('-');
  return d ? `${d}/${m}/${y}` : iso;
}

/** `2025-06` → `06/2025`. */
function nhanThangNam(v: string): string {
  const [y, m] = v.split('-');
  return m ? `${m}/${y}` : v;
}
