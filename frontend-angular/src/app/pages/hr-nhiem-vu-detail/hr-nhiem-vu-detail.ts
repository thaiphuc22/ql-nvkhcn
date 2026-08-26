import { Component, computed, inject, signal } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute } from '@angular/router';

import { DatePicker } from 'primeng/datepicker';
import { Tab, TabList, TabPanel, TabPanels, Tabs } from 'primeng/tabs';
import {
  CmmButtonComponent,
  CmmDialogComponent,
  CmmInputText,
  CmmInputnumberComponent,
  CmmSelectComponent,
  DeleteIconComponent,
  EditIconComponent,
  ToastService,
} from '@khcn-core/ui';

import { HR_DATE_FORMAT, hrToDate, hrToIso } from '../../core/utils/hr-date';

import { AuthService } from '../../core/auth/auth.service';
import {
  NHAN_SU_TRANG_THAI_COLOR,
  NHAN_SU_TRANG_THAI_LABEL,
  UNG_VIEN_NHAN_SU,
  nhanNhanSu,
} from '../../core/models/hr/nhan-su';
import {
  NHIEM_VU_TRANG_THAI_COLOR,
  NHIEM_VU_TRANG_THAI_LABEL,
  PHAN_LOAI_LABEL,
  PHAN_NGUON_CHON_DUOC,
  PHAN_NGUON_LABEL,
  PhanNguon,
  TINH_TRANG_PHAN_BO_COLOR,
  TINH_TRANG_PHAN_BO_LABEL,
  TinhTrangPhanBo,
  coLapDuToan,
  formatTien,
} from '../../core/models/hr/nhiem-vu';
import { NoiDungCongViec, nguonDaLapDuToan } from '../../core/models/hr/noi-dung-cong-viec';
import {
  LOAI_VAI_TRO_LABEL,
  LoaiVaiTro,
  VaiTroNhiemVu,
} from '../../core/models/hr/vai-tro-nhiem-vu';
import { NhanSuService } from '../../core/services/hr/nhan-su.service';
import { NhiemVuService } from '../../core/services/hr/nhiem-vu.service';
import {
  NoiDungCongViecInput,
  NoiDungCongViecService,
} from '../../core/services/hr/noi-dung-cong-viec.service';
import { HrPageCard } from '../../shared/hr/page-card/page-card';
import { HrTrangThaiTag } from '../../shared/hr/trang-thai-tag/trang-thai-tag';

/**
 * Chi tiết nhiệm vụ: thông tin chung + 4 tab — **Nội dung công việc**, **Vai trò PM/PA**, Nhân sự
 * tham gia, Lịch sử.
 *
 * Tab "Nhiệm vụ KHCN" của đợt 1 đã bỏ: theo kế hoạch §2.1, đề tài **không phải** cấp trên của nhiệm
 * vụ, nên không có danh sách nào để nối vào đó. Quan hệ tham chiếu `maDeTai` hiển thị thẳng trong
 * khối thông tin chung, và trống là hợp lệ với nhiệm vụ SXKD/Bán hàng/Bảo hành.
 *
 * Hai tab mới là thứ đợt 2 ăn vào: chấm công gán ngày cho **nội dung công việc**, và duyệt bảng công
 * đi qua **PA/PM** của đúng đơn vị phân bổ.
 *
 * ## Vì sao dùng `p-tabs` chứ không phải `TabsComponent` (`app-tabs`) của `@khcn-core/ui`
 *
 * `app-tabs` nhận tab qua **mảng cấu hình `ICmmTab[]` chứa `TemplateRef`**, tức phải khai 4
 * `<ng-template>` rồi đọc lại bằng `viewChild`. Cả trang này nằm trong `@if (nhiemVu(); as d)`, nên
 * các template ấy **không tồn tại** ở nhánh "không tìm thấy nhiệm vụ" — `viewChild.required` sẽ ném
 * ngay, còn `viewChild` thường thì `tabs()` phải rải null-guard qua cả 4 tab. Đổi lấy đúng một thứ:
 * `app-tabs` vốn chỉ là lớp bọc mỏng quanh `p-tabs`. Dùng thẳng `p-tabs` giữ nguyên theme
 * `@khcn-core/theme` mà không kéo theo mớ plumbing đó. Cùng lý do, bảng trong các tab không đổi
 * sang `UbckTable`: chúng không phân trang, không chọn dòng, và `d` phải nhìn thấy được ngay trong
 * ô — thứ mà `customTemplate` dùng chung mọi dòng không cho.
 *
 * `cmm-timeline` thì dùng được thẳng, vì nó nhận dữ liệu qua `[value]` và một `<ng-template #content>`
 * khai tại chỗ, không cần `viewChild`.
 */
