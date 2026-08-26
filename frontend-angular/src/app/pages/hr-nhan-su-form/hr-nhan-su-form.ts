import { Component, computed, inject, signal } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';

import { NzButtonModule } from 'ng-zorro-antd/button';
import { NzEmptyModule } from 'ng-zorro-antd/empty';
import { NzIconModule } from 'ng-zorro-antd/icon';
import { NzInputModule } from 'ng-zorro-antd/input';
import { NzInputNumberModule } from 'ng-zorro-antd/input-number';
import { NzMessageService } from 'ng-zorro-antd/message';
import { NzSelectModule } from 'ng-zorro-antd/select';

import { AuthService } from '../../core/auth/auth.service';
import {
  TY_LE_PHAN_BO_NHAN,
  UngVienNhanSu,
  VAI_TRO_THAM_GIA_OPTIONS,
} from '../../core/models/hr/nhan-su';
import { NhanSuService } from '../../core/services/hr/nhan-su.service';
import { NhiemVuService } from '../../core/services/hr/nhiem-vu.service';
import { NoiDungCongViecService } from '../../core/services/hr/noi-dung-cong-viec.service';
import { HrNhanSuPicker } from '../../shared/hr/nhan-su-picker/nhan-su-picker';
import { HrPageCard } from '../../shared/hr/page-card/page-card';

/** Một dòng thành viên đang soạn trên form (chưa ghi vào store). */
interface ThanhVien {
  maNhanVien: string;
  hoTen: string;
  email: string;
  donVi: string;
  chucDanh: string;
  vaiTroThamGia: string;
  noiDungCongViecIds: string[];
  /** `null` = chưa khai. Hợp lệ theo BM1 — xem ghi chú đầu `core/models/hr/nhan-su.ts`. */
  tyLePhanBo: number | null;
  tuNgay: string;
  denNgay: string;
  ghiChu: string;
}

/**
 * Trang phân công nhân sự vào nhiệm vụ — khuôn **"Thêm mới hội đồng"** của bản thiết kế: trang đầy
 * đủ (không phải popup) + bảng thành viên + Pop-up chọn nhân sự có cây đơn vị.
 *
 * Một trang phục vụ hai route:
 *   · `/hr/nhan-su/moi` — chọn nhiệm vụ rồi thêm NHIỀU người một lượt;
 *   · `/hr/nhan-su/:id/sua` — sửa đúng một dòng phân công (khoá nhiệm vụ và người, vì đổi hai thứ
 *     đó tức là một phân công khác, nên xoá dòng cũ và tạo dòng mới mới đúng nghĩa).
 *
 * **Nội dung công việc tham gia là ràng buộc thật của khách** (BM1 bắt buộc), nên nó là trường phải
 * khai; danh sách chọn lọc theo đúng nhiệm vụ đang chọn — nhiệm vụ chưa khai nội dung công việc nào
 * thì ô đó rỗng và form nói rõ phải sang màn nhiệm vụ khai trước.
 *
 * Cảnh báo vượt tỷ lệ dự kiến vẫn chạy **ngay khi gõ**, cộng cả các dòng đang soạn trên form với dữ
 * liệu đã có; nhưng đây là ràng buộc *tham khảo*, chỉ nổ khi người dùng thực sự khai số.
 */
@Component({
  selector: 'app-hr-nhan-su-form',
  imports: [
    FormsModule,
    NzButtonModule,
    NzEmptyModule,
    NzIconModule,
    NzInputModule,
    NzInputNumberModule,
    NzSelectModule,
    HrNhanSuPicker,
    HrPageCard,
  ],
  templateUrl: './hr-nhan-su-form.html',
  styleUrl: './hr-nhan-su-form.scss',
})
export class HrNhanSuFormPage {
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  private readonly service = inject(NhanSuService);
  private readonly nhiemVuService = inject(NhiemVuService);
  private readonly ndcvService = inject(NoiDungCongViecService);
  private readonly auth = inject(AuthService);
  private readonly message = inject(NzMessageService);

  readonly vaiTroOptions = VAI_TRO_THAM_GIA_OPTIONS;
  readonly tyLeNhan = TY_LE_PHAN_BO_NHAN;

