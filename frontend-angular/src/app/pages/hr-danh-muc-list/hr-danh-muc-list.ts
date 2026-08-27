import { Component, TemplateRef, computed, inject, signal, viewChild } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { toSignal } from '@angular/core/rxjs-interop';
import { map } from 'rxjs/operators';

import {
  CmmButtonComponent,
  CmmDialogComponent,
  CmmInputText,
  CmmSelectComponent,
  CmmTextareaDirective,
  CmmToggleswitchComponent,
  ColumnDefinition,
  DeleteIconComponent,
  EditIconComponent,
  EyeIconComponent,
  PaginatorProps,
  ToastService,
  UBCKPaginatorModule,
  UBCKPaginatorState,
  UBCKTableModule,
} from '@khcn-core/ui';

import {
  DANH_MUC_DINH_NGHIA,
  DanhMucLoai,
  DanhMucRow,
  DanhMucTruong,
  laDanhMucLoai,
  oDanhMuc,
} from '../../core/models/hr/danh-muc';
import { DanhMucInput, DanhMucService } from '../../core/services/hr/danh-muc.service';
import { exportCsv, exportTableToXls } from '../../core/utils/export-bieu-mau';
import { HrAdvancedSearch } from '../../shared/hr/advanced-search/advanced-search';
import { HrImportPreview } from '../../shared/hr/import-preview/import-preview';
import { ImportDongPreview } from '../../shared/hr/import-preview/import-preview.model';
import { HrPageCard } from '../../shared/hr/page-card/page-card';
import { HrTrangThaiTag } from '../../shared/hr/trang-thai-tag/trang-thai-tag';
import { hrColumns } from '../../shared/hr/table-columns';
import { HR_PAGE_SIZE_MAC_DINH, hrPaginatorProps } from '../../shared/hr/paginator-props';

/**
 * Trang danh mục **dùng chung cho 11 danh mục phẳng** — đợt 1.5, artboard 11 → 19.
 *
 * Danh mục nào hiện ra do đoạn route `:loai` quyết định; toàn bộ cột, trường form, bộ lọc và luật
 * import đọc từ `DANH_MUC_DINH_NGHIA`. Xem chú thích đầu `core/models/hr/danh-muc.ts` để biết vì
 * sao không viết 11 trang.
 *
 * Đủ **năm** chức năng mà `Book1` yêu cầu cho mỗi danh mục:
 * `Danh sách · Chi tiết · CRUD · Import · Export` — Chi tiết ở trang riêng (`hr-danh-muc-detail`),
 * bốn cái còn lại ở đây.
 *
 * ## Hai điểm nghiệp vụ không được làm hời hợt
 *
 * 1. **Nút phá huỷ mặc định là *Ngừng hoạt động*, không phải *Xoá***. Master data đã đi vào bảng
 *    công kỳ trước mà xoá cứng thì số báo cáo cũ đổi sau lưng người đã ký. Nút Xoá vẫn có, nhưng
 *    qua hộp xác nhận nêu tên bản ghi bằng CHỮ — màu không phân biệt được hành động phá huỷ, vì
 *    ramp brand và danger của design system trùng nhau (cố ý).
 * 2. **Danh mục `trang-thai-nhiem-vu` là danh mục hệ thống**: không thêm, không xoá. Mã trạng thái
 *    được code đọc thẳng (luật khoá ô §6.4), nên một mã mới khai ở đây không sinh ra hành vi nào —
 *    cho thêm là mời người dùng tạo dữ liệu chết.
 */
