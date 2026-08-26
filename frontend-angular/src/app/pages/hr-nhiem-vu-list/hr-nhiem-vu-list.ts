import { Component, TemplateRef, computed, inject, signal, viewChild } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';

import {
  CmmButtonComponent,
  CmmDialogComponent,
  CmmInputText,
  CmmSelectComponent,
  CmmTextareaDirective,
  ColumnDefinition,
  DeleteIconComponent,
  EditIconComponent,
  PaginatorProps,
  ToastService,
  UBCKPaginatorModule,
  UBCKPaginatorState,
  UBCKTableModule,
} from '@khcn-core/ui';

import { AuthService } from '../../core/auth/auth.service';
import { KHOI_OPTIONS } from '../../core/models/hr/don-vi';
import { nhanNhanSu } from '../../core/models/hr/nhan-su';
import {
  NHIEM_VU_TRANG_THAI_COLOR,
  NHIEM_VU_TRANG_THAI_LABEL,
  NhiemVu,
  NhiemVuTrangThai,
  PHAN_LOAI_LABEL,
  PHAN_NGUON_LABEL,
  PhanLoaiNhiemVu,
  TINH_TRANG_PHAN_BO_COLOR,
  TINH_TRANG_PHAN_BO_LABEL,
  TinhTrangPhanBo,
  formatTien,
  khoangThoiGian,
} from '../../core/models/hr/nhiem-vu';
import { NhiemVuInput, NhiemVuService } from '../../core/services/hr/nhiem-vu.service';
import { hrColumns } from '../../shared/hr/table-columns';
import { HR_PAGE_SIZE_MAC_DINH, hrPaginatorProps } from '../../shared/hr/paginator-props';
import { HrNhiemVuFormModal } from '../../shared/hr/nhiem-vu-form-modal/nhiem-vu-form-modal';
import { HrPageCard } from '../../shared/hr/page-card/page-card';
import { HrTrangThaiTag } from '../../shared/hr/trang-thai-tag/trang-thai-tag';

/**
 * Danh mục nhiệm vụ — khuôn **DMDC** của bản thiết kế (danh sách + popup), không phải trang form
 * riêng. Đây là màn quản trị: xem toàn bộ nhiệm vụ, sửa, xoá, và **duyệt bản khai** do đơn vị gửi
 * lên (`/hr/khai-bao-nhiem-vu` là phía người khai).
 *
 * Đây chính là màn dựng theo **BM5 — Danh sách nhiệm vụ**: mỗi dòng ở đây là một dòng
 * `PHÂN LOẠI = Chính` của BM5, còn dòng `Thành phần` là nội dung công việc, nằm trong màn chi tiết.
 *
 * Bảng là `UbckTable` của `@khcn-core/ui` (D23) — cấu hình bằng dữ liệu (`ColumnDefinition[][]`)
 * chứ không phải `<th>/<td>` viết tay. Hai hệ quả phải nhớ khi sửa:
 *
 *   1. **Cột STT và chiều rộng cột** do `props.isShowOrder` và `ColumnDefinition` lo, đừng thêm cột
 *      STT thủ công — sẽ ra hai cột STT.
 *   2. **Ô nào cần định dạng thì định dạng TRƯỚC ở `pagedRows`**, không dùng `customTemplate`.
 *      `UbckTable` render ô thường bằng `{{ rowData[col.field] }}`; mỗi `customTemplate` là một
 *      `TemplateRef` phải khai thêm ở template + `viewChild` ở đây, nên chỉ dùng cho ô thật sự có
 *      cấu trúc (nút, link, tag).
 */
