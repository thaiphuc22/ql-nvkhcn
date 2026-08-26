import { Component, TemplateRef, computed, inject, signal, viewChild } from '@angular/core';
import { Router } from '@angular/router';

import {
  CmmButtonComponent,
  CmmInputText,
  CmmInputnumberComponent,
  CmmSelectComponent,
  CmmSelectbuttonComponent,
  ColumnDefinition,
  EditIconComponent,
  EyeIconComponent,
  PaginatorProps,
  ToastService,
  UBCKPaginatorModule,
  UBCKPaginatorState,
  UBCKTableModule,
} from '@khcn-core/ui';

import { AuthService } from '../../core/auth/auth.service';
import { KHOI_OPTIONS } from '../../core/models/hr/don-vi';
import {
  NHIEM_VU_TRANG_THAI_COLOR,
  NHIEM_VU_TRANG_THAI_LABEL,
  NhiemVu,
  NhiemVuTrangThai,
  PHAN_LOAI_LABEL,
  PhanLoaiNhiemVu,
  formatTien,
  khoangThoiGian,
} from '../../core/models/hr/nhiem-vu';
import { NhiemVuInput, NhiemVuService } from '../../core/services/hr/nhiem-vu.service';
import { HrAdvancedSearch } from '../../shared/hr/advanced-search/advanced-search';
import { HrNhiemVuFormModal } from '../../shared/hr/nhiem-vu-form-modal/nhiem-vu-form-modal';
import { HrPageCard } from '../../shared/hr/page-card/page-card';
import { hrColumns } from '../../shared/hr/table-columns';
import { HR_PAGE_SIZE_MAC_DINH, hrPaginatorProps } from '../../shared/hr/paginator-props';
import { HrTrangThaiTag } from '../../shared/hr/trang-thai-tag/trang-thai-tag';

type PhamVi = 'toi' | 'donVi';

interface BoLoc {
  tuKhoa: string;
  phanLoai: PhanLoaiNhiemVu | null;
  khoi: string | null;
  trangThai: NhiemVuTrangThai | null;
  namBatDau: number | null;
}

const LOC_TRONG: BoLoc = {
  tuKhoa: '',
  phanLoai: null,
  khoi: null,
  trangThai: null,
  namBatDau: null,
};

/** Dòng đưa vào bảng: bản ghi gốc + các ô đã định dạng sẵn + cờ `disabled` cho ô tích. */
type DongHienThi = Record<string, unknown> & { nhiemVu: NhiemVu; maNhiemVu: string };

/**
 * Khai báo nhiệm vụ — màn của **người khai** (đối lập với `/hr/nhiem-vu` là màn quản trị duyệt).
 *
 * Hai phạm vi: *Bản khai của tôi* (do chính tài khoản đang đăng nhập khai) và *Của đơn vị* (toàn
 * bộ, để trưởng đơn vị nhìn được việc của nhân viên). Trình duyệt chỉ áp cho bản khai đang ở trạng
 * thái `NHAP` hoặc `TU_CHOI` — chọn dòng đã `CHO_DUYET` rồi trình lại là thao tác vô nghĩa, nên
 * checkbox của các dòng đó bị khoá thay vì im lặng bỏ qua khi bấm.
 *
 * Khối lọc dùng `hr-advanced-search` đúng biến thể *Tìm kiếm nâng cao* của bản thiết kế. Bộ lọc chỉ
 * áp khi bấm `Tìm kiếm` — gõ tới đâu lọc tới đó sẽ làm nút `Tìm kiếm` trở thành đồ trang trí.
 *
 * ⚠ Đổi 2026-08-26 (D23): khối *Tìm kiếm nâng cao* giờ nằm **trong cùng card với bảng** chứ không
 * còn là card riêng phía trên — xem `docs/design-system/screens/06` và chú thích `HrAdvancedSearch`.
 *
 * Việc chọn dòng do `UbckTable` lo (`isShowCheckBox` + `[(selection)]`), không còn `Set` tự quản.
 * Cờ khoá ô tích là trường **`disabled` trên chính dòng dữ liệu** — đó là giao kèo của thư viện
 * (`UBCKTableBody` đọc `rowData.disabled`), không phải một input riêng.
 */