@Component({
  selector: 'app-hr-danh-muc-list',
  imports: [
    UBCKTableModule,
    UBCKPaginatorModule,
    CmmButtonComponent,
    CmmDialogComponent,
    CmmInputText,
    CmmSelectComponent,
    CmmTextareaDirective,
    CmmToggleswitchComponent,
    DeleteIconComponent,
    EditIconComponent,
    EyeIconComponent,
    HrAdvancedSearch,
    HrImportPreview,
    HrPageCard,
    HrTrangThaiTag,
  ],
  templateUrl: './hr-danh-muc-list.html',
  styleUrl: './hr-danh-muc-list.scss',
})
export class HrDanhMucListPage {
  private readonly service = inject(DanhMucService);
  private readonly toast = inject(ToastService);
  private readonly router = inject(Router);
  private readonly route = inject(ActivatedRoute);

  /**
   * Loại danh mục đang xem, đọc từ route.
   *
   * `paramMap` chứ không phải `snapshot`: điều hướng giữa hai danh mục dùng **cùng một** component
   * nên Angular tái sử dụng instance, `snapshot` sẽ đứng nguyên ở danh mục đầu tiên. Triệu chứng
   * là bấm sang danh mục khác thì tiêu đề đổi (breadcrumb đọc route) mà bảng không đổi.
   */
  readonly loai = toSignal(
    this.route.paramMap.pipe(
      map((p) => {
        const v = p.get('loai');
        return laDanhMucLoai(v) ? v : ('chuc-danh' as DanhMucLoai);
      }),
    ),
    { initialValue: 'chuc-danh' as DanhMucLoai },
  );

  readonly dinhNghia = computed(() => DANH_MUC_DINH_NGHIA[this.loai()]);

  /*
   * Đọc qua `list()` trong `computed` chứ không qua `service.rows(loai)`: `rows()` dựng một
   * `computed` MỚI mỗi lần gọi, mà chỗ gọi ở đây chạy lại mỗi khi đổi danh mục. `list()` đọc thẳng
   * signal kho nên vẫn phản ứng đúng, không sinh rác.
   */
  readonly tatCa = computed(() => this.service.list(this.loai()));

  // ------------------------------------------------------------------- lọc

  readonly tuKhoa = signal('');
  /** Giá trị bộ lọc theo tên trường; `null` = không lọc. Xoá sạch khi đổi danh mục. */
  readonly boLocValue = signal<Record<string, string | null>>({});
  readonly pageIndex = signal(1);
  readonly pageSize = signal(HR_PAGE_SIZE_MAC_DINH);

  /**
   * Tuỳ chọn của mỗi ô lọc suy ra từ **chính dữ liệu đang có**, không khai cứng.
   *
   * Nhờ vậy thêm một nhóm chức danh mới ở form là ô lọc có ngay giá trị đó, không phải sửa hai
   * chỗ. Riêng `hoatDong` là cờ nên trả về cặp cố định.
   */
  readonly boLocOptions = computed(() => {
    const kq: Record<string, { value: string; label: string }[]> = {};
    for (const loc of this.dinhNghia().boLoc) {
      if (loc.field === 'hoatDong') {
        kq[loc.field] = [
          { value: 'true', label: 'Đang hoạt động' },
          { value: 'false', label: 'Ngừng hoạt động' },
        ];
        continue;
      }
      const giaTri = [
        ...new Set(
          this.tatCa()
            .map((r) => r[loc.field])
            .filter((v): v is string => typeof v === 'string' && v.length > 0),
        ),
      ].sort((a, b) => a.localeCompare(b, 'vi'));
      kq[loc.field] = giaTri.map((v) => ({ value: v, label: v }));
    }
    return kq;
  });

  readonly rows = computed(() => {
    const q = this.tuKhoa().trim().toLocaleLowerCase('vi');
    const loc = this.boLocValue();
    const cot = this.dinhNghia().cot;

    return this.tatCa().filter((r) => {
      for (const [field, value] of Object.entries(loc)) {
        if (value === null || value === undefined || value === '') continue;
        if (field === 'hoatDong') {
          if (String(r.hoatDong) !== value) return false;
        } else if (String(r[field] ?? '') !== value) {
          return false;
        }
      }
      if (!q) return true;
      // Tìm trên đúng các cột đang hiện — tìm được thứ không nhìn thấy thì người dùng tưởng lọc hỏng.
      return cot.some((c) =>
        String(r[c.field] ?? '')
          .toLocaleLowerCase('vi')
          .includes(q),
      );
    });
  });