@Component({
  selector: 'app-hr-nhiem-vu-list',
  imports: [
    FormsModule,
    UBCKTableModule,
    UBCKPaginatorModule,
    CmmButtonComponent,
    CmmDialogComponent,
    CmmInputText,
    CmmSelectComponent,
    CmmTextareaDirective,
    DeleteIconComponent,
    EditIconComponent,
    HrNhiemVuFormModal,
    HrPageCard,
    HrTrangThaiTag,
  ],
  templateUrl: './hr-nhiem-vu-list.html',
  styleUrl: './hr-nhiem-vu-list.scss',
})
export class HrNhiemVuListPage {
  private readonly service = inject(NhiemVuService);
  private readonly auth = inject(AuthService);
  private readonly toast = inject(ToastService);
  private readonly router = inject(Router);

  readonly nhanNhanSu = nhanNhanSu;

  /** `cmm-select` nhận mảng `{ value, label }` ⇒ khối cũng phải bọc lại, không truyền mảng chuỗi. */
  readonly khoiOptions = KHOI_OPTIONS.map((value) => ({ value, label: value }));

  readonly trangThaiOptions = (Object.keys(NHIEM_VU_TRANG_THAI_LABEL) as NhiemVuTrangThai[]).map(
    (value) => ({ value, label: NHIEM_VU_TRANG_THAI_LABEL[value] }),
  );

  readonly phanLoaiOptions = (Object.keys(PHAN_LOAI_LABEL) as PhanLoaiNhiemVu[]).map((value) => ({
    value,
    label: PHAN_LOAI_LABEL[value],
  }));

  readonly tuKhoa = signal('');
  readonly khoiFilter = signal<string | null>(null);
  readonly phanLoaiFilter = signal<PhanLoaiNhiemVu | null>(null);
  readonly trangThaiFilter = signal<NhiemVuTrangThai | null>(null);
  readonly pageIndex = signal(1);
  readonly pageSize = signal(HR_PAGE_SIZE_MAC_DINH);

  readonly modalMo = signal(false);
  readonly dangSua = signal<NhiemVu | null>(null);

  readonly xoaMo = signal(false);
  readonly xoaTarget = signal<NhiemVu | null>(null);

  readonly tuChoiMo = signal(false);
  readonly tuChoiTarget = signal<string | null>(null);
  readonly tuChoiLyDo = signal('');

  readonly tatCa = this.service.rows;

  readonly rows = computed(() => {
    const q = this.tuKhoa().trim().toLocaleLowerCase('vi');
    const tt = this.trangThaiFilter();
    const khoi = this.khoiFilter();
    const pl = this.phanLoaiFilter();
    return this.tatCa().filter((d) => {
      if (tt && d.trangThai !== tt) return false;
      if (khoi && d.khoi !== khoi) return false;
      if (pl && d.phanLoai !== pl) return false;
      if (!q) return true;
      // `maDeTai`/`tenDeTai` nullable ⇒ lọc bỏ trước khi so, đừng để `undefined` lọt vào `includes`.
      return [d.maNhiemVu, d.tenNhiemVu, d.donViChuTri, d.maDeTai, d.tenDeTai]
        .filter((v): v is string => !!v)
        .some((v) => v.toLocaleLowerCase('vi').includes(q));
    });
  });

  /**
   * Dòng đưa vào bảng: **bản ghi gốc + các ô đã định dạng sẵn** (`_` ở đầu tên để phân biệt).
   *
   * Định dạng ở đây thay vì trong `customTemplate` — xem chú thích lớp. `nhiemVu` giữ nguyên bản
   * ghi gốc để `customTemplate` của cột Thao tác/Trạng thái còn dùng được kiểu `NhiemVu` thật.
   */
  readonly pagedRows = computed<Record<string, unknown>[]>(() => {
    const start = (this.pageIndex() - 1) * this.pageSize();
    return this.rows()
      .slice(start, start + this.pageSize())
      .map((row) => ({
        ...row,
        nhiemVu: row,
        _phanLoai: PHAN_LOAI_LABEL[row.phanLoai],
        _phanNguon: PHAN_NGUON_LABEL[row.phanNguon],
        _maDeTai: row.maDeTai ?? '—',
        _tongDuToan: formatTien(row.tongDuToan),
        _cpncPheDuyet: formatTien(row.chiPhiNhanCongPheDuyet),
        _thoiGian: khoangThoiGian(row.tuNgay, row.denNgay),
      }));
  });