@Component({
  selector: 'app-hr-khai-bao-list',
  imports: [
    UBCKTableModule,
    UBCKPaginatorModule,
    CmmButtonComponent,
    CmmInputText,
    CmmInputnumberComponent,
    CmmSelectComponent,
    CmmSelectbuttonComponent,
    EditIconComponent,
    EyeIconComponent,
    HrAdvancedSearch,
    HrNhiemVuFormModal,
    HrPageCard,
    HrTrangThaiTag,
  ],
  templateUrl: './hr-khai-bao-list.html',
  styleUrl: './hr-khai-bao-list.scss',
})
export class HrKhaiBaoListPage {
  private readonly service = inject(NhiemVuService);
  private readonly auth = inject(AuthService);
  private readonly toast = inject(ToastService);
  private readonly router = inject(Router);

  readonly khoiOptions = KHOI_OPTIONS.map((value) => ({ value, label: value }));

  readonly trangThaiOptions = (Object.keys(NHIEM_VU_TRANG_THAI_LABEL) as NhiemVuTrangThai[]).map(
    (value) => ({ value, label: NHIEM_VU_TRANG_THAI_LABEL[value] }),
  );

  readonly phanLoaiOptions = (Object.keys(PHAN_LOAI_LABEL) as PhanLoaiNhiemVu[]).map((value) => ({
    value,
    label: PHAN_LOAI_LABEL[value],
  }));

  readonly phamViOptions = [
    { value: 'toi' as const, label: 'Bản khai của tôi' },
    { value: 'donVi' as const, label: 'Của đơn vị' },
  ];

  readonly phamVi = signal<PhamVi>('toi');
  /** Bộ lọc đang gõ trên form — chưa áp dụng. */
  readonly locNhap = signal<BoLoc>({ ...LOC_TRONG });
  /** Bộ lọc đã bấm `Tìm kiếm` — cái thực sự lọc bảng. */
  readonly locApDung = signal<BoLoc>({ ...LOC_TRONG });

  readonly pageIndex = signal(1);
  readonly pageSize = signal(HR_PAGE_SIZE_MAC_DINH);

  /** Các dòng đang tích — do `UbckTable` ghi vào, phần tử là chính đối tượng `DongHienThi`. */
  readonly chonDong = signal<DongHienThi[]>([]);

  readonly modalMo = signal(false);
  readonly dangSua = signal<NhiemVu | null>(null);

  readonly rows = computed(() => {
    const f = this.locApDung();
    const q = f.tuKhoa.trim().toLocaleLowerCase('vi');
    const toi = this.auth.user()?.hoTen ?? '';
    return this.service.rows().filter((d) => {
      if (this.phamVi() === 'toi' && d.nguoiKhaiBao !== toi) return false;
      if (f.phanLoai && d.phanLoai !== f.phanLoai) return false;
      if (f.khoi && d.khoi !== f.khoi) return false;
      if (f.trangThai && d.trangThai !== f.trangThai) return false;
      // Nhiệm vụ lưu ngày đầy đủ; lọc theo năm đọc 4 ký tự đầu của `tuNgay`.
      if (f.namBatDau && Number(d.tuNgay.slice(0, 4)) !== f.namBatDau) return false;
      if (!q) return true;
      return [d.maNhiemVu, d.tenNhiemVu, d.maDeTai]
        .filter((v): v is string => !!v)
        .some((v) => v.toLocaleLowerCase('vi').includes(q));
    });
  });

  readonly pagedRows = computed<DongHienThi[]>(() => {
    const start = (this.pageIndex() - 1) * this.pageSize();
    return this.rows()
      .slice(start, start + this.pageSize())
      .map((row) => ({
        ...row,
        nhiemVu: row,
        // Giao kèo của `UbckTable`: ô tích đọc `rowData.disabled`. Bản khai đã gửi thì không trình
        // lại được, khoá ô tích chứ không im lặng bỏ qua khi bấm.
        disabled: !this.trinhDuoc(row),
        _phanLoai: PHAN_LOAI_LABEL[row.phanLoai],
        _cpncPheDuyet: formatTien(row.chiPhiNhanCongPheDuyet),
        _thoiGian: khoangThoiGian(row.tuNgay, row.denNgay),
      }));
  });

  readonly soDaChon = computed(() => this.chonDong().length);

  // ------------------------------------------------------------------- bảng

  private readonly tplThaoTac = viewChild.required<TemplateRef<unknown>>('tplThaoTac');
  private readonly tplMa = viewChild.required<TemplateRef<unknown>>('tplMa');
  private readonly tplTrangThai = viewChild.required<TemplateRef<unknown>>('tplTrangThai');