  readonly pagedRows = computed<Record<string, unknown>[]>(() => {
    const start = (this.pageIndex() - 1) * this.pageSize();
    const cot = this.dinhNghia().cot;
    return this.rows()
      .slice(start, start + this.pageSize())
      .map((r) => {
        // Ô nào cần định dạng thì định dạng TRƯỚC ở đây, không dùng `customTemplate` — xem chú
        // thích `shared/hr/table-columns.ts` và `hr-nhiem-vu-list`.
        const o: Record<string, unknown> = { ...r, banGhi: r };
        for (const c of cot) {
          if (c.kieu === 'so' || c.kieu === 'giua') o[`_${c.field}`] = oDanhMuc(r[c.field], c.kieu);
        }
        return o;
      });
  });

  // ----------------------------------------------------------------- bảng

  private readonly tplThaoTac = viewChild.required<TemplateRef<unknown>>('tplThaoTac');
  private readonly tplHoatDong = viewChild.required<TemplateRef<unknown>>('tplHoatDong');
  private readonly tplCoKhong = viewChild.required<TemplateRef<unknown>>('tplCoKhong');
  private readonly tplKhoaO = viewChild.required<TemplateRef<unknown>>('tplKhoaO');
  private readonly tplMa = viewChild.required<TemplateRef<unknown>>('tplMa');

  /**
   * Cột khai `minWidth` **cùng giá trị** với `maxWidth`.
   *
   * Chỉ đặt `maxWidth` thì trình duyệt vẫn được phép co cột xuống dưới mức đó khi tổng bề rộng
   * vượt khung — và thứ bị co trước là tiêu đề, nên bảng hiện `Ký …` thay cho `Ký hiệu` trong khi
   * ô dữ liệu vẫn thừa chỗ. Đo bằng mắt trên `/hr/danh-muc/ky-hieu-cong` ngày 2026-08-27. Bảng đã
   * `scrollable` nên ghim bề rộng thì cột thừa đẩy ra thanh cuộn ngang, không vỡ khung.
   */
  private cot(c: { field: string; header: string; width?: string }, them: Partial<ColumnDefinition> = {}): ColumnDefinition {
    return { field: c.field, header: c.header, maxWidth: c.width, minWidth: c.width, ...them };
  }

  readonly columns = computed<ColumnDefinition[][]>(() => {
    const cot = this.dinhNghia().cot;
    const cols: ColumnDefinition[] = [
      this.cot(
        { field: 'thaoTac', header: 'Thao tác', width: '150px' },
        { customTemplate: this.tplThaoTac() },
      ),
      this.cot(
        { field: 'hoatDong', header: 'Trạng thái', width: '130px' },
        { customTemplate: this.tplHoatDong() },
      ),
    ];

    for (const c of cot) {
      if (c.field === 'ma') {
        cols.push(this.cot(c, { customTemplate: this.tplMa() }));
      } else if (c.kieu === 'co-khong') {
        cols.push(this.cot(c, { customTemplate: this.tplCoKhong() }));
      } else if (c.kieu === 'khoa-o') {
        cols.push(this.cot(c, { customTemplate: this.tplKhoaO() }));
      } else {
        // Cột số/canh giữa đọc ô ĐÃ ĐỊNH DẠNG (`_field`) — xem `pagedRows`.
        cols.push(this.cot({ ...c, field: c.kieu === 'so' || c.kieu === 'giua' ? `_${c.field}` : c.field }));
      }
    }
    return hrColumns(cols);
  });

  readonly tableProps = { isShowOrder: true, colOrderName: 'STT', scrollable: true, rowHover: true, dataKey: 'id' };

