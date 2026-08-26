import { Component, TemplateRef, computed, inject, signal, viewChild } from '@angular/core';
import { Router } from '@angular/router';

import {
  CmmButtonComponent,
  CmmDialogComponent,
  CmmFileUploadComponent,
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
import {
  NHAN_SU_TRANG_THAI_COLOR,
  NHAN_SU_TRANG_THAI_LABEL,
  NhanSuNhiemVu,
  NhanSuTrangThaiDuyet,
  nhanSuVuotPhanBo,
} from '../../core/models/hr/nhan-su';
import { NhiemVuService } from '../../core/services/hr/nhiem-vu.service';
import { NoiDungCongViecService } from '../../core/services/hr/noi-dung-cong-viec.service';
import {
  IMPORT_TEMPLATE_CSV,
  ImportPreviewRow,
  NhanSuService,
} from '../../core/services/hr/nhan-su.service';
import { exportCsv, exportTableToXls } from '../../core/utils/export-bieu-mau';
import { HrBieuMauPrint, inTrang } from '../../shared/hr/bieu-mau-print/bieu-mau-print';
import { HrPageCard } from '../../shared/hr/page-card/page-card';
import { hrColumns } from '../../shared/hr/table-columns';
import { HR_PAGE_SIZE_MAC_DINH, hrPaginatorProps } from '../../shared/hr/paginator-props';
import { HrTrangThaiTag } from '../../shared/hr/trang-thai-tag/trang-thai-tag';

/** Dòng đưa vào bảng: bản ghi gốc + các ô đã định dạng sẵn. */
type DongHienThi = Record<string, unknown> & { nhanSu: NhanSuNhiemVu; id: string };

/**
 * Danh sách nhân sự tham gia nhiệm vụ — màn "nặng" nhất của đợt 1: lọc, import từ file, sửa/xoá,
 * duyệt hàng loạt, xuất Excel, in biểu mẫu (BM1).
 *
 * Hai điểm nghiệp vụ không được làm hời hợt:
 *  1. **Import có preview**: file được *chấm điểm từng dòng* rồi mới cho nhập, và chỉ nhập dòng
 *     hợp lệ. Dòng lỗi hiện nguyên nhân cụ thể chứ không bị bỏ im lặng.
 *  2. **Cảnh báo vượt phân bổ**: người có tổng `tyLePhanBo` > 100% trong kỳ chồng lấn bị bôi đỏ cả
 *     dòng + đếm ở thẻ thống kê. Lưu ý: từ bản hiệu chỉnh theo tài liệu khách, `tyLePhanBo` là
 *     **trường tham khảo có thể bỏ trống** (BM1 không có cột này), nên cảnh báo chỉ nổ khi người
 *     dùng thực sự khai số — xem ghi chú đầu `core/models/hr/nhan-su.ts`.
 *
 * ## ⚠ Vì sao KHÔNG dùng `UbckImport` / `DialogImportFile` / `ImportFileService`
 *
 * Kế hoạch chuyển đổi (§7) định thay hộp nhập file tự viết bằng bộ import của `@khcn-core/ui`.
 * Đọc kiểu của nó thì **không dùng được ở đợt này**: `ImportConfig` bắt buộc `httpService`,
 * `uploadEndpoint` và `downloadFileUrl` — nghĩa là luồng **do máy chủ xử lý**: đẩy file lên, chờ,
 * rồi nhận về `{ successCount, errorCount, errorFileName }` và tải file lỗi. HR Tools đợt 1 chạy
 * **dữ liệu mô phỏng, chưa có backend**, và phần giá trị nhất của màn này là *nêu đúng nguyên nhân
 * từng dòng ngay trước khi nhập* — thứ mà API kia không trả về.
 *
 * Nên: giữ luồng soát lỗi tại chỗ, còn **vỏ** thì dựng lại bằng component thư viện
 * (`cmm-dialog` + `cmm-fileUpload` + `ubck-table` cho bảng preview). Khi có endpoint import thật
 * thì đổi sang `UbckImport` là hợp lý — đã ghi thành nợ tường minh trong `DELIVERY_STATE.md`.
 */
@Component({
  selector: 'app-hr-nhan-su-list',
  imports: [
    UBCKTableModule,
    UBCKPaginatorModule,
    CmmButtonComponent,
    CmmDialogComponent,
    CmmFileUploadComponent,
    CmmInputText,
    CmmSelectComponent,
    CmmTextareaDirective,
    DeleteIconComponent,
    EditIconComponent,
    HrBieuMauPrint,
    HrPageCard,
    HrTrangThaiTag,
  ],
  templateUrl: './hr-nhan-su-list.html',
  styleUrl: './hr-nhan-su-list.scss',
})
export class HrNhanSuListPage {
  private readonly service = inject(NhanSuService);
  private readonly nhiemVuService = inject(NhiemVuService);
  private readonly ndcvService = inject(NoiDungCongViecService);
  private readonly auth = inject(AuthService);
  private readonly toast = inject(ToastService);
  private readonly router = inject(Router);

  readonly trangThaiOptions = (Object.keys(NHAN_SU_TRANG_THAI_LABEL) as NhanSuTrangThaiDuyet[]).map(
    (value) => ({ value, label: NHAN_SU_TRANG_THAI_LABEL[value] }),
  );

  readonly nhiemVuOptions = computed(() =>
    this.nhiemVuService
      .rows()
      .map((d) => ({ value: d.maNhiemVu, label: `${d.maNhiemVu} — ${d.tenNhiemVu}` })),
  );

  readonly tuKhoa = signal('');
  readonly nhiemVuFilter = signal<string | null>(null);
  readonly trangThaiFilter = signal<NhanSuTrangThaiDuyet | null>(null);
  readonly pageIndex = signal(1);
  readonly pageSize = signal(HR_PAGE_SIZE_MAC_DINH);

  /** Dòng đang tích — do `UbckTable` ghi vào. */
  readonly chonDong = signal<DongHienThi[]>([]);

  readonly importMo = signal(false);
  readonly importPreview = signal<ImportPreviewRow[]>([]);
  readonly importTenFile = signal('');
  readonly importLoiDoc = signal<string | null>(null);

  readonly xoaMo = signal(false);
  readonly xoaTarget = signal<NhanSuNhiemVu | null>(null);

  readonly tuChoiMo = signal(false);
  readonly tuChoiLyDo = signal('');

  readonly tatCa = this.service.rows;

  /** Tập mã nhân viên vượt 100% — tính trên TOÀN BỘ dữ liệu, không phải trên trang đang xem. */
  readonly vuotPhanBo = computed(() => nhanSuVuotPhanBo(this.tatCa()));

  readonly rows = computed(() => {
    const q = this.tuKhoa().trim().toLocaleLowerCase('vi');
    const nhiemVu = this.nhiemVuFilter();
    const tt = this.trangThaiFilter();
    return this.tatCa().filter((r) => {
      if (nhiemVu && r.nhiemVuId !== nhiemVu) return false;
      if (tt && r.trangThaiDuyet !== tt) return false;
      if (!q) return true;
      return [r.maNhanVien, r.hoTen, r.email, r.donVi, r.vaiTroThamGia].some((v) =>
        v.toLocaleLowerCase('vi').includes(q),
      );
    });
  });

  readonly pagedRows = computed<DongHienThi[]>(() => {
    const start = (this.pageIndex() - 1) * this.pageSize();
    return this.rows()
      .slice(start, start + this.pageSize())
      .map((row) => ({
        ...row,
        nhanSu: row,
        // `UbckTable` gắn lớp này lên `<tr>` từ trường `rowcCustomClasses` — tên viết tắt sai chính
        // tả là của thư viện, không phải lỗi gõ ở đây; đổi cho "đúng" là mất tô đỏ dòng cảnh báo.
        rowcCustomClasses: this.laVuot(row) ? 'hr-row-canhbao' : '',
        _thoiGian: `${row.tuNgay} - ${row.denNgay}`,
        _noiDung: this.tenNoiDung(row.noiDungCongViecIds),
        _tyLe: row.tyLePhanBo == null ? '—' : `${row.tyLePhanBo}%`,
      }));
  });

  readonly soDaChon = computed(() => this.chonDong().length);
  readonly soChoDuyet = this.service.soChoDuyet;
  readonly soVuot = computed(() => this.vuotPhanBo().size);

  readonly soDongHopLe = computed(() => this.importPreview().filter((p) => p.hopLe).length);
  readonly soDongLoi = computed(() => this.importPreview().filter((p) => !p.hopLe).length);

  /** Dữ liệu cho view in — phẳng hoá đúng thứ tự cột của BM1. */
  readonly dongIn = computed(() =>
    this.rows().map((r) => [
      r.maNhanVien,
      r.hoTen,
      r.chucDanh,
      r.nhiemVuId,
      r.vaiTroThamGia,
      this.tenNoiDung(r.noiDungCongViecIds),
      `${r.tuNgay} - ${r.denNgay}`,
      NHAN_SU_TRANG_THAI_LABEL[r.trangThaiDuyet],
    ]),
  );

  readonly cotIn = [
    'Mã NV',
    'Họ và tên',
    'Chức danh',
    'Mã nhiệm vụ',
    'Vai trò tham gia',
    'Nội dung công việc tham gia',
    'Thời gian tham gia',
    'Trạng thái',
  ];

  // ------------------------------------------------------------------- bảng

  private readonly tplThaoTac = viewChild.required<TemplateRef<unknown>>('tplThaoTac');
  private readonly tplNguoi = viewChild.required<TemplateRef<unknown>>('tplNguoi');
  private readonly tplNhiemVu = viewChild.required<TemplateRef<unknown>>('tplNhiemVu');
  private readonly tplTrangThai = viewChild.required<TemplateRef<unknown>>('tplTrangThai');

  readonly columns = computed<ColumnDefinition[][]>(() =>
    hrColumns([
      {
        field: 'thaoTac',
        header: 'Thao tác',
        customTemplate: this.tplThaoTac(),
        maxWidth: '110px',
      },
      { field: 'maNhanVien', header: 'Mã NV', maxWidth: '110px' },
      { field: 'hoTen', header: 'Họ và tên', customTemplate: this.tplNguoi(), maxWidth: '240px' },
      { field: 'donVi', header: 'Đơn vị', maxWidth: '180px' },
      {
        field: 'nhiemVuId',
        header: 'Mã nhiệm vụ',
        customTemplate: this.tplNhiemVu(),
        maxWidth: '150px',
      },
      { field: 'vaiTroThamGia', header: 'Vai trò tham gia', maxWidth: '170px' },
      { field: '_noiDung', header: 'Nội dung công việc', maxWidth: '240px' },
      { field: '_tyLe', header: 'Tỷ lệ dự kiến', maxWidth: '130px' },
      { field: '_thoiGian', header: 'Thời gian tham gia', maxWidth: '200px' },
      {
        field: 'trangThaiDuyet',
        header: 'Trạng thái',
        customTemplate: this.tplTrangThai(),
        maxWidth: '150px',
      },
    ]),
  );

  readonly tableProps = {
    isShowOrder: true,
    colOrderName: 'STT',
    isShowCheckBox: true,
    selectionMode: 'multiple' as const,
    selectionPageOnly: true,
    showIndeterminateCheckAll: true,
    dataKey: 'id',
    scrollable: true,
    rowHover: true,
  };

  readonly paginatorProps = computed<PaginatorProps>(() =>
    hrPaginatorProps(this.rows().length, this.pageIndex(), this.pageSize()),
  );

  doiTrang(state: UBCKPaginatorState): void {
    this.pageIndex.set(state.currentPage);
    this.pageSize.set(state.recordPerPage);
    this.chonDong.set([]);
  }

  // ---------------------------------------------------------- bảng preview import

  private readonly tplPreviewKetQua = viewChild.required<TemplateRef<unknown>>('tplPreviewKetQua');

  readonly previewColumns = computed<ColumnDefinition[][]>(() =>
    hrColumns([
      {
        field: 'ketQua',
        header: 'Kết quả',
        customTemplate: this.tplPreviewKetQua(),
        maxWidth: '260px',
      },
      { field: '_maNhanVien', header: 'Mã NV', maxWidth: '110px' },
      { field: '_hoTen', header: 'Họ và tên', maxWidth: '200px' },
      { field: '_nhiemVuId', header: 'Mã nhiệm vụ', maxWidth: '140px' },
      { field: '_vaiTro', header: 'Vai trò', maxWidth: '160px' },
    ]),
  );

  readonly previewProps = { isShowOrder: true, colOrderName: 'Dòng', scrollable: true };

  /** Dòng preview đưa vào bảng — `raw` là dữ liệu thô đọc từ file, có thể thiếu trường. */
  readonly previewRows = computed<Record<string, unknown>[]>(() =>
    this.importPreview().map((p) => ({
      preview: p,
      rowcCustomClasses: p.hopLe ? '' : 'hr-row-canhbao',
      _maNhanVien: p.raw.maNhanVien ?? '',
      _hoTen: p.raw.hoTen ?? '',
      _nhiemVuId: p.raw.nhiemVuId ?? '',
      _vaiTro: p.raw.vaiTroThamGia ?? '',
    })),
  );

  /*
   * Nhãn + màu tag đọc qua HÀM chứ không tra bảng thẳng trong template.
   *
   * Biến ngầm định của `<ng-template>` mà `UbckTable` truyền vào luôn có kiểu `any`, mà chế độ
   * kiểm kiểu template nghiêm ngặt của Angular không cho `any` làm khoá của `Record<...>`
   * (TS7053) — build đỏ. Hàm nhận tham số đã khai kiểu thì `any` truyền vào được, và chỗ khai kiểu
   * nằm ở đây, một chỗ, thay vì rải `$any(...)` khắp template.
   */
  nhanTrangThai(tt: NhanSuTrangThaiDuyet) {
    return NHAN_SU_TRANG_THAI_LABEL[tt];
  }

  mauTrangThai(tt: NhanSuTrangThaiDuyet) {
    return NHAN_SU_TRANG_THAI_COLOR[tt];
  }

  private actor(): string {
    return this.auth.user()?.hoTen ?? 'Người dùng demo';
  }

  laVuot(row: NhanSuNhiemVu): boolean {
    return this.vuotPhanBo().has(row.maNhanVien);
  }

  tongPhanBoCua(row: NhanSuNhiemVu): number {
    return this.service.tongPhanBo(row.maNhanVien, row);
  }

  /** Tên nội dung công việc — BM1 cột *Nội dung công việc tham gia*. Rỗng in `—`, không in `[]`. */
  tenNoiDung(ids: readonly string[]): string {
    return ids.length ? this.ndcvService.tenCua(ids).join(', ') : '—';
  }

  timKiem(value: string): void {
    this.tuKhoa.set(value);
    this.pageIndex.set(1);
  }

  locNhiemVu(value: string | null): void {
    this.nhiemVuFilter.set(value);
    this.pageIndex.set(1);
  }

  locTrangThai(value: NhanSuTrangThaiDuyet | null): void {
    this.trangThaiFilter.set(value);
    this.pageIndex.set(1);
  }

  // ------------------------------------------------------------------ thao tác

  themMoi(): void {
    void this.router.navigate(['/hr/nhan-su/moi']);
  }

  moNhiemVu(maNhiemVu: string): void {
    void this.router.navigate(['/hr/nhiem-vu', maNhiemVu]);
  }

  sua(row: NhanSuNhiemVu): void {
    void this.router.navigate(['/hr/nhan-su', row.id, 'sua']);
  }

  moXoa(row: NhanSuNhiemVu): void {
    this.xoaTarget.set(row);
    this.xoaMo.set(true);
  }

  xacNhanXoa(): void {
    const row = this.xoaTarget();
    if (!row) return;
    this.service.remove(row.id);
    this.xoaMo.set(false);
    this.toast.success(`Đã xoá phân công của ${row.hoTen}.`);
  }

  private idsDangChon(): string[] {
    return this.chonDong().map((d) => d.id);
  }

  trinhDuyet(): void {
    const chon = this.idsDangChon();
    if (!chon.length) return;
    this.service.submit(chon, this.actor());
    this.chonDong.set([]);
    this.toast.success(`Đã trình duyệt ${chon.length} dòng.`);
  }

  duyet(): void {
    const chon = this.idsDangChon();
    if (!chon.length) return;
    this.service.approve(chon, this.actor());
    this.chonDong.set([]);
    this.toast.success(`Đã duyệt ${chon.length} dòng.`);
  }

  moTuChoi(): void {
    if (!this.soDaChon()) return;
    this.tuChoiLyDo.set('');
    this.tuChoiMo.set(true);
  }

  xacNhanTuChoi(): void {
    const lyDo = this.tuChoiLyDo().trim();
    const chon = this.idsDangChon();
    if (!lyDo || !chon.length) return;
    this.service.reject(chon, this.actor(), lyDo);
    this.chonDong.set([]);
    this.tuChoiMo.set(false);
    this.toast.success(`Đã từ chối ${chon.length} dòng.`);
  }

  // --------------------------------------------------------------- xuất & in

  xuatExcel(): void {
    exportTableToXls(
      this.rows(),
      [
        { header: 'Mã NV', value: (r) => r.maNhanVien },
        { header: 'Họ và tên', value: (r) => r.hoTen },
        { header: 'Email', value: (r) => r.email },
        { header: 'Đơn vị', value: (r) => r.donVi },
        { header: 'Chức danh', value: (r) => r.chucDanh },
        { header: 'Mã nhiệm vụ', value: (r) => r.nhiemVuId },
        { header: 'Vai trò tham gia', value: (r) => r.vaiTroThamGia },
        {
          header: 'Nội dung công việc tham gia',
          value: (r) => this.tenNoiDung(r.noiDungCongViecIds),
        },
        // Bỏ trống thì để trống trong file xuất — điền 0 sẽ bị đọc thành "phân bổ 0%".
        { header: 'Tỷ lệ dự kiến (%)', value: (r) => r.tyLePhanBo ?? '' },
        { header: 'Từ ngày', value: (r) => r.tuNgay },
        { header: 'Đến ngày', value: (r) => r.denNgay },
        { header: 'Trạng thái', value: (r) => NHAN_SU_TRANG_THAI_LABEL[r.trangThaiDuyet] },
        { header: 'Ghi chú', value: (r) => r.ghiChu },
      ],
      'danh-sach-nhan-su-nhiem-vu',
      'DANH SÁCH NHÂN SỰ THAM GIA NHIỆM VỤ',
    );
    this.toast.success('Đã kết xuất file Excel.');
  }

  /** Tên `in()` không dùng được trong template Angular — `in` là toán tử của biểu thức. */
  inDanhSach(): void {
    inTrang();
  }

  // ------------------------------------------------------------------- import

  moImport(): void {
    this.importPreview.set([]);
    this.importTenFile.set('');
    this.importLoiDoc.set(null);
    this.importMo.set(true);
  }

  taiFileMau(): void {
    exportCsv(IMPORT_TEMPLATE_CSV, 'mau-nhap-nhan-su-nhiem-vu');
  }

  /**
   * Người dùng chọn file → đọc bằng `FileReader` và soát lỗi NGAY TẠI CLIENT, không gửi đi đâu.
   *
   * `cmm-fileUpload` chạy ở chế độ `customUpload` + `auto = false` và ta chỉ nghe `onSelect`; không
   * có `url` nên component không tự đẩy file lên đâu cả. Đây là cùng cách
   * `pages/process-catalog/process-catalog.ts` xử lý file BPMN.
   */
  chonFile(files: readonly File[]): void {
    const file = files[0];
    if (!file) {
      this.importLoiDoc.set('Trình duyệt không cung cấp nội dung file. Vui lòng chọn lại.');
      return;
    }
    this.importTenFile.set(file.name);
    this.importLoiDoc.set(null);

    const reader = new FileReader();
    reader.onload = () => {
      const text = String(reader.result ?? '');
      const raws = this.service.docFileImport(text);
      if (!raws.length) {
        this.importLoiDoc.set('File không có dòng dữ liệu nào.');
        this.importPreview.set([]);
        return;
      }
      this.importPreview.set(this.service.phanTichFileImport(raws));
    };
    reader.onerror = () => this.importLoiDoc.set('Không đọc được nội dung file.');
    reader.readAsText(file, 'utf-8');
  }

  nhapDuLieu(): void {
    const soLoi = this.soDongLoi();
    const so = this.service.importRows(this.importPreview(), this.actor());
    this.importMo.set(false);
    this.pageIndex.set(1);
    this.toast.success(`Đã nhập ${so} dòng hợp lệ${soLoi ? `, bỏ qua ${soLoi} dòng lỗi` : ''}.`);
  }
}