@Component({
  selector: 'app-hr-nhiem-vu-detail',
  imports: [
    FormsModule,
    DatePicker,
    Tabs,
    TabList,
    Tab,
    TabPanels,
    TabPanel,
    CmmButtonComponent,
    CmmDialogComponent,
    CmmInputText,
    CmmInputnumberComponent,
    CmmSelectComponent,
    DeleteIconComponent,
    EditIconComponent,
    HrPageCard,
    HrTrangThaiTag,
  ],
  templateUrl: './hr-nhiem-vu-detail.html',
  styleUrl: './hr-nhiem-vu-detail.scss',
})
export class HrNhiemVuDetailPage {
  private readonly route = inject(ActivatedRoute);
  private readonly nhiemVuService = inject(NhiemVuService);
  private readonly ndcvService = inject(NoiDungCongViecService);
  private readonly nhanSuService = inject(NhanSuService);
  private readonly auth = inject(AuthService);
  private readonly toast = inject(ToastService);

  readonly trangThaiLabel = NHIEM_VU_TRANG_THAI_LABEL;
  readonly trangThaiMau = NHIEM_VU_TRANG_THAI_COLOR;
  readonly tinhTrangLabel = TINH_TRANG_PHAN_BO_LABEL;
  readonly tinhTrangMau = TINH_TRANG_PHAN_BO_COLOR;
  readonly phanLoaiLabel = PHAN_LOAI_LABEL;
  readonly phanNguonLabel = PHAN_NGUON_LABEL;
  readonly vaiTroLabel = LOAI_VAI_TRO_LABEL;
  readonly nhanSuLabel = NHAN_SU_TRANG_THAI_LABEL;
  readonly nhanSuMau = NHAN_SU_TRANG_THAI_COLOR;
  readonly formatTien = formatTien;
  readonly nhanNhanSu = nhanNhanSu;
  /** `cmm-select` cần `{ value, label }` — không nhận mảng đối tượng nghiệp vụ trần. */
  readonly nhanSuOptions = UNG_VIEN_NHAN_SU.map((u) => ({
    value: u.maNhanVien,
    label: `${u.hoTen} (${u.email})`,
  }));

  /** Đơn vị phân bổ của nhiệm vụ đang xem — nguồn cho select trong hai pop-up. */
  readonly donViOptions = computed(() =>
    (this.nhiemVu()?.donViPhanBo ?? []).map((value) => ({ value, label: value })),
  );
  readonly nguonOptions = PHAN_NGUON_CHON_DUOC.map((value) => ({
    value,
    label: PHAN_NGUON_LABEL[value],
  }));
  readonly tinhTrangOptions = (Object.keys(TINH_TRANG_PHAN_BO_LABEL) as TinhTrangPhanBo[]).map(
    (value) => ({
      value,
      label: TINH_TRANG_PHAN_BO_LABEL[value],
    }),
  );
  readonly vaiTroOptions = (Object.keys(LOAI_VAI_TRO_LABEL) as LoaiVaiTro[]).map((value) => ({
    value,
    label: LOAI_VAI_TRO_LABEL[value],
  }));

  private readonly params = toSignal(this.route.paramMap, { requireSync: true });
  readonly maNhiemVu = computed(() => this.params().get('ma') ?? '');

