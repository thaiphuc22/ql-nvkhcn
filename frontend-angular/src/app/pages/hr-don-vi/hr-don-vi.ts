import { Component, computed, inject, signal } from '@angular/core';

import {
  CmmButtonComponent,
  CmmDialogComponent,
  CmmInputText,
  CmmSelectComponent,
  ToastService,
} from '@khcn-core/ui';

import { DonViNode, conCua, duongDan } from '../../core/models/hr/don-vi';
import { DonViService } from '../../core/services/hr/don-vi.service';
import { NhanSuService } from '../../core/services/hr/nhan-su.service';
import { exportTableToXls } from '../../core/utils/export-bieu-mau';
import { HrPageCard } from '../../shared/hr/page-card/page-card';
import { HrTrangThaiTag } from '../../shared/hr/trang-thai-tag/trang-thai-tag';

/** Một dòng của cây đã “trải phẳng” để render — mang sẵn mức thụt lề và trạng thái mở. */
interface DongCay {
  node: DonViNode;
  mucThutLe: number;
  coCon: boolean;
  dangMo: boolean;
}

/**
 * **Danh mục Đơn vị** — artboard 10. Cây 5 cấp bên trái, chi tiết đơn vị đang chọn bên phải.
 *
 * Đây là danh mục duy nhất không dùng khuôn bảng phẳng của `hr-danh-muc-list`: nó là cây, và cấp
 * của một đơn vị quyết định nó tham gia nghiệp vụ nào — **cấp 4 (Khối)** là đơn vị báo cáo,
 * **cấp 5 (Đơn vị)** là đơn vị chấm công; cấp 1–3 chỉ để hiển thị trên biểu mẫu in.
 *
 * ## Vì sao tự dựng cây thay vì `CmmTreeComponent`
 *
 * `cmm-tree` của `@khcn-core/ui` nhận `TreeNode[]` lồng nhau và tự lo mở/đóng, nhưng nó **không**
 * cho đặt cột phụ bên phải mỗi dòng (ở đây là nhãn cấp `C4`/`C5`) mà không viết `pTemplate` — tức
 * là vẫn phải tự vẽ nội dung dòng. Đổi lại, cây phẳng + một `Set` mã đang mở đọc thẳng được từ
 * `DonViService` (vốn phẳng, xem chú thích ở đó) mà không phải dựng lại cấu trúc lồng mỗi lần dữ
 * liệu đổi. Khi cần kéo–thả đổi cha thì `cmm-tree` mới đáng giá — chưa có yêu cầu đó.
 */
@Component({
  selector: 'app-hr-don-vi',
  imports: [
    CmmButtonComponent,
    CmmDialogComponent,
    CmmInputText,
    CmmSelectComponent,
    HrPageCard,
    HrTrangThaiTag,
  ],
  templateUrl: './hr-don-vi.html',
  styleUrl: './hr-don-vi.scss',
})
export class HrDonViPage {
  private readonly service = inject(DonViService);
  private readonly nhanSu = inject(NhanSuService);
  private readonly toast = inject(ToastService);

  readonly nodes = this.service.nodes;

  readonly tuKhoa = signal('');
  /** Mã các nút đang ĐÓNG. Mặc định mở hết — cây chỉ 5 cấp, giấu đi thì phải bấm mới thấy dữ liệu. */
  private readonly dangDong = signal<ReadonlySet<string>>(new Set());
  readonly chonMa = signal<string | null>(null);

