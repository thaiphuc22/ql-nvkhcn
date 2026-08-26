import { Component, effect, inject, input, output, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';

import { DatePicker } from 'primeng/datepicker';
import {
  CmmButtonComponent,
  CmmDialogComponent,
  CmmInputText,
  CmmInputnumberComponent,
  CmmMultiselectComponent,
  CmmSelectComponent,
  CmmTextareaDirective,
} from '@khcn-core/ui';

import { HR_DATE_FORMAT, hrToDate, hrToIso } from '../../../core/utils/hr-date';

import { KHOI_OPTIONS, donViCap5Cua } from '../../../core/models/hr/don-vi';
import { UNG_VIEN_NHAN_SU } from '../../../core/models/hr/nhan-su';
import {
  NhiemVu,
  PHAN_LOAI_LABEL,
  PHAN_NGUON_CHON_DUOC,
  PHAN_NGUON_LABEL,
  PhanLoaiNhiemVu,
  PhanNguon,
  TINH_TRANG_PHAN_BO_LABEL,
  TinhTrangPhanBo,
  coLapDuToan,
} from '../../../core/models/hr/nhiem-vu';
import { NhiemVuInput, NhiemVuService } from '../../../core/services/hr/nhiem-vu.service';

/**
 * Popup khai báo/sửa nhiệm vụ theo khuôn DMDC.
 *
 * Tách thành component dùng chung vì HAI màn cần đúng cái form này — Danh mục nhiệm vụ
 * (`/hr/nhiem-vu`, phía quản trị) và Khai báo nhiệm vụ (`/hr/khai-bao-nhiem-vu`, phía người khai).
 * Chép đôi ~150 dòng template là cách chắc chắn để hai màn lệch nhau sau vài lần sửa quy tắc kiểm tra.
 *
 * **Rộng 720px chứ không 520px** như các popup DMDC khác: BM5 có 18 trường bắt buộc khai, nhồi vào
 * 520px thì mọi thứ nằm dưới đường cuộn và người khai không thấy được cặp `Tổng dự toán` /
 * `CPNC phê duyệt` cạnh nhau — mà đó chính là cặp số hay bị nhập nhầm thành một.
 *
 * Ba ràng buộc nghiệp vụ cài ngay trong form, không để trôi xuống tầng dưới:
 *  1. `maDeTai`/`tenDeTai` **chỉ hiện khi nguồn = KHCN** (kế hoạch §2.1) — đổi nguồn thì xoá luôn
 *     giá trị cũ, tránh nhiệm vụ SXKD vẫn đeo mã đề tài của lần khai trước.
 *  2. Nguồn **Bảo hành không lập dự toán** ⇒ CPNC phê duyệt phải để 0, không phải "quên nhập".
 *  3. Đổi Khối thì đơn vị chủ trì và đơn vị phân bổ **reset**: đơn vị cấp 5 thuộc đúng một khối.
 */
function formTrong(maGoiY: string): NhiemVuInput {
  const nam = new Date().getFullYear();
  return {
    maNhiemVu: maGoiY,
    tenNhiemVu: '',
    maDeTai: null,
    tenDeTai: null,
    khoi: '',
    donViChuTri: '',
    donViPhanBo: [],
    phanLoai: 'KHCN',
    phanNguon: 'KHCN',
    pmMaNhanVien: '',
    paMaNhanVien: '',
    tongDuToan: 0,
    chiPhiNhanCongPheDuyet: 0,
    duPhong: 0,
    tuNgay: `${nam}-01-01`,
    denNgay: `${nam}-12-31`,
    tinhTrangPhanBo: 'DANG_TRINH_PHE_DUYET',
    moTa: '',
  };
}

@Component({
  selector: 'hr-nhiem-vu-form-modal',
  imports: [
    FormsModule,
    DatePicker,
    CmmButtonComponent,
    CmmDialogComponent,
    CmmInputText,
    CmmInputnumberComponent,
    CmmMultiselectComponent,
    CmmSelectComponent,
    CmmTextareaDirective,
  ],
  templateUrl: './nhiem-vu-form-modal.html',
})
export class HrNhiemVuFormModal {
  private readonly service = inject(NhiemVuService);

  readonly visible = input.required<boolean>();
  /** `null` = tạo mới; khác `null` = sửa (khoá ô mã nhiệm vụ). */
  readonly nhiemVu = input<NhiemVu | null>(null);

  readonly huy = output<void>();
  readonly luu = output<NhiemVuInput>();

  /** `cmm-select` nhận `{ value, label }` — mảng chuỗi trần không dùng được. */
  readonly khoiOptions = KHOI_OPTIONS.map((value) => ({ value, label: value }));

  readonly nhanSuOptions = UNG_VIEN_NHAN_SU.map((u) => ({
    value: u.maNhanVien,
    label: `${u.hoTen} (${u.email})`,
  }));

  readonly dateFormat = HR_DATE_FORMAT;

  readonly phanLoaiOptions = (Object.keys(PHAN_LOAI_LABEL) as PhanLoaiNhiemVu[]).map((value) => ({
    value,
    label: PHAN_LOAI_LABEL[value],
  }));

  readonly phanNguonOptions = PHAN_NGUON_CHON_DUOC.map((value) => ({
    value,
    label: PHAN_NGUON_LABEL[value],
  }));

  readonly tinhTrangOptions = (Object.keys(TINH_TRANG_PHAN_BO_LABEL) as TinhTrangPhanBo[]).map(
    (value) => ({
      value,
      label: TINH_TRANG_PHAN_BO_LABEL[value],
    }),
  );

  readonly form = signal<NhiemVuInput>(formTrong(''));
  readonly loi = signal<string[]>([]);

  constructor() {
    // Nạp lại form mỗi lần popup mở — nếu giữ state cũ, bấm "Thêm mới" ngay sau khi sửa một nhiệm
    // vụ sẽ thấy dữ liệu của nhiệm vụ vừa sửa.
    effect(() => {
      if (!this.visible()) return;
      const d = this.nhiemVu();
      this.loi.set([]);
      this.form.set(
        d
          ? {
              maNhiemVu: d.maNhiemVu,
              tenNhiemVu: d.tenNhiemVu,
              maDeTai: d.maDeTai,
              tenDeTai: d.tenDeTai,
              khoi: d.khoi,
              donViChuTri: d.donViChuTri,
              donViPhanBo: [...d.donViPhanBo],
              phanLoai: d.phanLoai,
              phanNguon: d.phanNguon,
              pmMaNhanVien: d.pmMaNhanVien,
              paMaNhanVien: d.paMaNhanVien,
              tongDuToan: d.tongDuToan,
              chiPhiNhanCongPheDuyet: d.chiPhiNhanCongPheDuyet,
              duPhong: d.duPhong,
              tuNgay: d.tuNgay,
              denNgay: d.denNgay,
              tinhTrangPhanBo: d.tinhTrangPhanBo,
              moTa: d.moTa,
            }
          : formTrong(this.service.maKeTiep()),
      );
    });
  }

  /** Đơn vị cấp 5 của khối đang chọn — nguồn cho cả "Đơn vị chủ trì" lẫn "Đơn vị phân bổ". */
  donViOptions(): { value: string; label: string }[] {
    return donViCap5Cua(this.form().khoi).map((value) => ({ value, label: value }));
  }

  /*
   * Ngày: model giữ chuỗi ISO `YYYY-MM-DD`, `cmm-datepicker` cần `Date`. Đổi kiểu ở đúng biên này
   * chứ không đổi model — xem `core/utils/hr-date.ts` (có cả cái bẫy lệch ngày do múi giờ).
   */
  ngayDate(key: 'tuNgay' | 'denNgay'): Date | null {
    return hrToDate(this.form()[key]);
  }

  doiNgay(key: 'tuNgay' | 'denNgay', value: Date | null): void {
    this.capNhat(key, hrToIso(value));
  }

  laNguonKHCN(): boolean {
    return this.form().phanNguon === 'KHCN';
  }

  laBaoHanh(): boolean {
    return !coLapDuToan(this.form().phanNguon);
  }

  capNhat<K extends keyof NhiemVuInput>(key: K, value: NhiemVuInput[K]): void {
    this.form.update((f) => ({ ...f, [key]: value }));
  }

  doiKhoi(khoi: string): void {
    this.form.update((f) => ({ ...f, khoi, donViChuTri: '', donViPhanBo: [] }));
  }

  doiNguon(phanNguon: PhanNguon): void {
    this.form.update((f) => ({
      ...f,
      phanNguon,
      // Nguồn không phải KHCN thì không có đề tài; nguồn Bảo hành thì không lập dự toán.
      maDeTai: phanNguon === 'KHCN' ? f.maDeTai : null,
      tenDeTai: phanNguon === 'KHCN' ? f.tenDeTai : null,
      chiPhiNhanCongPheDuyet: coLapDuToan(phanNguon) ? f.chiPhiNhanCongPheDuyet : 0,
      duPhong: coLapDuToan(phanNguon) ? f.duPhong : 0,
    }));
  }

  /** Chọn đơn vị chủ trì thì tự đưa nó vào danh sách phân bổ — BM5 luôn có dòng của đơn vị chủ trì. */
  doiDonViChuTri(donViChuTri: string): void {
    this.form.update((f) => ({
      ...f,
      donViChuTri,
      donViPhanBo: f.donViPhanBo.includes(donViChuTri)
        ? f.donViPhanBo
        : [donViChuTri, ...f.donViPhanBo],
    }));
  }

  xacNhan(): void {
    const f = this.form();
    const dangSua = this.nhiemVu();
    const loi: string[] = [];

    if (!f.maNhiemVu.trim()) loi.push('Mã nhiệm vụ không được để trống.');
    else if (!dangSua && this.service.daTonTai(f.maNhiemVu))
      loi.push(`Mã nhiệm vụ ${f.maNhiemVu} đã tồn tại.`);
    if (!f.tenNhiemVu.trim()) loi.push('Tên nhiệm vụ không được để trống.');
    if (!f.khoi) loi.push('Chưa chọn khối (đơn vị cấp 4).');
    if (!f.donViChuTri) loi.push('Chưa chọn đơn vị chủ trì.');
    if (!f.donViPhanBo.length) loi.push('Chưa chọn đơn vị phân bổ nào.');
    if (!f.pmMaNhanVien) loi.push('Chưa chọn PM của nhiệm vụ.');
    if (!f.paMaNhanVien) loi.push('Chưa chọn PA của đơn vị chủ trì.');
    if (f.pmMaNhanVien && f.pmMaNhanVien === f.paMaNhanVien)
      loi.push('PM và PA phải là hai người khác nhau.');

    if (!(f.tongDuToan > 0)) loi.push('Tổng dự toán phải lớn hơn 0.');
    if (this.laBaoHanh()) {
      // Không phải "quên nhập": nguồn Bảo hành chỉ theo dõi số đã phân bổ (kế hoạch §2.4).
      if (f.chiPhiNhanCongPheDuyet !== 0)
        loi.push('Nguồn Bảo hành không lập dự toán — để CPNC phê duyệt bằng 0.');
    } else {
      if (!(f.chiPhiNhanCongPheDuyet > 0))
        loi.push('Chi phí nhân công được phê duyệt phải lớn hơn 0.');
      else if (f.chiPhiNhanCongPheDuyet > f.tongDuToan) {
        loi.push('Chi phí nhân công được phê duyệt không được lớn hơn tổng dự toán.');
      }
    }
    if (f.duPhong < 0) loi.push('Dự phòng không được âm.');

    if (!f.tuNgay || !f.denNgay) loi.push('Chưa nhập thời gian thực hiện.');
    else if (f.tuNgay > f.denNgay) loi.push('Ngày bắt đầu phải trước ngày kết thúc.');

    this.loi.set(loi);
    if (loi.length) return;

    this.luu.emit({
      ...f,
      maNhiemVu: f.maNhiemVu.trim().toUpperCase(),
      maDeTai: f.maDeTai?.trim() ? f.maDeTai.trim().toUpperCase() : null,
      tenDeTai: f.tenDeTai?.trim() ? f.tenDeTai.trim() : null,
    });
  }
}