  readonly nhiemVu = computed(() =>
    this.nhiemVuService.rows().find((d) => d.maNhiemVu === this.maNhiemVu()),
  );

  readonly noiDungCV = computed(() =>
    this.ndcvService.rows().filter((r) => r.nhiemVuId === this.maNhiemVu()),
  );

  readonly vaiTro = computed(() =>
    this.nhiemVuService.vaiTroRows().filter((r) => r.nhiemVuId === this.maNhiemVu()),
  );

  /** Lỗi so với luật "1 PM + 1 PA chủ trì, mỗi đơn vị phân bổ 1 PA" — hiện ngay trên tab. */
  readonly loiVaiTro = computed(() => {
    const nv = this.nhiemVu();
    if (!nv) return [] as string[];
    // Đọc qua signal `vaiTro()` để computed này chạy lại khi thêm/xoá vai trò.
    const rows = this.vaiTro();
    return rows.length || nv.donViPhanBo.length ? this.nhiemVuService.loiVaiTro(nv.maNhiemVu) : [];
  });

  readonly nhanSu = computed(() =>
    this.nhanSuService.rows().filter((r) => r.nhiemVuId === this.maNhiemVu()),
  );

  /** Tổng CPNC phê duyệt của các nội dung công việc — so với con số của nhiệm vụ để thấy lệch. */
  readonly tongCpncNoiDung = computed(() =>
    this.noiDungCV().reduce((sum, r) => sum + r.chiPhiNhanCongPheDuyet, 0),
  );

  readonly tabIndex = signal(0);

  // --------------------------------------------------------------- nội dung CV

  readonly ndcvMo = signal(false);
  readonly ndcvDangSua = signal<NoiDungCongViec | null>(null);
  readonly ndcvForm = signal<NoiDungCongViecInput>(this.ndcvTrong());
  readonly ndcvLoi = signal<string[]>([]);

  // ------------------------------------------------------------------ vai trò

  readonly vaiTroMo = signal(false);
  readonly vaiTroForm = signal<{ maNhanVien: string; vaiTro: LoaiVaiTro; donVi: string }>({
    maNhanVien: '',
    vaiTro: 'PA',
    donVi: '',
  });
  readonly vaiTroLoiForm = signal<string[]>([]);

  private actor(): string {
    return this.auth.user()?.hoTen ?? 'Người dùng demo';
  }

  private ndcvTrong(): NoiDungCongViecInput {
    const nv = this.nhiemVu();
    return {
      nhiemVuId: nv?.maNhiemVu ?? '',
      ten: '',
      donViPhanBo: nv?.donViChuTri ?? '',
      phanNguon: nv?.phanNguon ?? 'KHCN',
      chiPhiNhanCongPheDuyet: 0,
      duPhong: 0,
      tuNgay: nv?.tuNgay ?? '',
      denNgay: nv?.denNgay ?? '',
      tinhTrangPhanBo: nv?.tinhTrangPhanBo ?? 'DANG_TRINH_PHE_DUYET',
    };
  }

  /** Nguồn `Bảo hành` không lập dự toán ⇒ cột "còn lại" phải TRỐNG, không phải `0` (kế hoạch §2.4). */
  nguonDuToan(row: NoiDungCongViec): string {
    return coLapDuToan(row.phanNguon) ? formatTien(nguonDaLapDuToan(row)) : '—';
  }

  // --------------------------------------------------------------- vòng đời NV

  trinhDuyet(): void {
    const d = this.nhiemVu();
    if (!d) return;
    this.nhiemVuService.submit(d.maNhiemVu, this.actor());
    this.toast.success(`Đã trình duyệt ${d.maNhiemVu}.`);
  }

  tamDung(): void {
    const d = this.nhiemVu();
    if (!d) return;
    this.nhiemVuService.doiTrangThai(
      d.maNhiemVu,
      'TAM_DUNG',
      this.actor(),
      'Tạm dừng theo yêu cầu quản lý.',
    );
    this.toast.success(`Đã tạm dừng ${d.maNhiemVu}.`);
  }