  /**
   * Cây đã trải phẳng theo thứ tự hiển thị.
   *
   * Khi có từ khoá: hiện **mọi** nút khớp cùng toàn bộ tổ tiên của chúng, và bỏ qua trạng thái
   * đóng/mở. Chỉ lọc theo nút khớp mà không kéo tổ tiên theo thì kết quả tìm kiếm nằm lơ lửng
   * không rõ thuộc khối nào.
   */
  readonly dongCay = computed<DongCay[]>(() => {
    const tatCa = this.nodes();
    const q = this.tuKhoa().trim().toLocaleLowerCase('vi');
    const dong = this.dangDong();

    let choPhep: Set<string> | null = null;
    if (q) {
      choPhep = new Set<string>();
      for (const n of tatCa) {
        if (!n.ten.toLocaleLowerCase('vi').includes(q) && !n.ma.includes(q)) continue;
        for (const to of duongDan(tatCa, n.ma)) choPhep.add(to.ma);
      }
    }

    const kq: DongCay[] = [];
    const duyet = (chaMa: string | null, muc: number): void => {
      for (const n of conCua(tatCa, chaMa)) {
        if (choPhep && !choPhep.has(n.ma)) continue;
        const con = conCua(tatCa, n.ma);
        const dangMo = q ? true : !dong.has(n.ma);
        kq.push({ node: n, mucThutLe: muc, coCon: con.length > 0, dangMo });
        if (dangMo) duyet(n.ma, muc + 1);
      }
    };
    duyet(null, 0);
    return kq;
  });

  readonly dangChon = computed(() => {
    const ma = this.chonMa();
    // Chưa chọn gì thì mở sẵn đơn vị cấp 5 đầu tiên — màn rỗng bên phải không nói lên điều gì.
    return (ma && this.service.get(ma)) || this.nodes().find((n) => n.cap === 5) || null;
  });

  readonly duongDanChon = computed(() => {
    const n = this.dangChon();
    return n ? duongDan(this.nodes(), n.ma) : [];
  });

  /**
   * Đường dẫn tổ tiên trên MỘT dòng, ngăn bằng `›`.
   *
   * Không lặp chữ "thuộc" cho từng cấp: cây có 5 cấp nên câu đó dài hơn cả tiêu đề và bẻ dòng làm
   * khối chi tiết cao gấp ba. Đo bằng mắt ngày 2026-08-27.
   */
  readonly duongDanNhan = computed(() => {
    const n = this.dangChon();
    if (!n) return '';
    return this.duongDanChon()
      .filter((to) => to.ma !== n.ma)
      .map((to) => to.ten)
      .join(' › ');
  });

  readonly donViCon = computed(() => {
    const n = this.dangChon();
    return n ? conCua(this.nodes(), n.ma) : [];
  });

  /** Nhân sự đang gắn với đơn vị này — cùng vai trò với bảng “dùng ở đâu” của artboard 12B. */
  readonly nhanSuTrongDonVi = computed(() => {
    const n = this.dangChon();
    if (!n) return [];
    return this.nhanSu.rows().filter((ns) => ns.donVi === n.ten);
  });

  readonly nhanCap = (cap: number): string =>
    cap === 4 ? 'Cấp 4 — Khối, đơn vị báo cáo' : cap === 5 ? 'Cấp 5 — đơn vị chấm công' : `Cấp ${cap}`;

  chon(ma: string): void {
    this.chonMa.set(ma);
  }

  toggle(ma: string): void {
    const s = new Set(this.dangDong());
    if (s.has(ma)) s.delete(ma);
    else s.add(ma);
    this.dangDong.set(s);
  }

  // -------------------------------------------------------------- thêm / sửa

  readonly formMo = signal(false);
  readonly dangSua = signal<DonViNode | null>(null);
  readonly form = signal({ ma: '', ten: '', chaMa: '' as string | null });
  readonly loiForm = signal<string[]>([]);

  /** Đơn vị cha chọn được: mọi nút cấp 1–4. Cấp 5 không có con — cây của khách dừng ở đó. */
  readonly chaOptions = computed(() =>
    this.nodes()
      .filter((n) => n.cap < 5)
      .map((n) => ({ value: n.ma, label: `${'— '.repeat(n.cap - 1)}${n.ten}` })),
  );

