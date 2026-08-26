import { Component, computed, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';

import { NzButtonModule } from 'ng-zorro-antd/button';
import { NzIconModule } from 'ng-zorro-antd/icon';
import { NzInputModule } from 'ng-zorro-antd/input';
import { NzMessageService } from 'ng-zorro-antd/message';
import { NzModalModule } from 'ng-zorro-antd/modal';
import { NzPopconfirmModule } from 'ng-zorro-antd/popconfirm';
import { NzSelectModule } from 'ng-zorro-antd/select';
import { NzTableModule } from 'ng-zorro-antd/table';

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
  formatTien,
  khoangThoiGian,
} from '../../core/models/hr/nhiem-vu';
import { NhiemVuInput, NhiemVuService } from '../../core/services/hr/nhiem-vu.service';
import { HrNhiemVuFormModal } from '../../shared/hr/nhiem-vu-form-modal/nhiem-vu-form-modal';
import { HrPageCard } from '../../shared/hr/page-card/page-card';
import { HrTableFooter } from '../../shared/hr/table-footer/table-footer';
import { HrTrangThaiTag } from '../../shared/hr/trang-thai-tag/trang-thai-tag';

/**
 * Danh mục nhiệm vụ — khuôn **DMDC** của bản thiết kế (danh sách + popup), không phải trang form
 * riêng. Đây là màn quản trị: xem toàn bộ nhiệm vụ, sửa, xoá, và **duyệt bản khai** do đơn vị gửi
 * lên (`/hr/khai-bao-nhiem-vu` là phía người khai).
 *
 * Đây chính là màn dựng theo **BM5 — Danh sách nhiệm vụ**: mỗi dòng ở đây là một dòng
 * `PHÂN LOẠI = Chính` của BM5, còn dòng `Thành phần` là nội dung công việc, nằm trong màn chi tiết.
 */
@Component({
  selector: 'app-hr-nhiem-vu-list',
  imports: [
    FormsModule,
    NzButtonModule,
    NzIconModule,
    NzInputModule,
    NzModalModule,
    NzPopconfirmModule,
    NzSelectModule,
    NzTableModule,
    HrNhiemVuFormModal,
    HrPageCard,
    HrTableFooter,
    HrTrangThaiTag,
  ],
  templateUrl: './hr-nhiem-vu-list.html',
  styleUrl: './hr-nhiem-vu-list.scss',
})
export class HrNhiemVuListPage {
  private readonly service = inject(NhiemVuService);
  private readonly auth = inject(AuthService);
  private readonly message = inject(NzMessageService);
  private readonly router = inject(Router);

  readonly trangThaiLabel = NHIEM_VU_TRANG_THAI_LABEL;
  readonly trangThaiMau = NHIEM_VU_TRANG_THAI_COLOR;
  readonly phanLoaiLabel = PHAN_LOAI_LABEL;
  readonly phanNguonLabel = PHAN_NGUON_LABEL;
  readonly tinhTrangLabel = TINH_TRANG_PHAN_BO_LABEL;
  readonly tinhTrangMau = TINH_TRANG_PHAN_BO_COLOR;
  readonly khoiOptions = KHOI_OPTIONS;
  readonly formatTien = formatTien;
  readonly khoangThoiGian = khoangThoiGian;
  readonly nhanNhanSu = nhanNhanSu;

  readonly trangThaiOptions = (Object.keys(NHIEM_VU_TRANG_THAI_LABEL) as NhiemVuTrangThai[]).map((value) => ({
    value,
    label: NHIEM_VU_TRANG_THAI_LABEL[value],
  }));

  readonly phanLoaiOptions = (Object.keys(PHAN_LOAI_LABEL) as PhanLoaiNhiemVu[]).map((value) => ({
    value,
    label: PHAN_LOAI_LABEL[value],
  }));

  readonly tuKhoa = signal('');
  readonly khoiFilter = signal<string | null>(null);
  readonly phanLoaiFilter = signal<PhanLoaiNhiemVu | null>(null);
  readonly trangThaiFilter = signal<NhiemVuTrangThai | null>(null);
  readonly pageIndex = signal(1);
  readonly pageSize = signal(25);

  readonly modalMo = signal(false);
  readonly dangSua = signal<NhiemVu | null>(null);

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

  readonly pagedRows = computed(() => {
    const start = (this.pageIndex() - 1) * this.pageSize();
    return this.rows().slice(start, start + this.pageSize());
  });

  /** STT tính theo vị trí tuyệt đối trong danh sách đã lọc, không phải chỉ số trong trang. */
  stt(indexTrongTrang: number): number {
    return (this.pageIndex() - 1) * this.pageSize() + indexTrongTrang + 1;
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
      this.message.success(`Đã cập nhật nhiệm vụ ${dangSua.maNhiemVu}.`);
    } else {
      this.service.create(input, this.actor());
      this.message.success(`Đã tạo nhiệm vụ ${input.maNhiemVu}.`);
      this.pageIndex.set(1);
    }
    this.modalMo.set(false);
  }

  // ---------------------------------------------------------------- vòng đời

  xoa(row: NhiemVu): void {
    this.service.remove(row.maNhiemVu);
    this.message.success(`Đã xoá nhiệm vụ ${row.maNhiemVu}.`);
  }

  duyet(row: NhiemVu): void {
    this.service.approve(row.maNhiemVu, this.actor());
    this.message.success(`Đã duyệt bản khai ${row.maNhiemVu}.`);
  }

  /**
   * Từ chối bắt buộc nêu lý do — lý do đi thẳng vào `lichSu` của nhiệm vụ. Dùng modal riêng có ô
   * nhập chứ không phải `modal.confirm`: confirm chỉ có nút Đồng ý/Huỷ, không có chỗ gõ lý do, và
   * "từ chối không nêu lý do" thì người khai không biết phải sửa gì.
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
    this.message.success(`Đã từ chối bản khai ${ma}.`);
  }
}