  private readonly params = toSignal(this.route.paramMap, { requireSync: true });
  readonly rowId = computed(() => this.params().get('id'));
  readonly laSua = computed(() => this.rowId() !== null);

  readonly nhiemVuOptions = computed(() =>
    this.nhiemVuService.rows().map((d) => ({ value: d.maNhiemVu, label: `${d.maNhiemVu} — ${d.tenNhiemVu}` })),
  );

  readonly nhiemVuId = signal('');
  readonly thanhVien = signal<ThanhVien[]>([]);
  readonly pickerMo = signal(false);
  readonly loi = signal<string[]>([]);

  /** Mã nhân viên đã có trong nhiệm vụ đang chọn — pop-up khoá không cho chọn lại. */
  readonly daCoTrongNhiemVu = computed(() => {
    const ma = this.nhiemVuId();
    if (!ma) return [] as string[];
    const trongStore = this.service
      .theoNhiemVu(ma)
      .filter((r) => r.id !== this.rowId())
      .map((r) => r.maNhanVien);
    return [...trongStore, ...this.thanhVien().map((t) => t.maNhanVien)];
  });

  readonly nhiemVu = computed(() => this.nhiemVuService.get(this.nhiemVuId()));

  /** Nội dung công việc của nhiệm vụ đang chọn — nguồn cho cột "Nội dung công việc tham gia". */
  readonly noiDungOptions = computed(() =>
    this.ndcvService.rows().filter((r) => r.nhiemVuId === this.nhiemVuId()),
  );

  constructor() {
    const id = this.rowId();
    if (id) {
      const row = this.service.get(id);
      if (row) {
        this.nhiemVuId.set(row.nhiemVuId);
        this.thanhVien.set([
          {
            maNhanVien: row.maNhanVien,
            hoTen: row.hoTen,
            email: row.email,
            donVi: row.donVi,
            chucDanh: row.chucDanh,
            vaiTroThamGia: row.vaiTroThamGia,
            noiDungCongViecIds: [...row.noiDungCongViecIds],
            tyLePhanBo: row.tyLePhanBo ?? null,
            tuNgay: row.tuNgay,
            denNgay: row.denNgay,
            ghiChu: row.ghiChu,
          },
        ]);
      }
    }
  }

  /**
   * Tổng tỷ lệ dự kiến của một người trong kỳ của dòng đang xét = dữ liệu đã lưu (trừ dòng đang
   * sửa) + các dòng KHÁC đang soạn trên form của cùng người. Thiếu vế thứ hai thì thêm 2 dòng 60%
   * cho cùng một người trong một lượt sẽ lọt qua.
   */
  tongPhanBo(tv: ThanhVien): number {
    const daLuu = this.service.tongPhanBo(tv.maNhanVien, tv, this.rowId() ?? undefined);
    const trenForm = this.thanhVien()
      .filter((t) => t !== tv && t.maNhanVien === tv.maNhanVien && t.tuNgay <= tv.denNgay && tv.tuNgay <= t.denNgay)
      .reduce((sum, t) => sum + (t.tyLePhanBo ?? 0), 0);
    return daLuu + trenForm + (tv.tyLePhanBo ?? 0);
  }

  vuot(tv: ThanhVien): boolean {
    return this.tongPhanBo(tv) > 100;
  }

  readonly coVuot = computed(() => this.thanhVien().some((tv) => this.vuot(tv)));

  // ---------------------------------------------------------------- thành viên

  doiNhiemVu(ma: string): void {
    // Nội dung công việc thuộc về nhiệm vụ ⇒ đổi nhiệm vụ thì lựa chọn cũ không còn nghĩa.
    this.nhiemVuId.set(ma);
    this.thanhVien.update((prev) => prev.map((t) => ({ ...t, noiDungCongViecIds: [] })));
  }

  moPicker(): void {
    if (!this.nhiemVuId()) {
      this.loi.set(['Chọn nhiệm vụ trước khi thêm nhân sự.']);
      return;
    }
    this.pickerMo.set(true);
  }