  moLai(): void {
    const d = this.nhiemVu();
    if (!d) return;
    this.nhiemVuService.doiTrangThai(d.maNhiemVu, 'HIEU_LUC', this.actor(), 'Mở lại nhiệm vụ.');
    this.toast.success(`Đã mở lại ${d.maNhiemVu}.`);
  }

  // ------------------------------------------------------ CRUD nội dung công việc

  moThemNoiDung(): void {
    this.ndcvDangSua.set(null);
    this.ndcvForm.set(this.ndcvTrong());
    this.ndcvLoi.set([]);
    this.ndcvMo.set(true);
  }

  moSuaNoiDung(row: NoiDungCongViec): void {
    this.ndcvDangSua.set(row);
    const { id: _bo, ...input } = row;
    this.ndcvForm.set(input);
    this.ndcvLoi.set([]);
    this.ndcvMo.set(true);
  }

  /*
   * Ngày: model giữ chuỗi ISO, `p-datepicker` cần `Date`. Xem `core/utils/hr-date.ts`.
   */
  ndcvNgay(key: 'tuNgay' | 'denNgay'): Date | null {
    return hrToDate(this.ndcvForm()[key]);
  }

  doiNdcvNgay(key: 'tuNgay' | 'denNgay', value: Date | null): void {
    this.capNhatNdcv(key, hrToIso(value));
  }

  readonly dateFormat = HR_DATE_FORMAT;

  capNhatNdcv<K extends keyof NoiDungCongViecInput>(key: K, value: NoiDungCongViecInput[K]): void {
    this.ndcvForm.update((f) => ({ ...f, [key]: value }));
  }

  doiNguonNdcv(phanNguon: PhanNguon): void {
    this.ndcvForm.update((f) => ({
      ...f,
      phanNguon,
      chiPhiNhanCongPheDuyet: coLapDuToan(phanNguon) ? f.chiPhiNhanCongPheDuyet : 0,
      duPhong: coLapDuToan(phanNguon) ? f.duPhong : 0,
    }));
  }

  ndcvLaBaoHanh(): boolean {
    return !coLapDuToan(this.ndcvForm().phanNguon);
  }

  luuNoiDung(): void {
    const f = this.ndcvForm();
    const nv = this.nhiemVu();
    const loi: string[] = [];

    if (!nv) return;
    if (!f.ten.trim()) loi.push('Tên nội dung công việc không được để trống.');
    if (!f.donViPhanBo) loi.push('Chưa chọn đơn vị phân bổ.');
    if (!coLapDuToan(f.phanNguon)) {
      if (f.chiPhiNhanCongPheDuyet !== 0)
        loi.push('Nguồn Bảo hành không lập dự toán — để CPNC phê duyệt bằng 0.');
    } else if (!(f.chiPhiNhanCongPheDuyet > 0)) {
      loi.push('CPNC được phê duyệt phải lớn hơn 0.');
    }
    if (!f.tuNgay || !f.denNgay) loi.push('Chưa nhập thời gian thực hiện.');
    else if (f.tuNgay > f.denNgay) loi.push('Ngày bắt đầu phải trước ngày kết thúc.');
    // Nội dung công việc không được vượt khung thời gian của nhiệm vụ — chấm công dựa vào khung này.
    if (f.tuNgay && f.tuNgay < nv.tuNgay)
      loi.push(`Ngày bắt đầu phải từ ${nv.tuNgay} (ngày bắt đầu nhiệm vụ) trở đi.`);
    if (f.denNgay && f.denNgay > nv.denNgay)
      loi.push(`Ngày kết thúc không được sau ${nv.denNgay} (ngày kết thúc nhiệm vụ).`);

    this.ndcvLoi.set(loi);
    if (loi.length) return;

    const dangSua = this.ndcvDangSua();
    if (dangSua) {
      this.ndcvService.update(dangSua.id, f);
      this.toast.success('Đã cập nhật nội dung công việc.');
    } else {
      this.ndcvService.create({ ...f, nhiemVuId: nv.maNhiemVu });
      this.toast.success('Đã thêm nội dung công việc.');
    }
    this.ndcvMo.set(false);
  }