  moThemMoi(): void {
    this.dangSua.set(null);
    this.form.set({ ma: '', ten: '', chaMa: this.dangChon()?.chaMa ?? null });
    this.loiForm.set([]);
    this.formMo.set(true);
  }

  moSua(): void {
    const n = this.dangChon();
    if (!n) return;
    this.dangSua.set(n);
    this.form.set({ ma: n.ma, ten: n.ten, chaMa: n.chaMa });
    this.loiForm.set([]);
    this.formMo.set(true);
  }

  capNhatForm<K extends 'ma' | 'ten' | 'chaMa'>(field: K, value: string | null): void {
    this.form.update((prev) => ({ ...prev, [field]: value }));
  }

  luu(): void {
    const f = this.form();
    const loi: string[] = [];
    if (!f.ma.trim()) loi.push('Thiếu mã đơn vị.');
    if (!f.ten.trim()) loi.push('Thiếu tên đơn vị.');
    if (!f.chaMa) loi.push('Thiếu đơn vị cha — cây đơn vị không có nút gốc thứ hai.');
    if (f.ma.trim() && !this.dangSua() && this.service.daTonTai(f.ma)) {
      loi.push(`Mã ${f.ma.trim()} đã tồn tại trong cây đơn vị.`);
    }
    this.loiForm.set(loi);
    if (loi.length) return;

    const cha = f.chaMa ? this.service.get(f.chaMa) : undefined;
    const dangSua = this.dangSua();
    if (dangSua) {
      this.service.update(dangSua.ma, { ten: f.ten.trim(), chaMa: f.chaMa, cap: (cha?.cap ?? 0) + 1 });
      this.toast.success(`Đã cập nhật đơn vị ${dangSua.ma}.`);
    } else {
      // Cấp suy ra từ cha, KHÔNG cho nhập tay: cấp là hệ quả của vị trí trong cây, để người dùng
      // gõ là mở đường cho một đơn vị "cấp 5" nằm dưới một đơn vị cấp 2.
      this.service.create({ ma: f.ma.trim(), ten: f.ten.trim(), chaMa: f.chaMa, cap: (cha?.cap ?? 0) + 1 });
      this.toast.success(`Đã thêm đơn vị ${f.ma.trim()}.`);
      this.chonMa.set(f.ma.trim());
    }
    this.formMo.set(false);
  }

  // ------------------------------------------------------------------- xoá

  readonly xoaMo = signal(false);

  moXoa(): void {
    this.xoaMo.set(true);
  }

  xacNhanXoa(): void {
    const n = this.dangChon();
    if (!n) return;
    if (!this.service.remove(n.ma)) {
      this.toast.error(`Không xoá được ${n.ma}: đơn vị này còn đơn vị trực thuộc.`);
      this.xoaMo.set(false);
      return;
    }
    this.chonMa.set(n.chaMa);
    this.xoaMo.set(false);
    this.toast.success(`Đã xoá đơn vị ${n.ma}.`);
  }

  doiHoatDong(): void {
    const n = this.dangChon();
    if (!n) return;
    this.service.update(n.ma, { hoatDong: !n.hoatDong });
    this.toast.success(n.hoatDong ? `Đã ngừng hoạt động ${n.ma}.` : `Đã bật lại ${n.ma}.`);
  }

  xuatExcel(): void {
    exportTableToXls(
      this.nodes(),
      [
        { header: 'Mã đơn vị', value: (n) => n.ma },
        { header: 'Tên đơn vị', value: (n) => n.ten },
        { header: 'Cấp', value: (n) => n.cap },
        { header: 'Đơn vị cha', value: (n) => n.chaMa ?? '' },
        { header: 'Số nhân sự', value: (n) => n.soNhanSu ?? '' },
        { header: 'Trạng thái', value: (n) => (n.hoatDong ? 'Đang hoạt động' : 'Ngừng hoạt động') },
      ],
      'danh-muc-don-vi',
      'Danh mục Đơn vị',
    );
  }
}