  readonly paginatorProps = computed<PaginatorProps>(() =>
    hrPaginatorProps(this.rows().length, this.pageIndex(), this.pageSize()),
  );

  doiTrang(state: UBCKPaginatorState): void {
    this.pageIndex.set(state.currentPage);
    this.pageSize.set(state.recordPerPage);
  }

  timKiem(value: string): void {
    this.tuKhoa.set(value);
    this.pageIndex.set(1);
  }

  locTheo(field: string, value: string | null): void {
    this.boLocValue.update((prev) => ({ ...prev, [field]: value }));
    this.pageIndex.set(1);
  }

  lamMoiLoc(): void {
    this.boLocValue.set({});
    this.tuKhoa.set('');
    this.pageIndex.set(1);
  }

  moChiTiet(row: DanhMucRow): void {
    void this.router.navigate(['/hr/danh-muc', this.loai(), row.ma]);
  }

  // ------------------------------------------------------------ thêm / sửa

  readonly formMo = signal(false);
  readonly dangSua = signal<DanhMucRow | null>(null);
  readonly form = signal<Record<string, unknown>>({});
  readonly loiForm = signal<string[]>([]);

  moThemMoi(): void {
    const mac: Record<string, unknown> = { hoatDong: true };
    for (const t of this.dinhNghia().truong) mac[t.field] = t.kieu === 'bat-tat' ? false : '';
    this.dangSua.set(null);
    this.form.set(mac);
    this.loiForm.set([]);
    this.formMo.set(true);
  }

  moSua(row: DanhMucRow): void {
    this.dangSua.set(row);
    this.form.set({ ...row });
    this.loiForm.set([]);
    this.formMo.set(true);
  }

  capNhatForm(field: string, value: unknown): void {
    this.form.update((prev) => ({ ...prev, [field]: value }));
  }

  /** Ô đang khoá: mã danh mục sau khi đã tạo — nó là khoá đối chiếu của mọi file import. */
  bikhoa(t: DanhMucTruong): boolean {
    return !!t.khoaKhiSua && !!this.dangSua();
  }

  optionsCua(t: DanhMucTruong): { value: string; label: string }[] {
    return (t.options ?? []).map((v) => ({ value: v, label: v }));
  }

  luu(): void {
    const dinhNghia = this.dinhNghia();
    const form = this.form();
    const loi: string[] = [];

    for (const t of dinhNghia.truong) {
      if (!t.batBuoc) continue;
      const v = form[t.field];
      if (v === null || v === undefined || String(v).trim() === '') loi.push(`Thiếu ${t.label}.`);
    }

    const ma = String(form['ma'] ?? '').trim();
    if (ma && this.service.daTonTai(this.loai(), ma, this.dangSua()?.id)) {
      loi.push(`Mã ${ma} đã tồn tại trong ${dinhNghia.ten.toLocaleLowerCase('vi')}.`);
    }

    this.loiForm.set(loi);
    if (loi.length) return;

    // Trường `so` giữ kiểu số: để nguyên chuỗi thì cột canh phải sẽ sắp xếp theo thứ tự chữ cái
    // ("10" đứng trước "9") và mọi phép cộng sau này ra chuỗi nối.
    const input = { ...form } as Record<string, unknown>;
    for (const t of dinhNghia.truong) {
      if (t.kieu === 'so') input[t.field] = Number(input[t.field]) || 0;
    }

    const dangSua = this.dangSua();
    if (dangSua) {
      this.service.update(this.loai(), dangSua.id, input as Partial<DanhMucInput>);
      this.toast.success(`Đã cập nhật ${dinhNghia.tenDon} ${dangSua.ma}.`);
    } else {
      this.service.create(this.loai(), input as DanhMucInput);
      this.toast.success(`Đã thêm ${dinhNghia.tenDon} ${ma}.`);
      this.pageIndex.set(1);
    }
    this.formMo.set(false);
  }

