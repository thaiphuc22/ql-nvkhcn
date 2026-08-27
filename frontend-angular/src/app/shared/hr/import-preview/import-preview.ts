import { Component, TemplateRef, computed, input, output, viewChild } from '@angular/core';

import {
  CmmButtonComponent,
  CmmDialogComponent,
  CmmFileUploadComponent,
  ColumnDefinition,
  UBCKTableModule,
} from '@khcn-core/ui';

import { hrColumns } from '../table-columns';
import { HrTrangThaiTag } from '../trang-thai-tag/trang-thai-tag';
import { ImportDongPreview, demTheoMuc } from './import-preview.model';

/**
 * Hộp thoại **nhập file có preview** — dùng chung cho mọi luồng import của HR Tools
 * (danh mục ở đợt 1.5; bảng công, bảng lương, BM5 ở đợt 2).
 *
 * Kế hoạch §6.6 đặt việc tách component này là **việc đầu tiên của đợt 2**, với lý do: chép luồng
 * preview sang màn thứ hai là có hai bộ luật validate sống song song, sửa một bên quên bên kia.
 * Ở đây tách sớm hơn một nhịp vì đợt 1.5 đã là màn import thứ hai rồi.
 *
 * ## Ranh giới trách nhiệm — đọc trước khi thêm gì vào đây
 *
 * Component này **không biết luật nghiệp vụ nào**. Nó nhận một mảng `ImportDongPreview` đã chấm
 * điểm sẵn và chỉ lo phần vỏ: chọn file, thống kê 3 con số, bảng lỗi, nút xác nhận. Luật ở lại
 * trong service của từng miền — bộ danh mục ở `DanhMucService.phanTichFile`, bộ `PhanBoCong` sẽ ở
 * chỗ khác, và hai bộ đó **khác hẳn nhau** (§6.6). Nhồi một cái `if (loai === ...)` vào đây là bắt
 * đầu con đường dẫn tới đúng thứ mà việc tách này định tránh.
 *
 * ## Vì sao không dùng `UbckImport` của thư viện
 *
 * Đã ghi ở `pages/hr-nhan-su-list/hr-nhan-su-list.ts`: `ImportConfig` bắt buộc `httpService` +
 * `uploadEndpoint` — luồng do **máy chủ** xử lý, trả về `{ successCount, errorCount }`. HR Tools
 * chưa có backend, và phần giá trị nhất của màn này là *nêu đúng nguyên nhân từng dòng*, thứ API
 * kia không trả về. Đổi sang `UbckImport` là việc của đợt 6.
 */
@Component({
  selector: 'hr-import-preview',
  imports: [
    CmmButtonComponent,
    CmmDialogComponent,
    CmmFileUploadComponent,
    UBCKTableModule,
    HrTrangThaiTag,
  ],
  templateUrl: './import-preview.html',
  styleUrl: './import-preview.scss',
})
export class HrImportPreview {
  readonly mo = input.required<boolean>();
  readonly tieuDe = input('Nhập dữ liệu từ file');
  /** Nhãn cột khoá của bảng preview — `Mã NV` với nhân viên, `Mã` với danh mục khác. */
  readonly nhanCotKhoa = input('Mã');
  readonly nhanCotNhan = input('Tên');
  readonly tenFile = input('');
  readonly loiDocFile = input<string | null>(null);
  readonly dong = input<readonly ImportDongPreview[]>([]);
  /**
   * Dòng cảnh báo ở chân hộp thoại — chỗ nói *"kỳ 05/2025 đã có dữ liệu, nhập lại sẽ ĐÈ CẢ KỲ"*.
   * Để trống thì chân hộp thoại chỉ có hai nút.
   */
  readonly canhBaoChan = input('');

  readonly moChange = output<boolean>();
  readonly chonFile = output<File>();
  readonly taiFileMau = output<void>();
  readonly xacNhan = output<void>();

  readonly dem = computed(() => demTheoMuc(this.dong()));

  /** Chỉ hiện các dòng CÓ vấn đề: 1.164 dòng sạch cuộn qua không nói thêm điều gì. */
  readonly dongCoVanDe = computed(() => this.dong().filter((d) => d.vanDe.length > 0));

  private readonly tplMuc = viewChild.required<TemplateRef<unknown>>('tplMuc');
  private readonly tplVanDe = viewChild.required<TemplateRef<unknown>>('tplVanDe');

  readonly previewRows = computed<Record<string, unknown>[]>(() =>
    this.dongCoVanDe().map((d) => ({
      ...d,
      _mucDo: d.hopLe ? 'CANH_BAO' : 'LOI',
      _xuLy: d.vanDe.map((v) => v.xuLy).filter(Boolean).join(' · ') || '—',
    })),
  );

  readonly previewColumns = computed<ColumnDefinition[][]>(() =>
    hrColumns([
      // `minWidth` = `maxWidth` ở mọi cột: chỉ đặt `maxWidth` thì trình duyệt vẫn co cột khi tổng
      // vượt khung hộp thoại, và thứ bị cắt là chính cột Mã — đúng cột người dùng cần để tìm dòng
      // trong file. Đo bằng mắt ngày 2026-08-27.
      { field: 'soDong', header: 'Dòng', minWidth: '70px', maxWidth: '70px' },
      {
        field: '_mucDo',
        header: 'Mức',
        customTemplate: this.tplMuc(),
        minWidth: '120px',
        maxWidth: '120px',
      },
      { field: 'khoa', header: this.nhanCotKhoa(), minWidth: '140px', maxWidth: '140px' },
      { field: 'nhan', header: this.nhanCotNhan(), minWidth: '180px', maxWidth: '180px' },
      { field: 'vanDe', header: 'Vấn đề', customTemplate: this.tplVanDe(), minWidth: '260px' },
      { field: '_xuLy', header: 'Xử lý', minWidth: '150px', maxWidth: '150px' },
    ]),
  );

  readonly previewProps = { scrollable: true, rowHover: true, dataKey: 'soDong' };

  /**
   * `onSelect` của `cmm-fileUpload` trả `currentFiles`; lấy file đầu và bắn lên trang.
   *
   * Đọc nội dung file là việc của **trang**, không phải của component này: mỗi miền đọc một kiểu
   * (CSV ở danh mục, sẽ là ma trận 31 cột ở BM0), và trang mới là chỗ biết gọi service nào để chấm
   * điểm.
   */
  chon(files: readonly File[] | File[] | null): void {
    const file = files?.[0];
    if (file) this.chonFile.emit(file);
  }
}