  // ----------------------------------------------------------- xác nhận xoá

  /*
   * Một hộp xác nhận dùng chung cho cả nội dung công việc và vai trò.
   *
   * Phải có bước xác nhận chứ không xoá thẳng: design system để ramp brand và danger **trùng nhau**,
   * nên nút xoá và nút chính cùng đỏ — màu không còn là dấu hiệu "đây là hành động phá huỷ", bắt
   * buộc phải nói bằng CHỮ và bằng một bước xác nhận.
   */
  readonly xoaMo = signal(false);
  readonly xoaMoTa = signal('');
  private xoaHanhDong: (() => void) | null = null;

  moXoaNoiDung(row: NoiDungCongViec): void {
    this.xoaMoTa.set(`Xoá nội dung công việc "${row.ten}"? Thao tác này không hoàn tác được.`);
    this.xoaHanhDong = () => {
      this.ndcvService.remove(row.id);
      this.toast.success('Đã xoá nội dung công việc.');
    };
    this.xoaMo.set(true);
  }

  moXoaVaiTro(row: VaiTroNhiemVu): void {
    this.xoaMoTa.set(
      `Xoá vai trò ${LOAI_VAI_TRO_LABEL[row.vaiTro]} của ${nhanNhanSu(row.maNhanVien)}?`,
    );
    this.xoaHanhDong = () => {
      this.nhiemVuService.xoaVaiTro(row.id);
      this.toast.success('Đã xoá vai trò.');
    };
    this.xoaMo.set(true);
  }

  xacNhanXoa(): void {
    this.xoaHanhDong?.();
    this.xoaHanhDong = null;
    this.xoaMo.set(false);
  }

  // ------------------------------------------------------------- CRUD vai trò

  moThemVaiTro(): void {
    const nv = this.nhiemVu();
    this.vaiTroForm.set({ maNhanVien: '', vaiTro: 'PA', donVi: nv?.donViChuTri ?? '' });
    this.vaiTroLoiForm.set([]);
    this.vaiTroMo.set(true);
  }

  capNhatVaiTro<K extends keyof { maNhanVien: string; vaiTro: LoaiVaiTro; donVi: string }>(
    key: K,
    value: { maNhanVien: string; vaiTro: LoaiVaiTro; donVi: string }[K],
  ): void {
    this.vaiTroForm.update((f) => ({ ...f, [key]: value }));
  }

  luuVaiTro(): void {
    const nv = this.nhiemVu();
    const f = this.vaiTroForm();
    const loi: string[] = [];
    if (!nv) return;
    if (!f.maNhanVien) loi.push('Chưa chọn nhân sự.');
    if (!f.donVi) loi.push('Chưa chọn đơn vị.');
    if (f.vaiTro === 'PM' && f.donVi !== nv.donViChuTri)
      loi.push('PM phải thuộc đơn vị chủ trì của nhiệm vụ.');
    if (
      this.vaiTro().some(
        (v) => v.maNhanVien === f.maNhanVien && v.vaiTro === f.vaiTro && v.donVi === f.donVi,
      )
    ) {
      loi.push('Vai trò này đã được khai cho chính người đó ở đơn vị đó.');
    }

    this.vaiTroLoiForm.set(loi);
    if (loi.length) return;

    this.nhiemVuService.themVaiTro({ nhiemVuId: nv.maNhiemVu, ...f });
    this.vaiTroMo.set(false);
    this.toast.success('Đã thêm vai trò.');
  }

  /** Tên nội dung công việc của một dòng nhân sự — BM1 cột *Nội dung công việc tham gia*. */
  tenNoiDung(ids: readonly string[]): string {
    return ids.length ? this.ndcvService.tenCua(ids).join(', ') : '—';
  }
}
