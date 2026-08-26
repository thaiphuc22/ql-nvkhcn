import {
  Component,
  TemplateRef,
  computed,
  effect,
  input,
  output,
  signal,
  viewChild,
} from '@angular/core';

import type { TreeNode } from 'primeng/api';
import {
  CmmButtonComponent,
  CmmDialogComponent,
  CmmInputText,
  CmmTreeComponent,
  ColumnDefinition,
  PaginatorProps,
  UBCKPaginatorModule,
  UBCKPaginatorState,
  UBCKTableModule,
} from '@khcn-core/ui';
import { Avatar } from 'primeng/avatar';

import { UNG_VIEN_NHAN_SU, UngVienNhanSu } from '../../../core/models/hr/nhan-su';
import { hrPaginatorProps } from '../paginator-props';
import { hrColumns } from '../table-columns';

/** Dòng đưa vào bảng ứng viên. */
type DongUngVien = Record<string, unknown> & { ungVien: UngVienNhanSu; maNhanVien: string };

/** Số ứng viên mỗi trang trong pop-up. Nhỏ hơn bảng thường vì pop-up chỉ cao ~520px. */
const SO_DONG_MOI_TRANG = 10;

/**
 * Pop-up chọn nhân sự — dựng lại theo `docs/design-system/screens/05-popup-chon-nhansu.png`
 * (D23, giai đoạn 4).
 *
 * ## Đã sửa gì so với bản trước
 *
 * Bản đợt 1 chỉ "đúng ý tưởng": rộng 880px, cây đơn vị là danh sách PHẲNG, bảng không phân trang,
 * nút xác nhận đếm số. Đối chiếu ảnh thiết kế thì khác hẳn, nên bản này sửa đủ 5 điểm:
 *
 *   1. rộng **1360px** (khổ pop-up chọn dữ liệu của design system, README §5);
 *   2. cây đơn vị **có cấp bậc + chevron** (`cmm-tree`), không còn danh sách phẳng;
 *   3. bảng có **avatar**, gộp *họ tên + email* một cột, và **phân trang riêng**;
 *   4. dòng đang chọn nền **đỏ rất nhạt** (`.hr-picker__table .p-highlight`, xem `.scss`);
 *   5. nút xác nhận hiện **giá trị đã chọn** (tên người / "n người"), không phải con số trần.
 *
 * ## Hai chỗ dữ liệu không cho làm đúng ảnh — cố ý bỏ, không phải quên
 *
 * · **Cột số điện thoại**: `AppUser` (`core/models/org-users.ts`) không có trường điện thoại, và
 *   `UngVienNhanSu` phẳng hoá từ đó. Bịa cột rỗng hoặc số giả là làm bẩn dữ liệu demo mà khách sẽ
 *   đọc như thật. Thêm cột khi nguồn người dùng có số thật (identity-service).
 * · **Cây 5 cấp của `core/models/hr/don-vi.ts`**: `donVi` của người dùng demo là chuỗi tự do
 *   ('Trung tâm Nghiên cứu', 'CQNV VHT'…), KHÔNG khớp danh sách đơn vị cấp 5 lấy từ tài liệu khách.
 *   Ghép vào sẽ ra cây đẹp mà mọi nhánh đều rỗng. Nên cây ở đây dựng **từ chính dữ liệu ứng viên**:
 *   gốc "Tất cả đơn vị" → từng đơn vị có thật, kèm số người. Khi người dùng đến từ identity-service
 *   với `donVi` chuẩn thì đổi `cayDonVi` sang `DON_VI_CAP_5_THEO_KHOI` là đủ.
 *
 * `daCo` là các mã đã nằm trong đề tài: hiện mờ + không chọn được, thay vì cho chọn rồi báo lỗi
 * trùng sau khi bấm — người dùng biết trước vì sao không bấm được.
 */
@Component({
  selector: 'hr-nhan-su-picker',
  imports: [
    UBCKTableModule,
    UBCKPaginatorModule,
    Avatar,
    CmmButtonComponent,
    CmmDialogComponent,
    CmmInputText,
    CmmTreeComponent,
  ],
  templateUrl: './nhan-su-picker.html',
  styleUrl: './nhan-su-picker.scss',
})
export class HrNhanSuPicker {
  readonly visible = input.required<boolean>();
  /** `false` = chọn đúng 1 người. */
  readonly nhieu = input(true);
  /** Mã nhân viên đã có sẵn — khoá không cho chọn lại. */
  readonly daCo = input<readonly string[]>([]);

  readonly huy = output<void>();
  readonly xacNhan = output<UngVienNhanSu[]>();

  readonly donViDangChon = signal<string | null>(null);
  readonly nodeDangChon = signal<TreeNode | null>(null);
  readonly tuKhoa = signal('');
  readonly dangChon = signal<ReadonlySet<string>>(new Set());
  readonly pageIndex = signal(1);

  readonly daCoSet = computed(() => new Set(this.daCo()));

  /**
   * Cây đơn vị: gốc "Tất cả đơn vị" → các đơn vị có thật trong danh sách ứng viên.
   *
   * `key` mang tên đơn vị (`null` ở gốc) — đó là thứ `chonNode` đọc để lọc bảng. `expanded` trên
   * gốc để lần mở đầu tiên đã thấy nhánh con; không có nó thì pop-up mở ra chỉ có đúng một dòng và
   * người dùng tưởng cây rỗng.
   */
  readonly cayDonVi = computed<TreeNode[]>(() => {
    const dem = new Map<string, number>();
    for (const u of UNG_VIEN_NHAN_SU) dem.set(u.donVi, (dem.get(u.donVi) ?? 0) + 1);
    const con = [...dem.entries()]
      .sort((a, b) => a[0].localeCompare(b[0], 'vi'))
      .map(([donVi, so]) => ({
        key: donVi,
        label: `${donVi} (${so})`,
        icon: 'pi pi-building',
        leaf: true,
      }));
    return [
      {
        key: '',
        label: `Tất cả đơn vị (${UNG_VIEN_NHAN_SU.length})`,
        icon: 'pi pi-sitemap',
        expanded: true,
        children: con,
      },
    ];
  });