  // --------------------------------------------------------------- vòng đời

  doiHoatDong(row: DanhMucRow, hoatDong: boolean): void {
    this.service.doiHoatDong(this.loai(), row.id, hoatDong);
    this.toast.success(
      hoatDong ? `Đã bật lại ${row.ma}.` : `Đã ngừng hoạt động ${row.ma} — dữ liệu cũ giữ nguyên.`,
    );
  }

  readonly xoaMo = signal(false);
  readonly xoaTarget = signal<DanhMucRow | null>(null);

  moXoa(row: DanhMucRow): void {
    this.xoaTarget.set(row);
    this.xoaMo.set(true);
  }

  xacNhanXoa(): void {
    const row = this.xoaTarget();
    if (!row) return;
    this.service.remove(this.loai(), row.id);
    this.xoaMo.set(false);
    this.toast.success(`Đã xoá ${this.dinhNghia().tenDon} ${row.ma}.`);
  }

  // ---------------------------------------------------------------- import

  readonly importMo = signal(false);
  readonly importPreview = signal<ImportDongPreview[]>([]);
  readonly importTenFile = signal('');
  readonly importLoiDoc = signal<string | null>(null);

  moImport(): void {
    this.importPreview.set([]);
    this.importTenFile.set('');
    this.importLoiDoc.set(null);
    this.importMo.set(true);
  }

  taiFileMau(): void {
    exportCsv(this.service.fileMau(this.loai()), `mau-nhap-${this.loai()}`);
  }

  chonFile(file: File): void {
    this.importTenFile.set(file.name);
    this.importLoiDoc.set(null);
    const reader = new FileReader();
    reader.onload = () => {
      const text = String(reader.result ?? '');
      const preview = this.service.phanTichFile(this.loai(), text);
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

  nhapDuLieu(): void {
    const so = this.service.importRows(this.loai(), this.importPreview());
    this.importMo.set(false);
    this.toast.success(`Đã nhập ${so} dòng vào ${this.dinhNghia().ten.toLocaleLowerCase('vi')}.`);
    this.pageIndex.set(1);
  }

  // ---------------------------------------------------------------- export

  xuatExcel(): void {
    const dinhNghia = this.dinhNghia();
    exportTableToXls(
      this.rows(),
      [
        ...dinhNghia.cot.map((c) => ({
          header: c.header,
          value: (r: DanhMucRow) => oDanhMuc(r[c.field], c.kieu),
        })),
        { header: 'Trạng thái', value: (r: DanhMucRow) => (r.hoatDong ? 'Đang hoạt động' : 'Ngừng hoạt động') },
      ],
      `${this.loai()}`,
      dinhNghia.ten,
    );
  }

  /*
   * Nhãn/màu đọc qua HÀM chứ không tra bảng thẳng trong template: biến ngầm định của
   * `<ng-template>` mà `UbckTable` truyền vào có kiểu `any`, và chế độ kiểm kiểu nghiêm ngặt của
   * Angular không cho `any` làm khoá của `Record<...>` (TS7053) — build đỏ. Xem `hr-nhiem-vu-list`.
   */
  nhanCoKhong(v: unknown): string {
    return v === null || v === undefined ? '—' : v ? 'Có' : 'Không';
  }

  loaiCoKhong(v: unknown): 'success' | 'default' | 'warning' {
    if (v === null || v === undefined) return 'warning';
    return v ? 'success' : 'default';
  }

  /** Cột *Khoá ô chấm công*: bật = ô bị xám ở màn chấm công ⇒ nhãn phải là “Khoá”, không phải “Có”. */
  nhanKhoaO(v: unknown): string {
    return v === null || v === undefined ? '—' : v ? 'Khoá' : 'Không';
  }

  loaiKhoaO(v: unknown): 'error' | 'default' | 'warning' {
    if (v === null || v === undefined) return 'warning';
    return v ? 'error' : 'default';
  }
}
