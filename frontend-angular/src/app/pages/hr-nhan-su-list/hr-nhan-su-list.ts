import { Component, computed, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';

import { NzButtonModule } from 'ng-zorro-antd/button';
import { NzCheckboxModule } from 'ng-zorro-antd/checkbox';
import { NzIconModule } from 'ng-zorro-antd/icon';
import { NzInputModule } from 'ng-zorro-antd/input';
import { NzMessageService } from 'ng-zorro-antd/message';
import { NzModalModule } from 'ng-zorro-antd/modal';
import { NzPopconfirmModule } from 'ng-zorro-antd/popconfirm';
import { NzSelectModule } from 'ng-zorro-antd/select';
import { NzTableModule } from 'ng-zorro-antd/table';
import { NzUploadFile, NzUploadModule } from 'ng-zorro-antd/upload';

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
import { nativeUploadFile } from '../../core/utils/upload-file';
import { HrBieuMauPrint, inTrang } from '../../shared/hr/bieu-mau-print/bieu-mau-print';
import { HrPageCard } from '../../shared/hr/page-card/page-card';
import { HrTableFooter } from '../../shared/hr/table-footer/table-footer';
import { HrTrangThaiTag } from '../../shared/hr/trang-thai-tag/trang-thai-tag';

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
 */
@Component({
  selector: 'app-hr-nhan-su-list',
  imports: [
    FormsModule,
    NzButtonModule,
    NzCheckboxModule,
    NzIconModule,
    NzInputModule,
    NzModalModule,
    NzPopconfirmModule,
    NzSelectModule,
    NzTableModule,
    NzUploadModule,
    HrBieuMauPrint,
    HrPageCard,
    HrTableFooter,
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
  private readonly message = inject(NzMessageService);
  private readonly router = inject(Router);

  readonly trangThaiLabel = NHAN_SU_TRANG_THAI_LABEL;
  readonly trangThaiMau = NHAN_SU_TRANG_THAI_COLOR;

  readonly trangThaiOptions = (Object.keys(NHAN_SU_TRANG_THAI_LABEL) as NhanSuTrangThaiDuyet[]).map((value) => ({
    value,
    label: NHAN_SU_TRANG_THAI_LABEL[value],
  }));

  readonly nhiemVuOptions = computed(() =>
    this.nhiemVuService.rows().map((d) => ({ value: d.maNhiemVu, label: `${d.maNhiemVu} — ${d.tenNhiemVu}` })),
  );

  readonly tuKhoa = signal('');
  readonly nhiemVuFilter = signal<string | null>(null);
  readonly trangThaiFilter = signal<NhanSuTrangThaiDuyet | null>(null);
  readonly pageIndex = signal(1);
  readonly pageSize = signal(25);
  readonly daChon = signal<ReadonlySet<string>>(new Set());

  readonly importMo = signal(false);
  readonly importPreview = signal<ImportPreviewRow[]>([]);
  readonly importTenFile = signal('');
  readonly importLoiDoc = signal<string | null>(null);

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

  readonly pagedRows = computed(() => {
    const start = (this.pageIndex() - 1) * this.pageSize();
    return this.rows().slice(start, start + this.pageSize());
  });

  readonly soDaChon = computed(() => this.daChon().size);
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

  stt(i: number): number {
    return (this.pageIndex() - 1) * this.pageSize() + i + 1;
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

  // ----------------------------------------------------------------- chọn dòng

  daTich(id: string): boolean {
    return this.daChon().has(id);
  }

  toggle(row: NhanSuNhiemVu): void {
    const next = new Set(this.daChon());
    if (next.has(row.id)) next.delete(row.id);
    else next.add(row.id);
    this.daChon.set(next);
  }

  tichTatCa(checked: boolean): void {
    this.daChon.set(checked ? new Set(this.pagedRows().map((r) => r.id)) : new Set());
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

  xoa(row: NhanSuNhiemVu): void {
    this.service.remove(row.id);
    this.message.success(`Đã xoá phân công của ${row.hoTen}.`);
  }

  trinhDuyet(): void {
    const chon = [...this.daChon()];
    if (!chon.length) return;
    this.service.submit(chon, this.actor());
    this.daChon.set(new Set());
    this.message.success(`Đã trình duyệt ${chon.length} dòng.`);
  }

  duyet(): void {
    const chon = [...this.daChon()];
    if (!chon.length) return;
    this.service.approve(chon, this.actor());
    this.daChon.set(new Set());
    this.message.success(`Đã duyệt ${chon.length} dòng.`);
  }

  moTuChoi(): void {
    if (!this.daChon().size) return;
    this.tuChoiLyDo.set('');
    this.tuChoiMo.set(true);
  }

  xacNhanTuChoi(): void {
    const lyDo = this.tuChoiLyDo().trim();
    const chon = [...this.daChon()];
    if (!lyDo || !chon.length) return;
    this.service.reject(chon, this.actor(), lyDo);
    this.daChon.set(new Set());
    this.tuChoiMo.set(false);
    this.message.success(`Đã từ chối ${chon.length} dòng.`);
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
        { header: 'Nội dung công việc tham gia', value: (r) => this.tenNoiDung(r.noiDungCongViecIds) },
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
    this.message.success('Đã kết xuất file Excel.');
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
   * Chặn upload thật (`return false`) rồi tự đọc nội dung bằng `FileReader` — cùng cách
   * `pages/process-catalog/process-catalog.ts` xử lý file BPMN. Đợt này không có backend để nhận
   * file, và kể cả khi có thì việc soát lỗi vẫn nên chạy trước ở client.
   */
  beforeUpload = (file: NzUploadFile): boolean => {
    const raw = nativeUploadFile(file);
    if (!raw) {
      this.importLoiDoc.set('Trình duyệt không cung cấp nội dung file. Vui lòng chọn lại.');
      return false;
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
    reader.readAsText(raw, 'utf-8');
    return false;
  };

  nhapDuLieu(): void {
    const so = this.service.importRows(this.importPreview(), this.actor());
    this.importMo.set(false);
    this.pageIndex.set(1);
    this.message.success(`Đã nhập ${so} dòng hợp lệ${this.soDongLoi() ? `, bỏ qua ${this.soDongLoi()} dòng lỗi` : ''}.`);
  }
}