  themTuPicker(chon: UngVienNhanSu[]): void {
    this.pickerMo.set(false);
    const nv = this.nhiemVu();
    this.thanhVien.update((prev) => [
      ...prev,
      ...chon.map((u) => ({
        maNhanVien: u.maNhanVien,
        hoTen: u.hoTen,
        email: u.email,
        donVi: u.donVi,
        chucDanh: u.chucDanh,
        vaiTroThamGia: 'Thành viên',
        noiDungCongViecIds: [] as string[],
        // Không đặt sẵn 20%: BM1 không có cột này, gợi ý một con số là mời người dùng khai bừa.
        tyLePhanBo: null,
        tuNgay: nv?.tuNgay ?? new Date().toISOString().slice(0, 10),
        denNgay: nv?.denNgay ?? `${new Date().getFullYear()}-12-31`,
        ghiChu: '',
      })),
    ]);
  }

  capNhatDong<K extends keyof ThanhVien>(index: number, key: K, value: ThanhVien[K]): void {
    this.thanhVien.update((prev) => prev.map((t, i) => (i === index ? { ...t, [key]: value } : t)));
  }

  boDong(index: number): void {
    this.thanhVien.update((prev) => prev.filter((_, i) => i !== index));
  }

  // -------------------------------------------------------------------- lưu

  huy(): void {
    void this.router.navigate(['/hr/nhan-su']);
  }

  luu(): void {
    const loi: string[] = [];
    const ds = this.thanhVien();
    const nv = this.nhiemVu();

    if (!this.nhiemVuId()) loi.push('Chưa chọn nhiệm vụ.');
    if (!ds.length) loi.push('Chưa chọn nhân sự nào.');

    ds.forEach((tv, i) => {
      const nhan = `Dòng ${i + 1} (${tv.hoTen})`;
      if (!tv.vaiTroThamGia) loi.push(`${nhan}: chưa chọn vai trò tham gia.`);
      // BM1 bắt buộc — trừ nhiệm vụ chưa khai nội dung công việc nào (ĐTPT/QPAN, biến thể C).
      if (!tv.noiDungCongViecIds.length && this.noiDungOptions().length) {
        loi.push(`${nhan}: chưa chọn nội dung công việc tham gia.`);
      }
      if (tv.tyLePhanBo !== null && !(tv.tyLePhanBo > 0 && tv.tyLePhanBo <= 100)) {
        loi.push(`${nhan}: tỷ lệ dự kiến phải bỏ trống hoặc nằm trong khoảng 1–100.`);
      }
      if (!tv.tuNgay || !tv.denNgay) loi.push(`${nhan}: chưa nhập thời gian tham gia.`);
      else if (tv.tuNgay > tv.denNgay) loi.push(`${nhan}: từ ngày phải trước đến ngày.`);
      else if (nv && (tv.tuNgay < nv.tuNgay || tv.denNgay > nv.denNgay)) {
        loi.push(`${nhan}: thời gian tham gia phải nằm trong khung ${nv.tuNgay} → ${nv.denNgay} của nhiệm vụ.`);
      } else if (this.vuot(tv)) {
        loi.push(`${nhan}: tổng tỷ lệ dự kiến trong kỳ đạt ${this.tongPhanBo(tv)}% (> 100%).`);
      }
    });

    this.loi.set(loi);
    if (loi.length) return;

    const actor = this.auth.user()?.hoTen ?? 'Người dùng demo';
    const id = this.rowId();

    if (id) {
      const tv = ds[0];
      this.service.update(id, { ...tv, tyLePhanBo: tv.tyLePhanBo ?? undefined, nhiemVuId: this.nhiemVuId() }, actor);
      this.message.success(`Đã cập nhật phân công của ${tv.hoTen}.`);
    } else {
      for (const tv of ds) {
        this.service.create({ ...tv, tyLePhanBo: tv.tyLePhanBo ?? undefined, nhiemVuId: this.nhiemVuId() }, actor);
      }
      this.message.success(`Đã thêm ${ds.length} nhân sự vào nhiệm vụ ${this.nhiemVuId()}.`);
    }
    void this.router.navigate(['/hr/nhan-su']);
  }
}