  readonly ungVien = computed(() => {
    const q = this.tuKhoa().trim().toLocaleLowerCase('vi');
    const donVi = this.donViDangChon();
    return UNG_VIEN_NHAN_SU.filter((u) => {
      if (donVi && u.donVi !== donVi) return false;
      if (!q) return true;
      return [u.maNhanVien, u.hoTen, u.email, u.chucDanh].some((v) =>
        v.toLocaleLowerCase('vi').includes(q),
      );
    });
  });

  readonly pagedUngVien = computed<DongUngVien[]>(() => {
    const start = (this.pageIndex() - 1) * SO_DONG_MOI_TRANG;
    return this.ungVien()
      .slice(start, start + SO_DONG_MOI_TRANG)
      .map((u) => ({
        ...u,
        ungVien: u,
        // Dòng đã có trong đề tài: mờ đi + không bấm được; dòng đang chọn: nền đỏ rất nhạt.
        rowcCustomClasses: this.bicKhoa(u.maNhanVien)
          ? 'hr-picker__row is-locked'
          : this.daTich(u.maNhanVien)
            ? 'hr-picker__row is-picked'
            : 'hr-picker__row',
      }));
  });

  readonly soDaChon = computed(() => this.dangChon().size);

  /**
   * Nhãn nút xác nhận — hiện **giá trị đã chọn**, không phải con số trần (bản thiết kế `screens/05`).
   * Chọn 1 người thì nêu tên; nhiều người thì "n người" vì tên không đủ chỗ trên nút.
   */
  readonly nhanXacNhan = computed(() => {
    const chon = [...this.dangChon()];
    if (!chon.length) return 'Chọn';
    if (chon.length === 1) {
      const u = UNG_VIEN_NHAN_SU.find((x) => x.maNhanVien === chon[0]);
      return `Chọn ${u?.hoTen ?? chon[0]}`;
    }
    return `Chọn ${chon.length} người`;
  });

  readonly paginatorProps = computed<PaginatorProps>(() =>
    hrPaginatorProps(this.ungVien().length, this.pageIndex(), SO_DONG_MOI_TRANG),
  );

  // ------------------------------------------------------------------- bảng

  private readonly tplNguoi = viewChild.required<TemplateRef<unknown>>('tplNguoi');
  private readonly tplChon = viewChild.required<TemplateRef<unknown>>('tplChon');

  readonly columns = computed<ColumnDefinition[][]>(() =>
    hrColumns([
      { field: 'chon', header: '', customTemplate: this.tplChon(), maxWidth: '64px' },
      { field: 'maNhanVien', header: 'Mã NV', maxWidth: '120px' },
      { field: 'hoTen', header: 'Họ tên', customTemplate: this.tplNguoi(), maxWidth: '320px' },
      { field: 'donVi', header: 'Đơn vị', maxWidth: '260px' },
      { field: 'chucDanh', header: 'Chức danh', maxWidth: '260px' },
    ]),
  );

  readonly tableProps = {
    isShowOrder: true,
    colOrderName: 'STT',
    rowHover: true,
    dataKey: 'maNhanVien',
    // `isClickRecord` chỉ đổi con trỏ chuột thành `pointer`; sự kiện `onClickRecord` luôn bắn dù
    // cờ này bật hay tắt. Bật để dòng "nhìn ra là bấm được".
    isClickRecord: true,
  };

  constructor() {
    // Mở lại pop-up thì xoá lựa chọn cũ — nếu không, lần chọn trước còn dính lại và người dùng vô
    // tình thêm nhầm người.
    effect(() => {
      if (this.visible()) {
        this.dangChon.set(new Set());
        this.tuKhoa.set('');
        this.donViDangChon.set(null);
        this.nodeDangChon.set(null);
        this.pageIndex.set(1);
      }
    });
  }

  bicKhoa(ma: string): boolean {
    return this.daCoSet().has(ma);
  }

  daTich(ma: string): boolean {
    return this.dangChon().has(ma);
  }

  toggle(ma: string): void {
    if (this.bicKhoa(ma)) return;
    if (!this.nhieu()) {
      this.dangChon.set(new Set([ma]));
      return;
    }
    const next = new Set(this.dangChon());
    if (next.has(ma)) next.delete(ma);
    else next.add(ma);
    this.dangChon.set(next);
  }

  /** Node gốc mang `key = ''` ⇒ không lọc; node con mang tên đơn vị. */
  chonNode(node: TreeNode | null): void {
    this.nodeDangChon.set(node);
    this.donViDangChon.set(node?.key ? String(node.key) : null);
    this.pageIndex.set(1);
  }

  timKiem(value: string): void {
    this.tuKhoa.set(value);
    this.pageIndex.set(1);
  }

  doiTrang(state: UBCKPaginatorState): void {
    this.pageIndex.set(state.currentPage);
  }

  /** Chữ cái tắt cho avatar — nguồn người dùng chưa có ảnh đại diện. */
  chuTat(hoTen: string): string {
    const parts = hoTen.trim().split(/\s+/);
    return `${parts[0]?.[0] ?? ''}${parts.length > 1 ? parts[parts.length - 1][0] : ''}`.toUpperCase();
  }

  xacNhanChon(): void {
    const chon = this.dangChon();
    this.xacNhan.emit(UNG_VIEN_NHAN_SU.filter((u) => chon.has(u.maNhanVien)));
  }
}