  readonly columns = computed<ColumnDefinition[][]>(() =>
    hrColumns([
      {
        field: 'thaoTac',
        header: 'Thao tác',
        customTemplate: this.tplThaoTac(),
        maxWidth: '110px',
      },
      {
        field: 'maNhiemVu',
        header: 'Mã nhiệm vụ',
        customTemplate: this.tplMa(),
        maxWidth: '150px',
      },
      { field: 'tenNhiemVu', header: 'Tên nhiệm vụ', maxWidth: '320px' },
      { field: '_phanLoai', header: 'Phân loại', maxWidth: '150px' },
      { field: 'khoi', header: 'Khối', maxWidth: '170px' },
      { field: '_cpncPheDuyet', header: 'CPNC phê duyệt', maxWidth: '170px' },
      { field: '_thoiGian', header: 'Thời gian', maxWidth: '130px' },
      { field: 'ngayKhaiBao', header: 'Ngày khai', maxWidth: '130px' },
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
    isShowCheckBox: true,
    selectionMode: 'multiple' as const,
    // Ô tích ở header chỉ phản ánh TRANG HIỆN TẠI (`selectionPageOnly`) — "chọn tất cả" mà lại tích
    // luôn cả những dòng người dùng chưa nhìn thấy là hành vi bất ngờ với thao tác trình duyệt hàng
    // loạt. `showIndeterminateCheckAll` cho trạng thái "chọn một phần" thay vì bật/tắt cứng.
    selectionPageOnly: true,
    showIndeterminateCheckAll: true,
    dataKey: 'maNhiemVu',
    scrollable: true,
    rowHover: true,
  };

  readonly paginatorProps = computed<PaginatorProps>(() =>
    hrPaginatorProps(this.rows().length, this.pageIndex(), this.pageSize()),
  );

  doiTrang(state: UBCKPaginatorState): void {
    this.pageIndex.set(state.currentPage);
    this.pageSize.set(state.recordPerPage);
    // Đổi trang là đổi tập dòng đang nhìn thấy; giữ lại lựa chọn của trang cũ thì con số trên nút
    // "Trình duyệt (n)" không còn khớp với thứ người dùng thấy.
    this.chonDong.set([]);
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

  private actor(): string {
    return this.auth.user()?.hoTen ?? 'Người dùng demo';
  }

  trinhDuoc(d: NhiemVu): boolean {
    return d.trangThai === 'NHAP' || d.trangThai === 'TU_CHOI';
  }

  doiPhamVi(value: PhamVi): void {
    this.phamVi.set(value);
    this.pageIndex.set(1);
    this.chonDong.set([]);
  }

  capNhatLoc<K extends keyof BoLoc>(key: K, value: BoLoc[K]): void {
    this.locNhap.update((f) => ({ ...f, [key]: value }));
  }

  timKiem(): void {
    this.locApDung.set({ ...this.locNhap() });
    this.pageIndex.set(1);
    this.chonDong.set([]);
  }

  lamMoi(): void {
    this.locNhap.set({ ...LOC_TRONG });
    this.locApDung.set({ ...LOC_TRONG });
    this.pageIndex.set(1);
    this.chonDong.set([]);
  }

  // ------------------------------------------------------------------ thao tác

  trinhDuyetHangLoat(): void {
    const chon = this.chonDong().map((d) => d.maNhiemVu);
    if (!chon.length) return;
    for (const ma of chon) this.service.submit(ma, this.actor());
    this.chonDong.set([]);
    this.toast.success(`Đã trình duyệt ${chon.length} bản khai.`);
  }

  moChiTiet(d: NhiemVu): void {
    void this.router.navigate(['/hr/nhiem-vu', d.maNhiemVu]);
  }

  moKhaiBao(): void {
    this.dangSua.set(null);
    this.modalMo.set(true);
  }

  moSua(d: NhiemVu): void {
    this.dangSua.set(d);
    this.modalMo.set(true);
  }

  luu(input: NhiemVuInput): void {
    const dangSua = this.dangSua();
    if (dangSua) {
      this.service.update(dangSua.maNhiemVu, input, this.actor());
      this.toast.success(`Đã cập nhật bản khai ${dangSua.maNhiemVu}.`);
    } else {
      this.service.create(input, this.actor());
      this.toast.success(`Đã tạo bản khai ${input.maNhiemVu}.`);
      this.pageIndex.set(1);
    }
    this.modalMo.set(false);
  }
}
