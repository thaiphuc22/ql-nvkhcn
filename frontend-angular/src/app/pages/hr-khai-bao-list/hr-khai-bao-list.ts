import { Component, computed, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';

import { NzButtonModule } from 'ng-zorro-antd/button';
import { NzCheckboxModule } from 'ng-zorro-antd/checkbox';
import { NzIconModule } from 'ng-zorro-antd/icon';
import { NzInputModule } from 'ng-zorro-antd/input';
import { NzInputNumberModule } from 'ng-zorro-antd/input-number';
import { NzMessageService } from 'ng-zorro-antd/message';
import { NzRadioModule } from 'ng-zorro-antd/radio';
import { NzSelectModule } from 'ng-zorro-antd/select';
import { NzTableModule } from 'ng-zorro-antd/table';

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
import { HrTableFooter } from '../../shared/hr/table-footer/table-footer';
import { HrTrangThaiTag } from '../../shared/hr/trang-thai-tag/trang-thai-tag';

type PhamVi = 'toi' | 'donVi';

interface BoLoc {
  tuKhoa: string;
  phanLoai: PhanLoaiNhiemVu | null;
  khoi: string | null;
  trangThai: NhiemVuTrangThai | null;
  namBatDau: number | null;
}

const LOC_TRONG: BoLoc = { tuKhoa: '', phanLoai: null, khoi: null, trangThai: null, namBatDau: null };

/**
 * Khai báo nhiệm vụ — màn của **người khai** (đối lập với `/hr/nhiem-vu` là màn quản trị duyệt).
 *
 * Hai phạm vi: *Bản khai của tôi* (do chính tài khoản đang đăng nhập khai) và *Của đơn vị* (toàn
 * bộ, để trưởng đơn vị nhìn được việc của nhân viên). Trình duyệt chỉ áp cho bản khai đang ở trạng
 * thái `NHAP` hoặc `TU_CHOI` — chọn dòng đã `CHO_DUYET` rồi trình lại là thao tác vô nghĩa, nên
 * checkbox của các dòng đó bị khoá thay vì im lặng bỏ qua khi bấm.
 *
 * Khối lọc dùng `hr-advanced-search` (lưới 3 cột, `Làm mới`/`Tìm kiếm`) đúng biến thể *Tìm kiếm
 * nâng cao* của bản thiết kế. Bộ lọc chỉ áp khi bấm `Tìm kiếm` — gõ tới đâu lọc tới đó sẽ làm nút
 * `Tìm kiếm` trở thành đồ trang trí.
 */
@Component({
  selector: 'app-hr-khai-bao-list',
  imports: [
    FormsModule,
    NzButtonModule,
    NzCheckboxModule,
    NzIconModule,
    NzInputModule,
    NzInputNumberModule,
    NzRadioModule,
    NzSelectModule,
    NzTableModule,
    HrAdvancedSearch,
    HrNhiemVuFormModal,
    HrPageCard,
    HrTableFooter,
    HrTrangThaiTag,
  ],
  templateUrl: './hr-khai-bao-list.html',
  styleUrl: './hr-khai-bao-list.scss',
})
export class HrKhaiBaoListPage {
  private readonly service = inject(NhiemVuService);
  private readonly auth = inject(AuthService);
  private readonly message = inject(NzMessageService);
  private readonly router = inject(Router);

  readonly trangThaiLabel = NHIEM_VU_TRANG_THAI_LABEL;
  readonly trangThaiMau = NHIEM_VU_TRANG_THAI_COLOR;
  readonly phanLoaiLabel = PHAN_LOAI_LABEL;
  readonly khoiOptions = KHOI_OPTIONS;
  readonly formatTien = formatTien;
  readonly khoangThoiGian = khoangThoiGian;

  readonly trangThaiOptions = (Object.keys(NHIEM_VU_TRANG_THAI_LABEL) as NhiemVuTrangThai[]).map((value) => ({
    value,
    label: NHIEM_VU_TRANG_THAI_LABEL[value],
  }));

  readonly phanLoaiOptions = (Object.keys(PHAN_LOAI_LABEL) as PhanLoaiNhiemVu[]).map((value) => ({
    value,
    label: PHAN_LOAI_LABEL[value],
  }));

  readonly phamVi = signal<PhamVi>('toi');
  /** Bộ lọc đang gõ trên form — chưa áp dụng. */
  readonly locNhap = signal<BoLoc>({ ...LOC_TRONG });
  /** Bộ lọc đã bấm `Tìm kiếm` — cái thực sự lọc bảng. */
  readonly locApDung = signal<BoLoc>({ ...LOC_TRONG });

  readonly pageIndex = signal(1);
  readonly pageSize = signal(25);
  readonly daChon = signal<ReadonlySet<string>>(new Set());

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

  readonly pagedRows = computed(() => {
    const start = (this.pageIndex() - 1) * this.pageSize();
    return this.rows().slice(start, start + this.pageSize());
  });

  /** Chỉ bản khai chưa gửi mới trình duyệt được. */
  readonly soTrinhDuocTrongTrang = computed(() => this.pagedRows().filter((d) => this.trinhDuoc(d)).length);

  readonly soDaChon = computed(() => this.daChon().size);

  stt(i: number): number {
    return (this.pageIndex() - 1) * this.pageSize() + i + 1;
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
    this.daChon.set(new Set());
  }

  capNhatLoc<K extends keyof BoLoc>(key: K, value: BoLoc[K]): void {
    this.locNhap.update((f) => ({ ...f, [key]: value }));
  }

  timKiem(): void {
    this.locApDung.set({ ...this.locNhap() });
    this.pageIndex.set(1);
  }

  lamMoi(): void {
    this.locNhap.set({ ...LOC_TRONG });
    this.locApDung.set({ ...LOC_TRONG });
    this.pageIndex.set(1);
  }

  // ----------------------------------------------------------------- chọn dòng

  daTich(ma: string): boolean {
    return this.daChon().has(ma);
  }

  toggle(d: NhiemVu): void {
    if (!this.trinhDuoc(d)) return;
    const next = new Set(this.daChon());
    if (next.has(d.maNhiemVu)) next.delete(d.maNhiemVu);
    else next.add(d.maNhiemVu);
    this.daChon.set(next);
  }

  tichTatCa(checked: boolean): void {
    if (!checked) {
      this.daChon.set(new Set());
      return;
    }
    this.daChon.set(new Set(this.pagedRows().filter((d) => this.trinhDuoc(d)).map((d) => d.maNhiemVu)));
  }

  // -------------------------------------------------------------------- thao tác

  trinhDuyetHangLoat(): void {
    const chon = [...this.daChon()];
    if (!chon.length) return;
    for (const ma of chon) this.service.submit(ma, this.actor());
    this.daChon.set(new Set());
    this.message.success(`Đã trình duyệt ${chon.length} bản khai.`);
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
      this.message.success(`Đã cập nhật bản khai ${dangSua.maNhiemVu}.`);
    } else {
      this.service.create(input, this.actor());
      this.message.success(`Đã tạo bản khai ${input.maNhiemVu}.`);
      this.pageIndex.set(1);
    }
    this.modalMo.set(false);
  }
}