  // ------------------------------------------------------------------- bảng

  private readonly tplThaoTac = viewChild.required<TemplateRef<unknown>>('tplThaoTac');
  private readonly tplMa = viewChild.required<TemplateRef<unknown>>('tplMa');
  private readonly tplTinhTrang = viewChild.required<TemplateRef<unknown>>('tplTinhTrang');
  private readonly tplTrangThai = viewChild.required<TemplateRef<unknown>>('tplTrangThai');

  /**
   * `ColumnDefinition[][]` — mảng NGOÀI là các **hàng header** (chỉ 1 hàng ở đây), mảng trong là các
   * cột. Thứ tự cột cố định theo design system: STT · Thao tác · …dữ liệu (STT do `isShowOrder` vẽ).
   */
  readonly columns = computed<ColumnDefinition[][]>(() =>
    hrColumns([
      {
        field: 'thaoTac',
        header: 'Thao tác',
        customTemplate: this.tplThaoTac(),
        maxWidth: '140px',
      },
      {
        field: 'maNhiemVu',
        header: 'Mã nhiệm vụ',
        customTemplate: this.tplMa(),
        maxWidth: '150px',
      },
      { field: 'tenNhiemVu', header: 'Tên nhiệm vụ', maxWidth: '300px' },
      { field: '_maDeTai', header: 'Mã đề tài', maxWidth: '150px' },
      { field: 'khoi', header: 'Khối', maxWidth: '150px' },
      { field: 'donViChuTri', header: 'Đơn vị chủ trì', maxWidth: '190px' },
      { field: '_phanLoai', header: 'Phân loại', maxWidth: '140px' },
      { field: '_phanNguon', header: 'Nguồn', maxWidth: '110px' },
      { field: '_tongDuToan', header: 'Tổng dự toán', maxWidth: '160px' },
      { field: '_cpncPheDuyet', header: 'CPNC phê duyệt', maxWidth: '160px' },
      { field: '_thoiGian', header: 'Thời gian', maxWidth: '140px' },
      {
        field: 'tinhTrangPhanBo',
        header: 'Tình trạng PB',
        customTemplate: this.tplTinhTrang(),
        maxWidth: '160px',
      },
      {
        field: 'trangThai',
        header: 'Trạng thái',
        customTemplate: this.tplTrangThai(),
        maxWidth: '140px',
      },
    ]),
  );

  readonly tableProps = {
    isShowOrder: true,
    colOrderName: 'STT',
    scrollable: true,
    rowHover: true,
    dataKey: 'maNhiemVu',
  };

  readonly paginatorProps = computed<PaginatorProps>(() =>
    hrPaginatorProps(this.rows().length, this.pageIndex(), this.pageSize()),
  );

  doiTrang(state: UBCKPaginatorState): void {
    this.pageIndex.set(state.currentPage);
    this.pageSize.set(state.recordPerPage);
  }

  /*
   * Nhãn + màu tag đọc qua HÀM chứ không tra bảng thẳng trong template.
   *
   * Biến ngầm định của `<ng-template>` mà `UbckTable` truyền vào luôn có kiểu `any`, mà chế độ
   * kiểm kiểu template nghiêm ngặt của Angular không cho `any` làm khoá của `Record<...>`
   * (TS7053) — build đỏ. Hàm nhận tham số đã khai kiểu thì `any` truyền vào được, và chỗ khai kiểu
   * nằm ở đây, một chỗ, thay vì rải `$any(...)` khắp template.
   */
  nhanTrangThai(tt: NhiemVuTrangThai) {
    return NHIEM_VU_TRANG_THAI_LABEL[tt];
  }

  mauTrangThai(tt: NhiemVuTrangThai) {
    return NHIEM_VU_TRANG_THAI_COLOR[tt];
  }

  nhanTinhTrang(tt: TinhTrangPhanBo) {
    return TINH_TRANG_PHAN_BO_LABEL[tt];
  }

  mauTinhTrang(tt: TinhTrangPhanBo) {
    return TINH_TRANG_PHAN_BO_COLOR[tt];
  }

  private actor(): string {
    return this.auth.user()?.hoTen ?? 'Người dùng demo';
  }

  timKiem(value: string): void {
    this.tuKhoa.set(value);
    this.pageIndex.set(1);
  }

  locKhoi(value: string | null): void {
    this.khoiFilter.set(value);
    this.pageIndex.set(1);
  }

  locPhanLoai(value: PhanLoaiNhiemVu | null): void {
    this.phanLoaiFilter.set(value);
    this.pageIndex.set(1);
  }

  locTrangThai(value: NhiemVuTrangThai | null): void {
    this.trangThaiFilter.set(value);
    this.pageIndex.set(1);
  }

  moChiTiet(row: NhiemVu): void {
    void this.router.navigate(['/hr/nhiem-vu', row.maNhiemVu]);
  }

  // ------------------------------------------------------------------- popup

  moThemMoi(): void {
    this.dangSua.set(null);
    this.modalMo.set(true);
  }

  moSua(row: NhiemVu): void {
    this.dangSua.set(row);
    this.modalMo.set(true);
  }

  luu(input: NhiemVuInput): void {
    const dangSua = this.dangSua();
    if (dangSua) {
      this.service.update(dangSua.maNhiemVu, input, this.actor());
      this.toast.success(`Đã cập nhật nhiệm vụ ${dangSua.maNhiemVu}.`);
    } else {
      this.service.create(input, this.actor());
      this.toast.success(`Đã tạo nhiệm vụ ${input.maNhiemVu}.`);
      this.pageIndex.set(1);
    }
    this.modalMo.set(false);
  }

  // ---------------------------------------------------------------- vòng đời

  /**
   * Xoá qua hộp xác nhận riêng chứ không phải popconfirm.
   *
   * Design system để **nút chính và nút xoá cùng màu đỏ** (ramp brand và danger trùng nhau, cố ý),
   * nên màu không còn là dấu hiệu phân biệt hành động phá huỷ — bắt buộc phải có bước xác nhận nêu
   * rõ tên bản ghi bằng CHỮ.
   */
  moXoa(row: NhiemVu): void {
    this.xoaTarget.set(row);
    this.xoaMo.set(true);
  }

  xacNhanXoa(): void {
    const row = this.xoaTarget();
    if (!row) return;
    this.service.remove(row.maNhiemVu);
    this.xoaMo.set(false);
    this.toast.success(`Đã xoá nhiệm vụ ${row.maNhiemVu}.`);
  }

  duyet(row: NhiemVu): void {
    this.service.approve(row.maNhiemVu, this.actor());
    this.toast.success(`Đã duyệt bản khai ${row.maNhiemVu}.`);
  }

  /**
   * Từ chối bắt buộc nêu lý do — lý do đi thẳng vào `lichSu` của nhiệm vụ. Dùng hộp thoại có ô nhập
   * chứ không phải hộp xác nhận thường: "từ chối không nêu lý do" thì người khai không biết sửa gì.
   */
  moTuChoi(row: NhiemVu): void {
    this.tuChoiTarget.set(row.maNhiemVu);
    this.tuChoiLyDo.set('');
    this.tuChoiMo.set(true);
  }

  xacNhanTuChoi(): void {
    const ma = this.tuChoiTarget();
    const lyDo = this.tuChoiLyDo().trim();
    if (!ma || !lyDo) return;
    this.service.reject(ma, this.actor(), lyDo);
    this.tuChoiMo.set(false);
    this.toast.success(`Đã từ chối bản khai ${ma}.`);
  }
}
